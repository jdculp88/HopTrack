"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Brain, TrendingUp, TrendingDown, Zap, Heart, Users, AlertTriangle, DollarSign, BarChart3, Activity, Target, Flame } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Sparkline } from "@/components/ui/Sparkline";
import { Skeleton } from "@/components/ui/SkeletonLoader";
import { spring, variants } from "@/lib/animation";
import type {
  IntelligenceData,
  MagicNumberInsight,
  BreweryHealthScore,
} from "@/lib/superadmin-intelligence";

// ─── Main Intelligence Layer ─────────────────────────────────────────────────

export function IntelligenceLayer() {
  const [data, setData] = useState<IntelligenceData | null>(null);
  const [magicNumber, setMagicNumber] = useState<MagicNumberInsight[] | null>(null);
  const [breweryHealth, setBreweryHealth] = useState<{ top10: BreweryHealthScore[]; bottom10: BreweryHealthScore[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch main intelligence data + heavy endpoints in parallel
    Promise.all([
      fetch("/api/superadmin/intelligence").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/superadmin/intelligence/magic-number").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/superadmin/intelligence/brewery-health").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([intRes, magicRes, healthRes]) => {
        if (intRes?.data) setData(intRes.data);
        if (magicRes?.data) setMagicNumber(magicRes.data);
        if (healthRes?.data) setBreweryHealth(healthRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="border-t pt-6 mt-8" style={{ borderColor: "var(--border)" }}>
        <SectionHeader />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <motion.div
      className="border-t pt-6 mt-8"
      style={{ borderColor: "var(--border)" }}
      {...variants.slideUp}
      transition={spring.gentle}
    >
      <SectionHeader />

      <div className="space-y-6">
        {/* Row 1: Magic Number + Revenue */}
        <div className="grid gap-4 sm:grid-cols-2">
          <MagicNumberDashboard data={magicNumber ?? []} />
          <RevenueProjectionSection data={data.revenueV2} />
        </div>

        {/* Row 2: Time-to-Value + Content Velocity */}
        <div className="grid gap-4 sm:grid-cols-2">
          <TimeToValueSection data={data.timeToValue} />
          <ContentVelocitySection data={data.contentVelocity} />
        </div>

        {/* Row 3: Feature Adoption (full width) */}
        <FeatureAdoptionMatrix data={data.featureAdoption} />

        {/* Row 4: Brewery Health + Social Graph */}
        <div className="grid gap-4 sm:grid-cols-2">
          <BreweryHealthSection data={breweryHealth ?? { top10: [], bottom10: [] }} />
          <SocialGraphSection data={data.socialGraph} />
        </div>

        {/* Row 5: Predictive Signals (full width) */}
        <PredictiveSignalsSection data={data.predictiveSignals} />
      </div>
    </motion.div>
  );
}

// ─── Section Header ──────────────────────────────────────────────────────────

function SectionHeader() {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Brain size={18} style={{ color: "var(--accent-gold)" }} />
      <span
        className="text-[10px] font-mono uppercase tracking-widest"
        style={{ color: "var(--accent-gold)" }}
      >
        Intelligence Layer
      </span>
    </div>
  );
}

// ─── Stat Mini Card ──────────────────────────────────────────────────────────

function StatMini({ label, value, unit, trend }: { label: string; value: string | number; unit?: string; trend?: "up" | "down" | null }) {
  return (
    <div className="p-3 rounded-xl" style={{ background: "var(--surface-2)" }}>
      <p className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-display font-bold" style={{ color: "var(--text-primary)" }}>
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
            {unit}
          </span>
        )}
        {trend === "up" && <TrendingUp size={12} className="text-green-500 ml-1" />}
        {trend === "down" && <TrendingDown size={12} className="text-red-500 ml-1" />}
      </div>
    </div>
  );
}

// ─── 1. Magic Number Dashboard ───────────────────────────────────────────────

function MagicNumberDashboard({ data }: { data: MagicNumberInsight[] }) {
  const top = data[0];

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <Zap size={16} style={{ color: "var(--accent-gold)" }} />
        <h3 className="text-sm font-mono uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
          Magic Number
        </h3>
      </div>
      {top ? (
        <>
          <div className="mb-3">
            <span className="text-4xl font-display font-bold" style={{ color: "var(--accent-gold)" }}>
              {top.correlation}x
            </span>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              higher retention when users: <strong style={{ color: "var(--text-primary)" }}>{top.signal}</strong>
            </p>
          </div>
          <div className="space-y-2">
            {data.map((insight) => (
              <div
                key={insight.signal}
                className="flex items-center justify-between text-xs py-1 border-b"
                style={{ borderColor: "var(--border)" }}
              >
                <span className="truncate mr-2" style={{ color: "var(--text-secondary)" }}>
                  {insight.signal}
                </span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-mono font-bold" style={{ color: insight.correlation >= 2 ? "var(--accent-gold)" : "var(--text-muted)" }}>
                    {insight.correlation}x
                  </span>
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    n={insight.cohortSize}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Needs 90+ days of user data to calculate correlations
        </p>
      )}
    </Card>
  );
}

// ─── 2. Time-to-Value ────────────────────────────────────────────────────────

function formatMinutes(mins: number | null): string {
  if (mins === null) return "—";
  if (mins < 60) return `${Math.round(mins)}m`;
  if (mins < 1440) return `${Math.round(mins / 60)}h`;
  return `${Math.round(mins / 1440)}d`;
}

function TimeToValueSection({ data }: { data: IntelligenceData["timeToValue"] }) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <Target size={16} style={{ color: "var(--accent-gold)" }} />
        <h3 className="text-sm font-mono uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
          Time to Value
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <StatMini
          label="Signup → Check-in"
          value={formatMinutes(data.medianSignupToFirstCheckin)}
          trend={data.trends[0]?.current != null && data.trends[0]?.prior != null
            ? data.trends[0].current < data.trends[0].prior ? "up" : "down"
            : null}
        />
        <StatMini
          label="Check-in → Rating"
          value={formatMinutes(data.medianFirstCheckinToFirstRating)}
        />
        <StatMini
          label="Check-in → 2nd Brewery"
          value={formatMinutes(data.medianFirstCheckinToSecondBrewery)}
        />
        <StatMini
          label="Signup → Friend"
          value={formatMinutes(data.medianSignupToFriendAdded)}
        />
      </div>
    </Card>
  );
}

// ─── 3. Content Velocity ─────────────────────────────────────────────────────

function ContentVelocitySection({ data }: { data: IntelligenceData["contentVelocity"] }) {
  const sparkData = data.dailySeries.map((d) => d.checkins);

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity size={16} style={{ color: "var(--accent-gold)" }} />
          <h3 className="text-sm font-mono uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
            Content Velocity
          </h3>
        </div>
        <div className="flex items-center gap-1">
          {data.acceleration > 0 ? (
            <TrendingUp size={14} className="text-green-500" />
          ) : data.acceleration < 0 ? (
            <TrendingDown size={14} className="text-red-500" />
          ) : null}
          <span
            className="text-xs font-mono font-bold"
            style={{ color: data.acceleration > 0 ? "#22c55e" : data.acceleration < 0 ? "#ef4444" : "var(--text-muted)" }}
          >
            {data.acceleration > 0 ? "+" : ""}{data.acceleration}%
          </span>
        </div>
      </div>
      <div className="mb-3">
        <Sparkline data={sparkData} width={200} height={40} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <StatMini label="Check-ins/day" value={data.checkinsPerDay} />
        <StatMini label="Ratings/day" value={data.ratingsPerDay} />
        <StatMini label="Reviews/day" value={data.reviewsPerDay} />
        <StatMini label="New beers/day" value={data.newBeersPerDay} />
      </div>
    </Card>
  );
}

// ─── 4. Feature Adoption Matrix ──────────────────────────────────────────────

function FeatureAdoptionMatrix({ data }: { data: IntelligenceData["featureAdoption"] }) {
  if (data.length === 0) return null;

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 size={16} style={{ color: "var(--accent-gold)" }} />
        <h3 className="text-sm font-mono uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
          Feature Adoption
        </h3>
        <span className="text-[10px] font-mono ml-auto" style={{ color: "var(--text-muted)" }}>
          % of MAU
        </span>
      </div>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.feature} className="flex items-center gap-3">
            <span className="text-xs w-24 flex-shrink-0 truncate" style={{ color: "var(--text-secondary)" }}>
              {item.feature}
            </span>
            <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "var(--accent-gold)" }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(item.adoptionPct, 100)}%` }}
                transition={{ ...spring.gentle, delay: 0.1 }}
              />
            </div>
            <span className="text-xs font-mono font-bold w-14 text-right" style={{ color: "var(--text-primary)" }}>
              {item.adoptionPct}%
            </span>
            <span className="text-[10px] font-mono w-8 text-right" style={{ color: "var(--text-muted)" }}>
              {item.totalUsers}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── 5. Brewery Health Scores ────────────────────────────────────────────────

function HealthScoreCircle({ score }: { score: number }) {
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#eab308" : "#ef4444";
  const circumference = 2 * Math.PI * 18;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
        <circle cx="20" cy="20" r="18" fill="none" stroke="var(--surface-2)" strokeWidth="3" />
        <circle
          cx="20" cy="20" r="18" fill="none"
          stroke={color} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

function BreweryHealthSection({ data }: { data: { top10: BreweryHealthScore[]; bottom10: BreweryHealthScore[] } }) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <Heart size={16} style={{ color: "var(--accent-gold)" }} />
        <h3 className="text-sm font-mono uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
          Brewery Health
        </h3>
      </div>
      {data.top10.length === 0 && data.bottom10.length === 0 ? (
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>No verified breweries yet</p>
      ) : (
        <div className="space-y-3">
          {data.top10.length > 0 && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color: "#22c55e" }}>
                Healthiest
              </p>
              {data.top10.slice(0, 5).map((b) => (
                <div key={b.breweryId} className="flex items-center gap-2 py-1">
                  <HealthScoreCircle score={b.score} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>{b.name}</p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{b.city}, {b.state}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {data.bottom10.length > 0 && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color: "#ef4444" }}>
                Needs Attention
              </p>
              {data.bottom10.slice(0, 5).map((b) => (
                <div key={b.breweryId} className="flex items-center gap-2 py-1">
                  <HealthScoreCircle score={b.score} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>{b.name}</p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{b.city}, {b.state}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// ─── 6. Social Graph Health ──────────────────────────────────────────────────

function SocialGraphSection({ data }: { data: IntelligenceData["socialGraph"] }) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <Users size={16} style={{ color: "var(--accent-gold)" }} />
        <h3 className="text-sm font-mono uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
          Social Graph
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <StatMini label="Avg Friends/User" value={data.avgFriendsPerUser} />
        <StatMini
          label="Orphan Rate"
          value={`${data.orphanRate}%`}
          trend={data.orphanRate > 50 ? "down" : null}
        />
        <StatMini label="Reactions/Session" value={`${data.socialFeatureAdoption.reactions}%`} />
        <StatMini label="Comments/Session" value={`${data.socialFeatureAdoption.comments}%`} />
      </div>
      <div className="mt-2 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between text-[10px]">
          <span style={{ color: "var(--text-muted)" }}>Network Density</span>
          <span className="font-mono font-bold" style={{ color: "var(--text-primary)" }}>{data.networkDensity}%</span>
        </div>
        <div className="flex items-center justify-between text-[10px] mt-1">
          <span style={{ color: "var(--text-muted)" }}>New Follows/Session</span>
          <span className="font-mono font-bold" style={{ color: "var(--text-primary)" }}>{data.socialFeatureAdoption.follows}%</span>
        </div>
      </div>
    </Card>
  );
}

// ─── 7. Predictive Signals ───────────────────────────────────────────────────

function PredictiveSignalsSection({ data }: { data: IntelligenceData["predictiveSignals"] }) {
  const churnRisks = data.filter((s) => s.type === "user_churn");
  const trendingStyles = data.filter((s) => s.type === "trending_style");

  if (churnRisks.length === 0 && trendingStyles.length === 0) return null;

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={16} style={{ color: "var(--accent-gold)" }} />
        <h3 className="text-sm font-mono uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
          Predictive Signals
        </h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {churnRisks.length > 0 && (
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color: "#ef4444" }}>
              Users at Risk ({churnRisks.length})
            </p>
            <div className="space-y-1.5">
              {churnRisks.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate" style={{ color: "var(--text-primary)" }}>{s.name}</p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{s.reason}</p>
                  </div>
                  <div className="w-16 h-2 rounded-full overflow-hidden flex-shrink-0" style={{ background: "var(--surface-2)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${s.probability}%`, background: "#ef4444" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {trendingStyles.length > 0 && (
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color: "#22c55e" }}>
              <Flame size={10} className="inline mr-1" />
              Trending Styles
            </p>
            <div className="space-y-1.5">
              {trendingStyles.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "var(--text-primary)" }}>{s.name}</span>
                  <span className="text-xs font-mono font-bold text-green-500">+{s.probability}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── 8. Revenue Intelligence v2 ──────────────────────────────────────────────

function RevenueProjectionSection({ data }: { data: IntelligenceData["revenueV2"] }) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <DollarSign size={16} style={{ color: "var(--accent-gold)" }} />
        <h3 className="text-sm font-mono uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
          Revenue Projections
        </h3>
      </div>
      <div className="mb-3">
        <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Projected MRR
        </p>
        <span className="text-3xl font-display font-bold" style={{ color: "var(--accent-gold)" }}>
          ${data.projectedMRR.toLocaleString()}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <StatMini
          label="Months to $75K"
          value={data.monthsToTarget === 999 ? "∞" : data.monthsToTarget}
        />
        <StatMini
          label="Est. LTV"
          value={`$${data.estimatedLTV.toLocaleString()}`}
        />
        <StatMini
          label="Trial Conv."
          value={`${data.trialConversionRate}%`}
        />
        <StatMini
          label="Monthly Churn"
          value={`${data.churnRateMonthly}%`}
          trend={data.churnRateMonthly > 5 ? "down" : null}
        />
      </div>
    </Card>
  );
}
