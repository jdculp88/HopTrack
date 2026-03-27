-- Migration 028: Glass type + pour sizes
-- Adds glass_type to beers and creates beer_pour_sizes table for multi-tier pricing
-- Sprint 19 — "The Pour"

-- ── Add glass_type to beers ───────────────────────────────────────────────────
ALTER TABLE public.beers
  ADD COLUMN IF NOT EXISTS glass_type text DEFAULT NULL;

-- ── Pour sizes table ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.beer_pour_sizes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beer_id       uuid REFERENCES public.beers(id) ON DELETE CASCADE NOT NULL,
  label         text NOT NULL,           -- "Taster", "Half Pint", "Pint", "Growler", "Flight", etc.
  oz            numeric DEFAULT NULL,    -- Optional ounces for display (null for flights)
  price         decimal(5,2) NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at    timestamptz DEFAULT now() NOT NULL
);

-- Index for fast lookup by beer
CREATE INDEX IF NOT EXISTS beer_pour_sizes_beer_id_idx
  ON public.beer_pour_sizes(beer_id);

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE public.beer_pour_sizes ENABLE ROW LEVEL SECURITY;

-- Public read (The Board is unauthenticated)
DROP POLICY IF EXISTS "Public can read pour sizes" ON public.beer_pour_sizes;
CREATE POLICY "Public can read pour sizes"
  ON public.beer_pour_sizes FOR SELECT
  USING (true);

-- Brewery admins can manage their own beers' pour sizes
DROP POLICY IF EXISTS "Brewery admins can manage pour sizes" ON public.beer_pour_sizes;
CREATE POLICY "Brewery admins can manage pour sizes"
  ON public.beer_pour_sizes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.beers b
      JOIN public.brewery_accounts ba ON ba.brewery_id = b.brewery_id
      WHERE b.id = beer_pour_sizes.beer_id
        AND ba.user_id = auth.uid()
    )
  );
