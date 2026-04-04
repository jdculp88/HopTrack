"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Monitor,
  RefreshCw,
  Users,
  Beer,
  Activity,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  DollarSign,
  Shield,
  ClipboardCheck,
  Bot,
  Key,
  Zap,
  MapPin,
  Trophy,
  UserPlus,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Sparkline } from "@/components/ui/Sparkline";
import { RetentionHeatmap } from "@/components/superadmin/RetentionHeatmap";
import { UserFunnel } from "@/components/superadmin/UserFunnel";
import { Skeleton } from "@/components/ui/SkeletonLoader";
import { stagger, spring } from "@/lib/animation";
import type {
  CommandCenterData,
  TimeRange,
  ActivityItem,
  RetentionData,
  FunnelData,
  TopItem,
  TierSlice,
  DailyDataPoint,
  StateBreweryCount,
} from "@/lib/superadmin-metrics";
import Link from "next/link";
import { SUBSCRIPTION_TIER_COLORS } from "@/lib/constants/tiers";

// ── Constants ──────────────────────────────────────────────────────

const RANGE_OPTIONS: { label: string; value: TimeRange }[] = [
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
  { label: "90d", value: "90d" },
];

const PIE_COLORS = SUBSCRIPTION_TIER_COLORS;

const CHART_LINE_COLOR = "#D4A843";

const ACTIVITY_ICONS: Record<string, string> = {
  signup: "👤",
  session: "🍺",
  claim: "📋",
  achievement: "🏆",
};

// ── Helpers ────────────────────────────────────────────────────────

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatMRR(n: number): string {
  if (n === 0) return "$0";
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n}`;
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString();
}

function formatDuration(minutes: number | null): string {
  if (minutes === null) return "—";
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ── Trend Indicator ────────────────────────────────────────────────

function TrendBadge({ value }: { value: number | null }) {
  if (value === null) return null;
  if (value === 0) {
    return (
      <span className="flex items-center gap-0.5 text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
        <Minus size={10} /> 0%
      </span>
    );
  }
  const isUp = value > 0;
  return (
    <span
      className="flex items-center gap-0.5 text-[10px] font-mono"
      style={{ color: isUp ? "#4A7C59" : "#C44B3A" }}
    >
      {isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
      {Math.abs(value)}%
    </span>
  );
}

// ── Chart Tooltip ──────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl border px-3 py-2 text-xs"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <p className="font-mono" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="font-bold" style={{ color: "var(--accent-gold)" }}>{payload[0].value}</p>
    </div>
  );
}

// ── Section: Platform Pulse ────────────────────────────────────────

function PlatformPulse({ data }: { data: CommandCenterData["pulse"] }) {
  const stats = [
    { label: "DAU", value: formatNumber(data.dau), icon: <Activity size={14} />, sparkline: data.dauSparkline, trend: data.dauWoW },
    { label: "WAU", value: formatNumber(data.wau), icon: <Users size={14} /> },
    { label: "MAU", value: formatNumber(data.mau), icon: <TrendingUp size={14} /> },
    {
      label: "Total Users",
      value: formatNumber(data.totalUsers),
      icon: <UserPlus size={14} />,
      trend: data.newUsersWoW,
      href: "/superadmin/users",
    },
    { label: "Sessions Today", value: formatNumber(data.sessionsToday), icon: <Beer size={14} />, sparkline: data.sessionsSparkline, trend: data.sessionsWoW },
    { label: "Active Now", value: data.activeSessions, isLive: true },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((s) => {
        const CardWrapper = "href" in s && s.href ? Link : "div";
        const cardProps = "href" in s && s.href ? { href: s.href as string } : {};

        return (
          <CardWrapper
            key={s.label}
            {...(cardProps as any)}
            className="rounded-2xl p-4 border text-center transition-colors hover:bg-[var(--surface-2)]"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-center gap-1.5 mb-2" style={{ color: "var(--text-muted)" }}>
              {"icon" in s && s.icon}
              <span className="text-[10px] font-mono uppercase tracking-wider">{s.label}</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <p className="font-mono text-2xl font-bold" style={{ color: "var(--accent-gold)" }}>
                {s.value}
              </p>
              {"isLive" in s && s.isLive && Number(s.value) > 0 && (
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: "#4A7C59" }}
                />
              )}
            </div>
            {"sparkline" in s && s.sparkline && (s.sparkline as number[]).length >= 2 && (
              <div className="mt-1 flex justify-center">
                <Sparkline data={s.sparkline as number[]} width={48} height={16} />
              </div>
            )}
            {"trend" in s && s.trend !== undefined && (
              <div className="mt-1 flex justify-center">
                <TrendBadge value={(s.trend as number | null) ?? null} />
              </div>
            )}
          </CardWrapper>
        );
      })}
    </div>
  );
}

// ── Section: Revenue Intelligence ──────────────────────────────────

function RevenueIntelligence({ data }: { data: CommandCenterData["revenue"] }) {
  const { mrrEstimate, tierDistribution, trialCount, paidCount, claimFunnel } = data;
  const funnelMax = claimFunnel.totalBreweries || 1;

  const funnelSteps = [
    { label: "Listed", value: claimFunnel.totalBreweries, color: "#6B6456" },
    { label: "Claimed", value: claimFunnel.claimed, color: "#A89F8C" },
    { label: "Verified", value: claimFunnel.verified, color: "#E8841A" },
    { label: "Paid", value: claimFunnel.paid, color: "#D4A843" },
  ];

  return (
    <Card padding="spacious">
      <CardHeader>
        <CardTitle as="h3">Revenue Intelligence</CardTitle>
      </CardHeader>

      {/* MRR Hero */}
      <div className="text-center mb-5">
        <p className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
          Estimated MRR
        </p>
        <p className="font-display text-4xl font-bold" style={{ color: "var(--accent-gold)" }}>
          {formatMRR(mrrEstimate)}
        </p>
        <div className="flex items-center justify-center gap-4 mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>
          <span>{paidCount} paid</span>
          <span>{trialCount} trials</span>
        </div>
      </div>

      {/* Tier Distribution Pie */}
      {tierDistribution.length > 0 && (
        <div className="flex justify-center mb-5">
          <ResponsiveContainer width={160} height={160}>
            <PieChart>
              <Pie
                data={tierDistribution}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={2}
                strokeWidth={0}
              >
                {tierDistribution.map((entry) => (
                  <Cell key={entry.tier} fill={PIE_COLORS[entry.tier] || "#6B6456"} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }: any) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div
                      className="rounded-xl border px-3 py-2 text-xs"
                      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                    >
                      <p style={{ color: "var(--text-primary)" }}>{payload[0].name}</p>
                      <p className="font-bold" style={{ color: payload[0].payload.fill }}>
                        {payload[0].value} breweries
                      </p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tier Legend */}
      <div className="flex flex-wrap justify-center gap-3 mb-5">
        {tierDistribution.map((t) => (
          <div key={t.tier} className="flex items-center gap-1.5 text-xs">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[t.tier] || "#6B6456" }} />
            <span style={{ color: "var(--text-secondary)" }}>{t.label}: {t.count}</span>
          </div>
        ))}
      </div>

      {/* Claim Funnel */}
      <div className="space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Claim Funnel
        </p>
        {funnelSteps.map((step) => (
          <div key={step.label} className="flex items-center gap-3">
            <span className="text-xs w-16 text-right font-mono" style={{ color: "var(--text-secondary)" }}>
              {step.label}
            </span>
            <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: step.color }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.max((step.value / funnelMax) * 100, 1)}%` }}
                transition={{ ...spring.gentle, delay: 0.2 }}
              />
            </div>
            <span className="text-xs font-mono w-14" style={{ color: "var(--text-primary)" }}>
              {formatNumber(step.value)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Section: Engagement Metrics ────────────────────────────────────

function EngagementMetrics({ data }: { data: CommandCenterData["engagement"] }) {
  const miniStats = [
    { label: "Sessions/User", value: data.avgSessionsPerUser?.toFixed(1) ?? "—" },
    { label: "Beers/Session", value: data.avgBeersPerSession?.toFixed(1) ?? "—" },
    { label: "Avg Duration", value: formatDuration(data.avgSessionDurationMin) },
    { label: "Loyalty Adoption", value: data.loyaltyAdoptionRate !== null ? `${data.loyaltyAdoptionRate}%` : "—" },
  ];

  return (
    <Card padding="spacious">
      <CardHeader>
        <CardTitle as="h3">Engagement Metrics</CardTitle>
      </CardHeader>

      {/* Mini Stats 2×2 */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {miniStats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-3 text-center border"
            style={{ background: "var(--bg)", borderColor: "var(--border)" }}
          >
            <p className="font-mono text-lg font-bold" style={{ color: "var(--accent-gold)" }}>{s.value}</p>
            <p className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Top Lists */}
      <TopList title="Top Beers" items={data.topBeers} icon={<Beer size={12} />} />
      <TopList title="Top Breweries" items={data.topBreweries} icon={<MapPin size={12} />} />
    </Card>
  );
}

function TopList({ title, items, icon }: { title: string; items: TopItem[]; icon: React.ReactNode }) {
  if (items.length === 0) {
    return (
      <div className="mb-4">
        <p className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
          {title}
        </p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>No data yet</p>
      </div>
    );
  }
  const maxCount = items[0].count;

  return (
    <div className="mb-4 last:mb-0">
      <p className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
        {title}
      </p>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={item.name} className="flex items-center gap-2">
            <span className="text-[10px] font-mono w-4 text-right" style={{ color: "var(--text-muted)" }}>
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span style={{ color: "var(--text-muted)" }}>{icon}</span>
                <span className="text-xs truncate" style={{ color: "var(--text-primary)" }}>{item.name}</span>
              </div>
              {item.subtitle && (
                <span className="text-[10px] ml-5" style={{ color: "var(--text-muted)" }}>{item.subtitle}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                <div
                  className="h-full rounded-full"
                  style={{ background: "var(--accent-gold)", width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-mono w-8 text-right" style={{ color: "var(--text-secondary)" }}>
                {item.count}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Section: Growth Trends ─────────────────────────────────────────

function GrowthTrends({ data }: { data: CommandCenterData["growth"] }) {
  const charts = [
    { title: "User Signups", data: data.userSignups, icon: <UserPlus size={14} /> },
    { title: "Session Volume", data: data.sessionVolume, icon: <Activity size={14} /> },
    { title: "Claim Trend", data: data.claimTrend, icon: <ClipboardCheck size={14} /> },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {charts.map(({ title, data: chartData, icon }) => (
        <Card key={title} padding="default">
          <div className="flex items-center gap-2 mb-3">
            <span style={{ color: "var(--accent-gold)" }}>{icon}</span>
            <p className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              {title}
            </p>
            {/* Mini sparkline summary */}
            <div className="ml-auto">
              <Sparkline data={chartData.map(d => d.count)} width={48} height={20} />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tick={false}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="count"
                stroke={CHART_LINE_COLOR}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, fill: CHART_LINE_COLOR }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      ))}
    </div>
  );
}

// ── Section: Geographic Intelligence ───────────────────────────────

function GeographicIntelligence({ data }: { data: CommandCenterData["geo"] }) {
  const { stateDistribution } = data;
  if (stateDistribution.length === 0) {
    return (
      <Card padding="spacious">
        <CardHeader>
          <CardTitle as="h3">Geographic Intelligence</CardTitle>
        </CardHeader>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>No brewery data yet</p>
      </Card>
    );
  }

  const maxCount = stateDistribution[0].count;

  return (
    <Card padding="spacious">
      <CardHeader>
        <div className="flex items-center gap-2">
          <MapPin size={14} style={{ color: "var(--accent-gold)" }} />
          <CardTitle as="h3">Geographic Intelligence</CardTitle>
        </div>
      </CardHeader>
      <div className="space-y-1.5">
        {stateDistribution.map((s, i) => (
          <div key={s.state} className="flex items-center gap-3">
            <span className="text-[10px] font-mono w-4 text-right" style={{ color: "var(--text-muted)" }}>
              {i + 1}
            </span>
            <span className="text-xs font-mono w-6" style={{ color: "var(--text-primary)" }}>{s.state}</span>
            <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "var(--accent-gold)" }}
                initial={{ width: 0 }}
                animate={{ width: `${(s.count / maxCount) * 100}%` }}
                transition={{ ...spring.gentle, delay: i * 0.03 }}
              />
            </div>
            <span className="text-xs font-mono w-12 text-right" style={{ color: "var(--text-secondary)" }}>
              {formatNumber(s.count)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Section: AI Services (Sprint 146) ───────────────────────────────

function AIServicesSection({ health }: { health: CommandCenterData["health"] }) {
  return (
    <Card padding="spacious">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bot size={14} style={{ color: "var(--accent-gold)" }} />
          <CardTitle as="h3">AI Services</CardTitle>
        </div>
      </CardHeader>
      <div className="grid grid-cols-3 gap-4">
        <Link href="/superadmin/barback" className="group">
          <div className="text-center p-3 rounded-xl border transition-colors hover:border-[var(--accent-gold)]/30" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <p className="font-display text-2xl font-bold" style={{ color: health.barbackPendingCount > 0 ? "var(--accent-gold)" : "var(--text-primary)" }}>
              {health.barbackPendingCount}
            </p>
            <p className="text-[10px] font-mono uppercase tracking-wider mt-1" style={{ color: "var(--text-muted)" }}>
              Pending Review
            </p>
          </div>
        </Link>
        <div className="text-center p-3 rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {(() => {
              if (!health.barbackLastCrawl) return "Never";
              const hours = Math.floor((new Date().getTime() - new Date(health.barbackLastCrawl).getTime()) / 3600000);
              return `${hours}h ago`;
            })()}
          </p>
          <p className="text-[10px] font-mono uppercase tracking-wider mt-1" style={{ color: "var(--text-muted)" }}>
            Last Crawl
          </p>
        </div>
        <div className="text-center p-3 rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            ${health.barbackTotalCost.toFixed(2)}
          </p>
          <p className="text-[10px] font-mono uppercase tracking-wider mt-1" style={{ color: "var(--text-muted)" }}>
            Total AI Cost
          </p>
        </div>
      </div>
    </Card>
  );
}

// ── Section: System Health ──────────────────────────────────────────

function SystemHealth({ data }: { data: CommandCenterData["health"] }) {
  const indicators = [
    {
      label: "Pending Claims",
      value: data.pendingClaims,
      icon: <ClipboardCheck size={14} />,
      href: "/superadmin/claims",
      isAlert: data.pendingClaims > 0,
    },
    {
      label: "Pending Beer Reviews",
      value: data.pendingBeerReviews,
      icon: <Bot size={14} />,
      href: "/superadmin/barback",
      isAlert: data.pendingBeerReviews > 0,
    },
    {
      label: "Active POS Connections",
      value: data.posActiveConnections,
      icon: <Zap size={14} />,
      isAlert: false,
    },
    {
      label: "Active API Keys",
      value: data.apiKeysActive,
      icon: <Key size={14} />,
      isAlert: false,
    },
  ];

  return (
    <Card padding="spacious">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield size={14} style={{ color: "var(--accent-gold)" }} />
          <CardTitle as="h3">System Health</CardTitle>
        </div>
      </CardHeader>
      <div className="space-y-3">
        {indicators.map((ind) => {
          const content = (
            <div
              key={ind.label}
              className="flex items-center gap-3 p-3 rounded-xl border transition-colors"
              style={{
                background: "var(--bg)",
                borderColor: ind.isAlert ? "var(--danger)" : "var(--border)",
              }}
            >
              {/* Status dot */}
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: ind.isAlert ? "#C44B3A" : "#4A7C59" }}
              />
              <span style={{ color: ind.isAlert ? "var(--danger)" : "var(--text-muted)" }}>
                {ind.icon}
              </span>
              <span className="text-xs flex-1" style={{ color: "var(--text-primary)" }}>
                {ind.label}
              </span>
              <span
                className="font-mono text-sm font-bold"
                style={{ color: ind.isAlert ? "var(--danger)" : "var(--accent-gold)" }}
              >
                {ind.value}
              </span>
              {"href" in ind && ind.href && (
                <ArrowUpRight size={12} style={{ color: "var(--text-muted)" }} />
              )}
            </div>
          );

          if ("href" in ind && ind.href) {
            return <Link key={ind.label} href={ind.href}>{content}</Link>;
          }
          return <div key={ind.label}>{content}</div>;
        })}
      </div>
    </Card>
  );
}

// ── Section: Recent Activity Feed ──────────────────────────────────

function RecentActivityFeed({ items }: { items: ActivityItem[] }) {
  const [feedFilter, setFeedFilter] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(15);

  const FEED_FILTERS = [
    { label: "All", value: "all" },
    { label: "Signups", value: "signup" },
    { label: "Sessions", value: "session" },
    { label: "Claims", value: "claim" },
    { label: "Achievements", value: "achievement" },
  ];

  const filtered = feedFilter === "all" ? items : items.filter(i => i.type === feedFilter);
  const visible = filtered.slice(0, visibleCount);

  if (items.length === 0) {
    return (
      <Card padding="spacious">
        <CardHeader>
          <CardTitle as="h3">Recent Activity</CardTitle>
        </CardHeader>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>No activity yet — once users start checking in, you will see everything here.</p>
      </Card>
    );
  }

  return (
    <Card padding="spacious">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity size={14} style={{ color: "var(--accent-gold)" }} />
          <CardTitle as="h3">Recent Activity</CardTitle>
        </div>
      </CardHeader>

      {/* Filter Pills */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto">
        {FEED_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setFeedFilter(f.value); setVisibleCount(15); }}
            className="px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-colors"
            style={{
              background: feedFilter === f.value ? "var(--accent-gold)" : "var(--surface-2)",
              color: feedFilter === f.value ? "#0F0E0C" : "var(--text-secondary)",
              fontWeight: feedFilter === f.value ? 600 : 400,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <motion.div
        className="space-y-1"
        variants={stagger.container(0.04)}
        initial="initial"
        animate="animate"
      >
        {visible.map((item, i) => {
          const content = (
            <>
              <span className="text-sm flex-shrink-0">{ACTIVITY_ICONS[item.type] || "📌"}</span>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                  {item.text}
                </span>{" "}
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {item.subtext}
                </span>
              </div>
              <span className="text-[10px] font-mono flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                {formatRelativeTime(item.timestamp)}
              </span>
            </>
          );

          const rowClass = "flex items-center gap-3 px-3 py-2 rounded-xl transition-colors hover:bg-[var(--surface-2)]";

          return (
            <motion.div
              key={item.id}
              variants={stagger.item}
              transition={spring.default}
              className={rowClass}
              style={{ background: i === 0 ? "var(--surface)" : "transparent" }}
            >
              {item.breweryId ? (
                <Link href={`/superadmin/breweries/${item.breweryId}`} className="flex items-center gap-3 flex-1 min-w-0">
                  {content}
                </Link>
              ) : content}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Show More */}
      {filtered.length > visibleCount && (
        <button
          onClick={() => setVisibleCount(v => v + 15)}
          className="w-full mt-3 py-2 rounded-xl text-xs font-mono border transition-colors"
          style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
        >
          Show more ({filtered.length - visibleCount} remaining)
        </button>
      )}
    </Card>
  );
}

// ── Main Component ─────────────────────────────────────────────────

interface CommandCenterClientProps {
  initialData: CommandCenterData;
}

export default function CommandCenterClient({ initialData }: CommandCenterClientProps) {
  const [data, setData] = useState(initialData);
  const [range, setRange] = useState<TimeRange>("30d");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [retentionData, setRetentionData] = useState<RetentionData | null>(null);
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null);

  const fetchData = useCallback(async (selectedRange: TimeRange, isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await fetch(`/api/superadmin/command-center?range=${selectedRange}`);
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

  // Lazy-load retention + funnel (non-blocking)
  useEffect(() => {
    Promise.all([
      fetch("/api/superadmin/metrics/retention").then(r => r.ok ? r.json() : null),
      fetch("/api/superadmin/metrics/funnel").then(r => r.ok ? r.json() : null),
    ]).then(([retRes, funRes]) => {
      if (retRes?.data) setRetentionData(retRes.data);
      if (funRes?.data) setFunnelData(funRes.data);
    }).catch(() => {});
  }, []);

  // Fetch on range change
  const handleRangeChange = useCallback(
    (newRange: TimeRange) => {
      setRange(newRange);
      fetchData(newRange, true);
    },
    [fetchData]
  );

  const attentionCount = data.health.pendingClaims + data.health.pendingBeerReviews;
  const minutesAgo = Math.floor((Date.now() - lastUpdated.getTime()) / 60000);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Monitor size={18} style={{ color: "var(--accent-gold)" }} />
            <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--accent-gold)" }}>
              Command Center
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            Platform Overview
          </h1>
          <p className="text-xs mt-1" style={{ color: attentionCount > 0 ? "var(--danger)" : "var(--text-muted)" }}>
            {attentionCount > 0 ? (
              <>
                <AlertCircle size={10} className="inline mr-1" />
                {attentionCount} item{attentionCount !== 1 ? "s" : ""} need attention
              </>
            ) : (
              "All systems nominal"
            )}
          </p>
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
            <motion.div animate={isRefreshing ? { rotate: 360 } : {}} transition={{ repeat: isRefreshing ? Infinity : 0, duration: 1 }}>
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
        {/* Platform Pulse */}
        <PlatformPulse data={data.pulse} />

        {/* Revenue + Engagement (two columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RevenueIntelligence data={data.revenue} />
          <EngagementMetrics data={data.engagement} />
        </div>

        {/* CRM + Churn Distribution */}
        {(data.crmDistribution?.length > 0 || data.churnDistribution?.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* CRM Segments */}
            {data.crmDistribution?.length > 0 && (
              <Card padding="spacious">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users size={14} style={{ color: "var(--accent-gold)" }} />
                    <CardTitle as="h3">User Segments</CardTitle>
                  </div>
                </CardHeader>
                <div className="space-y-2">
                  {data.crmDistribution.map((seg) => {
                    const maxCount = Math.max(...data.crmDistribution.map(s => s.count));
                    return (
                      <div key={seg.segment} className="flex items-center gap-3">
                        <span className="text-sm w-6 text-center">{seg.emoji}</span>
                        <span className="text-xs font-mono w-14" style={{ color: seg.color }}>{seg.segment.toUpperCase()}</span>
                        <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: seg.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${(seg.count / maxCount) * 100}%` }}
                            transition={spring.gentle}
                          />
                        </div>
                        <span className="text-xs font-mono w-10 text-right" style={{ color: "var(--text-secondary)" }}>
                          {formatNumber(seg.count)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Churn Risk */}
            {data.churnDistribution?.length > 0 && (
              <Card padding="spacious">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertCircle size={14} style={{ color: "var(--accent-gold)" }} />
                    <CardTitle as="h3">Churn Risk</CardTitle>
                  </div>
                </CardHeader>
                <div className="space-y-2">
                  {data.churnDistribution.map((ch) => {
                    const total = data.churnDistribution.reduce((a, b) => a + b.count, 0);
                    const pct = total > 0 ? Math.round((ch.count / total) * 100) : 0;
                    return (
                      <div key={ch.level} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ch.color }} />
                        <span className="text-xs font-mono w-16" style={{ color: ch.color }}>{ch.level}</span>
                        <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: ch.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={spring.gentle}
                          />
                        </div>
                        <span className="text-xs font-mono w-16 text-right" style={{ color: "var(--text-secondary)" }}>
                          {formatNumber(ch.count)} ({pct}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Growth Trends */}
        <GrowthTrends data={data.growth} />

        {/* Advanced Analytics — Retention + Funnel (lazy-loaded) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {retentionData ? (
            <RetentionHeatmap cohorts={retentionData.cohorts} />
          ) : (
            <Card padding="spacious">
              <CardHeader><CardTitle as="h3">Cohort Retention</CardTitle></CardHeader>
              <Skeleton className="h-48 mx-5 mb-5 rounded-xl" />
            </Card>
          )}
          {funnelData ? (
            <UserFunnel steps={funnelData.steps} />
          ) : (
            <Card padding="spacious">
              <CardHeader><CardTitle as="h3">User Funnel</CardTitle></CardHeader>
              <Skeleton className="h-48 mx-5 mb-5 rounded-xl" />
            </Card>
          )}
        </div>

        {/* AI Services (Sprint 146) */}
        <AIServicesSection health={data.health} />

        {/* Geographic + System Health (two columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GeographicIntelligence data={data.geo} />
          <SystemHealth data={data.health} />
        </div>

        {/* Quick Actions */}
        {(data.health.pendingClaims > 0 || data.health.pendingBeerReviews > 0) && (
          <Card padding="spacious">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap size={14} style={{ color: "var(--accent-gold)" }} />
                <CardTitle as="h3">Needs Attention</CardTitle>
              </div>
            </CardHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.health.pendingClaims > 0 && (
                <Link href="/superadmin/claims">
                  <div
                    className="flex items-center gap-3 p-4 rounded-xl border transition-colors hover:bg-[var(--surface-2)]"
                    style={{ borderColor: "var(--danger)", background: "var(--surface)" }}
                  >
                    <ClipboardCheck size={18} style={{ color: "var(--danger)" }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {data.health.pendingClaims} pending claim{data.health.pendingClaims !== 1 ? "s" : ""}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>Review and approve</p>
                    </div>
                    <ArrowUpRight size={14} style={{ color: "var(--text-muted)" }} />
                  </div>
                </Link>
              )}
              {data.health.pendingBeerReviews > 0 && (
                <Link href="/superadmin/barback">
                  <div
                    className="flex items-center gap-3 p-4 rounded-xl border transition-colors hover:bg-[var(--surface-2)]"
                    style={{ borderColor: "var(--danger)", background: "var(--surface)" }}
                  >
                    <Bot size={18} style={{ color: "var(--danger)" }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {data.health.pendingBeerReviews} pending beer{data.health.pendingBeerReviews !== 1 ? "s" : ""}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>Review AI crawled beers</p>
                    </div>
                    <ArrowUpRight size={14} style={{ color: "var(--text-muted)" }} />
                  </div>
                </Link>
              )}
            </div>
          </Card>
        )}

        {/* Recent Activity */}
        <RecentActivityFeed items={data.recentActivity} />
      </div>
    </div>
  );
}
