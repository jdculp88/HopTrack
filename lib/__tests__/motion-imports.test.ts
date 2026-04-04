/**
 * Regression test: framer-motion → motion/react migration — Sprint 157
 *
 * Ensures no source files import from the old "framer-motion" package.
 * All imports should use "motion/react" (migrated in earlier sprints).
 */

import { describe, it, expect } from "vitest";
import { execSync } from "child_process";

describe("motion/react migration", () => {
  it("should have zero framer-motion imports in source files", () => {
    // Exclude test files themselves from the search (they contain the search pattern as a string)
    const result = execSync(
      'grep -rl \'from "framer-motion"\' --include="*.tsx" --include="*.ts" --exclude="*motion-imports*" app/ components/ hooks/ lib/ 2>/dev/null || true',
      { encoding: "utf-8", cwd: process.cwd() }
    ).trim();
    expect(result).toBe("");
  });

  it("should not have framer-motion in dynamic imports", () => {
    const result = execSync(
      'grep -rl \'import("framer-motion")\' --include="*.tsx" --include="*.ts" --exclude="*motion-imports*" app/ components/ hooks/ lib/ 2>/dev/null || true',
      { encoding: "utf-8", cwd: process.cwd() }
    ).trim();
    expect(result).toBe("");
  });
});
