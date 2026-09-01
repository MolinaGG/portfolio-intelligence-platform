import { getDb } from "@/db";
import { incomes } from "@/db/schema";
import { audit, requireUserContext } from "@/lib/session";
import { assertRequestSize, enforceRateLimit, ratePolicies } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const context = await requireUserContext(request);
    await enforceRateLimit(request, context, ratePolicies.write);
    assertRequestSize(request, 64 * 1024);
    const body = await request.json() as Record<string, unknown>;
    const amount = Number(body.amount);
    if (!body.assetName || !body.type || !body.paymentDate || !Number.isFinite(amount) || amount <= 0) return Response.json({ error: "Preencha ativo, tipo, data e valor positivo." }, { status: 400 });
    const [record] = await getDb().insert(incomes).values({
      workspaceId: context.workspaceId, assetName: String(body.assetName), ticker: body.ticker ? String(body.ticker) : null,
      type: String(body.type), amount, currency: String(body.currency || "BRL"), paymentDate: String(body.paymentDate),
      notes: body.notes ? String(body.notes) : null, source: "MANUAL",
    }).returning();
    await audit(context, "INCOME_CREATED", "INCOME", String(record.id), { amount, currency: record.currency });
    return Response.json(record, { status: 201 });
  } catch (error) { if (error instanceof Response) return error; return Response.json({ error: "Falha ao salvar rendimento" }, { status: 500 }); }
}
