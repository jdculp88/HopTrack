// GET /api/v1/beers/search?q=...&style=...&brewery_id=... — Beer search
// Sprint 85 — The Pipeline (Avery)

import { createClient } from "@/lib/supabase/server";
import { apiResponse, apiError, apiOptions } from "@/lib/api-keys";
import { rateLimitResponse } from "@/lib/rate-limit";

export const OPTIONS = apiOptions;

export async function GET(req: Request) {
  const rl = rateLimitResponse(req, "v1:beers:search", { limit: 20, windowMs: 60_000 });
  if (rl) return rl;

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  const style = url.searchParams.get("style");
  const breweryId = url.searchParams.get("brewery_id");
  const itemType = url.searchParams.get("item_type");
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
  const perPage = Math.min(100, Math.max(1, parseInt(url.searchParams.get("per_page") ?? "20")));
  const offset = (page - 1) * perPage;

  if (!q && !style && !breweryId && !itemType) {
    return apiError("At least one search parameter required: q, style, brewery_id, or item_type", 400, "bad_request");
  }

  const supabase = await createClient();

  let query = (supabase as any)
    .from("beers")
    .select("id, name, style, abv, ibu, description, avg_rating, total_ratings, item_type, brewery_id, is_active, created_at", { count: "exact" })
    .eq("is_active", true);

  if (q) query = query.ilike("name", `%${q}%`);
  if (style) query = query.eq("style", style);
  if (breweryId) query = query.eq("brewery_id", breweryId);
  if (itemType) query = query.eq("item_type", itemType);

  const { data: beers, count, error } = await query
    .order("total_ratings", { ascending: false })
    .range(offset, offset + perPage - 1);

  if (error) return apiError("Internal server error", 500, "db_error");

  return apiResponse(beers ?? [], {
    total: count ?? 0,
    page,
    per_page: perPage,
    query: q ?? null,
    filters: { style: style ?? null, brewery_id: breweryId ?? null, item_type: itemType ?? null },
  });
}
