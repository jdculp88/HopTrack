// for-breweries page pricing tests — Avery + Reese, Sprint 112
// Validates that pricing constants in TIER_INFO match the values
// displayed on the /for-breweries marketing page.

import { describe, it, expect } from "vitest";
import { TIER_INFO } from "@/lib/stripe";
import { C } from "@/lib/landing-colors";

// ── Pricing integrity ────────────────────────────────────────────────────────

describe("for-breweries pricing: TIER_INFO values", () => {
  it("Tap tier is $49/mo — matches pricing page", () => {
    expect(TIER_INFO.tap.monthly).toBe(49);
    expect(TIER_INFO.tap.monthlyDisplay).toBe("$49/mo");
  });

  it("Cask tier is $149/mo — matches pricing page", () => {
    expect(TIER_INFO.cask.monthly).toBe(149);
    expect(TIER_INFO.cask.monthlyDisplay).toBe("$149/mo");
  });

  it("Barrel tier is Custom — no numeric price", () => {
    expect(TIER_INFO.barrel.monthlyDisplay).toBe("Custom");
    expect(TIER_INFO.barrel.monthly).toBe(0);
  });

  it("annual savings are 20% for paid tiers", () => {
    expect(TIER_INFO.tap.savings).toBe("20%");
    expect(TIER_INFO.cask.savings).toBe("20%");
  });

  it("annual Tap is $470/yr (~$39/mo)", () => {
    expect(TIER_INFO.tap.annual).toBe(470);
    expect(TIER_INFO.tap.annualMonthlyDisplay).toBe("$39/mo");
  });

  it("annual Cask is $1,430/yr (~$119/mo)", () => {
    expect(TIER_INFO.cask.annual).toBe(1430);
    expect(TIER_INFO.cask.annualMonthlyDisplay).toBe("$119/mo");
  });

  it("Cask costs more than Tap (monthly)", () => {
    expect(TIER_INFO.cask.monthly).toBeGreaterThan(TIER_INFO.tap.monthly);
  });

  it("Barrel has empty savings string (custom pricing)", () => {
    expect(TIER_INFO.barrel.savings).toBe("");
  });
});

// ── Marketing page brand constants ────────────────────────────────────────────

describe("for-breweries: brand color constants used on pricing page", () => {
  it("gold accent is canonical HopTrack gold", () => {
    expect(C.gold).toBe("#D4A843");
  });

  it("dark background is canonical HopTrack dark", () => {
    expect(C.dark).toBe("#0F0E0C");
  });

  it("pricing card surface color is defined", () => {
    expect(C.darkSurface).toBeTruthy();
    expect(C.darkSurface).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});
