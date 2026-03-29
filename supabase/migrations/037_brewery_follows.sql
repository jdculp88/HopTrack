-- Migration 037: Brewery Follows + Session Photos
-- Sprint 32 — The Vibe

-- ─── Brewery Follows ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brewery_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brewery_id uuid NOT NULL REFERENCES breweries(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, brewery_id)
);

CREATE INDEX idx_brewery_follows_user ON brewery_follows(user_id);
CREATE INDEX idx_brewery_follows_brewery ON brewery_follows(brewery_id);

-- RLS
ALTER TABLE brewery_follows ENABLE ROW LEVEL SECURITY;

-- Anyone can see follow counts
CREATE POLICY "brewery_follows_select" ON brewery_follows
  FOR SELECT USING (true);

-- Users can follow/unfollow
CREATE POLICY "brewery_follows_insert" ON brewery_follows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "brewery_follows_delete" ON brewery_follows
  FOR DELETE USING (auth.uid() = user_id);

-- ─── Session Photos ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS session_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_session_photos_session ON session_photos(session_id);

ALTER TABLE session_photos ENABLE ROW LEVEL SECURITY;

-- Anyone can see session photos (feed visibility)
CREATE POLICY "session_photos_select" ON session_photos
  FOR SELECT USING (true);

-- Users can add photos to their own sessions
CREATE POLICY "session_photos_insert" ON session_photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own photos
CREATE POLICY "session_photos_delete" ON session_photos
  FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket for session photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('session-photos', 'session-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: users can upload to their own folder
CREATE POLICY "session_photos_storage_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'session-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "session_photos_storage_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'session-photos');

CREATE POLICY "session_photos_storage_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'session-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
