-- ─────────────────────────────────────────────────────────────────────────────
-- Seed 012: Live Friends — Active Sessions for DrinkingNow Strip
--
-- Creates 4 active sessions for Josh's friends so the "Live Now" strip
-- is populated. Sessions are set to is_active=true, share_to_feed=true,
-- started within the last couple hours.
--
-- Run AFTER seeds 001–011.
-- Safe to re-run (ON CONFLICT DO NOTHING / DO UPDATE throughout).
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  -- Josh (the founder / demo user)
  josh uuid := '90a1a802-8a79-4816-bf10-a900b91f2c5c';

  -- Friend UUIDs
  u01 uuid := 'cc000000-0000-0000-0000-000000000001'; -- Alex Chen
  u02 uuid := 'cc000000-0000-0000-0000-000000000002'; -- Marcus Johnson
  u07 uuid := 'cc000000-0000-0000-0000-000000000007'; -- Tom Nguyen
  u09 uuid := 'cc000000-0000-0000-0000-000000000009'; -- Carlos Mendez

  -- Brewery IDs
  brew_mtn uuid := 'dd000001-0000-0000-0000-000000000001'; -- Mountain Ridge
  brew_riv uuid := 'dd000001-0000-0000-0000-000000000002'; -- River Bend
  hf_id    uuid := 'c3d4e5f6-a7b8-9012-cdef-012345678902'; -- Hopfield Brewing
  pp_id    uuid := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'; -- Pint & Pixel

  -- Beer IDs
  mtn_b01  uuid := 'dd000004-0001-0000-0000-000000000001'; -- Ridgeline IPA
  mtn_b02  uuid := 'dd000004-0001-0000-0000-000000000002'; -- Summit Sunset Hazy
  riv_b01  uuid := 'dd000004-0002-0000-0000-000000000001'; -- French Broad Belgian
  riv_b04  uuid := 'dd000004-0002-0000-0000-000000000004'; -- Cottonwood Kolsch
  hf_hazy  uuid := 'b8c9d0e1-f2a3-4567-bcde-567890123407'; -- Hazy Daze
  pp_ipa   uuid := (SELECT id FROM beers WHERE brewery_id = pp_id AND name ILIKE '%IPA%' LIMIT 1);

  -- Fixed session IDs (bb000012 prefix)
  s_alex   uuid := 'bb000012-0000-0000-0000-000000000001';
  s_marcus uuid := 'bb000012-0000-0000-0000-000000000002';
  s_tom    uuid := 'bb000012-0000-0000-0000-000000000003';
  s_carlos uuid := 'bb000012-0000-0000-0000-000000000004';

BEGIN
  -- ── 0. Ensure friendships with Josh exist ───────────────────────────────
  INSERT INTO friendships (requester_id, addressee_id, status, created_at)
  VALUES
    (josh, u01, 'accepted', now() - interval '30 days'),
    (josh, u02, 'accepted', now() - interval '60 days'),
    (u07,  josh, 'accepted', now() - interval '45 days'),
    (u09,  josh, 'accepted', now() - interval '20 days')
  ON CONFLICT DO NOTHING;

  -- ── 1. Deactivate any stale active sessions for these friends ───────────
  UPDATE sessions
  SET is_active = false
  WHERE user_id IN (u01, u02, u07, u09)
    AND is_active = true
    AND id NOT IN (s_alex, s_marcus, s_tom, s_carlos);

  -- ── 2. Create active sessions ────────────────────────────────────────────
  INSERT INTO sessions (id, user_id, brewery_id, is_active, share_to_feed, context, xp_awarded, started_at)
  VALUES
    -- Alex at Mountain Ridge, 55 min in
    (s_alex,   u01, brew_mtn, true, true, 'brewery', 0, now() - interval '55 minutes'),
    -- Marcus at Hopfield, 1h 20m in
    (s_marcus, u02, hf_id,    true, true, 'brewery', 0, now() - interval '1 hour 20 minutes'),
    -- Tom at River Bend, 35 min in
    (s_tom,    u07, brew_riv, true, true, 'brewery', 0, now() - interval '35 minutes'),
    -- Carlos at home, 2h in
    (s_carlos, u09, NULL,     true, true, 'home',    0, now() - interval '2 hours')
  ON CONFLICT (id) DO UPDATE
    SET is_active   = true,
        started_at  = EXCLUDED.started_at,
        brewery_id  = EXCLUDED.brewery_id,
        share_to_feed = true;

  -- ── 3. Beer logs for active sessions ────────────────────────────────────
  -- Alex: 2 beers at Mountain Ridge
  INSERT INTO beer_logs (session_id, user_id, beer_id, brewery_id, quantity, rating, logged_at)
  VALUES
    (s_alex, u01, mtn_b01, brew_mtn, 1, 4.5, now() - interval '50 minutes'),
    (s_alex, u01, mtn_b02, brew_mtn, 1, 5.0, now() - interval '20 minutes')
  ON CONFLICT DO NOTHING;

  -- Marcus: 2 beers at Hopfield
  INSERT INTO beer_logs (session_id, user_id, beer_id, brewery_id, quantity, rating, logged_at)
  VALUES
    (s_marcus, u02, hf_hazy, hf_id, 1, 4.5, now() - interval '1 hour 10 minutes'),
    (s_marcus, u02, hf_hazy, hf_id, 1, NULL, now() - interval '15 minutes')
  ON CONFLICT DO NOTHING;

  -- Tom: 1 beer at River Bend
  INSERT INTO beer_logs (session_id, user_id, beer_id, brewery_id, quantity, rating, logged_at)
  VALUES
    (s_tom, u07, riv_b01, brew_riv, 1, 4.0, now() - interval '25 minutes')
  ON CONFLICT DO NOTHING;

  -- Carlos: 3 beers at home
  INSERT INTO beer_logs (session_id, user_id, beer_id, brewery_id, quantity, rating, logged_at)
  VALUES
    (s_carlos, u09, mtn_b01, brew_mtn, 1, 4.0, now() - interval '1 hour 45 minutes'),
    (s_carlos, u09, riv_b04, brew_riv, 1, 3.5, now() - interval '1 hour'),
    (s_carlos, u09, mtn_b02, brew_mtn, 1, 4.5, now() - interval '30 minutes')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Seed 012 complete — 4 active friend sessions created for DrinkingNow strip';
END $$;
