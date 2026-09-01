import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("isolates financial records by workspace and never stores passwords", async () => {
  const schema = await readFile(new URL("../db/schema.ts", import.meta.url), "utf8");
  for (const table of ["importBatches", "positions", "portfolioSnapshots", "incomes", "investmentTheses"]) {
    const start = schema.indexOf(`export const ${table}`);
    assert.notEqual(start, -1, `missing ${table}`);
    assert.match(schema.slice(start, start + 1300), /workspaceId/);
  }
  assert.doesNotMatch(schema, /password|password_hash|senha/i);
  assert.match(schema, /authIdentities/);
  assert.match(schema, /auditLogs/);
  assert.match(schema, /consents/);
});

test("exposes every approved MVP area", async () => {
  const dashboard = await readFile(new URL("../app/dashboard.tsx", import.meta.url), "utf8");
  for (const label of ["Visão geral","Minha carteira","Importações","Performance","Rendimentos","Concentração","Minha tese","Relatórios","Notícias","Configurações"]) {
    assert.match(dashboard, new RegExp(label));
  }
  assert.match(dashboard, /\/api\/reports\?format=pdf/);
  assert.match(dashboard, /\/api\/reports\?format=csv/);
  assert.match(dashboard, /Desfazer e ver impacto/);
});

test("uses the official BCB PTAX service with an auditable override", async () => {
  const ptax = await readFile(new URL("../lib/ptax.ts", import.meta.url), "utf8");
  const portfolio = await readFile(new URL("../app/api/portfolio/route.ts", import.meta.url), "utf8");
  assert.match(ptax, /olinda\.bcb\.gov\.br/);
  assert.match(ptax, /cotacaoVenda/);
  assert.match(portfolio, /MANUAL_OVERRIDE/);
  assert.match(portfolio, /fxReferenceDate/);
});

test("keeps return claims honest until cashflows exist", async () => {
  const dashboard = await readFile(new URL("../app/dashboard.tsx", import.meta.url), "utf8");
  assert.match(dashboard, /TWR e XIRR permanecem indisponíveis/);
  assert.match(dashboard, /inclui aportes e retiradas/);
  assert.doesNotMatch(dashboard, /\[0\.71,0\.75/);
});

test("documents controlled production and provider gates", async () => {
  const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");
  assert.match(readme, /Versão do documento:\*\* 0\.8\.0/);
  assert.match(readme, /Produção controlada não significa lançamento público irrestrito/);
  assert.match(readme, /Clerk magic link/);
  assert.match(readme, /Resend/);
});

test("applies persistent rate limits and safe upload boundaries", async () => {
  const security = await readFile(new URL("../lib/security.ts", import.meta.url), "utf8");
  const portfolio = await readFile(new URL("../app/api/portfolio/route.ts", import.meta.url), "utf8");
  const schema = await readFile(new URL("../db/schema.ts", import.meta.url), "utf8");
  assert.match(security, /RATE_LIMIT_EXCEEDED/);
  assert.match(security, /Retry-After/);
  assert.match(schema, /rateLimitCounters/);
  assert.match(portfolio, /10 \* 1_048_576/);
  assert.match(portfolio, /safeStorageName/);
});

test("ships discoverable user, demo, legal and security guides", async () => {
  for (const path of ["../docs/README.md", "../docs/user-guide.md", "../docs/faq.md", "../docs/product/demo-screens.md", "../docs/legal/privacy-policy.md", "../docs/legal/terms-of-use.md", "../SECURITY.md"]) {
    const contents = await readFile(new URL(path, import.meta.url), "utf8");
    assert.ok(contents.length > 300, `${path} is unexpectedly small`);
  }
});
