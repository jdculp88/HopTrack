import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiSuccess, apiUnauthorized, apiForbidden, apiBadRequest, apiServerError } from "@/lib/api-response";
import { verifyBrandAccess } from "@/lib/brand-auth";

// ─── PATCH /api/brand/[brand_id]/tap-list/batch ──────────────────────────────
// Batch update is_on_tap / is_86d for beers across multiple locations.
//
// Body: { beerIds: string[], action: "on_tap" | "off_tap" | "86" | "un86" }
//   - beerIds: array of specific beer record IDs (not grouped — actual beer.id values)
//   - action: what to do to them
export async function PATCH(
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

  const body = await request.json();
  const { beerIds, action } = body;

  if (!Array.isArray(beerIds) || beerIds.length === 0) {
    return apiBadRequest("beerIds is required");
  }

  const validActions = ["on_tap", "off_tap", "86", "un86"];
  if (!validActions.includes(action)) {
    return apiBadRequest(`action must be one of: ${validActions.join(", ")}`);
  }

  try {
    // Verify all beer IDs belong to locations in this brand
    const { data: locations } = await (supabase
      .from("breweries")
      .select("id")
      .eq("brand_id", brand_id) as any);

    const locationIds = (locations ?? []).map((l: any) => l.id);
    if (locationIds.length === 0) return apiBadRequest("No locations in this brand");

    // Only update beers that belong to brand locations
    const { data: validBeers } = await (supabase
      .from("beers")
      .select("id")
      .in("id", beerIds)
      .in("brewery_id", locationIds) as any);

    const validBeerIds = (validBeers ?? []).map((b: any) => b.id);
    if (validBeerIds.length === 0) return apiBadRequest("No valid beers found in this brand");

    // Build update payload
    let update: Record<string, boolean> = {};
    switch (action) {
      case "on_tap":
        update = { is_on_tap: true, is_86d: false };
        break;
      case "off_tap":
        update = { is_on_tap: false };
        break;
      case "86":
        update = { is_86d: true };
        break;
      case "un86":
        update = { is_86d: false };
        break;
    }

    const { error } = await (supabase
      .from("beers")
      .update(update)
      .in("id", validBeerIds) as any);

    if (error) {
      console.error("Batch update error:", error);
      return apiServerError("brand tap list batch update");
    }

    return apiSuccess({ updated: validBeerIds.length, action });
  } catch (err) {
    console.error("Brand tap list batch error:", err);
    return apiServerError("brand tap list batch");
  }
}
