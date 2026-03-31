import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LeaderboardClient } from "./LeaderboardClient";

export const metadata = { title: "Leaderboard — HopTrack" };

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch all-time top 20
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, xp")
    .order("xp", { ascending: false })
    .limit(20);

  const allTime = (profiles ?? []).map((p: any, i: number) => ({
    user_id: p.id,
    xp_earned: p.xp ?? 0,
    profile: p,
    rank: i + 1,
  }));

  // Fetch monthly top 20 (XP from sessions this month)
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { data: monthSessions } = await supabase
    .from("sessions")
    .select("user_id, xp_earned, profile:profiles!sessions_user_id_fkey(id, username, display_name, avatar_url, xp)")
    .eq("is_active", false)
    .gte("ended_at", monthStart.toISOString())
    .not("xp_earned", "is", null);

  const xpMap = new Map<string, { xp: number; profile: any }>();
  for (const row of monthSessions ?? []) {
    const uid = row.user_id;
    const existing = xpMap.get(uid);
    if (existing) {
      existing.xp += row.xp_earned ?? 0;
    } else {
      xpMap.set(uid, { xp: row.xp_earned ?? 0, profile: row.profile });
    }
  }

  const monthly = Array.from(xpMap.entries())
    .map(([userId, { xp, profile }]) => ({ user_id: userId, xp_earned: xp, profile }))
    .sort((a, b) => b.xp_earned - a.xp_earned)
    .slice(0, 20)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));

  return <LeaderboardClient allTime={allTime} monthly={monthly} currentUserId={user.id} />;
}
