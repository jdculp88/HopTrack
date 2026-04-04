-- Sprint 157: Streak Freeze System
-- Adds streak freeze mechanic to encourage daily engagement
-- Freezes are earned at 7-day streak milestones (max 3 stored)
-- Auto-consumed when a streak would otherwise break

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS streak_freezes_available integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS streak_freeze_used_at timestamptz;

-- Ensure freezes never exceed max cap
ALTER TABLE profiles
  ADD CONSTRAINT streak_freezes_max CHECK (streak_freezes_available >= 0 AND streak_freezes_available <= 3);

COMMENT ON COLUMN profiles.streak_freezes_available IS 'Number of streak freezes available (earned at 7-day milestones, max 3)';
COMMENT ON COLUMN profiles.streak_freeze_used_at IS 'Last time a streak freeze was consumed';
