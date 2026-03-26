-- Migration 011: Beer of the Week — featured beer flag
-- Brewery owners can mark one beer as featured at a time

ALTER TABLE beers ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

-- Index for quick lookup of featured beers per brewery
CREATE INDEX IF NOT EXISTS beers_featured_idx ON beers(brewery_id) WHERE is_featured = true;
