"use client";

import { useEffect, useState } from "react";
import { Flame, Snowflake } from "lucide-react";
import { motion } from "motion/react";
import { spring } from "@/lib/animation";

interface StreakDisplayProps {
  currentStreak: number;
  bestStreak?: number;
  freezesAvailable?: number;
  isAtRisk?: boolean;
  compact?: boolean;
}

export function StreakDisplay({
  currentStreak,
  bestStreak,
  freezesAvailable = 0,
  isAtRisk = false,
  compact = false,
}: StreakDisplayProps) {
  const [displayCount, setDisplayCount] = useState(0);

  // Animate the number counting up from 0
  useEffect(() => {
    if (currentStreak === 0) {
      setDisplayCount(0);
      return;
    }

    const duration = Math.min(currentStreak * 40, 1200);
    const steps = Math.min(currentStreak, 30);
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setDisplayCount(Math.round(progress * currentStreak));
      if (step >= steps) {
        setDisplayCount(currentStreak);
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [currentStreak]);

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={spring.bouncy}
        >
          <Flame
            size={16}
            className={isAtRisk ? "text-amber-500 animate-pulse" : ""}
            style={{ color: isAtRisk ? undefined : "var(--accent-gold)" }}
          />
        </motion.span>
        <span
          className="font-mono text-sm font-bold"
          style={{ color: isAtRisk ? "var(--text-muted)" : "var(--accent-gold)" }}
        >
          {displayCount}
        </span>
        {freezesAvailable > 0 && (
          <span className="inline-flex gap-0.5 ml-0.5">
            {Array.from({ length: freezesAvailable }).map((_, i) => (
              <Snowflake
                key={i}
                size={10}
                className="opacity-60"
                style={{ color: "var(--accent-gold)" }}
              />
            ))}
          </span>
        )}
      </span>
    );
  }

  return (
    <div
      className="card-bg-streak rounded-[14px] relative overflow-hidden"
      style={{
        backgroundColor: "var(--card-bg)",
        border: "1px solid var(--border)",
        padding: "18px 20px",
      }}
    >
      {/* 3px top bar — Card Type 8: warning → gold gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: `linear-gradient(90deg, ${isAtRisk ? "var(--accent-amber)" : "var(--func-warning, var(--streak-flame))"}, #F4D35E)` }}
      />
      {/* Radial amber glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 10% 50%, rgba(232,168,56,0.06) 0%, transparent 60%)" }}
      />
      {/* Floating sparkle particles */}
      {currentStreak > 0 && [0, 1, 2, 3, 4].map(i => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: i % 2 === 0 ? 3 : 2,
            height: i % 2 === 0 ? 3 : 2,
            background: isAtRisk ? "var(--accent-amber)" : "var(--accent-gold)",
            right: `${10 + i * 16}%`,
            top: `${15 + (i * 13) % 70}%`,
          }}
          animate={{
            opacity: [0, 0.6, 0],
            y: [0, -10, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: 2.5 + i * 0.4,
            delay: i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className="flex items-center gap-4 relative z-10">
        {/* Flame icon */}
        <motion.div
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={spring.bouncy}
          className="relative"
        >
          <div
            className={`w-12 h-12 rounded-[14px] flex items-center justify-center ${isAtRisk ? "streak-at-risk" : ""}`}
            style={{
              background: isAtRisk
                ? "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(232,168,56,0.08))"
                : "linear-gradient(135deg, rgba(244,211,94,0.12), rgba(232,168,56,0.08))",
              border: `1px solid ${isAtRisk ? "rgba(245,158,11,0.2)" : "rgba(232,168,56,0.12)"}`,
            }}
          >
            <span className="text-2xl">🔥</span>
          </div>
        </motion.div>

        {/* Streak number + label */}
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span
              className="font-mono font-bold tabular-nums leading-none"
              style={{ fontSize: "32px", color: isAtRisk ? "var(--text-muted)" : "var(--text-primary)" }}
            >
              {displayCount}
            </span>
            <span
              className="font-mono text-[10px] ml-1"
              style={{ color: "var(--text-muted)" }}
            >
              day streak
            </span>
          </div>

          {/* Best streak */}
          {bestStreak != null && bestStreak > 0 && (
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Best: {bestStreak} days
            </p>
          )}
        </div>

        {/* Freeze badges */}
        {freezesAvailable > 0 && (
          <div className="flex items-center gap-1">
            {Array.from({ length: freezesAvailable }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg p-1.5"
                style={{
                  backgroundColor: "rgba(212, 168, 67, 0.08)",
                  border: "1px solid rgba(212, 168, 67, 0.15)",
                }}
              >
                <Snowflake
                  size={14}
                  style={{ color: "var(--accent-gold)" }}
                  className="opacity-70"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* At risk banner */}
      {isAtRisk && currentStreak > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={spring.default}
          className="mt-3 rounded-xl px-3 py-2 text-center text-sm font-medium"
          style={{
            backgroundColor: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.2)",
            color: "#f59e0b",
          }}
        >
          Check in today to keep your streak!
        </motion.div>
      )}

      {/* Freeze explainer */}
      {freezesAvailable > 0 && (
        <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
          {freezesAvailable} streak freeze{freezesAvailable !== 1 ? "s" : ""} available
        </p>
      )}

      <style jsx>{`
        @keyframes streak-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.3); }
          50% { box-shadow: 0 0 12px 4px rgba(245, 158, 11, 0.15); }
        }
        .streak-at-risk {
          animation: streak-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
