"use client";

import { Check, Crown, Building2, Rocket } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { motion } from "framer-motion";

interface Brewery {
  id: string;
  name: string;
  created_at: string;
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
  const { success } = useToast();

  const createdAt = new Date(brewery.created_at);
  const now = new Date();
  const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, 14 - daysSinceCreation);
  const isTrialActive = daysRemaining > 0;

  function handleSelectPlan(tier: typeof TIERS[number]) {
    if (tier.name === "Barrel") {
      window.location.href = "mailto:hello@hoptrack.beer?subject=HopTrack Barrel Plan Inquiry&body=I'm interested in the Barrel plan for " + encodeURIComponent(brewery.name);
      return;
    }
    success("Coming soon — we'll notify you when billing is ready");
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-display font-bold" style={{ color: "var(--text-primary)" }}>
          Billing & Plans
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Manage your subscription and billing
        </p>
      </div>

      {/* Trial banner */}
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
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
              style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
            >
              {daysRemaining}
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                You&apos;re on your 14-day free trial
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {daysRemaining} {daysRemaining === 1 ? "day" : "days"} remaining. Choose a plan below to continue after your trial.
              </p>
            </div>
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
                className="w-full py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
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
                {tier.cta}
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
      </div>
    </div>
  );
}
