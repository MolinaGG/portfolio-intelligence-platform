import { requireUserContext } from "@/lib/session";

type NewsItem = { title: string; url: string; source: string; publishedAt: string; category: string };
const decode = (value: string) => value.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

function parseRss(xml: string, category: string): NewsItem[] {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 8).map(match => {
    const item = match[1];
    const read = (tag: string) => decode(item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))?.[1]?.trim() || "");
    const source = read("source") || "Mercado financeiro";
    return { title: read("title").replace(new RegExp(` - ${source}$`), ""), url: read("link"), source, publishedAt: new Date(read("pubDate") || Date.now()).toISOString(), category };
  }).filter(item => item.title && item.url);
}

export async function GET(request: Request) {
  try {
    await requireUserContext(request);
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
    const feeds = [
      ["https://news.google.com/rss/search?q=mercado+financeiro+investimentos+Brasil&hl=pt-BR&gl=BR&ceid=BR:pt-419", "Mercado"],
      ["https://news.google.com/rss/search?q=(site%3Ab3.com.br+OR+site%3Abcb.gov.br+OR+site%3Agov.br%2Fcvm)+investimentos&hl=pt-BR&gl=BR&ceid=BR:pt-419", "Fontes oficiais"],
      ["https://news.google.com/rss/search?q=Wall+Street+Federal+Reserve+ETFs&hl=pt-BR&gl=BR&ceid=BR:pt-419", "Global"],
    ] as const;
    const responses = await Promise.all(feeds.map(async ([url, category]) => {
      const response = await fetch(url, { headers: { "User-Agent": "Evidaris/0.2 (+financial-news-reader)" }, cf: { cacheTtl: 900, cacheEverything: true } } as RequestInit);
      return response.ok ? parseRss(await response.text(), category) : [];
    }));
    return Response.json({ provider: "Google News RSS", items: responses.flat().sort((a,b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 16) }, { headers: { "Cache-Control": "private, max-age=600" } });
  } catch (error) { if (error instanceof Response) return error; return Response.json({ provider: "unavailable", items: [], error: "Notícias temporariamente indisponíveis" }, { status: 503 }); }
}
