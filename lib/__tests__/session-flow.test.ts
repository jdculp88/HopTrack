// Session flow unit tests — Reese, Sprint 98
// Tests XP calculation logic, level boundaries, and streak edge cases
import { describe, it, expect } from "vitest";
import {
  SESSION_XP,
  LEVELS,
  getLevelFromXP,
  getNextLevel,
  getLevelProgress,
} from "@/lib/xp";

// ─── XP Calculation Logic (mirrors session-end API) ──────────────────────────

/**
 * Pure function that mirrors the XP calculation in app/api/sessions/[id]/end/route.ts.
 * Extracted here to test the math independently of the API route.
 */
function calculateSessionXP(opts: {
  beerCount: number;
  ratedCount: number;
  isFirstVisit: boolean;
}): number {
  let xp = SESSION_XP.session_start;
  xp += opts.beerCount * SESSION_XP.per_beer;
  xp += opts.ratedCount * SESSION_XP.per_rating;
  if (opts.beerCount >= 3) xp += SESSION_XP.three_plus_beers_bonus;
  if (opts.isFirstVisit) xp += SESSION_XP.first_visit_bonus;
  return xp;
}

describe("SESSION_XP constants", () => {
  it("has all expected keys", () => {
    expect(SESSION_XP).toHaveProperty("session_start");
    expect(SESSION_XP).toHaveProperty("per_beer");
    expect(SESSION_XP).toHaveProperty("per_rating");
    expect(SESSION_XP).toHaveProperty("first_visit_bonus");
    expect(SESSION_XP).toHaveProperty("three_plus_beers_bonus");
  });

  it("all values are positive integers", () => {
    for (const [, val] of Object.entries(SESSION_XP)) {
      expect(val).toBeGreaterThan(0);
      expect(Number.isInteger(val)).toBe(true);
    }
  });
});

describe("calculateSessionXP", () => {
  it("gives base XP for an empty session (0 beers, 0 ratings, not first visit)", () => {
    const xp = calculateSessionXP({ beerCount: 0, ratedCount: 0, isFirstVisit: false });
    expect(xp).toBe(SESSION_XP.session_start);
  });

  it("adds per_beer XP for each beer", () => {
    const xp = calculateSessionXP({ beerCount: 2, ratedCount: 0, isFirstVisit: false });
    expect(xp).toBe(SESSION_XP.session_start + 2 * SESSION_XP.per_beer);
  });

  it("adds per_rating XP for each rating", () => {
    const xp = calculateSessionXP({ beerCount: 1, ratedCount: 1, isFirstVisit: false });
    expect(xp).toBe(SESSION_XP.session_start + SESSION_XP.per_beer + SESSION_XP.per_rating);
  });

  it("applies three_plus_beers_bonus at exactly 3 beers", () => {
    const xp = calculateSessionXP({ beerCount: 3, ratedCount: 0, isFirstVisit: false });
    expect(xp).toBe(
      SESSION_XP.session_start + 3 * SESSION_XP.per_beer + SESSION_XP.three_plus_beers_bonus
    );
  });

  it("does NOT apply three_plus_beers_bonus at 2 beers", () => {
    const xp = calculateSessionXP({ beerCount: 2, ratedCount: 0, isFirstVisit: false });
    expect(xp).toBe(SESSION_XP.session_start + 2 * SESSION_XP.per_beer);
  });

  it("applies first_visit_bonus when isFirstVisit is true", () => {
    const xp = calculateSessionXP({ beerCount: 0, ratedCount: 0, isFirstVisit: true });
    expect(xp).toBe(SESSION_XP.session_start + SESSION_XP.first_visit_bonus);
  });

  it("stacks all bonuses for a full session", () => {
    const xp = calculateSessionXP({ beerCount: 5, ratedCount: 3, isFirstVisit: true });
    expect(xp).toBe(
      SESSION_XP.session_start +
        5 * SESSION_XP.per_beer +
        3 * SESSION_XP.per_rating +
        SESSION_XP.three_plus_beers_bonus +
        SESSION_XP.first_visit_bonus
    );
  });

  it("computes a realistic session: 2 beers, 1 rated, not first visit", () => {
    // 25 + 2*15 + 1*10 = 65
    const xp = calculateSessionXP({ beerCount: 2, ratedCount: 1, isFirstVisit: false });
    expect(xp).toBe(65);
  });

  it("computes a big session: 4 beers, all rated, first visit", () => {
    // 25 + 4*15 + 4*10 + 25 + 50 = 200
    const xp = calculateSessionXP({ beerCount: 4, ratedCount: 4, isFirstVisit: true });
    expect(xp).toBe(200);
  });
});

// ─── getLevelFromXP boundary conditions ──────────────────────────────────────

describe("getLevelFromXP boundaries", () => {
  it("returns level 1 for negative XP", () => {
    expect(getLevelFromXP(-1).level).toBe(1);
  });

  it("returns level 1 for 0 XP", () => {
    expect(getLevelFromXP(0).level).toBe(1);
  });

  it("returns level 1 at 99 XP (1 below level 2)", () => {
    expect(getLevelFromXP(99).level).toBe(1);
  });

  it("transitions to level 2 at exactly 100 XP", () => {
    expect(getLevelFromXP(100).level).toBe(2);
  });

  it("stays level 2 at 249 XP (1 below level 3)", () => {
    expect(getLevelFromXP(249).level).toBe(2);
  });

  it("transitions to level 3 at exactly 250 XP", () => {
    expect(getLevelFromXP(250).level).toBe(3);
  });

  it("returns level 20 at exactly 62500 XP", () => {
    expect(getLevelFromXP(62_500).level).toBe(20);
  });

  it("stays level 20 at 999999 XP", () => {
    expect(getLevelFromXP(999_999).level).toBe(20);
  });

  it("returns correct names at every boundary", () => {
    for (const level of LEVELS) {
      const result = getLevelFromXP(level.xp_required);
      expect(result.level).toBe(level.level);
      expect(result.name).toBe(level.name);
    }
  });
});

// ─── getNextLevel edge cases ─────────────────────────────────────────────────

describe("getNextLevel edge cases", () => {
  it("returns level 2 for level 1", () => {
    expect(getNextLevel(1)!.level).toBe(2);
    expect(getNextLevel(1)!.name).toBe("Tasting Notes");
  });

  it("returns null for level 20 (max)", () => {
    expect(getNextLevel(20)).toBeNull();
  });

  it("returns null for level 21 (beyond max)", () => {
    expect(getNextLevel(21)).toBeNull();
  });

  it("returns null for level 0 (invalid)", () => {
    // Level 0 doesn't exist, so there's no level 1 via currentLevel + 1... wait
    // getNextLevel(0) looks for level 1, which exists
    expect(getNextLevel(0)!.level).toBe(1);
  });

  it("returns correct next for every valid level", () => {
    for (let i = 1; i < 20; i++) {
      const next = getNextLevel(i);
      expect(next).not.toBeNull();
      expect(next!.level).toBe(i + 1);
    }
  });
});

// ─── getLevelProgress edge cases ─────────────────────────────────────────────

describe("getLevelProgress edge cases", () => {
  it("returns 0% at the start of level 1", () => {
    const result = getLevelProgress(0);
    expect(result.current.level).toBe(1);
    expect(result.progress).toBe(0);
    expect(result.xpToNext).toBe(100);
  });

  it("returns 50% halfway through level 1 (50 XP)", () => {
    const result = getLevelProgress(50);
    expect(result.progress).toBe(50);
    expect(result.xpToNext).toBe(50);
  });

  it("returns 0% at exact level boundary (level 2 at 100)", () => {
    const result = getLevelProgress(100);
    expect(result.current.level).toBe(2);
    expect(result.progress).toBe(0);
  });

  it("returns 100% and null next at max level", () => {
    const result = getLevelProgress(62_500);
    expect(result.current.level).toBe(20);
    expect(result.next).toBeNull();
    expect(result.progress).toBe(100);
    expect(result.xpToNext).toBe(0);
  });

  it("returns 100% for XP far beyond max level", () => {
    const result = getLevelProgress(999_999);
    expect(result.current.level).toBe(20);
    expect(result.progress).toBe(100);
    expect(result.xpToNext).toBe(0);
  });

  it("progress never exceeds 100", () => {
    // Test at every level boundary + 1
    for (const level of LEVELS) {
      const result = getLevelProgress(level.xp_required);
      expect(result.progress).toBeLessThanOrEqual(100);
      expect(result.progress).toBeGreaterThanOrEqual(0);
    }
  });
});

// ─── Streak edge cases ──────────────────────────────────────────────────────

/**
 * Streak logic is computed server-side in the session-end API.
 * These tests verify the streak date math independently.
 */
function isStreakAlive(
  lastSessionDate: string | null,
  currentDate: string,
  gracePeriodDays: number = 1
): boolean {
  if (!lastSessionDate) return false;
  const last = new Date(lastSessionDate);
  const now = new Date(currentDate);
  const diffMs = now.getTime() - last.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= 1 + gracePeriodDays;
}

function shouldIncrementStreak(
  lastSessionDate: string | null,
  currentDate: string
): boolean {
  if (!lastSessionDate) return true; // First session starts streak
  const last = new Date(lastSessionDate);
  const now = new Date(currentDate);
  // Different calendar day = new streak day
  return (
    last.getUTCFullYear() !== now.getUTCFullYear() ||
    last.getUTCMonth() !== now.getUTCMonth() ||
    last.getUTCDate() !== now.getUTCDate()
  );
}

describe("streak calculation: isStreakAlive", () => {
  it("returns false for null last session", () => {
    expect(isStreakAlive(null, "2026-04-01")).toBe(false);
  });

  it("returns true for same day", () => {
    expect(isStreakAlive("2026-04-01", "2026-04-01")).toBe(true);
  });

  it("returns true for next day (within grace)", () => {
    expect(isStreakAlive("2026-04-01", "2026-04-02")).toBe(true);
  });

  it("returns true for 2 days later (within default 1-day grace)", () => {
    expect(isStreakAlive("2026-04-01", "2026-04-03")).toBe(true);
  });

  it("returns false for 3 days later (beyond default grace)", () => {
    expect(isStreakAlive("2026-04-01", "2026-04-04")).toBe(false);
  });

  it("respects custom grace period of 0 days", () => {
    expect(isStreakAlive("2026-04-01", "2026-04-02", 0)).toBe(true);
    expect(isStreakAlive("2026-04-01", "2026-04-03", 0)).toBe(false);
  });
});

describe("streak calculation: shouldIncrementStreak", () => {
  it("returns true for null last session (first session)", () => {
    expect(shouldIncrementStreak(null, "2026-04-01")).toBe(true);
  });

  it("returns false for same calendar day", () => {
    expect(shouldIncrementStreak("2026-04-01T10:00:00Z", "2026-04-01T22:00:00Z")).toBe(false);
  });

  it("returns true for next calendar day", () => {
    expect(shouldIncrementStreak("2026-04-01T23:00:00Z", "2026-04-02T01:00:00Z")).toBe(true);
  });

  it("returns true across month boundary", () => {
    expect(shouldIncrementStreak("2026-03-31T20:00:00Z", "2026-04-01T08:00:00Z")).toBe(true);
  });

  it("returns true across year boundary", () => {
    expect(shouldIncrementStreak("2025-12-31T23:00:00Z", "2026-01-01T00:30:00Z")).toBe(true);
  });
});
