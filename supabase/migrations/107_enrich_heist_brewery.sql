-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 107: Enrich Heist Brewery (Charlotte, NC)
-- Proof-of-concept brewery enrichment from web research.
-- Updates brewery profile with description, social links, vibe tags.
-- Adds 12 real beers representing their core lineup.
-- Safe to re-run (ON CONFLICT DO NOTHING for beers, idempotent UPDATE).
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  heist_id uuid;

  -- Beer UUIDs (stable for re-runs)
  b_01 uuid := 'ff000107-0001-0000-0000-000000000001';
  b_02 uuid := 'ff000107-0001-0000-0000-000000000002';
  b_03 uuid := 'ff000107-0001-0000-0000-000000000003';
  b_04 uuid := 'ff000107-0001-0000-0000-000000000004';
  b_05 uuid := 'ff000107-0001-0000-0000-000000000005';
  b_06 uuid := 'ff000107-0001-0000-0000-000000000006';
  b_07 uuid := 'ff000107-0001-0000-0000-000000000007';
  b_08 uuid := 'ff000107-0001-0000-0000-000000000008';
  b_09 uuid := 'ff000107-0001-0000-0000-000000000009';
  b_10 uuid := 'ff000107-0001-0000-0000-000000000010';
  b_11 uuid := 'ff000107-0001-0000-0000-000000000011';
  b_12 uuid := 'ff000107-0001-0000-0000-000000000012';

BEGIN

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 1: Find Heist Brewery by external_id (from Open Brewery DB seed 048)
-- ═══════════════════════════════════════════════════════════════════════════════

SELECT id INTO heist_id
FROM breweries
WHERE external_id = '528481d4-f3c8-479a-aad9-fce4b9cfe36a';

IF heist_id IS NULL THEN
  RAISE NOTICE 'Heist Brewery not found by external_id. Skipping enrichment.';
  RETURN;
END IF;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 2: Enrich brewery profile
-- ═══════════════════════════════════════════════════════════════════════════════

UPDATE breweries SET
  description = 'Charlotte''s first craft brewpub, opened 2012 in NoDa. Known for hazy IPAs led by the flagship CitraQuench''l, heavily fruited sours, and bold imperial stouts. Multiple locations including Barrel Arts with Neapolitan pizza and a craft cocktail program.',
  brewery_type = 'brewpub',
  hop_route_eligible = true,
  hop_route_offer = '10% off your first flight when you check in with HopTrack',
  instagram_url = 'https://instagram.com/heistbrewery',
  facebook_url = 'https://facebook.com/HeistBrewery',
  untappd_url = 'https://untappd.com/HeistBreweryNC',
  twitter_url = 'https://x.com/heistbreweryclt',
  vibe_tags = ARRAY['brewpub', 'food', 'cocktails', 'noda', 'multi-location', 'pizza', 'event-space']
WHERE id = heist_id;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 3: Add beers (12 representing their core range)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES

-- ── Flagship & Core Hazies ──────────────────────────────────────────────────
(b_01, heist_id, 'CitraQuench''l', 'Hazy IPA', 7.1, NULL,
 'The flagship. Double dry hopped with all Citra hops. Orange and tangerine juice in a glass.', true, true, 'beer', false),

(b_02, heist_id, 'ÜberQuench''l', 'Double IPA', 8.2, NULL,
 'Double IPA version of the flagship. Galaxy and Citra hops with a pillowy, creamy body.', true, true, 'beer', false),

(b_03, heist_id, 'Blurred Is the Word', 'Hazy IPA', 6.8, 65,
 'Double dry hopped with Mosaic and Azacca. Tropical and dank with a soft mouthfeel.', true, true, 'beer', false),

(b_04, heist_id, 'Stranger Clouds', 'Double IPA', 8.6, NULL,
 'El Dorado, Mosaic and Rakau hops. Papaya, mango, grapefruit, and orange.', true, true, 'beer', false),

-- ── Other IPAs ──────────────────────────────────────────────────────────────
(b_05, heist_id, 'Jack the S.I.P.A.', 'Session IPA', 4.8, NULL,
 'Dry hopped with Citra, Amarillo, and El Dorado. Crushable all-day sipper.', true, true, 'beer', false),

(b_06, heist_id, 'Grand Optimist', 'Double IPA', 8.5, NULL,
 'West coast style double IPA with Centennial and Cascade. Piney and bold.', true, true, 'beer', false),

(b_07, heist_id, 'Isle of Tortuga', 'Hazy IPA', 6.8, NULL,
 'Coconut and pineapple IPA. Basically a pina colada in beer form.', true, true, 'beer', true),

-- ── Stouts ──────────────────────────────────────────────────────────────────
(b_08, heist_id, 'Brunch Junkie', 'Stout', 7.5, 54,
 'Breakfast oatmeal stout brewed with flaked oats and Sumatra coffee. Rich and roasty.', true, true, 'beer', false),

(b_09, heist_id, 'French Toasted Joe', 'Imperial Stout', 10.0, 50,
 'Imperial stout with cold brew espresso roast, maple syrup, and cinnamon chips. Decadent.', true, true, 'beer', true),

-- ── Sours ───────────────────────────────────────────────────────────────────
(b_10, heist_id, 'Big Pick''n', 'Sour', 6.1, NULL,
 'Bold and tart fruited Berliner Weisse loaded with fruit. Bright and punchy.', true, true, 'beer', false),

(b_11, heist_id, 'Blackberry Pick''n', 'Sour', 4.1, NULL,
 'Heavily fruited Berliner Weisse with blackberry puree. Tart and refreshing.', true, true, 'beer', true),

-- ── Pale / Session ──────────────────────────────────────────────────────────
(b_12, heist_id, 'Hive Fives', 'Pale Ale', 5.5, NULL,
 'Hazy pale ale with local wildflower honey, Citra and Azacca hops. Bright, citrusy, and light.', true, true, 'beer', false)

ON CONFLICT (brewery_id, LOWER(TRIM(name))) WHERE is_active = true DO UPDATE SET
  style = EXCLUDED.style,
  abv = EXCLUDED.abv,
  ibu = EXCLUDED.ibu,
  description = EXCLUDED.description,
  is_on_tap = EXCLUDED.is_on_tap;
-- Note: ON CONFLICT matches idx_beers_unique_name_per_brewery (expression index)

RAISE NOTICE 'Heist Brewery enriched: 12 beers added, profile updated.';

END $$;
