/**
 * board-display-scale unit tests — Sprint A (The Display Suite)
 *
 * Verifies scale detection, FS entry scaling, and padding math. These are
 * pure functions so no mocks needed.
 */

import { describe, test, expect } from "vitest";
import {
  detectDisplayScale,
  resolveDisplayScale,
  scaleFSEntry,
  scalePadding,
  SCALE_MULTIPLIER,
  SCALE_LABELS,
  type FSEntry,
} from "@/lib/board-display-scale";

// Canonical base entry matching FS["large"] in board-types.ts — if this
// test breaks, the FS map has changed and scale math needs review.
const LARGE_BASE: FSEntry = {
  name: 42, style: 16, meta: 15, price: 36, stat: 14,
  chipLabel: 11, chipOz: 10, chipPrice: 20, chipPadV: 6, chipPadH: 12,
  glasslabel: 10, glassW: 56, glassH: 80,
};

describe("SCALE_MULTIPLIER", () => {
  test("monitor is 1x", () => {
    expect(SCALE_MULTIPLIER.monitor).toBe(1);
  });

  test("large-tv is 2x", () => {
    expect(SCALE_MULTIPLIER["large-tv"]).toBe(2);
  });

  test("cinema is 3x", () => {
    expect(SCALE_MULTIPLIER.cinema).toBe(3);
  });
});

describe("SCALE_LABELS", () => {
  test("has labels for all 4 scale values", () => {
    expect(SCALE_LABELS.auto).toBeTruthy();
    expect(SCALE_LABELS.monitor).toBeTruthy();
    expect(SCALE_LABELS["large-tv"]).toBeTruthy();
    expect(SCALE_LABELS.cinema).toBeTruthy();
  });
});

describe("detectDisplayScale", () => {
  test("1280×720 (HD laptop) → monitor", () => {
    expect(detectDisplayScale({ width: 1280, height: 720 })).toBe("monitor");
  });

  test("1440×900 (MBP 14) → monitor", () => {
    expect(detectDisplayScale({ width: 1440, height: 900 })).toBe("monitor");
  });

  test("1919×1080 (just below FHD threshold) → monitor", () => {
    expect(detectDisplayScale({ width: 1919, height: 1080 })).toBe("monitor");
  });

  test("1920×1080 (FHD exactly) → large-tv", () => {
    expect(detectDisplayScale({ width: 1920, height: 1080 })).toBe("large-tv");
  });

  test("2048×1152 (1080p+) → large-tv", () => {
    expect(detectDisplayScale({ width: 2048, height: 1152 })).toBe("large-tv");
  });

  test("2559×1440 (just below QHD threshold) → large-tv", () => {
    expect(detectDisplayScale({ width: 2559, height: 1440 })).toBe("large-tv");
  });

  test("2560×1440 (QHD exactly) → cinema", () => {
    expect(detectDisplayScale({ width: 2560, height: 1440 })).toBe("cinema");
  });

  test("3840×2160 (4K) → cinema", () => {
    expect(detectDisplayScale({ width: 3840, height: 2160 })).toBe("cinema");
  });

  test("5120×2880 (5K) → cinema", () => {
    expect(detectDisplayScale({ width: 5120, height: 2880 })).toBe("cinema");
  });
});

describe("resolveDisplayScale", () => {
  test("explicit monitor always resolves to monitor", () => {
    expect(resolveDisplayScale("monitor", { width: 3840, height: 2160 })).toBe("monitor");
  });

  test("explicit large-tv always resolves to large-tv", () => {
    expect(resolveDisplayScale("large-tv", { width: 800, height: 600 })).toBe("large-tv");
  });

  test("explicit cinema always resolves to cinema", () => {
    expect(resolveDisplayScale("cinema", { width: 800, height: 600 })).toBe("cinema");
  });

  test("auto without viewport returns monitor (SSR fallback)", () => {
    expect(resolveDisplayScale("auto", undefined)).toBe("monitor");
  });

  test("auto with 1920×1080 viewport → large-tv", () => {
    expect(resolveDisplayScale("auto", { width: 1920, height: 1080 })).toBe("large-tv");
  });

  test("auto with 4K viewport → cinema", () => {
    expect(resolveDisplayScale("auto", { width: 3840, height: 2160 })).toBe("cinema");
  });
});

describe("scaleFSEntry", () => {
  test("monitor scale returns identical values (1×)", () => {
    const result = scaleFSEntry(LARGE_BASE, "monitor");
    expect(result).toEqual(LARGE_BASE);
  });

  test("large-tv doubles every value (2×)", () => {
    const result = scaleFSEntry(LARGE_BASE, "large-tv");
    expect(result.name).toBe(84);
    expect(result.style).toBe(32);
    expect(result.meta).toBe(30);
    expect(result.price).toBe(72);
    expect(result.stat).toBe(28);
    expect(result.chipLabel).toBe(22);
    expect(result.chipOz).toBe(20);
    expect(result.chipPrice).toBe(40);
    expect(result.chipPadV).toBe(12);
    expect(result.chipPadH).toBe(24);
    expect(result.glasslabel).toBe(20);
    expect(result.glassW).toBe(112);
    expect(result.glassH).toBe(160);
  });

  test("cinema triples every value (3×)", () => {
    const result = scaleFSEntry(LARGE_BASE, "cinema");
    expect(result.name).toBe(126);
    expect(result.style).toBe(48);
    expect(result.price).toBe(108);
    expect(result.glassW).toBe(168);
    expect(result.glassH).toBe(240);
  });

  test("result fields are all integers (no fractional pixels)", () => {
    const entry: FSEntry = { ...LARGE_BASE, name: 33 }; // odd base
    const result = scaleFSEntry(entry, "large-tv");
    expect(Number.isInteger(result.name)).toBe(true);
    expect(result.name).toBe(66);
  });

  test("does not mutate the input entry", () => {
    const before = { ...LARGE_BASE };
    scaleFSEntry(LARGE_BASE, "cinema");
    expect(LARGE_BASE).toEqual(before);
  });
});

describe("scalePadding", () => {
  test("monitor returns base value", () => {
    expect(scalePadding(20, "monitor")).toBe(20);
  });

  test("large-tv doubles the value", () => {
    expect(scalePadding(20, "large-tv")).toBe(40);
  });

  test("cinema triples the value", () => {
    expect(scalePadding(20, "cinema")).toBe(60);
  });

  test("odd values round to integer", () => {
    expect(scalePadding(15, "large-tv")).toBe(30);
    expect(Number.isInteger(scalePadding(7, "large-tv"))).toBe(true);
  });
});
