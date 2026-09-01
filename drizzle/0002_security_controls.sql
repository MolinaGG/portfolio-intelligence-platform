CREATE TABLE rate_limit_counters (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  key_hash text NOT NULL,
  route text NOT NULL,
  window_start integer NOT NULL,
  window_seconds integer NOT NULL,
  count integer DEFAULT 1 NOT NULL,
  updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE UNIQUE INDEX uq_rate_limit_key_window ON rate_limit_counters(key_hash,window_start);
CREATE INDEX idx_rate_limit_window ON rate_limit_counters(window_start);
