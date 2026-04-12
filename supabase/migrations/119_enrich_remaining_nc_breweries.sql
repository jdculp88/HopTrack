-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 119: Enrich Remaining NC Breweries
-- Covers Greensboro, Winston-Salem, Boone, Morganton, Brevard.
-- ~12 breweries enriched. Marks HOOTS (Winston-Salem) as closed.
-- Safe to re-run (ON CONFLICT DO UPDATE for beers, idempotent UPDATEs).
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  -- Greensboro
  id_joymongers uuid;
  id_pig_pounder uuid;
  id_little_brother uuid;
  id_preyer uuid;
  -- Winston-Salem
  id_foothills uuid;
  id_hoots uuid;
  -- Boone
  id_ambrewery uuid;
  id_lost_province uuid;
  -- Morganton
  id_catawba uuid;
  id_fonta_flora uuid;
  -- Brevard
  id_brevard_brewing uuid;
  id_oskar_blues uuid;

  -- Foothills beers
  fh_01 uuid := 'ff000119-0001-0000-0000-000000000001';
  fh_02 uuid := 'ff000119-0001-0000-0000-000000000002';
  fh_03 uuid := 'ff000119-0001-0000-0000-000000000003';
  fh_04 uuid := 'ff000119-0001-0000-0000-000000000004';
  fh_05 uuid := 'ff000119-0001-0000-0000-000000000005';
  fh_06 uuid := 'ff000119-0001-0000-0000-000000000006';
  fh_07 uuid := 'ff000119-0001-0000-0000-000000000007';
  fh_08 uuid := 'ff000119-0001-0000-0000-000000000008';

  -- Fonta Flora beers
  ff_01 uuid := 'ff000119-0002-0000-0000-000000000001';
  ff_02 uuid := 'ff000119-0002-0000-0000-000000000002';
  ff_03 uuid := 'ff000119-0002-0000-0000-000000000003';
  ff_04 uuid := 'ff000119-0002-0000-0000-000000000004';
  ff_05 uuid := 'ff000119-0002-0000-0000-000000000005';
  ff_06 uuid := 'ff000119-0002-0000-0000-000000000006';
  ff_07 uuid := 'ff000119-0002-0000-0000-000000000007';
  ff_08 uuid := 'ff000119-0002-0000-0000-000000000008';

  -- Catawba beers
  cw_01 uuid := 'ff000119-0003-0000-0000-000000000001';
  cw_02 uuid := 'ff000119-0003-0000-0000-000000000002';
  cw_03 uuid := 'ff000119-0003-0000-0000-000000000003';
  cw_04 uuid := 'ff000119-0003-0000-0000-000000000004';
  cw_05 uuid := 'ff000119-0003-0000-0000-000000000005';
  cw_06 uuid := 'ff000119-0003-0000-0000-000000000006';

  -- Joymongers beers
  jm_01 uuid := 'ff000119-0004-0000-0000-000000000001';
  jm_02 uuid := 'ff000119-0004-0000-0000-000000000002';
  jm_03 uuid := 'ff000119-0004-0000-0000-000000000003';
  jm_04 uuid := 'ff000119-0004-0000-0000-000000000004';
  jm_05 uuid := 'ff000119-0004-0000-0000-000000000005';
  jm_06 uuid := 'ff000119-0004-0000-0000-000000000006';

  -- AMB beers
  am_01 uuid := 'ff000119-0005-0000-0000-000000000001';
  am_02 uuid := 'ff000119-0005-0000-0000-000000000002';
  am_03 uuid := 'ff000119-0005-0000-0000-000000000003';
  am_04 uuid := 'ff000119-0005-0000-0000-000000000004';
  am_05 uuid := 'ff000119-0005-0000-0000-000000000005';
  am_06 uuid := 'ff000119-0005-0000-0000-000000000006';

BEGIN

SELECT id INTO id_joymongers FROM breweries WHERE external_id = '7fadcb6d-a145-4f04-8e86-afceff597e81';
SELECT id INTO id_pig_pounder FROM breweries WHERE external_id = '86e9610f-9d70-45d5-a43a-cdf824923728';
SELECT id INTO id_little_brother FROM breweries WHERE external_id = 'cd5ef38d-235e-4318-931a-defea9b4296a';
SELECT id INTO id_preyer FROM breweries WHERE external_id = '21dd64a1-c254-4c35-a7b7-f909b88c8d10';
SELECT id INTO id_foothills FROM breweries WHERE external_id = 'd9bbc65e-3c8c-4dd6-8489-e16a8fd46888';
SELECT id INTO id_hoots FROM breweries WHERE external_id = 'c4ce5349-c572-4c37-99a6-e670199d46bf';
SELECT id INTO id_ambrewery FROM breweries WHERE external_id = '5b127f6a-3364-4588-b5ad-f7953fc6ee54';
SELECT id INTO id_lost_province FROM breweries WHERE external_id = '8dffaa96-db92-45c9-a0d7-3cd2b8686f42';
SELECT id INTO id_catawba FROM breweries WHERE external_id = '3b1a5b42-5517-4da1-b1ee-93b3e3bce99d';
SELECT id INTO id_fonta_flora FROM breweries WHERE external_id = '4ef2a5c4-c562-4405-acd7-c57dd4d2d6ac';
SELECT id INTO id_brevard_brewing FROM breweries WHERE external_id = 'd2bbcb0a-59a1-481e-886a-df2a0decbbc8';
SELECT id INTO id_oskar_blues FROM breweries WHERE external_id = 'b3b08e37-95c0-4756-9ad5-2a6388705534';

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 2: Enrich brewery profiles
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── GREENSBORO ─────────────────────────────────────────────────────────────

UPDATE breweries SET
  description = 'Family-owned Greensboro brewery offering up to 17 craft brews on tap in a huge, rotating selection. Opened July 2016. Garage-door taproom vibe with separate Barrel Hall for sour and barrel-aged releases.',
  phone = '3367635255',
  website_url = 'https://www.joymongers.com',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/joymongersbeer',
  facebook_url = 'https://facebook.com/JoymongersBrewingCo',
  untappd_url = 'https://untappd.com/JoymongersBrewingCo',
  latitude = 36.0780, longitude = -79.7918,
  vibe_tags = ARRAY['downtown-greensboro', 'family-owned', 'garage-doors', 'barrel-hall', 'huge-selection', 'rotating-taps']
WHERE id = id_joymongers;

UPDATE breweries SET
  description = 'Award-winning Greensboro brewery specializing in authentic UK-style beers — ESBs, bitters, milk stouts — alongside bold IPAs and creative innovations. Graffiti-mural walls and a great outdoor pavilion.',
  phone = '3365531290',
  website_url = 'https://www.pigpounder.com',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/pigpounder',
  facebook_url = 'https://facebook.com/pigpounder',
  untappd_url = 'https://untappd.com/PigPounder',
  latitude = 36.0657, longitude = -79.8099,
  vibe_tags = ARRAY['uk-style', 'esb', 'graffiti-murals', 'pavilion', 'food-trucks', 'award-winning']
WHERE id = id_pig_pounder;

UPDATE breweries SET
  description = 'Small-batch Greensboro brewery focused on hop-forward IPAs and creative adjunct stouts. Intimate taproom with a local, neighborhood feel.',
  website_url = 'https://www.littlebrotherbrewing.com',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/littlebrotherbrewing',
  facebook_url = 'https://facebook.com/LittleBrotherBrewing',
  untappd_url = 'https://untappd.com/LittleBrotherBrewing',
  latitude = 36.0734, longitude = -79.7887,
  vibe_tags = ARRAY['greensboro', 'small-batch', 'hop-forward', 'neighborhood', 'intimate']
WHERE id = id_little_brother;

UPDATE breweries SET
  description = 'Greensboro brewery with a focus on Belgian-inspired and farmhouse ales. Named for Greensboro''s early settler heritage. Cozy taproom with a warm community atmosphere.',
  website_url = 'https://www.preyerbrewing.com',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/preyerbrewing',
  facebook_url = 'https://facebook.com/PreyerBrewing',
  untappd_url = 'https://untappd.com/PreyerBrewing',
  latitude = 36.0705, longitude = -79.7907,
  vibe_tags = ARRAY['greensboro', 'belgian-inspired', 'farmhouse', 'cozy', 'community']
WHERE id = id_preyer;

-- ── WINSTON-SALEM ──────────────────────────────────────────────────────────

UPDATE breweries SET
  description = 'One of the largest regional craft breweries in the Southeast, founded 2005 in Winston-Salem. Spearheaded the modern craft beer movement in the Triad. Known for Sexual Chocolate Imperial Stout, Hoppyum IPA, and People''s Porter. Downtown brewpub plus separate tasting room.',
  phone = '3367773348',
  website_url = 'https://www.foothillsbrewing.com',
  hop_route_eligible = true,
  hop_route_offer = 'Free taster of any draft with HopTrack check-in',
  instagram_url = 'https://instagram.com/foothillsbrewing',
  facebook_url = 'https://facebook.com/FoothillsBrewing',
  untappd_url = 'https://untappd.com/FoothillsBrewing',
  latitude = 36.0984, longitude = -80.2477,
  vibe_tags = ARRAY['downtown-ws', 'regional', 'triad-pioneer', 'sexual-chocolate', 'brewpub', 'full-restaurant', 'tasting-room']
WHERE id = id_foothills;

-- Mark HOOTS as closed
UPDATE breweries SET
  is_active = false,
  description = 'PERMANENTLY CLOSED (September 2025). Was Winston-Salem''s 2nd brewery, founded 2013. Transitioned to a bar and live music venue before closing.'
WHERE id = id_hoots;

-- ── BOONE ──────────────────────────────────────────────────────────────────

UPDATE breweries SET
  description = 'First brewery in Boone, opened 2013. Award-winning beers and ciders with a Farm to Flame food truck. US Open Beer Championship gold for Boone Creek Blonde. Popular with Appalachian State students and mountain visitors.',
  phone = '8282631111',
  website_url = 'https://www.amb.beer',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/ambrewery',
  facebook_url = 'https://facebook.com/appalachianmountain.brewery',
  untappd_url = 'https://untappd.com/AppalachianMountainBrewery',
  latitude = 36.2098, longitude = -81.6795,
  vibe_tags = ARRAY['boone', 'mountain', 'first-in-boone', 'food-truck', 'app-state', 'award-winning', 'cidery']
WHERE id = id_ambrewery;

UPDATE breweries SET
  description = 'Mountain brewpub in downtown Boone with wood-fired pizza and craft beer. Known for creative, Appalachian-inspired beers and a vibrant atmosphere near App State campus.',
  website_url = 'https://www.lostprovince.com',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/lostprovince',
  facebook_url = 'https://facebook.com/LostProvince',
  untappd_url = 'https://untappd.com/LostProvinceBrewing',
  latitude = 36.2164, longitude = -81.6751,
  vibe_tags = ARRAY['boone', 'downtown', 'wood-fired-pizza', 'brewpub', 'appalachian', 'app-state-area']
WHERE id = id_lost_province;

-- ── MORGANTON ──────────────────────────────────────────────────────────────

UPDATE breweries SET
  description = 'Family-owned NC brewery headquartered in the foothills town of Morganton. Multiple taprooms across NC (Asheville, Charlotte). Known for White Zombie Belgian Wit and Endless Trail Pilsner. One of NC''s most distributed craft breweries.',
  phone = '8284306883',
  website_url = 'https://www.catawbabrewing.com',
  hop_route_eligible = true,
  hop_route_offer = 'Free sticker with HopTrack check-in',
  instagram_url = 'https://instagram.com/catawbabrewing',
  facebook_url = 'https://facebook.com/CatawbaBrewing',
  untappd_url = 'https://untappd.com/CatawbaBrewing',
  latitude = 35.7454, longitude = -81.6876,
  vibe_tags = ARRAY['morganton', 'family-owned', 'multi-location', 'regional-distribution', 'foothills', 'white-zombie']
WHERE id = id_catawba;

UPDATE breweries SET
  description = 'Acclaimed farmhouse brewery in Morganton led by creative mastermind Todd Boera. Brews with 90%+ local Appalachian grains and foraged ingredients. MegaFlora Super Saison is legendary. Turned Morganton into a craft beer destination for 17,000+ visitors per year.',
  website_url = 'https://www.fontaflora.com',
  hop_route_eligible = true,
  hop_route_offer = 'Free taster of any farmhouse ale with HopTrack check-in',
  instagram_url = 'https://instagram.com/fontaflorabrewery',
  facebook_url = 'https://facebook.com/FontaFloraBrewery',
  untappd_url = 'https://untappd.com/FontaFlora',
  latitude = 35.7472, longitude = -81.6866,
  vibe_tags = ARRAY['morganton', 'farmhouse', 'local-grains', 'foraged', 'appalachian', 'destination-brewery', 'acclaimed', 'todd-boera']
WHERE id = id_fonta_flora;

-- ── BREVARD ────────────────────────────────────────────────────────────────

UPDATE breweries SET
  description = 'Downtown Brevard brewery and taproom in the heart of NC''s mountain biking and waterfall country. Known for clean, well-crafted beers. Popular with outdoor adventurers.',
  website_url = 'https://www.brevard-brewing.com',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/brevardbrewing',
  facebook_url = 'https://facebook.com/BrevardBrewing',
  untappd_url = 'https://untappd.com/BrevardBrewing',
  latitude = 35.2324, longitude = -82.7344,
  vibe_tags = ARRAY['brevard', 'mountain-biking', 'waterfall-country', 'outdoor-adventurers', 'downtown', 'clean-beers']
WHERE id = id_brevard_brewing;

UPDATE breweries SET
  description = 'Colorado-based craft brewery''s East Coast production facility in Brevard. Dale''s Pale Ale launched the craft canned beer revolution. Massive campus with taproom, disc golf, and live music venue.',
  website_url = 'https://www.oskarblues.com',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/osaborevard',
  facebook_url = 'https://facebook.com/OskarBlues',
  untappd_url = 'https://untappd.com/OskarBlues',
  latitude = 35.2278, longitude = -82.6917,
  vibe_tags = ARRAY['brevard', 'national-brand', 'campus', 'disc-golf', 'live-music', 'canned-beer-pioneer', 'production-facility']
WHERE id = id_oskar_blues;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 3: Add beers
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── FOOTHILLS BREWING ──────────────────────────────────────────────────────
INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(fh_01, id_foothills, 'Hoppyum', 'American IPA', 6.6, NULL, 'Flagship American IPA with Cascade, Centennial, and Columbus hops. Balanced and approachable.', true, true, 'beer', false),
(fh_02, id_foothills, 'Torch', 'German Pilsner', 5.3, NULL, 'Crisp German-style pilsner with noble hop character.', true, true, 'beer', false),
(fh_03, id_foothills, 'People''s Porter', 'American Porter', 5.8, NULL, 'Flagship porter with chocolate, coffee, and roast malt. A Winston-Salem classic.', true, true, 'beer', false),
(fh_04, id_foothills, 'Sexual Chocolate', 'Imperial Stout', 9.6, NULL, 'Legendary cocoa-infused imperial stout. Released annually to massive lines. One of NC''s most sought-after beers.', true, true, 'beer', true),
(fh_05, id_foothills, 'Jade', 'American IPA', 7.0, NULL, 'Pacific Northwest-style IPA with Simcoe, Citra, and Amarillo.', true, true, 'beer', false),
(fh_06, id_foothills, 'Pilot Mountain', 'Pale Ale', 5.2, NULL, 'Flagship pale ale named for the Triad landmark.', true, true, 'beer', false),
(fh_07, id_foothills, 'Seeing Double', 'Imperial IPA', 9.1, NULL, 'Bold imperial IPA with aggressive hop character.', true, true, 'beer', true),
(fh_08, id_foothills, 'Total Eclipse', 'Imperial Stout', 11.0, NULL, 'Barrel-aged imperial stout. Rich, boozy, and complex.', true, true, 'beer', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── FONTA FLORA ────────────────────────────────────────────────────────────
INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(ff_01, id_fonta_flora, 'MegaFlora', 'Super Saison', 8.0, NULL, 'Their legendary Super Saison brewed with 90% local grains. Complex, effervescent, and intensely flavorful.', true, true, 'beer', false),
(ff_02, id_fonta_flora, 'Beets, Rhymes & Life', 'Beet Saison', 5.5, NULL, 'Saison brewed with local beets. Earthy, dry, and uniquely beautiful.', true, true, 'beer', true),
(ff_03, id_fonta_flora, 'Whippoorwill', 'Appalachian Farmhouse Ale', 6.0, NULL, 'Farmhouse ale from their Whippoorwill Farm location. Foraged and local ingredients.', true, true, 'beer', false),
(ff_04, id_fonta_flora, 'Wildflower Witbier', 'Witbier', 4.5, NULL, 'Belgian wit with foraged wildflower additions.', true, true, 'beer', true),
(ff_05, id_fonta_flora, 'Carolina Custard', 'Cream Ale', 5.0, NULL, 'Southern cream ale with local NC grains.', true, true, 'beer', false),
(ff_06, id_fonta_flora, 'Gratitude', 'Mixed-Fermentation Ale', 6.5, NULL, 'Mixed-culture farmhouse ale aged in oak barrels.', true, true, 'beer', true),
(ff_07, id_fonta_flora, 'Plum Granny', 'Fruited Wild Ale', 5.5, NULL, 'Wild ale with foraged plum granny melon.', true, true, 'beer', true),
(ff_08, id_fonta_flora, 'Appalachian Pilsner', 'Pilsner', 5.0, NULL, 'Pilsner brewed with 100% Appalachian-grown grains.', true, true, 'beer', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── CATAWBA BREWING ────────────────────────────────────────────────────────
INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(cw_01, id_catawba, 'White Zombie', 'Belgian Witbier', 5.1, NULL, 'Flagship Belgian-style witbier. Refreshing with coriander and orange peel. Their best seller.', true, true, 'beer', false),
(cw_02, id_catawba, 'Endless Trail', 'Pilsner', 4.5, NULL, 'Crisp, clean pilsner for the trail.', true, true, 'beer', false),
(cw_03, id_catawba, 'Farmer Ted''s', 'Cream Ale', 5.0, NULL, 'Smooth, easy-drinking cream ale.', true, true, 'beer', false),
(cw_04, id_catawba, 'Peanut Butter Jelly Time', 'Brown Ale', 5.3, NULL, 'Brown ale with peanut butter and jelly character. Creative and fun.', true, true, 'beer', true),
(cw_05, id_catawba, 'Mother Trucker', 'West Coast IPA', 6.5, NULL, 'Bold West Coast IPA with piney, resinous hops.', true, true, 'beer', false),
(cw_06, id_catawba, 'Brown Bear', 'Brown Ale', 5.0, NULL, 'Nutty, malty brown ale with caramel character.', true, true, 'beer', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── JOYMONGERS ─────────────────────────────────────────────────────────────
INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(jm_01, id_joymongers, 'Left Coast', 'West Coast IPA', 6.8, NULL, 'Bold West Coast IPA with piney, citrusy hops.', true, true, 'beer', false),
(jm_02, id_joymongers, 'Vienna Lager', 'Vienna Lager', 5.0, NULL, 'Balanced amber Vienna lager with biscuit malt.', true, true, 'beer', false),
(jm_03, id_joymongers, 'Moravian Cookie Porter', 'Porter', 5.5, NULL, 'Porter inspired by Winston-Salem''s Moravian cookie tradition. Spicy and sweet.', true, true, 'beer', true),
(jm_04, id_joymongers, 'Golden Ale', 'Golden Ale', 4.5, NULL, 'Light, easy-drinking golden ale.', true, true, 'beer', false),
(jm_05, id_joymongers, 'Black IPA', 'Black IPA', 7.0, NULL, 'Dark and hoppy. Roasty malt meets citrus hops.', true, true, 'beer', false),
(jm_06, id_joymongers, 'Hazy IPA', 'Hazy IPA', 6.5, NULL, 'Juicy, tropical hazy IPA.', true, true, 'beer', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── APPALACHIAN MOUNTAIN BREWERY ───────────────────────────────────────────
INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(am_01, id_ambrewery, 'Boone Creek Blonde', 'Blonde Ale', 4.5, NULL, 'US Open Beer Championship gold medal winner. Light, crisp, and crushable.', true, true, 'beer', false),
(am_02, id_ambrewery, 'Long Leaf', 'American IPA', 6.5, NULL, 'Flagship IPA with citrus and pine hop character.', true, true, 'beer', false),
(am_03, id_ambrewery, 'Honey Badger', 'Honey Blonde', 5.0, NULL, 'Blonde ale with local honey. Sweet and sessionable.', true, true, 'beer', false),
(am_04, id_ambrewery, 'Spoaty Oaty', 'Oatmeal Stout', 5.5, NULL, 'Smooth oatmeal stout with chocolate and coffee.', true, true, 'beer', false),
(am_05, id_ambrewery, 'Hazy Mountain', 'Hazy IPA', 6.8, NULL, 'Juicy hazy IPA with mountain hop character.', true, true, 'beer', false),
(am_06, id_ambrewery, 'Cider', 'Hard Cider', 5.5, NULL, 'Crisp hard cider from their cidery program.', true, true, 'cider', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ═══════════════════════════════════════════════════════════════════════════════
RAISE NOTICE '✅ Migration 119: Remaining NC enrichment complete — 12 breweries, ~44 beers, 1 closed';
END $$;
