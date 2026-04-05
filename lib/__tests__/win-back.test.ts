import { describe, it, expect } from "vitest";
import { getWinBackTemplate } from "../win-back";

// ── Template Selection ──────────────────────────────────────────────────────

describe("getWinBackTemplate", () => {
  it("returns VIP-specific template for VIP segment", () => {
    const { action, template } = getWinBackTemplate("vip", "Pint & Pixel");
    expect(action).toContain("personal");
    expect(template).toContain("Pint & Pixel");
    expect(template).toContain("regulars");
  });

  it("returns power-specific template for Power segment", () => {
    const { action, template } = getWinBackTemplate("power", "Mountain Ridge");
    expect(action).toContain("new");
    expect(template).toContain("Mountain Ridge");
    expect(template).toContain("new brews");
  });

  it("returns incentive template for Regular segment", () => {
    const { action, template } = getWinBackTemplate("regular", "River Bend");
    expect(action).toContain("incentive");
    expect(template).toContain("River Bend");
    expect(template).toContain("double loyalty stamps");
  });

  it("returns generic template for New segment", () => {
    const { action, template } = getWinBackTemplate("new", "Smoky Barrel");
    expect(template).toContain("Smoky Barrel");
    expect(template).toContain("tap list");
  });

  it("always includes brewery name in template", () => {
    for (const segment of ["vip", "power", "regular", "new"] as const) {
      const { template } = getWinBackTemplate(segment, "Test Brewery");
      expect(template).toContain("Test Brewery");
    }
  });
});
