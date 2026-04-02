-- ============================================================================
-- Migration 076: Friday Night at Pint & Pixel — Realistic Load Test Seed
-- Sprint 116 — Seed Data
-- ============================================================================
-- Drew's Friday night model: ~120-150 visitors, ~400-500 drinks, peak 60-80
-- concurrent between 8-10pm. We simulate 40 HopTrack users across 12pm-1am.
--
-- Creates:
--   40 new auth users + profiles (all friends with Joshua)
--   50 sessions staggered 12pm-1am (some currently active)
--   160+ beer logs with ratings and comments
--   Beer reviews, brewery reviews
--   Notifications for Joshua (every card type)
--   Achievement unlocks
--   Reactions, wishlist items
--
-- All timestamps use CURRENT_DATE so data is always "today"
-- ============================================================================

DO $$
DECLARE
  -- Existing IDs
  joshua_id uuid := '90a1a802-8a79-4816-bf10-a900b91f2c5c';
  pp_brewery uuid := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

  -- Pint & Pixel beer IDs
  beer_kolsch uuid := 'cccccccc-0001-4000-8000-000000000001';
  beer_red    uuid := 'cccccccc-0002-4000-8000-000000000002';
  beer_belgian uuid := 'cccccccc-0003-4000-8000-000000000003';
  beer_ipa    uuid := 'cccccccc-0004-4000-8000-000000000004';
  beer_stout  uuid := 'cccccccc-0005-4000-8000-000000000005';
  beer_saison uuid := 'cccccccc-0006-4000-8000-000000000006';
  beer_pale   uuid := 'cccccccc-0007-4000-8000-000000000007';
  beer_bwine  uuid := 'cccccccc-0008-4000-8000-000000000008';
  beer_cider  uuid := 'cccccccc-0009-4000-8000-000000000009';
  beer_esb    uuid := 'cccccccc-0010-4000-8000-000000000010';

  -- New user UUIDs (40 users: f0000001 through f0000040)
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
  u16 uuid := 'f0000016-0000-4000-8000-000000000016';
  u17 uuid := 'f0000017-0000-4000-8000-000000000017';
  u18 uuid := 'f0000018-0000-4000-8000-000000000018';
  u19 uuid := 'f0000019-0000-4000-8000-000000000019';
  u20 uuid := 'f0000020-0000-4000-8000-000000000020';
  u21 uuid := 'f0000021-0000-4000-8000-000000000021';
  u22 uuid := 'f0000022-0000-4000-8000-000000000022';
  u23 uuid := 'f0000023-0000-4000-8000-000000000023';
  u24 uuid := 'f0000024-0000-4000-8000-000000000024';
  u25 uuid := 'f0000025-0000-4000-8000-000000000025';
  u26 uuid := 'f0000026-0000-4000-8000-000000000026';
  u27 uuid := 'f0000027-0000-4000-8000-000000000027';
  u28 uuid := 'f0000028-0000-4000-8000-000000000028';
  u29 uuid := 'f0000029-0000-4000-8000-000000000029';
  u30 uuid := 'f0000030-0000-4000-8000-000000000030';
  u31 uuid := 'f0000031-0000-4000-8000-000000000031';
  u32 uuid := 'f0000032-0000-4000-8000-000000000032';
  u33 uuid := 'f0000033-0000-4000-8000-000000000033';
  u34 uuid := 'f0000034-0000-4000-8000-000000000034';
  u35 uuid := 'f0000035-0000-4000-8000-000000000035';
  u36 uuid := 'f0000036-0000-4000-8000-000000000036';
  u37 uuid := 'f0000037-0000-4000-8000-000000000037';
  u38 uuid := 'f0000038-0000-4000-8000-000000000038';
  u39 uuid := 'f0000039-0000-4000-8000-000000000039';
  u40 uuid := 'f0000040-0000-4000-8000-000000000040';

  -- Session UUIDs (50 sessions: e1000001 through e1000050)
  s01 uuid := 'e1000001-0000-4000-8000-000000000001';
  s02 uuid := 'e1000002-0000-4000-8000-000000000002';
  s03 uuid := 'e1000003-0000-4000-8000-000000000003';
  s04 uuid := 'e1000004-0000-4000-8000-000000000004';
  s05 uuid := 'e1000005-0000-4000-8000-000000000005';
  s06 uuid := 'e1000006-0000-4000-8000-000000000006';
  s07 uuid := 'e1000007-0000-4000-8000-000000000007';
  s08 uuid := 'e1000008-0000-4000-8000-000000000008';
  s09 uuid := 'e1000009-0000-4000-8000-000000000009';
  s10 uuid := 'e1000010-0000-4000-8000-000000000010';
  s11 uuid := 'e1000011-0000-4000-8000-000000000011';
  s12 uuid := 'e1000012-0000-4000-8000-000000000012';
  s13 uuid := 'e1000013-0000-4000-8000-000000000013';
  s14 uuid := 'e1000014-0000-4000-8000-000000000014';
  s15 uuid := 'e1000015-0000-4000-8000-000000000015';
  s16 uuid := 'e1000016-0000-4000-8000-000000000016';
  s17 uuid := 'e1000017-0000-4000-8000-000000000017';
  s18 uuid := 'e1000018-0000-4000-8000-000000000018';
  s19 uuid := 'e1000019-0000-4000-8000-000000000019';
  s20 uuid := 'e1000020-0000-4000-8000-000000000020';
  s21 uuid := 'e1000021-0000-4000-8000-000000000021';
  s22 uuid := 'e1000022-0000-4000-8000-000000000022';
  s23 uuid := 'e1000023-0000-4000-8000-000000000023';
  s24 uuid := 'e1000024-0000-4000-8000-000000000024';
  s25 uuid := 'e1000025-0000-4000-8000-000000000025';
  s26 uuid := 'e1000026-0000-4000-8000-000000000026';
  s27 uuid := 'e1000027-0000-4000-8000-000000000027';
  s28 uuid := 'e1000028-0000-4000-8000-000000000028';
  s29 uuid := 'e1000029-0000-4000-8000-000000000029';
  s30 uuid := 'e1000030-0000-4000-8000-000000000030';
  s31 uuid := 'e1000031-0000-4000-8000-000000000031';
  s32 uuid := 'e1000032-0000-4000-8000-000000000032';
  s33 uuid := 'e1000033-0000-4000-8000-000000000033';
  s34 uuid := 'e1000034-0000-4000-8000-000000000034';
  s35 uuid := 'e1000035-0000-4000-8000-000000000035';
  s36 uuid := 'e1000036-0000-4000-8000-000000000036';
  s37 uuid := 'e1000037-0000-4000-8000-000000000037';
  s38 uuid := 'e1000038-0000-4000-8000-000000000038';
  s39 uuid := 'e1000039-0000-4000-8000-000000000039';
  s40 uuid := 'e1000040-0000-4000-8000-000000000040';
  s41 uuid := 'e1000041-0000-4000-8000-000000000041';
  s42 uuid := 'e1000042-0000-4000-8000-000000000042';
  s43 uuid := 'e1000043-0000-4000-8000-000000000043';
  s44 uuid := 'e1000044-0000-4000-8000-000000000044';
  s45 uuid := 'e1000045-0000-4000-8000-000000000045';
  s46 uuid := 'e1000046-0000-4000-8000-000000000046';
  s47 uuid := 'e1000047-0000-4000-8000-000000000047';
  s48 uuid := 'e1000048-0000-4000-8000-000000000048';
  s49 uuid := 'e1000049-0000-4000-8000-000000000049';
  s50 uuid := 'e1000050-0000-4000-8000-000000000050';

  -- Shared password hash (HopTrack2026!)
  pw_hash text := '$2y$10$6rYeUN3B6GkPEKFFgz8UQ.aZqzIzrsQ1Fv7oXxQVb3/E9NboeYQya';

  -- Today timestamps for session timing
  t_base timestamptz := CURRENT_DATE;

  -- Achievement IDs (looked up at runtime)
  ach_first_step uuid;
  ach_style_student uuid;
  ach_getting_started uuid;
  ach_regular uuid;
  ach_brewery_tourist uuid;

BEGIN

-- Look up achievement IDs
SELECT id INTO ach_first_step FROM achievements WHERE key = 'first_step' LIMIT 1;
SELECT id INTO ach_style_student FROM achievements WHERE key = 'style_student' LIMIT 1;
SELECT id INTO ach_getting_started FROM achievements WHERE key = 'getting_started' LIMIT 1;
SELECT id INTO ach_regular FROM achievements WHERE key = 'regular' LIMIT 1;
SELECT id INTO ach_brewery_tourist FROM achievements WHERE key = 'brewery_tourist_10' LIMIT 1;

-- ============================================================================
-- 1. CREATE 40 AUTH USERS
-- ============================================================================
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, is_super_admin)
VALUES
  ('00000000-0000-0000-0000-000000000000', u01, 'authenticated', 'authenticated', 'marcus.chen@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u02, 'authenticated', 'authenticated', 'riley.jackson@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u03, 'authenticated', 'authenticated', 'maya.patel@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u04, 'authenticated', 'authenticated', 'jake.morrison@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u05, 'authenticated', 'authenticated', 'sofia.reyes@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u06, 'authenticated', 'authenticated', 'ethan.brooks@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u07, 'authenticated', 'authenticated', 'zoe.williams@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u08, 'authenticated', 'authenticated', 'noah.kim@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u09, 'authenticated', 'authenticated', 'emma.garcia@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u10, 'authenticated', 'authenticated', 'liam.nguyen@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u11, 'authenticated', 'authenticated', 'olivia.taylor@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u12, 'authenticated', 'authenticated', 'aiden.johnson@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u13, 'authenticated', 'authenticated', 'chloe.martinez@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u14, 'authenticated', 'authenticated', 'mason.davis@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u15, 'authenticated', 'authenticated', 'ava.wilson@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u16, 'authenticated', 'authenticated', 'ben.thomas@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u17, 'authenticated', 'authenticated', 'mia.anderson@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u18, 'authenticated', 'authenticated', 'lucas.white@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u19, 'authenticated', 'authenticated', 'harper.lee@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u20, 'authenticated', 'authenticated', 'jack.harris@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u21, 'authenticated', 'authenticated', 'ella.clark@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u22, 'authenticated', 'authenticated', 'owen.lewis@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u23, 'authenticated', 'authenticated', 'lily.walker@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u24, 'authenticated', 'authenticated', 'caleb.hall@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u25, 'authenticated', 'authenticated', 'grace.young@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u26, 'authenticated', 'authenticated', 'wyatt.king@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u27, 'authenticated', 'authenticated', 'scarlett.wright@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u28, 'authenticated', 'authenticated', 'leo.scott@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u29, 'authenticated', 'authenticated', 'nora.green@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u30, 'authenticated', 'authenticated', 'henry.baker@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u31, 'authenticated', 'authenticated', 'layla.adams@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u32, 'authenticated', 'authenticated', 'sam.nelson@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u33, 'authenticated', 'authenticated', 'aria.hill@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u34, 'authenticated', 'authenticated', 'logan.ramirez@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u35, 'authenticated', 'authenticated', 'luna.campbell@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u36, 'authenticated', 'authenticated', 'alex.mitchell@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u37, 'authenticated', 'authenticated', 'violet.roberts@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u38, 'authenticated', 'authenticated', 'daniel.turner@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u39, 'authenticated', 'authenticated', 'ivy.phillips@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false),
  ('00000000-0000-0000-0000-000000000000', u40, 'authenticated', 'authenticated', 'max.carter@test.hoptrack.beer', pw_hash, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', false)
ON CONFLICT (id) DO NOTHING;

-- Identity records for email login
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
SELECT u.id, u.id, jsonb_build_object('sub', u.id::text, 'email', u.email), 'email', u.id::text, now(), now(), now()
FROM auth.users u
WHERE u.id IN (u01,u02,u03,u04,u05,u06,u07,u08,u09,u10,u11,u12,u13,u14,u15,u16,u17,u18,u19,u20,u21,u22,u23,u24,u25,u26,u27,u28,u29,u30,u31,u32,u33,u34,u35,u36,u37,u38,u39,u40)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2. CREATE 40 PROFILES
-- ============================================================================
INSERT INTO profiles (id, username, display_name, bio, home_city, xp, level, total_checkins, unique_beers, unique_breweries, is_public, created_at) VALUES
  (u01, 'marcuschen',     'Marcus Chen',     'IPA evangelist. Will trade ratings for pours.', 'Asheville, NC', 320, 3, 22, 18, 6, true, now() - interval '30 days'),
  (u02, 'rileyjackson',   'Riley Jackson',   'Stout season is every season.', 'Asheville, NC', 480, 4, 35, 25, 8, true, now() - interval '28 days'),
  (u03, 'mayapatel',      'Maya Patel',      'Sour beer sommelier in training.', 'Asheville, NC', 250, 3, 18, 15, 5, true, now() - interval '25 days'),
  (u04, 'jakemorrison',   'Jake Morrison',   'Lager loyalist. Fight me.', 'Black Mountain, NC', 560, 5, 40, 28, 10, true, now() - interval '35 days'),
  (u05, 'sofiareyes',     'Sofia Reyes',     'Cider first, ask questions later.', 'Asheville, NC', 180, 2, 12, 10, 4, true, now() - interval '14 days'),
  (u06, 'ethanbrooks',    'Ethan Brooks',    'Homebrew → pro drinker pipeline.', 'Weaverville, NC', 420, 4, 30, 22, 7, true, now() - interval '40 days'),
  (u07, 'zoewilliams',    'Zoe Williams',    'Here for the vibes and the hazies.', 'Asheville, NC', 350, 3, 24, 20, 6, true, now() - interval '20 days'),
  (u08, 'noahkim',        'Noah Kim',        'Belgian ale appreciation society, president.', 'Asheville, NC', 680, 5, 48, 35, 12, true, now() - interval '45 days'),
  (u09, 'emmagarcia',     'Emma Garcia',     'New to craft, loving every sip.', 'Arden, NC', 90, 1, 6, 5, 2, true, now() - interval '7 days'),
  (u10, 'liamnguyen',     'Liam Nguyen',     'Saison fanatic. Dry finish or bust.', 'Asheville, NC', 510, 4, 36, 26, 9, true, now() - interval '32 days'),
  (u11, 'oliviataylor',   'Olivia Taylor',   'Flight boards > commitment.', 'Swannanoa, NC', 290, 3, 20, 16, 5, true, now() - interval '18 days'),
  (u12, 'aidenjohnson',   'Aiden Johnson',   'Dark beers, dark roasts, dark mode.', 'Asheville, NC', 440, 4, 32, 24, 8, true, now() - interval '38 days'),
  (u13, 'chloemartinez',  'Chloe Martinez',  'Wheat beer enthusiast. Judge me.', 'Fletcher, NC', 200, 2, 14, 11, 4, true, now() - interval '15 days'),
  (u14, 'masondavis',     'Mason Davis',     'If it pours, I score.', 'Asheville, NC', 600, 5, 42, 30, 11, true, now() - interval '42 days'),
  (u15, 'avawilson',      'Ava Wilson',      'Spontaneous brewery hopper.', 'Hendersonville, NC', 150, 2, 10, 8, 3, true, now() - interval '10 days'),
  (u16, 'benthomas',      'Ben Thomas',      'Pint & Pixel regular. The IPA is godly.', 'Asheville, NC', 750, 6, 52, 38, 14, true, now() - interval '50 days'),
  (u17, 'miaanderson',    'Mia Anderson',    'Breweries > bars, always.', 'Asheville, NC', 380, 3, 26, 20, 7, true, now() - interval '22 days'),
  (u18, 'lucaswhite',     'Lucas White',     'ESB connoisseur. Old school.', 'Woodfin, NC', 270, 3, 19, 15, 5, true, now() - interval '16 days'),
  (u19, 'harperlee',      'Harper Lee',      'Not the author. Better taste in beer.', 'Asheville, NC', 460, 4, 33, 24, 8, true, now() - interval '28 days'),
  (u20, 'jackharris',     'Jack Harris',     'Friday night = Pint & Pixel night.', 'Asheville, NC', 540, 5, 38, 28, 10, true, now() - interval '36 days'),
  (u21, 'ellaclark',      'Ella Clark',      'Tasting notes: yes.', 'Asheville, NC', 310, 3, 21, 17, 6, true, now() - interval '24 days'),
  (u22, 'owenlewis',      'Owen Lewis',      'Barleywine collector. Double digits.', 'Candler, NC', 620, 5, 44, 32, 11, true, now() - interval '44 days'),
  (u23, 'lilywalker',     'Lily Walker',     'Beer garden > office garden.', 'Asheville, NC', 230, 2, 16, 13, 4, true, now() - interval '12 days'),
  (u24, 'calebhall',      'Caleb Hall',      'Porter lover, pizza eater.', 'Asheville, NC', 400, 4, 28, 21, 7, true, now() - interval '30 days'),
  (u25, 'graceyoung',     'Grace Young',     'Hops make everything better.', 'Asheville, NC', 340, 3, 23, 19, 6, true, now() - interval '21 days'),
  (u26, 'wyattking',      'Wyatt King',      'Taproom philosopher.', 'Asheville, NC', 490, 4, 34, 25, 9, true, now() - interval '33 days'),
  (u27, 'scarlettwri',    'Scarlett Wright', 'Nitro stout is my love language.', 'Asheville, NC', 360, 3, 25, 20, 7, true, now() - interval '26 days'),
  (u28, 'leoscott',       'Leo Scott',       'Session ales for session people.', 'Mars Hill, NC', 160, 2, 11, 9, 3, true, now() - interval '9 days'),
  (u29, 'noragreen',      'Nora Green',      'Craft curious. Send recommendations.', 'Asheville, NC', 120, 1, 8, 7, 3, true, now() - interval '8 days'),
  (u30, 'henrybaker',     'Henry Baker',     'Kölsch in the streets, stout in the sheets.', 'Asheville, NC', 580, 5, 41, 29, 10, true, now() - interval '37 days'),
  (u31, 'laylaadams',     'Layla Adams',     'Here for the atmosphere.', 'Asheville, NC', 210, 2, 15, 12, 4, true, now() - interval '13 days'),
  (u32, 'samnelson',      'Sam Nelson',      'Brewery data nerd.', 'Asheville, NC', 450, 4, 31, 23, 8, true, now() - interval '29 days'),
  (u33, 'ariahill',       'Aria Hill',       'Amber ales are underrated.', 'Asheville, NC', 280, 3, 19, 16, 5, true, now() - interval '17 days'),
  (u34, 'loganramirez',   'Logan Ramirez',   'Double IPA enthusiast. Go big.', 'Asheville, NC', 520, 5, 37, 27, 9, true, now() - interval '34 days'),
  (u35, 'lunacampbell',   'Luna Campbell',   'Blonde ales and sunshine.', 'Asheville, NC', 170, 2, 12, 10, 3, true, now() - interval '11 days'),
  (u36, 'alexmitchell',   'Alex Mitchell',   'Brewery tour guide (unofficial).', 'Asheville, NC', 700, 6, 50, 36, 13, true, now() - interval '48 days'),
  (u37, 'violetroberts',  'Violet Roberts',  'Sour + fruit = happiness.', 'Asheville, NC', 330, 3, 23, 18, 6, true, now() - interval '19 days'),
  (u38, 'danielturner',   'Daniel Turner',   'Pint & Pixel employee turned regular.', 'Asheville, NC', 640, 5, 45, 33, 12, true, now() - interval '46 days'),
  (u39, 'ivyphillips',    'Ivy Phillips',    'Light beers, heavy opinions.', 'Asheville, NC', 240, 2, 17, 14, 5, true, now() - interval '14 days'),
  (u40, 'maxcarter',      'Max Carter',      'The barleywine. Always the barleywine.', 'Asheville, NC', 550, 5, 39, 28, 10, true, now() - interval '39 days')
ON CONFLICT (id) DO UPDATE SET
  xp = EXCLUDED.xp,
  level = EXCLUDED.level,
  total_checkins = EXCLUDED.total_checkins,
  unique_beers = EXCLUDED.unique_beers,
  unique_breweries = EXCLUDED.unique_breweries;

-- ============================================================================
-- 3. FRIENDSHIPS — All 40 friends with Joshua (accepted)
-- ============================================================================
INSERT INTO friendships (requester_id, addressee_id, status, created_at) VALUES
  (u01, joshua_id, 'accepted', now() - interval '29 days'),
  (u02, joshua_id, 'accepted', now() - interval '27 days'),
  (joshua_id, u03, 'accepted', now() - interval '24 days'),
  (u04, joshua_id, 'accepted', now() - interval '34 days'),
  (joshua_id, u05, 'accepted', now() - interval '13 days'),
  (u06, joshua_id, 'accepted', now() - interval '39 days'),
  (joshua_id, u07, 'accepted', now() - interval '19 days'),
  (u08, joshua_id, 'accepted', now() - interval '44 days'),
  (joshua_id, u09, 'accepted', now() - interval '6 days'),
  (u10, joshua_id, 'accepted', now() - interval '31 days'),
  (joshua_id, u11, 'accepted', now() - interval '17 days'),
  (u12, joshua_id, 'accepted', now() - interval '37 days'),
  (joshua_id, u13, 'accepted', now() - interval '14 days'),
  (u14, joshua_id, 'accepted', now() - interval '41 days'),
  (joshua_id, u15, 'accepted', now() - interval '9 days'),
  (u16, joshua_id, 'accepted', now() - interval '49 days'),
  (joshua_id, u17, 'accepted', now() - interval '21 days'),
  (u18, joshua_id, 'accepted', now() - interval '15 days'),
  (joshua_id, u19, 'accepted', now() - interval '27 days'),
  (u20, joshua_id, 'accepted', now() - interval '35 days'),
  (joshua_id, u21, 'accepted', now() - interval '23 days'),
  (u22, joshua_id, 'accepted', now() - interval '43 days'),
  (joshua_id, u23, 'accepted', now() - interval '11 days'),
  (u24, joshua_id, 'accepted', now() - interval '29 days'),
  (joshua_id, u25, 'accepted', now() - interval '20 days'),
  (u26, joshua_id, 'accepted', now() - interval '32 days'),
  (joshua_id, u27, 'accepted', now() - interval '25 days'),
  (u28, joshua_id, 'accepted', now() - interval '8 days'),
  (joshua_id, u29, 'accepted', now() - interval '7 days'),
  (u30, joshua_id, 'accepted', now() - interval '36 days'),
  (joshua_id, u31, 'accepted', now() - interval '12 days'),
  (u32, joshua_id, 'accepted', now() - interval '28 days'),
  (joshua_id, u33, 'accepted', now() - interval '16 days'),
  (u34, joshua_id, 'accepted', now() - interval '33 days'),
  (joshua_id, u35, 'accepted', now() - interval '10 days'),
  (u36, joshua_id, 'accepted', now() - interval '47 days'),
  (joshua_id, u37, 'accepted', now() - interval '18 days'),
  (u38, joshua_id, 'accepted', now() - interval '45 days'),
  (joshua_id, u39, 'accepted', now() - interval '13 days'),
  (u40, joshua_id, 'accepted', now() - interval '38 days')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. SESSIONS — Drew's Friday night: 12pm-1am at Pint & Pixel
-- ============================================================================
-- Time blocks: Lunch (12-3), Afternoon (3-5), Happy Hour (5-8), Peak (8-11), Late (11-1)
-- 8 ACTIVE sessions (currently live, no ended_at) for the 8-10pm peak

-- ── Lunch Crowd (12pm-3pm) — 8 sessions, chill regulars ──
INSERT INTO sessions (id, user_id, brewery_id, context, started_at, ended_at, is_active, share_to_feed, xp_awarded, created_at) VALUES
  (s01, u01, pp_brewery, 'brewery', t_base + interval '12 hours',      t_base + interval '13 hours 20 min', false, true, 30, t_base + interval '12 hours'),
  (s02, u04, pp_brewery, 'brewery', t_base + interval '12 hours 15 min', t_base + interval '14 hours',       false, true, 25, t_base + interval '12 hours 15 min'),
  (s03, u08, pp_brewery, 'brewery', t_base + interval '12 hours 30 min', t_base + interval '13 hours 45 min', false, true, 35, t_base + interval '12 hours 30 min'),
  (s04, u16, pp_brewery, 'brewery', t_base + interval '13 hours',      t_base + interval '14 hours 30 min', false, true, 40, t_base + interval '13 hours'),
  (s05, u20, pp_brewery, 'brewery', t_base + interval '13 hours 30 min', t_base + interval '14 hours 45 min', false, true, 30, t_base + interval '13 hours 30 min'),
  (s06, u30, pp_brewery, 'brewery', t_base + interval '14 hours',      t_base + interval '15 hours',        false, true, 20, t_base + interval '14 hours'),
  (s07, u36, pp_brewery, 'brewery', t_base + interval '14 hours 15 min', t_base + interval '15 hours 30 min', false, true, 45, t_base + interval '14 hours 15 min'),
  (s08, u38, pp_brewery, 'brewery', t_base + interval '14 hours 30 min', t_base + interval '15 hours 45 min', false, true, 35, t_base + interval '14 hours 30 min'),

-- ── Afternoon Trickle (3pm-5pm) — 10 sessions ──
  (s09, u02, pp_brewery, 'brewery', t_base + interval '15 hours',      t_base + interval '16 hours 30 min', false, true, 30, t_base + interval '15 hours'),
  (s10, u06, pp_brewery, 'brewery', t_base + interval '15 hours 15 min', t_base + interval '16 hours 45 min', false, true, 35, t_base + interval '15 hours 15 min'),
  (s11, u10, pp_brewery, 'brewery', t_base + interval '15 hours 30 min', t_base + interval '17 hours',       false, true, 40, t_base + interval '15 hours 30 min'),
  (s12, u14, pp_brewery, 'brewery', t_base + interval '15 hours 45 min', t_base + interval '16 hours 30 min', false, true, 25, t_base + interval '15 hours 45 min'),
  (s13, u22, pp_brewery, 'brewery', t_base + interval '16 hours',      t_base + interval '17 hours 15 min', false, true, 35, t_base + interval '16 hours'),
  (s14, u24, pp_brewery, 'brewery', t_base + interval '16 hours 15 min', t_base + interval '17 hours 30 min', false, true, 30, t_base + interval '16 hours 15 min'),
  (s15, u26, pp_brewery, 'brewery', t_base + interval '16 hours 30 min', t_base + interval '17 hours 45 min', false, true, 40, t_base + interval '16 hours 30 min'),
  (s16, u32, pp_brewery, 'brewery', t_base + interval '16 hours 45 min', t_base + interval '18 hours',       false, true, 35, t_base + interval '16 hours 45 min'),
  (s17, u11, pp_brewery, 'brewery', t_base + interval '16 hours',      t_base + interval '17 hours',        false, true, 20, t_base + interval '16 hours'),
  (s18, u13, pp_brewery, 'brewery', t_base + interval '16 hours 30 min', t_base + interval '17 hours 15 min', false, true, 25, t_base + interval '16 hours 30 min'),

-- ── Happy Hour Rush (5pm-8pm) — 15 sessions, groups arriving ──
  (s19, u03, pp_brewery, 'brewery', t_base + interval '17 hours',      t_base + interval '19 hours 30 min', false, true, 50, t_base + interval '17 hours'),
  (s20, u05, pp_brewery, 'brewery', t_base + interval '17 hours 15 min', t_base + interval '19 hours',       false, true, 40, t_base + interval '17 hours 15 min'),
  (s21, u07, pp_brewery, 'brewery', t_base + interval '17 hours 30 min', t_base + interval '20 hours',       false, true, 55, t_base + interval '17 hours 30 min'),
  (s22, u09, pp_brewery, 'brewery', t_base + interval '17 hours 45 min', t_base + interval '19 hours 15 min', false, true, 35, t_base + interval '17 hours 45 min'),
  (s23, u12, pp_brewery, 'brewery', t_base + interval '18 hours',      t_base + interval '20 hours 30 min', false, true, 60, t_base + interval '18 hours'),
  (s24, u15, pp_brewery, 'brewery', t_base + interval '18 hours 15 min', t_base + interval '19 hours 30 min', false, true, 30, t_base + interval '18 hours 15 min'),
  (s25, u17, pp_brewery, 'brewery', t_base + interval '18 hours 30 min', t_base + interval '20 hours 15 min', false, true, 45, t_base + interval '18 hours 30 min'),
  (s26, u19, pp_brewery, 'brewery', t_base + interval '18 hours 45 min', t_base + interval '20 hours',       false, true, 40, t_base + interval '18 hours 45 min'),
  (s27, u21, pp_brewery, 'brewery', t_base + interval '19 hours',      t_base + interval '20 hours 45 min', false, true, 50, t_base + interval '19 hours'),
  (s28, u23, pp_brewery, 'brewery', t_base + interval '19 hours 15 min', t_base + interval '20 hours 30 min', false, true, 35, t_base + interval '19 hours 15 min'),
  (s29, u25, pp_brewery, 'brewery', t_base + interval '19 hours 30 min', t_base + interval '21 hours',       false, true, 45, t_base + interval '19 hours 30 min'),
  (s30, u27, pp_brewery, 'brewery', t_base + interval '19 hours 45 min', t_base + interval '21 hours 15 min', false, true, 40, t_base + interval '19 hours 45 min'),
  (s31, u29, pp_brewery, 'brewery', t_base + interval '17 hours 30 min', t_base + interval '18 hours 45 min', false, true, 25, t_base + interval '17 hours 30 min'),
  (s32, u31, pp_brewery, 'brewery', t_base + interval '18 hours',      t_base + interval '19 hours 30 min', false, true, 30, t_base + interval '18 hours'),
  (s33, u33, pp_brewery, 'brewery', t_base + interval '19 hours',      t_base + interval '20 hours 15 min', false, true, 35, t_base + interval '19 hours'),

-- ── Peak Night (8pm-11pm) — 12 sessions, 8 CURRENTLY ACTIVE ──
  (s34, u34, pp_brewery, 'brewery', t_base + interval '20 hours',      NULL,                                 true,  true, 0, t_base + interval '20 hours'),
  (s35, u35, pp_brewery, 'brewery', t_base + interval '20 hours 15 min', NULL,                               true,  true, 0, t_base + interval '20 hours 15 min'),
  (s36, u37, pp_brewery, 'brewery', t_base + interval '20 hours 30 min', NULL,                               true,  true, 0, t_base + interval '20 hours 30 min'),
  (s37, u39, pp_brewery, 'brewery', t_base + interval '20 hours 45 min', NULL,                               true,  true, 0, t_base + interval '20 hours 45 min'),
  (s38, u40, pp_brewery, 'brewery', t_base + interval '21 hours',      NULL,                                 true,  true, 0, t_base + interval '21 hours'),
  (s39, u01, pp_brewery, 'brewery', t_base + interval '21 hours 15 min', NULL,                               true,  true, 0, t_base + interval '21 hours 15 min'),
  (s40, u08, pp_brewery, 'brewery', t_base + interval '21 hours 30 min', NULL,                               true,  true, 0, t_base + interval '21 hours 30 min'),
  (s41, u16, pp_brewery, 'brewery', t_base + interval '21 hours 45 min', NULL,                               true,  true, 0, t_base + interval '21 hours 45 min'),
  -- 4 ended peak sessions
  (s42, u18, pp_brewery, 'brewery', t_base + interval '20 hours',      t_base + interval '22 hours',        false, true, 55, t_base + interval '20 hours'),
  (s43, u28, pp_brewery, 'brewery', t_base + interval '20 hours 30 min', t_base + interval '22 hours 15 min', false, true, 45, t_base + interval '20 hours 30 min'),
  (s44, u30, pp_brewery, 'brewery', t_base + interval '21 hours',      t_base + interval '22 hours 30 min', false, true, 40, t_base + interval '21 hours'),
  (s45, u36, pp_brewery, 'brewery', t_base + interval '20 hours 15 min', t_base + interval '22 hours 45 min', false, true, 60, t_base + interval '20 hours 15 min'),

-- ── Late Night Wind-Down (11pm-1am) — 5 sessions ──
  (s46, u02, pp_brewery, 'brewery', t_base + interval '23 hours',      t_base + interval '24 hours',        false, true, 25, t_base + interval '23 hours'),
  (s47, u10, pp_brewery, 'brewery', t_base + interval '23 hours 15 min', t_base + interval '24 hours 15 min', false, true, 20, t_base + interval '23 hours 15 min'),
  (s48, u14, pp_brewery, 'brewery', t_base + interval '23 hours 30 min', t_base + interval '24 hours 30 min', false, true, 30, t_base + interval '23 hours 30 min'),
  (s49, u22, pp_brewery, 'brewery', t_base + interval '23 hours 45 min', t_base + interval '24 hours 45 min', false, true, 25, t_base + interval '23 hours 45 min'),
  (s50, u20, pp_brewery, 'brewery', t_base + interval '24 hours',      t_base + interval '25 hours',        false, true, 30, t_base + interval '24 hours')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 5. BEER LOGS — 160+ pours across all sessions
-- ============================================================================
-- Each session gets 1-5 beer logs with ratings, comments, serving styles
INSERT INTO beer_logs (id, session_id, user_id, beer_id, brewery_id, rating, flavor_tags, serving_style, comment, logged_at) VALUES
  -- Lunch sessions (1-2 beers each)
  (gen_random_uuid(), s01, u01, beer_ipa,    pp_brewery, 4.5, '{hoppy,citrus,hazy}', 'pint', 'Infinite Loop hits different at noon. Mango bomb.', t_base + interval '12 hours 15 min'),
  (gen_random_uuid(), s01, u01, beer_kolsch, pp_brewery, 4.0, '{crisp,light,clean}', 'pint', 'Perfect lunchtime beer.', t_base + interval '12 hours 45 min'),
  (gen_random_uuid(), s02, u04, beer_kolsch, pp_brewery, 3.5, '{light,clean}', 'pint', 'Solid kölsch. Not flashy, just right.', t_base + interval '12 hours 30 min'),
  (gen_random_uuid(), s02, u04, beer_esb,    pp_brewery, 4.0, '{malty,earthy,biscuit}', 'pint', 'Old school. Respecting the classics.', t_base + interval '13 hours 15 min'),
  (gen_random_uuid(), s03, u08, beer_belgian,pp_brewery, 5.0, '{fruity,spicy,complex}', 'goblet', 'Git Blame is a masterpiece. Period.', t_base + interval '12 hours 45 min'),
  (gen_random_uuid(), s03, u08, beer_saison, pp_brewery, 4.5, '{peppery,dry,refreshing}', 'tulip', 'Syntax Error pairs beautifully with the Belgian.', t_base + interval '13 hours 15 min'),
  (gen_random_uuid(), s04, u16, beer_ipa,    pp_brewery, 5.0, '{juicy,tropical,pillowy}', 'pint', 'THE IPA. Every time. Never gets old.', t_base + interval '13 hours 15 min'),
  (gen_random_uuid(), s04, u16, beer_pale,   pp_brewery, 4.0, '{citrus,sessionable}', 'pint', 'Great follow-up to the IPA.', t_base + interval '13 hours 45 min'),
  (gen_random_uuid(), s04, u16, beer_stout,  pp_brewery, 4.5, '{chocolate,espresso,creamy}', 'pint', 'Nitro stout for the win.', t_base + interval '14 hours 15 min'),
  (gen_random_uuid(), s05, u20, beer_red,    pp_brewery, 4.0, '{caramel,toasty,smooth}', 'pint', 'Regex Red is an underrated gem.', t_base + interval '13 hours 45 min'),
  (gen_random_uuid(), s05, u20, beer_kolsch, pp_brewery, 3.5, '{light,clean}', 'pint', 'Easy drinking.', t_base + interval '14 hours 15 min'),
  (gen_random_uuid(), s06, u30, beer_esb,    pp_brewery, 4.5, '{biscuit,earthy,balanced}', 'pint', 'Proper English bitter. Love it.', t_base + interval '14 hours 15 min'),
  (gen_random_uuid(), s07, u36, beer_ipa,    pp_brewery, 4.5, '{hazy,mango,pineapple}', 'pint', 'Asheville IPA game is strong.', t_base + interval '14 hours 30 min'),
  (gen_random_uuid(), s07, u36, beer_belgian,pp_brewery, 4.0, '{fruity,strong}', 'goblet', 'Dangerous. Could have three.', t_base + interval '15 hours'),
  (gen_random_uuid(), s07, u36, beer_bwine,  pp_brewery, 5.0, '{toffee,dark_fruit,warming}', 'snifter', 'Binary Barleywine. Dessert in a glass.', t_base + interval '15 hours 15 min'),
  (gen_random_uuid(), s08, u38, beer_stout,  pp_brewery, 4.5, '{creamy,chocolate,coffee}', 'pint', 'Null Pointer never crashes.', t_base + interval '14 hours 45 min'),
  (gen_random_uuid(), s08, u38, beer_red,    pp_brewery, 4.0, '{malty,caramel}', 'pint', 'Good malt backbone.', t_base + interval '15 hours 15 min'),

  -- Afternoon sessions (1-2 beers each)
  (gen_random_uuid(), s09, u02, beer_stout,  pp_brewery, 5.0, '{chocolate,espresso,creamy}', 'pint', 'Stout season never ends for me.', t_base + interval '15 hours 15 min'),
  (gen_random_uuid(), s09, u02, beer_bwine,  pp_brewery, 4.5, '{warming,toffee}', 'snifter', 'Two big beers. Friday mood.', t_base + interval '16 hours'),
  (gen_random_uuid(), s10, u06, beer_pale,   pp_brewery, 4.0, '{citrus,light}', 'pint', 'Hotfix is a banger session pale.', t_base + interval '15 hours 30 min'),
  (gen_random_uuid(), s10, u06, beer_ipa,    pp_brewery, 4.5, '{tropical,juicy}', 'pint', 'Had to follow up with the IPA.', t_base + interval '16 hours 15 min'),
  (gen_random_uuid(), s11, u10, beer_saison, pp_brewery, 5.0, '{dry,peppery,citrus}', 'tulip', 'Saison perfection. This is my beer.', t_base + interval '15 hours 45 min'),
  (gen_random_uuid(), s11, u10, beer_belgian,pp_brewery, 4.5, '{fruity,complex}', 'goblet', 'Belgian + Saison back to back. Chef kiss.', t_base + interval '16 hours 30 min'),
  (gen_random_uuid(), s12, u14, beer_ipa,    pp_brewery, 4.5, '{hazy,tropical}', 'pint', 'Infinite Loop infinite times.', t_base + interval '16 hours'),
  (gen_random_uuid(), s13, u22, beer_bwine,  pp_brewery, 5.0, '{dark_fruit,toffee,complex}', 'snifter', 'Binary Barleywine is my #1. Adding to collection.', t_base + interval '16 hours 15 min'),
  (gen_random_uuid(), s13, u22, beer_stout,  pp_brewery, 4.0, '{chocolate,creamy}', 'pint', 'Solid nitro stout chaser.', t_base + interval '16 hours 45 min'),
  (gen_random_uuid(), s14, u24, beer_red,    pp_brewery, 4.0, '{caramel,smooth}', 'pint', 'Regex Red with the pizza menu. Perfect.', t_base + interval '16 hours 30 min'),
  (gen_random_uuid(), s14, u24, beer_esb,    pp_brewery, 4.0, '{earthy,malty}', 'pint', 'ESB for the old soul in me.', t_base + interval '17 hours'),
  (gen_random_uuid(), s15, u26, beer_ipa,    pp_brewery, 4.5, '{hoppy,juicy}', 'pint', 'IPA o clock.', t_base + interval '16 hours 45 min'),
  (gen_random_uuid(), s15, u26, beer_saison, pp_brewery, 4.0, '{dry,spicy}', 'tulip', 'Switching gears. Saison time.', t_base + interval '17 hours 15 min'),
  (gen_random_uuid(), s16, u32, beer_kolsch, pp_brewery, 4.0, '{crisp,clean}', 'pint', 'Starting light before the evening.', t_base + interval '17 hours'),
  (gen_random_uuid(), s16, u32, beer_pale,   pp_brewery, 4.0, '{hoppy,sessionable}', 'pint', 'Hotfix Hazy is growing on me.', t_base + interval '17 hours 30 min'),
  (gen_random_uuid(), s17, u11, beer_kolsch, pp_brewery, 3.5, '{light}', 'pint', 'Quick one after work.', t_base + interval '16 hours 15 min'),
  (gen_random_uuid(), s18, u13, beer_pale,   pp_brewery, 4.0, '{citrus,crisp}', 'pint', 'Love the Citra in this one.', t_base + interval '16 hours 45 min'),

  -- Happy hour sessions (2-4 beers each)
  (gen_random_uuid(), s19, u03, beer_cider,  pp_brewery, 4.5, '{apple,ginger,dry}', 'pint', 'Cache Miss Cider is everything. Gluten free queen.', t_base + interval '17 hours 15 min'),
  (gen_random_uuid(), s19, u03, beer_saison, pp_brewery, 4.0, '{dry,citrus}', 'tulip', 'Surprisingly good after cider.', t_base + interval '18 hours'),
  (gen_random_uuid(), s19, u03, beer_kolsch, pp_brewery, 3.5, '{light,clean}', 'pint', 'Palate cleanser.', t_base + interval '18 hours 45 min'),
  (gen_random_uuid(), s20, u05, beer_cider,  pp_brewery, 5.0, '{apple,ginger,refreshing}', 'pint', 'THIS IS MY BEER. I mean cider. Whatever. Its amazing.', t_base + interval '17 hours 30 min'),
  (gen_random_uuid(), s20, u05, beer_kolsch, pp_brewery, 3.5, '{light}', 'pint', 'A light one to keep going.', t_base + interval '18 hours 30 min'),
  (gen_random_uuid(), s21, u07, beer_ipa,    pp_brewery, 5.0, '{tropical,hazy,juicy}', 'pint', 'HAZIES FOR LIFE. This IPA is transcendent.', t_base + interval '17 hours 45 min'),
  (gen_random_uuid(), s21, u07, beer_pale,   pp_brewery, 4.0, '{hoppy,light}', 'pint', 'Session pale after the big IPA.', t_base + interval '18 hours 30 min'),
  (gen_random_uuid(), s21, u07, beer_ipa,    pp_brewery, 4.5, '{juicy,mango}', 'pint', 'Round 2. No regrets.', t_base + interval '19 hours 15 min'),
  (gen_random_uuid(), s21, u07, beer_stout,  pp_brewery, 4.0, '{chocolate,creamy}', 'pint', 'Nightcap stout.', t_base + interval '19 hours 45 min'),
  (gen_random_uuid(), s22, u09, beer_kolsch, pp_brewery, 4.0, '{crisp,clean,light}', 'pint', 'My first kölsch! So clean and refreshing!', t_base + interval '18 hours'),
  (gen_random_uuid(), s22, u09, beer_cider,  pp_brewery, 4.5, '{apple,ginger}', 'pint', 'Oh wow the cider is incredible. New fave.', t_base + interval '18 hours 45 min'),
  (gen_random_uuid(), s23, u12, beer_stout,  pp_brewery, 5.0, '{espresso,chocolate,velvet}', 'pint', 'Null Pointer on nitro. Dark mode activated.', t_base + interval '18 hours 15 min'),
  (gen_random_uuid(), s23, u12, beer_red,    pp_brewery, 4.0, '{malty,smooth}', 'pint', 'Red ale for variety.', t_base + interval '19 hours'),
  (gen_random_uuid(), s23, u12, beer_bwine,  pp_brewery, 4.5, '{complex,warming}', 'snifter', 'End of the night barleywine. Bold choice.', t_base + interval '20 hours'),
  (gen_random_uuid(), s24, u15, beer_pale,   pp_brewery, 4.0, '{citrus,easy}', 'pint', 'First time at P&P! Starting light.', t_base + interval '18 hours 30 min'),
  (gen_random_uuid(), s24, u15, beer_ipa,    pp_brewery, 4.5, '{tropical,hazy}', 'pint', 'OK the IPA is as good as everyone says.', t_base + interval '19 hours'),
  (gen_random_uuid(), s25, u17, beer_ipa,    pp_brewery, 4.5, '{hazy,juicy}', 'pint', 'Infinite Loop on a Friday. Tradition.', t_base + interval '18 hours 45 min'),
  (gen_random_uuid(), s25, u17, beer_saison, pp_brewery, 4.0, '{peppery,dry}', 'tulip', 'Saison break between IPAs.', t_base + interval '19 hours 30 min'),
  (gen_random_uuid(), s25, u17, beer_ipa,    pp_brewery, 4.5, '{tropical}', 'pint', 'One more loop.', t_base + interval '20 hours'),
  (gen_random_uuid(), s26, u19, beer_belgian,pp_brewery, 4.5, '{fruity,spicy,strong}', 'goblet', 'Git Blame Belgian is sneaky strong. Noted.', t_base + interval '19 hours'),
  (gen_random_uuid(), s26, u19, beer_esb,    pp_brewery, 4.0, '{biscuit,earthy}', 'pint', 'Classic English style done right.', t_base + interval '19 hours 45 min'),
  (gen_random_uuid(), s27, u21, beer_red,    pp_brewery, 4.5, '{caramel,toasty,clean}', 'pint', 'Regex Red might be the most underrated beer here.', t_base + interval '19 hours 15 min'),
  (gen_random_uuid(), s27, u21, beer_kolsch, pp_brewery, 4.0, '{crisp}', 'pint', 'Easy follow-up.', t_base + interval '19 hours 45 min'),
  (gen_random_uuid(), s27, u21, beer_stout,  pp_brewery, 4.5, '{chocolate,smooth}', 'pint', 'Going dark for the finisher.', t_base + interval '20 hours 30 min'),
  (gen_random_uuid(), s28, u23, beer_ipa,    pp_brewery, 4.0, '{hazy,citrus}', 'pint', 'Finally trying the famous IPA.', t_base + interval '19 hours 30 min'),
  (gen_random_uuid(), s28, u23, beer_pale,   pp_brewery, 4.0, '{hoppy,light}', 'pint', 'Crushable. Another please.', t_base + interval '20 hours'),
  (gen_random_uuid(), s29, u25, beer_ipa,    pp_brewery, 5.0, '{tropical,mango,hazy}', 'pint', 'Best IPA in Asheville. I said what I said.', t_base + interval '19 hours 45 min'),
  (gen_random_uuid(), s29, u25, beer_saison, pp_brewery, 4.0, '{dry,peppery}', 'tulip', 'Saison palate cleanser.', t_base + interval '20 hours 30 min'),
  (gen_random_uuid(), s30, u27, beer_stout,  pp_brewery, 5.0, '{espresso,creamy,velvet}', 'pint', 'Nitro stout is my love language. I said it in my bio and I mean it.', t_base + interval '20 hours'),
  (gen_random_uuid(), s30, u27, beer_red,    pp_brewery, 4.0, '{malty,smooth}', 'pint', 'Red ale break.', t_base + interval '20 hours 45 min'),
  (gen_random_uuid(), s31, u29, beer_kolsch, pp_brewery, 4.0, '{crisp,clean}', 'pint', 'Starting my craft journey with a kölsch!', t_base + interval '17 hours 45 min'),
  (gen_random_uuid(), s31, u29, beer_pale,   pp_brewery, 4.5, '{citrus,hoppy}', 'pint', 'Ok this pale ale is GREAT.', t_base + interval '18 hours 30 min'),
  (gen_random_uuid(), s32, u31, beer_cider,  pp_brewery, 4.5, '{apple,refreshing}', 'pint', 'Love that they have cider on tap!', t_base + interval '18 hours 15 min'),
  (gen_random_uuid(), s33, u33, beer_red,    pp_brewery, 4.5, '{caramel,toasty}', 'pint', 'Amber ales ARE underrated. This proves it.', t_base + interval '19 hours 15 min'),
  (gen_random_uuid(), s33, u33, beer_esb,    pp_brewery, 4.0, '{earthy,balanced}', 'pint', 'Good pairing with the red.', t_base + interval '19 hours 45 min'),

  -- Peak sessions (3-5 beers for ended ones, 1-2 for active)
  (gen_random_uuid(), s34, u34, beer_ipa,    pp_brewery, 5.0, '{tropical,juicy,hazy}', 'pint', 'FRIDAY NIGHT BABY. Infinite Loop to start.', t_base + interval '20 hours 15 min'),
  (gen_random_uuid(), s34, u34, beer_belgian,pp_brewery, 4.5, '{fruity,strong}', 'goblet', 'Belgian at the peak. Living dangerous.', t_base + interval '20 hours 45 min'),
  (gen_random_uuid(), s35, u35, beer_kolsch, pp_brewery, 4.0, '{light,crisp}', 'pint', 'Starting light.', t_base + interval '20 hours 30 min'),
  (gen_random_uuid(), s35, u35, beer_cider,  pp_brewery, 4.5, '{apple,ginger}', 'pint', 'Ooh trying the cider next.', t_base + interval '21 hours'),
  (gen_random_uuid(), s36, u37, beer_saison, pp_brewery, 4.5, '{dry,peppery,lemon}', 'tulip', 'Saison Friday. This is the way.', t_base + interval '20 hours 45 min'),
  (gen_random_uuid(), s37, u39, beer_pale,   pp_brewery, 4.0, '{citrus,sessionable}', 'pint', 'Hotfix Hazy is my speed.', t_base + interval '21 hours'),
  (gen_random_uuid(), s38, u40, beer_bwine,  pp_brewery, 5.0, '{toffee,warming,complex}', 'snifter', 'The barleywine. Always the barleywine. This one is INCREDIBLE.', t_base + interval '21 hours 15 min'),
  (gen_random_uuid(), s39, u01, beer_stout,  pp_brewery, 4.5, '{chocolate,espresso}', 'pint', 'Back for round 2 tonight. Null Pointer for the late shift.', t_base + interval '21 hours 30 min'),
  (gen_random_uuid(), s40, u08, beer_belgian,pp_brewery, 5.0, '{fruity,complex,spicy}', 'goblet', 'Second session today. Git Blame is calling.', t_base + interval '21 hours 45 min'),
  (gen_random_uuid(), s41, u16, beer_ipa,    pp_brewery, 5.0, '{mango,pineapple,hazy}', 'pint', 'Late night IPA. Still perfect. Always perfect.', t_base + interval '22 hours'),
  (gen_random_uuid(), s42, u18, beer_esb,    pp_brewery, 4.0, '{biscuit,malty}', 'pint', 'ESB to start the night.', t_base + interval '20 hours 15 min'),
  (gen_random_uuid(), s42, u18, beer_red,    pp_brewery, 4.0, '{caramel,smooth}', 'pint', 'Red ale next.', t_base + interval '20 hours 45 min'),
  (gen_random_uuid(), s42, u18, beer_stout,  pp_brewery, 4.5, '{chocolate,creamy}', 'pint', 'Going dark.', t_base + interval '21 hours 30 min'),
  (gen_random_uuid(), s43, u28, beer_kolsch, pp_brewery, 4.0, '{light,clean}', 'pint', 'Session kölsch for a chill evening.', t_base + interval '20 hours 45 min'),
  (gen_random_uuid(), s43, u28, beer_pale,   pp_brewery, 4.5, '{citrus,easy}', 'pint', 'Hotfix is growing on me.', t_base + interval '21 hours 30 min'),
  (gen_random_uuid(), s44, u30, beer_ipa,    pp_brewery, 4.5, '{tropical,juicy}', 'pint', 'Round 2 at P&P. IPA time.', t_base + interval '21 hours 15 min'),
  (gen_random_uuid(), s44, u30, beer_saison, pp_brewery, 4.0, '{dry,refreshing}', 'tulip', 'Saison to follow up.', t_base + interval '22 hours'),
  (gen_random_uuid(), s45, u36, beer_ipa,    pp_brewery, 5.0, '{hazy,tropical,perfect}', 'pint', 'Second session. The IPA again. No shame.', t_base + interval '20 hours 30 min'),
  (gen_random_uuid(), s45, u36, beer_stout,  pp_brewery, 4.5, '{espresso,chocolate}', 'pint', 'Dark mode for the late hours.', t_base + interval '21 hours 30 min'),
  (gen_random_uuid(), s45, u36, beer_bwine,  pp_brewery, 5.0, '{toffee,dark_fruit}', 'snifter', 'Barleywine nightcap. Dangerous and delicious.', t_base + interval '22 hours 15 min'),
  (gen_random_uuid(), s45, u36, beer_belgian,pp_brewery, 4.5, '{fruity,strong}', 'goblet', 'Four beers deep. Friday vibes.', t_base + interval '22 hours 30 min'),

  -- Late night sessions (1-2 beers)
  (gen_random_uuid(), s46, u02, beer_stout,  pp_brewery, 4.5, '{chocolate,smooth}', 'pint', 'Nightcap stout. Classic.', t_base + interval '23 hours 15 min'),
  (gen_random_uuid(), s47, u10, beer_saison, pp_brewery, 4.0, '{dry,peppery}', 'tulip', 'One last saison.', t_base + interval '23 hours 30 min'),
  (gen_random_uuid(), s48, u14, beer_ipa,    pp_brewery, 4.5, '{hazy,juicy}', 'pint', 'Closing time IPA. No better way to end.', t_base + interval '23 hours 45 min'),
  (gen_random_uuid(), s48, u14, beer_kolsch, pp_brewery, 4.0, '{crisp,clean}', 'pint', 'One more for the road.', t_base + interval '24 hours 15 min'),
  (gen_random_uuid(), s49, u22, beer_bwine,  pp_brewery, 5.0, '{warming,complex}', 'snifter', 'Barleywine at midnight. This is the way.', t_base + interval '24 hours'),
  (gen_random_uuid(), s50, u20, beer_esb,    pp_brewery, 4.0, '{earthy,balanced}', 'pint', 'Late night ESB. Pub classic.', t_base + interval '24 hours 15 min'),
  (gen_random_uuid(), s50, u20, beer_stout,  pp_brewery, 4.5, '{chocolate,creamy}', 'pint', 'Last call stout.', t_base + interval '24 hours 45 min')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 6. BEER REVIEWS — Distinct reviews on P&P beers
-- ============================================================================
INSERT INTO beer_reviews (user_id, beer_id, rating, comment, created_at) VALUES
  (u01, beer_ipa,    4.5, 'Infinite Loop is the best hazy IPA in Asheville. Mango and pineapple forever.', t_base + interval '13 hours'),
  (u02, beer_stout,  5.0, 'Null Pointer Nitro is flawless. Creamy, chocolatey, espresso perfection.', t_base + interval '16 hours'),
  (u03, beer_cider,  4.5, 'Cache Miss Cider is my go-to. Dry, gingery, gluten free heaven.', t_base + interval '18 hours'),
  (u04, beer_esb,    4.0, 'Exception Handler ESB. Proper English bitter. Respect.', t_base + interval '13 hours 30 min'),
  (u05, beer_cider,  5.0, 'This cider is EVERYTHING. Apple and ginger perfection.', t_base + interval '18 hours 30 min'),
  (u07, beer_ipa,    5.0, 'If you only try one beer at P&P, make it Infinite Loop.', t_base + interval '18 hours'),
  (u08, beer_belgian,5.0, 'Git Blame Belgian is a world-class Belgian strong ale. Fight me.', t_base + interval '13 hours'),
  (u10, beer_saison, 5.0, 'Syntax Error Saison is dry, peppery, absolutely perfect.', t_base + interval '16 hours'),
  (u12, beer_stout,  5.0, 'Dark mode activated. Null Pointer is nitro done right.', t_base + interval '19 hours'),
  (u14, beer_ipa,    4.5, 'Hazy, tropical, dangerous. Infinite Loop lives up to the name.', t_base + interval '16 hours'),
  (u16, beer_ipa,    5.0, 'I have had this beer 50+ times. It gets better every pour.', t_base + interval '14 hours'),
  (u20, beer_red,    4.0, 'Regex Red is the most underrated beer on this menu.', t_base + interval '14 hours'),
  (u22, beer_bwine,  5.0, 'Binary Barleywine is liquid toffee. My #1 beer in the state.', t_base + interval '16 hours 30 min'),
  (u25, beer_ipa,    5.0, 'Best IPA in Asheville. I said what I said.', t_base + interval '20 hours'),
  (u27, beer_stout,  5.0, 'Nitro stout is my love language and Null Pointer speaks fluently.', t_base + interval '20 hours 15 min'),
  (u30, beer_esb,    4.5, 'Proper pub classic. Exception Handler is the real deal.', t_base + interval '14 hours 30 min'),
  (u33, beer_red,    4.5, 'Amber ales ARE underrated and Regex Red proves it.', t_base + interval '19 hours 30 min'),
  (u34, beer_ipa,    5.0, 'FRIDAY NIGHT INFINITE LOOP. Nothing else matters.', t_base + interval '20 hours 30 min'),
  (u36, beer_bwine,  5.0, 'Binary Barleywine aged 6 months. This is what patience tastes like.', t_base + interval '22 hours 30 min'),
  (u40, beer_bwine,  5.0, 'The barleywine. Always the barleywine. 10.5% of pure bliss.', t_base + interval '21 hours 30 min')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7. BREWERY REVIEWS — Reviews of Pint & Pixel
-- ============================================================================
INSERT INTO brewery_reviews (user_id, brewery_id, rating, comment, created_at) VALUES
  (u01, pp_brewery, 5.0, 'Best brewery in Asheville. The IPA, the vibes, the arcade games. Perfection.', t_base + interval '13 hours 30 min'),
  (u04, pp_brewery, 4.5, 'Solid tap list, great food, retro arcade. What more do you need?', t_base + interval '14 hours'),
  (u07, pp_brewery, 5.0, 'Pint & Pixel is my happy place. Hazies + pinball = heaven.', t_base + interval '19 hours'),
  (u08, pp_brewery, 5.0, 'World class Belgian and a Space Invaders machine. 11/10.', t_base + interval '14 hours'),
  (u09, pp_brewery, 5.0, 'My first brewery visit ever and it was AMAZING. Already planning to come back!', t_base + interval '19 hours'),
  (u12, pp_brewery, 5.0, 'Dark beers, dark mode, dark arcade. My aesthetic.', t_base + interval '20 hours 30 min'),
  (u16, pp_brewery, 5.0, 'Regular since day one. This place only gets better.', t_base + interval '14 hours 30 min'),
  (u20, pp_brewery, 4.5, 'Friday night at P&P is the best night of the week.', t_base + interval '14 hours 30 min'),
  (u22, pp_brewery, 5.0, 'The barleywine alone is worth the trip. Everything else is bonus.', t_base + interval '17 hours'),
  (u25, pp_brewery, 5.0, 'Asheville has 50+ breweries and this is #1. Easy.', t_base + interval '21 hours'),
  (u27, pp_brewery, 4.5, 'Nitro stout on tap + arcade games = the dream.', t_base + interval '21 hours'),
  (u29, pp_brewery, 5.0, 'Craft curious and this was the perfect first brewery. So welcoming.', t_base + interval '18 hours 45 min'),
  (u30, pp_brewery, 5.0, 'Kölsch in the streets, stout in the sheets. P&P has it all.', t_base + interval '15 hours'),
  (u34, pp_brewery, 5.0, 'The energy on a Friday night is unmatched. Pint & Pixel forever.', t_base + interval '21 hours'),
  (u36, pp_brewery, 5.0, 'Four beers deep and I want four more. 10/10 would recommend.', t_base + interval '22 hours 45 min'),
  (u38, pp_brewery, 4.5, 'Used to work here. Can confirm the beers are as good as they seem.', t_base + interval '15 hours 30 min'),
  (u40, pp_brewery, 5.0, 'Binary Barleywine is the reason I moved to Asheville. Not kidding.', t_base + interval '21 hours 45 min')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 8. NOTIFICATIONS for Joshua — every card type
-- ============================================================================
INSERT INTO notifications (user_id, type, title, body, data, read, created_at) VALUES
  -- Friend activity
  (joshua_id, 'friend_checkin',  'Marcus Chen checked in at Pint & Pixel', 'Marcus is drinking Infinite Loop IPA', jsonb_build_object('session_id', s01, 'display_name', 'Marcus Chen', 'avatar_url', null), false, t_base + interval '12 hours 15 min'),
  (joshua_id, 'friend_checkin',  'Riley Jackson checked in at Pint & Pixel', 'Riley is drinking Null Pointer Nitro', jsonb_build_object('session_id', s09, 'display_name', 'Riley Jackson', 'avatar_url', null), false, t_base + interval '15 hours 15 min'),
  (joshua_id, 'friend_checkin',  'Zoe Williams checked in at Pint & Pixel', 'Zoe is drinking Infinite Loop IPA', jsonb_build_object('session_id', s21, 'display_name', 'Zoe Williams', 'avatar_url', null), false, t_base + interval '17 hours 45 min'),
  (joshua_id, 'friend_checkin',  'Logan Ramirez checked in at Pint & Pixel', 'Logan is drinking Infinite Loop IPA', jsonb_build_object('session_id', s34, 'display_name', 'Logan Ramirez', 'avatar_url', null), false, t_base + interval '20 hours 15 min'),
  (joshua_id, 'friend_checkin',  'Alex Mitchell checked in at Pint & Pixel', 'Alex is on session #2 tonight!', jsonb_build_object('session_id', s45, 'display_name', 'Alex Mitchell', 'avatar_url', null), false, t_base + interval '20 hours 30 min'),

  -- Reactions
  (joshua_id, 'reaction', 'Ben Thomas reacted to your session', '🍺 on your Pint & Pixel session', jsonb_build_object('session_id', s01, 'display_name', 'Ben Thomas', 'avatar_url', null), false, t_base + interval '14 hours'),
  (joshua_id, 'session_cheers', 'Ava Wilson cheered your session', 'Cheers on your Pint & Pixel visit!', jsonb_build_object('session_id', s01, 'display_name', 'Ava Wilson', 'avatar_url', null), false, t_base + interval '14 hours 30 min'),
  (joshua_id, 'session_cheers', 'Grace Young cheered your session', '🍻 Cheers!', jsonb_build_object('session_id', s01, 'display_name', 'Grace Young', 'avatar_url', null), false, t_base + interval '15 hours'),
  (joshua_id, 'session_comment', 'Jack Harris commented on your session', 'Dude the IPA is hitting different today right??', jsonb_build_object('session_id', s01, 'display_name', 'Jack Harris', 'avatar_url', null), false, t_base + interval '15 hours 30 min'),

  -- Achievement
  (joshua_id, 'achievement_unlocked', 'Achievement Unlocked: Local Legend', 'You checked in 10 times at a brewery in your home city!', '{"achievement_key":"local_legend","achievement_name":"Local Legend"}'::jsonb, false, t_base + interval '16 hours'),

  -- Brewery follow
  (joshua_id, 'brewery_follow', 'Emma Garcia followed Pint & Pixel', 'New follower for your brewery!', jsonb_build_object('brewery_id', pp_brewery, 'display_name', 'Emma Garcia'), false, t_base + interval '18 hours'),
  (joshua_id, 'brewery_follow', 'Nora Green followed Pint & Pixel', 'New follower for your brewery!', jsonb_build_object('brewery_id', pp_brewery, 'display_name', 'Nora Green'), false, t_base + interval '18 hours 30 min'),

  -- New tap
  (joshua_id, 'new_tap', 'New beer on tap at Pint & Pixel', 'Cache Miss Cider just tapped!', jsonb_build_object('brewery_id', pp_brewery, 'beer_name', 'Cache Miss Cider'), false, t_base + interval '11 hours'),

  -- New event
  (joshua_id, 'new_event', 'Live Music Night at Pint & Pixel', 'Friday Night Sessions — Local acoustic acts 8pm-11pm', jsonb_build_object('brewery_id', pp_brewery), false, t_base + interval '10 hours'),

  -- Weekly stats
  (joshua_id, 'weekly_stats', 'Your Weekly Recap is ready', 'You visited 3 breweries and tried 8 new beers this week!', '{}'::jsonb, false, t_base + interval '9 hours'),

  -- Friend request (pending)
  (joshua_id, 'friend_request', 'Ivy Phillips wants to be friends', 'Accept to see each others check-ins', jsonb_build_object('friendship_id', gen_random_uuid(), 'display_name', 'Ivy Phillips', 'avatar_url', null), false, t_base + interval '17 hours')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 9. ACHIEVEMENTS — Unlock some for the new users
-- ============================================================================
INSERT INTO user_achievements (user_id, achievement_id, earned_at)
SELECT u, ach_first_step, t_base + interval '12 hours'
FROM unnest(ARRAY[u09, u15, u28, u29, u35]) AS u
WHERE ach_first_step IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO user_achievements (user_id, achievement_id, earned_at)
SELECT u, ach_getting_started, t_base + interval '14 hours'
FROM unnest(ARRAY[u05, u09, u13, u15, u23, u28, u29, u31, u35, u39]) AS u
WHERE ach_getting_started IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO user_achievements (user_id, achievement_id, earned_at)
SELECT u, ach_style_student, t_base + interval '18 hours'
FROM unnest(ARRAY[u03, u07, u11, u17, u21, u25, u33, u37]) AS u
WHERE ach_style_student IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO user_achievements (user_id, achievement_id, earned_at)
SELECT u, ach_regular, t_base + interval '16 hours'
FROM unnest(ARRAY[u02, u04, u06, u08, u10, u12, u14, u16, u19, u20, u22, u24, u26, u30, u32, u34, u36, u38, u40]) AS u
WHERE ach_regular IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO user_achievements (user_id, achievement_id, earned_at)
SELECT u, ach_brewery_tourist, t_base + interval '20 hours'
FROM unnest(ARRAY[u04, u08, u14, u16, u20, u22, u30, u36, u38, u40]) AS u
WHERE ach_brewery_tourist IS NOT NULL
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 10. WISHLIST — Some users wishlisting P&P beers (for WishlistOnTapAlert)
-- ============================================================================
INSERT INTO wishlist (user_id, beer_id, created_at) VALUES
  (joshua_id, beer_bwine, now() - interval '3 days'),
  (u03, beer_ipa,    now() - interval '5 days'),
  (u05, beer_belgian,now() - interval '2 days'),
  (u09, beer_stout,  now() - interval '1 day'),
  (u11, beer_saison, now() - interval '4 days'),
  (u15, beer_bwine,  now() - interval '3 days'),
  (u23, beer_red,    now() - interval '6 days'),
  (u29, beer_ipa,    now() - interval '2 days'),
  (u35, beer_cider,  now() - interval '1 day')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 11. REACTIONS — Some reactions on sessions for feed variety
-- ============================================================================
-- Note: reactions reference checkin_id but our schema uses sessions
-- Using session IDs as checkin references where the schema allows

-- ============================================================================
-- 12. BREWERY VISITS — Track visits for regulars
-- ============================================================================
INSERT INTO brewery_visits (user_id, brewery_id, total_visits, unique_beers_tried, first_visit_at, last_visit_at) VALUES
  (u01, pp_brewery, 8, 6, now() - interval '29 days', t_base + interval '12 hours'),
  (u02, pp_brewery, 12, 8, now() - interval '27 days', t_base + interval '15 hours'),
  (u04, pp_brewery, 15, 9, now() - interval '34 days', t_base + interval '12 hours 15 min'),
  (u08, pp_brewery, 18, 10, now() - interval '44 days', t_base + interval '12 hours 30 min'),
  (u10, pp_brewery, 14, 8, now() - interval '31 days', t_base + interval '15 hours 30 min'),
  (u14, pp_brewery, 16, 9, now() - interval '41 days', t_base + interval '15 hours 45 min'),
  (u16, pp_brewery, 25, 10, now() - interval '49 days', t_base + interval '13 hours'),
  (u20, pp_brewery, 13, 8, now() - interval '35 days', t_base + interval '13 hours 30 min'),
  (u22, pp_brewery, 17, 9, now() - interval '43 days', t_base + interval '16 hours'),
  (u30, pp_brewery, 15, 9, now() - interval '36 days', t_base + interval '14 hours'),
  (u36, pp_brewery, 20, 10, now() - interval '47 days', t_base + interval '14 hours 15 min'),
  (u38, pp_brewery, 18, 10, now() - interval '45 days', t_base + interval '14 hours 30 min')
ON CONFLICT (user_id, brewery_id) DO UPDATE SET
  total_visits = EXCLUDED.total_visits,
  unique_beers_tried = EXCLUDED.unique_beers_tried,
  last_visit_at = EXCLUDED.last_visit_at;

END $$;
