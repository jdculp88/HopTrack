-- Migration 055: Non-beer menu item support (F-011, Sprint 82)
-- Adds item_type and category columns to beers table
-- Existing beers default to 'beer' — zero breakage

-- Add item_type column with CHECK constraint
ALTER TABLE beers ADD COLUMN item_type text NOT NULL DEFAULT 'beer'
  CHECK (item_type IN ('beer', 'cider', 'wine', 'cocktail', 'na_beverage', 'food'));

-- Add category column for grouping within types (e.g. "Red Wine", "Appetizers")
ALTER TABLE beers ADD COLUMN category text;

-- Index for filtering by type within a brewery
CREATE INDEX idx_beers_item_type ON beers(brewery_id, item_type);

-- Food menu upload — breweries upload PDF/image of their food menu
ALTER TABLE breweries ADD COLUMN menu_image_url text;

-- Sprint 81 carry-over: prevent duplicate challenge names per brewery
CREATE UNIQUE INDEX idx_challenges_brewery_name_unique
  ON challenges (brewery_id, LOWER(name))
  WHERE is_active = true;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
