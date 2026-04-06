/**
 * Shared types and design constants for the Board display.
 * Imported by BoardClient and all board sub-components.
 */

import type { PourSize } from "@/lib/glassware";

// ─── Re-export PourSize so sub-components only need one import ─────────────────
export type { PourSize };

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
export type BoardDisplayFormat = "classic" | "grid" | "compact" | "poster" | "slideshow";

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
};

/** Recommended defaults when switching to a format */
export const FORMAT_DEFAULTS: Record<BoardDisplayFormat, Partial<BoardSettings>> = {
  classic:   {},
  grid:      { showGlass: true, showStyle: true },
  compact:   { showGlass: false, showDesc: false, showRating: false, showStats: false, showStyle: false, showABV: false },
  poster:    { showGlass: true, showStyle: true },
  slideshow: { showGlass: true, showStyle: true, showDesc: true },
};

/** Settings that a format FORCES regardless of user toggle */
export const FORMAT_FORCED: Record<BoardDisplayFormat, Partial<BoardSettings>> = {
  classic:   {},
  grid:      {},
  compact:   { showGlass: false, showDesc: false, showRating: false, showStats: false },
  poster:    {},
  slideshow: {},
};

/** Apply forced overrides for the active format */
export function getEffectiveSettings(settings: BoardSettings): BoardSettings {
  const forced = FORMAT_FORCED[settings.displayFormat] ?? {};
  return { ...settings, ...forced };
}

export const FORMAT_LABELS: Record<BoardDisplayFormat, string> = {
  classic:   "Classic",
  grid:      "Grid",
  compact:   "Compact",
  poster:    "Poster",
  slideshow: "Slideshow",
};

// ─── Design constants (cream board palette) ───────────────────────────────────

export const C = {
  cream: "#FBF7F0",
  gold: "#D4A843",
  text: "#1A1714",
  textMuted: "#6B5E4E",
  textSubtle: "#9E8E7A",
  border: "#E5DDD0",
  chipBg: "rgba(251,247,240,0.85)",
  chipBorder: "#DDD5C5",
  danger: "#C44B3A",
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

export const FS: Record<FontSize, {
  name: number; style: number; meta: number; price: number; stat: number;
  chipLabel: number; chipOz: number; chipPrice: number; chipPadV: number; chipPadH: number;
  glasslabel: number; glassW: number; glassH: number;
}> = {
  medium: { name: 34, style: 14, meta: 13, price: 28, stat: 12, chipLabel: 10, chipOz:  9, chipPrice: 18, chipPadV: 5, chipPadH: 10, glasslabel:  9, glassW:  44, glassH:  63 },
  large:  { name: 42, style: 16, meta: 15, price: 36, stat: 14, chipLabel: 11, chipOz: 10, chipPrice: 20, chipPadV: 6, chipPadH: 12, glasslabel: 10, glassW:  56, glassH:  80 },
  xl:     { name: 54, style: 19, meta: 17, price: 46, stat: 16, chipLabel: 13, chipOz: 11, chipPrice: 24, chipPadV: 8, chipPadH: 14, glasslabel: 11, glassW:  70, glassH: 100 },
};

// ─── localStorage helpers ─────────────────────────────────────────────────────

export function loadSettings(id: string): BoardSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const s = localStorage.getItem(`hoptrack-board-${id}`);
    return s ? { ...DEFAULT_SETTINGS, ...JSON.parse(s) } : DEFAULT_SETTINGS;
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
