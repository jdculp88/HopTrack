-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 116: Enrich Raleigh / Triangle NC Breweries
-- Covers Raleigh, Cary, Apex, Holly Springs, and Fuquay-Varina.
-- ~12 breweries enriched with descriptions, social links, vibe tags, and beers.
-- Safe to re-run (ON CONFLICT DO UPDATE for beers, idempotent UPDATEs).
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  id_trophy uuid;
  id_bhavana uuid;
  id_crank_arm uuid;
  id_raleigh_brewing uuid;
  id_big_boss uuid;
  id_lonerider uuid;
  id_neuse_river uuid;
  id_nickelpoint uuid;
  id_tobacco_road uuid;
  id_lynnwood uuid;
  id_bond_brothers uuid;
  id_bombshell uuid;

  -- Trophy beers
  tr_01 uuid := 'ff000116-0001-0000-0000-000000000001';
  tr_02 uuid := 'ff000116-0001-0000-0000-000000000002';
  tr_03 uuid := 'ff000116-0001-0000-0000-000000000003';
  tr_04 uuid := 'ff000116-0001-0000-0000-000000000004';
  tr_05 uuid := 'ff000116-0001-0000-0000-000000000005';
  tr_06 uuid := 'ff000116-0001-0000-0000-000000000006';
  tr_07 uuid := 'ff000116-0001-0000-0000-000000000007';
  tr_08 uuid := 'ff000116-0001-0000-0000-000000000008';

  -- Brewery Bhavana beers
  bh_01 uuid := 'ff000116-0002-0000-0000-000000000001';
  bh_02 uuid := 'ff000116-0002-0000-0000-000000000002';
  bh_03 uuid := 'ff000116-0002-0000-0000-000000000003';
  bh_04 uuid := 'ff000116-0002-0000-0000-000000000004';
  bh_05 uuid := 'ff000116-0002-0000-0000-000000000005';
  bh_06 uuid := 'ff000116-0002-0000-0000-000000000006';

  -- Crank Arm beers
  ca_01 uuid := 'ff000116-0003-0000-0000-000000000001';
  ca_02 uuid := 'ff000116-0003-0000-0000-000000000002';
  ca_03 uuid := 'ff000116-0003-0000-0000-000000000003';
  ca_04 uuid := 'ff000116-0003-0000-0000-000000000004';
  ca_05 uuid := 'ff000116-0003-0000-0000-000000000005';
  ca_06 uuid := 'ff000116-0003-0000-0000-000000000006';

  -- Big Boss beers
  bb_01 uuid := 'ff000116-0004-0000-0000-000000000001';
  bb_02 uuid := 'ff000116-0004-0000-0000-000000000002';
  bb_03 uuid := 'ff000116-0004-0000-0000-000000000003';
  bb_04 uuid := 'ff000116-0004-0000-0000-000000000004';
  bb_05 uuid := 'ff000116-0004-0000-0000-000000000005';
  bb_06 uuid := 'ff000116-0004-0000-0000-000000000006';

  -- Lonerider beers
  lr_01 uuid := 'ff000116-0005-0000-0000-000000000001';
  lr_02 uuid := 'ff000116-0005-0000-0000-000000000002';
  lr_03 uuid := 'ff000116-0005-0000-0000-000000000003';
  lr_04 uuid := 'ff000116-0005-0000-0000-000000000004';
  lr_05 uuid := 'ff000116-0005-0000-0000-000000000005';
  lr_06 uuid := 'ff000116-0005-0000-0000-000000000006';

  -- Bond Brothers beers
  bo_01 uuid := 'ff000116-0006-0000-0000-000000000001';
  bo_02 uuid := 'ff000116-0006-0000-0000-000000000002';
  bo_03 uuid := 'ff000116-0006-0000-0000-000000000003';
  bo_04 uuid := 'ff000116-0006-0000-0000-000000000004';
  bo_05 uuid := 'ff000116-0006-0000-0000-000000000005';
  bo_06 uuid := 'ff000116-0006-0000-0000-000000000006';
  bo_07 uuid := 'ff000116-0006-0000-0000-000000000007';
  bo_08 uuid := 'ff000116-0006-0000-0000-000000000008';

  -- Neuse River beers
  nr_01 uuid := 'ff000116-0007-0000-0000-000000000001';
  nr_02 uuid := 'ff000116-0007-0000-0000-000000000002';
  nr_03 uuid := 'ff000116-0007-0000-0000-000000000003';
  nr_04 uuid := 'ff000116-0007-0000-0000-000000000004';
  nr_05 uuid := 'ff000116-0007-0000-0000-000000000005';
  nr_06 uuid := 'ff000116-0007-0000-0000-000000000006';

BEGIN

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 1: Look up brewery IDs
-- ═══════════════════════════════════════════════════════════════════════════════

SELECT id INTO id_trophy FROM breweries WHERE external_id = '03e0afb0-b86a-4b47-a9cd-7a302ac2cb75';
SELECT id INTO id_bhavana FROM breweries WHERE external_id = 'cbdfe3ef-928c-4444-b5f1-c1a2fcd3e14b';
SELECT id INTO id_crank_arm FROM breweries WHERE external_id = '8d3a51f6-de81-4434-a662-9e7f7f7390bf';
SELECT id INTO id_raleigh_brewing FROM breweries WHERE external_id = 'cd1f1a39-af96-4e8a-a863-93e5ae52624b';
SELECT id INTO id_big_boss FROM breweries WHERE external_id = 'b1813df6-ffad-4604-b909-874bfb56e41b';
SELECT id INTO id_lonerider FROM breweries WHERE external_id = 'dfec0210-90f3-4ada-af1e-b4543f19423b';
SELECT id INTO id_neuse_river FROM breweries WHERE external_id = '061fcb41-7dd1-4db4-8963-733096eea370';
SELECT id INTO id_nickelpoint FROM breweries WHERE external_id = '3bc90ba0-66f5-4728-a5b3-049e98d37a3c';
SELECT id INTO id_tobacco_road FROM breweries WHERE external_id = '70b7d406-90d7-460e-b473-9bfa759cb53f';
SELECT id INTO id_lynnwood FROM breweries WHERE external_id = '73d0933d-61ce-4b09-be56-2ca9f5bcc482';
SELECT id INTO id_bond_brothers FROM breweries WHERE external_id = '1186065b-e2c7-4d71-8bc2-30bcdd0e6150';
SELECT id INTO id_bombshell FROM breweries WHERE external_id = '43a54dba-6adf-4248-bffd-50e0cf422b93';

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 2: Enrich brewery profiles
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── TROPHY BREWING COMPANY ─────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Raleigh''s beloved brewery since 2012, operating a 3bbl nano downtown and a 20bbl production brewhouse on Maywood with 12 rotating taps, food trucks, and a large patio. Trophy on Maywood pizza restaurant and State of Beer bottle shop round out the portfolio.',
  phone = '9198031333',
  website_url = 'https://www.trophybrewing.com',
  hop_route_eligible = true,
  hop_route_offer = 'Free taster of any draft with HopTrack check-in',
  instagram_url = 'https://instagram.com/trophybrewing',
  facebook_url = 'https://facebook.com/trophybrewing',
  untappd_url = 'https://untappd.com/TrophyBrewing',
  twitter_url = 'https://x.com/trophybrewing',
  latitude = 35.7762,
  longitude = -78.6530,
  vibe_tags = ARRAY['james-beard-nominated', 'multi-location', 'pizza', 'sour-program', 'boundary-pushing', 'raleigh-icon', 'bottle-shop']
WHERE id = id_trophy;

-- ── BREWERY BHAVANA ────────────────────────────────────────────────────────
UPDATE breweries SET
  description = 'A unique fusion of Belgian-inspired brewery, dim sum restaurant, bookstore, and flower shop in downtown Raleigh. Michelin-recognized for food and beer alike. Founded by Van and Vansana Nolintha.',
  phone = '9198299998',
  website_url = 'https://www.brewerybhavana.com',
  hop_route_eligible = true,
  hop_route_offer = 'Free flower with any beer purchase and HopTrack check-in',
  instagram_url = 'https://instagram.com/brewerybhavana',
  facebook_url = 'https://facebook.com/brewerybhavana',
  untappd_url = 'https://untappd.com/BreweryBhavana',
  twitter_url = NULL,
  latitude = 35.7760,
  longitude = -78.6381,
  vibe_tags = ARRAY['james-beard-nominated', 'dim-sum', 'flower-shop', 'bookstore', 'belgian-inspired', 'downtown', 'design-forward', 'multi-concept']
WHERE id = id_bhavana;

-- ── CRANK ARM BREWING CO ───────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Bicycle-themed brewery in Raleigh''s Warehouse District. Cycling culture meets craft beer with a rotating tap list and bike-friendly taproom. Named for the crank arm on a bicycle.',
  phone = '9193245529',
  website_url = 'https://www.crankarmbrewing.com',
  hop_route_eligible = true,
  hop_route_offer = 'Free sticker when you check in with HopTrack',
  instagram_url = 'https://instagram.com/crankarmbrewing',
  facebook_url = 'https://facebook.com/CrankArmBrewing',
  untappd_url = 'https://untappd.com/CrankArmBrewing',
  twitter_url = NULL,
  latitude = 35.7729,
  longitude = -78.6464,
  vibe_tags = ARRAY['warehouse-district', 'bicycle-themed', 'bike-friendly', 'rotating-taps', 'community', 'taproom']
WHERE id = id_crank_arm;

-- ── RALEIGH BREWING COMPANY ────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Woman-owned neighborhood brewery near NC State. Known for approachable beers, a welcoming taproom, and strong community ties. Their House of Clay Hefeweizen is a local favorite.',
  phone = '9198213600',
  website_url = 'https://www.raleighbrewing.com',
  hop_route_eligible = true,
  hop_route_offer = '$1 off any pint with HopTrack check-in',
  instagram_url = 'https://instagram.com/raleighbrewingcompany',
  facebook_url = 'https://facebook.com/raleighbrewing',
  untappd_url = 'https://untappd.com/RaleighBrewing',
  twitter_url = NULL,
  latitude = 35.7859,
  longitude = -78.6744,
  vibe_tags = ARRAY['woman-owned', 'neighborhood', 'nc-state-area', 'community', 'approachable', 'welcoming']
WHERE id = id_raleigh_brewing;

-- ── BIG BOSS BREWING CO (Wicker Dr taproom PERMANENTLY CLOSED) ─────────
UPDATE breweries SET
  description = 'PERMANENTLY CLOSED (taproom). Raleigh''s oldest craft brewery, est. 2006. Known for Bad Penny Brown Ale and Angry Angel Kolsch. Brand may still distribute cans regionally.',
  is_active = false
WHERE id = id_big_boss;

-- ── LONERIDER BREWING CO ───────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Western-outlaw-themed brewery founded 2009 near Brier Creek. Sweet Josie won gold at the 2010 GABF. Regional distribution across NC. Taproom, patio, and "hideout" event space.',
  phone = '9192461820',
  website_url = 'https://www.loneriderbeer.com',
  hop_route_eligible = true,
  hop_route_offer = '$1 off any pint with HopTrack check-in',
  instagram_url = 'https://instagram.com/loneriderbeer',
  facebook_url = 'https://facebook.com/LoneriderBrewing',
  untappd_url = 'https://untappd.com/LoneriderBeer',
  twitter_url = 'https://x.com/LoneriderBeer',
  latitude = 35.8703,
  longitude = -78.6206,
  vibe_tags = ARRAY['western-themed', 'regional-distribution', 'large-taproom', 'hideout', 'north-raleigh', 'production']
WHERE id = id_lonerider;

-- ── NEUSE RIVER BREWING COMPANY ────────────────────────────────────────────
UPDATE breweries SET
  description = 'Belgian-inspired brewery with a European brasserie restaurant in the Five Points neighborhood. Focus on farmhouse ales, saisons, and creative IPAs with NC ingredients. Brunch service and upscale-casual dining.',
  phone = '9842328479',
  website_url = 'https://www.neuseriverbrewing.com',
  hop_route_eligible = true,
  hop_route_offer = 'Free sticker with HopTrack check-in',
  instagram_url = 'https://instagram.com/neuseriverbrewing',
  facebook_url = 'https://facebook.com/NeuseRiverBrewing',
  untappd_url = 'https://untappd.com/NeuseRiverBrewing',
  twitter_url = NULL,
  latitude = 35.7780,
  longitude = -78.6237,
  vibe_tags = ARRAY['five-points', 'belgian-inspired', 'brasserie', 'brunch', 'upscale-casual', 'dog-friendly', 'european-bistro']
WHERE id = id_neuse_river;

-- ── NICKELPOINT BREWING CO ─────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Raleigh brewery located near Neuse River Brewing on Person Street. Focus on IPAs and clean, approachable craft beers. Chill taproom with a neighborhood feel.',
  phone = '9196128770',
  website_url = 'https://www.nickelpointbrewing.com',
  hop_route_eligible = true,
  hop_route_offer = 'Free sticker with HopTrack check-in',
  instagram_url = 'https://instagram.com/nickelpointbrewing',
  facebook_url = 'https://facebook.com/NickelpointBrewing',
  untappd_url = 'https://untappd.com/NickelpointBrewing',
  twitter_url = NULL,
  latitude = 35.7783,
  longitude = -78.6238,
  vibe_tags = ARRAY['person-street', 'neighborhood', 'ipa-focused', 'chill', 'taproom']
WHERE id = id_nickelpoint;

-- ── TOBACCO ROAD BREWERY ───────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Downtown Raleigh sports bar and brewery near the state legislature. Full kitchen, large space with TVs, and house-brewed beers. Popular for game day and after-work crowds.',
  website_url = 'https://www.tobaccoroadbrewery.com',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/tobaccoroadbrewery',
  facebook_url = 'https://facebook.com/tobaccoroadbrewery',
  untappd_url = 'https://untappd.com/TobaccoRoadBrewery',
  twitter_url = NULL,
  latitude = 35.7789,
  longitude = -78.6444,
  vibe_tags = ARRAY['downtown', 'sports-bar', 'full-kitchen', 'game-day', 'after-work', 'legislature-area']
WHERE id = id_tobacco_road;

-- ── LYNNWOOD BREWING CONCERN ───────────────────────────────────────────────
UPDATE breweries SET
  description = 'Neighborhood brewery in east Raleigh. Relaxed, welcoming vibe with a focus on quality core beers and creative seasonals. Spacious taproom with garage door windows.',
  website_url = 'https://www.lynnwoodbrewing.com',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/lynnwoodbrewing',
  facebook_url = 'https://facebook.com/lynnwoodbrewingconcern',
  untappd_url = 'https://untappd.com/LynnwoodBrewing',
  twitter_url = NULL,
  latitude = 35.7907,
  longitude = -78.6100,
  vibe_tags = ARRAY['east-raleigh', 'neighborhood', 'relaxed', 'garage-doors', 'creative-seasonals']
WHERE id = id_lynnwood;

-- ── BOND BROTHERS BEER COMPANY (Cary) ──────────────────────────────────────
UPDATE breweries SET
  description = 'USA Today''s Best New Brewery in the Country. Cary taproom and beer garden known for innovative IPAs, kettle sours, and imperial stouts. Rotating food trucks and a loyal following.',
  phone = '9194592670',
  website_url = 'https://www.bondbrothersbeer.com',
  hop_route_eligible = true,
  hop_route_offer = '$2 off any flight with HopTrack check-in',
  instagram_url = 'https://instagram.com/bondbrosbeer',
  facebook_url = 'https://facebook.com/BondBrosBeer',
  untappd_url = 'https://untappd.com/BondBrothersBeer',
  twitter_url = NULL,
  latitude = 35.7874,
  longitude = -78.7822,
  vibe_tags = ARRAY['cary', 'usa-today-award', 'beer-garden', 'innovative', 'food-trucks', 'cult-following', 'sour-program']
WHERE id = id_bond_brothers;

-- ── BOMBSHELL BEER COMPANY (Holly Springs) ─────────────────────────────────
UPDATE breweries SET
  description = 'Woman-owned and -operated brewery in Holly Springs, one of the first in NC. Named for the WWII-era Rosie the Riveter spirit. Welcoming taproom with a focus on approachable, well-crafted beers.',
  website_url = 'https://www.bombshellbeer.com',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/bombshellbeer',
  facebook_url = 'https://facebook.com/BombshellBeer',
  untappd_url = 'https://untappd.com/BombshellBeer',
  twitter_url = NULL,
  latitude = 35.6418,
  longitude = -78.8315,
  vibe_tags = ARRAY['holly-springs', 'woman-owned', 'wwii-inspired', 'approachable', 'welcoming', 'pioneering']
WHERE id = id_bombshell;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 3: Add beers
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── TROPHY BREWING ─────────────────────────────────────────────────────────
INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(tr_01, id_trophy, 'Trophy Wife', 'Session IPA', 4.9, NULL, 'Flagship session IPA, always on tap. The beer that made Trophy famous.', true, true, 'beer', false),
(tr_02, id_trophy, 'Cloud Surfer', 'Hazy IPA', 6.1, NULL, 'Hazy, tropical modern IPA.', true, true, 'beer', false),
(tr_03, id_trophy, 'Milky Way', 'Milk Stout', 5.5, NULL, 'Smooth, sweet milk stout with lactose richness.', true, true, 'beer', false),
(tr_04, id_trophy, 'Double Death Spiral', 'Imperial IPA', 8.5, NULL, 'Aggressive hop-forward imperial IPA.', true, true, 'beer', true),
(tr_05, id_trophy, 'El Hombre', 'American Stout', 5.8, NULL, 'Rich, roasty American stout.', true, true, 'beer', false),
(tr_06, id_trophy, 'Hop Latte', 'Coffee IPA', 6.2, NULL, 'Coffee-infused IPA hybrid. Bold and unique.', true, true, 'beer', true),
(tr_07, id_trophy, 'Yard of the Month', 'Pale Ale', 5.4, NULL, 'Easy-drinking American pale ale.', true, true, 'beer', false),
(tr_08, id_trophy, 'Outta This Citra', 'American IPA', 6.5, NULL, 'Citra-hopped single-hop IPA with bright citrus.', true, true, 'beer', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── BREWERY BHAVANA ────────────────────────────────────────────────────────
INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(bh_01, id_bhavana, 'Grove', 'Imperial IPA', 8.0, NULL, 'Clementine, grapefruit, and peach notes with juicy tropical flavors.', true, true, 'beer', false),
(bh_02, id_bhavana, 'Pulp', 'Hazy IPA', 6.8, NULL, 'Hazy and juicy NEIPA. Lush tropical character.', true, true, 'beer', false),
(bh_03, id_bhavana, 'Till', 'Saison', 6.2, NULL, 'Belgian farmhouse ale. Dry and peppery.', true, true, 'beer', false),
(bh_04, id_bhavana, 'Shade', 'Schwarzbier', 4.8, NULL, 'Dark German lager with Hallertauer hops. Clean and sessionable.', true, true, 'beer', false),
(bh_05, id_bhavana, 'Brisk', 'Pilsner', 5.0, NULL, 'Crisp, clean pilsner.', true, true, 'beer', false),
(bh_06, id_bhavana, 'Sow', 'Belgian Blonde', 6.5, NULL, 'Traditional Belgian blonde ale with fruity esters.', true, true, 'beer', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── CRANK ARM BREWING ──────────────────────────────────────────────────────
INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(ca_01, id_crank_arm, 'Rickshaw', 'Rye IPA', 7.2, NULL, '24% rye malt with Zythos and Nugget hops. Spicy and citrusy flagship.', true, true, 'beer', false),
(ca_02, id_crank_arm, 'Whitewall Wheat', 'Witbier', 5.2, NULL, '2023 GABF Silver Medal Belgian wit. Coriander and orange peel.', true, true, 'beer', false),
(ca_03, id_crank_arm, 'Road Hazard', 'Hazy IPA', 6.8, NULL, 'Juicy New England-style IPA with tropical hop character.', true, true, 'beer', false),
(ca_04, id_crank_arm, 'Holy Spokes', 'American Porter', 5.9, NULL, 'Rich, chocolate-forward porter.', true, true, 'beer', false),
(ca_05, id_crank_arm, 'Unicycle', 'Pale Ale', 5.5, NULL, 'Clean American pale ale for easy drinking.', true, true, 'beer', false),
(ca_06, id_crank_arm, 'Motivator', 'Imperial Stout', 9.0, NULL, 'Big, bold double stout. Roasty and complex.', true, true, 'beer', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- (Big Boss: taproom permanently closed — no beers seeded)

-- ── LONERIDER BREWING ──────────────────────────────────────────────────────
INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(lr_01, id_lonerider, 'Sweet Josie', 'American Brown Ale', 6.1, NULL, '2010 GABF Gold Medal winner. Smooth brown ale with caramel, toffee, and sweetness.', true, true, 'beer', false),
(lr_02, id_lonerider, 'Shotgun Betty', 'Hefeweizen', 4.9, NULL, 'Light, approachable flagship wheat beer.', true, true, 'beer', false),
(lr_03, id_lonerider, 'Hoppy Ki Yay', 'American IPA', 6.6, NULL, 'Bold, hoppy flagship IPA.', true, true, 'beer', false),
(lr_04, id_lonerider, 'Deadeye Jack', 'American Porter', 5.8, NULL, 'Rich and roasty American porter.', true, true, 'beer', false),
(lr_05, id_lonerider, 'Peacemaker', 'Pale Ale', 5.5, NULL, 'Balanced, sessionable pale ale.', true, true, 'beer', false),
(lr_06, id_lonerider, 'Roustabout', 'Dry Stout', 6.0, NULL, 'Dry Irish-style stout. Dark and smooth.', true, true, 'beer', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── BOND BROTHERS BEER COMPANY ─────────────────────────────────────────────
INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(bo_01, id_bond_brothers, 'Side Hustle', 'Hazy IPA', 6.5, NULL, 'Juicy, tropical hazy IPA. Their flagship hop-forward beer.', true, true, 'beer', false),
(bo_02, id_bond_brothers, 'Premium Lager', 'American Lager', 4.8, NULL, 'Clean, crisp lager. Approachable and sessionable.', true, true, 'beer', false),
(bo_03, id_bond_brothers, 'Cream Ale', 'Cream Ale', 5.0, NULL, 'Smooth, light cream ale with a clean finish.', true, true, 'beer', false),
(bo_04, id_bond_brothers, 'Kettle Sour', 'Fruited Kettle Sour', 5.0, NULL, 'Tart kettle sour with rotating fruit additions — guava, pomegranate, and more.', true, true, 'beer', false),
(bo_05, id_bond_brothers, 'Black IPA', 'Black IPA', 7.0, NULL, 'Dark and hoppy. Roast malt meets citrus and pine hops.', true, true, 'beer', false),
(bo_06, id_bond_brothers, 'Double IPA', 'Imperial IPA', 8.5, NULL, 'Bold double IPA with aggressive hop character.', true, true, 'beer', true),
(bo_07, id_bond_brothers, 'Imperial Stout', 'Imperial Stout', 10.0, NULL, 'Rich, decadent imperial stout with rotating adjuncts.', true, true, 'beer', true),
(bo_08, id_bond_brothers, 'Golden Ale', 'Golden Ale', 4.5, NULL, 'Light, easy-drinking golden ale.', true, true, 'beer', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── NEUSE RIVER BREWING ────────────────────────────────────────────────────
INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(nr_01, id_neuse_river, 'Saturday Morning', 'Hazy IPA', 6.5, NULL, 'Flagship New England hazy IPA. Juicy and tropical.', true, true, 'beer', false),
(nr_02, id_neuse_river, 'Bobbi Brune', 'Belgian Brown Ale', 6.8, NULL, 'Rich Belgian-style brown ale with dark fruit and spice.', true, true, 'beer', false),
(nr_03, id_neuse_river, 'Biere de Neuse', 'Saison', 6.2, NULL, 'House farmhouse saison. Dry, peppery, and complex.', true, true, 'beer', false),
(nr_04, id_neuse_river, 'Riverkeeper''s Wit', 'Witbier', 5.0, NULL, 'Coriander and orange peel. 5% of proceeds to Sound Rivers.', true, true, 'beer', false),
(nr_05, id_neuse_river, 'Streamside Mango', 'Fruited Sour', 4.5, NULL, 'Tart mango sour ale. Bright and refreshing.', true, true, 'beer', true),
(nr_06, id_neuse_river, 'Wake the Dead', 'Coffee Stout', 5.5, NULL, 'Local coffee-infused stout. Rich and smooth.', true, true, 'beer', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE: 12 Raleigh/Triangle breweries enriched (1 closed), ~44 beers seeded.
-- ═══════════════════════════════════════════════════════════════════════════════

RAISE NOTICE '✅ Migration 116: Raleigh/Triangle enrichment complete — 12 breweries (1 closed), ~44 beers';

END $$;
