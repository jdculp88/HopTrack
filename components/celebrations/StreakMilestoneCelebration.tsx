// Copyright 2026 HopTrack. All rights reserved.
// Sprint 161 — The Vibe
// Celebration overlay for streak milestones (3, 5, 7, 14, 21, 30, 50, 100).
"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Flame } from "lucide-react";
import { useHaptic } from "@/hooks/useHaptic";

interface StreakMilestoneCelebrationProps {
  show: boolean;
  streakDays: number;
  onDismiss: () => void;
}

// Bigger milestones get bigger celebrations
function getCelebrationTier(days: number): "small" | "medium" | "large" {
  if (days >= 30) return "large";
  if (days >= 7) return "medium";
  return "small";
}

const TIER_CONFIG = {
  small: { particles: 80, color: "#E8841A", hapticPattern: "success" as const },
  medium: { particles: 130, color: "#D4A843", hapticPattern: "celebration" as const },
  large: { particles: 200, color: "#F5C042", hapticPattern: "celebration" as const },
};

export function StreakMilestoneCelebration({
  show,
  streakDays,
  onDismiss,
}: StreakMilestoneCelebrationProps) {
  const { haptic } = useHaptic();
  const tier = getCelebrationTier(streakDays);
  const config = TIER_CONFIG[tier];

  useEffect(() => {
    if (!show) return;

    haptic(config.hapticPattern);

    import("canvas-confetti").then((m) =>
      m.default({
        particleCount: config.particles,
        spread: 80,
        origin: { y: 0.45 },
        colors: [config.color, "#E8841A", "#b7522f", "#fff"],
      })
    );

    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [show, haptic, onDismiss, config]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="streak-milestone-celebration"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{
            background: "rgba(15, 14, 12, 0.85)",
            backdropFilter: "blur(6px)",
          }}
          onClick={onDismiss}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="flex flex-col items-center gap-4 px-10 py-10 rounded-3xl max-w-sm w-full mx-4 relative overflow-hidden"
            style={{
              background: "var(--surface)",
              border: `2px solid ${config.color}`,
              boxShadow: `0 0 80px ${config.color}50`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              animate={{ rotate: [-8, 8, -8], scale: [1, 1.15, 1] }}
              transition={{ duration: 0.5, repeat: 3 }}
              className="flex items-center gap-2"
            >
              <Flame size={24} style={{ color: config.color, fill: config.color }} />
              <p
                className="text-[11px] font-mono uppercase tracking-[0.25em] font-bold"
                style={{ color: config.color }}
              >
                Streak Milestone
              </p>
              <Flame size={24} style={{ color: config.color, fill: config.color }} />
            </motion.div>

            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 400, damping: 20 }}
              className="relative flex flex-col items-center"
            >
              <div
                className="absolute inset-0 blur-3xl rounded-full"
                style={{ background: config.color, opacity: 0.4 }}
              />
              <p
                className="relative font-display font-bold leading-none"
                style={{
                  fontSize: "96px",
                  color: config.color,
                  textShadow: `0 0 40px ${config.color}60`,
                  letterSpacing: "-0.02em",
                }}
              >
                {streakDays}
              </p>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="font-display text-xl font-bold text-center"
              style={{ color: "var(--text-primary)" }}
            >
              {streakDays}-Day Streak!
            </motion.p>

            <p
              className="text-xs text-center"
              style={{ color: "var(--text-muted)" }}
            >
              {streakDays >= 7 ? "Streak freeze earned 🛡️" : "Keep the fire going"}
            </p>

            <p
              className="text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              Tap to dismiss
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
