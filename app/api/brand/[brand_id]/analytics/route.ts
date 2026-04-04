import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiSuccess, apiUnauthorized, apiForbidden, apiNotFound, apiServerError } from "@/lib/api-response";
import { formatRelativeTime } from "@/lib/dates";
import { verifyBrandAccess } from "@/lib/brand-auth";

// ─── GET /api/brand/[brand_id]/analytics ─────────────────────────────────────
// Aggregated analytics across all brand locations.
// Requires brand_accounts membership (owner or regional_manager).
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brand_id: string }> }
) {
  const { brand_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  // Verify brand membership
  const role = await verifyBrandAccess(supabase, brand_id, user.id);
  if (!role || !["owner", "regional_manager"].includes(role)) return apiForbidden();

  // Fetch brand + locations
  const { data: brand } = await (supabase
    .from("brewery_brands")
    .select("id, name, slug, logo_url, description")
    .eq("id", brand_id)
    .single() as any);

  if (!brand) return apiNotFound("Brand");

  const { data: locations } = await (supabase
    .from("breweries")
    .select("id, name, city, state, cover_image_url, latitude, longitude")
    .eq("brand_id", brand_id)
    .order("name") as any);

  const allLocationIds = (locations ?? []).map((l: any) => l.id);

  // Optional location filter — validate it belongs to this brand
  const locationFilter = request.nextUrl.searchParams.get("location");
  if (locationFilter && !allLocationIds.includes(locationFilter)) {
    return apiForbidden();
  }

  const locationIds = locationFilter ? [locationFilter] : allLocationIds;

  if (locationIds.length === 0) {
    return apiSuccess({
      brand,
      locations: [],
      stats: {
        totalSessions: 0,
        totalBeersLogged: 0,
        uniqueVisitors: 0,
        thisWeekSessions: 0,
        lastWeekSessions: 0,
        todaySessions: 0,
        todayBeers: 0,
        avgRating: null,
        repeatVisitorPct: null,
        crossLocationVisitors: 0,
      },
      locationBreakdown: [],
      topBeers: [],
      recentActivity: [],
      weeklyTrend: [],
    });
  }

  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000).toISOString();

    // Fetch all data in parallel across all brand locations
    const [
      { data: allSessions },
      { data: allBeerLogs },
      { data: todaySessions },
      { data: todayBeerLogs },
      { data: recentSessions },
      { count: followersCount },
    ] = await Promise.all([
      supabase
        .from("sessions")
        .select("id, user_id, brewery_id, started_at, ended_at, is_active")
        .in("brewery_id", locationIds)
        .eq("is_active", false)
        .limit(50000) as any,
      supabase
        .from("beer_logs")
        .select("id, beer_id, rating, quantity, logged_at, brewery_id, beer:beers(name, style)")
        .in("brewery_id", locationIds)
        .limit(50000) as any,
      supabase
        .from("sessions")
        .select("id, user_id")
        .in("brewery_id", locationIds)
        .eq("is_active", false)
        .gte("started_at", todayStart)
        .limit(50000) as any,
      supabase
        .from("beer_logs")
        .select("id, quantity")
        .in("brewery_id", locationIds)
        .gte("logged_at", todayStart)
        .limit(50000) as any,
      supabase
        .from("sessions")
        .select("id, brewery_id, started_at, profile:profiles(display_name, username), beer_logs(id, beer_id, beer:beers(name))")
        .in("brewery_id", locationIds)
        .eq("is_active", false)
        .order("started_at", { ascending: false })
        .limit(15) as any,
      supabase
        .from("brewery_followers")
        .select("id", { count: "exact", head: true })
        .in("brewery_id", locationIds) as any,
    ]);

    const sessions = allSessions ?? [];
    const beerLogs = allBeerLogs ?? [];

    // ── Aggregate stats ──
    const totalSessions = sessions.length;
    const totalBeersLogged = beerLogs.reduce((sum: number, l: any) => sum + (l.quantity ?? 1), 0);
    const uniqueVisitorSet = new Set(sessions.map((s: any) => s.user_id).filter(Boolean));
    const uniqueVisitors = uniqueVisitorSet.size;

    const thisWeekSessions = sessions.filter((s: any) => s.started_at >= weekAgo).length;
    const lastWeekSessions = sessions.filter((s: any) => s.started_at >= twoWeeksAgo && s.started_at < weekAgo).length;

    const todayCount = (todaySessions ?? []).length;
    const todayBeers = (todayBeerLogs ?? []).reduce((sum: number, l: any) => sum + (l.quantity ?? 1), 0);

    // Avg rating
    const rated = beerLogs.filter((l: any) => l.rating > 0);
    const avgRating = rated.length > 0
      ? parseFloat((rated.reduce((a: number, l: any) => a + l.rating, 0) / rated.length).toFixed(2))
      : null;

    // Repeat visitor %
    const userVisitCounts: Record<string, number> = {};
    sessions.forEach((s: any) => { if (s.user_id) userVisitCounts[s.user_id] = (userVisitCounts[s.user_id] ?? 0) + 1; });
    const totalUsers = Object.keys(userVisitCounts).length;
    const repeatVisitorPct = totalUsers > 0
      ? Math.round((Object.values(userVisitCounts).filter(c => c >= 2).length / totalUsers) * 100)
      : null;

    // Cross-location visitors (users who visited 2+ locations)
    const userLocations: Record<string, Set<string>> = {};
    sessions.forEach((s: any) => {
      if (s.user_id) {
        if (!userLocations[s.user_id]) userLocations[s.user_id] = new Set();
        userLocations[s.user_id].add(s.brewery_id);
      }
    });
    const crossLocationVisitors = Object.values(userLocations).filter(locs => locs.size >= 2).length;

    // ── Per-location breakdown ──
    const locationBreakdown = locationIds.map((locId: string) => {
      const loc = (locations ?? []).find((l: any) => l.id === locId);
      const locSessions = sessions.filter((s: any) => s.brewery_id === locId);
      const locBeers = beerLogs.filter((l: any) => l.brewery_id === locId);
      const locUniqueVisitors = new Set(locSessions.map((s: any) => s.user_id).filter(Boolean)).size;
      return {
        id: locId,
        name: loc?.name ?? "Unknown",
        city: loc?.city ?? "",
        state: loc?.state ?? "",
        sessions: locSessions.length,
        beersLogged: locBeers.reduce((sum: number, l: any) => sum + (l.quantity ?? 1), 0),
        uniqueVisitors: locUniqueVisitors,
      };
    }).sort((a: any, b: any) => b.sessions - a.sessions);

    // ── Top beers (grouped by beer name across locations) ──
    const beerCounts: Record<string, { name: string; style: string | null; count: number; totalRating: number; ratingCount: number }> = {};
    beerLogs.forEach((l: any) => {
      if (!l.beer?.name) return;
      const key = l.beer.name.toLowerCase();
      if (!beerCounts[key]) beerCounts[key] = { name: l.beer.name, style: l.beer.style ?? null, count: 0, totalRating: 0, ratingCount: 0 };
      beerCounts[key].count += l.quantity ?? 1;
      if (l.rating > 0) { beerCounts[key].totalRating += l.rating; beerCounts[key].ratingCount++; }
    });
    const topBeers = Object.values(beerCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(b => ({
        ...b,
        avgRating: b.ratingCount > 0 ? parseFloat((b.totalRating / b.ratingCount).toFixed(1)) : null,
      }));

    // ── Weekly trend (last 8 weeks) ──
    const weeklyTrend: number[] = [];
    for (let w = 7; w >= 0; w--) {
      const weekStart = new Date(now.getTime() - (w + 1) * 7 * 86400000).toISOString();
      const weekEnd = new Date(now.getTime() - w * 7 * 86400000).toISOString();
      weeklyTrend.push(sessions.filter((s: any) => s.started_at >= weekStart && s.started_at < weekEnd).length);
    }

    // ── Recent activity feed ──
    const locationNameMap: Record<string, string> = {};
    (locations ?? []).forEach((l: any) => { locationNameMap[l.id] = l.name; });

    const recentActivity = (recentSessions ?? []).slice(0, 10).map((s: any) => {
      const profileName = s.profile?.display_name || s.profile?.username || "Someone";
      const beerCount = s.beer_logs?.length ?? 0;
      const firstBeer = s.beer_logs?.[0]?.beer?.name;
      const locName = locationNameMap[s.brewery_id] || "a location";

      return {
        id: s.id,
        type: "session" as const,
        text: `${profileName} visited ${locName}`,
        subtext: beerCount > 0 ? `${beerCount} beer${beerCount > 1 ? "s" : ""}${firstBeer ? ` incl. ${firstBeer}` : ""}` : "Checked in",
        time: formatRelativeTime(s.started_at),
        icon: "🍺",
      };
    });

    return apiSuccess({
      brand,
      locations: locations ?? [],
      stats: {
        totalSessions,
        totalBeersLogged,
        uniqueVisitors,
        thisWeekSessions,
        lastWeekSessions,
        todaySessions: todayCount,
        todayBeers,
        avgRating,
        repeatVisitorPct,
        crossLocationVisitors,
        totalFollowers: followersCount ?? 0,
      },
      locationBreakdown,
      topBeers,
      recentActivity,
      weeklyTrend,
    });
  } catch (err) {
    console.error("Brand analytics error:", err);
    return apiServerError("brand analytics");
  }
}
