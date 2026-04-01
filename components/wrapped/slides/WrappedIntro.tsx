"use client";

import { motion } from "framer-motion";
import type { WrappedStats } from "@/lib/wrapped";

const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

export function WrappedIntro({ stats }: { stats: WrappedStats }) {
  return (
    <div className="text-center space-y-6">
      {/* Emoji rain effect */}
      <div className="relative h-16 overflow-hidden" aria-hidden>
        {["🍺", "🍻", "🌿", "⭐", "🎉"].map((emoji, i) => (
          <motion.span
            key={i}
            className="absolute text-2xl"
            initial={{ y: -30, x: `${15 + i * 17}%`, opacity: 0 }}
            animate={{ y: 60, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2, delay: i * 0.3, repeat: Infinity, repeatDelay: 1.5 }}
          >
            {emoji}
          </motion.span>
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...spring, delay: 0.2 }}
      >
        <p
          className="text-[10px] font-mono uppercase tracking-[0.3em] mb-3"
          style={{ color: "var(--accent-gold)" }}
        >
          HopTrack Wrapped
        </p>
        <h1
          className="font-display text-4xl font-bold leading-tight"
          style={{ color: "#E8D5A3" }}
        >
          Your Year
          <br />
          in Beer
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.5 }}
      >
        <p className="text-sm" style={{ color: "#C4B48A" }}>
          {stats.period.label}
        </p>
        <p className="text-xs mt-1" style={{ color: "#9E8E6E" }}>
          Swipe to explore your journey
        </p>
      </motion.div>
    </div>
  );
}
