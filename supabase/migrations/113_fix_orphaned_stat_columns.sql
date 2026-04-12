-- Migration 113: Fix orphaned stat columns
-- Sprint 177 — The Plumbing
--
-- PROBLEM:
--   An audit of display-field write paths (2026-04-11) found two columns/tables
--   that are DISPLAYED in production but only WRITTEN by seed migrations:
--
--   1. profiles.unique_beers — displayed on 8+ consumer surfaces (profile Quick
--      Stats, You tab, Stats tab, friends leaderboard sort key, superadmin user
--      detail). The increment_xp RPC (migration 036) handles xp/level/streak/
--      unique_breweries but NOT unique_beers. Real users always see 0.
--
--   2. public.brewery_visits — the per-user-per-brewery rollup table. Read by 18
--      code paths including the entire Brand CRM (S129), brewery dashboard
--      New vs Returning %, AI promotion suggestions, consumer brewery page visit
--      history. Only INSERTED by seed migration 076. Real breweries see empty
--      Brand CRM customer lists.
--
-- FIX:
--   Three triggers + a backfill pass. Atomic, no application-layer changes
--   needed — every existing insert path to beer_logs/sessions is covered.
--
-- ROLLBACK:
--   Drop triggers + functions at the bottom of this file (commented out).
--   Data remains correct after backfill — only new writes would stop syncing.

-- ─────────────────────────────────────────────────────────────────────────────
-- PART 1 — Trigger: sync profiles.unique_beers on beer_log insert
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.sync_profile_unique_beers_on_beer_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Skip free-form entries (no beer_id means we can't track uniqueness)
  IF NEW.beer_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Only increment if this is the user's FIRST log of this beer.
  -- Check ALL other beer_logs (including those in other sessions) for this user+beer.
  IF NOT EXISTS (
    SELECT 1 FROM public.beer_logs
    WHERE user_id = NEW.user_id
      AND beer_id = NEW.beer_id
      AND id <> NEW.id
  ) THEN
    UPDATE public.profiles
    SET unique_beers = unique_beers + 1
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_profile_unique_beers ON public.beer_logs;
CREATE TRIGGER trg_sync_profile_unique_beers
  AFTER INSERT ON public.beer_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_unique_beers_on_beer_log();

-- ─────────────────────────────────────────────────────────────────────────────
-- PART 2 — Trigger: sync brewery_visits on session insert
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.sync_brewery_visits_on_session()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Skip home sessions (context='home', brewery_id NULL)
  IF NEW.brewery_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Upsert the visit row. On conflict, increment total_visits and update last_visit_at.
  -- first_visit_at stays as the original insert timestamp (preserved by DO UPDATE clause).
  INSERT INTO public.brewery_visits (
    user_id,
    brewery_id,
    total_visits,
    unique_beers_tried,
    first_visit_at,
    last_visit_at
  )
  VALUES (
    NEW.user_id,
    NEW.brewery_id,
    1,
    0,
    NEW.started_at,
    NEW.started_at
  )
  ON CONFLICT (user_id, brewery_id) DO UPDATE
    SET total_visits = public.brewery_visits.total_visits + 1,
        last_visit_at = GREATEST(public.brewery_visits.last_visit_at, EXCLUDED.last_visit_at);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_brewery_visits_on_session ON public.sessions;
CREATE TRIGGER trg_sync_brewery_visits_on_session
  AFTER INSERT ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_brewery_visits_on_session();

-- ─────────────────────────────────────────────────────────────────────────────
-- PART 3 — Trigger: sync brewery_visits.unique_beers_tried on beer_log insert
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.sync_brewery_visits_unique_beers_on_beer_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Skip if we don't have both a brewery_id AND a beer_id (can't track uniqueness)
  IF NEW.brewery_id IS NULL OR NEW.beer_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Only increment if this is the user's FIRST log of this beer AT THIS BREWERY.
  -- Check all other beer_logs for user+brewery+beer (excluding the current row).
  IF NOT EXISTS (
    SELECT 1 FROM public.beer_logs
    WHERE user_id = NEW.user_id
      AND brewery_id = NEW.brewery_id
      AND beer_id = NEW.beer_id
      AND id <> NEW.id
  ) THEN
    -- Ensure a brewery_visits row exists (session trigger creates it, but this
    -- handles the edge case of a beer_log inserted before a session for the brewery).
    INSERT INTO public.brewery_visits (
      user_id,
      brewery_id,
      total_visits,
      unique_beers_tried,
      first_visit_at,
      last_visit_at
    )
    VALUES (
      NEW.user_id,
      NEW.brewery_id,
      0,
      1,
      NEW.logged_at,
      NEW.logged_at
    )
    ON CONFLICT (user_id, brewery_id) DO UPDATE
      SET unique_beers_tried = public.brewery_visits.unique_beers_tried + 1;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_brewery_visits_unique_beers ON public.beer_logs;
CREATE TRIGGER trg_sync_brewery_visits_unique_beers
  AFTER INSERT ON public.beer_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_brewery_visits_unique_beers_on_beer_log();

-- ─────────────────────────────────────────────────────────────────────────────
-- PART 4 — Backfill: rebuild profiles.unique_beers from beer_logs
-- ─────────────────────────────────────────────────────────────────────────────
-- Recomputes unique_beers for every profile from the ground truth in beer_logs.
-- Overwrites the seed values in migrations 074/075/076 — they become accurate
-- after this pass.

UPDATE public.profiles p
SET unique_beers = COALESCE((
  SELECT COUNT(DISTINCT bl.beer_id)
  FROM public.beer_logs bl
  WHERE bl.user_id = p.id
    AND bl.beer_id IS NOT NULL
), 0);

-- ─────────────────────────────────────────────────────────────────────────────
-- PART 5 — Backfill: rebuild brewery_visits from sessions + beer_logs
-- ─────────────────────────────────────────────────────────────────────────────
-- Rebuilds the per-user-per-brewery rollup from real session + beer_log data.
-- Seed inserts from migration 076 are overwritten with ground-truth values.
--
-- NOTE: We DELETE existing brewery_visits rows first to avoid double-counting
-- from the triggers we just created — the triggers will fire again on the
-- INSERT below. Then we disable triggers for the backfill, insert clean rollup
-- data, and re-enable. This is the standard backfill pattern.

-- Disable triggers for the backfill so we don't double-fire
ALTER TABLE public.brewery_visits DISABLE TRIGGER USER;

-- Clear existing rows (seed data + any trigger-generated rows from above)
TRUNCATE TABLE public.brewery_visits;

-- Rebuild from real data
INSERT INTO public.brewery_visits (
  user_id,
  brewery_id,
  total_visits,
  unique_beers_tried,
  first_visit_at,
  last_visit_at
)
SELECT
  s.user_id,
  s.brewery_id,
  COUNT(DISTINCT s.id) AS total_visits,
  COALESCE(COUNT(DISTINCT bl.beer_id) FILTER (WHERE bl.beer_id IS NOT NULL), 0) AS unique_beers_tried,
  MIN(s.started_at) AS first_visit_at,
  MAX(s.started_at) AS last_visit_at
FROM public.sessions s
LEFT JOIN public.beer_logs bl ON bl.session_id = s.id
WHERE s.brewery_id IS NOT NULL
GROUP BY s.user_id, s.brewery_id;

-- Re-enable triggers
ALTER TABLE public.brewery_visits ENABLE TRIGGER USER;

-- ─────────────────────────────────────────────────────────────────────────────
-- PART 6 — Grants
-- ─────────────────────────────────────────────────────────────────────────────

GRANT EXECUTE ON FUNCTION public.sync_profile_unique_beers_on_beer_log() TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_brewery_visits_on_session() TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_brewery_visits_unique_beers_on_beer_log() TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- PART 7 — Force PostgREST schema reload
-- ─────────────────────────────────────────────────────────────────────────────
-- Standard HopTrack convention after trigger/function changes.

NOTIFY pgrst, 'reload schema';

-- ─────────────────────────────────────────────────────────────────────────────
-- ROLLBACK PLAN (run manually if needed)
-- ─────────────────────────────────────────────────────────────────────────────
-- DROP TRIGGER IF EXISTS trg_sync_profile_unique_beers ON public.beer_logs;
-- DROP TRIGGER IF EXISTS trg_sync_brewery_visits_on_session ON public.sessions;
-- DROP TRIGGER IF EXISTS trg_sync_brewery_visits_unique_beers ON public.beer_logs;
-- DROP FUNCTION IF EXISTS public.sync_profile_unique_beers_on_beer_log();
-- DROP FUNCTION IF EXISTS public.sync_brewery_visits_on_session();
-- DROP FUNCTION IF EXISTS public.sync_brewery_visits_unique_beers_on_beer_log();
-- NOTIFY pgrst, 'reload schema';
-- (Backfilled data remains correct; only new writes would stop syncing.)
