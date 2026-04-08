"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { formatRelativeTime } from "@/lib/dates";
import { AchievementCelebration } from "@/components/achievements/AchievementCelebration";
import { Tag } from "@/components/ui/Tag";
import { getFirstName } from "@/lib/first-name";
import { TIER_COLORS } from "@/lib/constants/tiers";
import { spring } from "@/lib/animation";

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


export function AchievementFeedCard({
  achievement,
}: {
  achievement: FriendAchievement;
  index?: number;
  reactionCounts?: Record<string, number>;
  userReactions?: string[];
}) {
  const tier = achievement.achievement.tier;
  const tierColor = TIER_COLORS[tier] ?? "var(--badge-gold)";

  const achievementIcon = achievement.achievement.icon;
  const [showCelebration, setShowCelebration] = useState(() =>
    isNewAchievement(achievement.earned_at)
  );
  const firstName = getFirstName(achievement.profile.display_name, achievement.profile.username);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={spring.default}
      role="article"
      aria-label={`${achievement.profile.display_name || achievement.profile.username} earned ${achievement.achievement.name}`}
      className="rounded-[14px] overflow-hidden relative shadow-[var(--shadow-card)]"
      style={{
        background: "linear-gradient(135deg, rgba(45,143,78,0.05), rgba(232,168,56,0.04))",
        border: "1px solid rgba(45,143,78,0.12)",
      }}
      data-tier={tier}
    >
      <AchievementCelebration
        show={showCelebration}
        icon={achievementIcon}
        name={achievement.achievement.name}
        tier={achievement.achievement.tier}
        xpReward={achievement.achievement.xp_reward}
        onDismiss={() => setShowCelebration(false)}
      />

      <div className="flex gap-3 items-start p-3">
        {/* Icon container */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `color-mix(in srgb, ${tierColor} 12%, var(--surface-2))` }}
        >
          <span className="text-lg leading-none">{achievementIcon}</span>
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
            <span
              className="font-display font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {achievement.achievement.name}
            </span>
          </p>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <Tag color={tierColor} className="uppercase">
              {tier}
            </Tag>
            <span
              className="flex items-center gap-1 text-[10px] font-mono font-medium"
              style={{ color: "var(--success)" }}
            >
              ◆ +{achievement.achievement.xp_reward} XP
            </span>
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              {formatRelativeTime(achievement.earned_at)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
