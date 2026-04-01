import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import {
  getWrappedPersonality,
  getRatingPersonality,
  getLevelTitle,
  getAdventurerScore,
  type WrappedStats,
} from "@/lib/wrapped";

interface WSession {
  id: string;
  brewery_id: string | null;
  context: string;
  started_at: string;
  ended_at: string | null;
  xp_awarded: number;
  brewery: { name: string; city: string | null } | null;
}

interface WBeerLog {
  id: string;
  beer_id: string | null;
  rating: number | null;
  quantity: number | null;
  session_id: string | null;
  beer: { name: string; style: string | null; brewery_id: string | null } | null;
}

export async function GET(request: NextRequest) {
  const limited = rateLimitResponse(request, "wrapped", { limit: 10, windowMs: 60 * 1000 });
  if (limited) return limited;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Determine period
  const yearParam = request.nextUrl.searchParams.get("year");
  const now = new Date();
  let periodStart: string;
  let periodEnd: string;
  let periodLabel: string;

  if (yearParam) {
    const year = parseInt(yearParam, 10);
    periodStart = `${year}-01-01T00:00:00.000Z`;
    periodEnd = `${year}-12-31T23:59:59.999Z`;
    periodLabel = `${year}`;
  } else {
    // Default: all-time
    periodStart = "2020-01-01T00:00:00.000Z";
    periodEnd = now.toISOString();
    periodLabel = "All Time";
  }

  // Fetch sessions in period
  const { data: sessions, error: sErr } = await supabase
    .from("sessions")
    .select("id, brewery_id, context, started_at, ended_at, xp_awarded, brewery:breweries(name, city)")
    .eq("user_id", user.id)
    .eq("is_active", false)
    .gte("started_at", periodStart)
    .lte("started_at", periodEnd)
    .order("started_at", { ascending: false }) as unknown as { data: WSession[] | null; error: any };
  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });

  // Fetch beer logs in period
  const { data: beerLogs, error: lErr } = await supabase
    .from("beer_logs")
    .select("id, beer_id, rating, quantity, session_id, beer:beers(name, style, brewery_id)")
    .eq("user_id", user.id)
    .gte("logged_at", periodStart)
    .lte("logged_at", periodEnd)
    .order("logged_at", { ascending: false }) as unknown as { data: WBeerLog[] | null; error: any };
  if (lErr) return NextResponse.json({ error: lErr.message }, { status: 500 });

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("level, xp, longest_streak, display_name, username")
    .eq("id", user.id)
    .single() as any;

  // Fetch achievements in period
  const { data: achievements } = await supabase
    .from("user_achievements")
    .select("id")
    .eq("user_id", user.id)
    .gte("earned_at", periodStart)
    .lte("earned_at", periodEnd) as any;

  // Fetch friendships created in period
  const { data: friendships } = await supabase
    .from("friendships")
    .select("id")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .eq("status", "accepted")
    .gte("created_at", periodStart)
    .lte("created_at", periodEnd) as any;

  const allSessions: WSession[] = sessions ?? [];
  const allLogs: WBeerLog[] = beerLogs ?? [];

  // ─── Aggregations ─────────────────────────────────────────────

  // Style counts
  const styleCounts: Record<string, number> = {};
  allLogs.forEach(l => {
    if (l.beer?.style) styleCounts[l.beer.style] = (styleCounts[l.beer.style] ?? 0) + (l.quantity ?? 1);
  });
  const sortedStyles = Object.entries(styleCounts).sort((a, b) => b[1] - a[1]);
  const topStyleEntry = sortedStyles[0] ?? null;

  // Beer counts
  const beerCounts: Record<string, { name: string; brewery: string | null; count: number }> = {};
  allLogs.forEach(l => {
    if (!l.beer_id || !l.beer?.name) return;
    if (!beerCounts[l.beer_id]) beerCounts[l.beer_id] = { name: l.beer.name, brewery: null, count: 0 };
    beerCounts[l.beer_id].count += l.quantity ?? 1;
  });
  const topBeer = Object.values(beerCounts).sort((a, b) => b.count - a.count)[0] ?? null;

  // Brewery counts
  const breweryCounts: Record<string, { name: string; city: string | null; count: number }> = {};
  allSessions.forEach(s => {
    if (!s.brewery_id || s.context === "home") return;
    if (!breweryCounts[s.brewery_id]) {
      breweryCounts[s.brewery_id] = { name: s.brewery?.name ?? "Unknown", city: s.brewery?.city ?? null, count: 0 };
    }
    breweryCounts[s.brewery_id].count++;
  });
  const topBrewery = Object.values(breweryCounts).sort((a, b) => b.count - a.count)[0] ?? null;

  // Cities visited
  const cities = new Set<string>();
  allSessions.forEach(s => {
    if (s.brewery?.city) cities.add(s.brewery.city);
  });

  // Ratings
  const rated = allLogs.filter(l => (l.rating ?? 0) > 0);
  const avgRating = rated.length > 0
    ? Math.round((rated.reduce((a, l) => a + (l.rating ?? 0), 0) / rated.length) * 100) / 100
    : null;

  // Legendary session (most beers)
  const sessionBeerCounts: Record<string, number> = {};
  allLogs.forEach(l => {
    if (l.session_id) sessionBeerCounts[l.session_id] = (sessionBeerCounts[l.session_id] ?? 0) + (l.quantity ?? 1);
  });
  let legendarySession = null;
  if (Object.keys(sessionBeerCounts).length > 0) {
    const [topSid, topCount] = Object.entries(sessionBeerCounts).sort((a, b) => b[1] - a[1])[0];
    const session = allSessions.find(s => s.id === topSid);
    if (session) {
      legendarySession = {
        beerCount: topCount,
        breweryName: session.brewery?.name ?? (session.context === "home" ? "Home" : "Unknown"),
      };
    }
  }

  // Totals
  const totalBeers = allLogs.reduce((sum, l) => sum + (l.quantity ?? 1), 0);
  const uniqueBeers = new Set(allLogs.filter(l => l.beer_id).map(l => l.beer_id)).size;
  const uniqueBreweries = new Set(allSessions.filter(s => s.brewery_id).map(s => s.brewery_id)).size;
  const uniqueStyles = Object.keys(styleCounts).length;
  const homeSessions = allSessions.filter(s => s.context === "home").length;
  const brewerySessions = allSessions.length - homeSessions;
  const xpEarned = allSessions.reduce((sum, s) => sum + (s.xp_awarded ?? 0), 0);

  const topStyleName = topStyleEntry ? topStyleEntry[0] : null;

  const wrapped: WrappedStats = {
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

  return NextResponse.json(wrapped);
}
