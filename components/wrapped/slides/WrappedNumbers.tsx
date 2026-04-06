"use client";

import { motion } from "motion/react";
import { Beer, MapPin, Calendar, Zap, TrendingUp, TrendingDown, Minus } from "lucide-react";
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

/** Sprint 169 — delta indicator for WoW comparison */
function DeltaIndicator({ current, previous }: { current: number; previous: number }) {
  const delta = current - previous;
  if (delta === 0) return (
    <span className="inline-flex items-center gap-0.5 text-[9px] font-mono" style={{ color: "#9E8E6E" }}>
      <Minus size={8} /> same
    </span>
  );
  const isUp = delta > 0;
  return (
    <span
      className="inline-flex items-center gap-0.5 text-[9px] font-mono font-medium"
      style={{ color: isUp ? "#3D7A52" : "#C44B3A" }}
    >
      {isUp ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
      {isUp ? "+" : ""}{delta}
    </span>
  );
}

function StatCell({
  icon, value, label, delay, previousValue,
}: {
  icon: React.ReactNode; value: number; label: string; delay: number; previousValue?: number;
}) {
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
      {/* WoW delta (Sprint 169) */}
      {previousValue !== undefined && (
        <motion.div
          className="mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.3 }}
        >
          <DeltaIndicator current={value} previous={previousValue} />
        </motion.div>
      )}
    </motion.div>
  );
}

export function WrappedNumbers({ stats, previousStats }: { stats: WrappedStats; previousStats?: WrappedStats }) {
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
        <StatCell icon={<Beer size={20} />} value={stats.totalBeers} label="Beers poured" delay={0.15} previousValue={previousStats?.totalBeers} />
        <StatCell icon={<MapPin size={20} />} value={stats.uniqueBreweries} label="Breweries" delay={0.25} previousValue={previousStats?.uniqueBreweries} />
        <StatCell icon={<Calendar size={20} />} value={stats.totalSessions} label="Sessions" delay={0.35} previousValue={previousStats?.totalSessions} />
        <StatCell icon={<Zap size={20} />} value={stats.xpEarned} label="XP earned" delay={0.45} previousValue={previousStats?.xpEarned} />
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

      {/* WoW trend context message (Sprint 169) */}
      {previousStats && previousStats.totalBeers > 0 && (
        <motion.p
          className="text-center text-xs font-mono"
          style={{ color: "#9E8E6E" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {stats.totalBeers > previousStats.totalBeers
            ? stats.totalBeers >= previousStats.totalBeers * 2
              ? "Your best week yet! 🔥"
              : "More pours than last week ↑"
            : stats.totalBeers === previousStats.totalBeers
              ? "Exactly the same as last week →"
              : "Slower than last week — quality over quantity"}
        </motion.p>
      )}
      {previousStats && previousStats.totalBeers === 0 && stats.totalBeers > 0 && (
        <motion.p
          className="text-center text-xs font-mono"
          style={{ color: "#9E8E6E" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Last week was quiet — welcome back! 🍺
        </motion.p>
      )}
    </div>
  );
}
