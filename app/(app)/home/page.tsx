import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HomeFeed } from "./HomeFeed";
import type { FriendActiveRoute } from "@/components/social/HopRouteCTACard";
import {
  fetchFeedSessions,
  fetchActiveFriendSessions,
  fetchWeekStats,
  fetchCommunityContent,
  fetchSocialData,
  fetchReactionData,
  fetchFriendActivity,
  fetchFriendIds,
  fetchActivityHeatmap,
} from "@/lib/queries/feed";
import { getRecommendations } from "@/lib/recommendations";

export const metadata = { title: "Feed" };

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch profile + friend IDs (needed before parallel queries)
  const [{ data: profile }, friendIds] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    fetchFriendIds(supabase, user.id),
  ]);

  const feedUserIds = [user.id, ...friendIds];
  const today = new Date().toISOString().split("T")[0];

  // Parallel data fetch — all queries are fault-tolerant
  const [sessions, activeFriendSessions, weekStats, community, social, friendActivity] =
    await Promise.all([
      fetchFeedSessions(supabase, feedUserIds),
      fetchActiveFriendSessions(supabase, friendIds),
      fetchWeekStats(supabase, user.id),
      fetchCommunityContent(supabase, today, friendIds),
      fetchSocialData(supabase, user.id, friendIds),
      fetchFriendActivity(supabase, user.id, friendIds),
    ]);

  // Wishlist on-tap count — how many wishlisted beers are currently on tap anywhere
  const wishlistOnTapCount = await (async () => {
    try {
      const { data: wl } = await (supabase as any)
        .from("wishlist")
        .select("beer_id")
        .eq("user_id", user.id);
      if (!wl || wl.length === 0) return 0;
      const beerIds = wl.map((w: any) => w.beer_id);
      const { count } = await (supabase as any)
        .from("beers")
        .select("id", { count: "exact", head: true })
        .in("id", beerIds)
        .eq("is_on_tap", true)
        .or("is_86d.is.null,is_86d.eq.false");
      return count ?? 0;
    } catch {
      return 0;
    }
  })();

  // Friend brewery reviews (past 7 days)
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const friendBreweryReviews = await (async () => {
    if (friendIds.length === 0) return [];
    try {
      const { data: breweryReviewsData } = await (supabase as any)
        .from("brewery_reviews")
        .select(`
          id, rating, comment, created_at,
          profile:profiles!user_id(id, username, display_name, avatar_url),
          brewery:breweries!brewery_id(id, name, city, state)
        `)
        .in("user_id", friendIds.slice(0, 50))
        .gte("created_at", oneWeekAgo)
        .order("created_at", { ascending: false })
        .limit(15);
      return (breweryReviewsData ?? [])
        .filter((r: any) => r.profile && r.brewery)
        .map((r: any) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          created_at: r.created_at,
          profile: r.profile,
          brewery: r.brewery,
        }));
    } catch {
      return [];
    }
  })();

  // Friend active HopRoutes — "join them" cards
  const friendActiveRoutesData: FriendActiveRoute[] = [];
  if (friendIds.length > 0) {
    const { data: activeRoutes } = await (supabase as any)
      .from("hop_routes")
      .select(`
        id, title, status, stop_count, started_at,
        profile:profiles!user_id(id, username, display_name),
        hop_route_stops(id, stop_order, checked_in)
      `)
      .in("user_id", friendIds)
      .eq("status", "active")
      .order("started_at", { ascending: false })
      .limit(3);

    for (const r of (activeRoutes ?? [])) {
      if (!r.profile || !r.title) continue;
      const stops = r.hop_route_stops ?? [];
      const checkedIn = stops.filter((s: any) => s.checked_in).length;
      friendActiveRoutesData.push({
        routeId: r.id,
        friendName: r.profile.display_name || r.profile.username,
        friendUsername: r.profile.username,
        routeTitle: r.title,
        currentStop: checkedIn,
        totalStops: r.stop_count ?? stops.length,
      });
    }
  }

  // Beer recommendations + activity heatmap + past HopRoutes (fault-tolerant)
  const [recommendations, activityHeatmap, pastRoutesResult] = await Promise.all([
    getRecommendations(user.id).catch(() => []),
    fetchActivityHeatmap(supabase, user.id),
    (supabase as any)
      .from("hop_routes")
      .select("id, title, location_city, completed_at, hop_route_stops(brewery:breweries(name))")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(3)
      .then(({ data }: { data: unknown }) => data ?? [])
      .catch(() => []),
  ]);

  const pastRoutes = pastRoutesResult as Array<{
    id: string;
    title: string;
    location_city: string | null;
    completed_at: string | null;
    hop_route_stops: Array<{ brewery: { name: string } | null }>;
  }>;

  // Reaction + comment counts depend on session IDs from above
  const allSessionIds = [
    ...sessions.map((s) => s.id),
    ...activeFriendSessions.map((s) => s.id),
  ].filter(Boolean);

  const { reactionCounts, userReactions, commentCounts } =
    await fetchReactionData(supabase, user.id, allSessionIds);

  // Editorial content — Seasonal & Limited + Curated Collections (Jamie owns)
  const seasonalBeers = [
    { id: "s1", name: "Spring Saison", brewery: "River Bend Ales", style: "Saison", badge: "Seasonal" as const },
    { id: "s2", name: "Cherry Blossom Sour", brewery: "Mountain Ridge Brewing", style: "Sour", badge: "Limited" as const },
    { id: "s3", name: "Citrus Wheat", brewery: "Smoky Barrel Craft Co.", style: "Wheat", badge: "Seasonal" as const },
    { id: "s4", name: "Double Barrel Imp. Stout", brewery: "Smoky Barrel Craft Co.", style: "Stout", badge: "Limited" as const },
  ];

  const curatedCollections = [
    { id: "c1", title: "New England IPA Essentials", count: 12, emoji: "🍺", description: "Hazy, juicy, and endlessly crushable", tagColor: "gold" as const },
    { id: "c2", title: "The Dark Side", count: 18, emoji: "🌑", description: "Stouts, porters, and midnight sippers", tagColor: "dark" as const },
    { id: "c3", title: "Sour Power", count: 9, emoji: "🍋", description: "Tart, funky, and unapologetically weird", tagColor: "amber" as const },
    { id: "c4", title: "Session Crushers", count: 15, emoji: "🏃", description: "Under 5% ABV and dangerously drinkable", tagColor: "green" as const },
    { id: "c5", title: "Barrel-Aged Beasts", count: 7, emoji: "🛢️", description: "Big, boozy, and worth every calorie", tagColor: "gold" as const },
    { id: "c6", title: "Lager Renaissance", count: 11, emoji: "🌾", description: "Crispy, clean, and back in style", tagColor: "amber" as const },
  ];

  return (
    <HomeFeed
      profile={profile}
      sessions={sessions}
      activeFriendSessions={activeFriendSessions}
      weekStats={weekStats}
      currentUserId={user.id}
      communityContent={{
        featuredBeers: community.featuredBeers,
        topReviews: community.topReviews,
        breweryReviews: community.breweryReviews,
        upcomingEvents: community.upcomingEvents,
        newBreweries: community.newBreweries,
        seasonalBeers,
        curatedCollections,
      }}
      friendRatings={community.friendRatings}
      friendAchievements={social.friendAchievements}
      userAchievements={social.userAchievements}
      wishlist={social.wishlist}
      styleDNA={social.styleDNA}
      friendCount={friendIds.length}
      newFavorites={friendActivity.newFavorites}
      friendsJoined={friendActivity.friendsJoined}
      reactionCounts={reactionCounts}
      userReactions={userReactions}
      commentCounts={commentCounts}
      recommendations={recommendations}
      activityHeatmap={activityHeatmap}
      pastRoutes={pastRoutes}
      wishlistOnTapCount={wishlistOnTapCount}
      friendBreweryReviews={friendBreweryReviews}
      friendActiveRoutes={friendActiveRoutesData}
    />
  );
}
