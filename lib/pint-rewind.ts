/**
 * HopTrack Pint Rewind — data aggregation engine
 * Extracted in Sprint 93 for server-side rendering
 */

import { LEVELS } from "@/lib/xp";

export interface PintRewindData {
  personality: { archetype: string; topStyle: string | null; count: number };
  signatureBeer: { name: string; count: number } | null;
  breweryLoyalty: { name: string; count: number } | null;
  legendarySession: { beerCount: number; durationHours: number | null; breweryName: string } | null;
  ratingHabits: { avgRating: number | null; personality: string; totalRated: number };
  homeSessions: number;
  scroll: { totalBeers: number; totalSessions: number; totalXp: number; uniqueBeers: number; uniqueBreweries: number };
  level: { level: number; title: string };
  displayName: string;
}

const ARCHETYPES: Record<string, string> = {
  "IPA": "The Hop Evangelist",
  "Double IPA": "The Hop Evangelist",
  "Imperial IPA": "The Hop Evangelist",
  "Hazy IPA": "The Haze Chaser",
  "New England IPA": "The Haze Chaser",
  "Stout": "The Dark Side Dweller",
  "Imperial Stout": "The Dark Side Dweller",
  "Porter": "The Dark Side Dweller",
  "Sour": "The Sour Seeker",
  "Gose": "The Sour Seeker",
  "Berliner Weisse": "The Sour Seeker",
  "Lager": "The Classic Purist",
  "Pilsner": "The Classic Purist",
  "Helles": "The Classic Purist",
  "Pale Ale": "The All-Rounder",
  "Amber Ale": "The All-Rounder",
  "Wheat Beer": "The Easy Drinker",
  "Hefeweizen": "The Easy Drinker",
  "Belgian": "The Refined Palate",
  "Tripel": "The Refined Palate",
  "Saison": "The Farmhouse Philosopher",
  "Barleywine": "The Heavy Hitter",
};

export async function fetchPintRewindData(supabase: any, userId: string): Promise<PintRewindData> {
  const [
    { data: sessions },
    { data: beerLogs },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from("sessions")
      .select("id, brewery_id, context, started_at, ended_at, xp_awarded, brewery:breweries(name)")
      .eq("user_id", userId)
      .eq("is_active", false)
      .order("started_at", { ascending: false }),
    supabase
      .from("beer_logs")
      .select("id, beer_id, rating, quantity, logged_at, serving_style, session_id, beer:beers(name, style)")
      .eq("user_id", userId)
      .order("logged_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("level, xp, total_checkins, display_name, username")
      .eq("id", userId)
      .single(),
  ]) as any;

  const allSessions: any[] = sessions ?? [];
  const allLogs: any[] = beerLogs ?? [];

  // Personality
  const styleCounts: Record<string, number> = {};
  allLogs.forEach((l: any) => {
    if (l.beer?.style) styleCounts[l.beer.style] = (styleCounts[l.beer.style] ?? 0) + (l.quantity ?? 1);
  });
  const topStyle = Object.entries(styleCounts).sort((a, b) => b[1] - a[1])[0];
  const personality = topStyle ? (ARCHETYPES[topStyle[0]] ?? "The Adventurer") : "The Explorer";

  // Signature Beer
  const beerCounts: Record<string, { name: string; count: number }> = {};
  allLogs.forEach((l: any) => {
    if (!l.beer_id || !l.beer?.name) return;
    if (!beerCounts[l.beer_id]) beerCounts[l.beer_id] = { name: l.beer.name, count: 0 };
    beerCounts[l.beer_id].count += l.quantity ?? 1;
  });
  const sigBeer = Object.values(beerCounts).sort((a, b) => b.count - a.count)[0] ?? null;

  // Brewery Loyalty
  const breweryCounts: Record<string, { name: string; count: number }> = {};
  allSessions.forEach((s: any) => {
    if (!s.brewery_id || s.context === "home") return;
    if (!breweryCounts[s.brewery_id]) breweryCounts[s.brewery_id] = { name: s.brewery?.name ?? "Unknown", count: 0 };
    breweryCounts[s.brewery_id].count++;
  });
  const topBrewery = Object.values(breweryCounts).sort((a, b) => b.count - a.count)[0] ?? null;

  // Legendary Session
  const sessionBeerCounts: Record<string, number> = {};
  allLogs.forEach((l: any) => {
    if (l.session_id) sessionBeerCounts[l.session_id] = (sessionBeerCounts[l.session_id] ?? 0) + (l.quantity ?? 1);
  });
  let legendarySession = null;
  if (Object.keys(sessionBeerCounts).length > 0) {
    const topSessionId = Object.entries(sessionBeerCounts).sort((a, b) => b[1] - a[1])[0];
    const session = allSessions.find((s: any) => s.id === topSessionId[0]);
    if (session) {
      const durationMs = session.ended_at
        ? new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()
        : null;
      const durationHours = durationMs ? Math.round(durationMs / 3600000 * 10) / 10 : null;
      legendarySession = { beerCount: topSessionId[1], durationHours, breweryName: session.brewery?.name ?? (session.context === "home" ? "Home" : "Unknown") };
    }
  }

  // Rating Habits
  const rated = allLogs.filter((l: any) => (l.rating ?? 0) > 0);
  const avgRating = rated.length > 0
    ? Math.round((rated.reduce((a: number, l: any) => a + (l.rating ?? 0), 0) / rated.length) * 100) / 100
    : null;
  let ratingPersonality = "The Silent Sipper";
  if (avgRating !== null) {
    if (avgRating >= 4.5) ratingPersonality = "The Eternal Optimist";
    else if (avgRating >= 4.0) ratingPersonality = "The Generous Critic";
    else if (avgRating >= 3.5) ratingPersonality = "The Fair Judge";
    else if (avgRating >= 3.0) ratingPersonality = "The Honest Reviewer";
    else if (avgRating >= 2.5) ratingPersonality = "The Tough Crowd";
    else ratingPersonality = "The Brutal Critic";
  }

  const homeSessions = allSessions.filter((s: any) => s.context === "home").length;
  const totalBeers = allLogs.reduce((sum: number, l: any) => sum + (l.quantity ?? 1), 0);
  const level = profile?.level ?? 1;

  return {
    personality: { archetype: personality, topStyle: topStyle?.[0] ?? null, count: topStyle?.[1] ?? 0 },
    signatureBeer: sigBeer,
    breweryLoyalty: topBrewery,
    legendarySession,
    ratingHabits: { avgRating, personality: ratingPersonality, totalRated: rated.length },
    homeSessions,
    scroll: {
      totalBeers,
      totalSessions: allSessions.length,
      totalXp: profile?.xp ?? 0,
      uniqueBeers: new Set(allLogs.filter((l: any) => l.beer_id).map((l: any) => l.beer_id)).size,
      uniqueBreweries: new Set(allSessions.filter((s: any) => s.brewery_id).map((s: any) => s.brewery_id)).size,
    },
    level: { level, title: LEVELS.find(l => l.level === level)?.name ?? "Beer Enthusiast" },
    displayName: profile?.display_name ?? profile?.username ?? "Beer Lover",
  };
}
