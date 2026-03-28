"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Compass, UserPlus, Users, X, Beer, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { SessionCard } from "@/components/social/SessionCard";
import { DrinkingNow } from "@/components/social/DrinkingNow";
import { RatingCard, type FriendRating } from "@/components/social/RatingCard";
import { BeerOfTheWeekCard, type FeaturedBeer } from "@/components/social/BeerOfTheWeekCard";
import {
  TrendingCard,
  BreweryReviewCard,
  EventCard,
  type TrendingReview,
  type BreweryReviewItem,
  type EventItem,
} from "@/components/social/DiscoveryCard";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { getLevelProgress } from "@/lib/xp";
import { useSession } from "@/hooks/useSession";
import type { Profile, Session } from "@/types/database";

interface CommunityContent {
  featuredBeers: FeaturedBeer[];
  topReviews: TrendingReview[];
  breweryReviews: BreweryReviewItem[];
  upcomingEvents: EventItem[];
}

interface HomeFeedProps {
  profile: Profile | null;
  sessions: Session[];
  weekStats: { sessions: number; beers: number; uniqueBreweries: number };
  currentUserId: string;
  communityContent?: CommunityContent;
  friendRatings?: FriendRating[];
}

type FeedFilter = "all" | "friends" | "you";

type FeedItem =
  | { type: "session"; data: Session; sortDate: string }
  | { type: "rating"; data: FriendRating; sortDate: string };

function isFirstVisitToday(): boolean {
  const key = "hoptrack:welcome-expanded";
  const today = new Date().toDateString();
  const stored = localStorage.getItem(key);
  if (stored !== today) {
    localStorage.setItem(key, today);
    return true;
  }
  return false;
}

export function HomeFeed({
  profile,
  sessions,
  weekStats,
  currentUserId,
  communityContent,
  friendRatings,
}: HomeFeedProps) {
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("all");
  const [welcomeExpanded, setWelcomeExpanded] = useState(true);
  const levelInfo = profile ? getLevelProgress(profile.xp) : null;

  const { getActiveSession } = useSession();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    setWelcomeExpanded(isFirstVisitToday());
  }, []);

  useEffect(() => {
    if (
      profile &&
      profile.total_checkins === 0 &&
      !localStorage.getItem("hoptrack:onboarding-dismissed")
    ) {
      setShowOnboarding(true);
    }
  }, [profile]);

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

  const filteredSessions = useMemo(() => {
    if (feedFilter === "all") return sessions;
    if (feedFilter === "you")
      return sessions.filter((s) => s.user_id === currentUserId);
    return sessions.filter((s) => s.user_id !== currentUserId);
  }, [sessions, feedFilter, currentUserId]);

  const filterCounts = useMemo(
    () => ({
      all: sessions.length,
      friends: sessions.filter((s) => s.user_id !== currentUserId).length,
      you: sessions.filter((s) => s.user_id === currentUserId).length,
    }),
    [sessions, currentUserId]
  );

  // Main feed: sessions + friend ratings, chronological, NO discovery interspersed
  // Discovery content renders as its own section below
  const feedItems = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [];

    filteredSessions.forEach((s) => {
      items.push({ type: "session", data: s, sortDate: s.started_at });
    });

    // Friend ratings show in "all" and "friends" filters
    if (feedFilter !== "you" && friendRatings && friendRatings.length > 0) {
      friendRatings.forEach((r) => {
        items.push({ type: "rating", data: r, sortDate: r.created_at });
      });
    }

    return items.sort(
      (a, b) =>
        new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime()
    );
  }, [filteredSessions, friendRatings, feedFilter]);

  const hasCommunityContent =
    communityContent &&
    (communityContent.featuredBeers.length > 0 ||
      communityContent.topReviews.length > 0 ||
      communityContent.breweryReviews.length > 0 ||
      communityContent.upcomingEvents.length > 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* ── Welcome Header ─────────────────────────────────────────── */}
      {profile &&
        (welcomeExpanded ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
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
                  Hey,{" "}
                  {(profile.display_name ?? profile.username).split(" ")[0]}!
                </h1>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {levelInfo?.current.name} · Level {profile.level}
                </p>
              </div>
            </div>
            {levelInfo && levelInfo.next && (
              <div className="space-y-1.5">
                <div
                  className="flex items-center justify-between text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  <span>{profile.xp.toLocaleString()} XP</span>
                  <span>
                    {levelInfo.xpToNext} XP to Level {levelInfo.next.level}
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "var(--surface-2)" }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${levelInfo.progress}%` }}
                    transition={{
                      duration: 1,
                      ease: [0.16, 1, 0.3, 1],
                      delay: 0.3,
                    }}
                    className="h-full rounded-full"
                    style={{
                      background:
                        "linear-gradient(to right, var(--accent-gold), var(--accent-amber))",
                    }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <UserAvatar profile={profile} size="sm" />
            <span
              className="font-sans font-semibold text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              {(profile.display_name ?? profile.username).split(" ")[0]}
            </span>
            <span
              className="text-xs font-mono"
              style={{ color: "var(--text-muted)" }}
            >
              Level {profile.level}
            </span>
            <div
              className="ml-auto flex items-center gap-1 text-xs font-mono"
              style={{ color: "var(--accent-gold)" }}
            >
              <Zap size={12} />
              {profile.xp.toLocaleString()}
            </div>
          </motion.div>
        ))}

      {/* ── Onboarding Card ────────────────────────────────────────── */}
      {showOnboarding && (
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
            onClick={() => {
              setShowOnboarding(false);
              localStorage.setItem("hoptrack:onboarding-dismissed", "1");
            }}
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
      )}

      {/* ── Drinking Now — always first after welcome ───────────────
          This is the social heartbeat. Friends currently at a brewery
          or drinking at home, with beer counts and elapsed time.
      ──────────────────────────────────────────────────────────────── */}
      <DrinkingNow />

      {/* ── Feed Filter Tabs ───────────────────────────────────────── */}
      <div
        className="flex items-center rounded-xl p-1"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {(
          [
            { key: "all" as FeedFilter, label: "All", count: filterCounts.all },
            {
              key: "friends" as FeedFilter,
              label: "Friends",
              count: filterCounts.friends,
              icon: Users,
            },
            { key: "you" as FeedFilter, label: "You", count: filterCounts.you },
          ]
        ).map(({ key, label, count, icon: Icon }: { key: FeedFilter; label: string; count: number; icon?: React.ElementType }) => (
          <button
            key={key}
            onClick={() => setFeedFilter(key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all",
              feedFilter === key ? "font-semibold" : ""
            )}
            style={
              feedFilter === key
                ? { background: "var(--accent-gold)", color: "#0F0E0C" }
                : { color: "var(--text-muted)" }
            }
            aria-pressed={feedFilter === key}
          >
            {Icon && <Icon size={12} />}
            {label}
            {count > 0 && (
              <span
                className={cn(
                  "text-[10px] font-mono",
                  feedFilter === key ? "opacity-70" : ""
                )}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Main Feed — friend sessions + rating cards, chronological ── */}
      {feedItems.length > 0 ? (
        <div className="space-y-4">
          {feedItems.map((item, i) => {
            if (item.type === "session") {
              return (
                <motion.div
                  key={`s-${item.data.id}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.28 }}
                >
                  <SessionCard
                    session={item.data as any}
                    currentUserId={currentUserId}
                  />
                </motion.div>
              );
            }
            if (item.type === "rating") {
              return (
                <RatingCard
                  key={`r-${item.data.id}`}
                  rating={item.data}
                  index={i}
                />
              );
            }
            return null;
          })}

          {/* ── Community Section — appended after friend content, not interspersed ── */}
          {hasCommunityContent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4 pt-2"
            >
              {/* Divider with label */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                <span
                  className="text-[10px] font-mono uppercase tracking-widest"
                  style={{ color: "var(--text-muted)" }}
                >
                  From the Community
                </span>
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              </div>

              <CommunitySection communityContent={communityContent!} />
            </motion.div>
          )}
        </div>
      ) : hasCommunityContent ? (
        /* Empty personal feed but community content exists */
        <div className="space-y-4">
          <div className="text-center py-6">
            <p
              className="font-display text-xl font-bold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              No activity yet
            </p>
            <p
              className="text-sm max-w-xs mx-auto"
              style={{ color: "var(--text-muted)" }}
            >
              Start a session or add friends to see their activity here.
            </p>
            <div className="flex gap-3 justify-center mt-4">
              <Link
                href="/friends"
                className="inline-flex items-center gap-2 font-semibold text-sm px-4 py-2.5 rounded-xl"
                style={{ background: "var(--accent-gold)", color: "#0F0E0C" }}
              >
                <UserPlus size={14} />
                Find Friends
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 font-medium text-sm px-4 py-2.5 rounded-xl"
                style={{
                  background: "var(--surface)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border)",
                }}
              >
                <Compass size={14} />
                Explore
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span
              className="text-[10px] font-mono uppercase tracking-widest"
              style={{ color: "var(--text-muted)" }}
            >
              Happening on HopTrack
            </span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

          <CommunitySection communityContent={communityContent!} />
        </div>
      ) : (
        <EmptyFeed />
      )}
    </div>
  );
}

// ── Community Discovery Section ─────────────────────────────────────────────
function CommunitySection({ communityContent }: { communityContent: CommunityContent }) {
  return (
    <div className="space-y-3">
      {/* Beer of the Week */}
      {communityContent.featuredBeers.map((beer, i) => (
        <BeerOfTheWeekCard key={beer.id} beer={beer} index={i} />
      ))}

      {/* Trending beer reviews */}
      {communityContent.topReviews.length > 0 && (
        <TrendingCard reviews={communityContent.topReviews} />
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

      {/* Brewery reviews */}
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
    </div>
  );
}

function EmptyFeed() {
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
          Your feed is thirsty
        </h3>
        <p
          className="max-w-xs mx-auto text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Start a session or follow some friends to fill your feed with
          activity.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Link
          href="/explore"
          className="inline-flex items-center justify-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl transition-all"
          style={{ background: "var(--accent-gold)", color: "#0F0E0C" }}
        >
          <Compass size={15} />
          Explore Breweries
        </Link>
        <Link
          href="/friends"
          className="inline-flex items-center justify-center gap-2 font-medium text-sm px-5 py-3 rounded-xl transition-all"
          style={{
            background: "var(--surface)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          }}
        >
          <UserPlus size={15} />
          Find Friends
        </Link>
      </div>
    </motion.div>
  );
}
