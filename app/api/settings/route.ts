import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { workspaces } from "@/db/schema";
import { audit, requireUserContext } from "@/lib/session";
import { assertRequestSize, enforceRateLimit, ratePolicies } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const context = await requireUserContext(request);
    await enforceRateLimit(request, context, ratePolicies.write);
    assertRequestSize(request, 64 * 1024);
    const body = await request.json() as { baseCurrency?: string; fxMode?: string };
    const baseCurrency = body.baseCurrency === "USD" ? "USD" : "BRL";
    const fxMode = body.fxMode === "MANUAL" ? "MANUAL" : "PTAX_WITH_MANUAL_OVERRIDE";
    await getDb().update(workspaces).set({ baseCurrency, fxMode, updatedAt: new Date().toISOString() }).where(eq(workspaces.id, context.workspaceId));
    await audit(context, "WORKSPACE_SETTINGS_UPDATED", "WORKSPACE", String(context.workspaceId), { baseCurrency, fxMode });
    return Response.json({ baseCurrency, fxMode });
  } catch (error) { if (error instanceof Response) return error; return Response.json({ error: "Falha ao salvar preferências" }, { status: 500 }); }
}
