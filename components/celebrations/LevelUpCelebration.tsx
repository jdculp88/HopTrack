// Copyright 2026 HopTrack. All rights reserved.
// Sprint 161 — The Vibe
// Celebration overlay for level-up milestones.
"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TrendingUp } from "lucide-react";
import { useHaptic } from "@/hooks/useHaptic";

interface LevelUpCelebrationProps {
  show: boolean;
  newLevel: number;
  levelName: string;
  onDismiss: () => void;
}

export function LevelUpCelebration({
  show,
  newLevel,
  levelName,
  onDismiss,
}: LevelUpCelebrationProps) {
  const { haptic } = useHaptic();

  useEffect(() => {
    if (!show) return;

    haptic("celebration");

    import("canvas-confetti").then((m) => {
      // Double burst for level-up
      m.default({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 },
        colors: ["#D4A843", "#E8841A", "#F5C042", "#fff"],
      });
      setTimeout(() => {
        m.default({
          particleCount: 80,
          spread: 70,
          angle: 60,
          origin: { x: 0.2, y: 0.6 },
          colors: ["#D4A843", "#E8841A", "#fff"],
        });
        m.default({
          particleCount: 80,
          spread: 70,
          angle: 120,
          origin: { x: 0.8, y: 0.6 },
          colors: ["#D4A843", "#E8841A", "#fff"],
        });
      }, 250);
    });

    const timer = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timer);
  }, [show, haptic, onDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="level-up-celebration"
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
              border: "2px solid var(--accent-gold)",
              boxShadow: "0 0 100px color-mix(in srgb, var(--accent-gold) 40%, transparent)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: 2 }}
              className="flex items-center gap-2"
            >
              <TrendingUp size={22} style={{ color: "var(--accent-gold)" }} />
              <p
                className="text-[11px] font-mono uppercase tracking-[0.25em] font-bold"
                style={{ color: "var(--accent-gold)" }}
              >
                Level Up
              </p>
              <TrendingUp size={22} style={{ color: "var(--accent-gold)" }} />
            </motion.div>

            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 400, damping: 20 }}
              className="relative"
            >
              <div
                className="absolute inset-0 rounded-full blur-2xl"
                style={{ background: "var(--accent-gold)", opacity: 0.5 }}
              />
              <div
                className="relative w-28 h-28 rounded-full flex flex-col items-center justify-center"
                style={{
                  background: "color-mix(in srgb, var(--accent-gold) 20%, var(--surface))",
                  border: "3px solid var(--accent-gold)",
                }}
              >
                <p
                  className="text-[9px] font-mono uppercase tracking-widest"
                  style={{ color: "var(--text-muted)" }}
                >
                  Level
                </p>
                <p
                  className="font-display font-bold leading-none"
                  style={{ fontSize: "52px", color: "var(--accent-gold)" }}
                >
                  {newLevel}
                </p>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="font-display text-2xl font-bold text-center"
              style={{ color: "var(--text-primary)" }}
            >
              {levelName}
            </motion.p>

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
