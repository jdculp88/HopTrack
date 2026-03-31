-- Migration 051: The Barback — AI-powered brewery website crawler schema
-- Sprint 79: Pilot foundation for Charlotte NC metro area
-- Author: Quinn (Infrastructure Engineer), Architecture: Jordan

-- =============================================================================
-- 1. crawl_sources — per-brewery crawl configuration
-- =============================================================================
CREATE TABLE IF NOT EXISTS crawl_sources (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brewery_id      uuid NOT NULL UNIQUE REFERENCES breweries(id) ON DELETE CASCADE,
  crawl_url       text,                        -- override URL (null = use brewery.website_url)
  crawl_enabled   boolean NOT NULL DEFAULT true,
  crawl_mode      text NOT NULL DEFAULT 'unclaimed'
                    CHECK (crawl_mode IN ('unclaimed', 'ai_managed', 'disabled')),
  robots_allowed  boolean DEFAULT true,
  last_crawled_at timestamptz,
  last_html_hash  text,                        -- skip AI if HTML unchanged
  next_crawl_at   timestamptz DEFAULT now(),
  crawl_interval  interval NOT NULL DEFAULT '7 days',
  consecutive_failures int DEFAULT 0,
  notes           text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_crawl_sources_next ON crawl_sources(next_crawl_at)
  WHERE crawl_enabled = true;

-- =============================================================================
-- 2. crawl_jobs — one row per crawl attempt per brewery
-- =============================================================================
CREATE TABLE IF NOT EXISTS crawl_jobs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brewery_id    uuid NOT NULL REFERENCES breweries(id) ON DELETE CASCADE,
  status        text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'fetching', 'parsing', 'reviewing', 'completed', 'failed', 'skipped')),
  source_url    text,
  http_status   int,
  raw_html_hash text,
  raw_html_size int,
  tokens_used   int,
  cost_usd      numeric(8,6),
  beers_found   int DEFAULT 0,
  beers_added   int DEFAULT 0,
  error_message text,
  retry_count   int DEFAULT 0,
  started_at    timestamptz,
  completed_at  timestamptz,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_crawl_jobs_brewery ON crawl_jobs(brewery_id);
CREATE INDEX idx_crawl_jobs_status ON crawl_jobs(status);
CREATE INDEX idx_crawl_jobs_created ON crawl_jobs(created_at DESC);

-- =============================================================================
-- 3. crawled_beers — staging table (never goes directly to production beers)
-- =============================================================================
CREATE TABLE IF NOT EXISTS crawled_beers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crawl_job_id    uuid NOT NULL REFERENCES crawl_jobs(id) ON DELETE CASCADE,
  brewery_id      uuid NOT NULL REFERENCES breweries(id) ON DELETE CASCADE,
  name            text NOT NULL,
  style           text,
  mapped_style    text,                        -- our canonical BeerStyle mapping
  abv             numeric(4,2),
  ibu             int,
  description     text,
  confidence      numeric(3,2) NOT NULL DEFAULT 0.00,
  status          text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected', 'promoted', 'stale')),
  matched_beer_id uuid REFERENCES beers(id),
  source_text     text,                        -- exact text snippet the AI extracted from
  reviewed_by     uuid REFERENCES profiles(id),
  reviewed_at     timestamptz,
  rejection_reason text,
  promoted_at     timestamptz,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_crawled_beers_brewery ON crawled_beers(brewery_id);
CREATE INDEX idx_crawled_beers_status ON crawled_beers(status);
CREATE INDEX idx_crawled_beers_job ON crawled_beers(crawl_job_id);

-- =============================================================================
-- 4. Add provenance columns to existing tables
-- =============================================================================

-- beers: track where beer data came from
ALTER TABLE beers
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual'
    CHECK (source IN ('manual', 'seed', 'crawled', 'ai_managed')),
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS last_verified_at timestamptz;

-- breweries: track crawl state
ALTER TABLE breweries
  ADD COLUMN IF NOT EXISTS data_source text DEFAULT 'manual'
    CHECK (data_source IN ('manual', 'seed', 'crawled', 'ai_managed')),
  ADD COLUMN IF NOT EXISTS last_crawled_at timestamptz,
  ADD COLUMN IF NOT EXISTS crawl_beer_count int DEFAULT 0;

-- =============================================================================
-- 5. Tag Sprint 78 Kaggle seed beers
-- =============================================================================
-- Beers from migration 049 (Kaggle) that were bulk-imported
-- These have no freshness guarantee — mark them as seed data
UPDATE beers SET source = 'seed' WHERE source = 'manual' AND created_at < '2026-03-31T12:00:00Z';

-- Breweries from migration 048 (Open Brewery DB)
UPDATE breweries SET data_source = 'seed' WHERE data_source = 'manual' AND external_id IS NOT NULL;

-- =============================================================================
-- 6. RLS policies — superadmin only for all Barback tables
-- =============================================================================
ALTER TABLE crawl_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawled_beers ENABLE ROW LEVEL SECURITY;

-- Superadmin read/write access
CREATE POLICY "Superadmin full access on crawl_sources"
  ON crawl_sources FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_superadmin = true)
  );

CREATE POLICY "Superadmin full access on crawl_jobs"
  ON crawl_jobs FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_superadmin = true)
  );

CREATE POLICY "Superadmin full access on crawled_beers"
  ON crawled_beers FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_superadmin = true)
  );

-- Service role bypasses RLS (used by the barback script)
