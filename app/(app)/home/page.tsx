import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HomeFeed } from "./HomeFeed";
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

  // Beer recommendations + activity heatmap (fault-tolerant)
  const [recommendations, activityHeatmap] = await Promise.all([
    getRecommendations(user.id).catch(() => []),
    fetchActivityHeatmap(supabase, user.id),
  ]);

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
    { id: "c1", title: "5 Porters for Cold Nights", count: 5, emoji: "🌙" },
    { id: "c2", title: "Starter Pack: Belgian Styles", count: 8, emoji: "🇧🇪" },
    { id: "c3", title: "Best Patios in Asheville", count: 6, emoji: "☀️" },
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
    />
  );
}
