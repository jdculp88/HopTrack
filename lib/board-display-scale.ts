/**
 * Board display scale — Sprint A (The Display Suite)
 *
 * The Board lives on huge brewery TVs (55"–85") viewed from 10–25 feet across
 * a taproom. Our original Sprint 167 font sizes (topping out at 54px for beer
 * names) were calibrated for a 32" desktop monitor at 3–4 feet. That's great
 * on a dev laptop and puny when mounted on an actual brewery wall.
 *
 * This module introduces a `DisplayScale` concept that multiplies every
 * dimensional value in the Board's design system (font sizes, glass art,
 * padding, chip widths) by a scale factor:
 *
 *   - `monitor`  = 1×  (Sprint 167 default, back-compat)
 *   - `large-tv` = 2×  (55"–65" 1080p TVs at 10–15 ft viewing distance)
 *   - `cinema`   = 3×  (75"+ 4K TVs at 15–25 ft viewing distance)
 *
 * Additionally, `auto` detects the current viewport and picks the closest
 * preset on the client — this is the default for new breweries so they get
 * sensible out-of-the-box rendering without configuring anything.
 *
 * Pure functions only — no React, no Supabase, safe to unit-test.
 *
 * Note: this module intentionally does NOT import from `board-types.ts` to
 * avoid a circular dependency. `board-types.ts` imports from here. The FS
 * entry shape is defined structurally below and must stay in sync with the
 * `FS` record in board-types.ts — the unit tests assert that for every font
 * size, `scaleFSEntry` at scale=monitor returns the exact board-types value.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

/** Board font size setting. Mirrors `FontSize` in board-types.ts. */
export type FontSize = "medium" | "large" | "xl";

/** Structural type for an FS map entry. Mirrors the shape in board-types.ts. */
export interface FSEntry {
  name: number;
  style: number;
  meta: number;
  price: number;
  stat: number;
  chipLabel: number;
  chipOz: number;
  chipPrice: number;
  chipPadV: number;
  chipPadH: number;
  glasslabel: number;
  glassW: number;
  glassH: number;
}

/** The user-facing display scale setting (persisted in `breweries.board_display_scale`). */
export type DisplayScale = "auto" | "monitor" | "large-tv" | "cinema";

/** Resolved scale — what gets used after auto-detection (never "auto"). */
export type ResolvedDisplayScale = Exclude<DisplayScale, "auto">;

/** Multiplier for each resolved scale. */
export const SCALE_MULTIPLIER: Record<ResolvedDisplayScale, number> = {
  monitor: 1,
  "large-tv": 2,
  cinema: 3,
};

/** Human-readable labels for the scale picker UI. */
export const SCALE_LABELS: Record<DisplayScale, string> = {
  auto: "Auto-detect",
  monitor: "Monitor (≤ 40\")",
  "large-tv": "Large TV (55\"–65\")",
  cinema: "Cinema (75\"+)",
};

// ─── Auto-detection ───────────────────────────────────────────────────────────

/**
 * Given a viewport size, pick the closest preset scale.
 * Breakpoints match common TV resolutions at typical craft-beer taproom setups:
 *
 *   - < 1920 wide             → monitor (anything below FHD is a dev monitor)
 *   - 1920 ≤ w < 2560          → large-tv (1080p TVs dominate this range)
 *   - ≥ 2560 wide              → cinema (4K TVs / QHD+ / 5K signage)
 *
 * This is a pure function — takes explicit `{ width, height }` so it can be
 * unit-tested without a browser environment.
 */
export function detectDisplayScale(viewport: { width: number; height: number }): ResolvedDisplayScale {
  const { width } = viewport;
  if (width < 1920) return "monitor";
  if (width < 2560) return "large-tv";
  return "cinema";
}

/**
 * Resolve a user-facing `DisplayScale` to a concrete `ResolvedDisplayScale`.
 * - If the user picked "auto", we auto-detect from the viewport.
 * - Otherwise we honor their manual choice.
 *
 * Pass `viewport = undefined` (e.g., during SSR) and we fall back to "monitor".
 */
export function resolveDisplayScale(
  scale: DisplayScale,
  viewport: { width: number; height: number } | undefined,
): ResolvedDisplayScale {
  if (scale !== "auto") return scale;
  if (!viewport) return "monitor"; // SSR fallback — client will re-render once window is available
  return detectDisplayScale(viewport);
}

// ─── Scaled font sizes ────────────────────────────────────────────────────────

/**
 * Scale a single FS entry by the given resolved scale.
 * Every numeric dimension multiplies by the scale multiplier.
 *
 * This is a pure transformation — pass in a base FSEntry (from the `FS` map
 * in board-types.ts) and get back a new entry with every value multiplied.
 * board-types.ts imports this and exposes `getScaledFS(settings)` as a
 * convenience that reads fontSize + displayScale from a settings object.
 */
export function scaleFSEntry(entry: FSEntry, scale: ResolvedDisplayScale): FSEntry {
  const mult = SCALE_MULTIPLIER[scale];
  return {
    name:       Math.round(entry.name       * mult),
    style:      Math.round(entry.style      * mult),
    meta:       Math.round(entry.meta       * mult),
    price:      Math.round(entry.price      * mult),
    stat:       Math.round(entry.stat       * mult),
    chipLabel:  Math.round(entry.chipLabel  * mult),
    chipOz:     Math.round(entry.chipOz     * mult),
    chipPrice:  Math.round(entry.chipPrice  * mult),
    chipPadV:   Math.round(entry.chipPadV   * mult),
    chipPadH:   Math.round(entry.chipPadH   * mult),
    glasslabel: Math.round(entry.glasslabel * mult),
    glassW:     Math.round(entry.glassW     * mult),
    glassH:     Math.round(entry.glassH     * mult),
  };
}

/**
 * Get a scaled padding value (in px) for a base value and scale.
 * Use for layout padding, margins, gap values in inline styles.
 */
export function scalePadding(basePx: number, scale: ResolvedDisplayScale): number {
  return Math.round(basePx * SCALE_MULTIPLIER[scale]);
}
