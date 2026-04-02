import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { apiSuccess, apiUnauthorized, apiForbidden, apiBadRequest, apiServerError } from "@/lib/api-response";

const VALID_CATEGORIES = [
  "food", "happy_hour", "wine", "cocktail",
  "non_alcoholic", "seasonal", "kids", "brunch",
] as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const { brewery_id } = await params;
  const supabase = await createClient();

  const { data: menus } = await (supabase
    .from("brewery_menus")
    .select("*")
    .eq("brewery_id", brewery_id)
    .order("display_order") as any);

  return apiSuccess(menus ?? []);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const rl = rateLimitResponse(request, "brewery-menus", { limit: 20, windowMs: 60_000 });
  if (rl) return rl;
  const { brewery_id } = await params;
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
  const { category, title, image_urls, is_active } = body;

  if (!category || !VALID_CATEGORIES.includes(category)) {
    return apiBadRequest("Invalid category");
  }

  if (!Array.isArray(image_urls) || image_urls.length === 0 || image_urls.length > 3) {
    return apiBadRequest("Provide 1-3 image URLs");
  }

  // Get next display order
  const { data: existing } = await (supabase
    .from("brewery_menus")
    .select("display_order")
    .eq("brewery_id", brewery_id)
    .order("display_order", { ascending: false })
    .limit(1) as any);
  const nextOrder = ((existing?.[0]?.display_order ?? -1) as number) + 1;

  // Upsert by brewery_id + category
  const { data: menu, error } = await (supabase
    .from("brewery_menus")
    .upsert(
      {
        brewery_id,
        category,
        title: title?.trim() || null,
        image_urls,
        display_order: nextOrder,
        is_active: is_active ?? true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "brewery_id,category" }
    )
    .select()
    .single() as any);

  if (error) return apiServerError(error.message);
  return apiSuccess(menu, 201);
}
