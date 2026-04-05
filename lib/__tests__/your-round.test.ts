// Your Round tests — Sprint 162 (The Identity)
import { describe, it, expect } from "vitest";
import {
  computeYourRoundRange,
  formatYourRoundLabel,
  getYourRoundShareText,
} from "@/lib/your-round";
import type { WrappedStats } from "@/lib/wrapped";

// ─── computeYourRoundRange ────────────────────────────────────────────────

describe("computeYourRoundRange", () => {
  it("default window is 7 days", () => {
    const end = new Date("2026-04-05T12:00:00Z");
    const range = computeYourRoundRange(end);
    const diff = (range.end.getTime() - range.start.getTime()) / (24 * 60 * 60 * 1000);
    expect(diff).toBe(7);
  });

  it("end is inclusive of the end date", () => {
    const end = new Date("2026-04-05T12:00:00Z");
    const range = computeYourRoundRange(end);
    expect(range.end).toEqual(end);
  });

  it("supports custom window length", () => {
    const end = new Date("2026-04-05T12:00:00Z");
    const range = computeYourRoundRange(end, 14);
    const diff = (range.end.getTime() - range.start.getTime()) / (24 * 60 * 60 * 1000);
    expect(diff).toBe(14);
  });

  it("defaults end to now", () => {
    const before = Date.now();
    const range = computeYourRoundRange();
    const after = Date.now();
    expect(range.end.getTime()).toBeGreaterThanOrEqual(before);
    expect(range.end.getTime()).toBeLessThanOrEqual(after);
  });
});

// ─── formatYourRoundLabel ─────────────────────────────────────────────────

describe("formatYourRoundLabel", () => {
  it("calls a fresh 7-day window ending today 'This Week'", () => {
    const end = new Date();
    const range = computeYourRoundRange(end);
    expect(formatYourRoundLabel(range)).toBe("This Week");
  });

  it("calls a range ending yesterday 'This Week'", () => {
    const end = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const range = computeYourRoundRange(end);
    expect(formatYourRoundLabel(range)).toBe("This Week");
  });

  it("uses date range for older weeks", () => {
    // Range ending >1.5 days ago falls back to month-day format
    const end = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    const range = computeYourRoundRange(end);
    const label = formatYourRoundLabel(range);
    expect(label).toMatch(/^\w+ \d+ – \w+ \d+$/);
  });

  it("uses date range for non-7-day windows", () => {
    // 14-day range gets date format even if ends today
    const range = computeYourRoundRange(new Date(), 14);
    const label = formatYourRoundLabel(range);
    expect(label).toMatch(/^\w+ \d+ – \w+ \d+$/);
  });
});

// ─── getYourRoundShareText ────────────────────────────────────────────────

function makeStats(overrides: Partial<WrappedStats> = {}): WrappedStats {
  return {
    period: { start: "", end: "", label: "This Week" },
    totalSessions: 0,
    totalBeers: 0,
    uniqueBeers: 0,
    uniqueBreweries: 0,
    uniqueStyles: 0,
    topBrewery: null,
    topBeer: null,
    topStyle: null,
    personality: { archetype: "The Explorer", emoji: "🧭", tagline: "" },
    avgRating: null,
    ratingPersonality: "The Silent Sipper",
    longestStreak: 0,
    xpEarned: 0,
    level: { level: 1, title: "Sipper" },
    achievementsUnlocked: 0,
    friendsMade: 0,
    citiesVisited: [],
    adventurerScore: 0,
    homeSessions: 0,
    brewerySessions: 0,
    legendarySession: null,
    ...overrides,
  };
}

describe("getYourRoundShareText", () => {
  it("includes totalBeers and breweries", () => {
    const stats = makeStats({ totalBeers: 8, uniqueBreweries: 3 });
    const text = getYourRoundShareText(stats);
    expect(text).toContain("8 beers");
    expect(text).toContain("3 breweries");
  });

  it("uses singular when appropriate", () => {
    const stats = makeStats({ totalBeers: 1, uniqueBreweries: 1 });
    const text = getYourRoundShareText(stats);
    expect(text).toContain("1 beer ");
    expect(text).toContain("1 brewery");
  });

  it("omits breweries section when 0", () => {
    const stats = makeStats({ totalBeers: 3, uniqueBreweries: 0 });
    const text = getYourRoundShareText(stats);
    expect(text).not.toContain("0 brewer");
  });

  it("includes top style when available", () => {
    const stats = makeStats({
      totalBeers: 5,
      uniqueBreweries: 2,
      topStyle: { style: "Hazy IPA", count: 4 },
    });
    const text = getYourRoundShareText(stats);
    expect(text).toContain("Hazy IPA");
  });

  it("always includes /your-round URL", () => {
    const text = getYourRoundShareText(makeStats({ totalBeers: 1 }));
    expect(text).toContain("/your-round");
  });

  it("says 'this week' for This Week label", () => {
    const stats = makeStats({
      totalBeers: 5,
      period: { start: "", end: "", label: "This Week" },
    });
    const text = getYourRoundShareText(stats);
    expect(text).toMatch(/^This week on HopTrack/);
  });
});
