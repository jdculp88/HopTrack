/**
 * HopTrack Wrapped — Year-in-Review data engine
 * Sprint 84 — The Wrap
 *
 * Aggregates a user's beer journey into shareable stats.
 * Extends PintRewind patterns with date-range filtering.
 */

import { LEVELS } from "@/lib/xp";
import { getStyleVars } from "@/lib/beerStyleColors";

// ─── Types ──────────────────────────────────────────────────────

export interface WrappedStats {
  period: { start: string; end: string; label: string };
  totalSessions: number;
  totalBeers: number;
  uniqueBeers: number;
  uniqueBreweries: number;
  uniqueStyles: number;
  topBrewery: { name: string; city: string | null; visits: number } | null;
  topBeer: { name: string; brewery: string | null; count: number } | null;
  topStyle: { style: string; count: number } | null;
  personality: { archetype: string; emoji: string; tagline: string };
  avgRating: number | null;
  ratingPersonality: string;
  longestStreak: number;
  xpEarned: number;
  level: { level: number; title: string };
  achievementsUnlocked: number;
  friendsMade: number;
  citiesVisited: string[];
  adventurerScore: number;
  homeSessions: number;
  brewerySessions: number;
  legendarySession: { beerCount: number; breweryName: string } | null;
}

// ─── Personality archetypes ─────────────────────────────────────

const ARCHETYPES: Record<string, { archetype: string; emoji: string; tagline: string }> = {
  "IPA":             { archetype: "The Hophead",            emoji: "🌿", tagline: "If it's not bitter, it's not better" },
  "Double IPA":      { archetype: "The Hophead",            emoji: "🌿", tagline: "Double the hops, double the glory" },
  "Hazy IPA":        { archetype: "The Haze Chaser",        emoji: "🌫️", tagline: "Juice is the truth" },
  "Session IPA":     { archetype: "The Hophead",            emoji: "🌿", tagline: "Low ABV, high standards" },
  "Stout":           { archetype: "The Dark Arts",          emoji: "🌑", tagline: "Life's too short for light beer" },
  "Imperial Stout":  { archetype: "The Dark Arts",          emoji: "🌑", tagline: "Thick, dark, and unapologetic" },
  "Porter":          { archetype: "The Dark Arts",          emoji: "🌑", tagline: "Roasted roots run deep" },
  "Sour":            { archetype: "The Sour Seeker",        emoji: "⚡", tagline: "Pucker up — complexity is the point" },
  "Gose":            { archetype: "The Sour Seeker",        emoji: "⚡", tagline: "Salt, sour, and everything after" },
  "Berliner Weisse": { archetype: "The Sour Seeker",        emoji: "⚡", tagline: "The tart side of craft" },
  "Lager":           { archetype: "The Purist",             emoji: "✨", tagline: "Clean lines. Crisp finish. No compromises" },
  "Pilsner":         { archetype: "The Purist",             emoji: "✨", tagline: "Simplicity is the ultimate sophistication" },
  "Wheat":           { archetype: "The Easy Drinker",       emoji: "🌾", tagline: "Smooth, light, always right" },
  "Hefeweizen":      { archetype: "The Easy Drinker",       emoji: "🌾", tagline: "Banana and clove, all day long" },
  "Belgian":         { archetype: "The Belgian Explorer",   emoji: "🏰", tagline: "Complexity brewed over centuries" },
  "Saison":          { archetype: "The Farmhouse Fan",      emoji: "🌾", tagline: "Rustic, dry, and full of character" },
  "Amber":           { archetype: "The All-Rounder",        emoji: "🍺", tagline: "Balanced in all things" },
  "Red Ale":         { archetype: "The All-Rounder",        emoji: "🍺", tagline: "Malt forward, heart forward" },
  "Pale Ale":        { archetype: "The All-Rounder",        emoji: "🍺", tagline: "The gateway that never gets old" },
  "Blonde Ale":      { archetype: "The Easy Drinker",       emoji: "☀️", tagline: "Sunshine in a glass" },
  "Cream Ale":       { archetype: "The Easy Drinker",       emoji: "☀️", tagline: "Smooth as it gets" },
  "Barleywine":      { archetype: "The Heavy Hitter",       emoji: "🥊", tagline: "Go big or go home" },
  "Kolsch":          { archetype: "The Purist",             emoji: "✨", tagline: "Cologne's finest export" },
  "Cider":           { archetype: "The Orchard Explorer",   emoji: "🍎", tagline: "Apples, pressed with purpose" },
  "Mead":            { archetype: "The Time Traveler",      emoji: "🍯", tagline: "Ancient drink, modern soul" },
};

const DEFAULT_PERSONALITY = { archetype: "The Explorer", emoji: "🧭", tagline: "Every pour is a new adventure" };

export function getWrappedPersonality(topStyle: string | null, uniqueStyles: number): { archetype: string; emoji: string; tagline: string } {
  if (!topStyle) return DEFAULT_PERSONALITY;
  if (uniqueStyles >= 10) {
    return { archetype: "The Renaissance Drinker", emoji: "🎨", tagline: "Why pick one style when you can try them all?" };
  }
  return ARCHETYPES[topStyle] ?? DEFAULT_PERSONALITY;
}

export function getRatingPersonality(avgRating: number | null): string {
  if (avgRating === null) return "The Silent Sipper";
  if (avgRating >= 4.5) return "The Eternal Optimist";
  if (avgRating >= 4.0) return "The Generous Critic";
  if (avgRating >= 3.5) return "The Fair Judge";
  if (avgRating >= 3.0) return "The Honest Reviewer";
  if (avgRating >= 2.5) return "The Tough Crowd";
  return "The Brutal Critic";
}

export function getLevelTitle(level: number): string {
  return LEVELS.find(l => l.level === level)?.name ?? "Beer Enthusiast";
}

// Total possible styles for adventurer score
const TOTAL_STYLES = 26;

export function getAdventurerScore(uniqueStyles: number): number {
  return Math.min(100, Math.round((uniqueStyles / TOTAL_STYLES) * 100));
}

/**
 * Fetch and aggregate Wrapped stats from Supabase.
 * Used by both the API route and the server component page.
 */
export async function fetchWrappedStats(
  supabase: any,
  userId: string,
  year?: number | null,
): Promise<WrappedStats> {
  const now = new Date();
  let periodStart: string;
  let periodEnd: string;
  let periodLabel: string;

  if (year) {
    periodStart = `${year}-01-01T00:00:00.000Z`;
    periodEnd = `${year}-12-31T23:59:59.999Z`;
    periodLabel = `${year}`;
  } else {
    periodStart = "2020-01-01T00:00:00.000Z";
    periodEnd = now.toISOString();
    periodLabel = "All Time";
  }

  const [
    { data: sessions },
    { data: beerLogs },
    { data: profile },
    { data: achievements },
    { data: friendships },
  ] = await Promise.all([
    supabase
      .from("sessions")
      .select("id, brewery_id, context, started_at, ended_at, xp_awarded, brewery:breweries(name, city)")
      .eq("user_id", userId)
      .eq("is_active", false)
      .gte("started_at", periodStart)
      .lte("started_at", periodEnd)
      .order("started_at", { ascending: false }),
    supabase
      .from("beer_logs")
      .select("id, beer_id, rating, quantity, session_id, beer:beers(name, style, brewery_id)")
      .eq("user_id", userId)
      .gte("logged_at", periodStart)
      .lte("logged_at", periodEnd)
      .order("logged_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("level, xp, longest_streak, display_name, username")
      .eq("id", userId)
      .single(),
    supabase
      .from("user_achievements")
      .select("id")
      .eq("user_id", userId)
      .gte("earned_at", periodStart)
      .lte("earned_at", periodEnd),
    supabase
      .from("friendships")
      .select("id")
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .eq("status", "accepted")
      .gte("created_at", periodStart)
      .lte("created_at", periodEnd),
  ]) as any;

  const allSessions: any[] = sessions ?? [];
  const allLogs: any[] = beerLogs ?? [];

  const styleCounts: Record<string, number> = {};
  allLogs.forEach((l: any) => {
    if (l.beer?.style) styleCounts[l.beer.style] = (styleCounts[l.beer.style] ?? 0) + (l.quantity ?? 1);
  });
  const sortedStyles = Object.entries(styleCounts).sort((a, b) => b[1] - a[1]);
  const topStyleEntry = sortedStyles[0] ?? null;

  const beerCounts: Record<string, { name: string; brewery: string | null; count: number }> = {};
  allLogs.forEach((l: any) => {
    if (!l.beer_id || !l.beer?.name) return;
    if (!beerCounts[l.beer_id]) beerCounts[l.beer_id] = { name: l.beer.name, brewery: null, count: 0 };
    beerCounts[l.beer_id].count += l.quantity ?? 1;
  });
  const topBeer = Object.values(beerCounts).sort((a, b) => b.count - a.count)[0] ?? null;

  const breweryCounts: Record<string, { name: string; city: string | null; count: number }> = {};
  allSessions.forEach((s: any) => {
    if (!s.brewery_id || s.context === "home") return;
    if (!breweryCounts[s.brewery_id]) {
      breweryCounts[s.brewery_id] = { name: s.brewery?.name ?? "Unknown", city: s.brewery?.city ?? null, count: 0 };
    }
    breweryCounts[s.brewery_id].count++;
  });
  const topBrewery = Object.values(breweryCounts).sort((a, b) => b.count - a.count)[0] ?? null;

  const cities = new Set<string>();
  allSessions.forEach((s: any) => { if (s.brewery?.city) cities.add(s.brewery.city); });

  const rated = allLogs.filter((l: any) => (l.rating ?? 0) > 0);
  const avgRating = rated.length > 0
    ? Math.round((rated.reduce((a: number, l: any) => a + (l.rating ?? 0), 0) / rated.length) * 100) / 100
    : null;

  const sessionBeerCounts: Record<string, number> = {};
  allLogs.forEach((l: any) => {
    if (l.session_id) sessionBeerCounts[l.session_id] = (sessionBeerCounts[l.session_id] ?? 0) + (l.quantity ?? 1);
  });
  let legendarySession = null;
  if (Object.keys(sessionBeerCounts).length > 0) {
    const [topSid, topCount] = Object.entries(sessionBeerCounts).sort((a, b) => b[1] - a[1])[0];
    const session = allSessions.find((s: any) => s.id === topSid);
    if (session) {
      legendarySession = { beerCount: topCount, breweryName: session.brewery?.name ?? (session.context === "home" ? "Home" : "Unknown") };
    }
  }

  const totalBeers = allLogs.reduce((sum: number, l: any) => sum + (l.quantity ?? 1), 0);
  const uniqueBeers = new Set(allLogs.filter((l: any) => l.beer_id).map((l: any) => l.beer_id)).size;
  const uniqueBreweries = new Set(allSessions.filter((s: any) => s.brewery_id).map((s: any) => s.brewery_id)).size;
  const uniqueStyles = Object.keys(styleCounts).length;
  const homeSessions = allSessions.filter((s: any) => s.context === "home").length;
  const brewerySessions = allSessions.length - homeSessions;
  const xpEarned = allSessions.reduce((sum: number, s: any) => sum + (s.xp_awarded ?? 0), 0);
  const topStyleName = topStyleEntry ? topStyleEntry[0] : null;

  return {
    period: { start: periodStart, end: periodEnd, label: periodLabel },
    totalSessions: allSessions.length,
    totalBeers,
    uniqueBeers,
    uniqueBreweries,
    uniqueStyles,
    topBrewery: topBrewery ? { name: topBrewery.name, city: topBrewery.city, visits: topBrewery.count } : null,
    topBeer: topBeer ? { name: topBeer.name, brewery: topBeer.brewery, count: topBeer.count } : null,
    topStyle: topStyleEntry ? { style: topStyleEntry[0], count: topStyleEntry[1] } : null,
    personality: getWrappedPersonality(topStyleName, uniqueStyles),
    avgRating,
    ratingPersonality: getRatingPersonality(avgRating),
    longestStreak: profile?.longest_streak ?? 0,
    xpEarned,
    level: { level: profile?.level ?? 1, title: getLevelTitle(profile?.level ?? 1) },
    achievementsUnlocked: achievements?.length ?? 0,
    friendsMade: friendships?.length ?? 0,
    citiesVisited: Array.from(cities),
    adventurerScore: getAdventurerScore(uniqueStyles),
    homeSessions,
    brewerySessions,
    legendarySession,
  };
}

export function getShareText(stats: WrappedStats, username: string): string {
  const parts = [
    `My HopTrack Wrapped: "${stats.personality.archetype}" ${stats.personality.emoji}`,
    `${stats.totalBeers} beers across ${stats.uniqueBreweries} breweries`,
    stats.topStyle ? `Top style: ${stats.topStyle.style}` : null,
    `Level ${stats.level.level}: ${stats.level.title}`,
    `See yours at hoptrack.beer/wrapped`,
  ].filter(Boolean);
  return parts.join(" · ");
}

export function getWrappedColors(topStyle: string | null): { c1: string; c2: string; c3: string } {
  if (!topStyle) {
    return { c1: "var(--accent-gold)", c2: "var(--accent-amber)", c3: "var(--accent-gold)" };
  }
  const vars = getStyleVars(topStyle);
  return { c1: vars.primary, c2: vars.light, c3: vars.soft };
}
