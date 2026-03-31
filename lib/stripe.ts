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
