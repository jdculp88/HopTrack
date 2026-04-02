import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { apiSuccess, apiUnauthorized, apiForbidden, apiBadRequest, apiNotFound, apiConflict, apiServerError } from "@/lib/api-response";
import { propagateBrandAccess, removePropagatedAccess } from "@/lib/brand-propagation";

async function getBrandRole(supabase: any, userId: string, brandId: string): Promise<string | null> {
  const { data } = await (supabase
    .from("brand_accounts")
    .select("role")
    .eq("brand_id", brandId)
    .eq("user_id", userId)
    .maybeSingle() as any);
  return data?.role ?? null;
}

// ─── GET /api/brand/[brand_id]/locations ────────────────────────────────────
// List all locations for a brand.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brand_id: string }> }
) {
  const { brand_id } = await params;
  const supabase = await createClient();

  const { data: locations } = await (supabase
    .from("breweries")
    .select("id, name, city, state, logo_url, cover_image_url, latitude, longitude, created_at")
    .eq("brand_id", brand_id)
    .order("name") as any);

  return apiSuccess(locations ?? []);
}

// ─── POST /api/brand/[brand_id]/locations ───────────────────────────────────
// Add a location to a brand. Either attach an existing brewery or create a new one.
// Body: { brewery_id } for existing, or { name, city, state } for new.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ brand_id: string }> }
) {
  const rl = rateLimitResponse(request, "brand-add-location", { limit: 10, windowMs: 60_000 });
  if (rl) return rl;

  const { brand_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  const role = await getBrandRole(supabase, user.id, brand_id);
  if (role !== "owner") return apiForbidden();

  const body = await request.json();
  const { brewery_id, name, city, state } = body;

  let targetBreweryId: string;

  if (brewery_id) {
    // Attach existing brewery — must not already be in a brand
    const { data: brewery } = await (supabase
      .from("breweries")
      .select("id, brand_id")
      .eq("id", brewery_id)
      .single() as any);

    if (!brewery) return apiNotFound("Brewery");
    if (brewery.brand_id) return apiConflict("This brewery is already part of a brand");

    targetBreweryId = brewery_id;
  } else if (name && city && state) {
    // Create new brewery under this brand
    const { data: newBrewery, error } = await (supabase
      .from("breweries")
      .insert({
        name,
        city,
        state,
        brand_id: brand_id,
      })
      .select("id")
      .single() as any);

    if (error) return apiServerError("create location");
    targetBreweryId = newBrewery.id;
  } else {
    return apiBadRequest("Provide either brewery_id or name/city/state");
  }

  // Set brand_id on brewery (for existing brewery path)
  if (brewery_id) {
    const { error } = await (supabase
      .from("breweries")
      .update({ brand_id: brand_id })
      .eq("id", targetBreweryId) as any);

    if (error) return apiServerError("set brand_id");
  }

  // Propagate brand access to the new location
  await propagateBrandAccess(supabase as any, brand_id, { breweryId: targetBreweryId });

  // Fetch the updated brewery to return
  const { data: location } = await (supabase
    .from("breweries")
    .select("id, name, city, state, logo_url, cover_image_url")
    .eq("id", targetBreweryId)
    .single() as any);

  return apiSuccess(location, 201);
}

// ─── DELETE /api/brand/[brand_id]/locations ──────────────────────────────────
// Remove a location from a brand. Reverts it to independent.
// Body: { brewery_id }
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ brand_id: string }> }
) {
  const rl = rateLimitResponse(request, "brand-remove-location", { limit: 10, windowMs: 60_000 });
  if (rl) return rl;

  const { brand_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  const role = await getBrandRole(supabase, user.id, brand_id);
  if (role !== "owner") return apiForbidden();

  const body = await request.json();
  const { brewery_id } = body;

  if (!brewery_id) return apiBadRequest("brewery_id is required");

  // Verify brewery belongs to this brand
  const { data: brewery } = await (supabase
    .from("breweries")
    .select("id, brand_id")
    .eq("id", brewery_id)
    .eq("brand_id", brand_id)
    .single() as any);

  if (!brewery) return apiNotFound("Location");

  // Remove propagated access BEFORE clearing brand_id
  await removePropagatedAccess(supabase as any, brand_id, { breweryId: brewery_id });

  // Clear brand_id
  const { error } = await (supabase
    .from("breweries")
    .update({ brand_id: null })
    .eq("id", brewery_id) as any);

  if (error) return apiServerError("remove location from brand");

  return apiSuccess({ removed: true });
}
