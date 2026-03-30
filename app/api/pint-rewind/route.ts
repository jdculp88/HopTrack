import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { LEVELS } from "@/lib/xp";
import { rateLimitResponse } from "@/lib/rate-limit";

interface PintRewindSession {
  id: string;
  brewery_id: string | null;
  context: string;
  started_at: string;
  ended_at: string | null;
  xp_awarded: number;
  brewery: { name: string } | null;
}

interface PintRewindBeerLog {
  id: string;
  beer_id: string | null;
  rating: number | null;
  quantity: number | null;
  logged_at: string;
  serving_style: string | null;
  session_id?: string;
  beer: { name: string; style: string | null } | null;
}

interface PintRewindProfile {
  level: number;
  xp: number;
  total_checkins: number;
  display_name: string | null;
  username: string;
}

export async function GET(request: Request) {
  const limited = rateLimitResponse(request, "pint-rewind", { limit: 10, windowMs: 60 * 1000 });
  if (limited) return limited;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch all user sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from("sessions")
    .select("id, brewery_id, context, started_at, ended_at, xp_awarded, brewery:breweries(name)")
    .eq("user_id", user.id)
    .eq("is_active", false)
    .order("started_at", { ascending: false }) as unknown as { data: PintRewindSession[] | null; error: { message: string } | null };
  if (sessionsError) return NextResponse.json({ error: sessionsError.message }, { status: 500 });

  // Fetch all user beer logs
  const { data: beerLogs, error: logsError } = await supabase
    .from("beer_logs")
    .select("id, beer_id, rating, quantity, logged_at, serving_style, beer:beers(name, style)")
    .eq("user_id", user.id)
    .order("logged_at", { ascending: false }) as unknown as { data: PintRewindBeerLog[] | null; error: { message: string } | null };
  if (logsError) return NextResponse.json({ error: logsError.message }, { status: 500 });

  // Fetch user profile for level/xp
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("level, xp, total_checkins, display_name, username")
    .eq("id", user.id)
    .single() as unknown as { data: PintRewindProfile | null; error: { message: string } | null };
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });

  const allSessions: PintRewindSession[] = sessions ?? [];
  const allLogs: PintRewindBeerLog[] = beerLogs ?? [];

  // ─── Beer Personality ─────────────────────────────────────────
  const styleCounts: Record<string, number> = {};
  allLogs.forEach((l) => {
    if (l.beer?.style) styleCounts[l.beer.style] = (styleCounts[l.beer.style] ?? 0) + (l.quantity ?? 1);
  });
  const topStyle = Object.entries(styleCounts).sort((a, b) => b[1] - a[1])[0];
  const archetypes: Record<string, string> = {
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
  const personality = topStyle
    ? (archetypes[topStyle[0]] ?? "The Adventurer")
    : "The Explorer";
  const topStyleName = topStyle?.[0] ?? null;
  const topStyleCount = topStyle?.[1] ?? 0;

  // ─── Signature Beer ───────────────────────────────────────────
  const beerCounts: Record<string, { name: string; count: number }> = {};
  allLogs.forEach((l) => {
    if (!l.beer_id || !l.beer?.name) return;
    if (!beerCounts[l.beer_id]) beerCounts[l.beer_id] = { name: l.beer.name, count: 0 };
    beerCounts[l.beer_id].count += l.quantity ?? 1;
  });
  const sigBeer = Object.values(beerCounts).sort((a, b) => b.count - a.count)[0] ?? null;

  // ─── Brewery Loyalty ──────────────────────────────────────────
  const breweryCounts: Record<string, { name: string; count: number }> = {};
  allSessions.forEach((s) => {
    if (!s.brewery_id || s.context === "home") return;
    if (!breweryCounts[s.brewery_id]) breweryCounts[s.brewery_id] = { name: s.brewery?.name ?? "Unknown", count: 0 };
    breweryCounts[s.brewery_id].count++;
  });
  const topBrewery = Object.values(breweryCounts).sort((a, b) => b.count - a.count)[0] ?? null;

  // ─── Legendary Session ────────────────────────────────────────
  // Find session with most beers logged
  const sessionBeerCounts: Record<string, number> = {};
  allLogs.forEach((l) => {
    if (l.session_id) {
      sessionBeerCounts[l.session_id] = (sessionBeerCounts[l.session_id] ?? 0) + (l.quantity ?? 1);
    }
  });
  let legendarySession = null;
  if (Object.keys(sessionBeerCounts).length > 0) {
    const topSessionId = Object.entries(sessionBeerCounts).sort((a, b) => b[1] - a[1])[0];
    const session = allSessions.find((s) => s.id === topSessionId[0]);
    if (session) {
      const durationMs = session.ended_at
        ? new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()
        : null;
      const durationHours = durationMs ? Math.round(durationMs / 3600000 * 10) / 10 : null;
      legendarySession = {
        beerCount: topSessionId[1],
        durationHours,
        breweryName: session.brewery?.name ?? (session.context === "home" ? "Home" : "Unknown"),
      };
    }
  }

  // ─── Rating Habits ────────────────────────────────────────────
  const rated = allLogs.filter((l) => (l.rating ?? 0) > 0);
  const avgRating = rated.length > 0
    ? Math.round((rated.reduce((a: number, l) => a + (l.rating ?? 0), 0) / rated.length) * 100) / 100
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

  // ─── Home Sessions ────────────────────────────────────────────
  const homeSessions = allSessions.filter((s) => s.context === "home").length;

  // ─── The Scroll (totals) ──────────────────────────────────────
  const totalBeers = allLogs.reduce((sum: number, l) => sum + (l.quantity ?? 1), 0);
  const totalSessions = allSessions.length;
  const totalXp = profile?.xp ?? 0;
  const uniqueBeers = new Set(allLogs.filter((l) => l.beer_id).map((l) => l.beer_id)).size;
  const uniqueBreweries = new Set(allSessions.filter((s) => s.brewery_id).map((s) => s.brewery_id)).size;

  // ─── Level ────────────────────────────────────────────────────
  const level = profile?.level ?? 1;
  const levelTitle = LEVELS.find(l => l.level === level)?.name ?? "Beer Enthusiast";

  return NextResponse.json({
    personality: { archetype: personality, topStyle: topStyleName, count: topStyleCount },
    signatureBeer: sigBeer,
    breweryLoyalty: topBrewery,
    legendarySession,
    ratingHabits: { avgRating, personality: ratingPersonality, totalRated: rated.length },
    homeSessions,
    scroll: { totalBeers, totalSessions, totalXp, uniqueBeers, uniqueBreweries },
    level: { level, title: levelTitle },
    displayName: profile?.display_name ?? profile?.username ?? "Beer Lover",
  });
}
