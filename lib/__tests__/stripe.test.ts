// Stripe helpers unit tests — Avery + Reese, Sprint 77 (updated Sprint 121)
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { STRIPE_PRICES, TIER_INFO, isStripeConfigured, STRIPE_BRAND_PRICES, BRAND_ADDON_INFO } from "@/lib/stripe";

// ── STRIPE_PRICES ──

describe("STRIPE_PRICES", () => {
  it("has all four price keys (monthly + annual per tier)", () => {
    expect(STRIPE_PRICES).toHaveProperty("tap_monthly");
    expect(STRIPE_PRICES).toHaveProperty("tap_annual");
    expect(STRIPE_PRICES).toHaveProperty("cask_monthly");
    expect(STRIPE_PRICES).toHaveProperty("cask_annual");
  });

  it("all price values are strings", () => {
    for (const key of Object.keys(STRIPE_PRICES) as (keyof typeof STRIPE_PRICES)[]) {
      expect(typeof STRIPE_PRICES[key]).toBe("string");
    }
  });

  it("uses placeholder values when env vars are not set", () => {
    // Without env vars, should fall back to placeholders
    expect(STRIPE_PRICES.tap_monthly).toContain("placeholder");
    expect(STRIPE_PRICES.tap_annual).toContain("placeholder");
    expect(STRIPE_PRICES.cask_monthly).toContain("placeholder");
    expect(STRIPE_PRICES.cask_annual).toContain("placeholder");
  });
});

// ── TIER_INFO ──

describe("TIER_INFO", () => {
  it("has all four tiers", () => {
    expect(TIER_INFO).toHaveProperty("tap");
    expect(TIER_INFO).toHaveProperty("cask");
    expect(TIER_INFO).toHaveProperty("barrel");
    expect(TIER_INFO).toHaveProperty("free");
  });

  it("tap tier has correct pricing", () => {
    expect(TIER_INFO.tap.monthly).toBe(49);
    expect(TIER_INFO.tap.annual).toBe(470);
    expect(TIER_INFO.tap.label).toBe("Tap");
    expect(TIER_INFO.tap.savings).toBe("20%");
  });

  it("cask tier has correct pricing", () => {
    expect(TIER_INFO.cask.monthly).toBe(149);
    expect(TIER_INFO.cask.annual).toBe(1430);
    expect(TIER_INFO.cask.label).toBe("Cask");
    expect(TIER_INFO.cask.savings).toBe("20%");
  });

  it("barrel tier is custom pricing", () => {
    expect(TIER_INFO.barrel.monthlyDisplay).toBe("Custom");
    expect(TIER_INFO.barrel.annualDisplay).toBe("Custom");
  });

  it("free tier has zero pricing", () => {
    expect(TIER_INFO.free.monthly).toBe(0);
    expect(TIER_INFO.free.annual).toBe(0);
    expect(TIER_INFO.free.label).toBe("Free Trial");
  });

  it("each tier has all required display fields", () => {
    for (const tier of Object.values(TIER_INFO)) {
      expect(tier).toHaveProperty("label");
      expect(tier).toHaveProperty("monthly");
      expect(tier).toHaveProperty("annual");
      expect(tier).toHaveProperty("monthlyDisplay");
      expect(tier).toHaveProperty("annualDisplay");
      expect(tier).toHaveProperty("annualMonthlyDisplay");
      expect(tier).toHaveProperty("savings");
    }
  });
});

// ── isStripeConfigured ──

describe("isStripeConfigured", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns false when STRIPE_SECRET_KEY is not set", () => {
    delete process.env.STRIPE_SECRET_KEY;
    // isStripeConfigured reads process.env at call time
    expect(isStripeConfigured()).toBe(false);
  });

  it("returns false when STRIPE_SECRET_KEY is empty string", () => {
    process.env.STRIPE_SECRET_KEY = "";
    expect(isStripeConfigured()).toBe(false);
  });

  it("returns true when STRIPE_SECRET_KEY is set", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    expect(isStripeConfigured()).toBe(true);
  });
});

// ── STRIPE_BRAND_PRICES (Sprint 121) ──

describe("STRIPE_BRAND_PRICES", () => {
  it("has all four brand price keys", () => {
    expect(STRIPE_BRAND_PRICES).toHaveProperty("barrel_monthly");
    expect(STRIPE_BRAND_PRICES).toHaveProperty("barrel_annual");
    expect(STRIPE_BRAND_PRICES).toHaveProperty("location_addon_monthly");
    expect(STRIPE_BRAND_PRICES).toHaveProperty("location_addon_annual");
  });

  it("all brand price values are strings", () => {
    for (const key of Object.keys(STRIPE_BRAND_PRICES) as (keyof typeof STRIPE_BRAND_PRICES)[]) {
      expect(typeof STRIPE_BRAND_PRICES[key]).toBe("string");
    }
  });

  it("uses placeholder values when env vars are not set", () => {
    expect(STRIPE_BRAND_PRICES.barrel_monthly).toContain("placeholder");
    expect(STRIPE_BRAND_PRICES.barrel_annual).toContain("placeholder");
    expect(STRIPE_BRAND_PRICES.location_addon_monthly).toContain("placeholder");
    expect(STRIPE_BRAND_PRICES.location_addon_annual).toContain("placeholder");
  });
});

// ── BRAND_ADDON_INFO (Sprint 121) ──

describe("BRAND_ADDON_INFO", () => {
  it("has correct per-location add-on pricing", () => {
    expect(BRAND_ADDON_INFO.monthly).toBe(39);
    expect(BRAND_ADDON_INFO.annual).toBe(374);
  });

  it("has display strings", () => {
    expect(BRAND_ADDON_INFO.monthlyDisplay).toBe("$39/location/mo");
    expect(BRAND_ADDON_INFO.annualDisplay).toBe("$374/location/yr");
    expect(BRAND_ADDON_INFO.savings).toBe("20%");
  });

  it("annual is cheaper than 12x monthly", () => {
    expect(BRAND_ADDON_INFO.annual).toBeLessThan(BRAND_ADDON_INFO.monthly * 12);
  });
});
