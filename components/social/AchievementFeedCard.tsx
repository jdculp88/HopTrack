"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
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
  const firstName =
    (achievement.profile.display_name || achievement.profile.username).split(" ")[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="rounded-xl px-4 py-3 flex items-center gap-3"
      role="article"
      aria-label={`${achievement.profile.display_name || achievement.profile.username} earned ${achievement.achievement.name}`}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
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

      {/* Achievement icon badge */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{
          background: `color-mix(in srgb, ${tierColor} 12%, var(--surface-2))`,
        }}
      >
        {achievement.achievement.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug" style={{ color: "var(--text-primary)" }}>
          <Link
            href={`/profile/${achievement.profile.username}`}
            className="font-semibold hover:underline underline-offset-2"
          >
            {firstName}
          </Link>
          <span style={{ color: "var(--text-muted)" }}> earned </span>
          <span className="font-semibold">{achievement.achievement.name}</span>
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold"
            style={{
              background: `color-mix(in srgb, ${tierColor} 15%, transparent)`,
              color: tierColor,
            }}
          >
            {achievement.achievement.tier}
          </span>
          <span
            className="flex items-center gap-0.5 text-[10px] font-mono"
            style={{ color: "var(--accent-gold)" }}
          >
            <Zap size={9} />
            +{achievement.achievement.xp_reward} XP
          </span>
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            · {formatRelativeTime(achievement.earned_at)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
