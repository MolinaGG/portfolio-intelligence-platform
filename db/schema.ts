import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const importBatches = sqliteTable(
  "import_batches",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    source: text("source").notNull().default("B3_INVESTOR_AREA"),
    fileName: text("file_name").notNull(),
    contentHash: text("content_hash").notNull(),
    storageKey: text("storage_key"),
    status: text("status").notNull().default("COMPLETED"),
    rowCount: integer("row_count").notNull().default(0),
    rejectedCount: integer("rejected_count").notNull().default(0),
    referenceDate: text("reference_date"),
    fxUsdBrl: real("fx_usd_brl").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    retainUntil: text("retain_until").notNull(),
  },
  (table) => [uniqueIndex("uq_import_batches_content_hash").on(table.contentHash)],
);

export const positions = sqliteTable(
  "positions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    importBatchId: integer("import_batch_id").notNull().references(() => importBatches.id),
    sourceRow: integer("source_row").notNull(),
    institution: text("institution").notNull().default("Não informada"),
    account: text("account").notNull().default("Consolidada"),
    assetName: text("asset_name").notNull(),
    ticker: text("ticker"),
    assetClass: text("asset_class").notNull().default("Outros"),
    quantity: real("quantity").notNull().default(0),
    unitPriceBrl: real("unit_price_brl").notNull().default(0),
    marketValueBrl: real("market_value_brl").notNull(),
    rawJson: text("raw_json").notNull(),
    confidence: real("confidence").notNull().default(1),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("uq_positions_batch_row").on(table.importBatchId, table.sourceRow),
    index("idx_positions_import_batch").on(table.importBatchId),
  ],
);
