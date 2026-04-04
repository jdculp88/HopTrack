import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/friends/active
// Returns accepted friends who have an active session and have share_live enabled.
// Used by the "Drinking Now" strip on the home feed and the brewery page.
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get accepted friend IDs
  const { data: friendships, error: friendsError } = await supabase
    .from("friendships")
    .select("requester_id, addressee_id")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .eq("status", "accepted");

  if (friendsError) return NextResponse.json({ error: friendsError.message }, { status: 500 });

  if (!friendships || friendships.length === 0) {
    return NextResponse.json({ activeFriends: [] });
  }

  const friendIds = friendships.map((f: any) =>
    f.requester_id === user.id ? f.addressee_id : f.requester_id,
  );

  // Fetch active sessions for those friends (share_to_feed = true means they're ok sharing)
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

  const { data: sessions } = await supabase
    .from("sessions")
    .select(`
      id,
      user_id,
      brewery_id,
      started_at,
      share_to_feed,
      context,
      profile:profiles!user_id(
        id, username, display_name, avatar_url,
        notification_preferences
      ),
      brewery:breweries!brewery_id(
        id, name, city, state
      ),
      beer_logs(id)
    `)
    .in("user_id", friendIds)
    .eq("is_active", true)
    .eq("share_to_feed", true)
    .gte("started_at", sixHoursAgo)
    .order("started_at", { ascending: false });

  if (!sessions) return NextResponse.json({ activeFriends: [] });

  // Auto-expire and filter: remove anyone whose share_live preference is false
  const activeFriends = sessions
    .filter((s: any) => {
      const prefs = s.profile?.notification_preferences ?? {};
      // share_live defaults to true — only hidden if explicitly false
      return prefs.share_live !== false;
    })
    .map((s: any) => ({
      sessionId: s.id,
      userId: s.user_id,
      username: s.profile?.username ?? null,
      displayName: s.profile?.display_name ?? s.profile?.username ?? "Someone",
      avatarUrl: s.profile?.avatar_url ?? null,
      brewery: s.brewery
        ? {
            id: s.brewery_id,
            name: s.brewery.name,
            city: s.brewery.city,
            state: s.brewery.state,
          }
        : null,
      isHome: s.context === "home",
      beerCount: Array.isArray(s.beer_logs) ? s.beer_logs.length : 0,
      startedAt: s.started_at,
    }));

  return NextResponse.json({ activeFriends }, {
    headers: { "Cache-Control": "private, max-age=15" },
  });
}
