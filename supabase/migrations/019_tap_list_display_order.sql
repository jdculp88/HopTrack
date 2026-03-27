-- ============================================================================
-- Migration 019: Tap list display order + 86'd toggle
-- Sprint 16 (S16-012)
-- ============================================================================

-- Add display_order for drag-to-reorder
ALTER TABLE beers ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Add 86'd status (temporarily out of stock — distinct from off-tap)
ALTER TABLE beers ADD COLUMN IF NOT EXISTS is_86d BOOLEAN DEFAULT false;

-- Backfill display_order from existing row order
UPDATE beers SET display_order = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY brewery_id ORDER BY is_on_tap DESC, name) as rn
  FROM beers
) sub
WHERE beers.id = sub.id;
