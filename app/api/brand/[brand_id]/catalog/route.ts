import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  apiSuccess,
  apiUnauthorized,
  apiForbidden,
  apiBadRequest,
  apiConflict,
  apiServerError,
} from "@/lib/api-response";

// ─── GET /api/brand/[brand_id]/catalog ──────────────────────────────────────
// Returns all catalog beers for the brand with location overlay data.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brand_id: string }> }
) {
  const { brand_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  const { data: membership } = await (supabase
    .from("brand_accounts")
    .select("role")
    .eq("brand_id", brand_id)
    .eq("user_id", user.id)
    .in("role", ["owner", "regional_manager"])
    .maybeSingle() as any);

  if (!membership) return apiForbidden();

  try {
    // Fetch catalog beers and locations in parallel
    const [{ data: catalogBeers }, { data: locations }] = await Promise.all([
      supabase
        .from("brand_catalog_beers")
        .select("*")
        .eq("brand_id", brand_id)
        .order("name") as any,
      supabase
        .from("breweries")
        .select("id, name, city, state, logo_url")
        .eq("brand_id", brand_id)
        .order("name") as any,
    ]);

    const catalog = catalogBeers ?? [];
    const locs = locations ?? [];
    const locationIds = locs.map((l: any) => l.id);

    // Fetch linked location beers + pour stats
    let linkedBeers: any[] = [];
    let beerLogs: any[] = [];

    if (locationIds.length > 0 && catalog.length > 0) {
      const catalogIds = catalog.map((c: any) => c.id);

      const [{ data: beers }, { data: logs }] = await Promise.all([
        supabase
          .from("beers")
          .select("id, brewery_id, name, brand_catalog_beer_id, is_on_tap, is_86d, price_per_pint, is_active")
          .in("brewery_id", locationIds)
          .in("brand_catalog_beer_id", catalogIds)
          .eq("is_active", true) as any,
        supabase
          .from("beer_logs")
          .select("beer_id, quantity, rating")
          .in("brewery_id", locationIds) as any,
      ]);

      linkedBeers = beers ?? [];
      beerLogs = logs ?? [];
    }

    // Build pour stats per beer_id
    const pourStats: Record<string, { pours: number; totalRating: number; ratingCount: number }> = {};
    beerLogs.forEach((l: any) => {
      if (!pourStats[l.beer_id]) pourStats[l.beer_id] = { pours: 0, totalRating: 0, ratingCount: 0 };
      pourStats[l.beer_id].pours += l.quantity ?? 1;
      if (l.rating > 0) {
        pourStats[l.beer_id].totalRating += l.rating;
        pourStats[l.beer_id].ratingCount++;
      }
    });

    // Build catalog items with location overlay
    const items = catalog.map((c: any) => {
      const beersForCatalog = linkedBeers.filter((b: any) => b.brand_catalog_beer_id === c.id);

      let totalPours = 0;
      let totalRating = 0;
      let ratingCount = 0;

      const catalogLocations = beersForCatalog.map((b: any) => {
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
        name: c.name,
        style: c.style,
        abv: c.abv ? parseFloat(c.abv) : null,
        ibu: c.ibu,
        description: c.description,
        itemType: c.item_type ?? "beer",
        category: c.category,
        glassType: c.glass_type,
        coverImageUrl: c.cover_image_url,
        seasonal: c.seasonal,
        isActive: c.is_active,
        totalPours,
        avgRating: ratingCount > 0 ? parseFloat((totalRating / ratingCount).toFixed(1)) : null,
        ratingCount,
        locations: catalogLocations,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      };
    });

    // Sort: active first, then on tap somewhere, then by name
    items.sort((a: any, b: any) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      const aOnTap = a.locations.some((l: any) => l.isOnTap);
      const bOnTap = b.locations.some((l: any) => l.isOnTap);
      if (aOnTap !== bOnTap) return aOnTap ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    // Stats
    const active = items.filter((i: any) => i.isActive);
    const stats = {
      totalCatalog: catalog.length,
      active: active.length,
      onTapSomewhere: active.filter((i: any) => i.locations.some((l: any) => l.isOnTap)).length,
      availableEverywhere: active.filter((i: any) => i.locations.length === locs.length).length,
    };

    return apiSuccess({ catalog: items, locations: locs, stats });
  } catch (err) {
    console.error("Brand catalog GET error:", err);
    return apiServerError("brand catalog");
  }
}

// ─── POST /api/brand/[brand_id]/catalog ─────────────────────────────────────
// Create a new catalog beer entry.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ brand_id: string }> }
) {
  const { brand_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  const { data: membership } = await (supabase
    .from("brand_accounts")
    .select("role")
    .eq("brand_id", brand_id)
    .eq("user_id", user.id)
    .in("role", ["owner", "regional_manager"])
    .maybeSingle() as any);

  if (!membership) return apiForbidden();

  const body = await request.json();
  const { name, style, abv, ibu, description, itemType, category, glassType, seasonal, coverImageUrl } = body;

  if (!name?.trim()) return apiBadRequest("Beer name is required", "name");

  try {
    // Check uniqueness within brand
    const { data: existing } = await (supabase
      .from("brand_catalog_beers")
      .select("id")
      .eq("brand_id", brand_id)
      .ilike("name", name.trim())
      .maybeSingle() as any);

    if (existing) return apiConflict(`"${name.trim()}" already exists in the catalog`);

    const { data: created, error } = await (supabase
      .from("brand_catalog_beers")
      .insert({
        brand_id,
        name: name.trim(),
        style: style || null,
        abv: abv ? parseFloat(abv) : null,
        ibu: ibu ? parseInt(ibu) : null,
        description: description?.trim() || null,
        item_type: itemType || "beer",
        category: category?.trim() || null,
        glass_type: glassType || null,
        cover_image_url: coverImageUrl || null,
        seasonal: seasonal ?? false,
        created_by: user.id,
      })
      .select()
      .single() as any);

    if (error) {
      console.error("Brand catalog insert error:", error);
      return apiServerError("create catalog beer");
    }

    return apiSuccess(created, 201);
  } catch (err) {
    console.error("Brand catalog POST error:", err);
    return apiServerError("create catalog beer");
  }
}
