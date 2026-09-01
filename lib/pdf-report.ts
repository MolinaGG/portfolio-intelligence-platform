const clean = (value: unknown) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, "").replace(/[()\\]/g, "\\$&");
const brl = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function portfolioPdf(data: { owner: string; totalBrl: number; totalUsd: number; fx: number; fxDate?: string | null; positions: { ticker: string | null; assetName: string; institution: string; assetClass: string; marketValueBrl: number }[] }) {
  const lines = [
    "RELATORIO PATRIMONIAL", "Evidaris - Clareza que voce pode conferir.", "",
    `Titular: ${data.owner}`, `Gerado em: ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`,
    `Patrimonio total: ${brl(data.totalBrl)}`, `Patrimonio em USD: US$ ${data.totalUsd.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    `Cambio USD/BRL: ${data.fx.toFixed(4)} | Referencia: ${data.fxDate || "nao informada"}`, "",
    "POSICOES", "Ativo | Classe | Instituicao | Valor (BRL)",
    ...data.positions.sort((a,b) => b.marketValueBrl-a.marketValueBrl).map(p => `${p.ticker || p.assetName} | ${p.assetClass} | ${p.institution} | ${brl(p.marketValueBrl)}`),
    "", "Observacao: este demonstrativo apresenta a posicao importada e nao constitui recomendacao de investimento.",
    "Valores dependem da qualidade e da data das fontes informadas na plataforma.",
  ].map(clean);
  const chunks: string[][] = [];
  for (let i=0;i<lines.length;i+=38) chunks.push(lines.slice(i,i+38));
  const pageCount = chunks.length;
  const objects: string[] = [];
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${chunks.map((_,i)=>`${4+i} 0 R`).join(" ")}] /Count ${pageCount} >>`;
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  chunks.forEach((page, i) => {
    const pageId = 4+i, contentId = 4+pageCount+i;
    objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`;
    const commands = page.map((line,index) => `BT /F1 ${index < 2 ? (index === 0 ? 20 : 11) : 9} Tf 48 ${790-index*18} Td (${line}) Tj ET`).join("\n");
    objects[contentId] = `<< /Length ${commands.length} >>\nstream\n${commands}\nendstream`;
  });
  let pdf = "%PDF-1.4\n"; const offsets = [0];
  for (let i=1;i<objects.length;i++) { offsets[i]=pdf.length; pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`; }
  const xref = pdf.length; pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let i=1;i<objects.length;i++) pdf += `${String(offsets[i]).padStart(10,"0")} 00000 n \n`;
  pdf += `trailer << /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}
