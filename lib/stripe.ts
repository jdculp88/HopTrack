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
export const STRIPE_PRICES: Record<"tap" | "cask", string> = {
  tap: process.env.STRIPE_PRICE_TAP || "price_tap_placeholder",
  cask: process.env.STRIPE_PRICE_CASK || "price_cask_placeholder",
};

export function getStripePublishableKey(): string {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

// Tier display info — single source of truth
export const TIER_INFO = {
  tap: { label: "Tap", price: "$49/mo" },
  cask: { label: "Cask", price: "$149/mo" },
  barrel: { label: "Barrel", price: "Custom" },
  free: { label: "Free Trial", price: "Free" },
} as const;
