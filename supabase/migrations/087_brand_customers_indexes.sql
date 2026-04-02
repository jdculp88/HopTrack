-- Sprint 129 — The Transfer
-- Index to speed up cross-location customer queries
-- brewery_visits has UNIQUE(user_id, brewery_id) but no standalone brewery_id index
CREATE INDEX IF NOT EXISTS idx_brewery_visits_brewery_id
  ON brewery_visits(brewery_id);
