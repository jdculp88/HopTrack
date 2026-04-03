"use client";

import { motion } from "framer-motion";
import { Trophy, Flame, Users, Sparkles } from "lucide-react";
import type { WrappedStats } from "@/lib/wrapped";

const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

export function WrappedBadge({ stats }: { stats: WrappedStats }) {
  return (
    <div className="text-center space-y-5">
      <motion.p
        className="text-[10px] font-mono uppercase tracking-[0.3em]"
        style={{ color: "#D4A843" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Your Status
      </motion.p>

      {/* Level badge */}
      <motion.div
        className="relative mx-auto"
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ ...spring, delay: 0.15 }}
      >
        <div
          className="w-28 h-28 rounded-full mx-auto flex items-center justify-center"
          style={{
            background: "radial-gradient(circle, rgba(212,168,67,0.2) 0%, transparent 70%)",
            border: "2px solid var(--accent-gold)",
          }}
        >
          <div className="text-center">
            <span
              className="font-display text-3xl font-bold block"
              style={{ color: "#D4A843" }}
            >
              {stats.level.level}
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.3 }}
      >
        <h2
          className="font-display text-2xl font-bold"
          style={{ color: "#E8D5A3" }}
        >
          {stats.level.title}
        </h2>
        <p className="text-xs font-mono mt-1" style={{ color: "#D4A843" }}>
          {stats.xpEarned.toLocaleString()} XP earned
        </p>
      </motion.div>

      {/* Achievement highlights */}
      <motion.div
        className="grid grid-cols-3 gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {stats.achievementsUnlocked > 0 && (
          <div className="text-center p-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
            <Trophy size={16} className="mx-auto mb-1" style={{ color: "#D4A843" }} />
            <span className="font-display text-lg font-bold block" style={{ color: "#E8D5A3" }}>
              {stats.achievementsUnlocked}
            </span>
            <span className="text-[9px] font-mono uppercase" style={{ color: "#9E8E6E" }}>
              Badges
            </span>
          </div>
        )}
        {stats.longestStreak > 0 && (
          <div className="text-center p-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
            <Flame size={16} className="mx-auto mb-1" style={{ color: "#D4A843" }} />
            <span className="font-display text-lg font-bold block" style={{ color: "#E8D5A3" }}>
              {stats.longestStreak}
            </span>
            <span className="text-[9px] font-mono uppercase" style={{ color: "#9E8E6E" }}>
              Day streak
            </span>
          </div>
        )}
        {stats.friendsMade > 0 && (
          <div className="text-center p-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
            <Users size={16} className="mx-auto mb-1" style={{ color: "#D4A843" }} />
            <span className="font-display text-lg font-bold block" style={{ color: "#E8D5A3" }}>
              {stats.friendsMade}
            </span>
            <span className="text-[9px] font-mono uppercase" style={{ color: "#9E8E6E" }}>
              Friends
            </span>
          </div>
        )}
      </motion.div>

      {/* Closing message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="pt-2"
      >
        <Sparkles size={14} className="mx-auto mb-1.5" style={{ color: "#D4A843" }} />
        <p className="text-xs" style={{ color: "#C4B48A" }}>
          Here's to the next pour
        </p>
        <p className="text-[10px] font-mono mt-1" style={{ color: "#9E8E6E" }}>
          hoptrack.beer
        </p>
      </motion.div>
    </div>
  );
}
