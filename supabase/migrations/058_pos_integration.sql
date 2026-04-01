-- Migration 058: POS Integration Foundation
-- Sprint 86 — The Connector
-- Tables: pos_connections, pos_item_mappings, pos_sync_logs
-- Columns added: beers (pos_item_id, pos_price_cents, pos_last_seen_at), breweries (pos_provider, pos_connected, pos_last_sync_at)

-- ─── POS Connections ──────────────────────────────────────────────────────────
-- One row per brewery per POS provider. Stores encrypted OAuth tokens.
CREATE TABLE IF NOT EXISTS pos_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brewery_id uuid NOT NULL REFERENCES breweries(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('toast', 'square')),
  access_token_encrypted text, -- AES-256-GCM encrypted, base64 encoded
  refresh_token_encrypted text, -- AES-256-GCM encrypted, base64 encoded
  token_expires_at timestamptz,
  provider_location_id text,
  provider_merchant_id text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'error', 'disconnected')),
  last_sync_at timestamptz,
  last_sync_status text CHECK (last_sync_status IN ('success', 'partial', 'failed')),
  last_sync_item_count integer DEFAULT 0,
  webhook_subscription_id text,
  connected_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (brewery_id, provider)
);

-- ─── POS Item Mappings ────────────────────────────────────────────────────────
-- Maps POS menu items to HopTrack beers
CREATE TABLE IF NOT EXISTS pos_item_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pos_connection_id uuid NOT NULL REFERENCES pos_connections(id) ON DELETE CASCADE,
  brewery_id uuid NOT NULL REFERENCES breweries(id) ON DELETE CASCADE,
  pos_item_id text NOT NULL,
  pos_item_name text NOT NULL,
  beer_id uuid REFERENCES beers(id) ON DELETE SET NULL,
  mapping_type text NOT NULL DEFAULT 'unmapped' CHECK (mapping_type IN ('auto', 'manual', 'unmapped')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─── POS Sync Logs ────────────────────────────────────────────────────────────
-- Audit trail for all sync operations
CREATE TABLE IF NOT EXISTS pos_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pos_connection_id uuid NOT NULL REFERENCES pos_connections(id) ON DELETE CASCADE,
  brewery_id uuid NOT NULL REFERENCES breweries(id) ON DELETE CASCADE,
  sync_type text NOT NULL CHECK (sync_type IN ('webhook', 'manual', 'scheduled')),
  provider text NOT NULL CHECK (provider IN ('toast', 'square')),
  items_added integer NOT NULL DEFAULT 0,
  items_updated integer NOT NULL DEFAULT 0,
  items_removed integer NOT NULL DEFAULT 0,
  items_unmapped integer NOT NULL DEFAULT 0,
  status text NOT NULL CHECK (status IN ('success', 'partial', 'failed')),
  error text,
  duration_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── Columns on existing tables ───────────────────────────────────────────────
-- Beers: POS provenance columns
ALTER TABLE beers ADD COLUMN IF NOT EXISTS pos_item_id text;
ALTER TABLE beers ADD COLUMN IF NOT EXISTS pos_price_cents integer;
ALTER TABLE beers ADD COLUMN IF NOT EXISTS pos_last_seen_at timestamptz;

-- Breweries: POS connection summary columns
ALTER TABLE breweries ADD COLUMN IF NOT EXISTS pos_provider text;
ALTER TABLE breweries ADD COLUMN IF NOT EXISTS pos_connected boolean NOT NULL DEFAULT false;
ALTER TABLE breweries ADD COLUMN IF NOT EXISTS pos_last_sync_at timestamptz;

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_pos_connections_brewery ON pos_connections(brewery_id);
CREATE INDEX IF NOT EXISTS idx_pos_item_mappings_connection ON pos_item_mappings(pos_connection_id);
CREATE INDEX IF NOT EXISTS idx_pos_item_mappings_brewery ON pos_item_mappings(brewery_id);
CREATE INDEX IF NOT EXISTS idx_pos_item_mappings_beer ON pos_item_mappings(beer_id);
CREATE INDEX IF NOT EXISTS idx_pos_sync_logs_connection ON pos_sync_logs(pos_connection_id);
CREATE INDEX IF NOT EXISTS idx_pos_sync_logs_brewery ON pos_sync_logs(brewery_id);
CREATE INDEX IF NOT EXISTS idx_beers_pos_item_id ON beers(pos_item_id) WHERE pos_item_id IS NOT NULL;

-- ─── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE pos_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_item_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_sync_logs ENABLE ROW LEVEL SECURITY;

-- pos_connections: brewery owner/manager can CRUD
CREATE POLICY "brewery_admin_pos_connections" ON pos_connections
  FOR ALL USING (
    brewery_id IN (
      SELECT ba.brewery_id FROM brewery_accounts ba
      WHERE ba.user_id = auth.uid() AND ba.role IN ('owner', 'manager')
    )
  );

-- Superadmin read-only on pos_connections (non-token columns enforced at app layer)
CREATE POLICY "superadmin_read_pos_connections" ON pos_connections
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_superadmin = true)
  );

-- pos_item_mappings: brewery owner/manager can CRUD
CREATE POLICY "brewery_admin_pos_item_mappings" ON pos_item_mappings
  FOR ALL USING (
    brewery_id IN (
      SELECT ba.brewery_id FROM brewery_accounts ba
      WHERE ba.user_id = auth.uid() AND ba.role IN ('owner', 'manager')
    )
  );

-- pos_sync_logs: brewery owner/manager can read
CREATE POLICY "brewery_admin_read_pos_sync_logs" ON pos_sync_logs
  FOR SELECT USING (
    brewery_id IN (
      SELECT ba.brewery_id FROM brewery_accounts ba
      WHERE ba.user_id = auth.uid() AND ba.role IN ('owner', 'manager')
    )
  );

-- pos_sync_logs: superadmin can read
CREATE POLICY "superadmin_read_pos_sync_logs" ON pos_sync_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_superadmin = true)
  );

-- Service role can insert sync logs (used by webhook handlers and sync jobs)
-- Note: service role bypasses RLS by default, so no explicit policy needed for server-side inserts.

-- ─── Updated_at trigger ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_pos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pos_connections_updated_at
  BEFORE UPDATE ON pos_connections
  FOR EACH ROW EXECUTE FUNCTION update_pos_updated_at();

CREATE TRIGGER pos_item_mappings_updated_at
  BEFORE UPDATE ON pos_item_mappings
  FOR EACH ROW EXECUTE FUNCTION update_pos_updated_at();
