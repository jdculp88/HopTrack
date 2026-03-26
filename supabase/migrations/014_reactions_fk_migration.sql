-- ============================================================================
-- Migration 014: Reactions FK migration — sessions/beer_logs
-- Sprint 14 (S14-003) — PLANNED, do NOT apply until Sprint 15
-- ============================================================================
-- The reactions table currently FK's to checkins.id. Before we can drop
-- checkins (Sprint 15), reactions need to point at sessions + beer_logs.
--
-- Strategy:
--   1. Add session_id + beer_log_id nullable columns
--   2. Backfill from checkins → sessions/beer_logs mapping
--   3. Drop old checkin_id FK
--   4. Make session_id NOT NULL
-- ============================================================================

-- Step 1: Add new FK columns
ALTER TABLE reactions
  ADD COLUMN session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  ADD COLUMN beer_log_id UUID REFERENCES beer_logs(id) ON DELETE CASCADE;

-- Step 2: Backfill — map checkin reactions to their equivalent session
-- Each checkin maps to a session via user_id + brewery_id + time proximity.
-- Since checkins were 1:1 beer:checkin, we match to the beer_log that shares
-- the same beer_id within the user's session at that brewery.
UPDATE reactions r
SET session_id = s.id,
    beer_log_id = bl.id
FROM checkins c
JOIN sessions s ON s.user_id = c.user_id
  AND s.brewery_id = c.brewery_id
  AND s.started_at <= c.created_at
  AND (s.ended_at IS NULL OR s.ended_at >= c.created_at)
JOIN beer_logs bl ON bl.session_id = s.id
  AND bl.beer_id = c.beer_id
WHERE r.checkin_id = c.id;

-- Step 2b: For any reactions that couldn't be mapped (orphaned), assign to
-- the user's most recent session at that brewery as a fallback
UPDATE reactions r
SET session_id = (
  SELECT s.id FROM sessions s
  JOIN checkins c ON c.id = r.checkin_id
  WHERE s.user_id = c.user_id
    AND s.brewery_id = c.brewery_id
  ORDER BY s.started_at DESC
  LIMIT 1
)
WHERE r.session_id IS NULL
  AND r.checkin_id IS NOT NULL;

-- Step 3: Drop old FK (only after verifying backfill succeeded)
-- ALTER TABLE reactions DROP COLUMN checkin_id;

-- Step 4: Make session_id required (only after backfill verified)
-- ALTER TABLE reactions ALTER COLUMN session_id SET NOT NULL;

-- Step 5: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_reactions_session_id ON reactions(session_id);
CREATE INDEX IF NOT EXISTS idx_reactions_beer_log_id ON reactions(beer_log_id);

-- Step 6: Update RLS policies if needed
-- (reactions RLS currently uses user_id, which doesn't change)
