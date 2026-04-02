/**
 * Brand team activity log — Sprint 122 (The Crew)
 *
 * Audit trail for team changes: member added/removed, role changed, scope changed.
 * Logged from API layer (not triggers) so actor context is available.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type TeamAction = "added" | "removed" | "role_changed" | "scope_changed";

export async function logTeamActivity(
  supabase: SupabaseClient,
  brandId: string,
  actorId: string,
  targetUserId: string,
  action: TeamAction,
  oldValue?: string | null,
  newValue?: string | null
) {
  // NOTE: brand_team_activity INSERT policy uses is_brand_manager_or_owner()
  // SECURITY DEFINER function (migration 081) to avoid RLS recursion.
  const { error } = await (supabase
    .from("brand_team_activity")
    .insert({
      brand_id: brandId,
      actor_id: actorId,
      target_user_id: targetUserId,
      action,
      old_value: oldValue ?? null,
      new_value: newValue ?? null,
    }) as any);

  if (error) {
    console.warn("[brand-team-activity] Failed to log activity:", error.message);
  }
}
