"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Achievement, AchievementTier } from "@/types/database";

const TIER_STYLES: Record<AchievementTier, { ring: string; glow: string; label: string }> = {
  bronze:   { ring: "ring-[#CD7F32]/40", glow: "shadow-[0_0_12px_rgba(205,127,50,0.3)]",  label: "Bronze" },
  silver:   { ring: "ring-[#C0C0C0]/40", glow: "shadow-[0_0_12px_rgba(192,192,192,0.3)]", label: "Silver" },
  gold:     { ring: "ring-[#FFD700]/40", glow: "shadow-[0_0_12px_rgba(255,215,0,0.4)]",   label: "Gold" },
  platinum: { ring: "ring-[#E5E4E2]/40", glow: "shadow-[0_0_16px_rgba(229,228,226,0.5)]", label: "Platinum" },
};

interface AchievementBadgeProps {
  achievement: Achievement;
  earned?: boolean;
  earnedAt?: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
}

const SIZES = {
  sm: { container: "w-12 h-12", icon: "text-xl", ring: "ring-1" },
  md: { container: "w-16 h-16", icon: "text-2xl", ring: "ring-2" },
  lg: { container: "w-20 h-20", icon: "text-3xl", ring: "ring-2" },
};

export function AchievementBadge({
  achievement,
  earned = false,
  earnedAt,
  size = "md",
  onClick,
  className,
}: AchievementBadgeProps) {
  const tier = TIER_STYLES[achievement.tier];
  const s = SIZES[size];

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={earned ? { scale: 1.05 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
      className={cn("flex flex-col items-center gap-2 cursor-default", onClick && "cursor-pointer", className)}
    >
      <div
        className={cn(
          s.container,
          "rounded-2xl flex items-center justify-center",
          s.ring,
          earned ? [tier.ring, tier.glow] : "ring-[#3A3628]",
          earned ? "" : "opacity-40 grayscale"
        )}
        style={earned ? { background: `${achievement.badge_color}20` } : { background: "var(--surface)" }}
      >
        <span className={cn(s.icon, earned ? "" : "opacity-50")}>{achievement.icon}</span>
      </div>
      {size !== "sm" && (
        <div className="text-center">
          <p className={cn("font-sans text-xs font-medium", earned ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]")}>
            {achievement.name}
          </p>
          <p className="text-[10px]" style={{ color: earned ? achievement.badge_color : "var(--text-muted)" }}>
            {tier.label}
          </p>
        </div>
      )}
    </motion.button>
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
      className="flex items-center gap-4 bg-[var(--surface-2)] border border-[#D4A843]/30 rounded-2xl p-4"
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center ring-2 flex-shrink-0"
        style={{ background: `${achievement.badge_color}20`, boxShadow: `0 0 16px ${achievement.badge_color}40` }}
      >
        <span className={cn("text-3xl", tier.ring)}>{achievement.icon}</span>
      </div>
      <div className="flex-1">
        <p className="text-xs font-mono text-[#D4A843] uppercase tracking-wider mb-0.5">
          Achievement Unlocked!
        </p>
        <p className="font-display font-semibold text-[var(--text-primary)] leading-tight">{achievement.name}</p>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">{achievement.description}</p>
      </div>
      <div className="flex flex-col items-end flex-shrink-0">
        <span className="text-lg font-mono font-bold text-[#D4A843]">+{xpGained}</span>
        <span className="text-xs text-[var(--text-muted)]">XP</span>
      </div>
    </motion.div>
  );
}
