import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("declares Evidaris product metadata", async () => {
  const source = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  assert.match(source, /Evidaris/);
  assert.match(source, /Clareza que você pode conferir/);
  assert.match(source, /\/og\.png/);
});
