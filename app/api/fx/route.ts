import { getDb } from "@/db";
import { fxRates } from "@/db/schema";
import { fetchLatestPtax } from "@/lib/ptax";
import { requireUserContext } from "@/lib/session";
import { enforceRateLimit, ratePolicies } from "@/lib/security";
import { desc, eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const context = await requireUserContext(request);
    await enforceRateLimit(request, context, ratePolicies.marketData);
    const quote = await fetchLatestPtax();
    await getDb().insert(fxRates).values({ pair: "USD/BRL", rate: quote.rate, source: quote.source, referenceDate: quote.referenceDate, rawJson: JSON.stringify(quote) }).onConflictDoNothing();
    return Response.json(quote, { headers: { "Cache-Control": "private, max-age=900" } });
  } catch (error) {
    if (error instanceof Response) return error;
    const cached = (await getDb().select().from(fxRates).where(eq(fxRates.pair, "USD/BRL")).orderBy(desc(fxRates.referenceDate)).limit(1))[0];
    if (cached) return Response.json({ rate: cached.rate, source: "BCB_PTAX_CACHE", referenceDate: cached.referenceDate, fetchedAt: cached.fetchedAt, stale: true, warning: "Banco Central indisponível; usando a última PTAX armazenada." });
    console.error("FX_PROVIDER_FAILURE", error instanceof Error ? error.message : "unknown");
    return Response.json({ available: false, error: "Não foi possível consultar o Banco Central. Informe a cotação manualmente para continuar." });
  }
}
