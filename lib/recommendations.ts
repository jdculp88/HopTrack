import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import Anthropic from "@anthropic-ai/sdk";

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

    const styleRank = topStyles.indexOf(beer.style!);
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

// ── AI-Powered Recommendations (Sprint 146) ────────────────────────────

export interface AIRecommendedBeer extends RecommendedBeer {
  aiReason: string;
}

/**
 * Get AI-enhanced beer recommendations for a user.
 * Checks DB cache first (24h TTL), generates fresh if expired.
 * Falls back to algorithmic recommendations on any failure.
 */
export async function getAIRecommendations(userId: string): Promise<AIRecommendedBeer[]> {
  const supabase = await createClient();

  // Check cache
  const { data: cached } = await supabase
    .from("ai_recommendations")
    .select("recommendations, expires_at")
    .eq("user_id", userId)
    .gt("expires_at", new Date().toISOString())
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle() as any;

  if (cached?.recommendations) {
    try {
      return cached.recommendations as AIRecommendedBeer[];
    } catch {
      // Invalid cache, regenerate
    }
  }

  // Generate fresh AI recommendations
  try {
    return await generateAIRecommendations(userId);
  } catch (err) {
    console.error("[ai-recommendations] Generation failed, falling back:", (err as Error).message);
    // Fallback: wrap algorithmic recommendations with basic reasons
    const basic = await getRecommendations(userId);
    return basic.slice(0, 3).map(b => ({
      ...b,
      aiReason: b.reason,
    }));
  }
}

async function generateAIRecommendations(userId: string): Promise<AIRecommendedBeer[]> {
  const supabase = await createClient();
  const service = createServiceClient();

  // Gather user data
  const [{ data: userLogs }, { data: followedBreweries }] = await Promise.all([
    supabase
      .from("beer_logs")
      .select("beer:beers(name, style, abv), rating, logged_at")
      .eq("user_id", userId)
      .order("logged_at", { ascending: false })
      .limit(20) as any,
    supabase
      .from("brewery_follows")
      .select("brewery:breweries(id, name)")
      .eq("user_id", userId)
      .limit(10) as any,
  ]);

  // Build style DNA
  const styleCounts: Record<string, { count: number; totalRating: number; rated: number }> = {};
  for (const log of (userLogs ?? []) as any[]) {
    const style = log.beer?.style;
    if (!style) continue;
    if (!styleCounts[style]) styleCounts[style] = { count: 0, totalRating: 0, rated: 0 };
    styleCounts[style].count++;
    if (log.rating) {
      styleCounts[style].totalRating += log.rating;
      styleCounts[style].rated++;
    }
  }

  const topStyles = Object.entries(styleCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([style, data]) => ({
      style,
      count: data.count,
      avgRating: data.rated > 0 ? Math.round((data.totalRating / data.rated) * 10) / 10 : null,
    }));

  // Get trending beers at followed breweries
  const followedIds = ((followedBreweries ?? []) as any[])
    .map((f: any) => f.brewery?.id)
    .filter(Boolean);

  let trendingBeers: any[] = [];
  if (followedIds.length > 0) {
    const { data: trending } = await supabase
      .from("beers")
      .select("id, name, style, abv, avg_rating, total_ratings, brewery:breweries(id, name, city)")
      .in("brewery_id", followedIds.slice(0, 5))
      .eq("is_on_tap", true)
      .gt("total_ratings", 0)
      .order("avg_rating", { ascending: false })
      .limit(10) as any;
    trendingBeers = (trending ?? []) as any[];
  }

  // Get beers user already tried
  const { data: triedBeers } = await supabase
    .from("beer_logs")
    .select("beer_id")
    .eq("user_id", userId) as any;
  const triedIds = new Set(((triedBeers ?? []) as any[]).map((b: any) => b.beer_id).filter(Boolean));

  // Filter out already tried
  const untried = trendingBeers.filter((b: any) => !triedIds.has(b.id));

  // Build prompt
  const systemPrompt = `You are a craft beer sommelier for HopTrack. Based on a user's taste profile and what's on tap at their favorite breweries, suggest exactly 3 beers they should try next. For each beer, write a short, engaging, personalized reason (1-2 sentences) that references their specific preferences.

Return a JSON array with 3 objects: { beerId: string, reason: string }
Return ONLY the JSON array, no markdown.`;

  const userPrompt = `User's top styles: ${JSON.stringify(topStyles)}
Recent beers: ${(userLogs ?? []).slice(0, 5).map((l: any) => `${l.beer?.name} (${l.beer?.style}, rated ${l.rating ?? "unrated"})`).join(", ")}
Available beers at followed breweries (not yet tried): ${untried.slice(0, 8).map((b: any) => `${b.id}: ${b.name} (${b.style}, ${b.avg_rating} stars, at ${b.brewery?.name})`).join("\n")}

Pick the 3 best matches and explain why.`;

  // Call Claude Haiku
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const tokensUsed = (response.usage?.input_tokens ?? 0) + (response.usage?.output_tokens ?? 0);

  // Parse AI response
  let aiPicks: { beerId: string; reason: string }[] = [];
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    aiPicks = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch {
    console.error("[ai-recommendations] Parse failed:", text.slice(0, 200));
  }

  // Build final recommendations
  const beerMap = new Map(untried.map((b: any) => [b.id, b]));
  const results: AIRecommendedBeer[] = [];

  for (const pick of aiPicks.slice(0, 3)) {
    const beer = beerMap.get(pick.beerId);
    if (!beer) continue;
    results.push({
      id: beer.id,
      name: beer.name,
      style: beer.style,
      abv: beer.abv,
      avg_rating: beer.avg_rating,
      total_ratings: beer.total_ratings,
      brewery: beer.brewery,
      reason: pick.reason,
      aiReason: pick.reason,
    });
  }

  // If AI didn't return enough, fill with algorithmic
  if (results.length < 3) {
    const basic = await getRecommendations(userId);
    for (const b of basic) {
      if (results.length >= 3) break;
      if (results.some(r => r.id === b.id)) continue;
      results.push({ ...b, aiReason: b.reason });
    }
  }

  // Cache results
  await service.from("ai_recommendations").insert({
    user_id: userId,
    recommendations: results as any,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    model_used: "claude-haiku-4-5-20251001",
    tokens_used: tokensUsed,
  } as any);

  return results;
}
