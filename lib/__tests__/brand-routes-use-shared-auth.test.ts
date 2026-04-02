import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Static analysis test: ensures all brand API routes use the shared
 * verifyBrandAccess() utility instead of inline brand_accounts queries.
 *
 * This prevents the RLS recursion bug from Sprint 122 from recurring
 * through inconsistent auth patterns.
 */

const BRAND_ROUTES_DIR = join(__dirname, "../../app/api/brand/[brand_id]");

// All brand API route files that need the shared auth pattern
const ROUTE_FILES = [
  "team-activity/route.ts",
  "locations/route.ts",
  "billing/cancel/route.ts",
  "billing/portal/route.ts",
  "billing/checkout/route.ts",
  "route.ts",
  "catalog/route.ts",
  "catalog/[catalog_beer_id]/route.ts",
  "catalog/[catalog_beer_id]/add-to-locations/route.ts",
  "tap-list/route.ts",
  "tap-list/push/route.ts",
  "tap-list/batch/route.ts",
  "analytics/route.ts",
  "analytics/export/route.ts",
  "analytics/comparison/route.ts",
  "active-sessions/route.ts",
  "members/route.ts",
];

describe("Brand API routes — shared auth standard", () => {
  it("all brand routes import verifyBrandAccess", () => {
    const missing: string[] = [];

    for (const file of ROUTE_FILES) {
      const filePath = join(BRAND_ROUTES_DIR, file);
      let content: string;
      try {
        content = readFileSync(filePath, "utf-8");
      } catch {
        // File doesn't exist — skip (could be a future route)
        continue;
      }

      if (!content.includes("verifyBrandAccess")) {
        // route.ts (brand CRUD) may not need it for GET/DELETE — check if it has any brand_accounts auth
        const hasBrandAccountsAuth = content.includes('.from("brand_accounts")') && content.includes('.select("role")');
        if (hasBrandAccountsAuth) {
          missing.push(file);
        }
      }
    }

    if (missing.length > 0) {
      throw new Error(
        `These brand routes still use inline brand_accounts auth instead of verifyBrandAccess:\n` +
        missing.map(f => `  - ${f}`).join("\n") +
        `\n\nUse: import { verifyBrandAccess } from "@/lib/brand-auth";`
      );
    }
  });

  it("no brand route defines local auth helpers (getBrandRole, verifyMembership, verifyBrandRole)", () => {
    const violations: string[] = [];
    const localHelperPatterns = [
      /function\s+getBrandRole\s*\(/,
      /function\s+verifyMembership\s*\(/,
      /function\s+verifyBrandRole\s*\(/,
    ];

    for (const file of ROUTE_FILES) {
      const filePath = join(BRAND_ROUTES_DIR, file);
      let content: string;
      try {
        content = readFileSync(filePath, "utf-8");
      } catch {
        continue;
      }

      for (const pattern of localHelperPatterns) {
        if (pattern.test(content)) {
          violations.push(`${file} defines ${pattern.source.match(/function\s+(\w+)/)?.[1] ?? "unknown helper"}`);
        }
      }
    }

    if (violations.length > 0) {
      throw new Error(
        `Local auth helpers found (should use shared verifyBrandAccess instead):\n` +
        violations.map(v => `  - ${v}`).join("\n")
      );
    }
  });
});
