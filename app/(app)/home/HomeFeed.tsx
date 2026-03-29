"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  UserPlus,
  X,
  Beer,
  MapPin,
  Flame,
} from "lucide-react";
import { SessionCard } from "@/components/social/SessionCard";
import { DrinkingNow } from "@/components/social/DrinkingNow";
import { RatingCard, type FriendRating } from "@/components/social/RatingCard";
import {
  BeerOfTheWeekCard,
  type FeaturedBeer,
} from "@/components/social/BeerOfTheWeekCard";
import {
  TrendingCard,
  BreweryReviewCard,
  EventCard,
  SeasonalBeersScroll,
  CuratedCollectionsList,
  type TrendingReview,
  type BreweryReviewItem,
  type EventItem,
  type SeasonalBeer,
  type CuratedCollection,
} from "@/components/social/DiscoveryCard";
import {
  RecommendationCard,
  type RecommendationItem,
} from "@/components/social/RecommendationCard";
import {
  NewFavoriteCard,
  type NewFavoriteItem,
} from "@/components/social/NewFavoriteCard";
import {
  FriendJoinedCard,
  type FriendJoinedItem,
} from "@/components/social/FriendJoinedCard";
import {
  AchievementFeedCard,
  type FriendAchievement,
} from "@/components/social/AchievementFeedCard";
import {
  StreakFeedCard,
  isStreakMilestone,
  isStreakSeen,
  markStreakSeen,
  type StreakData,
} from "@/components/social/StreakFeedCard";
import { FeedTabBar, type FeedTab } from "@/components/social/FeedTabBar";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { getLevelProgress } from "@/lib/xp";
import { useSession } from "@/hooks/useSession";
import type { Profile, Session } from "@/types/database";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface NewBrewery {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  type: string | null;
  created_at: string;
}

interface CommunityContent {
  featuredBeers: FeaturedBeer[];
  topReviews: TrendingReview[];
  breweryReviews: BreweryReviewItem[];
  upcomingEvents: EventItem[];
  newBreweries: NewBrewery[];
  seasonalBeers?: SeasonalBeer[];
  curatedCollections?: CuratedCollection[];
}

interface UserAchievement {
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
}

type FeedItem =
  | { type: "session"; data: Session; sortDate: string; isLive?: boolean }
  | { type: "rating"; data: FriendRating; sortDate: string }
  | { type: "achievement"; data: FriendAchievement; sortDate: string }
  | { type: "streak"; data: StreakData; sortDate: string }
  | { type: "new_favorite"; data: NewFavoriteItem; sortDate: string }
  | { type: "friend_joined"; data: FriendJoinedItem; sortDate: string };

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
      // Save current scroll position
      scrollPositions.current[activeTab] = window.scrollY;
      setActiveTab(tab);
      // Restore scroll position for the target tab
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPositions.current[tab] || 0);
      });
    },
    [activeTab]
  );

  const { getActiveSession } = useSession();

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

    // Completed sessions (user + friends)
    sessions.forEach((s) => {
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
    [...activeFriendSessions, ...sessions].forEach((s) => {
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
    sessions,
    activeFriendSessions,
    friendRatings,
    friendAchievements,
    newFavorites,
    friendsJoined,
    currentUserId,
  ]);

  // ─── You Tab Feed ─────────────────────────────────────────────────────

  const youSessions = useMemo(
    () => sessions.filter((s) => s.user_id === currentUserId),
    [sessions, currentUserId]
  );

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
      {/* ── Onboarding Card ────────────────────────────────────────── */}
      {showOnboarding && (
        <OnboardingCard onDismiss={() => {
          setShowOnboarding(false);
          localStorage.setItem("hoptrack:onboarding-dismissed", "1");
        }} />
      )}

      {/* ── Feed Tab Bar ───────────────────────────────────────────── */}
      <FeedTabBar activeTab={activeTab} onChange={handleTabChange} />

      {/* ── Tab Content ────────────────────────────────────────────── */}
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
              sessions={youSessions}
              weekStats={weekStats}
              currentUserId={currentUserId}
              userAchievements={userAchievements}
              wishlist={wishlist}
              styleDNA={styleDNA}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Friends Tab ──────────────────────────────────────────────────────────────

function FriendsTabContent({
  profile,
  feedItems,
  currentUserId,
  communityContent,
  friendCount,
  activeFriendCount,
}: {
  profile: Profile | null;
  feedItems: FeedItem[];
  currentUserId: string;
  communityContent?: CommunityContent;
  friendCount: number;
  activeFriendCount: number;
}) {
  const liveCountLabel =
    activeFriendCount > 0
      ? `${activeFriendCount} friend${activeFriendCount !== 1 ? "s" : ""} drinking right now`
      : `${friendCount} friend${friendCount !== 1 ? "s" : ""} on HopTrack`;

  // Insert BOTW after 3rd item
  const firstBotw = communityContent?.featuredBeers?.[0] ?? null;

  return (
    <>
      {/* Your Round header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="font-display text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Your Round
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            {liveCountLabel}
          </p>
        </div>
        {profile && (
          <Link href={`/profile/${profile.username}`}>
            <UserAvatar profile={profile} size="md" />
          </Link>
        )}
      </div>

      {/* Live Now strip */}
      <DrinkingNow />

      {/* BOTW compact banner — only show when there's feed content */}
      {firstBotw && feedItems.length > 0 && (
        <div
          className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--accent-gold) 10%, transparent), color-mix(in srgb, var(--accent-gold) 4%, transparent))",
            border:
              "1px solid color-mix(in srgb, var(--accent-gold) 15%, transparent)",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{
              background:
                "color-mix(in srgb, var(--accent-gold) 12%, transparent)",
            }}
          >
            🍺
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-[9.5px] font-mono uppercase tracking-widest mb-0.5"
              style={{ color: "var(--accent-gold)" }}
            >
              Beer of the Week
            </p>
            <p
              className="font-display text-sm font-semibold truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {firstBotw.name}
            </p>
            <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>
              {firstBotw.brewery?.name} · {firstBotw.abv ? `${firstBotw.abv}%` : ""}
            </p>
          </div>
        </div>
      )}

      {/* Feed */}
      {feedItems.length > 0 ? (
        <div className="space-y-4">
          {feedItems.map((item, i) => (
            <div key={`item-${i}`}>
              <FeedItemCard
                item={item}
                index={i}
                currentUserId={currentUserId}
              />
            </div>
          ))}
        </div>
      ) : (
        <FriendsEmptyState />
      )}
    </>
  );
}

function FeedItemCard({
  item,
  index,
  currentUserId,
}: {
  item: FeedItem;
  index: number;
  currentUserId: string;
}) {
  if (item.type === "session") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03, duration: 0.28 }}
        className="rounded-2xl"
        style={
          item.isLive
            ? {
                border:
                  "1px solid color-mix(in srgb, var(--accent-gold) 40%, transparent)",
                boxShadow:
                  "0 0 16px color-mix(in srgb, var(--accent-amber) 15%, transparent)",
              }
            : undefined
        }
      >
        <SessionCard
          session={item.data as any}
          currentUserId={currentUserId}
        />
      </motion.div>
    );
  }

  if (item.type === "rating") {
    return <RatingCard rating={item.data} index={index} />;
  }

  if (item.type === "achievement") {
    return <AchievementFeedCard achievement={item.data} index={index} />;
  }

  if (item.type === "streak") {
    return <StreakFeedCard streak={item.data} index={index} />;
  }

  if (item.type === "new_favorite") {
    return <NewFavoriteCard favorite={item.data} index={index} />;
  }

  if (item.type === "friend_joined") {
    return <FriendJoinedCard friend={item.data} index={index} />;
  }

  return null;
}

function FriendsEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-16 space-y-5"
    >
      <span className="text-6xl block">🍺</span>
      <div className="space-y-2">
        <h3
          className="font-display text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Your round starts here
        </h3>
        <p
          className="max-w-xs mx-auto text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Find friends to see what they&rsquo;re drinking. Start a session to share
          your pours.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Link
          href="/friends"
          className="inline-flex items-center justify-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl transition-all"
          style={{ background: "var(--accent-gold)", color: "#0F0E0C" }}
        >
          <UserPlus size={15} />
          Find Friends
        </Link>
        <Link
          href="/explore"
          className="inline-flex items-center justify-center gap-2 font-medium text-sm px-5 py-3 rounded-xl transition-all"
          style={{
            background: "var(--surface)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          }}
        >
          <Compass size={15} />
          Explore Breweries
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Discover Tab ─────────────────────────────────────────────────────────────

function DiscoverTabContent({
  communityContent,
  hasCommunityContent,
}: {
  communityContent?: CommunityContent;
  hasCommunityContent: boolean;
}) {
  const hasNewBreweries = (communityContent?.newBreweries?.length ?? 0) > 0;
  const effectivelyEmpty = !hasCommunityContent && !hasNewBreweries;

  if (effectivelyEmpty || !communityContent) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16 space-y-5"
      >
        <span className="text-6xl block">🌍</span>
        <div className="space-y-2">
          <h3
            className="font-display text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Nothing brewing yet
          </h3>
          <p
            className="max-w-xs mx-auto text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Check back soon for trending beers, events, and community reviews.
          </p>
        </div>
        <Link
          href="/explore"
          className="inline-flex items-center justify-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl transition-all"
          style={{ background: "var(--accent-gold)", color: "#0F0E0C" }}
        >
          <Compass size={15} />
          Explore Breweries
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Beer of the Week — single, prominent */}
      {communityContent.featuredBeers.length > 0 && (
        <div className="space-y-2">
          <p
            className="text-[10px] font-mono uppercase tracking-widest px-1"
            style={{ color: "var(--accent-gold)" }}
          >
            Beer of the Week
          </p>
          <BeerOfTheWeekCard beer={communityContent.featuredBeers[0]} index={0} />
        </div>
      )}

      {/* Trending beer reviews */}
      {communityContent.topReviews.length > 0 && (
        <div className="space-y-2">
          <TrendingCard reviews={communityContent.topReviews} />
        </div>
      )}

      {/* Upcoming events */}
      {communityContent.upcomingEvents.length > 0 && (
        <div className="space-y-2">
          <p
            className="text-[10px] font-mono uppercase tracking-widest px-1"
            style={{ color: "var(--text-muted)" }}
          >
            Happening Soon
          </p>
          {communityContent.upcomingEvents.slice(0, 3).map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </div>
      )}

      {/* Community brewery reviews */}
      {communityContent.breweryReviews.length > 0 && (
        <div className="space-y-2">
          <p
            className="text-[10px] font-mono uppercase tracking-widest px-1"
            style={{ color: "var(--text-muted)" }}
          >
            Community Reviews
          </p>
          {communityContent.breweryReviews.slice(0, 4).map((review, i) => (
            <BreweryReviewCard key={review.id} review={review} index={i} />
          ))}
        </div>
      )}

      {/* New Breweries */}
      {communityContent.newBreweries && communityContent.newBreweries.length > 0 && (
        <div className="space-y-2">
          <p
            className="text-[10px] font-mono uppercase tracking-widest px-1"
            style={{ color: "var(--text-muted)" }}
          >
            New on HopTrack
          </p>
          <div className="grid grid-cols-2 gap-2">
            {communityContent.newBreweries.slice(0, 6).map((brewery, i) => (
              <motion.div
                key={brewery.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.28 }}
              >
                <Link href={`/brewery/${brewery.id}`}>
                  <div
                    className="p-3 rounded-xl h-full"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">🍻</span>
                      <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                        {brewery.name}
                      </p>
                    </div>
                    {(brewery.city || brewery.state) && (
                      <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>
                        {[brewery.city, brewery.state].filter(Boolean).join(", ")}
                      </p>
                    )}
                    {brewery.type && (
                      <span
                        className="inline-block mt-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full"
                        style={{
                          background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)",
                          color: "var(--accent-gold)",
                        }}
                      >
                        {brewery.type}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="text-center pt-1">
            <Link
              href="/explore"
              className="text-xs font-medium"
              style={{ color: "var(--accent-gold)" }}
            >
              Explore all breweries →
            </Link>
          </div>
        </div>
      )}

      {/* Seasonal & Limited */}
      {communityContent.seasonalBeers && communityContent.seasonalBeers.length > 0 && (
        <SeasonalBeersScroll beers={communityContent.seasonalBeers} />
      )}

      {/* Curated Collections */}
      {communityContent.curatedCollections && communityContent.curatedCollections.length > 0 && (
        <CuratedCollectionsList collections={communityContent.curatedCollections} />
      )}
    </div>
  );
}

// ─── You Tab ──────────────────────────────────────────────────────────────────

function YouTabContent({
  profile,
  sessions,
  weekStats,
  currentUserId,
  userAchievements,
  wishlist,
  styleDNA,
}: {
  profile: Profile | null;
  sessions: Session[];
  weekStats: { sessions: number; beers: number; uniqueBreweries: number };
  currentUserId: string;
  userAchievements?: UserAchievement[];
  wishlist?: WishlistItem[];
  styleDNA?: StyleDNAEntry[];
}) {
  const levelInfo = profile ? getLevelProgress(profile.xp) : null;

  if (!profile) return null;

  // Brewery passport: unique breweries from sessions
  const visitedBreweries = useMemo(() => {
    const seen = new Map<string, { id: string; name: string; city: string | null; state: string | null }>();
    for (const s of sessions) {
      const b = (s as any).brewery;
      if (b && !seen.has(b.id)) seen.set(b.id, b);
    }
    return Array.from(seen.values());
  }, [sessions]);

  const maxStyleCount = styleDNA && styleDNA.length > 0 ? styleDNA[0].count : 1;

  return (
    <div className="space-y-5">
      {/* Profile header */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-4 mb-4">
          <UserAvatar profile={profile} size="lg" showLevel />
          <div className="flex-1 min-w-0">
            <h1
              className="font-display text-xl font-bold leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {profile.display_name ?? profile.username}
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {levelInfo?.current.name} · Level {profile.level}
            </p>
          </div>
          <Link
            href={`/profile/${profile.username}`}
            className="text-xs font-medium px-3 py-1.5 rounded-lg"
            style={{
              background: "var(--surface-2)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            Profile
          </Link>
        </div>
        {levelInfo && levelInfo.next && (
          <div className="space-y-1.5">
            <div
              className="flex items-center justify-between text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <span>{profile.xp.toLocaleString()} XP</span>
              <span>{levelInfo.xpToNext} XP to Level {levelInfo.next.level}</span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: "var(--surface-2)" }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${levelInfo.progress}%` }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(to right, var(--accent-gold), var(--accent-amber))",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          {
            label: "Sessions",
            value: profile.total_checkins,
            icon: <Beer size={14} style={{ color: "var(--accent-gold)" }} />,
          },
          {
            label: "Beers",
            value: (profile as any).unique_beers ?? 0,
            icon: <span className="text-sm">🍺</span>,
          },
          {
            label: "Breweries",
            value: visitedBreweries.length || ((profile as any).unique_breweries ?? 0),
            icon: <MapPin size={14} style={{ color: "var(--accent-gold)" }} />,
          },
          {
            label: "Streak",
            value: (profile as any).current_streak ?? 0,
            icon: <Flame size={14} style={{ color: "var(--accent-amber)" }} />,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-3 text-center"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex justify-center mb-1">{stat.icon}</div>
            <p className="text-lg font-bold font-mono" style={{ color: "var(--text-primary)" }}>
              {stat.value}
            </p>
            <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Taste DNA */}
      {styleDNA && styleDNA.length >= 3 && (
        <div
          className="rounded-2xl p-4 space-y-3"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
              Your Taste DNA
            </p>
            <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
              based on {styleDNA.reduce((s, e) => s + e.count, 0)} beers
            </span>
          </div>
          <div className="space-y-2">
            {styleDNA.slice(0, 6).map((entry, i) => (
              <div key={entry.style} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {entry.style}
                  </span>
                  <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                    {entry.count} {entry.count === 1 ? "beer" : "beers"}
                    {entry.avgRating ? ` · ★ ${entry.avgRating.toFixed(1)}` : ""}
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(entry.count / maxStyleCount) * 100}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
                    className="h-full rounded-full"
                    style={{
                      background: i === 0
                        ? "linear-gradient(to right, var(--accent-gold), var(--accent-amber))"
                        : "color-mix(in srgb, var(--accent-gold) 50%, var(--surface-2))",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {styleDNA && styleDNA.length > 0 && styleDNA.length < 3 && (
        <div
          className="rounded-2xl p-4 text-center"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
            Your Taste DNA
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Keep checking in to build your Taste DNA — needs 3+ styles.
          </p>
        </div>
      )}

      {/* Recent achievements */}
      {userAchievements && userAchievements.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Recent Achievements
            </p>
            <Link href="/achievements" className="text-xs font-medium" style={{ color: "var(--accent-gold)" }}>
              View All
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {userAchievements.map((ua) => (
              <div key={ua.id} className="flex flex-col items-center gap-1.5 flex-shrink-0 w-16">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)" }}
                >
                  {ua.achievement.icon}
                </div>
                <p
                  className="text-[10px] text-center leading-tight truncate w-full"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {ua.achievement.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Want to Try */}
      {wishlist && wishlist.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Want to Try
            </p>
            <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
              {wishlist.length} saved
            </span>
          </div>
          <div className="space-y-2">
            {wishlist.slice(0, 5).map((item) => (
              item.beer ? (
                <Link key={item.id} href={`/beer/${item.beer.id}`}>
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: "color-mix(in srgb, var(--accent-gold) 8%, transparent)" }}
                    >
                      🍺
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                        {item.beer.name}
                      </p>
                      <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                        {item.beer.brewery?.name}
                        {item.beer.style ? ` · ${item.beer.style}` : ""}
                      </p>
                    </div>
                    {item.beer.abv && (
                      <span className="text-xs font-mono flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                        {item.beer.abv}%
                      </span>
                    )}
                  </div>
                </Link>
              ) : null
            ))}
          </div>
        </div>
      )}

      {/* Brewery Passport */}
      {visitedBreweries.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Brewery Passport
            </p>
            <span className="text-[10px] font-mono" style={{ color: "var(--accent-gold)" }}>
              {visitedBreweries.length} visited
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {visitedBreweries.slice(0, 6).map((b) => (
              <Link key={b.id} href={`/brewery/${b.id}`}>
                <div
                  className="p-3 rounded-xl"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">🍻</span>
                    <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                      {b.name}
                    </p>
                  </div>
                  {(b.city || b.state) && (
                    <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>
                      {[b.city, b.state].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
          {visitedBreweries.length > 6 && (
            <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
              +{visitedBreweries.length - 6} more in your passport
            </p>
          )}
        </div>
      )}

      {/* Your activity */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Your Activity
          </span>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        </div>

        {sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.28 }}
              >
                <SessionCard session={s as any} currentUserId={currentUserId} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 space-y-3">
            <span className="text-5xl block">🍻</span>
            <h3 className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              Start your story
            </h3>
            <p className="text-sm max-w-xs mx-auto" style={{ color: "var(--text-muted)" }}>
              Your sessions, ratings, and achievements will appear here.
            </p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("hoptrack:open-checkin"))}
              className="inline-flex items-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl transition-all"
              style={{ background: "var(--accent-gold)", color: "#0F0E0C" }}
            >
              <Beer size={15} />
              Start a Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Onboarding Card ──────────────────────────────────────────────────────────

function OnboardingCard({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 relative"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--accent-gold) 8%, transparent), transparent)",
        border:
          "1px solid color-mix(in srgb, var(--accent-gold) 20%, transparent)",
      }}
    >
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 p-1 transition-colors"
        style={{ color: "var(--text-muted)" }}
      >
        <X size={16} />
      </button>
      <h3
        className="font-display text-lg font-bold mb-1"
        style={{ color: "var(--accent-gold)" }}
      >
        Welcome to HopTrack!
      </h3>
      <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
        Here&rsquo;s how to get started:
      </p>
      <div className="space-y-3">
        <button
          onClick={() =>
            window.dispatchEvent(new CustomEvent("hoptrack:open-checkin"))
          }
          className="flex items-center gap-3 w-full text-left p-3 rounded-xl transition-colors"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background:
                "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
            }}
          >
            <Beer size={16} style={{ color: "var(--accent-gold)" }} />
          </div>
          <div>
            <p
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Start a session
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Visit a brewery or drink at home
            </p>
          </div>
        </button>
        <Link
          href="/explore"
          className="flex items-center gap-3 w-full text-left p-3 rounded-xl transition-colors"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background:
                "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
            }}
          >
            <MapPin size={16} style={{ color: "var(--accent-gold)" }} />
          </div>
          <div>
            <p
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Explore breweries
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Find breweries near you
            </p>
          </div>
        </Link>
        <Link
          href="/friends"
          className="flex items-center gap-3 w-full text-left p-3 rounded-xl transition-colors"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background:
                "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
            }}
          >
            <UserPlus size={16} style={{ color: "var(--accent-gold)" }} />
          </div>
          <div>
            <p
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Add friends
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              See what your friends are drinking
            </p>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}
