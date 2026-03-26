-- 007_home_sessions_quantity.sql
-- Home sessions (no brewery context) + per-beer quantity tracking

-- Allow sessions without a brewery (home drinking path)
ALTER TABLE sessions ALTER COLUMN brewery_id DROP NOT NULL;

-- Track whether a session is at a brewery or at home
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS context text NOT NULL DEFAULT 'brewery'
  CHECK (context IN ('brewery', 'home'));

-- Allow beer logs without a brewery (home sessions)
ALTER TABLE beer_logs ALTER COLUMN brewery_id DROP NOT NULL;

-- Track how many of a given beer were had in one log entry
ALTER TABLE beer_logs ADD COLUMN IF NOT EXISTS quantity integer NOT NULL DEFAULT 1;

-- Index for context queries
CREATE INDEX IF NOT EXISTS sessions_context_idx ON sessions(context);
