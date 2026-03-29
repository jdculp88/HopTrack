"use client";

import type { RefObject } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Compass, UserPlus } from "lucide-react";
import { DrinkingNow } from "@/components/social/DrinkingNow";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { FeedItemCard, type FeedItem } from "./FeedItemCard";
import { FeedLoadingSpinner, FeedEndMessage } from "./FeedPaginationUI";
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

      {/* BOTW compact banner */}
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
            <div key={getFeedItemKey(item, i)}>
              <FeedItemCard
                item={item}
                index={i}
                currentUserId={currentUserId}
              />
            </div>
          ))}

          {/* Pagination sentinel + status */}
          {loading && <FeedLoadingSpinner />}
          {!hasMore && feedItems.length >= 20 && <FeedEndMessage />}
          {sentinelRef && hasMore && !loading && (
            <div ref={sentinelRef} className="h-4" />
          )}
        </div>
      ) : (
        <FriendsEmptyState />
      )}
    </>
  );
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
