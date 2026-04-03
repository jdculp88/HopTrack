import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { requireAuth, requireBreweryAdmin } from "@/lib/api-helpers";
import { apiUnauthorized, apiForbidden, apiSuccess, apiServerError } from "@/lib/api-response";

type Params = { params: Promise<{ brewery_id: string; clubId: string }> };

// PATCH /api/brewery/[brewery_id]/mug-clubs/[clubId] — update a mug club
export async function PATCH(req: NextRequest, { params }: Params) {
  const rl = rateLimitResponse(req, "mug-clubs-update", { limit: 20, windowMs: 60_000 });
  if (rl) return rl;

  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const { brewery_id, clubId } = await params;

  const account = await requireBreweryAdmin(supabase, user.id, brewery_id);
  if (!account) return apiForbidden();

  const body = await req.json();
  const { name, description, annual_fee, max_members, perks, is_active } = body;

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (annual_fee !== undefined) updates.annual_fee = annual_fee;
  if (max_members !== undefined) updates.max_members = max_members;
  if (perks !== undefined) updates.perks = perks;
  if (is_active !== undefined) updates.is_active = is_active;

  const { data: club, error } = await supabase
    .from("mug_clubs")
    .update(updates)
    .eq("id", clubId)
    .eq("brewery_id", brewery_id)
    .select()
    .single() as any;

  if (error) return apiServerError(error.message);

  return apiSuccess({ club });
}

// DELETE /api/brewery/[brewery_id]/mug-clubs/[clubId] — delete a mug club
export async function DELETE(req: NextRequest, { params }: Params) {
  const rl = rateLimitResponse(req, "mug-clubs-delete", { limit: 10, windowMs: 60_000 });
  if (rl) return rl;

  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const { brewery_id, clubId } = await params;

  const account = await requireBreweryAdmin(supabase, user.id, brewery_id);
  if (!account) return apiForbidden();

  const { error } = await supabase
    .from("mug_clubs")
    .delete()
    .eq("id", clubId)
    .eq("brewery_id", brewery_id) as any;

  if (error) return apiServerError(error.message);

  return apiSuccess({ success: true });
}
