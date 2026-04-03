import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/api-helpers";
import { apiSuccess, apiUnauthorized, apiError } from "@/lib/api-response";
import { rateLimitResponse } from "@/lib/rate-limit";
import { getAIRecommendations } from "@/lib/recommendations";

// GET /api/recommendations/ai — fetch cached or fresh AI recommendations
export async function GET(req: Request) {
  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  try {
    const recommendations = await getAIRecommendations(user.id);

    // Check if results came from cache
    const { data: cached } = await supabase
      .from("ai_recommendations")
      .select("generated_at, expires_at")
      .eq("user_id", user.id)
      .gt("expires_at", new Date().toISOString())
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle() as any;

    return apiSuccess({
      recommendations,
      generatedAt: cached?.generated_at ?? new Date().toISOString(),
      expiresAt: cached?.expires_at ?? null,
      fromCache: !!cached,
    });
  } catch (err: any) {
    console.error("[ai-recommendations] Failed:", err.message);
    return apiError("Failed to get recommendations", "GENERATION_FAILED", 500);
  }
}

// POST /api/recommendations/ai — force regenerate
export async function POST(req: Request) {
  // Rate limit: 3 per day per user
  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const limited = rateLimitResponse(req, `ai-reco-${user.id}`, {
    limit: 3,
    windowMs: 24 * 60 * 60 * 1000,
  });
  if (limited) return limited;

  try {
    // Delete expired/old cache to force regeneration
    await supabase
      .from("ai_recommendations")
      .delete()
      .eq("user_id", user.id) as any;

    const recommendations = await getAIRecommendations(user.id);

    return apiSuccess({
      recommendations,
      generatedAt: new Date().toISOString(),
      fromCache: false,
    }, 201);
  } catch (err: any) {
    console.error("[ai-recommendations] Regeneration failed:", err.message);
    return apiError("Failed to regenerate recommendations", "GENERATION_FAILED", 500);
  }
}
