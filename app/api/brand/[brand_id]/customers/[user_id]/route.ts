import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiSuccess, apiUnauthorized, apiForbidden, apiNotFound, apiServerError } from "@/lib/api-response";
import { verifyBrandAccessWithScope } from "@/lib/brand-auth";
import { buildBrandCustomerProfile } from "@/lib/brand-crm";

// ─── GET /api/brand/[brand_id]/customers/[user_id] ───────────────────────────
// Full cross-location customer profile.
// Requires brand_accounts membership (owner, brand_manager, or regional_manager).
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brand_id: string; user_id: string }> }
) {
  const { brand_id, user_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  const access = await verifyBrandAccessWithScope(supabase, brand_id, user.id);
  if (!access || !["owner", "brand_manager", "regional_manager"].includes(access.role)) return apiForbidden();

  const { data: locations } = await (supabase
    .from("breweries")
    .select("id, name")
    .eq("brand_id", brand_id)
    .order("name") as any);

  let locationIds = (locations ?? []).map((l: any) => l.id);

  // Apply location_scope for regional managers
  if (access.locationScope) {
    const scopeSet = new Set(access.locationScope);
    locationIds = locationIds.filter((id: string) => scopeSet.has(id));
  }

  if (locationIds.length === 0) return apiNotFound("Brand locations");

  try {
    const locationMap = new Map((locations ?? []).map((l: any) => [l.id, l.name])) as Map<string, string>;

    // Fetch profile
    const { data: profile } = await (supabase
      .from("profiles")
      .select("id, display_name, username, avatar_url")
      .eq("id", user_id)
      .single() as any);

    if (!profile) return apiNotFound("Customer");

    // Fetch all data in parallel
    const [
      { data: sessions },
      { data: beerLogs },
      { data: breweryVisits },
      { data: brandLoyaltyCard },
    ] = await Promise.all([
      supabase
        .from("sessions")
        .select("id, brewery_id, started_at, ended_at")
        .in("brewery_id", locationIds)
        .eq("user_id", user_id)
        .eq("is_active", false)
        .order("started_at", { ascending: false }) as any,
      supabase
        .from("beer_logs")
        .select("beer_id, brewery_id, rating, quantity, beer:beers(name, style)")
        .in("brewery_id", locationIds)
        .eq("user_id", user_id) as any,
      supabase
        .from("brewery_visits")
        .select("user_id, brewery_id, total_visits, unique_beers_tried, first_visit_at, last_visit_at")
        .in("brewery_id", locationIds)
        .eq("user_id", user_id) as any,
      supabase
        .from("brand_loyalty_cards")
        .select("stamps, lifetime_stamps, last_stamp_brewery_id")
        .eq("brand_id", brand_id)
        .eq("user_id", user_id)
        .maybeSingle() as any,
    ]);

    if (!sessions || sessions.length === 0) return apiNotFound("Customer visits");

    // Transform beer logs
    const transformedLogs = ((beerLogs as any[]) ?? []).map((l: any) => ({
      beer_id: l.beer_id,
      brewery_id: l.brewery_id,
      beer_name: l.beer?.name ?? "Unknown",
      beer_style: l.beer?.style ?? "",
      rating: l.rating ?? 0,
      quantity: l.quantity ?? 1,
    }));

    // Enrich journey timeline with per-session beer counts
    // Fetch sessions with beer_logs for the timeline
    const { data: sessionsWithBeers } = await (supabase
      .from("sessions")
      .select("id, brewery_id, started_at, ended_at, beer_logs(id, beer_id, quantity, beer:beers(name))")
      .in("brewery_id", locationIds)
      .eq("user_id", user_id)
      .eq("is_active", false)
      .order("started_at", { ascending: false })
      .limit(30) as any);

    const customerProfile = buildBrandCustomerProfile({
      profile: profile as any,
      sessions: (sessions ?? []).map((s: any) => ({
        id: s.id,
        brewery_id: s.brewery_id,
        started_at: s.started_at,
        ended_at: s.ended_at,
      })),
      beerLogs: transformedLogs,
      breweryVisits: breweryVisits ?? [],
      brandLoyaltyCard: brandLoyaltyCard as any,
      locationMap,
    });

    // Enrich journey timeline with actual per-session beer data
    const sessionBeerMap = new Map<string, { count: number; topBeer: string | null }>();
    for (const s of (sessionsWithBeers ?? []) as any[]) {
      const logs = s.beer_logs ?? [];
      const count = logs.reduce((sum: number, l: any) => sum + (l.quantity ?? 1), 0);
      const topBeer = logs[0]?.beer?.name ?? null;
      sessionBeerMap.set(s.id, { count, topBeer });
    }
    for (const entry of customerProfile.journeyTimeline) {
      const beerData = sessionBeerMap.get(entry.sessionId);
      if (beerData) {
        entry.beerCount = beerData.count;
        entry.topBeer = beerData.topBeer;
      }
    }

    return apiSuccess(customerProfile);
  } catch (err) {
    console.error("Brand customer profile error:", err);
    return apiServerError("brand customer profile");
  }
}
