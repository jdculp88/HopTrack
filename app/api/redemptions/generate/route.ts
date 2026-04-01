import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import crypto from "crypto";

// Characters excluding ambiguous ones (0/O, I/1, L)
const SAFE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateCode(): string {
  const bytes = crypto.randomBytes(6);
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += SAFE_CHARS[bytes[i] % SAFE_CHARS.length];
  }
  return code;
}

// POST /api/redemptions/generate — customer generates a redemption code
export async function POST(req: Request) {
  const limited = rateLimitResponse(req, "redemption-generate", { limit: 5 });
  if (limited) return limited;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { type, brewery_id, program_id, mug_club_id, perk_index } = body;

  if (!type || !brewery_id) {
    return NextResponse.json({ error: "Missing type or brewery_id" }, { status: 400 });
  }

  if (type !== "loyalty_reward" && type !== "mug_club_perk") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  // Validate eligibility based on type
  if (type === "loyalty_reward") {
    if (!program_id) {
      return NextResponse.json({ error: "Missing program_id" }, { status: 400 });
    }

    // Check user has enough stamps
    const { data: card } = await supabase
      .from("loyalty_cards")
      .select("stamps")
      .eq("user_id", user.id)
      .eq("brewery_id", brewery_id)
      .eq("program_id", program_id)
      .single();

    const { data: program } = await supabase
      .from("loyalty_programs")
      .select("stamps_required")
      .eq("id", program_id)
      .single();

    if (!card || !program || (card.stamps ?? 0) < (program.stamps_required ?? 0)) {
      return NextResponse.json({ error: "Not enough stamps to redeem" }, { status: 400 });
    }
  } else if (type === "mug_club_perk") {
    if (!mug_club_id || perk_index === undefined || perk_index === null) {
      return NextResponse.json({ error: "Missing mug_club_id or perk_index" }, { status: 400 });
    }

    // Check user is an active member
    const { data: membership } = await supabase
      .from("mug_club_members")
      .select("status")
      .eq("mug_club_id", mug_club_id)
      .eq("user_id", user.id)
      .single();

    if (!membership || membership.status !== "active") {
      return NextResponse.json({ error: "Not an active club member" }, { status: 400 });
    }
  }

  // Cancel any existing pending codes for this user + brewery (prevent accumulation)
  await supabase
    .from("redemption_codes")
    .update({ status: "cancelled" } as any)
    .eq("user_id", user.id)
    .eq("brewery_id", brewery_id)
    .eq("status", "pending");

  // Generate unique code (retry up to 3 times on collision)
  let code = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    code = generateCode();
    const { error: insertError } = await supabase
      .from("redemption_codes")
      .insert({
        code,
        type,
        user_id: user.id,
        brewery_id,
        program_id: program_id ?? null,
        mug_club_id: mug_club_id ?? null,
        perk_index: perk_index ?? null,
      } as any);

    if (!insertError) {
      // Fetch the created code to get expires_at
      const { data: created } = await supabase
        .from("redemption_codes")
        .select("code, expires_at")
        .eq("code", code)
        .single();

      return NextResponse.json({
        code: created?.code ?? code,
        expires_at: created?.expires_at ?? new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      });
    }

    // If unique constraint violation, retry with new code
    if (insertError.code !== "23505") {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Failed to generate unique code" }, { status: 500 });
}
