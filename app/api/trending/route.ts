/**
 * Trending content API — Sprint 156 (The Triple Shot)
 *
 * Public endpoint returning trending beers and breweries.
 * Data is pre-computed by the trending-refresh cron job.
 *
 * Query params:
 *   city   — filter by city (optional)
 *   type   — "beer" | "brewery" (default: both)
 *   limit  — max items per type (default: 10, max: 20)
 */

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  const type = searchParams.get("type"); // "beer" | "brewery" | null (both)
  const limitParam = parseInt(searchParams.get("limit") ?? "10", 10);
  const limit = Math.min(Math.max(limitParam, 1), 20);

  try {
    const supabase = await createClient();

    const results: { beers: any[]; breweries: any[] } = { beers: [], breweries: [] };

    // Fetch trending beers
    if (!type || type === "beer") {
      let beerQuery = supabase
        .from("trending_scores")
        .select(
          `content_id, content_type, score, checkin_count_24h, rating_count_24h, unique_users_24h, city,
          beer:beers!content_id(id, name, style, brewery:breweries(name, city, state))`
        )
        .eq("content_type", "beer")
        .order("score", { ascending: false })
        .limit(limit);

      if (city) {
        beerQuery = beerQuery.ilike("city", city);
      }

      const { data: beerRows } = await (beerQuery as any);
      results.beers = ((beerRows ?? []) as any[]).map((row: any) => ({
        content_type: "beer" as const,
        content_id: row.content_id,
        name: row.beer?.name ?? "Unknown Beer",
        city: row.city ?? row.beer?.brewery?.city ?? "",
        score: row.score,
        checkin_count_24h: row.checkin_count_24h,
        rating_count_24h: row.rating_count_24h,
        unique_users_24h: row.unique_users_24h,
        style: row.beer?.style ?? null,
        brewery_name: row.beer?.brewery?.name ?? null,
        state: row.beer?.brewery?.state ?? null,
      }));
    }

    // Fetch trending breweries
    if (!type || type === "brewery") {
      let breweryQuery = supabase
        .from("trending_scores")
        .select(
          `content_id, content_type, score, checkin_count_24h, rating_count_24h, unique_users_24h, city,
          brewery:breweries!content_id(id, name, city, state)`
        )
        .eq("content_type", "brewery")
        .order("score", { ascending: false })
        .limit(limit);

      if (city) {
        breweryQuery = breweryQuery.ilike("city", city);
      }

      const { data: breweryRows } = await (breweryQuery as any);
      results.breweries = ((breweryRows ?? []) as any[]).map((row: any) => ({
        content_type: "brewery" as const,
        content_id: row.content_id,
        name: row.brewery?.name ?? "Unknown Brewery",
        city: row.city ?? row.brewery?.city ?? "",
        score: row.score,
        checkin_count_24h: row.checkin_count_24h,
        rating_count_24h: row.rating_count_24h,
        unique_users_24h: row.unique_users_24h,
        state: row.brewery?.state ?? null,
      }));
    }

    return apiSuccess(
      { trending: [...results.beers, ...results.breweries] },
      200,
      {},
      { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" }
    );
  } catch (err) {
    console.error("Trending API error:", err);
    return apiError("Failed to fetch trending data", "TRENDING_ERROR", 500);
  }
}
