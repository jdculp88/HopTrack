// GET /api/v1/beers/:beer_id — Individual beer detail
// Sprint 85 — The Pipeline (Avery)

import { createClient } from "@/lib/supabase/server";
import { apiResponse, apiError, apiOptions } from "@/lib/api-keys";
import { rateLimitResponse } from "@/lib/rate-limit";

export const OPTIONS = apiOptions;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ beer_id: string }> }
) {
  const rl = rateLimitResponse(req, "v1:beers:detail", { limit: 20, windowMs: 60_000 });
  if (rl) return rl;

  const { beer_id } = await params;
  const supabase = await createClient();

  const { data: beer, error } = await (supabase as any)
    .from("beers")
    .select(`
      id, name, style, abv, ibu, description, is_featured,
      avg_rating, total_ratings, item_type, category, seasonal,
      is_active, created_at,
      brewery:breweries!brewery_id(id, name, city, state)
    `)
    .eq("id", beer_id)
    .maybeSingle();

  if (error) return apiError("Internal server error", 500, "db_error");
  if (!beer) return apiError("Beer not found", 404, "not_found");

  // Fetch pour sizes
  const { data: pourSizes } = await (supabase as any)
    .from("beer_pour_sizes")
    .select("label, oz, price, display_order")
    .eq("beer_id", beer_id)
    .order("display_order", { ascending: true });

  return apiResponse({
    ...beer,
    pour_sizes: pourSizes ?? [],
  });
}
