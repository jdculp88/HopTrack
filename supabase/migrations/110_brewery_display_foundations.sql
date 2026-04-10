-- Sprint A — The Display Suite Foundation
-- Adds brand color, theme, font, display-scale, orientation, and short-slug columns
-- to `breweries`. These columns power:
--   * Board theme system (10 preset themes + per-brewery custom brand color)
--   * Big-screen scaling (monitor / large-tv / cinema) — board font sizes and glass
--     art multiply by the scale factor so the Board reads correctly on 55"+ TVs
--   * Horizontal/vertical TV orientation support (closes the taplist.io gap)
--   * Short URL support (hoptrack.beer/b/{slug}) for the QR menu in Sprint B
--   * QR code branding (dark/light colors, logo embed toggle)
--
-- No new RLS required — `breweries` already has public-read / staff-write policies.

ALTER TABLE public.breweries
  ADD COLUMN IF NOT EXISTS brand_color text,
  ADD COLUMN IF NOT EXISTS brand_color_secondary text,
  ADD COLUMN IF NOT EXISTS board_theme_id text DEFAULT 'cream-classic',
  ADD COLUMN IF NOT EXISTS board_font_id text DEFAULT 'classic',
  ADD COLUMN IF NOT EXISTS board_background_url text,
  ADD COLUMN IF NOT EXISTS board_background_opacity int DEFAULT 100
    CHECK (board_background_opacity BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS board_orientation text DEFAULT 'horizontal'
    CHECK (board_orientation IN ('horizontal', 'vertical')),
  ADD COLUMN IF NOT EXISTS board_display_scale text DEFAULT 'auto'
    CHECK (board_display_scale IN ('auto', 'monitor', 'large-tv', 'cinema')),
  ADD COLUMN IF NOT EXISTS short_slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS qr_dark_color text DEFAULT '#1A1714',
  ADD COLUMN IF NOT EXISTS qr_light_color text DEFAULT '#FBF7F0',
  ADD COLUMN IF NOT EXISTS qr_logo_enabled boolean NOT NULL DEFAULT false;

-- Short-slug lookup index (partial — only rows with a slug set)
CREATE INDEX IF NOT EXISTS idx_breweries_short_slug
  ON public.breweries(short_slug)
  WHERE short_slug IS NOT NULL;

NOTIFY pgrst, 'reload schema';
