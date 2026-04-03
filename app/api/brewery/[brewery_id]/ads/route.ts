import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { requireAuth, requireBreweryAdmin, requirePremiumTier } from "@/lib/api-helpers";
import { apiUnauthorized, apiForbidden, apiSuccess, apiServerError, apiBadRequest, apiError } from "@/lib/api-response";

// GET /api/brewery/[brewery_id]/ads — list all ads for this brewery
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const { brewery_id } = await params;

  const account = await requireBreweryAdmin(supabase, user.id, brewery_id);
  if (!account) return apiForbidden();

  const { data: ads, error } = await supabase
    .from("brewery_ads")
    .select("*")
    .eq("brewery_id", brewery_id)
    .order("created_at", { ascending: false }) as any;

  if (error) return apiServerError(error.message);

  return apiSuccess({ ads: ads ?? [] });
}

// POST /api/brewery/[brewery_id]/ads — create a new ad
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const rl = rateLimitResponse(req, "brewery-ads-create", { limit: 10, windowMs: 60_000 });
  if (rl) return rl;

  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const { brewery_id } = await params;

  const account = await requireBreweryAdmin(supabase, user.id, brewery_id);
  if (!account) return apiForbidden();

  // Verify tier — Cask or Barrel required
  const hasTier = await requirePremiumTier(supabase, brewery_id);
  if (!hasTier) return apiError("Ad campaigns require Cask or Barrel tier", "TIER_REQUIRED", 403);

  const body = await req.json();
  const { title, body: adBody, image_url, cta_url, cta_label, radius_km, budget_cents, starts_at, ends_at } = body;

  if (!title) return apiBadRequest("Title is required");

  const { data: ad, error } = await supabase
    .from("brewery_ads")
    .insert({
      brewery_id,
      title,
      body: adBody || null,
      image_url: image_url || null,
      cta_url: cta_url || null,
      cta_label: cta_label || "Visit",
      radius_km: radius_km || 25,
      budget_cents: budget_cents || 0,
      starts_at: starts_at || new Date().toISOString(),
      ends_at: ends_at || null,
    })
    .select()
    .single() as any;

  if (error) return apiServerError(error.message);

  return apiSuccess({ ad }, 201);
}
