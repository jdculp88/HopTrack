// XP system unit tests — Avery + Reese, Sprint 77
import { describe, it, expect } from "vitest";
import {
  SESSION_XP,
  LEVELS,
  getLevelFromXP,
  getNextLevel,
  getLevelProgress,
} from "@/lib/xp";

// ── SESSION_XP constants ──

describe("SESSION_XP", () => {
  it("has expected XP values for session actions", () => {
    expect(SESSION_XP.session_start).toBe(25);
    expect(SESSION_XP.per_beer).toBe(15);
    expect(SESSION_XP.per_rating).toBe(10);
    expect(SESSION_XP.first_visit_bonus).toBe(50);
    expect(SESSION_XP.three_plus_beers_bonus).toBe(25);
  });
});

// ── LEVELS ──

describe("LEVELS", () => {
  it("has 20 levels", () => {
    expect(LEVELS).toHaveLength(20);
  });

  it("starts at level 1 with 0 XP required", () => {
    expect(LEVELS[0].level).toBe(1);
    expect(LEVELS[0].xp_required).toBe(0);
  });

  it("ends at level 20", () => {
    expect(LEVELS[LEVELS.length - 1].level).toBe(20);
  });

  it("has strictly increasing XP requirements", () => {
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i].xp_required).toBeGreaterThan(LEVELS[i - 1].xp_required);
    }
  });

  it("every level has a name", () => {
    for (const level of LEVELS) {
      expect(level.name).toBeTruthy();
      expect(typeof level.name).toBe("string");
    }
  });
});

// ── getLevelFromXP ──

describe("getLevelFromXP", () => {
  it("returns level 1 for 0 XP", () => {
    expect(getLevelFromXP(0).level).toBe(1);
  });

  it("returns level 1 for 99 XP (just under level 2 threshold)", () => {
    expect(getLevelFromXP(99).level).toBe(1);
  });

  it("returns level 2 at exactly 100 XP", () => {
    expect(getLevelFromXP(100).level).toBe(2);
  });

  it("returns level 20 for very high XP", () => {
    expect(getLevelFromXP(100_000).level).toBe(20);
  });

  it("returns level 20 at exactly 62500 XP", () => {
    expect(getLevelFromXP(62_500).level).toBe(20);
    expect(getLevelFromXP(62_500).name).toBe("Grand Cicerone");
  });

  it("returns correct level for mid-range XP", () => {
    // 1000 XP = level 5 ("Regular")
    expect(getLevelFromXP(1000).level).toBe(5);
    expect(getLevelFromXP(1000).name).toBe("Regular");
  });
});

// ── getNextLevel ──

describe("getNextLevel", () => {
  it("returns level 2 when current level is 1", () => {
    const next = getNextLevel(1);
    expect(next).not.toBeNull();
    expect(next!.level).toBe(2);
  });

  it("returns null when current level is 20 (max)", () => {
    expect(getNextLevel(20)).toBeNull();
  });

  it("returns null for level beyond max", () => {
    expect(getNextLevel(21)).toBeNull();
  });
});

// ── getLevelProgress ──

describe("getLevelProgress", () => {
  it("returns 0% progress at level boundary", () => {
    const result = getLevelProgress(100); // exactly level 2
    expect(result.current.level).toBe(2);
    expect(result.progress).toBe(0);
    expect(result.next).not.toBeNull();
    expect(result.next!.level).toBe(3);
  });

  it("returns 100% progress and null next at max level", () => {
    const result = getLevelProgress(62_500);
    expect(result.current.level).toBe(20);
    expect(result.next).toBeNull();
    expect(result.progress).toBe(100);
    expect(result.xpToNext).toBe(0);
  });

  it("calculates mid-level progress correctly", () => {
    // Level 1: 0 XP, Level 2: 100 XP. At 50 XP should be 50% progress.
    const result = getLevelProgress(50);
    expect(result.current.level).toBe(1);
    expect(result.progress).toBe(50);
    expect(result.xpToNext).toBe(50);
  });

  it("calculates xpToNext correctly", () => {
    // Level 2 starts at 100, level 3 at 250. At 150 XP: 100 XP to next.
    const result = getLevelProgress(150);
    expect(result.current.level).toBe(2);
    expect(result.xpToNext).toBe(100);
  });
});
