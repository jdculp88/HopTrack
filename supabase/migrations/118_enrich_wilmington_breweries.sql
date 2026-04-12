-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 118: Enrich Wilmington NC Breweries
-- 8 breweries enriched (2 marked closed). Real beer data from Untappd/websites.
-- NOTE: Edward Teach Brewing permanently closed Feb 2026.
-- NOTE: New Anthem Beer Project permanently closed March 2024.
-- Safe to re-run (ON CONFLICT DO UPDATE for beers, idempotent UPDATEs).
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  id_wilmington_brewing uuid;
  id_flytrap uuid;
  id_edward_teach uuid;
  id_ironclad uuid;
  id_front_street uuid;
  id_new_anthem uuid;
  id_waterline uuid;
  id_wrightsville uuid;

  -- Wilmington Brewing beers
  wb_01 uuid := 'ff000118-0001-0000-0000-000000000001';
  wb_02 uuid := 'ff000118-0001-0000-0000-000000000002';
  wb_03 uuid := 'ff000118-0001-0000-0000-000000000003';
  wb_04 uuid := 'ff000118-0001-0000-0000-000000000004';
  wb_05 uuid := 'ff000118-0001-0000-0000-000000000005';
  wb_06 uuid := 'ff000118-0001-0000-0000-000000000006';

  -- Flytrap beers
  ft_01 uuid := 'ff000118-0002-0000-0000-000000000001';
  ft_02 uuid := 'ff000118-0002-0000-0000-000000000002';
  ft_03 uuid := 'ff000118-0002-0000-0000-000000000003';
  ft_04 uuid := 'ff000118-0002-0000-0000-000000000004';
  ft_05 uuid := 'ff000118-0002-0000-0000-000000000005';
  ft_06 uuid := 'ff000118-0002-0000-0000-000000000006';

  -- Edward Teach beers
  et_01 uuid := 'ff000118-0003-0000-0000-000000000001';
  et_02 uuid := 'ff000118-0003-0000-0000-000000000002';
  et_03 uuid := 'ff000118-0003-0000-0000-000000000003';
  et_04 uuid := 'ff000118-0003-0000-0000-000000000004';
  et_05 uuid := 'ff000118-0003-0000-0000-000000000005';
  et_06 uuid := 'ff000118-0003-0000-0000-000000000006';

  -- Ironclad beers
  ic_01 uuid := 'ff000118-0004-0000-0000-000000000001';
  ic_02 uuid := 'ff000118-0004-0000-0000-000000000002';
  ic_03 uuid := 'ff000118-0004-0000-0000-000000000003';
  ic_04 uuid := 'ff000118-0004-0000-0000-000000000004';
  ic_05 uuid := 'ff000118-0004-0000-0000-000000000005';
  ic_06 uuid := 'ff000118-0004-0000-0000-000000000006';

BEGIN

SELECT id INTO id_wilmington_brewing FROM breweries WHERE external_id = 'bc28fab5-4e26-4e76-b294-64823949a61b';
SELECT id INTO id_flytrap FROM breweries WHERE external_id = '56790b8f-beb7-4218-92cf-82cfbcd04b7e';
SELECT id INTO id_edward_teach FROM breweries WHERE external_id = '1a810992-ac1c-41b5-87ae-6da0f0900733';
SELECT id INTO id_ironclad FROM breweries WHERE external_id = 'e7444032-8c9b-4755-9ccb-fa603653e1c9';
SELECT id INTO id_front_street FROM breweries WHERE external_id = 'f481d5cc-589c-43d2-95c3-e47eeea39f89';
SELECT id INTO id_new_anthem FROM breweries WHERE external_id = 'd76c7a31-bcf2-42b5-842c-abb9b40d8cb1';
SELECT id INTO id_waterline FROM breweries WHERE external_id = '540ec31e-ebbf-40d9-858a-09f23e1ff802';
SELECT id INTO id_wrightsville FROM breweries WHERE external_id = '2ae64f6a-c243-4554-9000-0cf70b7d220a';

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 2: Enrich brewery profiles
-- ═══════════════════════════════════════════════════════════════════════════════

UPDATE breweries SET
  description = 'Wilmington''s flagship production brewery with 15 rotating taps, a taproom called The Venue, and an attached homebrew supply shop. IPA-forward lineup with a loyal following.',
  phone = '9107690293',
  website_url = 'https://wilmingtonbrewingcompany.com',
  hop_route_eligible = true,
  hop_route_offer = '$1 off any pint with HopTrack check-in',
  instagram_url = 'https://instagram.com/wilmingtonbrewingcompany',
  facebook_url = 'https://facebook.com/wilmingtonbrewingco',
  untappd_url = 'https://untappd.com/WilmingtonBrewingCo',
  latitude = 34.2168, longitude = -77.9195,
  vibe_tags = ARRAY['production-brewery', 'taproom', 'dog-friendly', 'food-trucks', 'family-friendly', 'hoppy', 'homebrew-supply']
WHERE id = id_wilmington_brewing;

UPDATE breweries SET
  description = 'Neighborhood small-batch brewery in the Brooklyn Arts District specializing in American and Belgian-style ales, with frequent live music and food trucks.',
  phone = '9107692881',
  website_url = 'https://www.flytrapbrewing.com',
  hop_route_eligible = true,
  hop_route_offer = 'Free sticker with HopTrack check-in',
  instagram_url = 'https://instagram.com/flytrapbrewing',
  facebook_url = 'https://facebook.com/flytrapbrewing',
  untappd_url = 'https://untappd.com/flytrapbrewing',
  latitude = 34.2310, longitude = -77.9459,
  vibe_tags = ARRAY['arts-district', 'belgian-focused', 'neighborhood', 'live-music', 'food-trucks', 'small-batch']
WHERE id = id_flytrap;

-- ── EDWARD TEACH BREWING (PERMANENTLY CLOSED Feb 2026) ─────────────────
UPDATE breweries SET
  description = 'PERMANENTLY CLOSED (February 2026). Was a pirate-themed brewery in a restored 111-year-old firehouse in the Brooklyn Arts District. Named after Blackbeard. Operated for 8 years.',
  is_active = false
WHERE id = id_edward_teach;

UPDATE breweries SET
  description = 'Craft brewery and event space in a 1925 historic downtown building with 10,000+ sq ft over two floors. Serves beer, wine, and spirits with a focus on lagers and German styles. Known for their Smoked Honey Lager.',
  phone = '9107690290',
  website_url = 'https://www.ironcladbrewery.com',
  hop_route_eligible = true,
  hop_route_offer = '$1 off any pint with HopTrack check-in',
  instagram_url = 'https://instagram.com/ironcladbrewery',
  facebook_url = 'https://facebook.com/IroncladBrewery',
  untappd_url = 'https://untappd.com/IroncladBrewery',
  latitude = 34.2366, longitude = -77.9487,
  vibe_tags = ARRAY['downtown', 'historic-building', 'event-space', 'two-floors', 'dog-friendly', 'lager-focused']
WHERE id = id_ironclad;

UPDATE breweries SET
  description = 'Wilmington''s original brewery since 1995 (NC''s 7th to open). Full restaurant and brewpub with 20+ house beers on tap and nearly 400 bourbons and whiskeys. A Wilmington institution.',
  phone = '9102511935',
  website_url = 'https://www.frontstreetbrewery.com',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/frontstreetbrewery',
  facebook_url = 'https://facebook.com/FrontStreetBrewery',
  untappd_url = 'https://untappd.com/FrontStreetBrewery',
  latitude = 34.2355, longitude = -77.9494,
  vibe_tags = ARRAY['oldest-wilmington', 'brewpub', 'restaurant', 'whiskey-bar', 'downtown', 'award-winning']
WHERE id = id_front_street;

-- ── NEW ANTHEM BEER PROJECT (PERMANENTLY CLOSED March 2024) ────────────
UPDATE breweries SET
  description = 'PERMANENTLY CLOSED (March 2024). Was an acclaimed hazy IPA and sour specialist in historic downtown. Earned national recognition for NEIPAs. Closed citing post-pandemic debt.',
  is_active = false
WHERE id = id_new_anthem;

UPDATE breweries SET
  description = 'Veteran-owned brewery in a renovated 1940s hardware warehouse under the Cape Fear Memorial Bridge. 20-barrel steam-fired system with river views and outdoor beer garden.',
  phone = '9107775599',
  website_url = 'https://www.waterlinebrewing.com',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/waterlinebeers',
  facebook_url = 'https://facebook.com/waterlinebrewingco',
  untappd_url = 'https://untappd.com/WaterlineBrewingCo',
  latitude = 34.2310, longitude = -77.9524,
  vibe_tags = ARRAY['veteran-owned', 'waterfront', 'beer-garden', 'live-music', 'dog-friendly', 'under-the-bridge', 'industrial']
WHERE id = id_waterline;

UPDATE breweries SET
  description = 'Beachside brewpub est. 2017 known for fresh oysters, local seafood, pizza, and house-brewed craft beer. Large outdoor beer garden near Wrightsville Beach.',
  phone = '9102564938',
  website_url = 'https://www.wbbeer.com',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/wbbeer',
  facebook_url = 'https://facebook.com/wrightsvillebeachbrewery',
  untappd_url = 'https://untappd.com/WrightsvilleBeachBrewery',
  latitude = 34.2102, longitude = -77.8571,
  vibe_tags = ARRAY['brewpub', 'seafood', 'beer-garden', 'beach-adjacent', 'family-friendly', 'oyster-bar', 'pizza']
WHERE id = id_wrightsville;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 3: Add beers
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(wb_01, id_wilmington_brewing, 'Tropical Lightning', 'American IPA', 7.4, NULL, 'Flagship citrus-forward West Coast-style IPA.', true, true, 'beer', false),
(wb_02, id_wilmington_brewing, 'Kitten Biscuit', 'Imperial Hazy IPA', 8.4, NULL, 'Hazy double with soft mouthfeel. Fan favorite.', true, true, 'beer', false),
(wb_03, id_wilmington_brewing, 'Blair''s Breakfast Stout', 'Coffee Stout', 7.0, NULL, 'Brewed with coffee, lactose, and cacao nibs.', true, true, 'beer', false),
(wb_04, id_wilmington_brewing, 'All the Cool Kids', 'Hazy IPA', 5.4, NULL, 'Sessionable hazy IPA. Easy and approachable.', true, true, 'beer', false),
(wb_05, id_wilmington_brewing, 'Beach Time', 'Session IPA', 5.4, NULL, 'Light, easy-drinking session IPA for the coast.', true, true, 'beer', false),
(wb_06, id_wilmington_brewing, 'Jorts Party', 'Hazy IPA', 7.4, NULL, 'Juicy and tropical hazy IPA.', true, true, 'beer', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(ft_01, id_flytrap, 'Rehder''s Red', 'American Amber Ale', 5.4, NULL, 'Malty amber with balanced hop character.', true, true, 'beer', false),
(ft_02, id_flytrap, 'Hoppy Tripel', 'Belgian IPA', 8.2, NULL, 'Belgian Tripel hopped like an American IPA.', true, true, 'beer', false),
(ft_03, id_flytrap, 'West Coast IPA', 'American IPA', 7.8, NULL, 'Crisp, bitter, classic West Coast style.', true, true, 'beer', false),
(ft_04, id_flytrap, 'Belgian Blonde', 'Belgian Blonde', 5.2, NULL, 'Light and refreshing with subtle fruit from Belgian yeast.', true, true, 'beer', false),
(ft_05, id_flytrap, 'Saison', 'Saison', 6.8, NULL, 'Dry, spicy Belgian farmhouse ale.', true, true, 'beer', false),
(ft_06, id_flytrap, 'Kolsch', 'Kolsch', 4.9, NULL, 'Clean, crisp, German-style session beer.', true, true, 'beer', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- (Edward Teach: permanently closed Feb 2026 — no beers seeded)
-- (New Anthem: permanently closed March 2024 — no beers seeded)

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(ic_01, id_ironclad, 'Smoked Honey Lager', 'Smoked Lager', 6.0, NULL, 'Signature smoked lager with local honey. Their best-known beer.', true, true, 'beer', false),
(ic_02, id_ironclad, 'Brayton Kolsch', 'Kolsch', 4.2, NULL, 'Light, crisp, easy-drinking kolsch.', true, true, 'beer', false),
(ic_03, id_ironclad, 'Hoppy Gilmore', 'American IPA', 5.8, NULL, 'West Coast-style IPA with citrus and pine.', true, true, 'beer', false),
(ic_04, id_ironclad, 'High Crown', 'Marzen', 5.7, NULL, 'Classic Oktoberfest marzen lager.', true, true, 'beer', true),
(ic_05, id_ironclad, 'Bourbon Smoked Honey', 'Winter Lager', 7.0, NULL, 'Bourbon barrel-aged version of their smoked honey lager.', true, true, 'beer', true),
(ic_06, id_ironclad, 'Shelby''s Supreme Cream', 'Cream Ale', 4.6, NULL, 'Helles-style with tangerine puree and vanilla.', true, true, 'beer', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ═══════════════════════════════════════════════════════════════════════════════
RAISE NOTICE '✅ Migration 118: Wilmington enrichment complete — 8 breweries (2 closed), ~18 beers';
END $$;
