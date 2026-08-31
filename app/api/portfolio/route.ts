import { desc, eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import * as XLSX from "xlsx";
import { getDb } from "@/db";
import { importBatches, positions } from "@/db/schema";
import { normalizeB3Rows, sha256, type RawRow } from "@/lib/b3-import";

async function latestSummary(batchId?: number) {
  const db = getDb();
  const batch = batchId
    ? (await db.select().from(importBatches).where(eq(importBatches.id, batchId)).limit(1))[0]
    : (await db.select().from(importBatches).orderBy(desc(importBatches.id)).limit(1))[0];
  if (!batch) return { empty: true, totalBrl: 0, totalUsd: 0, positions: [], allocation: [], institutions: 0 };
  const rows = await db.select().from(positions).where(eq(positions.importBatchId, batch.id));
  const totalBrl = rows.reduce((sum, row) => sum + row.marketValueBrl, 0);
  const allocation = Object.entries(rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.assetClass] = (acc[row.assetClass] || 0) + row.marketValueBrl;
    return acc;
  }, {})).map(([name, value]) => ({ name, value }));
  return {
    empty: false,
    batch: { id: batch.id, fileName: batch.fileName, createdAt: batch.createdAt, rowCount: batch.rowCount, rejectedCount: batch.rejectedCount },
    fxUsdBrl: batch.fxUsdBrl,
    totalBrl,
    totalUsd: totalBrl / batch.fxUsdBrl,
    positions: rows,
    allocation,
    institutions: new Set(rows.map((row) => row.institution)).size,
  };
}

export async function GET() {
  try {
    return Response.json(await latestSummary());
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Falha ao consultar patrimônio" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const fxUsdBrl = Number(form.get("fxUsdBrl") || 5.42);
    if (!(file instanceof File)) return Response.json({ error: "Selecione um arquivo da B3." }, { status: 400 });
    if (!Number.isFinite(fxUsdBrl) || fxUsdBrl <= 0) return Response.json({ error: "Câmbio USD/BRL inválido." }, { status: 400 });
    const buffer = await file.arrayBuffer();
    const contentHash = await sha256(buffer);
    const db = getDb();
    const existing = (await db.select().from(importBatches).where(eq(importBatches.contentHash, contentHash)).limit(1))[0];
    if (existing) return Response.json({ duplicate: true, ...(await latestSummary(existing.id)) });

    const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: "", raw: false });
    const { accepted, rejected } = normalizeB3Rows(rawRows);
    if (!accepted.length) return Response.json({ error: "Não encontrei posições válidas. Exporte a planilha em Minhas Carteiras > Investimentos na Área do Investidor B3." }, { status: 422 });

    const retainUntil = new Date();
    retainUntil.setUTCMonth(retainUntil.getUTCMonth() + 3);
    const storageKey = `imports/b3/${contentHash}/${file.name}`;
    if (env.BUCKET) await env.BUCKET.put(storageKey, buffer, { httpMetadata: { contentType: file.type || "application/octet-stream" } });
    const [batch] = await db.insert(importBatches).values({ fileName: file.name, contentHash, storageKey, rowCount: accepted.length, rejectedCount: rejected.length, fxUsdBrl, retainUntil: retainUntil.toISOString() }).returning();
    await db.insert(positions).values(accepted.map((row) => ({ ...row, importBatchId: batch.id })));
    return Response.json({ duplicate: false, ...(await latestSummary(batch.id)), issues: rejected }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Falha inesperada na importação" }, { status: 500 });
  }
}
