import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";

// POST /api/brewery/[brewery_id]/redemptions/confirm — staff confirms a redemption code
export async function POST(
  req: Request,
  { params }: { params: Promise<{ brewery_id: string }> },
) {
  const limited = rateLimitResponse(req, "redemption-confirm", { limit: 10 });
  if (limited) return limited;

  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const body = await req.json();
  const { code } = body;

  if (!code || typeof code !== "string" || (code.length !== 5 && code.length !== 6)) {
    return NextResponse.json({ error: "Invalid code format" }, { status: 400 });
  }

  // Look up the code
  const { data: redemption, error: lookupError } = await supabase
    .from("redemption_codes")
    .select("*, profile:profiles!redemption_codes_user_id_fkey(display_name, username)")
    .eq("code", code.toUpperCase())
    .eq("brewery_id", brewery_id)
    .eq("status", "pending")
    .single();

  if (lookupError || !redemption) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 404 });
  }

  // Check expiry
  if (new Date(redemption.expires_at) < new Date()) {
    // Mark as expired
    await supabase
      .from("redemption_codes")
      .update({ status: "expired" } as any)
      .eq("id", redemption.id);
    return NextResponse.json({ error: "Code has expired" }, { status: 410 });
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
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
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
      return NextResponse.json({ error: "User no longer has enough stamps" }, { status: 400 });
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

  return NextResponse.json({
    success: true,
    customer: displayName,
    type: redemption.type,
    description: redeemDescription || (redemption as any).promo_description || "Redemption confirmed",
    pos_reference: (confirmed as any)?.pos_reference ?? null,
  });
}
