/**
 * Board themes — Sprint A (The Display Suite)
 *
 * A theme is a named palette + font pair + optional background image that
 * drives the visual identity of the Board, Print PDF, Web menu, and Embed
 * iframe. A single theme makes "one source, many surfaces" literal: changing
 * your theme once updates every customer-facing menu surface instantly.
 *
 * This module ships **10 preset themes** as readonly code constants. In
 * Sprint B we'll add support for per-brewery custom theme rows via a new
 * `board_themes` table — but the preset list is the starting point every
 * brewery picks from, and `brand-custom` is the polymorphic theme that
 * reads `brewery.brand_color` / `brand_color_secondary` to re-skin the base.
 *
 * Themes plug into the Board via CSS variables. `BoardClient.tsx` sets
 * `--board-bg`, `--board-accent`, `--board-text`, etc. on its root div from
 * the resolved theme; the existing `C` palette in `board-types.ts` references
 * those CSS vars, so format components need zero changes to consume themes.
 *
 * Pure data + resolver function. No React, no Supabase.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

/** Built-in theme IDs. Custom themes (Sprint B) get UUIDs from board_themes. */
export type BoardPresetId =
  | "cream-classic"
  | "midnight-gold"
  | "slate-chalk"
  | "neon-haze"
  | "hop-harvest"
  | "stout-roast"
  | "coastal-salt"
  | "burgundy-barrel"
  | "rose-orchard"
  | "brand-custom";

/** A theme ID can be a preset or a custom UUID. */
export type BoardThemeId = BoardPresetId | string;

/** The resolved palette after applying any brewery-level overrides. */
export interface BoardPalette {
  /** Main background color (formerly `C.cream`). */
  bg: string;
  /** Accent / brand color (formerly `C.gold`). Used for prices, featured borders, highlights. */
  accent: string;
  /** Primary text color (formerly `C.text`). */
  text: string;
  /** Muted text color (formerly `C.textMuted`). Used for style labels, metadata. */
  textMuted: string;
  /** Subtle text color (formerly `C.textSubtle`). Used for tertiary stats. */
  textSubtle: string;
  /** Border / divider color (formerly `C.border`). */
  border: string;
  /** Semi-transparent background for chips / pill buttons (formerly `C.chipBg`). */
  chipBg: string;
  /** Border for chips (formerly `C.chipBorder`). */
  chipBorder: string;
  /** Danger color for 86'd items (formerly `C.danger`). */
  danger: string;
}

/** Complete theme record — palette + font pair + optional metadata. */
export interface BoardTheme {
  id: BoardThemeId;
  name: string;
  /** Base palette — overridden by brewery brand color for the `brand-custom` theme. */
  palette: BoardPalette;
  /** Font pair ID — see lib/board-fonts.ts. */
  fontId: string;
  /** Optional short description used in the admin theme picker. */
  description?: string;
  /** Optional default background image key — maps to public/board-backgrounds/{key}.jpg. */
  defaultBackground?: string;
  /** Whether this theme is designed as a "dark" base (affects contrast math when brand-custom is applied). */
  isDark: boolean;
}

// ─── The 10 preset themes ─────────────────────────────────────────────────────

export const PRESET_THEMES: Record<BoardPresetId, BoardTheme> = {
  "cream-classic": {
    id: "cream-classic",
    name: "Cream Classic",
    description: "The original. Cream background with warm gold accents — Sprint 167's default look.",
    fontId: "classic",
    isDark: false,
    palette: {
      bg:         "#FBF7F0",
      accent:     "#D4A843",
      text:       "#1A1714",
      textMuted:  "#6B5E4E",
      textSubtle: "#9E8E7A",
      border:     "#E5DDD0",
      chipBg:     "rgba(251,247,240,0.85)",
      chipBorder: "#DDD5C5",
      danger:     "#C44B3A",
    },
  },

  "midnight-gold": {
    id: "midnight-gold",
    name: "Midnight Gold",
    description: "OLED-friendly dark mode with gold accents. Elegant and dramatic on TVs at night.",
    fontId: "classic",
    isDark: true,
    palette: {
      bg:         "#0A0906",
      accent:     "#D4A843",
      text:       "#F5F0E8",
      textMuted:  "#BFA888",
      textSubtle: "#8F8066",
      border:     "#2A231A",
      chipBg:     "rgba(26,23,20,0.85)",
      chipBorder: "#3A3226",
      danger:     "#E66B5A",
    },
  },

  "slate-chalk": {
    id: "slate-chalk",
    name: "Slate Chalk",
    description: "Hand-drawn chalkboard aesthetic. Pairs with the Chalkboard format in Sprint B.",
    fontId: "chalk",
    isDark: true,
    palette: {
      bg:         "#1F2624",
      accent:     "#FFFFFF",
      text:       "#F4F1E8",
      textMuted:  "#C4BDA8",
      textSubtle: "#8F8875",
      border:     "#3A4240",
      chipBg:     "rgba(31,38,36,0.85)",
      chipBorder: "#4A5250",
      danger:     "#E66B5A",
    },
  },

  "neon-haze": {
    id: "neon-haze",
    name: "Neon Haze",
    description: "Hazy IPA neon-bar vibe. Dark slate with electric green and warm amber.",
    fontId: "modern",
    isDark: true,
    palette: {
      bg:         "#0D1117",
      accent:     "#7FFF8E",
      text:       "#F0F4F2",
      textMuted:  "#A8B8B0",
      textSubtle: "#7A8A82",
      border:     "#1F2A32",
      chipBg:     "rgba(13,17,23,0.85)",
      chipBorder: "#2A3640",
      danger:     "#FF8070",
    },
  },

  "hop-harvest": {
    id: "hop-harvest",
    name: "Hop Harvest",
    description: "Farmhouse aesthetic. Warm cream with hop-field green and earthy tones.",
    fontId: "rustic",
    isDark: false,
    palette: {
      bg:         "#F5F1E8",
      accent:     "#4A7C59",
      text:       "#2A3A2E",
      textMuted:  "#5A6B5E",
      textSubtle: "#8A9890",
      border:     "#D8D2C0",
      chipBg:     "rgba(245,241,232,0.85)",
      chipBorder: "#C8C2B0",
      danger:     "#B85C4A",
    },
  },

  "stout-roast": {
    id: "stout-roast",
    name: "Stout Roast",
    description: "Espresso brown with burnished gold. Barrel-aged and cozy.",
    fontId: "vintage",
    isDark: true,
    palette: {
      bg:         "#1E140B",
      accent:     "#B8863B",
      text:       "#E8D9B8",
      textMuted:  "#B8A88A",
      textSubtle: "#8A7A5C",
      border:     "#3A2A1A",
      chipBg:     "rgba(30,20,11,0.85)",
      chipBorder: "#4A3A2A",
      danger:     "#E66B5A",
    },
  },

  "coastal-salt": {
    id: "coastal-salt",
    name: "Coastal Salt",
    description: "Beachy and briny. Pale sky with steel blue accents — perfect for Gose and sour programs.",
    fontId: "editorial",
    isDark: false,
    palette: {
      bg:         "#F5FBFC",
      accent:     "#4A7B9B",
      text:       "#1A2832",
      textMuted:  "#5A6B7A",
      textSubtle: "#8A98A8",
      border:     "#D8E2E8",
      chipBg:     "rgba(245,251,252,0.85)",
      chipBorder: "#C8D2D8",
      danger:     "#C44B3A",
    },
  },

  "burgundy-barrel": {
    id: "burgundy-barrel",
    name: "Burgundy Barrel",
    description: "Deep wine red with antique gold. Barrel-aged sours and wine programs.",
    fontId: "vintage",
    isDark: true,
    palette: {
      bg:         "#2B0F14",
      accent:     "#C8A96A",
      text:       "#F3E9D2",
      textMuted:  "#C8B898",
      textSubtle: "#9A8870",
      border:     "#4A2028",
      chipBg:     "rgba(43,15,20,0.85)",
      chipBorder: "#5A3038",
      danger:     "#E66B5A",
    },
  },

  "rose-orchard": {
    id: "rose-orchard",
    name: "Rose Orchard",
    description: "Orchard rose for cider programs. Soft pink with deep rose accents.",
    fontId: "rustic",
    isDark: false,
    palette: {
      bg:         "#FFF0F3",
      accent:     "#B85C4A",
      text:       "#2A1614",
      textMuted:  "#6B4A48",
      textSubtle: "#9A7A78",
      border:     "#F0D8DC",
      chipBg:     "rgba(255,240,243,0.85)",
      chipBorder: "#E8C8CC",
      danger:     "#8C2A1A",
    },
  },

  "brand-custom": {
    id: "brand-custom",
    name: "Your Brand",
    description: "Uses your brewery's brand color across the Board. Cask tier.",
    fontId: "classic",
    isDark: false,
    // Palette is a placeholder — `resolveTheme` replaces it from brewery.brand_color
    palette: {
      bg:         "#FBF7F0",
      accent:     "#D4A843",
      text:       "#1A1714",
      textMuted:  "#6B5E4E",
      textSubtle: "#9E8E7A",
      border:     "#E5DDD0",
      chipBg:     "rgba(251,247,240,0.85)",
      chipBorder: "#DDD5C5",
      danger:     "#C44B3A",
    },
  },
};

/** All preset IDs in display order (used for theme picker UI). */
export const PRESET_THEME_ORDER: readonly BoardPresetId[] = [
  "cream-classic",
  "midnight-gold",
  "slate-chalk",
  "neon-haze",
  "hop-harvest",
  "stout-roast",
  "coastal-salt",
  "burgundy-barrel",
  "rose-orchard",
  "brand-custom",
] as const;

// ─── Resolver ─────────────────────────────────────────────────────────────────

/** Minimum brewery row shape needed for theme resolution. */
export interface BreweryThemeInfo {
  board_theme_id?: string | null;
  brand_color?: string | null;
  brand_color_secondary?: string | null;
}

/**
 * Resolve a theme ID against a brewery row. Returns a complete BoardTheme:
 *
 * 1. If `themeId === 'brand-custom'` and the brewery has `brand_color`, return
 *    the brand-custom theme with its palette re-skinned from brand_color.
 * 2. If `themeId` is a known preset ID, return it as-is.
 * 3. Otherwise fall back to `cream-classic` (the Sprint 167 default — safe).
 *
 * Pure function. No async. Safe in render paths.
 */
export function resolveTheme(
  brewery: BreweryThemeInfo | null | undefined,
  themeId: BoardThemeId | null | undefined,
): BoardTheme {
  const resolved = themeId ?? brewery?.board_theme_id ?? "cream-classic";

  // Brand-custom: apply brewery's brand color to a sensible base
  if (resolved === "brand-custom") {
    const brandColor = brewery?.brand_color;
    if (!brandColor) {
      // No brand color set — fall back to cream-classic so nothing breaks
      return PRESET_THEMES["cream-classic"];
    }
    return applyBrandColor(PRESET_THEMES["brand-custom"], brandColor);
  }

  // Known preset — return as-is
  if (resolved in PRESET_THEMES) {
    return PRESET_THEMES[resolved as BoardPresetId];
  }

  // Unknown themeId (likely a custom theme UUID from Sprint B's board_themes table,
  // or a stale/invalid value) — fall back to default
  return PRESET_THEMES["cream-classic"];
}

/**
 * Apply a brand color to a theme's palette. Primarily used by `brand-custom`.
 * Strategy: replace the `accent` color with the brand color, leave everything
 * else from the base palette intact. Callers can pass any preset as the base.
 */
export function applyBrandColor(base: BoardTheme, brandColor: string): BoardTheme {
  return {
    ...base,
    palette: {
      ...base.palette,
      accent: brandColor,
    },
  };
}

// ─── CSS variable helpers ─────────────────────────────────────────────────────

/**
 * Convert a resolved theme's palette into a CSS variable object suitable for
 * React's inline `style` prop. These variables are consumed by the `C` palette
 * in `board-types.ts`.
 *
 *   <div style={{ ...themeToCssVars(theme) }}>
 *     <Board />
 *   </div>
 */
export function themeToCssVars(theme: BoardTheme): Record<string, string> {
  const p = theme.palette;
  return {
    "--board-bg":          p.bg,
    "--board-accent":      p.accent,
    "--board-text":        p.text,
    "--board-text-muted":  p.textMuted,
    "--board-text-subtle": p.textSubtle,
    "--board-border":      p.border,
    "--board-chip-bg":     p.chipBg,
    "--board-chip-border": p.chipBorder,
    "--board-danger":      p.danger,
  };
}
