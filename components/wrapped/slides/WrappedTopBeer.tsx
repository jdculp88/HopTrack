"use client";

import { motion } from "framer-motion";
import { Star, Repeat } from "lucide-react";
import type { WrappedStats } from "@/lib/wrapped";

const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

export function WrappedTopBeer({ stats }: { stats: WrappedStats }) {
  if (!stats.topBeer) return null;

  return (
    <div className="text-center space-y-6">
      <motion.p
        className="text-[10px] font-mono uppercase tracking-[0.3em]"
        style={{ color: "#D4A843" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Your Go-To
      </motion.p>

      {/* Beer glass icon */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...spring, delay: 0.15 }}
      >
        <span className="text-6xl block">🍺</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.3 }}
      >
        <h2
          className="font-display text-2xl font-bold leading-snug"
          style={{ color: "#E8D5A3" }}
        >
          {stats.topBeer.name}
        </h2>
      </motion.div>

      <motion.div
        className="flex items-center justify-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
      >
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: "rgba(212,168,67,0.1)" }}
        >
          <Repeat size={12} style={{ color: "#D4A843" }} />
          <span className="text-xs font-mono" style={{ color: "#D4A843" }}>
            {stats.topBeer.count}x ordered
          </span>
        </div>
      </motion.div>

      {stats.avgRating !== null && (
        <motion.div
          className="flex items-center justify-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          {[1, 2, 3, 4, 5].map(star => (
            <Star
              key={star}
              size={16}
              fill={star <= Math.round(stats.avgRating!) ? "#D4A843" : "transparent"}
              style={{ color: star <= Math.round(stats.avgRating!) ? "#D4A843" : "rgba(255,255,255,0.2)" }}
            />
          ))}
        </motion.div>
      )}

      <motion.p
        className="text-xs italic"
        style={{ color: "#9E8E6E" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
      >
        Some things are worth repeating
      </motion.p>
    </div>
  );
}
