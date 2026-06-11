-- Global daily-result counters: one row per (day, tries) bucket, no user data.
CREATE TABLE IF NOT EXISTS anthem_results (
  day INTEGER NOT NULL,
  tries TEXT NOT NULL, -- '1'..'6' or 'X'
  n INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, tries)
);
