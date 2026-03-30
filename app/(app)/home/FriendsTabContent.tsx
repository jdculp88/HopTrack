"use client";

import type { RefObject } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Compass, UserPlus } from "lucide-react";
import { DrinkingNow } from "@/components/social/DrinkingNow";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { FeedItemCard, type FeedItem } from "./FeedItemCard";
import { FeedCardSkeletons, FeedEndMessage } from "./FeedPaginationUI";
import type { Profile } from "@/types/database";
import type { FeaturedBeer } from "@/components/social/BeerOfTheWeekCard";
import { useReactions } from "./ReactionContext";

function getFeedItemKey(item: FeedItem, i: number): string {
  switch (item.type) {
    case "session":
      return `session-${item.data.id}`;
    case "rating":
      return `rating-${item.data.id}`;
    case "achievement":
      return `achievement-${item.data.id}`;
    case "streak":
      return `streak-${item.data.profileId}`;
    case "new_favorite":
      return `new_favorite-${item.data.id || i}`;
    case "friend_joined":
      return `friend_joined-${item.data.userId || i}`;
    default:
      return `item-${i}`;
  }
}

interface CommunityContentForFriends {
  featuredBeers: FeaturedBeer[];
}

export function FriendsTabContent({
  profile,
  feedItems,
  currentUserId,
  communityContent,
  friendCount,
  activeFriendCount,
  loading,
  hasMore,
  sentinelRef,
}: {
  profile: Profile | null;
  feedItems: FeedItem[];
  currentUserId: string;
  communityContent?: CommunityContentForFriends;
  friendCount: number;
  activeFriendCount: number;
  loading?: boolean;
  hasMore?: boolean;
  sentinelRef?: RefObject<HTMLDivElement | null>;
}) {
  const { reactionCounts, userReactions, commentCounts } = useReactions();
  const liveCountLabel =
    activeFriendCount > 0
      ? `${activeFriendCount} friend${activeFriendCount !== 1 ? "s" : ""} drinking right now`
      : `${friendCount} friend${friendCount !== 1 ? "s" : ""} on HopTrack`;

  const firstBotw = communityContent?.featuredBeers?.[0] ?? null;

  return (
    <>
      {/* Your Round header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="font-display font-bold"
            style={{
              color: "var(--text-primary)",
              fontSize: "clamp(28px, 8vw, 36px)",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            Your Round
          </h1>
          <p
            className="text-sm mt-1 font-mono tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
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

      {/* BOTW compact banner */}
      {firstBotw && feedItems.length > 0 && (
        <Link href={`/beer/${firstBotw.id}`}>
          <div
            className="rounded-xl px-4 py-3 flex items-center gap-3 hover:brightness-110 transition-all"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in srgb, var(--accent-gold) 10%, transparent), color-mix(in srgb, var(--accent-gold) 4%, transparent))",
              border:
                "1px solid color-mix(in srgb, var(--accent-gold) 18%, transparent)",
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-base"
              style={{
                background:
                  "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
              }}
            >
              🍺
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-[9px] font-mono uppercase tracking-widest mb-0.5"
                style={{ color: "var(--accent-gold)" }}
              >
                Beer of the Week
              </p>
              <p
                className="font-display text-sm font-bold truncate leading-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {firstBotw.name}
              </p>
              <p
                className="text-[11px] truncate mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                {firstBotw.brewery?.name}
                {firstBotw.abv ? ` · ${firstBotw.abv}%` : ""}
              </p>
            </div>
          </div>
        </Link>
      )}

      {/* Feed */}
      {feedItems.length > 0 ? (
        <div className="space-y-3">
          {feedItems.map((item, i) => (
            <div key={getFeedItemKey(item, i)}>
              <FeedItemCard
                item={item}
                index={i}
                currentUserId={currentUserId}
              />
            </div>
          ))}

          {/* Pagination sentinel + status */}
          {loading && <FeedCardSkeletons count={3} />}
          {!hasMore && feedItems.length >= 20 && <FeedEndMessage />}
          {sentinelRef && hasMore && !loading && (
            <div ref={sentinelRef} className="h-4" />
          )}
        </div>
      ) : friendCount === 0 ? (
        <NoFriendsEmptyState />
      ) : (
        <FriendsNoSessionsEmptyState />
      )}
    </>
  );
}

function NoFriendsEmptyState() {
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
          style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
        >
          Your round starts here.
        </h3>
        <p
          className="max-w-xs mx-auto text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          When your friends crack a cold one, you&rsquo;ll see it here. Maybe
          invite a few?
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Link
          href="/friends"
          className="inline-flex items-center justify-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl transition-all"
          style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
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

function FriendsNoSessionsEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-16 space-y-4"
    >
      <span className="text-6xl block">🪣</span>
      <div className="space-y-2">
        <h3
          className="font-display text-2xl font-bold"
          style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
        >
          The taps are dry over here.
        </h3>
        <p
          className="max-w-xs mx-auto text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Your friends haven&rsquo;t logged any sessions yet. Someone has to go
          first.
        </p>
      </div>
    </motion.div>
  );
}
