"use client";

import { motion } from "motion/react";
import { SessionCard } from "@/components/social/SessionCard";
import { CheckinCard } from "@/components/social/CheckinCard";
import { RatingCard, type FriendRating } from "@/components/social/RatingCard";
import { RatingOnlyRow } from "@/components/social/RatingOnlyRow";
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
import {
  HopRouteFeedCard,
  type HopRouteFeedItem,
} from "@/components/social/HopRouteFeedCard";
import {
  BreweryRatingFeedCard,
  type FriendBreweryReview,
} from "@/components/social/BreweryRatingFeedCard";
import {
  HopRouteCTACard,
  type FriendActiveRoute,
} from "@/components/social/HopRouteCTACard";
import {
  ChallengeFeedCard,
  type FriendChallengeCompletion,
} from "@/components/social/ChallengeFeedCard";
import {
  ChallengeMilestoneFeedCard,
} from "@/components/social/ChallengeMilestoneFeedCard";
import type { FriendChallengeMilestone } from "@/lib/queries/feed";
import type { Session } from "@/types/database";
import { useReactions } from "./ReactionContext";

export type FeedItem =
  | { type: "session"; data: Session; sortDate: string; isLive?: boolean }
  | { type: "rating"; data: FriendRating; sortDate: string }
  | { type: "achievement"; data: FriendAchievement; sortDate: string }
  | { type: "streak"; data: StreakData; sortDate: string }
  | { type: "new_favorite"; data: NewFavoriteItem; sortDate: string }
  | { type: "friend_joined"; data: FriendJoinedItem; sortDate: string }
  | { type: "hop_route_completed"; data: HopRouteFeedItem; sortDate: string }
  | { type: "brewery_review"; data: FriendBreweryReview; sortDate: string }
  | { type: "hop_route_cta"; data: FriendActiveRoute; sortDate: string }
  | { type: "challenge_completion"; data: FriendChallengeCompletion; sortDate: string }
  | { type: "challenge_milestone"; data: FriendChallengeMilestone; sortDate: string };

export type { FriendBreweryReview };

export function FeedItemCard({
  item,
  index,
  currentUserId,
}: {
  item: FeedItem;
  index: number;
  currentUserId: string;
}) {
  const { reactionCounts, userReactions, commentCounts } = useReactions();
  if (item.type === "session") {
    const beerCount = (item.data as any).beer_logs?.length ?? 0;
    // 0 beers = minimal check-in row (Strava kudos style)
    if (beerCount === 0 && !item.isLive) {
      return <CheckinCard session={item.data} index={index} />;
    }
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03, duration: 0.28 }}
        className={item.isLive ? "card-bg-live rounded-[14px]" : "rounded-[14px]"}
      >
        <SessionCard
          session={item.data}
          currentUserId={currentUserId}
          reactionCounts={reactionCounts?.[item.data.id]}
          userReactions={userReactions?.[item.data.id]}
          commentCount={commentCounts?.[item.data.id]}
        />
      </motion.div>
    );
  }

  if (item.type === "rating") {
    // No comment = compact row, with comment = full review card
    if (!item.data.comment) {
      return <RatingOnlyRow rating={item.data} index={index} />;
    }
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

  if (item.type === "hop_route_completed") {
    return <HopRouteFeedCard route={item.data} index={index} currentUserId={currentUserId} />;
  }

  if (item.type === "brewery_review") {
    return <BreweryRatingFeedCard review={item.data} index={index} />;
  }

  if (item.type === "hop_route_cta") {
    return <HopRouteCTACard route={item.data} index={index} />;
  }

  if (item.type === "challenge_completion") {
    return <ChallengeFeedCard completion={item.data} index={index} />;
  }

  if (item.type === "challenge_milestone") {
    return <ChallengeMilestoneFeedCard milestone={item.data} index={index} />;
  }

  return null;
}
