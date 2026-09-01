import { requireUserContext } from "@/lib/session";
import { fetchText, parseB3News, parseCvmNews } from "@/lib/news";
import { enforceRateLimit, ratePolicies } from "@/lib/security";

export async function GET(request: Request) {
  try {
    const context = await requireUserContext(request);
    await enforceRateLimit(request, context, ratePolicies.news);
    const apiKey = process.env.GNEWS_API_KEY;
    if (apiKey) {
      const endpoint = new URL("https://gnews.io/api/v4/search");
      endpoint.search = new URLSearchParams({ q: "mercado financeiro OR investimentos OR bolsa", lang: "pt", country: "br", max: "10", apikey: apiKey }).toString();
      const response = await fetch(endpoint, { headers: { Accept: "application/json" } });
      if (response.ok) {
        const payload = await response.json() as { articles?: { title: string; url: string; publishedAt: string; source?: { name?: string } }[] };
        return Response.json({ provider: "GNews", items: (payload.articles || []).map(article => ({ title: article.title, url: article.url, publishedAt: article.publishedAt, source: article.source?.name || "GNews", category: "Mercado" })) });
      }
    }
    const sources = await Promise.allSettled([
      fetchText("https://www.b3.com.br/pt_br/noticias/").then(parseB3News),
      fetchText("https://www.gov.br/cvm/pt-br/assuntos/noticias").then(parseCvmNews),
    ]);
    const items = sources.flatMap(result => result.status === "fulfilled" ? result.value : [])
      .filter((item, index, all) => all.findIndex(other => other.url === item.url) === index)
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 16);
    if (!items.length) throw new Error(sources.map(result => result.status === "rejected" ? String(result.reason) : "fonte vazia").join("; "));
    return Response.json({ provider: "B3 + CVM", items }, { headers: { "Cache-Control": "private, max-age=600" } });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("NEWS_PROVIDER_FAILURE", error instanceof Error ? error.message : "unknown");
    return Response.json({ provider: "Indisponível", items: [], error: "As fontes de notícias não responderam. Tente novamente em instantes." });
  }
}
