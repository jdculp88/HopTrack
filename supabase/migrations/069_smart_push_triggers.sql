-- Migration 069: Smart push notification infrastructure
-- Sprint 102 — Smart Push (F-019)
-- Frequency capping + notification preference expansion

-- Notification rate limiting table
CREATE TABLE notification_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL,
  trigger_key TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups: "did we already notify this user about this trigger today?"
CREATE INDEX idx_notification_rate_user_type
  ON notification_rate_limits (user_id, trigger_type, sent_at DESC);

-- Cleanup: auto-delete entries older than 48 hours (keeps table small)
-- Will be called periodically or on insert
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM notification_rate_limits
  WHERE sent_at < now() - interval '48 hours';
$$;

-- RLS: users can only read their own rate limits (service role writes)
ALTER TABLE notification_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own rate limits"
  ON notification_rate_limits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Add new notification types to match our triggers
-- (The notifications table uses TEXT type, so no enum change needed)

NOTIFY pgrst, 'reload schema';
