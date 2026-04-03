import { createClient } from "@/lib/supabase/server";
import { requireAuth, requireBreweryAdmin, requirePremiumTier } from "@/lib/api-helpers";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/api-response";
import { rateLimitResponse } from "@/lib/rate-limit";
import { generateAISuggestions } from "@/lib/ai-promotions";

// GET /api/brewery/[brewery_id]/ai-suggestions — fetch latest suggestions
export async function GET(req: Request, { params }: { params: Promise<{ brewery_id: string }> }) {
  const { brewery_id } = await params;
  const supabase = await createClient();

  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const account = await requireBreweryAdmin(supabase, user.id, brewery_id);
  if (!account) return apiForbidden();

  const hasTier = await requirePremiumTier(supabase, brewery_id);
  if (!hasTier) return apiError("AI Suggestions require Cask or Barrel tier", "TIER_REQUIRED", 403);

  const { data: latest } = await supabase
    .from("ai_suggestions")
    .select("*")
    .eq("brewery_id", brewery_id)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle() as any;

  return apiSuccess({
    suggestions: latest?.suggestions ?? [],
    generatedAt: latest?.generated_at ?? null,
    status: latest?.status ?? null,
    id: latest?.id ?? null,
  });
}

// POST /api/brewery/[brewery_id]/ai-suggestions — generate new suggestions
export async function POST(req: Request, { params }: { params: Promise<{ brewery_id: string }> }) {
  const { brewery_id } = await params;

  // Rate limit: 1 generation per day per brewery
  const limited = rateLimitResponse(req, `ai-suggestions-generate-${brewery_id}`, {
    limit: 1,
    windowMs: 24 * 60 * 60 * 1000,
  });
  if (limited) return limited;

  const supabase = await createClient();

  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const account = await requireBreweryAdmin(supabase, user.id, brewery_id);
  if (!account) return apiForbidden();

  const hasTier = await requirePremiumTier(supabase, brewery_id);
  if (!hasTier) return apiError("AI Suggestions require Cask or Barrel tier", "TIER_REQUIRED", 403);

  try {
    const result = await generateAISuggestions(brewery_id);
    return apiSuccess(result, 201);
  } catch (err: any) {
    console.error("[ai-suggestions] Generation failed:", err.message);
    return apiError("Failed to generate suggestions. Please try again.", "GENERATION_FAILED", 500);
  }
}

// PATCH /api/brewery/[brewery_id]/ai-suggestions — accept or dismiss
export async function PATCH(req: Request, { params }: { params: Promise<{ brewery_id: string }> }) {
  const { brewery_id } = await params;
  const supabase = await createClient();

  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const account = await requireBreweryAdmin(supabase, user.id, brewery_id);
  if (!account) return apiForbidden();

  const body = await req.json();
  const { suggestionId, action } = body;

  if (!suggestionId || !["accept", "dismiss"].includes(action)) {
    return apiError("suggestionId and action (accept/dismiss) required", "VALIDATION_ERROR", 400);
  }

  const updateData: any = {
    status: action === "accept" ? "accepted" : "dismissed",
    ...(action === "accept" ? { accepted_at: new Date().toISOString() } : { dismissed_at: new Date().toISOString() }),
  };

  const { error } = await supabase
    .from("ai_suggestions")
    .update(updateData)
    .eq("id", suggestionId)
    .eq("brewery_id", brewery_id) as any;

  if (error) {
    console.error("[ai-suggestions] Update failed:", error.message);
    return apiError("Failed to update suggestion", "UPDATE_FAILED", 500);
  }

  return apiSuccess({ updated: true });
}
