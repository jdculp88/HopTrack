// Your Round — Sprint 162 (The Identity)
// Weekly Wrapped-of-the-Week. 7-day rolling window.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { YourRoundClient } from "./YourRoundClient";
import { fetchYourRoundStats, computeYourRoundRange } from "@/lib/your-round";

export const metadata = {
  title: "Your Round | HopTrack",
  description: "Your last 7 days in beer — stats, favorites, and highlights.",
};

export default async function YourRoundPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single() as any;

  // Fetch current week + previous week in parallel (Sprint 169 — WoW comparison)
  const currentRange = computeYourRoundRange();
  const previousRange = computeYourRoundRange(currentRange.start); // ends where current starts

  const [stats, previousStats] = await Promise.all([
    fetchYourRoundStats(supabase, user.id, currentRange),
    fetchYourRoundStats(supabase, user.id, previousRange),
  ]);

  return (
    <YourRoundClient
      userId={user.id}
      username={profile?.username ?? "beer-lover"}
      initialStats={stats}
      previousStats={previousStats}
    />
  );
}
