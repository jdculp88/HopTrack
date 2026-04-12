-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 117: Enrich Durham NC Breweries
-- 7 breweries enriched with descriptions, social links, vibe tags, and beers.
-- Safe to re-run (ON CONFLICT DO UPDATE for beers, idempotent UPDATEs).
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  id_fullsteam uuid;
  id_ponysaurus uuid;
  id_bull_durham uuid;
  id_bull_city uuid;
  id_barrel_culture uuid;
  id_durty_bull uuid;
  id_clouds_durham uuid;

  -- Fullsteam beers
  fs_01 uuid := 'ff000117-0001-0000-0000-000000000001';
  fs_02 uuid := 'ff000117-0001-0000-0000-000000000002';
  fs_03 uuid := 'ff000117-0001-0000-0000-000000000003';
  fs_04 uuid := 'ff000117-0001-0000-0000-000000000004';
  fs_05 uuid := 'ff000117-0001-0000-0000-000000000005';
  fs_06 uuid := 'ff000117-0001-0000-0000-000000000006';
  fs_07 uuid := 'ff000117-0001-0000-0000-000000000007';
  fs_08 uuid := 'ff000117-0001-0000-0000-000000000008';

  -- Ponysaurus beers
  ps_01 uuid := 'ff000117-0002-0000-0000-000000000001';
  ps_02 uuid := 'ff000117-0002-0000-0000-000000000002';
  ps_03 uuid := 'ff000117-0002-0000-0000-000000000003';
  ps_04 uuid := 'ff000117-0002-0000-0000-000000000004';
  ps_05 uuid := 'ff000117-0002-0000-0000-000000000005';
  ps_06 uuid := 'ff000117-0002-0000-0000-000000000006';
  ps_07 uuid := 'ff000117-0002-0000-0000-000000000007';
  ps_08 uuid := 'ff000117-0002-0000-0000-000000000008';

  -- Barrel Culture beers
  bc_01 uuid := 'ff000117-0003-0000-0000-000000000001';
  bc_02 uuid := 'ff000117-0003-0000-0000-000000000002';
  bc_03 uuid := 'ff000117-0003-0000-0000-000000000003';
  bc_04 uuid := 'ff000117-0003-0000-0000-000000000004';
  bc_05 uuid := 'ff000117-0003-0000-0000-000000000005';
  bc_06 uuid := 'ff000117-0003-0000-0000-000000000006';

BEGIN

SELECT id INTO id_fullsteam FROM breweries WHERE external_id = 'e9f6be0f-0246-47ec-92b2-8d99fdabbbf2';
SELECT id INTO id_ponysaurus FROM breweries WHERE external_id = '9a279764-f687-43a5-b361-8c98189d177b';
SELECT id INTO id_bull_durham FROM breweries WHERE external_id = '6e967aa2-6e2b-4396-ac4e-d4cd8119cbb3';
SELECT id INTO id_bull_city FROM breweries WHERE external_id = 'd89ba7ba-c249-48a2-bae7-48f3b39cb18f';
SELECT id INTO id_barrel_culture FROM breweries WHERE external_id = '0a857a91-0b76-4850-9594-08938b756d99';
SELECT id INTO id_durty_bull FROM breweries WHERE external_id = 'ae111ea0-b5a2-46f0-9e64-bcc1ecadca27';
SELECT id INTO id_clouds_durham FROM breweries WHERE external_id = 'f5d75c6d-8d8a-439c-92f9-73edb3574aba';

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 2: Enrich brewery profiles
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── FULLSTEAM BREWERY ──────────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Durham''s flagship craft brewery, founded 2010 by Sean Lilly Wilson. Pioneering Southern-inspired beers using local grains, sweet potatoes, persimmons, and foraged ingredients. A Durham institution in the Central Park district with strong community roots.',
  phone = '9196829555',
  website_url = 'https://www.fullsteam.ag',
  hop_route_eligible = true,
  hop_route_offer = 'Free taster of any draft with HopTrack check-in',
  instagram_url = 'https://instagram.com/fullsteam',
  facebook_url = 'https://facebook.com/fullsteam',
  untappd_url = 'https://untappd.com/Fullsteam',
  twitter_url = 'https://x.com/fullsteam',
  latitude = 35.9874,
  longitude = -78.8936,
  vibe_tags = ARRAY['durham-icon', 'southern-inspired', 'local-ingredients', 'community', 'central-park', 'forager', 'pioneering']
WHERE id = id_fullsteam;

-- ── PONYSAURUS BREWING COMPANY ─────────────────────────────────────────────
UPDATE breweries SET
  description = 'Durham brewery and taproom known for clever, boundary-pushing beers and a gorgeous facility. Founded by Nick Hawthorne-Johnson and Keil Jansen. Their Yes Dear honey rye is an NC staple. Beer garden with full kitchen.',
  phone = '9198081804',
  website_url = 'https://www.ponysaurusbrewing.com',
  hop_route_eligible = true,
  hop_route_offer = '$1 off any pint with HopTrack check-in',
  instagram_url = 'https://instagram.com/ponysaurusbrewing',
  facebook_url = 'https://facebook.com/Ponysaurus',
  untappd_url = 'https://untappd.com/PonysaurusBrewing',
  twitter_url = 'https://x.com/ponysaurusbeer',
  latitude = 35.9897,
  longitude = -78.8920,
  vibe_tags = ARRAY['durham', 'clever', 'beer-garden', 'full-kitchen', 'design-forward', 'boundary-pushing', 'nc-staple']
WHERE id = id_ponysaurus;

-- ── BULL DURHAM BEER CO ────────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Craft brewery in Durham''s American Tobacco Campus. Named for the historic Bull Durham tobacco brand. Located in the former Lucky Strike water tower building overlooking Durham Bulls Athletic Park.',
  website_url = 'https://www.bulldurhambeers.com',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/bulldurhambeers',
  facebook_url = 'https://facebook.com/BullDurhamBeerCo',
  untappd_url = 'https://untappd.com/BullDurhamBeer',
  twitter_url = NULL,
  latitude = 35.9945,
  longitude = -78.9024,
  vibe_tags = ARRAY['american-tobacco-campus', 'historic', 'water-tower', 'baseball-adjacent', 'downtown-durham']
WHERE id = id_bull_durham;

-- ── BULL CITY BURGER AND BREWERY ───────────────────────────────────────────
UPDATE breweries SET
  description = 'Downtown Durham brewpub combining house-brewed beer with locally-sourced burgers. Known for their exotic meat burger specials and a solid rotating tap list. Community staple since 2011.',
  phone = '9196801440',
  website_url = 'https://www.bullcityburgerandbrewery.com',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/bullcityburger',
  facebook_url = 'https://facebook.com/bullcityburgerandbrewery',
  untappd_url = 'https://untappd.com/BullCityBurger',
  twitter_url = NULL,
  latitude = 35.9985,
  longitude = -78.8997,
  vibe_tags = ARRAY['downtown-durham', 'brewpub', 'burgers', 'locally-sourced', 'community-staple', 'exotic-meats']
WHERE id = id_bull_city;

-- ── BARREL CULTURE BREWING AND BLENDING ────────────────────────────────────
UPDATE breweries SET
  description = 'Mixed-fermentation brewery in south Durham focused exclusively on sour, wild, and barrel-aged beers. Small-batch and highly sought after. One of the most acclaimed sour breweries in the Southeast.',
  website_url = 'https://www.barrelculture.com',
  hop_route_eligible = true,
  hop_route_offer = 'Tasting flight discount with HopTrack check-in',
  instagram_url = 'https://instagram.com/barrelculture',
  facebook_url = 'https://facebook.com/barrelculturebrewing',
  untappd_url = 'https://untappd.com/BarrelCulture',
  twitter_url = NULL,
  latitude = 35.9436,
  longitude = -78.8825,
  vibe_tags = ARRAY['south-durham', 'sour-only', 'barrel-aged', 'wild-ales', 'mixed-fermentation', 'small-batch', 'highly-sought']
WHERE id = id_barrel_culture;

-- ── DURTY BULL BREWING CO ──────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Small-batch Durham brewery in the CCB/Golden Belt district. Known for creative one-offs and a laid-back neighborhood taproom. Focuses on bold stouts, IPAs, and experimental brews.',
  website_url = 'https://www.durtybullbrewing.com',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/durtybull',
  facebook_url = 'https://facebook.com/DurtyBull',
  untappd_url = 'https://untappd.com/DurtyBull',
  twitter_url = NULL,
  latitude = 35.9873,
  longitude = -78.8883,
  vibe_tags = ARRAY['golden-belt', 'small-batch', 'creative', 'neighborhood', 'laid-back', 'experimental']
WHERE id = id_durty_bull;

-- ── CLOUDS BREWING (Durham) ────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Full-service restaurant and brewery on West Main Street in Durham. Craft beer, elevated pub food, and a rooftop patio. Also has a Raleigh location.',
  website_url = 'https://www.cloudsbrewing.com',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/cloudsbrewing',
  facebook_url = 'https://facebook.com/CloudsBrewing',
  untappd_url = 'https://untappd.com/CloudsBrewing',
  twitter_url = NULL,
  latitude = 36.0004,
  longitude = -78.9092,
  vibe_tags = ARRAY['west-main', 'full-restaurant', 'rooftop-patio', 'pub-food', 'two-locations']
WHERE id = id_clouds_durham;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 3: Add beers
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── FULLSTEAM BREWERY ──────────────────────────────────────────────────────
INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(fs_01, id_fullsteam, 'Rocket Science', 'American IPA', 6.5, NULL, 'Flagship IPA with Citra and Simcoe hops. Citrusy and balanced.', true, true, 'beer', false),
(fs_02, id_fullsteam, 'Paycheck', 'Pilsner', 5.2, NULL, 'Crisp, clean pilsner. Their everyday working beer.', true, true, 'beer', false),
(fs_03, id_fullsteam, 'Humidity', 'Southern Wheat', 4.2, NULL, 'Southern-style wheat beer with local grain. Light and refreshing.', true, true, 'beer', false),
(fs_04, id_fullsteam, 'Carver', 'Sweet Potato Lager', 5.5, NULL, 'Lager brewed with North Carolina sweet potatoes. Unique and Southern.', true, true, 'beer', false),
(fs_05, id_fullsteam, 'Working Man''s Lunch', 'Cream Ale', 4.8, NULL, 'Easy-drinking cream ale. A Durham lunch staple.', true, true, 'beer', false),
(fs_06, id_fullsteam, 'El Toro', 'Cream Stout', 5.5, NULL, 'Smooth cream stout with coffee and chocolate notes.', true, true, 'beer', false),
(fs_07, id_fullsteam, 'First Frost', 'Persimmon Ale', 6.0, NULL, 'Fall ale brewed with local persimmons. A Fullsteam signature.', true, true, 'beer', true),
(fs_08, id_fullsteam, 'Summer Basil', 'Farmhouse Ale', 5.0, NULL, 'Farmhouse ale with fresh basil. Light and herbal.', true, true, 'beer', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── PONYSAURUS BREWING ─────────────────────────────────────────────────────
INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(ps_01, id_ponysaurus, 'Yes Dear', 'Honey Rye', 5.5, NULL, 'Flagship honey rye ale with local honey. An NC staple — smooth, malty, and sweet.', true, true, 'beer', false),
(ps_02, id_ponysaurus, 'Biere de Garde', 'Biere de Garde', 7.5, NULL, 'French-style farmhouse ale. Malty, complex, and cellar-worthy.', true, true, 'beer', false),
(ps_03, id_ponysaurus, 'Don''t Be Mean to People', 'Golden Ale', 4.5, NULL, 'Simple, crushable golden ale with a message.', true, true, 'beer', false),
(ps_04, id_ponysaurus, 'Galaxy Smasher', 'Hazy IPA', 7.0, NULL, 'DDH hazy IPA loaded with Galaxy hops. Tropical and dank.', true, true, 'beer', false),
(ps_05, id_ponysaurus, 'Pony Pils', 'German Pilsner', 5.0, NULL, 'Crisp German-style pilsner with noble hop character.', true, true, 'beer', false),
(ps_06, id_ponysaurus, 'Brilliant Disguise', 'Belgian Golden Strong', 8.0, NULL, 'Complex Belgian golden strong ale. Fruity esters and warming finish.', true, true, 'beer', true),
(ps_07, id_ponysaurus, 'Zephyr', 'Witbier', 4.5, NULL, 'Belgian wheat beer with coriander and citrus peel. Light and breezy.', true, true, 'beer', false),
(ps_08, id_ponysaurus, 'Common Struggle', 'California Common', 5.0, NULL, 'Lagered ale in the California common tradition. Smooth and toasty.', true, true, 'beer', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── BARREL CULTURE ─────────────────────────────────────────────────────────
INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(bc_01, id_barrel_culture, 'Spontaneous Series', 'Spontaneous Ale', 6.0, NULL, 'Spontaneously fermented ale aged in oak. Complex and funky.', true, true, 'beer', true),
(bc_02, id_barrel_culture, 'Fruited Sour', 'Fruited Sour', 5.5, NULL, 'Barrel-aged sour with rotating seasonal fruit additions.', true, true, 'beer', true),
(bc_03, id_barrel_culture, 'Flanders Red', 'Flanders Red Ale', 6.5, NULL, 'Traditional Flanders-style red ale aged in wine barrels.', true, true, 'beer', false),
(bc_04, id_barrel_culture, 'Brett Saison', 'Brett Saison', 6.0, NULL, 'Farmhouse saison with Brettanomyces funk and dry finish.', true, true, 'beer', false),
(bc_05, id_barrel_culture, 'Gose', 'Gose', 4.5, NULL, 'Salt-and-coriander gose with bright acidity.', true, true, 'beer', false),
(bc_06, id_barrel_culture, 'Wild IPA', 'Wild IPA', 7.0, NULL, 'IPA fermented with wild yeast. Funky and hop-forward.', true, true, 'beer', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ═══════════════════════════════════════════════════════════════════════════════
RAISE NOTICE '✅ Migration 117: Durham enrichment complete — 7 breweries, ~22 beers';
END $$;
