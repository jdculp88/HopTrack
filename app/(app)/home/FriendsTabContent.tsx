"use client";

import type { RefObject } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Compass, UserPlus, Radio } from "lucide-react";
import { DrinkingNow } from "@/components/social/DrinkingNow";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { FeedItemCard, type FeedItem } from "./FeedItemCard";
import { FeedCardSkeletons, FeedEndMessage } from "./FeedPaginationUI";
import type { Profile } from "@/types/database";
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

export function FriendsTabContent({
  profile,
  feedItems,
  currentUserId,
  friendCount,
  activeFriendCount,
  loading,
  hasMore,
  sentinelRef,
}: {
  profile: Profile | null;
  feedItems: FeedItem[];
  currentUserId: string;
  friendCount: number;
  activeFriendCount: number;
  loading?: boolean;
  hasMore?: boolean;
  sentinelRef?: RefObject<HTMLDivElement | null>;
}) {
  const { reactionCounts, userReactions, commentCounts } = useReactions();

  return (
    <>
      {/* Compact context bar: avatar + friend count + live pulse */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: avatar + name */}
        {profile && (
          <Link href={`/profile/${profile.username}`} className="flex items-center gap-2.5 min-w-0">
            <UserAvatar profile={profile} size="sm" />
            <span
              className="text-sm font-semibold truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {(profile.display_name || profile.username).split(" ")[0]}
            </span>
          </Link>
        )}

        {/* Right: live count or friend count */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {activeFriendCount > 0 ? (
            <>
              <Radio size={11} style={{ color: "var(--accent-gold)" }} />
              <span className="text-[11px] font-mono" style={{ color: "var(--accent-gold)" }}>
                {activeFriendCount} live now
              </span>
            </>
          ) : (
            <span className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>
              {friendCount} friend{friendCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Live Now strip */}
      <DrinkingNow />

      {/* BOTW lives in Discover — nothing here */}

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
