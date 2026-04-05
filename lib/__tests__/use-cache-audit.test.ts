/**
 * Cache audit — Reese + Jordan, Sprint 158 (The Cache)
 * Verifies "use cache" migration: pages use cached data functions
 * instead of ISR `export const revalidate` directives.
 */

import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const root = join(__dirname, "../..");

function readFile(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf-8");
}

describe("\"use cache\" migration (Sprint 158)", () => {
  it("cacheComponents is enabled in next.config.ts", () => {
    const content = readFile("next.config.ts");
    expect(content).toContain("cacheComponents: true");
  });

  it("custom cache profiles are defined", () => {
    const content = readFile("next.config.ts");
    expect(content).toContain("hop-realtime");
    expect(content).toContain("hop-standard");
    expect(content).toContain("hop-static");
  });

  it("next.config.ts has staleTimes configured", () => {
    const content = readFile("next.config.ts");
    expect(content).toContain("staleTimes");
  });

  it("cached-data.ts exists with use cache functions", () => {
    const content = readFile("lib/cached-data.ts");
    expect(content).toContain('"use cache"');
    expect(content).toContain("cacheLife");
    expect(content).toContain("cacheTag");
  });

  it("cache-invalidation.ts exists with revalidateTag helpers", () => {
    const content = readFile("lib/cache-invalidation.ts");
    expect(content).toContain("revalidateTag");
    expect(content).toContain("invalidateBrewery");
    expect(content).toContain("invalidateBrand");
  });
});

describe("ISR revalidate exports removed", () => {
  const pages = [
    "app/(app)/brewery/[id]/page.tsx",
    "app/(app)/brand/[slug]/page.tsx",
    "app/brewery-welcome/[id]/page.tsx",
    "app/embed/[brewery_id]/menu/page.tsx",
    "app/demo/dashboard/page.tsx",
    "app/(superadmin)/superadmin/page.tsx",
  ];

  for (const page of pages) {
    it(`${page} does not export revalidate`, () => {
      const content = readFile(page);
      expect(content).not.toContain("export const revalidate");
    });
  }
});

describe("Cached data functions are used", () => {
  it("brewery welcome page uses getCachedBreweryWelcomeData", () => {
    const content = readFile("app/brewery-welcome/[id]/page.tsx");
    expect(content).toContain("getCachedBreweryWelcomeData");
  });

  it("embed menu page uses getCachedEmbedMenuData", () => {
    const content = readFile("app/embed/[brewery_id]/menu/page.tsx");
    expect(content).toContain("getCachedEmbedMenuData");
  });

  it("brand page uses getCachedBrandPublicData", () => {
    const content = readFile("app/(app)/brand/[slug]/page.tsx");
    expect(content).toContain("getCachedBrandPublicData");
  });

  it("brewery detail uses getCachedBreweryPublicData", () => {
    const content = readFile("app/(app)/brewery/[id]/page.tsx");
    expect(content).toContain("getCachedBreweryPublicData");
  });

  it("superadmin page uses getCachedCommandCenterData", () => {
    const content = readFile("app/(superadmin)/superadmin/page.tsx");
    expect(content).toContain("getCachedCommandCenterData");
  });

  it("demo dashboard uses inline use cache function", () => {
    const content = readFile("app/demo/dashboard/page.tsx");
    expect(content).toContain('"use cache"');
    expect(content).toContain("cacheLife");
  });
});

describe("Intelligence Layer (Sprint 158)", () => {
  it("superadmin-intelligence.ts exists with all 8 calculation functions", () => {
    const content = readFile("lib/superadmin-intelligence.ts");
    expect(content).toContain("calculateMagicNumber");
    expect(content).toContain("calculateTimeToValue");
    expect(content).toContain("calculateContentVelocity");
    expect(content).toContain("calculateFeatureAdoption");
    expect(content).toContain("calculateBreweryHealth");
    expect(content).toContain("calculateSocialGraph");
    expect(content).toContain("calculatePredictiveSignals");
    expect(content).toContain("calculateRevenueV2");
  });

  it("intelligence API endpoints exist", () => {
    expect(existsSync(join(root, "app/api/superadmin/intelligence/route.ts"))).toBe(true);
    expect(existsSync(join(root, "app/api/superadmin/intelligence/magic-number/route.ts"))).toBe(true);
    expect(existsSync(join(root, "app/api/superadmin/intelligence/brewery-health/route.ts"))).toBe(true);
  });

  it("IntelligenceSections component exists", () => {
    const content = readFile("app/(superadmin)/superadmin/IntelligenceSections.tsx");
    expect(content).toContain("IntelligenceLayer");
    expect(content).toContain("MagicNumberDashboard");
    expect(content).toContain("BreweryHealthSection");
  });

  it("CommandCenterClient imports IntelligenceLayer", () => {
    const content = readFile("app/(superadmin)/superadmin/CommandCenterClient.tsx");
    expect(content).toContain("IntelligenceLayer");
  });
});
