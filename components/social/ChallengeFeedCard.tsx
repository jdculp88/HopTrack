"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Trophy, MapPin } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { formatRelativeTime } from "@/lib/utils";
import { EmojiPulse } from "@/components/social/EmojiPulse";

export interface FriendChallengeCompletion {
  id: string;
  completedAt: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  challengeName: string;
  challengeIcon: string;
  rewardXp: number;
  rewardDescription: string | null;
  breweryName: string;
  breweryId: string;
}

export function ChallengeFeedCard({
  completion,
  index,
}: {
  completion: FriendChallengeCompletion;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.28 }}
      className="card-bg-achievement rounded-[14px] border border-[var(--border)] p-4"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href={`/profile/${completion.username}`}>
          <UserAvatar
            profile={{
              id: completion.userId,
              display_name: completion.displayName,
              avatar_url: completion.avatarUrl,
            }}
            size="md"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-sm leading-snug" style={{ color: "var(--text-primary)" }}>
            <Link
              href={`/profile/${completion.username}`}
              className="font-semibold hover:underline"
              style={{ color: "var(--text-primary)" }}
            >
              {completion.displayName}
            </Link>{" "}
            completed a challenge{" "}
            <Link
              href={`/brewery/${completion.breweryId}`}
              className="font-medium hover:underline"
              style={{ color: "var(--accent-gold)" }}
            >
              at {completion.breweryName}
            </Link>
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {formatRelativeTime(completion.completedAt)}
          </p>
        </div>
      </div>

      {/* Challenge card */}
      <div className="mt-3 rounded-xl p-3 flex items-center gap-3"
        style={{ background: "color-mix(in srgb, var(--accent-gold) 8%, var(--surface))" }}>
        <span className="text-3xl flex-shrink-0">{completion.challengeIcon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Trophy size={12} style={{ color: "var(--accent-gold)" }} />
            <p className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
              Challenge Complete
            </p>
          </div>
          <p className="font-display font-bold mt-0.5 truncate" style={{ color: "var(--text-primary)" }}>
            {completion.challengeName}
          </p>
          <div className="flex items-center gap-3 mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
            {completion.rewardDescription && <span>🎁 {completion.rewardDescription}</span>}
            {!completion.rewardDescription && completion.rewardXp > 0 && (
              <span>⭐ +{completion.rewardXp} XP</span>
            )}
            <span className="flex items-center gap-1">
              <MapPin size={10} />
              {completion.breweryName}
            </span>
          </div>
        </div>
      </div>
      <EmojiPulse itemKey={`challenge-${completion.id}`} />
    </motion.div>
  );
}
