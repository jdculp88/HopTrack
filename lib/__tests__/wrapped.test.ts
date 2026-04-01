// Wrapped stats pure function tests — Reese, Sprint 93 retro action item
import { describe, it, expect } from "vitest";
import {
  getWrappedPersonality,
  getRatingPersonality,
  getLevelTitle,
  getAdventurerScore,
  getShareText,
  getWrappedColors,
  type WrappedStats,
} from "@/lib/wrapped";

// ── getWrappedPersonality ──

describe("getWrappedPersonality", () => {
  it("returns The Explorer when no top style", () => {
    const result = getWrappedPersonality(null, 0);
    expect(result.archetype).toBe("The Explorer");
  });

  it("returns Renaissance Drinker when 10+ unique styles", () => {
    const result = getWrappedPersonality("IPA", 10);
    expect(result.archetype).toBe("The Renaissance Drinker");
  });

  it("returns Renaissance Drinker even with high style count and unknown style", () => {
    const result = getWrappedPersonality("Some Unknown Style", 15);
    expect(result.archetype).toBe("The Renaissance Drinker");
  });

  it("returns Hophead for IPA with fewer than 10 styles", () => {
    const result = getWrappedPersonality("IPA", 5);
    expect(result.archetype).toBe("The Hophead");
  });

  it("returns Dark Arts for Stout", () => {
    const result = getWrappedPersonality("Stout", 3);
    expect(result.archetype).toBe("The Dark Arts");
  });

  it("returns Sour Seeker for Gose", () => {
    const result = getWrappedPersonality("Gose", 2);
    expect(result.archetype).toBe("The Sour Seeker");
  });

  it("returns default Explorer for unknown style with low count", () => {
    const result = getWrappedPersonality("Rauchbier", 4);
    expect(result.archetype).toBe("The Explorer");
  });

  it("returns emoji and tagline with every result", () => {
    const result = getWrappedPersonality("Lager", 3);
    expect(result.emoji).toBeTruthy();
    expect(result.tagline).toBeTruthy();
  });
});

// ── getRatingPersonality ──

describe("getRatingPersonality", () => {
  it("returns Silent Sipper for null rating", () => {
    expect(getRatingPersonality(null)).toBe("The Silent Sipper");
  });

  it("returns Eternal Optimist for 4.5+", () => {
    expect(getRatingPersonality(4.5)).toBe("The Eternal Optimist");
    expect(getRatingPersonality(5.0)).toBe("The Eternal Optimist");
  });

  it("returns Generous Critic for 4.0-4.49", () => {
    expect(getRatingPersonality(4.0)).toBe("The Generous Critic");
    expect(getRatingPersonality(4.3)).toBe("The Generous Critic");
  });

  it("returns Fair Judge for 3.5-3.99", () => {
    expect(getRatingPersonality(3.5)).toBe("The Fair Judge");
  });

  it("returns Honest Reviewer for 3.0-3.49", () => {
    expect(getRatingPersonality(3.0)).toBe("The Honest Reviewer");
  });

  it("returns Tough Crowd for 2.5-2.99", () => {
    expect(getRatingPersonality(2.5)).toBe("The Tough Crowd");
  });

  it("returns Brutal Critic for below 2.5", () => {
    expect(getRatingPersonality(2.0)).toBe("The Brutal Critic");
    expect(getRatingPersonality(1.0)).toBe("The Brutal Critic");
  });
});

// ── getLevelTitle ──

describe("getLevelTitle", () => {
  it("returns a title for level 1", () => {
    const title = getLevelTitle(1);
    expect(title).toBeTruthy();
    expect(typeof title).toBe("string");
  });

  it("returns Beer Enthusiast for unknown level", () => {
    expect(getLevelTitle(999)).toBe("Beer Enthusiast");
  });
});

// ── getAdventurerScore ──

describe("getAdventurerScore", () => {
  it("returns 0 for zero styles", () => {
    expect(getAdventurerScore(0)).toBe(0);
  });

  it("returns 100 for 26 styles (all known)", () => {
    expect(getAdventurerScore(26)).toBe(100);
  });

  it("caps at 100 even if more than 26 styles", () => {
    expect(getAdventurerScore(30)).toBe(100);
  });

  it("calculates correct percentage for partial coverage", () => {
    // 13/26 = 50%
    expect(getAdventurerScore(13)).toBe(50);
  });

  it("rounds to nearest integer", () => {
    // 1/26 = 3.846... -> 4
    expect(getAdventurerScore(1)).toBe(4);
  });
});

// ── getShareText ──

describe("getShareText", () => {
  const baseStats: WrappedStats = {
    period: { start: "2025-01-01", end: "2025-12-31", label: "2025" },
    totalSessions: 50,
    totalBeers: 120,
    uniqueBeers: 80,
    uniqueBreweries: 15,
    uniqueStyles: 12,
    topBrewery: { name: "Heist", city: "Charlotte", visits: 10 },
    topBeer: { name: "Citraquench'l", brewery: "Heist", count: 8 },
    topStyle: { style: "IPA", count: 40 },
    personality: { archetype: "The Hophead", emoji: "hop", tagline: "hops rule" },
    avgRating: 4.2,
    ratingPersonality: "The Generous Critic",
    longestStreak: 7,
    xpEarned: 3000,
    level: { level: 10, title: "Journeyman" },
    achievementsUnlocked: 5,
    friendsMade: 3,
    citiesVisited: ["Charlotte", "Asheville"],
    adventurerScore: 46,
    homeSessions: 10,
    brewerySessions: 40,
    legendarySession: { beerCount: 6, breweryName: "Heist" },
  };

  it("includes archetype name", () => {
    const text = getShareText(baseStats, "hopfan");
    expect(text).toContain("The Hophead");
  });

  it("includes total beers and brewery count", () => {
    const text = getShareText(baseStats, "hopfan");
    expect(text).toContain("120 beers");
    expect(text).toContain("15 breweries");
  });

  it("includes top style", () => {
    const text = getShareText(baseStats, "hopfan");
    expect(text).toContain("IPA");
  });

  it("includes level info", () => {
    const text = getShareText(baseStats, "hopfan");
    expect(text).toContain("Level 10");
  });

  it("includes hoptrack URL", () => {
    const text = getShareText(baseStats, "hopfan");
    expect(text).toContain("hoptrack.beer/wrapped");
  });

  it("handles missing top style gracefully", () => {
    const noStyle = { ...baseStats, topStyle: null };
    const text = getShareText(noStyle, "hopfan");
    expect(text).not.toContain("Top style");
  });
});

// ── getWrappedColors ──

describe("getWrappedColors", () => {
  it("returns gold defaults when no top style", () => {
    const colors = getWrappedColors(null);
    expect(colors.c1).toContain("accent-gold");
  });

  it("returns style-based colors for known style", () => {
    const colors = getWrappedColors("IPA");
    expect(colors.c1).toBeTruthy();
    expect(colors.c2).toBeTruthy();
    expect(colors.c3).toBeTruthy();
  });
});
