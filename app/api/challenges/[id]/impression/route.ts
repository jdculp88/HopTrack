import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/challenges/[id]/impression — track that a sponsored challenge was shown in discovery
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Atomic increment via SQL function — no auth required, lightweight tracking
  const { error } = await (supabase.rpc("increment_challenge_impressions", {
    challenge_id: id,
  }) as any);

  if (error) {
    return NextResponse.json({ error: "Failed to track impression" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
