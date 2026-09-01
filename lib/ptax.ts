export type FxQuote = { rate: number; source: "BCB_SGS_PTAX" | "BCB_OLINDA_PTAX" | "BCB_PTAX_CACHE"; referenceDate: string; fetchedAt: string; stale: boolean };

function bcbDate(date: Date) {
  return `${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}-${date.getUTCFullYear()}`;
}

function stale(referenceDate: string) {
  const age = (Date.now() - new Date(`${referenceDate}T12:00:00-03:00`).getTime()) / 86_400_000;
  return age > 5;
}

async function fetchSgsPtax(): Promise<FxQuote> {
  const response = await fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.1/dados/ultimos/10?formato=json", {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(6_000),
    cf: { cacheTtl: 1800, cacheEverything: true },
  } as RequestInit);
  if (!response.ok) throw new Error(`SGS respondeu ${response.status}`);
  const payload = await response.json() as { data?: string; valor?: string }[];
  const latest = payload.findLast(item => Number.isFinite(Number(item.valor?.replace(",", "."))));
  if (!latest?.data || !latest.valor) throw new Error("SGS não retornou cotação válida");
  const [day, month, year] = latest.data.split("/");
  const referenceDate = `${year}-${month}-${day}`;
  return { rate: Number(latest.valor.replace(",", ".")), source: "BCB_SGS_PTAX", referenceDate, fetchedAt: new Date().toISOString(), stale: stale(referenceDate) };
}

async function fetchOlindaPtax(): Promise<FxQuote> {
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 12);
  const params = new URLSearchParams({
    "@dataInicial": `'${bcbDate(start)}'`, "@dataFinalCotacao": `'${bcbDate(end)}'`,
    "$top": "100", "$orderby": "dataHoraCotacao desc", "$format": "json", "$select": "cotacaoVenda,dataHoraCotacao",
  });
  const url = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?${params}`;
  const response = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(6_000), cf: { cacheTtl: 1800, cacheEverything: true } } as RequestInit);
  if (!response.ok) throw new Error(`Olinda respondeu ${response.status}`);
  const payload = await response.json() as { value?: { cotacaoVenda: number; dataHoraCotacao: string }[] };
  const latest = payload.value?.find(item => Number.isFinite(Number(item.cotacaoVenda)));
  if (!latest) throw new Error("BCB não retornou uma PTAX válida");
  const referenceDate = latest.dataHoraCotacao.slice(0, 10);
  return { rate: Number(latest.cotacaoVenda), source: "BCB_OLINDA_PTAX", referenceDate, fetchedAt: new Date().toISOString(), stale: stale(referenceDate) };
}

export async function fetchLatestPtax(): Promise<FxQuote> {
  const failures: string[] = [];
  for (const provider of [fetchSgsPtax, fetchOlindaPtax]) {
    try { return await provider(); }
    catch (error) { failures.push(error instanceof Error ? error.message : "falha desconhecida"); }
  }
  throw new Error(`Banco Central indisponível: ${failures.join("; ")}`);
}
