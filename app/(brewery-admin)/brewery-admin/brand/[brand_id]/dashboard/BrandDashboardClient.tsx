"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Beer, TrendingUp, BarChart3, MapPin, Activity,
  ArrowUpRight, ArrowDownRight, Minus, Eye, Heart, Star,
  GlassWater, ArrowRight, Download,
} from "lucide-react";
import Link from "next/link";
import { Sparkline, RecentActivityFeed } from "@/app/(brewery-admin)/brewery-admin/[brewery_id]/DashboardClient";
import type { ActivityItem } from "@/app/(brewery-admin)/brewery-admin/[brewery_id]/DashboardClient";

interface BrandAnalytics {
  brand: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    description: string | null;
  };
  locations: Array<{
    id: string;
    name: string;
    city: string;
    state: string;
    cover_image_url: string | null;
    latitude: number | null;
    longitude: number | null;
  }>;
  stats: {
    totalSessions: number;
    totalBeersLogged: number;
    uniqueVisitors: number;
    thisWeekSessions: number;
    lastWeekSessions: number;
    todaySessions: number;
    todayBeers: number;
    avgRating: number | null;
    repeatVisitorPct: number | null;
    crossLocationVisitors: number;
    totalFollowers: number;
  };
  locationBreakdown: Array<{
    id: string;
    name: string;
    city: string;
    state: string;
    sessions: number;
    beersLogged: number;
    uniqueVisitors: number;
  }>;
  topBeers: Array<{
    name: string;
    style: string | null;
    count: number;
    avgRating: number | null;
    ratingCount: number;
  }>;
  recentActivity: ActivityItem[];
  weeklyTrend: number[];
}

interface TapStats {
  totalOnTap: number;
  totalOff: number;
  uniqueBeers: number;
  sharedBeers: number;
}

interface BrandDashboardClientProps {
  brandId: string;
  initialData: BrandAnalytics;
  tapStats?: TapStats;
}

// ── Active Sessions Counter for Brand ──
function BrandActiveCounter({ brandId, initial }: { brandId: string; initial: number }) {
  const [count, setCount] = useState(initial);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/brand/${brandId}/active-sessions`);
        if (res.ok) {
          const json = await res.json();
          if (typeof json.data?.count === "number") setCount(json.data.count);
        }
      } catch { /* keep showing last known count */ }
    }, 60_000);
    return () => clearInterval(interval);
  }, [brandId]);

  return (
    <div className="flex items-center gap-1.5">
      <span className="font-display text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
        {count}
      </span>
      {count > 0 && (
        <motion.div
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: "#22c55e" }}
        />
      )}
    </div>
  );
}

// ── Week-over-week trend indicator ──
function WoWTrend({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 && current === 0) return <Minus size={14} style={{ color: "var(--text-muted)" }} />;
  if (previous === 0) return <ArrowUpRight size={14} style={{ color: "#4A7C59" }} />;
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct > 0) return (
    <span className="flex items-center gap-0.5 text-xs font-mono" style={{ color: "#4A7C59" }}>
      <ArrowUpRight size={12} /> +{pct}%
    </span>
  );
  if (pct < 0) return (
    <span className="flex items-center gap-0.5 text-xs font-mono" style={{ color: "#C44B3A" }}>
      <ArrowDownRight size={12} /> {pct}%
    </span>
  );
  return <Minus size={14} style={{ color: "var(--text-muted)" }} />;
}

export function BrandDashboardClient({ brandId, initialData, tapStats }: BrandDashboardClientProps) {
  const { stats, locationBreakdown, topBeers, recentActivity, weeklyTrend, locations } = initialData;
  const maxLocationSessions = Math.max(...locationBreakdown.map(l => l.sessions), 1);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto pt-16 lg:pt-8 space-y-6">
      {/* Today's Snapshot */}
      <div
        className="rounded-2xl border p-5 sm:p-6"
        style={{
          background: "linear-gradient(135deg, color-mix(in srgb, var(--accent-gold) 8%, var(--surface)) 0%, var(--surface) 100%)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            Today Across All Locations
          </h2>
          <div className="flex items-center gap-2">
            <a
              href={`/api/brand/${brandId}/analytics/export?range=all`}
              download
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-opacity hover:opacity-80"
              style={{ background: "color-mix(in srgb, var(--accent-gold) 12%, transparent)", color: "var(--accent-gold)" }}
            >
              <Download size={12} />
              CSV
            </a>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
              {locations.length} location{locations.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Visits Today</p>
            <p className="font-display text-3xl font-bold" style={{ color: "var(--accent-gold)" }}>{stats.todaySessions}</p>
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Beers Poured</p>
            <p className="font-display text-3xl font-bold" style={{ color: "var(--accent-gold)" }}>{stats.todayBeers}</p>
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Active Now</p>
            <BrandActiveCounter brandId={brandId} initial={0} />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Followers</p>
            <p className="font-display text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{stats.totalFollowers}</p>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: "This Week", value: stats.thisWeekSessions, icon: TrendingUp, extra: <WoWTrend current={stats.thisWeekSessions} previous={stats.lastWeekSessions} /> },
          { label: "Total Visits", value: stats.totalSessions, icon: Eye },
          { label: "Unique Visitors", value: stats.uniqueVisitors, icon: Users },
          { label: "Avg Rating", value: stats.avgRating ? `${stats.avgRating} ★` : "—", icon: Star },
          { label: "Repeat Visitors", value: stats.repeatVisitorPct != null ? `${stats.repeatVisitorPct}%` : "—", icon: Heart },
        ].map(({ label, value, icon: Icon, extra }) => (
          <div key={label} className="rounded-2xl p-4 border text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <Icon size={16} className="mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
            <p className="font-display text-2xl font-bold" style={{ color: "var(--accent-gold)" }}>{value}</p>
            <p className="text-[10px] font-mono uppercase tracking-wider mt-1" style={{ color: "var(--text-muted)" }}>{label}</p>
            {extra && <div className="mt-1">{extra}</div>}
          </div>
        ))}
      </div>

      {/* Cross-location insight + Weekly trend */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Cross-location visitors */}
        <div className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold" style={{ color: "var(--text-primary)" }}>Cross-Location Visitors</h3>
            <MapPin size={16} style={{ color: "var(--accent-gold)" }} />
          </div>
          <p className="font-display text-4xl font-bold" style={{ color: "var(--accent-gold)" }}>
            {stats.crossLocationVisitors}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            {stats.crossLocationVisitors === 0
              ? "No visitors have checked in at multiple locations yet"
              : `visitor${stats.crossLocationVisitors !== 1 ? "s" : ""} checked in at 2+ locations`}
          </p>
        </div>

        {/* Weekly trend sparkline */}
        <div className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold" style={{ color: "var(--text-primary)" }}>Weekly Trend</h3>
            <BarChart3 size={16} style={{ color: "var(--accent-gold)" }} />
          </div>
          <div className="flex items-end gap-4">
            <Sparkline data={weeklyTrend} width={200} height={48} />
            <div className="text-right">
              <p className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{stats.thisWeekSessions}</p>
              <p className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>this week</p>
            </div>
          </div>
          <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>Last 8 weeks across all locations</p>
        </div>
      </div>

      {/* Tap Overview Card */}
      {tapStats && (
        <Link
          href={`/brewery-admin/brand/${brandId}/tap-list`}
          className="block rounded-2xl border p-5 transition-opacity hover:opacity-90 group"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <GlassWater size={16} style={{ color: "var(--accent-gold)" }} />
              <h3 className="font-display font-bold" style={{ color: "var(--text-primary)" }}>Tap Overview</h3>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold group-hover:gap-2 transition-all"
              style={{ color: "var(--accent-gold)" }}>
              Manage <ArrowRight size={12} />
            </span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <p className="font-display text-2xl font-bold" style={{ color: "var(--accent-gold)" }}>{tapStats.totalOnTap}</p>
              <p className="text-[10px] font-mono uppercase" style={{ color: "var(--text-muted)" }}>On Tap</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold" style={{ color: "var(--text-muted)" }}>{tapStats.totalOff}</p>
              <p className="text-[10px] font-mono uppercase" style={{ color: "var(--text-muted)" }}>Off Tap</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{tapStats.uniqueBeers}</p>
              <p className="text-[10px] font-mono uppercase" style={{ color: "var(--text-muted)" }}>Unique</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold" style={{ color: "#4A7C59" }}>{tapStats.sharedBeers}</p>
              <p className="text-[10px] font-mono uppercase" style={{ color: "var(--text-muted)" }}>Shared</p>
            </div>
          </div>
        </Link>
      )}

      {/* Location Breakdown */}
      {locationBreakdown.length > 0 && (
        <div className="rounded-2xl border p-5 sm:p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <h3 className="font-display font-bold mb-4" style={{ color: "var(--text-primary)" }}>Location Breakdown</h3>
          <div className="space-y-3">
            {locationBreakdown.map((loc, i) => (
              <motion.div
                key={loc.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 sm:gap-4"
              >
                <span className="font-mono text-xs w-5 text-right shrink-0" style={{ color: "var(--text-muted)" }}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between mb-1">
                    <p className="font-display font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                      {loc.name}
                    </p>
                    <span className="text-xs font-mono ml-2 shrink-0" style={{ color: "var(--accent-gold)" }}>
                      {loc.sessions} visit{loc.sessions !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "var(--accent-gold)" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(loc.sessions / maxLocationSessions) * 100}%` }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                    />
                  </div>
                  <div className="flex gap-3 mt-1">
                    <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                      {loc.uniqueVisitors} unique · {loc.beersLogged} beers
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {loc.city}, {loc.state}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Top Beers Across All Locations */}
      {topBeers.length > 0 && (
        <div className="rounded-2xl border p-5 sm:p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold" style={{ color: "var(--text-primary)" }}>Top Beers Across All Locations</h3>
            <Beer size={16} style={{ color: "var(--accent-gold)" }} />
          </div>
          <div className="space-y-2">
            {topBeers.map((beer, i) => (
              <div
                key={beer.name + i}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ background: i % 2 === 0 ? "var(--surface-2)" : "transparent" }}
              >
                <span className="font-mono text-xs w-5 text-right shrink-0" style={{ color: "var(--text-muted)" }}>
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                    {beer.name}
                  </p>
                  {beer.style && (
                    <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{beer.style}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-sm font-bold" style={{ color: "var(--accent-gold)" }}>{beer.count}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>pours</p>
                </div>
                {beer.avgRating && (
                  <div className="text-right shrink-0 w-14">
                    <p className="font-mono text-sm" style={{ color: "var(--text-primary)" }}>{beer.avgRating} ★</p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{beer.ratingCount} ratings</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="rounded-2xl border p-5 sm:p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold" style={{ color: "var(--text-primary)" }}>Recent Activity</h3>
          <Activity size={16} style={{ color: "var(--accent-gold)" }} />
        </div>
        <RecentActivityFeed items={recentActivity} />
      </div>
    </div>
  );
}
