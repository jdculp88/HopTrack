// Your Round — Sprint 162 (The Identity)
// Weekly Wrapped-of-the-Week. 7-day rolling window.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { YourRoundClient } from "./YourRoundClient";
import { fetchYourRoundStats } from "@/lib/your-round";

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

  const stats = await fetchYourRoundStats(supabase, user.id);

  return (
    <YourRoundClient
      userId={user.id}
      username={profile?.username ?? "beer-lover"}
      initialStats={stats}
    />
  );
}
