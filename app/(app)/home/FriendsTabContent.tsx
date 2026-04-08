"use client";

import type { RefObject } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Compass, UserPlus, Radio, Flame, Beer, Users } from "lucide-react";
import { DrinkingNow } from "@/components/social/DrinkingNow";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { FeedItemCard, type FeedItem } from "./FeedItemCard";
import { FeedCardSkeletons, FeedEndMessage } from "./FeedPaginationUI";
import type { Profile } from "@/types/database";
import { useReactions } from "./ReactionContext";
import { BreweryAdFeedCard } from "@/components/social/BreweryAdFeedCard";
import { useFeedAd } from "@/hooks/useFeedAd";

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
  weeklyBeers,
  currentStreak,
  loading,
  hasMore,
  sentinelRef,
}: {
  profile: Profile | null;
  feedItems: FeedItem[];
  currentUserId: string;
  friendCount: number;
  activeFriendCount: number;
  weeklyBeers?: number;
  currentStreak?: number;
  loading?: boolean;
  hasMore?: boolean;
  sentinelRef?: RefObject<HTMLDivElement | null>;
}) {
  const { reactionCounts: _reactionCounts, userReactions: _userReactions, commentCounts: _commentCounts } = useReactions();
  const feedAd = useFeedAd();

  return (
    <>


      {/* Live Now strip */}
      <DrinkingNow />

      {/* BOTW lives in Discover — nothing here */}

      {/* Feed */}
      {feedItems.length > 0 ? (
        <div className="flex flex-col gap-4">
          {feedItems.map((item, i) => (
            <div key={getFeedItemKey(item, i)}>
              <FeedItemCard
                item={item}
                index={i}
                currentUserId={currentUserId}
              />
              {/* Inject sponsored ad after 3rd feed item */}
              {i === 2 && feedAd && <div className="mt-3"><BreweryAdFeedCard ad={feedAd} /></div>}
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
          className="font-display text-[22px] font-bold tracking-[-0.01em]"
          style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
        >
          Your round starts here.
        </h3>
        <p
          className="max-w-xs mx-auto text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          When your friends crack a cold one, you'll see it here. Maybe
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
            background: "var(--card-bg)",
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
          className="font-display text-[22px] font-bold tracking-[-0.01em]"
          style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
        >
          The taps are dry over here.
        </h3>
        <p
          className="max-w-xs mx-auto text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Your friends haven't logged any sessions yet. Someone has to go
          first.
        </p>
      </div>
    </motion.div>
  );
}
