import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiSuccess, apiUnauthorized, apiForbidden, apiBadRequest, apiNotFound, apiServerError } from "@/lib/api-response";
import { verifyBrandAccess } from "@/lib/brand-auth";
import { rateLimitResponse } from "@/lib/rate-limit";

// ─── POST /api/brand/[brand_id]/tap-list/push ────────────────────────────────
// Push a beer to target locations.
// Supports two modes:
//   1. catalogBeerIds — push from catalog entry (preferred, Sprint 119+)
//   2. sourceBeerIds  — legacy clone mode (copies from a source location beer)
// When using catalog mode, created beers link back to brand_catalog_beer_id.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ brand_id: string }> }
) {
  const limited = rateLimitResponse(request, "brand-tap-list-push", { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  const { brand_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  const role = await verifyBrandAccess(supabase, brand_id, user.id);
  if (!role || !["owner", "regional_manager"].includes(role)) return apiForbidden();

  const body = await request.json();
  const { catalogBeerIds, sourceBeerIds, targetLocationIds } = body;

  if (!Array.isArray(targetLocationIds) || targetLocationIds.length === 0) {
    return apiBadRequest("targetLocationIds is required");
  }

  // Verify target locations belong to this brand
  const { data: validLocations } = await (supabase
    .from("breweries")
    .select("id")
    .eq("brand_id", brand_id)
    .in("id", targetLocationIds) as any);

  const validTargetIds = new Set((validLocations ?? []).map((l: any) => l.id));
  if (validTargetIds.size === 0) return apiBadRequest("No valid target locations found");

  try {
    // ── Mode 1: Catalog-based push ──
    if (Array.isArray(catalogBeerIds) && catalogBeerIds.length > 0) {
      const { data: catalogBeers } = await (supabase
        .from("brand_catalog_beers")
        .select("*")
        .eq("brand_id", brand_id)
        .in("id", catalogBeerIds)
        .eq("is_active", true) as any);

      if (!catalogBeers || catalogBeers.length === 0) return apiNotFound("Catalog beers");

      let created = 0;
      let skipped = 0;

      for (const catalogBeer of catalogBeers) {
        for (const targetId of Array.from(validTargetIds)) {
          // Check if already exists at target (linked or same name)
          const { data: existing } = await (supabase
            .from("beers")
            .select("id, brand_catalog_beer_id")
            .eq("brewery_id", targetId)
            .or(`brand_catalog_beer_id.eq.${catalogBeer.id},name.ilike.${catalogBeer.name}`)
            .eq("is_active", true)
            .maybeSingle() as any);

          if (existing) {
            // Link if not already linked
            if (!existing.brand_catalog_beer_id) {
              await (supabase
                .from("beers")
                .update({ brand_catalog_beer_id: catalogBeer.id })
                .eq("id", existing.id) as any);
            }
            skipped++;
            continue;
          }

          // Create from catalog
          await (supabase
            .from("beers")
            .insert({
              brewery_id: targetId,
              brand_catalog_beer_id: catalogBeer.id,
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

          created++;
        }
      }

      return apiSuccess({ created, skipped }, 201);
    }

    // ── Mode 2: Legacy source beer clone ──
    if (!Array.isArray(sourceBeerIds) || sourceBeerIds.length === 0) {
      return apiBadRequest("catalogBeerIds or sourceBeerIds is required");
    }

    const { data: sourceBeers } = await (supabase
      .from("beers")
      .select("*")
      .in("id", sourceBeerIds) as any);

    if (!sourceBeers || sourceBeers.length === 0) return apiNotFound("Source beers");

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

    let created = 0;
    let skipped = 0;

    for (const beer of sourceBeers) {
      for (const targetId of Array.from(validTargetIds)) {
        if (targetId === beer.brewery_id) { skipped++; continue; }

        const { data: existing } = await (supabase
          .from("beers")
          .select("id")
          .eq("brewery_id", targetId)
          .ilike("name", beer.name)
          .eq("is_active", true)
          .maybeSingle() as any);

        if (existing) { skipped++; continue; }

        const { data: newBeer, error: insertError } = await (supabase
          .from("beers")
          .insert({
            brewery_id: targetId,
            brand_catalog_beer_id: beer.brand_catalog_beer_id,
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

        if (insertError || !newBeer) continue;

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
