-- Track penalty shootout scores separately so we can determine advancement
-- when a knockout match ends level after extra time.
ALTER TABLE fixtures
  ADD COLUMN IF NOT EXISTS home_penalties integer,
  ADD COLUMN IF NOT EXISTS away_penalties integer;
