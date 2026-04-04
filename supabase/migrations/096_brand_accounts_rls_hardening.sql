-- ============================================================================
-- Migration 096: Brand Accounts RLS Hardening — Sprint 147 (The Hardening)
-- ============================================================================
-- Ensures brand_accounts_read_own policy exists (allows any authenticated user
-- to SELECT their own row). This was created in migration 072 but may not be
-- present if migrations were partially applied. Defensive recreation.
--
-- Also ensures the SECURITY DEFINER function from 081 is in place.
-- ============================================================================

-- ─── Ensure self-read policy exists ─────────────────────────────────────────
-- Every user must be able to read their own brand_accounts row.
-- This is critical for verifyBrandAccess() to work for all roles.
DROP POLICY IF EXISTS "brand_accounts_read_own" ON brand_accounts;
CREATE POLICY "brand_accounts_read_own"
  ON brand_accounts FOR SELECT
  USING (auth.uid() = user_id);

-- ─── Ensure owner-read-all policy exists ────────────────────────────────────
DROP POLICY IF EXISTS "brand_accounts_owner_read_all" ON brand_accounts;
CREATE POLICY "brand_accounts_owner_read_all"
  ON brand_accounts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brewery_brands
      WHERE brewery_brands.id = brand_accounts.brand_id
        AND brewery_brands.owner_id = auth.uid()
    )
  );

-- ─── Ensure SECURITY DEFINER function exists (from 081) ────────────────────
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

-- ─── Ensure manager-read-all uses SECURITY DEFINER (from 081) ──────────────
DROP POLICY IF EXISTS "brand_accounts_manager_read_all" ON brand_accounts;
CREATE POLICY "brand_accounts_manager_read_all"
  ON brand_accounts FOR SELECT
  USING (
    is_brand_manager_or_owner(brand_id, auth.uid())
  );

-- ─── Notify PostgREST to reload schema cache ────────────────────────────────
NOTIFY pgrst, 'reload schema';
