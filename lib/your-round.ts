// Your Round — Sprint 162 (The Identity)
//
// Weekly variant of Wrapped. Aggregates a user's last 7 days of beer activity
// using the same WrappedStats shape as `lib/wrapped.ts` — slides are reused,
// just with a weekly window and weekly share text.
//
// This is the "Wrapped-of-the-Week" hero page at /your-round.

import { fetchWrappedStatsForRange, type WrappedStats } from "./wrapped";

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_WINDOW_DAYS = 7;

// ─── Types ─────────────────────────────────────────────────────────────────

export interface YourRoundRange {
  start: Date;
  end: Date;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Computes a rolling N-day window ending at `end` (default now).
 * Returns { start, end } Date objects (exclusive end).
 */
export function computeYourRoundRange(
  end: Date = new Date(),
  days: number = DEFAULT_WINDOW_DAYS,
): YourRoundRange {
  const start = new Date(end.getTime() - days * DAY_MS);
  return { start, end };
}

/**
 * Formats a date range as a human-readable label.
 * Examples: "This Week", "Mar 28 – Apr 4", "2026-03-28 → 2026-04-04"
 */
export function formatYourRoundLabel(range: YourRoundRange): string {
  const now = new Date();
  const diffDays = (now.getTime() - range.end.getTime()) / DAY_MS;
  const rangeDays = (range.end.getTime() - range.start.getTime()) / DAY_MS;

  // If the range ends today/yesterday and is ~7 days long, call it "This Week"
  if (diffDays < 1.5 && rangeDays >= 6.5 && rangeDays <= 7.5) {
    return "This Week";
  }

  // Otherwise format as "Mar 28 – Apr 4"
  const monthDay = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${monthDay(range.start)} – ${monthDay(range.end)}`;
}

// ─── Main API ──────────────────────────────────────────────────────────────

/**
 * Fetches Your Round stats for a 7-day rolling window (or custom range).
 * Returns a WrappedStats shape so slide components are reused as-is.
 */
export async function fetchYourRoundStats(
  supabase: any,
  userId: string,
  range?: YourRoundRange,
): Promise<WrappedStats> {
  const resolvedRange = range ?? computeYourRoundRange();
  return fetchWrappedStatsForRange(supabase, userId, {
    start: resolvedRange.start.toISOString(),
    end: resolvedRange.end.toISOString(),
    label: formatYourRoundLabel(resolvedRange),
  });
}

/**
 * Builds share text for Your Round — different from Wrapped share text
 * because Your Round is weekly and has a different URL.
 */
export function getYourRoundShareText(stats: WrappedStats): string {
  const parts = [
    `This ${stats.period.label.toLowerCase() === "this week" ? "week" : "round"} on HopTrack`,
    `${stats.totalBeers} beer${stats.totalBeers === 1 ? "" : "s"}`,
    stats.uniqueBreweries > 0
      ? `${stats.uniqueBreweries} brewer${stats.uniqueBreweries === 1 ? "y" : "ies"}`
      : null,
    stats.topStyle ? `top style: ${stats.topStyle.style}` : null,
    `See yours at hoptrack.beer/your-round`,
  ].filter(Boolean);
  return parts.join(" · ");
}
