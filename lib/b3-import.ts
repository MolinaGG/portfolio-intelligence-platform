export type RawRow = Record<string, unknown>;

export type NormalizedPosition = {
  sourceRow: number; institution: string; account: string; assetName: string;
  ticker: string | null; assetClass: string; quantity: number; unitPriceBrl: number;
  marketValueBrl: number; confidence: number; rawJson: string;
};

const aliases = {
  institution: ["instituicao", "instituicao financeira", "corretora", "agente de custodia"],
  account: ["conta", "numero da conta", "codigo da conta"],
  assetName: ["produto", "ativo", "nome do ativo", "descricao do produto", "descricao"],
  ticker: ["codigo de negociacao", "ticker", "codigo do ativo", "simbolo"],
  assetClass: ["tipo de produto", "classe", "categoria", "segmento"],
  quantity: ["quantidade", "quantidade total", "quantidade disponivel", "saldo"],
  unitPrice: ["preco de fechamento", "preco unitario", "preco atual", "cotacao"],
  marketValue: ["valor atualizado", "valor atual", "valor de mercado", "posicao", "saldo bruto"],
} as const;

function cleanKey(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, " ").trim().toLowerCase();
}

function findValue(row: RawRow, names: readonly string[]) {
  const entries = Object.entries(row);
  for (const name of names) {
    const found = entries.find(([key]) => cleanKey(key) === name);
    if (found && found[1] !== null && found[1] !== undefined && `${found[1]}`.trim()) return found[1];
  }
  return undefined;
}

function textValue(value: unknown, fallback = "") {
  return value === undefined || value === null ? fallback : String(value).trim();
}

function numberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (value === undefined || value === null) return 0;
  let source = String(value).trim().replace(/R\$|US\$|\s/g, "");
  const comma = source.lastIndexOf(",");
  const dot = source.lastIndexOf(".");
  if (comma > dot) source = source.replace(/\./g, "").replace(",", ".");
  else if (dot > comma && comma >= 0) source = source.replace(/,/g, "");
  const parsed = Number(source.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function inferClass(value: string, ticker: string) {
  const source = `${value} ${ticker}`.toLowerCase();
  if (/tesouro|cdb|lci|lca|debenture|renda fixa/.test(source)) return "Renda fixa";
  if (/fii|fundo imobiliario/.test(source)) return "FIIs";
  if (/etf/.test(source)) return "ETFs";
  if (/bdr/.test(source)) return "BDRs";
  if (/acao|acoes|renda variavel/.test(source) || /[A-Z]{4}\d{1,2}/.test(ticker)) return "Ações";
  return value || "Outros";
}

export function normalizeB3Rows(rows: RawRow[]) {
  const accepted: NormalizedPosition[] = [];
  const rejected: Array<{ sourceRow: number; reason: string }> = [];
  rows.forEach((row, index) => {
    const assetName = textValue(findValue(row, aliases.assetName));
    const ticker = textValue(findValue(row, aliases.ticker));
    const quantity = numberValue(findValue(row, aliases.quantity));
    const unitPriceBrl = numberValue(findValue(row, aliases.unitPrice));
    const explicitValue = numberValue(findValue(row, aliases.marketValue));
    const marketValueBrl = explicitValue || quantity * unitPriceBrl;
    if ((!assetName && !ticker) || marketValueBrl <= 0) {
      rejected.push({ sourceRow: index + 2, reason: "Ativo ou valor de mercado não identificado" });
      return;
    }
    const fieldsFound = [assetName || ticker, quantity, unitPriceBrl, explicitValue].filter(Boolean).length;
    const rawClass = textValue(findValue(row, aliases.assetClass));
    accepted.push({ sourceRow: index + 2, institution: textValue(findValue(row, aliases.institution), "B3 consolidada"), account: textValue(findValue(row, aliases.account), "Consolidada"), assetName: assetName || ticker, ticker: ticker || null, assetClass: inferClass(rawClass, ticker), quantity, unitPriceBrl, marketValueBrl, confidence: fieldsFound >= 3 ? 1 : 0.85, rawJson: JSON.stringify(row) });
  });
  return { accepted, rejected };
}

export async function sha256(buffer: ArrayBuffer) {
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
