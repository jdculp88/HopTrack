import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import type { ReferralCode } from "@/types/database";

interface ReferralUseWithProfile {
  referred_id: string;
  created_at: string;
  profile: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface ReferralCodeRow extends Pick<ReferralCode, "id" | "code" | "use_count" | "created_at"> {
  user_id: string;
}

// Generate a random 8-char alphanumeric code
function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusable chars (0/O, 1/I)
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// GET /api/referrals — get or create the current user's referral code + stats
export async function GET(_request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Try to fetch existing code
  let { data: codeRow } = await supabase
    .from("referral_codes" as any)
    .select("id, code, use_count, created_at")
    .eq("user_id", user.id)
    .single() as { data: ReferralCodeRow | null };

  // Create one if it doesn't exist
  if (!codeRow) {
    let code = generateCode();
    // Retry on collision (extremely rare)
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data: inserted, error } = await supabase
        .from("referral_codes" as any)
        .insert({ user_id: user.id, code })
        .select("id, code, use_count, created_at")
        .single() as { data: ReferralCodeRow | null; error: unknown };
      if (!error) {
        codeRow = inserted;
        break;
      }
      code = generateCode();
    }
    if (!codeRow) {
      return NextResponse.json({ error: "Failed to generate referral code" }, { status: 500 });
    }
  }

  // Fetch referred users count + list
  const { data: uses } = await supabase
    .from("referral_uses" as any)
    .select("referred_id, created_at, profile:profiles!referral_uses_referred_id_fkey(username, display_name, avatar_url)")
    .eq("referrer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10) as { data: ReferralUseWithProfile[] | null };

  return NextResponse.json({
    code: codeRow.code,
    use_count: codeRow.use_count,
    created_at: codeRow.created_at,
    recent_referrals: uses ?? [],
  });
}

// POST /api/referrals — redeem a referral code (called on signup or from settings)
export async function POST(request: Request) {
  const limited = rateLimitResponse(request, "referrals", { limit: 5, windowMs: 60 * 60 * 1000 });
  if (limited) return limited;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await request.json();
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Referral code is required" }, { status: 400 });
  }

  // Check if this user has already been referred
  const { data: existingUse } = await supabase
    .from("referral_uses" as any)
    .select("id")
    .eq("referred_id", user.id)
    .single() as { data: { id: string } | null };

  if (existingUse) {
    return NextResponse.json({ error: "You have already used a referral code" }, { status: 409 });
  }

  // Look up the code
  const { data: codeRow } = await supabase
    .from("referral_codes" as any)
    .select("id, user_id, use_count")
    .eq("code", code.toUpperCase().trim())
    .single() as { data: Pick<ReferralCodeRow, "id" | "user_id" | "use_count"> | null };

  if (!codeRow) {
    return NextResponse.json({ error: "Invalid referral code" }, { status: 404 });
  }

  if (codeRow.user_id === user.id) {
    return NextResponse.json({ error: "You cannot use your own referral code" }, { status: 400 });
  }

  // Record the referral use
  const { error: useError } = await supabase
    .from("referral_uses" as any)
    .insert({ referrer_id: codeRow.user_id, referred_id: user.id });

  if (useError) {
    return NextResponse.json({ error: "Failed to redeem code" }, { status: 500 });
  }

  // Increment use_count on the code
  await supabase
    .from("referral_codes" as any)
    .update({ use_count: codeRow.use_count + 1 })
    .eq("id", codeRow.id);

  // Mark referred_by on the new user's profile
  await supabase
    .from("profiles")
    .update({ referred_by: codeRow.user_id } as any)
    .eq("id", user.id);

  // Reward the referrer: +250 XP (atomic via RPC — no race condition)
  await supabase.rpc("increment_xp", { p_user_id: codeRow.user_id, p_xp_amount: 250 }); // supabase join shape

  // Notify the referrer
  const { data: newUserProfile } = await supabase
    .from("profiles")
    .select("display_name, username")
    .eq("id", user.id)
    .single() as { data: { display_name: string | null; username: string } | null };

  const newUserName = newUserProfile?.display_name || newUserProfile?.username || "Someone";

  await supabase
    .from("notifications")
    .insert({
      user_id: codeRow.user_id,
      type: "first_referral" as const,
      title: "Your invite worked! 🍺",
      body: `${newUserName} joined HopTrack with your invite code. You earned 250 XP!`,
      data: { referred_user_id: user.id },
    });

  return NextResponse.json({ success: true, referrer_id: codeRow.user_id });
}
