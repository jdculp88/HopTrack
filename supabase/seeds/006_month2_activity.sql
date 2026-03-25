-- ─────────────────────────────────────────────────────────────────────────────
-- Seed 006: February Activity for Pint & Pixel Brewing Co. (Month 2 of 2)
-- Casey (QA) — adds ~80 check-ins covering Feb 1–28 (the month BEFORE seed 003).
-- Users are newer here: still discovering styles, more first-impression comments,
-- slightly lower frequency, ratings a touch more varied (4.0–4.5 avg, some 3.5s).
-- Run AFTER 003_test_activity.sql (users and beers must already exist).
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  demo_brewery_id uuid := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

  -- Fixed test user UUIDs (same as seed 003)
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

  -- ── 1. Fetch beer IDs ─────────────────────────────────────────────────────
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

  -- ── 2. Insert February check-ins (~80 total, Feb 1–28) ───────────────────
  -- Dates: now() - interval '54 days' (Feb 1) through now() - interval '24 days' (Feb 28)
  -- Heavier on Fri/Sat/Sun evenings; some Tue/Wed visits mid-month.
  -- Comments feel like earlier visits — first impressions, still exploring.
  -- ~60% have comments; ratings range 3.5–5.0, averaging ~4.1–4.3.

  INSERT INTO checkins (user_id, brewery_id, beer_id, rating, serving_style, comment, share_to_feed, created_at) VALUES

  -- ── Week 1: Feb 1–7 (Fri Feb 1, Sat Feb 2, Sun Feb 3 are the weekend) ───

  -- Fri Feb 1
  (u08, demo_brewery_id, b_ipa,    4.5, 'draft', 'Friend dragged me here. Okay yeah the Debug IPA is really good.',         true,  now() - interval '51 days' + interval '18 hours'),
  (u01, demo_brewery_id, b_ipa,    5.0, 'draft', 'First time at Pint & Pixel. This IPA is going on my permanent list.',     true,  now() - interval '51 days' + interval '19 hours'),
  (u06, demo_brewery_id, b_stout,  4.0, 'draft', 'Dark Mode Stout — solid oatmeal stout. Curious to come back and try more.',true, now() - interval '51 days' + interval '20 hours'),

  -- Sat Feb 2
  (u03, demo_brewery_id, b_sour,   4.5, 'draft', 'Just stumbled in. Stack Overflow Sour was the right call.',               true,  now() - interval '50 days' + interval '14 hours'),
  (u10, demo_brewery_id, b_porter, 4.0, 'draft', 'Kernel Panic Porter — smoky and smooth. First porter I''ve really enjoyed.',true,now() - interval '50 days' + interval '15 hours'),
  (u05, demo_brewery_id, b_pils,   4.5, 'draft', 'I don''t usually trust brewery pilsners but this one surprised me.',       true,  now() - interval '50 days' + interval '16 hours'),
  (u12, demo_brewery_id, b_marzen, 4.0, 'draft', 'First visit. The Märzen is approachable and malty. Coming back.',          true,  now() - interval '50 days' + interval '17 hours'),
  (u02, demo_brewery_id, b_stout,  4.5, 'draft', 'Heard about this place from a coworker. Dark Mode did not disappoint.',    true,  now() - interval '50 days' + interval '18 hours'),

  -- Sun Feb 3
  (u11, demo_brewery_id, b_ipa,    4.0, 'draft', 'Stopping here on my way through Austin. Good IPA, nice vibe.',            true,  now() - interval '49 days' + interval '13 hours'),
  (u08, demo_brewery_id, b_pale,   3.5, 'draft', 'Pull Request Pale is fine. Thought the IPA was better honestly.',          true,  now() - interval '49 days' + interval '14 hours'),
  (u06, demo_brewery_id, b_wheat,  4.0, 'draft', 'Tried the wheat ale. Banana and clove notes are there. Good Sunday beer.', true,  now() - interval '49 days' + interval '15 hours'),

  -- Tue Feb 5
  (u01, demo_brewery_id, b_pale,   4.0, 'draft', 'Back already. Trying my way through the tap list.',                        true,  now() - interval '47 days' + interval '18 hours'),
  (u03, demo_brewery_id, b_lager,  3.5, 'draft', 'Legacy Code Lager is clean but not my thing. Still exploring.',            true,  now() - interval '47 days' + interval '19 hours'),

  -- ── Week 2: Feb 8–14 (Fri Feb 7, Sat Feb 8 — shifting to heavier) ───────

  -- Fri Feb 7
  (u10, demo_brewery_id, b_stout,  4.5, 'draft', 'Switched from porter to stout. Dark Mode is on another level.',            true,  now() - interval '45 days' + interval '17 hours'),
  (u05, demo_brewery_id, b_pils,   5.0, 'draft', 'I''ve officially found my brewery. Pixel Perfect Pils is the real deal.',  true,  now() - interval '45 days' + interval '18 hours'),
  (u07, demo_brewery_id, b_dipa,   4.5, 'draft', 'Finally tried the Deploy Friday DIPA. That''s a dangerous beer name.',      true,  now() - interval '45 days' + interval '19 hours'),
  (u12, demo_brewery_id, b_pale,   3.5, 'draft', NULL,                                                                        true,  now() - interval '45 days' + interval '20 hours'),

  -- Sat Feb 8
  (u08, demo_brewery_id, b_ipa,    4.5, 'draft', 'Brought my sister. She''s a convert now too.',                             true,  now() - interval '44 days' + interval '13 hours'),
  (u02, demo_brewery_id, b_porter, 4.0, 'draft', 'Trying the porter after loving the stout. Kernel Panic holds its own.',    true,  now() - interval '44 days' + interval '14 hours'),
  (u04, demo_brewery_id, b_ipa,    4.5, 'draft', 'Long drive from Houston but the Debug IPA is always worth it.',            true,  now() - interval '44 days' + interval '15 hours'),
  (u06, demo_brewery_id, b_sour,   4.5, 'draft', 'Stack Overflow Sour — that tartness hits just right.',                     true,  now() - interval '44 days' + interval '16 hours'),
  (u03, demo_brewery_id, b_sour,   5.0, 'draft', 'This sour is genuinely the best I''ve had in Texas. Not exaggerating.',    true,  now() - interval '44 days' + interval '17 hours'),
  (u11, demo_brewery_id, b_marzen, 4.0, 'draft', NULL,                                                                        true,  now() - interval '44 days' + interval '18 hours'),

  -- Sun Feb 9
  (u01, demo_brewery_id, b_ipa,    5.0, 'draft', 'Sunday session. Three IPAs in and still think it''s perfect.',             true,  now() - interval '43 days' + interval '12 hours'),
  (u10, demo_brewery_id, b_porter, 4.0, 'draft', NULL,                                                                        true,  now() - interval '43 days' + interval '13 hours'),
  (u09, demo_brewery_id, b_pils,   3.5, 'draft', 'My friend got me into craft beer last month. This pilsner is a good start.',true, now() - interval '43 days' + interval '14 hours'),

  -- Wed Feb 12
  (u05, demo_brewery_id, b_pale,   4.0, 'draft', 'Mid-week stop. Pull Request Pale is an easy drinker.',                     true,  now() - interval '40 days' + interval '18 hours'),
  (u08, demo_brewery_id, b_stout,  4.5, 'draft', 'Cold snap outside. Dark Mode Stout was the obvious choice.',               true,  now() - interval '40 days' + interval '19 hours'),

  -- Thu Feb 13
  (u12, demo_brewery_id, b_marzen, 4.5, 'draft', 'Coming back just for the Märzen. Told all my friends about this place.',   true,  now() - interval '39 days' + interval '18 hours'),
  (u02, demo_brewery_id, b_stout,  4.5, 'draft', NULL,                                                                        true,  now() - interval '39 days' + interval '19 hours'),

  -- ── Week 3: Feb 14–21 — Valentine''s Day weekend, busiest of the month ──

  -- Fri Feb 14 (Valentine's Day)
  (u06, demo_brewery_id, b_stout,  5.0, 'draft', 'Valentine''s Day at a brewery. We''re the kind of couple that does this.',  true,  now() - interval '38 days' + interval '17 hours'),
  (u03, demo_brewery_id, b_sour,   5.0, 'draft', 'Stack Overflow Sour for Valentine''s Day. It''s tart, I''m in love.',       true,  now() - interval '38 days' + interval '18 hours'),
  (u01, demo_brewery_id, b_ipa,    5.0, 'draft', 'Third visit this month. Debug IPA is genuinely perfect every time.',        true,  now() - interval '38 days' + interval '19 hours'),
  (u07, demo_brewery_id, b_dipa,   4.0, 'draft', 'Deploy Friday DIPA on a Friday. Almost poetic.',                            true,  now() - interval '38 days' + interval '20 hours'),

  -- Sat Feb 15
  (u08, demo_brewery_id, b_ipa,    5.0, 'draft', 'Back again. No notes, still perfect.',                                      true,  now() - interval '37 days' + interval '13 hours'),
  (u04, demo_brewery_id, b_wheat,  4.0, 'draft', 'Tried the wheat this time. 404 Wheat Not Found — great name, great beer.',  true,  now() - interval '37 days' + interval '14 hours'),
  (u10, demo_brewery_id, b_porter, 4.5, 'draft', 'Kernel Panic Porter keeps getting better. Or maybe I''m just getting it.', true,  now() - interval '37 days' + interval '15 hours'),
  (u05, demo_brewery_id, b_pils,   4.5, 'draft', NULL,                                                                        true,  now() - interval '37 days' + interval '16 hours'),
  (u11, demo_brewery_id, b_ipa,    4.5, 'draft', 'Monthly Austin run. Always start here. Always Debug IPA.',                  true,  now() - interval '37 days' + interval '17 hours'),
  (u12, demo_brewery_id, b_marzen, 4.5, 'draft', NULL,                                                                        true,  now() - interval '37 days' + interval '18 hours'),
  (u09, demo_brewery_id, b_ipa,    4.0, 'draft', 'Starting to understand what the hype about IPAs is.',                       true,  now() - interval '37 days' + interval '19 hours'),

  -- Sun Feb 16
  (u02, demo_brewery_id, b_porter, 4.0, 'draft', NULL,                                                                        true,  now() - interval '36 days' + interval '13 hours'),
  (u06, demo_brewery_id, b_wheat,  4.0, 'draft', 'Sunday afternoon wheat. Light and easy.',                                   true,  now() - interval '36 days' + interval '14 hours'),
  (u03, demo_brewery_id, b_pale,   4.0, 'draft', 'Exploring beyond sours. Pull Request Pale is solid.',                       true,  now() - interval '36 days' + interval '15 hours'),

  -- Tue Feb 18
  (u01, demo_brewery_id, b_stout,  4.0, 'draft', 'Stepped outside my IPA comfort zone. Dark Mode is really impressive.',      true,  now() - interval '34 days' + interval '18 hours'),
  (u08, demo_brewery_id, b_marzen, 4.0, 'draft', 'Never had a Märzen before. Nutty and smooth. Pleasant surprise.',           true,  now() - interval '34 days' + interval '19 hours'),

  -- Thu Feb 20
  (u10, demo_brewery_id, b_stout,  4.5, 'draft', 'Porter is my main but the stout is giving it competition.',                 true,  now() - interval '32 days' + interval '18 hours'),
  (u12, demo_brewery_id, b_lager,  3.5, 'draft', 'Legacy Code Lager — simple and clean. Good gateway beer.',                  true,  now() - interval '32 days' + interval '19 hours'),

  -- ── Week 4: Feb 21–28 — final push, some users hitting stride ────────────

  -- Fri Feb 21
  (u05, demo_brewery_id, b_pils,   5.0, 'draft', 'I''ve committed. This is my brewery now.',                                  true,  now() - interval '31 days' + interval '17 hours'),
  (u07, demo_brewery_id, b_dipa,   4.5, 'draft', NULL,                                                                        true,  now() - interval '31 days' + interval '18 hours'),
  (u03, demo_brewery_id, b_sour,   5.0, 'draft', NULL,                                                                        true,  now() - interval '31 days' + interval '19 hours'),
  (u02, demo_brewery_id, b_stout,  5.0, 'draft', 'Dark Mode Stout is absolutely my comfort beer. Already.',                   true,  now() - interval '31 days' + interval '20 hours'),

  -- Sat Feb 22
  (u08, demo_brewery_id, b_ipa,    5.0, 'draft', 'Four visits in February and the Debug IPA has been perfect every single time.',true,now() - interval '30 days' + interval '13 hours'),
  (u06, demo_brewery_id, b_stout,  4.5, 'draft', NULL,                                                                        true,  now() - interval '30 days' + interval '14 hours'),
  (u01, demo_brewery_id, b_ipa,    5.0, 'draft', 'Convinced two more coworkers to come. They both immediately ordered seconds.',true,now() - interval '30 days' + interval '15 hours'),
  (u04, demo_brewery_id, b_ipa,    4.5, 'draft', 'Houston to Austin just to be here. This is normal behavior.',               true,  now() - interval '30 days' + interval '16 hours'),
  (u11, demo_brewery_id, b_pale,   4.0, 'draft', NULL,                                                                        true,  now() - interval '30 days' + interval '17 hours'),
  (u09, demo_brewery_id, b_stout,  4.0, 'draft', 'Branching out from pils. Dark Mode is wow.',                                true,  now() - interval '30 days' + interval '18 hours'),
  (u10, demo_brewery_id, b_porter, 5.0, 'draft', 'Kernel Panic Porter — I will be here every week now.',                      true,  now() - interval '30 days' + interval '19 hours'),

  -- Sun Feb 23
  (u12, demo_brewery_id, b_marzen, 5.0, 'draft', 'Märzen in February feels right. This one is exceptional.',                  true,  now() - interval '29 days' + interval '12 hours'),
  (u05, demo_brewery_id, b_lager,  4.0, 'draft', 'Pilsner was taken so I got the lager. Honestly pretty good.',               true,  now() - interval '29 days' + interval '13 hours'),
  (u03, demo_brewery_id, b_wheat,  4.5, 'draft', 'Wanted something lighter. 404 Wheat Not Found hit the spot.',               true,  now() - interval '29 days' + interval '14 hours'),
  (u02, demo_brewery_id, b_porter, 4.0, 'draft', NULL,                                                                        true,  now() - interval '29 days' + interval '15 hours'),

  -- Wed Feb 26
  (u01, demo_brewery_id, b_pale,   4.0, 'draft', 'Mid-week treat. Pull Request Pale is a good change of pace from the IPA.',  true,  now() - interval '26 days' + interval '18 hours'),
  (u08, demo_brewery_id, b_sour,   4.5, 'draft', 'First time trying the sour. Stack Overflow is genuinely excellent.',        true,  now() - interval '26 days' + interval '19 hours'),

  -- Thu Feb 27
  (u06, demo_brewery_id, b_marzen, 4.0, 'draft', NULL,                                                                        true,  now() - interval '25 days' + interval '17 hours'),
  (u10, demo_brewery_id, b_porter, 4.5, 'draft', 'End of month tradition is now a thing I''m doing apparently.',              true,  now() - interval '25 days' + interval '18 hours'),

  -- Fri Feb 28 (last day of month)
  (u07, demo_brewery_id, b_dipa,   4.5, 'draft', 'Last day of February. Deploy Friday DIPA to celebrate.',                    true,  now() - interval '24 days' + interval '16 hours'),
  (u05, demo_brewery_id, b_pils,   4.5, 'draft', 'Monthly close-out pint. See you in March, Pixel Perfect.',                  true,  now() - interval '24 days' + interval '17 hours'),
  (u03, demo_brewery_id, b_sour,   4.5, 'draft', NULL,                                                                        true,  now() - interval '24 days' + interval '18 hours'),
  (u11, demo_brewery_id, b_marzen, 4.0, 'draft', 'Last stop before heading back to Dallas. Worth every mile.',                true,  now() - interval '24 days' + interval '19 hours'),
  (u12, demo_brewery_id, b_pale,   3.5, 'draft', 'Wanted to try everything before March. Pale is good, Märzen is still king.',true,  now() - interval '24 days' + interval '20 hours');

  -- ── 3. Update beer average ratings and total_ratings (across ALL check-ins) ─
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

  -- ── 4. Update brewery_visits totals (cumulative across both months) ────────
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

  -- ── 5. Update loyalty_cards stamps (cumulative across both months) ─────────
  INSERT INTO loyalty_cards (user_id, brewery_id, stamps, lifetime_stamps, last_stamp_at)
  SELECT
    user_id,
    brewery_id,
    LEAST(COUNT(*) % 10, 10) as stamps,   -- current card progress (mod 10)
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

-- ── Confirm: totals across both Month 1 (March) and Month 2 (February) ───────
SELECT
  'Total check-ins (both months): ' || COUNT(*)::text AS result
FROM checkins
WHERE brewery_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
UNION ALL
SELECT 'February check-ins only: ' || COUNT(*)::text
FROM checkins
WHERE brewery_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  AND created_at < now() - interval '23 days'
UNION ALL
SELECT 'March check-ins only: ' || COUNT(*)::text
FROM checkins
WHERE brewery_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  AND created_at >= now() - interval '23 days'
UNION ALL
SELECT 'Unique visitors: ' || COUNT(DISTINCT user_id)::text
FROM checkins
WHERE brewery_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
UNION ALL
SELECT 'Avg rating (Feb only): ' || ROUND(AVG(rating)::numeric, 2)::text || ' ★'
FROM checkins
WHERE brewery_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  AND rating > 0
  AND created_at < now() - interval '23 days'
UNION ALL
SELECT 'Avg rating (combined): ' || ROUND(AVG(rating)::numeric, 2)::text || ' ★'
FROM checkins
WHERE brewery_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND rating > 0;
