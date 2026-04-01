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
  fetchFriendChallengeCompletions,
  fetchFriendChallengeMilestones,
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
  const [sessions, activeFriendSessions, weekStats, community, social, friendActivity, friendChallengeCompletions, friendChallengeMilestones] =
    await Promise.all([
      fetchFeedSessions(supabase, feedUserIds),
      fetchActiveFriendSessions(supabase, friendIds),
      fetchWeekStats(supabase, user.id),
      fetchCommunityContent(supabase, today, friendIds),
      fetchSocialData(supabase, user.id, friendIds),
      fetchFriendActivity(supabase, user.id, friendIds),
      fetchFriendChallengeCompletions(supabase, friendIds),
      fetchFriendChallengeMilestones(supabase, friendIds),
    ]);

  // Wishlist on-tap count — how many wishlisted beers are currently on tap anywhere
  const wishlistOnTapCount = await (async () => {
    try {
      const { data: wl } = await supabase
        .from("wishlist")
        .select("beer_id")
        .eq("user_id", user.id);
      if (!wl || wl.length === 0) return 0;
      const beerIds = wl.map((w: any) => w.beer_id);
      const { count } = await supabase
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
      const { data: breweryReviewsData } = await supabase
        .from("brewery_reviews")
        .select(`
          id, rating, comment, created_at,
          profile:profiles(id, username, display_name, avatar_url),
          brewery:breweries(id, name, city, state)
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
    const { data: activeRoutes } = await supabase
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

    for (const r of (activeRoutes ?? []) as any[]) {
      if (!r.profile || !r.title) continue;
      const stops = r.hop_route_stops ?? [];
      const checkedIn = stops.filter((s: any) => s.checked_in).length;
      const profile = Array.isArray(r.profile) ? r.profile[0] : r.profile;
      friendActiveRoutesData.push({
        routeId: r.id,
        friendName: profile.display_name || profile.username,
        friendUsername: profile.username,
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
    supabase
      .from("hop_routes")
      .select("id, title, location_city, completed_at, hop_route_stops(brewery:breweries(name))")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(3)
      .then(({ data }: { data: unknown }) => data ?? []),
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

  // Recently added beers (real data, replaces hardcoded seasonal beers)
  const { data: recentBeers } = await supabase
    .from("beers")
    .select("id, name, style, brewery:breweries(name)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(4) as any;

  const seasonalBeers = (recentBeers ?? []).map((b: any) => ({
    id: b.id,
    name: b.name,
    brewery: b.brewery?.name ?? "Unknown Brewery",
    style: b.style ?? "Beer",
    badge: "New" as const,
  }));

  return (
    <HomeFeed
      profile={profile}
      sessions={sessions}
      activeFriendSessions={activeFriendSessions}
      weekStats={weekStats}
      currentUserId={user.id}
      communityContent={{
        featuredBeers: community.featuredBeers,
        topReviews: community.topReviews as any,
        breweryReviews: community.breweryReviews as any,
        upcomingEvents: community.upcomingEvents,
        newBreweries: community.newBreweries,
        seasonalBeers,
      }}
      friendRatings={community.friendRatings as any}
      friendAchievements={social.friendAchievements as any}
      userAchievements={social.userAchievements as any}
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
      friendChallengeCompletions={friendChallengeCompletions}
      friendChallengeMilestones={friendChallengeMilestones}
    />
  );
}
