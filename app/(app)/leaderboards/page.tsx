import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LeaderboardClient from "./LeaderboardClient";

export const metadata: Metadata = {
  title: "Leaderboards | HopTrack",
  description: "See who's leading the pack in craft beer exploration",
};

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("id, username, display_name, avatar_url, level, home_city")
    .eq("id", user.id)
    .single();

  return <LeaderboardClient currentUser={profile} />;
}
