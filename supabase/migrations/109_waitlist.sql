-- Migration 109: Waitlist signups for the hoptrack.beer coming-soon landing.
-- Captures pre-launch interest with city/state demand-mapping data so Taylor
-- and Drew can prioritize regional outreach.
--
-- RLS pattern: enabled with ZERO policies. The table is locked to service role
-- only, mirroring the crawled_beers / barback approach. Inserts and reads go
-- through API routes that use createServiceClient() — no public anon access.

CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(trim(name)) > 0),
  email text NOT NULL,
  city text NOT NULL CHECK (length(trim(city)) > 0),
  state text NOT NULL CHECK (length(state) = 2),
  audience_type text NOT NULL CHECK (audience_type IN ('user', 'brewery')),
  brewery_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT brewery_name_required CHECK (
    audience_type <> 'brewery'
    OR (brewery_name IS NOT NULL AND length(trim(brewery_name)) > 0)
  )
);

-- Case-insensitive unique email (defense in depth — Zod also lowercases)
CREATE UNIQUE INDEX IF NOT EXISTS waitlist_email_key ON waitlist (lower(email));

-- Demand-mapping indexes
CREATE INDEX IF NOT EXISTS waitlist_state_idx ON waitlist (state);
CREATE INDEX IF NOT EXISTS waitlist_audience_idx ON waitlist (audience_type);
CREATE INDEX IF NOT EXISTS waitlist_created_idx ON waitlist (created_at DESC);

-- Lock the table: RLS enabled, no policies = service role only.
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
