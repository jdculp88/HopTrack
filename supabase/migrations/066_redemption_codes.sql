-- Migration 066: Redemption codes for fraud prevention Phase 1
-- Sprint 96 — The Lockdown
-- Enables staff confirmation for loyalty reward and mug club perk redemptions

CREATE TABLE redemption_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(6) NOT NULL UNIQUE,
  type varchar(20) NOT NULL CHECK (type IN ('loyalty_reward', 'mug_club_perk')),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brewery_id uuid NOT NULL REFERENCES breweries(id) ON DELETE CASCADE,
  -- For loyalty rewards
  program_id uuid REFERENCES loyalty_programs(id) ON DELETE SET NULL,
  -- For mug club perks
  mug_club_id uuid REFERENCES mug_clubs(id) ON DELETE SET NULL,
  perk_index int,
  -- Status tracking
  status varchar(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'expired', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '5 minutes'),
  confirmed_at timestamptz,
  confirmed_by uuid REFERENCES auth.users(id)
);

-- Index for code lookups (staff confirmation flow)
CREATE INDEX idx_redemption_codes_code ON redemption_codes (code) WHERE status = 'pending';

-- Index for user's pending codes
CREATE INDEX idx_redemption_codes_user ON redemption_codes (user_id, status);

-- Index for brewery admin lookups
CREATE INDEX idx_redemption_codes_brewery ON redemption_codes (brewery_id, status);

-- RLS
ALTER TABLE redemption_codes ENABLE ROW LEVEL SECURITY;

-- Users can view and create their own codes
CREATE POLICY "Users can view own codes"
  ON redemption_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own codes"
  ON redemption_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Brewery admins can view codes for their brewery
CREATE POLICY "Brewery admins can view brewery codes"
  ON redemption_codes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM breweries
      WHERE breweries.id = redemption_codes.brewery_id
        AND breweries.owner_id = auth.uid()
    )
  );

-- Brewery admins can update codes for their brewery (confirm/expire)
CREATE POLICY "Brewery admins can update brewery codes"
  ON redemption_codes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM breweries
      WHERE breweries.id = redemption_codes.brewery_id
        AND breweries.owner_id = auth.uid()
    )
  );

-- Auto-expire old pending codes (cleanup function)
CREATE OR REPLACE FUNCTION expire_old_redemption_codes()
RETURNS void AS $$
BEGIN
  UPDATE redemption_codes
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
