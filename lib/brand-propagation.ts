/**
 * Brand → Brewery role propagation — Sprint 115 (The Brand)
 * Updated Sprint 122 (The Crew): brand_manager role + location_scope support
 *
 * When a user has a brand_accounts role, they get auto-created brewery_accounts
 * for every location under that brand (or scoped locations if location_scope is set).
 * These rows are marked with `propagated_from_brand = true` so they can be cleanly
 * removed when a location leaves the brand or a member is removed from the brand.
 *
 * Role mapping:
 *   brand owner            → brewery owner
 *   brand brand_manager     → brewery business
 *   brand regional_manager  → brewery business
 */

import type { SupabaseClient } from "@supabase/supabase-js";

const BRAND_TO_BREWERY_ROLE: Record<string, string> = {
  owner: "owner",
  brand_manager: "business",
  regional_manager: "business",
};

/**
 * Propagate brand-level access to brewery_accounts for all (or one specific)
 * locations under a brand. Uses upsert to handle races gracefully.
 *
 * @param opts.breweryId  — propagate to a single location (e.g. when adding a new location)
 * @param opts.userId     — propagate for a single user (e.g. when adding a new brand member)
 */
export async function propagateBrandAccess(
  supabase: SupabaseClient,
  brandId: string,
  opts?: { breweryId?: string; userId?: string }
) {
  // 1. Get brand members (all or one specific user)
  // NOTE: Queries brand_accounts via caller's supabase client (RLS applies).
  // Depends on migration 081 SECURITY DEFINER fix for correct results.
  let membersQuery = supabase
    .from("brand_accounts")
    .select("user_id, role, location_scope")
    .eq("brand_id", brandId);

  if (opts?.userId) {
    membersQuery = membersQuery.eq("user_id", opts.userId);
  }

  const { data: members } = await (membersQuery as any);
  if (!members || members.length === 0) return;

  // 2. Get brand locations (all or one specific brewery)
  let locationsQuery = supabase
    .from("breweries")
    .select("id")
    .eq("brand_id", brandId);

  if (opts?.breweryId) {
    locationsQuery = locationsQuery.eq("id", opts.breweryId);
  }

  const { data: locations } = await (locationsQuery as any);
  if (!locations || locations.length === 0) return;

  // 3. Build upsert rows (respecting location_scope)
  const rows = [];
  for (const member of members) {
    const breweryRole = BRAND_TO_BREWERY_ROLE[member.role] ?? "staff";
    // If member has location_scope, only propagate to those locations
    const memberLocations = member.location_scope
      ? locations.filter((loc: any) => member.location_scope.includes(loc.id))
      : locations;
    for (const loc of memberLocations) {
      rows.push({
        user_id: member.user_id,
        brewery_id: loc.id,
        role: breweryRole,
        propagated_from_brand: true,
      });
    }
  }

  if (rows.length === 0) return;

  // 4. Upsert — never overwrite direct grants (propagated_from_brand = false)
  // We use onConflict on (user_id, brewery_id) but only update if the existing
  // row is also propagated. If there's a direct grant, DO NOTHING.
  for (const row of rows) {
    const { data: existing } = await (supabase
      .from("brewery_accounts")
      .select("id, propagated_from_brand")
      .eq("user_id", row.user_id)
      .eq("brewery_id", row.brewery_id)
      .maybeSingle() as any);

    if (existing && !existing.propagated_from_brand) {
      // Direct grant exists — don't overwrite
      continue;
    }

    if (existing) {
      // Update propagated row (role may have changed)
      await (supabase
        .from("brewery_accounts")
        .update({ role: row.role })
        .eq("id", existing.id) as any);
    } else {
      // Insert new propagated row
      await (supabase
        .from("brewery_accounts")
        .insert(row) as any);
    }
  }
}

/**
 * Remove propagated brewery_accounts when a location leaves a brand
 * or a member is removed from the brand.
 *
 * @param opts.breweryId — remove propagated access for a specific location
 * @param opts.userId    — remove propagated access for a specific user
 */
export async function removePropagatedAccess(
  supabase: SupabaseClient,
  brandId: string,
  opts: { breweryId?: string; userId?: string }
) {
  // Get all locations for this brand to scope the deletion
  const { data: locations } = await (supabase
    .from("breweries")
    .select("id")
    .eq("brand_id", brandId) as any);

  const breweryIds = opts.breweryId
    ? [opts.breweryId]
    : (locations ?? []).map((l: any) => l.id);

  if (breweryIds.length === 0) return;

  let query = supabase
    .from("brewery_accounts")
    .delete()
    .in("brewery_id", breweryIds)
    .eq("propagated_from_brand", true);

  if (opts.userId) {
    query = query.eq("user_id", opts.userId);
  }

  await (query as any);
}

/**
 * Recalculate propagated access when a member's location_scope changes.
 * Computes the diff and adds/removes only what changed.
 *
 * @param oldScope — previous location_scope (null = all locations)
 * @param newScope — new location_scope (null = all locations)
 */
export async function recalculateScopedAccess(
  supabase: SupabaseClient,
  brandId: string,
  userId: string,
  oldScope: string[] | null,
  newScope: string[] | null
) {
  // Get all brand locations
  const { data: allLocations } = await (supabase
    .from("breweries")
    .select("id")
    .eq("brand_id", brandId) as any);

  const allIds = (allLocations ?? []).map((l: any) => l.id);
  const oldIds = oldScope ?? allIds;
  const newIds = newScope ?? allIds;

  // Locations to remove access from (were in old scope, not in new)
  const toRemove = oldIds.filter((id: string) => !newIds.includes(id));
  // Locations to add access to (in new scope, not in old)
  const toAdd = newIds.filter((id: string) => !oldIds.includes(id));

  // Remove propagated access for dropped locations
  if (toRemove.length > 0) {
    await (supabase
      .from("brewery_accounts")
      .delete()
      .in("brewery_id", toRemove)
      .eq("user_id", userId)
      .eq("propagated_from_brand", true) as any);
  }

  // Add propagated access for new locations
  if (toAdd.length > 0) {
    // Get member's role to determine brewery-level role
    // NOTE: Depends on migration 081 SECURITY DEFINER fix for RLS
    const { data: member } = await (supabase
      .from("brand_accounts")
      .select("role")
      .eq("brand_id", brandId)
      .eq("user_id", userId)
      .single() as any);

    if (member) {
      const breweryRole = BRAND_TO_BREWERY_ROLE[member.role] ?? "staff";
      for (const breweryId of toAdd) {
        // Check for direct grant first
        const { data: existing } = await (supabase
          .from("brewery_accounts")
          .select("id, propagated_from_brand")
          .eq("user_id", userId)
          .eq("brewery_id", breweryId)
          .maybeSingle() as any);

        if (existing && !existing.propagated_from_brand) continue; // direct grant

        if (existing) {
          await (supabase
            .from("brewery_accounts")
            .update({ role: breweryRole })
            .eq("id", existing.id) as any);
        } else {
          await (supabase
            .from("brewery_accounts")
            .insert({
              user_id: userId,
              brewery_id: breweryId,
              role: breweryRole,
              propagated_from_brand: true,
            }) as any);
        }
      }
    }
  }
}
