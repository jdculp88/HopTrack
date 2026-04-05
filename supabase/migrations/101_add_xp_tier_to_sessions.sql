-- Migration 101: Add xp_tier column to sessions (Sprint 161 — The Vibe)
-- Variable XP rewards: tracks whether a session rolled normal/lucky/golden
-- Distribution: 94% normal (±20% variance), 5% lucky (2×), 1% golden (5×)
-- Enables analytics: "what % of sessions are golden?" + "avg XP per golden session"

ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS xp_tier VARCHAR(10) DEFAULT 'normal';

-- App-level validation enforces 'normal' | 'lucky' | 'golden'
-- Using VARCHAR over PostgreSQL enum to avoid future ALTER TYPE migrations
-- if we add more tiers (e.g. 'legendary', 'cursed') later.

COMMENT ON COLUMN sessions.xp_tier IS
  'XP tier rolled at session end: normal (94%), lucky (5%, 2×), golden (1%, 5×). Sprint 161.';

-- Index on xp_tier for analytics queries (rare events → small index)
CREATE INDEX IF NOT EXISTS idx_sessions_xp_tier
  ON sessions(xp_tier)
  WHERE xp_tier != 'normal';
