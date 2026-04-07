-- Sprint 171: Diverse seed data for realistic consumer app feel
-- Adds: friendships between test users, brewery follows, beer lists, varied reactions
-- Complements seed-next-day.mjs which handles session/beer_log/review generation

-- ─── Friendships between test users (create a connected social graph) ────────
-- 40 test users → ~80 friendships (each user has 3-6 friends)
DO $$
DECLARE
  i int;
  j int;
  uid1 uuid;
  uid2 uuid;
BEGIN
  FOR i IN 1..40 LOOP
    uid1 := ('f' || lpad(i::text, 7, '0') || '-0000-4000-8000-000000000' || lpad(i::text, 3, '0'))::uuid;
    -- Each user friends 4 nearby users (wrapping)
    FOR j IN 1..4 LOOP
      uid2 := ('f' || lpad(((i + j - 1) % 40 + 1)::text, 7, '0') || '-0000-4000-8000-000000000' || lpad(((i + j - 1) % 40 + 1)::text, 3, '0'))::uuid;
      IF uid1 < uid2 THEN
        INSERT INTO friendships (requester_id, addressee_id, status, created_at)
        VALUES (uid1, uid2, 'accepted', now() - interval '30 days' + (i * interval '6 hours'))
        ON CONFLICT DO NOTHING;
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- ─── Brewery follows (users follow 2-5 breweries each) ──────────────────────
-- Pick from the 7,177+ breweries already seeded
INSERT INTO brewery_follows (user_id, brewery_id, created_at)
SELECT
  ('f' || lpad(u::text, 7, '0') || '-0000-4000-8000-000000000' || lpad(u::text, 3, '0'))::uuid,
  b.id,
  now() - (random() * interval '60 days')
FROM generate_series(1, 40) u
CROSS JOIN LATERAL (
  SELECT id FROM breweries
  WHERE verified = false
  ORDER BY random()
  LIMIT 2 + (u % 4)  -- 2-5 follows per user
) b
ON CONFLICT DO NOTHING;

-- ─── Beer lists (10 users create lists with varied themes) ───────────────────
DO $$
DECLARE
  uid uuid;
  list_id uuid;
  beer_rec record;
  pos int;
  titles text[] := ARRAY[
    'Summer Crushers', 'Dark & Stormy', 'Hop Forward', 'Session Beers',
    'Want to Try', 'Date Night Picks', 'IPA Hall of Fame', 'Stout Season',
    'Tailgate Beers', 'Light & Easy'
  ];
BEGIN
  FOR i IN 1..10 LOOP
    uid := ('f' || lpad(i::text, 7, '0') || '-0000-4000-8000-000000000' || lpad(i::text, 3, '0'))::uuid;
    list_id := gen_random_uuid();

    INSERT INTO beer_lists (id, user_id, title, description, is_public, created_at)
    VALUES (
      list_id, uid, titles[i],
      'Curated by test user ' || i,
      i <= 7,  -- first 7 are public
      now() - (i * interval '5 days')
    ) ON CONFLICT DO NOTHING;

    -- Add 3-8 beers to each list
    pos := 0;
    FOR beer_rec IN
      SELECT id FROM beers ORDER BY random() LIMIT 3 + (i % 6)
    LOOP
      INSERT INTO beer_list_items (id, list_id, beer_id, position, note, created_at)
      VALUES (
        gen_random_uuid(), list_id, beer_rec.id, pos,
        CASE WHEN random() > 0.6 THEN 'Great pick!' ELSE NULL END,
        now() - (i * interval '5 days') + (pos * interval '1 hour')
      ) ON CONFLICT DO NOTHING;
      pos := pos + 1;
    END LOOP;
  END LOOP;
END $$;

-- ─── Diverse notifications (achievement unlocks, friend follows, etc.) ───────
INSERT INTO notifications (id, user_id, type, title, body, read, created_at)
SELECT
  gen_random_uuid(),
  ('f' || lpad(u::text, 7, '0') || '-0000-4000-8000-000000000' || lpad(u::text, 3, '0'))::uuid,
  (ARRAY['achievement_unlocked', 'friend_request', 'brewery_follow', 'new_tap', 'session_comment'])[1 + (u % 5)],
  CASE (u % 5)
    WHEN 0 THEN 'Achievement Unlocked!'
    WHEN 1 THEN 'New Friend Request'
    WHEN 2 THEN 'Brewery Update'
    WHEN 3 THEN 'New on Tap'
    WHEN 4 THEN 'New Comment'
  END,
  CASE (u % 5)
    WHEN 0 THEN 'You earned the Style Explorer badge!'
    WHEN 1 THEN 'Test User ' || ((u + 5) % 40 + 1) || ' wants to be friends'
    WHEN 2 THEN 'A brewery you follow added new beers'
    WHEN 3 THEN 'Fresh pour at your favorite spot'
    WHEN 4 THEN 'Someone commented on your session'
  END,
  u > 20,  -- first 20 users have unread notifications
  now() - (u * interval '3 hours')
FROM generate_series(1, 40) u
ON CONFLICT DO NOTHING;

-- Add a second round of varied notifications (older, read)
INSERT INTO notifications (id, user_id, type, title, body, read, created_at)
SELECT
  gen_random_uuid(),
  ('f' || lpad(u::text, 7, '0') || '-0000-4000-8000-000000000' || lpad(u::text, 3, '0'))::uuid,
  (ARRAY['weekly_stats', 'reaction', 'session_cheers', 'reward_redeemed', 'friend_checkin'])[1 + (u % 5)],
  CASE (u % 5)
    WHEN 0 THEN 'Weekly Stats Ready'
    WHEN 1 THEN 'New Reaction'
    WHEN 2 THEN 'Cheers!'
    WHEN 3 THEN 'Reward Redeemed'
    WHEN 4 THEN 'Friend Check-in'
  END,
  CASE (u % 5)
    WHEN 0 THEN 'Your weekly beer stats are ready to view'
    WHEN 1 THEN 'Test User ' || ((u + 3) % 40 + 1) || ' reacted to your session'
    WHEN 2 THEN 'Test User ' || ((u + 7) % 40 + 1) || ' cheered your pour'
    WHEN 3 THEN 'You redeemed a free pint!'
    WHEN 4 THEN 'Test User ' || ((u + 2) % 40 + 1) || ' checked in nearby'
  END,
  true,
  now() - interval '7 days' - (u * interval '4 hours')
FROM generate_series(1, 40) u
ON CONFLICT DO NOTHING;
