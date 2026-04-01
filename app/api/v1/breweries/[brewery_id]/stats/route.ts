// GET /api/v1/breweries/:brewery_id/stats — Brewery stats (API key required)
// Sprint 85 — The Pipeline (Avery)

import { createClient } from "@/lib/supabase/server";
import { validateApiKey, apiResponse, apiError, apiOptions } from "@/lib/api-keys";
import { rateLimitResponse, getClientIP } from "@/lib/rate-limit";
import { checkRateLimit } from "@/lib/rate-limit";

export const OPTIONS = apiOptions;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  // Authenticate with API key
  const apiKey = await validateApiKey(req);
  if (!apiKey) return apiError("Valid API key required. Pass as Bearer token in Authorization header.", 401, "unauthorized");

  const { brewery_id } = await params;

  // Verify the API key belongs to this brewery
  if (apiKey.brewery_id !== brewery_id) {
    return apiError("API key does not have access to this brewery", 403, "forbidden");
  }

  // Rate limit using the API key's configured limit
  const ip = getClientIP(req);
  const rl = checkRateLimit(`${ip}:v1:breweries:stats`, { limit: apiKey.rate_limit, windowMs: 60_000 });
  if (!rl.success) {
    return apiError("Rate limit exceeded", 429, "rate_limited");
  }

  const supabase = await createClient();
  const url = new URL(req.url);
  const period = url.searchParams.get("period") ?? "30d";

  // Calculate date range
  let daysBack = 30;
  if (period === "7d") daysBack = 7;
  else if (period === "90d") daysBack = 90;
  else if (period === "all") daysBack = 3650; // ~10 years
  const since = new Date(Date.now() - daysBack * 86400000).toISOString();

  // Parallel queries
  const [sessionsRes, beersRes, followsRes, reviewsRes] = await Promise.all([
    // Total sessions (visits) in period
    (supabase as any)
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("brewery_id", brewery_id)
      .gte("started_at", since),
    // Unique beers logged
    (supabase as any)
      .from("beer_logs")
      .select("beer_id")
      .eq("brewery_id", brewery_id)
      .gte("logged_at", since),
    // Follower count
    (supabase as any)
      .from("brewery_follows")
      .select("id", { count: "exact", head: true })
      .eq("brewery_id", brewery_id),
    // Average rating
    (supabase as any)
      .from("brewery_reviews")
      .select("rating")
      .eq("brewery_id", brewery_id),
  ]);

  const totalVisits = sessionsRes.count ?? 0;
  const beerLogs = beersRes.data ?? [];
  const uniqueBeersLogged = new Set(beerLogs.map((bl: any) => bl.beer_id)).size;
  const totalFollowers = followsRes.count ?? 0;
  const reviews = reviewsRes.data ?? [];
  const avgRating = reviews.length > 0
    ? Math.round((reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : null;

  // Top beers in period
  const beerCounts: Record<string, number> = {};
  for (const bl of beerLogs) {
    if (bl.beer_id) beerCounts[bl.beer_id] = (beerCounts[bl.beer_id] ?? 0) + 1;
  }
  const topBeerIds = Object.entries(beerCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id]) => id);

  let topBeers: any[] = [];
  if (topBeerIds.length > 0) {
    const { data } = await (supabase as any)
      .from("beers")
      .select("id, name, style, abv")
      .in("id", topBeerIds);
    if (data) {
      topBeers = topBeerIds.map(id => {
        const beer = data.find((b: any) => b.id === id);
        return beer ? { ...beer, log_count: beerCounts[id] } : null;
      }).filter(Boolean);
    }
  }

  return apiResponse({
    period,
    total_visits: totalVisits,
    unique_beers_logged: uniqueBeersLogged,
    total_followers: totalFollowers,
    avg_rating: avgRating,
    total_reviews: reviews.length,
    top_beers: topBeers,
  });
}
