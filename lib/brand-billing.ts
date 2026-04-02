/**
 * Brand Billing — Sprint 121 (The Ledger)
 *
 * Tier propagation logic for brand-level subscriptions.
 * When a brand subscribes, all locations under that brand inherit the tier.
 * When a brand cancels, all locations revert to free (unless they have
 * their own direct Stripe subscription).
 *
 * Follows the same pattern as lib/brand-propagation.ts (role propagation).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Propagate brand subscription tier to all (or one) locations.
 * Called after successful brand checkout or subscription update.
 */
export async function propagateBrandTier(
  supabase: SupabaseClient,
  brandId: string,
  tier: "free" | "tap" | "cask" | "barrel",
  opts?: { breweryId?: string }
) {
  let query = supabase
    .from("breweries")
    .update({
      subscription_tier: tier,
      trial_ends_at: null, // Brand subscription overrides individual trials
    } as any)
    .eq("brand_id", brandId);

  if (opts?.breweryId) {
    query = query.eq("id", opts.breweryId);
  }

  await (query as any);
}

/**
 * Revert all brand locations to free tier.
 * Called when brand subscription is cancelled/deleted.
 */
export async function revertBrandTier(
  supabase: SupabaseClient,
  brandId: string
) {
  await (supabase
    .from("breweries")
    .update({ subscription_tier: "free" } as any)
    .eq("brand_id", brandId) as any);
}

/**
 * Get the number of locations under a brand.
 * Used for Stripe checkout quantity (add-ons = max(0, count - 1)).
 */
export async function getBrandLocationCount(
  supabase: SupabaseClient,
  brandId: string
): Promise<number> {
  const { count } = await (supabase
    .from("breweries")
    .select("id", { count: "exact", head: true })
    .eq("brand_id", brandId) as any);

  return count ?? 0;
}

/**
 * When a location joins a brand, inherit the brand's subscription tier
 * if the brand has an active (non-free) subscription.
 */
export async function syncLocationTierOnBrandJoin(
  supabase: SupabaseClient,
  brandId: string,
  breweryId: string
) {
  const { data: brand } = await (supabase
    .from("brewery_brands")
    .select("subscription_tier")
    .eq("id", brandId)
    .single() as any);

  if (!brand || brand.subscription_tier === "free") return;

  await propagateBrandTier(supabase, brandId, brand.subscription_tier, {
    breweryId,
  });
}

/**
 * When a location is removed from a brand, revert to free
 * UNLESS the brewery has its own direct Stripe subscription.
 */
export async function syncLocationTierOnBrandLeave(
  supabase: SupabaseClient,
  breweryId: string
) {
  const { data: brewery } = await (supabase
    .from("breweries")
    .select("stripe_customer_id")
    .eq("id", breweryId)
    .single() as any);

  // If brewery has its own Stripe customer, leave tier as-is
  if (brewery?.stripe_customer_id) return;

  await (supabase
    .from("breweries")
    .update({ subscription_tier: "free" } as any)
    .eq("id", breweryId) as any);
}
