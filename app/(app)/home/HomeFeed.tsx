"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  isStreakMilestone,
  isStreakSeen,
  markStreakSeen,
} from "@/components/social/StreakFeedCard";
import { FeedTabBar, type FeedTab } from "@/components/social/FeedTabBar";
import { useSession } from "@/hooks/useSession";
import { useFeedPagination } from "@/hooks/useFeedPagination";
import type { FriendRating } from "@/components/social/RatingCard";
import type { FriendAchievement } from "@/components/social/AchievementFeedCard";
import type { NewFavoriteItem } from "@/components/social/NewFavoriteCard";
import type { FriendJoinedItem } from "@/components/social/FriendJoinedCard";
import type { FeaturedBeer } from "@/components/social/BeerOfTheWeekCard";
import type {
  TrendingReview,
  BreweryReviewItem,
  EventItem,
  SeasonalBeer,
  CuratedCollection,
} from "@/components/social/DiscoveryCard";
import type { Profile, Session } from "@/types/database";

import { FriendsTabContent } from "./FriendsTabContent";
import { DiscoverTabContent } from "./DiscoverTabContent";
import { YouTabContent } from "./YouTabContent";
import { OnboardingCard } from "./OnboardingCard";
import type { FeedItem } from "./FeedItemCard";

// ─── Exported Types ─────────────────────────────────────────────────────────

export interface NewBrewery {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  type: string | null;
  created_at: string;
}

export interface CommunityContent {
  featuredBeers: FeaturedBeer[];
  topReviews: TrendingReview[];
  breweryReviews: BreweryReviewItem[];
  upcomingEvents: EventItem[];
  newBreweries: NewBrewery[];
  seasonalBeers?: SeasonalBeer[];
  curatedCollections?: CuratedCollection[];
}

export interface UserAchievement {
  id: string;
  earned_at: string;
  achievement: {
    id: string;
    name: string;
    icon: string;
    tier: string;
    category: string;
    xp_reward: number;
  };
}

export interface WishlistItem {
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

export interface StyleDNAEntry {
  style: string;
  count: number;
  avgRating: number | null;
}

interface HomeFeedProps {
  profile: Profile | null;
  sessions: Session[];
  activeFriendSessions: Session[];
  weekStats: { sessions: number; beers: number; uniqueBreweries: number };
  currentUserId: string;
  communityContent?: CommunityContent;
  friendRatings?: FriendRating[];
  friendAchievements?: FriendAchievement[];
  userAchievements?: UserAchievement[];
  wishlist?: WishlistItem[];
  styleDNA?: StyleDNAEntry[];
  friendCount: number;
  newFavorites?: NewFavoriteItem[];
  friendsJoined?: FriendJoinedItem[];
  reactionCounts?: Record<string, Record<string, number>>;
  userReactions?: Record<string, string[]>;
  commentCounts?: Record<string, number>;
}

// ─── HomeFeed ───────────────────────────────────────────────────────────────

export function HomeFeed({
  profile,
  sessions,
  activeFriendSessions,
  weekStats,
  currentUserId,
  communityContent,
  friendRatings,
  friendAchievements,
  userAchievements,
  wishlist,
  styleDNA,
  friendCount,
  newFavorites,
  friendsJoined,
  reactionCounts,
  userReactions,
  commentCounts,
}: HomeFeedProps) {
  const [activeTab, setActiveTab] = useState<FeedTab>("friends");
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Scroll position memory per tab
  const scrollPositions = useRef<Record<FeedTab, number>>({
    friends: 0,
    discover: 0,
    you: 0,
  });

  const handleTabChange = useCallback(
    (tab: FeedTab) => {
      scrollPositions.current[activeTab] = window.scrollY;
      setActiveTab(tab);
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPositions.current[tab] || 0);
      });
    },
    [activeTab]
  );

  const { getActiveSession } = useSession();

  // ─── Feed Pagination ──────────────────────────────────────────────────

  const friendsPagination = useFeedPagination({
    initialSessions: sessions,
    initialReactionCounts: reactionCounts,
    initialUserReactions: userReactions,
    initialCommentCounts: commentCounts,
    tab: "friends",
  });

  const initialYouSessions = useMemo(
    () => sessions.filter((s) => s.user_id === currentUserId),
    [sessions, currentUserId]
  );

  const youPagination = useFeedPagination({
    initialSessions: initialYouSessions,
    initialReactionCounts: reactionCounts,
    initialUserReactions: userReactions,
    initialCommentCounts: commentCounts,
    tab: "you",
  });

  useEffect(() => {
    if (
      profile &&
      profile.total_checkins === 0 &&
      !localStorage.getItem("hoptrack:onboarding-dismissed")
    ) {
      setShowOnboarding(true);
    }
  }, [profile]);

  // Broadcast active session to AppShell
  useEffect(() => {
    getActiveSession().then((session) => {
      window.dispatchEvent(
        new CustomEvent("hoptrack:session-changed", {
          detail: session
            ? {
                session,
                breweryName: (session as any).brewery?.name ?? "Brewery",
              }
            : null,
        })
      );
    });
  }, [getActiveSession]);

  // ─── Friends Tab Feed Items ─────────────────────────────────────────────

  const allFriendSessions = friendsPagination.sessions;

  const friendsFeed = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [];

    // Live friend sessions (float to top)
    activeFriendSessions.forEach((s) => {
      items.push({
        type: "session",
        data: s,
        sortDate: s.started_at,
        isLive: true,
      });
    });

    // Completed sessions (user + friends) — now includes paginated sessions
    allFriendSessions.forEach((s) => {
      items.push({ type: "session", data: s, sortDate: s.started_at });
    });

    // Friend ratings
    if (friendRatings && friendRatings.length > 0) {
      friendRatings.forEach((r) => {
        items.push({ type: "rating", data: r, sortDate: r.created_at });
      });
    }

    // Friend achievements
    if (friendAchievements && friendAchievements.length > 0) {
      friendAchievements.forEach((a) => {
        items.push({
          type: "achievement",
          data: a,
          sortDate: a.earned_at,
        });
      });
    }

    // New favorites (friend 5-star reviews)
    if (newFavorites && newFavorites.length > 0) {
      newFavorites.forEach((f) => {
        items.push({ type: "new_favorite", data: f, sortDate: f.createdAt });
      });
    }

    // Friends who recently joined
    if (friendsJoined && friendsJoined.length > 0) {
      friendsJoined.forEach((f) => {
        items.push({ type: "friend_joined", data: f, sortDate: f.joinedAt });
      });
    }

    // Streak milestones (derived from session profiles)
    const seenStreakUsers = new Set<string>();
    [...activeFriendSessions, ...allFriendSessions].forEach((s) => {
      const p = (s as any).profile;
      if (
        p &&
        p.current_streak &&
        p.id !== currentUserId &&
        isStreakMilestone(p.current_streak) &&
        !seenStreakUsers.has(p.id) &&
        !isStreakSeen(p.id, p.current_streak)
      ) {
        seenStreakUsers.add(p.id);
        markStreakSeen(p.id, p.current_streak);
        items.push({
          type: "streak",
          data: {
            profileId: p.id,
            username: p.username,
            displayName: p.display_name || p.username,
            currentStreak: p.current_streak,
          },
          sortDate: s.started_at,
        });
      }
    });

    // Sort: live first, then chronological
    return items.sort((a, b) => {
      const aLive = a.type === "session" && a.isLive ? 1 : 0;
      const bLive = b.type === "session" && b.isLive ? 1 : 0;
      if (aLive !== bLive) return bLive - aLive;
      return (
        new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime()
      );
    });
  }, [
    allFriendSessions,
    activeFriendSessions,
    friendRatings,
    friendAchievements,
    newFavorites,
    friendsJoined,
    currentUserId,
  ]);

  const hasCommunityContent =
    communityContent &&
    (communityContent.featuredBeers.length > 0 ||
      communityContent.topReviews.length > 0 ||
      communityContent.breweryReviews.length > 0 ||
      communityContent.upcomingEvents.length > 0 ||
      (communityContent.seasonalBeers?.length ?? 0) > 0 ||
      (communityContent.curatedCollections?.length ?? 0) > 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5" suppressHydrationWarning>
      {/* Onboarding Card */}
      {showOnboarding && (
        <OnboardingCard onDismiss={() => {
          setShowOnboarding(false);
          localStorage.setItem("hoptrack:onboarding-dismissed", "1");
        }} />
      )}

      {/* Feed Tab Bar */}
      <FeedTabBar activeTab={activeTab} onChange={handleTabChange} />

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "friends" && (
          <motion.div
            key="friends"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="space-y-5"
          >
            <FriendsTabContent
              profile={profile}
              feedItems={friendsFeed}
              currentUserId={currentUserId}
              communityContent={communityContent}
              friendCount={friendCount}
              activeFriendCount={activeFriendSessions.length}
              reactionCounts={friendsPagination.reactionCounts}
              userReactions={friendsPagination.userReactions}
              commentCounts={friendsPagination.commentCounts}
              loading={friendsPagination.loading}
              hasMore={friendsPagination.hasMore}
              sentinelRef={friendsPagination.sentinelRef}
            />
          </motion.div>
        )}

        {activeTab === "discover" && (
          <motion.div
            key="discover"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="space-y-5"
          >
            <DiscoverTabContent
              communityContent={communityContent}
              hasCommunityContent={!!hasCommunityContent}
            />
          </motion.div>
        )}

        {activeTab === "you" && (
          <motion.div
            key="you"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="space-y-5"
          >
            <YouTabContent
              profile={profile}
              sessions={youPagination.sessions}
              weekStats={weekStats}
              currentUserId={currentUserId}
              userAchievements={userAchievements}
              wishlist={wishlist}
              styleDNA={styleDNA}
              reactionCounts={youPagination.reactionCounts}
              userReactions={youPagination.userReactions}
              commentCounts={youPagination.commentCounts}
              loading={youPagination.loading}
              hasMore={youPagination.hasMore}
              sentinelRef={youPagination.sentinelRef}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
