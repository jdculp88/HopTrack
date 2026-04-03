/**
 * DRY Pattern Guardrail Tests — Sprint 134 (The Tidy)
 *
 * These tests prevent regression back to old copy-paste patterns.
 * They grep the codebase for banned inline patterns that should use
 * the shared building blocks created in this sprint.
 *
 * Reese 🧪: "If it's not enforced, it didn't happen. Covered."
 */

import { execSync } from "child_process";
import { describe, test, expect } from "vitest";

function grepCount(pattern: string, globs: string, exclude?: string): number {
  try {
    const excludeFlag = exclude ? ` --glob '!${exclude}'` : "";
    const cmd = `rg -c '${pattern}' --glob '${globs}'${excludeFlag} --no-filename 2>/dev/null | awk '{s+=$1} END {print s+0}'`;
    const result = execSync(cmd, { cwd: process.cwd(), encoding: "utf-8" }).trim();
    return parseInt(result, 10) || 0;
  } catch {
    return 0;
  }
}

function grepFiles(pattern: string, globs: string, exclude?: string): string[] {
  try {
    const excludeFlag = exclude ? ` --glob '!${exclude}'` : "";
    const cmd = `rg -l '${pattern}' --glob '${globs}'${excludeFlag} 2>/dev/null`;
    const result = execSync(cmd, { cwd: process.cwd(), encoding: "utf-8" }).trim();
    return result ? result.split("\n") : [];
  } catch {
    return [];
  }
}

describe("DRY Pattern Enforcement", () => {
  test("no inline role checks in API routes (use requireBreweryAdmin)", () => {
    const files = grepFiles(
      '\\["owner",\\s*"manager"\\]',
      "app/api/**/*.ts",
      "lib/api-helpers.ts"
    );
    // Allow only lib/api-helpers.ts to define role arrays
    const violations = files.filter(
      (f) => !f.includes("api-helpers") && !f.includes("__tests__")
    );
    expect(violations).toEqual([]);
  });

  test("no inline tier checks in API routes (use requirePremiumTier)", () => {
    const files = grepFiles(
      '\\["cask",\\s*"barrel"\\]',
      "app/api/**/*.ts",
      "lib/api-helpers.ts"
    );
    const violations = files.filter(
      (f) => !f.includes("api-helpers") && !f.includes("__tests__") && !f.includes("stripe")
    );
    expect(violations).toEqual([]);
  });

  test("no inline first-name extraction (use getFirstName)", () => {
    const files = grepFiles(
      '\\.split\\(" "\\)\\[0\\]',
      "components/**/*.{ts,tsx}",
      "lib/first-name.ts"
    );
    const violations = files.filter(
      (f) => !f.includes("first-name") && !f.includes("__tests__")
    );
    expect(violations).toEqual([]);
  });

  test("no duplicated TIER_COLORS definitions (use lib/constants/tiers)", () => {
    const files = grepFiles(
      "TIER_COLORS.*Record",
      "**/*.{ts,tsx}",
      "lib/constants/tiers.ts"
    );
    const violations = files.filter(
      (f) => !f.includes("constants/tiers") && !f.includes("__tests__")
    );
    expect(violations).toEqual([]);
  });

  test("no duplicated RANK_STYLES definitions (use lib/constants/tiers)", () => {
    const files = grepFiles(
      "RANK_STYLES.*Record",
      "**/*.{ts,tsx}",
      "lib/constants/tiers.ts"
    );
    const violations = files.filter(
      (f) => !f.includes("constants/tiers") && !f.includes("__tests__")
    );
    expect(violations).toEqual([]);
  });

  test("no duplicated CATEGORY_LABELS definitions (use lib/constants/tiers)", () => {
    const files = grepFiles(
      "CATEGORY_LABELS.*Record",
      "**/*.{ts,tsx}",
      "lib/constants/tiers.ts"
    );
    const violations = files.filter(
      (f) => !f.includes("constants/tiers") && !f.includes("__tests__")
    );
    expect(violations).toEqual([]);
  });
});
