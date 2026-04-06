"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Lock } from "lucide-react";
import { AchievementBadge } from "@/components/achievements/AchievementBadge";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import type { AchievementCategory, AchievementTier } from "@/types/database";

const CATEGORIES: { key: AchievementCategory | "all"; label: string; emoji: string }[] = [
  { key: "all",      label: "All",      emoji: "🏆" },
  { key: "explorer", label: "Explorer", emoji: "🗺️" },
  { key: "variety",  label: "Variety",  emoji: "🍺" },
  { key: "quantity", label: "Quantity", emoji: "📊" },
  { key: "social",   label: "Social",   emoji: "👥" },
  { key: "time",     label: "Time",     emoji: "⏰" },
  { key: "quality",  label: "Quality",  emoji: "⭐" },
];

const TIER_ORDER: Record<AchievementTier, number> = {
  bronze: 0, silver: 1, gold: 2, platinum: 3,
};

interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  badge_color: string;
  tier: AchievementTier;
  category: AchievementCategory;
  earned: boolean;
  earned_at: string | null;
}

interface AchievementsClientProps {
  achievements: Achievement[];
  totalEarned: number;
  total: number;
}

export function AchievementsClient({ achievements, totalEarned, total }: AchievementsClientProps) {
  const [category, setCategory] = useState<AchievementCategory | "all">("all");
  const [selected, setSelected] = useState<Achievement | null>(null);
  const progress = Math.round((totalEarned / total) * 100);

  const filtered = achievements
    .filter((a) => category === "all" || a.category === category)
    .sort((a, b) => {
      // Earned first, then by tier
      if (a.earned !== b.earned) return a.earned ? -1 : 1;
      return TIER_ORDER[b.tier] - TIER_ORDER[a.tier];
    });

  const earnedInCategory = filtered.filter((a) => a.earned).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">Achievements</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">{totalEarned} of {total} unlocked</p>
      </div>

      {/* Progress bar */}
      <Card bgClass="card-bg-stats" padding="spacious" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-[var(--accent-gold)]" />
            <span className="font-sans font-semibold text-[var(--text-primary)] text-sm">Overall Progress</span>
          </div>
          <span className="font-mono text-[var(--accent-gold)] font-bold">{progress}%</span>
        </div>
        <div className="h-2 bg-[var(--surface-2)] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="h-full bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-amber)] rounded-full"
          />
        </div>
        {/* Tier breakdown */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          {(["bronze", "silver", "gold", "platinum"] as AchievementTier[]).map((tier) => {
            const tierAchievements = achievements.filter((a) => a.tier === tier);
            const tierEarned = tierAchievements.filter((a) => a.earned).length;
            const colors: Record<AchievementTier, string> = {
              bronze: "var(--badge-bronze)", silver: "var(--badge-silver)", gold: "var(--badge-gold)", platinum: "#8BAABF",
            };
            return (
              <div key={tier} className="text-center">
                <p className="font-mono font-bold text-sm" style={{ color: colors[tier] }}>
                  {tierEarned}/{tierAchievements.length}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] capitalize">{tier}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map(({ key, label, emoji }) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all border ${
              category === key
                ? "bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] border-[var(--accent-gold)]/30"
                : "bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[#6B6456]"
            }`}
          >
            <span>{emoji}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Count in view */}
      <p className="text-xs text-[var(--text-muted)] font-mono">
        {earnedInCategory} / {filtered.length} in this category
      </p>

      {/* Achievement grid */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="text-center py-12"
        >
          <p className="text-3xl mb-3">{CATEGORIES.find(c => c.key === category)?.emoji ?? "🏆"}</p>
          <p className="font-display text-base text-[var(--text-primary)]">No achievements in this category yet</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Keep exploring to unlock badges here</p>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((achievement, i) => (
              <motion.div
                key={achievement.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: i * 0.02, type: "spring", stiffness: 300, damping: 25 }}
              >
                <AchievementBadge
                  achievement={achievement}
                  earned={achievement.earned}
                  earnedAt={achievement.earned_at ?? undefined}
                  size="md"
                  onClick={() => setSelected(achievement)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Achievement detail modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        size="sm"
      >
        {selected && (
          <div className="p-6 space-y-5">
            <div className="flex flex-col items-center gap-4 text-center">
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center ring-2"
                style={{
                  background: `${selected.badge_color}20`,
                  outline: `2px solid ${selected.earned ? selected.badge_color : "var(--border)"}`,
                  outlineOffset: "0px",
                  opacity: selected.earned ? 1 : 0.5,
                  filter: selected.earned ? "none" : "grayscale(1)",
                }}
              >
                <span className="text-4xl">{selected.icon}</span>
              </div>

              <div>
                <p
                  className="text-xs font-mono uppercase tracking-wider mb-1"
                  style={{ color: selected.badge_color }}
                >
                  {selected.tier} · {selected.category}
                </p>
                <h3 className="font-display text-2xl font-bold text-[var(--text-primary)]">{selected.name}</h3>
                <p className="text-[var(--text-secondary)] text-sm mt-2 leading-relaxed">{selected.description}</p>
              </div>

              <div className="flex items-center gap-2 bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20 px-4 py-2 rounded-full">
                <span className="text-[var(--accent-gold)] font-mono font-bold">+{selected.xp_reward} XP</span>
              </div>

              {selected.earned ? (
                <div className="w-full bg-[#3D7A52]/10 border border-[#3D7A52]/30 rounded-2xl px-4 py-3 text-center">
                  <p className="text-sm text-[#3D7A52] font-medium">✓ Unlocked!</p>
                  {selected.earned_at && (
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{formatDate(selected.earned_at)}</p>
                  )}
                </div>
              ) : (
                <div className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl px-4 py-3 text-center flex items-center justify-center gap-2">
                  <Lock size={14} className="text-[var(--text-muted)]" />
                  <p className="text-sm text-[var(--text-muted)]">Not yet unlocked</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
