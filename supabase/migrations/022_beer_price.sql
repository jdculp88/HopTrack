-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 022: Add price_per_pint to beers
-- Allows breweries to show pricing on The Board TV display.
-- Optional field — Board only shows price if set.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE beers ADD COLUMN IF NOT EXISTS price_per_pint decimal(5,2);
