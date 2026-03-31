-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 050: Deduplicate beers
-- The Kaggle Beer Study CSV contained duplicate entries for the same beer
-- at the same brewery (e.g., "Nonstop Hef Hop" appeared 12 times at
-- Hopworks Urban Brewery). This migration removes duplicates, keeping the
-- first-inserted copy (oldest created_at).
--
-- Casey 🔍: "Zero tolerance for duplicate data."
-- Quinn ⚙️: "Keep the oldest, delete the rest."
-- ─────────────────────────────────────────────────────────────────────────────

DELETE FROM beers
WHERE id IN (
  SELECT id FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY brewery_id, LOWER(TRIM(name))
        ORDER BY created_at ASC
      ) AS rn
    FROM beers
  ) dupes
  WHERE rn > 1
);
