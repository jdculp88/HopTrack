/**
 * API Helpers Unit Tests — Sprint 134 (The Tidy)
 *
 * Tests the shared auth + tier checking helpers.
 */

import { describe, test, expect } from "vitest";
import { ADMIN_ROLES, STAFF_ROLES, PREMIUM_TIERS } from "@/lib/api-helpers";

describe("API Helper Constants", () => {
  test("ADMIN_ROLES contains owner and manager", () => {
    expect(ADMIN_ROLES).toContain("owner");
    expect(ADMIN_ROLES).toContain("manager");
    expect(ADMIN_ROLES).toHaveLength(2);
  });

  test("STAFF_ROLES contains all 5 roles", () => {
    expect(STAFF_ROLES).toContain("owner");
    expect(STAFF_ROLES).toContain("manager");
    expect(STAFF_ROLES).toContain("business");
    expect(STAFF_ROLES).toContain("marketing");
    expect(STAFF_ROLES).toContain("staff");
    expect(STAFF_ROLES).toHaveLength(5);
  });

  test("PREMIUM_TIERS contains cask and barrel", () => {
    expect(PREMIUM_TIERS).toContain("cask");
    expect(PREMIUM_TIERS).toContain("barrel");
    expect(PREMIUM_TIERS).toHaveLength(2);
  });

  test("ADMIN_ROLES is a subset of STAFF_ROLES", () => {
    for (const role of ADMIN_ROLES) {
      expect(STAFF_ROLES).toContain(role);
    }
  });
});

describe("Shared Constants (tiers)", () => {
  test("TIER_COLORS has all 4 tiers", async () => {
    const { TIER_COLORS } = await import("@/lib/constants/tiers");
    expect(Object.keys(TIER_COLORS)).toEqual(
      expect.arrayContaining(["bronze", "silver", "gold", "platinum"])
    );
  });

  test("TIER_STYLES has all 4 tiers with required properties", async () => {
    const { TIER_STYLES } = await import("@/lib/constants/tiers");
    for (const tier of ["bronze", "silver", "gold", "platinum"]) {
      expect(TIER_STYLES[tier]).toHaveProperty("ring");
      expect(TIER_STYLES[tier]).toHaveProperty("glow");
      expect(TIER_STYLES[tier]).toHaveProperty("label");
      expect(TIER_STYLES[tier]).toHaveProperty("color");
    }
  });

  test("RANK_STYLES has top 3 ranks", async () => {
    const { RANK_STYLES } = await import("@/lib/constants/tiers");
    for (const rank of [1, 2, 3]) {
      expect(RANK_STYLES[rank]).toHaveProperty("bg");
      expect(RANK_STYLES[rank]).toHaveProperty("text");
      expect(RANK_STYLES[rank]).toHaveProperty("label");
    }
  });

  test("CATEGORY_LABELS covers all achievement categories", async () => {
    const { CATEGORY_LABELS } = await import("@/lib/constants/tiers");
    const expected = [
      "explorer", "variety", "social", "loyalty", "streak",
      "milestone", "seasonal", "special", "quantity", "time", "quality",
    ];
    for (const cat of expected) {
      expect(CATEGORY_LABELS).toHaveProperty(cat);
    }
  });
});

describe("Shared Constants (UI)", () => {
  test("PILL_ACTIVE has required CSS properties", async () => {
    const { PILL_ACTIVE } = await import("@/lib/constants/ui");
    expect(PILL_ACTIVE).toHaveProperty("background");
    expect(PILL_ACTIVE).toHaveProperty("color");
    expect(PILL_ACTIVE).toHaveProperty("borderColor");
  });

  test("PILL_INACTIVE has required CSS properties", async () => {
    const { PILL_INACTIVE } = await import("@/lib/constants/ui");
    expect(PILL_INACTIVE).toHaveProperty("background");
    expect(PILL_INACTIVE).toHaveProperty("color");
    expect(PILL_INACTIVE).toHaveProperty("borderColor");
  });

  test("INPUT_STYLE has form input properties", async () => {
    const { INPUT_STYLE } = await import("@/lib/constants/ui");
    expect(INPUT_STYLE).toHaveProperty("width", "100%");
    expect(INPUT_STYLE).toHaveProperty("borderRadius", 12);
    expect(INPUT_STYLE).toHaveProperty("fontSize", 14);
  });
});

describe("getFirstName utility", () => {
  test("extracts first name from display name", async () => {
    const { getFirstName } = await import("@/lib/first-name");
    expect(getFirstName("John Smith")).toBe("John");
  });

  test("falls back to username", async () => {
    const { getFirstName } = await import("@/lib/first-name");
    expect(getFirstName(null, "hopfan42")).toBe("hopfan42");
  });

  test("falls back to Someone", async () => {
    const { getFirstName } = await import("@/lib/first-name");
    expect(getFirstName(null, null)).toBe("Someone");
  });

  test("handles undefined", async () => {
    const { getFirstName } = await import("@/lib/first-name");
    expect(getFirstName(undefined, undefined)).toBe("Someone");
  });

  test("handles single name", async () => {
    const { getFirstName } = await import("@/lib/first-name");
    expect(getFirstName("Joshua")).toBe("Joshua");
  });
});
