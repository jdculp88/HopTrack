import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiList, apiUnauthorized, apiForbidden, apiNotFound, apiServerError } from "@/lib/api-response";
import { verifyBrandAccessWithScope } from "@/lib/brand-auth";
import { buildBrandCustomerList, findRegularsAtOtherLocations } from "@/lib/brand-crm";
import { computeSegment, type CustomerSegment } from "@/lib/crm";

// ─── GET /api/brand/[brand_id]/customers ─────────────────────────────────────
// Cross-location customer list with segment/search/sort.
// Requires brand_accounts membership (owner, brand_manager, or regional_manager).
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brand_id: string }> }
) {
  const { brand_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  const access = await verifyBrandAccessWithScope(supabase, brand_id, user.id);
  if (!access || !["owner", "brand_manager", "regional_manager"].includes(access.role)) return apiForbidden();

  const { data: brand } = await (supabase
    .from("brewery_brands")
    .select("id, name")
    .eq("id", brand_id)
    .single() as any);

  if (!brand) return apiNotFound("Brand");

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

  if (locationIds.length === 0) {
    return apiList([], { total: 0 });
  }

  try {
    const locationMap = new Map((locations ?? []).map((l: any) => [l.id, l.name])) as Map<string, string>;

    // Fetch brewery_visits + profiles in parallel
    const [
      { data: breweryVisits },
      { data: brandLoyaltyCards },
    ] = await Promise.all([
      supabase
        .from("brewery_visits")
        .select("user_id, brewery_id, total_visits, unique_beers_tried, first_visit_at, last_visit_at")
        .in("brewery_id", locationIds) as any,
      supabase
        .from("brand_loyalty_cards")
        .select("user_id, stamps")
        .eq("brand_id", brand_id) as any,
    ]);

    // Get unique user IDs for profile fetch
    const userIds = [...new Set((breweryVisits ?? []).map((v: any) => v.user_id).filter(Boolean))];
    if (userIds.length === 0) {
      return apiList([], { total: 0 });
    }

    // Fetch profiles in batches if needed (Supabase .in() has limits)
    const { data: profiles } = await (supabase
      .from("profiles")
      .select("id, display_name, username, avatar_url")
      .in("id", userIds) as any);

    // Build the customer list
    let customers = buildBrandCustomerList(
      breweryVisits ?? [],
      profiles ?? [],
      locationMap,
      brandLoyaltyCards ?? []
    );

    // Parse query params
    const url = request.nextUrl;
    const search = url.searchParams.get("search")?.toLowerCase().trim();
    const segmentFilter = url.searchParams.get("segment") as CustomerSegment | "cross-location" | null;
    const sortKey = url.searchParams.get("sort") ?? "visits";
    const sortDir = url.searchParams.get("order") ?? "desc";
    const page = parseInt(url.searchParams.get("page") ?? "1", 10);
    const perPage = Math.min(parseInt(url.searchParams.get("perPage") ?? "100", 10), 200);

    // Search
    if (search) {
      customers = customers.filter(
        (c) =>
          c.displayName.toLowerCase().includes(search) ||
          c.username.toLowerCase().includes(search)
      );
    }

    // Segment filter
    if (segmentFilter === "cross-location") {
      customers = customers.filter((c) => c.isCrossLocation);
    } else if (segmentFilter && ["vip", "power", "regular", "new"].includes(segmentFilter)) {
      customers = customers.filter((c) => c.segment === segmentFilter);
    }

    // Sort
    customers.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "visits") cmp = a.totalVisits - b.totalVisits;
      else if (sortKey === "last_visit") cmp = a.lastVisit.localeCompare(b.lastVisit);
      else if (sortKey === "locations") cmp = a.locationsVisited - b.locationsVisited;
      else cmp = a.displayName.localeCompare(b.displayName);
      return sortDir === "asc" ? cmp : -cmp;
    });

    const total = customers.length;
    const start = (page - 1) * perPage;
    const paginated = customers.slice(start, start + perPage);

    // Also compute regulars insight for the first page
    const regularsInsight = page === 1
      ? findRegularsAtOtherLocations(breweryVisits ?? [], profiles ?? [], locationIds, locationMap).slice(0, 5)
      : [];

    const crossLocationCount = customers.filter((c) => c.isCrossLocation).length;

    return apiList(paginated, {
      page,
      perPage,
      total,
      hasMore: start + perPage < total,
    });
  } catch (err) {
    console.error("Brand customers error:", err);
    return apiServerError("brand customers");
  }
}
