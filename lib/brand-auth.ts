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
