/**
 * WCAG skip link regression tests — Reese, Sprint 156 (The Triple Shot)
 * Ensures accessibility patterns remain in place across shell components.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const root = join(__dirname, "../..");

function readFile(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf-8");
}

describe("WCAG skip links and main content landmarks", () => {
  it('AppShell has id="main-content" on main element', () => {
    const content = readFile("components/layout/AppShell.tsx");
    expect(content).toContain('id="main-content"');
  });

  it('StorefrontShell has id="main-content" on main element', () => {
    const content = readFile("components/layout/StorefrontShell.tsx");
    expect(content).toContain('id="main-content"');
  });

  it('app/(app)/layout.tsx has "Skip to main content" link', () => {
    const content = readFile("app/(app)/layout.tsx");
    expect(content).toContain("Skip to main content");
  });

  it("skip link targets #main-content", () => {
    const content = readFile("app/(app)/layout.tsx");
    expect(content).toContain('href="#main-content"');
  });
});
