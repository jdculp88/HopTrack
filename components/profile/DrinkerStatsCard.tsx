"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Share2, Beer, Clock, MapPin, Trophy, Star, Zap, Calendar, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { DrinkerKPIs } from "@/lib/kpi";
import { formatDuration } from "@/lib/kpi";

interface DrinkerStatsCardProps {
  kpis: DrinkerKPIs;
  username: string;
  isOwnProfile: boolean;
}

export function DrinkerStatsCard({ kpis, username, isOwnProfile }: DrinkerStatsCardProps) {
  const [expanded, setExpanded] = useState(false);

  const stats: { label: string; value: React.ReactNode }[] = [
    { label: "Avg Rating", value: kpis.avgRating !== null ? <><span style={{ color: "var(--accent-gold)" }}>{kpis.avgRating}</span> <span style={{ color: "var(--accent-gold)" }}>★</span></> : "—" },
    { label: "Beers / Session", value: kpis.beersPerSession !== null ? `${kpis.beersPerSession}` : "—" },
    { label: "Favorite Style", value: kpis.favoriteStyle ? <><span>{kpis.favoriteStyle.name}</span>{" "}<span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>({kpis.favoriteStyle.pct}%)</span></> : "—" },
    { label: "Avg ABV", value: kpis.avgAbv !== null ? `${kpis.avgAbv}%` : "—" },
    { label: "Total Pours", value: <span style={{ color: "var(--accent-gold)" }}>{kpis.totalPours.toLocaleString()}</span> },
    { label: "Sessions This Month", value: `${kpis.sessionsThisMonth}` },
  ];

  const expandedStats = [
    { icon: Calendar, label: "Sessions This Year", value: `${kpis.sessionsThisYear}` },
    { icon: Clock, label: "Longest Session", value: formatDuration(kpis.longestSession) },
    { icon: Clock, label: "Avg Session", value: formatDuration(kpis.avgSessionDuration) },
    { icon: Beer, label: "New Beers This Month", value: `${kpis.newBeersThisMonth}` },
    { icon: MapPin, label: "Cities Visited", value: `${kpis.citiesVisited}` },
    { icon: MapPin, label: "States Visited", value: `${kpis.statesVisited}` },
    { icon: Zap, label: "Social Score", value: `${kpis.socialScore}` },
    { icon: Trophy, label: "Achievements", value: kpis.achievementPct !== null ? `${kpis.achievementPct}%` : "—" },
  ];

  async function shareStats() {
    const text = [
      `My HopTrack Stats 🍺`,
      `${kpis.totalPours} pours · ${kpis.beersPerSession ?? "?"} beers/session`,
      kpis.favoriteStyle ? `Fav style: ${kpis.favoriteStyle.name}` : null,
      `${kpis.citiesVisited} cities · ${kpis.statesVisited} states`,
      `hoptrack.app/profile/${username}`,
    ].filter(Boolean).join("\n");

    if (navigator.share) {
      try { await navigator.share({ text }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
    }
  }

  // Don't render if no meaningful data
  if (kpis.totalPours === 0) return null;

  return (
    <div className="card-bg-stats border border-[var(--border)] rounded-[14px] overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-2">
          <BarChart3 size={18} style={{ color: "var(--accent-gold)" }} />
          <h3 className="font-display font-bold text-[var(--text-primary)]">Your Stats</h3>
        </div>
        <div className="flex items-center gap-2">
          {isOwnProfile && (
            <button
              onClick={(e) => { e.stopPropagation(); shareStats(); }}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--border)] transition-colors hover:bg-[var(--surface-2)]"
            >
              <Share2 size={14} style={{ color: "var(--text-muted)" }} />
            </button>
          )}
          <div className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--border)]">
            {expanded
              ? <ChevronUp size={16} style={{ color: "var(--text-muted)" }} />
              : <ChevronDown size={16} style={{ color: "var(--text-muted)" }} />
            }
          </div>
        </div>
      </button>

      {/* 3×2 grid with hairline dividers */}
      <div className="px-4 pb-4">
        <div
          className="grid grid-cols-3"
          style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}
        >
          {stats.map(({ label, value }, i) => (
            <div
              key={label}
              className="text-center py-3.5 px-2"
              style={{
                borderRight: (i % 3 !== 2) ? "1px solid var(--border)" : "none",
                borderBottom: i < 3 ? "1px solid var(--border)" : "none",
              }}
            >
              <p className="font-mono font-bold text-lg leading-none text-[var(--text-primary)]">{value}</p>
              <p className="text-[8px] text-[var(--text-muted)] mt-1.5 font-mono uppercase tracking-[0.12em]">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Expanded stats */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 grid grid-cols-4 gap-2">
              {expandedStats.map(({ label, value }) => (
                <div key={label} className="text-center rounded-xl py-2 px-1" style={{ background: "color-mix(in srgb, var(--surface-2) 55%, transparent)" }}>
                  <p className="font-mono font-bold text-sm leading-none text-[var(--accent-gold)]">{value}</p>
                  <p className="text-[9px] text-[var(--text-muted)] mt-1 font-mono uppercase tracking-wide leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
