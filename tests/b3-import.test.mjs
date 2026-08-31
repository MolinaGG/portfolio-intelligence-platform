import assert from "node:assert/strict";
import test, { after } from "node:test";
import { createServer } from "vite";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const vite = await createServer({ appType: "custom", configFile: false, root, resolve: { alias: { "@": root } }, server: { middlewareMode: true } });
after(async () => vite.close());

test("normaliza a planilha de posição da B3 e converte valores brasileiros", async () => {
  const { normalizeB3Rows } = await vite.ssrLoadModule("/lib/b3-import.ts");
  const result = normalizeB3Rows([{ Produto: "Petrobras PN", "Código de Negociação": "PETR4", "Tipo de Produto": "Ações", Instituição: "XP", Quantidade: "120", "Preço de Fechamento": "R$ 38,45", "Valor Atualizado": "R$ 4.614,00" }]);
  assert.equal(result.rejected.length, 0);
  assert.equal(result.accepted[0].ticker, "PETR4");
  assert.equal(result.accepted[0].marketValueBrl, 4614);
  assert.equal(result.accepted[0].assetClass, "Ações");
});

test("rejeita linhas sem ativo ou valor de mercado", async () => {
  const { normalizeB3Rows } = await vite.ssrLoadModule("/lib/b3-import.ts");
  const result = normalizeB3Rows([{ Produto: "", Quantidade: "0" }]);
  assert.equal(result.accepted.length, 0);
  assert.equal(result.rejected.length, 1);
});
