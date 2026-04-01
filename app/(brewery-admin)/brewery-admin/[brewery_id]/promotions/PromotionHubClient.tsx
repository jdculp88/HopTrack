"use client";

import { motion } from "framer-motion";
import { Megaphone, Trophy, Crown, Eye, MousePointerClick, Users, TrendingUp, Plus, Lock, ArrowUpRight, Sparkles, Activity } from "lucide-react";
import Link from "next/link";

interface PromotionSummary {
  totalActivePromotions: number;
  totalImpressions: number;
  totalEngagement: number;
  estimatedReach: number;
}

interface AdStats {
  activeCount: number;
  totalCount: number;
  totalImpressions: number;
  totalClicks: number;
  ctr: number;
}

interface ChallengeStats {
  activeSponsoredCount: number;
  activeStandardCount: number;
  totalImpressions: number;
  totalJoins: number;
  totalParticipants: number;
}

interface MugClubStats {
  activeCount: number;
  totalCount: number;
  totalMembers: number;
  projectedRevenue: number;
}

interface ActivityItem {
  type: string;
  icon: string;
  text: string;
  time: string;
}

interface PromotionHubProps {
  breweryId: string;
  tier: string;
  summary: PromotionSummary;
  ads: AdStats;
  challenges: ChallengeStats;
  mugClubs: MugClubStats;
  recentActivity: ActivityItem[];
  hopRouteEligible: boolean;
}

export function PromotionHubClient({
  breweryId,
  tier,
  summary,
  ads,
  challenges,
  mugClubs,
  recentActivity,
  hopRouteEligible,
}: PromotionHubProps) {
  const isPremium = ["cask", "barrel"].includes(tier);
  const hasAnyPromos = summary.totalActivePromotions > 0 || challenges.activeStandardCount > 0;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto pt-16 lg:pt-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)", color: "var(--accent-gold)" }}
          >
            <Megaphone size={20} />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              Promotion Hub
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Manage all your promotional tools in one place
            </p>
          </div>
        </div>
      </div>

      {/* KPI Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Active Promotions"
          value={summary.totalActivePromotions + challenges.activeStandardCount}
          icon={<Activity size={14} />}
        />
        <KpiCard
          label="Total Impressions"
          value={summary.totalImpressions}
          icon={<Eye size={14} />}
          format="compact"
        />
        <KpiCard
          label="Total Engagement"
          value={summary.totalEngagement}
          icon={<MousePointerClick size={14} />}
          format="compact"
        />
        <KpiCard
          label="Est. Reach"
          value={summary.estimatedReach}
          icon={<TrendingUp size={14} />}
          format="compact"
        />
      </div>

      {/* Per-Tool Quick Cards */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Ad Campaigns */}
        <ToolCard
          title="Ad Campaigns"
          icon={<Megaphone size={18} />}
          stats={[
            { label: "Active", value: String(ads.activeCount) },
            { label: "Impressions", value: formatCompact(ads.totalImpressions) },
            { label: "CTR", value: `${ads.ctr}%` },
          ]}
          href={`/brewery-admin/${breweryId}/ads`}
          locked={!isPremium}
          lockMessage="Geo-targeted ad campaigns are available on Cask and Barrel tiers."
          breweryId={breweryId}
          emptyMessage={isPremium && ads.totalCount === 0 ? "Create your first ad campaign to reach craft beer fans near you." : undefined}
          createLabel="Create Ad"
        />

        {/* Sponsored Challenges */}
        <ToolCard
          title="Challenges"
          icon={<Trophy size={18} />}
          stats={[
            { label: "Sponsored", value: String(challenges.activeSponsoredCount) },
            { label: "Standard", value: String(challenges.activeStandardCount) },
            { label: "Participants", value: formatCompact(challenges.totalParticipants) },
          ]}
          href={`/brewery-admin/${breweryId}/challenges`}
          locked={false}
          breweryId={breweryId}
          emptyMessage={challenges.activeSponsoredCount === 0 && challenges.activeStandardCount === 0 ? "Create challenges to drive repeat visits and reward loyal customers." : undefined}
          createLabel="Create Challenge"
          badge={!isPremium ? "Sponsored challenges require Cask tier" : undefined}
        />

        {/* Mug Clubs */}
        <ToolCard
          title="Mug Clubs"
          icon={<Crown size={18} />}
          stats={[
            { label: "Active Clubs", value: String(mugClubs.activeCount) },
            { label: "Members", value: String(mugClubs.totalMembers) },
            { label: "Annual Rev", value: mugClubs.projectedRevenue > 0 ? `$${(mugClubs.projectedRevenue / 100).toLocaleString()}` : "$0" },
          ]}
          href={`/brewery-admin/${breweryId}/mug-clubs`}
          locked={!isPremium}
          lockMessage="Digital mug club memberships are available on Cask and Barrel tiers."
          breweryId={breweryId}
          emptyMessage={isPremium && mugClubs.totalCount === 0 ? "Launch a mug club to build recurring membership revenue." : undefined}
          createLabel="Create Mug Club"
        />
      </div>

      {/* Bottom Row: Activity + Quick Actions + HopRoute */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div
          className="lg:col-span-2 rounded-2xl border p-5"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity size={14} style={{ color: "var(--accent-gold)" }} />
            <h2 className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
              Recent Activity
            </h2>
          </div>
          {recentActivity.length > 0 ? (
            <div className="space-y-2">
              {recentActivity.map((item, i) => (
                <motion.div
                  key={`${item.type}-${i}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 py-2 px-3 rounded-xl text-sm"
                  style={{ background: i === 0 ? "var(--surface-2)" : "transparent" }}
                >
                  <span className="text-base flex-shrink-0">{item.icon}</span>
                  <span className="flex-1 truncate" style={{ color: "var(--text-primary)" }}>{item.text}</span>
                  <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                    {formatTimeAgo(item.time)}
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-3xl mb-3">📊</p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No promotional activity yet. Create your first campaign to get started.
              </p>
            </div>
          )}
        </div>

        {/* Right column: Quick Actions + HopRoute */}
        <div className="space-y-4">
          {/* Quick Create */}
          <div
            className="rounded-2xl border p-5"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Plus size={14} style={{ color: "var(--accent-gold)" }} />
              <h2 className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
                Quick Create
              </h2>
            </div>
            <div className="space-y-2">
              <QuickAction
                icon={<Megaphone size={14} />}
                label="New Ad Campaign"
                href={`/brewery-admin/${breweryId}/ads`}
                locked={!isPremium}
              />
              <QuickAction
                icon={<Trophy size={14} />}
                label="New Challenge"
                href={`/brewery-admin/${breweryId}/challenges`}
              />
              <QuickAction
                icon={<Crown size={14} />}
                label="New Mug Club"
                href={`/brewery-admin/${breweryId}/mug-clubs`}
                locked={!isPremium}
              />
            </div>
          </div>

          {/* HopRoute Status */}
          <div
            className="rounded-2xl border p-5"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} style={{ color: "var(--accent-gold)" }} />
              <h2 className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
                HopRoute
              </h2>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: hopRouteEligible ? "#22c55e" : "var(--text-muted)" }}
                />
                <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                  {hopRouteEligible ? "Eligible for placement" : "Not active"}
                </span>
              </div>
              <Link
                href={`/brewery-admin/${breweryId}/settings#hoproute`}
                className="text-xs font-medium"
                style={{ color: "var(--accent-gold)" }}
              >
                Configure →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({ label, value, icon, format }: { label: string; value: number; icon: React.ReactNode; format?: "compact" }) {
  const displayValue = format === "compact" ? formatCompact(value) : value.toLocaleString();

  return (
    <div
      className="rounded-2xl border p-4 sm:p-5"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          {label}
        </span>
        <span style={{ color: "var(--accent-gold)" }}>{icon}</span>
      </div>
      <p className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
        {displayValue}
      </p>
    </div>
  );
}

function ToolCard({
  title,
  icon,
  stats,
  href,
  locked,
  lockMessage,
  breweryId,
  emptyMessage,
  createLabel,
  badge,
}: {
  title: string;
  icon: React.ReactNode;
  stats: { label: string; value: string }[];
  href: string;
  locked: boolean;
  lockMessage?: string;
  breweryId: string;
  emptyMessage?: string;
  createLabel: string;
  badge?: string;
}) {
  return (
    <div
      className="rounded-2xl border p-5 relative overflow-hidden"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Lock overlay */}
      {locked && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl px-6"
          style={{ background: "rgba(15,14,12,0.85)", backdropFilter: "blur(4px)" }}
        >
          <Lock size={24} style={{ color: "var(--accent-gold)", marginBottom: 8 }} />
          <p className="text-sm text-center font-medium" style={{ color: "var(--text-primary)" }}>{title}</p>
          <p className="text-xs text-center mt-1 max-w-[200px]" style={{ color: "var(--text-muted)" }}>
            {lockMessage}
          </p>
          <Link
            href={`/brewery-admin/${breweryId}/billing`}
            className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
          >
            Upgrade <ArrowUpRight size={12} />
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span style={{ color: "var(--accent-gold)" }}>{icon}</span>
          <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{title}</h3>
        </div>
        <Link
          href={href}
          className="text-xs font-medium flex items-center gap-1"
          style={{ color: "var(--accent-gold)" }}
        >
          View <ArrowUpRight size={11} />
        </Link>
      </div>

      {/* Badge */}
      {badge && (
        <p className="text-[10px] mb-3 px-2 py-1 rounded-lg inline-block" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
          {badge}
        </p>
      )}

      {/* Empty State or Stats */}
      {emptyMessage ? (
        <div className="text-center py-4">
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>{emptyMessage}</p>
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
            style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
          >
            <Plus size={12} /> {createLabel}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="font-mono text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{s.value}</p>
              <p className="text-[10px] font-mono uppercase" style={{ color: "var(--text-muted)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QuickAction({ icon, label, href, locked }: { icon: React.ReactNode; label: string; href: string; locked?: boolean }) {
  if (locked) {
    return (
      <div
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl opacity-50 cursor-not-allowed"
        style={{ background: "var(--surface-2)" }}
      >
        <Lock size={13} style={{ color: "var(--text-muted)" }} />
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
      style={{ background: "var(--surface-2)", color: "var(--text-primary)" }}
    >
      <span style={{ color: "var(--accent-gold)" }}>{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}

// ─── Utilities ─────────────────────────────────────────────────────────────────

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}
