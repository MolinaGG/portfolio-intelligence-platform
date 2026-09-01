export type FxQuote = { rate: number; source: "BCB_PTAX"; referenceDate: string; fetchedAt: string; stale: boolean };

function bcbDate(date: Date) {
  return `${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}-${date.getUTCFullYear()}`;
}

export async function fetchLatestPtax(): Promise<FxQuote> {
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 12);
  const params = new URLSearchParams({
    "@dataInicial": `'${bcbDate(start)}'`, "@dataFinalCotacao": `'${bcbDate(end)}'`,
    "$top": "100", "$orderby": "dataHoraCotacao desc", "$format": "json", "$select": "cotacaoVenda,dataHoraCotacao",
  });
  const url = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?${params}`;
  const response = await fetch(url, { headers: { Accept: "application/json" }, cf: { cacheTtl: 1800, cacheEverything: true } } as RequestInit);
  if (!response.ok) throw new Error(`BCB PTAX indisponível (${response.status})`);
  const payload = await response.json() as { value?: { cotacaoVenda: number; dataHoraCotacao: string }[] };
  const latest = payload.value?.find(item => Number.isFinite(Number(item.cotacaoVenda)));
  if (!latest) throw new Error("BCB não retornou uma PTAX válida");
  const referenceDate = latest.dataHoraCotacao.slice(0, 10);
  const age = (Date.now() - new Date(`${referenceDate}T12:00:00-03:00`).getTime()) / 86_400_000;
  return { rate: Number(latest.cotacaoVenda), source: "BCB_PTAX", referenceDate, fetchedAt: new Date().toISOString(), stale: age > 5 };
}
