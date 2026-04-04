/**
 * Review moderation library tests — Reese, Sprint 156 (The Triple Shot)
 * Tests shouldAutoFlag blocklist matching and MODERATION_REASONS constants.
 */

import { describe, it, expect } from "vitest";
import { shouldAutoFlag, MODERATION_REASONS } from "@/lib/moderation";

describe("shouldAutoFlag()", () => {
  it("clean text passes (not flagged)", () => {
    const result = shouldAutoFlag("This IPA has great citrus notes and a clean finish.");
    expect(result.flagged).toBe(false);
    expect(result.reason).toBeNull();
  });

  it("blocklist term triggers flag", () => {
    const result = shouldAutoFlag("Check out this beer, buy now at my shop!");
    expect(result.flagged).toBe(true);
    expect(result.reason).toContain("buy now");
  });

  it("case insensitive matching", () => {
    const result = shouldAutoFlag("CLICK HERE for free stuff");
    expect(result.flagged).toBe(true);
    expect(result.reason).toContain("click here");
  });

  it("empty string returns not flagged", () => {
    const result = shouldAutoFlag("");
    expect(result.flagged).toBe(false);
    expect(result.reason).toBeNull();
  });

  it("flags shortened URLs (bit.ly)", () => {
    const result = shouldAutoFlag("Great beer! See more at bit.ly/beer123");
    expect(result.flagged).toBe(true);
    expect(result.reason).toContain("bit.ly");
  });

  it("flags tinyurl links", () => {
    const result = shouldAutoFlag("Follow this tinyurl link");
    expect(result.flagged).toBe(true);
    expect(result.reason).toContain("tinyurl");
  });
});

describe("MODERATION_REASONS", () => {
  it("has exactly 5 items", () => {
    expect(MODERATION_REASONS).toHaveLength(5);
  });

  it('includes "Spam or advertising"', () => {
    expect(MODERATION_REASONS).toContain("Spam or advertising");
  });

  it('includes "Fake or misleading review"', () => {
    expect(MODERATION_REASONS).toContain("Fake or misleading review");
  });

  it('includes "Other" as a catch-all', () => {
    expect(MODERATION_REASONS).toContain("Other");
  });
});
