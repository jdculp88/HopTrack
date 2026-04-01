"use client";

import { motion } from "framer-motion";
import { MapPin, Heart } from "lucide-react";
import type { WrappedStats } from "@/lib/wrapped";

const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

export function WrappedTopBrewery({ stats }: { stats: WrappedStats }) {
  if (!stats.topBrewery) return null;

  return (
    <div className="text-center space-y-6">
      <motion.p
        className="text-[10px] font-mono uppercase tracking-[0.3em]"
        style={{ color: "#D4A843" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Your Home Base
      </motion.p>

      {/* Topo-inspired decorative ring */}
      <motion.div
        className="relative mx-auto w-32 h-32 flex items-center justify-center"
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ ...spring, delay: 0.15 }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: "2px dashed var(--accent-gold)",
            opacity: 0.3,
          }}
        />
        <div
          className="absolute inset-3 rounded-full"
          style={{
            border: "1px dashed var(--accent-gold)",
            opacity: 0.15,
          }}
        />
        <Heart size={36} style={{ color: "#D4A843" }} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.3 }}
      >
        <h2
          className="font-display text-2xl font-bold"
          style={{ color: "#E8D5A3" }}
        >
          {stats.topBrewery.name}
        </h2>
        {stats.topBrewery.city && (
          <div className="flex items-center justify-center gap-1 mt-1.5">
            <MapPin size={12} style={{ color: "#D4A843" }} />
            <span className="text-sm" style={{ color: "#C4B48A" }}>
              {stats.topBrewery.city}
            </span>
          </div>
        )}
      </motion.div>

      <motion.div
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
        style={{ background: "rgba(212,168,67,0.1)", border: "1px solid rgba(212,168,67,0.2)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span className="text-sm font-mono" style={{ color: "#D4A843" }}>
          {stats.topBrewery.visits} visit{stats.topBrewery.visits !== 1 ? "s" : ""}
        </span>
      </motion.div>

      <motion.p
        className="text-xs italic"
        style={{ color: "#9E8E6E" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
      >
        They know your order by now
      </motion.p>
    </div>
  );
}
