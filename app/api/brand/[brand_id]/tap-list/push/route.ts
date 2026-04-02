import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiSuccess, apiUnauthorized, apiForbidden, apiBadRequest, apiNotFound, apiServerError } from "@/lib/api-response";

// ─── POST /api/brand/[brand_id]/tap-list/push ────────────────────────────────
// Push (clone) a beer from one location to one or more target locations.
// Creates new beer records at each target with the same metadata.
// Also clones pour sizes from the source beer.
//
// Body: { sourceBeerIds: string[], targetLocationIds: string[] }
//   - sourceBeerIds: array of beer IDs to clone (from one location)
//   - targetLocationIds: array of brewery IDs to push to
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ brand_id: string }> }
) {
  const { brand_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  // Verify brand ownership
  const { data: membership } = await (supabase
    .from("brand_accounts")
    .select("role")
    .eq("brand_id", brand_id)
    .eq("user_id", user.id)
    .in("role", ["owner", "regional_manager"])
    .maybeSingle() as any);

  if (!membership) return apiForbidden();

  const body = await request.json();
  const { sourceBeerIds, targetLocationIds } = body;

  if (!Array.isArray(sourceBeerIds) || sourceBeerIds.length === 0) {
    return apiBadRequest("sourceBeerIds is required");
  }
  if (!Array.isArray(targetLocationIds) || targetLocationIds.length === 0) {
    return apiBadRequest("targetLocationIds is required");
  }

  try {
    // Verify target locations belong to this brand
    const { data: locations } = await (supabase
      .from("breweries")
      .select("id")
      .eq("brand_id", brand_id)
      .in("id", targetLocationIds) as any);

    const validTargetIds = new Set((locations ?? []).map((l: any) => l.id));
    if (validTargetIds.size === 0) {
      return apiBadRequest("No valid target locations found in this brand");
    }

    // Fetch source beers
    const { data: sourceBeers } = await (supabase
      .from("beers")
      .select("*")
      .in("id", sourceBeerIds) as any);

    if (!sourceBeers || sourceBeers.length === 0) {
      return apiNotFound("Source beers");
    }

    // Fetch pour sizes for source beers
    const { data: sourcePourSizes } = await (supabase
      .from("beer_pour_sizes")
      .select("*")
      .in("beer_id", sourceBeerIds)
      .order("display_order") as any);

    const pourSizesByBeer: Record<string, any[]> = {};
    (sourcePourSizes ?? []).forEach((ps: any) => {
      if (!pourSizesByBeer[ps.beer_id]) pourSizesByBeer[ps.beer_id] = [];
      pourSizesByBeer[ps.beer_id].push(ps);
    });

    // For each source beer × target location, check if already exists and clone if not
    let created = 0;
    let skipped = 0;

    for (const beer of sourceBeers) {
      for (const targetId of Array.from(validTargetIds)) {
        // Skip if target is the same brewery as source
        if (targetId === beer.brewery_id) {
          skipped++;
          continue;
        }

        // Check if beer with same name already exists at target
        const { data: existing } = await (supabase
          .from("beers")
          .select("id")
          .eq("brewery_id", targetId)
          .ilike("name", beer.name)
          .eq("is_active", true)
          .maybeSingle() as any);

        if (existing) {
          skipped++;
          continue;
        }

        // Clone the beer
        const { data: newBeer, error: insertError } = await (supabase
          .from("beers")
          .insert({
            brewery_id: targetId,
            name: beer.name,
            style: beer.style,
            abv: beer.abv,
            ibu: beer.ibu,
            description: beer.description,
            item_type: beer.item_type ?? "beer",
            category: beer.category,
            glass_type: beer.glass_type,
            is_on_tap: true,
            is_active: true,
            is_featured: false,
            created_by: user.id,
          })
          .select("id")
          .single() as any);

        if (insertError || !newBeer) {
          console.error("Failed to clone beer:", insertError);
          continue;
        }

        // Clone pour sizes
        const sourcePours = pourSizesByBeer[beer.id] ?? [];
        if (sourcePours.length > 0) {
          await (supabase
            .from("beer_pour_sizes")
            .insert(sourcePours.map((ps: any, i: number) => ({
              beer_id: newBeer.id,
              label: ps.label,
              oz: ps.oz,
              price: ps.price,
              display_order: i,
            }))) as any);
        }

        created++;
      }
    }

    return apiSuccess({ created, skipped }, 201);
  } catch (err) {
    console.error("Brand tap list push error:", err);
    return apiServerError("brand tap list push");
  }
}
