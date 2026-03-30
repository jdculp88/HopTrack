import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";

// GET /api/leaderboard?period=monthly|alltime
export async function GET(request: Request) {
  const limited = rateLimitResponse(request, "leaderboard", { limit: 30, windowMs: 60 * 1000 });
  if (limited) return limited;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "monthly";

  if (period === "monthly") {
    // Top 20 by XP earned in the current month (sessions started this month)
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { data: rows, error } = await (supabase as any)
      .from("sessions")
      .select("user_id, xp_earned, profile:profiles!sessions_user_id_fkey(id, username, display_name, avatar_url, xp)")
      .eq("is_active", false)
      .gte("ended_at", monthStart.toISOString())
      .not("xp_earned", "is", null);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Aggregate XP per user
    const xpMap = new Map<string, { xp: number; profile: any }>();
    for (const row of rows ?? []) {
      const uid = row.user_id;
      const existing = xpMap.get(uid);
      if (existing) {
        existing.xp += row.xp_earned ?? 0;
      } else {
        xpMap.set(uid, { xp: row.xp_earned ?? 0, profile: row.profile });
      }
    }

    const leaderboard = Array.from(xpMap.entries())
      .map(([userId, { xp, profile }]) => ({ user_id: userId, xp_earned: xp, profile }))
      .sort((a, b) => b.xp_earned - a.xp_earned)
      .slice(0, 20)
      .map((entry, i) => ({ ...entry, rank: i + 1 }));

    return NextResponse.json({ period: "monthly", leaderboard });
  }

  // All-time: top 20 by total XP on profiles table
  const { data: profiles, error } = await (supabase as any)
    .from("profiles")
    .select("id, username, display_name, avatar_url, xp")
    .order("xp", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const leaderboard = (profiles ?? []).map((p: any, i: number) => ({
    user_id: p.id,
    xp_earned: p.xp ?? 0,
    profile: p,
    rank: i + 1,
  }));

  return NextResponse.json({ period: "alltime", leaderboard });
}
