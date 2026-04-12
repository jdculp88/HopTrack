-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 118: Enrich Wilmington NC Breweries
-- 8 breweries enriched with descriptions, social links, vibe tags, and beers.
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
  description = 'Wilmington''s largest independent brewery. Known for creative, hop-forward beers and a spacious taproom with food trucks. Their sour program and hazy IPAs have a devoted following on the coast.',
  website_url = 'https://www.wilmingtonbrewing.com',
  hop_route_eligible = true,
  hop_route_offer = '$1 off any pint with HopTrack check-in',
  instagram_url = 'https://instagram.com/wilmingtonbrewing',
  facebook_url = 'https://facebook.com/WilmingtonBrewingCompany',
  untappd_url = 'https://untappd.com/WilmingtonBrewing',
  latitude = 34.2104, longitude = -77.9192,
  vibe_tags = ARRAY['largest-indie', 'hop-forward', 'sour-program', 'food-trucks', 'spacious', 'coast']
WHERE id = id_wilmington_brewing;

UPDATE breweries SET
  description = 'Eclectic downtown Wilmington brewery named for the Venus flytrap, native to the NC coast. Known for creative, well-crafted beers and a community-driven taproom. One of the most acclaimed small breweries in Wilmington.',
  website_url = 'https://www.flytrapbrewing.com',
  hop_route_eligible = true,
  hop_route_offer = 'Free sticker with HopTrack check-in',
  instagram_url = 'https://instagram.com/flytrapbrewing',
  facebook_url = 'https://facebook.com/flytrapbrewing',
  untappd_url = 'https://untappd.com/FlyTrapBrewing',
  latitude = 34.2364, longitude = -77.9476,
  vibe_tags = ARRAY['downtown', 'eclectic', 'venus-flytrap', 'community', 'creative', 'small-batch']
WHERE id = id_flytrap;

UPDATE breweries SET
  description = 'Pirate-themed brewery near downtown Wilmington named after the infamous Blackbeard (Edward Teach). Bold brews, nautical décor, and a large beer garden. Popular with locals and tourists.',
  website_url = 'https://www.edwardteachbrewing.com',
  hop_route_eligible = true,
  hop_route_offer = 'Free taster of any draft with HopTrack check-in',
  instagram_url = 'https://instagram.com/edwardteachbrewing',
  facebook_url = 'https://facebook.com/EdwardTeachBrewing',
  untappd_url = 'https://untappd.com/EdwardTeachBrewing',
  latitude = 34.2421, longitude = -77.9484,
  vibe_tags = ARRAY['pirate-themed', 'beer-garden', 'nautical', 'downtown', 'tourist-friendly', 'bold-brews']
WHERE id = id_edward_teach;

UPDATE breweries SET
  description = 'Downtown Wilmington brewery in a renovated historic building on 2nd Street. Named for the Civil War ironclad ships built in Wilmington. Known for their lagers, English ales, and barrel-aged program.',
  website_url = 'https://www.ironcladbrewery.com',
  hop_route_eligible = true,
  hop_route_offer = '$1 off any pint with HopTrack check-in',
  instagram_url = 'https://instagram.com/ironcladbrewery',
  facebook_url = 'https://facebook.com/IroncladBrewery',
  untappd_url = 'https://untappd.com/IroncladBrewery',
  latitude = 34.2370, longitude = -77.9464,
  vibe_tags = ARRAY['downtown', 'historic-building', 'civil-war-history', 'lagers', 'english-ales', 'barrel-aged']
WHERE id = id_ironclad;

UPDATE breweries SET
  description = 'Wilmington''s oldest brewpub, operating since 1995 on Front Street near the river. Full-service restaurant with house-brewed German, Belgian, and American styles. A Wilmington institution.',
  website_url = 'https://www.frontstreetbrewery.com',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/frontstreetbrewery',
  facebook_url = 'https://facebook.com/FrontStreetBrewery',
  untappd_url = 'https://untappd.com/FrontStreetBrewery',
  latitude = 34.2358, longitude = -77.9488,
  vibe_tags = ARRAY['oldest-wilmington', 'brewpub', 'riverfront', 'full-restaurant', 'german-style', 'institution']
WHERE id = id_front_street;

UPDATE breweries SET
  description = 'Waterfront brewery on the Cape Fear River in downtown Wilmington. Focus on creative New World ales with a relaxed, dock-side atmosphere.',
  website_url = 'https://www.newanthembeer.com',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/newanthembeer',
  facebook_url = 'https://facebook.com/newanthembeer',
  untappd_url = 'https://untappd.com/NewAnthemBeer',
  latitude = 34.2352, longitude = -77.9493,
  vibe_tags = ARRAY['waterfront', 'cape-fear', 'dock-side', 'creative', 'new-world-ales', 'relaxed']
WHERE id = id_new_anthem;

UPDATE breweries SET
  description = 'Neighborhood brewery in Wilmington''s Soda Pop district. Small-batch, creative beers in a casual taproom setting. Known for IPAs and rotating sours.',
  website_url = 'https://www.waterlinebrewing.com',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/waterlinebrewing',
  facebook_url = 'https://facebook.com/WaterlineBrewing',
  untappd_url = 'https://untappd.com/WaterlineBrewing',
  latitude = 34.2213, longitude = -77.9278,
  vibe_tags = ARRAY['soda-pop-district', 'neighborhood', 'small-batch', 'casual', 'ipa-focused', 'rotating-sours']
WHERE id = id_waterline;

UPDATE breweries SET
  description = 'Laid-back beach brewery near Wrightsville Beach. Surf-and-turf vibes with craft beer and a full food menu. Popular with the Wrightsville Beach crowd.',
  website_url = 'https://www.wrightsvillebeachbrewery.com',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/wrightsvillebeachbrewery',
  facebook_url = 'https://facebook.com/WrightsvilleBeachBrewery',
  untappd_url = 'https://untappd.com/WrightsvilleBeachBrewery',
  latitude = 34.2118, longitude = -77.8517,
  vibe_tags = ARRAY['beach', 'wrightsville', 'laid-back', 'surf-vibes', 'full-kitchen', 'coastal']
WHERE id = id_wrightsville;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 3: Add beers
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(wb_01, id_wilmington_brewing, 'Flaming Ginger', 'Red Ale', 6.0, NULL, 'Red ale with ginger character. Their signature beer.', true, true, 'beer', false),
(wb_02, id_wilmington_brewing, 'Haze Craze', 'Hazy IPA', 6.5, NULL, 'Juicy hazy IPA with tropical hop character.', true, true, 'beer', false),
(wb_03, id_wilmington_brewing, 'Downtown Brown', 'Brown Ale', 5.5, NULL, 'Nutty, malty brown ale.', true, true, 'beer', false),
(wb_04, id_wilmington_brewing, 'Beach Ale', 'Blonde Ale', 4.5, NULL, 'Light, refreshing blonde for the beach.', true, true, 'beer', false),
(wb_05, id_wilmington_brewing, 'Sour Series', 'Fruited Sour', 5.0, NULL, 'Rotating fruited sour series.', true, true, 'beer', true),
(wb_06, id_wilmington_brewing, 'Imperial IPA', 'Imperial IPA', 8.5, NULL, 'Bold double IPA with aggressive hop character.', true, true, 'beer', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(ft_01, id_flytrap, 'Open Jaws', 'American IPA', 6.8, NULL, 'Flagship IPA named for the Venus flytrap. Citrusy and resinous.', true, true, 'beer', false),
(ft_02, id_flytrap, 'Sundew', 'Blonde Ale', 4.5, NULL, 'Light and refreshing blonde ale.', true, true, 'beer', false),
(ft_03, id_flytrap, 'Flytrap Hazy', 'Hazy IPA', 6.5, NULL, 'Juicy, tropical hazy IPA.', true, true, 'beer', false),
(ft_04, id_flytrap, 'Bog Water', 'Brown Ale', 5.5, NULL, 'Nutty brown ale with malty sweetness.', true, true, 'beer', false),
(ft_05, id_flytrap, 'Carnivore', 'Imperial Stout', 9.0, NULL, 'Rich imperial stout with dark chocolate and roast.', true, true, 'beer', true),
(ft_06, id_flytrap, 'Pitcher Plant', 'Pilsner', 5.0, NULL, 'Crisp, clean pilsner.', true, true, 'beer', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(et_01, id_edward_teach, 'Blackbeard''s Breakfast', 'Coffee Stout', 5.5, NULL, 'Coffee stout — bold, dark, and pirate-approved.', true, true, 'beer', false),
(et_02, id_edward_teach, 'Drummond', 'Scottish Ale', 5.0, NULL, 'Malty Scottish ale with caramel and toffee.', true, true, 'beer', false),
(et_03, id_edward_teach, 'Broadside', 'American IPA', 7.0, NULL, 'Bold American IPA with citrus and pine.', true, true, 'beer', false),
(et_04, id_edward_teach, 'Teach''s Peaches', 'Fruited Wheat', 5.0, NULL, 'Wheat ale with NC peaches.', true, true, 'beer', true),
(et_05, id_edward_teach, 'Adventure Galley', 'Hazy IPA', 6.5, NULL, 'Juicy hazy IPA with tropical character.', true, true, 'beer', false),
(et_06, id_edward_teach, 'Plank Walker', 'Porter', 5.5, NULL, 'Smooth porter with chocolate and roast.', true, true, 'beer', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(ic_01, id_ironclad, 'Copperhead', 'Copper Ale', 5.5, NULL, 'Flagship copper ale with malty backbone and balanced hops.', true, true, 'beer', false),
(ic_02, id_ironclad, 'Neuse', 'English Bitter', 4.5, NULL, 'Traditional English bitter. Balanced and sessionable.', true, true, 'beer', false),
(ic_03, id_ironclad, 'Haze Raider', 'Hazy IPA', 6.8, NULL, 'Juicy, hazy IPA with tropical hop character.', true, true, 'beer', false),
(ic_04, id_ironclad, 'German Pils', 'German Pilsner', 5.0, NULL, 'Clean, crisp German-style pilsner.', true, true, 'beer', false),
(ic_05, id_ironclad, 'Barrel-Aged Stout', 'Imperial Stout', 10.0, NULL, 'Bourbon barrel-aged imperial stout. Rich and complex.', true, true, 'beer', true),
(ic_06, id_ironclad, 'Kolsch', 'Kolsch', 4.8, NULL, 'Light, clean Kolsch-style ale.', true, true, 'beer', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ═══════════════════════════════════════════════════════════════════════════════
RAISE NOTICE '✅ Migration 118: Wilmington enrichment complete — 8 breweries, ~24 beers';
END $$;
