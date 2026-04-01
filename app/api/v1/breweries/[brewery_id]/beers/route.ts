// GET /api/v1/breweries/:brewery_id/beers — On-tap beers with pour sizes
// Sprint 85 — The Pipeline (Avery)

import { createClient } from "@/lib/supabase/server";
import { apiResponse, apiError, apiOptions } from "@/lib/api-keys";
import { rateLimitResponse } from "@/lib/rate-limit";

export const OPTIONS = apiOptions;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const rl = rateLimitResponse(req, "v1:breweries:beers", { limit: 20, windowMs: 60_000 });
  if (rl) return rl;

  const { brewery_id } = await params;
  const url = new URL(req.url);
  const onTapOnly = url.searchParams.get("on_tap") !== "false"; // default: only on-tap
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
  const perPage = Math.min(100, Math.max(1, parseInt(url.searchParams.get("per_page") ?? "50")));
  const offset = (page - 1) * perPage;

  const supabase = await createClient();

  // Verify brewery exists
  const { data: brewery } = await (supabase as any)
    .from("breweries")
    .select("id")
    .eq("id", brewery_id)
    .maybeSingle();

  if (!brewery) return apiError("Brewery not found", 404, "not_found");

  let query = (supabase as any)
    .from("beers")
    .select("id, name, style, abv, ibu, description, is_featured, avg_rating, total_ratings, item_type, category, created_at", { count: "exact" })
    .eq("brewery_id", brewery_id)
    .eq("is_active", true);

  if (onTapOnly) {
    query = query.eq("is_on_tap", true);
  }

  const { data: beers, count, error } = await query
    .order("name")
    .range(offset, offset + perPage - 1);

  if (error) return apiError("Internal server error", 500, "db_error");

  // Fetch pour sizes for returned beers
  const beerIds = (beers ?? []).map((b: any) => b.id);
  const pourSizesMap: Record<string, any[]> = {};

  if (beerIds.length > 0) {
    const { data: pourSizes } = await (supabase as any)
      .from("beer_pour_sizes")
      .select("beer_id, label, oz, price, display_order")
      .in("beer_id", beerIds)
      .order("display_order", { ascending: true });

    if (pourSizes) {
      for (const ps of pourSizes) {
        if (!pourSizesMap[ps.beer_id]) pourSizesMap[ps.beer_id] = [];
        pourSizesMap[ps.beer_id].push({ label: ps.label, oz: ps.oz, price: ps.price });
      }
    }
  }

  const enriched = (beers ?? []).map((beer: any) => ({
    ...beer,
    pour_sizes: pourSizesMap[beer.id] ?? [],
  }));

  return apiResponse(enriched, {
    total: count ?? 0,
    page,
    per_page: perPage,
    on_tap_only: onTapOnly,
  });
}
