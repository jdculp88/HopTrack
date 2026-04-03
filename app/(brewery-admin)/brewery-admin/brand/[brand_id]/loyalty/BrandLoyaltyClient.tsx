"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Users, Trophy, ArrowUpRight, Loader2, AlertTriangle, Download } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatsGrid } from "@/components/ui/StatsGrid";

interface BrandLoyaltyClientProps {
  brandId: string;
  brandName: string;
  tier: string;
  hasAccess: boolean;
}

export function BrandLoyaltyClient({ brandId, brandName, tier, hasAccess }: BrandLoyaltyClientProps) {
  const [program, setProgram] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalCards: 0, totalStamps: 0, totalRedemptions: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrateResult, setMigrateResult] = useState<any>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("Brand Loyalty");
  const [formDescription, setFormDescription] = useState("");
  const [formStamps, setFormStamps] = useState(10);
  const [formReward, setFormReward] = useState("Free pint at any location");
  const [formEarnPer, setFormEarnPer] = useState(1);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/brand/${brandId}/loyalty`);
      if (res.ok) {
        const { data } = await res.json();
        setProgram(data.program);
        setCards(data.cards ?? []);
        setRedemptions(data.redemptions ?? []);
        setStats(data.stats);
        if (data.program) {
          setFormName(data.program.name);
          setFormDescription(data.program.description ?? "");
          setFormStamps(data.program.stamps_required);
          setFormReward(data.program.reward_description);
          setFormEarnPer(data.program.earn_per_session);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  useEffect(() => { if (hasAccess) fetchData(); }, [hasAccess, fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/brand/${brandId}/loyalty`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          description: formDescription || null,
          stamps_required: formStamps,
          reward_description: formReward,
          earn_per_session: formEarnPer,
        }),
      });
      if (res.ok) {
        showToast(program ? "Program updated" : "Program created");
        fetchData();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    if (!program) return;
    const res = await fetch(`/api/brand/${brandId}/loyalty`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !program.is_active }),
    });
    if (res.ok) {
      showToast(program.is_active ? "Program paused" : "Program activated");
      fetchData();
    }
  };

  const handleMigrate = async () => {
    setMigrating(true);
    setMigrateResult(null);
    try {
      const res = await fetch(`/api/brand/${brandId}/loyalty`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "migrate" }),
      });
      if (res.ok) {
        const { data } = await res.json();
        setMigrateResult(data);
        showToast(`Migrated ${data.migratedUsers} users, ${data.totalStamps} stamps`);
        fetchData();
      }
    } finally {
      setMigrating(false);
    }
  };

  // Tier gate
  if (!hasAccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)" }}>
          <Gift size={28} style={{ color: "var(--accent-gold)" }} />
        </div>
        <h1 className="font-display text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Brand-Wide Loyalty
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          Unified loyalty programs across all your locations. Customers earn stamps anywhere, redeem anywhere.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
          style={{ background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)", color: "var(--accent-gold)" }}>
          <ArrowUpRight size={14} />
          Upgrade to Cask or Barrel to unlock
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 rounded-xl w-48" style={{ background: "var(--surface-2)" }} />
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl" style={{ background: "var(--surface-2)" }} />)}
          </div>
          <div className="h-64 rounded-2xl" style={{ background: "var(--surface-2)" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl text-sm font-medium shadow-lg"
            style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <PageHeader
        title={`Brand Loyalty — ${brandName}`}
        subtitle="Earn stamps at any location, redeem at any location."
        className="mb-0"
      />

      {/* Stats */}
      <StatsGrid stats={[
        { label: "Active Cards", value: stats.totalCards, icon: <Users size={16} /> },
        { label: "Total Stamps", value: stats.totalStamps, icon: <Gift size={16} /> },
        { label: "Redemptions", value: stats.totalRedemptions, icon: <Trophy size={16} /> },
      ]} />

      {/* Program Setup */}
      <div className="rounded-2xl p-6" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            {program ? "Program Settings" : "Create Program"}
          </h2>
          {program && (
            <button
              onClick={handleToggle}
              className="text-xs px-3 py-1.5 rounded-xl font-medium transition-opacity hover:opacity-80"
              style={{
                background: program.is_active
                  ? "color-mix(in srgb, var(--danger) 15%, transparent)"
                  : "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
                color: program.is_active ? "var(--danger)" : "var(--accent-gold)",
              }}
            >
              {program.is_active ? "Pause Program" : "Activate Program"}
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Program Name</label>
            <input
              value={formName}
              onChange={e => setFormName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Description</label>
            <textarea
              value={formDescription}
              onChange={e => setFormDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl text-sm resize-none"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              placeholder="Earn stamps at any of our locations..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Stamps Required</label>
              <select
                value={formStamps}
                onChange={e => setFormStamps(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl text-sm"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              >
                {[5, 8, 10, 12, 15, 20].map(n => (
                  <option key={n} value={n}>{n} stamps</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Stamps Per Visit</label>
              <select
                value={formEarnPer}
                onChange={e => setFormEarnPer(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl text-sm"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              >
                {[1, 2, 3].map(n => (
                  <option key={n} value={n}>{n} stamp{n > 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Reward</label>
              <select
                value={formReward}
                onChange={e => setFormReward(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              >
                <option value="Free pint at any location">Free pint at any location</option>
                <option value="Free half-pour at any location">Free half-pour</option>
                <option value="Free pint + souvenir glass">Free pint + glass</option>
                <option value="Free growler fill">Free growler fill</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !formName}
            className="px-5 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60 inline-flex items-center gap-1.5"
            style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
          >
            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : program ? "Update Program" : "Create Program"}
          </button>
        </div>
      </div>

      {/* Migration Tool */}
      {program && (
        <div className="rounded-2xl p-6" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Download size={16} style={{ color: "var(--accent-gold)" }} />
            <h2 className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              Import Location Stamps
            </h2>
          </div>
          <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
            Sum existing per-location loyalty stamps into brand cards. This is additive — existing brand stamps are preserved.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleMigrate}
              disabled={migrating}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60 inline-flex items-center gap-1.5"
              style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)", color: "var(--accent-gold)" }}
            >
              {migrating ? <><Loader2 size={14} className="animate-spin" /> Migrating...</> : "Import Stamps"}
            </button>
            {migrateResult && (
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {migrateResult.migratedUsers} users, {migrateResult.totalStamps} stamps imported
              </span>
            )}
          </div>
        </div>
      )}

      {/* Top Customers */}
      {cards.length > 0 && (
        <div className="rounded-2xl p-6" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <h2 className="font-display text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            Top Stamp Holders
          </h2>
          <div className="space-y-3">
            {cards.slice(0, 10).map((card: any, i: number) => {
              const profile = card.profile;
              const displayName = profile?.display_name ?? profile?.username ?? "User";
              const lastBrewery = card.last_brewery?.name;
              const progress = program ? Math.min(100, (card.stamps / program.stamps_required) * 100) : 0;
              return (
                <div key={card.id} className="flex items-center gap-3">
                  <span className="text-xs font-mono w-5 text-right" style={{ color: "var(--text-muted)" }}>{i + 1}</span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: "var(--accent-gold)", color: "var(--bg)" }}>
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{displayName}</span>
                      <span className="text-xs font-mono" style={{ color: "var(--accent-gold)" }}>{card.stamps}/{program?.stamps_required ?? "?"}</span>
                    </div>
                    <div className="h-1.5 rounded-full mt-1 overflow-hidden" style={{ background: "var(--surface)" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full rounded-full"
                        style={{ background: "var(--accent-gold)" }}
                      />
                    </div>
                    {lastBrewery && (
                      <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Last visit: {lastBrewery}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Redemptions */}
      {redemptions.length > 0 && (
        <div className="rounded-2xl p-6" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <h2 className="font-display text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            Recent Redemptions
          </h2>
          <div className="space-y-2">
            {redemptions.map((r: any) => {
              const profile = r.profile;
              const displayName = profile?.display_name ?? profile?.username ?? "User";
              const breweryName = r.brewery?.name ?? "Unknown";
              const date = new Date(r.redeemed_at).toLocaleDateString();
              return (
                <div key={r.id} className="flex items-center justify-between py-2 border-b" style={{ borderColor: "var(--border)" }}>
                  <div>
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{displayName}</span>
                    <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>at {breweryName}</span>
                  </div>
                  <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{date}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
