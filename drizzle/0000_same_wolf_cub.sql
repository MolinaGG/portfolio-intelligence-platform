CREATE TABLE `import_batches` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source` text DEFAULT 'B3_INVESTOR_AREA' NOT NULL,
	`file_name` text NOT NULL,
	`content_hash` text NOT NULL,
	`storage_key` text,
	`status` text DEFAULT 'COMPLETED' NOT NULL,
	`row_count` integer DEFAULT 0 NOT NULL,
	`rejected_count` integer DEFAULT 0 NOT NULL,
	`reference_date` text,
	`fx_usd_brl` real NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`retain_until` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_import_batches_content_hash` ON `import_batches` (`content_hash`);--> statement-breakpoint
CREATE TABLE `positions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`import_batch_id` integer NOT NULL,
	`source_row` integer NOT NULL,
	`institution` text DEFAULT 'Não informada' NOT NULL,
	`account` text DEFAULT 'Consolidada' NOT NULL,
	`asset_name` text NOT NULL,
	`ticker` text,
	`asset_class` text DEFAULT 'Outros' NOT NULL,
	`quantity` real DEFAULT 0 NOT NULL,
	`unit_price_brl` real DEFAULT 0 NOT NULL,
	`market_value_brl` real NOT NULL,
	`raw_json` text NOT NULL,
	`confidence` real DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`import_batch_id`) REFERENCES `import_batches`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_positions_batch_row` ON `positions` (`import_batch_id`,`source_row`);--> statement-breakpoint
CREATE INDEX `idx_positions_import_batch` ON `positions` (`import_batch_id`);