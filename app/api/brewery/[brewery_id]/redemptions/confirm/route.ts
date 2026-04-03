import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { redeemBrandReward } from "@/lib/brand-loyalty";
import { requireAuth } from "@/lib/api-helpers";
import { apiUnauthorized, apiForbidden, apiBadRequest, apiNotFound, apiServerError, apiSuccess, apiError } from "@/lib/api-response";

// POST /api/brewery/[brewery_id]/redemptions/confirm — staff confirms a redemption code
export async function POST(
  req: Request,
  { params }: { params: Promise<{ brewery_id: string }> },
) {
  const limited = rateLimitResponse(req, "redemption-confirm", { limit: 10 });
  if (limited) return limited;

  const { brewery_id } = await params;
  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  // Verify brewery access (owner, manager, staff, or puncher)
  const { data: account } = await supabase
    .from("brewery_accounts")
    .select("role")
    .eq("brewery_id", brewery_id)
    .eq("user_id", user.id)
    .single();

  // Fallback: also check direct ownership for legacy support
  if (!account) {
    const { data: brewery } = await supabase
      .from("breweries")
      .select("id, owner_id")
      .eq("id", brewery_id)
      .single();

    if (!brewery || brewery.owner_id !== user.id) {
      return apiForbidden();
    }
  }

  const body = await req.json();
  const { code } = body;

  if (!code || typeof code !== "string" || (code.length !== 5 && code.length !== 6)) {
    return apiBadRequest("Invalid code format");
  }

  // Look up the code — first try brewery-scoped, then brand-scoped
  let redemption: any = null;
  const { data: breweryCode } = await supabase
    .from("redemption_codes")
    .select("*, profile:profiles!redemption_codes_user_id_fkey(display_name, username)")
    .eq("code", code.toUpperCase())
    .eq("brewery_id", brewery_id)
    .eq("status", "pending")
    .single();

  if (breweryCode) {
    redemption = breweryCode;
  } else {
    // Check if this is a brand loyalty code — look up by code + brand
    const { data: brewery } = await (supabase
      .from("breweries")
      .select("brand_id")
      .eq("id", brewery_id)
      .single() as any);

    if (brewery?.brand_id) {
      const { data: brandCode } = await (supabase
        .from("redemption_codes")
        .select("*, profile:profiles!redemption_codes_user_id_fkey(display_name, username)")
        .eq("code", code.toUpperCase())
        .eq("brand_id", brewery.brand_id)
        .eq("type", "brand_loyalty_reward")
        .eq("status", "pending")
        .single() as any);

      if (brandCode) redemption = brandCode;
    }
  }

  if (!redemption) {
    return apiNotFound("Invalid or expired code");
  }

  // Check expiry
  if (new Date(redemption.expires_at) < new Date()) {
    // Mark as expired
    await supabase
      .from("redemption_codes")
      .update({ status: "expired" } as any)
      .eq("id", redemption.id);
    return apiError("Code has expired", "EXPIRED", 422);
  }

  // Process based on type
  let redeemDescription = "";

  if (redemption.type === "loyalty_reward") {
    // Get the program details
    const { data: program } = await supabase
      .from("loyalty_programs")
      .select("stamps_required, reward_description")
      .eq("id", redemption.program_id)
      .single();

    if (!program) {
      return apiNotFound("Program");
    }

    // Decrement stamps on the user's loyalty card
    const { data: card } = await supabase
      .from("loyalty_cards")
      .select("id, stamps")
      .eq("user_id", redemption.user_id)
      .eq("brewery_id", brewery_id)
      .eq("program_id", redemption.program_id)
      .single();

    if (!card || (card.stamps ?? 0) < (program.stamps_required ?? 0)) {
      return apiBadRequest("User no longer has enough stamps");
    }

    // Decrement stamps
    await supabase
      .from("loyalty_cards")
      .update({ stamps: (card.stamps ?? 0) - (program.stamps_required ?? 0) } as any)
      .eq("id", card.id);

    // Record in loyalty_redemptions
    await supabase
      .from("loyalty_redemptions")
      .insert({
        card_id: card.id,
        user_id: redemption.user_id,
        brewery_id,
        program_id: redemption.program_id,
      } as any);

    redeemDescription = program.reward_description ?? "Loyalty reward";
  } else if (redemption.type === "mug_club_perk") {
    // Get the mug club details for perk name
    const { data: club } = await supabase
      .from("mug_clubs")
      .select("perks")
      .eq("id", redemption.mug_club_id)
      .single();

    const perks = (club?.perks ?? []) as string[];
    redeemDescription = perks[redemption.perk_index ?? 0] ?? "Mug club perk";
  } else if (redemption.type === "brand_loyalty_reward") {
    // Brand loyalty reward — find user's brand card and redeem
    const { data: brandCard } = await (supabase
      .from("brand_loyalty_cards")
      .select("id, stamps, program:brand_loyalty_programs(stamps_required, reward_description)")
      .eq("user_id", redemption.user_id)
      .eq("brand_id", redemption.brand_id)
      .single() as any);

    if (!brandCard) {
      return apiNotFound("Brand loyalty card");
    }

    const brandProgram = brandCard.program as any;
    if (!brandProgram || (brandCard.stamps ?? 0) < (brandProgram.stamps_required ?? 0)) {
      return apiBadRequest("User no longer has enough stamps");
    }

    const result = await redeemBrandReward(supabase, brandCard.id, brewery_id);
    if (!result) {
      return apiServerError("Failed to redeem brand reward");
    }

    redeemDescription = brandProgram.reward_description ?? "Brand loyalty reward";
  } else if (redemption.type === "promotion") {
    // Get promotion details
    const promoId = (redemption as any).promotion_id;
    if (promoId) {
      const { data: promo } = await supabase
        .from("promotions")
        .select("discount_type, discount_value, description")
        .eq("id", promoId)
        .single();

      if (promo) {
        const discount = promo.discount_type === "fixed"
          ? `$${promo.discount_value} off`
          : promo.discount_type === "percent"
          ? `${promo.discount_value}% off`
          : promo.discount_type === "bogo"
          ? "Buy one get one"
          : "Free item";
        redeemDescription = `${discount}${(promo as any).description ? ` — ${(promo as any).description}` : ""}`;
      }
    }
    // Fallback to promo_description stored on the code itself
    if (!redeemDescription) {
      redeemDescription = (redemption as any).promo_description ?? "Promotion redeemed";
    }

    // Increment promotion redemptions_count
    if (promoId) {
      try {
        await supabase.rpc("increment_field" as any, { row_id: promoId, table_name: "promotions", field_name: "redemptions_count" });
      } catch {
        // Fallback: direct update if RPC doesn't exist
        await supabase
          .from("promotions")
          .update({ redemptions_count: ((redemption as any).redemptions_count ?? 0) + 1 } as any)
          .eq("id", promoId);
      }
    }
  }

  // Mark the code as confirmed (trigger auto-generates pos_reference)
  const { data: confirmed } = await supabase
    .from("redemption_codes")
    .update({
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
      confirmed_by: user.id,
    } as any)
    .eq("id", redemption.id)
    .select("pos_reference")
    .single();

  // Build user display info
  const profile = redemption.profile as any;
  const displayName = profile?.display_name ?? profile?.username ?? "Customer";

  return apiSuccess({
    success: true,
    customer: displayName,
    type: redemption.type,
    description: redeemDescription || (redemption as any).promo_description || "Redemption confirmed",
    pos_reference: (confirmed as any)?.pos_reference ?? null,
  });
}
