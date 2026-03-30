-- ─────────────────────────────────────────────────────────────────────────────
-- Seed 013: Brewery Reviews Feed — Friend brewery reviews for BreweryRatingFeedCard
--
-- Inserts 10 brewery reviews from Josh's friends, spread across the past week,
-- so the new BreweryRatingFeedCard shows up in the Friends tab.
--
-- Run AFTER seeds 001–012.
-- Safe to re-run (ON CONFLICT DO UPDATE throughout).
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  -- Friend UUIDs
  u01 uuid := 'cc000000-0000-0000-0000-000000000001'; -- Alex Chen
  u02 uuid := 'cc000000-0000-0000-0000-000000000002'; -- Marcus Johnson
  u03 uuid := 'cc000000-0000-0000-0000-000000000003'; -- Priya Patel
  u04 uuid := 'cc000000-0000-0000-0000-000000000004'; -- Derek Walsh
  u05 uuid := 'cc000000-0000-0000-0000-000000000005'; -- Sam Rivera
  u07 uuid := 'cc000000-0000-0000-0000-000000000007'; -- Tom Nguyen
  u09 uuid := 'cc000000-0000-0000-0000-000000000009'; -- Carlos Mendez
  u10 uuid := 'cc000000-0000-0000-0000-000000000010'; -- Rachel Foster

  -- Brewery IDs
  brew_mtn uuid := 'dd000001-0000-0000-0000-000000000001'; -- Mountain Ridge Brewing
  brew_riv uuid := 'dd000001-0000-0000-0000-000000000002'; -- River Bend Ales
  brew_smk uuid := 'dd000001-0000-0000-0000-000000000003'; -- Smoky Barrel Craft Co.
  hf_id    uuid := 'c3d4e5f6-a7b8-9012-cdef-012345678902'; -- Hopfield Brewing
  lc_id    uuid := 'd4e5f6a7-b8c9-0123-defa-123456789003'; -- Lucky Clover Brewing

BEGIN

  -- Alex → Mountain Ridge (5 stars, effusive)
  INSERT INTO brewery_reviews (user_id, brewery_id, rating, comment, created_at)
  VALUES (
    u01, brew_mtn, 5,
    'Absolutely top-tier tap room. The Ridgeline IPA was perfect and the view from the patio is unreal.',
    now() - interval '6 hours'
  )
  ON CONFLICT (user_id, brewery_id) DO UPDATE
    SET rating  = EXCLUDED.rating,
        comment = EXCLUDED.comment;

  -- Marcus → Hopfield Brewing (4 stars)
  INSERT INTO brewery_reviews (user_id, brewery_id, rating, comment, created_at)
  VALUES (
    u02, hf_id, 4,
    'Great hazy selection and the staff really knows their stuff. Will be back.',
    now() - interval '14 hours'
  )
  ON CONFLICT (user_id, brewery_id) DO UPDATE
    SET rating  = EXCLUDED.rating,
        comment = EXCLUDED.comment;

  -- Priya → River Bend Ales (5 stars)
  INSERT INTO brewery_reviews (user_id, brewery_id, rating, comment, created_at)
  VALUES (
    u03, brew_riv, 5,
    'The Belgian is transcendent. Cozy space with excellent lighting — highly recommend.',
    now() - interval '1 day'
  )
  ON CONFLICT (user_id, brewery_id) DO UPDATE
    SET rating  = EXCLUDED.rating,
        comment = EXCLUDED.comment;

  -- Derek → Smoky Barrel (3 stars)
  INSERT INTO brewery_reviews (user_id, brewery_id, rating, comment, created_at)
  VALUES (
    u04, brew_smk, 3,
    'Good stout options but it was crowded on a Friday night. Bar service was slow.',
    now() - interval '2 days'
  )
  ON CONFLICT (user_id, brewery_id) DO UPDATE
    SET rating  = EXCLUDED.rating,
        comment = EXCLUDED.comment;

  -- Sam → Lucky Clover (4 stars)
  INSERT INTO brewery_reviews (user_id, brewery_id, rating, comment, created_at)
  VALUES (
    u05, lc_id, 4,
    'Fun neighborhood spot. The lager was crispy and the pretzel bites were dangerous.',
    now() - interval '2 days 4 hours'
  )
  ON CONFLICT (user_id, brewery_id) DO UPDATE
    SET rating  = EXCLUDED.rating,
        comment = EXCLUDED.comment;

  -- Tom → Mountain Ridge (4 stars, no comment)
  INSERT INTO brewery_reviews (user_id, brewery_id, rating, comment, created_at)
  VALUES (
    u07, brew_mtn, 4,
    NULL,
    now() - interval '3 days'
  )
  ON CONFLICT (user_id, brewery_id) DO UPDATE
    SET rating  = EXCLUDED.rating,
        comment = EXCLUDED.comment;

  -- Carlos → River Bend (5 stars)
  INSERT INTO brewery_reviews (user_id, brewery_id, rating, comment, created_at)
  VALUES (
    u09, brew_riv, 5,
    'Best brewery in Asheville hands down. Barrel Room Sour alone is worth the trip.',
    now() - interval '4 days'
  )
  ON CONFLICT (user_id, brewery_id) DO UPDATE
    SET rating  = EXCLUDED.rating,
        comment = EXCLUDED.comment;

  -- Rachel → Smoky Barrel (4 stars)
  INSERT INTO brewery_reviews (user_id, brewery_id, rating, comment, created_at)
  VALUES (
    u10, brew_smk, 4,
    'The Barrel-Aged Imperial Stout is serious. Solid date night spot.',
    now() - interval '5 days'
  )
  ON CONFLICT (user_id, brewery_id) DO UPDATE
    SET rating  = EXCLUDED.rating,
        comment = EXCLUDED.comment;

  -- Alex → Hopfield (3 stars)
  INSERT INTO brewery_reviews (user_id, brewery_id, rating, comment, created_at)
  VALUES (
    u01, hf_id, 3,
    'Hit or miss depending on the night. The hazy was good, the pale was forgettable.',
    now() - interval '5 days 8 hours'
  )
  ON CONFLICT (user_id, brewery_id) DO UPDATE
    SET rating  = EXCLUDED.rating,
        comment = EXCLUDED.comment;

  -- Marcus → Mountain Ridge (5 stars, no comment)
  INSERT INTO brewery_reviews (user_id, brewery_id, rating, comment, created_at)
  VALUES (
    u02, brew_mtn, 5,
    NULL,
    now() - interval '6 days'
  )
  ON CONFLICT (user_id, brewery_id) DO UPDATE
    SET rating  = EXCLUDED.rating,
        comment = EXCLUDED.comment;

  RAISE NOTICE 'Seed 013 complete — 10 brewery reviews inserted for BreweryRatingFeedCard demo';
END $$;
