/**
 * Shared API route helpers — Sprint 134 (The Tidy)
 *
 * Centralizes auth verification and tier checking that was duplicated
 * across 20+ brewery API routes.
 *
 * Usage:
 *   const user = await requireAuth(supabase);
 *   if (!user) return apiUnauthorized();
 *
 *   const account = await requireBreweryAdmin(supabase, user.id, breweryId);
 *   if (!account) return apiForbidden();
 *
 *   const hasTier = await requirePremiumTier(supabase, breweryId);
 *   if (!hasTier) return apiError("Feature requires Cask or Barrel tier", "TIER_REQUIRED", 403);
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// ─── Role & Tier Constants ──────────────────────────────────────────────────

export const ADMIN_ROLES = ["owner", "manager"] as const;
export const STAFF_ROLES = ["owner", "manager", "business", "marketing", "staff"] as const;
export const PREMIUM_TIERS = ["cask", "barrel"] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];
export type StaffRole = (typeof STAFF_ROLES)[number];
export type PremiumTier = (typeof PREMIUM_TIERS)[number];

// ─── Auth Helpers ───────────────────────────────────────────────────────────

/**
 * Get authenticated user or null. Replaces inline getUser() + null checks.
 */
export async function requireAuth(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Verify user is a brewery admin (owner or manager by default).
 * Returns the account row if authorized, null otherwise.
 */
export async function requireBreweryAdmin(
  supabase: SupabaseClient,
  userId: string,
  breweryId: string,
  roles: readonly string[] = ADMIN_ROLES
) {
  const { data: account } = await supabase
    .from("brewery_accounts")
    .select("role")
    .eq("user_id", userId)
    .eq("brewery_id", breweryId)
    .maybeSingle() as any;

  if (!account || !roles.includes(account.role)) return null;
  return account as { role: string };
}

/**
 * Check if brewery has a premium tier (Cask or Barrel).
 * Returns true if the brewery has a qualifying tier.
 */
export async function requirePremiumTier(
  supabase: SupabaseClient,
  breweryId: string,
  tiers: readonly string[] = PREMIUM_TIERS
): Promise<boolean> {
  const { data: brewery } = await supabase
    .from("breweries")
    .select("subscription_tier")
    .eq("id", breweryId)
    .single() as any;

  return !!brewery && tiers.includes(brewery.subscription_tier);
}

/**
 * Check if a brewery is covered by its brand's subscription.
 * Returns { covered: true, brandName } if the brewery belongs to a brand
 * with a non-free subscription_tier, otherwise { covered: false }.
 */
export async function checkBrandCovered(
  supabase: SupabaseClient,
  breweryId: string
): Promise<{ covered: boolean; brandName?: string }> {
  const { data: brewery } = await supabase
    .from("breweries")
    .select("brand_id")
    .eq("id", breweryId)
    .single() as any;

  if (!brewery?.brand_id) return { covered: false };

  const { data: brand } = await supabase
    .from("brewery_brands")
    .select("name, subscription_tier")
    .eq("id", brewery.brand_id)
    .single() as any;

  if (brand && brand.subscription_tier && brand.subscription_tier !== "free") {
    return { covered: true, brandName: brand.name };
  }

  return { covered: false };
}
