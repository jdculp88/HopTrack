-- ============================================================================
-- Migration 072: Multi-Location Brewery Support (F-017) — Foundation Schema
-- Sprint 114 — The Multi-Location arc begins
-- ============================================================================
-- Creates brewery_brands and brand_accounts tables, adds brand_id FK to
-- breweries. All existing breweries remain brand_id = NULL (independent).
-- Zero impact on single-location breweries.
-- ============================================================================

-- ─── brewery_brands ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brewery_brands (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text UNIQUE NOT NULL,
  logo_url    text,
  description text,
  website_url text,
  created_at  timestamptz DEFAULT now(),
  owner_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Slug lookup index
CREATE INDEX IF NOT EXISTS idx_brewery_brands_slug ON brewery_brands (slug);

-- Owner lookup
CREATE INDEX IF NOT EXISTS idx_brewery_brands_owner_id ON brewery_brands (owner_id);

-- ─── brand_accounts ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brand_accounts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id   uuid NOT NULL REFERENCES brewery_brands(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       text NOT NULL CHECK (role IN ('owner', 'regional_manager')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, brand_id)
);

CREATE INDEX IF NOT EXISTS idx_brand_accounts_brand_id ON brand_accounts (brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_accounts_user_id ON brand_accounts (user_id);

-- ─── Add brand_id to breweries ──────────────────────────────────────────────
ALTER TABLE breweries
  ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES brewery_brands(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_breweries_brand_id ON breweries (brand_id);

-- ─── RLS: brewery_brands ────────────────────────────────────────────────────
ALTER TABLE brewery_brands ENABLE ROW LEVEL SECURITY;

-- Anyone can read brands (public brand pages)
CREATE POLICY "brewery_brands_public_read"
  ON brewery_brands FOR SELECT
  USING (true);

-- Brand owner can insert
CREATE POLICY "brewery_brands_owner_insert"
  ON brewery_brands FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Brand owner or regional_manager can update
CREATE POLICY "brewery_brands_member_update"
  ON brewery_brands FOR UPDATE
  USING (
    auth.uid() = owner_id
    OR EXISTS (
      SELECT 1 FROM brand_accounts
      WHERE brand_accounts.brand_id = brewery_brands.id
        AND brand_accounts.user_id = auth.uid()
        AND brand_accounts.role IN ('owner', 'regional_manager')
    )
  );

-- Only brand owner can delete
CREATE POLICY "brewery_brands_owner_delete"
  ON brewery_brands FOR DELETE
  USING (auth.uid() = owner_id);

-- ─── RLS: brand_accounts ────────────────────────────────────────────────────
ALTER TABLE brand_accounts ENABLE ROW LEVEL SECURITY;

-- Members can read their own brand memberships
CREATE POLICY "brand_accounts_read_own"
  ON brand_accounts FOR SELECT
  USING (auth.uid() = user_id);

-- Brand owners can read all accounts for their brands
CREATE POLICY "brand_accounts_owner_read_all"
  ON brand_accounts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brewery_brands
      WHERE brewery_brands.id = brand_accounts.brand_id
        AND brewery_brands.owner_id = auth.uid()
    )
  );

-- Brand owners can insert accounts for their brands
CREATE POLICY "brand_accounts_owner_insert"
  ON brand_accounts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM brewery_brands
      WHERE brewery_brands.id = brand_accounts.brand_id
        AND brewery_brands.owner_id = auth.uid()
    )
  );

-- Brand owners can update accounts for their brands
CREATE POLICY "brand_accounts_owner_update"
  ON brand_accounts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM brewery_brands
      WHERE brewery_brands.id = brand_accounts.brand_id
        AND brewery_brands.owner_id = auth.uid()
    )
  );

-- Brand owners can delete accounts for their brands
CREATE POLICY "brand_accounts_owner_delete"
  ON brand_accounts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM brewery_brands
      WHERE brewery_brands.id = brand_accounts.brand_id
        AND brewery_brands.owner_id = auth.uid()
    )
  );

-- ─── Notify PostgREST to reload schema cache ────────────────────────────────
NOTIFY pgrst, 'reload schema';
