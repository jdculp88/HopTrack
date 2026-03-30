-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 047: Fix user_id FKs on beer_reviews + brewery_reviews
--
-- Both tables currently have user_id → auth.users(id).
-- PostgREST cannot resolve the `profile:profiles(...)` embedded join because
-- there is no FK path from these tables to public.profiles — only to auth.users,
-- which lives in a schema PostgREST cannot traverse.
--
-- Fix: re-point user_id to public.profiles(id) instead.
-- profiles.id is itself a FK to auth.users(id), so cascade-delete integrity is
-- preserved: auth.users → profiles → reviews.
-- ─────────────────────────────────────────────────────────────────────────────

-- beer_reviews
ALTER TABLE public.beer_reviews
  DROP CONSTRAINT beer_reviews_user_id_fkey,
  ADD CONSTRAINT beer_reviews_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- brewery_reviews
ALTER TABLE public.brewery_reviews
  DROP CONSTRAINT brewery_reviews_user_id_fkey,
  ADD CONSTRAINT brewery_reviews_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Notify PostgREST to reload schema cache so the new FK is immediately usable
NOTIFY pgrst, 'reload schema';
