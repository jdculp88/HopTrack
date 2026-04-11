-- Sprint 176 — Beer Sensory Fields
--
-- Adds sensory/tasting-note columns to `beers` and `brand_catalog_beers` so
-- breweries can record SRM color, aroma notes, taste notes, and finish notes
-- through the tap-list admin flow. Slideshow has been reading these columns
-- optimistically since Sprint 175 — this migration makes them real.
--
-- Also adds `is_default` to `beer_pour_sizes` so breweries can mark which
-- pour size should be highlighted on the Board (replaces the old "always
-- highlight the first one" behavior). Backfills Pint as the default for
-- every existing beer — creating a Pint pour row if none exists.
--
-- Rollback plan at the bottom of this file.
--
-- No RLS changes. Both tables already have public-read / staff-write policies
-- that cover the new columns.

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. beers — sensory columns
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.beers
  ADD COLUMN IF NOT EXISTS srm int
    CHECK (srm IS NULL OR (srm BETWEEN 1 AND 40)),
  ADD COLUMN IF NOT EXISTS aroma_notes  text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS taste_notes  text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS finish_notes text[] NOT NULL DEFAULT '{}';

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. brand_catalog_beers — mirror the sensory columns so the brand catalog
--    stays the single source of truth for multi-location brands (Sprint 119).
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.brand_catalog_beers
  ADD COLUMN IF NOT EXISTS srm int
    CHECK (srm IS NULL OR (srm BETWEEN 1 AND 40)),
  ADD COLUMN IF NOT EXISTS aroma_notes  text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS taste_notes  text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS finish_notes text[] NOT NULL DEFAULT '{}';

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. beer_pour_sizes — default flag
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.beer_pour_sizes
  ADD COLUMN IF NOT EXISTS is_default boolean NOT NULL DEFAULT false;

-- Enforce "one default per beer" at the database level so client-side bugs
-- can't leave a beer with two defaults. Partial unique index: only indexes
-- rows where is_default = true.
CREATE UNIQUE INDEX IF NOT EXISTS idx_beer_pour_sizes_one_default_per_beer
  ON public.beer_pour_sizes (beer_id)
  WHERE is_default = true;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. Backfill: every on-tap beer should have a Pint as its default pour.
--
-- Logic:
--   a) For beers that already have a pour size labeled 'Pint' (case-insensitive),
--      mark that row as is_default = true. If multiple Pint-labeled rows exist,
--      the one with the lowest display_order wins.
--   b) For beers with pour sizes but no Pint, mark the first row (lowest
--      display_order) as default.
--   c) For beers with NO pour sizes at all, insert a synthetic
--      "Pint · 16oz" row priced from the legacy price_per_pint column, or
--      $6.00 if no price is on file. Mark it is_default.
-- ═══════════════════════════════════════════════════════════════════════════

-- 4a — Mark the Pint row as default where one exists
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY beer_id
      ORDER BY display_order ASC, created_at ASC
    ) AS rn
  FROM public.beer_pour_sizes
  WHERE LOWER(label) LIKE 'pint%'
)
UPDATE public.beer_pour_sizes ps
SET is_default = true
FROM ranked r
WHERE ps.id = r.id AND r.rn = 1;

-- 4b — For beers that have pour sizes but no is_default yet, pick the first
UPDATE public.beer_pour_sizes ps
SET is_default = true
WHERE ps.id IN (
  SELECT DISTINCT ON (beer_id) id
  FROM public.beer_pour_sizes
  WHERE beer_id NOT IN (
    SELECT beer_id FROM public.beer_pour_sizes WHERE is_default = true
  )
  ORDER BY beer_id, display_order ASC, created_at ASC
);

-- 4c — For beers with zero pour sizes, create a default Pint row.
INSERT INTO public.beer_pour_sizes (beer_id, label, oz, price, display_order, is_default)
SELECT
  b.id,
  'Pint',
  16,
  COALESCE(b.price_per_pint, 6.00),
  0,
  true
FROM public.beers b
WHERE NOT EXISTS (
  SELECT 1 FROM public.beer_pour_sizes ps WHERE ps.beer_id = b.id
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. Reload PostgREST schema so the new columns are visible immediately
-- ═══════════════════════════════════════════════════════════════════════════

NOTIFY pgrst, 'reload schema';

-- ═══════════════════════════════════════════════════════════════════════════
-- ROLLBACK PLAN (run manually if needed)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- DROP INDEX IF EXISTS idx_beer_pour_sizes_one_default_per_beer;
-- ALTER TABLE public.beer_pour_sizes      DROP COLUMN IF EXISTS is_default;
-- ALTER TABLE public.brand_catalog_beers  DROP COLUMN IF EXISTS finish_notes;
-- ALTER TABLE public.brand_catalog_beers  DROP COLUMN IF EXISTS taste_notes;
-- ALTER TABLE public.brand_catalog_beers  DROP COLUMN IF EXISTS aroma_notes;
-- ALTER TABLE public.brand_catalog_beers  DROP COLUMN IF EXISTS srm;
-- ALTER TABLE public.beers                DROP COLUMN IF EXISTS finish_notes;
-- ALTER TABLE public.beers                DROP COLUMN IF EXISTS taste_notes;
-- ALTER TABLE public.beers                DROP COLUMN IF EXISTS aroma_notes;
-- ALTER TABLE public.beers                DROP COLUMN IF EXISTS srm;
-- NOTIFY pgrst, 'reload schema';
--
-- Note: The Pint pour-size rows created by step 4c will remain. They're
-- harmless (just a default $6 Pint) but can be removed with:
--   DELETE FROM public.beer_pour_sizes
--   WHERE label = 'Pint' AND oz = 16 AND price = 6.00
--     AND created_at > '<migration-apply-time>';
