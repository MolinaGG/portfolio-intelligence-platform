import { getDb } from "@/db";
import { investmentTheses } from "@/db/schema";
import { audit, requireUserContext } from "@/lib/session";
import { assertRequestSize, enforceRateLimit, ratePolicies } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const context = await requireUserContext(request);
    await enforceRateLimit(request, context, ratePolicies.write);
    assertRequestSize(request, 64 * 1024);
    const body = await request.json() as Record<string, unknown>;
    const required = ["assetName","objective","horizon","buyReason","increaseCriteria","reduceCriteria","exitCriteria","mainRisk"];
    if (required.some(key => !String(body[key] || "").trim())) return Response.json({ error: "Preencha todos os campos da tese." }, { status: 400 });
    const [record] = await getDb().insert(investmentTheses).values({
      workspaceId: context.workspaceId, ticker: body.ticker ? String(body.ticker) : null, assetName: String(body.assetName),
      objective: String(body.objective), horizon: String(body.horizon), buyReason: String(body.buyReason),
      increaseCriteria: String(body.increaseCriteria), reduceCriteria: String(body.reduceCriteria),
      exitCriteria: String(body.exitCriteria), mainRisk: String(body.mainRisk),
    }).returning();
    await audit(context, "THESIS_CREATED", "INVESTMENT_THESIS", String(record.id));
    return Response.json(record, { status: 201 });
  } catch (error) { if (error instanceof Response) return error; return Response.json({ error: "Falha ao salvar tese" }, { status: 500 }); }
}
