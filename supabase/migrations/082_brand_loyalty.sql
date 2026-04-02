-- Migration 082: Brand-Wide Loyalty Programs (Sprint 125 — The Passport)
-- Enables unified loyalty across all locations under a brand

-- ─── Brand Loyalty Programs ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brand_loyalty_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES brewery_brands(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Brand Loyalty',
  description text,
  stamps_required int NOT NULL DEFAULT 10,
  reward_description text NOT NULL DEFAULT 'Free pint at any location',
  earn_per_session int NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- One active program per brand
CREATE UNIQUE INDEX idx_brand_loyalty_programs_active
  ON brand_loyalty_programs (brand_id)
  WHERE is_active = true;

CREATE INDEX idx_brand_loyalty_programs_brand
  ON brand_loyalty_programs (brand_id);

-- ─── Brand Loyalty Cards ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brand_loyalty_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id uuid NOT NULL REFERENCES brewery_brands(id) ON DELETE CASCADE,
  program_id uuid NOT NULL REFERENCES brand_loyalty_programs(id) ON DELETE CASCADE,
  stamps int NOT NULL DEFAULT 0,
  lifetime_stamps int NOT NULL DEFAULT 0,
  last_stamp_at timestamptz,
  last_stamp_brewery_id uuid REFERENCES breweries(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, brand_id)
);

CREATE INDEX idx_brand_loyalty_cards_brand ON brand_loyalty_cards (brand_id);
CREATE INDEX idx_brand_loyalty_cards_user ON brand_loyalty_cards (user_id);
CREATE INDEX idx_brand_loyalty_cards_program ON brand_loyalty_cards (program_id);

-- ─── Brand Loyalty Redemptions ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brand_loyalty_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL REFERENCES brand_loyalty_cards(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id uuid NOT NULL REFERENCES brewery_brands(id) ON DELETE CASCADE,
  brewery_id uuid NOT NULL REFERENCES breweries(id) ON DELETE CASCADE,
  program_id uuid NOT NULL REFERENCES brand_loyalty_programs(id) ON DELETE SET NULL,
  redeemed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_brand_loyalty_redemptions_brand ON brand_loyalty_redemptions (brand_id);
CREATE INDEX idx_brand_loyalty_redemptions_card ON brand_loyalty_redemptions (card_id);

-- ─── Add brand_id to redemption_codes for brand loyalty ─────────────────────
ALTER TABLE redemption_codes
  ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES brewery_brands(id) ON DELETE SET NULL;

-- Update type check to include brand_loyalty_reward
ALTER TABLE redemption_codes
  DROP CONSTRAINT IF EXISTS redemption_codes_type_check;

ALTER TABLE redemption_codes
  ADD CONSTRAINT redemption_codes_type_check
  CHECK (type IN ('loyalty_reward', 'mug_club_perk', 'promotion', 'brand_loyalty_reward'));

-- ─── RLS Policies ───────────────────────────────────────────────────────────

-- Brand Loyalty Programs: public read, brand owners/managers write
ALTER TABLE brand_loyalty_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active brand loyalty programs"
  ON brand_loyalty_programs FOR SELECT
  USING (true);

CREATE POLICY "Brand owners/managers can insert programs"
  ON brand_loyalty_programs FOR INSERT
  WITH CHECK (is_brand_manager_or_owner(brand_id));

CREATE POLICY "Brand owners/managers can update programs"
  ON brand_loyalty_programs FOR UPDATE
  USING (is_brand_manager_or_owner(brand_id));

CREATE POLICY "Brand owners/managers can delete programs"
  ON brand_loyalty_programs FOR DELETE
  USING (is_brand_manager_or_owner(brand_id));

-- Brand Loyalty Cards: users see own, brand owners/managers see all
ALTER TABLE brand_loyalty_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own brand loyalty cards"
  ON brand_loyalty_cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Brand owners/managers can view all cards"
  ON brand_loyalty_cards FOR SELECT
  USING (is_brand_manager_or_owner(brand_id));

CREATE POLICY "System can insert brand loyalty cards"
  ON brand_loyalty_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update own brand loyalty cards"
  ON brand_loyalty_cards FOR UPDATE
  USING (auth.uid() = user_id);

-- Brand admins can also update cards (for stamp management)
CREATE POLICY "Brand owners/managers can update cards"
  ON brand_loyalty_cards FOR UPDATE
  USING (is_brand_manager_or_owner(brand_id));

-- Brand Loyalty Redemptions: users see own, brand owners/managers see all
ALTER TABLE brand_loyalty_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own brand redemptions"
  ON brand_loyalty_redemptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Brand owners/managers can view all redemptions"
  ON brand_loyalty_redemptions FOR SELECT
  USING (is_brand_manager_or_owner(brand_id));

CREATE POLICY "Users can insert own brand redemptions"
  ON brand_loyalty_redemptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ─── Seed: Pint & Pixel Brand Loyalty Program ──────────────────────────────
DO $$
DECLARE
  v_brand_id uuid;
  v_program_id uuid;
  v_user_ids uuid[];
  v_brewery_ids uuid[];
  v_user uuid;
  v_random_stamps int;
BEGIN
  -- Get Pint & Pixel brand
  SELECT id INTO v_brand_id FROM brewery_brands WHERE slug = 'pint-pixel';
  IF v_brand_id IS NULL THEN RETURN; END IF;

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
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_program_id;

  IF v_program_id IS NULL THEN RETURN; END IF;

  -- Get brand brewery IDs
  SELECT array_agg(id) INTO v_brewery_ids
  FROM breweries WHERE brand_id = v_brand_id;

  -- Get some test users who have sessions at brand locations
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
