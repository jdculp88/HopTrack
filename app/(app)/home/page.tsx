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

  // Fetch sessions for feed
  const { data: sessions } = await (supabase as any)
    .from("sessions")
    .select(`
      *,
      profile:profiles!sessions_user_id_fkey(id, username, display_name, avatar_url),
      brewery:breweries(id, name, city, state),
      beer_logs(id, beer_id, rating, flavor_tags, serving_style, comment, photo_url, logged_at, quantity, beer:beers(id, name, style))
    `)
    .in("user_id", feedUserIds)
    .eq("share_to_feed", true)
    .eq("is_active", false)
    .order("started_at", { ascending: false })
    .limit(20);

  // Weekly stats from sessions + beer_logs
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: weekSessions } = await (supabase as any)
    .from("sessions")
    .select("id, brewery_id")
    .eq("user_id", user.id)
    .eq("is_active", false)
    .gte("started_at", weekAgo) as any;

  const { data: weekLogs } = await (supabase as any)
    .from("beer_logs")
    .select("id, quantity")
    .eq("user_id", user.id)
    .gte("logged_at", weekAgo) as any;

  const weekSessionList = (weekSessions as any[]) ?? [];
  const weekLogList = (weekLogs as any[]) ?? [];
  const weekBeerCount = weekLogList.reduce((sum: number, l: any) => sum + (l.quantity ?? 1), 0);

  return (
    <HomeFeed
      profile={profile}
      sessions={(sessions as Session[]) ?? []}
      weekStats={{
        sessions: weekSessionList.length,
        beers: weekBeerCount,
        uniqueBreweries: new Set(weekSessionList.map((s: any) => s.brewery_id).filter(Boolean)).size,
      }}
      currentUserId={user.id}
    />
  );
}
