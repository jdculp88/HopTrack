import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { requireAuth, requireBreweryAdmin } from "@/lib/api-helpers";
import { apiUnauthorized, apiForbidden, apiSuccess, apiServerError } from "@/lib/api-response";

// PATCH /api/brewery/[brewery_id]/ads/[ad_id] — update an ad
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ brewery_id: string; ad_id: string }> }
) {
  const rl = rateLimitResponse(req, "brewery-ads-update", { limit: 10, windowMs: 60_000 });
  if (rl) return rl;

  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const { brewery_id, ad_id } = await params;

  const account = await requireBreweryAdmin(supabase, user.id, brewery_id);
  if (!account) return apiForbidden();

  const body = await req.json();
  const allowedFields = ["title", "body", "image_url", "cta_url", "cta_label", "radius_km", "budget_cents", "starts_at", "ends_at", "is_active"];
  const updates: Record<string, any> = {};
  for (const key of allowedFields) {
    if (key in body) updates[key] = body[key];
  }
  updates.updated_at = new Date().toISOString();

  const { data: ad, error } = await supabase
    .from("brewery_ads")
    .update(updates)
    .eq("id", ad_id)
    .eq("brewery_id", brewery_id)
    .select()
    .single() as any;

  if (error) return apiServerError(error.message);

  return apiSuccess({ ad });
}

// DELETE /api/brewery/[brewery_id]/ads/[ad_id] — delete an ad
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ brewery_id: string; ad_id: string }> }
) {
  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const { brewery_id, ad_id } = await params;

  const account = await requireBreweryAdmin(supabase, user.id, brewery_id);
  if (!account) return apiForbidden();

  const { error } = await supabase
    .from("brewery_ads")
    .delete()
    .eq("id", ad_id)
    .eq("brewery_id", brewery_id) as any;

  if (error) return apiServerError(error.message);

  return apiSuccess({ deleted: true });
}
