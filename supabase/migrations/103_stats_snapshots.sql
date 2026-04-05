-- Migration 103: Stats Snapshots + Percentile Buckets
-- Sprint 162 — The Identity
--
-- Pre-computes percentile rankings via daily cron.
-- Bucket-based architecture: store 101-value threshold arrays (P0-P100)
-- per style/brewery/overall. Users' percentile is O(log 100) bsearch lookup.

-- ─── style_percentile_buckets ──────────────────────────────────────────────
-- For each style, stores the beer count threshold at each percentile (0-100).
-- thresholds[p] = the beer count a user needs to be in the top (100-p)% for this style.

CREATE TABLE IF NOT EXISTS public.style_percentile_buckets (
  style text PRIMARY KEY,
  thresholds int[] NOT NULL,           -- exactly 101 elements (P0..P100)
  sample_size int NOT NULL DEFAULT 0,  -- total users in this bucket
  computed_at timestamptz NOT NULL DEFAULT now()
);

-- Public read (percentile data is not sensitive)
ALTER TABLE public.style_percentile_buckets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "style_percentile_buckets_read"
  ON public.style_percentile_buckets FOR SELECT
  USING (true);

-- ─── brewery_percentile_buckets ────────────────────────────────────────────
-- Same shape as style buckets, keyed by brewery_id.

CREATE TABLE IF NOT EXISTS public.brewery_percentile_buckets (
  brewery_id uuid PRIMARY KEY REFERENCES public.breweries(id) ON DELETE CASCADE,
  thresholds int[] NOT NULL,
  sample_size int NOT NULL DEFAULT 0,
  computed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.brewery_percentile_buckets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "brewery_percentile_buckets_read"
  ON public.brewery_percentile_buckets FOR SELECT
  USING (true);

-- ─── overall_percentile_buckets ────────────────────────────────────────────
-- Global buckets (e.g. "beer count across all users"). Single row keyed by metric.

CREATE TABLE IF NOT EXISTS public.overall_percentile_buckets (
  metric text PRIMARY KEY,             -- e.g. "beers", "sessions", "breweries"
  thresholds int[] NOT NULL,
  sample_size int NOT NULL DEFAULT 0,
  computed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.overall_percentile_buckets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "overall_percentile_buckets_read"
  ON public.overall_percentile_buckets FOR SELECT
  USING (true);

-- ─── user_stats_snapshots ──────────────────────────────────────────────────
-- Per-user computed percentiles. Written by cron, read by profile pages.

CREATE TABLE IF NOT EXISTS public.user_stats_snapshots (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Overall percentiles
  total_beers int NOT NULL DEFAULT 0,
  total_beers_percentile int,          -- 0-100, nullable if no global bucket yet
  unique_beers int NOT NULL DEFAULT 0,
  unique_beers_percentile int,
  unique_styles int NOT NULL DEFAULT 0,
  unique_styles_percentile int,

  -- Top style (user's #1 by count) + their rank within that style's drinkers
  top_style text,
  top_style_count int NOT NULL DEFAULT 0,
  top_style_percentile int,

  -- Top brewery (user's most-visited) + their rank within that brewery's regulars
  top_brewery_id uuid REFERENCES public.breweries(id) ON DELETE SET NULL,
  top_brewery_visits int NOT NULL DEFAULT 0,
  top_brewery_percentile int,

  -- Full style breakdown for "rarity flex" per-style percentile lookup
  -- Shape: [{ style, count, percentile }]
  style_breakdown jsonb NOT NULL DEFAULT '[]'::jsonb,

  computed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_stats_snapshots_computed_at
  ON public.user_stats_snapshots(computed_at DESC);

-- Public read (profile identity surface)
ALTER TABLE public.user_stats_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_stats_snapshots_read_all"
  ON public.user_stats_snapshots FOR SELECT
  USING (true);

-- Only service role writes (via cron); no user-level writes
-- (no INSERT/UPDATE/DELETE policies = default deny for authenticated users)

NOTIFY pgrst, 'reload schema';
