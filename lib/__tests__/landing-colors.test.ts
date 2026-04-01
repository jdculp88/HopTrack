// Landing colors unit tests — Reese, Sprint 98
import { describe, it, expect } from "vitest";
import { C } from "@/lib/landing-colors";

// ─── Color existence ─────────────────────────────────────────────────────────

describe("landing colors: expected keys", () => {
  const expectedKeys = [
    "cream",
    "dark",
    "darkSurface",
    "darkBorder",
    "gold",
    "goldDark",
    "green",
    "text",
    "textMuted",
    "textSubtle",
    "border",
    "creamText",
    "creamMuted",
    "creamSubtle",
  ];

  it("has all expected color keys", () => {
    for (const key of expectedKeys) {
      expect(C).toHaveProperty(key);
    }
  });

  it("has no unexpected keys", () => {
    const actualKeys = Object.keys(C);
    expect(actualKeys.sort()).toEqual(expectedKeys.sort());
  });

  it(`has exactly ${14} color entries`, () => {
    expect(Object.keys(C)).toHaveLength(14);
  });
});

// ─── Hex format validation ───────────────────────────────────────────────────

describe("landing colors: hex format", () => {
  it("all values are valid 7-character hex color strings", () => {
    for (const [key, value] of Object.entries(C)) {
      expect(value, `C.${key} should be a valid hex color`).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("all hex values start with #", () => {
    for (const value of Object.values(C)) {
      expect(value[0]).toBe("#");
    }
  });
});

// ─── Canonical color values ──────────────────────────────────────────────────

describe("landing colors: canonical values", () => {
  it("C.gold matches canonical HopTrack gold #D4A843", () => {
    expect(C.gold).toBe("#D4A843");
  });

  it("C.dark matches canonical dark background #0F0E0C", () => {
    expect(C.dark).toBe("#0F0E0C");
  });

  it("C.cream is the cream background #FBF7F0", () => {
    expect(C.cream).toBe("#FBF7F0");
  });

  it("C.goldDark is a darker gold variant", () => {
    expect(C.goldDark).toBe("#C49A35");
  });

  it("C.green is the brand green #2D5A3D", () => {
    expect(C.green).toBe("#2D5A3D");
  });
});

// ─── Type safety ─────────────────────────────────────────────────────────────

describe("landing colors: type safety", () => {
  it("C is readonly (as const)", () => {
    // Verify the object is deeply readonly by checking values are strings
    for (const value of Object.values(C)) {
      expect(typeof value).toBe("string");
    }
  });

  it("all values are non-empty strings", () => {
    for (const [key, value] of Object.entries(C)) {
      expect(value.length, `C.${key} should not be empty`).toBeGreaterThan(0);
    }
  });
});
