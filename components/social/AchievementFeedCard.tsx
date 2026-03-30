"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { ReactionBar } from "@/components/social/ReactionBar";
import { formatRelativeTime } from "@/lib/dates";
import { AchievementCelebration } from "@/components/achievements/AchievementCelebration";

function isNewAchievement(earnedAt: string): boolean {
  return Date.now() - new Date(earnedAt).getTime() < 5 * 60 * 1000;
}

export interface FriendAchievement {
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
  profile: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
}

const TIER_COLORS: Record<string, string> = {
  bronze: "#CD7F32",
  silver: "#A8A8A8",
  gold: "var(--accent-gold)",
  platinum: "#B0C4DE",
};

export function AchievementFeedCard({
  achievement,
  index = 0,
  reactionCounts,
  userReactions,
}: {
  achievement: FriendAchievement;
  index?: number;
  reactionCounts?: Record<string, number>;
  userReactions?: string[];
}) {
  const tierColor = TIER_COLORS[achievement.achievement.tier] ?? "var(--accent-gold)";
  const [showCelebration, setShowCelebration] = useState(() =>
    isNewAchievement(achievement.earned_at)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="rounded-2xl p-5"
      role="article"
      aria-label={`${achievement.profile.display_name || achievement.profile.username} earned ${achievement.achievement.name}`}
      style={{
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--accent-gold) 10%, var(--surface)), var(--surface))",
        border: "1px solid color-mix(in srgb, var(--accent-gold) 20%, transparent)",
      }}
    >
      <AchievementCelebration
        show={showCelebration}
        icon={achievement.achievement.icon}
        name={achievement.achievement.name}
        tier={achievement.achievement.tier}
        xpReward={achievement.achievement.xp_reward}
        onDismiss={() => setShowCelebration(false)}
      />

      {/* Header row */}
      <div className="flex items-center gap-3 mb-4">
        <Link href={`/profile/${achievement.profile.username}`}>
          <UserAvatar profile={achievement.profile as any} size="sm" />
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            href={`/profile/${achievement.profile.username}`}
            className="font-sans font-semibold text-sm hover:underline"
            style={{ color: "var(--text-primary)" }}
          >
            {achievement.profile.display_name || achievement.profile.username}
          </Link>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {formatRelativeTime(achievement.earned_at)}
          </p>
        </div>
      </div>

      {/* Achievement content */}
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
          style={{
            background: `color-mix(in srgb, var(--accent-gold) 12%, transparent)`,
          }}
        >
          {achievement.achievement.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="font-display text-base font-semibold leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {achievement.achievement.name}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full font-semibold"
              style={{
                background: `color-mix(in srgb, ${tierColor} 15%, transparent)`,
                color: tierColor,
              }}
            >
              {achievement.achievement.tier}
            </span>
            <span
              className="flex items-center gap-1 text-[10px] font-mono"
              style={{ color: "var(--accent-gold)" }}
            >
              <Zap size={10} />
              +{achievement.achievement.xp_reward} XP
            </span>
          </div>
        </div>
      </div>

      {/* Reaction footer */}
      <ReactionBar
        reactionCounts={reactionCounts}
        userReactions={userReactions}
        showShare={false}
      />
    </motion.div>
  );
}
