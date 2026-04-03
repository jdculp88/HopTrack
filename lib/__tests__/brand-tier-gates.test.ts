// Brand tier gates tests — Casey + Reese, Sprint 130
// Tests BRAND_FEATURE_GATES and FEATURE_MATRIX brand-tier entries from lib/stripe.ts

import { describe, it, expect } from "vitest";
import { FEATURE_MATRIX } from "@/lib/stripe";

// BRAND_FEATURE_GATES will be added in Sprint 130 — import it once it exists
// For now we use a dynamic import so the test file is ready before implementation

describe("BRAND_FEATURE_GATES", () => {
  it("is exported from lib/stripe", async () => {
    const mod = await import("@/lib/stripe");
    expect(mod).toHaveProperty("BRAND_FEATURE_GATES");
  });

  it("contains all expected brand feature keys", async () => {
    const { BRAND_FEATURE_GATES } = await import("@/lib/stripe");
    const expectedKeys = [
      "brand_dashboard",
      "brand_loyalty",
      "brand_catalog",
      "brand_tap_list",
      "brand_reports",
      "brand_team",
      "brand_customers",
      "brand_billing",
    ];
    for (const key of expectedKeys) {
      expect(BRAND_FEATURE_GATES).toHaveProperty(key);
    }
  });

  it("every gate value is an array", async () => {
    const { BRAND_FEATURE_GATES } = await import("@/lib/stripe");
    for (const [key, value] of Object.entries(BRAND_FEATURE_GATES as Record<string, unknown>)) {
      expect(Array.isArray(value), `${key} should be an array`).toBe(true);
    }
  });

  it("every gate includes 'barrel' tier", async () => {
    const { BRAND_FEATURE_GATES } = await import("@/lib/stripe");
    for (const [key, tiers] of Object.entries(BRAND_FEATURE_GATES as Record<string, readonly string[]>)) {
      expect(tiers, `${key} should include 'barrel'`).toContain("barrel");
    }
  });
});

describe("FEATURE_MATRIX — brand tier entries", () => {
  it("includes 'Multi-location management' as barrel-only", () => {
    const multiLoc = FEATURE_MATRIX.find(
      (row) => row.feature === "Multi-location management"
    );
    expect(multiLoc).toBeDefined();
    expect(multiLoc!.barrel).toBe(true);
    expect(multiLoc!.cask).toBe(false);
    expect(multiLoc!.tap).toBe(false);
    expect(multiLoc!.free).toBe(false);
  });
});
