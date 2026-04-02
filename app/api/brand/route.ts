import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { apiSuccess, apiUnauthorized, apiForbidden, apiBadRequest, apiConflict, apiServerError } from "@/lib/api-response";
import { propagateBrandAccess } from "@/lib/brand-propagation";

// ─── POST /api/brand ────────────────────────────────────────────────────────
// Create a new brand with the current brewery as the first location.
export async function POST(request: NextRequest) {
  const rl = rateLimitResponse(request, "brand-create", { limit: 5, windowMs: 60_000 });
  if (rl) return rl;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  const body = await request.json();
  const { name, slug, description, website_url, logo_url, first_brewery_id } = body;

  if (!name || !slug || !first_brewery_id) {
    return apiBadRequest("name, slug, and first_brewery_id are required");
  }

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug) || slug.length < 2 || slug.length > 64) {
    return apiBadRequest("Slug must be 2-64 characters, lowercase letters, numbers, and hyphens only", "slug");
  }

  // Verify user owns the first brewery
  const { data: account } = await (supabase
    .from("brewery_accounts")
    .select("role")
    .eq("user_id", user.id)
    .eq("brewery_id", first_brewery_id)
    .eq("role", "owner")
    .maybeSingle() as any);

  if (!account) return apiForbidden();

  // Verify brewery isn't already in a brand
  const { data: brewery } = await (supabase
    .from("breweries")
    .select("id, brand_id")
    .eq("id", first_brewery_id)
    .single() as any);

  if (brewery?.brand_id) {
    return apiConflict("This brewery is already part of a brand");
  }

  // Check slug uniqueness
  const { data: existingSlug } = await (supabase
    .from("brewery_brands")
    .select("id")
    .eq("slug", slug)
    .maybeSingle() as any);

  if (existingSlug) {
    return apiConflict("This slug is already taken");
  }

  // Create brand
  const { data: brand, error: brandError } = await (supabase
    .from("brewery_brands")
    .insert({
      name,
      slug,
      description: description || null,
      website_url: website_url || null,
      logo_url: logo_url || null,
      owner_id: user.id,
    })
    .select()
    .single() as any);

  if (brandError) return apiServerError("brand create");

  // Create brand_account (owner)
  const { error: accountError } = await (supabase
    .from("brand_accounts")
    .insert({
      brand_id: brand.id,
      user_id: user.id,
      role: "owner",
    }) as any);

  if (accountError) return apiServerError("brand account create");

  // Set brand_id on first brewery
  const { error: breweryError } = await (supabase
    .from("breweries")
    .update({ brand_id: brand.id })
    .eq("id", first_brewery_id) as any);

  if (breweryError) return apiServerError("brewery brand_id update");

  // Propagate brand access to brewery_accounts
  await propagateBrandAccess(supabase as any, brand.id);

  return apiSuccess(brand, 201);
}
