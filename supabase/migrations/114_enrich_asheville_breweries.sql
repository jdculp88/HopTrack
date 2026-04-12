-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 114: Enrich Asheville NC Breweries + Deduplicate 042 Seeds
-- 11 breweries enriched with descriptions, social links, vibe tags, and beers.
-- ~180 real beers from web research (Untappd, brewery websites, April 2026).
-- DEDUP: Merges 5 duplicate Asheville breweries from migration 042 (hardcoded
-- UUIDs) into the canonical OpenBreweryDB entries from migration 048. Re-points
-- all FK references, deletes 6 stale 043 beers, removes 5 orphaned rows.
-- Safe to re-run (ON CONFLICT DO UPDATE for beers, idempotent UPDATEs).
-- NOTE: Bhramari Brewhouse + Eurisko Beer Co permanently closed (2023).
-- NOTE: Catawba Asheville South Slope closed Mar 2025; beer still distributed.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  -- Brewery IDs (looked up by external_id from 048_open_brewery_db_seed)
  id_burial uuid;
  id_zillicoah uuid;
  id_wedge uuid;
  id_wicked_weed uuid;
  id_hiwire uuid;
  id_green_man uuid;
  id_archetype uuid;
  id_highland uuid;
  id_french_broad uuid;
  id_pisgah uuid;
  id_twin_leaf uuid;

  -- ── Burial Beer Co beers ──
  bu_01 uuid := 'ff000114-0001-0000-0000-000000000001';
  bu_02 uuid := 'ff000114-0001-0000-0000-000000000002';
  bu_03 uuid := 'ff000114-0001-0000-0000-000000000003';
  bu_04 uuid := 'ff000114-0001-0000-0000-000000000004';
  bu_05 uuid := 'ff000114-0001-0000-0000-000000000005';
  bu_06 uuid := 'ff000114-0001-0000-0000-000000000006';
  bu_07 uuid := 'ff000114-0001-0000-0000-000000000007';
  bu_08 uuid := 'ff000114-0001-0000-0000-000000000008';
  bu_09 uuid := 'ff000114-0001-0000-0000-000000000009';
  bu_10 uuid := 'ff000114-0001-0000-0000-000000000010';

  -- ── Zillicoah beers ──
  zi_01 uuid := 'ff000114-0002-0000-0000-000000000001';
  zi_02 uuid := 'ff000114-0002-0000-0000-000000000002';
  zi_03 uuid := 'ff000114-0002-0000-0000-000000000003';
  zi_04 uuid := 'ff000114-0002-0000-0000-000000000004';
  zi_05 uuid := 'ff000114-0002-0000-0000-000000000005';
  zi_06 uuid := 'ff000114-0002-0000-0000-000000000006';
  zi_07 uuid := 'ff000114-0002-0000-0000-000000000007';
  zi_08 uuid := 'ff000114-0002-0000-0000-000000000008';
  zi_09 uuid := 'ff000114-0002-0000-0000-000000000009';
  zi_10 uuid := 'ff000114-0002-0000-0000-000000000010';

  -- ── Wedge Brewing beers ──
  we_01 uuid := 'ff000114-0003-0000-0000-000000000001';
  we_02 uuid := 'ff000114-0003-0000-0000-000000000002';
  we_03 uuid := 'ff000114-0003-0000-0000-000000000003';
  we_04 uuid := 'ff000114-0003-0000-0000-000000000004';
  we_05 uuid := 'ff000114-0003-0000-0000-000000000005';
  we_06 uuid := 'ff000114-0003-0000-0000-000000000006';
  we_07 uuid := 'ff000114-0003-0000-0000-000000000007';
  we_08 uuid := 'ff000114-0003-0000-0000-000000000008';
  we_09 uuid := 'ff000114-0003-0000-0000-000000000009';
  we_10 uuid := 'ff000114-0003-0000-0000-000000000010';

  -- ── Wicked Weed beers ──
  ww_01 uuid := 'ff000114-0004-0000-0000-000000000001';
  ww_02 uuid := 'ff000114-0004-0000-0000-000000000002';
  ww_03 uuid := 'ff000114-0004-0000-0000-000000000003';
  ww_04 uuid := 'ff000114-0004-0000-0000-000000000004';
  ww_05 uuid := 'ff000114-0004-0000-0000-000000000005';
  ww_06 uuid := 'ff000114-0004-0000-0000-000000000006';
  ww_07 uuid := 'ff000114-0004-0000-0000-000000000007';
  ww_08 uuid := 'ff000114-0004-0000-0000-000000000008';
  ww_09 uuid := 'ff000114-0004-0000-0000-000000000009';
  ww_10 uuid := 'ff000114-0004-0000-0000-000000000010';

  -- ── Hi-Wire beers ──
  hw_01 uuid := 'ff000114-0005-0000-0000-000000000001';
  hw_02 uuid := 'ff000114-0005-0000-0000-000000000002';
  hw_03 uuid := 'ff000114-0005-0000-0000-000000000003';
  hw_04 uuid := 'ff000114-0005-0000-0000-000000000004';
  hw_05 uuid := 'ff000114-0005-0000-0000-000000000005';
  hw_06 uuid := 'ff000114-0005-0000-0000-000000000006';
  hw_07 uuid := 'ff000114-0005-0000-0000-000000000007';
  hw_08 uuid := 'ff000114-0005-0000-0000-000000000008';
  hw_09 uuid := 'ff000114-0005-0000-0000-000000000009';
  hw_10 uuid := 'ff000114-0005-0000-0000-000000000010';

  -- ── Green Man beers ──
  gm_01 uuid := 'ff000114-0006-0000-0000-000000000001';
  gm_02 uuid := 'ff000114-0006-0000-0000-000000000002';
  gm_03 uuid := 'ff000114-0006-0000-0000-000000000003';
  gm_04 uuid := 'ff000114-0006-0000-0000-000000000004';
  gm_05 uuid := 'ff000114-0006-0000-0000-000000000005';
  gm_06 uuid := 'ff000114-0006-0000-0000-000000000006';
  gm_07 uuid := 'ff000114-0006-0000-0000-000000000007';
  gm_08 uuid := 'ff000114-0006-0000-0000-000000000008';
  gm_09 uuid := 'ff000114-0006-0000-0000-000000000009';
  gm_10 uuid := 'ff000114-0006-0000-0000-000000000010';

  -- ── Archetype beers ──
  ar_01 uuid := 'ff000114-0007-0000-0000-000000000001';
  ar_02 uuid := 'ff000114-0007-0000-0000-000000000002';
  ar_03 uuid := 'ff000114-0007-0000-0000-000000000003';
  ar_04 uuid := 'ff000114-0007-0000-0000-000000000004';
  ar_05 uuid := 'ff000114-0007-0000-0000-000000000005';
  ar_06 uuid := 'ff000114-0007-0000-0000-000000000006';
  ar_07 uuid := 'ff000114-0007-0000-0000-000000000007';
  ar_08 uuid := 'ff000114-0007-0000-0000-000000000008';
  ar_09 uuid := 'ff000114-0007-0000-0000-000000000009';
  ar_10 uuid := 'ff000114-0007-0000-0000-000000000010';

  -- ── Highland beers ──
  hi_01 uuid := 'ff000114-0008-0000-0000-000000000001';
  hi_02 uuid := 'ff000114-0008-0000-0000-000000000002';
  hi_03 uuid := 'ff000114-0008-0000-0000-000000000003';
  hi_04 uuid := 'ff000114-0008-0000-0000-000000000004';
  hi_05 uuid := 'ff000114-0008-0000-0000-000000000005';
  hi_06 uuid := 'ff000114-0008-0000-0000-000000000006';
  hi_07 uuid := 'ff000114-0008-0000-0000-000000000007';
  hi_08 uuid := 'ff000114-0008-0000-0000-000000000008';
  hi_09 uuid := 'ff000114-0008-0000-0000-000000000009';
  hi_10 uuid := 'ff000114-0008-0000-0000-000000000010';

  -- ── French Broad beers ──
  fb_01 uuid := 'ff000114-0009-0000-0000-000000000001';
  fb_02 uuid := 'ff000114-0009-0000-0000-000000000002';
  fb_03 uuid := 'ff000114-0009-0000-0000-000000000003';
  fb_04 uuid := 'ff000114-0009-0000-0000-000000000004';
  fb_05 uuid := 'ff000114-0009-0000-0000-000000000005';
  fb_06 uuid := 'ff000114-0009-0000-0000-000000000006';
  fb_07 uuid := 'ff000114-0009-0000-0000-000000000007';
  fb_08 uuid := 'ff000114-0009-0000-0000-000000000008';
  fb_09 uuid := 'ff000114-0009-0000-0000-000000000009';
  fb_10 uuid := 'ff000114-0009-0000-0000-000000000010';

  -- ── Pisgah beers ──
  pi_01 uuid := 'ff000114-0010-0000-0000-000000000001';
  pi_02 uuid := 'ff000114-0010-0000-0000-000000000002';
  pi_03 uuid := 'ff000114-0010-0000-0000-000000000003';
  pi_04 uuid := 'ff000114-0010-0000-0000-000000000004';
  pi_05 uuid := 'ff000114-0010-0000-0000-000000000005';
  pi_06 uuid := 'ff000114-0010-0000-0000-000000000006';
  pi_07 uuid := 'ff000114-0010-0000-0000-000000000007';
  pi_08 uuid := 'ff000114-0010-0000-0000-000000000008';
  pi_09 uuid := 'ff000114-0010-0000-0000-000000000009';
  pi_10 uuid := 'ff000114-0010-0000-0000-000000000010';

  -- ── Twin Leaf beers ──
  tl_01 uuid := 'ff000114-0011-0000-0000-000000000001';
  tl_02 uuid := 'ff000114-0011-0000-0000-000000000002';
  tl_03 uuid := 'ff000114-0011-0000-0000-000000000003';
  tl_04 uuid := 'ff000114-0011-0000-0000-000000000004';
  tl_05 uuid := 'ff000114-0011-0000-0000-000000000005';
  tl_06 uuid := 'ff000114-0011-0000-0000-000000000006';
  tl_07 uuid := 'ff000114-0011-0000-0000-000000000007';
  tl_08 uuid := 'ff000114-0011-0000-0000-000000000008';

  -- ══════════════════════════════════════════════════════════════════════════
  -- EXPANDED CATALOG UUIDs (Round 2)
  -- ══════════════════════════════════════════════════════════════════════════

  -- ── Burial Beer Co (expanded) ──
  bu_11 uuid := 'ff000114-0001-0000-0000-000000000011';
  bu_12 uuid := 'ff000114-0001-0000-0000-000000000012';
  bu_13 uuid := 'ff000114-0001-0000-0000-000000000013';
  bu_14 uuid := 'ff000114-0001-0000-0000-000000000014';
  bu_15 uuid := 'ff000114-0001-0000-0000-000000000015';
  bu_16 uuid := 'ff000114-0001-0000-0000-000000000016';
  bu_17 uuid := 'ff000114-0001-0000-0000-000000000017';
  bu_18 uuid := 'ff000114-0001-0000-0000-000000000018';
  bu_19 uuid := 'ff000114-0001-0000-0000-000000000019';
  bu_20 uuid := 'ff000114-0001-0000-0000-000000000020';
  bu_21 uuid := 'ff000114-0001-0000-0000-000000000021';
  bu_22 uuid := 'ff000114-0001-0000-0000-000000000022';
  bu_23 uuid := 'ff000114-0001-0000-0000-000000000023';
  bu_24 uuid := 'ff000114-0001-0000-0000-000000000024';
  bu_25 uuid := 'ff000114-0001-0000-0000-000000000025';
  bu_26 uuid := 'ff000114-0001-0000-0000-000000000026';
  bu_27 uuid := 'ff000114-0001-0000-0000-000000000027';
  bu_28 uuid := 'ff000114-0001-0000-0000-000000000028';

  -- ── Zillicoah (expanded) ──
  zi_11 uuid := 'ff000114-0002-0000-0000-000000000011';
  zi_12 uuid := 'ff000114-0002-0000-0000-000000000012';
  zi_13 uuid := 'ff000114-0002-0000-0000-000000000013';
  zi_14 uuid := 'ff000114-0002-0000-0000-000000000014';
  zi_15 uuid := 'ff000114-0002-0000-0000-000000000015';
  zi_16 uuid := 'ff000114-0002-0000-0000-000000000016';
  zi_17 uuid := 'ff000114-0002-0000-0000-000000000017';
  zi_18 uuid := 'ff000114-0002-0000-0000-000000000018';
  zi_19 uuid := 'ff000114-0002-0000-0000-000000000019';
  zi_20 uuid := 'ff000114-0002-0000-0000-000000000020';
  zi_21 uuid := 'ff000114-0002-0000-0000-000000000021';
  zi_22 uuid := 'ff000114-0002-0000-0000-000000000022';
  zi_23 uuid := 'ff000114-0002-0000-0000-000000000023';
  zi_24 uuid := 'ff000114-0002-0000-0000-000000000024';
  zi_25 uuid := 'ff000114-0002-0000-0000-000000000025';

  -- ── Wedge (expanded) ──
  we_11 uuid := 'ff000114-0003-0000-0000-000000000011';
  we_12 uuid := 'ff000114-0003-0000-0000-000000000012';
  we_13 uuid := 'ff000114-0003-0000-0000-000000000013';
  we_14 uuid := 'ff000114-0003-0000-0000-000000000014';
  we_15 uuid := 'ff000114-0003-0000-0000-000000000015';
  we_16 uuid := 'ff000114-0003-0000-0000-000000000016';
  we_17 uuid := 'ff000114-0003-0000-0000-000000000017';
  we_18 uuid := 'ff000114-0003-0000-0000-000000000018';
  we_19 uuid := 'ff000114-0003-0000-0000-000000000019';
  we_20 uuid := 'ff000114-0003-0000-0000-000000000020';
  we_21 uuid := 'ff000114-0003-0000-0000-000000000021';
  we_22 uuid := 'ff000114-0003-0000-0000-000000000022';

  -- ── Wicked Weed (expanded) ──
  ww_11 uuid := 'ff000114-0004-0000-0000-000000000011';
  ww_12 uuid := 'ff000114-0004-0000-0000-000000000012';
  ww_13 uuid := 'ff000114-0004-0000-0000-000000000013';
  ww_14 uuid := 'ff000114-0004-0000-0000-000000000014';
  ww_15 uuid := 'ff000114-0004-0000-0000-000000000015';
  ww_16 uuid := 'ff000114-0004-0000-0000-000000000016';
  ww_17 uuid := 'ff000114-0004-0000-0000-000000000017';
  ww_18 uuid := 'ff000114-0004-0000-0000-000000000018';
  ww_19 uuid := 'ff000114-0004-0000-0000-000000000019';
  ww_20 uuid := 'ff000114-0004-0000-0000-000000000020';

  -- ── Hi-Wire (expanded) ──
  hw_11 uuid := 'ff000114-0005-0000-0000-000000000011';
  hw_12 uuid := 'ff000114-0005-0000-0000-000000000012';
  hw_13 uuid := 'ff000114-0005-0000-0000-000000000013';
  hw_14 uuid := 'ff000114-0005-0000-0000-000000000014';
  hw_15 uuid := 'ff000114-0005-0000-0000-000000000015';
  hw_16 uuid := 'ff000114-0005-0000-0000-000000000016';
  hw_17 uuid := 'ff000114-0005-0000-0000-000000000017';
  hw_18 uuid := 'ff000114-0005-0000-0000-000000000018';
  hw_19 uuid := 'ff000114-0005-0000-0000-000000000019';
  hw_20 uuid := 'ff000114-0005-0000-0000-000000000020';

  -- ── Green Man (expanded) ──
  gm_11 uuid := 'ff000114-0006-0000-0000-000000000011';
  gm_12 uuid := 'ff000114-0006-0000-0000-000000000012';
  gm_13 uuid := 'ff000114-0006-0000-0000-000000000013';
  gm_14 uuid := 'ff000114-0006-0000-0000-000000000014';

  -- ── Archetype (expanded) ──
  ar_11 uuid := 'ff000114-0007-0000-0000-000000000011';
  ar_12 uuid := 'ff000114-0007-0000-0000-000000000012';
  ar_13 uuid := 'ff000114-0007-0000-0000-000000000013';

BEGIN

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 1: Look up all brewery IDs by external_id
-- ═══════════════════════════════════════════════════════════════════════════════

SELECT id INTO id_burial FROM breweries WHERE external_id = 'b571a872-4317-48e2-a0a2-18607eedb6e7';
SELECT id INTO id_zillicoah FROM breweries WHERE external_id = '169cd01b-b11c-449e-87df-9d1dd056ebf2';
SELECT id INTO id_wedge FROM breweries WHERE external_id = 'cbe89f10-6763-4ed1-90d0-80cabea11a29';
SELECT id INTO id_wicked_weed FROM breweries WHERE external_id = '2849f939-f34f-498f-beba-c243b678765b';
SELECT id INTO id_hiwire FROM breweries WHERE external_id = '6f18252e-ae65-4c45-9867-2c1b72b4ce11';
SELECT id INTO id_green_man FROM breweries WHERE external_id = '467e3456-7b3b-4cc5-abe6-e86460e3473d';
SELECT id INTO id_archetype FROM breweries WHERE external_id = 'd86d40e0-1a3f-4c34-9b07-002191bc0952';
SELECT id INTO id_highland FROM breweries WHERE external_id = '4b013cfb-62b1-441a-b301-5f1d26c2b48c';
SELECT id INTO id_french_broad FROM breweries WHERE external_id = 'aa897103-0752-4ec6-a10f-f90ec51b2836';
SELECT id INTO id_pisgah FROM breweries WHERE external_id = 'b9ffed7c-9569-4f18-82a6-b51b59dd5bb8';
SELECT id INTO id_twin_leaf FROM breweries WHERE external_id = '44113b77-122d-4680-85e7-cc0662cc6da0';

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 2: Enrich brewery profiles
-- ═══════════════════════════════════════════════════════════════════════════════

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ TIER 1: OUTREACH TARGETS                                                   │
-- └─────────────────────────────────────────────────────────────────────────────┘

-- ── BURIAL BEER CO ─────────────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Founded 2013 on Asheville''s South Slope. One of the most acclaimed small breweries in the country — Craft Beer & Brewing Readers'' Choice #1 Small Brewery in the World (2021-2022). Meticulous Belgian-inspired ales, bold stouts, and inventive hop-forward beers with poetic, literary branding.',
  phone = '8284752739',
  website_url = 'https://www.burialbeer.com',
  hop_route_eligible = true,
  hop_route_offer = 'First pour on us when you check in with HopTrack',
  instagram_url = 'https://instagram.com/burialbeer',
  facebook_url = 'https://facebook.com/burialbeer',
  untappd_url = 'https://untappd.com/BurialBeer',
  twitter_url = 'https://x.com/burialbeer',
  vibe_tags = ARRAY['dark-aesthetic', 'artisan', 'south-slope', 'intimate', 'design-forward', 'literary', 'experimental', 'small-batch']
WHERE id = id_burial;

-- ── ZILLICOAH BEER COMPANY ─────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Opened 2017, first brewery in Woodfin NC, perched on the banks of the French Broad River. Specializes in open-fermented farmhouse ales and lagers using traditional European techniques. Cherokee-derived name references the stretch of river behind the brewery. Taqueria Munoz serves on-site.',
  website_url = 'https://www.zillicoahbeer.com',
  hop_route_eligible = true,
  hop_route_offer = 'Free taco with any flight when you check in with HopTrack',
  instagram_url = 'https://instagram.com/zillicoahbeer',
  facebook_url = 'https://facebook.com/ZillicoahBeer',
  untappd_url = 'https://untappd.com/ZillicoahBeer',
  twitter_url = NULL,
  latitude = 35.617240,
  longitude = -82.576372,
  vibe_tags = ARRAY['riverfront', 'outdoor-seating', 'nature', 'dog-friendly', 'food-trucks', 'european-tradition', 'open-fermented', 'laid-back', 'scenic']
WHERE id = id_zillicoah;

-- ── WEDGE BREWING CO ───────────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Established 2008, a neighborhood institution in Asheville''s River Arts District. Housed in the lower level of Wedge Studios — a classic brick warehouse beside the railroad tracks. Known for approachable traditional styles and a communal outdoor vibe with food trucks and live music. Three locations: Wedge Studios (RAD), Foundry Street, and Downtown Grove Arcade.',
  hop_route_eligible = true,
  hop_route_offer = '10% off your first flight when you check in with HopTrack',
  instagram_url = 'https://instagram.com/wedgebrewing',
  facebook_url = 'https://facebook.com/wedgebrewing',
  untappd_url = 'https://untappd.com/WedgeBrewingCo',
  twitter_url = NULL,
  vibe_tags = ARRAY['river-arts-district', 'industrial', 'food-trucks', 'live-music', 'dog-friendly', 'outdoor-seating', 'neighborhood', 'community', 'railroad-adjacent']
WHERE id = id_wedge;

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ TIER 2: MAJOR ASHEVILLE BREWERIES                                          │
-- └─────────────────────────────────────────────────────────────────────────────┘

-- ── WICKED WEED BREWING ────────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Opened 2012 in downtown Asheville. Known for aggressive West Coast IPAs and a world-class sour/wild program. Their Funkatorium on South Slope was the East Coast''s first taproom dedicated exclusively to sour beer. Acquired by Anheuser-Busch InBev in 2017.',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/wickedweedbrewing',
  facebook_url = 'https://facebook.com/WickedWeedBrewing',
  untappd_url = 'https://untappd.com/WickedWeedBrewing',
  twitter_url = 'https://x.com/wickedweedbeer',
  hop_route_offer = 'Free Funkatorium taster with your first HopTrack check-in',
  vibe_tags = ARRAY['downtown', 'brewpub', 'full-restaurant', 'sour-program', 'west-coast-ipa', 'funkatorium', 'large-scale', 'nationally-distributed', 'ab-inbev-owned']
WHERE id = id_wicked_weed;

-- ── HI-WIRE BREWING ────────────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Founded 2013 on Asheville''s South Slope by college roommates. Grown into one of the region''s largest craft breweries. Known for approachable circus-themed branding and a broad range from crisp lagers to hop-forward IPAs. Multiple taprooms including South Slope and Big Top production facility.',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/hiwirebrewing',
  facebook_url = 'https://facebook.com/hiwirebrewing',
  untappd_url = 'https://untappd.com/HiWireBrewing',
  twitter_url = 'https://x.com/hiwirebrewing',
  hop_route_offer = '$1 off any pint when you check in with HopTrack',
  vibe_tags = ARRAY['south-slope', 'circus-theme', 'family-friendly', 'large-taproom', 'patio', 'games', 'approachable', 'widely-distributed']
WHERE id = id_hiwire;

-- ── GREEN MAN BREWING ──────────────────────────────────────────────────────
UPDATE breweries SET
  description = 'One of Asheville''s oldest breweries, brewing since 1997 out of Jack of the Wood downtown. Relocated to South Slope''s Buxton Avenue in 2005 — the original taproom affectionately known as Dirty Jack''s. English-inspired ales with GABF Gold for their Porter in 2021.',
  hop_route_eligible = true,
  instagram_url = 'https://instagram.com/greenmanbrewery',
  facebook_url = 'https://facebook.com/GreenManBrewery',
  untappd_url = 'https://untappd.com/GreenManBreweryNC',
  twitter_url = 'https://x.com/GreenManBrewing',
  latitude = 35.588740,
  longitude = -82.553018,
  hop_route_offer = 'Free sticker pack when you check in with HopTrack',
  vibe_tags = ARRAY['south-slope', 'historic', 'english-style', 'dirty-jacks', 'pioneering', 'old-school', 'taproom', 'neighborhood']
WHERE id = id_green_man;

-- ── ARCHETYPE BREWING ──────────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Opened June 2017 in West Asheville. Focuses on complex, mindful, living beer — primarily American and Belgian styles with respect for fermentation tradition. Known for barrel-aged saisons, Belgian strongs, and thoughtful core beers with award-winning label art. Rooftop deck with views into the brewery.',
  street = '174 Broadway St',
  latitude = 35.600587,
  longitude = -82.554948,
  hop_route_eligible = true,
  hop_route_offer = 'Complimentary taster of any barrel-aged beer with HopTrack check-in',
  instagram_url = 'https://instagram.com/archetypebrewingavl',
  facebook_url = 'https://facebook.com/ArchetypeBrewingandKitchen',
  untappd_url = 'https://untappd.com/ArchetypeBrewing',
  twitter_url = NULL,
  vibe_tags = ARRAY['west-asheville', 'belgian-focus', 'rooftop-deck', 'artistic', 'mindful', 'barrel-aged', 'farmhouse', 'intimate', 'award-winning-labels']
WHERE id = id_archetype;

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ TIER 3: FILL OUT THE CITY                                                  │
-- └─────────────────────────────────────────────────────────────────────────────┘

-- ── HIGHLAND BREWING CO ────────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Asheville''s original craft brewery, founded 1994 by Oscar Wong — the first since Prohibition. Now led by his daughter Leah Wong Ashburn as CEO. Regional institution known for balanced, approachable flagship ales. East Asheville campus features meadows, walking trails, and event venue.',
  latitude = 35.570914,
  longitude = -82.497779,
  hop_route_eligible = true,
  hop_route_offer = '$2 off a Gaelic Ale when you check in with HopTrack',
  instagram_url = 'https://instagram.com/highlandbrewing',
  facebook_url = 'https://facebook.com/HighlandBrewingCompany',
  untappd_url = 'https://untappd.com/highlandbrewing',
  twitter_url = 'https://x.com/HighlandBrews',
  vibe_tags = ARRAY['pioneer', 'family-friendly', 'event-venue', 'meadow', 'walking-trails', 'regional-institution', 'east-asheville', 'legacy', 'woman-led']
WHERE id = id_highland;

-- ── FRENCH BROAD RIVER BREWERY ─────────────────────────────────────────────
UPDATE breweries SET
  description = 'Founded 2000 by former Green Man brewer Jonas Rembert. Sits at the edge of Biltmore Village, dedicated to European-style beers brewed with traditional methods. Known for their Scotch Ale and Kolsch, plus live music, pizza, and a welcoming community atmosphere.',
  latitude = 35.566385,
  longitude = -82.537412,
  hop_route_eligible = true,
  hop_route_offer = 'Free pretzel with any pint when you check in with HopTrack',
  instagram_url = 'https://instagram.com/frenchbroadriverbrewery',
  facebook_url = 'https://facebook.com/FrenchBroadBrewing',
  untappd_url = 'https://untappd.com/FrenchBroadBrewingCo',
  twitter_url = NULL,
  vibe_tags = ARRAY['biltmore-village', 'european-style', 'live-music', 'pizza', 'traditional-brewing', 'community', 'relaxed']
WHERE id = id_french_broad;

-- ── PISGAH BREWING CO ──────────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Founded 2005 in Black Mountain, 15 min east of Asheville. Uses all-organic grains and malts. Equally known for its outdoor concert venue hosting regional and national acts. Named after Pisgah National Forest.',
  street = '2948 US Hwy 70',
  latitude = 35.606706,
  longitude = -82.356793,
  hop_route_eligible = true,
  hop_route_offer = 'Free sticker when you check in with HopTrack',
  instagram_url = 'https://instagram.com/pisgahbrewing',
  facebook_url = 'https://facebook.com/PisgahBrewingCo',
  untappd_url = 'https://untappd.com/pisgahbrewing',
  twitter_url = NULL,
  vibe_tags = ARRAY['black-mountain', 'organic', 'music-venue', 'outdoor-concerts', 'all-organic-grain', 'nature', 'pisgah-forest', 'community']
WHERE id = id_pisgah;

-- ── TWIN LEAF BREWERY ──────────────────────────────────────────────────────
UPDATE breweries SET
  description = 'Brewer-owned independent craft brewery founded March 2014 in the heart of South Slope. 10-barrel system producing Belgian tripels to oatmeal stouts. Warm, unpretentious taproom atmosphere and award-winning Belgian-inspired beers alongside American standards.',
  hop_route_eligible = true,
  hop_route_offer = '$1 off your first pour when you check in with HopTrack',
  instagram_url = 'https://instagram.com/twinleafbrewery',
  facebook_url = 'https://facebook.com/twinleafavl',
  untappd_url = 'https://untappd.com/TwinLeaf',
  twitter_url = NULL,
  vibe_tags = ARRAY['south-slope', 'brewer-owned', 'independent', 'unpretentious', 'belgian-inspired', 'cozy', 'neighborhood']
WHERE id = id_twin_leaf;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 3: Add beers
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── BURIAL BEER CO ─────────────────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(bu_01, id_burial, 'Surf Wax', 'American IPA', 6.8, NULL,
 'Crisp, dry-hopped flagship IPA with bold aroma and resinous finish. Their most popular beer by far.', true, true, 'beer', false),
(bu_02, id_burial, 'Skillet Donut Stout', 'Coffee Stout', 8.0, NULL,
 'Rich breakfast stout with hints of coffee and chocolate-glazed donut, molasses undertones.', true, true, 'beer', false),
(bu_03, id_burial, 'Hawkbill', 'Hazy IPA', 6.6, NULL,
 'Double dry-hopped with Mosaic, Galaxy, El Dorado and Columbus Cryo. Tropical and tangerine character.', true, true, 'beer', false),
(bu_04, id_burial, 'Bolo', 'Brown Ale', 5.6, NULL,
 'Brown ale with nutty malts and sweet coconut. Their signature twist on the style.', true, true, 'beer', false),
(bu_05, id_burial, 'Shadowclock', 'German Pilsner', 5.0, NULL,
 'Made with German barley and American corn, then dry-hopped. Crisp and approachable.', true, true, 'beer', false),
(bu_06, id_burial, 'Griddle', 'Imperial Coffee Stout', 10.0, NULL,
 'Big brother to Skillet. Imperial double coffee stout with intense chocolate and roast.', true, true, 'beer', true),
(bu_07, id_burial, 'Tin Cup Camp Stout', 'Coffee Stout', 5.0, NULL,
 'Sessionable coffee stout with campfire and dark roast character.', true, true, 'beer', false),
(bu_08, id_burial, 'Lightgrinder', 'American Porter', 5.5, NULL,
 'Approachable American porter now available in 6-pack cans.', true, true, 'beer', false),
(bu_09, id_burial, 'Until There Is No Longer', 'Hazy IPA', 7.4, NULL,
 'Juicy, tropical hazy IPA. One of their highest-rated beers.', true, true, 'beer', true),
(bu_10, id_burial, 'Socialdevice', 'Non-Alcoholic Pilsner', 0.0, NULL,
 'Their NA offering. Clean pilsner character without the alcohol.', true, true, 'beer', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── ZILLICOAH BEER COMPANY ─────────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(zi_01, id_zillicoah, 'Helles', 'Helles Lager', 4.7, NULL,
 'Par-baked white bread character, open-fermented. Their signature lager.', true, true, 'beer', false),
(zi_02, id_zillicoah, 'Pils', 'North German Pilsner', 5.5, NULL,
 'Brewed with Seitzfarms Perle and Hersbrucker hops. Crisp and traditional.', true, true, 'beer', false),
(zi_03, id_zillicoah, 'Keller+', 'Kellerbier', 4.9, NULL,
 'Dry-hopped variant of their desert island lager. Hop-forward, crisp and dry.', true, true, 'beer', false),
(zi_04, id_zillicoah, 'Appalachian Pils', 'Pre-Prohibition Lager', 4.5, NULL,
 'Pre-prohibition style with NC barley and corn. Regional heritage lager.', true, true, 'beer', false),
(zi_05, id_zillicoah, 'Mt. Hood', 'American Pilsner', 5.2, NULL,
 '100% NC barley and Mt. Hood hops. Local-grain pilsner.', true, true, 'beer', true),
(zi_06, id_zillicoah, 'Hickory', 'Smoked Helles', 4.2, NULL,
 'Hickory wood smoked helles lager. Subtle smoke character.', true, true, 'beer', true),
(zi_07, id_zillicoah, 'Oatmeal Stout', 'Oatmeal Stout', 5.0, NULL,
 'Silky, luscious, roasty. A departure from their lager focus.', true, true, 'beer', true),
(zi_08, id_zillicoah, 'Barleywine', 'English Barleywine', 13.0, NULL,
 '100% Maris Otter malt and EKG hops. Dried fruit and leather notes.', true, true, 'beer', true),
(zi_09, id_zillicoah, '8 Degree', 'Czech Pale Lager', 3.5, NULL,
 'Low-ABV Czech-style session lager.', true, true, 'beer', true),
(zi_10, id_zillicoah, 'Rye Lager', 'Rye Beer', 4.9, NULL,
 'Rye-forward lager with spicy grain character.', true, true, 'beer', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── WEDGE BREWING CO ───────────────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(we_01, id_wedge, 'Iron Rail IPA', 'American IPA', 7.0, NULL,
 'Flagship IPA with Maris Otter, Canadian Honey Malt, and five hop additions including Centennial, Kent Golding, and Cascade.', true, true, 'beer', false),
(we_02, id_wedge, 'Golem', 'Belgian Strong Golden Ale', 11.5, NULL,
 'Belgian pilsner malt, wheat, oats, corn, true Belgian candy sugar, and European Noble hops including Saaz.', true, true, 'beer', false),
(we_03, id_wedge, 'Julian Price Pilsner', 'Czech Pilsner', 5.6, NULL,
 'Clean, crisp Czech-style pilsner.', true, true, 'beer', false),
(we_04, id_wedge, 'Cold Beer', 'Cream Ale', 5.0, NULL,
 'Easy-drinking cream ale. The name says it all.', true, true, 'beer', false),
(we_05, id_wedge, 'AOB Stout', 'Dry Stout', 5.3, NULL,
 'Classic dry Irish-style stout.', true, true, 'beer', false),
(we_06, id_wedge, 'Money Penny', 'Pub Ale', 5.0, NULL,
 'Approachable English-style pub ale.', true, true, 'beer', false),
(we_07, id_wedge, 'Tubin'' Hazy IPA', 'Hazy IPA', 6.8, NULL,
 'New England-style hazy. A nod to tubing on the French Broad.', true, true, 'beer', true),
(we_08, id_wedge, 'Silver Spike IPA', 'West Coast IPA', 6.8, NULL,
 'Pine and citrus West Coast-style IPA.', true, true, 'beer', true),
(we_09, id_wedge, 'Flat Iron', 'Italian Pilsner', 5.5, NULL,
 'Dry-hopped Italian-style pilsner.', true, true, 'beer', true),
(we_10, id_wedge, 'Saison', 'Belgian Farmhouse Ale', 7.0, NULL,
 'Traditional Belgian farmhouse with Wedge''s house character.', true, true, 'beer', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── WICKED WEED BREWING ────────────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(ww_01, id_wicked_weed, 'Pernicious', 'American IPA', 7.3, NULL,
 'Flagship West Coast IPA. Balanced brightness with tropical and resinous American hops.', true, true, 'beer', false),
(ww_02, id_wicked_weed, 'Freak of Nature', 'Double IPA', 8.5, NULL,
 'West Coast DIPA brewed with abnormally large hop quantities. Big pine, grapefruit peel, dank hop character.', true, true, 'beer', false),
(ww_03, id_wicked_weed, 'Dr. Dank', 'Hazy IPA', 7.1, NULL,
 'Juicy haze IPA with Citra and Simcoe hops. Multiple fruit variants rotate.', true, true, 'beer', false),
(ww_04, id_wicked_weed, 'Napoleon Complex', 'Hoppy Pale Ale', 5.2, NULL,
 'Small-statured pale ale with larger-than-life hop presence. Over 2 lbs/bbl dry hop.', true, true, 'beer', false),
(ww_05, id_wicked_weed, 'Dark Age', 'Imperial Stout', 12.0, NULL,
 'Massive imperial stout. Highest-rated Wicked Weed beer on Untappd.', true, true, 'beer', true),
(ww_06, id_wicked_weed, 'Medora', 'Fruited Sour', 7.2, NULL,
 'Barrel-aged sour with fruit. Funkatorium specialty.', true, true, 'beer', true),
(ww_07, id_wicked_weed, 'Amorous', 'Sour IPA', 7.0, NULL,
 'Sour dry-hopped ale. Highest-rated regular production sour.', true, true, 'beer', true),
(ww_08, id_wicked_weed, 'Oblivion', 'Flanders Red Ale', 8.7, NULL,
 'Traditional Flanders-style sour red aged in oak. Complex and tart.', true, true, 'beer', true),
(ww_09, id_wicked_weed, 'Black Angel', 'American Wild Ale', 6.6, NULL,
 'Dark wild ale with mixed cultures. Complex brett and sour character.', true, true, 'beer', true),
(ww_10, id_wicked_weed, 'Milk & Cookies', 'Imperial Pastry Stout', 8.7, NULL,
 'Dessert-style imperial stout with cookie and cream character.', true, true, 'beer', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── HI-WIRE BREWING ────────────────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(hw_01, id_hiwire, 'Hi-Pitch IPA', 'American IPA', 6.7, 55,
 'Balanced WNC IPA with bright citrus and tropical fruit aromas.', true, true, 'beer', false),
(hw_02, id_hiwire, 'Leisure Time', 'American Lager', 5.0, 15,
 'Smooth, crisp, refreshing craft lager brewed with 100% barley.', true, true, 'beer', false),
(hw_03, id_hiwire, 'Lo-Pitch', 'Hazy IPA', 5.5, 45,
 'Easy-drinking hazy IPA with bright citrus hop punch without heavy bitterness.', true, true, 'beer', false),
(hw_04, id_hiwire, 'Hi-Wire Lager', 'American Lager', 4.6, 22,
 'Award-winning true American lager. Light Pilsen malt and German hops.', true, true, 'beer', false),
(hw_05, id_hiwire, 'Hazy Pitch', 'Hazy IPA', 7.2, 25,
 'Big hazy IPA bursting with pineapple, melon, and citrus from juicy American hops.', true, true, 'beer', false),
(hw_06, id_hiwire, 'Cooler Nights IPA', 'West Coast IPA', 6.5, 65,
 'Classic West Coast with Citra citrus balanced by piney Chinook and Columbus.', true, true, 'beer', false),
(hw_07, id_hiwire, 'Double Hi-Pitch', 'Imperial IPA', 9.0, 65,
 'Extra-large Hi-Pitch with West Coast hops, melon and grapefruit.', true, true, 'beer', false),
(hw_08, id_hiwire, 'Bed of Nails', 'Brown Ale', 5.5, 21,
 'American brown with toffee and dark fruit. Ode to English tradition.', true, true, 'beer', false),
(hw_09, id_hiwire, 'Mountain Water', 'Easy Drinking Ale', 4.5, NULL,
 'Light, lemon-lime slushy-in-the-sunshine character.', true, true, 'beer', false),
(hw_10, id_hiwire, 'Mango Lazerade', 'Fruit Lemonade Ale', 8.0, NULL,
 'High-voltage mango lemonade with smooth mango juice and zesty lemon finish.', true, true, 'beer', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── GREEN MAN BREWING ──────────────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(gm_01, id_green_man, 'ESB', 'Extra Special Bitter', 5.5, NULL,
 'Award-winning English amber brewed entirely with British malts and hops. Toasted caramel flavor.', true, true, 'beer', false),
(gm_02, id_green_man, 'IPA', 'English-Style IPA', 6.2, NULL,
 'American take on Burton-upon-Trent IPAs. Copper color, floral hop nose, properly balanced body.', true, true, 'beer', false),
(gm_03, id_green_man, 'Porter', 'English Porter', 6.0, NULL,
 '2021 GABF Gold Winner. Dark, full-bodied with creamy smooth mouthfeel and distinct chocolate notes.', true, true, 'beer', false),
(gm_04, id_green_man, 'Trickster', 'Tropical IPA', 7.0, NULL,
 'Brewed with thiolized yeast for intense tropical fruit. Papaya, mango, grapefruit, passionfruit.', true, true, 'beer', false),
(gm_05, id_green_man, 'Wayfarer', 'American IPA', 6.0, NULL,
 'Unfiltered, light-bodied IPA with Citra hop dominance and cracker-like malt.', true, true, 'beer', false),
(gm_06, id_green_man, 'Legendary Light Lager', 'American Light Lager', 4.2, NULL,
 '118 calories per 12oz. Crisp and clean.', true, true, 'beer', false),
(gm_07, id_green_man, 'Rambler', 'Rye Pale Ale', NULL, NULL,
 'Easy-drinking rye pale ale dry-hopped with Amarillo and Centennial.', true, true, 'beer', true),
(gm_08, id_green_man, 'Snozzberry', 'Blonde Wheat Sour', NULL, NULL,
 'Wild-fermented blonde wheat aged in oak barrels for a year.', true, true, 'beer', true),
(gm_09, id_green_man, 'Forester', 'Stout', NULL, NULL,
 'Winter seasonal stout.', true, true, 'beer', true),
(gm_10, id_green_man, 'Harvester', 'Seasonal Ale', NULL, NULL,
 'Part of the rotating seasonal lineup alongside the core English flagships.', true, true, 'beer', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── ARCHETYPE BREWING ──────────────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(ar_01, id_archetype, 'Commitment Phobia', 'Session IPA', 5.5, NULL,
 'Bright, crisp session IPA with grapefruit, papaya, black pepper, and dried chili spice complexity.', true, true, 'beer', false),
(ar_02, id_archetype, 'Cowboy Poet', 'American Corn Lager', 4.8, NULL,
 'Well-balanced light-bodied corn lager with light floral noble hop presence and lemon notes.', true, true, 'beer', false),
(ar_03, id_archetype, 'Talking to Plants', 'Belgian Witbier', 5.0, NULL,
 'Belgian-style wheat beer. Core collection wit.', true, true, 'beer', false),
(ar_04, id_archetype, 'Unruly Mystic', 'Coffee Porter', 6.1, NULL,
 'Notes of freshly baked bread, semisweet chocolate, and light roasted malt.', true, true, 'beer', false),
(ar_05, id_archetype, 'Original Blonde', 'Blonde Ale', NULL, NULL,
 'Rounds out the core collection. Approachable golden ale.', true, true, 'beer', false),
(ar_06, id_archetype, 'The Sage', 'Belgian Strong Dark Ale', 11.67, NULL,
 'Big berry bouquet of cranberry, tart cherry, blueberry with fig notes. Highest-rated Archetype beer.', true, true, 'beer', true),
(ar_07, id_archetype, 'Devil''s Nest', 'Belgian Tripel', 10.2, NULL,
 'Complex barrel-aged tripel with honey, white wine, and oak vanillins. Secondary Brett fermentation.', true, true, 'beer', true),
(ar_08, id_archetype, 'Lunar Effect', 'Hazy IPA', 7.0, NULL,
 'New England-style hazy IPA.', true, true, 'beer', true),
(ar_09, id_archetype, 'Emotional Entanglement', 'Farmhouse Saison', 8.2, NULL,
 'Wine barrel-aged Brett saison with guava.', true, true, 'beer', true),
(ar_10, id_archetype, 'Shoulder Devil', 'American IPA', 7.9, NULL,
 'Full-bodied American IPA.', true, true, 'beer', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── HIGHLAND BREWING CO ────────────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(hi_01, id_highland, 'Gaelic Ale', 'American Amber Ale', 5.5, NULL,
 'THE flagship since 1994. Deep amber, malty sweetness, delicately hopped. Most popular by far.', true, true, 'beer', false),
(hi_02, id_highland, 'Oatmeal Porter', 'American Porter', 5.9, NULL,
 'Hints of chocolate and freshly roasted coffee. Original core four.', true, true, 'beer', false),
(hi_03, id_highland, 'Black Mocha Stout', 'American Stout', 5.0, NULL,
 'Bold roasted chocolate and coffee. Most robust year-round offering.', true, true, 'beer', false),
(hi_04, id_highland, 'AVL IPA', 'American IPA', 6.5, NULL,
 'Unfiltered with lychee, mango, lemon, papaya hop notes. Named for Asheville''s airport code.', true, true, 'beer', false),
(hi_05, id_highland, 'Thunderstruck Coffee Porter', 'Coffee Porter', 5.8, NULL,
 'Artisan fair-trade organic coffee from Black Mountain.', true, true, 'beer', false),
(hi_06, id_highland, 'Cold Mountain', 'Winter Ale', 5.9, NULL,
 'Legendary seasonal winter warmer with sweet malt and secret spice blend.', true, true, 'beer', true),
(hi_07, id_highland, 'Highland Pilsner', 'German Pilsner', NULL, NULL,
 'Crisp and dry with herbal and floral aromas from Hallertau hops and German malt.', true, true, 'beer', false),
(hi_08, id_highland, 'Starchaser', 'Witbier', NULL, NULL,
 'Belgian-style wheat beer in Highland''s approachable tradition.', true, true, 'beer', false),
(hi_09, id_highland, 'Mandarina IPA', 'Session IPA', 5.0, NULL,
 'Brewed with German Mandarina Bavaria and Hull Melon hops with bold oranges.', true, true, 'beer', true),
(hi_10, id_highland, 'St. Terese''s Pale Ale', 'American Pale Ale', NULL, NULL,
 'Original core four beer. Traditional American pale.', true, true, 'beer', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── FRENCH BROAD RIVER BREWERY ─────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(fb_01, id_french_broad, 'Gateway Kolsch', 'Kolsch', 5.3, NULL,
 'German-style ale brewed with Pilsner and wheat malts, noble hops, and Kolsch yeast. Crisp like a lager, full like an ale.', true, true, 'beer', false),
(fb_02, id_french_broad, 'Wee-Heavy-Er Scotch Ale', 'Scotch Ale', 7.0, NULL,
 'Their highest-rated beer. Rich and malty Scottish tradition.', true, true, 'beer', false),
(fb_03, id_french_broad, '13 Rebels ESB', 'Extra Special Bitter', 5.2, NULL,
 'English-style ESB. Well-balanced bitterness and malt.', true, true, 'beer', false),
(fb_04, id_french_broad, 'Frog Horn IPA', 'American IPA', 6.5, NULL,
 'Their hop-forward standard bearer.', true, true, 'beer', false),
(fb_05, id_french_broad, 'Anvil Porter', 'English Porter', 5.3, NULL,
 'Rich dark malt with subtle chocolate, burnt sugar, and toffee. English and French Munich malts.', true, true, 'beer', false),
(fb_06, id_french_broad, 'Upstream IPA', 'Rye IPA', 6.0, NULL,
 'Rye-forward IPA with spicy grain character.', true, true, 'beer', false),
(fb_07, id_french_broad, 'Goldenrod Pilsner', 'Pilsner', NULL, NULL,
 'Classic, refreshing pilsner with crisp finish.', true, true, 'beer', false),
(fb_08, id_french_broad, 'River Mist Hazy IPA', 'Hazy IPA', NULL, NULL,
 'Juicy citrus flavors with smooth aromatic finish.', true, true, 'beer', true),
(fb_09, id_french_broad, 'Maibock', 'Bock', 6.2, NULL,
 'Traditional German spring bock.', true, true, 'beer', true),
(fb_10, id_french_broad, 'Zeppelin', 'Strong Ale', NULL, NULL,
 'Big malty body with clean lager-ale hybrid fermentation.', true, true, 'beer', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── PISGAH BREWING CO ──────────────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(pi_01, id_pisgah, 'Pisgah Pale Ale', 'American Pale Ale', 5.1, 35,
 'The flagship. Perfect blend of rich organic malts with whole-leaf Chinook and Nugget hops. First keg sold 4/13/2005.', true, true, 'beer', false),
(pi_02, id_pisgah, 'Greybeard IPA', 'American IPA', 6.8, NULL,
 'West Coast style with Chinook and Nugget hops. Fresh, floral, piney, citrus character.', true, true, 'beer', false),
(pi_03, id_pisgah, 'Blueberry Wheat', 'Fruited Wheat Beer', 5.0, NULL,
 'American wheat with a heaping dose of blueberry puree. Year-round crowd favorite.', true, true, 'beer', false),
(pi_04, id_pisgah, 'Valdez', 'Coffee Stout', 6.2, NULL,
 'Coffee stout brewed with local Dynamite Roasting Co. coffee.', true, true, 'beer', false),
(pi_05, id_pisgah, 'Turtleback Brown', 'American Brown Ale', 5.9, NULL,
 'Named after waterfalls in Pisgah National Forest.', true, true, 'beer', true),
(pi_06, id_pisgah, 'Brite Sky Blood Orange IPA', 'Fruited IPA', NULL, NULL,
 'Blood orange with Mandarina Bavaria, El Dorado, and Centennial hops.', true, true, 'beer', true),
(pi_07, id_pisgah, 'Pisgah Nitro Stout', 'Stout', NULL, NULL,
 'Classic stout from organic roasted malts finished on nitrogen.', true, true, 'beer', false),
(pi_08, id_pisgah, 'Pisgah Porter', 'English Porter', NULL, NULL,
 'Five organic malts balanced by whole-leaf Chinook or Nugget hops.', true, true, 'beer', false),
(pi_09, id_pisgah, 'Vanilla Stout', 'Vanilla Stout', NULL, NULL,
 'Velvety smooth malts, flaked oats, and whole Madagascar vanilla beans.', true, true, 'beer', true),
(pi_10, id_pisgah, 'Oktoberfest', 'Marzen', NULL, NULL,
 'Old-world tradition Marzen lager with Munich malts.', true, true, 'beer', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── TWIN LEAF BREWERY ──────────────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(tl_01, id_twin_leaf, '144', 'American IPA', 7.2, NULL,
 'West Coast IPA with Cascade, Centennial, Amarillo, and Citra hops. Citrus burst. Also known as Juicy Fruit.', true, true, 'beer', false),
(tl_02, id_twin_leaf, 'Luminosity', 'Belgian Tripel', 9.0, NULL,
 'Deep golden, classic Trappist yeast strain complexity. Award-winning.', true, true, 'beer', false),
(tl_03, id_twin_leaf, 'Dark Matter', 'Oatmeal Stout', 5.3, NULL,
 'Oats, chocolate, crystal, and roasted malts. Thick and chewy.', true, true, 'beer', false),
(tl_04, id_twin_leaf, 'Leafer', 'American IPA', 6.3, NULL,
 'Mosaic hops with notes of citrus, fruit, pine, and pepper.', true, true, 'beer', false),
(tl_05, id_twin_leaf, 'Uproot ESB', 'Extra Special Bitter', 5.8, NULL,
 'Complex malt of bread, toast, and biscuit. Award-recognized.', true, true, 'beer', false),
(tl_06, id_twin_leaf, 'White Noise', 'Belgian Witbier', 5.6, NULL,
 'Belgian-style wheat beer.', true, true, 'beer', false),
(tl_07, id_twin_leaf, 'Magic Hour', 'Gose', NULL, NULL,
 'Traditional sour gose style.', true, true, 'beer', true),
(tl_08, id_twin_leaf, 'Exit Orbit', 'Hazy IPA', 4.2, NULL,
 'Session-strength New England hazy.', true, true, 'beer', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 4: Expanded beer catalogs (Round 2)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── BURIAL BEER CO (expanded +18) ─────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(bu_11, id_burial, 'Prophetmaker', 'American Pale Ale', 5.3, NULL,
 'DDH pale ale with Citra and Simcoe. Tropical fruit and citrus-forward.', true, true, 'beer', false),
(bu_12, id_burial, 'Scythe', 'Rye IPA', 7.0, NULL,
 'Rye-forward IPA from the original core lineup alongside Surf Wax.', true, true, 'beer', false),
(bu_13, id_burial, 'Bonedagger', 'American Pale Ale', 5.5, NULL,
 'Three-wheat pale ale (malted red wheat, flaked wheat, raw NC wheat) with Citra and Simcoe.', true, true, 'beer', false),
(bu_14, id_burial, 'Billows', 'Kolsch', 4.9, NULL,
 'Pilsner and flaked wheat fermented with Kolsch yeast, dry-hopped with Mandarina Bavaria and Centennial.', true, true, 'beer', false),
(bu_15, id_burial, 'Hellstar', 'Munich Dunkel', 4.8, NULL,
 'International dark lager. Malty and clean with restrained hop character.', true, true, 'beer', false),
(bu_16, id_burial, 'Innertube', 'American Light Lager', 3.5, NULL,
 'Brewed with barley, corn, and rice and lagered carefully. Easy-drinking summer lager.', true, true, 'beer', false),
(bu_17, id_burial, 'Precious', 'Czech Amber Lager', 4.9, NULL,
 'Czech amber hopped with Saaz and Adeena hops.', true, true, 'beer', false),
(bu_18, id_burial, 'Nada', 'Mexican Amber Lager', 5.0, NULL,
 'Mexican-style amber lager. Crisp and sessionable.', true, true, 'beer', false),
(bu_19, id_burial, 'Gang of Blades', 'Double Hazy IPA', 8.3, NULL,
 'DIPA brewed with barley and wheat, DDH with Citra, El Dorado, and Eclipse with Cryo.', true, true, 'beer', false),
(bu_20, id_burial, 'The Keeper''s Veil', 'Saison', 5.5, NULL,
 'Honey saison with farmhouse character and delicate sweetness.', true, true, 'beer', true),
(bu_21, id_burial, 'Haysaw', 'Barrel-Aged Saison', 6.5, NULL,
 'Carolina-grown barley and wheat saison aged in Biltmore Estate Pinot Noir barrels with vanilla.', true, true, 'beer', true),
(bu_22, id_burial, 'I Used To Be An Athlete', 'Imperial Hazy IPA', 8.5, NULL,
 'Imperial double NEIPA. Heavily hopped and hazy with tropical fruit intensity.', true, true, 'beer', true),
(bu_23, id_burial, 'To Streak Blood Across My Brow', 'Imperial Hazy IPA', 8.5, NULL,
 'Imperial double NEIPA. Dense and juicy with aggressive dry-hop profile.', true, true, 'beer', true),
(bu_24, id_burial, 'Realm of Absolute Nothingness', 'Imperial Pastry Stout', 15.0, NULL,
 'Imperial stout with cocoa, coconut, and vanilla. Hits the NC 15% ABV legal cap.', true, true, 'beer', true),
(bu_25, id_burial, 'Walking Through the Abyss Into Nowhere', 'Imperial Pastry Stout', 14.0, NULL,
 'Imperial stout with coffee and hazelnuts.', true, true, 'beer', true),
(bu_26, id_burial, 'What Is Rendered Will Remain Unfinished', 'Imperial Pastry Stout', 15.0, NULL,
 'Imperial stout with pecans, bacon, and vanilla.', true, true, 'beer', true),
(bu_27, id_burial, 'Anno Domini MMXXV', 'Barrel-Aged Imperial Stout', 15.0, NULL,
 'Annual barrel-aged blend of imperial stout and barleywine.', true, true, 'beer', true),
(bu_28, id_burial, 'This Malady of Mortality', 'Double IPA', 7.2, NULL,
 'Rotating double IPA release with their signature poetic naming convention.', true, true, 'beer', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── ZILLICOAH (expanded +15) ───────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(zi_11, id_zillicoah, 'Dunkel', 'Munich Dunkel', 5.0, NULL,
 'Open-fermented Munich-style dark lager with toasty malt character.', true, true, 'beer', false),
(zi_12, id_zillicoah, 'Bo Pils', 'Bohemian Pilsner', 4.9, NULL,
 'Czech-style pilsner with traditional Bohemian character and crisp finish.', true, true, 'beer', false),
(zi_13, id_zillicoah, 'Woodfin Lager', 'American Lager', 5.3, NULL,
 'Named for their hometown of Woodfin, NC. A clean everyday lager.', true, true, 'beer', false),
(zi_14, id_zillicoah, 'Festbier', 'Festbier', 5.0, NULL,
 'Traditional Oktoberfest-style lager.', true, true, 'beer', true),
(zi_15, id_zillicoah, 'Geist', 'Berliner Weisse', 2.8, NULL,
 'Tart and refreshing Berliner Weisse. Light and sessionable.', true, true, 'beer', true),
(zi_16, id_zillicoah, 'Peaches', 'Fruited Sour', 5.3, NULL,
 'Foudre-aged 9 months with 3.5 lbs peaches per gallon. Brett character with ripe peach aroma.', true, true, 'beer', true),
(zi_17, id_zillicoah, 'Blossom', 'Farmhouse Ale', 5.2, NULL,
 'Farmhouse ale with floral and earthy character.', true, true, 'beer', true),
(zi_18, id_zillicoah, 'Mittelfruh', 'German Pilsner', 4.0, NULL,
 'Soft, doughy white bread base showcasing herbal, peppery Hallertau Mittelfruh hops.', true, true, 'beer', true),
(zi_19, id_zillicoah, 'Austrian Gold', 'Vienna Lager', 5.4, NULL,
 'Vienna-style lager with biscuity malt and clean lager finish.', true, true, 'beer', true),
(zi_20, id_zillicoah, 'Skibsol', 'Dark Lager', 3.7, NULL,
 'Low-ABV Scandinavian-inspired dark lager. Roasty and sessionable.', true, true, 'beer', true),
(zi_21, id_zillicoah, 'Dark Czech Lager', 'Tmave', 5.2, NULL,
 'Czech dark lager with rich malt complexity and clean fermentation.', true, true, 'beer', true),
(zi_22, id_zillicoah, 'Smoked Helles Lager', 'Smoked Lager', 4.4, NULL,
 'Helles base with subtle smoke character from smoked malt.', true, true, 'beer', true),
(zi_23, id_zillicoah, 'Imperial Stout', 'Imperial Stout', 10.0, NULL,
 'Big, full-bodied imperial stout. A departure from their lager focus.', true, true, 'beer', true),
(zi_24, id_zillicoah, 'Foudre Biere', 'American Wild Ale', 7.7, NULL,
 'Foudre-aged with NC barley, mixed culture, and 5 lbs/gallon Montmorency cherries.', true, true, 'beer', true),
(zi_25, id_zillicoah, 'Stoutbier', 'Imperial Stout', 12.6, NULL,
 'High-gravity stout. Their biggest beer by ABV after the Barleywine.', true, true, 'beer', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── WEDGE BREWING CO (expanded +12) ───────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(we_11, id_wedge, 'Payne''s Pale Ale', 'American Pale Ale', 5.4, NULL,
 'Named for their Paynes Way address. Straightforward and approachable American pale.', true, true, 'beer', false),
(we_12, id_wedge, 'Community Porter', 'English Porter', 7.3, NULL,
 'Robust porter and neighborhood staple at the River Arts District taproom.', true, true, 'beer', false),
(we_13, id_wedge, 'Vadim Bora', 'Russian Imperial Stout', 8.6, NULL,
 'Made CNN''s Best Beers of 2012. Brewed with 168 lbs of raspberries, served on nitro.', true, true, 'beer', false),
(we_14, id_wedge, 'Derailed Hemp Ale', 'American Brown Ale', 5.6, NULL,
 'Brown ale brewed with hemp. A Wedge original with earthy, nutty character.', true, true, 'beer', false),
(we_15, id_wedge, 'Narrow Gauge Session IPA', 'Session IPA', 4.2, NULL,
 'Low-ABV session IPA for easy-drinking. Named for the railroad theme running through the brand.', true, true, 'beer', false),
(we_16, id_wedge, 'Witbier', 'Witbier', 4.2, NULL,
 'Traditional Belgian-style wheat beer with coriander and orange peel.', true, true, 'beer', false),
(we_17, id_wedge, '3rd Rail', 'American Barleywine', 10.0, NULL,
 'High-gravity barleywine. Aggressive and complex, their biggest beer.', true, true, 'beer', true),
(we_18, id_wedge, 'Cherry-Raspberry Wheat', 'Fruit Beer', 5.2, NULL,
 'Wheat ale base loaded with cherry and raspberry fruit.', true, true, 'beer', true),
(we_19, id_wedge, 'Apricot Pale Ale', 'Fruited Pale Ale', 5.3, NULL,
 'Canadian Pilsen and Crystal malts with Cascade hops and 240 lbs of apricot puree post-fermentation.', true, true, 'beer', true),
(we_20, id_wedge, 'Belgyum Pale Ale', 'Belgian Pale Ale', 5.5, NULL,
 'Belgian-inspired pale ale. Light, effervescent, and subtly fruity.', true, true, 'beer', true),
(we_21, id_wedge, 'Foundy Sesh', 'Session Ale', 4.5, NULL,
 'Session-strength brew named for the Foundry Street location.', true, true, 'beer', true),
(we_22, id_wedge, 'Double Silver Spike', 'Double IPA', 8.5, NULL,
 'Bigger, double-hopped version of their Silver Spike IPA.', true, true, 'beer', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── WICKED WEED (expanded +10) ────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(ww_11, id_wicked_weed, 'Perni-Haze', 'Hazy IPA', 6.9, 40,
 'Hazy counterpart to their flagship Pernicious.', true, true, 'beer', false),
(ww_12, id_wicked_weed, 'Coolcumber', 'Blonde Ale', 5.5, NULL,
 'Inspired by a Hendrick''s gin cooler. Brewed with cucumber, basil, and juniper berries.', true, true, 'beer', false),
(ww_13, id_wicked_weed, 'Lieutenant Dank', 'American IPA', 6.5, NULL,
 'West Coast-leaning IPA with dank, resinous hop character.', true, true, 'beer', false),
(ww_14, id_wicked_weed, 'Tyrant', 'Double Red Ale', 8.5, NULL,
 'Malt-rich imperial red with deep pine, herb, and grapefruit peel aromas.', true, true, 'beer', false),
(ww_15, id_wicked_weed, 'Serenity', 'Brett Farmhouse Ale', 5.5, NULL,
 '100% Brettanomyces fermented, wine barrel-aged 3-5 months. GABF gold medal winner.', true, true, 'beer', true),
(ww_16, id_wicked_weed, 'Silencio', 'Sour Wild Ale', 9.1, NULL,
 'Bourbon barrel-aged black sour with Madagascar vanilla and local Mountain Air Roasting coffee.', true, true, 'beer', true),
(ww_17, id_wicked_weed, 'Marina', 'Fruited Sour', 6.5, NULL,
 'Blonde sour aged in wine barrels with over a pound per gallon of peaches and apricots.', true, true, 'beer', true),
(ww_18, id_wicked_weed, 'Dark Arts', 'Wild Imperial Stout', 15.0, NULL,
 'NC''s first beer to hit the 15% ABV legal cap. Bourbon barrel-aged wild imperial stout, annual release.', true, true, 'beer', true),
(ww_19, id_wicked_weed, 'Recurrant', 'Fruited Sour', 7.6, NULL,
 'Deep red sour aged in cabernet barrels on over 1 lb/gallon black currants.', true, true, 'beer', true),
(ww_20, id_wicked_weed, 'Malice', 'Brett Farmhouse Saison', 6.0, NULL,
 'Brett farmhouse with blood orange, tamarind, lime zest, and ancho chilies blended with golden sour.', true, true, 'beer', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── HI-WIRE (expanded +10) ────────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(hw_11, id_hiwire, '10W-40', 'Imperial Pastry Stout', 8.0, NULL,
 'Brewed with Dynamite Roasting coffee, French Broad chocolate, and vanilla. Celebrated stout series.', true, true, 'beer', false),
(hw_12, id_hiwire, 'Strongman Coffee Milk Stout', 'Coffee Milk Stout', 5.3, NULL,
 'Milk stout with specialty coffee from Dynamite Roasting Co.', true, true, 'beer', false),
(hw_13, id_hiwire, 'Lion Tamer', 'Rye IPA', 7.0, NULL,
 'Rye-forward IPA that won gold in the GABF Specialty Beer category.', true, true, 'beer', false),
(hw_14, id_hiwire, 'Zirkusfest', 'Marzen', 6.0, NULL,
 'Traditional Oktoberfest lager. Won gold at the 2016 GABF.', true, true, 'beer', true),
(hw_15, id_hiwire, 'Enchanter', 'Baltic Porter', 8.5, NULL,
 'Deep mahogany Baltic porter with dark malts balanced by American white oak spirals.', true, true, 'beer', true),
(hw_16, id_hiwire, 'Uprisin'' Hefeweizen', 'Hefeweizen', 5.0, NULL,
 'Traditional hefeweizen with banana, clove, and peppercorn spice notes.', true, true, 'beer', true),
(hw_17, id_hiwire, 'Man Eater', 'Imperial IPA', 8.3, NULL,
 'Imperial IPA with aggressive hop bill.', true, true, 'beer', true),
(hw_18, id_hiwire, 'Pink Lemonade Session Sour', 'Fruited Sour', 4.2, NULL,
 'Tart and refreshing lemonade-inspired session sour.', true, true, 'beer', true),
(hw_19, id_hiwire, 'Twice as Nice', 'Doppelbock', 10.0, NULL,
 'Rich, malty German-style doppelbock. Their biggest lager.', true, true, 'beer', true),
(hw_20, id_hiwire, 'Citra Gose', 'Gose', 4.2, NULL,
 'Salt-and-coriander gose dry-hopped with Citra for citrus brightness.', true, true, 'beer', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── GREEN MAN (expanded +4) ───────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(gm_11, id_green_man, 'Rainmaker', 'Double IPA', 6.5, NULL,
 'A torrent of grapefruit, orange zest, resinous pine, and tropical fruit.', true, true, 'beer', false),
(gm_12, id_green_man, 'The Dweller', 'Barrel-Aged Imperial Stout', 11.5, NULL,
 'Imperial stout cast into oak barrels and cellared. Smooth with sinister charm.', true, true, 'beer', true),
(gm_13, id_green_man, 'Howler', 'Belgian Quadrupel', 10.0, NULL,
 'Rich Belgian quad. Their biggest Belgian offering.', true, true, 'beer', true),
(gm_14, id_green_man, 'Wildflower', 'Belgian Blonde', 6.6, NULL,
 'Delicate Belgian blonde with floral and fruity esters.', true, true, 'beer', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ── ARCHETYPE (expanded +3) ───────────────────────────────────────────────

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active, item_type, seasonal) VALUES
(ar_11, id_archetype, 'Blue Collar Wizard', 'Irish Dry Stout', 4.0, NULL,
 'Session-weight dry stout with roasty character at an approachable ABV.', true, true, 'beer', false),
(ar_12, id_archetype, 'Timely Surrender', 'Mixed-Culture Saison', 5.6, NULL,
 'Farmhouse saison with mixed culture fermentation for wild, funky depth.', true, true, 'beer', true),
(ar_13, id_archetype, 'False Antagonist', 'Gose', 4.0, NULL,
 'Salt-and-coriander gose. Tart and refreshing.', true, true, 'beer', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv, description = EXCLUDED.description;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 4: Merge duplicates from migration 042
-- Migration 042 seeded 5 Asheville breweries with hardcoded UUIDs (ee000001-...)
-- that duplicate the OpenBreweryDB entries enriched above. Re-point any FK
-- references to the canonical 048 entries, delete stale 043 beers (superseded
-- by the researched beers above), then remove the orphaned 042 brewery rows.
--
-- 042 → 048 mapping:
--   ee..0001 "Burial Beer Co."        → id_burial      (048 external_id b571a872)
--   ee..0002 "Green Man Brewery"      → id_green_man   (048 external_id 467e3456)
--   ee..0003 "Hi-Wire Brewing"        → id_hiwire      (048 external_id 6f18252e)
--   ee..0004 "Wicked Weed Brewing"    → id_wicked_weed (048 external_id 2849f939)
--   ee..0005 "Highland Brewing Co."   → id_highland    (048 external_id 4b013cfb)
-- ═══════════════════════════════════════════════════════════════════════════════

-- 4a. Delete stale 043 beers for Burial (6 approximate beers → replaced by 28 researched above)
DELETE FROM beers WHERE brewery_id = 'ee000001-0001-0000-0000-000000000001';

-- 4b. Re-point FK references from 042 UUIDs → 048 canonical UUIDs
--     Safe no-ops when 0 rows match. Covers every brewery_id FK table.

-- ── Burial (042 ee..0001 → 048 id_burial) ──
UPDATE beers SET brewery_id = id_burial WHERE brewery_id = 'ee000001-0001-0000-0000-000000000001';
UPDATE brewery_accounts SET brewery_id = id_burial WHERE brewery_id = 'ee000001-0001-0000-0000-000000000001';
UPDATE brewery_claims SET brewery_id = id_burial WHERE brewery_id = 'ee000001-0001-0000-0000-000000000001';
UPDATE loyalty_programs SET brewery_id = id_burial WHERE brewery_id = 'ee000001-0001-0000-0000-000000000001';
UPDATE loyalty_cards SET brewery_id = id_burial WHERE brewery_id = 'ee000001-0001-0000-0000-000000000001';
UPDATE promotions SET brewery_id = id_burial WHERE brewery_id = 'ee000001-0001-0000-0000-000000000001';
UPDATE sessions SET brewery_id = id_burial WHERE brewery_id = 'ee000001-0001-0000-0000-000000000001';
UPDATE beer_logs SET brewery_id = id_burial WHERE brewery_id = 'ee000001-0001-0000-0000-000000000001';
UPDATE brewery_follows SET brewery_id = id_burial WHERE brewery_id = 'ee000001-0001-0000-0000-000000000001';
UPDATE brewery_events SET brewery_id = id_burial WHERE brewery_id = 'ee000001-0001-0000-0000-000000000001';
UPDATE brewery_reviews SET brewery_id = id_burial WHERE brewery_id = 'ee000001-0001-0000-0000-000000000001';
UPDATE hop_route_stops SET brewery_id = id_burial WHERE brewery_id = 'ee000001-0001-0000-0000-000000000001';
UPDATE challenges SET brewery_id = id_burial WHERE brewery_id = 'ee000001-0001-0000-0000-000000000001';
UPDATE brewery_ads SET brewery_id = id_burial WHERE brewery_id = 'ee000001-0001-0000-0000-000000000001';
UPDATE mug_clubs SET brewery_id = id_burial WHERE brewery_id = 'ee000001-0001-0000-0000-000000000001';
UPDATE brand_loyalty_redemptions SET brewery_id = id_burial WHERE brewery_id = 'ee000001-0001-0000-0000-000000000001';
UPDATE brand_loyalty_cards SET last_stamp_brewery_id = id_burial WHERE last_stamp_brewery_id = 'ee000001-0001-0000-0000-000000000001';

-- ── Green Man (042 ee..0002 → 048 id_green_man) ──
UPDATE beers SET brewery_id = id_green_man WHERE brewery_id = 'ee000001-0001-0000-0000-000000000002';
UPDATE brewery_accounts SET brewery_id = id_green_man WHERE brewery_id = 'ee000001-0001-0000-0000-000000000002';
UPDATE brewery_claims SET brewery_id = id_green_man WHERE brewery_id = 'ee000001-0001-0000-0000-000000000002';
UPDATE loyalty_programs SET brewery_id = id_green_man WHERE brewery_id = 'ee000001-0001-0000-0000-000000000002';
UPDATE loyalty_cards SET brewery_id = id_green_man WHERE brewery_id = 'ee000001-0001-0000-0000-000000000002';
UPDATE promotions SET brewery_id = id_green_man WHERE brewery_id = 'ee000001-0001-0000-0000-000000000002';
UPDATE sessions SET brewery_id = id_green_man WHERE brewery_id = 'ee000001-0001-0000-0000-000000000002';
UPDATE beer_logs SET brewery_id = id_green_man WHERE brewery_id = 'ee000001-0001-0000-0000-000000000002';
UPDATE brewery_follows SET brewery_id = id_green_man WHERE brewery_id = 'ee000001-0001-0000-0000-000000000002';
UPDATE brewery_events SET brewery_id = id_green_man WHERE brewery_id = 'ee000001-0001-0000-0000-000000000002';
UPDATE brewery_reviews SET brewery_id = id_green_man WHERE brewery_id = 'ee000001-0001-0000-0000-000000000002';
UPDATE hop_route_stops SET brewery_id = id_green_man WHERE brewery_id = 'ee000001-0001-0000-0000-000000000002';
UPDATE challenges SET brewery_id = id_green_man WHERE brewery_id = 'ee000001-0001-0000-0000-000000000002';
UPDATE brewery_ads SET brewery_id = id_green_man WHERE brewery_id = 'ee000001-0001-0000-0000-000000000002';
UPDATE mug_clubs SET brewery_id = id_green_man WHERE brewery_id = 'ee000001-0001-0000-0000-000000000002';
UPDATE brand_loyalty_redemptions SET brewery_id = id_green_man WHERE brewery_id = 'ee000001-0001-0000-0000-000000000002';
UPDATE brand_loyalty_cards SET last_stamp_brewery_id = id_green_man WHERE last_stamp_brewery_id = 'ee000001-0001-0000-0000-000000000002';

-- ── Hi-Wire (042 ee..0003 → 048 id_hiwire) ──
UPDATE beers SET brewery_id = id_hiwire WHERE brewery_id = 'ee000001-0001-0000-0000-000000000003';
UPDATE brewery_accounts SET brewery_id = id_hiwire WHERE brewery_id = 'ee000001-0001-0000-0000-000000000003';
UPDATE brewery_claims SET brewery_id = id_hiwire WHERE brewery_id = 'ee000001-0001-0000-0000-000000000003';
UPDATE loyalty_programs SET brewery_id = id_hiwire WHERE brewery_id = 'ee000001-0001-0000-0000-000000000003';
UPDATE loyalty_cards SET brewery_id = id_hiwire WHERE brewery_id = 'ee000001-0001-0000-0000-000000000003';
UPDATE promotions SET brewery_id = id_hiwire WHERE brewery_id = 'ee000001-0001-0000-0000-000000000003';
UPDATE sessions SET brewery_id = id_hiwire WHERE brewery_id = 'ee000001-0001-0000-0000-000000000003';
UPDATE beer_logs SET brewery_id = id_hiwire WHERE brewery_id = 'ee000001-0001-0000-0000-000000000003';
UPDATE brewery_follows SET brewery_id = id_hiwire WHERE brewery_id = 'ee000001-0001-0000-0000-000000000003';
UPDATE brewery_events SET brewery_id = id_hiwire WHERE brewery_id = 'ee000001-0001-0000-0000-000000000003';
UPDATE brewery_reviews SET brewery_id = id_hiwire WHERE brewery_id = 'ee000001-0001-0000-0000-000000000003';
UPDATE hop_route_stops SET brewery_id = id_hiwire WHERE brewery_id = 'ee000001-0001-0000-0000-000000000003';
UPDATE challenges SET brewery_id = id_hiwire WHERE brewery_id = 'ee000001-0001-0000-0000-000000000003';
UPDATE brewery_ads SET brewery_id = id_hiwire WHERE brewery_id = 'ee000001-0001-0000-0000-000000000003';
UPDATE mug_clubs SET brewery_id = id_hiwire WHERE brewery_id = 'ee000001-0001-0000-0000-000000000003';
UPDATE brand_loyalty_redemptions SET brewery_id = id_hiwire WHERE brewery_id = 'ee000001-0001-0000-0000-000000000003';
UPDATE brand_loyalty_cards SET last_stamp_brewery_id = id_hiwire WHERE last_stamp_brewery_id = 'ee000001-0001-0000-0000-000000000003';

-- ── Wicked Weed (042 ee..0004 → 048 id_wicked_weed) ──
UPDATE beers SET brewery_id = id_wicked_weed WHERE brewery_id = 'ee000001-0001-0000-0000-000000000004';
UPDATE brewery_accounts SET brewery_id = id_wicked_weed WHERE brewery_id = 'ee000001-0001-0000-0000-000000000004';
UPDATE brewery_claims SET brewery_id = id_wicked_weed WHERE brewery_id = 'ee000001-0001-0000-0000-000000000004';
UPDATE loyalty_programs SET brewery_id = id_wicked_weed WHERE brewery_id = 'ee000001-0001-0000-0000-000000000004';
UPDATE loyalty_cards SET brewery_id = id_wicked_weed WHERE brewery_id = 'ee000001-0001-0000-0000-000000000004';
UPDATE promotions SET brewery_id = id_wicked_weed WHERE brewery_id = 'ee000001-0001-0000-0000-000000000004';
UPDATE sessions SET brewery_id = id_wicked_weed WHERE brewery_id = 'ee000001-0001-0000-0000-000000000004';
UPDATE beer_logs SET brewery_id = id_wicked_weed WHERE brewery_id = 'ee000001-0001-0000-0000-000000000004';
UPDATE brewery_follows SET brewery_id = id_wicked_weed WHERE brewery_id = 'ee000001-0001-0000-0000-000000000004';
UPDATE brewery_events SET brewery_id = id_wicked_weed WHERE brewery_id = 'ee000001-0001-0000-0000-000000000004';
UPDATE brewery_reviews SET brewery_id = id_wicked_weed WHERE brewery_id = 'ee000001-0001-0000-0000-000000000004';
UPDATE hop_route_stops SET brewery_id = id_wicked_weed WHERE brewery_id = 'ee000001-0001-0000-0000-000000000004';
UPDATE challenges SET brewery_id = id_wicked_weed WHERE brewery_id = 'ee000001-0001-0000-0000-000000000004';
UPDATE brewery_ads SET brewery_id = id_wicked_weed WHERE brewery_id = 'ee000001-0001-0000-0000-000000000004';
UPDATE mug_clubs SET brewery_id = id_wicked_weed WHERE brewery_id = 'ee000001-0001-0000-0000-000000000004';
UPDATE brand_loyalty_redemptions SET brewery_id = id_wicked_weed WHERE brewery_id = 'ee000001-0001-0000-0000-000000000004';
UPDATE brand_loyalty_cards SET last_stamp_brewery_id = id_wicked_weed WHERE last_stamp_brewery_id = 'ee000001-0001-0000-0000-000000000004';

-- ── Highland (042 ee..0005 → 048 id_highland) ──
UPDATE beers SET brewery_id = id_highland WHERE brewery_id = 'ee000001-0001-0000-0000-000000000005';
UPDATE brewery_accounts SET brewery_id = id_highland WHERE brewery_id = 'ee000001-0001-0000-0000-000000000005';
UPDATE brewery_claims SET brewery_id = id_highland WHERE brewery_id = 'ee000001-0001-0000-0000-000000000005';
UPDATE loyalty_programs SET brewery_id = id_highland WHERE brewery_id = 'ee000001-0001-0000-0000-000000000005';
UPDATE loyalty_cards SET brewery_id = id_highland WHERE brewery_id = 'ee000001-0001-0000-0000-000000000005';
UPDATE promotions SET brewery_id = id_highland WHERE brewery_id = 'ee000001-0001-0000-0000-000000000005';
UPDATE sessions SET brewery_id = id_highland WHERE brewery_id = 'ee000001-0001-0000-0000-000000000005';
UPDATE beer_logs SET brewery_id = id_highland WHERE brewery_id = 'ee000001-0001-0000-0000-000000000005';
UPDATE brewery_follows SET brewery_id = id_highland WHERE brewery_id = 'ee000001-0001-0000-0000-000000000005';
UPDATE brewery_events SET brewery_id = id_highland WHERE brewery_id = 'ee000001-0001-0000-0000-000000000005';
UPDATE brewery_reviews SET brewery_id = id_highland WHERE brewery_id = 'ee000001-0001-0000-0000-000000000005';
UPDATE hop_route_stops SET brewery_id = id_highland WHERE brewery_id = 'ee000001-0001-0000-0000-000000000005';
UPDATE challenges SET brewery_id = id_highland WHERE brewery_id = 'ee000001-0001-0000-0000-000000000005';
UPDATE brewery_ads SET brewery_id = id_highland WHERE brewery_id = 'ee000001-0001-0000-0000-000000000005';
UPDATE mug_clubs SET brewery_id = id_highland WHERE brewery_id = 'ee000001-0001-0000-0000-000000000005';
UPDATE brand_loyalty_redemptions SET brewery_id = id_highland WHERE brewery_id = 'ee000001-0001-0000-0000-000000000005';
UPDATE brand_loyalty_cards SET last_stamp_brewery_id = id_highland WHERE last_stamp_brewery_id = 'ee000001-0001-0000-0000-000000000005';

-- 4c. Delete the 5 orphaned 042 brewery rows
DELETE FROM breweries WHERE id IN (
  'ee000001-0001-0000-0000-000000000001',
  'ee000001-0001-0000-0000-000000000002',
  'ee000001-0001-0000-0000-000000000003',
  'ee000001-0001-0000-0000-000000000004',
  'ee000001-0001-0000-0000-000000000005'
);

RAISE NOTICE '🧹 Migration 114: Merged 5 duplicate Asheville breweries (042 → 048)';

-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE: 11 breweries enriched, 180 beers seeded, 5 duplicates merged.
-- ═══════════════════════════════════════════════════════════════════════════════

RAISE NOTICE '✅ Migration 114: Asheville enrichment complete — 11 breweries, 180 beers, 5 deduped';

END $$;
