// Share helpers — Sprint 162 (The Identity)
//
// OG image URL generation + share text templates for all shareable surfaces.
// Components use these helpers to build Web Share API payloads.

import { HOPTRACK_BASE_URL } from "./brand";

// ─── Types ─────────────────────────────────────────────────────────────────

export type StoryCardType = "personality" | "percentile" | "favorites" | "weekly";

// ─── Core helpers ──────────────────────────────────────────────────────────

/**
 * Builds a full URL to a story-format OG image route.
 * Works on both server (uses HOPTRACK_BASE_URL) and client (uses window.location.origin).
 */
export function generateOGImageUrl(
  type: StoryCardType,
  params: Record<string, string | number | undefined | null>,
): string {
  const base =
    typeof window !== "undefined"
      ? window.location.origin
      : HOPTRACK_BASE_URL;
  const url = new URL(`/og/story/${type}`, base);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/** Builds a full URL to a page on HopTrack. */
export function hoptrackUrl(path: string): string {
  const base =
    typeof window !== "undefined"
      ? window.location.origin
      : HOPTRACK_BASE_URL;
  return new URL(path, base).toString();
}

// ─── Share text templates ──────────────────────────────────────────────────

/**
 * Share text for Beer Personality archetype card.
 * Example: `I'm The Hop Hunter 🎯 on HopTrack. What's your beer personality? hoptrack.beer`
 */
export function getPersonalityShareText(args: {
  archetype: string;
  emoji: string;
}): string {
  return `I'm ${args.archetype} ${args.emoji} on HopTrack. What's your beer personality? ${HOPTRACK_BASE_URL}`;
}

/**
 * Share text for rarity / percentile card.
 * Example: `Top 3% of IPA drinkers on HopTrack 🍺 Track your pours at hoptrack.beer`
 */
export function getPercentileShareText(args: {
  percentile: number;          // 0-100
  metricLabel: string;          // "IPA drinkers", "beer explorers"
}): string {
  const topPct = Math.max(1, 100 - Math.floor(args.percentile));
  return `Top ${topPct}% of ${args.metricLabel} on HopTrack 🍺 Track your pours at ${HOPTRACK_BASE_URL}`;
}

/**
 * Share text for Four Favorites card.
 * Example: `My 4 favorite beers on HopTrack 🍺 See yours at hoptrack.beer`
 */
export function getFavoritesShareText(args: {
  topBeerName?: string | null;
}): string {
  if (args.topBeerName) {
    return `My 4 favorite beers on HopTrack — starting with ${args.topBeerName} 🍺 ${HOPTRACK_BASE_URL}`;
  }
  return `My 4 favorite beers on HopTrack 🍺 See yours at ${HOPTRACK_BASE_URL}`;
}

/**
 * Share text for Your Round weekly recap card.
 * Example: `This week: 8 beers, 3 breweries on HopTrack 🍺 Track yours at hoptrack.beer/your-round`
 */
export function getWeeklyShareText(args: {
  totalBeers: number;
  uniqueBreweries: number;
  topBeerName?: string | null;
}): string {
  const parts: string[] = [];
  parts.push(`This week: ${args.totalBeers} beer${args.totalBeers === 1 ? "" : "s"}`);
  if (args.uniqueBreweries > 0) {
    parts.push(`${args.uniqueBreweries} brewer${args.uniqueBreweries === 1 ? "y" : "ies"}`);
  }
  if (args.topBeerName) parts.push(`top pour: ${args.topBeerName}`);
  parts.push(`Track yours at ${HOPTRACK_BASE_URL}/your-round`);
  return parts.join(" · ");
}

// ─── Web Share API wrapper ────────────────────────────────────────────────

export type ShareResult = "shared" | "copied" | "failed" | "cancelled";

export interface SharePayload {
  title: string;
  text: string;
  url?: string;
}

/**
 * Attempts Web Share API, falls back to clipboard copy.
 * Returns a status string the caller can use for toast feedback.
 */
export async function shareOrCopy(payload: SharePayload): Promise<ShareResult> {
  if (typeof window === "undefined") return "failed";

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share(payload);
      return "shared";
    } catch (err) {
      // AbortError = user cancelled (this is not a failure)
      if (err instanceof Error && err.name === "AbortError") return "cancelled";
      // Fall through to clipboard on any other share failure
    }
  }

  try {
    const textToCopy = payload.url ? `${payload.text} ${payload.url}` : payload.text;
    await navigator.clipboard.writeText(textToCopy);
    return "copied";
  } catch {
    return "failed";
  }
}
