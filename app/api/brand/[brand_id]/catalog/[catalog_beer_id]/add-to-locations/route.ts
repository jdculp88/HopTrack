import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  apiSuccess,
  apiUnauthorized,
  apiForbidden,
  apiBadRequest,
  apiNotFound,
  apiServerError,
} from "@/lib/api-response";
import { verifyBrandAccess } from "@/lib/brand-auth";

// ─── POST /api/brand/[brand_id]/catalog/[catalog_beer_id]/add-to-locations ──
// Add a catalog beer to one or more locations.
// For each target: link existing beer if same name, create new if not, skip if already linked.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ brand_id: string; catalog_beer_id: string }> }
) {
  const { brand_id, catalog_beer_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  const role = await verifyBrandAccess(supabase, brand_id, user.id);
  if (!role || !["owner", "regional_manager"].includes(role)) return apiForbidden();

  const body = await request.json();
  const { locationIds } = body;

  if (!Array.isArray(locationIds) || locationIds.length === 0) {
    return apiBadRequest("locationIds is required");
  }

  try {
    // Fetch catalog beer
    const { data: catalogBeer } = await (supabase
      .from("brand_catalog_beers")
      .select("*")
      .eq("id", catalog_beer_id)
      .eq("brand_id", brand_id)
      .eq("is_active", true)
      .single() as any);

    if (!catalogBeer) return apiNotFound("Catalog beer");

    // Verify target locations belong to this brand
    const { data: validLocations } = await (supabase
      .from("breweries")
      .select("id")
      .eq("brand_id", brand_id)
      .in("id", locationIds) as any);

    const validIds = new Set((validLocations ?? []).map((l: any) => l.id));
    if (validIds.size === 0) return apiBadRequest("No valid target locations found");

    let created = 0;
    let linked = 0;
    let skipped = 0;

    for (const locId of Array.from(validIds)) {
      // Check if a beer already linked to this catalog entry exists at this location
      const { data: alreadyLinked } = await (supabase
        .from("beers")
        .select("id")
        .eq("brewery_id", locId)
        .eq("brand_catalog_beer_id", catalog_beer_id)
        .eq("is_active", true)
        .maybeSingle() as any);

      if (alreadyLinked) {
        skipped++;
        continue;
      }

      // Check if a beer with the same name exists but isn't linked
      const { data: sameNameBeer } = await (supabase
        .from("beers")
        .select("id, brand_catalog_beer_id")
        .eq("brewery_id", locId)
        .ilike("name", catalogBeer.name)
        .eq("is_active", true)
        .maybeSingle() as any);

      if (sameNameBeer && !sameNameBeer.brand_catalog_beer_id) {
        // Link existing beer to catalog entry
        await (supabase
          .from("beers")
          .update({ brand_catalog_beer_id: catalog_beer_id })
          .eq("id", sameNameBeer.id) as any);
        linked++;
        continue;
      }

      if (sameNameBeer) {
        // Already linked to a different catalog entry — skip
        skipped++;
        continue;
      }

      // Create new beer from catalog data
      const { error: insertError } = await (supabase
        .from("beers")
        .insert({
          brewery_id: locId,
          brand_catalog_beer_id: catalog_beer_id,
          name: catalogBeer.name,
          style: catalogBeer.style,
          abv: catalogBeer.abv ? parseFloat(catalogBeer.abv) : null,
          ibu: catalogBeer.ibu,
          description: catalogBeer.description,
          item_type: catalogBeer.item_type ?? "beer",
          category: catalogBeer.category,
          glass_type: catalogBeer.glass_type,
          is_on_tap: true,
          is_active: true,
          is_featured: false,
          created_by: user.id,
        }) as any);

      if (insertError) {
        console.error("Failed to create beer at location:", insertError);
        continue;
      }

      created++;
    }

    return apiSuccess({ created, linked, skipped }, 201);
  } catch (err) {
    console.error("Add to locations error:", err);
    return apiServerError("add catalog beer to locations");
  }
}
