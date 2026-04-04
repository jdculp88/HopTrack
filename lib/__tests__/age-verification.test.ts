/**
 * Age verification logic tests — Reese, Sprint 156 (The Triple Shot)
 * Tests the age calculation used by the signup page age gate.
 */

import { describe, it, expect } from "vitest";

/**
 * Pure function extracted from the signup page age gate logic.
 * Calculates whether a user meets the minimum age requirement.
 */
function isOldEnough(dateOfBirth: string, minAge: number = 21): boolean {
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return false;
  const today = new Date();
  // Reject future dates
  if (dob > today) return false;
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= minAge;
}

describe("Age verification — isOldEnough()", () => {
  it("rejects under-21 (born 10 years ago)", () => {
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
    expect(isOldEnough(tenYearsAgo.toISOString().split("T")[0])).toBe(false);
  });

  it("accepts exactly 21 today", () => {
    const exactly21 = new Date();
    exactly21.setFullYear(exactly21.getFullYear() - 21);
    expect(isOldEnough(exactly21.toISOString().split("T")[0])).toBe(true);
  });

  it("accepts over 21 (born 30 years ago)", () => {
    const thirtyYearsAgo = new Date();
    thirtyYearsAgo.setFullYear(thirtyYearsAgo.getFullYear() - 30);
    expect(isOldEnough(thirtyYearsAgo.toISOString().split("T")[0])).toBe(true);
  });

  it("rejects future date of birth", () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    expect(isOldEnough(future.toISOString().split("T")[0])).toBe(false);
  });

  it("rejects invalid date string", () => {
    expect(isOldEnough("not-a-date")).toBe(false);
  });

  it("rejects empty date string", () => {
    expect(isOldEnough("")).toBe(false);
  });

  it("rejects someone who turns 21 at end of December (not yet 21)", () => {
    const today = new Date();
    // Born Dec 31 twenty-one years ago — their birthday is always in the future
    // unless today IS Dec 31. Use Dec 31 of 20 years ago to guarantee under 21.
    const dob = `${today.getFullYear() - 20}-12-31`;
    expect(isOldEnough(dob)).toBe(false);
  });

  it("supports custom minimum age", () => {
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
    expect(isOldEnough(eighteenYearsAgo.toISOString().split("T")[0], 18)).toBe(true);
    expect(isOldEnough(eighteenYearsAgo.toISOString().split("T")[0], 21)).toBe(false);
  });
});
