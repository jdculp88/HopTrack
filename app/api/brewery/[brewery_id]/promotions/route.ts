import { createClient } from "@/lib/supabase/server";
import { requireAuth, requireBreweryAdmin } from "@/lib/api-helpers";
import { apiUnauthorized, apiForbidden, apiSuccess, apiServerError, apiBadRequest } from "@/lib/api-response";

// PATCH /api/brewery/[brewery_id]/promotions — update HopRoute eligibility and offer
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const account = await requireBreweryAdmin(supabase, user.id, brewery_id);
  if (!account) return apiForbidden();

  const { hop_route_eligible, hop_route_offer, vibe_tags } = await request.json();

  const updates: Record<string, unknown> = {};
  if (typeof hop_route_eligible === "boolean") updates.hop_route_eligible = hop_route_eligible;
  if (typeof hop_route_offer === "string") updates.hop_route_offer = hop_route_offer.trim() || null;
  if (Array.isArray(vibe_tags)) updates.vibe_tags = vibe_tags;

  if (Object.keys(updates).length === 0) {
    return apiBadRequest("No valid fields to update");
  }

  const { data, error } = await supabase
    .from("breweries")
    .update(updates)
    .eq("id", brewery_id)
    .select("hop_route_eligible, hop_route_offer, vibe_tags")
    .single();

  if (error) return apiServerError(error.message);
  return apiSuccess(data);
}
