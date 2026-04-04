-- Migration 097: Compliance Shield
-- Sprint 156 — The Triple Shot
-- Adds age verification, location consent, and review moderation columns

-- Age verification on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_consent boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_consent_at timestamptz;

-- Review moderation columns for beer_reviews
ALTER TABLE beer_reviews ADD COLUMN IF NOT EXISTS is_flagged boolean DEFAULT false;
ALTER TABLE beer_reviews ADD COLUMN IF NOT EXISTS flag_reason text;
ALTER TABLE beer_reviews ADD COLUMN IF NOT EXISTS flagged_by uuid REFERENCES profiles(id);
ALTER TABLE beer_reviews ADD COLUMN IF NOT EXISTS flagged_at timestamptz;
ALTER TABLE beer_reviews ADD COLUMN IF NOT EXISTS moderation_status text DEFAULT 'active'
  CHECK (moderation_status IN ('active', 'flagged', 'removed', 'cleared'));
ALTER TABLE beer_reviews ADD COLUMN IF NOT EXISTS moderation_note text;
ALTER TABLE beer_reviews ADD COLUMN IF NOT EXISTS moderated_at timestamptz;
ALTER TABLE beer_reviews ADD COLUMN IF NOT EXISTS moderated_by uuid REFERENCES profiles(id);

-- Review moderation columns for brewery_reviews
ALTER TABLE brewery_reviews ADD COLUMN IF NOT EXISTS is_flagged boolean DEFAULT false;
ALTER TABLE brewery_reviews ADD COLUMN IF NOT EXISTS flag_reason text;
ALTER TABLE brewery_reviews ADD COLUMN IF NOT EXISTS flagged_by uuid REFERENCES profiles(id);
ALTER TABLE brewery_reviews ADD COLUMN IF NOT EXISTS flagged_at timestamptz;
ALTER TABLE brewery_reviews ADD COLUMN IF NOT EXISTS moderation_status text DEFAULT 'active'
  CHECK (moderation_status IN ('active', 'flagged', 'removed', 'cleared'));
ALTER TABLE brewery_reviews ADD COLUMN IF NOT EXISTS moderation_note text;
ALTER TABLE brewery_reviews ADD COLUMN IF NOT EXISTS moderated_at timestamptz;
ALTER TABLE brewery_reviews ADD COLUMN IF NOT EXISTS moderated_by uuid REFERENCES profiles(id);

-- Partial indexes for moderation queue queries
CREATE INDEX IF NOT EXISTS idx_beer_reviews_flagged
  ON beer_reviews (flagged_at DESC)
  WHERE is_flagged = true;

CREATE INDEX IF NOT EXISTS idx_brewery_reviews_flagged
  ON brewery_reviews (flagged_at DESC)
  WHERE is_flagged = true;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
