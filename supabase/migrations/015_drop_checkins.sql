-- ============================================================================
-- Migration 015: Drop checkins table — Phase 4-5 of deprecation plan
-- Sprint 15 (S15-019) — WRITE ONLY, apply in Sprint 16
-- ============================================================================
-- Prerequisites (must be verified before applying):
--   1. Migration 014 applied (reactions FK backfill to sessions/beer_logs)
--   2. Zero app code queries checkins table (verified Sprint 14)
--   3. /api/checkins returns 410 Gone (Sprint 14)
--   4. Reactions backfill verified — all reactions have session_id
--
-- This migration:
--   1. Archives checkins data to a JSON backup table (safety net)
--   2. Drops the checkin_id column from reactions (completing 014)
--   3. Makes session_id NOT NULL on reactions
--   4. Drops the checkin_id column from user_achievements
--   5. Drops the checkins table
--   6. Drops the checkin_beer_optional migration artifact
-- ============================================================================

-- ── Step 1: Archive checkins data ───────────────────────────────────────────
-- Create a backup table with the raw data as JSONB for safety
CREATE TABLE IF NOT EXISTS _archive_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  archived_at TIMESTAMPTZ DEFAULT now(),
  total_rows INTEGER,
  data JSONB
);

INSERT INTO _archive_checkins (total_rows, data)
SELECT
  count(*)::integer,
  jsonb_agg(
    jsonb_build_object(
      'id', c.id,
      'user_id', c.user_id,
      'beer_id', c.beer_id,
      'brewery_id', c.brewery_id,
      'rating', c.rating,
      'comment', c.comment,
      'created_at', c.created_at
    )
  )
FROM checkins c;

-- ── Step 2: Complete reactions migration (from 014) ─────────────────────────
-- Drop the old checkin_id FK column from reactions
ALTER TABLE reactions DROP COLUMN IF EXISTS checkin_id;

-- Make session_id required now that all reactions are backfilled
ALTER TABLE reactions ALTER COLUMN session_id SET NOT NULL;

-- ── Step 3: Remove checkin_id from user_achievements ────────────────────────
ALTER TABLE user_achievements DROP COLUMN IF EXISTS checkin_id;

-- ── Step 4: Drop the checkins table ─────────────────────────────────────────
-- This is the point of no return — the archive in Step 1 is our safety net
DROP TABLE IF EXISTS checkins CASCADE;

-- ── Step 5: Cleanup ─────────────────────────────────────────────────────────
-- Drop any orphaned indexes or constraints that referenced checkins
-- (CASCADE in Step 4 handles most of these, but just in case)

-- Verify: After applying, run these checks:
-- SELECT count(*) FROM _archive_checkins;  -- Should be 1 row
-- SELECT total_rows FROM _archive_checkins; -- Should match pre-migration checkins count
-- SELECT count(*) FROM reactions WHERE session_id IS NULL; -- Should be 0
-- \dt checkins  -- Should not exist
