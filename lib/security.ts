import { env } from "cloudflare:workers";
import { audit, type UserContext } from "@/lib/session";

type RateLimitPolicy = { limit: number; windowSeconds: number; name: string };

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function enforceRateLimit(request: Request, context: UserContext, policy: RateLimitPolicy) {
  if (!env.DB) return;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(now / policy.windowSeconds) * policy.windowSeconds;
  const route = new URL(request.url).pathname;
  const keyHash = await sha256(`${context.userId}:${request.method}:${route}:${policy.name}`);
  const row = await env.DB.prepare(`
    INSERT INTO rate_limit_counters (key_hash, route, window_start, window_seconds, count, updated_at)
    VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
    ON CONFLICT(key_hash, window_start) DO UPDATE SET count = count + 1, updated_at = CURRENT_TIMESTAMP
    RETURNING count
  `).bind(keyHash, route, windowStart, policy.windowSeconds).first<{ count: number }>();
  const count = Number(row?.count || 1);
  if (count <= policy.limit) return;
  if (count === policy.limit + 1) await audit(context, "RATE_LIMIT_EXCEEDED", "API_ROUTE", route, { policy: policy.name, method: request.method, limit: policy.limit, windowSeconds: policy.windowSeconds });
  const retryAfter = Math.max(1, windowStart + policy.windowSeconds - now);
  throw Response.json({ error: "Muitas solicitações. Aguarde um pouco e tente novamente." }, { status: 429, headers: { "Retry-After": String(retryAfter), "Cache-Control": "no-store" } });
}

export function assertRequestSize(request: Request, maxBytes: number) {
  const length = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(length) && length > maxBytes) throw Response.json({ error: `Envio acima do limite de ${Math.ceil(maxBytes / 1_048_576)} MB.` }, { status: 413 });
}

export function safeStorageName(fileName: string) {
  const safe = fileName.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
  return safe || "importacao-b3";
}

export const ratePolicies = {
  readPortfolio: { name: "portfolio-read", limit: 120, windowSeconds: 60 },
  importPortfolio: { name: "portfolio-import", limit: 10, windowSeconds: 900 },
  rollbackImport: { name: "portfolio-rollback", limit: 10, windowSeconds: 3600 },
  marketData: { name: "market-data", limit: 30, windowSeconds: 60 },
  news: { name: "news", limit: 20, windowSeconds: 600 },
  report: { name: "report", limit: 20, windowSeconds: 3600 },
  write: { name: "workspace-write", limit: 30, windowSeconds: 600 },
} satisfies Record<string, RateLimitPolicy>;
