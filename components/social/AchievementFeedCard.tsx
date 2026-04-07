"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { formatRelativeTime } from "@/lib/dates";
import { AchievementCelebration } from "@/components/achievements/AchievementCelebration";
import { EmojiPulse } from "@/components/social/EmojiPulse";
import { FeedCardWrapper } from "@/components/social/FeedCardWrapper";
import { getFirstName } from "@/lib/first-name";
import { TIER_COLORS } from "@/lib/constants/tiers";

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
    <FeedCardWrapper
      accentColor={tierColor}
      icon={
        <span className="text-xl leading-none">{achievementIcon}</span>
      }
      ariaLabel={`${achievement.profile.display_name || achievement.profile.username} earned ${achievement.achievement.name}`}
      bgClass="card-bg-achievement"
      backgroundStyle={{
        background: `linear-gradient(135deg, color-mix(in srgb, ${tierColor} 8%, var(--card-bg)), var(--card-bg))`,
        border: `1px solid color-mix(in srgb, ${tierColor} 20%, var(--border))`,
      }}
      dataTier={tier}
    >
      <AchievementCelebration
        show={showCelebration}
        icon={achievementIcon}
        name={achievement.achievement.name}
        tier={achievement.achievement.tier}
        xpReward={achievement.achievement.xp_reward}
        onDismiss={() => setShowCelebration(false)}
      />
      <div className="px-4 py-3">
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
          <span
            className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full font-bold"
            style={{
              background: `color-mix(in srgb, ${tierColor} 18%, transparent)`,
              color: tierColor,
            }}
          >
            {tier}
          </span>
          <span
            className="flex items-center gap-0.5 text-[10px] font-mono font-medium"
            style={{ color: "var(--accent-gold)" }}
          >
            <Zap size={9} />+{achievement.achievement.xp_reward} XP
          </span>
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            {formatRelativeTime(achievement.earned_at)}
          </span>
        </div>
        <EmojiPulse itemKey={`achievement-${achievement.achievement.id}`} />
      </div>
    </FeedCardWrapper>
  );
}
