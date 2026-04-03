-- Migration 091: Disk IO performance indexes (hotfix)
-- Addresses Supabase Disk IO budget depletion on Pro tier.
-- These are the most impactful missing indexes identified from query analysis.
-- All CREATE INDEX statements are safe — additive only, no data changes.

-- Brand queries: every brand dashboard/analytics query joins on brand_id
CREATE INDEX IF NOT EXISTS idx_breweries_brand_id ON breweries(brand_id);

-- Session analytics: brand analytics, KPI sparklines, and Command Center
-- all filter by brewery_id + is_active + started_at
CREATE INDEX IF NOT EXISTS idx_sessions_brewery_active_started
  ON sessions(brewery_id, is_active, started_at DESC);

-- Beer log analytics: date-range analytics, export, KPI calculations
CREATE INDEX IF NOT EXISTS idx_beer_logs_brewery_logged
  ON beer_logs(brewery_id, logged_at DESC);

-- Follower counts: brand dashboard, brewery detail, analytics comparison
CREATE INDEX IF NOT EXISTS idx_brewery_follows_brewery_id
  ON brewery_follows(brewery_id);

-- Redemption lookups: code confirmation searches by code + status
CREATE INDEX IF NOT EXISTS idx_redemption_codes_code_status
  ON redemption_codes(code, status);

-- Notification reads: consumer notification page queries by user_id + read status
CREATE INDEX IF NOT EXISTS idx_notifications_user_read
  ON notifications(user_id, read, created_at DESC);
