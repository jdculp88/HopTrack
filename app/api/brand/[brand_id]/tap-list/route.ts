import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiSuccess, apiUnauthorized, apiForbidden, apiNotFound, apiServerError } from "@/lib/api-response";

// ─── GET /api/brand/[brand_id]/tap-list ──────────────────────────────────────
// Aggregated beer catalog across all brand locations with per-location status.
// Groups beers by lowercase name to unify the same beer at different locations.
// Returns: { catalog, locations, stats }
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

  // Fetch locations
  const { data: locations } = await (supabase
    .from("breweries")
    .select("id, name, city, state, logo_url")
    .eq("brand_id", brand_id)
    .order("name") as any);

  const locationIds = (locations ?? []).map((l: any) => l.id);

  if (locationIds.length === 0) {
    return apiSuccess({ catalog: [], locations: [], stats: { totalOnTap: 0, totalOff: 0, uniqueBeers: 0, sharedBeers: 0 } });
  }

  try {
    // Fetch all beers across all locations + pour counts from beer_logs
    const [{ data: allBeers }, { data: beerLogs }] = await Promise.all([
      supabase
        .from("beers")
        .select("id, brewery_id, name, style, abv, ibu, description, item_type, category, is_on_tap, is_86d, is_active, glass_type, price_per_pint, cover_image_url")
        .in("brewery_id", locationIds)
        .eq("is_active", true)
        .order("name") as any,
      supabase
        .from("beer_logs")
        .select("beer_id, quantity, rating")
        .in("brewery_id", locationIds) as any,
    ]);

    const beers = allBeers ?? [];
    const logs = beerLogs ?? [];

    // Build pour stats per beer_id
    const pourStats: Record<string, { pours: number; totalRating: number; ratingCount: number }> = {};
    logs.forEach((l: any) => {
      if (!pourStats[l.beer_id]) pourStats[l.beer_id] = { pours: 0, totalRating: 0, ratingCount: 0 };
      pourStats[l.beer_id].pours += l.quantity ?? 1;
      if (l.rating > 0) {
        pourStats[l.beer_id].totalRating += l.rating;
        pourStats[l.beer_id].ratingCount++;
      }
    });

    // Group beers by lowercase name
    const catalogMap: Record<string, {
      key: string;
      name: string;
      style: string | null;
      abv: number | null;
      ibu: number | null;
      description: string | null;
      itemType: string;
      category: string | null;
      glassType: string | null;
      totalPours: number;
      avgRating: number | null;
      ratingCount: number;
      locations: Array<{
        locationId: string;
        beerId: string;
        isOnTap: boolean;
        is86d: boolean;
        pricePerPint: number | null;
      }>;
    }> = {};

    beers.forEach((b: any) => {
      const key = b.name.toLowerCase().trim();
      if (!catalogMap[key]) {
        catalogMap[key] = {
          key,
          name: b.name,
          style: b.style,
          abv: b.abv,
          ibu: b.ibu,
          description: b.description,
          itemType: b.item_type ?? "beer",
          category: b.category,
          glassType: b.glass_type,
          totalPours: 0,
          avgRating: null,
          ratingCount: 0,
          locations: [],
        };
      }

      // Accumulate pour stats
      const stats = pourStats[b.id];
      if (stats) {
        catalogMap[key].totalPours += stats.pours;
        catalogMap[key].ratingCount += stats.ratingCount;
        // We'll compute avgRating after
        if (stats.ratingCount > 0) {
          const existing = catalogMap[key];
          const prevTotal = (existing.avgRating ?? 0) * (existing.ratingCount - stats.ratingCount);
          existing.avgRating = null; // recalculated below
        }
      }

      catalogMap[key].locations.push({
        locationId: b.brewery_id,
        beerId: b.id,
        isOnTap: b.is_on_tap ?? false,
        is86d: b.is_86d ?? false,
        pricePerPint: b.price_per_pint,
      });
    });

    // Finalize avg ratings from raw logs
    const beerIdToKey: Record<string, string> = {};
    beers.forEach((b: any) => { beerIdToKey[b.id] = b.name.toLowerCase().trim(); });

    const keyRatings: Record<string, { total: number; count: number }> = {};
    logs.forEach((l: any) => {
      if (l.rating > 0 && beerIdToKey[l.beer_id]) {
        const k = beerIdToKey[l.beer_id];
        if (!keyRatings[k]) keyRatings[k] = { total: 0, count: 0 };
        keyRatings[k].total += l.rating;
        keyRatings[k].count++;
      }
    });

    Object.entries(keyRatings).forEach(([k, r]) => {
      if (catalogMap[k]) {
        catalogMap[k].avgRating = parseFloat((r.total / r.count).toFixed(1));
        catalogMap[k].ratingCount = r.count;
      }
    });

    const catalog = Object.values(catalogMap).sort((a, b) => {
      // Sort: on tap somewhere first, then by name
      const aOnTap = a.locations.some(l => l.isOnTap);
      const bOnTap = b.locations.some(l => l.isOnTap);
      if (aOnTap !== bOnTap) return aOnTap ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    // Stats
    const totalOnTap = beers.filter((b: any) => b.is_on_tap).length;
    const totalOff = beers.filter((b: any) => !b.is_on_tap).length;
    const uniqueBeers = catalog.length;
    const sharedBeers = catalog.filter(c => c.locations.length > 1).length;

    return apiSuccess({
      catalog,
      locations: locations ?? [],
      stats: { totalOnTap, totalOff, uniqueBeers, sharedBeers },
    });
  } catch (err) {
    console.error("Brand tap list error:", err);
    return apiServerError("brand tap list");
  }
}
