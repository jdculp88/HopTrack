-- Migration 106: Add flavor_tags to beer_reviews
-- Enables tasting note pills on review feed cards (matches beer_logs pattern)

ALTER TABLE beer_reviews
ADD COLUMN IF NOT EXISTS flavor_tags text[] DEFAULT NULL;

-- Backfill from beer_logs: if a user reviewed a beer and also logged it with
-- flavor_tags, copy the tags to the review for display purposes
UPDATE beer_reviews
SET flavor_tags = sub.flavor_tags
FROM (
  SELECT DISTINCT ON (bl.user_id, bl.beer_id) bl.user_id AS uid, bl.beer_id AS bid, bl.flavor_tags
  FROM beer_logs bl
  WHERE bl.flavor_tags IS NOT NULL AND array_length(bl.flavor_tags, 1) > 0
  ORDER BY bl.user_id, bl.beer_id, bl.logged_at DESC
) sub
WHERE beer_reviews.user_id = sub.uid
  AND beer_reviews.beer_id = sub.bid
  AND beer_reviews.flavor_tags IS NULL;
