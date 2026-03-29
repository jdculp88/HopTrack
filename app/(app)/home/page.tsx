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

  const today = new Date().toISOString().split("T")[0];

  // Parallel queries — sessions, weekly stats, community content, achievements
  const [
    sessionsRes,
    activeFriendSessionsRes,
    weekSessionsRes,
    weekLogsRes,
    featuredBeersRes,
    topReviewsRes,
    breweryReviewsRes,
    friendRatingsRes,
    upcomingEventsRes,
    friendAchievementsRes,
    userAchievementsRes,
    wishlistRes,
    styleLogsRes,
    newBreweriesRes,
    newFavoritesRes,
    recentFriendshipsRes,
  ] = await Promise.all([
    // Feed sessions (completed)
    (supabase as any)
      .from("sessions")
      .select(`
        *,
        profile:profiles!sessions_user_id_fkey(id, username, display_name, avatar_url, current_streak),
        brewery:breweries!brewery_id(id, name, city, state),
        beer_logs(id, beer_id, rating, flavor_tags, serving_style, comment, photo_url, logged_at, quantity, beer:beers(id, name, style, glass_type))
      `)
      .in("user_id", feedUserIds)
      .eq("share_to_feed", true)
      .eq("is_active", false)
      .order("started_at", { ascending: false })
      .limit(20),

    // Active friend sessions (live — for amber glow treatment)
    friendIds.length > 0
      ? (supabase as any)
          .from("sessions")
          .select(`
            *,
            profile:profiles!sessions_user_id_fkey(id, username, display_name, avatar_url, current_streak),
            brewery:breweries!brewery_id(id, name, city, state),
            beer_logs(id, beer_id, rating, flavor_tags, serving_style, comment, photo_url, logged_at, quantity, beer:beers(id, name, style, glass_type))
          `)
          .in("user_id", friendIds)
          .eq("is_active", true)
          .eq("share_to_feed", true)
          .order("started_at", { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [] }),

    // Weekly stats — sessions
    (supabase as any)
      .from("sessions")
      .select("id, brewery_id")
      .eq("user_id", user.id)
      .eq("is_active", false)
      .gte("started_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),

    // Weekly stats — beer logs
    (supabase as any)
      .from("beer_logs")
      .select("id, quantity")
      .eq("user_id", user.id)
      .gte("logged_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),

    // Featured beers (Beer of the Week)
    (supabase as any)
      .from("beers")
      .select("id, name, style, abv, glass_type, description, brewery:breweries(id, name)")
      .eq("is_featured", true)
      .eq("is_active", true)
      .limit(3),

    // Top-rated recent beer reviews
    (supabase as any)
      .from("beer_reviews")
      .select("id, rating, comment, created_at, beer:beers(id, name, style, glass_type), profile:profiles(id, username, display_name, avatar_url)")
      .gte("rating", 4)
      .order("created_at", { ascending: false })
      .limit(10),

    // Recent brewery reviews
    (supabase as any)
      .from("brewery_reviews")
      .select("id, rating, comment, created_at, brewery:breweries(id, name, city, state), profile:profiles(id, username, display_name, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(8),

    // Friend beer reviews (rating stream)
    friendIds.length > 0
      ? (supabase as any)
          .from("beer_reviews")
          .select("id, rating, comment, created_at, beer:beers(id, name, style), profile:profiles(id, username, display_name, avatar_url)")
          .in("user_id", friendIds)
          .order("created_at", { ascending: false })
          .limit(15)
      : Promise.resolve({ data: [] }),

    // Upcoming events
    (supabase as any)
      .from("brewery_events")
      .select("id, title, description, event_date, start_time, brewery:breweries(id, name)")
      .gte("event_date", today)
      .eq("is_active", true)
      .order("event_date", { ascending: true })
      .limit(5),

    // Friend achievements (for feed cards)
    friendIds.length > 0
      ? (supabase as any)
          .from("user_achievements")
          .select("id, earned_at, achievement:achievements(id, name, icon, tier, category, xp_reward), profile:profiles(id, username, display_name, avatar_url)")
          .in("user_id", friendIds)
          .order("earned_at", { ascending: false })
          .limit(10)
      : Promise.resolve({ data: [] }),

    // User achievements (for You tab)
    (supabase as any)
      .from("user_achievements")
      .select("id, earned_at, achievement:achievements(id, name, icon, tier, category, xp_reward)")
      .eq("user_id", user.id)
      .order("earned_at", { ascending: false })
      .limit(5),

    // Wishlist (for You tab Want-to-Try)
    (supabase as any)
      .from("wishlist")
      .select("id, created_at, note, beer:beers(id, name, style, abv, brewery:breweries(id, name))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),

    // Style distribution from beer_logs (for Taste DNA)
    (supabase as any)
      .from("beer_logs")
      .select("rating, beer:beers(style)")
      .eq("user_id", user.id)
      .not("beer", "is", null),

    // New breweries (for Discover tab)
    (supabase as any)
      .from("breweries")
      .select("id, name, city, state, type, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(6),

    // New favorites — friend 5-star beer reviews (for "favorited" cards)
    friendIds.length > 0
      ? (supabase as any)
          .from("beer_reviews")
          .select("id, rating, created_at, beer:beers(id, name, style, brewery:breweries(id, name)), profile:profiles(id, username, display_name, avatar_url)")
          .in("user_id", friendIds)
          .eq("rating", 5)
          .order("created_at", { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [] }),

    // Recently accepted friendships (for "friend joined" cards)
    friendIds.length > 0
      ? (supabase as any)
          .from("friendships")
          .select("id, created_at, requester_id, addressee_id")
          .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
          .eq("status", "accepted")
          .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order("created_at", { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [] }),
  ]);

  const sessions = (sessionsRes.data as Session[]) ?? [];
  const activeFriendSessions = (activeFriendSessionsRes.data as Session[]) ?? [];
  const weekSessionList = (weekSessionsRes.data as any[]) ?? [];
  const weekLogList = (weekLogsRes.data as any[]) ?? [];

  // Batch-fetch reaction counts + user's own reactions for all feed sessions
  const allSessionIds = [
    ...sessions.map((s: any) => s.id),
    ...activeFriendSessions.map((s: any) => s.id),
  ].filter(Boolean);

  let reactionCounts: Record<string, Record<string, number>> = {};
  let userReactions: Record<string, string[]> = {};

  if (allSessionIds.length > 0) {
    const [countsRes, userReactionsRes] = await Promise.all([
      (supabase as any)
        .from("reactions")
        .select("session_id, type")
        .in("session_id", allSessionIds),
      (supabase as any)
        .from("reactions")
        .select("session_id, type")
        .eq("user_id", user.id)
        .in("session_id", allSessionIds),
    ]);

    // Aggregate counts: { sessionId: { beer: 7, flame: 2, ... } }
    for (const r of ((countsRes.data ?? []) as any[])) {
      if (!reactionCounts[r.session_id]) reactionCounts[r.session_id] = {};
      reactionCounts[r.session_id][r.type] = (reactionCounts[r.session_id][r.type] ?? 0) + 1;
    }

    // User's own reactions: { sessionId: ["beer", "flame"] }
    for (const r of ((userReactionsRes.data ?? []) as any[])) {
      if (!userReactions[r.session_id]) userReactions[r.session_id] = [];
      userReactions[r.session_id].push(r.type);
    }
  }
  const weekBeerCount = weekLogList.reduce((sum: number, l: any) => sum + (l.quantity ?? 1), 0);

  // Compute style distribution for Taste DNA
  const styleLogs = (styleLogsRes.data as any[]) ?? [];
  const styleMap: Record<string, { count: number; totalRating: number; ratedCount: number }> = {};
  for (const log of styleLogs) {
    const style = log.beer?.style;
    if (!style) continue;
    if (!styleMap[style]) styleMap[style] = { count: 0, totalRating: 0, ratedCount: 0 };
    styleMap[style].count++;
    if (log.rating != null) {
      styleMap[style].totalRating += log.rating;
      styleMap[style].ratedCount++;
    }
  }
  const styleDNA = Object.entries(styleMap)
    .map(([style, data]) => ({
      style,
      count: data.count,
      avgRating: data.ratedCount > 0 ? data.totalRating / data.ratedCount : null,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Transform 5-star reviews into "new favorite" feed items
  const newFavorites = ((newFavoritesRes.data ?? []) as any[])
    .filter((r: any) => r.profile && r.beer)
    .map((r: any) => ({
      id: r.id,
      userId: r.profile.id,
      username: r.profile.username,
      displayName: r.profile.display_name,
      avatarUrl: r.profile.avatar_url,
      beerName: r.beer.name,
      beerStyle: r.beer.style,
      breweryName: r.beer.brewery?.name ?? "",
      createdAt: r.created_at,
      likes: 0,
    }));

  // Transform recent friendships into "friend joined" feed items
  const recentFriendshipIds = ((recentFriendshipsRes.data ?? []) as any[]).map((f: any) =>
    f.requester_id === user.id ? f.addressee_id : f.requester_id
  );
  // Fetch profiles for joined friends (minimal query, only if we have IDs)
  let friendsJoined: any[] = [];
  if (recentFriendshipIds.length > 0) {
    const { data: joinedProfiles } = await (supabase as any)
      .from("profiles")
      .select("id, username, display_name, avatar_url, created_at")
      .in("id", recentFriendshipIds)
      .limit(5);
    const recentFships = (recentFriendshipsRes.data ?? []) as any[];
    friendsJoined = ((joinedProfiles ?? []) as any[]).map((p: any) => {
      const fship = recentFships.find(
        (f: any) => (f.requester_id === p.id || f.addressee_id === p.id)
      );
      return {
        id: p.id,
        userId: p.id,
        username: p.username,
        displayName: p.display_name ?? p.username,
        avatarUrl: p.avatar_url,
        mutualFriends: 0,
        joinedAt: fship?.created_at ?? p.created_at,
      };
    });
  }

  // Editorial content — Seasonal & Limited + Curated Collections (Jamie owns)
  const seasonalBeers = [
    { id: "s1", name: "Spring Saison", brewery: "River Bend Ales", style: "Saison", badge: "Seasonal" as const },
    { id: "s2", name: "Cherry Blossom Sour", brewery: "Mountain Ridge Brewing", style: "Sour", badge: "Limited" as const },
    { id: "s3", name: "Citrus Wheat", brewery: "Smoky Barrel Craft Co.", style: "Wheat", badge: "Seasonal" as const },
    { id: "s4", name: "Double Barrel Imp. Stout", brewery: "Smoky Barrel Craft Co.", style: "Stout", badge: "Limited" as const },
  ];

  const curatedCollections = [
    { id: "c1", title: "5 Porters for Cold Nights", count: 5, emoji: "🌙" },
    { id: "c2", title: "Starter Pack: Belgian Styles", count: 8, emoji: "🇧🇪" },
    { id: "c3", title: "Best Patios in Asheville", count: 6, emoji: "☀️" },
  ];

  return (
    <HomeFeed
      profile={profile}
      sessions={sessions}
      activeFriendSessions={activeFriendSessions}
      weekStats={{
        sessions: weekSessionList.length,
        beers: weekBeerCount,
        uniqueBreweries: new Set(weekSessionList.map((s: any) => s.brewery_id).filter(Boolean)).size,
      }}
      currentUserId={user.id}
      communityContent={{
        featuredBeers: featuredBeersRes.data ?? [],
        topReviews: topReviewsRes.data ?? [],
        breweryReviews: breweryReviewsRes.data ?? [],
        upcomingEvents: upcomingEventsRes.data ?? [],
        newBreweries: newBreweriesRes.data ?? [],
        seasonalBeers,
        curatedCollections,
      }}
      friendRatings={friendRatingsRes.data ?? []}
      friendAchievements={friendAchievementsRes.data ?? []}
      userAchievements={userAchievementsRes.data ?? []}
      wishlist={wishlistRes.data ?? []}
      styleDNA={styleDNA}
      friendCount={friendIds.length}
      newFavorites={newFavorites}
      friendsJoined={friendsJoined}
      reactionCounts={reactionCounts}
      userReactions={userReactions}
    />
  );
}
