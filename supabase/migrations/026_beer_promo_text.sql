-- Migration 026: Add promo_text to beers for per-beer promotions on The Board
-- e.g. "$2 off", "Happy Hour Special", "New Arrival"

ALTER TABLE beers ADD COLUMN IF NOT EXISTS promo_text text DEFAULT NULL;

-- Seed a couple demo promos for Mountain Ridge beers
UPDATE beers SET promo_text = '$2 Off Happy Hour' WHERE name = 'Summit Sunset Hazy' AND brewery_id = 'dd000001-0000-0000-0000-000000000001';
UPDATE beers SET promo_text = 'New Arrival' WHERE name = 'Bear Creek DIPA' AND brewery_id = 'dd000001-0000-0000-0000-000000000001';
