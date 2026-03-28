-- Migration 032: Beer reviews — dedicated beer ratings from consumers
-- Users can rate a beer 1-5 stars with an optional comment.
-- One review per user per beer (upsert pattern).
-- Mirrors brewery_reviews pattern exactly.

CREATE TABLE IF NOT EXISTS public.beer_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  beer_id uuid NOT NULL REFERENCES public.beers(id) ON DELETE CASCADE,
  rating numeric(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, beer_id)
);

-- Index for beer lookups
CREATE INDEX IF NOT EXISTS idx_beer_reviews_beer ON public.beer_reviews(beer_id);

-- RLS
ALTER TABLE public.beer_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "beer_reviews_read"
  ON public.beer_reviews FOR SELECT
  USING (true);

-- Users can insert their own review
CREATE POLICY "beer_reviews_insert"
  ON public.beer_reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own review
CREATE POLICY "beer_reviews_update"
  ON public.beer_reviews FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Users can delete their own review
CREATE POLICY "beer_reviews_delete"
  ON public.beer_reviews FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
