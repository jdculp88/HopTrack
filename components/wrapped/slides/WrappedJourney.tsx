"use client";

import { motion } from "motion/react";
import { Compass, MapPin } from "lucide-react";
import type { WrappedStats } from "@/lib/wrapped";

const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

export function WrappedJourney({ stats }: { stats: WrappedStats }) {
  const cities = stats.citiesVisited.slice(0, 8);
  const moreCount = stats.citiesVisited.length - cities.length;

  return (
    <div className="text-center space-y-5">
      <motion.p
        className="text-[10px] font-mono uppercase tracking-[0.3em]"
        style={{ color: "#D4A843" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        The Journey
      </motion.p>

      {/* Adventurer score ring */}
      <motion.div
        className="relative mx-auto w-28 h-28 flex items-center justify-center"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...spring, delay: 0.15 }}
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          <motion.circle
            cx="50" cy="50" r="42"
            fill="none"
            stroke="#D4A843"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 42}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - stats.adventurerScore / 100) }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          />
        </svg>
        <div className="text-center">
          <span className="font-display text-2xl font-bold" style={{ color: "#E8D5A3" }}>
            {stats.adventurerScore}%
          </span>
          <p className="text-[8px] font-mono uppercase" style={{ color: "#9E8E6E" }}>
            Explorer
          </p>
        </div>
      </motion.div>

      {/* Style exploration stat */}
      <motion.p
        className="text-sm"
        style={{ color: "#C4B48A" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {stats.uniqueStyles} of 26 styles explored
      </motion.p>

      {/* Cities */}
      {cities.length > 0 && (
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.6 }}
        >
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <Compass size={14} style={{ color: "#D4A843" }} />
            <span className="text-xs font-mono uppercase tracking-wider" style={{ color: "#9E8E6E" }}>
              Cities visited
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {cities.map((city, i) => (
              <motion.span
                key={city}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  color: "var(--text-secondary)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...spring, delay: 0.7 + i * 0.05 }}
              >
                <MapPin size={9} style={{ color: "#D4A843" }} />
                {city}
              </motion.span>
            ))}
            {moreCount > 0 && (
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs"
                style={{ color: "#9E8E6E" }}
              >
                +{moreCount} more
              </span>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
