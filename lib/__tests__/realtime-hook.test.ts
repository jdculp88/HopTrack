/**
 * Realtime subscription hook tests — Reese, Sprint 156 (The Triple Shot)
 * Validates the useRealtimeSubscription export and structure.
 */

import { describe, it, expect } from "vitest";

describe("useRealtimeSubscription", () => {
  it("is exported as a function", async () => {
    const mod = await import("@/hooks/useRealtimeSubscription");
    expect(mod.useRealtimeSubscription).toBeDefined();
    expect(typeof mod.useRealtimeSubscription).toBe("function");
  });

  it("module has no other unexpected named exports", async () => {
    const mod = await import("@/hooks/useRealtimeSubscription");
    const exportNames = Object.keys(mod);
    expect(exportNames).toContain("useRealtimeSubscription");
    // Only the hook should be exported
    expect(exportNames).toHaveLength(1);
  });
});
