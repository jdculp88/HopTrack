import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";

// POST /api/challenges/join — join a challenge
export async function POST(request: NextRequest) {
  const rl = rateLimitResponse(request, "challenges-join", { limit: 10, windowMs: 60_000 });
  if (rl) return rl;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { challenge_id, source } = await request.json();
  if (!challenge_id) return NextResponse.json({ error: "challenge_id is required" }, { status: 400 });

  // Verify challenge exists, is active, and hasn't ended
  const { data: challenge } = await (supabase
    .from("challenges")
    .select("id, is_active, ends_at, max_participants, brewery_id, is_sponsored")
    .eq("id", challenge_id)
    .eq("is_active", true)
    .single() as any);

  if (!challenge) return NextResponse.json({ error: "Challenge not found or inactive" }, { status: 404 });

  if (challenge.ends_at && new Date(challenge.ends_at) < new Date()) {
    return NextResponse.json({ error: "Challenge has ended" }, { status: 400 });
  }

  // Check participant cap
  if (challenge.max_participants) {
    const { count } = await supabase
      .from("challenge_participants")
      .select("id", { count: "exact", head: true })
      .eq("challenge_id", challenge_id) as any;

    if ((count ?? 0) >= challenge.max_participants) {
      return NextResponse.json({ error: "Challenge is full" }, { status: 400 });
    }
  }

  // Check already joined
  const { data: existing } = await (supabase
    .from("challenge_participants")
    .select("id, completed_at")
    .eq("challenge_id", challenge_id)
    .eq("user_id", user.id)
    .single() as any);

  if (existing) {
    return NextResponse.json({ error: "Already joined this challenge", participant: existing }, { status: 409 });
  }

  const { data: participant, error } = await (supabase
    .from("challenge_participants")
    .insert({ challenge_id, user_id: user.id })
    .select()
    .single() as any);

  if (error) return NextResponse.json({ error: "Failed to join challenge" }, { status: 500 });

  // Track discovery join for sponsored challenges
  if (source === "discovery" && challenge.is_sponsored !== false) {
    await (supabase.rpc("increment_challenge_discovery_joins", {
      challenge_id,
    }) as any);
  }

  return NextResponse.json(participant, { status: 201 });
}
