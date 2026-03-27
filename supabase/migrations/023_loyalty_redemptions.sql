-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 023: Create loyalty_redemptions table
-- Tracks when users redeem loyalty card rewards.
-- Referenced by brewery loyalty dashboard (S17-016).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS loyalty_redemptions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id     uuid NOT NULL REFERENCES loyalty_cards(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brewery_id  uuid NOT NULL REFERENCES breweries(id) ON DELETE CASCADE,
  program_id  uuid REFERENCES loyalty_programs(id) ON DELETE SET NULL,
  redeemed_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE loyalty_redemptions ENABLE ROW LEVEL SECURITY;

-- Users can see their own redemptions
CREATE POLICY "Users can view own redemptions"
  ON loyalty_redemptions FOR SELECT
  USING (auth.uid() = user_id);

-- Brewery admins can view redemptions for their brewery
CREATE POLICY "Brewery admins can view brewery redemptions"
  ON loyalty_redemptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brewery_accounts
      WHERE brewery_accounts.brewery_id = loyalty_redemptions.brewery_id
        AND brewery_accounts.user_id = auth.uid()
    )
  );

-- Users can insert their own redemptions
CREATE POLICY "Users can create own redemptions"
  ON loyalty_redemptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
