"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, ExternalLink, Eye, Shield, ShieldCheck, ShieldAlert,
  Beer, Star, Heart, Clock, Users, BarChart3, Gift, CreditCard,
  ChevronRight, Check, AlertTriangle, Building2, Globe, Pencil,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatsGrid } from "@/components/ui/StatsGrid";
import { Sparkline } from "@/components/ui/Sparkline";
import { formatDate, formatRelativeTime } from "@/lib/dates";
import { formatDuration, formatTrend } from "@/lib/kpi";
import { spring, stagger, variants } from "@/lib/animation";
import type { BreweryDetailData, TeamMember, TimelineItem } from "@/lib/superadmin-brewery";

// ── Tier colors (shared constants — Sprint 143) ────────────────────────

import { SUBSCRIPTION_TIER_COLORS, SUBSCRIPTION_TIER_LABELS } from "@/lib/constants/tiers";
const TIER_COLORS = SUBSCRIPTION_TIER_COLORS;
const TIER_LABELS = SUBSCRIPTION_TIER_LABELS;

const ROLE_ICONS: Record<string, typeof Shield> = {
  owner: ShieldAlert,
  business: ShieldCheck,
  marketing: Shield,
  staff: Beer,
};

// ── Component ──────────────────────────────────────────────────────────

export function BreweryDetailClient({ data }: { data: BreweryDetailData }) {
  const { brewery, brand, team, kpis, sparklines, tapList, loyalty, timeline, adminActions, totalSessions, totalFollowers, uniqueVisitors } = data;
  const tier = (brewery.subscription_tier ?? "free") as string;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/superadmin/breweries"
        className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider hover:underline"
        style={{ color: "var(--text-muted)" }}
      >
        <ArrowLeft size={12} />
        Breweries
      </Link>

      {/* ── Section 1: Header ────────────────────────────────────────── */}
      <motion.div
        className="flex flex-col sm:flex-row items-start gap-4"
        {...variants.slideUp}
        transition={spring.gentle}
      >
        {/* Logo */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center border flex-shrink-0 overflow-hidden"
          style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
        >
          {brewery.cover_image_url ? (
            <Image src={brewery.cover_image_url} alt="" width={64} height={64} className="w-full h-full object-cover" />
          ) : (
            <Building2 size={28} style={{ color: "var(--text-muted)" }} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h1
            className="font-display text-2xl font-bold truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {brewery.name}
          </h1>
          {(brewery.city || brewery.state) && (
            <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
              {[brewery.city, brewery.state].filter(Boolean).join(", ")}
            </p>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-2">
            {/* Tier */}
            <span
              className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full"
              style={{ background: `${TIER_COLORS[tier]}20`, color: TIER_COLORS[tier] }}
            >
              {TIER_LABELS[tier] ?? tier}
            </span>

            {/* Verified */}
            {team.some(m => m.verified) && (
              <span
                className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full"
                style={{ background: "rgba(61,122,82,0.15)", color: "var(--success)" }}
              >
                <Check size={10} />
                Verified
              </span>
            )}

            {/* Brand */}
            {brand && (
              <Link
                href={`/superadmin/breweries?q=${encodeURIComponent(brand.name)}`}
                className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full hover:underline"
                style={{ background: "rgba(212,168,67,0.1)", color: "var(--accent-gold)" }}
              >
                <Globe size={10} />
                {brand.name}
              </Link>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0">
          <ImpersonateButton breweryId={brewery.id} breweryName={brewery.name} />
          <Link
            href={`/brewery/${brewery.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono border transition-colors hover:border-[var(--accent-gold)]/30"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            <ExternalLink size={12} />
            Public Profile
          </Link>
        </div>
      </motion.div>

      {/* ── Section 2+5: Account Overview + Tap List ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card padding="spacious" className="lg:col-span-2">
          <CardHeader>
            <CardTitle as="h3">Account Overview</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6">
            <DetailField label="Subscription Tier" value={TIER_LABELS[tier] ?? tier} valueColor={TIER_COLORS[tier]} />
            <DetailField label="Trial Status" value={getTrialStatus(brewery)} />
            <DetailField label="Stripe Customer" value={brewery.stripe_customer_id ?? "None"} mono />
            <DetailField label="Created" value={formatDate(brewery.created_at)} />
            <DetailField label="Data Source" value={brewery.data_source ?? "manual"} />
            <DetailField label="Brand" value={brand?.name ?? "Independent"} />
            {brewery.phone && <DetailField label="Phone" value={brewery.phone} />}
            {brewery.website_url && <DetailField label="Website" value={brewery.website_url} truncate />}
          </div>
        </Card>

        <Card padding="spacious">
          <CardHeader>
            <CardTitle as="h3">Tap List</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Total Beers</span>
              <span className="font-mono text-lg font-bold" style={{ color: "var(--accent-gold)" }}>
                {tapList.totalBeers}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>On Tap</span>
              <span className="font-mono text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                {tapList.onTap}
              </span>
            </div>
            {tapList.styles.length > 0 && (
              <div className="pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                <p className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                  Top Styles
                </p>
                <div className="flex flex-wrap gap-1">
                  {tapList.styles.map(s => (
                    <span
                      key={s.name}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                      style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
                    >
                      {s.name} ({s.count})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ── Section 4: Activity Stats ────────────────────────────────── */}
      <StatsGrid
        columns={4}
        stats={[
          {
            label: "Total Sessions",
            value: totalSessions.toLocaleString(),
            icon: <BarChart3 size={16} />,
          },
          {
            label: "Unique Visitors",
            value: uniqueVisitors.toLocaleString(),
            icon: <Users size={16} />,
          },
          {
            label: "Avg Duration",
            value: formatDuration(kpis.avgSessionDuration),
            icon: <Clock size={16} />,
            note: formatTrend(kpis.avgSessionDurationTrend)?.text,
          },
          {
            label: "Beers/Visit",
            value: kpis.beersPerVisit?.toFixed(1) ?? "—",
            icon: <Beer size={16} />,
            note: formatTrend(kpis.beersPerVisitTrend)?.text,
          },
        ]}
      />

      {/* Sparklines row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SparklineCard label="Avg Duration" data={sparklines.avgDuration} suffix="m" />
        <SparklineCard label="Beers/Visit" data={sparklines.beersPerVisit} />
        <SparklineCard label="Returning %" data={sparklines.returningPct} suffix="%" />
        <SparklineCard label="Retention" data={sparklines.retention} suffix="%" />
      </div>

      {/* ── Section 3: Team Roster ───────────────────────────────────── */}
      <Card padding="spacious">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle as="h3">Team ({team.length})</CardTitle>
          </div>
        </CardHeader>
        {team.length === 0 ? (
          <p className="text-sm py-4 text-center" style={{ color: "var(--text-muted)" }}>
            No team members — brewery unclaimed
          </p>
        ) : (
          <motion.div className="space-y-1" {...stagger.container(0.04)}>
            {team.map(member => (
              <TeamRow key={member.id} member={member} />
            ))}
          </motion.div>
        )}
      </Card>

      {/* ── Section 6: Loyalty Summary ───────────────────────────────── */}
      <Card padding="spacious">
        <CardHeader>
          <CardTitle as="h3">Loyalty Program</CardTitle>
        </CardHeader>
        {loyalty.active ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <DetailField label="Program" value={loyalty.programName ?? "Active"} />
            <DetailField label="Stamps Required" value={String(loyalty.stampsRequired ?? "—")} />
            <DetailField label="Cards Issued" value={String(loyalty.cardsIssued)} valueColor="var(--accent-gold)" />
            <DetailField label="Redemptions" value={String(loyalty.totalRedemptions)} />
          </div>
        ) : (
          <p className="text-sm py-2" style={{ color: "var(--text-muted)" }}>
            No active loyalty program
          </p>
        )}
      </Card>

      {/* ── Section 7: Recent Activity Timeline ──────────────────────── */}
      <Card padding="spacious">
        <CardHeader>
          <CardTitle as="h3">Recent Activity</CardTitle>
        </CardHeader>
        {timeline.length === 0 ? (
          <p className="text-sm py-4 text-center" style={{ color: "var(--text-muted)" }}>
            No activity yet
          </p>
        ) : (
          <motion.div className="space-y-0.5" {...stagger.container(0.04)}>
            {timeline.map(item => (
              <TimelineRow key={item.id} item={item} />
            ))}
          </motion.div>
        )}
      </Card>

      {/* ── Section 8: Admin Notes ───────────────────────────────────── */}
      <AdminNotesSection breweryId={brewery.id} initialNotes={brewery.admin_notes ?? ""} />

      {/* ── Section 9: Danger Zone ───────────────────────────────────── */}
      <DangerZone
        breweryId={brewery.id}
        breweryName={brewery.name}
        currentTier={tier}
        isVerified={team.some(m => m.verified)}
      />
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────

function DetailField({ label, value, valueColor, mono, truncate }: {
  label: string;
  value: string;
  valueColor?: string;
  mono?: boolean;
  truncate?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-mono uppercase tracking-wider mb-0.5" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      <p
        className={`text-sm ${mono ? "font-mono" : ""} ${truncate ? "truncate" : ""}`}
        style={{ color: valueColor ?? "var(--text-primary)" }}
      >
        {value}
      </p>
    </div>
  );
}

function SparklineCard({ label, data, suffix = "" }: { label: string; data: number[]; suffix?: string }) {
  const last = data[data.length - 1] ?? 0;
  return (
    <div
      className="rounded-2xl border p-4 flex items-center justify-between"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div>
        <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          {label}
        </p>
        <p className="font-mono text-lg font-bold mt-1" style={{ color: "var(--text-primary)" }}>
          {last}{suffix}
        </p>
      </div>
      <Sparkline data={data} width={48} height={24} />
    </div>
  );
}

function TeamRow({ member }: { member: TeamMember }) {
  const RoleIcon = ROLE_ICONS[member.role] ?? Shield;
  const name = member.profile?.display_name ?? member.profile?.username ?? "Unknown";
  const email = member.profile?.email ?? "—";

  return (
    <motion.div
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-[var(--surface-2)]"
      {...stagger.item}
      transition={spring.default}
    >
      {/* Avatar/initials */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
        style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
      >
        {member.profile?.avatar_url ? (
          <Image src={member.profile.avatar_url} alt="" width={32} height={32} className="w-full h-full rounded-full object-cover" />
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </div>

      {/* Name + email */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{name}</p>
        <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{email}</p>
      </div>

      {/* Propagated badge */}
      {member.propagated_from_brand && (
        <span
          className="text-[10px] font-mono px-1.5 py-0.5 rounded"
          style={{ background: "rgba(212,168,67,0.1)", color: "var(--accent-gold)" }}
        >
          Via Brand
        </span>
      )}

      {/* Role pill */}
      <span
        className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full capitalize"
        style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
      >
        <RoleIcon size={10} />
        {member.role}
      </span>

      {/* Joined */}
      <span className="text-xs hidden sm:block" style={{ color: "var(--text-muted)" }}>
        {formatDate(member.created_at)}
      </span>
    </motion.div>
  );
}

const TIMELINE_ICONS = {
  session: Beer,
  review: Star,
  follow: Heart,
};

const TIMELINE_COLORS = {
  session: "var(--accent-gold)",
  review: "#E8841A",
  follow: "#ef4444",
};

function TimelineRow({ item }: { item: TimelineItem }) {
  const Icon = TIMELINE_ICONS[item.type];
  const color = TIMELINE_COLORS[item.type];

  return (
    <motion.div
      className="flex items-center gap-3 px-3 py-2 rounded-xl transition-colors hover:bg-[var(--surface-2)]"
      {...stagger.item}
      transition={spring.default}
    >
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}20`, color }}
      >
        <Icon size={12} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate" style={{ color: "var(--text-primary)" }}>
          <span className="font-medium">{item.actor}</span>{" "}
          <span style={{ color: "var(--text-secondary)" }}>{item.detail}</span>
        </p>
      </div>
      <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>
        {formatRelativeTime(item.timestamp)}
      </span>
    </motion.div>
  );
}

// ── Admin Notes ────────────────────────────────────────────────────────

function AdminNotesSection({ breweryId, initialNotes }: { breweryId: string; initialNotes: string }) {
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const saveNotes = useCallback(
    async (value: string) => {
      setSaving(true);
      setSaved(false);
      try {
        await fetch(`/api/superadmin/breweries/${breweryId}/notes`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes: value }),
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch {
        // silent fail
      } finally {
        setSaving(false);
      }
    },
    [breweryId]
  );

  const handleChange = (value: string) => {
    setNotes(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => saveNotes(value), 2000);
  };

  return (
    <Card padding="spacious">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle as="h3">
            <span className="inline-flex items-center gap-2">
              <Pencil size={14} style={{ color: "var(--text-muted)" }} />
              Admin Notes
            </span>
          </CardTitle>
          <span className="text-xs font-mono" style={{ color: saving ? "var(--text-muted)" : saved ? "var(--success)" : "transparent" }}>
            {saving ? "Saving..." : saved ? "Saved" : "."}
          </span>
        </div>
      </CardHeader>
      <textarea
        value={notes}
        onChange={e => handleChange(e.target.value)}
        placeholder="Add notes about this brewery (only visible to superadmin)..."
        rows={4}
        className="w-full rounded-xl border p-3 text-sm resize-y focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]"
        style={{
          background: "var(--surface-2)",
          borderColor: "var(--border)",
          color: "var(--text-primary)",
        }}
      />
    </Card>
  );
}

// ── Danger Zone ────────────────────────────────────────────────────────

function DangerZone({ breweryId, breweryName, currentTier, isVerified }: {
  breweryId: string;
  breweryName: string;
  currentTier: string;
  isVerified: boolean;
}) {
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState(currentTier);
  const [loading, setLoading] = useState(false);

  const performAction = async (action: string, payload?: Record<string, string>) => {
    setLoading(true);
    try {
      await fetch(`/api/superadmin/breweries/${breweryId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      });
      setConfirmAction(null);
      // Reload to reflect changes
      window.location.reload();
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      padding="spacious"
      className="border-[var(--danger)]/30"
    >
      <CardHeader>
        <CardTitle as="h3">
          <span className="inline-flex items-center gap-2" style={{ color: "var(--danger)" }}>
            <AlertTriangle size={16} />
            Admin Actions
          </span>
        </CardTitle>
      </CardHeader>

      <div className="space-y-3">
        {/* Force Verify */}
        <div className="flex items-center justify-between gap-4 py-2">
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Force Verify</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {isVerified ? "Already verified" : "Mark all accounts as verified"}
            </p>
          </div>
          <button
            onClick={() => setConfirmAction("force_verify")}
            disabled={isVerified || loading}
            className="px-3 py-1.5 rounded-xl text-xs font-mono border transition-colors disabled:opacity-40"
            style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            Verify
          </button>
        </div>

        <AnimatePresence>
          {confirmAction === "force_verify" && (
            <motion.div
              className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: "rgba(212,168,67,0.08)" }}
              {...variants.slideDown}
              transition={spring.snappy}
            >
              <p className="text-xs flex-1" style={{ color: "var(--text-secondary)" }}>
                Verify {breweryName}?
              </p>
              <button
                onClick={() => setConfirmAction(null)}
                className="px-2 py-1 rounded-lg text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                Cancel
              </button>
              <button
                onClick={() => performAction("force_verify")}
                disabled={loading}
                className="px-3 py-1 rounded-lg text-xs font-mono font-bold"
                style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
              >
                {loading ? "..." : "Confirm"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Change Tier */}
        <div
          className="py-2 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Change Tier</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Override subscription tier manually
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedTier}
                onChange={e => setSelectedTier(e.target.value)}
                className="px-2 py-1.5 rounded-xl text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              >
                <option value="free">Free</option>
                <option value="tap">Tap</option>
                <option value="cask">Cask</option>
                <option value="barrel">Barrel</option>
              </select>
              <button
                onClick={() => setConfirmAction("change_tier")}
                disabled={selectedTier === currentTier || loading}
                className="px-3 py-1.5 rounded-xl text-xs font-mono border transition-colors disabled:opacity-40"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                Change
              </button>
            </div>
          </div>

          <AnimatePresence>
            {confirmAction === "change_tier" && (
              <motion.div
                className="flex items-center gap-2 px-3 py-2 mt-2 rounded-xl"
                style={{ background: "rgba(212,168,67,0.08)" }}
                {...variants.slideDown}
                transition={spring.snappy}
              >
                <p className="text-xs flex-1" style={{ color: "var(--text-secondary)" }}>
                  Change {breweryName} from {currentTier} to {selectedTier}?
                </p>
                <button
                  onClick={() => setConfirmAction(null)}
                  className="px-2 py-1 rounded-lg text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => performAction("change_tier", { tier: selectedTier })}
                  disabled={loading}
                  className="px-3 py-1 rounded-lg text-xs font-mono font-bold"
                  style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
                >
                  {loading ? "..." : "Confirm"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Deactivate — Phase 2 */}
        <div
          className="flex items-center justify-between gap-4 py-2 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Deactivate</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Disable this brewery account
            </p>
          </div>
          <span
            className="px-3 py-1.5 rounded-xl text-xs font-mono border opacity-40 cursor-not-allowed"
            style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-muted)" }}
            title="Coming in Phase 2"
          >
            Phase 2
          </span>
        </div>
      </div>
    </Card>
  );
}

// ── Impersonate Button ─────────────────────────────────────────────────

function ImpersonateButton({ breweryId, breweryName }: { breweryId: string; breweryName: string }) {
  const [loading, setLoading] = useState(false);

  const startImpersonation = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/superadmin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brewery_id: breweryId }),
      });
      if (res.ok) {
        window.location.href = `/brewery-admin/${breweryId}`;
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={startImpersonation}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-colors disabled:opacity-50"
      style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
    >
      <Eye size={12} />
      {loading ? "Loading..." : "View as Brewery"}
    </button>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────

function getTrialStatus(brewery: any): string {
  if (brewery.stripe_customer_id) return "Subscribed";
  const trialEnd = brewery.trial_ends_at
    ? new Date(brewery.trial_ends_at)
    : brewery.created_at
      ? new Date(new Date(brewery.created_at).getTime() + 14 * 86400000)
      : null;

  if (!trialEnd) return "Unknown";

  const daysLeft = Math.ceil((trialEnd.getTime() - Date.now()) / 86400000);
  if (daysLeft <= 0) return "Trial expired";
  return `Trial: ${daysLeft}d left`;
}
