"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  Users, Beer, Star, Trophy, Download, Printer,
  ArrowUpRight, ArrowDownRight, Minus, TrendingUp, TrendingDown,
  ChevronDown,
} from "lucide-react";

// ── Types ──

interface LocationData {
  id: string;
  name: string;
  city: string;
  state: string;
  sessions: number;
  uniqueVisitors: number;
  beersLogged: number;
  avgRating: number | null;
  topBeer: string | null;
  loyaltyRedemptions: number;
  followers: number;
  trend: { sessions: number; uniqueVisitors: number };
  pctOfAvg: { sessions: number; uniqueVisitors: number; beersLogged: number; avgRating: number | null };
  isOutlier: boolean;
  outlierDirection: "above" | "below" | null;
}

interface ComparisonData {
  brand: { id: string; name: string };
  range: string;
  locations: LocationData[];
  brandTotals: {
    sessions: number;
    uniqueVisitors: number;
    beersLogged: number;
    avgRating: number | null;
    loyaltyRedemptions: number;
    followers: number;
  };
  brandAverages: {
    sessions: number;
    uniqueVisitors: number;
    beersLogged: number;
    avgRating: number | null;
  };
}

type TimeRange = "7d" | "30d" | "90d";
type SortMetric = "sessions" | "uniqueVisitors" | "beersLogged" | "avgRating";

const RANGE_OPTIONS: { key: TimeRange; label: string }[] = [
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "90d", label: "90 Days" },
];

const SORT_OPTIONS: { key: SortMetric; label: string; icon: typeof Users }[] = [
  { key: "sessions", label: "Sessions", icon: Users },
  { key: "uniqueVisitors", label: "Visitors", icon: Users },
  { key: "beersLogged", label: "Beers", icon: Beer },
  { key: "avgRating", label: "Rating", icon: Star },
];

const CHART_COLORS = ["#D4A843", "#E8841A", "#4A7C59", "#C44B3A", "#A89F8C", "#6B6456", "#8B6E3C", "#5C8A6E"];

// ── Helpers ──

function TrendArrow({ value }: { value: number }) {
  if (value > 0) return (
    <span className="flex items-center gap-0.5 text-xs font-mono" style={{ color: "#4A7C59" }}>
      <ArrowUpRight size={12} /> +{value}%
    </span>
  );
  if (value < 0) return (
    <span className="flex items-center gap-0.5 text-xs font-mono" style={{ color: "#C44B3A" }}>
      <ArrowDownRight size={12} /> {value}%
    </span>
  );
  return <Minus size={14} style={{ color: "var(--text-muted)" }} />;
}

function BenchmarkBadge({ pct }: { pct: number | null }) {
  if (pct === null) return <span style={{ color: "var(--text-muted)" }}>—</span>;
  const color = pct >= 110 ? "#4A7C59" : pct >= 90 ? "var(--accent-gold)" : "#C44B3A";
  return (
    <span className="font-mono text-xs font-semibold" style={{ color }}>
      {pct}%
    </span>
  );
}

function OutlierPill({ direction }: { direction: "above" | "below" }) {
  const isAbove = direction === "above";
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{
        background: isAbove ? "color-mix(in srgb, #4A7C59 15%, transparent)" : "color-mix(in srgb, #C44B3A 15%, transparent)",
        color: isAbove ? "#4A7C59" : "#C44B3A",
      }}
    >
      {isAbove ? "Outperforming" : "Needs Attention"}
    </span>
  );
}

// Custom tooltip for Recharts
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border px-3 py-2 text-xs" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

// ── Main Component ──

interface BrandReportsClientProps {
  brandId: string;
  brandSlug: string;
  initialData: ComparisonData | null;
  locationCount: number;
}

export function BrandReportsClient({ brandId, brandSlug: _brandSlug, initialData, locationCount }: BrandReportsClientProps) {
  const [data, setData] = useState<ComparisonData | null>(initialData);
  const [range, setRange] = useState<TimeRange>("30d");
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<SortMetric>("sessions");
  const [benchmarkExpanded, setBenchmarkExpanded] = useState(true);

  const fetchData = useCallback(async (newRange: TimeRange) => {
    setRange(newRange);
    setLoading(true);
    try {
      const res = await fetch(`/api/brand/${brandId}/analytics/comparison?range=${newRange}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) setData(json.data);
      }
    } catch { /* keep existing data */ }
    setLoading(false);
  }, [brandId]);

  if (!data || locationCount === 0) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto pt-16 lg:pt-8">
        <div className="rounded-2xl border p-8 text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <Trophy size={40} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
          <h3 className="font-display text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            No Location Data Yet
          </h3>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Add locations to your brand to see cross-location reports and benchmarks.
          </p>
        </div>
      </div>
    );
  }

  const { locations, brandTotals, brandAverages } = data;
  const sortedLocations = [...locations].sort((a, b) => {
    const aVal = a[sortBy] ?? 0;
    const bVal = b[sortBy] ?? 0;
    return (bVal as number) - (aVal as number);
  });
  const maxForSort = Math.max(...sortedLocations.map(l => (l[sortBy] ?? 0) as number), 1);

  // Chart data for comparison bars
  const chartMetrics: { key: SortMetric; label: string }[] = [
    { key: "sessions", label: "Sessions" },
    { key: "uniqueVisitors", label: "Unique Visitors" },
    { key: "beersLogged", label: "Beers Logged" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto pt-16 lg:pt-8 space-y-6">
      {/* Controls: Time Range + Export */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {RANGE_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => fetchData(opt.key)}
              disabled={loading}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: range === opt.key ? "var(--accent-gold)" : "var(--surface)",
                color: range === opt.key ? "var(--bg)" : "var(--text-secondary)",
                border: `1px solid ${range === opt.key ? "var(--accent-gold)" : "var(--border)"}`,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/brand/${brandId}/analytics/export?range=${range}`}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-opacity hover:opacity-80"
            style={{ background: "var(--surface)", borderColor: "var(--accent-gold)", color: "var(--accent-gold)" }}
          >
            <Download size={13} />
            CSV
          </a>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-opacity hover:opacity-80"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            <Printer size={13} />
            Print
          </button>
        </div>
      </div>

      {/* Brand Totals Summary */}
      <div className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <h2 className="font-display text-base font-bold mb-4" style={{ color: "var(--text-primary)" }}>
          Brand Totals — Last {range.replace("d", " Days")}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Sessions", value: brandTotals.sessions },
            { label: "Unique Visitors", value: brandTotals.uniqueVisitors },
            { label: "Beers Logged", value: brandTotals.beersLogged },
            { label: "Avg Rating", value: brandTotals.avgRating ? `${brandTotals.avgRating}★` : "—" },
            { label: "Redemptions", value: brandTotals.loyaltyRedemptions },
            { label: "Followers", value: brandTotals.followers },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="font-display text-2xl font-bold" style={{ color: "var(--accent-gold)" }}>
                {typeof value === "number" ? value.toLocaleString() : value}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Bar Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        {chartMetrics.map(({ key, label }) => {
          const chartData = locations.map((l, i) => ({
            name: l.name.length > 18 ? l.name.substring(0, 16) + "…" : l.name,
            value: l[key] as number,
            fill: CHART_COLORS[i % CHART_COLORS.length],
          })).sort((a, b) => b.value - a.value);

          return (
            <div key={key} className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>{label}</h3>
              <ResponsiveContainer width="100%" height={locations.length * 36 + 10}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="value" name={label} radius={[0, 6, 6, 0]} barSize={20}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>

      {/* Location Leaderboard */}
      <div className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-bold" style={{ color: "var(--text-primary)" }}>
            Location Leaderboard
          </h2>
          <div className="flex gap-1">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                style={{
                  background: sortBy === opt.key ? "color-mix(in srgb, var(--accent-gold) 15%, transparent)" : "transparent",
                  color: sortBy === opt.key ? "var(--accent-gold)" : "var(--text-muted)",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {sortedLocations.map((loc, i) => {
            const value = (loc[sortBy] ?? 0) as number;
            const pct = maxForSort > 0 ? (value / maxForSort) * 100 : 0;

            return (
              <motion.div
                key={loc.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3"
              >
                <span className="w-6 text-right font-mono text-xs font-bold" style={{ color: i === 0 ? "var(--accent-gold)" : "var(--text-muted)" }}>
                  #{i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                      {loc.name}
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {loc.city}, {loc.state}
                    </span>
                    {loc.isOutlier && loc.outlierDirection && (
                      <OutlierPill direction={loc.outlierDirection} />
                    )}
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: i * 0.05 }}
                      style={{ background: i === 0 ? "var(--accent-gold)" : "color-mix(in srgb, var(--accent-gold) 60%, var(--surface-2))" }}
                    />
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <span className="font-mono text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    {sortBy === "avgRating" && value ? `${value}★` : value.toLocaleString()}
                  </span>
                  <TrendArrow value={loc.trend.sessions} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Performance Benchmark Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <button
          onClick={() => setBenchmarkExpanded(!benchmarkExpanded)}
          className="w-full flex items-center justify-between p-5 text-left"
        >
          <h2 className="font-display text-base font-bold" style={{ color: "var(--text-primary)" }}>
            Performance Benchmarks
          </h2>
          <motion.div animate={{ rotate: benchmarkExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={18} style={{ color: "var(--text-muted)" }} />
          </motion.div>
        </button>

        <AnimatePresence>
          {benchmarkExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5">
                <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                  Each metric shown as % of brand average. <span style={{ color: "#4A7C59" }}>Green</span> = above 110%, <span style={{ color: "var(--accent-gold)" }}>Gold</span> = 90-110%, <span style={{ color: "#C44B3A" }}>Red</span> = below 90%.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                        <th className="text-left py-2 pr-4 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Location</th>
                        <th className="text-center py-2 px-3 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Sessions</th>
                        <th className="text-center py-2 px-3 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Visitors</th>
                        <th className="text-center py-2 px-3 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Beers</th>
                        <th className="text-center py-2 px-3 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Rating</th>
                        <th className="text-center py-2 px-3 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedLocations.map((loc) => (
                        <tr key={loc.id} className="border-b last:border-b-0" style={{ borderColor: "color-mix(in srgb, var(--border) 50%, transparent)" }}>
                          <td className="py-2.5 pr-4">
                            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{loc.name}</span>
                          </td>
                          <td className="text-center py-2.5 px-3">
                            <BenchmarkBadge pct={loc.pctOfAvg.sessions} />
                          </td>
                          <td className="text-center py-2.5 px-3">
                            <BenchmarkBadge pct={loc.pctOfAvg.uniqueVisitors} />
                          </td>
                          <td className="text-center py-2.5 px-3">
                            <BenchmarkBadge pct={loc.pctOfAvg.beersLogged} />
                          </td>
                          <td className="text-center py-2.5 px-3">
                            <BenchmarkBadge pct={loc.pctOfAvg.avgRating} />
                          </td>
                          <td className="text-center py-2.5 px-3">
                            {loc.trend.sessions > 0 ? (
                              <TrendingUp size={14} style={{ color: "#4A7C59" }} className="mx-auto" />
                            ) : loc.trend.sessions < 0 ? (
                              <TrendingDown size={14} style={{ color: "#C44B3A" }} className="mx-auto" />
                            ) : (
                              <Minus size={14} style={{ color: "var(--text-muted)" }} className="mx-auto" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t" style={{ borderColor: "var(--border)" }}>
                        <td className="py-2.5 pr-4">
                          <span className="text-xs font-semibold" style={{ color: "var(--accent-gold)" }}>Brand Average</span>
                        </td>
                        <td className="text-center py-2.5 px-3 font-mono text-xs" style={{ color: "var(--text-muted)" }}>{brandAverages.sessions}</td>
                        <td className="text-center py-2.5 px-3 font-mono text-xs" style={{ color: "var(--text-muted)" }}>{brandAverages.uniqueVisitors}</td>
                        <td className="text-center py-2.5 px-3 font-mono text-xs" style={{ color: "var(--text-muted)" }}>{brandAverages.beersLogged}</td>
                        <td className="text-center py-2.5 px-3 font-mono text-xs" style={{ color: "var(--text-muted)" }}>{brandAverages.avgRating ? `${brandAverages.avgRating}★` : "—"}</td>
                        <td className="text-center py-2.5 px-3"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          nav, header, [data-no-print], .print\\:hidden { display: none !important; }
          body { background: white !important; color: black !important; }
          * { color: black !important; background: white !important; border-color: #ddd !important; }
        }
      `}</style>
    </div>
  );
}
