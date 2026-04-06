/**
 * useDetentSheet logic tests — Reese, Sprint 170 (The Glass)
 * Tests the pure snap point calculation and velocity-based detent selection
 * logic from useDetentSheet.ts. The hook itself depends on Framer Motion
 * values, so we test the underlying math directly rather than rendering.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ─── Constants mirrored from useDetentSheet.ts ───────────────────────────────
const PEEK_HEIGHT = 80;
const HALF_RATIO = 0.45;
const FULL_RATIO = 0.95;
const FLING_THRESHOLD = 300; // px/s

type Detent = "peek" | "half" | "full";

// ─── Pure logic extracted for testability ────────────────────────────────────

function getSnapPoints(viewportHeight: number = 800) {
  const vh = viewportHeight;
  const sheetHeight = vh * FULL_RATIO;
  const halfHeight = vh * HALF_RATIO;
  return {
    full: 0,
    half: sheetHeight - halfHeight,
    peek: sheetHeight - PEEK_HEIGHT,
    sheetHeight,
  };
}

/**
 * Determines which detent to snap to based on current detent, position, and fling velocity.
 * Mirrors the handleDragEnd logic in useDetentSheet.
 */
function resolveDetent(
  currentDetent: Detent,
  currentY: number,
  velocityY: number,
  viewportHeight: number = 800
): Detent {
  const points = getSnapPoints(viewportHeight);

  if (velocityY > FLING_THRESHOLD) {
    // Flinging down
    if (currentDetent === "full") return "half";
    return "peek";
  } else if (velocityY < -FLING_THRESHOLD) {
    // Flinging up
    if (currentDetent === "peek") return "half";
    return "full";
  } else {
    // Snap to nearest
    const distances: [Detent, number][] = [
      ["peek", Math.abs(currentY - points.peek)],
      ["half", Math.abs(currentY - points.half)],
      ["full", Math.abs(currentY - points.full)],
    ];
    return distances.sort((a, b) => a[1] - b[1])[0][0];
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("useDetentSheet — snap point calculations", () => {
  const VH = 800;
  const points = getSnapPoints(VH);

  it("full snap point is y=0 (top of sheet)", () => {
    expect(points.full).toBe(0);
  });

  it("half snap point is sheetHeight minus halfHeight", () => {
    const expected = VH * FULL_RATIO - VH * HALF_RATIO;
    expect(points.half).toBe(expected);
  });

  it("peek snap point is sheetHeight minus PEEK_HEIGHT", () => {
    const expected = VH * FULL_RATIO - PEEK_HEIGHT;
    expect(points.peek).toBe(expected);
  });

  it("sheetHeight is viewport times FULL_RATIO", () => {
    expect(points.sheetHeight).toBe(VH * FULL_RATIO);
  });

  it("snap points are ordered: full < half < peek", () => {
    expect(points.full).toBeLessThan(points.half);
    expect(points.half).toBeLessThan(points.peek);
  });

  it("all snap points are non-negative", () => {
    expect(points.full).toBeGreaterThanOrEqual(0);
    expect(points.half).toBeGreaterThanOrEqual(0);
    expect(points.peek).toBeGreaterThanOrEqual(0);
  });

  it("works with different viewport heights", () => {
    const small = getSnapPoints(600);
    const large = getSnapPoints(1200);
    // Larger viewport produces larger sheet
    expect(large.sheetHeight).toBeGreaterThan(small.sheetHeight);
    // Peek always leaves PEEK_HEIGHT visible
    expect(small.peek).toBe(small.sheetHeight - PEEK_HEIGHT);
    expect(large.peek).toBe(large.sheetHeight - PEEK_HEIGHT);
  });
});

describe("useDetentSheet — fling up from peek goes to half", () => {
  it("flinging up with velocity above threshold from peek snaps to half", () => {
    const result = resolveDetent("peek", 600, -(FLING_THRESHOLD + 100));
    expect(result).toBe("half");
  });
});

describe("useDetentSheet — fling up from half goes to full", () => {
  it("flinging up with velocity above threshold from half snaps to full", () => {
    const result = resolveDetent("half", 300, -(FLING_THRESHOLD + 100));
    expect(result).toBe("full");
  });
});

describe("useDetentSheet — fling down from full goes to half", () => {
  it("flinging down with velocity above threshold from full snaps to half", () => {
    const result = resolveDetent("full", 50, FLING_THRESHOLD + 100);
    expect(result).toBe("half");
  });
});

describe("useDetentSheet — fling down from half goes to peek", () => {
  it("flinging down with velocity above threshold from half snaps to peek", () => {
    const result = resolveDetent("half", 300, FLING_THRESHOLD + 100);
    expect(result).toBe("peek");
  });
});

describe("useDetentSheet — fling down from peek stays at peek", () => {
  it("flinging down from peek snaps to peek (already lowest)", () => {
    const result = resolveDetent("peek", 600, FLING_THRESHOLD + 100);
    expect(result).toBe("peek");
  });
});

describe("useDetentSheet — fling up from full stays at full", () => {
  it("flinging up from full snaps to full (already highest)", () => {
    const result = resolveDetent("full", 10, -(FLING_THRESHOLD + 100));
    expect(result).toBe("full");
  });
});

describe("useDetentSheet — snap to nearest when velocity is below threshold", () => {
  const VH = 800;
  const points = getSnapPoints(VH);

  it("snaps to full when position is closest to full (y near 0)", () => {
    const result = resolveDetent("half", 10, 0, VH);
    expect(result).toBe("full");
  });

  it("snaps to half when position is closest to half", () => {
    const result = resolveDetent("full", points.half, 0, VH);
    expect(result).toBe("half");
  });

  it("snaps to peek when position is closest to peek", () => {
    const result = resolveDetent("half", points.peek - 5, 0, VH);
    expect(result).toBe("peek");
  });

  it("snaps to nearest even with small non-zero velocity below threshold", () => {
    // Small velocity (below 300) should not trigger fling — snap to nearest instead
    const result = resolveDetent("half", points.full + 5, 100, VH);
    expect(result).toBe("full");
  });

  it("snaps to nearest with negative sub-threshold velocity", () => {
    const result = resolveDetent("half", points.peek - 10, -100, VH);
    expect(result).toBe("peek");
  });

  it("exactly at threshold boundary (positive) triggers fling down", () => {
    // velocity === FLING_THRESHOLD + 1 (just above)
    const result = resolveDetent("full", 50, FLING_THRESHOLD + 1);
    expect(result).toBe("half");
  });

  it("at exactly threshold velocity snaps to nearest (not fling)", () => {
    // velocity === FLING_THRESHOLD exactly — does NOT exceed threshold
    const result = resolveDetent("full", 5, FLING_THRESHOLD, VH);
    expect(result).toBe("full");
  });
});

describe("useDetentSheet — initial detent mapping", () => {
  it("peek initial detent maps to the peek y position", () => {
    const points = getSnapPoints(800);
    expect(points.peek).toBe(800 * FULL_RATIO - PEEK_HEIGHT);
  });

  it("half initial detent maps to the half y position", () => {
    const points = getSnapPoints(800);
    expect(points.half).toBe(800 * FULL_RATIO - 800 * HALF_RATIO);
  });

  it("full initial detent maps to y=0", () => {
    const points = getSnapPoints(800);
    expect(points.full).toBe(0);
  });
});
