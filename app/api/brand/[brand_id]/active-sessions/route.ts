import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { apiSuccess, apiUnauthorized, apiForbidden, apiNotFound } from "@/lib/api-response";

// ─── GET /api/brand/[brand_id]/active-sessions ──────────────────────────────
// Returns active session count across all brand locations.
// Requires brand_accounts membership.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brand_id: string }> }
) {
  const { brand_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  // Verify brand membership
  const { data: membership } = await (supabase
    .from("brand_accounts")
    .select("role")
    .eq("brand_id", brand_id)
    .eq("user_id", user.id)
    .in("role", ["owner", "regional_manager"])
    .maybeSingle() as any);

  if (!membership) return apiForbidden();

  // Get all location IDs for this brand
  const { data: locations } = await (supabase
    .from("breweries")
    .select("id")
    .eq("brand_id", brand_id) as any);

  const locationIds = (locations ?? []).map((l: any) => l.id);

  if (locationIds.length === 0) {
    return apiSuccess({ count: 0 });
  }

  const { count, error } = await supabase
    .from("sessions")
    .select("id", { count: "exact", head: true })
    .in("brewery_id", locationIds)
    .eq("is_active", true);

  if (error) return apiNotFound("sessions");

  return apiSuccess({ count: count ?? 0 });
}
