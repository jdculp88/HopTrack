// Brand digest stats calculator — Sprint 120
// Aggregates weekly stats across all brand locations for the brand digest email.

import { createClient } from "@/lib/supabase/server";

export interface BrandDigestStats {
  totalVisits: number;
  visitsTrend: number; // % change vs previous week
  totalUniqueVisitors: number;
  totalBeersLogged: number;
  crossLocationVisitors: number;
  topPerformer: { name: string; visits: number } | null;
  locations: Array<{
    name: string;
    visits: number;
    uniqueVisitors: number;
    topBeer: string | null;
  }>;
}

export async function calculateBrandDigestStats(brandId: string): Promise<{
  brandName: string;
  stats: BrandDigestStats;
}> {
  const supabase = await createClient();
  const now = Date.now();
  const weekAgo = new Date(now - 7 * 86400000).toISOString();
  const twoWeeksAgo = new Date(now - 14 * 86400000).toISOString();

  // Fetch brand
  const { data: brand } = await (supabase
    .from("brewery_brands")
    .select("name")
    .eq("id", brandId)
    .single() as any);

  // Fetch locations
  const { data: locations } = await (supabase
    .from("breweries")
    .select("id, name")
    .eq("brand_id", brandId)
    .order("name") as any);

  const locationIds = (locations ?? []).map((l: any) => l.id);

  if (locationIds.length === 0) {
    return {
      brandName: brand?.name ?? "Your Brand",
      stats: {
        totalVisits: 0,
        visitsTrend: 0,
        totalUniqueVisitors: 0,
        totalBeersLogged: 0,
        crossLocationVisitors: 0,
        topPerformer: null,
        locations: [],
      },
    };
  }

  // Fetch data in parallel
  const [
    { data: thisWeekSessions },
    { data: lastWeekSessions },
    { data: beerLogs },
  ] = await Promise.all([
    supabase
      .from("sessions")
      .select("id, user_id, brewery_id")
      .in("brewery_id", locationIds)
      .eq("is_active", false)
      .gte("started_at", weekAgo) as any,
    supabase
      .from("sessions")
      .select("id, user_id, brewery_id")
      .in("brewery_id", locationIds)
      .eq("is_active", false)
      .gte("started_at", twoWeeksAgo)
      .lt("started_at", weekAgo) as any,
    supabase
      .from("beer_logs")
      .select("id, quantity, brewery_id, beer:beers(name)")
      .in("brewery_id", locationIds)
      .gte("logged_at", weekAgo) as any,
  ]);

  const sessions = thisWeekSessions ?? [];
  const prevSessions = lastWeekSessions ?? [];
  const logs = beerLogs ?? [];

  // Total visits + trend
  const totalVisits = sessions.length;
  const lastWeekVisits = prevSessions.length;
  const visitsTrend = lastWeekVisits === 0
    ? (totalVisits > 0 ? 100 : 0)
    : Math.round(((totalVisits - lastWeekVisits) / lastWeekVisits) * 100);

  // Unique visitors
  const totalUniqueVisitors = new Set(sessions.map((s: any) => s.user_id).filter(Boolean)).size;

  // Beers logged
  const totalBeersLogged = logs.reduce((sum: number, l: any) => sum + (l.quantity ?? 1), 0);

  // Cross-location visitors
  const userLocations: Record<string, Set<string>> = {};
  sessions.forEach((s: any) => {
    if (s.user_id) {
      if (!userLocations[s.user_id]) userLocations[s.user_id] = new Set();
      userLocations[s.user_id].add(s.brewery_id);
    }
  });
  const crossLocationVisitors = Object.values(userLocations).filter(locs => locs.size >= 2).length;

  // Per-location breakdown
  const locStats = locationIds.map((locId: string) => {
    const loc = (locations ?? []).find((l: any) => l.id === locId);
    const locSessions = sessions.filter((s: any) => s.brewery_id === locId);
    const locLogs = logs.filter((l: any) => l.brewery_id === locId);

    // Top beer at this location
    const beerCounts: Record<string, { name: string; count: number }> = {};
    locLogs.forEach((l: any) => {
      if (!l.beer?.name) return;
      const key = l.beer.name.toLowerCase();
      if (!beerCounts[key]) beerCounts[key] = { name: l.beer.name, count: 0 };
      beerCounts[key].count += l.quantity ?? 1;
    });
    const topBeer = Object.values(beerCounts).sort((a, b) => b.count - a.count)[0]?.name ?? null;

    return {
      name: loc?.name ?? "Unknown",
      visits: locSessions.length,
      uniqueVisitors: new Set(locSessions.map((s: any) => s.user_id).filter(Boolean)).size,
      topBeer,
    };
  }).sort((a: any, b: any) => b.visits - a.visits);

  // Top performer
  const topPerformer = locStats.length > 0 && locStats[0].visits > 0
    ? { name: locStats[0].name, visits: locStats[0].visits }
    : null;

  return {
    brandName: brand?.name ?? "Your Brand",
    stats: {
      totalVisits,
      visitsTrend,
      totalUniqueVisitors,
      totalBeersLogged,
      crossLocationVisitors,
      topPerformer,
      locations: locStats,
    },
  };
}
