import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiSuccess, apiUnauthorized, apiForbidden, apiServerError } from "@/lib/api-response";

// ─── GET /api/brand/[brand_id]/team-activity ────────────────────────────────
// Returns recent team activity log entries. Brand owner or brand_manager only.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brand_id: string }> }
) {
  const { brand_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  // Verify caller is owner or brand_manager
  const { data: membership } = await (supabase
    .from("brand_accounts")
    .select("role")
    .eq("brand_id", brand_id)
    .eq("user_id", user.id)
    .maybeSingle() as any);

  if (!membership || !["owner", "brand_manager"].includes(membership.role)) {
    return apiForbidden();
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100);

  const { data: activity, error } = await (supabase
    .from("brand_team_activity")
    .select(`
      id,
      action,
      old_value,
      new_value,
      created_at,
      actor:profiles!brand_team_activity_actor_id_fkey(
        display_name,
        username
      ),
      target:profiles!brand_team_activity_target_user_id_fkey(
        display_name,
        username
      )
    `)
    .eq("brand_id", brand_id)
    .order("created_at", { ascending: false })
    .limit(limit) as any);

  if (error) return apiServerError("team activity GET");

  return apiSuccess(activity ?? []);
}
