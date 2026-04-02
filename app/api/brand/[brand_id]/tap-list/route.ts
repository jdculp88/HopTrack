import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyBrandAccess } from "@/lib/brand-auth";
import { apiSuccess, apiUnauthorized, apiForbidden, apiServerError } from "@/lib/api-response";

// ─── GET /api/brand/[brand_id]/tap-list ──────────────────────────────────────
// Aggregated beer catalog across all brand locations with per-location status.
// Now sources from brand_catalog_beers with location overlay.
// Orphan beers (at brand locations but not in catalog) returned separately.
// Returns: { catalog, orphans, locations, stats }
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

  // Fetch locations
  const { data: locations } = await (supabase
    .from("breweries")
    .select("id, name, city, state, cover_image_url")
    .eq("brand_id", brand_id)
    .order("name") as any);

  const locationIds = (locations ?? []).map((l: any) => l.id);

  if (locationIds.length === 0) {
    return apiSuccess({ catalog: [], orphans: [], locations: [], stats: { totalOnTap: 0, totalOff: 0, uniqueBeers: 0, sharedBeers: 0 } });
  }

  try {
    // Fetch catalog beers, all location beers, and beer logs in parallel
    const [{ data: catalogBeers }, { data: allBeers }, { data: beerLogs }] = await Promise.all([
      supabase
        .from("brand_catalog_beers")
        .select("*")
        .eq("brand_id", brand_id)
        .eq("is_active", true)
        .order("name") as any,
      supabase
        .from("beers")
        .select("id, brewery_id, name, style, abv, ibu, description, item_type, category, is_on_tap, is_86d, is_active, glass_type, price_per_pint, cover_image_url, brand_catalog_beer_id")
        .in("brewery_id", locationIds)
        .eq("is_active", true)
        .order("name") as any,
      supabase
        .from("beer_logs")
        .select("beer_id, quantity, rating")
        .in("brewery_id", locationIds) as any,
    ]);

    const catalog = catalogBeers ?? [];
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

    // Build catalog items from brand_catalog_beers
    const catalogItems = catalog.map((c: any) => {
      const linkedBeers = beers.filter((b: any) => b.brand_catalog_beer_id === c.id);

      let totalPours = 0;
      let totalRating = 0;
      let ratingCount = 0;

      const beerLocations = linkedBeers.map((b: any) => {
        const stats = pourStats[b.id];
        if (stats) {
          totalPours += stats.pours;
          totalRating += stats.totalRating;
          ratingCount += stats.ratingCount;
        }
        return {
          locationId: b.brewery_id,
          beerId: b.id,
          isOnTap: b.is_on_tap ?? false,
          is86d: b.is_86d ?? false,
          pricePerPint: b.price_per_pint,
        };
      });

      return {
        id: c.id,
        key: c.name.toLowerCase().trim(),
        name: c.name,
        style: c.style,
        abv: c.abv ? parseFloat(c.abv) : null,
        ibu: c.ibu,
        description: c.description,
        itemType: c.item_type ?? "beer",
        category: c.category,
        glassType: c.glass_type,
        totalPours,
        avgRating: ratingCount > 0 ? parseFloat((totalRating / ratingCount).toFixed(1)) : null,
        ratingCount,
        locations: beerLocations,
      };
    });

    // Sort: on tap somewhere first, then by name
    catalogItems.sort((a: any, b: any) => {
      const aOnTap = a.locations.some((l: any) => l.isOnTap);
      const bOnTap = b.locations.some((l: any) => l.isOnTap);
      if (aOnTap !== bOnTap) return aOnTap ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    // Find orphan beers: at brand locations but not linked to any catalog entry
    const linkedBeerIds = new Set(beers.filter((b: any) => b.brand_catalog_beer_id).map((b: any) => b.id));
    const orphanBeers = beers.filter((b: any) => !b.brand_catalog_beer_id);

    // Group orphans by lowercase name (like old aggregation)
    const orphanMap: Record<string, any> = {};
    orphanBeers.forEach((b: any) => {
      const key = b.name.toLowerCase().trim();
      if (!orphanMap[key]) {
        orphanMap[key] = {
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

      const stats = pourStats[b.id];
      if (stats) {
        orphanMap[key].totalPours += stats.pours;
      }

      orphanMap[key].locations.push({
        locationId: b.brewery_id,
        beerId: b.id,
        isOnTap: b.is_on_tap ?? false,
        is86d: b.is_86d ?? false,
        pricePerPint: b.price_per_pint,
      });
    });

    // Compute orphan avg ratings
    orphanBeers.forEach((b: any) => {
      const key = b.name.toLowerCase().trim();
      const stats = pourStats[b.id];
      if (stats && stats.ratingCount > 0 && orphanMap[key]) {
        const o = orphanMap[key];
        // Accumulate for later avg
        if (!o._ratingTotal) { o._ratingTotal = 0; o._ratingCount = 0; }
        o._ratingTotal += stats.totalRating;
        o._ratingCount += stats.ratingCount;
      }
    });
    Object.values(orphanMap).forEach((o: any) => {
      if (o._ratingCount > 0) {
        o.avgRating = parseFloat((o._ratingTotal / o._ratingCount).toFixed(1));
        o.ratingCount = o._ratingCount;
      }
      delete o._ratingTotal;
      delete o._ratingCount;
    });

    const orphans = Object.values(orphanMap).sort((a: any, b: any) => a.name.localeCompare(b.name));

    // Stats (from all beers, both catalog and orphan)
    const totalOnTap = beers.filter((b: any) => b.is_on_tap).length;
    const totalOff = beers.filter((b: any) => !b.is_on_tap).length;
    const uniqueBeers = catalogItems.length + orphans.length;
    const sharedBeers = catalogItems.filter((c: any) => c.locations.length > 1).length +
      orphans.filter((o: any) => o.locations.length > 1).length;

    return apiSuccess({
      catalog: catalogItems,
      orphans,
      locations: locations ?? [],
      stats: { totalOnTap, totalOff, uniqueBeers, sharedBeers },
    });
  } catch (err) {
    console.error("Brand tap list error:", err);
    return apiServerError("brand tap list");
  }
}
