/**
 * Challenges system unit tests
 * Sprint 81 — The Challenge
 */

import { describe, it, expect } from "vitest";

// ── Challenge type validation ────────────────────────────────────────────────

const VALID_TYPES = ["beer_count", "specific_beers", "visit_streak", "style_variety"] as const;
type ChallengeType = typeof VALID_TYPES[number];

function isValidChallengeType(type: string): type is ChallengeType {
  return VALID_TYPES.includes(type as ChallengeType);
}

function validateChallenge(challenge: {
  name: string;
  challenge_type: string;
  target_value: number;
  target_beer_ids?: string[];
}) {
  const errors: string[] = [];
  if (!challenge.name?.trim()) errors.push("Name is required");
  if (!isValidChallengeType(challenge.challenge_type)) errors.push("Invalid challenge type");
  if (challenge.target_value < 1) errors.push("Target value must be at least 1");
  if (challenge.challenge_type === "specific_beers" && (!challenge.target_beer_ids || challenge.target_beer_ids.length === 0)) {
    errors.push("Specific beers challenge requires at least one beer");
  }
  return errors;
}

// ── Progress calculation ─────────────────────────────────────────────────────

function calculateProgressPct(current: number, target: number): number {
  return Math.min(100, Math.round((current / target) * 100));
}

function isCompleted(current: number, target: number): boolean {
  return current >= target;
}

function getProgressLabel(type: ChallengeType): string {
  switch (type) {
    case "beer_count": return "beers";
    case "specific_beers": return "beers tried";
    case "visit_streak": return "visits";
    case "style_variety": return "styles";
  }
}

// ── Reward formatting ────────────────────────────────────────────────────────

function formatReward(xp: number, description: string | null): string {
  if (description) return description;
  return `${xp} XP`;
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("Challenge validation", () => {
  it("rejects empty name", () => {
    const errors = validateChallenge({
      name: "",
      challenge_type: "beer_count",
      target_value: 5,
    });
    expect(errors).toContain("Name is required");
  });

  it("rejects whitespace-only name", () => {
    const errors = validateChallenge({
      name: "   ",
      challenge_type: "beer_count",
      target_value: 5,
    });
    expect(errors).toContain("Name is required");
  });

  it("rejects invalid challenge type", () => {
    const errors = validateChallenge({
      name: "Test Challenge",
      challenge_type: "invalid_type",
      target_value: 5,
    });
    expect(errors).toContain("Invalid challenge type");
  });

  it("rejects target_value less than 1", () => {
    const errors = validateChallenge({
      name: "Test Challenge",
      challenge_type: "beer_count",
      target_value: 0,
    });
    expect(errors).toContain("Target value must be at least 1");
  });

  it("rejects specific_beers type with no beer IDs", () => {
    const errors = validateChallenge({
      name: "Try These",
      challenge_type: "specific_beers",
      target_value: 3,
      target_beer_ids: [],
    });
    expect(errors).toContain("Specific beers challenge requires at least one beer");
  });

  it("passes valid beer_count challenge", () => {
    const errors = validateChallenge({
      name: "IPA Explorer",
      challenge_type: "beer_count",
      target_value: 5,
    });
    expect(errors).toHaveLength(0);
  });

  it("passes valid specific_beers challenge with beer IDs", () => {
    const errors = validateChallenge({
      name: "The Full Lineup",
      challenge_type: "specific_beers",
      target_value: 3,
      target_beer_ids: ["id-1", "id-2", "id-3"],
    });
    expect(errors).toHaveLength(0);
  });

  it("passes valid visit_streak challenge", () => {
    const errors = validateChallenge({
      name: "Regular",
      challenge_type: "visit_streak",
      target_value: 10,
    });
    expect(errors).toHaveLength(0);
  });

  it("passes valid style_variety challenge", () => {
    const errors = validateChallenge({
      name: "Style Explorer",
      challenge_type: "style_variety",
      target_value: 8,
    });
    expect(errors).toHaveLength(0);
  });
});

describe("Challenge progress calculation", () => {
  it("returns 0% for no progress", () => {
    expect(calculateProgressPct(0, 10)).toBe(0);
  });

  it("returns 50% for half progress", () => {
    expect(calculateProgressPct(5, 10)).toBe(50);
  });

  it("returns 100% for complete", () => {
    expect(calculateProgressPct(10, 10)).toBe(100);
  });

  it("caps at 100% even when over target", () => {
    expect(calculateProgressPct(15, 10)).toBe(100);
  });

  it("rounds to nearest integer", () => {
    expect(calculateProgressPct(1, 3)).toBe(33);
  });

  it("handles single-step targets", () => {
    expect(calculateProgressPct(1, 1)).toBe(100);
  });
});

describe("Challenge completion detection", () => {
  it("marks complete when progress equals target", () => {
    expect(isCompleted(5, 5)).toBe(true);
  });

  it("marks complete when progress exceeds target", () => {
    expect(isCompleted(7, 5)).toBe(true);
  });

  it("not complete when progress below target", () => {
    expect(isCompleted(4, 5)).toBe(false);
  });

  it("not complete at 0 progress", () => {
    expect(isCompleted(0, 10)).toBe(false);
  });
});

describe("Challenge type labels", () => {
  it("returns correct label for beer_count", () => {
    expect(getProgressLabel("beer_count")).toBe("beers");
  });

  it("returns correct label for specific_beers", () => {
    expect(getProgressLabel("specific_beers")).toBe("beers tried");
  });

  it("returns correct label for visit_streak", () => {
    expect(getProgressLabel("visit_streak")).toBe("visits");
  });

  it("returns correct label for style_variety", () => {
    expect(getProgressLabel("style_variety")).toBe("styles");
  });
});

describe("Reward formatting", () => {
  it("returns description when provided", () => {
    expect(formatReward(100, "Free pint of your choice")).toBe("Free pint of your choice");
  });

  it("falls back to XP when no description", () => {
    expect(formatReward(150, null)).toBe("150 XP");
  });

  it("handles 0 XP with description", () => {
    expect(formatReward(0, "Hall of Fame status")).toBe("Hall of Fame status");
  });

  it("handles 0 XP without description", () => {
    expect(formatReward(0, null)).toBe("0 XP");
  });
});

describe("Challenge type validation helper", () => {
  it("accepts all valid types", () => {
    VALID_TYPES.forEach(type => {
      expect(isValidChallengeType(type)).toBe(true);
    });
  });

  it("rejects invalid types", () => {
    expect(isValidChallengeType("invalid")).toBe(false);
    expect(isValidChallengeType("")).toBe(false);
    expect(isValidChallengeType("BEER_COUNT")).toBe(false); // case-sensitive
  });
});
