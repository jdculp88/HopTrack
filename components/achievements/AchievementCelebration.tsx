"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Zap } from "lucide-react";

interface AchievementCelebrationProps {
  show: boolean;
  icon: string;
  name: string;
  tier: string;
  xpReward: number;
  onDismiss: () => void;
}

const TIER_COLORS: Record<string, string> = {
  bronze: "#CD7F32",
  silver: "#A8A8A8",
  gold: "var(--accent-gold)",
  platinum: "#B0C4DE",
};

export function AchievementCelebration({
  show,
  icon,
  name,
  tier,
  xpReward,
  onDismiss,
}: AchievementCelebrationProps) {
  const tierColor = TIER_COLORS[tier] ?? "var(--accent-gold)";

  // Fire confetti + haptic on mount
  useEffect(() => {
    if (!show) return;

    // Haptic
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([40, 60, 80]);
    }

    // Confetti burst
    import("canvas-confetti").then((m) =>
      m.default({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.45 },
        colors: ["#D4A843", "#E8841A", "#b7522f", "#fff"],
      })
    );

    // Auto-dismiss after 3 seconds
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [show, onDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="achievement-celebration"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(15, 14, 12, 0.75)", backdropFilter: "blur(4px)" }}
          onClick={onDismiss}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="flex flex-col items-center gap-4 px-8 py-10 rounded-3xl max-w-xs w-full mx-4"
            style={{ background: "var(--surface)", border: `2px solid ${tierColor}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs font-mono uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Achievement Unlocked
            </p>
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: 2, duration: 0.4 }}
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl"
              style={{ background: `color-mix(in srgb, ${tierColor} 15%, transparent)` }}
            >
              {icon}
            </motion.div>
            <p className="font-display text-2xl font-bold text-center" style={{ color: "var(--text-primary)" }}>
              {name}
            </p>
            <div className="flex items-center gap-3">
              <span
                className="text-[11px] font-mono uppercase tracking-wider px-3 py-1 rounded-full font-semibold"
                style={{ background: `color-mix(in srgb, ${tierColor} 15%, transparent)`, color: tierColor }}
              >
                {tier}
              </span>
              <span className="flex items-center gap-1 text-sm font-mono" style={{ color: "var(--accent-gold)" }}>
                <Zap size={13} />+{xpReward} XP
              </span>
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Tap to dismiss</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
