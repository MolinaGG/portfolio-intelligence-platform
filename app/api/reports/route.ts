import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { importBatches, positions, reportDeliveries } from "@/db/schema";
import { portfolioPdf } from "@/lib/pdf-report";
import { audit, requireUserContext } from "@/lib/session";

const csvCell = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
export async function GET(request: Request) {
  try {
    const context = await requireUserContext(request);
    const format = new URL(request.url).searchParams.get("format") === "csv" ? "csv" : "pdf";
    const db = getDb();
    const batch = (await db.select().from(importBatches).where(and(eq(importBatches.workspaceId, context.workspaceId), eq(importBatches.status, "COMPLETED"))).orderBy(desc(importBatches.id)).limit(1))[0];
    if (!batch) return Response.json({ error: "Importe uma posição antes de gerar o relatório." }, { status: 422 });
    const rows = await db.select().from(positions).where(and(eq(positions.workspaceId, context.workspaceId), eq(positions.importBatchId, batch.id)));
    const totalBrl = rows.reduce((sum,row)=>sum+row.marketValueBrl,0), totalUsd = totalBrl/batch.fxUsdBrl;
    await db.insert(reportDeliveries).values({ workspaceId: context.workspaceId, userId: context.userId, format: format.toUpperCase(), channel: "DOWNLOAD", status: "GENERATED" });
    await audit(context, "REPORT_DOWNLOADED", "REPORT", undefined, { format, batchId: batch.id });
    if (format === "csv") {
      const header = ["Ativo","Ticker","Classe","Instituição","Conta","Quantidade","Preço unitário BRL","Valor BRL"];
      const body = rows.map(row => [row.assetName,row.ticker,row.assetClass,row.institution,row.account,row.quantity,row.unitPriceBrl,row.marketValueBrl]);
      const csv = "\uFEFF" + [header,...body].map(line=>line.map(csvCell).join(";")).join("\r\n");
      return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="evidaris-carteira.csv"', "Cache-Control": "private, no-store" } });
    }
    const pdf = portfolioPdf({ owner: context.displayName, totalBrl, totalUsd, fx: batch.fxUsdBrl, fxDate: batch.fxReferenceDate, positions: rows });
    return new Response(pdf as BodyInit, { headers: { "Content-Type": "application/pdf", "Content-Disposition": 'attachment; filename="evidaris-relatorio-patrimonial.pdf"', "Cache-Control": "private, no-store" } });
  } catch (error) { if (error instanceof Response) return error; return Response.json({ error: "Falha ao gerar relatório" }, { status: 500 }); }
}
