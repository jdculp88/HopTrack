"use client";

import { motion } from "framer-motion";
import { Beer, MapPin, Calendar, Zap } from "lucide-react";
import type { WrappedStats } from "@/lib/wrapped";

const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

function AnimatedCounter({ value, delay = 0 }: { value: number; delay?: number }) {
  return (
    <motion.span
      className="font-display text-4xl font-bold tabular-nums"
      style={{ color: "#E8D5A3" }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...spring, delay }}
    >
      {value.toLocaleString()}
    </motion.span>
  );
}

function StatCell({ icon, value, label, delay }: { icon: React.ReactNode; value: number; label: string; delay: number }) {
  return (
    <motion.div
      className="text-center p-3 rounded-xl"
      style={{ background: "rgba(255,255,255,0.04)" }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay }}
    >
      <div className="flex justify-center mb-2" style={{ color: "var(--accent-gold)" }}>
        {icon}
      </div>
      <AnimatedCounter value={value} delay={delay + 0.1} />
      <p className="text-[10px] font-mono uppercase tracking-wider mt-1" style={{ color: "#9E8E6E" }}>
        {label}
      </p>
    </motion.div>
  );
}

export function WrappedNumbers({ stats }: { stats: WrappedStats }) {
  return (
    <div className="space-y-4">
      <motion.p
        className="text-[10px] font-mono uppercase tracking-[0.3em] text-center"
        style={{ color: "var(--accent-gold)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        The Numbers
      </motion.p>

      <div className="grid grid-cols-2 gap-3">
        <StatCell icon={<Beer size={20} />} value={stats.totalBeers} label="Beers poured" delay={0.15} />
        <StatCell icon={<MapPin size={20} />} value={stats.uniqueBreweries} label="Breweries" delay={0.25} />
        <StatCell icon={<Calendar size={20} />} value={stats.totalSessions} label="Sessions" delay={0.35} />
        <StatCell icon={<Zap size={20} />} value={stats.xpEarned} label="XP earned" delay={0.45} />
      </div>

      {stats.uniqueBeers > 0 && (
        <motion.p
          className="text-center text-sm"
          style={{ color: "#C4B48A" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {stats.uniqueBeers} unique beer{stats.uniqueBeers !== 1 ? "s" : ""} across{" "}
          {stats.uniqueStyles} style{stats.uniqueStyles !== 1 ? "s" : ""}
        </motion.p>
      )}
    </div>
  );
}
