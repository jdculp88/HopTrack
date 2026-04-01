-- Migration 060: Sponsored Challenges
-- Sprint 91 — The Spotlight
-- Extends challenges table with sponsorship columns for discovery beyond brewery pages

-- Add sponsored columns to challenges table
ALTER TABLE challenges ADD COLUMN is_sponsored boolean NOT NULL DEFAULT false;
ALTER TABLE challenges ADD COLUMN cover_image_url text;
ALTER TABLE challenges ADD COLUMN geo_radius_km integer DEFAULT 50;
ALTER TABLE challenges ADD COLUMN impressions integer NOT NULL DEFAULT 0;
ALTER TABLE challenges ADD COLUMN joins_from_discovery integer NOT NULL DEFAULT 0;

-- Index for fast sponsored challenge lookups
CREATE INDEX challenges_sponsored_active_idx ON challenges(is_sponsored, is_active) WHERE is_sponsored = true AND is_active = true;

-- RLS: Anyone can read sponsored active challenges (cross-brewery discovery)
CREATE POLICY "challenges_select_sponsored_public"
  ON challenges FOR SELECT
  USING (is_sponsored = true AND is_active = true);

-- Function: atomic impression increment (avoids race conditions)
CREATE OR REPLACE FUNCTION increment_challenge_impressions(challenge_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE challenges
  SET impressions = impressions + 1
  WHERE id = challenge_id
    AND is_sponsored = true
    AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: atomic discovery join increment
CREATE OR REPLACE FUNCTION increment_challenge_discovery_joins(challenge_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE challenges
  SET joins_from_discovery = joins_from_discovery + 1
  WHERE id = challenge_id
    AND is_sponsored = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
