-- Migration 057: API Keys for Public API v1
-- Sprint 85 — The Pipeline
-- Quinn (Infrastructure Engineer)

-- API keys for brewery owners to access authenticated v1 endpoints
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brewery_id UUID NOT NULL REFERENCES breweries(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Default',
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL, -- first 8 chars for identification (e.g. "ht_live_a1b2c3d4")
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  rate_limit INT NOT NULL DEFAULT 100, -- requests per minute
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_api_keys_brewery ON api_keys(brewery_id) WHERE revoked_at IS NULL;
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash) WHERE revoked_at IS NULL;
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);

-- RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Brewery owners/managers can read their own keys
CREATE POLICY "Brewery admins can view their own API keys"
  ON api_keys FOR SELECT
  USING (
    brewery_id IN (
      SELECT ba.brewery_id FROM brewery_accounts ba
      WHERE ba.user_id = auth.uid()
      AND ba.role IN ('owner', 'manager')
    )
  );

-- Brewery owners/managers can create keys
CREATE POLICY "Brewery admins can create API keys"
  ON api_keys FOR INSERT
  WITH CHECK (
    brewery_id IN (
      SELECT ba.brewery_id FROM brewery_accounts ba
      WHERE ba.user_id = auth.uid()
      AND ba.role IN ('owner', 'manager')
    )
    AND created_by = auth.uid()
  );

-- Brewery owners/managers can revoke (update) their own keys
CREATE POLICY "Brewery admins can revoke API keys"
  ON api_keys FOR UPDATE
  USING (
    brewery_id IN (
      SELECT ba.brewery_id FROM brewery_accounts ba
      WHERE ba.user_id = auth.uid()
      AND ba.role IN ('owner', 'manager')
    )
  );

-- Superadmin can see all keys
CREATE POLICY "Superadmins can view all API keys"
  ON api_keys FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_superadmin = true
    )
  );

-- Max 5 active keys per brewery
CREATE OR REPLACE FUNCTION check_api_key_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*) FROM api_keys
    WHERE brewery_id = NEW.brewery_id AND revoked_at IS NULL
  ) >= 5 THEN
    RAISE EXCEPTION 'Maximum of 5 active API keys per brewery';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_api_key_limit
  BEFORE INSERT ON api_keys
  FOR EACH ROW EXECUTE FUNCTION check_api_key_limit();

COMMENT ON TABLE api_keys IS 'API keys for brewery access to HopTrack Public API v1';
