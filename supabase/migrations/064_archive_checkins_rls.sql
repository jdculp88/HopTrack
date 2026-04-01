-- Migration 064: Enable RLS on _archive_checkins
-- This is a write-once backup table from migration 015 (checkins → sessions rename).
-- No policies needed — table should only be accessible via service role.
-- Resolves Supabase Security Advisor: "RLS Disabled in Public"

ALTER TABLE _archive_checkins ENABLE ROW LEVEL SECURITY;
