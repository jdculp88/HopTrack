/**
 * View Transitions API utility tests — Reese, Sprint 156 (The Triple Shot)
 * Tests supportsViewTransitions and viewTransitionName helpers.
 */

import { describe, it, expect } from "vitest";
import { supportsViewTransitions, viewTransitionName } from "@/lib/view-transitions";

describe("supportsViewTransitions()", () => {
  it("returns false in JSDOM (no startViewTransition)", () => {
    // JSDOM does not implement the View Transitions API
    expect(supportsViewTransitions()).toBe(false);
  });
});

describe("viewTransitionName()", () => {
  it("returns object with viewTransitionName property", () => {
    const result = viewTransitionName("beer-card-123");
    expect(result).toHaveProperty("viewTransitionName");
    expect(result.viewTransitionName).toBe("beer-card-123");
  });

  it("returns valid CSSProperties shape", () => {
    const result = viewTransitionName("brewery-hero");
    expect(typeof result).toBe("object");
    expect(result.viewTransitionName).toBe("brewery-hero");
  });

  it("handles empty string id", () => {
    const result = viewTransitionName("");
    expect(result.viewTransitionName).toBe("");
  });
});
