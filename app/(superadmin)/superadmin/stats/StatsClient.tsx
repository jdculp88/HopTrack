"use client";

/**
 * Platform Stats Dashboard — Sprint 143 (The Superadmin III)
 *
 * Rich interactive dashboard with time range switching, stat cards with sparklines,
 * computed ratios, CRM segment distribution, beer style distribution, and
 * interactive leaderboards with links to brewery detail.
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import {
  BarChart2,
  Users,
  Beer,
  Building2,
  CheckCheck,
  Star,
  Heart,
  MessageCircle,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Sparkline } from "@/components/ui/Sparkline";
import { spring } from "@/lib/animation";
import Link from "next/link";
import type {
  PlatformStatsData,
  StatsTimeRange,
  ComputedRatio,
  SegmentDistribution,
  StyleDistribution,
  LeaderboardItem,
} from "@/lib/superadmin-stats";

// ── Constants ──────────────────────────────────────────────────────

const RANGE_OPTIONS: { label: string; value: StatsTimeRange }[] = [
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
  { label: "90d", value: "90d" },
];

const STAT_ICON_MAP: Record<string, React.ComponentType<{ size: number }>> = {
  "Total Users": Users,
  "Breweries": Building2,
  "Beers": Beer,
  "Sessions": CheckCheck,
  "Verified Accounts": Star,
  "Reviews": Heart,
  "Comments": MessageCircle,
};

// ── Helpers ────────────────────────────────────────────────────────

function formatRatio(ratio: ComputedRatio): string {
  if (ratio.value === null) return "--";
  switch (ratio.format) {
    case "percent":
      return `${ratio.value}%`;
    case "decimal":
      return ratio.value.toFixed(1);
    case "minutes": {
      const v = Math.round(ratio.value);
      if (v < 60) return `${v}m`;
      const h = Math.floor(v / 60);
      const m = v % 60;
      return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    default:
      return String(ratio.value);
  }
}

// ── Stat Cards Section ─────────────────────────────────────────────

function StatCards({ stats }: { stats: PlatformStatsData["stats"] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = STAT_ICON_MAP[stat.label] || BarChart2;
        return (
          <div
            key={stat.label}
            className="rounded-xl border p-4"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-1.5 mb-1" style={{ color: "var(--text-muted)" }}>
              <Icon size={13} />
              <span className="text-xs font-mono uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                {stat.value.toLocaleString()}
              </p>
              {stat.sparkline.length >= 2 && (
                <Sparkline data={stat.sparkline} width={48} height={20} />
              )}
            </div>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{stat.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
}

// ── Computed Ratios Section ─────────────────────────────────────────

function ComputedRatios({ ratios }: { ratios: ComputedRatio[] }) {
  return (
    <div>
      <h2 className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
        Computed Ratios
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {ratios.map((ratio) => (
          <div
            key={ratio.label}
            className="rounded-xl border p-4 text-center"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <p className="font-mono text-2xl font-bold" style={{ color: "var(--accent-gold)" }}>
              {formatRatio(ratio)}
            </p>
            <p className="text-xs font-mono mt-1" style={{ color: "var(--text-muted)" }}>{ratio.label}</p>
            <p className="text-[10px] mt-1" style={{ color: "var(--text-secondary)" }}>{ratio.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── CRM Segment Distribution ────────────────────────────────────────

function CRMDistribution({ segments }: { segments: SegmentDistribution[] }) {
  const maxCount = Math.max(...segments.map((s) => s.count), 1);

  return (
    <Card padding="spacious">
      <CardHeader>
        <CardTitle as="h3">CRM Segments</CardTitle>
      </CardHeader>
      {segments.length === 0 ? (
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>No user data yet</p>
      ) : (
        <div className="space-y-2">
          {segments.map((seg) => (
            <div key={seg.segment} className="flex items-center gap-3">
              <span className="text-sm w-6 text-center flex-shrink-0">{seg.emoji}</span>
              <span className="text-xs w-16 flex-shrink-0" style={{ color: "var(--text-primary)" }}>
                {seg.label}
              </span>
              <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: seg.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max((seg.count / maxCount) * 100, 1)}%` }}
                  transition={{ ...spring.gentle, delay: 0.1 }}
                />
              </div>
              <span className="text-xs font-mono w-10 text-right" style={{ color: "var(--text-secondary)" }}>
                {seg.count.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ── Beer Style Distribution ─────────────────────────────────────────

function StyleDistributionChart({ styles }: { styles: StyleDistribution[] }) {
  const maxCount = styles.length > 0 ? styles[0].count : 1;

  return (
    <Card padding="spacious">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Beer size={14} style={{ color: "var(--accent-gold)" }} />
          <CardTitle as="h3">Beer Style Distribution</CardTitle>
        </div>
      </CardHeader>
      {styles.length === 0 ? (
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>No beer log data yet</p>
      ) : (
        <div className="space-y-1.5">
          {styles.map((s, i) => (
            <div key={s.style} className="flex items-center gap-3">
              <span className="text-xs w-24 truncate flex-shrink-0" style={{ color: "var(--text-primary)" }}>
                {s.style}
              </span>
              <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "var(--accent-gold)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(s.count / maxCount) * 100}%` }}
                  transition={{ ...spring.gentle, delay: i * 0.03 }}
                />
              </div>
              <span className="text-xs font-mono w-10 text-right" style={{ color: "var(--text-secondary)" }}>
                {s.count}
              </span>
              <span className="text-[10px] font-mono w-10 text-right" style={{ color: "var(--text-muted)" }}>
                {s.pct}%
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ── Interactive Leaderboard ─────────────────────────────────────────

function Leaderboard({
  title,
  items,
  icon,
  linkPrefix,
}: {
  title: string;
  items: LeaderboardItem[];
  icon: React.ReactNode;
  linkPrefix?: string;
}) {
  const maxCount = items.length > 0 ? items[0].count : 1;

  return (
    <Card padding="spacious">
      <CardHeader>
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle as="h3">{title}</CardTitle>
        </div>
      </CardHeader>
      {items.length === 0 ? (
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>No data yet</p>
      ) : (
        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {items.map((item, i) => {
            const row = (
              <div
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${linkPrefix ? "hover:bg-[var(--surface-2)]" : ""}`}
              >
                <span className="text-xs font-mono w-5 text-right flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {item.name}
                  </p>
                  {item.subtitle && (
                    <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                      {item.subtitle}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        background: "var(--accent-gold)",
                        width: `${(item.count / maxCount) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono w-8 text-right" style={{ color: "var(--text-secondary)" }}>
                    {item.count}
                  </span>
                </div>
                {linkPrefix && (
                  <ChevronRight size={12} style={{ color: "var(--text-muted)" }} />
                )}
              </div>
            );

            if (linkPrefix) {
              return (
                <Link key={item.id} href={`${linkPrefix}${item.id}`}>
                  {row}
                </Link>
              );
            }
            return <div key={item.id}>{row}</div>;
          })}
        </div>
      )}
    </Card>
  );
}

// ── Main Component ──────────────────────────────────────────────────

interface StatsClientProps {
  initialData: PlatformStatsData;
}

export default function StatsClient({ initialData }: StatsClientProps) {
  const [data, setData] = useState(initialData);
  const [range, setRange] = useState<StatsTimeRange>("30d");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = useCallback(async (selectedRange: StatsTimeRange, isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await fetch(`/api/superadmin/stats?range=${selectedRange}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setData(json.data);
          setLastUpdated(new Date());
        }
      }
    } catch {
      // Silently fail — keep showing last known data
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(() => fetchData(range), 60_000);
    return () => clearInterval(interval);
  }, [range, fetchData]);

  // Fetch on range change
  const handleRangeChange = useCallback(
    (newRange: StatsTimeRange) => {
      setRange(newRange);
      fetchData(newRange, true);
    },
    [fetchData]
  );

  // useMemo ensures Date.now() is called at a stable point per render (React Compiler purity rule).
  const minutesAgo = useMemo(
    () => Math.floor((Date.now() - lastUpdated.getTime()) / 60000),
    [lastUpdated],
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 size={15} style={{ color: "var(--text-muted)" }} />
            <span className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Platform
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Platform Health
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Pills */}
          <div className="flex rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
            {RANGE_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => handleRangeChange(value)}
                className="px-3 py-1.5 text-xs font-mono transition-colors"
                style={{
                  background: range === value ? "var(--accent-gold)" : "var(--surface)",
                  color: range === value ? "var(--bg)" : "var(--text-muted)",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchData(range, true)}
            disabled={isRefreshing}
            className="p-2 rounded-xl border transition-colors"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <motion.div
              animate={isRefreshing ? { rotate: 360 } : {}}
              transition={{ repeat: isRefreshing ? Infinity : 0, duration: 1 }}
            >
              <RefreshCw size={14} style={{ color: "var(--text-muted)" }} />
            </motion.div>
          </button>

          {/* Updated Timestamp */}
          <span className="text-[10px] font-mono hidden sm:inline" style={{ color: "var(--text-muted)" }}>
            {minutesAgo < 1 ? "just now" : `${minutesAgo}m ago`}
          </span>
        </div>
      </div>

      {/* ── Dashboard Sections ──────────────────────────────── */}
      <div className="space-y-6">
        {/* Stat Cards */}
        <StatCards stats={data.stats} />

        {/* Computed Ratios */}
        <ComputedRatios ratios={data.ratios} />

        {/* CRM Segments + Beer Styles (two columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CRMDistribution segments={data.crmDistribution} />
          <StyleDistributionChart styles={data.styleDistribution} />
        </div>

        {/* Interactive Leaderboards (two columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Leaderboard
            title="Top Breweries"
            items={data.topBreweries}
            icon={<Building2 size={14} style={{ color: "var(--accent-gold)" }} />}
            linkPrefix="/superadmin/breweries/"
          />
          <Leaderboard
            title="Top Beers"
            items={data.topBeers}
            icon={<Beer size={14} style={{ color: "var(--accent-gold)" }} />}
          />
        </div>
      </div>
    </div>
  );
}
