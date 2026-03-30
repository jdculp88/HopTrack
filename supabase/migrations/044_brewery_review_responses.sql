-- Migration 044: Brewery review owner responses
-- Allows brewery owners/managers to respond to customer reviews

ALTER TABLE brewery_reviews
  ADD COLUMN IF NOT EXISTS owner_response TEXT,
  ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;

-- Index for quickly finding reviews with responses
CREATE INDEX IF NOT EXISTS idx_brewery_reviews_responded
  ON brewery_reviews (brewery_id, responded_at DESC NULLS LAST)
  WHERE responded_at IS NOT NULL;
