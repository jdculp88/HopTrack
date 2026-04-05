// Your Round API — Sprint 162 (The Identity)
// Returns WrappedStats shape for the last 7 days (or custom range via ?days=N).

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { fetchYourRoundStats, computeYourRoundRange } from "@/lib/your-round";

export async function GET(request: NextRequest) {
  const limited = rateLimitResponse(request, "your-round", {
    limit: 20,
    windowMs: 60 * 1000,
  });
  if (limited) return limited;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const daysParam = request.nextUrl.searchParams.get("days");
  const days = daysParam ? Math.max(1, Math.min(90, parseInt(daysParam, 10))) : 7;

  try {
    const range = computeYourRoundRange(new Date(), days);
    const stats = await fetchYourRoundStats(supabase, user.id, range);
    return NextResponse.json(stats);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch Your Round stats";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
