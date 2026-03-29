-- ─────────────────────────────────────────────────────────────────────────────
-- Seed 011: "Your Round" — Mockup-Aligned Feed Demo Data
-- Sprint 29 — makes Josh's Friends feed match the dark/light HTML mockups.
--
-- Creates:
--   Fresh sessions matching mockup card types (live, completed, streak, achievement)
--   Session notes that feel human (from mockup quotes)
--   5-star beer reviews for "New Favorite" feed cards
--   Achievement: "Belgian Explorer" for Mika (Priya)
--   Streak: Drew (Derek) 7-day streak
--   Reactions (🍺) pre-populated for when ReactionBar ships
--   Session comments for comment count display
--
-- Run AFTER seeds 007, 009, 010 and migrations through 033.
-- Safe to re-run (ON CONFLICT DO NOTHING throughout).
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  -- Josh (founder) — dynamically resolved
  josh_id uuid;

  -- Test users mapped to mockup characters:
  -- Drew     = Derek Walsh (u04)   — the brewery guy, lives at Smoky Barrel
  -- Mika     = Priya Patel (u03)   — Belgian Explorer achievement
  -- Cole     = Alex Chen (u01)     — live at Mountain Ridge (substitute for "Pint & Pixel")
  -- Tara     = Jessica Blake (u08) — completed session, Summit Sunset Hazy
  -- Lena     = Linda Ko (u06)      — recommends French Broad Belgian
  -- Marcus   = Marcus Johnson (u02)— Smokehouse Porter, minimal card
  u_drew   uuid := 'cc000000-0000-0000-0000-000000000004'; -- Derek → Drew
  u_mika   uuid := 'cc000000-0000-0000-0000-000000000003'; -- Priya → Mika
  u_cole   uuid := 'cc000000-0000-0000-0000-000000000001'; -- Alex  → Cole
  u_tara   uuid := 'cc000000-0000-0000-0000-000000000008'; -- Jessica → Tara
  u_lena   uuid := 'cc000000-0000-0000-0000-000000000006'; -- Linda → Lena
  u_marcus uuid := 'cc000000-0000-0000-0000-000000000002'; -- Marcus

  -- Asheville breweries
  brew_smk uuid := 'dd000001-0000-0000-0000-000000000003'; -- Smoky Barrel
  brew_mtn uuid := 'dd000001-0000-0000-0000-000000000001'; -- Mountain Ridge
  brew_riv uuid := 'dd000001-0000-0000-0000-000000000002'; -- River Bend

  -- Key beers (from migration 024)
  smk_imperial uuid := 'dd000004-0003-0000-0000-000000000002'; -- Barrel-Aged Imperial (Stout)
  smk_porter   uuid := 'dd000004-0003-0000-0000-000000000001'; -- Smokehouse Porter
  mtn_hazy     uuid := 'dd000004-0001-0000-0000-000000000002'; -- Summit Sunset Hazy
  mtn_ipa      uuid := 'dd000004-0001-0000-0000-000000000001'; -- Ridgeline IPA
  riv_belgian  uuid := 'dd000004-0002-0000-0000-000000000001'; -- French Broad Belgian

  -- New session IDs for this seed
  s_drew_live  uuid := 'bb000011-0000-0000-0000-000000000001';
  s_cole_live  uuid := 'bb000011-0000-0000-0000-000000000002';
  s_tara       uuid := 'bb000011-0000-0000-0000-000000000003';
  s_marcus     uuid := 'bb000011-0000-0000-0000-000000000004';
  s_drew_yest  uuid := 'bb000011-0000-0000-0000-000000000005';
  s_lena       uuid := 'bb000011-0000-0000-0000-000000000006';

  -- Beer log IDs
  bl01 uuid := 'bb000011-1000-0000-0000-000000000001';
  bl02 uuid := 'bb000011-1000-0000-0000-000000000002';
  bl03 uuid := 'bb000011-1000-0000-0000-000000000003';
  bl04 uuid := 'bb000011-1000-0000-0000-000000000004';
  bl05 uuid := 'bb000011-1000-0000-0000-000000000005';
  bl06 uuid := 'bb000011-1000-0000-0000-000000000006';

  -- Achievement
  ach_belgian_id uuid;

BEGIN

  -- Find Josh
  SELECT id INTO josh_id
  FROM auth.users
  WHERE email NOT LIKE '%hoptrack.test%'
  ORDER BY created_at ASC
  LIMIT 1;

  IF josh_id IS NULL THEN
    RAISE EXCEPTION 'Could not find Josh. Run seed 007 first.';
  END IF;

  -- ── 1. Update display names to match mockup characters ────────────────────
  UPDATE profiles SET display_name = 'Drew'   WHERE id = u_drew;
  UPDATE profiles SET display_name = 'Mika'   WHERE id = u_mika;
  UPDATE profiles SET display_name = 'Cole'   WHERE id = u_cole;
  UPDATE profiles SET display_name = 'Tara'   WHERE id = u_tara;
  UPDATE profiles SET display_name = 'Lena'   WHERE id = u_lena;
  UPDATE profiles SET display_name = 'Marcus' WHERE id = u_marcus;

  -- ── 2. Drew's 7-day streak ────────────────────────────────────────────────
  UPDATE profiles SET
    current_streak   = 7,
    longest_streak   = 7,
    last_session_date = CURRENT_DATE - 1
  WHERE id = u_drew;

  -- ── 3. Belgian Explorer achievement (for Mika) ────────────────────────────
  INSERT INTO achievements (key, name, description, icon, xp_reward, badge_color, tier, category)
  VALUES ('belgian_explorer', 'Belgian Explorer', 'Tried 10 different Belgian styles', '🏅', 200, '#FFD700', 'gold', 'variety')
  ON CONFLICT (key) DO NOTHING;

  SELECT id INTO ach_belgian_id FROM achievements WHERE key = 'belgian_explorer';

  INSERT INTO user_achievements (user_id, achievement_id, earned_at)
  VALUES (u_mika, ach_belgian_id, now() - interval '1 hour')
  ON CONFLICT DO NOTHING;

  -- ── 4. Sessions matching mockup cards ─────────────────────────────────────

  -- Drew: LIVE at Smoky Barrel (34 min ago)
  INSERT INTO sessions (id, user_id, brewery_id, context, is_active, share_to_feed, xp_awarded, started_at)
  VALUES (s_drew_live, u_drew, brew_smk, 'brewery', true, true, 0, now() - interval '34 minutes')
  ON CONFLICT (id) DO UPDATE SET is_active = true, started_at = now() - interval '34 minutes';

  -- Cole: LIVE at Mountain Ridge (1h ago)
  INSERT INTO sessions (id, user_id, brewery_id, context, is_active, share_to_feed, xp_awarded, started_at)
  VALUES (s_cole_live, u_cole, brew_mtn, 'brewery', true, true, 0, now() - interval '1 hour')
  ON CONFLICT (id) DO UPDATE SET is_active = true, started_at = now() - interval '1 hour';

  -- Tara: completed session at Mountain Ridge (3h ago)
  INSERT INTO sessions (id, user_id, brewery_id, context, is_active, share_to_feed, xp_awarded, started_at, ended_at)
  VALUES (s_tara, u_tara, brew_mtn, 'brewery', false, true, 145, now() - interval '4 hours', now() - interval '3 hours')
  ON CONFLICT (id) DO UPDATE SET is_active = false, ended_at = now() - interval '3 hours';

  -- Lena: completed session at River Bend (5h ago) — will have recommendation-style review
  INSERT INTO sessions (id, user_id, brewery_id, context, is_active, share_to_feed, xp_awarded, started_at, ended_at)
  VALUES (s_lena, u_lena, brew_riv, 'brewery', false, true, 130, now() - interval '6 hours', now() - interval '5 hours')
  ON CONFLICT (id) DO UPDATE SET is_active = false, ended_at = now() - interval '5 hours';

  -- Marcus: completed session at Smoky Barrel (yesterday) — minimal card
  INSERT INTO sessions (id, user_id, brewery_id, context, is_active, share_to_feed, xp_awarded, started_at, ended_at)
  VALUES (s_marcus, u_marcus, brew_smk, 'brewery', false, true, 110, now() - interval '1 day' - interval '2 hours', now() - interval '1 day')
  ON CONFLICT (id) DO UPDATE SET is_active = false, ended_at = now() - interval '1 day';

  -- Drew: completed session yesterday (for streak card context)
  INSERT INTO sessions (id, user_id, brewery_id, context, is_active, share_to_feed, xp_awarded, started_at, ended_at)
  VALUES (s_drew_yest, u_drew, brew_smk, 'brewery', false, true, 155, now() - interval '1 day' + interval '5 hours', now() - interval '1 day' + interval '8 hours')
  ON CONFLICT (id) DO UPDATE SET is_active = false, ended_at = now() - interval '1 day' + interval '8 hours';

  -- ── 5. Beer logs with notes matching mockup quotes ────────────────────────

  -- Drew's live session: Barrel-Aged Imperial (the "Oatmeal Stout" from mockup)
  INSERT INTO beer_logs (id, session_id, user_id, beer_id, brewery_id, quantity, rating, comment)
  VALUES (bl01, s_drew_live, u_drew, smk_imperial, brew_smk, 1, 4.5,
    'Third visit this month. The barrel-aged version is back and it''s even better than last year.')
  ON CONFLICT (id) DO NOTHING;

  -- Cole's live session: Summit Sunset Hazy (mapped from "Neon Haze IPA")
  INSERT INTO beer_logs (id, session_id, user_id, beer_id, brewery_id, quantity, rating, comment)
  VALUES (bl02, s_cole_live, u_cole, mtn_hazy, brew_mtn, 1, 4.0,
    'Live music night. This beer + live music = perfect.')
  ON CONFLICT (id) DO NOTHING;

  -- Tara: Summit Sunset Hazy
  INSERT INTO beer_logs (id, session_id, user_id, beer_id, brewery_id, quantity, rating, comment)
  VALUES (bl03, s_tara, u_tara, mtn_hazy, brew_mtn, 1, 4.0,
    'Finally tried this one. Lives up to the hype.')
  ON CONFLICT (id) DO NOTHING;

  -- Lena: French Broad Belgian (the recommendation)
  INSERT INTO beer_logs (id, session_id, user_id, beer_id, brewery_id, quantity, rating, comment)
  VALUES (bl04, s_lena, u_lena, riv_belgian, brew_riv, 1, 5.0,
    'If you like Chimay, you need to try this. Local and just as good.')
  ON CONFLICT (id) DO NOTHING;

  -- Marcus: Smokehouse Porter (minimal card)
  INSERT INTO beer_logs (id, session_id, user_id, beer_id, brewery_id, quantity, rating, comment)
  VALUES (bl05, s_marcus, u_marcus, smk_porter, brew_smk, 1, 3.5, NULL)
  ON CONFLICT (id) DO NOTHING;

  -- Drew yesterday: Smokehouse Porter
  INSERT INTO beer_logs (id, session_id, user_id, beer_id, brewery_id, quantity, rating, comment)
  VALUES (bl06, s_drew_yest, u_drew, smk_porter, brew_smk, 2, 4.5,
    'Still the best porter in Asheville. Fight me.')
  ON CONFLICT (id) DO NOTHING;

  -- ── 6. Beer reviews — 5-star for "New Favorite" cards ─────────────────────
  INSERT INTO beer_reviews (user_id, beer_id, rating, comment, created_at)
  VALUES
    (u_lena, riv_belgian, 5, 'If you like Chimay, you need to try this. Local and just as good.', now() - interval '5 hours'),
    (u_drew, smk_imperial, 5, 'The barrel-aged version is genuinely world class. This is why I moved to Asheville.', now() - interval '2 hours'),
    (u_tara, mtn_hazy, 5, 'Summit Sunset finally dethroned my go-to hazy. New number one.', now() - interval '3 hours')
  ON CONFLICT (user_id, beer_id) DO NOTHING;

  -- ── 7. Brewery reviews ────────────────────────────────────────────────────
  INSERT INTO brewery_reviews (user_id, brewery_id, rating, comment, created_at)
  VALUES
    (u_drew, brew_smk, 5, 'My second home. Staff knows my order. Best barrel program in WNC.', now() - interval '2 days'),
    (u_cole, brew_mtn, 4, 'Great vibes, solid tap list. The hazy is the move.', now() - interval '1 day')
  ON CONFLICT (user_id, brewery_id) DO NOTHING;

  -- ── 8. Reactions (🍺 cheers) — pre-populate for ReactionBar ───────────────
  -- These will show counts once the UI ships
  INSERT INTO reactions (user_id, session_id, type) VALUES
    -- Drew's live session gets cheers from friends
    (u_mika,   s_drew_live, 'beer'),
    (u_cole,   s_drew_live, 'beer'),
    (u_tara,   s_drew_live, 'beer'),
    (u_lena,   s_drew_live, 'beer'),
    (u_marcus, s_drew_live, 'beer'),
    (josh_id,  s_drew_live, 'beer'),
    (u_drew,   s_drew_live, 'beer'),
    -- Cole's live session
    (u_drew,   s_cole_live, 'beer'),
    (u_mika,   s_cole_live, 'beer'),
    (u_tara,   s_cole_live, 'beer'),
    (josh_id,  s_cole_live, 'beer'),
    (u_marcus, s_cole_live, 'beer'),
    -- Tara's session
    (u_cole,   s_tara, 'beer'),
    (u_drew,   s_tara, 'beer'),
    (josh_id,  s_tara, 'beer'),
    -- Lena's recommendation session
    (u_drew,   s_lena, 'beer'),
    (u_mika,   s_lena, 'beer'),
    (u_cole,   s_lena, 'beer'),
    (u_tara,   s_lena, 'beer'),
    (josh_id,  s_lena, 'beer'),
    (u_marcus, s_lena, 'beer'),
    (u_lena,   s_lena, 'beer'),
    (u_drew,   s_lena, 'flame'),
    (u_mika,   s_lena, 'flame'),
    -- Marcus minimal
    (u_drew,   s_marcus, 'beer'),
    (josh_id,  s_marcus, 'beer'),
    -- Drew yesterday
    (u_mika,   s_drew_yest, 'beer'),
    (u_cole,   s_drew_yest, 'beer'),
    (u_tara,   s_drew_yest, 'beer'),
    (josh_id,  s_drew_yest, 'beer'),
    (u_marcus, s_drew_yest, 'beer'),
    (u_lena,   s_drew_yest, 'beer'),
    (u_drew,   s_drew_yest, 'beer'),
    (u_mika,   s_drew_yest, 'flame'),
    (u_cole,   s_drew_yest, 'flame'),
    (u_tara,   s_drew_yest, 'flame'),
    (josh_id,  s_drew_yest, 'flame'),
    (u_marcus, s_drew_yest, 'flame')
  ON CONFLICT DO NOTHING;

  -- ── 9. Session comments ───────────────────────────────────────────────────
  INSERT INTO session_comments (session_id, user_id, body, created_at) VALUES
    (s_drew_live, u_mika,   'Save me a seat!',                           now() - interval '20 minutes'),
    (s_drew_live, u_cole,   'The barrel-aged is back?! On my way.',      now() - interval '15 minutes'),
    (s_cole_live, u_drew,   'How''s the crowd tonight?',                 now() - interval '30 minutes'),
    (s_tara,      u_cole,   'Told you the hazy was worth it!',           now() - interval '2 hours'),
    (s_lena,      u_mika,   'Adding this to my list immediately.',       now() - interval '4 hours'),
    (s_lena,      u_drew,   'River Bend is so underrated.',              now() - interval '3 hours' - interval '30 minutes')
  ON CONFLICT DO NOTHING;

  -- ── 10. Set Beer of the Week — Smokehouse Porter ──────────────────────────
  UPDATE beers SET is_featured = false WHERE is_featured = true;
  UPDATE beers SET is_featured = true WHERE id = smk_porter;

  RAISE NOTICE 'Seed 011: "Your Round" data loaded.';
  RAISE NOTICE '  6 sessions (2 live, 4 completed)';
  RAISE NOTICE '  6 beer logs with notes';
  RAISE NOTICE '  3 five-star beer reviews (New Favorite cards)';
  RAISE NOTICE '  38 reactions (cheers pre-populated)';
  RAISE NOTICE '  6 session comments';
  RAISE NOTICE '  1 achievement (Belgian Explorer for Mika)';
  RAISE NOTICE '  Drew 7-day streak';
  RAISE NOTICE '  BOTW: Smokehouse Porter';

END $$;

-- ── Confirm ───────────────────────────────────────────────────────────────────
SELECT 'Seed 011 sessions: ' || COUNT(*)::text AS result
FROM sessions WHERE id IN (
  'bb000011-0000-0000-0000-000000000001',
  'bb000011-0000-0000-0000-000000000002',
  'bb000011-0000-0000-0000-000000000003',
  'bb000011-0000-0000-0000-000000000004',
  'bb000011-0000-0000-0000-000000000005',
  'bb000011-0000-0000-0000-000000000006'
)
UNION ALL
SELECT 'Seed 011 reactions: ' || COUNT(*)::text
FROM reactions WHERE session_id IN (
  'bb000011-0000-0000-0000-000000000001',
  'bb000011-0000-0000-0000-000000000002',
  'bb000011-0000-0000-0000-000000000003',
  'bb000011-0000-0000-0000-000000000004',
  'bb000011-0000-0000-0000-000000000005',
  'bb000011-0000-0000-0000-000000000006'
)
UNION ALL
SELECT 'Seed 011 comments: ' || COUNT(*)::text
FROM session_comments WHERE session_id IN (
  'bb000011-0000-0000-0000-000000000001',
  'bb000011-0000-0000-0000-000000000002',
  'bb000011-0000-0000-0000-000000000003'
);
