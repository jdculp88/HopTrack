-- Migration 083: Fix Pint & Pixel brand tier + loyalty seed (Sprint 126)
-- Bug 1: brewery_brands.subscription_tier was 'free' (default) even though
--         individual locations are on barrel/cask tiers.
-- Bug 2: Migration 082 seed used slug 'pint-pixel' but brand was created with 'pint-and-pixel'.

-- ─── Fix 1: Upgrade Pint & Pixel brand to barrel tier ──────────────────────
UPDATE brewery_brands
SET subscription_tier = 'barrel'
WHERE slug = 'pint-and-pixel';

-- ─── Fix 2: Seed brand loyalty program (missed due to slug mismatch) ───────
DO $$
DECLARE
  v_brand_id uuid;
  v_program_id uuid;
  v_user_ids uuid[];
  v_brewery_ids uuid[];
  v_user uuid;
  v_random_stamps int;
BEGIN
  -- Get Pint & Pixel brand (correct slug)
  SELECT id INTO v_brand_id FROM brewery_brands WHERE slug = 'pint-and-pixel';
  IF v_brand_id IS NULL THEN RETURN; END IF;

  -- Check if program already exists (idempotent)
  SELECT id INTO v_program_id FROM brand_loyalty_programs WHERE brand_id = v_brand_id AND is_active = true;
  IF v_program_id IS NOT NULL THEN RETURN; END IF;

  -- Create brand loyalty program
  INSERT INTO brand_loyalty_programs (brand_id, name, description, stamps_required, reward_description, earn_per_session)
  VALUES (
    v_brand_id,
    'Pint & Pixel Passport',
    'Earn stamps at any Pint & Pixel location. Redeem your reward at any of our taprooms!',
    10,
    'Free pint at any Pint & Pixel',
    1
  )
  RETURNING id INTO v_program_id;

  -- Get brand brewery IDs
  SELECT array_agg(id) INTO v_brewery_ids
  FROM breweries WHERE brand_id = v_brand_id;

  -- Get test users who have sessions at brand locations
  SELECT array_agg(DISTINCT s.user_id) INTO v_user_ids
  FROM sessions s
  WHERE s.brewery_id = ANY(v_brewery_ids)
  AND s.user_id IS NOT NULL
  LIMIT 8;

  IF v_user_ids IS NULL THEN RETURN; END IF;

  -- Create loyalty cards for test users with varied stamp counts
  FOREACH v_user IN ARRAY v_user_ids LOOP
    v_random_stamps := floor(random() * 9 + 1)::int;
    INSERT INTO brand_loyalty_cards (user_id, brand_id, program_id, stamps, lifetime_stamps, last_stamp_brewery_id, last_stamp_at)
    VALUES (
      v_user,
      v_brand_id,
      v_program_id,
      v_random_stamps,
      v_random_stamps + floor(random() * 5)::int,
      v_brewery_ids[1 + floor(random() * array_length(v_brewery_ids, 1))::int],
      now() - (floor(random() * 7) || ' days')::interval
    )
    ON CONFLICT (user_id, brand_id) DO NOTHING;
  END LOOP;
END $$;

-- ─── Notify PostgREST to reload schema cache ────────────────────────────────
NOTIFY pgrst, 'reload schema';
