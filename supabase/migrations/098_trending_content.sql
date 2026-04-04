-- Migration 098: Trending Content
-- Sprint 156 — The Triple Shot
-- Trending scores table + "Just Tapped" timestamp on beers

-- Trending scores (recomputed periodically by cron)
CREATE TABLE IF NOT EXISTS trending_scores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type text NOT NULL CHECK (content_type IN ('beer', 'brewery')),
  content_id uuid NOT NULL,
  city text NOT NULL,
  score numeric DEFAULT 0,
  checkin_count_24h integer DEFAULT 0,
  rating_count_24h integer DEFAULT 0,
  unique_users_24h integer DEFAULT 0,
  computed_at timestamptz DEFAULT now(),
  UNIQUE (content_type, content_id, city)
);

-- Index for fast city + type lookups sorted by score
CREATE INDEX IF NOT EXISTS idx_trending_scores_city_type
  ON trending_scores (city, content_type, score DESC);

-- "Just Tapped" timestamp on beers for realtime badge
ALTER TABLE beers ADD COLUMN IF NOT EXISTS tapped_at timestamptz DEFAULT now();

-- RLS: trending_scores is public read, superadmin write
ALTER TABLE trending_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trending scores are publicly readable"
  ON trending_scores FOR SELECT
  USING (true);

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
