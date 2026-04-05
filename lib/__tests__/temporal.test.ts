// Temporal aggregation tests — Sprint 162 (The Identity)
// Covers computeTemporalProfile, formatHourLabel, formatTemporalHighlight
import { describe, it, expect } from "vitest";
import {
  computeTemporalProfile,
  formatHourLabel,
  formatTemporalHighlight,
  type TemporalLog,
} from "@/lib/temporal";

// Test data builders ────────────────────────────────────────────────────────

function log(iso: string): TemporalLog {
  return { logged_at: iso };
}

// ─── computeTemporalProfile — data sufficiency ─────────────────────────────

describe("computeTemporalProfile — data sufficiency", () => {
  it("returns hasEnoughData=false for empty logs", () => {
    const p = computeTemporalProfile([]);
    expect(p.hasEnoughData).toBe(false);
    expect(p.favoriteDay).toBeNull();
    expect(p.favoriteHour).toBeNull();
    expect(p.totalLogs).toBe(0);
  });

  it("returns hasEnoughData=false for <5 logs", () => {
    const p = computeTemporalProfile([
      log("2026-04-02T20:00:00Z"),
      log("2026-04-03T20:00:00Z"),
      log("2026-04-04T20:00:00Z"),
      log("2026-04-05T20:00:00Z"),
    ]);
    expect(p.hasEnoughData).toBe(false);
    expect(p.favoriteDay).toBeNull();
  });

  it("returns favoriteDay at exactly 5 logs", () => {
    const p = computeTemporalProfile(
      Array.from({ length: 5 }, () => log("2026-04-02T20:00:00Z")),
      "America/New_York",
    );
    expect(p.hasEnoughData).toBe(true);
    expect(p.favoriteDay).not.toBeNull();
  });
});

// ─── Timezone-safe day-of-week ────────────────────────────────────────────

describe("Timezone-aware day-of-week bucketing", () => {
  it("UTC 03:00 Friday = Thursday in New York", () => {
    // 2026-04-03T03:00:00Z = 2026-04-02 23:00 EDT (Thursday)
    const p = computeTemporalProfile(
      Array.from({ length: 5 }, () => log("2026-04-03T03:00:00Z")),
      "America/New_York",
    );
    expect(p.favoriteDay?.label).toBe("Thursday");
  });

  it("UTC 03:00 Friday = Friday in UTC", () => {
    const p = computeTemporalProfile(
      Array.from({ length: 5 }, () => log("2026-04-03T03:00:00Z")),
      "UTC",
    );
    expect(p.favoriteDay?.label).toBe("Friday");
  });

  it("UTC midnight Monday = Sunday in New York", () => {
    // 2026-04-06T00:00:00Z = 2026-04-05 20:00 EDT (Sunday)
    const p = computeTemporalProfile(
      Array.from({ length: 5 }, () => log("2026-04-06T00:00:00Z")),
      "America/New_York",
    );
    expect(p.favoriteDay?.label).toBe("Sunday");
  });

  it("falls back to UTC for invalid timezone", () => {
    const p = computeTemporalProfile(
      Array.from({ length: 5 }, () => log("2026-04-03T03:00:00Z")),
      "Invalid/Timezone",
    );
    expect(p.favoriteDay?.label).toBe("Friday");
  });
});

// ─── dowBreakdown ──────────────────────────────────────────────────────────

describe("dowBreakdown", () => {
  it("always returns 7 entries sorted by dow asc", () => {
    const p = computeTemporalProfile(
      Array.from({ length: 5 }, () => log("2026-04-02T20:00:00Z")),
      "America/New_York",
    );
    expect(p.dowBreakdown).toHaveLength(7);
    expect(p.dowBreakdown.map((d) => d.dow)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(p.dowBreakdown[0].label).toBe("Sunday");
    expect(p.dowBreakdown[6].label).toBe("Saturday");
  });

  it("computes correct shares", () => {
    // 2026-04-02 is Thursday (16:00 EDT / 20:00 UTC)
    const p = computeTemporalProfile(
      [
        log("2026-04-02T20:00:00Z"),
        log("2026-04-02T20:00:00Z"),
        log("2026-04-02T20:00:00Z"),
        log("2026-04-03T20:00:00Z"),
        log("2026-04-03T20:00:00Z"),
      ],
      "America/New_York",
    );
    const thursday = p.dowBreakdown.find((d) => d.label === "Thursday");
    const friday = p.dowBreakdown.find((d) => d.label === "Friday");
    expect(thursday?.count).toBe(3);
    expect(thursday?.share).toBeCloseTo(0.6);
    expect(friday?.count).toBe(2);
    expect(friday?.share).toBeCloseTo(0.4);
  });
});

// ─── hourBreakdown + favoriteHour ──────────────────────────────────────────

describe("hourBreakdown + favoriteHour", () => {
  it("only returns hours with count > 0", () => {
    const p = computeTemporalProfile(
      Array.from({ length: 5 }, () => log("2026-04-02T20:00:00Z")),
      "America/New_York",
    );
    // All 5 logs at 16:00 local
    expect(p.hourBreakdown).toHaveLength(1);
    expect(p.hourBreakdown[0].hour).toBe(16);
  });

  it("sorts hourBreakdown by count desc", () => {
    const sample = [
      // 3 at 8pm local
      log("2026-04-03T00:00:00Z"),
      log("2026-04-03T00:00:00Z"),
      log("2026-04-03T00:00:00Z"),
      // 2 at noon local
      log("2026-04-02T16:00:00Z"),
      log("2026-04-02T16:00:00Z"),
    ];
    const p = computeTemporalProfile(sample, "America/New_York");
    expect(p.hourBreakdown[0].count).toBe(3);
    expect(p.hourBreakdown[1].count).toBe(2);
  });

  it("favoriteHour is the max-count hour", () => {
    const sample = [
      ...Array.from({ length: 4 }, () => log("2026-04-03T00:00:00Z")), // 8pm EDT
      log("2026-04-02T16:00:00Z"), // noon
    ];
    const p = computeTemporalProfile(sample, "America/New_York");
    expect(p.favoriteHour?.hour).toBe(20);
    expect(p.favoriteHour?.label).toBe("8pm");
  });
});

// ─── formatHourLabel ──────────────────────────────────────────────────────

describe("formatHourLabel", () => {
  it("formats midnight", () => {
    expect(formatHourLabel(0)).toBe("midnight");
  });
  it("formats noon", () => {
    expect(formatHourLabel(12)).toBe("noon");
  });
  it("formats morning hours", () => {
    expect(formatHourLabel(1)).toBe("1am");
    expect(formatHourLabel(9)).toBe("9am");
    expect(formatHourLabel(11)).toBe("11am");
  });
  it("formats afternoon/evening hours", () => {
    expect(formatHourLabel(13)).toBe("1pm");
    expect(formatHourLabel(17)).toBe("5pm");
    expect(formatHourLabel(23)).toBe("11pm");
  });
});

// ─── formatTemporalHighlight ──────────────────────────────────────────────

describe("formatTemporalHighlight", () => {
  it("returns null when insufficient data", () => {
    const p = computeTemporalProfile([]);
    expect(formatTemporalHighlight(p)).toBeNull();
  });

  it("formats favorite day highlight", () => {
    // 5 Thursdays
    const sample = Array.from({ length: 5 }, () =>
      log("2026-04-02T20:00:00Z"),
    );
    const p = computeTemporalProfile(sample, "America/New_York");
    const highlight = formatTemporalHighlight(p);
    expect(highlight).toBe("Your Beer Thursday — 100% of your pours");
  });

  it("rounds percentage", () => {
    // 3 Thursdays + 2 Fridays = 60% Thu
    const sample = [
      log("2026-04-02T20:00:00Z"),
      log("2026-04-02T20:00:00Z"),
      log("2026-04-02T20:00:00Z"),
      log("2026-04-03T20:00:00Z"),
      log("2026-04-03T20:00:00Z"),
    ];
    const p = computeTemporalProfile(sample, "America/New_York");
    const highlight = formatTemporalHighlight(p);
    expect(highlight).toBe("Your Beer Thursday — 60% of your pours");
  });
});

// ─── Edge cases ───────────────────────────────────────────────────────────

describe("Edge cases", () => {
  it("handles invalid timestamps gracefully", () => {
    const p = computeTemporalProfile(
      [
        log("invalid-date"),
        log("2026-04-02T20:00:00Z"),
        log("2026-04-02T20:00:00Z"),
        log("2026-04-02T20:00:00Z"),
        log("2026-04-02T20:00:00Z"),
        log("2026-04-02T20:00:00Z"),
      ],
      "America/New_York",
    );
    expect(p.totalLogs).toBe(5);
    expect(p.hasEnoughData).toBe(true);
  });

  it("preserves timezone in result", () => {
    const p = computeTemporalProfile([], "America/Los_Angeles");
    expect(p.timezone).toBe("America/Los_Angeles");
  });
});
