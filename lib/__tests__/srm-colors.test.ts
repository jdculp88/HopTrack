/**
 * srm-colors unit tests — Sprint 176 (Beer Sensory Fields)
 *
 * Verifies the SRM→hex lookup clamps correctly, returns progressively darker
 * values as SRM increases, and that the helper functions (`srmLabel`,
 * `isDarkSrm`) return the buckets the picker + slideshow rely on.
 */

import { describe, test, expect } from "vitest";
import {
  srmToHex,
  srmLabel,
  isDarkSrm,
  SRM_MIN,
  SRM_MAX,
} from "@/lib/srm-colors";

describe("srmToHex", () => {
  test("constants point to the standard BJCP scale bounds", () => {
    expect(SRM_MIN).toBe(1);
    expect(SRM_MAX).toBe(40);
  });

  test("returns a hex color for every value 1-40", () => {
    for (let srm = SRM_MIN; srm <= SRM_MAX; srm++) {
      const hex = srmToHex(srm);
      expect(hex).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  test("clamps below-range values to SRM 1", () => {
    expect(srmToHex(-5)).toBe(srmToHex(1));
    expect(srmToHex(0)).toBe(srmToHex(1));
  });

  test("clamps above-range values to SRM 40", () => {
    expect(srmToHex(99)).toBe(srmToHex(40));
    expect(srmToHex(41)).toBe(srmToHex(40));
  });

  test("returns a safe mid-gold default for null/undefined/NaN", () => {
    const fallback = srmToHex(null);
    expect(fallback).toMatch(/^#[0-9A-F]{6}$/i);
    expect(srmToHex(undefined)).toBe(fallback);
    expect(srmToHex(NaN)).toBe(fallback);
  });

  test("pale SRM values are brighter than dark SRM values (R channel)", () => {
    // Pale straw (SRM 2) should have a higher red channel than black (SRM 40).
    // This is a directional check, not an exact color test.
    const pale = srmToHex(2);
    const black = srmToHex(40);
    const palR = parseInt(pale.slice(1, 3), 16);
    const darkR = parseInt(black.slice(1, 3), 16);
    expect(palR).toBeGreaterThan(darkR);
  });

  test("rounds non-integer values", () => {
    expect(srmToHex(3.4)).toBe(srmToHex(3));
    expect(srmToHex(3.6)).toBe(srmToHex(4));
  });
});

describe("srmLabel", () => {
  test("returns a bucket label for every valid SRM value", () => {
    const labels = [1, 5, 10, 15, 20, 25, 30, 35, 40].map(srmLabel);
    for (const l of labels) {
      expect(l).toBeTruthy();
      expect(l).not.toBe("\u2014");
    }
  });

  test("pale straw for SRM 1-3", () => {
    expect(srmLabel(1)).toBe("Pale Straw");
    expect(srmLabel(3)).toBe("Pale Straw");
  });

  test("black for SRM 38-40", () => {
    expect(srmLabel(40)).toBe("Black");
  });

  test("em-dash for null/undefined/NaN", () => {
    expect(srmLabel(null)).toBe("\u2014");
    expect(srmLabel(undefined)).toBe("\u2014");
    expect(srmLabel(NaN)).toBe("\u2014");
  });

  test("clamps out-of-range values", () => {
    expect(srmLabel(-5)).toBe(srmLabel(1));
    expect(srmLabel(999)).toBe(srmLabel(40));
  });
});

describe("isDarkSrm", () => {
  test("false for pale beers (SRM < 17)", () => {
    expect(isDarkSrm(1)).toBe(false);
    expect(isDarkSrm(10)).toBe(false);
    expect(isDarkSrm(16)).toBe(false);
  });

  test("true for dark beers (SRM >= 17)", () => {
    expect(isDarkSrm(17)).toBe(true);
    expect(isDarkSrm(30)).toBe(true);
    expect(isDarkSrm(40)).toBe(true);
  });

  test("false for null/undefined (no contrast flip)", () => {
    expect(isDarkSrm(null)).toBe(false);
    expect(isDarkSrm(undefined)).toBe(false);
  });
});
