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
  description = 'Southern-rooted production brewery pioneering Distinctly Southern Beer with local farmed goods, heirloom grains, and seasonal botanicals. First Regenified brewery with over $1M in local farm spending. Founded 2010 by Sean Lilly Wilson. Building out permanent "forever home" at American Tobacco Campus.',
  phone = '9194382337',
  website_url = 'https://www.fullsteam.ag',
  hop_route_eligible = true,
  hop_route_offer = 'Free taster of any draft with HopTrack check-in',
  instagram_url = 'https://instagram.com/fullsteambrewery',
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
  phone = '9199080204',
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

-- ── BARREL CULTURE BREWING AND BLENDING (PERMANENTLY CLOSED Jan 2023) ───
UPDATE breweries SET
  description = 'PERMANENTLY CLOSED (January 2023). Was a 100% oak-fermented, fruit-driven mixed-fermentation brewery with 18 taps, known for imaginative sour ales. Operated for 5 years in south Durham.',
  is_active = false
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
(fs_01, id_fullsteam, 'Rocket Science', 'American IPA', 6.8, NULL, 'Flagship IPA with bold hop character. A Durham staple.', true, true, 'beer', false),
(fs_02, id_fullsteam, 'Paycheck', 'Czech Pilsner', 4.5, NULL, 'Southern-sourced pilsner with local barley and corn. 2019 US Beer Open Gold.', true, true, 'beer', false),
(fs_03, id_fullsteam, 'Humidity', 'Hazy IPA', 6.5, NULL, 'Tropical, juicy, haze-forward IPA. Sunny and bright.', true, true, 'beer', false),
(fs_04, id_fullsteam, 'Hogwash', 'Smoked Porter', 8.0, NULL, 'Hickory-smoked porter with locally roasted coffee and toasted malts.', true, true, 'beer', false),
(fs_05, id_fullsteam, 'Lucky''s Lager', 'Czech Amber Lager', 5.0, NULL, 'Toasty Euro-style lager inspired by Durham''s manufacturing heritage.', true, true, 'beer', false),
(fs_06, id_fullsteam, 'Southern Basil', 'Farmhouse Ale', 5.0, NULL, 'Basil farmhouse ale. 2019 Good Food Award winner.', true, true, 'beer', true),
(fs_07, id_fullsteam, 'First Frost', 'Persimmon Ale', 9.9, NULL, 'Foraged-persimmon winter seasonal. Complex and strong. A Fullsteam signature.', true, true, 'beer', true),
(fs_08, id_fullsteam, 'Coffee is for Closers', 'Coffee Stout', 6.0, NULL, 'Seasonal stout brewed with locally roasted coffee.', true, true, 'beer', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── PONYSAURUS BREWING ─────────────────────────────────────────────────────
INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(ps_01, id_ponysaurus, 'Biere de Garde', 'Farmhouse Ale', 6.3, NULL, 'French-style farmhouse with barley, wheat, rye, oats. Apple, pear, and vanilla aromas.', true, true, 'beer', false),
(ps_02, id_ponysaurus, 'IPA', 'American IPA', 6.5, NULL, 'Crisp citrus bouquet with grapefruit rind, melon, tangerine, and passion fruit.', true, true, 'beer', false),
(ps_03, id_ponysaurus, 'Scottish Ale', 'Scottish Ale', 7.2, NULL, 'Rich, smooth, malt-forward with caramel, coffee, and chocolate notes.', true, true, 'beer', false),
(ps_04, id_ponysaurus, 'White IPA', 'White IPA', 6.0, NULL, 'Belgian Wit meets American IPA — lemongrass, orange peel, tropical fruit.', true, true, 'beer', false),
(ps_05, id_ponysaurus, 'Pilsner', 'German Pilsner', 4.8, NULL, 'Clean, crisp, traditional German-style lager.', true, true, 'beer', false),
(ps_06, id_ponysaurus, 'Don''t Be Mean to People', 'Barrel-Aged Saison', 7.5, NULL, 'Golden Rule Saison with plum and Brett, nearly 5 years in barrel.', true, true, 'beer', true),
(ps_07, id_ponysaurus, 'Dubbel', 'Belgian Dubbel', 7.0, NULL, 'Rich dark fruit and spice in classic Belgian style.', true, true, 'beer', false),
(ps_08, id_ponysaurus, 'Weissbier', 'Hefeweizen', 5.2, NULL, 'Classic Bavarian wheat with banana and clove.', true, true, 'beer', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- (Barrel Culture: permanently closed Jan 2023 — no beers seeded)

-- ═══════════════════════════════════════════════════════════════════════════════
RAISE NOTICE '✅ Migration 117: Durham enrichment complete — 7 breweries (1 closed), ~16 beers';
END $$;
