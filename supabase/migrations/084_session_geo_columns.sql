-- Migration 084: Session Geolocation Columns (Sprint 126 — The Geo)
-- Captures user location at session start for future analytics (heatmap, distance insights)
-- Purely informational — no validation or enforcement

ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS session_latitude double precision,
  ADD COLUMN IF NOT EXISTS session_longitude double precision;

-- Sparse index — only rows with actual coordinates
CREATE INDEX IF NOT EXISTS idx_sessions_geo
  ON sessions (session_latitude, session_longitude)
  WHERE session_latitude IS NOT NULL AND session_longitude IS NOT NULL;

COMMENT ON COLUMN sessions.session_latitude IS 'User latitude at session start (optional, for analytics)';
COMMENT ON COLUMN sessions.session_longitude IS 'User longitude at session start (optional, for analytics)';
