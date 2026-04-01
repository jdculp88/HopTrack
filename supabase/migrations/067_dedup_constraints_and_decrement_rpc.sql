-- Migration 067: Deduplication constraints + decrement_checkins RPC
-- Sprint 98 — The Sweep
-- BL-001: Prevent duplicate beers/breweries at DB level
-- S96 action item: Add decrement_checkins RPC for cancel session

-- ============================================================
-- BL-001: Deduplication constraints
-- ============================================================

-- First, clean up any existing duplicates (keep oldest by created_at)
-- Beers: deduplicate on (brewery_id, LOWER(TRIM(name)))
DELETE FROM beers
WHERE id IN (
  SELECT id FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY brewery_id, LOWER(TRIM(name))
        ORDER BY created_at ASC
      ) AS rn
    FROM beers
  ) dupes
  WHERE rn > 1
);

-- Breweries: deduplicate on (LOWER(TRIM(name)), LOWER(TRIM(city)), LOWER(TRIM(state)))
-- Keep the one with verified = true first, then oldest by created_at
DELETE FROM breweries
WHERE id IN (
  SELECT id FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY LOWER(TRIM(name)), LOWER(TRIM(COALESCE(city, ''))), LOWER(TRIM(COALESCE(state, '')))
        ORDER BY verified DESC, created_at ASC
      ) AS rn
    FROM breweries
  ) dupes
  WHERE rn > 1
);

-- Add unique index for beers (case-insensitive, trimmed name per brewery)
CREATE UNIQUE INDEX IF NOT EXISTS idx_beers_unique_name_per_brewery
  ON beers (brewery_id, LOWER(TRIM(name)))
  WHERE is_active = true;

-- Add unique index for breweries (case-insensitive name + city + state)
CREATE UNIQUE INDEX IF NOT EXISTS idx_breweries_unique_name_location
  ON breweries (LOWER(TRIM(name)), LOWER(TRIM(COALESCE(city, ''))), LOWER(TRIM(COALESCE(state, ''))));

-- ============================================================
-- S96 action: decrement_checkins RPC
-- ============================================================

CREATE OR REPLACE FUNCTION decrement_checkins(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_count integer;
BEGIN
  UPDATE profiles
  SET total_checkins = GREATEST(0, total_checkins - 1)
  WHERE id = p_user_id
  RETURNING total_checkins INTO v_new_count;

  RETURN jsonb_build_object('total_checkins', COALESCE(v_new_count, 0));
END;
$$;

GRANT EXECUTE ON FUNCTION decrement_checkins TO authenticated;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
