"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { TIER_STYLES } from "@/lib/constants/tiers";
import type { Achievement, AchievementTier } from "@/types/database";

interface AchievementBadgeProps {
  achievement: Achievement;
  earned?: boolean;
  earnedAt?: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
  /** 0-100 progress toward unlock (Sprint 169) */
  progress?: number;
  /** Rarity label (Sprint 169) */
  rarityPercent?: number;
}

const SIZES = {
  sm: { container: "w-12 h-12", icon: "text-xl", ring: "ring-1" },
  md: { container: "w-16 h-16", icon: "text-2xl", ring: "ring-2" },
  lg: { container: "w-20 h-20", icon: "text-3xl", ring: "ring-2" },
};

function getRarityLabel(percent: number): { label: string; color: string } {
  if (percent <= 5) return { label: "Legendary", color: "var(--amber, #C4883E)" };
  if (percent <= 20) return { label: "Rare", color: "#8BAABF" };
  if (percent <= 50) return { label: "Uncommon", color: "#3D7A52" };
  return { label: "Common", color: "var(--text-muted)" };
}

export function AchievementBadge({
  achievement,
  earned = false,
  earnedAt: _earnedAt,
  size = "md",
  onClick,
  className,
  progress,
  rarityPercent,
}: AchievementBadgeProps) {
  const tier = TIER_STYLES[achievement.tier];
  const s = SIZES[size];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("flex flex-col items-center gap-2 cursor-default", onClick && "cursor-pointer", className)}
    >
      <motion.div
        whileHover={earned ? { scale: 1.05 } : undefined}
        whileTap={onClick ? { scale: 0.95 } : undefined}
        className="h-full flex flex-col items-center gap-2"
      >
        <div className="relative">
          {/* SVG progress ring for locked achievements (Sprint 169) */}
          {!earned && progress !== undefined && progress > 0 && progress < 100 && (
            <svg
              className="absolute inset-0 -m-1"
              style={{ width: "calc(100% + 8px)", height: "calc(100% + 8px)" }}
              viewBox="0 0 44 44"
            >
              {/* Track */}
              <circle cx="22" cy="22" r="20" fill="none" stroke="var(--border)" strokeWidth="2" opacity="0.4" />
              {/* Progress arc */}
              <motion.circle
                cx="22" cy="22" r="20"
                fill="none"
                stroke={tier.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 20}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - progress / 100) }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
              />
            </svg>
          )}
          {/* "NEW" badge for recently earned (within 7 days) */}
          {earned && _earnedAt && (Date.now() - new Date(_earnedAt).getTime() < 7 * 24 * 60 * 60 * 1000) && (
            <span
              className="absolute -top-1.5 -right-1.5 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full uppercase z-10"
              style={{ background: "#3498DB", color: "#fff" }}
            >
              NEW
            </span>
          )}
          <div
            className={cn(
              s.container,
              "rounded-full flex items-center justify-center flex-shrink-0",
              earned ? "" : "opacity-40 grayscale"
            )}
            style={earned
              ? {
                  background: `color-mix(in srgb, ${tier.color} 10%, transparent)`,
                  border: `2.5px solid ${tier.color}`,
                  boxShadow: `0 0 12px color-mix(in srgb, ${tier.color} 20%, transparent)`,
                }
              : {
                  background: "var(--card-bg)",
                  border: "2px dashed var(--border)",
                }}
          >
            <span className={cn(s.icon, earned ? "" : "opacity-50")}>{achievement.icon}</span>
          </div>
        </div>
        {size !== "sm" && (
          <div className="text-center flex-1 flex flex-col justify-between">
            <p className={cn("font-sans text-xs font-medium leading-tight", earned ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]")}>
              {achievement.name}
            </p>
            <p className="text-[10px] mt-1" style={{ color: earned ? achievement.badge_color : "var(--text-muted)" }}>
              {tier.label}
            </p>
            {/* Rarity label (Sprint 169) */}
            {rarityPercent !== undefined && earned && (
              <p className="text-[9px] font-mono mt-0.5" style={{ color: getRarityLabel(rarityPercent).color }}>
                {getRarityLabel(rarityPercent).label} · {rarityPercent}%
              </p>
            )}
            {/* Progress text for locked (Sprint 169) */}
            {!earned && progress !== undefined && progress > 0 && (
              <p className="text-[9px] font-mono mt-0.5 text-[var(--text-muted)]">
                {progress}%
              </p>
            )}
          </div>
        )}
      </motion.div>
    </button>
  );
}

// Achievement unlock celebration card
interface AchievementUnlockProps {
  achievement: Achievement;
  xpGained: number;
}

export function AchievementUnlock({ achievement, xpGained }: AchievementUnlockProps) {
  const tier = TIER_STYLES[achievement.tier];
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
      className="flex items-center gap-4 bg-[var(--surface-2)] border border-[var(--accent-gold)]/30 rounded-[14px] p-4"
    >
      <div
        className="w-14 h-14 rounded-[14px] flex items-center justify-center ring-2 flex-shrink-0"
        style={{ background: `${achievement.badge_color}20`, boxShadow: `0 0 16px ${achievement.badge_color}40` }}
      >
        <span className={cn("text-3xl", tier.ring)}>{achievement.icon}</span>
      </div>
      <div className="flex-1">
        <p className="text-xs font-mono text-[var(--accent-gold)] uppercase tracking-wider mb-0.5">
          Achievement Unlocked!
        </p>
        <p className="font-display font-semibold text-[var(--text-primary)] leading-tight">{achievement.name}</p>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">{achievement.description}</p>
      </div>
      <div className="flex flex-col items-end flex-shrink-0">
        <span className="text-lg font-mono font-bold text-[var(--accent-gold)]">+{xpGained}</span>
        <span className="text-xs text-[var(--text-muted)]">XP</span>
      </div>
    </motion.div>
  );
}
