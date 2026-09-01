import { and, desc, eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import * as XLSX from "xlsx";
import { getDb } from "@/db";
import { concentrationRules, importBatches, incomes, investmentTheses, portfolioSnapshots, positions, workspaces } from "@/db/schema";
import { normalizeB3Rows, sha256, type RawRow } from "@/lib/b3-import";
import { fetchLatestPtax } from "@/lib/ptax";
import { audit, requireUserContext, type UserContext } from "@/lib/session";

async function summary(context: UserContext, selectedBatchId?: number) {
  const db = getDb();
  const batch = selectedBatchId
    ? (await db.select().from(importBatches).where(and(eq(importBatches.id, selectedBatchId), eq(importBatches.workspaceId, context.workspaceId))).limit(1))[0]
    : (await db.select().from(importBatches).where(and(eq(importBatches.workspaceId, context.workspaceId), eq(importBatches.status, "COMPLETED"))).orderBy(desc(importBatches.id)).limit(1))[0];
  const [history, snapshotRows, incomeRows, thesisRows, rules, workspace] = await Promise.all([
    db.select().from(importBatches).where(eq(importBatches.workspaceId, context.workspaceId)).orderBy(desc(importBatches.id)).limit(30),
    db.select().from(portfolioSnapshots).where(eq(portfolioSnapshots.workspaceId, context.workspaceId)).orderBy(portfolioSnapshots.asOf),
    db.select().from(incomes).where(eq(incomes.workspaceId, context.workspaceId)).orderBy(desc(incomes.paymentDate)).limit(100),
    db.select().from(investmentTheses).where(eq(investmentTheses.workspaceId, context.workspaceId)).orderBy(desc(investmentTheses.updatedAt)),
    db.select().from(concentrationRules).where(eq(concentrationRules.workspaceId, context.workspaceId)),
    db.select().from(workspaces).where(eq(workspaces.id, context.workspaceId)).limit(1).then(rows => rows[0]),
  ]);
  if (!batch) return { empty: true, totalBrl: 0, totalUsd: 0, positions: [], allocation: [], institutions: 0, imports: history, snapshots: snapshotRows, incomes: incomeRows, theses: thesisRows, rules, workspace, user: context };
  const rows = await db.select().from(positions).where(and(eq(positions.workspaceId, context.workspaceId), eq(positions.importBatchId, batch.id)));
  const totalBrl = rows.reduce((sum, row) => sum + row.marketValueBrl, 0);
  const allocation = Object.entries(rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.assetClass] = (acc[row.assetClass] || 0) + row.marketValueBrl; return acc;
  }, {})).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  const institutions = Object.entries(rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.institution] = (acc[row.institution] || 0) + row.marketValueBrl; return acc;
  }, {})).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  return {
    empty: false, batch, fxUsdBrl: batch.fxUsdBrl, fxSource: batch.fxSource, fxReferenceDate: batch.fxReferenceDate,
    totalBrl, totalUsd: totalBrl / batch.fxUsdBrl, positions: rows, allocation, institutionAllocation: institutions,
    institutions: institutions.length, imports: history, snapshots: snapshotRows, incomes: incomeRows, theses: thesisRows, rules, workspace, user: context,
  };
}

export async function GET(request: Request) {
  try { const context = await requireUserContext(request); return Response.json(await summary(context)); }
  catch (error) { if (error instanceof Response) return error; return Response.json({ error: error instanceof Error ? error.message : "Falha ao consultar patrimônio" }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const context = await requireUserContext(request);
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "Selecione um arquivo da B3." }, { status: 400 });
    const buffer = await file.arrayBuffer();
    const contentHash = await sha256(buffer);
    const db = getDb();
    const existing = (await db.select().from(importBatches).where(and(eq(importBatches.workspaceId, context.workspaceId), eq(importBatches.contentHash, contentHash))).limit(1))[0];
    if (existing?.status === "COMPLETED") return Response.json({ duplicate: true, ...(await summary(context, existing.id)) });

    const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: "", raw: false });
    const { accepted, rejected } = normalizeB3Rows(rawRows);
    if (!accepted.length) return Response.json({ error: "Não encontrei posições válidas. Exporte a planilha em Minhas Carteiras > Investimentos na Área do Investidor B3." }, { status: 422 });

    const manualOverride = form.get("fxOverride") === "true";
    let fxRate = Number(form.get("fxUsdBrl"));
    let fxSource = "MANUAL_OVERRIDE";
    let fxReferenceDate = new Date().toISOString().slice(0, 10);
    if (!manualOverride) {
      try { const quote = await fetchLatestPtax(); fxRate = quote.rate; fxSource = quote.source; fxReferenceDate = quote.referenceDate; }
      catch { fxSource = "MANUAL_FALLBACK"; }
    }
    if (!Number.isFinite(fxRate) || fxRate <= 0) return Response.json({ error: "Não foi possível obter o câmbio. Informe uma taxa de contingência." }, { status: 400 });
    const retainUntil = new Date(); retainUntil.setUTCMonth(retainUntil.getUTCMonth() + 3);
    const storageKey = `workspaces/${context.workspaceId}/imports/b3/${contentHash}/${file.name}`;
    if (env.BUCKET) await env.BUCKET.put(storageKey, buffer, { httpMetadata: { contentType: file.type || "application/octet-stream" } });
    if (existing) await db.update(importBatches).set({ status: "COMPLETED", rolledBackAt: null }).where(eq(importBatches.id, existing.id));
    const batch = existing ?? (await db.insert(importBatches).values({
      workspaceId: context.workspaceId, fileName: file.name, contentHash, storageKey, rowCount: accepted.length,
      rejectedCount: rejected.length, fxUsdBrl: fxRate, fxSource, fxReferenceDate, retainUntil: retainUntil.toISOString(),
    }).returning())[0];
    await db.insert(positions).values(accepted.map(row => ({ ...row, workspaceId: context.workspaceId, importBatchId: batch.id }))).onConflictDoNothing();
    const totalBrl = accepted.reduce((sum, row) => sum + row.marketValueBrl, 0);
    await db.insert(portfolioSnapshots).values({ workspaceId: context.workspaceId, importBatchId: batch.id, asOf: new Date().toISOString(), totalBrl, totalUsd: totalBrl / fxRate, fxUsdBrl: fxRate }).onConflictDoNothing();
    await audit(context, "IMPORT_COMPLETED", "IMPORT_BATCH", String(batch.id), { fileName: file.name, accepted: accepted.length, rejected: rejected.length, fxSource });
    return Response.json({ duplicate: false, ...(await summary(context, batch.id)), issues: rejected }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: error instanceof Error ? error.message : "Falha inesperada na importação" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const context = await requireUserContext(request);
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!Number.isInteger(id)) return Response.json({ error: "Lote inválido" }, { status: 400 });
    const db = getDb();
    const batch = (await db.select().from(importBatches).where(and(eq(importBatches.id, id), eq(importBatches.workspaceId, context.workspaceId))).limit(1))[0];
    if (!batch) return Response.json({ error: "Lote não encontrado" }, { status: 404 });
    const affected = await db.select().from(positions).where(and(eq(positions.importBatchId, id), eq(positions.workspaceId, context.workspaceId)));
    const impactBrl = affected.reduce((sum, row) => sum + row.marketValueBrl, 0);
    await db.delete(positions).where(and(eq(positions.importBatchId, id), eq(positions.workspaceId, context.workspaceId)));
    await db.delete(portfolioSnapshots).where(and(eq(portfolioSnapshots.importBatchId, id), eq(portfolioSnapshots.workspaceId, context.workspaceId)));
    await db.update(importBatches).set({ status: "ROLLED_BACK", rolledBackAt: new Date().toISOString() }).where(eq(importBatches.id, id));
    await audit(context, "IMPORT_ROLLED_BACK", "IMPORT_BATCH", String(id), { positions: affected.length, impactBrl });
    return Response.json({ positions: affected.length, impactBrl, ...(await summary(context)) });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: error instanceof Error ? error.message : "Falha ao desfazer importação" }, { status: 500 });
  }
}
