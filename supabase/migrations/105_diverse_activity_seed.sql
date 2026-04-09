-- Sprint 171: Diverse activity seed data
-- Creates 60 days of realistic, varied activity across multiple breweries
-- for all 40 test users. Each user has distinct behavior patterns.
--
-- This is DATA-ONLY — no schema changes.

-- ─── Helper: Generate test user UUID from number ─────────────────────────────
CREATE OR REPLACE FUNCTION _test_uid(n int) RETURNS uuid AS $$
  SELECT ('f' || lpad(n::text, 7, '0') || '-0000-4000-8000-000000000' || lpad(n::text, 3, '0'))::uuid;
$$ LANGUAGE sql IMMUTABLE;

-- ─── Step 1: Pick 8 breweries with beers for diverse sessions ────────────────
-- We need breweries that have beers in the beers table
DO $$
DECLARE
  brewery_ids uuid[];
  beer_ids uuid[];
  uid uuid;
  bid uuid;
  v_beer_id uuid;
  session_id uuid;
  d int;
  day_offset int;
  beers_per_session int;
  session_start timestamptz;
  session_end timestamptz;
  v_rating numeric;
  log_time timestamptz;
  b int;
  reactor_num int;
  comment_texts text[] := ARRAY[
    'Great picks today!', 'That IPA is incredible', 'Save me a seat next time',
    'Jealous! How was it?', 'We need to go together soon', 'Cheers! 🍻',
    'Try the stout next time', 'Been meaning to check this place out',
    'Love seeing your check-ins', 'The saison there is amazing',
    'Heading there this weekend', 'You always find the best spots'
  ];
BEGIN
  -- Find 8 breweries that have at least 3 beers
  SELECT array_agg(sub.id) INTO brewery_ids
  FROM (
    SELECT b.brewery_id AS id
    FROM beers b
    WHERE b.brewery_id IS NOT NULL
    GROUP BY b.brewery_id
    HAVING count(*) >= 3
    ORDER BY random()
    LIMIT 8
  ) sub;

  IF array_length(brewery_ids, 1) IS NULL OR array_length(brewery_ids, 1) < 3 THEN
    RAISE NOTICE 'Not enough breweries with beers — need at least 3, skipping seed';
    RETURN;
  END IF;

  RAISE NOTICE 'Selected % breweries for diverse seeding', array_length(brewery_ids, 1);

  -- ─── Step 2: Generate 60 days of sessions ────────────────────────────────
  FOR d IN 1..60 LOOP
    day_offset := 60 - d; -- days ago (60 = oldest, 1 = most recent)

    -- Each day: 8-15 users have sessions (not all 40 every day)
    FOR u IN 1..40 LOOP
      -- Each user has a ~35% chance of a session on any given day
      IF random() > 0.35 THEN
        CONTINUE;
      END IF;

      uid := _test_uid(u);

      -- User behavior: users 1-10 prefer brewery 1-2, 11-20 prefer 3-4, etc.
      -- But with 20% chance of exploring a different brewery
      IF random() < 0.8 THEN
        bid := brewery_ids[1 + ((u - 1) / 5) % array_length(brewery_ids, 1)];
      ELSE
        bid := brewery_ids[1 + floor(random() * array_length(brewery_ids, 1))::int];
      END IF;

      -- Session timing: varied hours
      session_start := (now() - (day_offset || ' days')::interval)
        + ((11 + floor(random() * 10))::int || ' hours')::interval
        + (floor(random() * 60)::int || ' minutes')::interval;
      session_end := session_start + ((45 + floor(random() * 135))::int || ' minutes')::interval;

      -- Don't create future sessions
      IF session_start > now() THEN
        CONTINUE;
      END IF;

      session_id := gen_random_uuid();

      INSERT INTO sessions (id, user_id, brewery_id, context, started_at, ended_at, is_active, share_to_feed, xp_awarded)
      VALUES (
        session_id, uid, bid, 'brewery',
        session_start, session_end, false,
        random() > 0.1,  -- 90% share to feed
        15 + floor(random() * 45)::int
      ) ON CONFLICT DO NOTHING;

      -- Beer logs: 1-4 beers per session
      beers_per_session := 1 + floor(random() * 4)::int;

      -- Get random beers from this brewery
      SELECT array_agg(sub.id) INTO beer_ids
      FROM (
        SELECT id FROM beers WHERE brewery_id = bid ORDER BY random() LIMIT beers_per_session
      ) sub;

      IF beer_ids IS NOT NULL THEN
        log_time := session_start + interval '10 minutes';

        FOR b IN 1..array_length(beer_ids, 1) LOOP
          v_beer_id := beer_ids[b];

          -- 70% leave a rating
          IF random() < 0.7 THEN
            v_rating := 2.5 + (random() * 2.5);
            v_rating := round(v_rating * 2) / 2; -- snap to 0.5
          ELSE
            v_rating := NULL;
          END IF;

          INSERT INTO beer_logs (id, session_id, user_id, beer_id, brewery_id, quantity, rating, serving_style, logged_at)
          VALUES (
            gen_random_uuid(), session_id, uid, v_beer_id, bid, 1,
            v_rating,
            (ARRAY['pint', 'tulip', 'snifter', 'goblet', 'taster'])[1 + floor(random() * 5)::int],
            log_time
          ) ON CONFLICT DO NOTHING;

          log_time := log_time + ((20 + floor(random() * 40))::int || ' minutes')::interval;

          -- 12% chance of a beer review
          IF random() < 0.12 AND v_rating IS NOT NULL THEN
            INSERT INTO beer_reviews (user_id, beer_id, rating, comment)
            VALUES (uid, v_beer_id, v_rating,
              (ARRAY[
                'Solid pour, would order again',
                'Not my style but well made',
                'Incredible hop profile!',
                'Perfect session beer',
                'One of the best I''ve had this year',
                'A bit too bitter for me',
                'Great balance of malt and hops',
                'Really smooth finish',
                'Complex flavor, love it',
                'Nice and crushable'
              ])[1 + floor(random() * 10)::int]
            ) ON CONFLICT (user_id, beer_id) DO NOTHING;
          END IF;
        END LOOP;
      END IF;

      -- 8% chance of a brewery review
      IF random() < 0.08 THEN
        INSERT INTO brewery_reviews (user_id, brewery_id, rating, comment)
        VALUES (uid, bid,
          3.5 + (random() * 1.5),
          (ARRAY[
            'Great atmosphere and friendly staff',
            'Love the tap selection here',
            'Cozy spot, will be back',
            'Best brewery in the area',
            'Good beers but gets crowded on weekends',
            'Amazing outdoor seating area',
            'The food menu pairs well with their beers',
            'Always something new on tap'
          ])[1 + floor(random() * 8)::int]
        ) ON CONFLICT (user_id, brewery_id) DO NOTHING;
      END IF;

      -- 15% chance of a session comment from a friend
      IF random() < 0.15 THEN
        reactor_num := 1 + floor(random() * 40)::int;
        IF reactor_num != u THEN
          INSERT INTO session_comments (id, user_id, session_id, body, created_at)
          VALUES (
            gen_random_uuid(),
            _test_uid(reactor_num),
            session_id,
            comment_texts[1 + floor(random() * array_length(comment_texts, 1))::int],
            session_end + ((5 + floor(random() * 120))::int || ' minutes')::interval
          ) ON CONFLICT DO NOTHING;
        END IF;
      END IF;

      -- 20% chance of a reaction from a friend
      IF random() < 0.20 THEN
        reactor_num := 1 + floor(random() * 40)::int;
        IF reactor_num != u THEN
          INSERT INTO reactions (id, user_id, session_id, type)
          VALUES (
            gen_random_uuid(),
            _test_uid(reactor_num),
            session_id,
            (ARRAY['thumbs_up', 'flame', 'beer'])[1 + floor(random() * 3)::int]
          ) ON CONFLICT DO NOTHING;
        END IF;
      END IF;

    END LOOP; -- users
  END LOOP; -- days

  RAISE NOTICE 'Diverse activity seed complete — 60 days across % breweries', array_length(brewery_ids, 1);
END $$;

-- ─── Step 3: Add wishlist items for variety ──────────────────────────────────
INSERT INTO wishlist (id, user_id, beer_id, note, created_at)
SELECT
  gen_random_uuid(),
  _test_uid(u),
  b.id,
  CASE WHEN random() > 0.5 THEN 'Want to try this!' ELSE NULL END,
  now() - (floor(random() * 30)::int || ' days')::interval
FROM generate_series(1, 30) u  -- first 30 users get wishlists
CROSS JOIN LATERAL (
  SELECT id FROM beers ORDER BY random() LIMIT 2 + floor(random() * 4)::int
) b
ON CONFLICT DO NOTHING;

-- ─── Step 4: Brewery follows for variety ─────────────────────────────────────
INSERT INTO brewery_follows (user_id, brewery_id, created_at)
SELECT
  _test_uid(u),
  b.id,
  now() - (floor(random() * 60)::int || ' days')::interval
FROM generate_series(1, 40) u
CROSS JOIN LATERAL (
  SELECT id FROM breweries WHERE city IS NOT NULL ORDER BY random() LIMIT 3 + (u % 4)
) b
ON CONFLICT DO NOTHING;

-- ─── Cleanup helper function ─────────────────────────────────────────────────
DROP FUNCTION IF EXISTS _test_uid(int);
