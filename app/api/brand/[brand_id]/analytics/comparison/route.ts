import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiSuccess, apiUnauthorized, apiForbidden, apiNotFound, apiBadRequest, apiServerError } from "@/lib/api-response";

// ─── GET /api/brand/[brand_id]/analytics/comparison ──────────────────────────
// Cross-location comparison data with time-range filtering, benchmarking, and trends.
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
  const { data: membership } = await (supabase
    .from("brand_accounts")
    .select("role")
    .eq("brand_id", brand_id)
    .eq("user_id", user.id)
    .in("role", ["owner", "regional_manager"])
    .maybeSingle() as any);

  if (!membership) return apiForbidden();

  // Parse range
  const range = request.nextUrl.searchParams.get("range") || "7d";
  if (!["7d", "30d", "90d"].includes(range)) {
    return apiBadRequest("Invalid range. Use 7d, 30d, or 90d.", "range");
  }

  const rangeDays = range === "7d" ? 7 : range === "30d" ? 30 : 90;

  // Fetch brand + locations
  const { data: brand } = await (supabase
    .from("brewery_brands")
    .select("id, name, slug")
    .eq("id", brand_id)
    .single() as any);

  if (!brand) return apiNotFound("Brand");

  const { data: locations } = await (supabase
    .from("breweries")
    .select("id, name, city, state")
    .eq("brand_id", brand_id)
    .order("name") as any);

  const locationIds = (locations ?? []).map((l: any) => l.id);

  if (locationIds.length === 0) {
    return apiSuccess({
      brand: { id: brand.id, name: brand.name },
      range,
      locations: [],
      brandTotals: { sessions: 0, uniqueVisitors: 0, beersLogged: 0, avgRating: null, loyaltyRedemptions: 0, followers: 0 },
      brandAverages: { sessions: 0, uniqueVisitors: 0, beersLogged: 0, avgRating: null },
    });
  }

  try {
    const now = new Date();
    const rangeStart = new Date(now.getTime() - rangeDays * 86400000).toISOString();
    const prevRangeStart = new Date(now.getTime() - rangeDays * 2 * 86400000).toISOString();

    // Fetch all data in parallel
    const [
      { data: currentSessions },
      { data: prevSessions },
      { data: currentBeerLogs },
      { data: followers },
      { data: loyaltyPrograms },
    ] = await Promise.all([
      supabase
        .from("sessions")
        .select("id, user_id, brewery_id, started_at")
        .in("brewery_id", locationIds)
        .eq("is_active", false)
        .gte("started_at", rangeStart) as any,
      supabase
        .from("sessions")
        .select("id, user_id, brewery_id")
        .in("brewery_id", locationIds)
        .eq("is_active", false)
        .gte("started_at", prevRangeStart)
        .lt("started_at", rangeStart) as any,
      supabase
        .from("beer_logs")
        .select("id, beer_id, rating, quantity, brewery_id, beer:beers(name, style)")
        .in("brewery_id", locationIds)
        .gte("logged_at", rangeStart) as any,
      supabase
        .from("brewery_followers")
        .select("id, brewery_id")
        .in("brewery_id", locationIds) as any,
      supabase
        .from("loyalty_programs")
        .select("id, brewery_id")
        .in("brewery_id", locationIds)
        .eq("is_active", true) as any,
    ]);

    const sessions = currentSessions ?? [];
    const prevSess = prevSessions ?? [];
    const beerLogs = currentBeerLogs ?? [];

    // Fetch loyalty redemptions for all programs in range
    const programIds = (loyaltyPrograms ?? []).map((p: any) => p.id);
    const programToBrewery: Record<string, string> = {};
    (loyaltyPrograms ?? []).forEach((p: any) => { programToBrewery[p.id] = p.brewery_id; });

    const redemptionsByBrewery: Record<string, number> = {};
    if (programIds.length > 0) {
      const { data: redemptions } = await (supabase
        .from("loyalty_redemptions")
        .select("id, program_id")
        .in("program_id", programIds)
        .gte("redeemed_at", rangeStart) as any);

      (redemptions ?? []).forEach((r: any) => {
        const breweryId = programToBrewery[r.program_id];
        if (breweryId) redemptionsByBrewery[breweryId] = (redemptionsByBrewery[breweryId] ?? 0) + 1;
      });
    }

    // ── Per-location stats ──
    const locData = locationIds.map((locId: string) => {
      const loc = (locations ?? []).find((l: any) => l.id === locId);
      const locSessions = sessions.filter((s: any) => s.brewery_id === locId);
      const locPrevSessions = prevSess.filter((s: any) => s.brewery_id === locId);
      const locBeers = beerLogs.filter((l: any) => l.brewery_id === locId);
      const locFollowers = (followers ?? []).filter((f: any) => f.brewery_id === locId);

      const sessionCount = locSessions.length;
      const uniqueVisitors = new Set(locSessions.map((s: any) => s.user_id).filter(Boolean)).size;
      const beersLogged = locBeers.reduce((sum: number, l: any) => sum + (l.quantity ?? 1), 0);

      const rated = locBeers.filter((l: any) => l.rating > 0);
      const avgRating = rated.length > 0
        ? parseFloat((rated.reduce((a: number, l: any) => a + l.rating, 0) / rated.length).toFixed(2))
        : null;

      // Top beer
      const beerCounts: Record<string, { name: string; count: number }> = {};
      locBeers.forEach((l: any) => {
        if (!l.beer?.name) return;
        const key = l.beer.name.toLowerCase();
        if (!beerCounts[key]) beerCounts[key] = { name: l.beer.name, count: 0 };
        beerCounts[key].count += l.quantity ?? 1;
      });
      const topBeer = Object.values(beerCounts).sort((a, b) => b.count - a.count)[0]?.name ?? null;

      const loyaltyRedemptions = redemptionsByBrewery[locId] ?? 0;
      const followerCount = locFollowers.length;

      // Trend vs previous period
      const prevSessionCount = locPrevSessions.length;
      const prevUniqueVisitors = new Set(locPrevSessions.map((s: any) => s.user_id).filter(Boolean)).size;
      const sessionsTrend = prevSessionCount === 0 ? (sessionCount > 0 ? 100 : 0) : Math.round(((sessionCount - prevSessionCount) / prevSessionCount) * 100);
      const visitorsTrend = prevUniqueVisitors === 0 ? (uniqueVisitors > 0 ? 100 : 0) : Math.round(((uniqueVisitors - prevUniqueVisitors) / prevUniqueVisitors) * 100);

      return {
        id: locId,
        name: loc?.name ?? "Unknown",
        city: loc?.city ?? "",
        state: loc?.state ?? "",
        sessions: sessionCount,
        uniqueVisitors,
        beersLogged,
        avgRating,
        topBeer,
        loyaltyRedemptions,
        followers: followerCount,
        trend: { sessions: sessionsTrend, uniqueVisitors: visitorsTrend },
        // Benchmarking fields filled below
        pctOfAvg: { sessions: 0, uniqueVisitors: 0, beersLogged: 0, avgRating: null as number | null },
        isOutlier: false,
        outlierDirection: null as "above" | "below" | null,
      };
    });

    // ── Brand totals ──
    const brandTotals = {
      sessions: locData.reduce((s: number, l: any) => s + l.sessions, 0),
      uniqueVisitors: new Set(sessions.map((s: any) => s.user_id).filter(Boolean)).size,
      beersLogged: locData.reduce((s: number, l: any) => s + l.beersLogged, 0),
      avgRating: (() => {
        const rated = beerLogs.filter((l: any) => l.rating > 0);
        return rated.length > 0
          ? parseFloat((rated.reduce((a: number, l: any) => a + l.rating, 0) / rated.length).toFixed(2))
          : null;
      })(),
      loyaltyRedemptions: locData.reduce((s: number, l: any) => s + l.loyaltyRedemptions, 0),
      followers: locData.reduce((s: number, l: any) => s + l.followers, 0),
    };

    // ── Brand averages (per location) ──
    const numLocs = locData.length;
    const brandAverages = {
      sessions: numLocs > 0 ? Math.round(brandTotals.sessions / numLocs) : 0,
      uniqueVisitors: numLocs > 0 ? Math.round(brandTotals.uniqueVisitors / numLocs) : 0,
      beersLogged: numLocs > 0 ? Math.round(brandTotals.beersLogged / numLocs) : 0,
      avgRating: brandTotals.avgRating,
    };

    // ── Benchmarking: % of average + outlier detection ──
    const sessionValues = locData.map((l: any) => l.sessions);
    const sessionMean = brandAverages.sessions;
    const sessionStdDev = numLocs > 1
      ? Math.sqrt(sessionValues.reduce((sum: number, v: number) => sum + Math.pow(v - sessionMean, 2), 0) / numLocs)
      : 0;

    for (const loc of locData) {
      loc.pctOfAvg = {
        sessions: brandAverages.sessions > 0 ? Math.round((loc.sessions / brandAverages.sessions) * 100) : 0,
        uniqueVisitors: brandAverages.uniqueVisitors > 0 ? Math.round((loc.uniqueVisitors / brandAverages.uniqueVisitors) * 100) : 0,
        beersLogged: brandAverages.beersLogged > 0 ? Math.round((loc.beersLogged / brandAverages.beersLogged) * 100) : 0,
        avgRating: brandAverages.avgRating && loc.avgRating ? Math.round((loc.avgRating / brandAverages.avgRating) * 100) : null,
      };

      // Outlier: >1.5 std dev from mean on sessions
      if (sessionStdDev > 0) {
        const deviation = Math.abs(loc.sessions - sessionMean);
        if (deviation > 1.5 * sessionStdDev) {
          loc.isOutlier = true;
          loc.outlierDirection = loc.sessions > sessionMean ? "above" : "below";
        }
      }
    }

    // Sort by sessions descending
    locData.sort((a: any, b: any) => b.sessions - a.sessions);

    return apiSuccess({
      brand: { id: brand.id, name: brand.name },
      range,
      locations: locData,
      brandTotals,
      brandAverages,
    });
  } catch (err) {
    console.error("Brand comparison analytics error:", err);
    return apiServerError("brand comparison analytics");
  }
}
