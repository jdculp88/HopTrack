-- Migration 102: Identity Foundations
-- Sprint 162 — The Identity
--
-- Adds:
--   - user_pinned_beers table (Four Favorites — user-pinned top 4 beers on profile)
-- Updates:
--   - beer_reviews.rating: expands CHECK constraint from 1-5 to 0.5-5.0 (half-star support)
--   - brewery_reviews.rating: expands CHECK constraint from 1-5 to 0.5-5.0
--   - beer_logs.rating: ADDS new CHECK constraint (0.5-5.0 or NULL) — none existed

-- ─── user_pinned_beers ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_pinned_beers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  beer_id uuid NOT NULL REFERENCES public.beers(id) ON DELETE CASCADE,
  position smallint NOT NULL CHECK (position >= 0 AND position < 4),
  pinned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, position),
  UNIQUE(user_id, beer_id)
);

CREATE INDEX IF NOT EXISTS idx_user_pinned_beers_user
  ON public.user_pinned_beers(user_id, position);

CREATE INDEX IF NOT EXISTS idx_user_pinned_beers_beer
  ON public.user_pinned_beers(beer_id);

-- RLS: owner-write, public-read (profile pins are public identity)
ALTER TABLE public.user_pinned_beers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_pinned_beers_read_all"
  ON public.user_pinned_beers FOR SELECT
  USING (true);

CREATE POLICY "user_pinned_beers_insert_own"
  ON public.user_pinned_beers FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_pinned_beers_update_own"
  ON public.user_pinned_beers FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_pinned_beers_delete_own"
  ON public.user_pinned_beers FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ─── Half-star rating CHECK constraints ────────────────────────────────────

-- beer_reviews: expand from 1-5 → 0.5-5.0
ALTER TABLE public.beer_reviews
  DROP CONSTRAINT IF EXISTS beer_reviews_rating_check;
ALTER TABLE public.beer_reviews
  ADD CONSTRAINT beer_reviews_rating_check
  CHECK (rating >= 0.5 AND rating <= 5.0);

-- brewery_reviews: expand from 1-5 → 0.5-5.0
ALTER TABLE public.brewery_reviews
  DROP CONSTRAINT IF EXISTS brewery_reviews_rating_check;
ALTER TABLE public.brewery_reviews
  ADD CONSTRAINT brewery_reviews_rating_check
  CHECK (rating >= 0.5 AND rating <= 5.0);

-- beer_logs: ADD new CHECK (none existed previously, nullable)
ALTER TABLE public.beer_logs
  DROP CONSTRAINT IF EXISTS beer_logs_rating_check;
ALTER TABLE public.beer_logs
  ADD CONSTRAINT beer_logs_rating_check
  CHECK (rating IS NULL OR (rating >= 0.5 AND rating <= 5.0));

-- ─── Notify PostgREST to refresh schema ────────────────────────────────────
NOTIFY pgrst, 'reload schema';
