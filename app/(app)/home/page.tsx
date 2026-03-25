import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HomeFeed } from "./HomeFeed";

export const metadata = { title: "Feed" };

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch current user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch friend IDs
  const { data: friendships } = await supabase
    .from("friendships")
    .select("requester_id, addressee_id")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .eq("status", "accepted");

  const friendIds = ((friendships ?? []) as any[]).map((f: any) =>
    f.requester_id === user.id ? f.addressee_id : f.requester_id
  );

  // Fetch activity feed (own + friends)
  const feedUserIds = [user.id, ...friendIds];
  const { data: checkins } = await supabase
    .from("checkins")
    .select(`
      *,
      profile:profiles(*),
      brewery:breweries(*),
      beer:beers(*)
    `)
    .in("user_id", feedUserIds)
    .eq("share_to_feed", true)
    .order("created_at", { ascending: false })
    .limit(20);

  // Fetch weekly stats for current user
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: weekCheckins } = await supabase
    .from("checkins")
    .select("id, created_at, brewery_id")
    .eq("user_id", user.id)
    .gte("created_at", weekAgo);

  return (
    <HomeFeed
      profile={profile}
      checkins={(checkins as any[]) ?? []}
      weekStats={{
        checkins: weekCheckins?.length ?? 0,
        uniqueBreweries: new Set((weekCheckins as any[] ?? []).map((c: any) => c.brewery_id)).size,
      }}
      currentUserId={user.id}
    />
  );
}
