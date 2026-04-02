-- ============================================================================
-- Migration 080: Brand Team Enhancements — Sprint 122 (The Crew)
-- ============================================================================
-- Adds brand_manager role, location scoping for regional managers, invite
-- tracking, and team activity audit log. All additive — no breaking changes.
-- ============================================================================

-- ─── Expand brand_accounts ──────────────────────────────────────────────────

-- Add invite tracking
ALTER TABLE brand_accounts
  ADD COLUMN IF NOT EXISTS invited_at timestamptz,
  ADD COLUMN IF NOT EXISTS invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add location scoping (NULL = all locations)
ALTER TABLE brand_accounts
  ADD COLUMN IF NOT EXISTS location_scope uuid[];

-- Expand role CHECK to include brand_manager
ALTER TABLE brand_accounts DROP CONSTRAINT IF EXISTS brand_accounts_role_check;
ALTER TABLE brand_accounts
  ADD CONSTRAINT brand_accounts_role_check
  CHECK (role IN ('owner', 'brand_manager', 'regional_manager'));

-- GIN index for location_scope array queries
CREATE INDEX IF NOT EXISTS idx_brand_accounts_location_scope
  ON brand_accounts USING GIN (location_scope)
  WHERE location_scope IS NOT NULL;

-- ─── brand_team_activity (audit log) ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS brand_team_activity (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id        uuid NOT NULL REFERENCES brewery_brands(id) ON DELETE CASCADE,
  actor_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  target_user_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  action          text NOT NULL CHECK (action IN ('added', 'removed', 'role_changed', 'scope_changed')),
  old_value       text,
  new_value       text,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brand_team_activity_brand
  ON brand_team_activity (brand_id, created_at DESC);

-- ─── RLS: brand_team_activity ───────────────────────────────────────────────

ALTER TABLE brand_team_activity ENABLE ROW LEVEL SECURITY;

-- Brand owner or brand_manager can read activity
CREATE POLICY "brand_team_activity_read"
  ON brand_team_activity FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brand_accounts
      WHERE brand_accounts.brand_id = brand_team_activity.brand_id
        AND brand_accounts.user_id = auth.uid()
        AND brand_accounts.role IN ('owner', 'brand_manager')
    )
  );

-- Brand owner or brand_manager can insert activity
CREATE POLICY "brand_team_activity_insert"
  ON brand_team_activity FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM brand_accounts
      WHERE brand_accounts.brand_id = brand_team_activity.brand_id
        AND brand_accounts.user_id = auth.uid()
        AND brand_accounts.role IN ('owner', 'brand_manager')
    )
  );

-- ─── Expand brand_accounts RLS for brand_manager ────────────────────────────

-- brand_manager can read all accounts for their brand
CREATE POLICY "brand_accounts_manager_read_all"
  ON brand_accounts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brand_accounts ba
      WHERE ba.brand_id = brand_accounts.brand_id
        AND ba.user_id = auth.uid()
        AND ba.role = 'brand_manager'
    )
  );

-- brand_manager can insert non-owner accounts
CREATE POLICY "brand_accounts_manager_insert"
  ON brand_accounts FOR INSERT
  WITH CHECK (
    role != 'owner'
    AND EXISTS (
      SELECT 1 FROM brand_accounts ba
      WHERE ba.brand_id = brand_accounts.brand_id
        AND ba.user_id = auth.uid()
        AND ba.role = 'brand_manager'
    )
  );

-- brand_manager can update non-owner accounts
CREATE POLICY "brand_accounts_manager_update"
  ON brand_accounts FOR UPDATE
  USING (
    role != 'owner'
    AND EXISTS (
      SELECT 1 FROM brand_accounts ba
      WHERE ba.brand_id = brand_accounts.brand_id
        AND ba.user_id = auth.uid()
        AND ba.role = 'brand_manager'
    )
  );

-- brand_manager can delete non-owner accounts
CREATE POLICY "brand_accounts_manager_delete"
  ON brand_accounts FOR DELETE
  USING (
    role != 'owner'
    AND EXISTS (
      SELECT 1 FROM brand_accounts ba
      WHERE ba.brand_id = brand_accounts.brand_id
        AND ba.user_id = auth.uid()
        AND ba.role = 'brand_manager'
    )
  );

-- ─── Update brewery_brands RLS to include brand_manager ─────────────────────

-- brand_manager can also update brand settings
DROP POLICY IF EXISTS "brewery_brands_member_update" ON brewery_brands;
CREATE POLICY "brewery_brands_member_update"
  ON brewery_brands FOR UPDATE
  USING (
    auth.uid() = owner_id
    OR EXISTS (
      SELECT 1 FROM brand_accounts
      WHERE brand_accounts.brand_id = brewery_brands.id
        AND brand_accounts.user_id = auth.uid()
        AND brand_accounts.role IN ('owner', 'brand_manager', 'regional_manager')
    )
  );

-- ─── Notify PostgREST to reload schema cache ────────────────────────────────
NOTIFY pgrst, 'reload schema';
