/**
 * Trending scoring algorithm tests — Reese, Sprint 156 (The Triple Shot)
 * Tests computeScore time-decay formula and weight factors.
 */

import { describe, it, expect } from "vitest";
import { computeScore } from "@/lib/trending";

describe("computeScore()", () => {
  it("zero activity = zero score", () => {
    expect(computeScore(0, 0, 0, 0)).toBe(0);
  });

  it("higher checkins = higher score", () => {
    const low = computeScore(5, 0, 0, 0);
    const high = computeScore(20, 0, 0, 0);
    expect(high).toBeGreaterThan(low);
  });

  it("time decay: score decreases as hours increase", () => {
    const fresh = computeScore(10, 5, 3, 0);
    const stale = computeScore(10, 5, 3, 12);
    expect(fresh).toBeGreaterThan(stale);
  });

  it("very old activity (48h+) has near-zero score", () => {
    const ancient = computeScore(10, 5, 3, 48);
    // At 48h with decay factor e^(-48/12) = e^(-4) ~ 0.018, score ~ 1.01
    expect(ancient).toBeLessThan(2);
  });

  it("score is rounded to 2 decimal places", () => {
    const score = computeScore(7, 3, 2, 5);
    const decimals = score.toString().split(".")[1];
    if (decimals) {
      expect(decimals.length).toBeLessThanOrEqual(2);
    }
  });

  it("unique users weighted highest (5x)", () => {
    // 1 unique user at 5x should equal 1 checkin at 3x + 1 rating at 2x
    const usersOnly = computeScore(0, 0, 1, 0); // 0*3 + 0*2 + 1*5 = 5
    const checkinOnly = computeScore(1, 0, 0, 0); // 1*3 + 0*2 + 0*5 = 3
    const ratingOnly = computeScore(0, 1, 0, 0); // 0*3 + 1*2 + 0*5 = 2
    expect(usersOnly).toBe(5);
    expect(checkinOnly).toBe(3);
    expect(ratingOnly).toBe(2);
    expect(usersOnly).toBeGreaterThan(checkinOnly);
    expect(usersOnly).toBeGreaterThan(ratingOnly);
  });

  it("combined formula produces expected value at t=0", () => {
    // score = (10*3 + 5*2 + 3*5) * e^(0) = (30+10+15) * 1 = 55
    expect(computeScore(10, 5, 3, 0)).toBe(55);
  });
});
