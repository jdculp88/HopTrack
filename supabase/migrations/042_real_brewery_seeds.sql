-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 042: Real US Brewery Seeds
-- 60 real craft breweries across 10 US cities with GPS coordinates.
-- Designed for HopRoute (pub crawl) — breweries cluster within walkable
-- distance in each city so haversine calculations produce realistic routes.
-- Safe to re-run (ON CONFLICT DO UPDATE).  Run AFTER migrations 001-041.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  -- ── Asheville, NC (5 new — existing 3 from migration 024 untouched) ──
  avl_01 uuid := 'ee000001-0001-0000-0000-000000000001';
  avl_02 uuid := 'ee000001-0001-0000-0000-000000000002';
  avl_03 uuid := 'ee000001-0001-0000-0000-000000000003';
  avl_04 uuid := 'ee000001-0001-0000-0000-000000000004';
  avl_05 uuid := 'ee000001-0001-0000-0000-000000000005';

  -- ── Portland, OR (6) ──
  pdx_01 uuid := 'ee000001-0002-0000-0000-000000000001';
  pdx_02 uuid := 'ee000001-0002-0000-0000-000000000002';
  pdx_03 uuid := 'ee000001-0002-0000-0000-000000000003';
  pdx_04 uuid := 'ee000001-0002-0000-0000-000000000004';
  pdx_05 uuid := 'ee000001-0002-0000-0000-000000000005';
  pdx_06 uuid := 'ee000001-0002-0000-0000-000000000006';

  -- ── San Diego, CA (6) ──
  sd_01 uuid := 'ee000001-0003-0000-0000-000000000001';
  sd_02 uuid := 'ee000001-0003-0000-0000-000000000002';
  sd_03 uuid := 'ee000001-0003-0000-0000-000000000003';
  sd_04 uuid := 'ee000001-0003-0000-0000-000000000004';
  sd_05 uuid := 'ee000001-0003-0000-0000-000000000005';
  sd_06 uuid := 'ee000001-0003-0000-0000-000000000006';

  -- ── Denver, CO (6) ──
  den_01 uuid := 'ee000001-0004-0000-0000-000000000001';
  den_02 uuid := 'ee000001-0004-0000-0000-000000000002';
  den_03 uuid := 'ee000001-0004-0000-0000-000000000003';
  den_04 uuid := 'ee000001-0004-0000-0000-000000000004';
  den_05 uuid := 'ee000001-0004-0000-0000-000000000005';
  den_06 uuid := 'ee000001-0004-0000-0000-000000000006';

  -- ── Austin, TX (6) ──
  atx_01 uuid := 'ee000001-0005-0000-0000-000000000001';
  atx_02 uuid := 'ee000001-0005-0000-0000-000000000002';
  atx_03 uuid := 'ee000001-0005-0000-0000-000000000003';
  atx_04 uuid := 'ee000001-0005-0000-0000-000000000004';
  atx_05 uuid := 'ee000001-0005-0000-0000-000000000005';
  atx_06 uuid := 'ee000001-0005-0000-0000-000000000006';

  -- ── Chicago, IL (6) ──
  chi_01 uuid := 'ee000001-0006-0000-0000-000000000001';
  chi_02 uuid := 'ee000001-0006-0000-0000-000000000002';
  chi_03 uuid := 'ee000001-0006-0000-0000-000000000003';
  chi_04 uuid := 'ee000001-0006-0000-0000-000000000004';
  chi_05 uuid := 'ee000001-0006-0000-0000-000000000005';
  chi_06 uuid := 'ee000001-0006-0000-0000-000000000006';

  -- ── Brooklyn / NYC, NY (6) ──
  bk_01 uuid := 'ee000001-0007-0000-0000-000000000001';
  bk_02 uuid := 'ee000001-0007-0000-0000-000000000002';
  bk_03 uuid := 'ee000001-0007-0000-0000-000000000003';
  bk_04 uuid := 'ee000001-0007-0000-0000-000000000004';
  bk_05 uuid := 'ee000001-0007-0000-0000-000000000005';
  bk_06 uuid := 'ee000001-0007-0000-0000-000000000006';

  -- ── Nashville, TN (6) ──
  nas_01 uuid := 'ee000001-0008-0000-0000-000000000001';
  nas_02 uuid := 'ee000001-0008-0000-0000-000000000002';
  nas_03 uuid := 'ee000001-0008-0000-0000-000000000003';
  nas_04 uuid := 'ee000001-0008-0000-0000-000000000004';
  nas_05 uuid := 'ee000001-0008-0000-0000-000000000005';
  nas_06 uuid := 'ee000001-0008-0000-0000-000000000006';

  -- ── Seattle, WA (6) ──
  sea_01 uuid := 'ee000001-0009-0000-0000-000000000001';
  sea_02 uuid := 'ee000001-0009-0000-0000-000000000002';
  sea_03 uuid := 'ee000001-0009-0000-0000-000000000003';
  sea_04 uuid := 'ee000001-0009-0000-0000-000000000004';
  sea_05 uuid := 'ee000001-0009-0000-0000-000000000005';
  sea_06 uuid := 'ee000001-0009-0000-0000-000000000006';

  -- ── Burlington, VT (6) ──
  bvt_01 uuid := 'ee000001-0010-0000-0000-000000000001';
  bvt_02 uuid := 'ee000001-0010-0000-0000-000000000002';
  bvt_03 uuid := 'ee000001-0010-0000-0000-000000000003';
  bvt_04 uuid := 'ee000001-0010-0000-0000-000000000004';
  bvt_05 uuid := 'ee000001-0010-0000-0000-000000000005';
  bvt_06 uuid := 'ee000001-0010-0000-0000-000000000006';

BEGIN

-- ═══════════════════════════════════════════════════════════════════════════════
-- BREWERIES — 59 real US craft breweries with real GPS coordinates
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO breweries (id, name, brewery_type, street, city, state, country, latitude, longitude, description, website_url, phone, verified, hop_route_eligible, vibe_tags) VALUES

-- ── ASHEVILLE, NC — South Slope / Downtown cluster ──────────────────────────
-- (3 existing from migration 024: Mountain Ridge, River Bend, Smoky Barrel)

(avl_01, 'Burial Beer Co.', 'microbrewery',
  '40 Collier Ave', 'Asheville', 'North Carolina', 'United States',
  35.5881, -82.5538,
  'South Slope icon crafting boundary-pushing IPAs, stouts, and wild ales in a moody industrial taproom.',
  'https://burialbeer.com', '(828) 475-2739', true, true,
  ARRAY['industrial', 'hip', 'south-slope']),

(avl_02, 'Green Man Brewery', 'brewpub',
  '27 Buxton Ave', 'Asheville', 'North Carolina', 'United States',
  35.5895, -82.5536,
  'One of Asheville''s original craft breweries since 1997. Flagship ESB and seasonal sours in a laid-back taproom.',
  'https://greenmanbrewery.com', '(828) 252-5502', true, true,
  ARRAY['classic', 'south-slope', 'dog-friendly']),

(avl_03, 'Hi-Wire Brewing', 'brewpub',
  '197 Hilliard Ave', 'Asheville', 'North Carolina', 'United States',
  35.5869, -82.5572,
  'Circus-themed brewery with award-winning lagers and a sprawling South Slope taproom with games and food trucks.',
  'https://hiwirebrewing.com', '(828) 738-2448', true, true,
  ARRAY['games', 'family-friendly', 'south-slope']),

(avl_04, 'Wicked Weed Brewing', 'brewpub_restaurant',
  '91 Biltmore Ave', 'Asheville', 'North Carolina', 'United States',
  35.5914, -82.5516,
  'Downtown Asheville landmark known for bold West Coast IPAs and an extensive sour program at the Funkatorium.',
  'https://wickedweedbrewing.com', '(828) 575-9599', true, true,
  ARRAY['rooftop', 'food', 'downtown']),

(avl_05, 'Highland Brewing Company', 'regional_brewery',
  '12 Old Charlotte Hwy', 'Asheville', 'North Carolina', 'United States',
  35.5705, -82.5192,
  'Asheville''s first legal brewery since Prohibition (1994). Spacious meadow, rooftop bar, and flagship Gaelic Ale.',
  'https://highlandbrewing.com', '(828) 299-3370', true, true,
  ARRAY['meadow', 'live-music', 'pioneer']),

-- ── PORTLAND, OR — Inner Eastside / Central cluster ─────────────────────────

(pdx_01, 'Great Notion Brewing', 'brewpub',
  '2204 NE Alberta St', 'Portland', 'Oregon', 'United States',
  45.5590, -122.6432,
  'Haze kings of the Pacific Northwest. Boundary-pushing fruited sours, smoothie IPAs, and pastry stouts.',
  'https://greatnotion.com', '(503) 548-4491', true, true,
  ARRAY['hazy', 'hip', 'alberta']),

(pdx_02, 'Ecliptic Brewing', 'brewpub_restaurant',
  '825 N Cook St', 'Portland', 'Oregon', 'United States',
  45.5466, -122.6750,
  'Astronomy-themed brewery from former Deschutes brewmaster. Seasonal cosmic releases and a stellar food menu.',
  'https://eclipticbrewing.com', '(503) 265-8002', true, true,
  ARRAY['food', 'patio', 'mississippi']),

(pdx_03, 'Breakside Brewery', 'microbrewery',
  '820 NE Dekum St', 'Portland', 'Oregon', 'United States',
  45.5724, -122.6556,
  'Multiple GABF gold medals. Creative IPAs, barrel-aged stouts, and one of Portland''s most respected tap lists.',
  'https://breakside.com', '(503) 719-6475', true, true,
  ARRAY['award-winning', 'woodlawn']),

(pdx_04, 'Ruse Brewing', 'microbrewery',
  '4784 SE 17th Ave', 'Portland', 'Oregon', 'United States',
  45.4795, -122.6479,
  'Cult-favorite experimental brewery. Farmhouse ales, wild IPAs, and limited small-batch releases.',
  'https://rusebrewing.com', '(971) 271-8841', true, true,
  ARRAY['experimental', 'small-batch', 'sellwood']),

(pdx_05, 'Occidental Brewing', 'microbrewery',
  '6635 N Baltimore Ave', 'Portland', 'Oregon', 'United States',
  45.5836, -122.7535,
  'German and continental-style lagers brewed with precision. Views of the St. Johns Bridge from the taproom.',
  'https://occidentalbrewing.com', '(503) 719-7102', true, true,
  ARRAY['german', 'lager', 'st-johns']),

(pdx_06, 'Baerlic Brewing', 'brewpub',
  '2235 SE 11th Ave', 'Portland', 'Oregon', 'United States',
  45.5037, -122.6546,
  'Neighborhood brewpub with wood-fired pizza. Reliable IPAs, crisp pilsners, and a welcoming inner SE vibe.',
  'https://baerlicbrewing.com', '(503) 477-9178', true, true,
  ARRAY['pizza', 'neighborhood', 'inner-se']),

-- ── SAN DIEGO, CA — North Park / Little Italy / Miramar cluster ─────────────

(sd_01, 'Modern Times Beer', 'microbrewery',
  '3725 Greenwood St', 'San Diego', 'California', 'United States',
  32.6902, -117.1289,
  'Worker-owned brewery known for hazy IPAs, coffee-infused stouts, and a lush tropical taproom in Point Loma.',
  'https://moderntimesbeer.com', '(619) 546-9694', true, true,
  ARRAY['tropical', 'coffee', 'point-loma']),

(sd_02, 'North Park Beer Co.', 'brewpub',
  '3038 University Ave', 'San Diego', 'California', 'United States',
  32.7496, -117.1296,
  'Neighborhood brewpub in the heart of North Park. Rotating taps, great food, and the most checked-in venue in San Diego on Untappd.',
  'https://northparkbeerco.com', '(619) 255-2946', true, true,
  ARRAY['neighborhood', 'food', 'north-park']),

(sd_03, 'Societe Brewing Company', 'microbrewery',
  '8262 Clairemont Mesa Blvd', 'San Diego', 'California', 'United States',
  32.8342, -117.1488,
  'West Coast IPA royalty. Clean, assertive hop-forward beers and Belgian-inspired ales in a Kearny Mesa warehouse.',
  'https://societebrewing.com', '(858) 598-5409', true, true,
  ARRAY['west-coast-ipa', 'industrial', 'kearny-mesa']),

(sd_04, 'Pure Project', 'microbrewery',
  '3076 University Ave', 'San Diego', 'California', 'United States',
  32.7496, -117.1290,
  'Clean-ingredient brewing with an emphasis on quality and sustainability. Stunning North Park taproom.',
  'https://purebrewing.org', '(619) 501-4505', true, true,
  ARRAY['sustainable', 'clean', 'north-park']),

(sd_05, 'Ballast Point Brewing', 'brewpub_restaurant',
  '2215 India St', 'San Diego', 'California', 'United States',
  32.7294, -117.1699,
  'Iconic San Diego brewery behind Sculpin IPA. Little Italy location with waterfront views and a full restaurant.',
  'https://ballastpoint.com', '(619) 255-7213', true, true,
  ARRAY['iconic', 'waterfront', 'little-italy']),

(sd_06, 'Stone Brewing', 'regional_brewery',
  '1999 Citracado Pkwy', 'Escondido', 'California', 'United States',
  33.1157, -117.1200,
  'One of the largest craft breweries in the US. World Bistro and Gardens with one acre of lush outdoor seating in Escondido.',
  'https://stonebrewing.com', '(760) 294-7866', true, true,
  ARRAY['gardens', 'destination', 'escondido']),

-- ── DENVER, CO — RiNo / LoDo / Five Points cluster ─────────────────────────

(den_01, 'Great Divide Brewing Co.', 'microbrewery',
  '2201 Arapahoe St', 'Denver', 'Colorado', 'United States',
  39.7531, -104.9875,
  'Denver institution since 1994. Home of Yeti Imperial Stout and the RiNo Barrel Bar. Two taprooms in the city.',
  'https://greatdivide.com', '(303) 296-9460', true, true,
  ARRAY['classic', 'barrel-aged', 'ballpark']),

(den_02, 'Ratio Beerworks', 'brewpub',
  '2920 Larimer St', 'Denver', 'Colorado', 'United States',
  39.7627, -104.9780,
  'Punk rock meets craft beer in RiNo. Meticulously crafted traditional styles with a modern edge and a killer patio.',
  'https://ratiobeerworks.com', '(303) 997-8288', true, true,
  ARRAY['punk', 'patio', 'rino']),

(den_03, 'Our Mutual Friend Brewing', 'microbrewery',
  '2810 Larimer St', 'Denver', 'Colorado', 'United States',
  39.7617, -104.9790,
  'Intimate RiNo taproom with rotating experimental beers. Small-batch saisons, IPAs, and wild ales.',
  'https://omfbeer.com', '(303) 296-3441', true, true,
  ARRAY['experimental', 'intimate', 'rino']),

(den_04, 'Cerebral Brewing', 'microbrewery',
  '1477 Monroe St', 'Denver', 'Colorado', 'United States',
  39.7400, -104.9409,
  'Science-forward brewing in Congress Park. Articulate IPAs, refined lagers, and one of Denver''s most inclusive spaces.',
  'https://cerebralbrewing.com', '(303) 927-7365', true, true,
  ARRAY['inclusive', 'science', 'congress-park']),

(den_05, 'Bierstadt Lagerhaus', 'taproom',
  '2875 Blake St', 'Denver', 'Colorado', 'United States',
  39.7621, -104.9795,
  'Lager purists. Traditional German-style lagers brewed with no shortcuts — slow pils, Helles, and Dunkel only.',
  'https://bierstadtlagerhaus.com', '(720) 570-7824', true, true,
  ARRAY['german', 'lager', 'rino']),

(den_06, 'Wynkoop Brewing Company', 'brewpub_restaurant',
  '1634 18th St', 'Denver', 'Colorado', 'United States',
  39.7534, -105.0003,
  'Colorado''s first brewpub (1988), founded by former governor John Hickenlooper. Pool hall, full restaurant, and a piece of Denver history.',
  'https://wynkoop.com', '(303) 297-2700', true, true,
  ARRAY['historic', 'pool-hall', 'lodo']),

-- ── AUSTIN, TX — East / South / Central cluster ─────────────────────────────

(atx_01, 'Lazarus Brewing Co.', 'brewpub',
  '1902 E 6th St', 'Austin', 'Texas', 'United States',
  30.2625, -97.7241,
  'East 6th brewpub with Mexican-inspired food, house-made tepache, and creative farmhouse ales. Dog-friendly patio.',
  'https://lazarusbrewing.com', '(512) 394-7620', true, true,
  ARRAY['food', 'east-6th', 'dog-friendly']),

(atx_02, 'Zilker Brewing Company', 'microbrewery',
  '1813 E 6th St', 'Austin', 'Texas', 'United States',
  30.2627, -97.7254,
  'Approachable craft just off East 6th. Known for Marco IPA and crisp session beers in a relaxed neighborhood taproom.',
  'https://zilkerbeer.com', '(512) 540-1380', true, true,
  ARRAY['neighborhood', 'session', 'east-6th']),

(atx_03, 'Pinthouse Brewing', 'brewpub_restaurant',
  '4729 Burnet Rd', 'Austin', 'Texas', 'United States',
  30.3194, -97.7393,
  'Award-winning Austin brewpub with three locations. Electric Jellyfish IPA is a local legend. Full food menu.',
  'https://pinthouse.com', '(512) 436-9605', true, true,
  ARRAY['food', 'award-winning', 'burnet']),

(atx_04, 'Austin Beerworks', 'microbrewery',
  '3001 Industrial Terrace', 'Austin', 'Texas', 'United States',
  30.3500, -97.7183,
  'Locally hellbent on excellence. Bold packaging, clean beers, and a popular taproom with rotating food trucks.',
  'https://austinbeerworks.com', '(512) 821-2494', true, true,
  ARRAY['local', 'food-trucks', 'north-austin']),

(atx_05, 'Jester King Brewery', 'microbrewery',
  '13187 Fitzhugh Rd', 'Austin', 'Texas', 'United States',
  30.2306, -97.9992,
  'World-renowned farmhouse ales and wild ales on 165 acres of Hill Country farmland. Weekend-only destination brewery.',
  'https://jesterkingbrewery.com', '(512) 537-5100', true, true,
  ARRAY['farmhouse', 'destination', 'hill-country']),

(atx_06, 'Meanwhile Brewing Co.', 'brewpub',
  '3901 Promontory Point Dr', 'Austin', 'Texas', 'United States',
  30.2222, -97.7278,
  '3.7-acre beer garden with food trucks, live music, a playground, and a turf soccer field. Southeast Austin hangout.',
  'https://meanwhilebeer.com', '(512) 308-4314', true, true,
  ARRAY['beer-garden', 'live-music', 'family-friendly']),

-- ── CHICAGO, IL — Ravenswood / Logan Square / West Town cluster ─────────────

(chi_01, 'Revolution Brewing', 'regional_brewery',
  '3340 N Kedzie Ave', 'Chicago', 'Illinois', 'United States',
  41.9425, -87.7074,
  'Illinois'' largest independent craft brewery. Deep-wood series barrel-aged stouts and a bustling Logan Square brewpub.',
  'https://revbrew.com', '(773) 588-2267', true, true,
  ARRAY['barrel-aged', 'brewpub', 'logan-square']),

(chi_02, 'Half Acre Beer Company', 'microbrewery',
  '2050 W Balmoral Ave', 'Chicago', 'Illinois', 'United States',
  41.9800, -87.6798,
  'North Side staple since 2007. Daisy Cutter Pale Ale is a Chicago icon. Balmoral taproom with a spacious beer garden.',
  'https://halfacrebeer.com', '(773) 248-4038', true, true,
  ARRAY['beer-garden', 'classic', 'lincoln-square']),

(chi_03, 'Dovetail Brewery', 'microbrewery',
  '1800 W Belle Plaine Ave', 'Chicago', 'Illinois', 'United States',
  41.9563, -87.6729,
  'Old-world European brewing in Ravenswood. Continental lagers, hefeweizens, and rauchbiers on Malt Row.',
  'https://dovetailbrewery.com', '(773) 683-1414', true, true,
  ARRAY['german', 'malt-row', 'ravenswood']),

(chi_04, 'Hop Butcher For The World', 'taproom',
  '4257 N Lincoln Ave', 'Chicago', 'Illinois', 'United States',
  41.9580, -87.6862,
  'Hop-obsessed producers of some of Chicago''s most sought-after hazy IPAs and DIPAs. Minimal taproom, maximum flavor.',
  'https://hopbutcher.com', NULL, true, true,
  ARRAY['hazy', 'ipa', 'north-center']),

(chi_05, 'Moody Tongue', 'brewpub_restaurant',
  '2515 S Wabash Ave', 'Chicago', 'Illinois', 'United States',
  41.8479, -87.6257,
  'Culinary brewery with a Michelin-starred tasting room. Shaved Black Truffle Pilsner and refined food pairings.',
  'https://moodytongue.com', '(312) 600-5111', true, true,
  ARRAY['fine-dining', 'michelin', 'south-loop']),

(chi_06, 'Goose Island Beer Co.', 'regional_brewery',
  '1800 N Clybourn Ave', 'Chicago', 'Illinois', 'United States',
  41.9133, -87.6575,
  'Chicago''s most famous brewery. Bourbon County Stout launched the barrel-aged beer movement. Fulton Street taproom.',
  'https://gooseisland.com', '(312) 915-0071', true, true,
  ARRAY['iconic', 'barrel-aged', 'clybourn']),

-- ── BROOKLYN / NYC, NY — Williamsburg / Gowanus / Carroll Gardens cluster ───

(bk_01, 'Brooklyn Brewery', 'regional_brewery',
  '79 N 11th St', 'Brooklyn', 'New York', 'United States',
  40.7216, -73.9575,
  'Iconic since 1988. The brewery that put Brooklyn craft beer on the world map. Williamsburg taproom with tours.',
  'https://brooklynbrewery.com', '(718) 486-7422', true, true,
  ARRAY['iconic', 'tours', 'williamsburg']),

(bk_02, 'Other Half Brewing Co.', 'microbrewery',
  '195 Centre St', 'Brooklyn', 'New York', 'United States',
  40.6771, -73.9981,
  'NYC''s haze overlords. Can releases draw lines around the block. Imperial IPAs, stouts, and sours in Carroll Gardens.',
  'https://otherhalfbrewing.com', '(347) 987-3527', true, true,
  ARRAY['hazy', 'can-release', 'carroll-gardens']),

(bk_03, 'Grimm Artisanal Ales', 'microbrewery',
  '990 Metropolitan Ave', 'Brooklyn', 'New York', 'United States',
  40.7142, -73.9367,
  'Husband-and-wife artisan brewery. Innovative sours, farmhouse ales, and double IPAs in East Williamsburg.',
  'https://grimmales.com', '(718) 564-1376', true, true,
  ARRAY['artisan', 'sour', 'east-williamsburg']),

(bk_04, 'Threes Brewing', 'brewpub',
  '333 Douglass St', 'Brooklyn', 'New York', 'United States',
  40.6802, -73.9827,
  'Gowanus neighborhood brewery with excellent food, rotating guest taps, and a welcoming back patio.',
  'https://threesbrewing.com', '(718) 522-2110', true, true,
  ARRAY['food', 'patio', 'gowanus']),

(bk_05, 'TALEA Beer Co.', 'microbrewery',
  '87 Richardson St', 'Brooklyn', 'New York', 'United States',
  40.7153, -73.9521,
  'NYC''s first female-founded brewery. Fruit-forward, low-acidity beers in a gorgeous Williamsburg taproom.',
  'https://taleabeer.com', '(347) 987-4130', true, true,
  ARRAY['fruit-forward', 'female-founded', 'williamsburg']),

(bk_06, 'Evil Twin Brewing NYC', 'taproom',
  '1616 George St', 'Ridgewood', 'New York', 'United States',
  40.7060, -73.9050,
  'Danish gypsy brewer''s NYC home. Wild experimentation — fruited imperials, pastry stouts, and everything in between.',
  'https://eviltwin.dk', '(718) 366-1850', true, true,
  ARRAY['experimental', 'danish', 'ridgewood']),

-- ── NASHVILLE, TN — Germantown / Downtown / Nations cluster ─────────────────

(nas_01, 'Bearded Iris Brewing', 'microbrewery',
  '101 Van Buren St', 'Nashville', 'Tennessee', 'United States',
  36.1756, -86.7872,
  'Nashville''s haze headquarters in Germantown. Homestyle IPA is a Tennessee legend. Rotating small-batch releases.',
  'https://beardedirisbrewing.com', '(615) 928-7988', true, true,
  ARRAY['hazy', 'germantown', 'popular']),

(nas_02, 'Southern Grist Brewing Co.', 'microbrewery',
  '754 Douglas Ave', 'Nashville', 'Tennessee', 'United States',
  36.1873, -86.7554,
  'East Nashville brewery pushing boundaries with fruited sours, pastry stouts, and creative seasonal releases.',
  'https://southerngristbrewing.com', '(615) 454-4777', true, true,
  ARRAY['sour', 'creative', 'east-nashville']),

(nas_03, 'Tennessee Brew Works', 'brewpub_restaurant',
  '809 Ewing Ave', 'Nashville', 'Tennessee', 'United States',
  36.1537, -86.7758,
  'Downtown Nashville brewpub with live music. State Park Blonde and Southern Wit are local staples.',
  'https://tnbrewworks.com', '(615) 436-0050', true, true,
  ARRAY['live-music', 'downtown', 'food']),

(nas_04, 'Blackstone Brewing Company', 'brewpub_restaurant',
  '2312 Clifton Ave', 'Nashville', 'Tennessee', 'United States',
  36.1496, -86.8065,
  'Nashville''s oldest craft brewery (1994). 30-barrel brewhouse, 16 rotating taps, and the beloved B-Stone Bus food truck.',
  'https://blackstonebrewery.com', '(615) 327-9969', true, true,
  ARRAY['classic', 'food-truck', 'west-end']),

(nas_05, 'Fat Bottom Brewing', 'brewpub',
  '800 44th Ave N', 'Nashville', 'Tennessee', 'United States',
  36.1707, -86.8322,
  'Dog-friendly Nations brewery with a big beer garden. Knockout IPA and Ruby Red Ale in a family-friendly space.',
  'https://fatbottombrewing.com', '(615) 678-5715', true, true,
  ARRAY['beer-garden', 'dog-friendly', 'the-nations']),

(nas_06, 'New Heights Brewing Co.', 'microbrewery',
  '928 Rep. John Lewis Way S', 'Nashville', 'Tennessee', 'United States',
  36.1502, -86.7815,
  'Small craft brewery steps from downtown. Cream ales to sours to porters, all brewed with neighborhood heart.',
  'https://newheightsbrewing.com', '(615) 490-6901', true, true,
  ARRAY['small-batch', 'downtown', 'neighborhood']),

-- ── SEATTLE, WA — Ballard / Fremont / Interbay cluster ─────────────────────

(sea_01, 'Fremont Brewing', 'microbrewery',
  '1050 N 34th St', 'Seattle', 'Washington', 'United States',
  47.6498, -122.3450,
  'Family-owned urban beer garden in Fremont. Free pretzels, local ingredients, and kid-and-dog-friendly vibes.',
  'https://fremontbrewing.com', '(206) 420-2407', true, true,
  ARRAY['beer-garden', 'family-friendly', 'fremont']),

(sea_02, 'Reuben''s Brews', 'microbrewery',
  '5010 14th Ave NW', 'Seattle', 'Washington', 'United States',
  47.6668, -122.3726,
  'Ballard''s most-awarded brewery. 100+ medals. Crisp pilsners, hazy IPAs, and barrel-aged rarities.',
  'https://reubensbrews.com', '(206) 784-2040', true, true,
  ARRAY['award-winning', 'ballard', 'taproom']),

(sea_03, 'Holy Mountain Brewing', 'microbrewery',
  '1421 Elliott Ave W', 'Seattle', 'Washington', 'United States',
  47.6310, -122.3717,
  'Interbay''s barrel-aged and wild ale specialists. Sought-after saisons, sours, and mixed-fermentation beers.',
  'https://holymountainbrewing.com', '(206) 457-5078', true, true,
  ARRAY['barrel-aged', 'wild-ale', 'interbay']),

(sea_04, 'Stoup Brewing', 'brewpub',
  '1108 NW 52nd St', 'Seattle', 'Washington', 'United States',
  47.6676, -122.3698,
  'Heart of the Ballard Brewery District. Welcoming, inclusive taproom with rotating guest taps and a great patio.',
  'https://stoupbrewing.com', '(206) 457-5524', true, true,
  ARRAY['inclusive', 'patio', 'ballard']),

(sea_05, 'Georgetown Brewing Company', 'microbrewery',
  '5200 Denver Ave S', 'Seattle', 'Washington', 'United States',
  47.5521, -122.3213,
  'Seattle institution. Manny''s Pale Ale is on tap at practically every bar in the city. Georgetown industrial district.',
  'https://georgetownbeer.com', '(206) 766-8055', true, true,
  ARRAY['iconic', 'industrial', 'georgetown']),

(sea_06, 'Pike Brewing Company', 'brewpub_restaurant',
  '1415 1st Ave', 'Seattle', 'Washington', 'United States',
  47.6088, -122.3407,
  'Pike Place Market staple since 1989. Full restaurant, brewery tours, and a museum of beer history.',
  'https://pikebrewing.com', '(206) 622-6044', true, true,
  ARRAY['historic', 'pike-place', 'tours']),

-- ── BURLINGTON, VT — Pine St / Waterfront / College St cluster ──────────────

(bvt_01, 'Foam Brewers', 'taproom',
  '112 Lake St', 'Burlington', 'Vermont', 'United States',
  44.4781, -73.2199,
  'Lakefront taproom on the shores of Lake Champlain. Inventive IPAs, wild ales, and live music on the waterfront.',
  'https://foambrewers.com', '(802) 399-2511', true, true,
  ARRAY['waterfront', 'live-music', 'downtown']),

(bvt_02, 'Burlington Beer Company', 'microbrewery',
  '180 Flynn Ave', 'Burlington', 'Vermont', 'United States',
  44.4567, -73.2209,
  'South End arts district brewery in a 120-year-old brick building. Boundary-pushing IPAs and lagers since 2014.',
  'https://burlingtonbeercompany.com', '(802) 862-3368', true, true,
  ARRAY['arts-district', 'south-end', 'creative']),

(bvt_03, 'Zero Gravity Craft Brewery', 'brewpub',
  '716 Pine St', 'Burlington', 'Vermont', 'United States',
  44.4604, -73.2188,
  'Two locations including the Pine Street beer hall. Green State Lager and Madonna IPA are Vermont staples.',
  'https://zerogravitybeer.com', '(802) 497-0054', true, true,
  ARRAY['beer-hall', 'pine-street', 'local-favorite']),

(bvt_04, 'Switchback Brewing Co.', 'microbrewery',
  '160 Flynn Ave', 'Burlington', 'Vermont', 'United States',
  44.4569, -73.2213,
  'Flagship Switchback Ale has been a Vermont pub staple for decades. New beer garden and taproom opened 2024.',
  'https://switchbackvt.com', '(802) 651-4114', true, true,
  ARRAY['classic', 'beer-garden', 'south-end']),

(bvt_05, 'Vermont Pub & Brewery', 'brewpub_restaurant',
  '144 College St', 'Burlington', 'Vermont', 'United States',
  44.4766, -73.2130,
  'Vermont''s first brewpub (1988). Downtown institution with pub fare, cask ales, and a piece of New England brewing history.',
  'https://vermontbrewery.com', '(802) 865-0500', true, true,
  ARRAY['historic', 'downtown', 'pub-fare']),

(bvt_06, 'Queen City Brewery', 'microbrewery',
  '703 Pine St', 'Burlington', 'Vermont', 'United States',
  44.4608, -73.2182,
  'English-inspired ales on Pine Street. Cask-conditioned bitters, milds, and ESBs in a no-frills taproom.',
  'https://queencitybrewery.com', '(802) 540-0280', true, true,
  ARRAY['english', 'cask', 'pine-street'])

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brewery_type = EXCLUDED.brewery_type,
  street = EXCLUDED.street,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  country = EXCLUDED.country,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  description = EXCLUDED.description,
  website_url = EXCLUDED.website_url,
  phone = EXCLUDED.phone,
  verified = EXCLUDED.verified,
  hop_route_eligible = EXCLUDED.hop_route_eligible,
  vibe_tags = EXCLUDED.vibe_tags;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Mark existing demo breweries (migration 024) as hop_route_eligible too
-- ═══════════════════════════════════════════════════════════════════════════════
UPDATE breweries SET
  hop_route_eligible = true,
  vibe_tags = ARRAY['mountain', 'live-music', 'dog-friendly']
WHERE id = 'dd000001-0000-0000-0000-000000000001'; -- Mountain Ridge

UPDATE breweries SET
  hop_route_eligible = true,
  vibe_tags = ARRAY['belgian', 'riverfront', 'sour']
WHERE id = 'dd000001-0000-0000-0000-000000000002'; -- River Bend

UPDATE breweries SET
  hop_route_eligible = true,
  vibe_tags = ARRAY['smoked', 'cozy', 'board-games']
WHERE id = 'dd000001-0000-0000-0000-000000000003'; -- Smoky Barrel

END $$;
