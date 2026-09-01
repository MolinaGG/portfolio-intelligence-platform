import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestamps = { createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`), updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`) };

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }), email: text("email").notNull(), displayName: text("display_name").notNull(),
  status: text("status").notNull().default("ACTIVE"), locale: text("locale").notNull().default("pt-BR"), lastLoginAt: text("last_login_at"), ...timestamps,
}, t => [uniqueIndex("uq_users_email").on(t.email)]);

export const authIdentities = sqliteTable("auth_identities", {
  id: integer("id").primaryKey({ autoIncrement: true }), userId: integer("user_id").notNull().references(() => users.id),
  provider: text("provider").notNull(), providerSubject: text("provider_subject").notNull(), emailVerifiedAt: text("email_verified_at"), ...timestamps,
}, t => [uniqueIndex("uq_auth_provider_subject").on(t.provider, t.providerSubject)]);

export const workspaces = sqliteTable("workspaces", {
  id: integer("id").primaryKey({ autoIncrement: true }), name: text("name").notNull(), baseCurrency: text("base_currency").notNull().default("BRL"),
  timezone: text("timezone").notNull().default("America/Sao_Paulo"), fxMode: text("fx_mode").notNull().default("PTAX_WITH_MANUAL_OVERRIDE"), ...timestamps,
});

export const workspaceMembers = sqliteTable("workspace_members", {
  id: integer("id").primaryKey({ autoIncrement: true }), workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  userId: integer("user_id").notNull().references(() => users.id), role: text("role").notNull().default("WORKSPACE_OWNER"),
  status: text("status").notNull().default("ACTIVE"), ...timestamps,
}, t => [uniqueIndex("uq_workspace_member").on(t.workspaceId, t.userId), index("idx_workspace_members_user").on(t.userId)]);

export const consents = sqliteTable("consents", {
  id: integer("id").primaryKey({ autoIncrement: true }), workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  userId: integer("user_id").notNull().references(() => users.id), purpose: text("purpose").notNull(), legalBasis: text("legal_basis").notNull().default("CONSENT"),
  version: text("version").notNull(), status: text("status").notNull().default("GRANTED"), grantedAt: text("granted_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  revokedAt: text("revoked_at"), evidenceJson: text("evidence_json").notNull().default("{}"),
});

export const auditLogs = sqliteTable("audit_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }), workspaceId: integer("workspace_id").references(() => workspaces.id),
  userId: integer("user_id").references(() => users.id), action: text("action").notNull(), entityType: text("entity_type").notNull(),
  entityId: text("entity_id"), metadataJson: text("metadata_json").notNull().default("{}"), ipHash: text("ip_hash"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, t => [index("idx_audit_workspace_created").on(t.workspaceId, t.createdAt)]);

export const rateLimitCounters = sqliteTable("rate_limit_counters", {
  id: integer("id").primaryKey({ autoIncrement: true }), keyHash: text("key_hash").notNull(),
  route: text("route").notNull(), windowStart: integer("window_start").notNull(),
  windowSeconds: integer("window_seconds").notNull(), count: integer("count").notNull().default(1),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, t => [uniqueIndex("uq_rate_limit_key_window").on(t.keyHash, t.windowStart), index("idx_rate_limit_window").on(t.windowStart)]);

export const portfolios = sqliteTable("portfolios", {
  id: integer("id").primaryKey({ autoIncrement: true }), workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  name: text("name").notNull().default("Carteira principal"), baseCurrency: text("base_currency").notNull().default("BRL"),
  status: text("status").notNull().default("ACTIVE"), ...timestamps,
}, t => [index("idx_portfolios_workspace").on(t.workspaceId)]);

export const importBatches = sqliteTable("import_batches", {
  id: integer("id").primaryKey({ autoIncrement: true }), workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  source: text("source").notNull().default("B3_INVESTOR_AREA"), fileName: text("file_name").notNull(), contentHash: text("content_hash").notNull(),
  storageKey: text("storage_key"), status: text("status").notNull().default("COMPLETED"), rowCount: integer("row_count").notNull().default(0),
  rejectedCount: integer("rejected_count").notNull().default(0), referenceDate: text("reference_date"), fxUsdBrl: real("fx_usd_brl").notNull(),
  fxSource: text("fx_source").notNull().default("PTAX"), fxReferenceDate: text("fx_reference_date"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`), retainUntil: text("retain_until").notNull(), rolledBackAt: text("rolled_back_at"),
}, t => [uniqueIndex("uq_import_batches_workspace_hash").on(t.workspaceId, t.contentHash), index("idx_import_batches_workspace_created").on(t.workspaceId, t.createdAt)]);

export const positions = sqliteTable("positions", {
  id: integer("id").primaryKey({ autoIncrement: true }), workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  importBatchId: integer("import_batch_id").notNull().references(() => importBatches.id), sourceRow: integer("source_row").notNull(),
  institution: text("institution").notNull().default("Não informada"), account: text("account").notNull().default("Consolidada"),
  assetName: text("asset_name").notNull(), ticker: text("ticker"), assetClass: text("asset_class").notNull().default("Outros"),
  currency: text("currency").notNull().default("BRL"), quantity: real("quantity").notNull().default(0), unitPriceBrl: real("unit_price_brl").notNull().default(0),
  marketValueBrl: real("market_value_brl").notNull(), rawJson: text("raw_json").notNull(), confidence: real("confidence").notNull().default(1),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, t => [uniqueIndex("uq_positions_batch_row").on(t.importBatchId, t.sourceRow), index("idx_positions_workspace_batch").on(t.workspaceId, t.importBatchId)]);

export const portfolioSnapshots = sqliteTable("portfolio_snapshots", {
  id: integer("id").primaryKey({ autoIncrement: true }), workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  importBatchId: integer("import_batch_id").references(() => importBatches.id), asOf: text("as_of").notNull(), totalBrl: real("total_brl").notNull(),
  totalUsd: real("total_usd").notNull(), fxUsdBrl: real("fx_usd_brl").notNull(), quality: text("quality").notNull().default("CURRENT_POSITION_ONLY"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, t => [uniqueIndex("uq_snapshot_workspace_batch").on(t.workspaceId, t.importBatchId)]);

export const incomes = sqliteTable("incomes", {
  id: integer("id").primaryKey({ autoIncrement: true }), workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  type: text("type").notNull(), ticker: text("ticker"), assetName: text("asset_name").notNull(), amount: real("amount").notNull(),
  currency: text("currency").notNull().default("BRL"), paymentDate: text("payment_date").notNull(), source: text("source").notNull().default("MANUAL"),
  notes: text("notes"), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, t => [index("idx_incomes_workspace_date").on(t.workspaceId, t.paymentDate)]);

export const investmentTheses = sqliteTable("investment_theses", {
  id: integer("id").primaryKey({ autoIncrement: true }), workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  ticker: text("ticker"), assetName: text("asset_name").notNull(), objective: text("objective").notNull(), horizon: text("horizon").notNull(),
  buyReason: text("buy_reason").notNull(), increaseCriteria: text("increase_criteria").notNull(), reduceCriteria: text("reduce_criteria").notNull(),
  exitCriteria: text("exit_criteria").notNull(), mainRisk: text("main_risk").notNull(), status: text("status").notNull().default("ACTIVE"), ...timestamps,
}, t => [index("idx_theses_workspace").on(t.workspaceId)]);

export const concentrationRules = sqliteTable("concentration_rules", {
  id: integer("id").primaryKey({ autoIncrement: true }), workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  dimension: text("dimension").notNull(), thresholdPercent: real("threshold_percent").notNull(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, t => [uniqueIndex("uq_concentration_workspace_dimension").on(t.workspaceId, t.dimension)]);

export const fxRates = sqliteTable("fx_rates", {
  id: integer("id").primaryKey({ autoIncrement: true }), pair: text("pair").notNull().default("USD/BRL"), rate: real("rate").notNull(),
  source: text("source").notNull(), referenceDate: text("reference_date").notNull(), fetchedAt: text("fetched_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  rawJson: text("raw_json").notNull(),
}, t => [uniqueIndex("uq_fx_pair_source_date").on(t.pair, t.source, t.referenceDate)]);

export const reportDeliveries = sqliteTable("report_deliveries", {
  id: integer("id").primaryKey({ autoIncrement: true }), workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  userId: integer("user_id").notNull().references(() => users.id), format: text("format").notNull(), channel: text("channel").notNull(),
  recipient: text("recipient"), status: text("status").notNull(), provider: text("provider"), providerMessageId: text("provider_message_id"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
