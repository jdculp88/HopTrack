/**
 * ISR cache audit — Reese, Sprint 156 (The Triple Shot)
 * Verifies that key pages have ISR revalidation configured.
 * Note: "use cache" deferred — incompatible with existing revalidate/runtime exports.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const root = join(__dirname, "../..");

function readFile(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf-8");
}

describe("ISR revalidation directives", () => {
  it("brewery detail page has revalidate configured", () => {
    const content = readFile("app/(app)/brewery/[id]/page.tsx");
    expect(content).toContain("revalidate");
  });

  it("brewery admin dashboard has revalidate configured", () => {
    const content = readFile(
      "app/(brewery-admin)/brewery-admin/[brewery_id]/page.tsx"
    );
    expect(content).toContain("revalidate");
  });
});

describe("Next.js experimental configuration", () => {
  it("next.config.ts has staleTimes configured", () => {
    const content = readFile("next.config.ts");
    expect(content).toContain("staleTimes");
  });
});
