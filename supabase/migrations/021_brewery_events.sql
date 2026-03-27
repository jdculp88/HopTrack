-- ============================================================================
-- Migration 021: Brewery events (S16-020)
-- ============================================================================

CREATE TABLE IF NOT EXISTS brewery_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brewery_id  UUID NOT NULL REFERENCES breweries(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  event_date  DATE NOT NULL,
  start_time  TIME,
  end_time    TIME,
  event_type  TEXT NOT NULL DEFAULT 'other'
                CHECK (event_type IN ('tap_takeover','release_party','trivia','live_music','food_pairing','other')),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brewery_events_brewery ON brewery_events(brewery_id);
CREATE INDEX IF NOT EXISTS idx_brewery_events_date ON brewery_events(event_date);

ALTER TABLE brewery_events ENABLE ROW LEVEL SECURITY;

-- Public can read active events
CREATE POLICY "brewery_events_public_select" ON brewery_events
  FOR SELECT USING (is_active = true);

-- Brewery admins can manage events
CREATE POLICY "brewery_events_admin_manage" ON brewery_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM brewery_accounts
      WHERE brewery_accounts.brewery_id = brewery_events.brewery_id
        AND brewery_accounts.user_id = auth.uid()
    )
  );
