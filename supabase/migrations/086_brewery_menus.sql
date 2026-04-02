-- Migration 086: Brewery Menus + Breweries RLS fix (Sprint 128 — The Menu)
-- 1) Ensures public SELECT on breweries table (fixes brand page 0 locations bug from S127)
-- 2) Creates brewery_menus table for multi-category menu image uploads (REQ-070)

-- ─── Fix: Ensure breweries are publicly readable ─────────────────────────────
-- This policy may have been created via dashboard but never in a migration file.
-- Without it, server-side (anon) queries filtering by brand_id return 0 rows.
DROP POLICY IF EXISTS "Breweries are publicly readable" ON public.breweries;
CREATE POLICY "Breweries are publicly readable" ON public.breweries
  FOR SELECT USING (true);

-- ─── Brewery Menus table ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.brewery_menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brewery_id uuid NOT NULL REFERENCES public.breweries(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN (
    'food', 'happy_hour', 'wine', 'cocktail',
    'non_alcoholic', 'seasonal', 'kids', 'brunch'
  )),
  title text,
  image_urls text[] NOT NULL DEFAULT '{}',
  display_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (brewery_id, category)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_brewery_menus_brewery_id ON public.brewery_menus(brewery_id);

-- RLS
ALTER TABLE public.brewery_menus ENABLE ROW LEVEL SECURITY;

-- Public can read active menus
CREATE POLICY "brewery_menus_public_read"
  ON public.brewery_menus FOR SELECT
  USING (is_active = true);

-- Brewery staff can read all their menus (including inactive)
CREATE POLICY "brewery_menus_staff_read_all"
  ON public.brewery_menus FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.brewery_accounts
      WHERE brewery_accounts.brewery_id = brewery_menus.brewery_id
        AND brewery_accounts.user_id = auth.uid()
    )
  );

-- Brewery staff can insert menus
CREATE POLICY "brewery_menus_staff_insert"
  ON public.brewery_menus FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.brewery_accounts
      WHERE brewery_accounts.brewery_id = brewery_menus.brewery_id
        AND brewery_accounts.user_id = auth.uid()
    )
  );

-- Brewery staff can update their menus
CREATE POLICY "brewery_menus_staff_update"
  ON public.brewery_menus FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.brewery_accounts
      WHERE brewery_accounts.brewery_id = brewery_menus.brewery_id
        AND brewery_accounts.user_id = auth.uid()
    )
  );

-- Brewery staff can delete their menus
CREATE POLICY "brewery_menus_staff_delete"
  ON public.brewery_menus FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.brewery_accounts
      WHERE brewery_accounts.brewery_id = brewery_menus.brewery_id
        AND brewery_accounts.user_id = auth.uid()
    )
  );

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
