-- ============================================================================
-- Migration 081: Fix brand_accounts RLS infinite recursion
-- ============================================================================
-- The brand_accounts_manager_read_all policy (from 080) queries
-- brand_accounts inside a SELECT policy on brand_accounts, causing
-- PostgreSQL to silently return no rows. Same pattern that broke
-- brewery_accounts in Sprint 115.
--
-- Fix: SECURITY DEFINER helper function that bypasses RLS to check
-- brand membership, then reference it in all manager policies.
-- ============================================================================

-- ─── Helper function (bypasses RLS) ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_brand_manager_or_owner(p_brand_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM brand_accounts
    WHERE brand_id = p_brand_id
      AND user_id = p_user_id
      AND role IN ('owner', 'brand_manager')
  );
$$;

-- ─── Fix SELECT policy (the one causing the recursion) ──────────────────────
DROP POLICY IF EXISTS "brand_accounts_manager_read_all" ON brand_accounts;
CREATE POLICY "brand_accounts_manager_read_all"
  ON brand_accounts FOR SELECT
  USING (
    is_brand_manager_or_owner(brand_id, auth.uid())
  );

-- ─── Fix INSERT policy ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "brand_accounts_manager_insert" ON brand_accounts;
CREATE POLICY "brand_accounts_manager_insert"
  ON brand_accounts FOR INSERT
  WITH CHECK (
    role != 'owner'
    AND is_brand_manager_or_owner(brand_id, auth.uid())
  );

-- ─── Fix UPDATE policy ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "brand_accounts_manager_update" ON brand_accounts;
CREATE POLICY "brand_accounts_manager_update"
  ON brand_accounts FOR UPDATE
  USING (
    role != 'owner'
    AND is_brand_manager_or_owner(brand_id, auth.uid())
  );

-- ─── Fix DELETE policy ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "brand_accounts_manager_delete" ON brand_accounts;
CREATE POLICY "brand_accounts_manager_delete"
  ON brand_accounts FOR DELETE
  USING (
    role != 'owner'
    AND is_brand_manager_or_owner(brand_id, auth.uid())
  );

-- ─── Also fix brand_team_activity policies (same pattern) ───────────────────
DROP POLICY IF EXISTS "brand_team_activity_read" ON brand_team_activity;
CREATE POLICY "brand_team_activity_read"
  ON brand_team_activity FOR SELECT
  USING (
    is_brand_manager_or_owner(brand_id, auth.uid())
  );

DROP POLICY IF EXISTS "brand_team_activity_insert" ON brand_team_activity;
CREATE POLICY "brand_team_activity_insert"
  ON brand_team_activity FOR INSERT
  WITH CHECK (
    is_brand_manager_or_owner(brand_id, auth.uid())
  );

-- ─── Notify PostgREST to reload schema cache ────────────────────────────────
NOTIFY pgrst, 'reload schema';
