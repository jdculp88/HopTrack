-- Sprint 181 — Personalized Beer of the Week cache
--
-- Stores one pick per (user, ISO week). The personalized scoring runs once
-- per week per user; subsequent reads are a single indexed lookup. Picks
-- automatically rotate when the iso_week key changes (Monday UTC).
--
-- The cache is regenerable from current code at any time, so we don't need
-- backups or rollback drama. If the algorithm changes, delete a row and the
-- next request will compute a fresh pick.

CREATE TABLE IF NOT EXISTS public.botw_picks (
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  iso_week   text        NOT NULL,                    -- e.g. '2026-W18'
  beer_id    uuid        NOT NULL REFERENCES public.beers(id) ON DELETE CASCADE,
  score      numeric     NOT NULL,
  reasons    text[]      NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, iso_week)
);

-- Lookup by week alone is useful for analytics ("what was everyone's pick last
-- week"), so an index on iso_week pays off cheaply.
CREATE INDEX IF NOT EXISTS idx_botw_picks_iso_week
  ON public.botw_picks (iso_week);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.botw_picks ENABLE ROW LEVEL SECURITY;

-- A user can read their own pick. Service role bypasses RLS for the rare
-- analytics query.
CREATE POLICY "botw_picks_select_own"
  ON public.botw_picks FOR SELECT
  USING (auth.uid() = user_id);

-- A user can write their own pick (the feed loader runs as the user).
CREATE POLICY "botw_picks_insert_own"
  ON public.botw_picks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "botw_picks_update_own"
  ON public.botw_picks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';

-- ─── Rollback ────────────────────────────────────────────────────────────────
-- DROP TABLE IF EXISTS public.botw_picks;
-- NOTIFY pgrst, 'reload schema';
