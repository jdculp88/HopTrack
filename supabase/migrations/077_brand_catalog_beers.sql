-- ============================================================================
-- Migration 077: Brand Catalog Beers
-- Sprint 119 — The Inventory
--
-- Adds a centralized beer catalog at the brand level so multi-location brands
-- have a single source of truth for beer definitions. Location beers link back
-- via brand_catalog_beer_id (nullable FK). Fully non-destructive — zero
-- existing rows deleted, zero FKs broken.
-- ============================================================================

-- ─── 1. Create brand_catalog_beers table ────────────────────────────────────

CREATE TABLE IF NOT EXISTS brand_catalog_beers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id        uuid NOT NULL REFERENCES brewery_brands(id) ON DELETE CASCADE,
  name            text NOT NULL,
  style           text,
  abv             numeric(4,2),
  ibu             int,
  description     text,
  item_type       text NOT NULL DEFAULT 'beer'
                    CHECK (item_type IN ('beer','cider','wine','cocktail','na_beverage')),
  category        text,
  glass_type      text,
  cover_image_url text,
  seasonal        boolean NOT NULL DEFAULT false,
  is_active       boolean NOT NULL DEFAULT true,
  created_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  UNIQUE (brand_id, lower(name))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_brand_catalog_beers_brand_id
  ON brand_catalog_beers(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_catalog_beers_active
  ON brand_catalog_beers(brand_id) WHERE is_active = true;

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_brand_catalog_beers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_brand_catalog_beers_updated_at
  BEFORE UPDATE ON brand_catalog_beers
  FOR EACH ROW EXECUTE FUNCTION update_brand_catalog_beers_updated_at();

-- ─── 2. RLS policies ────────────────────────────────────────────────────────

ALTER TABLE brand_catalog_beers ENABLE ROW LEVEL SECURITY;

-- Public read (catalog entries are discoverable like beers)
CREATE POLICY "brand_catalog_beers_select"
  ON brand_catalog_beers FOR SELECT
  USING (true);

-- Insert: brand owner or regional_manager
CREATE POLICY "brand_catalog_beers_insert"
  ON brand_catalog_beers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM brand_accounts
      WHERE brand_accounts.brand_id = brand_catalog_beers.brand_id
        AND brand_accounts.user_id = auth.uid()
        AND brand_accounts.role IN ('owner', 'regional_manager')
    )
  );

-- Update: brand owner or regional_manager
CREATE POLICY "brand_catalog_beers_update"
  ON brand_catalog_beers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM brand_accounts
      WHERE brand_accounts.brand_id = brand_catalog_beers.brand_id
        AND brand_accounts.user_id = auth.uid()
        AND brand_accounts.role IN ('owner', 'regional_manager')
    )
  );

-- Delete: brand owner only
CREATE POLICY "brand_catalog_beers_delete"
  ON brand_catalog_beers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM brand_accounts
      WHERE brand_accounts.brand_id = brand_catalog_beers.brand_id
        AND brand_accounts.user_id = auth.uid()
        AND brand_accounts.role = 'owner'
    )
  );

-- ─── 3. Add FK on beers table ───────────────────────────────────────────────

ALTER TABLE beers
  ADD COLUMN IF NOT EXISTS brand_catalog_beer_id uuid
    REFERENCES brand_catalog_beers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_beers_brand_catalog_beer_id
  ON beers(brand_catalog_beer_id) WHERE brand_catalog_beer_id IS NOT NULL;

-- ─── 4. Backfill: populate catalog from existing brand beers ────────────────

-- Step 1: Create catalog entries from existing beers grouped by brand + name.
-- Uses DISTINCT ON to pick one canonical version per beer name per brand.
INSERT INTO brand_catalog_beers (brand_id, name, style, abv, ibu, description, item_type, category, glass_type, cover_image_url, seasonal, is_active, created_by, created_at)
SELECT DISTINCT ON (br.brand_id, lower(b.name))
  br.brand_id,
  b.name,
  b.style,
  b.abv,
  b.ibu,
  b.description,
  COALESCE(b.item_type, 'beer'),
  b.category,
  b.glass_type,
  b.cover_image_url,
  COALESCE(b.seasonal, false),
  b.is_active,
  b.created_by,
  b.created_at
FROM beers b
JOIN breweries br ON b.brewery_id = br.id
WHERE br.brand_id IS NOT NULL
  AND b.is_active = true
ORDER BY br.brand_id, lower(b.name), b.created_at ASC
ON CONFLICT (brand_id, lower(name)) DO NOTHING;

-- Step 2: Link existing location beers back to their catalog entries.
UPDATE beers b
SET brand_catalog_beer_id = bcb.id
FROM brand_catalog_beers bcb
JOIN breweries br ON br.brand_id = bcb.brand_id
WHERE b.brewery_id = br.id
  AND lower(b.name) = lower(bcb.name)
  AND b.brand_catalog_beer_id IS NULL;

-- ─── Done ───────────────────────────────────────────────────────────────────
