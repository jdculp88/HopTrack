"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Target, MapPin } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { formatRelativeTime } from "@/lib/utils";
import type { FriendChallengeMilestone } from "@/lib/queries/feed";

export function ChallengeMilestoneFeedCard({
  milestone,
  index,
}: {
  milestone: FriendChallengeMilestone;
  index: number;
}) {
  const progressPct = Math.min(milestone.progress * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.28 }}
      className="card-bg-social rounded-2xl border border-[var(--border)] p-4"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href={`/profile/${milestone.username}`}>
          <UserAvatar
            profile={{
              id: milestone.userId,
              display_name: milestone.displayName,
              avatar_url: milestone.avatarUrl,
            }}
            size="md"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-sm leading-snug" style={{ color: "var(--text-primary)" }}>
            <Link
              href={`/profile/${milestone.username}`}
              className="font-semibold hover:underline"
              style={{ color: "var(--text-primary)" }}
            >
              {milestone.displayName}
            </Link>{" "}
            is {milestone.milestone} through a challenge{" "}
            <Link
              href={`/brewery/${milestone.breweryId}`}
              className="font-medium hover:underline"
              style={{ color: "var(--accent-gold)" }}
            >
              at {milestone.breweryName}
            </Link>
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {formatRelativeTime(milestone.updatedAt)}
          </p>
        </div>
      </div>

      {/* Milestone card */}
      <div className="mt-3 rounded-xl p-3 flex items-center gap-3"
        style={{ background: "color-mix(in srgb, var(--accent-gold) 6%, var(--surface))" }}>
        <span className="text-3xl flex-shrink-0">{milestone.challengeIcon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Target size={12} style={{ color: "var(--accent-gold)" }} />
            <p className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
              {milestone.milestone} Complete
            </p>
          </div>
          <p className="font-display font-bold mt-0.5 truncate" style={{ color: "var(--text-primary)" }}>
            {milestone.challengeName}
          </p>

          {/* Progress bar */}
          <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.6, delay: index * 0.03 + 0.2 }}
              className="h-full rounded-full"
              style={{ background: "var(--accent-gold)" }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
              {milestone.currentProgress}/{milestone.targetValue}
            </span>
            <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
              <MapPin size={10} />
              {milestone.breweryName}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
