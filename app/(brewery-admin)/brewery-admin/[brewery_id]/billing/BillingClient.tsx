"use client";

import { useState } from "react";
import { Check, Crown, Building2, Rocket, Settings, AlertTriangle, Zap } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";

interface Brewery {
  id: string;
  name: string;
  created_at: string;
  subscription_tier?: string | null;
  stripe_customer_id?: string | null;
  trial_ends_at?: string | null;
}

const TIERS = [
  {
    name: "Tap",
    price: "$49",
    period: "/mo",
    tagline: "For getting started",
    icon: Rocket,
    features: [
      "Tap list management",
      "QR table tents",
      "Basic analytics",
      "Up to 50 loyalty members",
    ],
    cta: "Start Plan",
    popular: false,
  },
  {
    name: "Cask",
    price: "$149",
    period: "/mo",
    tagline: "For growing breweries",
    icon: Crown,
    features: [
      "Everything in Tap",
      "Advanced analytics",
      "Unlimited loyalty",
      "Events management",
      "Priority support",
    ],
    cta: "Start Plan",
    popular: true,
  },
  {
    name: "Barrel",
    price: "Custom",
    period: "",
    tagline: "For multi-location",
    icon: Building2,
    features: [
      "Everything in Cask",
      "Multi-location support",
      "Custom integrations",
      "Dedicated account manager",
    ],
    cta: "Contact Us",
    popular: false,
  },
];

export function BillingClient({ brewery }: { brewery: Brewery }) {
  const { success, error: toastError } = useToast();
  const searchParams = useSearchParams();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);

  // Determine subscription state
  const isSubscribed = !!brewery.stripe_customer_id &&
    brewery.subscription_tier && brewery.subscription_tier !== "free";

  const trialEndsAt = brewery.trial_ends_at
    ? new Date(brewery.trial_ends_at)
    : (() => {
        const d = new Date(brewery.created_at);
        d.setDate(d.getDate() + 14);
        return d;
      })();

  const now = new Date();
  const msRemaining = trialEndsAt.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
  const isTrialActive = !isSubscribed && daysRemaining > 0;
  const isTrialExpired = !isSubscribed && daysRemaining === 0;
  const isTrialUrgent = isTrialActive && daysRemaining <= 5;

  // Banner from redirect params
  const justSubscribed = searchParams.get("success") === "1";
  const wasCancelled = searchParams.get("cancelled") === "1";
  const isDemo = searchParams.get("demo") === "1";

  async function handleSelectPlan(tier: typeof TIERS[number]) {
    if (tier.name === "Barrel") {
      window.location.href =
        "mailto:hello@hoptrack.beer?subject=HopTrack Barrel Plan Inquiry&body=I'm interested in the Barrel plan for " +
        encodeURIComponent(brewery.name);
      return;
    }

    setLoadingTier(tier.name);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brewery_id: brewery.id, tier: tier.name.toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      if (data.demo) {
        success("Stripe not configured — showing demo billing page");
      }
      window.location.href = data.url;
    } catch (err: any) {
      toastError(err.message || "Could not start checkout");
    } finally {
      setLoadingTier(null);
    }
  }

  async function handleManageSubscription() {
    setLoadingPortal(true);
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brewery_id: brewery.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      window.location.href = data.url;
    } catch (err: any) {
      toastError(err.message || "Could not open billing portal");
    } finally {
      setLoadingPortal(false);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            Billing & Plans
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Manage your subscription and billing
          </p>
        </div>
        {isSubscribed && (
          <button
            onClick={handleManageSubscription}
            disabled={loadingPortal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: "var(--surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
          >
            <Settings size={14} />
            {loadingPortal ? "Opening…" : "Manage Subscription"}
          </button>
        )}
      </div>

      {/* Redirect banners */}
      <AnimatePresence>
        {justSubscribed && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-2xl border p-4 flex items-center gap-3"
            style={{ borderColor: "var(--accent-gold)", background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)" }}
          >
            <Check size={18} style={{ color: "var(--accent-gold)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              You&apos;re subscribed! Welcome to HopTrack. 🍺
            </p>
          </motion.div>
        )}
        {wasCancelled && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-2xl border p-4"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Checkout cancelled — no charges made. Pick a plan whenever you&apos;re ready.
            </p>
          </motion.div>
        )}
        {isDemo && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-2xl border p-4 flex items-center gap-3"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              <span className="font-semibold" style={{ color: "var(--text-primary)" }}>Demo mode:</span>{" "}
              Add <code className="text-xs px-1 py-0.5 rounded" style={{ background: "var(--surface-2)" }}>STRIPE_SECRET_KEY</code> to enable real billing.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trial urgency banner (≤5 days) */}
      <AnimatePresence>
        {isTrialUrgent && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{
              border: "2px solid var(--accent-gold)",
              background: "color-mix(in srgb, var(--accent-gold) 12%, transparent)",
              animation: "urgency-pulse 2s ease-in-out infinite",
            }}
          >
            <style>{`
              @keyframes urgency-pulse {
                0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent-gold) 40%, transparent); }
                50% { box-shadow: 0 0 0 6px color-mix(in srgb, var(--accent-gold) 0%, transparent); }
              }
            `}</style>
            <Zap size={20} style={{ color: "var(--accent-gold)", flexShrink: 0 }} />
            <p className="text-sm font-semibold flex-1" style={{ color: "var(--text-primary)" }}>
              ⚡ {daysRemaining} {daysRemaining === 1 ? "day" : "days"} left in your trial — upgrade now to keep access
            </p>
            <button
              onClick={handleManageSubscription}
              disabled={loadingPortal}
              className="px-4 py-2 rounded-xl text-xs font-bold shrink-0"
              style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
            >
              Upgrade Now
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active subscription status */}
      {isSubscribed && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-5"
          style={{
            borderColor: "var(--accent-gold)",
            background: "color-mix(in srgb, var(--accent-gold) 8%, transparent)",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
              >
                <Check size={20} />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                  Active subscription — {TIERS.find(t => t.name.toLowerCase() === brewery.subscription_tier)?.name ?? brewery.subscription_tier} plan
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  All features unlocked.
                </p>
              </div>
            </div>
            <button
              onClick={handleManageSubscription}
              disabled={loadingPortal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0 transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
            >
              <Settings size={14} />
              {loadingPortal ? "Opening…" : "Manage Subscription"}
            </button>
          </div>
        </motion.div>
      )}

      {/* Trial active banner */}
      {isTrialActive && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-5"
          style={{
            borderColor: "var(--accent-gold)",
            background: "color-mix(in srgb, var(--accent-gold) 8%, transparent)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg tabular-nums"
              style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
            >
              {daysRemaining}
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                {daysRemaining} {daysRemaining === 1 ? "day" : "days"} left on your free trial
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Subscribe below to keep full access after your trial ends.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Trial expired banner */}
      {isTrialExpired && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-5 flex items-start gap-3"
          style={{ borderColor: "var(--danger)", background: "color-mix(in srgb, var(--danger) 8%, transparent)" }}
        >
          <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" style={{ color: "var(--danger)" }} />
          <div>
            <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              Your trial has ended
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Your brewery is now in read-only mode. Subscribe to re-enable tap list edits, analytics, and loyalty features.
            </p>
          </div>
        </motion.div>
      )}

      {/* Tier cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TIERS.map((tier) => {
          const Icon = tier.icon;
          return (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: TIERS.indexOf(tier) * 0.1 }}
              className="relative rounded-2xl border p-6 flex flex-col"
              style={{
                background: "var(--surface)",
                borderColor: tier.popular ? "var(--accent-gold)" : "var(--border)",
              }}
            >
              {/* Most popular badge */}
              {tier.popular && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: "var(--accent-gold)",
                    color: "var(--bg)",
                  }}
                >
                  MOST POPULAR
                </div>
              )}

              {/* Icon + name */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: tier.popular
                      ? "var(--accent-gold)"
                      : "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
                    color: tier.popular ? "var(--bg)" : "var(--accent-gold)",
                  }}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg" style={{ color: "var(--text-primary)" }}>
                    {tier.name}
                  </h3>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {tier.tagline}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {tier.price}
                </span>
                {tier.period && (
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {tier.period}
                  </span>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 flex-1 mb-6">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <Check
                      size={16}
                      className="flex-shrink-0 mt-0.5"
                      style={{ color: "var(--accent-gold)" }}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => handleSelectPlan(tier)}
                disabled={loadingTier === tier.name}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
                style={
                  tier.name === "Barrel"
                    ? {
                        background: "transparent",
                        color: "var(--accent-gold)",
                        border: "1.5px solid var(--accent-gold)",
                      }
                    : {
                        background: "var(--accent-gold)",
                        color: "var(--bg)",
                      }
                }
              >
                {loadingTier === tier.name ? "Redirecting…" : tier.cta}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* FAQ / info */}
      <div
        className="rounded-2xl border p-6 space-y-3"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <h3 className="font-display font-semibold" style={{ color: "var(--text-primary)" }}>
          Questions?
        </h3>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          All plans include a 14-day free trial. No credit card required to get started.
          Need help choosing?{" "}
          <a
            href="mailto:hello@hoptrack.beer"
            className="font-medium underline"
            style={{ color: "var(--accent-gold)" }}
          >
            Reach out to our team
          </a>
          .
        </p>
        {isSubscribed && (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Want to switch to a lower plan?{" "}
            <a
              href={`mailto:hello@hoptrack.beer?subject=Plan Downgrade Request — ${encodeURIComponent(brewery.name)}&body=Hi HopTrack team,%0A%0AI'd like to downgrade my plan for ${encodeURIComponent(brewery.name)}.%0A%0ACurrent plan: ${brewery.subscription_tier ?? "unknown"}%0ARequested plan: `}
              className="font-medium underline"
              style={{ color: "var(--accent-gold)" }}
            >
              Contact us to downgrade
            </a>
            .
          </p>
        )}
      </div>
    </div>
  );
}
