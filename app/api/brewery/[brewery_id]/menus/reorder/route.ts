import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { requireAuth, requireBreweryAdmin } from "@/lib/api-helpers";
import { apiSuccess, apiUnauthorized, apiForbidden, apiBadRequest, apiServerError } from "@/lib/api-response";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const rl = rateLimitResponse(request, "brewery-menus-reorder", { limit: 10, windowMs: 60_000 });
  if (rl) return rl;
  const { brewery_id } = await params;
  const supabase = await createClient();

  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const account = await requireBreweryAdmin(supabase, user.id, brewery_id);
  if (!account) return apiForbidden();

  const body = await request.json();
  const { order } = body;

  if (!Array.isArray(order) || order.length === 0) {
    return apiBadRequest("Provide an array of { id, display_order }");
  }

  // Update each menu item's display_order
  for (const item of order) {
    if (!item.id || typeof item.display_order !== "number") continue;
    await (supabase
      .from("brewery_menus")
      .update({ display_order: item.display_order, updated_at: new Date().toISOString() })
      .eq("id", item.id)
      .eq("brewery_id", brewery_id) as any);
  }

  return apiSuccess({ reordered: true });
}
