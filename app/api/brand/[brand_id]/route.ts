import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { apiSuccess, apiUnauthorized, apiForbidden, apiBadRequest, apiNotFound, apiConflict, apiServerError } from "@/lib/api-response";

// ─── GET /api/brand/[brand_id] ──────────────────────────────────────────────
// Public: get brand details with locations.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brand_id: string }> }
) {
  const { brand_id } = await params;
  const supabase = await createClient();

  const { data: brand, error } = await (supabase
    .from("brewery_brands")
    .select("*")
    .eq("id", brand_id)
    .single() as any);

  if (error || !brand) return apiNotFound("Brand");

  // Fetch locations
  const { data: locations } = await (supabase
    .from("breweries")
    .select("id, name, city, state, logo_url, cover_image_url, latitude, longitude")
    .eq("brand_id", brand_id)
    .order("name") as any);

  return apiSuccess({ ...brand, locations: locations ?? [] });
}

// ─── PATCH /api/brand/[brand_id] ────────────────────────────────────────────
// Update brand details. Brand owner or regional_manager only.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ brand_id: string }> }
) {
  const rl = rateLimitResponse(request, "brand-update", { limit: 10, windowMs: 60_000 });
  if (rl) return rl;

  const { brand_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  // Check brand membership
  const { data: membership } = await (supabase
    .from("brand_accounts")
    .select("role")
    .eq("brand_id", brand_id)
    .eq("user_id", user.id)
    .in("role", ["owner", "regional_manager"])
    .maybeSingle() as any);

  if (!membership) return apiForbidden();

  const body = await request.json();
  const { name, slug, description, website_url, logo_url } = body;

  // Build update object — only include provided fields
  const update: Record<string, any> = {};
  if (name !== undefined) update.name = name;
  if (description !== undefined) update.description = description || null;
  if (website_url !== undefined) update.website_url = website_url || null;
  if (logo_url !== undefined) update.logo_url = logo_url || null;

  if (slug !== undefined) {
    if (!/^[a-z0-9-]+$/.test(slug) || slug.length < 2 || slug.length > 64) {
      return apiBadRequest("Slug must be 2-64 characters, lowercase letters, numbers, and hyphens only", "slug");
    }

    // Check uniqueness (excluding current brand)
    const { data: existingSlug } = await (supabase
      .from("brewery_brands")
      .select("id")
      .eq("slug", slug)
      .neq("id", brand_id)
      .maybeSingle() as any);

    if (existingSlug) return apiConflict("This slug is already taken");
    update.slug = slug;
  }

  if (Object.keys(update).length === 0) {
    return apiBadRequest("No fields to update");
  }

  const { data: updated, error } = await (supabase
    .from("brewery_brands")
    .update(update)
    .eq("id", brand_id)
    .select()
    .single() as any);

  if (error) return apiServerError("brand update");

  return apiSuccess(updated);
}

// ─── DELETE /api/brand/[brand_id] ───────────────────────────────────────────
// Dissolve a brand. Brand owner only.
// Clears brand_id on all locations, removes propagated brewery_accounts,
// deletes brand_accounts and the brand itself.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ brand_id: string }> }
) {
  const rl = rateLimitResponse(request, "brand-delete", { limit: 3, windowMs: 60_000 });
  if (rl) return rl;

  const { brand_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  // Only brand owner can dissolve
  const { data: brand } = await (supabase
    .from("brewery_brands")
    .select("owner_id")
    .eq("id", brand_id)
    .single() as any);

  if (!brand || brand.owner_id !== user.id) return apiForbidden();

  // 1. Clear brand_id on all locations
  await (supabase
    .from("breweries")
    .update({ brand_id: null })
    .eq("brand_id", brand_id) as any);

  // 2. Remove all propagated brewery_accounts
  await (supabase
    .from("brewery_accounts")
    .delete()
    .eq("propagated_from_brand", true)
    .in("brewery_id",
      (await (supabase
        .from("breweries")
        .select("id")
        .eq("brand_id", brand_id) as any))?.data?.map((b: any) => b.id) ?? []
    ) as any);

  // Note: brand_accounts are CASCADE deleted when brand is deleted

  // 3. Delete the brand (cascades to brand_accounts)
  const { error } = await (supabase
    .from("brewery_brands")
    .delete()
    .eq("id", brand_id) as any);

  if (error) return apiServerError("brand dissolve");

  return apiSuccess({ dissolved: true });
}
