-- ============================================================================
-- Migration 016: Session comments
-- Sprint 16 (S16-006) — Social engagement on sessions
-- ============================================================================
-- Allows authenticated users to comment on shared sessions in the feed.
-- Flat comments (no threading), text only, 500 char max.
-- ============================================================================

-- ── Table ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS session_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_session_comments_session
  ON session_comments(session_id, created_at);

CREATE INDEX IF NOT EXISTS idx_session_comments_user
  ON session_comments(user_id);

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE session_comments ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read comments on shared sessions
CREATE POLICY "session_comments_select"
  ON session_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = session_comments.session_id
        AND s.share_to_feed = true
    )
  );

-- Users can insert their own comments
CREATE POLICY "session_comments_insert"
  ON session_comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own comments, OR the session owner can delete any comment
CREATE POLICY "session_comments_delete"
  ON session_comments FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = session_comments.session_id
        AND s.user_id = auth.uid()
    )
  );
