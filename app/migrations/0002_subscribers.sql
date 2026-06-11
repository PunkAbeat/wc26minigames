-- Newsletter signups from the hub: email only, deduped, with signup time.
CREATE TABLE IF NOT EXISTS subscribers (
  email TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
