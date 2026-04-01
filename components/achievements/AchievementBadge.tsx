"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Achievement, AchievementTier } from "@/types/database";

const TIER_STYLES: Record<AchievementTier, { ring: string; glow: string; label: string; color: string }> = {
  bronze:   { ring: "ring-2",  glow: "shadow-[0_0_12px_rgba(160,120,80,0.3)]",  label: "Bronze",   color: "var(--badge-bronze)" },
  silver:   { ring: "ring-2",  glow: "shadow-[0_0_12px_rgba(138,144,152,0.3)]", label: "Silver",   color: "var(--badge-silver)" },
  gold:     { ring: "ring-2",  glow: "shadow-[0_0_12px_rgba(200,148,58,0.4)]",  label: "Gold",     color: "var(--badge-gold)" },
  platinum: { ring: "ring-2",  glow: "shadow-[0_0_16px_rgba(139,170,191,0.5)]", label: "Platinum", color: "#8BAABF" },
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
  earnedAt: _earnedAt,
  size = "md",
  onClick,
  className,
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
        <div
          className={cn(
            s.container,
            "rounded-2xl flex items-center justify-center flex-shrink-0 ring-2",
            earned ? tier.glow : "",
            earned ? "" : "opacity-40 grayscale"
          )}
          style={earned
            ? {
                background: `color-mix(in srgb, ${tier.color} 12%, transparent)`,
                outline: `2px solid color-mix(in srgb, ${tier.color} 35%, transparent)`,
                outlineOffset: "2px",
              }
            : { background: "var(--surface)", outline: "2px solid var(--border)", outlineOffset: "2px" }}
        >
          <span className={cn(s.icon, earned ? "" : "opacity-50")}>{achievement.icon}</span>
        </div>
        {size !== "sm" && (
          <div className="text-center flex-1 flex flex-col justify-between">
            <p className={cn("font-sans text-xs font-medium leading-tight", earned ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]")}>
              {achievement.name}
            </p>
            <p className="text-[10px] mt-1" style={{ color: earned ? achievement.badge_color : "var(--text-muted)" }}>
              {tier.label}
            </p>
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
      className="flex items-center gap-4 bg-[var(--surface-2)] border border-[var(--accent-gold)]/30 rounded-2xl p-4"
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center ring-2 flex-shrink-0"
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
