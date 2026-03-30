/**
 * Feed data queries — extracted from home/page.tsx (S31-006)
 *
 * Each function accepts a Supabase client + params, handles its own errors
 * (returns empty/default data on failure). The Supabase client is untyped
 * (no codegen), so query results are typed via local interfaces.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Session, Achievement, Beer, Brewery, Profile } from "@/types/database";

// ── Return types ────────────────────────────────────────────────────────────

export interface WeekStats {
  sessions: number;
  beers: number;
  uniqueBreweries: number;
}

export interface FeaturedBeer {
  id: string;
  name: string;
  style: string | null;
  abv: number | null;
  glass_type: string | null;
  description: string | null;
  brewery: { id: string; name: string } | null;
}

export interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  beer?: { id: string; name: string; style: string | null; glass_type?: string | null };
  brewery?: { id: string; name: string; city: string | null; state: string | null };
  profile: { id: string; username: string; display_name: string | null; avatar_url: string | null } | null;
}

export interface EventItem {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  brewery: { id: string; name: string } | null;
}

export interface NewBreweryItem {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  type: string | null;
  created_at: string;
}

export interface CommunityContent {
  featuredBeers: FeaturedBeer[];
  topReviews: ReviewItem[];
  breweryReviews: ReviewItem[];
  upcomingEvents: EventItem[];
  newBreweries: NewBreweryItem[];
}

export interface FriendAchievementItem {
  id: string;
  earned_at: string;
  achievement: Pick<Achievement, "id" | "name" | "icon" | "tier" | "category" | "xp_reward"> | null;
  profile: { id: string; username: string; display_name: string | null; avatar_url: string | null } | null;
}

export interface UserAchievementItem {
  id: string;
  earned_at: string;
  achievement: Pick<Achievement, "id" | "name" | "icon" | "tier" | "category" | "xp_reward"> | null;
}

export interface WishlistFeedItem {
  id: string;
  created_at: string;
  note: string | null;
  beer: {
    id: string;
    name: string;
    style: string | null;
    abv: number | null;
    brewery: { id: string; name: string } | null;
  } | null;
}

export interface SocialData {
  friendAchievements: FriendAchievementItem[];
  userAchievements: UserAchievementItem[];
  wishlist: WishlistFeedItem[];
  styleDNA: { style: string; count: number; avgRating: number | null }[];
}

export interface ReactionData {
  reactionCounts: Record<string, Record<string, number>>;
  userReactions: Record<string, string[]>;
  commentCounts: Record<string, number>;
}

export interface NewFavoriteItem {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  beerName: string;
  beerStyle: string;
  breweryName: string;
  createdAt: string;
  likes: number;
}

export interface FriendJoinedItem {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  mutualFriends: number;
  joinedAt: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const SESSION_SELECT = `
  *,
  profile:profiles!sessions_user_id_fkey(id, username, display_name, avatar_url, current_streak),
  brewery:breweries!brewery_id(id, name, city, state),
  beer_logs(id, beer_id, rating, flavor_tags, serving_style, comment, photo_url, logged_at, quantity, beer:beers(id, name, style, glass_type)),
  session_photos(id, url, created_at)
`;

const ONE_WEEK_AGO = () =>
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

// ── Query functions ─────────────────────────────────────────────────────────

/**
 * Completed feed sessions for the user + friends (up to 20).
 */
export async function fetchFeedSessions(
  supabase: SupabaseClient,
  feedUserIds: string[]
): Promise<Session[]> {
  try {
    const { data } = await supabase
      .from("sessions")
      .select(SESSION_SELECT)
      .in("user_id", feedUserIds)
      .neq("share_to_feed", false)
      .eq("is_active", false)
      .order("started_at", { ascending: false })
      .limit(20);
    return (data as Session[]) ?? [];
  } catch {
    return [];
  }
}

/**
 * Active (live) friend sessions for the "Live Now" strip.
 */
export async function fetchActiveFriendSessions(
  supabase: SupabaseClient,
  friendIds: string[]
): Promise<Session[]> {
  if (friendIds.length === 0) return [];
  try {
    const { data } = await supabase
      .from("sessions")
      .select(SESSION_SELECT)
      .in("user_id", friendIds)
      .eq("is_active", true)
      .neq("share_to_feed", false)
      .order("started_at", { ascending: false })
      .limit(5);
    return (data as Session[]) ?? [];
  } catch {
    return [];
  }
}

/**
 * Weekly stats — session count, beer count, unique breweries.
 */
export async function fetchWeekStats(
  supabase: SupabaseClient,
  userId: string
): Promise<WeekStats> {
  try {
    const [sessionsRes, logsRes] = await Promise.all([
      supabase
        .from("sessions")
        .select("id, brewery_id")
        .eq("user_id", userId)
        .eq("is_active", false)
        .gte("started_at", ONE_WEEK_AGO()),
      supabase
        .from("beer_logs")
        .select("id, quantity")
        .eq("user_id", userId)
        .gte("logged_at", ONE_WEEK_AGO()),
    ]);

    const weekSessions: { id: string; brewery_id: string | null }[] = sessionsRes.data ?? [];
    const weekLogs: { id: string; quantity: number }[] = logsRes.data ?? [];
    const beers = weekLogs.reduce(
      (sum, l) => sum + (l.quantity ?? 1),
      0
    );

    return {
      sessions: weekSessions.length,
      beers,
      uniqueBreweries: new Set(
        weekSessions.map((s) => s.brewery_id).filter(Boolean)
      ).size,
    };
  } catch {
    return { sessions: 0, beers: 0, uniqueBreweries: 0 };
  }
}

/**
 * Community content for the Discover tab — featured beers, reviews, events, new breweries.
 */
export async function fetchCommunityContent(
  supabase: SupabaseClient,
  today: string,
  friendIds: string[]
): Promise<CommunityContent & { friendRatings: ReviewItem[] }> {
  const empty = {
    featuredBeers: [],
    topReviews: [],
    breweryReviews: [],
    upcomingEvents: [],
    newBreweries: [],
    friendRatings: [],
  };

  try {
    const [
      featuredBeersRes,
      topReviewsRes,
      breweryReviewsRes,
      friendRatingsRes,
      upcomingEventsRes,
      newBreweriesRes,
    ] = await Promise.all([
      supabase
        .from("beers")
        .select(
          "id, name, style, abv, glass_type, description, brewery:breweries(id, name)"
        )
        .eq("is_featured", true)
        .eq("is_active", true)
        .limit(3),

      supabase
        .from("beer_reviews")
        .select(
          "id, rating, comment, created_at, beer:beers(id, name, style, glass_type), profile:profiles(id, username, display_name, avatar_url)"
        )
        .gte("rating", 4)
        .order("created_at", { ascending: false })
        .limit(10),

      supabase
        .from("brewery_reviews")
        .select(
          "id, rating, comment, created_at, brewery:breweries(id, name, city, state), profile:profiles(id, username, display_name, avatar_url)"
        )
        .order("created_at", { ascending: false })
        .limit(8),

      friendIds.length > 0
        ? supabase
            .from("beer_reviews")
            .select(
              "id, rating, comment, created_at, beer:beers(id, name, style), profile:profiles(id, username, display_name, avatar_url)"
            )
            .in("user_id", friendIds)
            .order("created_at", { ascending: false })
            .limit(15)
        : Promise.resolve({ data: [] }),

      supabase
        .from("brewery_events")
        .select(
          "id, title, description, event_date, start_time, brewery:breweries(id, name)"
        )
        .gte("event_date", today)
        .eq("is_active", true)
        .order("event_date", { ascending: true })
        .limit(5),

      supabase
        .from("breweries")
        .select("id, name, city, state, type, created_at")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

    return {
      featuredBeers: featuredBeersRes.data ?? [],
      topReviews: topReviewsRes.data ?? [],
      breweryReviews: breweryReviewsRes.data ?? [],
      friendRatings: friendRatingsRes.data ?? [],
      upcomingEvents: upcomingEventsRes.data ?? [],
      newBreweries: newBreweriesRes.data ?? [],
    };
  } catch {
    return empty;
  }
}

/**
 * Social data — achievements, wishlist, and style logs for Taste DNA.
 */
export async function fetchSocialData(
  supabase: SupabaseClient,
  userId: string,
  friendIds: string[]
): Promise<SocialData> {
  try {
    const [
      friendAchievementsRes,
      userAchievementsRes,
      wishlistRes,
      styleLogsRes,
    ] = await Promise.all([
      friendIds.length > 0
        ? supabase
            .from("user_achievements")
            .select(
              "id, earned_at, achievement:achievements(id, name, icon, tier, category, xp_reward), profile:profiles(id, username, display_name, avatar_url)"
            )
            .in("user_id", friendIds)
            .order("earned_at", { ascending: false })
            .limit(10)
        : Promise.resolve({ data: [] }),

      supabase
        .from("user_achievements")
        .select(
          "id, earned_at, achievement:achievements(id, name, icon, tier, category, xp_reward)"
        )
        .eq("user_id", userId)
        .order("earned_at", { ascending: false })
        .limit(5),

      supabase
        .from("wishlist")
        .select(
          "id, created_at, note, beer:beers(id, name, style, abv, brewery:breweries(id, name))"
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10),

      supabase
        .from("beer_logs")
        .select("rating, beer:beers(style)")
        .eq("user_id", userId)
        .not("beer", "is", null),
    ]);

    // Compute style distribution for Taste DNA
    type StyleLogRow = { rating: number | null; beer: { style: string | null } | null };
    const styleLogs = (styleLogsRes.data ?? []) as StyleLogRow[];
    const styleMap: Record<
      string,
      { count: number; totalRating: number; ratedCount: number }
    > = {};
    for (const log of styleLogs) {
      const style = log.beer?.style;
      if (!style) continue;
      if (!styleMap[style])
        styleMap[style] = { count: 0, totalRating: 0, ratedCount: 0 };
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
        avgRating:
          data.ratedCount > 0 ? data.totalRating / data.ratedCount : null,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      friendAchievements: friendAchievementsRes.data ?? [],
      userAchievements: userAchievementsRes.data ?? [],
      wishlist: wishlistRes.data ?? [],
      styleDNA,
    };
  } catch {
    return {
      friendAchievements: [],
      userAchievements: [],
      wishlist: [],
      styleDNA: [],
    };
  }
}

/**
 * Reaction counts, user reactions, and comment counts for a set of session IDs.
 */
export async function fetchReactionData(
  supabase: SupabaseClient,
  userId: string,
  sessionIds: string[]
): Promise<ReactionData> {
  const empty: ReactionData = {
    reactionCounts: {},
    userReactions: {},
    commentCounts: {},
  };

  if (sessionIds.length === 0) return empty;

  try {
    const [countsRes, userReactionsRes, commentsRes] = await Promise.all([
      supabase
        .from("reactions")
        .select("session_id, type")
        .in("session_id", sessionIds),
      supabase
        .from("reactions")
        .select("session_id, type")
        .eq("user_id", userId)
        .in("session_id", sessionIds),
      supabase
        .from("session_comments")
        .select("session_id")
        .in("session_id", sessionIds),
    ]);

    type ReactionRow = { session_id: string; type: string };
    type CommentRow = { session_id: string };

    const reactionCounts: Record<string, Record<string, number>> = {};
    for (const r of (countsRes.data ?? []) as ReactionRow[]) {
      if (!reactionCounts[r.session_id]) reactionCounts[r.session_id] = {};
      reactionCounts[r.session_id][r.type] =
        (reactionCounts[r.session_id][r.type] ?? 0) + 1;
    }

    const userReactions: Record<string, string[]> = {};
    for (const r of (userReactionsRes.data ?? []) as ReactionRow[]) {
      if (!userReactions[r.session_id]) userReactions[r.session_id] = [];
      userReactions[r.session_id].push(r.type);
    }

    const commentCounts: Record<string, number> = {};
    for (const c of (commentsRes.data ?? []) as CommentRow[]) {
      commentCounts[c.session_id] = (commentCounts[c.session_id] ?? 0) + 1;
    }

    return { reactionCounts, userReactions, commentCounts };
  } catch {
    return empty;
  }
}

/**
 * New favorites (friend 5-star reviews) and friends-joined feed items.
 */
export async function fetchFriendActivity(
  supabase: SupabaseClient,
  userId: string,
  friendIds: string[]
): Promise<{ newFavorites: NewFavoriteItem[]; friendsJoined: FriendJoinedItem[] }> {
  const empty = { newFavorites: [], friendsJoined: [] };
  if (friendIds.length === 0) return empty;

  try {
    const [newFavoritesRes, recentFriendshipsRes] = await Promise.all([
      supabase
        .from("beer_reviews")
        .select(
          "id, rating, created_at, beer:beers(id, name, style, brewery:breweries(id, name)), profile:profiles(id, username, display_name, avatar_url)"
        )
        .in("user_id", friendIds)
        .eq("rating", 5)
        .order("created_at", { ascending: false })
        .limit(5),

      supabase
        .from("friendships")
        .select("id, created_at, requester_id, addressee_id")
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .eq("status", "accepted")
        .gte("created_at", ONE_WEEK_AGO())
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    // Transform 5-star reviews into "new favorite" feed items
    type NewFavoriteRow = { // supabase join
      id: string;
      rating: number;
      created_at: string;
      beer: { id: string; name: string; style: string | null; brewery: { id: string; name: string } | null } | null;
      profile: { id: string; username: string; display_name: string | null; avatar_url: string | null } | null;
    };
    const newFavorites: NewFavoriteItem[] = (
      (newFavoritesRes.data ?? []) as NewFavoriteRow[]
    )
      .filter((r) => r.profile && r.beer)
      .map((r) => ({
        id: r.id,
        userId: r.profile!.id,
        username: r.profile!.username,
        displayName: r.profile!.display_name ?? r.profile!.username,
        avatarUrl: r.profile!.avatar_url,
        beerName: r.beer!.name,
        beerStyle: r.beer!.style ?? "",
        breweryName: r.beer!.brewery?.name ?? "",
        createdAt: r.created_at,
        likes: 0,
      }));

    // Transform recent friendships into "friend joined" feed items
    type FriendshipRow = { id: string; created_at: string; requester_id: string; addressee_id: string };
    const recentFriendships = (recentFriendshipsRes.data ?? []) as FriendshipRow[];
    const recentFriendshipIds = recentFriendships.map((f) =>
      f.requester_id === userId ? f.addressee_id : f.requester_id
    );

    let friendsJoined: FriendJoinedItem[] = [];
    if (recentFriendshipIds.length > 0) {
      const { data: joinedProfiles } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, created_at")
        .in("id", recentFriendshipIds)
        .limit(5);

      type JoinedProfileRow = { id: string; username: string; display_name: string | null; avatar_url: string | null; created_at: string };
      friendsJoined = ((joinedProfiles ?? []) as JoinedProfileRow[]).map((p) => {
        const fship = recentFriendships.find(
          (f) => f.requester_id === p.id || f.addressee_id === p.id
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

    return { newFavorites, friendsJoined };
  } catch {
    return empty;
  }
}

/**
 * Fetch friend IDs from accepted friendships.
 */
/**
 * Activity heatmap data — daily pour counts for the last 52 weeks.
 */
export async function fetchActivityHeatmap(
  supabase: SupabaseClient,
  userId: string
): Promise<{ date: string; count: number; style?: string }[]> {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const { data: logs } = await supabase
      .from("beer_logs")
      .select("logged_at, quantity, beer:beers(style)")
      .eq("user_id", userId)
      .gte("logged_at", oneYearAgo.toISOString());

    if (!logs || logs.length === 0) return [];

    type HeatmapLogRow = { logged_at: string; quantity: number | null; beer: { style: string | null } | null };
    const dayMap = new Map<string, { count: number; styleCount: Map<string, number> }>();
    for (const log of logs as HeatmapLogRow[]) {
      const date = new Date(log.logged_at).toISOString().split("T")[0];
      const existing = dayMap.get(date) ?? { count: 0, styleCount: new Map<string, number>() };
      existing.count += log.quantity ?? 1;
      const style = log.beer?.style;
      if (style) {
        existing.styleCount.set(style, (existing.styleCount.get(style) ?? 0) + 1);
      }
      dayMap.set(date, existing);
    }

    return Array.from(dayMap.entries()).map(([date, { count, styleCount }]) => {
      let dominantStyle: string | undefined;
      let max = 0;
      for (const [style, n] of styleCount) {
        if (n > max) { max = n; dominantStyle = style; }
      }
      return { date, count, style: dominantStyle };
    });
  } catch {
    return [];
  }
}

export async function fetchFriendIds(
  supabase: SupabaseClient,
  userId: string
): Promise<string[]> {
  try {
    const { data: friendships } = await supabase
      .from("friendships")
      .select("requester_id, addressee_id")
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .eq("status", "accepted");

    type FriendshipRow = { requester_id: string; addressee_id: string };
    return ((friendships ?? []) as FriendshipRow[]).map((f) =>
      f.requester_id === userId ? f.addressee_id : f.requester_id
    );
  } catch {
    return [];
  }
}
