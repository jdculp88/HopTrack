import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HomeFeed } from "./HomeFeed";
import type { Session } from "@/types/database";

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

  const feedUserIds = [user.id, ...friendIds];

  // Fetch legacy checkins (activity feed)
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

  // Fetch sessions for feed (new check-in system)
  const { data: sessions } = await (supabase as any)
    .from("sessions")
    .select(`
      *,
      profile:profiles!sessions_user_id_fkey(id, username, display_name, avatar_url),
      brewery:breweries(id, name, city, state),
      beer_logs(id, beer_id, rating, flavor_tags, serving_style, comment, photo_url, logged_at)
    `)
    .in("user_id", feedUserIds)
    .eq("share_to_feed", true)
    .eq("is_active", false)
    .order("started_at", { ascending: false })
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
      sessions={(sessions as Session[]) ?? []}
      weekStats={{
        checkins: weekCheckins?.length ?? 0,
        uniqueBreweries: new Set((weekCheckins as any[] ?? []).map((c: any) => c.brewery_id)).size,
      }}
      currentUserId={user.id}
    />
  );
}
