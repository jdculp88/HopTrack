-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 001: Brewery Accounts & Claims
-- Run this in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Brewery accounts: links a user to a brewery with a role
CREATE TABLE IF NOT EXISTS brewery_accounts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brewery_id      uuid NOT NULL REFERENCES breweries(id) ON DELETE CASCADE,
  role            text NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'manager', 'staff')),
  verified        boolean NOT NULL DEFAULT false,
  verified_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, brewery_id)
);

-- Brewery claims: verification queue
CREATE TABLE IF NOT EXISTS brewery_claims (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brewery_id      uuid NOT NULL REFERENCES breweries(id) ON DELETE CASCADE,
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  business_email  text,
  notes           text,
  reviewed_by     uuid REFERENCES auth.users(id),
  reviewed_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Loyalty programs
CREATE TABLE IF NOT EXISTS loyalty_programs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brewery_id      uuid NOT NULL REFERENCES breweries(id) ON DELETE CASCADE,
  name            text NOT NULL DEFAULT 'Loyalty Program',
  description     text,
  stamps_required int NOT NULL DEFAULT 10,
  reward_description text NOT NULL DEFAULT 'Free pint',
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Loyalty cards: one per user per brewery
CREATE TABLE IF NOT EXISTS loyalty_cards (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brewery_id      uuid NOT NULL REFERENCES breweries(id) ON DELETE CASCADE,
  program_id      uuid REFERENCES loyalty_programs(id) ON DELETE SET NULL,
  stamps          int NOT NULL DEFAULT 0,
  lifetime_stamps int NOT NULL DEFAULT 0,
  last_stamp_at   timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, brewery_id)
);

-- Promotions: brewery-created discount offers
CREATE TABLE IF NOT EXISTS promotions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brewery_id      uuid NOT NULL REFERENCES breweries(id) ON DELETE CASCADE,
  beer_id         uuid REFERENCES beers(id) ON DELETE SET NULL,
  title           text NOT NULL,
  description     text,
  discount_type   text NOT NULL CHECK (discount_type IN ('percent', 'fixed', 'bogo', 'free_item')),
  discount_value  numeric,
  starts_at       timestamptz NOT NULL DEFAULT now(),
  ends_at         timestamptz,
  redemption_limit int,
  redemptions_count int NOT NULL DEFAULT 0,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Add is_domestic flag to beers
ALTER TABLE beers ADD COLUMN IF NOT EXISTS is_domestic boolean NOT NULL DEFAULT false;

-- Add is_active flag to beers (for tap list management)
ALTER TABLE beers ADD COLUMN IF NOT EXISTS is_on_tap boolean NOT NULL DEFAULT true;

-- Add cover_image_url to breweries if not present
ALTER TABLE breweries ADD COLUMN IF NOT EXISTS cover_image_url text;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_brewery_accounts_user ON brewery_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_brewery_accounts_brewery ON brewery_accounts(brewery_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_cards_user ON loyalty_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_cards_brewery ON loyalty_cards(brewery_id);
CREATE INDEX IF NOT EXISTS idx_promotions_brewery ON promotions(brewery_id);

-- RLS
ALTER TABLE brewery_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE brewery_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Brewery accounts policies
CREATE POLICY "brewery_accounts_select" ON brewery_accounts FOR SELECT USING (true);
CREATE POLICY "brewery_accounts_insert" ON brewery_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "brewery_accounts_update" ON brewery_accounts FOR UPDATE USING (auth.uid() = user_id);

-- Brewery claims policies
CREATE POLICY "brewery_claims_select" ON brewery_claims FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "brewery_claims_insert" ON brewery_claims FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Loyalty programs — breweries can manage their own
CREATE POLICY "loyalty_programs_select" ON loyalty_programs FOR SELECT USING (true);
CREATE POLICY "loyalty_programs_manage" ON loyalty_programs FOR ALL USING (
  EXISTS (SELECT 1 FROM brewery_accounts WHERE brewery_id = loyalty_programs.brewery_id AND user_id = auth.uid())
);

-- Loyalty cards — users see their own
CREATE POLICY "loyalty_cards_select" ON loyalty_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "loyalty_cards_insert" ON loyalty_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "loyalty_cards_update" ON loyalty_cards FOR UPDATE USING (auth.uid() = user_id);

-- Promotions — public read, brewery admin write
CREATE POLICY "promotions_select" ON promotions FOR SELECT USING (true);
CREATE POLICY "promotions_manage" ON promotions FOR ALL USING (
  EXISTS (SELECT 1 FROM brewery_accounts WHERE brewery_id = promotions.brewery_id AND user_id = auth.uid())
);
