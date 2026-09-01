import { getDb } from "@/db";
import { fxRates } from "@/db/schema";
import { fetchLatestPtax } from "@/lib/ptax";
import { requireUserContext } from "@/lib/session";

export async function GET(request: Request) {
  try {
    await requireUserContext(request);
    const quote = await fetchLatestPtax();
    await getDb().insert(fxRates).values({ pair: "USD/BRL", rate: quote.rate, source: quote.source, referenceDate: quote.referenceDate, rawJson: JSON.stringify(quote) }).onConflictDoNothing();
    return Response.json(quote, { headers: { "Cache-Control": "private, max-age=900" } });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: error instanceof Error ? error.message : "PTAX indisponível" }, { status: 503 });
  }
}
