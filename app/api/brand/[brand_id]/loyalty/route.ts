import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { verifyBrandAccess } from "@/lib/brand-auth";
import { getBrandLoyaltyProgram, migrateLoyaltyToBrand } from "@/lib/brand-loyalty";
import {
  apiSuccess,
  apiUnauthorized,
  apiForbidden,
  apiBadRequest,
  apiServerError,
} from "@/lib/api-response";

// ─── GET /api/brand/[brand_id]/loyalty ─────────────────────────────────────
// Brand admin: fetch program + cards + recent redemptions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brand_id: string }> }
) {
  const { brand_id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  const access = await verifyBrandAccess(supabase, brand_id, user.id);
  if (!access) return apiForbidden();

  // Fetch program
  const program = await getBrandLoyaltyProgram(supabase, brand_id);

  // Fetch all cards with profiles (sorted by stamps desc)
  const { data: cards } = await (supabase
    .from("brand_loyalty_cards")
    .select(
      "*, profile:profiles!brand_loyalty_cards_user_id_fkey(id, username, display_name, avatar_url), last_brewery:breweries!brand_loyalty_cards_last_stamp_brewery_id_fkey(id, name)"
    )
    .eq("brand_id", brand_id)
    .order("stamps", { ascending: false })
    .limit(50) as any);

  // Fetch recent redemptions
  const { data: redemptions } = await (supabase
    .from("brand_loyalty_redemptions")
    .select(
      "*, profile:profiles!brand_loyalty_redemptions_user_id_fkey(id, username, display_name, avatar_url), brewery:breweries!brand_loyalty_redemptions_brewery_id_fkey(id, name)"
    )
    .eq("brand_id", brand_id)
    .order("redeemed_at", { ascending: false })
    .limit(20) as any);

  // Stats
  const totalCards = cards?.length ?? 0;
  const totalStamps = (cards ?? []).reduce(
    (sum: number, c: any) => sum + (c.stamps || 0),
    0
  );
  const totalRedemptions = redemptions?.length ?? 0;

  return apiSuccess({
    program,
    cards: cards ?? [],
    redemptions: redemptions ?? [],
    stats: { totalCards, totalStamps, totalRedemptions },
  });
}

// ─── POST /api/brand/[brand_id]/loyalty ────────────────────────────────────
// Create or update a brand loyalty program
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ brand_id: string }> }
) {
  const rl = rateLimitResponse(request, "brand-loyalty-write", {
    limit: 10,
    windowMs: 60_000,
  });
  if (rl) return rl;

  const { brand_id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  const access = await verifyBrandAccess(supabase, brand_id, user.id);
  if (!access || access === "regional_manager")
    return apiForbidden();

  const body = await request.json();
  const {
    name,
    description,
    stamps_required,
    reward_description,
    earn_per_session,
  } = body;

  if (stamps_required && (stamps_required < 3 || stamps_required > 50)) {
    return apiBadRequest("Stamps required must be between 3 and 50");
  }

  // Check for existing active program
  const existing = await getBrandLoyaltyProgram(supabase, brand_id);

  if (existing) {
    // Update existing
    const { data: updated, error } = await (supabase
      .from("brand_loyalty_programs")
      .update({
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(stamps_required !== undefined && { stamps_required }),
        ...(reward_description !== undefined && { reward_description }),
        ...(earn_per_session !== undefined && { earn_per_session }),
      })
      .eq("id", existing.id)
      .select()
      .single() as any);

    if (error) return apiServerError(error.message);
    return apiSuccess(updated);
  }

  // Create new
  const { data: created, error } = await (supabase
    .from("brand_loyalty_programs")
    .insert({
      brand_id,
      name: name || "Brand Loyalty",
      description: description || null,
      stamps_required: stamps_required || 10,
      reward_description: reward_description || "Free pint at any location",
      earn_per_session: earn_per_session || 1,
    })
    .select()
    .single() as any);

  if (error) return apiServerError(error.message);
  return apiSuccess(created, 201);
}

// ─── PATCH /api/brand/[brand_id]/loyalty ───────────────────────────────────
// Toggle active, migrate stamps, or update settings
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ brand_id: string }> }
) {
  const rl = rateLimitResponse(request, "brand-loyalty-patch", {
    limit: 10,
    windowMs: 60_000,
  });
  if (rl) return rl;

  const { brand_id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  const access = await verifyBrandAccess(supabase, brand_id, user.id);
  if (!access || access === "regional_manager")
    return apiForbidden();

  const body = await request.json();

  // Handle migrate action
  if (body.action === "migrate") {
    const result = await migrateLoyaltyToBrand(supabase, brand_id);
    return apiSuccess(result);
  }

  // Handle toggle active
  if (body.is_active !== undefined) {
    const existing = await getBrandLoyaltyProgram(supabase, brand_id);
    if (!existing && body.is_active) {
      return apiBadRequest("No program exists to activate");
    }
    if (existing) {
      const { error } = await (supabase
        .from("brand_loyalty_programs")
        .update({ is_active: body.is_active })
        .eq("id", existing.id) as any);
      if (error) return apiServerError(error.message);
    }
  }

  return apiSuccess({ ok: true });
}
