-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 115: Enrich Charlotte NC Breweries
-- 15 breweries enriched with descriptions, social links, vibe tags, and beers.
-- ~150 real beers from web research (Untappd, brewery websites, April 2026).
-- Safe to re-run (ON CONFLICT DO UPDATE for beers, idempotent UPDATEs).
-- NOTE: Bold Missy Brewery permanently closed — not enriched.
-- NOTE: Rock Bottom Charlotte is a chain — not enriched.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  -- Brewery IDs (looked up by external_id from 048_open_brewery_db_seed)
  id_noda uuid;
  id_wooden_robot uuid;
  id_resident_culture uuid;
  id_olde_meck uuid;
  id_birdsong uuid;
  id_heist uuid;
  id_sycamore uuid;
  id_triple_c uuid;
  id_divine_barrel uuid;
  id_legion uuid;
  id_lenny_boy uuid;
  id_free_range uuid;
  id_sugar_creek uuid;
  id_unknown uuid;
  id_salud uuid;

  -- ── NoDa Brewing beers ──
  nd_01 uuid := 'ff000115-0001-0000-0000-000000000001';
  nd_02 uuid := 'ff000115-0001-0000-0000-000000000002';
  nd_03 uuid := 'ff000115-0001-0000-0000-000000000003';
  nd_04 uuid := 'ff000115-0001-0000-0000-000000000004';
  nd_05 uuid := 'ff000115-0001-0000-0000-000000000005';
  nd_06 uuid := 'ff000115-0001-0000-0000-000000000006';
  nd_07 uuid := 'ff000115-0001-0000-0000-000000000007';
  nd_08 uuid := 'ff000115-0001-0000-0000-000000000008';
  nd_09 uuid := 'ff000115-0001-0000-0000-000000000009';
  nd_10 uuid := 'ff000115-0001-0000-0000-000000000010';

  -- ── Wooden Robot beers ──
  wr_01 uuid := 'ff000115-0002-0000-0000-000000000001';
  wr_02 uuid := 'ff000115-0002-0000-0000-000000000002';
  wr_03 uuid := 'ff000115-0002-0000-0000-000000000003';
  wr_04 uuid := 'ff000115-0002-0000-0000-000000000004';
  wr_05 uuid := 'ff000115-0002-0000-0000-000000000005';
  wr_06 uuid := 'ff000115-0002-0000-0000-000000000006';
  wr_07 uuid := 'ff000115-0002-0000-0000-000000000007';
  wr_08 uuid := 'ff000115-0002-0000-0000-000000000008';
  wr_09 uuid := 'ff000115-0002-0000-0000-000000000009';
  wr_10 uuid := 'ff000115-0002-0000-0000-000000000010';

  -- ── Resident Culture beers ──
  rc_01 uuid := 'ff000115-0003-0000-0000-000000000001';
  rc_02 uuid := 'ff000115-0003-0000-0000-000000000002';
  rc_03 uuid := 'ff000115-0003-0000-0000-000000000003';
  rc_04 uuid := 'ff000115-0003-0000-0000-000000000004';
  rc_05 uuid := 'ff000115-0003-0000-0000-000000000005';
  rc_06 uuid := 'ff000115-0003-0000-0000-000000000006';
  rc_07 uuid := 'ff000115-0003-0000-0000-000000000007';
  rc_08 uuid := 'ff000115-0003-0000-0000-000000000008';
  rc_09 uuid := 'ff000115-0003-0000-0000-000000000009';
  rc_10 uuid := 'ff000115-0003-0000-0000-000000000010';

  -- ── Olde Mecklenburg beers ──
  om_01 uuid := 'ff000115-0004-0000-0000-000000000001';
  om_02 uuid := 'ff000115-0004-0000-0000-000000000002';
  om_03 uuid := 'ff000115-0004-0000-0000-000000000003';
  om_04 uuid := 'ff000115-0004-0000-0000-000000000004';
  om_05 uuid := 'ff000115-0004-0000-0000-000000000005';
  om_06 uuid := 'ff000115-0004-0000-0000-000000000006';
  om_07 uuid := 'ff000115-0004-0000-0000-000000000007';
  om_08 uuid := 'ff000115-0004-0000-0000-000000000008';
  om_09 uuid := 'ff000115-0004-0000-0000-000000000009';

  -- ── Birdsong beers ──
  bs_01 uuid := 'ff000115-0005-0000-0000-000000000001';
  bs_02 uuid := 'ff000115-0005-0000-0000-000000000002';
  bs_03 uuid := 'ff000115-0005-0000-0000-000000000003';
  bs_04 uuid := 'ff000115-0005-0000-0000-000000000004';
  bs_05 uuid := 'ff000115-0005-0000-0000-000000000005';
  bs_06 uuid := 'ff000115-0005-0000-0000-000000000006';
  bs_07 uuid := 'ff000115-0005-0000-0000-000000000007';
  bs_08 uuid := 'ff000115-0005-0000-0000-000000000008';
  bs_09 uuid := 'ff000115-0005-0000-0000-000000000009';
  bs_10 uuid := 'ff000115-0005-0000-0000-000000000010';

  -- ── Heist beers ──
  he_01 uuid := 'ff000115-0006-0000-0000-000000000001';
  he_02 uuid := 'ff000115-0006-0000-0000-000000000002';
  he_03 uuid := 'ff000115-0006-0000-0000-000000000003';
  he_04 uuid := 'ff000115-0006-0000-0000-000000000004';
  he_05 uuid := 'ff000115-0006-0000-0000-000000000005';
  he_06 uuid := 'ff000115-0006-0000-0000-000000000006';
  he_07 uuid := 'ff000115-0006-0000-0000-000000000007';
  he_08 uuid := 'ff000115-0006-0000-0000-000000000008';
  he_09 uuid := 'ff000115-0006-0000-0000-000000000009';
  he_10 uuid := 'ff000115-0006-0000-0000-000000000010';

  -- ── Sycamore beers ──
  sy_01 uuid := 'ff000115-0007-0000-0000-000000000001';
  sy_02 uuid := 'ff000115-0007-0000-0000-000000000002';
  sy_03 uuid := 'ff000115-0007-0000-0000-000000000003';
  sy_04 uuid := 'ff000115-0007-0000-0000-000000000004';
  sy_05 uuid := 'ff000115-0007-0000-0000-000000000005';
  sy_06 uuid := 'ff000115-0007-0000-0000-000000000006';
  sy_07 uuid := 'ff000115-0007-0000-0000-000000000007';
  sy_08 uuid := 'ff000115-0007-0000-0000-000000000008';

  -- ── Triple C beers ──
  tc_01 uuid := 'ff000115-0008-0000-0000-000000000001';
  tc_02 uuid := 'ff000115-0008-0000-0000-000000000002';
  tc_03 uuid := 'ff000115-0008-0000-0000-000000000003';
  tc_04 uuid := 'ff000115-0008-0000-0000-000000000004';
  tc_05 uuid := 'ff000115-0008-0000-0000-000000000005';
  tc_06 uuid := 'ff000115-0008-0000-0000-000000000006';
  tc_07 uuid := 'ff000115-0008-0000-0000-000000000007';
  tc_08 uuid := 'ff000115-0008-0000-0000-000000000008';

  -- ── Divine Barrel beers ──
  db_01 uuid := 'ff000115-0009-0000-0000-000000000001';
  db_02 uuid := 'ff000115-0009-0000-0000-000000000002';
  db_03 uuid := 'ff000115-0009-0000-0000-000000000003';
  db_04 uuid := 'ff000115-0009-0000-0000-000000000004';
  db_05 uuid := 'ff000115-0009-0000-0000-000000000005';
  db_06 uuid := 'ff000115-0009-0000-0000-000000000006';
  db_07 uuid := 'ff000115-0009-0000-0000-000000000007';
  db_08 uuid := 'ff000115-0009-0000-0000-000000000008';
  db_09 uuid := 'ff000115-0009-0000-0000-000000000009';
  db_10 uuid := 'ff000115-0009-0000-0000-000000000010';

  -- ── Salud beers ──
  sa_01 uuid := 'ff000115-0010-0000-0000-000000000001';
  sa_02 uuid := 'ff000115-0010-0000-0000-000000000002';
  sa_03 uuid := 'ff000115-0010-0000-0000-000000000003';
  sa_04 uuid := 'ff000115-0010-0000-0000-000000000004';
  sa_05 uuid := 'ff000115-0010-0000-0000-000000000005';
  sa_06 uuid := 'ff000115-0010-0000-0000-000000000006';
  sa_07 uuid := 'ff000115-0010-0000-0000-000000000007';
  sa_08 uuid := 'ff000115-0010-0000-0000-000000000008';

BEGIN

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 1: Look up all brewery IDs by external_id
-- ═══════════════════════════════════════════════════════════════════════════════

SELECT id INTO id_noda FROM breweries WHERE external_id = '537b2caf-1ce6-4c4f-9e7c-618d3c0bf9c1';
SELECT id INTO id_wooden_robot FROM breweries WHERE external_id = '13bf0163-6103-4307-a4ed-70309601bc0e';
SELECT id INTO id_resident_culture FROM breweries WHERE external_id = 'c9815e98-046a-4e4e-bbd2-80d265b62747';
SELECT id INTO id_olde_meck FROM breweries WHERE external_id = '5de171b9-729f-4203-bdb5-33aca95fdd46';
SELECT id INTO id_birdsong FROM breweries WHERE external_id = '2f8dee5a-fc6e-49f3-84de-20ca5580acd4';
SELECT id INTO id_heist FROM breweries WHERE external_id = '528481d4-f3c8-479a-aad9-fce4b9cfe36a';
SELECT id INTO id_sycamore FROM breweries WHERE external_id = '970430cb-49db-4d40-bda4-a3fd12d3b40c';
SELECT id INTO id_triple_c FROM breweries WHERE external_id = '7c4c41ee-e482-4f94-9815-1f46759444d9';
SELECT id INTO id_divine_barrel FROM breweries WHERE external_id = '24b9cbee-b251-4444-b5b1-714b0cb90c0c';
SELECT id INTO id_legion FROM breweries WHERE external_id = '7d13578b-bcef-44e2-8894-e4ea8c6b4421';
SELECT id INTO id_lenny_boy FROM breweries WHERE external_id = '29b2bf8e-d0bf-4111-baf6-9d008cac8831';
SELECT id INTO id_free_range FROM breweries WHERE external_id = '18d675ae-8273-4b8d-bd10-b1ff4bf2b3a5';
SELECT id INTO id_sugar_creek FROM breweries WHERE external_id = 'ced563fa-0fc3-4c4c-bd16-2b9b7717f28a';
SELECT id INTO id_unknown FROM breweries WHERE external_id = '1a2e0257-a0c5-4ea9-b786-5d5585674596';
SELECT id INTO id_salud FROM breweries WHERE external_id = '7613627e-54af-4cea-9279-9ae4ef452fe1';

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 2: Enrich brewery profiles
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── NODA BREWING CO ────────────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Charlotte''s winningest brewery. World Beer Cup Gold for Hop Drop ''N Roll IPA. Founded in the NoDa arts district, now one of the largest craft breweries in the Carolinas with multiple taproom locations and regional distribution across NC.',
  phone = '7049006851',
  website_url = 'https://www.nodabrewing.com',
  hop_route_eligible = true,
  hop_route_offer = '$1 off your first pint when you check in with HopTrack',
  instagram_url = 'https://instagram.com/nodabrewing',
  facebook_url = 'https://facebook.com/NodaBrewing',
  untappd_url = 'https://untappd.com/nodabrewing',
  twitter_url = 'https://x.com/nodabrewing',
  latitude = 35.2366,
  longitude = -80.8130,
  vibe_tags = ARRAY['noda', 'award-winning', 'regional-distribution', 'taproom', 'food-trucks', 'dog-friendly', 'world-beer-cup-gold']
WHERE id = id_noda;

-- ── WOODEN ROBOT BREWERY ───────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Urban farmhouse brewery in South End, pairing a coffee bar with a world-class taproom. Known for blending Belgian farmhouse traditions with American craft innovation. Two locations: The Brewery (South End) and The Chamber (NoDa).',
  phone = '9808197875',
  website_url = 'https://woodenrobotbrewery.com',
  hop_route_eligible = true,
  hop_route_offer = 'Free taster of any farmhouse ale with HopTrack check-in',
  instagram_url = 'https://instagram.com/woodenrobotbrewery',
  facebook_url = 'https://facebook.com/WoodenRobotBrewery',
  untappd_url = 'https://untappd.com/WoodenRobot',
  twitter_url = NULL,
  latitude = 35.2150,
  longitude = -80.8570,
  vibe_tags = ARRAY['south-end', 'farmhouse', 'coffee-bar', 'urban-farmhouse', 'wild-ales', 'two-locations', 'belgian-inspired', 'design-forward']
WHERE id = id_wooden_robot;

-- ── RESIDENT CULTURE BREWING ───────────────────────────────────────────────
UPDATE breweries SET
  description = 'Hop-forward brewery in Plaza Midwood known for massive juice-bomb hazy IPAs, meticulous lagers, and boundary-pushing mixed-fermentation sours. The Lightning series DIPAs have a cult following. James Beard-semifinalist taproom.',
  phone = '7043331862',
  website_url = 'https://residentculturebrewing.com',
  hop_route_eligible = true,
  hop_route_offer = '$2 off any flagship IPA with HopTrack check-in',
  instagram_url = 'https://instagram.com/residentculture',
  facebook_url = 'https://facebook.com/ResidentCulture',
  untappd_url = 'https://untappd.com/Resident_Culture',
  twitter_url = NULL,
  latitude = 35.2202,
  longitude = -80.8055,
  vibe_tags = ARRAY['plaza-midwood', 'hazy-ipa', 'hop-forward', 'mixed-fermentation', 'lagers', 'cult-following', 'design-forward', 'james-beard']
WHERE id = id_resident_culture;

-- ── THE OLDE MECKLENBURG BREWERY ───────────────────────────────────────────
UPDATE breweries SET
  description = 'Charlotte''s oldest brewery, founded 2009. Brews exclusively German-style beers using only water, malt, hops, and yeast. Sprawling Yancey Road biergarten with meadow, bocce courts, and full restaurant. Multiple GABF medals.',
  phone = '7045255644',
  website_url = 'https://www.ombbeer.com',
  hop_route_eligible = true,
  hop_route_offer = 'Free pretzel with any liter when you check in with HopTrack',
  instagram_url = 'https://instagram.com/oldemeckbrew',
  facebook_url = 'https://facebook.com/TheOldeMecklenburgBrewery',
  untappd_url = 'https://untappd.com/oldemeckbrew',
  twitter_url = 'https://x.com/oldemeckbrew',
  latitude = 35.2059,
  longitude = -80.8741,
  vibe_tags = ARRAY['biergarten', 'german-style', 'oldest-charlotte', 'full-restaurant', 'bocce', 'meadow', 'family-friendly', 'gabf-medals']
WHERE id = id_olde_meck;

-- ── BIRDSONG BREWING CO ────────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Community-focused NoDa neighborhood brewery known for approachable beers and a welcoming taproom. Their Jalapeño Pale Ale is a Charlotte icon and Lazy Bird Brown Ale is multi-award-winning. Private event venue on-site.',
  phone = '7043321810',
  website_url = 'https://birdsongbrewing.com',
  hop_route_eligible = true,
  hop_route_offer = 'Free sticker pack when you check in with HopTrack',
  instagram_url = 'https://instagram.com/birdsongbrewing',
  facebook_url = 'https://facebook.com/birdsongbrewing',
  untappd_url = 'https://untappd.com/BirdsongBrewingCo',
  twitter_url = 'https://x.com/BirdsongBrewing',
  latitude = 35.2395,
  longitude = -80.8118,
  vibe_tags = ARRAY['noda', 'community', 'approachable', 'event-venue', 'dog-friendly', 'family-friendly', 'neighborhood']
WHERE id = id_birdsong;

-- ── HEIST BREWERY ──────────────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Charlotte''s first craft brewpub, opened 2012. Full kitchen with craft cocktails and wood-fired flatbreads. Pivoted from Belgian styles to acclaimed hazy IPAs — their CitraQuench''l is a Charlotte staple. Second location at Barrel Arts in NorthEnd.',
  phone = '7043758260',
  website_url = 'https://heistbrewery.com',
  hop_route_eligible = true,
  hop_route_offer = 'Free CitraQuench''l taster with HopTrack check-in',
  instagram_url = 'https://instagram.com/heistbrewery',
  facebook_url = 'https://facebook.com/HeistBrewery',
  untappd_url = 'https://untappd.com/HeistBreweryNC',
  twitter_url = 'https://x.com/heistbrewery',
  latitude = 35.2470,
  longitude = -80.8050,
  vibe_tags = ARRAY['noda', 'brewpub', 'full-kitchen', 'cocktails', 'hazy-ipa', 'barrel-arts', 'two-locations', 'wood-fired']
WHERE id = id_heist;

-- ── SYCAMORE BREWING ───────────────────────────────────────────────────────
UPDATE breweries SET
  description = 'South End institution with a 21,000+ sq ft 4-in-1 concept: taproom, beer garden, Airstream food truck, and café. 40 taps pouring an ever-changing selection. Separate $5M production brewery and cidery in North End.',
  phone = '9802013370',
  website_url = 'https://www.sycamorebrew.com',
  hop_route_eligible = true,
  hop_route_offer = '$1 off any draft pour with HopTrack check-in',
  instagram_url = 'https://instagram.com/sycamorebrewing',
  facebook_url = 'https://facebook.com/SycamoreBrewing',
  untappd_url = 'https://untappd.com/SycamoreBrewing',
  twitter_url = NULL,
  latitude = 35.2181,
  longitude = -80.8555,
  vibe_tags = ARRAY['south-end', 'beer-garden', 'light-rail', 'airstream', 'cafe', '40-taps', 'large-taproom', 'cidery']
WHERE id = id_sycamore;

-- ── TRIPLE C BREWING ───────────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Award-winning South End brewery since 2012. Large outdoor area with permanent Izzy''s Wood Fired Kitchen food truck. Live music weekends, trivia Mondays, bike club Tuesdays, yoga Wednesdays, run club Thursdays. Barrel room event space across the street.',
  phone = '7043723212',
  website_url = 'https://www.triplecbrewing.com',
  hop_route_eligible = true,
  hop_route_offer = 'Free sticker with your first HopTrack check-in',
  instagram_url = 'https://instagram.com/triplecbrewing',
  facebook_url = 'https://facebook.com/TripleCBrewing',
  untappd_url = 'https://untappd.com/TripleCBrewing',
  twitter_url = 'https://x.com/triplecbrewing',
  latitude = 35.2128,
  longitude = -80.8608,
  vibe_tags = ARRAY['south-end', 'live-music', 'food-truck', 'barrel-room', 'events', 'outdoor-seating', 'community', 'run-club']
WHERE id = id_triple_c;

-- ── DIVINE BARREL BREWING ──────────────────────────────────────────────────
UPDATE breweries SET
  description = 'NoDa neighborhood brewery specializing in wild and sour beers with a growing barrel and foeder program. Also known for West Coast IPAs, hazies, and creative lagers. Community-oriented taproom with rotating food trucks.',
  phone = '9802371803',
  website_url = 'https://divinebarrel.com',
  hop_route_eligible = true,
  hop_route_offer = 'Free taster of any sour with HopTrack check-in',
  instagram_url = 'https://instagram.com/divinebarrelclt',
  facebook_url = 'https://facebook.com/DivineBarrelBrewing',
  untappd_url = 'https://untappd.com/DivineBarrelBrewing',
  twitter_url = NULL,
  latitude = 35.2502,
  longitude = -80.7964,
  vibe_tags = ARRAY['noda', 'sour-program', 'barrel-aged', 'foeder', 'wild-ales', 'west-coast-ipa', 'community', 'food-trucks']
WHERE id = id_divine_barrel;

-- ── LEGION BREWING ─────────────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Multi-location Charlotte brewery with full kitchen. Flagship Plaza Midwood location, plus West Morehead and South Park taprooms. Go-to classics like Juicy Jay and Penguin alongside seasonal and limited releases.',
  phone = '8444675683',
  website_url = 'https://www.legionbrewing.com',
  hop_route_eligible = true,
  hop_route_offer = '$2 off your first flight when you check in with HopTrack',
  instagram_url = 'https://instagram.com/legionbrewing',
  facebook_url = 'https://facebook.com/legionbrewingmorehead',
  untappd_url = 'https://untappd.com/LegionBrewing',
  twitter_url = NULL,
  latitude = 35.2176,
  longitude = -80.8193,
  vibe_tags = ARRAY['plaza-midwood', 'multi-location', 'full-kitchen', 'family-friendly', 'community', 'patio', 'neighborhood']
WHERE id = id_legion;

-- ── LENNY BOY BREWING CO ───────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Unique dual-concept brewery producing craft beer, wild ales, and organic kombucha. 31,000+ sq ft facility with 29 taps, outdoor patio, and production viewing area. One of the few breweries in the country with a serious kombucha program.',
  phone = '9805851728',
  website_url = 'https://www.discoverlennyboy.com',
  hop_route_eligible = true,
  hop_route_offer = 'Free kombucha taster with any beer purchase and HopTrack check-in',
  instagram_url = 'https://instagram.com/lennyboybrewingco',
  facebook_url = 'https://facebook.com/LennyBoyBrewingCo',
  untappd_url = 'https://untappd.com/LennyBoyBrewing',
  twitter_url = NULL,
  latitude = 35.2013,
  longitude = -80.8680,
  vibe_tags = ARRAY['south-end', 'kombucha', 'wild-ales', 'organic', 'large-facility', 'production-viewing', 'patio', 'unique-concept']
WHERE id = id_lenny_boy;

-- ── FREE RANGE BREWING ─────────────────────────────────────────────────────
UPDATE breweries SET
  description = 'NoDa neighborhood brewery specializing in farmhouse ales and wild ales brewed with local NC ingredients. Always-rotating selection, live music, and community pop-ups. Second location Free Range Bar at Camp North End.',
  phone = '9802019096',
  website_url = 'https://www.freerangebrewing.com',
  hop_route_eligible = true,
  hop_route_offer = 'Free sticker when you check in with HopTrack',
  instagram_url = 'https://instagram.com/freerangebrewing',
  facebook_url = 'https://facebook.com/FreeRangeBrewing',
  untappd_url = 'https://untappd.com/FreeRangeBrewing',
  twitter_url = NULL,
  latitude = 35.2409,
  longitude = -80.8098,
  vibe_tags = ARRAY['noda', 'farmhouse', 'local-ingredients', 'live-music', 'rotating-taps', 'community', 'camp-north-end']
WHERE id = id_free_range;

-- ── SUGAR CREEK BREWING CO ─────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Belgian-inspired brewery combining the watchful eye of a Trappist Monk with the precision of a nuclear engineer. Full-flavored, immensely satisfying Belgian-style ales available on tap, by growler, and in bottles.',
  phone = '7045213333',
  website_url = 'https://sugarcreekbrewing.com',
  hop_route_eligible = true,
  hop_route_offer = '$1 off any Belgian ale with HopTrack check-in',
  instagram_url = 'https://instagram.com/sugarcreekbrewing',
  facebook_url = 'https://facebook.com/SugarCreekBrewing',
  untappd_url = 'https://untappd.com/SugarCreekBrewing',
  twitter_url = NULL,
  latitude = 35.2027,
  longitude = -80.8679,
  vibe_tags = ARRAY['belgian-style', 'trappist-inspired', 'taproom', 'growlers', 'bottles', 'craft-focused']
WHERE id = id_sugar_creek;

-- ── UNKNOWN BREWING COMPANY ────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Founded 2014 by Brad Shell. One of the few Charlotte spots that brews AND distills — their on-site distillery produces spirits alongside a rotating craft beer lineup. Known for creative, boundary-pushing brews and Small Batch Sundays.',
  phone = '9802372628',
  website_url = 'https://unknownbrewing.com',
  hop_route_eligible = true,
  hop_route_offer = 'Free ginger ale taster with HopTrack check-in',
  instagram_url = 'https://instagram.com/unknownbrewing',
  facebook_url = 'https://facebook.com/unknownbrewing',
  untappd_url = 'https://untappd.com/TheUnkn',
  twitter_url = NULL,
  latitude = 35.2192,
  longitude = -80.8608,
  vibe_tags = ARRAY['south-end', 'brewery-distillery', 'creative', 'small-batch', 'boundary-pushing', 'spirits']
WHERE id = id_unknown;

-- ── SALUD CERVECERIA ───────────────────────────────────────────────────────
UPDATE breweries SET
  description = 'NoDa brewery, James Beard-nominated restaurant, and coffeeshop rolled into one. Dominican-inspired with a focus on modern clean beers and classic farmhouse/sour styles. Known for Berlinerweisses and creative stouts.',
  phone = '9804956612',
  website_url = 'https://saludcerveceria.com',
  hop_route_eligible = true,
  hop_route_offer = 'Free taster of Del Patio lager with HopTrack check-in',
  instagram_url = 'https://instagram.com/saludcerveceria',
  facebook_url = 'https://facebook.com/saludcerveceria',
  untappd_url = 'https://untappd.com/SaludCerveceria',
  twitter_url = NULL,
  latitude = 35.2478,
  longitude = -80.8041,
  vibe_tags = ARRAY['noda', 'james-beard-nominated', 'restaurant', 'coffeeshop', 'dominican-inspired', 'farmhouse', 'sour-program', 'berlinerweisse']
WHERE id = id_salud;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 3: Add beers
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── NODA BREWING CO ────────────────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(nd_01, id_noda, 'Hop Drop ''N Roll', 'American IPA', 7.2, 85,
 '2014 World Beer Cup Gold Award winner. Citra, Amarillo, Centennial and Chinook hops for a bold, citrusy, resinous flagship IPA.', true, true, 'beer', false),
(nd_02, id_noda, 'Jam Session', 'American Pale Ale', 5.1, NULL,
 'Session-weight pale ale. Fruity and approachable, the everyday drinker.', true, true, 'beer', false),
(nd_03, id_noda, 'Coco Loco', 'American Porter', 6.2, NULL,
 'GABF Silver medal porter with rich coconut and chocolate character.', true, true, 'beer', false),
(nd_04, id_noda, 'Radio Haze', 'Hazy IPA', 6.0, NULL,
 'Mosaic, Citra, Centennial, and Chinook hops. Citrusy and tropical aroma with bold fruity hop flavors, low bitterness.', true, true, 'beer', false),
(nd_05, id_noda, 'CAVU', 'Blonde Ale', 4.8, NULL,
 'Clear skies ahead. Light, crisp, and crushable golden ale.', true, true, 'beer', false),
(nd_06, id_noda, 'LiL SLURP', 'Hazy IPA', 6.5, NULL,
 'Juicy, hazy, tropical. A little sibling to the bigger hop-forward beers.', true, true, 'beer', false),
(nd_07, id_noda, 'Hop Cakes', 'Imperial IPA', 8.5, NULL,
 'Double IPA layered with hop flavors. Celebratory and bold.', true, true, 'beer', true),
(nd_08, id_noda, 'Gordgeous', 'Pumpkin Ale', 6.0, NULL,
 'Seasonal pumpkin ale with warm spice and gourd character.', true, true, 'beer', true),
(nd_09, id_noda, 'Cheerwine Ale', 'Fruited Wheat', 5.5, NULL,
 'Collaboration with Cheerwine — cherry-forward wheat ale. A Carolina original.', true, true, 'beer', true),
(nd_10, id_noda, 'Hoppy Holidays', 'American IPA', 7.0, NULL,
 'Seasonal holiday IPA with festive hop character.', true, true, 'beer', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── WOODEN ROBOT BREWERY ───────────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(wr_01, id_wooden_robot, 'Good Morning Vietnam', 'Coffee Blonde Ale', 5.0, NULL,
 'Coffee vanilla blonde ale made with locally roasted Ethiopian coffee from Enderly Coffee and rich Madagascar vanilla beans.', true, true, 'beer', false),
(wr_02, id_wooden_robot, 'What He''s Having', 'American IPA', 6.7, NULL,
 'Over 3 lbs of bold American hops per barrel. Citrus and tropical fruit notes with a silky, light body and restrained bitterness.', true, true, 'beer', false),
(wr_03, id_wooden_robot, 'Overachiever', 'American Pale Ale', 5.3, NULL,
 'Citrusy, juicy hop character of an IPA packed into an obsessively drinkable pale ale. Simcoe, Centennial, and Strata hops with local Epiphany malts.', true, true, 'beer', false),
(wr_04, id_wooden_robot, 'What She''s Having', 'Imperial IPA', 8.5, NULL,
 'Double dry-hopped imperial IPA. Bigger, bolder sibling of What He''s Having.', true, true, 'beer', false),
(wr_05, id_wooden_robot, 'Space Magic', 'Hazy IPA', 6.8, NULL,
 'Hazy, juicy, and hop-forward with tropical fruit and citrus character.', true, true, 'beer', false),
(wr_06, id_wooden_robot, 'Thicket As Thieves', 'American Wild Ale', 6.5, NULL,
 'Farmhouse-inspired wild ale with complex, funky character from mixed culture fermentation.', true, true, 'beer', false),
(wr_07, id_wooden_robot, 'Robotico', 'Mexican Lager', 4.5, NULL,
 'Crisp, clean Mexican-style lager. Light and refreshing.', true, true, 'beer', false),
(wr_08, id_wooden_robot, 'BotBier', 'Saison', 6.0, NULL,
 'Belgian-inspired farmhouse saison with peppery esters and dry finish.', true, true, 'beer', false),
(wr_09, id_wooden_robot, 'Juice Island', 'American IPA', 6.5, NULL,
 'Their first canned beer. Tropical, juicy, and hop-forward.', true, true, 'beer', false),
(wr_10, id_wooden_robot, 'Strawberry Swirl It!', 'Fruited Sour', 5.0, NULL,
 'Tart and fruity with bold strawberry character. Bright pink pour.', true, true, 'beer', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── RESIDENT CULTURE BREWING ───────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(rc_01, id_resident_culture, 'Lightning', 'Imperial Hazy IPA', 8.0, NULL,
 'Flagship double hazy IPA. Massive tropical fruit and citrus with a soft, pillowy body. The juice bomb that put Resident Culture on the map.', true, true, 'beer', false),
(rc_02, id_resident_culture, 'First & Ten', 'Hazy IPA', 6.8, NULL,
 'Juicy hazy IPA brewed with flaked oats, DDH with over 5 lbs per barrel of Citra and Mosaic.', true, true, 'beer', false),
(rc_03, id_resident_culture, 'Palace', 'German Pilsner', 5.2, NULL,
 'Meticulous German-style pilsner. Crisp, clean, and exactly what a pils should be.', true, true, 'beer', false),
(rc_04, id_resident_culture, 'Wave', 'Hazy Pale Ale', 5.5, NULL,
 'Approachable hazy pale ale with tropical hop character at session weight.', true, true, 'beer', false),
(rc_05, id_resident_culture, 'Night Swim', 'Baltic Porter', 8.2, NULL,
 'Rich, smooth Baltic-style porter with roast, chocolate, and dark fruit.', true, true, 'beer', false),
(rc_06, id_resident_culture, 'Galaxy Brain', 'Imperial Hazy IPA', 8.5, NULL,
 'Triple dry-hopped with Galaxy hops. Explosive tropical fruit and stone fruit character.', true, true, 'beer', true),
(rc_07, id_resident_culture, 'Cathedral', 'Mixed-Fermentation Saison', 6.0, NULL,
 'Complex mixed-culture farmhouse ale with subtle funk and dry finish.', true, true, 'beer', true),
(rc_08, id_resident_culture, 'Festbier', 'German Festbier', 5.4, NULL,
 'Traditional German Festbier. Malty, balanced, and celebratory.', true, true, 'beer', true),
(rc_09, id_resident_culture, 'Keller', 'Kellerbier', 5.0, NULL,
 'Unfiltered German-style kellerbier with bready malt and noble hop character.', true, true, 'beer', true),
(rc_10, id_resident_culture, 'Mondo', 'West Coast IPA', 7.0, NULL,
 'Classic West Coast IPA with piney, resinous hops and a dry, bitter finish.', true, true, 'beer', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── THE OLDE MECKLENBURG BREWERY ───────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(om_01, id_olde_meck, 'Copper', 'Altbier', 4.9, NULL,
 'Authentic Dusseldorf-style altbier. Graham cracker, toffee, and caramel with a smooth, balanced finish. Their flagship.', true, true, 'beer', false),
(om_02, id_olde_meck, 'Captain Jack', 'German Pilsner', 4.8, NULL,
 'Crisp, clean German-style pilsner with noble hop character and a dry finish.', true, true, 'beer', false),
(om_03, id_olde_meck, 'Hornets Nest', 'Hefeweizen', 5.2, NULL,
 'Traditional Bavarian hefeweizen with banana and clove esters.', true, true, 'beer', false),
(om_04, id_olde_meck, 'Fat Boy', 'Baltic Porter', 8.3, NULL,
 'Big, bold, and bountiful premium Baltic porter. Rich and complex.', true, true, 'beer', false),
(om_05, id_olde_meck, 'unFOURseen', 'West Coast IPA', 6.5, NULL,
 'Their take on a West Coast IPA — piney, citrusy, and firmly bitter.', true, true, 'beer', false),
(om_06, id_olde_meck, 'Mecktoberfest', 'Marzen', 5.8, NULL,
 'OMB''s most award-winning beer. Classic Marzen-style amber lager, the original Oktoberfest bier.', true, true, 'beer', true),
(om_07, id_olde_meck, 'Dunkel', 'Munich Dunkel', 5.0, NULL,
 'Traditional dark Munich lager with bread crust and chocolate malt character.', true, true, 'beer', true),
(om_08, id_olde_meck, 'Bock Party', 'Bock', 6.5, NULL,
 'Rich spring bock with toasty malt and clean lager finish.', true, true, 'beer', true),
(om_09, id_olde_meck, 'Munzler''s', 'Vienna Lager', 5.0, NULL,
 'Balanced amber Vienna lager with biscuit malt and subtle noble hops.', true, true, 'beer', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── BIRDSONG BREWING CO ────────────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(bs_01, id_birdsong, 'Jalapeno Pale Ale', 'Chile Beer', 5.5, NULL,
 'Charlotte icon. Pale ale with real jalapeno pepper heat and bright hop character. Their most famous beer.', true, true, 'beer', false),
(bs_02, id_birdsong, 'Higher Ground', 'American IPA', 6.5, NULL,
 'Flagship American IPA with citrus and pine hop character.', true, true, 'beer', false),
(bs_03, id_birdsong, 'Lazy Bird', 'American Brown Ale', 5.5, NULL,
 'Multi-award-winning brown ale. Nutty, malty, and sessionable.', true, true, 'beer', false),
(bs_04, id_birdsong, 'Mexicali Stout', 'Mexican Stout', 5.0, NULL,
 'Stout with cinnamon, cocoa, and a touch of chile. Inspired by Mexican hot chocolate.', true, true, 'beer', false),
(bs_05, id_birdsong, 'Paradise City', 'American IPA', 7.0, NULL,
 'West Coast-leaning IPA with tropical and resinous hop notes.', true, true, 'beer', false),
(bs_06, id_birdsong, 'Fake Plastic Trees', 'Hazy IPA', 6.5, NULL,
 'Hazy, juicy, and tropical. Named after the Radiohead song.', true, true, 'beer', false),
(bs_07, id_birdsong, 'Honey Pie', 'Imperial IPA', 8.0, NULL,
 'Double IPA with honey sweetness and bold hop character.', true, true, 'beer', true),
(bs_08, id_birdsong, 'Wake Up', 'Coffee Porter', 5.8, NULL,
 'Coffee vanilla porter with smooth roast character.', true, true, 'beer', false),
(bs_09, id_birdsong, 'Rewind', 'American Lager', 4.5, NULL,
 'Crisp, clean, throwback American lager.', true, true, 'beer', false),
(bs_10, id_birdsong, 'Hazy Sexy Cool', 'Hazy IPA', 6.8, NULL,
 'New England-style hazy IPA. Juicy and soft.', true, true, 'beer', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── HEIST BREWERY ──────────────────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(he_01, id_heist, 'CitraQuench''l', 'Hazy IPA', 6.8, NULL,
 'The beer that changed Charlotte craft. Signature hazy IPA loaded with Citra hops. Juicy, tropical, and crushable.', true, true, 'beer', false),
(he_02, id_heist, 'Blurred Is the Word', 'Hazy IPA', 6.5, NULL,
 'Hazy IPA with soft tropical fruit and citrus notes.', true, true, 'beer', false),
(he_03, id_heist, 'Not From Concentrate', 'Hazy IPA', 7.0, NULL,
 'Pure juice. Hazy IPA with explosive tropical hop character.', true, true, 'beer', false),
(he_04, id_heist, 'MO-J', 'Hazy IPA', 6.5, NULL,
 'Mosaic and juice-forward hazy IPA.', true, true, 'beer', false),
(he_05, id_heist, 'Brunch Junkie', 'Oatmeal Stout', 6.0, NULL,
 'Breakfast-inspired oatmeal stout with coffee and maple character.', true, true, 'beer', false),
(he_06, id_heist, 'UberQuench''l', 'Imperial Hazy IPA', 8.5, NULL,
 'Imperial version of CitraQuench''l. Bigger, bolder, juicier.', true, true, 'beer', true),
(he_07, id_heist, 'Bee Fruitful', 'Imperial Hazy IPA', 8.0, NULL,
 'Fruited imperial hazy with honey and tropical fruit.', true, true, 'beer', true),
(he_08, id_heist, 'Blurred Up', 'Imperial Hazy IPA', 8.2, NULL,
 'Imperial double hazy. Soft, pillowy, and crushable for the ABV.', true, true, 'beer', true),
(he_09, id_heist, 'Stratasfaction', 'Imperial Hazy IPA', 8.0, NULL,
 'Imperial hazy IPA showcasing Strata hops — tropical and dank.', true, true, 'beer', true),
(he_10, id_heist, '20/20 Vision', 'Hazy IPA', 6.5, NULL,
 'Crystal clear flavor, hazy pour. Balanced and bright.', true, true, 'beer', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── SYCAMORE BREWING ───────────────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(sy_01, id_sycamore, 'Mountain Candy', 'Hazy IPA', 6.5, NULL,
 'Juicy, hazy IPA with tropical candy-like hop character.', true, true, 'beer', false),
(sy_02, id_sycamore, 'Sunny Side', 'Blonde Ale', 4.8, NULL,
 'Light, refreshing blonde ale. South End''s go-to crushable beer.', true, true, 'beer', false),
(sy_03, id_sycamore, 'Juiciness', 'Hazy IPA', 7.0, NULL,
 'DDH hazy IPA bursting with tropical fruit and citrus.', true, true, 'beer', false),
(sy_04, id_sycamore, 'Southern Girl', 'Blonde Ale', 5.0, NULL,
 'Approachable blonde ale with a touch of honey sweetness.', true, true, 'beer', false),
(sy_05, id_sycamore, 'Barn Jacket', 'Brown Ale', 5.5, NULL,
 'Nutty, malty brown ale with caramel and toffee notes.', true, true, 'beer', true),
(sy_06, id_sycamore, 'Stout Season', 'Imperial Stout', 9.0, NULL,
 'Rich, roasty imperial stout for colder months.', true, true, 'beer', true),
(sy_07, id_sycamore, 'Mega Juiciness', 'Imperial Hazy IPA', 8.5, NULL,
 'Imperial version of Juiciness. Even more tropical fruit and body.', true, true, 'beer', true),
(sy_08, id_sycamore, 'Pumpkin Latte', 'Pumpkin Ale', 5.5, NULL,
 'Seasonal pumpkin ale with espresso and warm spice.', true, true, 'beer', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── TRIPLE C BREWING ───────────────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(tc_01, id_triple_c, '3C', 'West Coast IPA', 7.0, 70,
 'Flagship West Coast IPA. Piney, citrusy, and firmly bitter. Their namesake beer.', true, true, 'beer', false),
(tc_02, id_triple_c, 'Golden Boy', 'Blonde Ale', 4.8, NULL,
 'Light, easy-drinking golden ale. The session beer.', true, true, 'beer', false),
(tc_03, id_triple_c, 'Baby Maker', 'Double IPA', 8.5, NULL,
 'Bold double IPA with aggressive hop presence. One of their most popular.', true, true, 'beer', false),
(tc_04, id_triple_c, 'Hazer', 'Hazy IPA', 6.5, NULL,
 'Juicy, hazy New England-style IPA.', true, true, 'beer', false),
(tc_05, id_triple_c, 'Up All Night', 'Coffee Porter', 5.5, NULL,
 'Rich coffee porter. Smooth and roasty.', true, true, 'beer', false),
(tc_06, id_triple_c, 'The Force', 'Imperial Stout', 10.0, NULL,
 'Massive imperial stout with dark chocolate and roast. Barrel-aged variants released annually.', true, true, 'beer', true),
(tc_07, id_triple_c, 'Wings & Arrows', 'Saison', 6.5, NULL,
 'Belgian-style saison with peppery esters and citrus.', true, true, 'beer', true),
(tc_08, id_triple_c, 'Light Rail', 'Pilsner', 4.5, NULL,
 'Crisp pilsner named after the South End light rail. Clean and refreshing.', true, true, 'beer', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── DIVINE BARREL BREWING ──────────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(db_01, id_divine_barrel, 'Ice Cream Paint Job', 'Fruited Berliner Weisse', 5.0, NULL,
 'Fruited Berliner with raspberries, sweet cherries, and blueberries. Their signature sour series.', true, true, 'beer', false),
(db_02, id_divine_barrel, 'Perception Is Spoonfed', 'Fruited Berliner Weisse', 5.5, NULL,
 'Tart, fruited Berliner Weisse from the barrel program.', true, true, 'beer', false),
(db_03, id_divine_barrel, 'Climb a Cloud', 'Hazy IPA', 6.5, NULL,
 'Soft, pillowy hazy IPA with tropical hop character.', true, true, 'beer', false),
(db_04, id_divine_barrel, 'Cadillac Rainbows', 'Fruited Berliner Weisse', 5.2, NULL,
 'Vibrant fruited Berliner with layered berry and stone fruit.', true, true, 'beer', true),
(db_05, id_divine_barrel, 'Imaginary Rulebook', 'Imperial Hazy IPA', 8.5, NULL,
 'Imperial hazy IPA. Aggressive hop character with a soft, juicy body.', true, true, 'beer', true),
(db_06, id_divine_barrel, 'Carolina Cobbler', 'Smoothie Sour', 5.5, NULL,
 'Smoothie-style sour with peach cobbler flavors. Thick and dessert-like.', true, true, 'beer', true),
(db_07, id_divine_barrel, 'Defensive Pancake', 'Porter', 5.8, NULL,
 'Rich American porter with roast and chocolate. Surprisingly named, seriously good.', true, true, 'beer', false),
(db_08, id_divine_barrel, 'Neon Distraction', 'Hazy IPA', 7.0, NULL,
 'Hazy IPA with bright, neon-tropical hop character.', true, true, 'beer', false),
(db_09, id_divine_barrel, 'Universal Language', 'American IPA', 6.8, NULL,
 'West Coast-leaning American IPA. Piney and citrusy.', true, true, 'beer', false),
(db_10, id_divine_barrel, 'Pulp Culture', 'Hazy Pale Ale', 5.5, NULL,
 'Hazy pale ale with juicy hop character at session weight.', true, true, 'beer', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── SALUD CERVECERIA ───────────────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(sa_01, id_salud, 'Del Patio', 'Mexican Lager', 4.5, NULL,
 'Crisp, refreshing Mexican-style lager. Their most popular beer — made for the patio.', true, true, 'beer', false),
(sa_02, id_salud, 'Banana Keys', 'Imperial Milk Stout', 9.0, NULL,
 'Rich imperial milk stout with banana and chocolate. One they are particularly proud of.', true, true, 'beer', false),
(sa_03, id_salud, 'Que Jumo!!', 'Triple IPA', 10.0, NULL,
 'Massive triple IPA. Bold, juicy, and dangerously drinkable for the ABV.', true, true, 'beer', true),
(sa_04, id_salud, 'Chocolate Caliente', 'Imperial Stout', 9.5, NULL,
 'Mexican hot chocolate-inspired imperial stout with chile, cinnamon, and cocoa.', true, true, 'beer', true),
(sa_05, id_salud, 'Coco Rico', 'Milkshake IPA', 6.5, NULL,
 'Creamy milkshake IPA with coconut character.', true, true, 'beer', true),
(sa_06, id_salud, 'Saison Roble', 'Saison', 6.0, NULL,
 'Oak-aged farmhouse saison with dry, peppery character.', true, true, 'beer', false),
(sa_07, id_salud, 'Dairelynerweisse', 'Fruited Berliner Weisse', 4.5, NULL,
 'Tart Berliner Weisse with raspberry, blackberry, and pomegranate. Their signature sour.', true, true, 'beer', false),
(sa_08, id_salud, 'Otra Noche En Charleston', 'Fruited Berliner Weisse', 5.0, NULL,
 'Berliner Weisse with tropical fruit. Named for another night in Charleston.', true, true, 'beer', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 4: Mark permanently closed breweries
-- ═══════════════════════════════════════════════════════════════════════════════

UPDATE breweries SET
  is_active = false,
  description = 'PERMANENTLY CLOSED. Was a woman-owned brewery at 610 Anderson St, Charlotte.'
WHERE external_id = 'bcaa1166-a27a-447f-b057-3bf43d21ed68'; -- Bold Missy Brewery

-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE: 15 Charlotte breweries enriched, ~96 beers seeded, 1 marked closed.
-- ═══════════════════════════════════════════════════════════════════════════════

RAISE NOTICE '✅ Migration 115: Charlotte enrichment complete — 15 breweries, ~96 beers, 1 closed';

END $$;
