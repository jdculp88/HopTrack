-- Migration 061: Brewery Ads — Ad Engine Foundation (F-028)
-- Sprint 93 — The Hardening
-- Geo-targeted, native-feeling ad cards in the consumer feed

CREATE TABLE IF NOT EXISTS brewery_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brewery_id UUID NOT NULL REFERENCES breweries(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) <= 100),
  body TEXT CHECK (char_length(body) <= 500),
  image_url TEXT,
  cta_url TEXT,
  cta_label TEXT DEFAULT 'Visit' CHECK (char_length(cta_label) <= 30),
  radius_km INTEGER NOT NULL DEFAULT 25 CHECK (radius_km BETWEEN 1 AND 200),
  budget_cents INTEGER NOT NULL DEFAULT 0 CHECK (budget_cents >= 0),
  spent_cents INTEGER NOT NULL DEFAULT 0 CHECK (spent_cents >= 0),
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  tier_required TEXT NOT NULL DEFAULT 'cask' CHECK (tier_required IN ('cask', 'barrel')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_brewery_ads_brewery ON brewery_ads(brewery_id);
CREATE INDEX idx_brewery_ads_active ON brewery_ads(is_active, starts_at, ends_at) WHERE is_active = true;

-- RLS
ALTER TABLE brewery_ads ENABLE ROW LEVEL SECURITY;

-- Brewery admins can CRUD their own ads
CREATE POLICY "brewery_admins_manage_ads" ON brewery_ads
  FOR ALL USING (
    brewery_id IN (
      SELECT ba.brewery_id FROM brewery_accounts ba
      WHERE ba.user_id = auth.uid()
      AND ba.role IN ('owner', 'manager')
    )
  );

-- All authenticated users can read active ads (for feed)
CREATE POLICY "users_read_active_ads" ON brewery_ads
  FOR SELECT USING (
    is_active = true
    AND starts_at <= now()
    AND (ends_at IS NULL OR ends_at > now())
  );

-- Superadmins can manage all ads
CREATE POLICY "superadmin_manage_ads" ON brewery_ads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.is_superadmin = true
    )
  );

-- RPC for atomic impression increment
CREATE OR REPLACE FUNCTION increment_ad_impressions(ad_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE brewery_ads SET impressions = impressions + 1 WHERE id = ad_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC for atomic click increment + spend tracking
CREATE OR REPLACE FUNCTION increment_ad_clicks(ad_id_param UUID, cost_per_click INTEGER DEFAULT 0)
RETURNS void AS $$
BEGIN
  UPDATE brewery_ads
  SET clicks = clicks + 1,
      spent_cents = spent_cents + cost_per_click
  WHERE id = ad_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Register in types/database.ts manually after migration
