"use client";

import { useState } from "react";
import { Check, Building2, Settings, X, MapPin, CreditCard, Zap } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { FEATURE_MATRIX, BRAND_ADDON_INFO } from "@/lib/stripe";
import { PageHeader } from "@/components/ui/PageHeader";

interface Brand {
  id: string;
  name: string;
  slug: string;
  subscription_tier: string;
  stripe_customer_id: string | null;
  trial_ends_at: string | null;
  billing_email: string | null;
  created_at: string;
  owner_id: string | null;
}

interface Location {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  subscription_tier: string | null;
}

type BillingInterval = "monthly" | "annual";

interface BrandBillingClientProps {
  brand: Brand;
  locations: Location[];
  userRole: "owner" | "regional_manager";
}

export function BrandBillingClient({ brand, locations, userRole }: BrandBillingClientProps) {
  const { success, error: toastError } = useToast();
  const searchParams = useSearchParams();
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly");
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const isOwner = userRole === "owner";
  const isSubscribed = !!brand.stripe_customer_id && brand.subscription_tier !== "free";
  const locationCount = locations.length;
  const addonCount = Math.max(0, locationCount - 1);

  // Banner from redirect params
  const justSubscribed = searchParams.get("success") === "1";
  const wasCancelled = searchParams.get("cancelled") === "1";
  const isDemo = searchParams.get("demo") === "1";

  // Barrel features (everything that's barrel: true)
  const barrelFeatures = FEATURE_MATRIX.filter((f) => f.barrel);

  function getMonthlyTotal() {
    // Base is custom/contact — show add-on math only
    return addonCount * BRAND_ADDON_INFO.monthly;
  }

  function getAnnualTotal() {
    return addonCount * BRAND_ADDON_INFO.annual;
  }

  async function handleSubscribe() {
    setLoadingCheckout(true);
    try {
      const res = await fetch(`/api/brand/${brand.id}/billing/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval: billingInterval }),
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
      setLoadingCheckout(false);
    }
  }

  async function handleManageSubscription() {
    setLoadingPortal(true);
    try {
      const res = await fetch(`/api/brand/${brand.id}/billing/portal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  async function handleCancelSubscription() {
    setCancelLoading(true);
    try {
      const res = await fetch(`/api/brand/${brand.id}/billing/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      success("Subscription cancelled. You'll have access until the end of your billing period.");
      setShowCancelConfirm(false);
      window.location.reload();
    } catch (err: any) {
      toastError(err.message || "Could not cancel subscription");
    } finally {
      setCancelLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* ─── Page Header ─── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            Brand Billing
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Manage billing for {brand.name} and all {locationCount} location{locationCount !== 1 ? "s" : ""}
          </p>
        </div>
        {isSubscribed && isOwner && (
          <button
            onClick={handleManageSubscription}
            disabled={loadingPortal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: "var(--surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
          >
            <Settings size={14} />
            {loadingPortal ? "Opening\u2026" : "Manage Subscription"}
          </button>
        )}
      </div>

      {/* ─── Redirect Banners ─── */}
      <AnimatePresence>
        {justSubscribed && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-2xl border p-4 flex items-center gap-3"
            style={{ borderColor: "var(--accent-gold)", background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)" }}
          >
            <Check size={18} style={{ color: "var(--accent-gold)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Brand subscribed! All {locationCount} location{locationCount !== 1 ? "s" : ""} are now on the Barrel plan.
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
              Checkout cancelled — no charges made. Subscribe whenever you're ready.
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

      {/* ─── Active Subscription Card ─── */}
      {isSubscribed && (
        <div
          className="rounded-2xl p-6 space-y-5"
          style={{ background: "var(--surface)", border: "2px solid var(--accent-gold)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)" }}
            >
              <Building2 size={20} style={{ color: "var(--accent-gold)" }} />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                Barrel Plan — Active
              </h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Brand subscription covering all locations
              </p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl p-4" style={{ background: "var(--surface-2)" }}>
              <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Locations</p>
              <p className="text-2xl font-bold font-mono mt-1" style={{ color: "var(--text-primary)" }}>{locationCount}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>covered</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: "var(--surface-2)" }}>
              <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Base</p>
              <p className="text-2xl font-bold font-mono mt-1" style={{ color: "var(--text-primary)" }}>1</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>included</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: "var(--surface-2)" }}>
              <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Add-ons</p>
              <p className="text-2xl font-bold font-mono mt-1" style={{ color: "var(--accent-gold)" }}>{addonCount}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {addonCount > 0 ? `${BRAND_ADDON_INFO.monthlyDisplay}` : "none"}
              </p>
            </div>
          </div>

          {/* Cancel section — owner only */}
          {isOwner && (
            <div className="pt-4" style={{ borderTop: "1px solid var(--border)" }}>
              <AnimatePresence>
                {showCancelConfirm ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3"
                  >
                    <p className="text-sm flex-1" style={{ color: "var(--danger)" }}>
                      Cancel subscription? All {locationCount} locations will lose access at period end.
                    </p>
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium"
                      style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
                    >
                      Keep Plan
                    </button>
                    <button
                      onClick={handleCancelSubscription}
                      disabled={cancelLoading}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium disabled:opacity-50"
                      style={{ background: "var(--danger)", color: "#fff" }}
                    >
                      {cancelLoading ? "Cancelling\u2026" : "Confirm Cancel"}
                    </button>
                  </motion.div>
                ) : (
                  <motion.button
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    onClick={() => setShowCancelConfirm(true)}
                    className="text-xs font-medium transition-opacity hover:opacity-80"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Cancel subscription
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* ─── Location Roster ─── */}
      <div
        className="rounded-2xl p-6 space-y-4"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <MapPin size={16} style={{ color: "var(--accent-gold)" }} />
          <h2 className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            Locations
          </h2>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
            {locationCount}
          </span>
        </div>

        {locations.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            No locations yet. Add locations in Brand Settings.
          </p>
        ) : (
          <div className="space-y-2">
            {locations.map((loc) => (
              <div
                key={loc.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: "var(--surface-2)" }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {loc.name}
                  </p>
                  {(loc.city || loc.state) && (
                    <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                      {[loc.city, loc.state].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
                {isSubscribed ? (
                  <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--accent-gold)" }}>
                    <Check size={14} />
                    Covered
                  </span>
                ) : (
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {loc.subscription_tier === "free" ? "Free" : loc.subscription_tier}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Pricing Card (only when not subscribed) ─── */}
      {!isSubscribed && (
        <div
          className="rounded-2xl p-6 space-y-6"
          style={{ background: "var(--surface)", border: "2px solid var(--accent-gold)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)" }}
            >
              <CreditCard size={20} style={{ color: "var(--accent-gold)" }} />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                Barrel Plan
              </h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Multi-location management for growing brands
              </p>
            </div>
          </div>

          {/* Billing interval toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBillingInterval("monthly")}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={billingInterval === "monthly" ? {
                background: "var(--accent-gold)", color: "var(--bg)",
              } : {
                background: "var(--surface-2)", color: "var(--text-muted)",
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval("annual")}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={billingInterval === "annual" ? {
                background: "var(--accent-gold)", color: "var(--bg)",
              } : {
                background: "var(--surface-2)", color: "var(--text-muted)",
              }}
            >
              Annual
              <span className="ml-1.5 text-xs opacity-75">Save {BRAND_ADDON_INFO.savings}</span>
            </button>
          </div>

          {/* Pricing breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Base subscription</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Brand + first location included</p>
              </div>
              <p className="text-sm font-mono font-bold" style={{ color: "var(--text-primary)" }}>Custom</p>
            </div>

            <div
              className="flex items-center justify-between py-2"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  Additional locations ({addonCount})
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {billingInterval === "monthly" ? BRAND_ADDON_INFO.monthlyDisplay : BRAND_ADDON_INFO.annualMonthlyDisplay} each
                </p>
              </div>
              <p className="text-sm font-mono font-bold" style={{ color: "var(--accent-gold)" }}>
                {billingInterval === "monthly"
                  ? `$${getMonthlyTotal()}/mo`
                  : `$${getAnnualTotal()}/yr`
                }
              </p>
            </div>

            {billingInterval === "annual" && addonCount > 0 && (
              <p className="text-xs text-right" style={{ color: "var(--text-muted)" }}>
                You save ${(addonCount * BRAND_ADDON_INFO.monthly * 12) - getAnnualTotal()}/yr on add-ons
              </p>
            )}
          </div>

          {/* CTA */}
          {isOwner ? (
            <button
              onClick={handleSubscribe}
              disabled={loadingCheckout}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
            >
              {loadingCheckout ? "Starting checkout\u2026" : "Subscribe to Barrel Plan"}
            </button>
          ) : (
            <div className="text-center py-3 rounded-xl" style={{ background: "var(--surface-2)" }}>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Contact your brand owner to manage billing
              </p>
            </div>
          )}

          <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
            Questions about pricing?{" "}
            <a
              href="mailto:hello@hoptrack.beer?subject=Barrel Plan Inquiry"
              className="underline"
              style={{ color: "var(--accent-gold)" }}
            >
              Contact us
            </a>
          </p>
        </div>
      )}

      {/* ─── Feature List ─── */}
      <div
        className="rounded-2xl p-6 space-y-4"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <h2 className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>
          Everything in Barrel
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {barrelFeatures.map((f) => (
            <div key={f.feature} className="flex items-center gap-2 py-1">
              <Check size={14} style={{ color: "var(--accent-gold)" }} />
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{f.feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
