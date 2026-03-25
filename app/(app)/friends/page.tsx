import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FriendsClient } from "./FriendsClient";

export const metadata = { title: "Friends & Leaderboards" };

export default async function FriendsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // All-time check-ins leaderboard
  const { data: checkinLeaders } = await supabase
    .from("profiles")
    .select("*")
    .eq("is_public", true)
    .order("total_checkins", { ascending: false })
    .limit(25);

  // Unique beers leaderboard
  const { data: beerLeaders } = await supabase
    .from("profiles")
    .select("*")
    .eq("is_public", true)
    .order("unique_beers", { ascending: false })
    .limit(25);

  // Unique breweries leaderboard
  const { data: breweryLeaders } = await supabase
    .from("profiles")
    .select("*")
    .eq("is_public", true)
    .order("unique_breweries", { ascending: false })
    .limit(25);

  // Pending friend requests
  const { data: pendingRequests } = await supabase
    .from("friendships")
    .select("*, requester:profiles!requester_id(*)")
    .eq("addressee_id", user.id)
    .eq("status", "pending");

  // Friends
  const { data: friendships } = await supabase
    .from("friendships")
    .select("requester_id, addressee_id, requester:profiles!requester_id(*), addressee:profiles!addressee_id(*)")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .eq("status", "accepted");

  return (
    <FriendsClient
      currentUserId={user.id}
      checkinLeaders={((checkinLeaders ?? []) as any[]).map((p, i) => ({ rank: i + 1, profile: p, value: p.total_checkins }))}
      beerLeaders={((beerLeaders ?? []) as any[]).map((p, i) => ({ rank: i + 1, profile: p, value: p.unique_beers }))}
      breweryLeaders={((breweryLeaders ?? []) as any[]).map((p, i) => ({ rank: i + 1, profile: p, value: p.unique_breweries }))}
      pendingRequests={(pendingRequests as any[]) ?? []}
      friendships={(friendships as any[]) ?? []}
    />
  );
}
