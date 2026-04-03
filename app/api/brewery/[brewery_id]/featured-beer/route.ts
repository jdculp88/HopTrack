import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { requireAuth, requireBreweryAdmin } from "@/lib/api-helpers";
import { apiUnauthorized, apiForbidden, apiSuccess, apiServerError } from "@/lib/api-response";

// POST /api/brewery/[brewery_id]/featured-beer — set a beer as featured (or clear)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const rl = rateLimitResponse(request, "featured-beer", { limit: 10, windowMs: 60_000 });
  if (rl) return rl;
  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const { brewery_id } = await params;

  const account = await requireBreweryAdmin(supabase, user.id, brewery_id);
  if (!account) return apiForbidden();

  const { beer_id } = await request.json();

  // Clear all featured beers for this brewery first
  await supabase
    .from("beers")
    .update({ is_featured: false })
    .eq("brewery_id", brewery_id)
    .eq("is_featured", true);

  // If a beer_id was provided, set it as featured
  if (beer_id) {
    const { error } = await supabase
      .from("beers")
      .update({ is_featured: true })
      .eq("id", beer_id)
      .eq("brewery_id", brewery_id);

    if (error) {
      return apiServerError(error.message);
    }
  }

  return apiSuccess({ action: beer_id ? "featured" : "cleared" });
}
