-- ─────────────────────────────────────────────────────────────────────────────
-- Seed 009: Feed Activity — Sessions, Reviews, Active Friends
-- Sprint 26 "The Glow-Up" — populates the home feed with realistic content.
--
-- Creates:
--   ~24 completed sessions across test users at Asheville + Austin breweries
--   ~65 beer_logs with ratings and comments
--   2 active sessions (DrinkingNow)
--   14 beer_reviews
--   8 brewery_reviews
--   Friendships between test users
--   Beer of the Week flags
--
-- Run AFTER seeds 002–008 and migrations through 032.
-- Safe to re-run (ON CONFLICT DO NOTHING throughout).
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  -- Test user UUIDs (from seed 003)
  u01 uuid := 'cc000000-0000-0000-0000-000000000001'; -- Alex Chen
  u02 uuid := 'cc000000-0000-0000-0000-000000000002'; -- Marcus Johnson
  u03 uuid := 'cc000000-0000-0000-0000-000000000003'; -- Priya Patel
  u04 uuid := 'cc000000-0000-0000-0000-000000000004'; -- Derek Walsh
  u05 uuid := 'cc000000-0000-0000-0000-000000000005'; -- Sam Rivera
  u06 uuid := 'cc000000-0000-0000-0000-000000000006'; -- Linda Ko
  u07 uuid := 'cc000000-0000-0000-0000-000000000007'; -- Tom Nguyen
  u08 uuid := 'cc000000-0000-0000-0000-000000000008'; -- Jessica Blake
  u09 uuid := 'cc000000-0000-0000-0000-000000000009'; -- Carlos Mendez
  u10 uuid := 'cc000000-0000-0000-0000-000000000010'; -- Rachel Foster
  u11 uuid := 'cc000000-0000-0000-0000-000000000011'; -- James OToole
  u12 uuid := 'cc000000-0000-0000-0000-000000000012'; -- Nina Sharma

  -- Asheville brewery IDs (from migration 024)
  brew_mtn uuid := 'dd000001-0000-0000-0000-000000000001'; -- Mountain Ridge
  brew_riv uuid := 'dd000001-0000-0000-0000-000000000002'; -- River Bend
  brew_smk uuid := 'dd000001-0000-0000-0000-000000000003'; -- Smoky Barrel

  -- Asheville beer IDs (from migration 024)
  mtn_b01 uuid := 'dd000004-0001-0000-0000-000000000001'; -- Ridgeline IPA
  mtn_b02 uuid := 'dd000004-0001-0000-0000-000000000002'; -- Summit Sunset Hazy
  mtn_b03 uuid := 'dd000004-0001-0000-0000-000000000003'; -- Trailhead Lager
  mtn_b04 uuid := 'dd000004-0001-0000-0000-000000000004'; -- Appalachian Amber
  mtn_b05 uuid := 'dd000004-0001-0000-0000-000000000005'; -- Dark Hollow Stout
  mtn_b06 uuid := 'dd000004-0001-0000-0000-000000000006'; -- Wildflower Wheat
  mtn_b07 uuid := 'dd000004-0001-0000-0000-000000000007'; -- Bear Creek DIPA
  riv_b01 uuid := 'dd000004-0002-0000-0000-000000000001'; -- French Broad Belgian
  riv_b02 uuid := 'dd000004-0002-0000-0000-000000000002'; -- Riverside Saison
  riv_b03 uuid := 'dd000004-0002-0000-0000-000000000003'; -- Barrel Room Sour
  riv_b04 uuid := 'dd000004-0002-0000-0000-000000000004'; -- Cottonwood Kolsch
  riv_b05 uuid := 'dd000004-0002-0000-0000-000000000005'; -- Biltmore Pilsner
  riv_b06 uuid := 'dd000004-0002-0000-0000-000000000006'; -- Monks Garden Tripel
  smk_b01 uuid := 'dd000004-0003-0000-0000-000000000001'; -- Smokehouse Porter
  smk_b02 uuid := 'dd000004-0003-0000-0000-000000000002'; -- Barrel-Aged Imperial
  smk_b03 uuid := 'dd000004-0003-0000-0000-000000000003'; -- Firepit Red
  smk_b04 uuid := 'dd000004-0003-0000-0000-000000000004'; -- Timber Creek Pale
  smk_b05 uuid := 'dd000004-0003-0000-0000-000000000005'; -- Mountain Mead
  smk_b06 uuid := 'dd000004-0003-0000-0000-000000000006'; -- Whittled Down Wit

  -- Austin brewery IDs (from seed 007)
  pp_id  uuid := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'; -- Pint & Pixel
  hf_id  uuid := 'c3d4e5f6-a7b8-9012-cdef-012345678902'; -- Hopfield Brewing
  lc_id  uuid := 'd4e5f6a7-b8c9-0123-defa-123456789003'; -- Lost Creek

  -- Austin beer IDs (from seed 007)
  hf_hazy uuid := 'b8c9d0e1-f2a3-4567-bcde-567890123407'; -- Hazy Daze
  lc_ipa  uuid := 'e1f2a3b4-c5d6-7890-efab-890123456700'; -- Spring Branch IPA
  lc_kolsch uuid := 'f2a3b4c5-d6e7-8901-fabc-901234567801'; -- Barton Kolsch

  -- Session IDs for this seed (fixed UUIDs, bb prefix)
  fs01 uuid := 'bb000009-0000-0000-0000-000000000001';
  fs02 uuid := 'bb000009-0000-0000-0000-000000000002';
  fs03 uuid := 'bb000009-0000-0000-0000-000000000003';
  fs04 uuid := 'bb000009-0000-0000-0000-000000000004';
  fs05 uuid := 'bb000009-0000-0000-0000-000000000005';
  fs06 uuid := 'bb000009-0000-0000-0000-000000000006';
  fs07 uuid := 'bb000009-0000-0000-0000-000000000007';
  fs08 uuid := 'bb000009-0000-0000-0000-000000000008';
  fs09 uuid := 'bb000009-0000-0000-0000-000000000009';
  fs10 uuid := 'bb000009-0000-0000-0000-000000000010';
  fs11 uuid := 'bb000009-0000-0000-0000-000000000011';
  fs12 uuid := 'bb000009-0000-0000-0000-000000000012';
  fs13 uuid := 'bb000009-0000-0000-0000-000000000013';
  fs14 uuid := 'bb000009-0000-0000-0000-000000000014';
  fs15 uuid := 'bb000009-0000-0000-0000-000000000015';
  fs16 uuid := 'bb000009-0000-0000-0000-000000000016';
  fs17 uuid := 'bb000009-0000-0000-0000-000000000017';
  fs18 uuid := 'bb000009-0000-0000-0000-000000000018';
  fs19 uuid := 'bb000009-0000-0000-0000-000000000019';
  fs20 uuid := 'bb000009-0000-0000-0000-000000000020';
  fs21 uuid := 'bb000009-0000-0000-0000-000000000021'; -- ACTIVE session
  fs22 uuid := 'bb000009-0000-0000-0000-000000000022'; -- ACTIVE session
  fs23 uuid := 'bb000009-0000-0000-0000-000000000023';
  fs24 uuid := 'bb000009-0000-0000-0000-000000000024';

BEGIN

-- ── 1. Friendships between test users (so their feeds cross) ──────────────
INSERT INTO friendships (requester_id, addressee_id, status, created_at) VALUES
  (u01, u02, 'accepted', now() - interval '40 days'),
  (u01, u03, 'accepted', now() - interval '38 days'),
  (u02, u04, 'accepted', now() - interval '35 days'),
  (u03, u05, 'accepted', now() - interval '33 days'),
  (u04, u06, 'accepted', now() - interval '30 days'),
  (u05, u08, 'accepted', now() - interval '28 days'),
  (u06, u07, 'accepted', now() - interval '25 days'),
  (u07, u10, 'accepted', now() - interval '22 days'),
  (u08, u09, 'accepted', now() - interval '20 days'),
  (u09, u12, 'accepted', now() - interval '18 days'),
  (u10, u11, 'accepted', now() - interval '15 days'),
  (u11, u12, 'accepted', now() - interval '12 days'),
  (u01, u08, 'accepted', now() - interval '10 days'),
  (u03, u10, 'accepted', now() - interval '8 days')
ON CONFLICT (requester_id, addressee_id) DO NOTHING;

-- ── 2. Completed sessions (last 7 days, various users, Asheville breweries) ─
INSERT INTO sessions (id, user_id, brewery_id, context, is_active, share_to_feed, xp_awarded, started_at, ended_at) VALUES
  -- 6 days ago — Alex & Marcus at Mountain Ridge
  (fs01, u01, brew_mtn, 'brewery', false, true, 145, now() - interval '6 days' + interval '17 hours', now() - interval '6 days' + interval '20 hours'),
  (fs02, u02, brew_mtn, 'brewery', false, true, 130, now() - interval '6 days' + interval '17 hours', now() - interval '6 days' + interval '19 hours'),
  -- 5 days ago — Priya at River Bend, Linda at Smoky Barrel
  (fs03, u03, brew_riv, 'brewery', false, true, 170, now() - interval '5 days' + interval '14 hours', now() - interval '5 days' + interval '18 hours'),
  (fs04, u06, brew_smk, 'brewery', false, true, 155, now() - interval '5 days' + interval '16 hours', now() - interval '5 days' + interval '19 hours'),
  -- 4 days ago — Jessica big night at Mountain Ridge
  (fs05, u08, brew_mtn, 'brewery', false, true, 195, now() - interval '4 days' + interval '16 hours', now() - interval '4 days' + interval '21 hours'),
  -- 4 days ago — Derek at River Bend
  (fs06, u04, brew_riv, 'brewery', false, true, 135, now() - interval '4 days' + interval '18 hours', now() - interval '4 days' + interval '20 hours'),
  -- 3 days ago — Sam & Rachel at Mountain Ridge
  (fs07, u05, brew_mtn, 'brewery', false, true, 145, now() - interval '3 days' + interval '15 hours', now() - interval '3 days' + interval '18 hours'),
  (fs08, u10, brew_mtn, 'brewery', false, true, 160, now() - interval '3 days' + interval '15 hours', now() - interval '3 days' + interval '19 hours'),
  -- 3 days ago — Tom at Smoky Barrel
  (fs09, u07, brew_smk, 'brewery', false, true, 150, now() - interval '3 days' + interval '17 hours', now() - interval '3 days' + interval '20 hours'),
  -- 2 days ago — Alex at River Bend, Nina at Smoky Barrel
  (fs10, u01, brew_riv, 'brewery', false, true, 175, now() - interval '2 days' + interval '13 hours', now() - interval '2 days' + interval '17 hours'),
  (fs11, u12, brew_smk, 'brewery', false, true, 130, now() - interval '2 days' + interval '16 hours', now() - interval '2 days' + interval '18 hours'),
  -- 2 days ago — Carlos first brewery visit!
  (fs12, u09, brew_mtn, 'brewery', false, true, 110, now() - interval '2 days' + interval '18 hours', now() - interval '2 days' + interval '20 hours'),
  -- Yesterday — Priya & Jessica at River Bend
  (fs13, u03, brew_riv, 'brewery', false, true, 185, now() - interval '1 day' + interval '16 hours', now() - interval '1 day' + interval '20 hours'),
  (fs14, u08, brew_riv, 'brewery', false, true, 165, now() - interval '1 day' + interval '16 hours', now() - interval '1 day' + interval '19 hours'),
  -- Yesterday — James at Mountain Ridge
  (fs15, u11, brew_mtn, 'brewery', false, true, 155, now() - interval '1 day' + interval '14 hours', now() - interval '1 day' + interval '17 hours'),
  -- Yesterday — Linda home session
  (fs16, u06, NULL, 'home', false, true, 100, now() - interval '1 day' + interval '20 hours', now() - interval '1 day' + interval '22 hours'),
  -- Today (earlier) — Marcus at Smoky Barrel
  (fs17, u02, brew_smk, 'brewery', false, true, 140, now() - interval '8 hours', now() - interval '5 hours'),
  -- Today (earlier) — Derek home session
  (fs18, u04, NULL, 'home', false, true, 85, now() - interval '6 hours', now() - interval '4 hours'),
  -- Some Austin sessions (older, show geographic variety)
  (fs19, u01, hf_id, 'brewery', false, true, 150, now() - interval '7 days' + interval '18 hours', now() - interval '7 days' + interval '21 hours'),
  (fs20, u08, lc_id, 'brewery', false, true, 140, now() - interval '7 days' + interval '19 hours', now() - interval '7 days' + interval '22 hours'),
  -- Older sessions for depth
  (fs23, u10, brew_smk, 'brewery', false, true, 165, now() - interval '8 days' + interval '15 hours', now() - interval '8 days' + interval '19 hours'),
  (fs24, u05, brew_riv, 'brewery', false, true, 135, now() - interval '9 days' + interval '16 hours', now() - interval '9 days' + interval '18 hours')
ON CONFLICT (id) DO NOTHING;

-- ── 3. ACTIVE sessions (DrinkingNow) ──────────────────────────────────────
-- These must have started_at within ~2h for /api/friends/active to return them
INSERT INTO sessions (id, user_id, brewery_id, context, is_active, share_to_feed, xp_awarded, started_at, ended_at) VALUES
  -- Rachel is at Mountain Ridge RIGHT NOW
  (fs21, u10, brew_mtn, 'brewery', true, true, 0, now() - interval '45 minutes', NULL),
  -- Marcus is at River Bend RIGHT NOW
  (fs22, u02, brew_riv, 'brewery', true, true, 0, now() - interval '1 hour 15 minutes', NULL)
ON CONFLICT (id) DO NOTHING;

-- ── 4. Beer logs for completed sessions ───────────────────────────────────
INSERT INTO beer_logs (session_id, user_id, beer_id, brewery_id, quantity, rating, flavor_tags, serving_style, comment, logged_at) VALUES
  -- fs01: Alex at Mountain Ridge (3 beers)
  (fs01, u01, mtn_b01, brew_mtn, 1, 5.0, ARRAY['citrus','tropical','hoppy'], 'draft', 'Ridgeline IPA is an instant top-5 for me. Asheville does not mess around.', now() - interval '6 days' + interval '17 hours' + interval '15 min'),
  (fs01, u01, mtn_b02, brew_mtn, 1, 4.5, ARRAY['mango','guava','creamy'], 'draft', 'Summit Sunset Hazy lives up to the name. Pillowy.', now() - interval '6 days' + interval '18 hours'),
  (fs01, u01, mtn_b05, brew_mtn, 1, 4.0, ARRAY['chocolate','roasty'], 'draft', NULL, now() - interval '6 days' + interval '19 hours'),
  -- fs02: Marcus at Mountain Ridge (2 beers)
  (fs02, u02, mtn_b05, brew_mtn, 1, 5.0, ARRAY['roasty','chocolate','smooth'], 'draft', 'Dark Hollow Stout might be the best stout I have ever had. I said what I said.', now() - interval '6 days' + interval '17 hours' + interval '20 min'),
  (fs02, u02, mtn_b04, brew_mtn, 1, 4.0, ARRAY['caramel','malty'], 'draft', NULL, now() - interval '6 days' + interval '18 hours' + interval '30 min'),
  -- fs03: Priya at River Bend (4 beers — big sour tour)
  (fs03, u03, riv_b03, brew_riv, 1, 5.0, ARRAY['tart','cherry','funky'], 'draft', 'Barrel Room Sour. I am home. This is where I live now.', now() - interval '5 days' + interval '14 hours' + interval '10 min'),
  (fs03, u03, riv_b02, brew_riv, 1, 4.5, ARRAY['peppery','citrus','dry'], 'draft', 'Riverside Saison is bone-dry perfection.', now() - interval '5 days' + interval '15 hours'),
  (fs03, u03, riv_b01, brew_riv, 1, 4.0, ARRAY['fruity','spicy','complex'], 'draft', NULL, now() - interval '5 days' + interval '16 hours'),
  (fs03, u03, riv_b04, brew_riv, 1, 4.5, ARRAY['crisp','effervescent'], 'draft', 'Palate cleanser Kolsch. Chef kiss.', now() - interval '5 days' + interval '17 hours'),
  -- fs04: Linda at Smoky Barrel (3 beers)
  (fs04, u06, smk_b01, brew_smk, 1, 4.5, ARRAY['smoke','chocolate','vanilla'], 'draft', 'Smokehouse Porter by the fireplace. Peak cozy.', now() - interval '5 days' + interval '16 hours' + interval '15 min'),
  (fs04, u06, smk_b03, brew_smk, 1, 4.0, ARRAY['caramel','toasty','smoke'], 'draft', NULL, now() - interval '5 days' + interval '17 hours'),
  (fs04, u06, smk_b06, brew_smk, 1, 4.0, ARRAY['wheat','citrus','coriander'], 'draft', 'Light finish after the dark beers. Smart move.', now() - interval '5 days' + interval '18 hours'),
  -- fs05: Jessica big night at Mountain Ridge (5 beers!)
  (fs05, u08, mtn_b01, brew_mtn, 1, 5.0, ARRAY['citrus','pine','tropical'], 'draft', 'Started strong with the Ridgeline. No regrets.', now() - interval '4 days' + interval '16 hours'),
  (fs05, u08, mtn_b02, brew_mtn, 1, 5.0, ARRAY['mango','creamy','juicy'], 'draft', 'Summit Sunset Hazy — this is the one. Ordering again.', now() - interval '4 days' + interval '17 hours'),
  (fs05, u08, mtn_b07, brew_mtn, 1, 4.5, ARRAY['resinous','dank','pine'], 'draft', 'Bear Creek DIPA hits different at altitude.', now() - interval '4 days' + interval '18 hours'),
  (fs05, u08, mtn_b05, brew_mtn, 1, 4.5, ARRAY['chocolate','espresso'], 'draft', NULL, now() - interval '4 days' + interval '19 hours'),
  (fs05, u08, mtn_b03, brew_mtn, 1, 4.0, ARRAY['crisp','clean'], 'draft', 'Trailhead Lager to wind down. Perfect closer.', now() - interval '4 days' + interval '20 hours'),
  -- fs06: Derek at River Bend (2 beers)
  (fs06, u04, riv_b01, brew_riv, 1, 4.0, ARRAY['fruity','spicy'], 'draft', 'Belgian style is growing on me.', now() - interval '4 days' + interval '18 hours' + interval '15 min'),
  (fs06, u04, riv_b05, brew_riv, 1, 4.5, ARRAY['bready','noble hops','clean'], 'draft', 'Biltmore Pilsner — proper Czech style. Respect.', now() - interval '4 days' + interval '19 hours'),
  -- fs07: Sam at Mountain Ridge (3 beers)
  (fs07, u05, mtn_b03, brew_mtn, 1, 5.0, ARRAY['crisp','clean','refreshing'], 'draft', 'Trailhead Lager proves pilsners can compete anywhere.', now() - interval '3 days' + interval '15 hours' + interval '10 min'),
  (fs07, u05, mtn_b06, brew_mtn, 1, 4.0, ARRAY['honey','chamomile','light'], 'draft', NULL, now() - interval '3 days' + interval '16 hours'),
  (fs07, u05, mtn_b01, brew_mtn, 1, 4.5, ARRAY['citrus','pine'], 'draft', NULL, now() - interval '3 days' + interval '17 hours'),
  -- fs08: Rachel at Mountain Ridge (3 beers)
  (fs08, u10, mtn_b05, brew_mtn, 1, 5.0, ARRAY['chocolate','roasty','silky'], 'draft', 'Dark Hollow Stout is an experience. Wow.', now() - interval '3 days' + interval '15 hours' + interval '20 min'),
  (fs08, u10, mtn_b01, brew_mtn, 1, 4.5, ARRAY['tropical','piney'], 'draft', NULL, now() - interval '3 days' + interval '16 hours' + interval '30 min'),
  (fs08, u10, mtn_b04, brew_mtn, 1, 4.0, ARRAY['caramel','biscuit'], 'draft', 'Appalachian Amber as the closer. Solid.', now() - interval '3 days' + interval '18 hours'),
  -- fs09: Tom at Smoky Barrel (3 beers — DIPA focus)
  (fs09, u07, smk_b02, brew_smk, 1, 5.0, ARRAY['bourbon','dark chocolate','oak'], 'draft', 'Barrel-Aged Imperial. 10.5%. I can feel my soul leaving.', now() - interval '3 days' + interval '17 hours' + interval '15 min'),
  (fs09, u07, smk_b01, brew_smk, 1, 4.0, ARRAY['smoke','chocolate'], 'draft', NULL, now() - interval '3 days' + interval '18 hours'),
  (fs09, u07, smk_b04, brew_smk, 1, 3.5, ARRAY['citrus','floral'], 'draft', 'After a 10.5% imperial, everything tastes mild.', now() - interval '3 days' + interval '19 hours'),
  -- fs10: Alex at River Bend (4 beers — Belgian tour)
  (fs10, u01, riv_b06, brew_riv, 1, 5.0, ARRAY['golden','strong','smooth'], 'draft', 'Monks Garden Tripel is dangerously drinkable for 9.2%.', now() - interval '2 days' + interval '13 hours' + interval '15 min'),
  (fs10, u01, riv_b01, brew_riv, 1, 4.5, ARRAY['fruity','complex','yeasty'], 'draft', NULL, now() - interval '2 days' + interval '14 hours'),
  (fs10, u01, riv_b03, brew_riv, 1, 4.5, ARRAY['tart','cherry','oak'], 'draft', 'The sour program here is no joke.', now() - interval '2 days' + interval '15 hours'),
  (fs10, u01, riv_b02, brew_riv, 1, 4.0, ARRAY['peppery','dry'], 'draft', NULL, now() - interval '2 days' + interval '16 hours'),
  -- fs11: Nina at Smoky Barrel (2 beers)
  (fs11, u12, smk_b05, brew_smk, 1, 4.5, ARRAY['floral','honey','dry'], 'draft', 'Mountain Mead! I did not expect to love this.', now() - interval '2 days' + interval '16 hours' + interval '10 min'),
  (fs11, u12, smk_b06, brew_smk, 1, 4.0, ARRAY['wheat','coriander','orange'], 'draft', NULL, now() - interval '2 days' + interval '17 hours'),
  -- fs12: Carlos first brewery visit (2 beers — newcomer)
  (fs12, u09, mtn_b03, brew_mtn, 1, 4.0, ARRAY['crisp','clean'], 'draft', 'First time at a brewery! Started with the lager. Really good!', now() - interval '2 days' + interval '18 hours' + interval '10 min'),
  (fs12, u09, mtn_b06, brew_mtn, 1, 4.5, ARRAY['honey','light','refreshing'], 'draft', 'Wildflower Wheat is amazing. I get the craft beer thing now.', now() - interval '2 days' + interval '19 hours'),
  -- fs13: Priya at River Bend again (3 beers)
  (fs13, u03, riv_b03, brew_riv, 1, 5.0, ARRAY['tart','funky','oak'], 'draft', 'Second time this week. Barrel Room Sour is my personality now.', now() - interval '1 day' + interval '16 hours' + interval '15 min'),
  (fs13, u03, riv_b06, brew_riv, 1, 4.5, ARRAY['golden','boozy','smooth'], 'draft', 'Monks Garden Tripel. Strong choice after the sour.', now() - interval '1 day' + interval '17 hours' + interval '30 min'),
  (fs13, u03, riv_b04, brew_riv, 1, 4.0, ARRAY['effervescent','crisp'], 'draft', NULL, now() - interval '1 day' + interval '18 hours' + interval '45 min'),
  -- fs14: Jessica at River Bend (3 beers)
  (fs14, u08, riv_b01, brew_riv, 1, 4.5, ARRAY['fruity','spicy','complex'], 'draft', 'French Broad Belgian is right up my alley.', now() - interval '1 day' + interval '16 hours' + interval '20 min'),
  (fs14, u08, riv_b03, brew_riv, 1, 4.5, ARRAY['tart','cherry'], 'draft', 'Priya was right about the sour.', now() - interval '1 day' + interval '17 hours'),
  (fs14, u08, riv_b02, brew_riv, 1, 4.0, ARRAY['peppery','dry','citrus'], 'draft', NULL, now() - interval '1 day' + interval '18 hours'),
  -- fs15: James at Mountain Ridge (3 beers)
  (fs15, u11, mtn_b01, brew_mtn, 1, 4.5, ARRAY['citrus','tropical'], 'draft', 'Flew in from Dallas for this. Ridgeline IPA delivers.', now() - interval '1 day' + interval '14 hours' + interval '15 min'),
  (fs15, u11, mtn_b02, brew_mtn, 1, 5.0, ARRAY['mango','guava','pillowy'], 'draft', 'Summit Sunset Hazy — best hazy IPA east of the Mississippi.', now() - interval '1 day' + interval '15 hours'),
  (fs15, u11, mtn_b07, brew_mtn, 1, 4.0, ARRAY['resinous','bold'], 'draft', NULL, now() - interval '1 day' + interval '16 hours'),
  -- fs16: Linda home session (2 beers)
  (fs16, u06, mtn_b01, brew_mtn, 1, 4.5, ARRAY['citrus','tropical'], 'can', 'Growler from Mountain Ridge. Still tastes incredible at home.', now() - interval '1 day' + interval '20 hours' + interval '15 min'),
  (fs16, u06, smk_b01, brew_smk, 1, 4.0, ARRAY['smoke','chocolate'], 'can', NULL, now() - interval '1 day' + interval '21 hours'),
  -- fs17: Marcus at Smoky Barrel today (3 beers)
  (fs17, u02, smk_b01, brew_smk, 1, 4.5, ARRAY['smoke','chocolate','vanilla'], 'draft', 'Smokehouse Porter is exactly my vibe.', now() - interval '8 hours' + interval '15 min'),
  (fs17, u02, smk_b02, brew_smk, 1, 5.0, ARRAY['bourbon','chocolate','oak'], 'draft', 'Barrel-Aged Imperial. Life-changing. Genuinely.', now() - interval '7 hours'),
  (fs17, u02, smk_b03, brew_smk, 1, 4.0, ARRAY['toasty','caramel','smoke'], 'draft', NULL, now() - interval '6 hours'),
  -- fs18: Derek home session (1 beer)
  (fs18, u04, riv_b05, brew_riv, 1, 4.0, ARRAY['bready','clean'], 'bottle', 'Biltmore Pilsner from the bottle. Still great.', now() - interval '5 hours' + interval '30 min'),
  -- fs19: Alex at Hopfield Austin (2 beers)
  (fs19, u01, hf_hazy, hf_id, 1, 4.5, ARRAY['mango','passionfruit','smooth'], 'draft', 'Hazy Daze is the real deal.', now() - interval '7 days' + interval '18 hours' + interval '15 min'),
  (fs19, u01, hf_hazy, hf_id, 1, 4.5, ARRAY['mango','passionfruit'], 'draft', 'Had another. No shame.', now() - interval '7 days' + interval '19 hours' + interval '30 min'),
  -- fs20: Jessica at Lost Creek Austin (2 beers)
  (fs20, u08, lc_ipa, lc_id, 1, 4.0, ARRAY['pine','grapefruit','resinous'], 'draft', NULL, now() - interval '7 days' + interval '19 hours' + interval '15 min'),
  (fs20, u08, lc_kolsch, lc_id, 1, 4.5, ARRAY['bright','crisp','crushable'], 'draft', 'Barton Kolsch is dangerously crushable.', now() - interval '7 days' + interval '20 hours'),
  -- fs23: Rachel at Smoky Barrel (3 beers)
  (fs23, u10, smk_b01, brew_smk, 1, 4.5, ARRAY['smoke','vanilla','chocolate'], 'draft', 'Smokehouse Porter fans unite.', now() - interval '8 days' + interval '15 hours' + interval '10 min'),
  (fs23, u10, smk_b05, brew_smk, 1, 4.0, ARRAY['floral','honey'], 'draft', NULL, now() - interval '8 days' + interval '16 hours'),
  (fs23, u10, smk_b02, brew_smk, 1, 5.0, ARRAY['bourbon','dark chocolate','oak'], 'draft', 'Barrel-Aged Imperial is the real deal.', now() - interval '8 days' + interval '17 hours' + interval '30 min'),
  -- fs24: Sam at River Bend (2 beers)
  (fs24, u05, riv_b04, brew_riv, 1, 4.5, ARRAY['crisp','delicate'], 'draft', 'Cottonwood Kolsch scratches the pilsner itch.', now() - interval '9 days' + interval '16 hours' + interval '10 min'),
  (fs24, u05, riv_b05, brew_riv, 1, 4.5, ARRAY['bready','noble hops'], 'draft', NULL, now() - interval '9 days' + interval '17 hours')
ON CONFLICT DO NOTHING;

-- ── 5. Beer logs for ACTIVE sessions ──────────────────────────────────────
INSERT INTO beer_logs (session_id, user_id, beer_id, brewery_id, quantity, rating, flavor_tags, serving_style, comment, logged_at) VALUES
  -- Rachel at Mountain Ridge (active, 2 beers so far)
  (fs21, u10, mtn_b01, brew_mtn, 1, 4.5, ARRAY['citrus','tropical'], 'draft', NULL, now() - interval '40 minutes'),
  (fs21, u10, mtn_b02, brew_mtn, 1, NULL, NULL, 'draft', NULL, now() - interval '15 minutes'),
  -- Marcus at River Bend (active, 1 beer so far)
  (fs22, u02, riv_b01, brew_riv, 1, 4.0, ARRAY['fruity','spicy'], 'draft', NULL, now() - interval '1 hour')
ON CONFLICT DO NOTHING;

-- ── 6. Beer reviews (dedicated reviews, not session ratings) ──────────────
INSERT INTO beer_reviews (user_id, beer_id, rating, comment, created_at) VALUES
  (u01, mtn_b01, 5, 'Best IPA in Asheville. The citrus and tropical notes are perfectly balanced. This is what craft beer should be.', now() - interval '5 days'),
  (u08, mtn_b02, 5, 'Summit Sunset Hazy is pillowy perfection. I dream about this beer.', now() - interval '4 days'),
  (u02, mtn_b05, 5, 'Dark Hollow Stout is a masterpiece. Rich, silky, complex — everything you want.', now() - interval '5 days'),
  (u03, riv_b03, 5, 'Barrel Room Sour changed my relationship with beer. The oak aging adds incredible depth.', now() - interval '4 days'),
  (u07, smk_b02, 5, 'Barrel-Aged Imperial at 10.5% but drinks like velvet. Bourbon notes are incredible.', now() - interval '3 days'),
  (u05, mtn_b03, 5, 'Finally, a craft lager that proves simplicity is an art. Trailhead is perfect.', now() - interval '3 days'),
  (u10, smk_b01, 4, 'Smokehouse Porter is cozy in a glass. Beechwood smoke and chocolate. Beautiful.', now() - interval '2 days'),
  (u06, mtn_b06, 4, 'Wildflower Wheat with honey and chamomile is so unique. Summer beer of the year.', now() - interval '2 days'),
  (u12, smk_b05, 5, 'Mountain Mead is a revelation. Dry, floral, effervescent — nothing like what I expected.', now() - interval '2 days'),
  (u01, riv_b06, 5, 'Monks Garden Tripel is dangerously smooth for 9.2%. Belgian perfection in Asheville.', now() - interval '1 day'),
  (u11, mtn_b02, 5, 'Summit Sunset Hazy — worth the flight from Dallas. Best hazy IPA I have had.', now() - interval '1 day'),
  (u08, riv_b03, 4, 'Great sour. The cherry and funk play off each other beautifully.', now() - interval '1 day'),
  (u04, riv_b05, 4, 'Biltmore Pilsner does Czech style right. Bready, crisp, no nonsense.', now() - interval '12 hours'),
  (u09, mtn_b06, 5, 'I am a craft beer convert. Wildflower Wheat is my gateway drug.', now() - interval '6 hours')
ON CONFLICT (user_id, beer_id) DO NOTHING;

-- ── 7. Brewery reviews ────────────────────────────────────────────────────
INSERT INTO brewery_reviews (user_id, brewery_id, rating, comment, created_at) VALUES
  (u01, brew_mtn, 5, 'Mountain Ridge is the total package. Views, vibes, and the best beer in Asheville.', now() - interval '5 days'),
  (u08, brew_mtn, 5, 'Incredible brewery. The tap list is deep and every single beer delivers.', now() - interval '4 days'),
  (u03, brew_riv, 5, 'River Bend is a sour lovers paradise. The barrel room tour is a must.', now() - interval '4 days'),
  (u06, brew_smk, 4, 'Smoky Barrel is cozy and unique. The smoked malts are a signature. Fireplace is a plus.', now() - interval '5 days'),
  (u07, brew_smk, 5, 'If you like dark, bold, barrel-aged beers — Smoky Barrel is your church.', now() - interval '3 days'),
  (u05, brew_mtn, 4, 'Great brewery with a clean, crushable lager. The view from the patio is unreal.', now() - interval '3 days'),
  (u10, brew_smk, 4, 'The porter alone is worth the drive to Black Mountain. Board games and a fireplace seal the deal.', now() - interval '2 days'),
  (u11, brew_mtn, 5, 'I fly from Dallas monthly. Mountain Ridge is the reason.', now() - interval '1 day')
ON CONFLICT (user_id, brewery_id) DO NOTHING;

-- ── 8. Beer of the Week — already set in migration 024, ensure flags ──────
-- mtn_b02 (Summit Sunset Hazy) and riv_b01 (French Broad Belgian) are featured
UPDATE beers SET is_featured = true WHERE id IN (mtn_b02, riv_b01);

RAISE NOTICE '== Seed 009: Feed activity seeded ==';
RAISE NOTICE '   22 completed sessions + 2 active sessions';
RAISE NOTICE '   ~65 beer logs with ratings';
RAISE NOTICE '   14 beer reviews, 8 brewery reviews';
RAISE NOTICE '   14 inter-user friendships';
RAISE NOTICE '   Beer of the Week: Summit Sunset Hazy, French Broad Belgian';

END $$;

-- ── 9. Link real (non-test) users to demo breweries as verified owners ────────
-- This runs OUTSIDE the DO block so it works with service-role context.
-- Finds any profile whose ID is not one of the 12 fixed test users or the
-- testflight seed user, then creates brewery_accounts for all 4 demo breweries.
-- Safe to re-run (ON CONFLICT DO UPDATE enforces verified = true).
INSERT INTO brewery_accounts (user_id, brewery_id, role, verified, verified_at)
SELECT p.id, brew_id, 'owner', true, now()
FROM profiles p,
  unnest(ARRAY[
    'dd000001-0000-0000-0000-000000000001'::uuid,  -- Mountain Ridge
    'dd000001-0000-0000-0000-000000000002'::uuid,  -- River Bend
    'dd000001-0000-0000-0000-000000000003'::uuid,  -- Smoky Barrel
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid   -- Pint & Pixel
  ]) AS brew_id
WHERE p.id NOT IN (
  'cc000000-0000-0000-0000-000000000001'::uuid,
  'cc000000-0000-0000-0000-000000000002'::uuid,
  'cc000000-0000-0000-0000-000000000003'::uuid,
  'cc000000-0000-0000-0000-000000000004'::uuid,
  'cc000000-0000-0000-0000-000000000005'::uuid,
  'cc000000-0000-0000-0000-000000000006'::uuid,
  'cc000000-0000-0000-0000-000000000007'::uuid,
  'cc000000-0000-0000-0000-000000000008'::uuid,
  'cc000000-0000-0000-0000-000000000009'::uuid,
  'cc000000-0000-0000-0000-000000000010'::uuid,
  'cc000000-0000-0000-0000-000000000011'::uuid,
  'cc000000-0000-0000-0000-000000000012'::uuid
)
ON CONFLICT (user_id, brewery_id) DO UPDATE SET
  verified    = true,
  role        = 'owner',
  verified_at = now();
