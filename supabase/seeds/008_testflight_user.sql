-- ─────────────────────────────────────────────────────────────────────────────
-- Seed 008: TestFlight Review Account
-- Creates a rich demo experience for the testflight@hoptrack.beer user.
-- Apple reviewers will see a populated app with sessions, achievements,
-- friends, breweries visited, and a wishlist.
--
-- PREREQUISITE: Create the user in Supabase Auth first:
--   Dashboard → Authentication → Users → Add User
--   Email: testflight@hoptrack.beer
--   Password: (your chosen password)
--   Confirm email: yes
--
-- Run AFTER migrations 001–013 and seeds 002–007.
-- Safe to re-run (ON CONFLICT DO NOTHING / DO UPDATE throughout).
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  tf_id uuid;

  -- Existing breweries (from seeds 002 + 007)
  pp_id uuid := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'; -- Pint & Pixel
  bs_id uuid := 'b2c3d4e5-f6a7-8901-bcde-f12345678901'; -- Barrel & Stone
  hf_id uuid := 'c3d4e5f6-a7b8-9012-cdef-012345678902'; -- Hopfield Brewing
  lc_id uuid := 'd4e5f6a7-b8c9-0123-defa-123456789003'; -- Lost Creek

  -- Beer IDs — resolved by name
  b_ipa     uuid; b_pils   uuid; b_stout  uuid; b_sour   uuid;
  b_dipa    uuid; b_porter uuid; b_wheat  uuid;

  -- Beer IDs — other breweries (from seed 007)
  bs_amber   uuid := 'e5f6a7b8-c9d0-1234-efab-234567890104';
  bs_ipa     uuid := 'f6a7b8c9-d0e1-2345-fabc-345678901205';
  hf_hazy    uuid := 'b8c9d0e1-f2a3-4567-bcde-567890123407';
  hf_saison  uuid := 'c9d0e1f2-a3b4-5678-cdef-678901234508';
  lc_kolsch  uuid := 'f2a3b4c5-d6e7-8901-fabc-901234567801';
  lc_sour    uuid := 'a3b4c5d6-e7f8-9012-abcd-012345678902';

  -- Session IDs (unique prefix so they don't collide with Josh's)
  tf_s01 uuid := 'bb000001-0000-0000-0000-000000000001';
  tf_s02 uuid := 'bb000001-0000-0000-0000-000000000002';
  tf_s03 uuid := 'bb000001-0000-0000-0000-000000000003';
  tf_s04 uuid := 'bb000001-0000-0000-0000-000000000004';
  tf_s05 uuid := 'bb000001-0000-0000-0000-000000000005';
  tf_s06 uuid := 'bb000001-0000-0000-0000-000000000006';
  tf_s07 uuid := 'bb000001-0000-0000-0000-000000000007';
  tf_s08 uuid := 'bb000001-0000-0000-0000-000000000008';

  -- Test users for friendships (from seed 003)
  u01 uuid := 'cc000000-0000-0000-0000-000000000001';
  u02 uuid := 'cc000000-0000-0000-0000-000000000002';
  u03 uuid := 'cc000000-0000-0000-0000-000000000003';
  u04 uuid := 'cc000000-0000-0000-0000-000000000004';
  u05 uuid := 'cc000000-0000-0000-0000-000000000005';

BEGIN

  -- ── 0. Find TestFlight user ─────────────────────────────────────────────
  SELECT id INTO tf_id
  FROM auth.users
  WHERE email = 'testflight@hoptrack.beer'
  LIMIT 1;

  IF tf_id IS NULL THEN
    RAISE EXCEPTION 'TestFlight user not found. Create the user first in Supabase Auth: testflight@hoptrack.beer';
  END IF;

  -- ── 1. Set up profile ──────────────────────────────────────────────────
  INSERT INTO public.profiles (id, username, display_name, bio, home_city, avatar_url, level, xp, total_checkins, unique_beers, unique_breweries, is_public, current_streak, longest_streak, last_session_date, notification_preferences)
  VALUES (
    tf_id,
    'hopreviewer',
    'Hop Reviewer',
    'Craft beer enthusiast exploring Austin''s best breweries. Always chasing the next great IPA.',
    'Austin, TX',
    'https://api.dicebear.com/7.x/thumbs/svg?seed=Waffles',
    7,
    2850,
    28,
    18,
    4,
    true,
    3,
    5,
    (now() - interval '1 day')::date,
    '{"friend_activity": true, "achievements": true, "weekly_stats": true}'::jsonb
  )
  ON CONFLICT (id) DO UPDATE SET
    display_name     = 'Hop Reviewer',
    bio              = EXCLUDED.bio,
    home_city        = 'Austin, TX',
    avatar_url       = EXCLUDED.avatar_url,
    level            = 7,
    xp               = 2850,
    total_checkins   = 28,
    unique_beers     = 18,
    unique_breweries = 4,
    is_public        = true,
    current_streak   = 3,
    longest_streak   = 5,
    last_session_date = (now() - interval '1 day')::date,
    notification_preferences = '{"friend_activity": true, "achievements": true, "weekly_stats": true}'::jsonb;

  -- ── 2. Fetch Pint & Pixel beer IDs ─────────────────────────────────────
  SELECT id INTO b_ipa    FROM beers WHERE brewery_id = pp_id AND name = 'Debug IPA';
  SELECT id INTO b_pils   FROM beers WHERE brewery_id = pp_id AND name = 'Pixel Perfect Pils';
  SELECT id INTO b_stout  FROM beers WHERE brewery_id = pp_id AND name = 'Dark Mode Stout';
  SELECT id INTO b_sour   FROM beers WHERE brewery_id = pp_id AND name = 'Stack Overflow Sour';
  SELECT id INTO b_dipa   FROM beers WHERE brewery_id = pp_id AND name = 'Deploy Friday DIPA';
  SELECT id INTO b_porter FROM beers WHERE brewery_id = pp_id AND name = 'Kernel Panic Porter';
  SELECT id INTO b_wheat  FROM beers WHERE brewery_id = pp_id AND name = '404 Wheat Not Found';

  -- ── 3. Sessions — 8 sessions across 30 days, 4 breweries + 1 home ────
  INSERT INTO sessions (id, user_id, brewery_id, context, is_active, share_to_feed, xp_awarded, started_at, ended_at) VALUES
    -- Pint & Pixel (home brewery — most visits)
    (tf_s01, tf_id, pp_id, 'brewery', false, true, 135, now() - interval '28 days' + interval '18 hours', now() - interval '28 days' + interval '21 hours'),
    (tf_s02, tf_id, pp_id, 'brewery', false, true, 185, now() - interval '21 days' + interval '17 hours', now() - interval '21 days' + interval '21 hours'),
    (tf_s03, tf_id, pp_id, 'brewery', false, true, 160, now() - interval '14 days' + interval '19 hours', now() - interval '14 days' + interval '22 hours'),
    (tf_s04, tf_id, pp_id, 'brewery', false, true, 150, now() - interval '3 days'  + interval '17 hours', now() - interval '3 days'  + interval '20 hours'),

    -- Barrel & Stone
    (tf_s05, tf_id, bs_id, 'brewery', false, true, 160, now() - interval '24 days' + interval '14 hours', now() - interval '24 days' + interval '17 hours'),

    -- Hopfield Brewing
    (tf_s06, tf_id, hf_id, 'brewery', false, true, 170, now() - interval '17 days' + interval '12 hours', now() - interval '17 days' + interval '16 hours'),

    -- Lost Creek
    (tf_s07, tf_id, lc_id, 'brewery', false, true, 145, now() - interval '10 days' + interval '15 hours', now() - interval '10 days' + interval '18 hours'),

    -- Home session
    (tf_s08, tf_id, NULL,  'home',    false, true, 75,  now() - interval '1 day'   + interval '20 hours', now() - interval '1 day'   + interval '22 hours')
  ON CONFLICT (id) DO NOTHING;

  -- ── 4. Beer logs ───────────────────────────────────────────────────────
  INSERT INTO beer_logs (session_id, user_id, beer_id, brewery_id, quantity, rating, flavor_tags, serving_style, comment, logged_at) VALUES
    -- s01: First P&P visit
    (tf_s01, tf_id, b_ipa,    pp_id, 1, 4.5, ARRAY['citrus','pine','hoppy'],   'draft', 'First time here. Debug IPA is exactly what I needed after a long week.', now() - interval '28 days' + interval '18 hours'),
    (tf_s01, tf_id, b_stout,  pp_id, 1, 4.0, ARRAY['roasty','chocolate'],     'draft', 'Dark Mode Stout — rich and smooth. Great to end the night.',              now() - interval '28 days' + interval '19 hours' + interval '30 min'),

    -- s02: Getting comfortable
    (tf_s02, tf_id, b_ipa,    pp_id, 2, 5.0, ARRAY['citrus','pine','hoppy'],   'draft', 'Two IPAs tonight. This beer is addictive.',                               now() - interval '21 days' + interval '17 hours'),
    (tf_s02, tf_id, b_sour,   pp_id, 1, 4.5, ARRAY['tart','fruity','crisp'],   'draft', 'Stack Overflow Sour — tart and refreshing.',                             now() - interval '21 days' + interval '18 hours'),
    (tf_s02, tf_id, b_dipa,   pp_id, 1, 4.5, ARRAY['dank','tropical','resinous'],'draft','Deploy Friday DIPA hit hard. In a good way.',                           now() - interval '21 days' + interval '19 hours'),

    -- s03: Exploring the menu
    (tf_s03, tf_id, b_porter, pp_id, 1, 4.0, ARRAY['smoky','vanilla','roasty'], 'draft', 'Kernel Panic Porter is smooth and complex.',                            now() - interval '14 days' + interval '19 hours'),
    (tf_s03, tf_id, b_wheat,  pp_id, 1, 3.5, ARRAY['banana','clove','hazy'],   'draft', 'Wheat beer isn''t my usual but this one is solid.',                      now() - interval '14 days' + interval '20 hours'),
    (tf_s03, tf_id, b_pils,   pp_id, 1, 4.0, ARRAY['crisp','floral','clean'],  'draft', 'Pilsner to close out. Clean and easy.',                                 now() - interval '14 days' + interval '21 hours'),

    -- s04: Recent quick visit
    (tf_s04, tf_id, b_ipa,    pp_id, 1, 5.0, ARRAY['citrus','pine'],           'draft', 'Quick stop. The IPA never disappoints.',                                 now() - interval '3 days' + interval '17 hours'),
    (tf_s04, tf_id, b_sour,   pp_id, 1, 4.5, ARRAY['tart','fruity'],          'draft', NULL,                                                                      now() - interval '3 days' + interval '18 hours'),

    -- s05: Barrel & Stone discovery
    (tf_s05, tf_id, bs_amber, bs_id, 1, 4.5, ARRAY['oak','caramel','bourbon'], 'draft', 'Barrel-aged amber — incredible depth of flavor.',                        now() - interval '24 days' + interval '14 hours'),
    (tf_s05, tf_id, bs_ipa,   bs_id, 1, 4.0, ARRAY['citrus','whiskey','hoppy'],'draft', 'Whiskey barrel IPA is a wild ride. Love it.',                            now() - interval '24 days' + interval '15 hours'),

    -- s06: Hopfield
    (tf_s06, tf_id, hf_hazy,  hf_id, 1, 5.0, ARRAY['hazy','tropical','mango'], 'draft', 'Hazy Daze might be the best hazy I''ve ever had.',                     now() - interval '17 days' + interval '12 hours'),
    (tf_s06, tf_id, hf_saison,hf_id, 1, 4.0, ARRAY['spicy','dry','effervescent'],'draft','Saison with great complexity. Paired well with lunch.',                now() - interval '17 days' + interval '13 hours'),

    -- s07: Lost Creek
    (tf_s07, tf_id, lc_kolsch,lc_id, 2, 4.5, ARRAY['crisp','clean','light'],  'draft', 'Two Kolsch on a hot day. Perfect.',                                      now() - interval '10 days' + interval '15 hours'),
    (tf_s07, tf_id, lc_sour,  lc_id, 1, 4.5, ARRAY['tart','lime','salty'],    'draft', 'Greenbelt Gose — cucumber and lime. Incredible.',                        now() - interval '10 days' + interval '16 hours'),

    -- s08: Home session
    (tf_s08, tf_id, hf_hazy,  NULL,  1, 5.0, ARRAY['hazy','tropical'],        'can',  'Picked up a 4-pack of Hazy Daze. Just as good at home.',                  now() - interval '1 day' + interval '20 hours'),
    (tf_s08, tf_id, b_ipa,    NULL,  1, 4.5, ARRAY['citrus','pine'],          'can',  'Debug IPA cans are finally available. Stocked.',                           now() - interval '1 day' + interval '21 hours')
  ON CONFLICT DO NOTHING;

  -- ── 5. Friendships — friends with 5 test users ─────────────────────────
  INSERT INTO friendships (requester_id, addressee_id, status, created_at) VALUES
    (tf_id, u01, 'accepted', now() - interval '25 days'),
    (tf_id, u02, 'accepted', now() - interval '20 days'),
    (u03,   tf_id, 'accepted', now() - interval '18 days'),
    (tf_id, u04, 'accepted', now() - interval '12 days'),
    (u05,   tf_id, 'accepted', now() - interval '8 days')
  ON CONFLICT (requester_id, addressee_id) DO UPDATE SET status = 'accepted';

  -- ── 6. Brewery visits ──────────────────────────────────────────────────
  INSERT INTO brewery_visits (user_id, brewery_id, total_visits, unique_beers_tried, first_visit_at, last_visit_at)
  VALUES
    (tf_id, pp_id, 4, 7, now() - interval '28 days', now() - interval '3 days'),
    (tf_id, bs_id, 1, 2, now() - interval '24 days', now() - interval '24 days'),
    (tf_id, hf_id, 1, 2, now() - interval '17 days', now() - interval '17 days'),
    (tf_id, lc_id, 1, 2, now() - interval '10 days', now() - interval '10 days')
  ON CONFLICT (user_id, brewery_id) DO UPDATE SET
    total_visits       = EXCLUDED.total_visits,
    unique_beers_tried = EXCLUDED.unique_beers_tried,
    last_visit_at      = EXCLUDED.last_visit_at;

  -- ── 7. Achievements ────────────────────────────────────────────────────
  INSERT INTO user_achievements (user_id, achievement_id, earned_at)
  SELECT tf_id, id, now() - interval '28 days' FROM achievements WHERE key = 'first_checkin'
  ON CONFLICT DO NOTHING;

  INSERT INTO user_achievements (user_id, achievement_id, earned_at)
  SELECT tf_id, id, now() - interval '14 days' FROM achievements WHERE key = 'getting_started'
  ON CONFLICT DO NOTHING;

  INSERT INTO user_achievements (user_id, achievement_id, earned_at)
  SELECT tf_id, id, now() - interval '21 days' FROM achievements WHERE key = 'session_sampler'
  ON CONFLICT DO NOTHING;

  INSERT INTO user_achievements (user_id, achievement_id, earned_at)
  SELECT tf_id, id, now() - interval '10 days' FROM achievements WHERE key = 'explorer'
  ON CONFLICT DO NOTHING;

  INSERT INTO user_achievements (user_id, achievement_id, earned_at)
  SELECT tf_id, id, now() - interval '14 days' FROM achievements WHERE key = 'craft_curious'
  ON CONFLICT DO NOTHING;

  INSERT INTO user_achievements (user_id, achievement_id, earned_at)
  SELECT tf_id, id, now() - interval '1 day' FROM achievements WHERE key = 'home_brewer'
  ON CONFLICT DO NOTHING;

  -- ── 8. Wishlist ────────────────────────────────────────────────────────
  INSERT INTO wishlist (user_id, beer_id, note)
  SELECT tf_id, id, 'Heard this one is amazing. Next visit.'
  FROM beers WHERE name = 'Kernel Panic Porter' AND brewery_id = pp_id
  ON CONFLICT DO NOTHING;

  INSERT INTO wishlist (user_id, beer_id, note)
  SELECT tf_id, id, 'Need to try their dark porter next time.'
  FROM beers WHERE id = 'd0e1f2a3-b4c5-6789-defa-789012345609'
  ON CONFLICT DO NOTHING;

  INSERT INTO wishlist (user_id, beer_id, note)
  SELECT tf_id, id, 'The gose looked incredible. Must try.'
  FROM beers WHERE id = lc_sour
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '✅ TestFlight user seeded. User ID: %', tf_id;
  RAISE NOTICE '   8 sessions · 19 beer logs · 5 friends · 4 breweries · 6 achievements · 3 wishlist';

END $$;

-- ── Verify ──────────────────────────────────────────────────────────────────
SELECT 'TestFlight sessions: '    || COUNT(*)::text AS result FROM sessions      WHERE user_id = (SELECT id FROM auth.users WHERE email = 'testflight@hoptrack.beer')
UNION ALL
SELECT 'TestFlight beer logs: '   || COUNT(*)::text FROM beer_logs  WHERE user_id = (SELECT id FROM auth.users WHERE email = 'testflight@hoptrack.beer')
UNION ALL
SELECT 'TestFlight friends: '     || COUNT(*)::text FROM friendships WHERE requester_id = (SELECT id FROM auth.users WHERE email = 'testflight@hoptrack.beer') OR addressee_id = (SELECT id FROM auth.users WHERE email = 'testflight@hoptrack.beer')
UNION ALL
SELECT 'TestFlight achievements: '|| COUNT(*)::text FROM user_achievements WHERE user_id = (SELECT id FROM auth.users WHERE email = 'testflight@hoptrack.beer')
UNION ALL
SELECT 'TestFlight breweries: '   || COUNT(*)::text FROM brewery_visits WHERE user_id = (SELECT id FROM auth.users WHERE email = 'testflight@hoptrack.beer');
