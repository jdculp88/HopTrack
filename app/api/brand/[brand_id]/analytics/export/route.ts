import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ─── GET /api/brand/[brand_id]/analytics/export ──────────────────────────────
// CSV export of brand analytics across all locations.
// Requires brand_accounts membership (owner or regional_manager).
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brand_id: string }> }
) {
  const { brand_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify brand membership
  const { data: membership } = await (supabase
    .from("brand_accounts")
    .select("role")
    .eq("brand_id", brand_id)
    .eq("user_id", user.id)
    .in("role", ["owner", "regional_manager"])
    .maybeSingle() as any);

  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Fetch brand + locations
  const { data: brand } = await (supabase
    .from("brewery_brands")
    .select("id, name, slug")
    .eq("id", brand_id)
    .single() as any);

  if (!brand) return NextResponse.json({ error: "Brand not found" }, { status: 404 });

  const { data: locations } = await (supabase
    .from("breweries")
    .select("id, name, city, state")
    .eq("brand_id", brand_id)
    .order("name") as any);

  const locationIds = (locations ?? []).map((l: any) => l.id);

  // Parse range
  const range = request.nextUrl.searchParams.get("range") || "all";
  const rangeDays = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : null;
  const rangeStart = rangeDays ? new Date(Date.now() - rangeDays * 86400000).toISOString() : null;

  // Fetch sessions + beer logs
  let sessionsQuery = supabase
    .from("sessions")
    .select("id, user_id, brewery_id")
    .in("brewery_id", locationIds)
    .eq("is_active", false);
  if (rangeStart) sessionsQuery = sessionsQuery.gte("started_at", rangeStart);
  const { data: sessions } = await (sessionsQuery as any);

  let beerLogsQuery = supabase
    .from("beer_logs")
    .select("id, beer_id, rating, quantity, brewery_id, beer:beers(name)")
    .in("brewery_id", locationIds);
  if (rangeStart) beerLogsQuery = beerLogsQuery.gte("logged_at", rangeStart);
  const { data: beerLogs } = await (beerLogsQuery as any);

  // Followers (all-time — not date-filterable)
  const { data: followers } = await (supabase
    .from("brewery_followers")
    .select("id, brewery_id")
    .in("brewery_id", locationIds) as any);

  // Loyalty redemptions
  const { data: loyaltyPrograms } = await (supabase
    .from("loyalty_programs")
    .select("id, brewery_id")
    .in("brewery_id", locationIds)
    .eq("is_active", true) as any);

  const programIds = (loyaltyPrograms ?? []).map((p: any) => p.id);
  const programToBrewery: Record<string, string> = {};
  (loyaltyPrograms ?? []).forEach((p: any) => { programToBrewery[p.id] = p.brewery_id; });

  const redemptionsByBrewery: Record<string, number> = {};
  if (programIds.length > 0) {
    let redemptionsQuery = supabase
      .from("loyalty_redemptions")
      .select("id, program_id")
      .in("program_id", programIds);
    if (rangeStart) redemptionsQuery = redemptionsQuery.gte("redeemed_at", rangeStart);
    const { data: redemptions } = await (redemptionsQuery as any);

    (redemptions ?? []).forEach((r: any) => {
      const breweryId = programToBrewery[r.program_id];
      if (breweryId) redemptionsByBrewery[breweryId] = (redemptionsByBrewery[breweryId] ?? 0) + 1;
    });
  }

  // ── Build per-location rows ──
  const allSessions = sessions ?? [];
  const allBeerLogs = beerLogs ?? [];

  let totalSessions = 0;
  const totalUniqueVisitorIds = new Set<string>();
  let totalBeersLogged = 0;
  let totalRatingSum = 0;
  let totalRatingCount = 0;
  let totalRedemptions = 0;
  let totalFollowers = 0;
  const overallBeerCounts: Record<string, { name: string; count: number }> = {};

  const rows: string[] = [];

  for (const loc of (locations ?? []) as any[]) {
    const locSessions = allSessions.filter((s: any) => s.brewery_id === loc.id);
    const locBeers = allBeerLogs.filter((l: any) => l.brewery_id === loc.id);
    const locFollowers = (followers ?? []).filter((f: any) => f.brewery_id === loc.id);

    const sessionCount = locSessions.length;
    const uniqueVisitors = new Set(locSessions.map((s: any) => s.user_id).filter(Boolean)).size;
    const beersLogged = locBeers.reduce((sum: number, l: any) => sum + (l.quantity ?? 1), 0);

    const rated = locBeers.filter((l: any) => l.rating > 0);
    const avgRating = rated.length > 0
      ? (rated.reduce((a: number, l: any) => a + l.rating, 0) / rated.length).toFixed(2)
      : "";

    // Top beer
    const beerCounts: Record<string, { name: string; count: number }> = {};
    locBeers.forEach((l: any) => {
      if (!l.beer?.name) return;
      const key = l.beer.name.toLowerCase();
      if (!beerCounts[key]) beerCounts[key] = { name: l.beer.name, count: 0 };
      beerCounts[key].count += l.quantity ?? 1;
      // Also accumulate overall
      if (!overallBeerCounts[key]) overallBeerCounts[key] = { name: l.beer.name, count: 0 };
      overallBeerCounts[key].count += l.quantity ?? 1;
    });
    const topBeer = Object.values(beerCounts).sort((a, b) => b.count - a.count)[0]?.name ?? "";

    const redemptions = redemptionsByBrewery[loc.id] ?? 0;
    const followerCount = locFollowers.length;

    // Accumulate totals
    totalSessions += sessionCount;
    locSessions.forEach((s: any) => { if (s.user_id) totalUniqueVisitorIds.add(s.user_id); });
    totalBeersLogged += beersLogged;
    rated.forEach((l: any) => { totalRatingSum += l.rating; totalRatingCount++; });
    totalRedemptions += redemptions;
    totalFollowers += followerCount;

    rows.push([
      csvEscape(loc.name),
      csvEscape(loc.city ?? ""),
      csvEscape(loc.state ?? ""),
      sessionCount,
      uniqueVisitors,
      beersLogged,
      avgRating,
      csvEscape(topBeer),
      redemptions,
      followerCount,
    ].join(","));
  }

  // Summary row
  const overallTopBeer = Object.values(overallBeerCounts).sort((a, b) => b.count - a.count)[0]?.name ?? "";
  const overallAvgRating = totalRatingCount > 0
    ? (totalRatingSum / totalRatingCount).toFixed(2)
    : "";

  rows.push([
    "BRAND TOTAL",
    "-",
    "-",
    totalSessions,
    totalUniqueVisitorIds.size,
    totalBeersLogged,
    overallAvgRating,
    csvEscape(overallTopBeer),
    totalRedemptions,
    totalFollowers,
  ].join(","));

  const header = "Location Name,City,State,Sessions,Unique Visitors,Beers Logged,Avg Rating,Top Beer,Loyalty Redemptions,Followers";
  const csv = [header, ...rows].join("\n");
  const date = new Date().toISOString().split("T")[0];
  const slug = brand.slug || "brand";

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="hoptrack-brand-${slug}-${date}.csv"`,
    },
  });
}

function csvEscape(val: string): string {
  if (!val) return "";
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}
