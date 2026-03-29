-- ============================================================================
-- Migration 035: Fix constraints and policies
-- Sprint 30 Session 2 (S30-014)
-- ============================================================================
-- 1. Reactions: unique constraint on (user_id, session_id, type)
-- 2. beer_logs.beer_id: text → uuid with FK to beers (same pattern as 033)
-- 3. push_subscriptions: UPDATE policy (re-subscribe was blocked)
-- ============================================================================

-- ── 1. Reactions unique constraint ──────────────────────────────────────────
-- Prevent duplicate reactions on the same session by the same user.
-- Lost when checkins were dropped in S16 — the old constraint was on checkin_id.

-- Deduplicate first: keep only the earliest reaction per (user_id, session_id, type)
DELETE FROM reactions
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, session_id, type) id
  FROM reactions
  ORDER BY user_id, session_id, type, created_at ASC
);

ALTER TABLE reactions
ADD CONSTRAINT reactions_user_session_type_unique
UNIQUE(user_id, session_id, type);

-- ── 2. beer_logs.beer_id: text → uuid with FK to beers ─────────────────────
-- Same pattern as migration 033 (sessions.brewery_id text→uuid).
-- Null out any invalid beer_ids that can't cast to uuid BEFORE altering type.

-- Drop the index first (it's on the text column)
DROP INDEX IF EXISTS beer_logs_beer_id_idx;

-- Null out non-UUID values
UPDATE beer_logs SET beer_id = NULL
WHERE beer_id IS NOT NULL
AND beer_id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Cast column to uuid
ALTER TABLE beer_logs
ALTER COLUMN beer_id TYPE uuid USING beer_id::uuid;

-- Null out any UUIDs that don't exist in the beers table
UPDATE beer_logs
SET beer_id = NULL
WHERE beer_id IS NOT NULL
AND beer_id NOT IN (SELECT id FROM beers);

-- Add FK constraint
ALTER TABLE beer_logs
ADD CONSTRAINT beer_logs_beer_id_fkey
FOREIGN KEY (beer_id) REFERENCES beers(id) ON DELETE SET NULL;

-- Recreate index on the uuid column
CREATE INDEX IF NOT EXISTS beer_logs_beer_id_idx ON beer_logs(beer_id);

-- ── 3. push_subscriptions UPDATE policy ─────────────────────────────────────
-- Users need to update their own push subscriptions (e.g., re-subscribe after
-- token refresh). Without this, re-subscribe attempts were silently blocked.
CREATE POLICY "Users can update own push subscriptions"
ON push_subscriptions FOR UPDATE
USING (auth.uid() = user_id);
