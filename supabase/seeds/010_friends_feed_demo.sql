-- ─────────────────────────────────────────────────────────────────────────────
-- Seed 010: Friends Feed Demo — Achievement Cards, Streak Milestones, Live Sessions
-- Sprint 27 "Three-Tab Feed" — populates every feed card type so @josh sees a
-- full demo of what Morgan designed: sessions, ratings, achievement cards, streak
-- milestone cards, live session strips (DrinkingNow), and Discover content.
--
-- Adds:
--   6 friend achievement unlocks (bronze → silver → gold variety)
--   4 streak milestone profiles (5, 7, 14, 30 day streaks)
--   Active session start_at refresh so DrinkingNow shows live friends
--   2 additional active sessions for more Live Now cards
--   Additional beer reviews so Discover Trending fills up
--
-- Run AFTER seeds 007 and 009.
-- Safe to re-run (ON CONFLICT DO NOTHING / DO UPDATE throughout).
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
  mtn_b05 uuid := 'dd000004-0001-0000-0000-000000000005'; -- Dark Hollow Stout
  mtn_b07 uuid := 'dd000004-0001-0000-0000-000000000007'; -- Bear Creek DIPA
  riv_b01 uuid := 'dd000004-0002-0000-0000-000000000001'; -- French Broad Belgian
  riv_b03 uuid := 'dd000004-0002-0000-0000-000000000003'; -- Barrel Room Sour
  riv_b06 uuid := 'dd000004-0002-0000-0000-000000000006'; -- Monks Garden Tripel
  smk_b01 uuid := 'dd000004-0003-0000-0000-000000000001'; -- Smokehouse Porter
  smk_b02 uuid := 'dd000004-0003-0000-0000-000000000002'; -- Barrel-Aged Imperial
  smk_b04 uuid := 'dd000004-0003-0000-0000-000000000004'; -- Timber Creek Pale

  -- Active session IDs (from seed 009 — we UPDATE their started_at)
  fs21 uuid := 'bb000009-0000-0000-0000-000000000021'; -- Rachel at Mountain Ridge
  fs22 uuid := 'bb000009-0000-0000-0000-000000000022'; -- Marcus at River Bend

  -- New active session IDs for this seed
  fa01 uuid := 'bb000010-0000-0000-0000-000000000001'; -- Alex at Mountain Ridge (live)
  fa02 uuid := 'bb000010-0000-0000-0000-000000000002'; -- Priya at River Bend (live)

BEGIN

-- ── 1. Refresh existing active sessions so DrinkingNow shows them ──────────
-- started_at is frozen from seed time; update to NOW() so the API returns them.
UPDATE sessions
SET started_at = NOW() - interval '38 minutes'
WHERE id = fs21;

UPDATE sessions
SET started_at = NOW() - interval '1 hour 12 minutes'
WHERE id = fs22;

-- ── 2. Add 2 more active sessions for a richer Live Now strip ─────────────
INSERT INTO sessions (id, user_id, brewery_id, context, is_active, share_to_feed, xp_awarded, started_at, ended_at) VALUES
  -- Alex is LIVE at Mountain Ridge right now
  (fa01, u01, brew_mtn, 'brewery', true, true, 0, NOW() - interval '22 minutes', NULL),
  -- Priya is LIVE at River Bend right now
  (fa02, u03, brew_riv, 'brewery', true, true, 0, NOW() - interval '55 minutes', NULL)
ON CONFLICT (id) DO UPDATE SET
  started_at = NOW() - interval '22 minutes',
  is_active  = true;

-- Beer logs for the new active sessions
INSERT INTO beer_logs (session_id, user_id, beer_id, brewery_id, quantity, rating, flavor_tags, serving_style, comment, logged_at) VALUES
  (fa01, u01, mtn_b02, brew_mtn, 1, NULL, ARRAY['tropical','hazy'], 'draft', NULL, NOW() - interval '18 minutes'),
  (fa02, u03, riv_b03, brew_riv, 1, NULL, ARRAY['tart','funky'], 'draft', NULL, NOW() - interval '50 minutes'),
  (fa02, u03, riv_b06, brew_riv, 1, NULL, NULL, 'draft', NULL, NOW() - interval '20 minutes')
ON CONFLICT DO NOTHING;

-- ── 3. Friend achievements — 6 unlocks spanning bronze/silver/gold ─────────
-- These power AchievementFeedCard in the Friends tab.
-- We use SELECT-from-achievements so the IDs are always correct regardless of
-- when the achievements table was populated.

-- Alex Chen (u01) unlocked "Road Warrior" (silver/explorer) — 2 days ago
INSERT INTO user_achievements (user_id, achievement_id, earned_at)
SELECT u01, id, NOW() - interval '2 days' + interval '14 hours'
FROM achievements WHERE key = 'road_warrior'
ON CONFLICT DO NOTHING;

-- Priya Patel (u03) unlocked "Style Master" (gold/variety) — 1 day ago
-- If style_master doesn't exist, fall back to style_scholar
INSERT INTO user_achievements (user_id, achievement_id, earned_at)
SELECT u03, id, NOW() - interval '1 day' + interval '19 hours'
FROM achievements WHERE key = 'style_master'
ON CONFLICT DO NOTHING;

INSERT INTO user_achievements (user_id, achievement_id, earned_at)
SELECT u03, id, NOW() - interval '1 day' + interval '19 hours'
FROM achievements WHERE key = 'sour_patch'
ON CONFLICT DO NOTHING;

-- Jessica Blake (u08) unlocked "Hop Head" (silver/variety) — 3 days ago
INSERT INTO user_achievements (user_id, achievement_id, earned_at)
SELECT u08, id, NOW() - interval '3 days' + interval '21 hours'
FROM achievements WHERE key = 'hop_head'
ON CONFLICT DO NOTHING;

-- Tom Nguyen (u07) unlocked "High Flyer" (silver/variety) — 4 hours ago
-- (Drank a 10.5% imperial — well earned)
INSERT INTO user_achievements (user_id, achievement_id, earned_at)
SELECT u07, id, NOW() - interval '4 hours'
FROM achievements WHERE key = 'high_flyer'
ON CONFLICT DO NOTHING;

-- James O'Toole (u11) unlocked "State Hopper" (gold/explorer) — 5 hours ago
-- (flew from Dallas, unlocked it)
INSERT INTO user_achievements (user_id, achievement_id, earned_at)
SELECT u11, id, NOW() - interval '5 hours'
FROM achievements WHERE key = 'state_hopper'
ON CONFLICT DO NOTHING;

-- Marcus Johnson (u02) unlocked "Critic's Choice" (bronze/quality) — today
INSERT INTO user_achievements (user_id, achievement_id, earned_at)
SELECT u02, id, NOW() - interval '6 hours'
FROM achievements WHERE key = 'critics_choice'
ON CONFLICT DO NOTHING;

-- Rachel Foster (u10) unlocked "Streak Master" (gold/time) — yesterday
INSERT INTO user_achievements (user_id, achievement_id, earned_at)
SELECT u10, id, NOW() - interval '1 day' + interval '10 hours'
FROM achievements WHERE key = 'streak_master'
ON CONFLICT DO NOTHING;

-- ── 4. Streak milestones on friend profiles ────────────────────────────────
-- StreakFeedCard shows when a friend's current_streak is a milestone.
-- We set these to milestone values so Josh sees streak cards in his feed.
UPDATE profiles SET current_streak = 14 WHERE id = u01; -- Alex: 14-day streak
UPDATE profiles SET current_streak = 30 WHERE id = u03; -- Priya: 30-day streak!
UPDATE profiles SET current_streak = 7  WHERE id = u08; -- Jessica: 7-day streak
UPDATE profiles SET current_streak = 5  WHERE id = u07; -- Tom: 5-day streak
UPDATE profiles SET current_streak = 3  WHERE id = u11; -- James: 3-day streak

-- ── 5. Extra beer reviews for Discover → Trending fill ─────────────────────
-- The Discover tab topReviews query needs rating >= 4. These add more variety.
INSERT INTO beer_reviews (user_id, beer_id, rating, comment, created_at) VALUES
  (u04, mtn_b07, 5, 'Bear Creek DIPA hits different. Dank, resinous, and absolutely dangerous.', NOW() - interval '3 hours'),
  (u05, smk_b02, 5, 'Barrel-Aged Imperial is worth every penny. Bourbon and dark chocolate dream.', NOW() - interval '5 hours'),
  (u06, riv_b01, 4, 'French Broad Belgian is wonderfully complex — fruity, yeasty, and sessionable for a Belgian.', NOW() - interval '8 hours'),
  (u07, riv_b06, 5, 'Monks Garden Tripel at 9.2% is genuinely dangerous. I had two. Worth it.', NOW() - interval '10 hours'),
  (u09, mtn_b05, 5, 'Dark Hollow Stout — silky, chocolatey, with a coffee finish. Perfect.', NOW() - interval '12 hours'),
  (u10, riv_b03, 5, 'Barrel Room Sour is what a sour should be. Complex, balanced, devastating.', NOW() - interval '14 hours'),
  (u12, mtn_b01, 4, 'Ridgeline IPA was my first IPA I actually liked. Bright and tropical, no harsh bitterness.', NOW() - interval '20 hours'),
  (u11, smk_b01, 4, 'Smokehouse Porter is comfort in a glass. Came to Asheville for this exact experience.', NOW() - interval '30 hours'),
  (u08, mtn_b07, 5, 'Bear Creek DIPA is a 10/10. Ordered it twice at the same session.', NOW() - interval '36 hours'),
  (u02, riv_b06, 4, 'Tripel from a small NC brewery — did not expect this quality. Monks Garden is legit.', NOW() - interval '40 hours'),
  (u03, smk_b01, 4, 'The smoky aroma is intentional and perfect. This porter earns its name.', NOW() - interval '44 hours')
ON CONFLICT (user_id, beer_id) DO NOTHING;

-- Extra brewery reviews for Discover tab
INSERT INTO brewery_reviews (user_id, brewery_id, rating, comment, created_at) VALUES
  (u09, brew_mtn, 5, 'Mountain Ridge made me a craft beer person. My first brewery visit and it spoiled me for life.', NOW() - interval '2 days'),
  (u12, brew_riv, 5, 'River Bend is doing things with Belgian and sour styles that rival the best on the East Coast.', NOW() - interval '3 days'),
  (u04, brew_smk, 5, 'The barrel program at Smoky Barrel is no joke. Fireplace, dark beers, mountain views. 10/10.', NOW() - interval '4 days')
ON CONFLICT (user_id, brewery_id) DO NOTHING;

RAISE NOTICE '== Seed 010: Friends feed demo data seeded ==';
RAISE NOTICE '   Active sessions refreshed (DrinkingNow will show 4 live friends)';
RAISE NOTICE '   7 friend achievement unlocks (bronze/silver/gold)';
RAISE NOTICE '   5 streak milestone profiles (3/5/7/14/30 days)';
RAISE NOTICE '   11 extra beer reviews for Discover Trending';
RAISE NOTICE '   3 extra brewery reviews for Discover';

END $$;
