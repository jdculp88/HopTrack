/**
 * Environment Variable Audit Tests — Sprint 151 (The Ops Room)
 *
 * Verifies that production env vars documented in .env.production.example
 * are actually referenced somewhere in the codebase. Catches drift between
 * documentation and code.
 *
 * Uses a single grep invocation to build a reference map (fast), then
 * checks each documented var against the map.
 *
 * Riley
 */

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

const ROOT = join(__dirname, "../..");

// Known optional vars that may not be referenced directly in source
const OPTIONAL_VARS = new Set(["NEXT_PUBLIC_MAPBOX_TOKEN"]);

// Parse env vars from .env.production.example
function getDocumentedEnvVars(): string[] {
  const content = readFileSync(
    join(ROOT, ".env.production.example"),
    "utf-8"
  );

  const vars: string[] = [];
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=/);
    if (match) vars.push(match[1]);
  }
  return vars;
}

// Build a set of all env var names referenced in source files (fast, single pass)
function buildReferenceSet(): Set<string> {
  const refs = new Set<string>();
  const extensions = new Set([".ts", ".tsx", ".js", ".mjs", ".yml"]);
  const skipDirs = new Set(["node_modules", ".next", ".git", "coverage", "playwright-report"]);

  function scan(dir: string) {
    let entries;
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const entry of entries) {
      if (skipDirs.has(entry)) continue;
      const fullPath = join(dir, entry);
      let stat;
      try {
        stat = statSync(fullPath);
      } catch {
        continue;
      }
      if (stat.isDirectory()) {
        scan(fullPath);
      } else if (extensions.has(extname(entry))) {
        try {
          const content = readFileSync(fullPath, "utf-8");
          // Match process.env.VAR_NAME or env var names in strings
          const matches = content.match(/[A-Z][A-Z0-9_]{2,}/g);
          if (matches) {
            for (const m of matches) refs.add(m);
          }
        } catch {
          // skip unreadable files
        }
      }
    }
  }

  scan(ROOT);
  return refs;
}

describe("Environment Variable Audit", () => {
  const documentedVars = getDocumentedEnvVars();
  const referencedVars = buildReferenceSet();

  it("has env vars documented in .env.production.example", () => {
    expect(documentedVars.length).toBeGreaterThan(10);
  });

  it("found references in the codebase", () => {
    expect(referencedVars.size).toBeGreaterThan(50);
  });

  for (const envVar of documentedVars) {
    if (OPTIONAL_VARS.has(envVar)) {
      it(`${envVar} is documented as optional`, () => {
        // Optional vars may not be referenced — just verify they're documented
        expect(OPTIONAL_VARS.has(envVar)).toBe(true);
      });
    } else {
      it(`${envVar} is referenced in the codebase`, () => {
        expect(
          referencedVars.has(envVar),
          `${envVar} is documented but not referenced in any source file`
        ).toBe(true);
      });
    }
  }
});
