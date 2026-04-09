-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 108: Enrich Charlotte NC Breweries
-- 10 breweries enriched with descriptions, social links, vibe tags, and beers.
-- ~90 real beers from web research (Untappd, brewery websites).
-- Safe to re-run (ON CONFLICT DO UPDATE for beers, idempotent UPDATEs).
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  -- Brewery IDs (looked up by external_id)
  id_resident_culture uuid;
  id_wooden_robot uuid;
  id_divine_barrel uuid;
  id_noda uuid;
  id_birdsong uuid;
  id_olde_meck uuid;
  id_sycamore uuid;
  id_triple_c uuid;
  id_legion uuid;
  id_free_range uuid;

  -- ── Resident Culture beers ──
  rc_01 uuid := 'ff000108-0001-0000-0000-000000000001';
  rc_02 uuid := 'ff000108-0001-0000-0000-000000000002';
  rc_03 uuid := 'ff000108-0001-0000-0000-000000000003';
  rc_04 uuid := 'ff000108-0001-0000-0000-000000000004';
  rc_05 uuid := 'ff000108-0001-0000-0000-000000000005';
  rc_06 uuid := 'ff000108-0001-0000-0000-000000000006';
  rc_07 uuid := 'ff000108-0001-0000-0000-000000000007';
  rc_08 uuid := 'ff000108-0001-0000-0000-000000000008';

  -- ── Wooden Robot beers ──
  wr_01 uuid := 'ff000108-0002-0000-0000-000000000001';
  wr_02 uuid := 'ff000108-0002-0000-0000-000000000002';
  wr_03 uuid := 'ff000108-0002-0000-0000-000000000003';
  wr_04 uuid := 'ff000108-0002-0000-0000-000000000004';
  wr_05 uuid := 'ff000108-0002-0000-0000-000000000005';
  wr_06 uuid := 'ff000108-0002-0000-0000-000000000006';
  wr_07 uuid := 'ff000108-0002-0000-0000-000000000007';
  wr_08 uuid := 'ff000108-0002-0000-0000-000000000008';

  -- ── Divine Barrel beers ──
  db_01 uuid := 'ff000108-0003-0000-0000-000000000001';
  db_02 uuid := 'ff000108-0003-0000-0000-000000000002';
  db_03 uuid := 'ff000108-0003-0000-0000-000000000003';
  db_04 uuid := 'ff000108-0003-0000-0000-000000000004';
  db_05 uuid := 'ff000108-0003-0000-0000-000000000005';
  db_06 uuid := 'ff000108-0003-0000-0000-000000000006';
  db_07 uuid := 'ff000108-0003-0000-0000-000000000007';
  db_08 uuid := 'ff000108-0003-0000-0000-000000000008';

  -- ── NoDa Brewing beers ──
  nd_01 uuid := 'ff000108-0004-0000-0000-000000000001';
  nd_02 uuid := 'ff000108-0004-0000-0000-000000000002';
  nd_03 uuid := 'ff000108-0004-0000-0000-000000000003';
  nd_04 uuid := 'ff000108-0004-0000-0000-000000000004';
  nd_05 uuid := 'ff000108-0004-0000-0000-000000000005';
  nd_06 uuid := 'ff000108-0004-0000-0000-000000000006';
  nd_07 uuid := 'ff000108-0004-0000-0000-000000000007';
  nd_08 uuid := 'ff000108-0004-0000-0000-000000000008';

  -- ── Birdsong beers ──
  bs_01 uuid := 'ff000108-0005-0000-0000-000000000001';
  bs_02 uuid := 'ff000108-0005-0000-0000-000000000002';
  bs_03 uuid := 'ff000108-0005-0000-0000-000000000003';
  bs_04 uuid := 'ff000108-0005-0000-0000-000000000004';
  bs_05 uuid := 'ff000108-0005-0000-0000-000000000005';
  bs_06 uuid := 'ff000108-0005-0000-0000-000000000006';
  bs_07 uuid := 'ff000108-0005-0000-0000-000000000007';
  bs_08 uuid := 'ff000108-0005-0000-0000-000000000008';

  -- ── Olde Mecklenburg beers ──
  om_01 uuid := 'ff000108-0006-0000-0000-000000000001';
  om_02 uuid := 'ff000108-0006-0000-0000-000000000002';
  om_03 uuid := 'ff000108-0006-0000-0000-000000000003';
  om_04 uuid := 'ff000108-0006-0000-0000-000000000004';
  om_05 uuid := 'ff000108-0006-0000-0000-000000000005';
  om_06 uuid := 'ff000108-0006-0000-0000-000000000006';
  om_07 uuid := 'ff000108-0006-0000-0000-000000000007';
  om_08 uuid := 'ff000108-0006-0000-0000-000000000008';

  -- ── Sycamore / Club West beers ──
  sy_01 uuid := 'ff000108-0007-0000-0000-000000000001';
  sy_02 uuid := 'ff000108-0007-0000-0000-000000000002';
  sy_03 uuid := 'ff000108-0007-0000-0000-000000000003';
  sy_04 uuid := 'ff000108-0007-0000-0000-000000000004';
  sy_05 uuid := 'ff000108-0007-0000-0000-000000000005';
  sy_06 uuid := 'ff000108-0007-0000-0000-000000000006';

  -- ── Triple C beers ──
  tc_01 uuid := 'ff000108-0008-0000-0000-000000000001';
  tc_02 uuid := 'ff000108-0008-0000-0000-000000000002';
  tc_03 uuid := 'ff000108-0008-0000-0000-000000000003';
  tc_04 uuid := 'ff000108-0008-0000-0000-000000000004';
  tc_05 uuid := 'ff000108-0008-0000-0000-000000000005';
  tc_06 uuid := 'ff000108-0008-0000-0000-000000000006';
  tc_07 uuid := 'ff000108-0008-0000-0000-000000000007';

  -- ── Legion beers ──
  lg_01 uuid := 'ff000108-0009-0000-0000-000000000001';
  lg_02 uuid := 'ff000108-0009-0000-0000-000000000002';
  lg_03 uuid := 'ff000108-0009-0000-0000-000000000003';
  lg_04 uuid := 'ff000108-0009-0000-0000-000000000004';
  lg_05 uuid := 'ff000108-0009-0000-0000-000000000005';
  lg_06 uuid := 'ff000108-0009-0000-0000-000000000006';
  lg_07 uuid := 'ff000108-0009-0000-0000-000000000007';
  lg_08 uuid := 'ff000108-0009-0000-0000-000000000008';

  -- ── Free Range beers ──
  fr_01 uuid := 'ff000108-0010-0000-0000-000000000001';
  fr_02 uuid := 'ff000108-0010-0000-0000-000000000002';
  fr_03 uuid := 'ff000108-0010-0000-0000-000000000003';
  fr_04 uuid := 'ff000108-0010-0000-0000-000000000004';
  fr_05 uuid := 'ff000108-0010-0000-0000-000000000005';
  fr_06 uuid := 'ff000108-0010-0000-0000-000000000006';
  fr_07 uuid := 'ff000108-0010-0000-0000-000000000007';
  fr_08 uuid := 'ff000108-0010-0000-0000-000000000008';

BEGIN

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 1: Look up all brewery IDs by external_id
-- ═══════════════════════════════════════════════════════════════════════════════

SELECT id INTO id_resident_culture FROM breweries WHERE external_id = 'c9815e98-046a-4e4e-bbd2-80d265b62747';
SELECT id INTO id_wooden_robot FROM breweries WHERE external_id = '13bf0163-6103-4307-a4ed-70309601bc0e';
SELECT id INTO id_divine_barrel FROM breweries WHERE external_id = '24b9cbee-b251-4444-b5b1-714b0cb90c0c';
SELECT id INTO id_noda FROM breweries WHERE external_id = '537b2caf-1ce6-4c4f-9e7c-618d3c0bf9c1';
SELECT id INTO id_birdsong FROM breweries WHERE external_id = '2f8dee5a-fc6e-49f3-84de-20ca5580acd4';
SELECT id INTO id_olde_meck FROM breweries WHERE external_id = '5de171b9-729f-4203-bdb5-33aca95fdd46';
SELECT id INTO id_sycamore FROM breweries WHERE external_id = '970430cb-49db-4d40-bda4-a3fd12d3b40c';
SELECT id INTO id_triple_c FROM breweries WHERE external_id = '7c4c41ee-e482-4f94-9815-1f46759444d9';
SELECT id INTO id_legion FROM breweries WHERE external_id = '7d13578b-bcef-44e2-8894-e4ea8c6b4421';
SELECT id INTO id_free_range FROM breweries WHERE external_id = '18d675ae-8273-4b8d-bd10-b1ff4bf2b3a5';

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 2: Enrich brewery profiles
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── RESIDENT CULTURE ────────────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Opened 2017 in Plaza Midwood. Exceptional hazy IPAs, experimental sours, and a growing lager program. Transformed an old family warehouse into a community-centered taproom.',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/residentculture',
  facebook_url = 'https://facebook.com/ResidentCulture',
  untappd_url = 'https://untappd.com/Resident_Culture',
  twitter_url = 'https://x.com/ResidentCulture',
  vibe_tags = ARRAY['industrial', 'hip', 'patio', 'dog-friendly', 'food-trucks', 'outdoor', 'fire-pits', 'art', 'games']
WHERE id = id_resident_culture;

-- ── WOODEN ROBOT ────────────────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Urban farmhouse brewery in South End since 2015. Belgian-inspired farmhouse ales, clean hoppy beers, and the signature Good Morning Vietnam coffee vanilla blonde.',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/woodenrobotbrewery',
  facebook_url = 'https://facebook.com/WoodenRobotBrewery',
  untappd_url = 'https://untappd.com/WoodenRobot',
  twitter_url = 'https://x.com/WoodenRobotAle',
  vibe_tags = ARRAY['dog-friendly', 'food', 'patio', 'industrial', 'hip', 'games', 'family-friendly']
WHERE id = id_wooden_robot;

-- ── DIVINE BARREL ───────────────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Opened 2018 in NoDa. West Coast IPAs, creative pastry sours, and an expanding barrel/foeder program. Inclusive vibes with trivia, run club, and live events.',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/divinebarrelclt',
  facebook_url = 'https://facebook.com/DivineBarrelBrewing',
  untappd_url = 'https://untappd.com/DivineBarrelBrewing',
  twitter_url = 'https://x.com/divinebarrelclt',
  vibe_tags = ARRAY['dog-friendly', 'patio', 'food-trucks', 'games', 'hip', 'inclusive', 'trivia', 'run-club']
WHERE id = id_divine_barrel;

-- ── NODA BREWING ────────────────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Charlotte''s most decorated brewery since 2011. Home of the World Beer Cup Gold-winning Hop Drop ''N Roll IPA. Multiple locations including NoDa OG and North End.',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/nodabrewing',
  facebook_url = 'https://facebook.com/NoDaBrewingCompany',
  untappd_url = 'https://untappd.com/nodabrewing',
  twitter_url = 'https://x.com/NoDaBrewing',
  vibe_tags = ARRAY['outdoor', 'dog-friendly', 'food-trucks', 'string-lights', 'games', 'artsy', 'casual', 'live-music', 'family-friendly']
WHERE id = id_noda;

-- ── BIRDSONG BREWING ────────────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Neighborhood brewery in NoDa since 2011. Flavorful unfiltered American ales with 20 rotating taps and weekly experimental small-batch releases. Known for the Jalapeno Pale Ale.',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/birdsongbrewing',
  facebook_url = 'https://facebook.com/birdsongbrewing',
  untappd_url = 'https://untappd.com/BirdsongBrewingCo',
  twitter_url = 'https://x.com/birdsongbrewing',
  vibe_tags = ARRAY['outdoor', 'dog-friendly', 'food-trucks', 'live-music', 'casual', 'neighborhood', 'fire-tables', 'games', 'family-friendly']
WHERE id = id_birdsong;

-- ── OLDE MECKLENBURG ────────────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Charlotte''s oldest independent brewery since 2009. Brews exclusively German-style beers per the Reinheitsgebot. Home to the largest biergarten in the Southeast.',
  brewery_type = 'regional',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/oldemeckbrew',
  facebook_url = 'https://facebook.com/OldeMeckBrewery',
  untappd_url = 'https://untappd.com/oldemeckbrew',
  twitter_url = 'https://x.com/oldemeckbrew',
  vibe_tags = ARRAY['biergarten', 'outdoor', 'dog-friendly', 'family-friendly', 'food', 'german', 'live-music', 'games', 'spacious', 'traditional']
WHERE id = id_olde_meck;

-- ── SYCAMORE / CLUB WEST ────────────────────────────────────────────────────
-- NOTE: Sycamore Brewing was sold and rebranded as Club West Brewing in March 2026.
UPDATE breweries SET
  name = 'Club West Brewing (formerly Sycamore)',
  description = 'South End staple since 2013, rebranded as Club West Brewing in March 2026 under new ownership. 21,000 sq ft taproom with beer garden, food truck, and cafe. Known for Mountain Candy IPA.',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/sycamorebrewing',
  facebook_url = 'https://facebook.com/SycamoreBrewing',
  untappd_url = 'https://untappd.com/SycamoreBrewing',
  twitter_url = 'https://x.com/SycamoreBrewing',
  vibe_tags = ARRAY['outdoor', 'dog-friendly', 'food-trucks', 'patio', 'beer-garden', 'large-venue', 'social', 'rail-trail', 'cafe']
WHERE id = id_sycamore;

-- ── TRIPLE C ────────────────────────────────────────────────────────────────
UPDATE breweries SET
  description = 'South End staple since 2012. Small batches, fresh beer, and community. GABF Bronze Medal for their 3C IPA. The Barrel Room hosts events and live music.',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/triplecbrewing',
  facebook_url = 'https://facebook.com/triplecbrewing',
  untappd_url = 'https://untappd.com/triplecbrewing',
  twitter_url = 'https://x.com/triplecbrew',
  vibe_tags = ARRAY['outdoor', 'dog-friendly', 'food-trucks', 'patio', 'industrial', 'live-music', 'laid-back', 'games', 'barrel-room']
WHERE id = id_triple_c;

-- ── LEGION BREWING ──────────────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Plaza Midwood since 2015. Campfire hospitality and award-winning beers including World Beer Cup Silver and GABF Gold. Expanded to SouthPark and a 17,000 sq ft production facility.',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/legionbrewing',
  facebook_url = 'https://facebook.com/legionbrewing',
  untappd_url = 'https://untappd.com/LegionBrewingCompany',
  twitter_url = 'https://x.com/LegionBrewing',
  vibe_tags = ARRAY['outdoor', 'dog-friendly', 'patio', 'hip', 'food', 'live-music', 'trivia', 'family-friendly', 'community', 'walkable']
WHERE id = id_legion;

-- ── FREE RANGE BREWING ──────────────────────────────────────────────────────
UPDATE breweries SET
  description = 'NoDa since 2015. Sustainable hyper-local brewery known for farmhouse ales, wild ales, and creative ingredients like sourdough-fermented beers. Community-first with artist showcases.',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/freerangebrew',
  facebook_url = 'https://facebook.com/FreeRangeBrewing',
  untappd_url = 'https://untappd.com/freerangebrewing',
  twitter_url = 'https://x.com/freerangebrew',
  vibe_tags = ARRAY['dog-friendly', 'kid-friendly', 'live-music', 'laid-back', 'neighborhood', 'games', 'patio', 'artsy', 'community']
WHERE id = id_free_range;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 3: Add beers
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── RESIDENT CULTURE ────────────────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(rc_01, id_resident_culture, 'Lightning Drops', 'Hazy IPA', 6.5, NULL,
 'Flagship hazy hopped with Citra, Mosaic, and Galaxy. Tropical citrus, resin, and dank with a pillowy mouthfeel.', true, true, 'beer', false),
(rc_02, id_resident_culture, 'Whatever You Feel Just Dance It', 'Hazy IPA', 7.0, NULL,
 'DDH hazy IPA with over 5 lbs/bbl of Citra and Mosaic. Bright grapefruit, tangerine, and passionfruit.', true, true, 'beer', false),
(rc_03, id_resident_culture, 'Vicky Virago', 'Double IPA', 8.0, NULL,
 'Triple dry-hopped DIPA with Galaxy, Citra, and El Dorado. Lush tropical fruit bomb.', true, true, 'beer', false),
(rc_04, id_resident_culture, 'God Complex', 'Double IPA', 9.0, NULL,
 'Imperial hazy with intense hop presence and bold tropical flavor.', true, true, 'beer', false),
(rc_05, id_resident_culture, 'Country Kind of Silence', 'Lager', 4.75, NULL,
 'German-style Helles lager. Light, crisp, and sweet malt character.', true, true, 'beer', false),
(rc_06, id_resident_culture, 'Island Time', 'Lager', 4.5, NULL,
 'Crisp Mexican-style lager with lime. Easy-drinking warm weather staple.', true, true, 'beer', false),
(rc_07, id_resident_culture, 'Radical Empathy', 'Pilsner', 4.8, NULL,
 'German pils hopped with Hallertau Mittlefruh, Blanc, and Tettnang.', true, true, 'beer', false),
(rc_08, id_resident_culture, 'Quantum Wobble', 'Sour', 4.0, NULL,
 'Fruited Berliner Weisse with bright fruit character and light tartness.', true, true, 'beer', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── WOODEN ROBOT ────────────────────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(wr_01, id_wooden_robot, 'Good Morning Vietnam', 'Blonde Ale', 5.0, 40,
 'Coffee vanilla blonde with locally roasted Ethiopian coffee and Madagascar vanilla beans. The flagship.', true, true, 'beer', false),
(wr_02, id_wooden_robot, 'What He''s Having', 'IPA', 6.5, 70,
 'Citrus and tropical fruit IPA with melon and passion fruit notes and a silky body.', true, true, 'beer', false),
(wr_03, id_wooden_robot, 'Overachiever', 'Pale Ale', 5.3, NULL,
 'Citrusy juicy hazy pale ale with Simcoe and Centennial hops.', true, true, 'beer', false),
(wr_04, id_wooden_robot, 'Space Magic', 'Hazy IPA', 7.0, NULL,
 'Hazy IPA with local barley and oat malts, copious Citra and Simcoe hops. Big pineapple aroma.', true, true, 'beer', false),
(wr_05, id_wooden_robot, 'Godless Killing Machine', 'Imperial Stout', 12.0, 55,
 'Big bold imperial stout with dark fruits, rich chocolate, roasty coffee, and caramel.', true, true, 'beer', true),
(wr_06, id_wooden_robot, 'Good Night Vietnam', 'Porter', 5.0, NULL,
 'Coffee vanilla porter. The darker sister to Good Morning Vietnam.', true, true, 'beer', false),
(wr_07, id_wooden_robot, 'Robotico', 'Lager', 4.5, NULL,
 'Light Mexican-style lager brewed with 100% local malt and Tuxpeno corn.', true, true, 'beer', false),
(wr_08, id_wooden_robot, 'BotBier', 'Saison', 6.0, NULL,
 'Urban farmhouse ale with 100% local pale malt. Dry with fruity and spicy character.', true, true, 'beer', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── DIVINE BARREL ───────────────────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(db_01, id_divine_barrel, 'Universal Language', 'IPA', 6.5, 95,
 'Flagship West Coast IPA with Citra, Simcoe, and Mosaic. Juicy citrus balanced with assertive bitterness.', true, true, 'beer', false),
(db_02, id_divine_barrel, 'Forty Dollar Bill', 'IPA', 6.5, 90,
 'Dank West Coast IPA with Citra, Simcoe, and Amarillo. Citrus and pine.', true, true, 'beer', false),
(db_03, id_divine_barrel, 'Lead-Filled Snowshoe', 'IPA', 7.2, 85,
 'DDH West Coast IPA with Simcoe, Mosaic, and Citra. Sticky pine and zippy citrus.', true, true, 'beer', false),
(db_04, id_divine_barrel, 'Imaginary Rulebook', 'Double IPA', 8.0, 35,
 'DDH hazy DIPA with Citra, El Dorado, and Idaho 7. Pineapple, mango, and grapefruit.', true, true, 'beer', false),
(db_05, id_divine_barrel, 'Ice Cream Paint Job', 'Sour', 4.6, 5,
 'Berliner Weisse with 500+ lbs of raspberries, cherries, and blueberries plus vanilla and lactose.', true, true, 'beer', false),
(db_06, id_divine_barrel, 'Carolina Cobbler', 'Sour', 6.0, 5,
 'Peach cobbler-inspired pastry sour with vanilla, graham cracker, and cinnamon.', true, true, 'beer', true),
(db_07, id_divine_barrel, 'Defensive Pancake', 'Porter', 6.8, 33,
 'Robust porter with Madagascar vanilla, Vermont maple syrup, Saigon cinnamon, and coffee.', true, true, 'beer', false),
(db_08, id_divine_barrel, 'Czech Pils', 'Pilsner', 5.2, NULL,
 'Bohemian-style pilsner with toasty biscuit malt and restrained hop balance.', true, true, 'beer', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── NODA BREWING ────────────────────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(nd_01, id_noda, 'Hop Drop ''N Roll', 'IPA', 7.2, 81,
 '2014 World Beer Cup Gold. Citra, Amarillo, Centennial and Chinook hops for intense hop character.', true, true, 'beer', false),
(nd_02, id_noda, 'Jam Session', 'Pale Ale', 5.1, 31,
 'Sessionable pale ale balancing English and American malts with Centennial, Simcoe, and Amarillo.', true, true, 'beer', false),
(nd_03, id_noda, 'Coco Loco', 'Porter', 6.2, 40,
 'Chocolate and brown malts with organic toasted coconut. 2012 GABF Silver Medal.', true, true, 'beer', false),
(nd_04, id_noda, 'Radio Haze', 'Hazy IPA', 6.0, 20,
 'Mosaic, Citra, Centennial, and Chinook with citrusy tropical notes. Medium body.', true, true, 'beer', false),
(nd_05, id_noda, 'Hop Cakes', 'Double IPA', 10.2, 120,
 'Hops meet maple syrup in this sticky, smooth imperial IPA.', true, true, 'beer', true),
(nd_06, id_noda, 'CAVU', 'Blonde Ale', 4.6, 18,
 'Light ale with hints of tropical fruit and citrus from west coast hops. Clean and bright.', true, true, 'beer', false),
(nd_07, id_noda, 'Premium Roast', 'Stout', 5.0, NULL,
 'Dark, rich, roasty coffee stout with custom blend from Charlotte''s Parliament Coffee Roasters.', true, true, 'beer', false),
(nd_08, id_noda, 'Gordgeous', 'Other', 6.4, 29,
 'Real pumpkin puree with brown sugar, ginger, and spices. 2018 and 2020 GABF Gold Medal.', true, true, 'beer', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── BIRDSONG BREWING ────────────────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(bs_01, id_birdsong, 'Jalapeno Pale Ale', 'Pale Ale', 5.5, 45,
 'Fresh-picked jalapeno peppers deliver fantastic pepper taste without the heat. Their signature beer.', true, true, 'beer', false),
(bs_02, id_birdsong, 'Higher Ground IPA', 'IPA', 7.0, 65,
 'West Coast style IPA with Cascade hops. Crisp and bitter.', true, true, 'beer', false),
(bs_03, id_birdsong, 'Lazy Bird Brown Ale', 'Other', 5.5, 45,
 'Mahogany brown ale with roasty aroma and smooth malt character.', true, true, 'beer', false),
(bs_04, id_birdsong, 'Mexicali Stout', 'Stout', 5.8, 35,
 'Habanero, cacao nibs, local coffee, and cinnamon. Traditional mole-inspired stout.', true, true, 'beer', false),
(bs_05, id_birdsong, 'Hazy Sexy Cool', 'Hazy IPA', 6.8, 50,
 'Citra, Mosaic, and El Dorado hops in a hazy New England style.', true, true, 'beer', false),
(bs_06, id_birdsong, 'Fake Plastic Trees', 'Hazy IPA', 6.4, 40,
 'Lemon citrus and piney character from Sorachi Ace, Cascade, and Comet hops.', true, true, 'beer', false),
(bs_07, id_birdsong, 'Honey Pie', 'Double IPA', 8.9, 80,
 'Locally harvested honey with honeydew and grapefruit aromas from a unique hop blend.', true, true, 'beer', false),
(bs_08, id_birdsong, 'Wake Up Coffee Vanilla Porter', 'Porter', 5.8, 29,
 'Central Coffee Co. Sumatra Lintong coffee with Madagascar vanilla beans.', true, true, 'beer', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── OLDE MECKLENBURG ────────────────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(om_01, id_olde_meck, 'Copper', 'Other', 4.8, 31,
 'Flagship Dusseldorf-style altbier. Full-flavored start, smooth balanced finish.', true, true, 'beer', false),
(om_02, id_olde_meck, 'Captain Jack', 'Pilsner', 4.9, 27,
 'Crisp German pilsner named for Revolutionary War hero Captain James Jack.', true, true, 'beer', false),
(om_03, id_olde_meck, 'Hornets Nest', 'Other', 5.4, 14,
 'Opaque Bavarian hefeweizen named for Charlotte''s Revolutionary War moniker.', true, true, 'beer', false),
(om_04, id_olde_meck, 'Fat Boy', 'Porter', 8.0, 30,
 'Rich Baltic porter with caramel, toffee, and chocolate. Prune and raisin notes. Their biggest beer.', true, true, 'beer', false),
(om_05, id_olde_meck, 'Dunkel', 'Lager', 4.9, 28,
 'Smooth Munich dark lager with caramel and roasted malt.', true, true, 'beer', false),
(om_06, id_olde_meck, 'Mecktoberfest', 'Lager', 5.4, 24,
 'Most award-winning OMB beer. Rich, malty, super smooth Marzen/Oktoberfest style.', true, true, 'beer', true),
(om_07, id_olde_meck, 'Mecklenburger', 'Lager', 4.9, 20,
 'Crystal clear golden Bavarian Helles. Fresh, smooth, easy to love.', true, true, 'beer', false),
(om_08, id_olde_meck, 'Yule Bock', 'Other', 7.0, 30,
 'Christmas Weihnachtsbock. Deep amber, rich malt character. Holiday seasonal.', true, true, 'beer', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── SYCAMORE / CLUB WEST ────────────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(sy_01, id_sycamore, 'Mountain Candy', 'IPA', 7.5, 70,
 'Hop-bursted and DDH with juicy stone fruit and rainbow candy flavors. Citrusy dankness.', true, true, 'beer', false),
(sy_02, id_sycamore, 'Southern Girl', 'Blonde Ale', 5.2, 45,
 'Golden ale with biscuity malt sweetness and subtle strawberry and honeydew melon notes.', true, true, 'beer', false),
(sy_03, id_sycamore, 'Double Candy', 'Double IPA', 9.0, NULL,
 'Imperial version of Mountain Candy with amplified hop character and stone fruit intensity.', true, true, 'beer', false),
(sy_04, id_sycamore, 'Sticky Crystals', 'Hazy IPA', 7.0, NULL,
 'Hazy IPA with Sabro and NZ hops. Pungent tropical aromatics.', true, true, 'beer', false),
(sy_05, id_sycamore, 'Slurricane', 'Hazy IPA', 7.0, NULL,
 'Tropical haze bomb with mandarin orange, stone fruit, and lime.', true, true, 'beer', false),
(sy_06, id_sycamore, 'Vanilla Affogato', 'Other', 6.4, NULL,
 'Cream ale with rich vanilla character. Smooth and dessert-like.', true, true, 'beer', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── TRIPLE C ────────────────────────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(tc_01, id_triple_c, '3C IPA', 'IPA', 6.2, 70,
 'Citra, Centennial, and Chinook hops with grapefruit and citrus. GABF Bronze Medal.', true, true, 'beer', false),
(tc_02, id_triple_c, 'Baby Maker', 'Double IPA', 8.5, 80,
 'Aggressively hopped DIPA with Amarillo, Azacca, Cascade, and Glacier on a sturdy malt backbone.', true, true, 'beer', false),
(tc_03, id_triple_c, 'Golden Boy Blonde', 'Blonde Ale', 4.5, 23,
 'Easy-drinking blonde with locally grown Carolina Malt House grain.', true, true, 'beer', false),
(tc_04, id_triple_c, 'Planet Pulp', 'Hazy IPA', 6.5, NULL,
 'Juicy tropical hazy with Mosaic, Citra, and El Dorado. Pineapple and peach.', true, true, 'beer', false),
(tc_05, id_triple_c, 'Up All Night Breakfast Porter', 'Porter', 10.0, NULL,
 'Imperial porter with flaked oats, Cloister honey, lactose, and Sugar Creek Coffee.', true, true, 'beer', true),
(tc_06, id_triple_c, 'White Blaze', 'Other', 6.0, 25,
 'Winter warmer with Ceylon cinnamon and vanilla beans. Inspired by the Appalachian Trail.', true, true, 'beer', true),
(tc_07, id_triple_c, 'Zest-A-Peel', 'Blonde Ale', 5.2, 10,
 'Crisp golden ale with orange zest for bright citrus aromatics.', true, true, 'beer', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── LEGION BREWING ──────────────────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(lg_01, id_legion, 'Juicy Jay', 'IPA', 6.3, 68,
 'Mosaic, El Dorado, and Cascade hops. Juicy tropical treat with a dry finish.', true, true, 'beer', false),
(lg_02, id_legion, 'Slainte', 'Stout', 5.1, 40,
 'Irish dry stout with creamy mouthfeel and clean dry finish. World Beer Cup Silver 2018.', true, true, 'beer', false),
(lg_03, id_legion, 'High Praise', 'IPA', 6.5, NULL,
 'Crisp West Coast IPA with bright grapefruit hop character. GABF Gold 2022.', true, true, 'beer', false),
(lg_04, id_legion, 'Penguin Pilsner', 'Pilsner', 4.8, 15,
 'Flagship lager with US-grown Saaz hops. Mild floral aroma, clean and crisp.', true, true, 'beer', false),
(lg_05, id_legion, 'Carolina Sparkle Party', 'Sour', 4.0, 8,
 'Traditional kettle sour with sourdough, lemonade, and crisp tartness.', true, true, 'beer', false),
(lg_06, id_legion, 'Path To the Dark Side', 'Stout', 5.0, 30,
 'Oatmeal stout aged on American oak with roasted coffee and dark chocolate.', true, true, 'beer', false),
(lg_07, id_legion, 'Freedom Park Pale', 'Pale Ale', 5.2, 40,
 'Citrusy floral Cascade hops with a malty caramel backbone.', true, true, 'beer', false),
(lg_08, id_legion, 'Winnie the Brew', 'Double IPA', 10.2, 95,
 'Aggressively hopped with Chinook, Centennial, and Simcoe. Balanced with honey.', true, true, 'beer', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── FREE RANGE BREWING ──────────────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(fr_01, id_free_range, 'Cream Of The Crop', 'Other', 5.0, 17,
 'Crisp and easy-drinking cream ale. Their most popular offering.', true, true, 'beer', false),
(fr_02, id_free_range, 'Therapy Session', 'Hazy IPA', 5.3, NULL,
 'Light and juicy hazy IPA with tropical fruit and citrus notes.', true, true, 'beer', false),
(fr_03, id_free_range, 'Sea Of Companions', 'Stout', 8.0, 32,
 'Oyster stout brewed with bi-valves. Rich and briny imperial stout.', true, true, 'beer', false),
(fr_04, id_free_range, 'All You Knead Is Love', 'Other', 4.0, NULL,
 'Wild ale fermented with sourdough culture from Duke''s Bread. Tart and citrus-forward.', true, true, 'beer', false),
(fr_05, id_free_range, 'Hop To My Heart My Darling', 'IPA', 8.0, 52,
 'Orange-forward and intensely hopped IPA from the Love and Devotion series.', true, true, 'beer', false),
(fr_06, id_free_range, 'Bob''s Pure Intentions', 'Other', 6.6, 34,
 'Oat brown ale with microlot Burundi coffee. Rich and complex.', true, true, 'beer', false),
(fr_07, id_free_range, 'She May', 'Other', 10.0, NULL,
 'Belgian strong golden ale brewed with honey and aged in whiskey barrels. Inspired by Chimay Blue.', true, true, 'beer', true),
(fr_08, id_free_range, 'My Heart And Soul', 'Saison', 5.0, NULL,
 'Carolina saison with buckwheat and strawberries.', true, true, 'beer', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ═══════════════════════════════════════════════════════════════════════════════

RAISE NOTICE 'Charlotte enrichment complete: 10 breweries updated, 75 beers added.';

END $$;
