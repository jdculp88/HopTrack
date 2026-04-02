import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { apiSuccess, apiUnauthorized, apiForbidden, apiBadRequest, apiNotFound, apiServerError } from "@/lib/api-response";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ brewery_id: string; menu_id: string }> }
) {
  const rl = rateLimitResponse(request, "brewery-menus", { limit: 20, windowMs: 60_000 });
  if (rl) return rl;
  const { brewery_id, menu_id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  const { data: account } = await supabase
    .from("brewery_accounts")
    .select("role")
    .eq("user_id", user.id)
    .eq("brewery_id", brewery_id)
    .in("role", ["owner", "manager", "admin"])
    .single();
  if (!account) return apiForbidden();

  const body = await request.json();
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (body.title !== undefined) updates.title = body.title?.trim() || null;
  if (body.image_urls !== undefined) {
    if (!Array.isArray(body.image_urls) || body.image_urls.length > 3) {
      return apiBadRequest("Provide 0-3 image URLs");
    }
    updates.image_urls = body.image_urls;
  }
  if (body.is_active !== undefined) updates.is_active = Boolean(body.is_active);
  if (body.display_order !== undefined) updates.display_order = body.display_order;

  const { data: menu, error } = await (supabase
    .from("brewery_menus")
    .update(updates)
    .eq("id", menu_id)
    .eq("brewery_id", brewery_id)
    .select()
    .single() as any);

  if (error) return apiServerError(error.message);
  if (!menu) return apiNotFound("Menu");
  return apiSuccess(menu);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ brewery_id: string; menu_id: string }> }
) {
  const rl = rateLimitResponse(request, "brewery-menus-delete", { limit: 10, windowMs: 60_000 });
  if (rl) return rl;
  const { brewery_id, menu_id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  const { data: account } = await supabase
    .from("brewery_accounts")
    .select("role")
    .eq("user_id", user.id)
    .eq("brewery_id", brewery_id)
    .in("role", ["owner", "manager", "admin"])
    .single();
  if (!account) return apiForbidden();

  const { error } = await (supabase
    .from("brewery_menus")
    .delete()
    .eq("id", menu_id)
    .eq("brewery_id", brewery_id) as any);

  if (error) return apiServerError(error.message);
  return apiSuccess({ deleted: true });
}
