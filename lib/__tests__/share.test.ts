// Share helpers tests — Sprint 162 (The Identity)
import { describe, it, expect } from "vitest";
import {
  generateOGImageUrl,
  hoptrackUrl,
  getPersonalityShareText,
  getPercentileShareText,
  getFavoritesShareText,
  getWeeklyShareText,
} from "@/lib/share";

// ─── generateOGImageUrl ───────────────────────────────────────────────────

describe("generateOGImageUrl", () => {
  it("builds URL with correct path", () => {
    const url = generateOGImageUrl("personality", { user_id: "abc" });
    expect(url).toContain("/og/story/personality");
    expect(url).toContain("user_id=abc");
  });

  it("uses a valid origin (window in tests, HOPTRACK_BASE_URL on server)", () => {
    const url = generateOGImageUrl("percentile", { metric: "ipa" });
    // In jsdom tests window exists → localhost; on server → hoptrack.beer
    expect(url).toMatch(/^https?:\/\/[^/]+\/og\/story\/percentile/);
  });

  it("handles all 4 story card types", () => {
    for (const type of ["personality", "percentile", "favorites", "weekly"] as const) {
      const url = generateOGImageUrl(type, {});
      expect(url).toContain(`/og/story/${type}`);
    }
  });

  it("skips undefined and null params", () => {
    const url = generateOGImageUrl("favorites", {
      user_id: "abc",
      week_start: undefined,
      extra: null,
      empty: "",
    });
    expect(url).toContain("user_id=abc");
    expect(url).not.toContain("week_start");
    expect(url).not.toContain("extra");
    expect(url).not.toContain("empty");
  });

  it("serializes number params", () => {
    const url = generateOGImageUrl("percentile", { percentile: 97 });
    expect(url).toContain("percentile=97");
  });
});

// ─── hoptrackUrl ──────────────────────────────────────────────────────────

describe("hoptrackUrl", () => {
  it("builds full URL from path", () => {
    const url = hoptrackUrl("/your-round");
    // In jsdom window exists → uses current origin; on server → hoptrack.beer
    expect(url).toMatch(/^https?:\/\/[^/]+\/your-round$/);
  });

  it("handles root path", () => {
    const url = hoptrackUrl("/");
    expect(url).toMatch(/^https?:\/\/[^/]+\/$/);
  });
});

// ─── getPersonalityShareText ──────────────────────────────────────────────

describe("getPersonalityShareText", () => {
  it("includes archetype, emoji, and HopTrack link", () => {
    const text = getPersonalityShareText({
      archetype: "The Hop Hunter",
      emoji: "🎯",
    });
    expect(text).toContain("The Hop Hunter");
    expect(text).toContain("🎯");
    expect(text).toContain("hoptrack.beer");
  });
});

// ─── getPercentileShareText ───────────────────────────────────────────────

describe("getPercentileShareText", () => {
  it("converts percentile to top %", () => {
    // 97th percentile = top 3%
    const text = getPercentileShareText({
      percentile: 97,
      metricLabel: "IPA drinkers",
    });
    expect(text).toContain("Top 3%");
    expect(text).toContain("IPA drinkers");
  });

  it("enforces minimum top % of 1", () => {
    // 100th percentile would be top 0%; clamp to 1%
    const text = getPercentileShareText({
      percentile: 100,
      metricLabel: "beer explorers",
    });
    expect(text).toContain("Top 1%");
  });

  it("handles mid-range percentiles", () => {
    const text = getPercentileShareText({
      percentile: 50,
      metricLabel: "drinkers",
    });
    expect(text).toContain("Top 50%");
  });
});

// ─── getFavoritesShareText ────────────────────────────────────────────────

describe("getFavoritesShareText", () => {
  it("includes top beer when provided", () => {
    const text = getFavoritesShareText({ topBeerName: "Hazy Little Thing" });
    expect(text).toContain("Hazy Little Thing");
    expect(text).toContain("4 favorite beers");
  });

  it("uses generic text when no top beer", () => {
    const text = getFavoritesShareText({ topBeerName: null });
    expect(text).toContain("4 favorite beers");
    expect(text).toContain("See yours");
  });
});

// ─── getWeeklyShareText ───────────────────────────────────────────────────

describe("getWeeklyShareText", () => {
  it("includes beer count and breweries", () => {
    const text = getWeeklyShareText({
      totalBeers: 8,
      uniqueBreweries: 3,
    });
    expect(text).toContain("8 beers");
    expect(text).toContain("3 breweries");
  });

  it("uses singular when appropriate", () => {
    const text = getWeeklyShareText({
      totalBeers: 1,
      uniqueBreweries: 1,
    });
    expect(text).toContain("1 beer ");
    expect(text).toContain("1 brewery");
  });

  it("omits breweries when 0", () => {
    const text = getWeeklyShareText({
      totalBeers: 3,
      uniqueBreweries: 0,
    });
    expect(text).not.toContain("0 brewer");
  });

  it("includes top beer when provided", () => {
    const text = getWeeklyShareText({
      totalBeers: 5,
      uniqueBreweries: 2,
      topBeerName: "Pliny the Elder",
    });
    expect(text).toContain("Pliny the Elder");
  });

  it("includes your-round link", () => {
    const text = getWeeklyShareText({
      totalBeers: 1,
      uniqueBreweries: 1,
    });
    expect(text).toContain("/your-round");
  });
});
