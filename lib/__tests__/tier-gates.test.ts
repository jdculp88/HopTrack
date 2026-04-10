/**
 * tier-gates unit tests — Sprint A (The Display Suite)
 *
 * Verifies the feature × tier gate truth table. Every Cask-gated feature
 * must deny Tap/free breweries and allow Cask/Barrel breweries; every
 * non-gated feature must allow everyone.
 */

import { describe, test, expect } from "vitest";
import {
  canAccessFeature,
  getAccessibleFeatures,
  getUpgradeMessage,
  type DisplayFeature,
} from "@/lib/tier-gates";

// Every feature that should be Cask-gated (keep in sync with tier-gates.ts)
const CASK_GATED: readonly DisplayFeature[] = [
  "custom-brand-color",
  "custom-background",
  "custom-font",
  "display-scale-override",
  "board-gallery",
  "promo-carousel",
  "qr-logo-embed",
  "pdf-print-suite",
  "embed-brand-theme",
] as const;

describe("canAccessFeature", () => {
  describe("Cask-gated features", () => {
    for (const feature of CASK_GATED) {
      test(`"${feature}" denies null brewery`, () => {
        expect(canAccessFeature(null, feature)).toBe(false);
      });

      test(`"${feature}" denies undefined brewery`, () => {
        expect(canAccessFeature(undefined, feature)).toBe(false);
      });

      test(`"${feature}" denies brewery with no tier`, () => {
        expect(canAccessFeature({}, feature)).toBe(false);
      });

      test(`"${feature}" denies Tap tier`, () => {
        expect(canAccessFeature({ subscription_tier: "tap" }, feature)).toBe(false);
      });

      test(`"${feature}" denies free tier`, () => {
        expect(canAccessFeature({ subscription_tier: "free" }, feature)).toBe(false);
      });

      test(`"${feature}" denies unknown tier`, () => {
        expect(canAccessFeature({ subscription_tier: "enterprise" }, feature)).toBe(false);
      });

      test(`"${feature}" allows Cask tier`, () => {
        expect(canAccessFeature({ subscription_tier: "cask" }, feature)).toBe(true);
      });

      test(`"${feature}" allows Barrel tier`, () => {
        expect(canAccessFeature({ subscription_tier: "barrel" }, feature)).toBe(true);
      });
    }
  });
});

describe("getAccessibleFeatures", () => {
  test("null brewery returns empty array", () => {
    expect(getAccessibleFeatures(null)).toEqual([]);
  });

  test("Tap tier returns empty array (no gated features)", () => {
    // All 9 current features are Cask-gated, so Tap gets none
    expect(getAccessibleFeatures({ subscription_tier: "tap" })).toEqual([]);
  });

  test("Cask tier returns all 9 features", () => {
    const features = getAccessibleFeatures({ subscription_tier: "cask" });
    expect(features).toHaveLength(9);
    for (const f of CASK_GATED) {
      expect(features).toContain(f);
    }
  });

  test("Barrel tier returns all 9 features", () => {
    const features = getAccessibleFeatures({ subscription_tier: "barrel" });
    expect(features).toHaveLength(9);
  });
});

describe("getUpgradeMessage", () => {
  test("returns non-empty message for every feature", () => {
    for (const feature of CASK_GATED) {
      const msg = getUpgradeMessage(feature);
      expect(msg).toBeTruthy();
      expect(msg.length).toBeGreaterThan(10);
    }
  });

  test("all messages mention Cask", () => {
    for (const feature of CASK_GATED) {
      expect(getUpgradeMessage(feature).toLowerCase()).toContain("cask");
    }
  });
});
