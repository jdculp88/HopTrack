// Copyright 2026 HopTrack. All rights reserved.
// Sprint 161 — The Vibe
// Celebration overlay for lucky (2×) and golden (5×) XP tier reveals.
"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Sparkles, Zap } from "lucide-react";
import { useHaptic } from "@/hooks/useHaptic";

interface XpTierCelebrationProps {
  show: boolean;
  tier: "lucky" | "golden";
  multiplier: number;
  baseXp: number;
  finalXp: number;
  onDismiss: () => void;
}

const TIER_CONFIG = {
  lucky: {
    label: "LUCKY SESSION",
    accentColor: "#E8841A", // amber
    particleCount: 120,
    particleColors: ["#E8841A", "#D4A843", "#F5C042", "#fff"],
    hapticPattern: "success" as const,
    glowRadius: "80px",
  },
  golden: {
    label: "GOLDEN SESSION",
    accentColor: "#F5C042", // bright gold
    particleCount: 200,
    particleColors: ["#F5C042", "#D4A843", "#FFE169", "#E8841A", "#fff"],
    hapticPattern: "celebration" as const,
    glowRadius: "120px",
  },
};

export function XpTierCelebration({
  show,
  tier,
  multiplier,
  baseXp,
  finalXp,
  onDismiss,
}: XpTierCelebrationProps) {
  const { haptic } = useHaptic();
  const config = TIER_CONFIG[tier];

  useEffect(() => {
    if (!show) return;

    // Haptic feedback
    haptic(config.hapticPattern);

    // Confetti burst
    import("canvas-confetti").then((m) =>
      m.default({
        particleCount: config.particleCount,
        spread: tier === "golden" ? 100 : 80,
        origin: { y: 0.45 },
        colors: config.particleColors,
        ticks: tier === "golden" ? 300 : 200,
      })
    );

    // Auto-dismiss after 3.5 seconds (golden gets a bit longer to savor)
    const timer = setTimeout(onDismiss, tier === "golden" ? 3800 : 3200);
    return () => clearTimeout(timer);
  }, [show, tier, haptic, onDismiss, config]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={`xp-tier-${tier}`}
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
          {/* Shimmer layer — golden only */}
          {tier === "golden" && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.35, 0, 0.25, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{
                background: `radial-gradient(circle at 50% 40%, ${config.accentColor}40 0%, transparent 60%)`,
              }}
            />
          )}

          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 40, rotateX: -30 }}
            animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
            className="flex flex-col items-center gap-5 px-10 py-12 rounded-3xl max-w-sm w-full mx-4 relative overflow-hidden"
            style={{
              background: "var(--surface)",
              border: `2px solid ${config.accentColor}`,
              boxShadow: `0 0 ${config.glowRadius} ${config.accentColor}80, 0 0 40px ${config.accentColor}40`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Inner glow background */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 30%, ${config.accentColor}20 0%, transparent 70%)`,
              }}
            />

            {/* Content */}
            <div className="relative flex flex-col items-center gap-5">
              <motion.div
                animate={{ rotate: tier === "golden" ? [0, 15, -15, 0] : [0, 8, -8, 0] }}
                transition={{ duration: 0.6, repeat: 2 }}
                className="flex items-center gap-2"
              >
                {tier === "golden" ? (
                  <Sparkles size={28} style={{ color: config.accentColor }} />
                ) : (
                  <Zap size={26} style={{ color: config.accentColor, fill: config.accentColor }} />
                )}
                <p
                  className="text-[11px] font-mono uppercase tracking-[0.25em] font-bold"
                  style={{ color: config.accentColor }}
                >
                  {config.label}
                </p>
                {tier === "golden" ? (
                  <Sparkles size={28} style={{ color: config.accentColor }} />
                ) : (
                  <Zap size={26} style={{ color: config.accentColor, fill: config.accentColor }} />
                )}
              </motion.div>

              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 400, damping: 20 }}
                className="font-display font-bold text-center leading-none"
                style={{
                  fontSize: "88px",
                  color: config.accentColor,
                  textShadow: `0 0 40px ${config.accentColor}60`,
                  letterSpacing: "-0.02em",
                }}
              >
                {multiplier}×
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="flex flex-col items-center gap-1.5"
              >
                <p
                  className="text-sm font-mono"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span style={{ textDecoration: "line-through", opacity: 0.5 }}>
                    +{baseXp} XP
                  </span>
                </p>
                <p
                  className="flex items-center gap-1.5 text-2xl font-display font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  <Zap size={22} style={{ color: config.accentColor }} />
                  +{finalXp} XP
                </p>
              </motion.div>

              <p
                className="text-xs mt-1"
                style={{ color: "var(--text-muted)" }}
              >
                Tap to dismiss
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
