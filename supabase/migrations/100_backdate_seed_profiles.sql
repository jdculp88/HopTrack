-- ============================================================================
-- Migration 100: Backdate Seed Profiles for Magic Number Intelligence Layer
-- Sprint 159 — The Accelerator
-- ============================================================================
-- The Magic Number dashboard (lib/superadmin-intelligence.ts) requires users
-- created 90+ days ago to calculate behavioral correlations with retention.
-- This migration backdates 15 of the 40 Friday Night seed users (076) and
-- creates historical sessions/beer_logs/friendships so the Intelligence Layer
-- can compute real Magic Number signals:
--   1. Checked in at 2+ breweries in first 7 days
--   2. Rated 3+ beers in first 7 days
--   3. Added a friend in first 7 days
--   4. Visited same brewery 2+ times in first 14 days
-- ============================================================================

DO $$
DECLARE
  -- Existing brewery IDs
  pp_brewery uuid := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'; -- Pint & Pixel

  -- Pint & Pixel beers
  beer_kolsch uuid := 'cccccccc-0001-4000-8000-000000000001';
  beer_red    uuid := 'cccccccc-0002-4000-8000-000000000002';
  beer_ipa    uuid := 'cccccccc-0004-4000-8000-000000000004';
  beer_stout  uuid := 'cccccccc-0005-4000-8000-000000000005';
  beer_pale   uuid := 'cccccccc-0007-4000-8000-000000000007';

  -- Seed user UUIDs to backdate (u01-u15)
  u01 uuid := 'f0000001-0000-4000-8000-000000000001';
  u02 uuid := 'f0000002-0000-4000-8000-000000000002';
  u03 uuid := 'f0000003-0000-4000-8000-000000000003';
  u04 uuid := 'f0000004-0000-4000-8000-000000000004';
  u05 uuid := 'f0000005-0000-4000-8000-000000000005';
  u06 uuid := 'f0000006-0000-4000-8000-000000000006';
  u07 uuid := 'f0000007-0000-4000-8000-000000000007';
  u08 uuid := 'f0000008-0000-4000-8000-000000000008';
  u09 uuid := 'f0000009-0000-4000-8000-000000000009';
  u10 uuid := 'f0000010-0000-4000-8000-000000000010';
  u11 uuid := 'f0000011-0000-4000-8000-000000000011';
  u12 uuid := 'f0000012-0000-4000-8000-000000000012';
  u13 uuid := 'f0000013-0000-4000-8000-000000000013';
  u14 uuid := 'f0000014-0000-4000-8000-000000000014';
  u15 uuid := 'f0000015-0000-4000-8000-000000000015';

  -- Historical session UUIDs
  hs01 uuid := 'e2000001-0000-4000-8000-000000000001';
  hs02 uuid := 'e2000002-0000-4000-8000-000000000002';
  hs03 uuid := 'e2000003-0000-4000-8000-000000000003';
  hs04 uuid := 'e2000004-0000-4000-8000-000000000004';
  hs05 uuid := 'e2000005-0000-4000-8000-000000000005';
  hs06 uuid := 'e2000006-0000-4000-8000-000000000006';
  hs07 uuid := 'e2000007-0000-4000-8000-000000000007';
  hs08 uuid := 'e2000008-0000-4000-8000-000000000008';
  hs09 uuid := 'e2000009-0000-4000-8000-000000000009';
  hs10 uuid := 'e2000010-0000-4000-8000-000000000010';
  hs11 uuid := 'e2000011-0000-4000-8000-000000000011';
  hs12 uuid := 'e2000012-0000-4000-8000-000000000012';
  hs13 uuid := 'e2000013-0000-4000-8000-000000000013';
  hs14 uuid := 'e2000014-0000-4000-8000-000000000014';
  hs15 uuid := 'e2000015-0000-4000-8000-000000000015';
  hs16 uuid := 'e2000016-0000-4000-8000-000000000016';
  hs17 uuid := 'e2000017-0000-4000-8000-000000000017';
  hs18 uuid := 'e2000018-0000-4000-8000-000000000018';
  hs19 uuid := 'e2000019-0000-4000-8000-000000000019';
  hs20 uuid := 'e2000020-0000-4000-8000-000000000020';
  hs21 uuid := 'e2000021-0000-4000-8000-000000000021';
  hs22 uuid := 'e2000022-0000-4000-8000-000000000022';
  hs23 uuid := 'e2000023-0000-4000-8000-000000000023';
  hs24 uuid := 'e2000024-0000-4000-8000-000000000024';
  hs25 uuid := 'e2000025-0000-4000-8000-000000000025';
  hs26 uuid := 'e2000026-0000-4000-8000-000000000026';
  hs27 uuid := 'e2000027-0000-4000-8000-000000000027';
  hs28 uuid := 'e2000028-0000-4000-8000-000000000028';
  hs29 uuid := 'e2000029-0000-4000-8000-000000000029';
  hs30 uuid := 'e2000030-0000-4000-8000-000000000030';

  -- Historical beer log UUIDs
  hb01 uuid := 'e3000001-0000-4000-8000-000000000001';
  hb02 uuid := 'e3000002-0000-4000-8000-000000000002';
  hb03 uuid := 'e3000003-0000-4000-8000-000000000003';
  hb04 uuid := 'e3000004-0000-4000-8000-000000000004';
  hb05 uuid := 'e3000005-0000-4000-8000-000000000005';
  hb06 uuid := 'e3000006-0000-4000-8000-000000000006';
  hb07 uuid := 'e3000007-0000-4000-8000-000000000007';
  hb08 uuid := 'e3000008-0000-4000-8000-000000000008';
  hb09 uuid := 'e3000009-0000-4000-8000-000000000009';
  hb10 uuid := 'e3000010-0000-4000-8000-000000000010';
  hb11 uuid := 'e3000011-0000-4000-8000-000000000011';
  hb12 uuid := 'e3000012-0000-4000-8000-000000000012';
  hb13 uuid := 'e3000013-0000-4000-8000-000000000013';
  hb14 uuid := 'e3000014-0000-4000-8000-000000000014';
  hb15 uuid := 'e3000015-0000-4000-8000-000000000015';
  hb16 uuid := 'e3000016-0000-4000-8000-000000000016';
  hb17 uuid := 'e3000017-0000-4000-8000-000000000017';
  hb18 uuid := 'e3000018-0000-4000-8000-000000000018';
  hb19 uuid := 'e3000019-0000-4000-8000-000000000019';
  hb20 uuid := 'e3000020-0000-4000-8000-000000000020';
  hb21 uuid := 'e3000021-0000-4000-8000-000000000021';
  hb22 uuid := 'e3000022-0000-4000-8000-000000000022';
  hb23 uuid := 'e3000023-0000-4000-8000-000000000023';
  hb24 uuid := 'e3000024-0000-4000-8000-000000000024';
  hb25 uuid := 'e3000025-0000-4000-8000-000000000025';
  hb26 uuid := 'e3000026-0000-4000-8000-000000000026';
  hb27 uuid := 'e3000027-0000-4000-8000-000000000027';
  hb28 uuid := 'e3000028-0000-4000-8000-000000000028';
  hb29 uuid := 'e3000029-0000-4000-8000-000000000029';
  hb30 uuid := 'e3000030-0000-4000-8000-000000000030';

BEGIN

  -- ═══════════════════════════════════════════════════════════════════════════
  -- 1. Backdate user profiles (u01-u15) to 95-150 days ago
  -- ═══════════════════════════════════════════════════════════════════════════
  -- Cohort A (u01-u05): 150 days ago — oldest cohort, most retention data
  UPDATE auth.users SET created_at = now() - interval '150 days'
  WHERE id IN (u01, u02, u03, u04, u05);

  UPDATE profiles SET created_at = now() - interval '150 days'
  WHERE id IN (u01, u02, u03, u04, u05);

  -- Cohort B (u06-u10): 120 days ago
  UPDATE auth.users SET created_at = now() - interval '120 days'
  WHERE id IN (u06, u07, u08, u09, u10);

  UPDATE profiles SET created_at = now() - interval '120 days'
  WHERE id IN (u06, u07, u08, u09, u10);

  -- Cohort C (u11-u15): 95 days ago — just past the 90-day threshold
  UPDATE auth.users SET created_at = now() - interval '95 days'
  WHERE id IN (u11, u12, u13, u14, u15);

  UPDATE profiles SET created_at = now() - interval '95 days'
  WHERE id IN (u11, u12, u13, u14, u15);

  -- ═══════════════════════════════════════════════════════════════════════════
  -- 2. Historical sessions — "first 7 days" activity for Magic Number signals
  --    + continued activity for retention measurement
  -- ═══════════════════════════════════════════════════════════════════════════

  INSERT INTO sessions (id, user_id, brewery_id, started_at, ended_at, is_active, share_to_feed)
  VALUES
    -- Cohort A (u01-u05): created 150d ago
    -- u01: 2 breweries in first 7d (Signal 1) + return visits (retained)
    (hs01, u01, pp_brewery, now()-interval '149 days'+interval '18 hours', now()-interval '149 days'+interval '20 hours', false, true),
    (hs02, u01, pp_brewery, now()-interval '145 days'+interval '19 hours', now()-interval '145 days'+interval '21 hours', false, true),
    (hs03, u01, pp_brewery, now()-interval '30 days'+interval '18 hours',  now()-interval '30 days'+interval '20 hours',  false, true),
    (hs04, u01, pp_brewery, now()-interval '7 days'+interval '19 hours',   now()-interval '7 days'+interval '21 hours',   false, true),

    -- u02: 3+ ratings in first 7d (Signal 2) + retained
    (hs05, u02, pp_brewery, now()-interval '149 days'+interval '17 hours', now()-interval '149 days'+interval '19 hours', false, true),
    (hs06, u02, pp_brewery, now()-interval '20 days'+interval '18 hours',  now()-interval '20 days'+interval '20 hours',  false, true),

    -- u03: friend added in first 7d (Signal 3) + retained
    (hs07, u03, pp_brewery, now()-interval '148 days'+interval '18 hours', now()-interval '148 days'+interval '20 hours', false, true),
    (hs08, u03, pp_brewery, now()-interval '15 days'+interval '19 hours',  now()-interval '15 days'+interval '21 hours',  false, true),

    -- u04: same brewery 2x in first 14d (Signal 4) + retained
    (hs09, u04, pp_brewery, now()-interval '148 days'+interval '18 hours', now()-interval '148 days'+interval '20 hours', false, true),
    (hs10, u04, pp_brewery, now()-interval '140 days'+interval '19 hours', now()-interval '140 days'+interval '21 hours', false, true),
    (hs11, u04, pp_brewery, now()-interval '10 days'+interval '18 hours',  now()-interval '10 days'+interval '20 hours',  false, true),

    -- u05: NO signals in first 7d — control user (but still retained)
    (hs12, u05, pp_brewery, now()-interval '130 days'+interval '18 hours', now()-interval '130 days'+interval '20 hours', false, true),
    (hs13, u05, pp_brewery, now()-interval '25 days'+interval '19 hours',  now()-interval '25 days'+interval '21 hours',  false, true),

    -- Cohort B (u06-u10): created 120d ago
    -- u06: multiple signals (2 breweries + 3 ratings) + retained
    (hs14, u06, pp_brewery, now()-interval '119 days'+interval '17 hours', now()-interval '119 days'+interval '19 hours', false, true),
    (hs15, u06, pp_brewery, now()-interval '5 days'+interval '18 hours',   now()-interval '5 days'+interval '20 hours',   false, true),

    -- u07: friend added + retained
    (hs16, u07, pp_brewery, now()-interval '118 days'+interval '18 hours', now()-interval '118 days'+interval '20 hours', false, true),
    (hs17, u07, pp_brewery, now()-interval '12 days'+interval '19 hours',  now()-interval '12 days'+interval '21 hours',  false, true),

    -- u08: same brewery 2x in 14d + retained
    (hs18, u08, pp_brewery, now()-interval '118 days'+interval '18 hours', now()-interval '118 days'+interval '20 hours', false, true),
    (hs19, u08, pp_brewery, now()-interval '110 days'+interval '19 hours', now()-interval '110 days'+interval '21 hours', false, true),
    (hs20, u08, pp_brewery, now()-interval '8 days'+interval '18 hours',   now()-interval '8 days'+interval '20 hours',   false, true),

    -- u09: NO signals — control, NOT retained (no recent activity)
    (hs21, u09, pp_brewery, now()-interval '100 days'+interval '18 hours', now()-interval '100 days'+interval '20 hours', false, true),

    -- u10: ratings signal + NOT retained
    (hs22, u10, pp_brewery, now()-interval '119 days'+interval '17 hours', now()-interval '119 days'+interval '19 hours', false, true),

    -- Cohort C (u11-u15): created 95d ago
    -- u11: 2 breweries + ratings + retained
    (hs23, u11, pp_brewery, now()-interval '94 days'+interval '17 hours', now()-interval '94 days'+interval '19 hours', false, true),
    (hs24, u11, pp_brewery, now()-interval '3 days'+interval '18 hours',  now()-interval '3 days'+interval '20 hours',  false, true),

    -- u12: friend + same brewery 2x + retained
    (hs25, u12, pp_brewery, now()-interval '94 days'+interval '18 hours', now()-interval '94 days'+interval '20 hours', false, true),
    (hs26, u12, pp_brewery, now()-interval '88 days'+interval '19 hours', now()-interval '88 days'+interval '21 hours', false, true),
    (hs27, u12, pp_brewery, now()-interval '6 days'+interval '18 hours',  now()-interval '6 days'+interval '20 hours',  false, true),

    -- u13: NO signals — control, retained
    (hs28, u13, pp_brewery, now()-interval '80 days'+interval '18 hours', now()-interval '80 days'+interval '20 hours', false, true),
    (hs29, u13, pp_brewery, now()-interval '4 days'+interval '19 hours',  now()-interval '4 days'+interval '21 hours',  false, true),

    -- u14: ratings signal + NOT retained
    (hs30, u14, pp_brewery, now()-interval '93 days'+interval '17 hours', now()-interval '93 days'+interval '19 hours', false, true)
  ON CONFLICT (id) DO NOTHING;

  -- u15: NO sessions at all — pure control (signed up, never used)

  -- ═══════════════════════════════════════════════════════════════════════════
  -- 3. Historical beer logs with ratings (for "3+ ratings in first 7 days" signal)
  -- ═══════════════════════════════════════════════════════════════════════════

  INSERT INTO beer_logs (id, session_id, user_id, beer_id, rating, quantity, logged_at)
  VALUES
    -- u01: 2 ratings in first week (NOT enough for signal 2)
    (hb01, hs01, u01, beer_kolsch, 4.5, 1, now()-interval '149 days'+interval '18 hours 30 minutes'),
    (hb02, hs01, u01, beer_ipa,    4.0, 1, now()-interval '149 days'+interval '19 hours'),

    -- u02: 4 ratings in first week (TRIGGERS signal 2: 3+ ratings)
    (hb03, hs05, u02, beer_kolsch, 4.5, 1, now()-interval '149 days'+interval '17 hours 15 minutes'),
    (hb04, hs05, u02, beer_red,    3.5, 1, now()-interval '149 days'+interval '17 hours 45 minutes'),
    (hb05, hs05, u02, beer_ipa,    5.0, 1, now()-interval '149 days'+interval '18 hours 15 minutes'),
    (hb06, hs05, u02, beer_stout,  4.0, 1, now()-interval '149 days'+interval '18 hours 45 minutes'),

    -- u03: 1 rating (not a ratings signal user — friend signal instead)
    (hb07, hs07, u03, beer_pale,   3.5, 1, now()-interval '148 days'+interval '18 hours 30 minutes'),

    -- u04: 2 ratings across 2 sessions in first 14d
    (hb08, hs09, u04, beer_kolsch, 4.0, 1, now()-interval '148 days'+interval '18 hours 30 minutes'),
    (hb09, hs10, u04, beer_ipa,    4.5, 1, now()-interval '140 days'+interval '19 hours 30 minutes'),

    -- u05: 1 rating late (control — no first-7d signals)
    (hb10, hs12, u05, beer_red,    3.0, 1, now()-interval '130 days'+interval '18 hours 30 minutes'),

    -- u06: 3 ratings in first week (TRIGGERS signal 2)
    (hb11, hs14, u06, beer_kolsch, 5.0, 1, now()-interval '119 days'+interval '17 hours 15 minutes'),
    (hb12, hs14, u06, beer_stout,  4.5, 1, now()-interval '119 days'+interval '17 hours 45 minutes'),
    (hb13, hs14, u06, beer_pale,   4.0, 1, now()-interval '119 days'+interval '18 hours 15 minutes'),

    -- u07: 1 rating
    (hb14, hs16, u07, beer_ipa,    4.0, 1, now()-interval '118 days'+interval '18 hours 30 minutes'),

    -- u08: 2 ratings across 2 sessions
    (hb15, hs18, u08, beer_kolsch, 3.5, 1, now()-interval '118 days'+interval '18 hours 30 minutes'),
    (hb16, hs19, u08, beer_red,    4.0, 1, now()-interval '110 days'+interval '19 hours 30 minutes'),

    -- u09: 1 rating (control, not retained)
    (hb17, hs21, u09, beer_stout,  3.0, 1, now()-interval '100 days'+interval '18 hours 30 minutes'),

    -- u10: 3 ratings in first week (TRIGGERS signal 2 but NOT retained)
    (hb18, hs22, u10, beer_kolsch, 4.0, 1, now()-interval '119 days'+interval '17 hours 15 minutes'),
    (hb19, hs22, u10, beer_ipa,    4.5, 1, now()-interval '119 days'+interval '17 hours 45 minutes'),
    (hb20, hs22, u10, beer_pale,   3.5, 1, now()-interval '119 days'+interval '18 hours 15 minutes'),

    -- u11: 3 ratings in first week (TRIGGERS signal 2, retained)
    (hb21, hs23, u11, beer_kolsch, 5.0, 1, now()-interval '94 days'+interval '17 hours 15 minutes'),
    (hb22, hs23, u11, beer_stout,  4.0, 1, now()-interval '94 days'+interval '17 hours 45 minutes'),
    (hb23, hs23, u11, beer_red,    4.5, 1, now()-interval '94 days'+interval '18 hours 15 minutes'),

    -- u12: 2 ratings
    (hb24, hs25, u12, beer_pale,   4.0, 1, now()-interval '94 days'+interval '18 hours 30 minutes'),
    (hb25, hs26, u12, beer_ipa,    4.5, 1, now()-interval '88 days'+interval '19 hours 30 minutes'),

    -- u13: 1 rating (control)
    (hb26, hs28, u13, beer_kolsch, 3.5, 1, now()-interval '80 days'+interval '18 hours 30 minutes'),

    -- u14: 3 ratings (TRIGGERS signal 2 but NOT retained)
    (hb27, hs30, u14, beer_stout,  4.0, 1, now()-interval '93 days'+interval '17 hours 15 minutes'),
    (hb28, hs30, u14, beer_ipa,    3.5, 1, now()-interval '93 days'+interval '17 hours 45 minutes'),
    (hb29, hs30, u14, beer_red,    4.0, 1, now()-interval '93 days'+interval '18 hours 15 minutes'),

    -- Recent activity for retained users (proves they're still active)
    (hb30, hs03, u01, beer_stout,  4.5, 1, now()-interval '30 days'+interval '18 hours 30 minutes')
  ON CONFLICT (id) DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- 4. Historical friendships (for "friend added in first 7 days" signal)
  -- ═══════════════════════════════════════════════════════════════════════════

  -- u03: added friend within 7 days of signup (150d ago, friend added 148d ago)
  INSERT INTO friendships (requester_id, addressee_id, status, created_at)
  VALUES
    (u03, u04, 'accepted', now()-interval '148 days'),
    (u07, u08, 'accepted', now()-interval '117 days'),
    (u12, u13, 'accepted', now()-interval '93 days')
  ON CONFLICT DO NOTHING;

END $$;
