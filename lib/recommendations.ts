import { createClient } from "@/lib/supabase/server";

interface RecommendedBeer {
  id: string;
  name: string;
  style: string | null;
  abv: number | null;
  avg_rating: number | null;
  total_ratings: number;
  brewery: { id: string; name: string; city: string | null } | null;
  reason: string;
}

interface BeerLogStyleRow {
  beer: { style: string | null } | null;
}

interface BeerLogIdRow {
  beer_id: string | null;
}

interface BeerCandidateRow {
  id: string;
  name: string;
  style: string | null;
  abv: number | null;
  avg_rating: number | null;
  total_ratings: number;
  brewery: { id: string; name: string; city: string | null } | null;
}

/**
 * Get personalized beer recommendations for a user.
 * Algorithm:
 * 1. Find user's top 5 beer styles by frequency
 * 2. Find highest-rated beers in those styles that user hasn't tried
 * 3. Weight by friend ratings if available
 * Returns up to 10 recommendations.
 */
export async function getRecommendations(userId: string): Promise<RecommendedBeer[]> {
  const supabase = await createClient();

  // 1. Get user's style preferences from beer_logs
  const { data: userLogs } = await supabase // supabase join shape
    .from("beer_logs")
    .select("beer:beers(style)")
    .eq("user_id", userId);

  if (!userLogs || userLogs.length === 0) return [];

  const styleCounts: Record<string, number> = {};
  for (const log of (userLogs as unknown as BeerLogStyleRow[])) {
    const style = log.beer?.style;
    if (style) {
      styleCounts[style] = (styleCounts[style] || 0) + 1;
    }
  }

  const topStyles = Object.entries(styleCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([style]) => style);

  if (topStyles.length === 0) return [];

  // 2. Get beers user has already tried
  const { data: triedBeers } = await supabase // supabase join shape
    .from("beer_logs")
    .select("beer_id")
    .eq("user_id", userId);

  const triedIds = new Set(
    ((triedBeers ?? []) as BeerLogIdRow[]).map((b) => b.beer_id).filter(Boolean)
  );

  // 3. Find highly-rated beers in user's preferred styles
  const { data: candidates } = await supabase // supabase join shape
    .from("beers")
    .select("id, name, style, abv, avg_rating, total_ratings, brewery:breweries(id, name, city)")
    .in("style", topStyles)
    .eq("is_active", true)
    .gt("total_ratings", 0)
    .order("avg_rating", { ascending: false })
    .limit(50);

  if (!candidates) return [];

  // Filter out already tried beers, take top 10
  const recommendations: RecommendedBeer[] = [];
  for (const beer of (candidates as unknown as BeerCandidateRow[])) {
    if (triedIds.has(beer.id)) continue;
    if (recommendations.length >= 10) break;

    const styleRank = topStyles.indexOf(beer.style);
    const reason =
      styleRank === 0
        ? `Because you love ${beer.style}`
        : styleRank <= 2
        ? `Matches your taste for ${beer.style}`
        : `You might enjoy this ${beer.style}`;

    recommendations.push({
      id: beer.id,
      name: beer.name,
      style: beer.style,
      abv: beer.abv,
      avg_rating: beer.avg_rating,
      total_ratings: beer.total_ratings,
      brewery: beer.brewery,
      reason,
    });
  }

  return recommendations;
}

/**
 * Get similar beers for a beer detail page.
 * Same style, different brewery, sorted by rating.
 */
export async function getSimilarBeers(beerId: string, style: string | null, breweryId: string) {
  if (!style) return [];

  const supabase = await createClient();
  const { data } = await supabase // supabase join shape
    .from("beers")
    .select("id, name, style, abv, avg_rating, total_ratings, brewery:breweries(id, name, city)")
    .eq("style", style)
    .eq("is_active", true)
    .neq("id", beerId)
    .neq("brewery_id", breweryId)
    .order("avg_rating", { ascending: false, nullsFirst: false })
    .limit(4);

  return (data ?? []) as unknown as BeerCandidateRow[];
}
