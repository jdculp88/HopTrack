// Stripe integration stub — Quinn + Avery, Sprint 46
// Install: npm install stripe
// Docs: https://stripe.com/docs/api

// Lazy import so missing package doesn't crash the build when keys aren't set
let _stripe: any = null;

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!_stripe) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Stripe = require("stripe");
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    });
  }
  return _stripe;
}

// Price IDs — replace with real Stripe price IDs from dashboard
export const STRIPE_PRICES = {
  tap_monthly: process.env.STRIPE_PRICE_TAP_MONTHLY || "price_tap_monthly_placeholder",
  tap_annual: process.env.STRIPE_PRICE_TAP_ANNUAL || "price_tap_annual_placeholder",
  cask_monthly: process.env.STRIPE_PRICE_CASK_MONTHLY || "price_cask_monthly_placeholder",
  cask_annual: process.env.STRIPE_PRICE_CASK_ANNUAL || "price_cask_annual_placeholder",
} as const;

// Legacy alias for backward compat
export const STRIPE_PRICES_LEGACY: Record<"tap" | "cask", string> = {
  tap: STRIPE_PRICES.tap_monthly,
  cask: STRIPE_PRICES.cask_monthly,
};

export function getStripePublishableKey(): string {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

// Tier display info — single source of truth
export const TIER_INFO = {
  tap: {
    label: "Tap",
    monthly: 49,
    annual: 470,
    monthlyDisplay: "$49/mo",
    annualDisplay: "$470/yr",
    annualMonthlyDisplay: "$39/mo",
    savings: "20%",
  },
  cask: {
    label: "Cask",
    monthly: 149,
    annual: 1430,
    monthlyDisplay: "$149/mo",
    annualDisplay: "$1,430/yr",
    annualMonthlyDisplay: "$119/mo",
    savings: "20%",
  },
  barrel: { label: "Barrel", monthly: 0, annual: 0, monthlyDisplay: "Custom", annualDisplay: "Custom", annualMonthlyDisplay: "Custom", savings: "" },
  free: { label: "Free Trial", monthly: 0, annual: 0, monthlyDisplay: "Free", annualDisplay: "Free", annualMonthlyDisplay: "Free", savings: "" },
} as const;

// Feature matrix — single source of truth for tier gating
export const FEATURE_MATRIX = [
  { feature: "Tap list management", free: true, tap: true, cask: true, barrel: true, category: "Core" },
  { feature: "Brewery profile page", free: true, tap: true, cask: true, barrel: true, category: "Core" },
  { feature: "QR code table tents", free: false, tap: true, cask: true, barrel: true, category: "Core" },
  { feature: "Basic analytics", free: false, tap: true, cask: true, barrel: true, category: "Analytics" },
  { feature: "Loyalty program (up to 50 members)", free: false, tap: true, cask: false, barrel: false, category: "Loyalty" },
  { feature: "Unlimited loyalty members", free: false, tap: false, cask: true, barrel: true, category: "Loyalty" },
  { feature: "Digital mug clubs", free: false, tap: false, cask: true, barrel: true, category: "Loyalty" },
  { feature: "Redemption code verification", free: false, tap: false, cask: true, barrel: true, category: "Loyalty" },
  { feature: "Ad campaigns", free: false, tap: false, cask: true, barrel: true, category: "Marketing" },
  { feature: "Promotion hub", free: false, tap: false, cask: true, barrel: true, category: "Marketing" },
  { feature: "Sponsored challenges", free: false, tap: false, cask: true, barrel: true, category: "Marketing" },
  { feature: "Advanced analytics & trends", free: false, tap: false, cask: true, barrel: true, category: "Analytics" },
  { feature: "Events management", free: false, tap: false, cask: true, barrel: true, category: "Events" },
  { feature: "POS integration", free: false, tap: false, cask: true, barrel: true, category: "Integrations" },
  { feature: "Public API access", free: false, tap: false, cask: true, barrel: true, category: "Integrations" },
  { feature: "Customer messaging", free: false, tap: false, cask: true, barrel: true, category: "Marketing" },
  { feature: "Priority support", free: false, tap: false, cask: true, barrel: true, category: "Support" },
  { feature: "Multi-location management", free: false, tap: false, cask: false, barrel: true, category: "Enterprise" },
  { feature: "Custom integrations", free: false, tap: false, cask: false, barrel: true, category: "Enterprise" },
  { feature: "Dedicated account manager", free: false, tap: false, cask: false, barrel: true, category: "Enterprise" },
] as const;

// ─── Brand Feature Gates (Sprint 130 — The Welcome Mat) ───────────────────
// Brands require Barrel tier to exist. These gates document which brand features
// require which minimum tier. Since brand creation itself is gated to Barrel,
// these serve as documentation + test anchors, not runtime checks.
export const BRAND_FEATURE_GATES = {
  brand_dashboard: ["barrel"],
  brand_loyalty: ["cask", "barrel"],
  brand_catalog: ["barrel"],
  brand_tap_list: ["barrel"],
  brand_reports: ["barrel"],
  brand_team: ["barrel"],
  brand_customers: ["barrel"],
  brand_billing: ["barrel"],
} as const;

// ─── Brand Billing (Sprint 121 — The Ledger) ──────────────────────────────

// Brand-level Stripe price IDs — base Barrel subscription + per-location add-on
export const STRIPE_BRAND_PRICES = {
  barrel_monthly: process.env.STRIPE_PRICE_BRAND_BARREL_MONTHLY || "price_brand_barrel_monthly_placeholder",
  barrel_annual: process.env.STRIPE_PRICE_BRAND_BARREL_ANNUAL || "price_brand_barrel_annual_placeholder",
  location_addon_monthly: process.env.STRIPE_PRICE_BRAND_LOCATION_ADDON_MONTHLY || "price_brand_addon_monthly_placeholder",
  location_addon_annual: process.env.STRIPE_PRICE_BRAND_LOCATION_ADDON_ANNUAL || "price_brand_addon_annual_placeholder",
} as const;

// Per-location add-on display info
export const BRAND_ADDON_INFO = {
  monthly: 39,
  annual: 374,
  monthlyDisplay: "$39/location/mo",
  annualDisplay: "$374/location/yr",
  annualMonthlyDisplay: "$31/location/mo",
  savings: "20%",
} as const;
