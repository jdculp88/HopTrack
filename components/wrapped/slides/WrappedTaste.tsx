"use client";

import { motion } from "framer-motion";
import { getStyleVars } from "@/lib/beerStyleColors";
import type { WrappedStats } from "@/lib/wrapped";

const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

export function WrappedTaste({ stats }: { stats: WrappedStats }) {
  const styleVars = stats.topStyle ? getStyleVars(stats.topStyle.style) : null;

  return (
    <div className="text-center space-y-6">
      <motion.p
        className="text-[10px] font-mono uppercase tracking-[0.3em]"
        style={{ color: "var(--accent-gold)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Your Taste
      </motion.p>

      {/* Personality */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...spring, delay: 0.15 }}
      >
        <span className="text-5xl block mb-3">{stats.personality.emoji}</span>
        <h2
          className="font-display text-3xl font-bold"
          style={{ color: "#E8D5A3" }}
        >
          {stats.personality.archetype}
        </h2>
        <p className="text-sm italic mt-2" style={{ color: "#C4B48A" }}>
          "{stats.personality.tagline}"
        </p>
      </motion.div>

      {/* Top style callout */}
      {stats.topStyle && (
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
          style={{
            background: `color-mix(in srgb, ${styleVars?.primary ?? "var(--accent-gold)"} 15%, transparent)`,
            border: `1px solid color-mix(in srgb, ${styleVars?.primary ?? "var(--accent-gold)"} 30%, transparent)`,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.4 }}
        >
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: styleVars?.primary ?? "var(--accent-gold)" }}
          />
          <span className="text-sm font-medium" style={{ color: "#E8D5A3" }}>
            {stats.topStyle.style}
          </span>
          <span className="text-xs font-mono" style={{ color: "#9E8E6E" }}>
            {stats.topStyle.count}x
          </span>
        </motion.div>
      )}

      {/* Rating personality */}
      {stats.avgRating !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-xs" style={{ color: "#9E8E6E" }}>
            Avg rating: <span className="font-mono" style={{ color: "var(--accent-gold)" }}>
              {stats.avgRating.toFixed(1)} ★
            </span>
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: "#9E8E6E" }}>
            {stats.ratingPersonality}
          </p>
        </motion.div>
      )}
    </div>
  );
}
