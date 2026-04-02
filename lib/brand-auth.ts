import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Verify that a user has access to a brand — either via brand_accounts
 * or by owning/managing a brewery that belongs to the brand.
 *
 * Returns the brand_accounts role if found, or "brewery_member" as fallback.
 * Returns null if the user has no access.
 */
export async function verifyBrandAccess(
  supabase: SupabaseClient,
  brandId: string,
  userId: string
): Promise<string | null> {
  // Primary: check brand_accounts
  const { data: membership } = await (supabase
    .from("brand_accounts")
    .select("role")
    .eq("brand_id", brandId)
    .eq("user_id", userId)
    .maybeSingle() as any);

  if (membership) return membership.role;

  // Fallback: check if user manages a brewery in this brand
  // Uses two-step query to avoid PostgREST join filter issues
  const { data: accounts } = await (supabase
    .from("brewery_accounts")
    .select("brewery_id")
    .eq("user_id", userId) as any);

  if (!accounts || accounts.length === 0) return null;

  const breweryIds = accounts.map((a: any) => a.brewery_id);
  const { data: brandBrewery } = await (supabase
    .from("breweries")
    .select("id")
    .in("id", breweryIds)
    .eq("brand_id", brandId)
    .limit(1) as any);

  return brandBrewery && brandBrewery.length > 0 ? "brewery_member" : null;
}

/**
 * Verify brand access AND return the user's location_scope.
 * Regional managers may have a location_scope array limiting which locations they can see.
 *
 * Returns { role, locationScope } or null if no access.
 * locationScope is null when user has access to ALL locations (owner, brand_manager, or brewery_member).
 */
export async function verifyBrandAccessWithScope(
  supabase: SupabaseClient,
  brandId: string,
  userId: string
): Promise<{ role: string; locationScope: string[] | null } | null> {
  // Primary: check brand_accounts (includes location_scope)
  const { data: membership } = await (supabase
    .from("brand_accounts")
    .select("role, location_scope")
    .eq("brand_id", brandId)
    .eq("user_id", userId)
    .maybeSingle() as any);

  if (membership) {
    return {
      role: membership.role,
      locationScope: membership.location_scope ?? null,
    };
  }

  // Fallback: check if user manages a brewery in this brand
  const { data: accounts } = await (supabase
    .from("brewery_accounts")
    .select("brewery_id")
    .eq("user_id", userId) as any);

  if (!accounts || accounts.length === 0) return null;

  const breweryIds = accounts.map((a: any) => a.brewery_id);
  const { data: brandBrewery } = await (supabase
    .from("breweries")
    .select("id")
    .in("id", breweryIds)
    .eq("brand_id", brandId)
    .limit(1) as any);

  return brandBrewery && brandBrewery.length > 0
    ? { role: "brewery_member", locationScope: null }
    : null;
}
