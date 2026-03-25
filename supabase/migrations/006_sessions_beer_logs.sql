-- 006_sessions_beer_logs.sql
-- Sessions & Beer Logs — REQ-025
-- A session = a brewery visit. beer_logs = individual beers within a session.
-- Legacy checkins table is preserved for backward compatibility.

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  brewery_id    text NOT NULL,
  started_at    timestamptz NOT NULL DEFAULT now(),
  ended_at      timestamptz,
  is_active     boolean NOT NULL DEFAULT true,
  share_to_feed boolean NOT NULL DEFAULT true,
  note          text,
  xp_awarded    integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Beer logs table (individual beers within a session)
CREATE TABLE IF NOT EXISTS beer_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  beer_id       text,
  brewery_id    text NOT NULL,
  rating        numeric(2,1),
  flavor_tags   text[],
  serving_style text,
  comment       text,
  photo_url     text,
  logged_at     timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_brewery_id_idx ON sessions(brewery_id);
CREATE INDEX IF NOT EXISTS sessions_is_active_idx ON sessions(is_active);
CREATE INDEX IF NOT EXISTS sessions_created_at_idx ON sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS beer_logs_session_id_idx ON beer_logs(session_id);
CREATE INDEX IF NOT EXISTS beer_logs_user_id_idx ON beer_logs(user_id);
CREATE INDEX IF NOT EXISTS beer_logs_beer_id_idx ON beer_logs(beer_id);
CREATE INDEX IF NOT EXISTS beer_logs_brewery_id_idx ON beer_logs(brewery_id);
CREATE INDEX IF NOT EXISTS beer_logs_logged_at_idx ON beer_logs(logged_at DESC);

-- RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE beer_logs ENABLE ROW LEVEL SECURITY;

-- Sessions RLS: users can read/write their own sessions
CREATE POLICY "Users can view own sessions" ON sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Beer logs RLS: users can read/write their own logs
CREATE POLICY "Users can view own beer logs" ON beer_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own beer logs" ON beer_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own beer logs" ON beer_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own beer logs" ON beer_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Public read for feed: sessions marked share_to_feed = true are visible to all authenticated users
CREATE POLICY "Authenticated users can view shared sessions" ON sessions
  FOR SELECT USING (auth.role() = 'authenticated' AND share_to_feed = true);

-- Public read for beer logs in shared sessions
CREATE POLICY "Authenticated users can view beer logs in shared sessions" ON beer_logs
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM sessions s WHERE s.id = beer_logs.session_id AND s.share_to_feed = true
    )
  );
