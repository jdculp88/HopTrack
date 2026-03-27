import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AchievementsClient } from "./AchievementsClient";
import { ACHIEVEMENTS } from "@/lib/achievements/definitions";

export const metadata = { title: "Achievements" };

export default async function AchievementsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // All achievement definitions from DB (seeded from our definitions)
  const { data: dbAchievements } = await supabase
    .from("achievements")
    .select("*");

  // User's earned achievements
  const { data: earned } = await supabase
    .from("user_achievements")
    .select("achievement_id, earned_at")
    .eq("user_id", user.id);

  const earnedMap = new Map(
    (earned ?? []).map((e: any) => [e.achievement_id, e])
  );

  // Merge definitions with earned status
  // Fall back to static definitions if DB not seeded yet
  const achievementDefs = dbAchievements && dbAchievements.length > 0
    ? dbAchievements
    : ACHIEVEMENTS.map((a, i) => ({ ...a, id: `static-${i}` }));

  const enriched = achievementDefs.map((a: any) => ({
    ...a,
    earned: earnedMap.has(a.id),
    earned_at: earnedMap.get(a.id)?.earned_at ?? null,
  }));

  const totalEarned = enriched.filter((a) => a.earned).length;

  return (
    <AchievementsClient
      achievements={enriched}
      totalEarned={totalEarned}
      total={enriched.length}
    />
  );
}
