-- ─────────────────────────────────────────────────────────────────────────────
-- Seed 003: Realistic 30-Day Activity for Pint & Pixel Brewing Co.
-- Casey (QA) — generates 12 test users + ~140 check-ins with ratings,
-- flavor tags, comments, brewery visits, loyalty cards, and profile stats.
-- Run AFTER 002_test_brewery.sql
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  demo_brewery_id uuid := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

  -- Fixed test user UUIDs
  u01 uuid := 'cc000000-0000-0000-0000-000000000001';
  u02 uuid := 'cc000000-0000-0000-0000-000000000002';
  u03 uuid := 'cc000000-0000-0000-0000-000000000003';
  u04 uuid := 'cc000000-0000-0000-0000-000000000004';
  u05 uuid := 'cc000000-0000-0000-0000-000000000005';
  u06 uuid := 'cc000000-0000-0000-0000-000000000006';
  u07 uuid := 'cc000000-0000-0000-0000-000000000007';
  u08 uuid := 'cc000000-0000-0000-0000-000000000008';
  u09 uuid := 'cc000000-0000-0000-0000-000000000009';
  u10 uuid := 'cc000000-0000-0000-0000-000000000010';
  u11 uuid := 'cc000000-0000-0000-0000-000000000011';
  u12 uuid := 'cc000000-0000-0000-0000-000000000012';

  -- Beer IDs (fetched by name)
  b_ipa       uuid; b_pils    uuid; b_stout   uuid;
  b_sour      uuid; b_marzen  uuid; b_pale    uuid;
  b_porter    uuid; b_wheat   uuid; b_dipa    uuid;
  b_lager     uuid;

BEGIN

  -- ── 1. Create fake auth users ─────────────────────────────────────────────
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data
  ) VALUES
    (u01,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','alex.chen@hoptrack.test',   '','2025-01-15 00:00:00+00','2025-01-15 00:00:00+00','2025-01-15 00:00:00+00','{"provider":"email"}','{"display_name":"Alex Chen"}'),
    (u02,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','marcus.j@hoptrack.test',    '','2025-02-03 00:00:00+00','2025-02-03 00:00:00+00','2025-02-03 00:00:00+00','{"provider":"email"}','{"display_name":"Marcus Johnson"}'),
    (u03,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','priya.p@hoptrack.test',     '','2025-01-28 00:00:00+00','2025-01-28 00:00:00+00','2025-01-28 00:00:00+00','{"provider":"email"}','{"display_name":"Priya Patel"}'),
    (u04,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','derek.w@hoptrack.test',     '','2025-03-01 00:00:00+00','2025-03-01 00:00:00+00','2025-03-01 00:00:00+00','{"provider":"email"}','{"display_name":"Derek Walsh"}'),
    (u05,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','sam.rivera@hoptrack.test',  '','2025-02-14 00:00:00+00','2025-02-14 00:00:00+00','2025-02-14 00:00:00+00','{"provider":"email"}','{"display_name":"Sam Rivera"}'),
    (u06,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','linda.ko@hoptrack.test',    '','2025-01-20 00:00:00+00','2025-01-20 00:00:00+00','2025-01-20 00:00:00+00','{"provider":"email"}','{"display_name":"Linda Ko"}'),
    (u07,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','tom.nguyen@hoptrack.test',  '','2025-02-22 00:00:00+00','2025-02-22 00:00:00+00','2025-02-22 00:00:00+00','{"provider":"email"}','{"display_name":"Tom Nguyen"}'),
    (u08,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','jessica.b@hoptrack.test',   '','2025-01-10 00:00:00+00','2025-01-10 00:00:00+00','2025-01-10 00:00:00+00','{"provider":"email"}','{"display_name":"Jessica Blake"}'),
    (u09,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','carlos.m@hoptrack.test',    '','2025-03-05 00:00:00+00','2025-03-05 00:00:00+00','2025-03-05 00:00:00+00','{"provider":"email"}','{"display_name":"Carlos Mendez"}'),
    (u10,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','rachel.f@hoptrack.test',    '','2025-02-08 00:00:00+00','2025-02-08 00:00:00+00','2025-02-08 00:00:00+00','{"provider":"email"}','{"display_name":"Rachel Foster"}'),
    (u11,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','james.ot@hoptrack.test',    '','2025-01-05 00:00:00+00','2025-01-05 00:00:00+00','2025-01-05 00:00:00+00','{"provider":"email"}','{"display_name":"James OToole"}'),
    (u12,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','nina.s@hoptrack.test',      '','2025-02-18 00:00:00+00','2025-02-18 00:00:00+00','2025-02-18 00:00:00+00','{"provider":"email"}','{"display_name":"Nina Sharma"}')
  ON CONFLICT (id) DO NOTHING;

  -- ── 2. Create profiles ────────────────────────────────────────────────────
  INSERT INTO public.profiles (id, username, display_name, home_city, bio, level, xp, total_checkins, unique_beers, unique_breweries)
  VALUES
    (u01,'alexchen','Alex Chen',      'Austin, TX',    'West Coast IPA evangelist. Debug IPA changed my life.',         5,  1240, 32, 18, 9),
    (u02,'marcusj', 'Marcus Johnson', 'Austin, TX',    'Stout season is every season.',                                 4,   880, 21, 14, 7),
    (u03,'priyap',  'Priya Patel',    'Austin, TX',    'Sour beer convert. The more tart the better.',                  6,  1680, 44, 22, 12),
    (u04,'derekw',  'Derek Walsh',    'Houston, TX',   'Weekend warrior. Drive 3 hours for a good pint.',               3,   520, 14,  9, 6),
    (u05,'samriv',  'Sam Rivera',     'Austin, TX',    'Pilsner is the perfect beer and I will die on this hill.',      4,   760, 19, 11, 8),
    (u06,'lindako', 'Linda Ko',       'Austin, TX',    'Hefeweizen in summer, stout in winter. That''s the code.',      7,  2100, 58, 28, 15),
    (u07,'tomnguyen','Tom Nguyen',    'San Antonio, TX','DIPA or bust. 9%+ only.',                                      3,   440, 11,  7, 5),
    (u08,'jessicab','Jessica Blake',  'Austin, TX',    'Amber ales and good vibes. Regular at P&P.',                   8,  2640, 71, 33, 18),
    (u09,'carlosm', 'Carlos Mendez',  'Austin, TX',    'New to craft beer. This app is helping me figure it all out.',  2,   220,  6,  5, 3),
    (u10,'rachelf', 'Rachel Foster',  'Austin, TX',    'Porter fanatic. Kernel Panic is my spirit beer.',               6,  1520, 40, 20, 11),
    (u11,'jamesot', 'James OToole',   'Dallas, TX',    'Visiting Austin monthly. Pint & Pixel is always stop one.',     5,  1100, 28, 16, 10),
    (u12,'ninas',   'Nina Sharma',    'Austin, TX',    'Märzen season lasts all year in my heart.',                     4,   900, 23, 13, 8)
  ON CONFLICT (id) DO UPDATE SET
    username         = EXCLUDED.username,
    display_name     = EXCLUDED.display_name,
    home_city        = EXCLUDED.home_city,
    bio              = EXCLUDED.bio,
    level            = EXCLUDED.level,
    xp               = EXCLUDED.xp,
    total_checkins   = EXCLUDED.total_checkins,
    unique_beers     = EXCLUDED.unique_beers,
    unique_breweries = EXCLUDED.unique_breweries;

  -- ── 3. Fetch beer IDs ─────────────────────────────────────────────────────
  SELECT id INTO b_ipa    FROM beers WHERE brewery_id = demo_brewery_id AND name = 'Debug IPA';
  SELECT id INTO b_pils   FROM beers WHERE brewery_id = demo_brewery_id AND name = 'Pixel Perfect Pils';
  SELECT id INTO b_stout  FROM beers WHERE brewery_id = demo_brewery_id AND name = 'Dark Mode Stout';
  SELECT id INTO b_sour   FROM beers WHERE brewery_id = demo_brewery_id AND name = 'Stack Overflow Sour';
  SELECT id INTO b_marzen FROM beers WHERE brewery_id = demo_brewery_id AND name = 'Merge Conflict Märzen';
  SELECT id INTO b_pale   FROM beers WHERE brewery_id = demo_brewery_id AND name = 'Pull Request Pale';
  SELECT id INTO b_porter FROM beers WHERE brewery_id = demo_brewery_id AND name = 'Kernel Panic Porter';
  SELECT id INTO b_wheat  FROM beers WHERE brewery_id = demo_brewery_id AND name = '404 Wheat Not Found';
  SELECT id INTO b_dipa   FROM beers WHERE brewery_id = demo_brewery_id AND name = 'Deploy Friday DIPA';
  SELECT id INTO b_lager  FROM beers WHERE brewery_id = demo_brewery_id AND name = 'Legacy Code Lager';

  -- ── 4. (REMOVED — checkins table dropped in Sprint 16, migration 015) ─────
  -- Legacy checkins INSERT removed. Activity now tracked via sessions + beer_logs.
  -- See seeds 009/010 for current feed activity data.
  -- Original: ~140 checkins across 12 test users over 30 days.

  -- Skipping directly to section 5+ (also removed since they query checkins)

  RAISE NOTICE 'Seed 003: Users + beers created. Activity tracked via sessions + beer_logs (seeds 009/010).';

END $$;

-- ── Confirm ───────────────────────────────────────────────────────────────────
SELECT 'Seed 003: Users + beers created. Checkins skipped (table dropped S16).' AS result;
