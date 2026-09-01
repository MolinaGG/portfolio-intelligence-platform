export type NewsItem = { title: string; url: string; source: string; publishedAt: string; category: string };

const decode = (value: string) => value
  .replace(/<!\[CDATA\[|\]\]>/g, "")
  .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ").trim();

const isoDate = (brDate: string) => {
  const [day, month, year] = brDate.trim().split("/");
  return `${year}-${month}-${day}T12:00:00-03:00`;
};

export function parseB3News(html: string): NewsItem[] {
  const pattern = /<a[^>]+id=["']link-noticia["'][^>]+href=["']([^"']+)["'][^>]*>[\s\S]*?<p>(\d{2}\/\d{2}\/\d{4})<\/p>[\s\S]*?<h4[^>]*>([\s\S]*?)<\/h4>[\s\S]*?<p>([\s\S]*?)<\/p>[\s\S]*?<\/a>/gi;
  return [...html.matchAll(pattern)].slice(0, 9).map(match => ({
    url: new URL(match[1], "https://www.b3.com.br/pt_br/noticias/").toString(),
    publishedAt: isoDate(match[2]), category: decode(match[3]) || "Mercado", title: decode(match[4]), source: "B3",
  })).filter(item => item.title);
}

export function parseCvmNews(html: string): NewsItem[] {
  const pattern = /<div class=["']subtitulo-noticia["']>([\s\S]*?)<\/div>[\s\S]*?<h2 class=["']titulo["']>[\s\S]*?<a href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>[\s\S]*?<span class=["']data["']>([\s\S]*?)<\/span>/gi;
  return [...html.matchAll(pattern)].slice(0, 7).map(match => ({
    category: decode(match[1]) || "Regulação", url: match[2], title: decode(match[3]), publishedAt: isoDate(decode(match[4])), source: "CVM",
  })).filter(item => item.title && item.url.includes("gov.br/cvm"));
}

export async function fetchText(url: string) {
  const response = await fetch(url, { headers: { Accept: "text/html", "User-Agent": "Evidaris/0.3 (+https://github.com/MolinaGG/portfolio-intelligence-platform)" }, signal: AbortSignal.timeout(6_000), cf: { cacheTtl: 900, cacheEverything: true } } as RequestInit);
  if (!response.ok) throw new Error(`${new URL(url).hostname} respondeu ${response.status}`);
  return response.text();
}
