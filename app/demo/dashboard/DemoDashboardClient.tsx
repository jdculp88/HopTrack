"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Beer, Users, TrendingUp, Award, Clock, Heart,
  List, BarChart3, Gift, QrCode, Eye, Calendar,
  ArrowRight, ArrowUpRight, Zap, RefreshCw, Lock,
} from "lucide-react";
import { Sparkline } from "@/components/ui/Sparkline";
import { formatDuration, formatTrend } from "@/lib/kpi";
import type { BreweryKPIs, BreweryKPISparklines } from "@/lib/kpi";
import type { ROIData } from "@/lib/roi";
import { formatROIMessage } from "@/lib/roi";
import { stagger, spring } from "@/lib/animation";
import type { ActivityItem } from "@/app/(brewery-admin)/brewery-admin/[brewery_id]/DashboardClient";

interface RecentVisit {
  id: string;
  displayName: string;
  beerCount: number;
  topBeerName: string | null;
  sessionAvg: string | null;
  time: string;
}

interface DemoDashboardProps {
  breweryName: string;
  city: string;
  state: string;
  breweryType: string;
  todayVisitCount: number;
  todayBeersCount: number;
  todayNewFollowers: number;
  activeSessionCount: number;
  totalVisits: number;
  totalBeersLogged: number;
  uniqueVisitors: number;
  thisWeekTotal: number;
  weekTrend: number | null;
  weeklyData: number[];
  totalFollowerCount: number;
  onTapCount: number;
  totalBeerCount: number;
  kpis: BreweryKPIs;
  sparklines: BreweryKPISparklines;
  roi: ROIData;
  topBeersList: { name: string; style: string; count: number; totalRating: number; ratedCount: number }[];
  activityFeed: ActivityItem[];
  recentVisits: RecentVisit[];
  hasLoyalty: boolean;
}

// Disabled link — looks like a link but shows tooltip on hover
function DisabledAction({ label, icon: Icon, desc }: { label: string; icon: any; desc: string }) {
  return (
    <div
      className="rounded-xl border p-3 opacity-50 cursor-not-allowed relative group"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <Icon size={16} className="mb-1.5" style={{ color: "var(--text-muted)" }} />
      <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>{label}</p>
      <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>{desc}</p>
      {/* Tooltip */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
        style={{ background: "var(--accent-gold)", color: "#0F0E0C" }}>
        <Lock size={9} className="inline mr-1" />
        Claim to unlock
      </div>
    </div>
  );
}

export default function DemoDashboardClient({
  breweryName, city, state, breweryType,
  todayVisitCount, todayBeersCount, todayNewFollowers, activeSessionCount,
  totalVisits, thisWeekTotal, weekTrend, weeklyData,
  totalFollowerCount, onTapCount, totalBeerCount,
  kpis, sparklines, roi,
  topBeersList, activityFeed, recentVisits, hasLoyalty,
}: DemoDashboardProps) {
  return (
    <motion.div
      className="p-6 lg:p-8 max-w-6xl mx-auto"
      initial="initial"
      animate="animate"
      variants={stagger.container(0.04)}
    >
      {/* ── Demo Banner ─────────────────────────────────────────── */}
      <motion.div
        variants={stagger.item}
        transition={spring.default}
        className="rounded-2xl border-2 p-5 mb-6"
        style={{
          borderColor: "var(--accent-gold)",
          background: "color-mix(in srgb, var(--accent-gold) 6%, var(--surface))",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: "var(--accent-gold)" }}>
              Live Demo
            </p>
            <p className="text-sm" style={{ color: "var(--text-primary)" }}>
              This is a real dashboard with sample data from <strong>{breweryName}</strong>. Claim your brewery to get your own.
            </p>
          </div>
          <Link
            href="/brewery-admin/claim"
            className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full whitespace-nowrap flex-shrink-0 transition-opacity hover:opacity-90"
            style={{ background: "var(--accent-gold)", color: "#0F0E0C" }}
          >
            Claim your brewery <ArrowRight size={14} />
          </Link>
        </div>
      </motion.div>

      {/* ── Header ──────────────────────────────────────────────── */}
      <motion.div variants={stagger.item} transition={spring.default} className="mb-6">
        <p className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: "var(--accent-gold)" }}>
          Owner · Verified
        </p>
        <h1 className="font-sans text-3xl lg:text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
          {breweryName}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          {city}, {state} · {breweryType?.replace(/_/g, " ")}
        </p>
      </motion.div>

      {/* ── Today's Snapshot ─────────────────────────────────────── */}
      <motion.div
        variants={stagger.item}
        transition={spring.default}
        className="rounded-2xl border p-4 mb-6"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Zap size={14} style={{ color: "var(--accent-gold)" }} />
          <h2 className="text-xs font-mono uppercase tracking-wider font-bold" style={{ color: "var(--accent-gold)" }}>
            Today
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <span className="text-sm" style={{ color: "var(--text-primary)" }}>
            <strong className="font-display text-lg">{todayVisitCount}</strong>{" "}
            <span style={{ color: "var(--text-muted)" }}>visit{todayVisitCount !== 1 ? "s" : ""}</span>
          </span>
          <span className="text-sm" style={{ color: "var(--text-primary)" }}>
            <strong className="font-display text-lg">{todayBeersCount}</strong>{" "}
            <span style={{ color: "var(--text-muted)" }}>beer{todayBeersCount !== 1 ? "s" : ""} poured</span>
          </span>
          {todayNewFollowers > 0 && (
            <span className="text-sm" style={{ color: "var(--text-primary)" }}>
              <strong className="font-display text-lg">{todayNewFollowers}</strong>{" "}
              <span style={{ color: "var(--text-muted)" }}>new follower{todayNewFollowers !== 1 ? "s" : ""}</span>
            </span>
          )}
          {activeSessionCount > 0 && (
            <span className="flex items-center gap-1.5 text-sm">
              <span className="w-2 h-2 rounded-full inline-block animate-pulse" style={{ background: "#22c55e" }} />
              <strong className="font-display text-lg" style={{ color: "var(--text-primary)" }}>{activeSessionCount}</strong>{" "}
              <span style={{ color: "var(--text-muted)" }}>drinking now</span>
            </span>
          )}
        </div>
      </motion.div>

      {/* ── KPI Cards Row 1 ──────────────────────────────────────── */}
      <motion.div variants={stagger.item} transition={spring.default} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Today's Visits */}
        <div className="rounded-2xl p-5 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Today Visits</p>
            <Users size={14} style={{ color: "var(--accent-gold)" }} />
          </div>
          <div className="flex items-end justify-between">
            <p className="font-display text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{todayVisitCount}</p>
            <Sparkline data={weeklyData} />
          </div>
          <p className="text-[10px] mt-2 truncate" style={{ color: "var(--text-muted)" }}>
            {totalVisits.toLocaleString()} all-time
          </p>
        </div>

        {/* Weekly Trend */}
        <div className="rounded-2xl p-5 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>This Week</p>
            <TrendingUp size={14} style={{ color: "var(--accent-gold)" }} />
          </div>
          <p className="font-display text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{thisWeekTotal}</p>
          <div className="flex items-center gap-1 mt-2">
            {weekTrend !== null ? (
              <>
                <span className="text-[10px] font-mono font-bold" style={{ color: weekTrend >= 0 ? "#22c55e" : "#ef4444" }}>
                  {weekTrend >= 0 ? "+" : ""}{weekTrend}%
                </span>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>vs last week</span>
              </>
            ) : (
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                {thisWeekTotal} visit{thisWeekTotal !== 1 ? "s" : ""} this week
              </span>
            )}
          </div>
        </div>

        {/* On Tap */}
        <div className="rounded-2xl p-5 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>On Tap</p>
            <Beer size={14} style={{ color: "var(--accent-gold)" }} />
          </div>
          <p className="font-display text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            {onTapCount}
          </p>
          <p className="text-[10px] mt-2 truncate" style={{ color: "var(--text-muted)" }}>
            {onTapCount}/{totalBeerCount} on tap
          </p>
        </div>

        {/* Followers */}
        <div className="rounded-2xl p-5 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Followers</p>
            <Heart size={14} style={{ color: "var(--accent-gold)" }} />
          </div>
          <p className="font-display text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{totalFollowerCount}</p>
          <p className="text-[10px] mt-2 truncate" style={{ color: todayNewFollowers > 0 ? "#22c55e" : "var(--text-muted)" }}>
            {todayNewFollowers > 0 ? `+${todayNewFollowers} today` : "No new followers today"}
          </p>
        </div>
      </motion.div>

      {/* ── KPI Cards Row 2 — The Pulse ──────────────────────────── */}
      <motion.div variants={stagger.item} transition={spring.default} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Avg Duration */}
        <div className="rounded-2xl p-5 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Avg Duration</p>
            <Clock size={14} style={{ color: "var(--accent-gold)" }} />
          </div>
          <div className="flex items-end justify-between">
            <p className="font-display text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              {formatDuration(kpis.avgSessionDuration)}
            </p>
            <Sparkline data={sparklines.avgDuration} />
          </div>
          {(() => {
            const trend = formatTrend(kpis.avgSessionDurationTrend);
            return trend ? (
              <div className="flex items-center gap-1 mt-2">
                <span className="text-[10px] font-mono font-bold" style={{ color: trend.color }}>{trend.text}</span>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>vs prior 30d</span>
              </div>
            ) : (
              <p className="text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>Last 30 days</p>
            );
          })()}
        </div>

        {/* Beers Per Visit */}
        <div className="rounded-2xl p-5 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Beers / Visit</p>
            <Beer size={14} style={{ color: "var(--accent-gold)" }} />
          </div>
          <div className="flex items-end justify-between">
            <p className="font-display text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              {kpis.beersPerVisit ?? "—"}
            </p>
            <Sparkline data={sparklines.beersPerVisit} />
          </div>
          {(() => {
            const trend = formatTrend(kpis.beersPerVisitTrend);
            return trend ? (
              <div className="flex items-center gap-1 mt-2">
                <span className="text-[10px] font-mono font-bold" style={{ color: trend.color }}>{trend.text}</span>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>vs prior 30d</span>
              </div>
            ) : (
              <p className="text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>Avg pours per session</p>
            );
          })()}
        </div>

        {/* Returning */}
        <div className="rounded-2xl p-5 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Returning</p>
            <RefreshCw size={14} style={{ color: "var(--accent-gold)" }} />
          </div>
          <div className="flex items-end justify-between">
            <p className="font-display text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              {kpis.returningVisitorPct !== null ? `${kpis.returningVisitorPct}%` : "—"}
            </p>
            <Sparkline data={sparklines.returningPct} />
          </div>
          {kpis.newVisitorPct !== null ? (
            <p className="text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>
              {kpis.newVisitorPct}% new · {kpis.returningVisitorPct}% returning
            </p>
          ) : (
            <p className="text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>Visitor breakdown</p>
          )}
        </div>

        {/* Retention */}
        <div className="rounded-2xl p-5 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Retention</p>
            <Award size={14} style={{ color: "var(--accent-gold)" }} />
          </div>
          <div className="flex items-end justify-between">
            <p className="font-display text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              {kpis.retentionRate !== null ? `${kpis.retentionRate}%` : "—"}
            </p>
            <Sparkline data={sparklines.retention} />
          </div>
          {(() => {
            const trend = formatTrend(kpis.retentionTrend, "pp");
            return trend ? (
              <div className="flex items-center gap-1 mt-2">
                <span className="text-[10px] font-mono font-bold" style={{ color: trend.color }}>{trend.text}</span>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>vs prior period</span>
              </div>
            ) : (
              <p className="text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>30-day return rate</p>
            );
          })()}
        </div>
      </motion.div>

      {/* ── Main Content Grid ────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Left Column: Activity + Top Beers + Recent Visits */}
        <div className="lg:col-span-2 space-y-6">

          {/* Recent Activity Feed */}
          <motion.div variants={stagger.item} transition={spring.default}>
            <h2 className="font-display text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>Recent Activity</h2>
            {activityFeed.length === 0 ? (
              <div className="rounded-2xl border p-6 text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No recent activity yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {activityFeed.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, ...spring.default }}
                    className="flex items-center gap-3 p-3 rounded-xl border"
                    style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                  >
                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{item.text}</p>
                      <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{item.subtext}</p>
                    </div>
                    <span className="text-[10px] flex-shrink-0" style={{ color: "var(--text-muted)" }}>{item.time}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Top Beers */}
          {topBeersList.length > 0 && (
            <motion.div variants={stagger.item} transition={spring.default}>
              <h2 className="font-display text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>Top Beers</h2>
              <div className="space-y-3">
                {topBeersList.map((beer, i) => {
                  const beerAvg = beer.ratedCount > 0 ? (beer.totalRating / beer.ratedCount).toFixed(1) : null;
                  const maxCount = topBeersList[0]?.count ?? 1;
                  const barWidth = Math.max(12, (beer.count / maxCount) * 100);

                  return (
                    <div key={beer.name} className="flex items-center gap-4 p-4 rounded-2xl border"
                      style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                      <span className="font-display text-2xl font-bold w-8 flex-shrink-0"
                        style={{ color: i === 0 ? "var(--accent-gold)" : "var(--text-muted)" }}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" style={{ color: "var(--text-primary)" }}>{beer.name}</p>
                        <p className="text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>{beer.style}</p>
                        <div className="h-1 rounded-full" style={{ background: "var(--border)", width: "100%" }}>
                          <div className="h-1 rounded-full transition-all" style={{ background: "var(--accent-gold)", width: `${barWidth}%` }} />
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-mono font-bold" style={{ color: "var(--text-primary)" }}>
                          {beer.count} pour{beer.count !== 1 ? "s" : ""}
                        </p>
                        {beerAvg && (
                          <p className="text-xs" style={{ color: "var(--accent-gold)" }}>{beerAvg} avg</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Recent Visits */}
          <motion.div variants={stagger.item} transition={spring.default}>
            <h2 className="font-display text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>Recent Visits</h2>
            <div className="space-y-2">
              {recentVisits.length === 0 ? (
                <div className="rounded-2xl p-8 text-center border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                  <p className="text-3xl mb-2">🍺</p>
                  <p className="font-display" style={{ color: "var(--text-primary)" }}>No sessions yet</p>
                </div>
              ) : (
                recentVisits.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl border"
                    style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>
                      {s.displayName[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{s.displayName}</p>
                      <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                        {s.beerCount > 0
                          ? `${s.beerCount} beer${s.beerCount !== 1 ? "s" : ""}${s.topBeerName ? ` · ${s.topBeerName}` : ""}`
                          : "Brewery visit"
                        }
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {s.sessionAvg && (
                        <p className="text-xs font-mono" style={{ color: "var(--accent-gold)" }}>{s.sessionAvg}</p>
                      )}
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{s.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* ── Right Column ────────────────────────────────────────── */}
        <div className="space-y-6">

          {/* ROI Preview */}
          <motion.div variants={stagger.item} transition={spring.default}>
            <div className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={14} style={{ color: "var(--accent-gold)" }} />
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold" style={{ color: "var(--accent-gold)" }}>
                  ROI This Month
                </h3>
              </div>
              {roi.roiMultiple > 0 ? (
                <p className="font-display text-4xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                  {roi.roiMultiple}x
                </p>
              ) : (
                <p className="font-display text-4xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                  ${roi.estimatedRevenue.toLocaleString()}
                </p>
              )}
              <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>{formatROIMessage(roi)}</p>
              <div className="grid grid-cols-3 gap-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                <div>
                  <p className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>Visits</p>
                  <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{roi.loyaltyDrivenVisits}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>Revenue</p>
                  <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>${roi.estimatedRevenue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>Cost</p>
                  <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>${roi.subscriptionCost}/mo</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions — Disabled */}
          <motion.div variants={stagger.item} transition={spring.default}>
            <h3 className="font-display font-bold mb-3" style={{ color: "var(--text-primary)" }}>Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <DisabledAction label="Tap List" icon={List} desc="Manage beers" />
              <DisabledAction label="Analytics" icon={BarChart3} desc="View trends" />
              <DisabledAction label="Loyalty" icon={Gift} desc="Programs" />
              <DisabledAction label="QR Tents" icon={QrCode} desc="Table tents" />
              <DisabledAction label="Customers" icon={Users} desc="Insights" />
              <DisabledAction label="Events" icon={Calendar} desc="Manage events" />
              <DisabledAction label="Sessions" icon={Clock} desc="All visits" />
              <DisabledAction label="Public Page" icon={Eye} desc="View as customer" />
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div variants={stagger.item} transition={spring.default}>
            <div
              className="rounded-2xl p-5 text-center"
              style={{
                background: "color-mix(in srgb, var(--accent-gold) 8%, var(--surface))",
                border: "1px solid color-mix(in srgb, var(--accent-gold) 20%, var(--border))",
              }}
            >
              <p className="font-display text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                This could be your brewery
              </p>
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                14-day free trial · No credit card · Set up in 20 minutes
              </p>
              <Link
                href="/brewery-admin/claim"
                className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full transition-opacity hover:opacity-90"
                style={{ background: "var(--accent-gold)", color: "#0F0E0C" }}
              >
                Claim your brewery free <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
