/**
 * Compliance audit regression tests — Reese, Sprint 156 (The Triple Shot)
 * Ensures FTC disclosure patterns and compliance migrations stay in place.
 * These tests scan source files — if a disclosure is removed, CI catches it.
 */

import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const root = join(__dirname, "../..");

function readFile(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf-8");
}

describe("FTC RatingDisclosure integration", () => {
  it("QuickRatingSheet imports RatingDisclosure", () => {
    const content = readFile("components/session/QuickRatingSheet.tsx");
    expect(content).toContain("RatingDisclosure");
  });

  it("BeerReviewSection imports RatingDisclosure", () => {
    const content = readFile("components/beer/BeerReviewSection.tsx");
    expect(content).toContain("RatingDisclosure");
  });

  it("BreweryReview imports RatingDisclosure", () => {
    const content = readFile("components/brewery/BreweryReview.tsx");
    expect(content).toContain("RatingDisclosure");
  });
});

describe("Terms of Service compliance", () => {
  it('Terms page contains "Incentivized Reviews" section', () => {
    const content = readFile("app/terms/page.tsx");
    expect(content).toContain("Incentivized Reviews");
  });
});

describe("Compliance migrations exist", () => {
  it("migration 097 (compliance_shield) exists", () => {
    const exists = existsSync(
      join(root, "supabase/migrations/097_compliance_shield.sql")
    );
    expect(exists).toBe(true);
  });

  it("migration 098 (trending_content) exists", () => {
    const exists = existsSync(
      join(root, "supabase/migrations/098_trending_content.sql")
    );
    expect(exists).toBe(true);
  });
});
