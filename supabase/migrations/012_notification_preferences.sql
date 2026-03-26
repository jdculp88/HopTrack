-- Migration 012: Notification preferences on profiles
-- Sprint 14 — S14-005
-- Adds JSONB column for per-user notification preferences

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{"friend_activity": true, "achievements": true, "weekly_stats": true}'::jsonb;

COMMENT ON COLUMN profiles.notification_preferences IS 'User notification preferences: friend_activity, achievements, weekly_stats';
