/**
 * Session OG image route tests — Reese, Sprint 156 (The Triple Shot)
 * Verifies the session share OG image route exists and exports GET.
 */

import { describe, it, expect } from "vitest";
import { existsSync } from "fs";
import { join } from "path";

const root = join(__dirname, "../..");

describe("Session OG image route", () => {
  it("route file exists at app/og/session/route.tsx", () => {
    const exists = existsSync(join(root, "app/og/session/route.tsx"));
    expect(exists).toBe(true);
  });

  it("exports a GET function", async () => {
    const mod = await import("@/app/og/session/route");
    expect(mod.GET).toBeDefined();
    expect(typeof mod.GET).toBe("function");
  });

  it("runtime export removed for cacheComponents compatibility (Sprint 158)", async () => {
    const mod = await import("@/app/og/session/route");
    // runtime = "edge" removed — incompatible with cacheComponents
    // Sprint 173 fix: use `in` operator since the module type no longer declares `runtime`.
    expect("runtime" in mod).toBe(false);
  });
});
