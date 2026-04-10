/**
 * Shared types and design constants for the Board display.
 * Imported by BoardClient and all board sub-components.
 *
 * Sprint A (Display Suite):
 *   - `C` palette now points to CSS variables set by BoardClient from the
 *     active theme. Format components still reference `C.cream`, `C.gold`,
 *     etc. — they resolve at render time via var() lookups.
 *   - `BoardSettings` gains a `displayScale` field for big-screen support.
 *   - New `getScaledFS()` helper returns FS values multiplied by the active
 *     display scale (monitor/large-tv/cinema).
 *   - Legacy Sprint 167 behavior is preserved when `displayScale = "monitor"`.
 */

import type { PourSize } from "@/lib/glassware";
import {
  scaleFSEntry,
  resolveDisplayScale,
  type DisplayScale,
  type ResolvedDisplayScale,
  type FSEntry,
} from "@/lib/board-display-scale";

// ─── Re-export PourSize + display scale types ─────────────────────────────────
export type { PourSize };
export type { DisplayScale, ResolvedDisplayScale, FSEntry };

// ─── Data shapes ──────────────────────────────────────────────────────────────

export interface BoardBeer {
  id: string;
  name: string;
  style: string | null;
  abv: number | null;
  ibu: number | null;
  description: string | null;
  is_featured: boolean;
  is_on_tap: boolean;
  is_86d?: boolean;
  avg_rating: number | null;
  price_per_pint?: number | null;
  promo_text?: string | null;
  glass_type?: string | null;
  item_type?: string;
  category?: string | null;
}

export interface BoardEvent {
  id: string;
  title: string;
  event_date: string;
  start_time: string | null;
}

export interface BeerStats {
  pourCount: number;
  avgRating: number | null;
  biggestFan: string | null;
}

export interface BreweryStats {
  totalPours: number;
  uniqueVisitors: number;
  topRatedBeer: string | null;
  topRatedScore: number | null;
  mostPopularBeer: string | null;
  mostPopularCount: number;
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export type FontSize = "medium" | "large" | "xl";
export type BoardDisplayFormat = "classic" | "compact" | "slideshow";

export interface BoardSettings {
  fontSize: FontSize;
  displayFormat: BoardDisplayFormat;
  showABV: boolean;
  showDesc: boolean;
  showPrice: boolean;
  showRating: boolean;
  showStyle: boolean;
  showStats: boolean;
  showGlass: boolean;
  /**
   * Sprint A: big-screen display scale.
   *   - "auto"      — detect viewport, pick preset (default)
   *   - "monitor"   — 1× (Sprint 167 back-compat for small displays)
   *   - "large-tv"  — 2× (55"–65" 1080p TVs)
   *   - "cinema"    — 3× (75"+ 4K TVs)
   * Persisted in localStorage alongside other settings; also readable from
   * `breweries.board_display_scale` so the setting survives across devices.
   */
  displayScale?: DisplayScale;
  /**
   * Sprint A: client-side theme override. When set, this takes precedence
   * over `breweries.board_theme_id`. Lets the brewery owner preview themes
   * without a server round-trip. Sprint B adds a server-side API for
   * persisting theme choices across devices.
   */
  themeId?: string;
  /**
   * Sprint A: Slideshow auto-advance duration in milliseconds. Used only by
   * the Slideshow format. Range: 3000–15000. Default: 6000. Settings UI for
   * this lives in a later sprint — the field is here so the slide timer can
   * already read it.
   */
  slideDurationMs?: number;
}

export const DEFAULT_SETTINGS: BoardSettings = {
  fontSize: "large",
  displayFormat: "classic",
  showABV: true,
  showDesc: false,
  showPrice: true,
  showRating: true,
  showStyle: true,
  showStats: true,
  showGlass: true,
  displayScale: "auto",
  slideDurationMs: 6000,
};

/** Recommended defaults when switching to a format */
export const FORMAT_DEFAULTS: Record<BoardDisplayFormat, Partial<BoardSettings>> = {
  classic:   {},
  compact:   { showGlass: false, showDesc: false, showRating: false, showStats: false, showStyle: false, showABV: false },
  slideshow: { showGlass: true, showStyle: true, showDesc: true, showStats: true, showRating: true, showABV: true },
};

/** Settings that a format FORCES regardless of user toggle */
export const FORMAT_FORCED: Record<BoardDisplayFormat, Partial<BoardSettings>> = {
  classic:   {},
  compact:   { showGlass: false, showDesc: false, showRating: false, showStats: false },
  slideshow: {},
};

/** Apply forced overrides for the active format */
export function getEffectiveSettings(settings: BoardSettings): BoardSettings {
  const forced = FORMAT_FORCED[settings.displayFormat] ?? {};
  return { ...settings, ...forced };
}

export const FORMAT_LABELS: Record<BoardDisplayFormat, string> = {
  classic:   "Classic",
  compact:   "Compact",
  slideshow: "Slideshow",
};

// ─── Design constants (theme-aware palette) ───────────────────────────────────
//
// Sprint A: `C` now references CSS variables set by `BoardClient.tsx` from
// the resolved theme. Every hex fallback matches the `cream-classic` preset
// so any inline style that renders before the theme is applied (SSR first
// paint, tests, tool previews) still looks like Sprint 167 by default.
//
// Format components continue to use `C.cream`, `C.gold`, etc. — zero API
// churn. They get re-themed automatically when the brewery picks a new theme.

export const C = {
  cream:      "var(--board-bg, #FBF7F0)",
  gold:       "var(--board-accent, #D4A843)",
  text:       "var(--board-text, #1A1714)",
  textMuted:  "var(--board-text-muted, #6B5E4E)",
  textSubtle: "var(--board-text-subtle, #9E8E7A)",
  border:     "var(--board-border, #E5DDD0)",
  chipBg:     "var(--board-chip-bg, rgba(251,247,240,0.85))",
  chipBorder: "var(--board-chip-border, #DDD5C5)",
  danger:     "var(--board-danger, #C44B3A)",
} as const;

export const EASE = [0.16, 1, 0.3, 1] as const;

// ─── Section label map (for multi-type boards) ────────────────────────────────

export const BOARD_SECTION_LABELS: Record<string, { label: string; emoji: string }> = {
  beer:        { label: "Beers",          emoji: "🍺" },
  cider:       { label: "Ciders",         emoji: "🍏" },
  wine:        { label: "Wine",           emoji: "🍷" },
  cocktail:    { label: "Cocktails",      emoji: "🍹" },
  na_beverage: { label: "Non-Alcoholic",  emoji: "🥤" },
  food:        { label: "Food & Snacks",  emoji: "🍽️" },
};

// ─── Font-size dimension map ──────────────────────────────────────────────────
//
// Base "monitor-scale" dimensions. For large-tv and cinema scales, callers
// should use `getScaledFS(settings)` below which multiplies these values by
// the active display scale factor (2× / 3×).

export const FS: Record<FontSize, FSEntry> = {
  // Sprint A: `stat` reduced from its Sprint 167 values (12/14/16 → 9/10/11)
  // per Joshua's feedback — ratings, pours, and biggest-fan are context, not headlines.
  medium: { name: 34, style: 14, meta: 13, price: 28, stat:  9, chipLabel: 10, chipOz:  9, chipPrice: 18, chipPadV: 5, chipPadH: 10, glasslabel:  9, glassW:  44, glassH:  63 },
  large:  { name: 42, style: 16, meta: 15, price: 36, stat: 10, chipLabel: 11, chipOz: 10, chipPrice: 20, chipPadV: 6, chipPadH: 12, glasslabel: 10, glassW:  56, glassH:  80 },
  xl:     { name: 54, style: 19, meta: 17, price: 46, stat: 11, chipLabel: 13, chipOz: 11, chipPrice: 24, chipPadV: 8, chipPadH: 14, glasslabel: 11, glassW:  70, glassH: 100 },
};

/**
 * Get the active FS entry, scaled by the settings' displayScale.
 *
 * This is the replacement for direct `FS[settings.fontSize]` access in format
 * components. When the brewery hasn't chosen a scale (or chose "auto"), the
 * caller should pass a resolved scale computed by `resolveDisplayScale()` —
 * e.g., `getScaledFS(settings, resolvedScale)`.
 *
 * Example:
 *   const fs = getScaledFS(settings, resolvedScale);
 *   <div style={{ fontSize: fs.name }}>{beer.name}</div>
 */
export function getScaledFS(
  settings: BoardSettings,
  resolvedScale: ResolvedDisplayScale = "monitor",
): FSEntry {
  return scaleFSEntry(FS[settings.fontSize], resolvedScale);
}

/**
 * Resolve the brewery's chosen display scale against the current viewport.
 * Thin wrapper around `lib/board-display-scale.ts` so format components
 * only need to import from `board-types.ts`.
 */
export function resolveBoardDisplayScale(
  settings: BoardSettings,
  viewport: { width: number; height: number } | undefined,
): ResolvedDisplayScale {
  return resolveDisplayScale(settings.displayScale ?? "auto", viewport);
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

/** Valid formats after Sprint A cleanup (grid + poster removed). */
const VALID_FORMATS: readonly BoardDisplayFormat[] = ["classic", "compact", "slideshow"] as const;

export function loadSettings(id: string): BoardSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const s = localStorage.getItem(`hoptrack-board-${id}`);
    if (!s) return DEFAULT_SETTINGS;
    const parsed = { ...DEFAULT_SETTINGS, ...JSON.parse(s) };
    // Sprint A: coerce any retired formats (grid/poster) to classic so brewery
    // owners with stale localStorage don't land on a format that no longer exists.
    if (!VALID_FORMATS.includes(parsed.displayFormat)) {
      parsed.displayFormat = "classic";
    }
    return parsed;
  } catch { return DEFAULT_SETTINGS; }
}

export function saveSettings(id: string, s: BoardSettings) {
  try { localStorage.setItem(`hoptrack-board-${id}`, JSON.stringify(s)); } catch {}
}

// ─── Pure utility helpers ─────────────────────────────────────────────────────

export function getInitials(name: string): string {
  const skip = ["the", "of", "and", "&", "co.", "co", "brewing", "brewery", "craft", "beer", "ales", "taproom", "pub"];
  const words = name.split(/\s+/).filter(w => !skip.includes(w.toLowerCase()));
  if (!words.length) return name[0]?.toUpperCase() ?? "?";
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function formatEventDate(dateStr: string, time: string | null): string {
  const date = new Date(dateStr + "T00:00:00");
  const day = date.toLocaleDateString(undefined, { weekday: "short" });
  const md  = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  if (!time) return `${day} ${md}`;
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${day} ${md} · ${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function formatPrice(price: number): string {
  return price % 1 === 0 ? `$${price.toFixed(0)}` : `$${price.toFixed(2)}`;
}
