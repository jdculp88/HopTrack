-- Migration 031: Brewery reviews — direct brewery ratings from consumers
-- Users can rate a brewery 1-5 stars with an optional comment.
-- One review per user per brewery (upsert pattern).

CREATE TABLE IF NOT EXISTS public.brewery_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brewery_id uuid NOT NULL REFERENCES public.breweries(id) ON DELETE CASCADE,
  rating numeric(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, brewery_id)
);

-- Index for brewery lookups
CREATE INDEX IF NOT EXISTS idx_brewery_reviews_brewery ON public.brewery_reviews(brewery_id);

-- RLS
ALTER TABLE public.brewery_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "brewery_reviews_read"
  ON public.brewery_reviews FOR SELECT
  USING (true);

-- Users can insert their own review
CREATE POLICY "brewery_reviews_insert"
  ON public.brewery_reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own review
CREATE POLICY "brewery_reviews_update"
  ON public.brewery_reviews FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Users can delete their own review
CREATE POLICY "brewery_reviews_delete"
  ON public.brewery_reviews FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
