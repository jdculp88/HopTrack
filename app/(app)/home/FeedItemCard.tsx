"use client";

import { motion } from "framer-motion";
import { SessionCard } from "@/components/social/SessionCard";
import { RatingCard, type FriendRating } from "@/components/social/RatingCard";
import {
  AchievementFeedCard,
  type FriendAchievement,
} from "@/components/social/AchievementFeedCard";
import {
  StreakFeedCard,
  type StreakData,
} from "@/components/social/StreakFeedCard";
import {
  NewFavoriteCard,
  type NewFavoriteItem,
} from "@/components/social/NewFavoriteCard";
import {
  FriendJoinedCard,
  type FriendJoinedItem,
} from "@/components/social/FriendJoinedCard";
import type { Session } from "@/types/database";

export type FeedItem =
  | { type: "session"; data: Session; sortDate: string; isLive?: boolean }
  | { type: "rating"; data: FriendRating; sortDate: string }
  | { type: "achievement"; data: FriendAchievement; sortDate: string }
  | { type: "streak"; data: StreakData; sortDate: string }
  | { type: "new_favorite"; data: NewFavoriteItem; sortDate: string }
  | { type: "friend_joined"; data: FriendJoinedItem; sortDate: string };

export function FeedItemCard({
  item,
  index,
  currentUserId,
  reactionCounts,
  userReactions,
  commentCounts,
}: {
  item: FeedItem;
  index: number;
  currentUserId: string;
  reactionCounts?: Record<string, Record<string, number>>;
  userReactions?: Record<string, string[]>;
  commentCounts?: Record<string, number>;
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
          reactionCounts={reactionCounts?.[(item.data as any).id]}
          userReactions={userReactions?.[(item.data as any).id]}
          commentCount={commentCounts?.[(item.data as any).id]}
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
