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

  -- ── 4. Insert check-ins (30 days, ~140 total, realistic distribution) ─────
  -- More check-ins on Fri/Sat/Sun, peaks in evening hours
  -- Ratings skew positive (3.5–5.0), IPA is most popular, DIPA least common

  INSERT INTO checkins (user_id, brewery_id, beer_id, rating, serving_style, comment, share_to_feed, created_at) VALUES

  -- Week 1 (Mar 1-7) ─────────────────────────────────────────────────────────
  (u08, demo_brewery_id, b_ipa,    4.5, 'draft', 'Perfect after a long week. Citrus on the nose, clean finish.',           true,  now() - interval '23 days' + interval '18 hours'),
  (u01, demo_brewery_id, b_ipa,    5.0, 'draft', 'This is the one. Best IPA in Austin no question.',                      true,  now() - interval '23 days' + interval '19 hours'),
  (u06, demo_brewery_id, b_stout,  4.5, 'draft', 'Roasty and rich. Exactly what I needed.',                               true,  now() - interval '23 days' + interval '20 hours'),
  (u10, demo_brewery_id, b_porter, 4.0, 'draft', 'Smooth and smoky. Kernel Panic lives up to the name.',                  true,  now() - interval '22 days' + interval '17 hours'),
  (u03, demo_brewery_id, b_sour,   5.0, 'draft', 'Stack Overflow Sour absolutely slaps. 10/10 no notes.',                 true,  now() - interval '22 days' + interval '19 hours'),
  (u05, demo_brewery_id, b_pils,   4.5, 'draft', 'Crispest pilsner I''ve had outside of Prague.',                         true,  now() - interval '22 days' + interval '20 hours'),
  (u11, demo_brewery_id, b_marzen, 4.0, 'draft', 'Drove down from Dallas just for this. Worth it.',                       true,  now() - interval '21 days' + interval '15 hours'),
  (u02, demo_brewery_id, b_stout,  5.0, 'draft', 'Dark Mode Stout is the pinnacle of oatmeal stouts.',                    true,  now() - interval '21 days' + interval '16 hours'),
  (u08, demo_brewery_id, b_pale,   4.0, 'draft', 'Pull Request Pale is super drinkable. Had two.',                        true,  now() - interval '21 days' + interval '17 hours'),
  (u04, demo_brewery_id, b_ipa,    4.5, 'draft', 'Made the drive from Houston. Debug IPA did not disappoint.',            true,  now() - interval '21 days' + interval '18 hours'),
  (u06, demo_brewery_id, b_wheat,  4.0, 'draft', '404 Wheat Not Found — the name is a banger and so is the beer.',        true,  now() - interval '21 days' + interval '19 hours'),
  (u12, demo_brewery_id, b_marzen, 4.5, 'draft', 'Märzen is so underrated. Pint & Pixel nailed it.',                     true,  now() - interval '21 days' + interval '20 hours'),
  (u01, demo_brewery_id, b_pale,   4.0, 'draft', 'Tropical and easy. Great session beer.',                                true,  now() - interval '20 days' + interval '14 hours'),
  (u09, demo_brewery_id, b_pils,   3.5, 'draft', 'My first craft pilsner. Really liked it!',                              true,  now() - interval '20 days' + interval '16 hours'),

  -- Week 2 (Mar 8-14) ────────────────────────────────────────────────────────
  (u03, demo_brewery_id, b_sour,   5.0, 'draft', 'Back for my weekly sour fix.',                                          true,  now() - interval '16 days' + interval '17 hours'),
  (u08, demo_brewery_id, b_stout,  4.5, 'draft', 'Dark Mode Stout pairs perfectly with the cold snap we''re having.',     true,  now() - interval '16 days' + interval '18 hours'),
  (u10, demo_brewery_id, b_porter, 4.5, 'draft', 'Vanilla notes are subtle but there. Really nice.',                      true,  now() - interval '16 days' + interval '19 hours'),
  (u05, demo_brewery_id, b_pils,   5.0, 'draft', 'I''ve had this 6 times now. Still perfect.',                            true,  now() - interval '16 days' + interval '20 hours'),
  (u07, demo_brewery_id, b_dipa,   4.5, 'draft', 'Deploy Friday DIPA — felt cute, might not be productive after this.',   true,  now() - interval '15 days' + interval '16 hours'),
  (u01, demo_brewery_id, b_ipa,    5.0, 'draft', 'Brought three friends who had never had craft IPA. Converted all of them.',true,now() - interval '15 days' + interval '17 hours'),
  (u06, demo_brewery_id, b_marzen, 4.0, 'draft', 'Solid Märzen. Great with food.',                                        true,  now() - interval '15 days' + interval '18 hours'),
  (u12, demo_brewery_id, b_pale,   3.5, 'draft', 'Good but I''ll probably go back to the Märzen next time.',              true,  now() - interval '15 days' + interval '19 hours'),
  (u04, demo_brewery_id, b_wheat,  4.0, 'draft', 'Refreshing. The banana notes are spot on.',                             true,  now() - interval '14 days' + interval '15 hours'),
  (u11, demo_brewery_id, b_ipa,    4.5, 'draft', 'Monthly Austin trip. Started here as always.',                          true,  now() - interval '14 days' + interval '16 hours'),
  (u02, demo_brewery_id, b_porter, 4.0, 'draft', 'Porter is underrated here. Kernel Panic is excellent.',                 true,  now() - interval '14 days' + interval '17 hours'),
  (u09, demo_brewery_id, b_sour,   4.0, 'draft', 'Getting into sours. This one is a great gateway.',                      true,  now() - interval '14 days' + interval '18 hours'),
  (u08, demo_brewery_id, b_ipa,    4.5, 'draft', 'IPA flight comparison — Debug IPA wins every time.',                    true,  now() - interval '14 days' + interval '19 hours'),
  (u03, demo_brewery_id, b_wheat,  4.5, 'draft', 'Perfect Saturday afternoon beer. Light and fun.',                       true,  now() - interval '13 days' + interval '14 hours'),
  (u10, demo_brewery_id, b_stout,  5.0, 'draft', 'Dark Mode Stout is better every time I have it.',                       true,  now() - interval '13 days' + interval '15 hours'),
  (u05, demo_brewery_id, b_lager,  3.5, 'draft', 'Clean and simple. Sometimes that''s exactly what you need.',            true,  now() - interval '13 days' + interval '16 hours'),
  (u07, demo_brewery_id, b_dipa,   5.0, 'draft', 'Deploy Friday DIPA is dangerously good.',                               true,  now() - interval '13 days' + interval '17 hours'),
  (u06, demo_brewery_id, b_sour,   4.5, 'draft', 'Sour season started early this year.',                                  true,  now() - interval '13 days' + interval '18 hours'),
  (u01, demo_brewery_id, b_stout,  4.0, 'draft', 'Usually an IPA guy but Dark Mode is converting me.',                    true,  now() - interval '13 days' + interval '19 hours'),
  (u12, demo_brewery_id, b_marzen, 5.0, 'draft', 'Best Märzen I''ve ever had. Not exaggerating.',                         true,  now() - interval '12 days' + interval '15 hours'),
  (u04, demo_brewery_id, b_pale,   4.0, 'draft', 'Solid APA. Easy drinking.',                                             true,  now() - interval '12 days' + interval '16 hours'),
  (u09, demo_brewery_id, b_ipa,    4.0, 'draft', 'This IPA is making me a craft beer person.',                            true,  now() - interval '12 days' + interval '17 hours'),

  -- Week 3 (Mar 15-21) — busiest week ────────────────────────────────────────
  (u08, demo_brewery_id, b_ipa,    5.0, 'draft', 'Hosted my book club here. Everyone loved the IPA.',                     true,  now() - interval '9 days'  + interval '17 hours'),
  (u06, demo_brewery_id, b_stout,  4.5, 'draft', 'Stout with dessert is criminally underrated.',                          true,  now() - interval '9 days'  + interval '18 hours'),
  (u01, demo_brewery_id, b_ipa,    5.0, 'draft', 'Third time this week. Zero regrets.',                                   true,  now() - interval '9 days'  + interval '19 hours'),
  (u03, demo_brewery_id, b_sour,   5.0, 'draft', 'Stack Overflow Sour — my personality.',                                 true,  now() - interval '9 days'  + interval '20 hours'),
  (u10, demo_brewery_id, b_porter, 5.0, 'draft', NULL,                                                                    true,  now() - interval '8 days'  + interval '16 hours'),
  (u05, demo_brewery_id, b_pils,   4.5, 'draft', 'Pilsner Friday is my new tradition.',                                   true,  now() - interval '8 days'  + interval '17 hours'),
  (u11, demo_brewery_id, b_marzen, 4.5, 'draft', NULL,                                                                    true,  now() - interval '8 days'  + interval '18 hours'),
  (u02, demo_brewery_id, b_stout,  5.0, 'draft', 'Dark Mode Stout is my comfort beer.',                                   true,  now() - interval '8 days'  + interval '19 hours'),
  (u07, demo_brewery_id, b_dipa,   4.5, 'can',   'Got a 4-pack to go. Living dangerously.',                               true,  now() - interval '8 days'  + interval '20 hours'),
  (u12, demo_brewery_id, b_wheat,  4.0, 'draft', 'Light and refreshing for the warm weather.',                            true,  now() - interval '7 days'  + interval '13 hours'),
  (u04, demo_brewery_id, b_ipa,    4.5, 'draft', 'Austin trip. Debug IPA first as always.',                               true,  now() - interval '7 days'  + interval '14 hours'),
  (u08, demo_brewery_id, b_pale,   4.0, 'draft', NULL,                                                                    true,  now() - interval '7 days'  + interval '15 hours'),
  (u09, demo_brewery_id, b_stout,  4.5, 'draft', 'Tried the stout finally. Wow.',                                         true,  now() - interval '7 days'  + interval '16 hours'),
  (u06, demo_brewery_id, b_wheat,  4.5, 'draft', 'Spring is here. Wheat season baby.',                                    true,  now() - interval '7 days'  + interval '17 hours'),
  (u03, demo_brewery_id, b_sour,   4.5, 'draft', NULL,                                                                    true,  now() - interval '7 days'  + interval '18 hours'),
  (u01, demo_brewery_id, b_dipa,   4.5, 'draft', 'Tried the DIPA for the first time. Send help.',                         true,  now() - interval '7 days'  + interval '19 hours'),
  (u10, demo_brewery_id, b_marzen, 4.0, 'draft', 'Märzen is so underrated.',                                              true,  now() - interval '7 days'  + interval '20 hours'),
  (u05, demo_brewery_id, b_pils,   5.0, 'draft', 'Perfect. As always.',                                                   true,  now() - interval '6 days'  + interval '14 hours'),
  (u11, demo_brewery_id, b_ipa,    4.5, 'draft', NULL,                                                                    true,  now() - interval '6 days'  + interval '15 hours'),
  (u02, demo_brewery_id, b_porter, 4.5, 'draft', 'Porter and the game. Perfect Sunday.',                                  true,  now() - interval '6 days'  + interval '16 hours'),
  (u12, demo_brewery_id, b_marzen, 4.5, 'draft', NULL,                                                                    true,  now() - interval '6 days'  + interval '17 hours'),

  -- Week 4 (Mar 22-24) — current week ───────────────────────────────────────
  (u08, demo_brewery_id, b_ipa,    5.0, 'draft', 'Still the best. Every single time.',                                    true,  now() - interval '2 days'  + interval '17 hours'),
  (u03, demo_brewery_id, b_sour,   5.0, 'draft', 'My happy place.',                                                       true,  now() - interval '2 days'  + interval '18 hours'),
  (u06, demo_brewery_id, b_stout,  4.5, 'draft', NULL,                                                                    true,  now() - interval '2 days'  + interval '19 hours'),
  (u01, demo_brewery_id, b_ipa,    5.0, 'draft', 'Friday night Debug IPA. Non-negotiable.',                               true,  now() - interval '1 day'   + interval '16 hours'),
  (u10, demo_brewery_id, b_porter, 4.5, 'draft', 'Weekly porter check-in. Kernel Panic remains elite.',                   true,  now() - interval '1 day'   + interval '17 hours'),
  (u05, demo_brewery_id, b_pils,   4.5, 'draft', NULL,                                                                    true,  now() - interval '1 day'   + interval '18 hours'),
  (u07, demo_brewery_id, b_dipa,   5.0, 'draft', 'Deploy Friday DIPA on an actual Friday. Poetic.',                       true,  now() - interval '1 day'   + interval '19 hours'),
  (u02, demo_brewery_id, b_stout,  4.5, 'draft', NULL,                                                                    true,  now() - interval '1 day'   + interval '20 hours'),
  (u12, demo_brewery_id, b_marzen, 4.5, 'draft', 'Saturday Märzen ritual.',                                               true,  now() - interval '6 hours'),
  (u09, demo_brewery_id, b_pale,   4.0, 'draft', 'Getting braver with styles. Pale ale next!',                            true,  now() - interval '5 hours'),
  (u04, demo_brewery_id, b_wheat,  4.5, 'draft', 'Perfect weather for a hefeweizen.',                                     true,  now() - interval '4 hours'),
  (u11, demo_brewery_id, b_ipa,    4.5, 'draft', 'Monthly visit. As reliable as the beer.',                               true,  now() - interval '3 hours'),
  (u08, demo_brewery_id, b_pale,   4.0, 'draft', NULL,                                                                    true,  now() - interval '2 hours'),
  (u06, demo_brewery_id, b_wheat,  4.5, 'draft', 'Weekend wheat. Perfect.',                                               true,  now() - interval '1 hour');

  -- ── 5. Update beer average ratings and checkin counts ────────────────────
  UPDATE beers SET
    avg_rating    = sub.avg_r,
    total_ratings = sub.cnt
  FROM (
    SELECT beer_id, ROUND(AVG(rating)::numeric, 2) as avg_r, COUNT(*) as cnt
    FROM checkins
    WHERE brewery_id = demo_brewery_id AND beer_id IS NOT NULL AND rating > 0
    GROUP BY beer_id
  ) sub
  WHERE beers.id = sub.beer_id;

  -- ── 6. Upsert brewery_visits for each user ────────────────────────────────
  INSERT INTO brewery_visits (user_id, brewery_id, total_visits, last_visit_at)
  SELECT
    user_id,
    brewery_id,
    COUNT(*) as total_visits,
    MAX(created_at) as last_visit_at
  FROM checkins
  WHERE brewery_id = demo_brewery_id
  GROUP BY user_id, brewery_id
  ON CONFLICT (user_id, brewery_id) DO UPDATE SET
    total_visits  = EXCLUDED.total_visits,
    last_visit_at = EXCLUDED.last_visit_at;

  -- ── 7. Create loyalty cards with stamps ───────────────────────────────────
  INSERT INTO loyalty_cards (user_id, brewery_id, stamps, lifetime_stamps, last_stamp_at)
  SELECT
    user_id,
    brewery_id,
    LEAST(COUNT(*), 10) as stamps,     -- cap at 10 (one full card)
    COUNT(*) as lifetime_stamps,
    MAX(created_at) as last_stamp_at
  FROM checkins
  WHERE brewery_id = demo_brewery_id
  GROUP BY user_id, brewery_id
  ON CONFLICT (user_id, brewery_id) DO UPDATE SET
    stamps          = EXCLUDED.stamps,
    lifetime_stamps = EXCLUDED.lifetime_stamps,
    last_stamp_at   = EXCLUDED.last_stamp_at;

END $$;

-- ── Confirm ───────────────────────────────────────────────────────────────────
SELECT
  'Check-ins created: ' || COUNT(*)::text AS result
FROM checkins
WHERE brewery_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
UNION ALL
SELECT 'Unique visitors: ' || COUNT(DISTINCT user_id)::text
FROM checkins
WHERE brewery_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
UNION ALL
SELECT 'Loyalty cards issued: ' || COUNT(*)::text
FROM loyalty_cards
WHERE brewery_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
UNION ALL
SELECT 'Avg rating across all beers: ' || ROUND(AVG(rating)::numeric, 2)::text || ' ★'
FROM checkins
WHERE brewery_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND rating > 0;
