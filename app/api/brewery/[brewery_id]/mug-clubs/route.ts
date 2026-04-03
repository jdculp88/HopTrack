import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { requireAuth, requireBreweryAdmin, requirePremiumTier } from "@/lib/api-helpers";
import { apiUnauthorized, apiForbidden, apiSuccess, apiServerError, apiBadRequest, apiError } from "@/lib/api-response";

// GET /api/brewery/[brewery_id]/mug-clubs — list brewery's mug clubs (public read)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const { brewery_id } = await params;

  const { data: clubs, error } = await supabase
    .from("mug_clubs")
    .select("*, member_count:mug_club_members(count)")
    .eq("brewery_id", brewery_id)
    .order("created_at", { ascending: false }) as any;

  if (error) return apiServerError(error.message);

  // Flatten count from [{count: N}] to N
  const formatted = (clubs ?? []).map((c: any) => ({
    ...c,
    member_count: c.member_count?.[0]?.count ?? 0,
  }));

  return apiSuccess({ clubs: formatted });
}

// POST /api/brewery/[brewery_id]/mug-clubs — create a new mug club
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const rl = rateLimitResponse(req, "mug-clubs-create", { limit: 10, windowMs: 60_000 });
  if (rl) return rl;

  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const { brewery_id } = await params;

  const account = await requireBreweryAdmin(supabase, user.id, brewery_id);
  if (!account) return apiForbidden();

  // Verify tier — Cask or Barrel required
  const hasTier = await requirePremiumTier(supabase, brewery_id);
  if (!hasTier) return apiError("Mug clubs require Cask or Barrel tier", "TIER_REQUIRED", 403);

  const body = await req.json();
  const { name, description, annual_fee, max_members, perks } = body;

  if (!name) return apiBadRequest("Name is required");
  if (annual_fee == null || annual_fee < 0) {
    return apiBadRequest("Annual fee is required");
  }

  const { data: club, error } = await supabase
    .from("mug_clubs")
    .insert({
      brewery_id,
      name,
      description: description || null,
      annual_fee,
      max_members: max_members || null,
      perks: perks || [],
    })
    .select()
    .single() as any;

  if (error) return apiServerError(error.message);

  return apiSuccess({ club }, 201);
}
