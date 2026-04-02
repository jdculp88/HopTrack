import { describe, it, expect } from "vitest";
import {
  calculateBreweryKPIs,
  calculateBreweryKPISparklines,
  calculateDrinkerKPIs,
  formatDuration,
  formatTrend,
} from "../kpi";

// ── Formatting helpers ──────────────────────────────────────────────────────

describe("formatDuration", () => {
  it("returns — for null", () => {
    expect(formatDuration(null)).toBe("—");
  });

  it("formats minutes under 60", () => {
    expect(formatDuration(45)).toBe("45m");
  });

  it("formats hours and minutes", () => {
    expect(formatDuration(90)).toBe("1h 30m");
  });

  it("formats exact hours", () => {
    expect(formatDuration(120)).toBe("2h");
  });

  it("handles zero minutes", () => {
    expect(formatDuration(0)).toBe("0m");
  });
});

describe("formatTrend", () => {
  it("returns null for null value", () => {
    expect(formatTrend(null)).toBeNull();
  });

  it("formats positive trend", () => {
    const result = formatTrend(15);
    expect(result).toEqual({ text: "+15%", color: "#22c55e" });
  });

  it("formats negative trend", () => {
    const result = formatTrend(-10);
    expect(result).toEqual({ text: "-10%", color: "#ef4444" });
  });

  it("formats zero as positive", () => {
    const result = formatTrend(0);
    expect(result).toEqual({ text: "+0%", color: "#22c55e" });
  });

  it("supports custom suffix", () => {
    const result = formatTrend(5, "pp");
    expect(result).toEqual({ text: "+5pp", color: "#22c55e" });
  });
});

// ── Brewery KPIs ────────────────────────────────────────────────────────────

describe("calculateBreweryKPIs", () => {
  const now = Date.now();
  const daysAgo = (d: number) => new Date(now - d * 86400000).toISOString();

  it("returns null KPIs for empty data", () => {
    const result = calculateBreweryKPIs({ sessions: [], beerLogs: [] });
    expect(result.avgSessionDuration).toBeNull();
    expect(result.beersPerVisit).toBeNull();
    expect(result.newVisitorPct).toBeNull();
    expect(result.retentionRate).toBeNull();
    expect(result.topCustomer).toBeNull();
    expect(result.peakHour).toBeNull();
    expect(result.reviewSentiment).toBeNull();
  });

  it("calculates avg session duration", () => {
    const sessions = [
      { id: "1", user_id: "u1", started_at: daysAgo(1), ended_at: new Date(new Date(daysAgo(1)).getTime() + 60 * 60000).toISOString() },
      { id: "2", user_id: "u2", started_at: daysAgo(2), ended_at: new Date(new Date(daysAgo(2)).getTime() + 120 * 60000).toISOString() },
    ];
    const result = calculateBreweryKPIs({ sessions, beerLogs: [] });
    expect(result.avgSessionDuration).toBe(90); // avg of 60 and 120
  });

  it("excludes impossibly long sessions (>12h)", () => {
    const sessions = [
      { id: "1", user_id: "u1", started_at: daysAgo(1), ended_at: new Date(new Date(daysAgo(1)).getTime() + 60 * 60000).toISOString() },
      { id: "2", user_id: "u2", started_at: daysAgo(2), ended_at: new Date(new Date(daysAgo(2)).getTime() + 900 * 60000).toISOString() }, // 15 hours — excluded
    ];
    const result = calculateBreweryKPIs({ sessions, beerLogs: [] });
    expect(result.avgSessionDuration).toBe(60);
  });

  it("calculates beers per visit", () => {
    const sessions = [
      { id: "1", user_id: "u1", started_at: daysAgo(1), ended_at: daysAgo(0.9) },
      { id: "2", user_id: "u2", started_at: daysAgo(2), ended_at: daysAgo(1.9) },
    ];
    const beerLogs = [
      { id: "l1", logged_at: daysAgo(1), quantity: 3 },
      { id: "l2", logged_at: daysAgo(2), quantity: 2 },
    ];
    const result = calculateBreweryKPIs({ sessions, beerLogs });
    expect(result.beersPerVisit).toBe(2.5);
  });

  it("calculates new vs returning visitors", () => {
    const visits = [
      { user_id: "u1", total_visits: 1 },
      { user_id: "u2", total_visits: 5 },
      { user_id: "u3", total_visits: 1 },
      { user_id: "u4", total_visits: 3 },
    ];
    const result = calculateBreweryKPIs({ sessions: [], beerLogs: [], breweryVisits: visits });
    expect(result.newVisitorPct).toBe(50);
    expect(result.returningVisitorPct).toBe(50);
  });

  it("calculates retention rate", () => {
    // u1 visited in prior period AND current period → retained
    // u2 visited in prior period only → churned
    const sessions = [
      { id: "1", user_id: "u1", started_at: daysAgo(45), ended_at: daysAgo(44.9) }, // prior period
      { id: "2", user_id: "u2", started_at: daysAgo(40), ended_at: daysAgo(39.9) }, // prior period
      { id: "3", user_id: "u1", started_at: daysAgo(5), ended_at: daysAgo(4.9) },  // current period
    ];
    const result = calculateBreweryKPIs({ sessions, beerLogs: [], periodDays: 30 });
    expect(result.retentionRate).toBe(50); // 1 of 2 retained
  });

  it("calculates top customer", () => {
    const sessions = [
      { id: "1", user_id: "u1", started_at: daysAgo(1), ended_at: daysAgo(0.9) },
      { id: "2", user_id: "u1", started_at: daysAgo(2), ended_at: daysAgo(1.9) },
      { id: "3", user_id: "u2", started_at: daysAgo(3), ended_at: daysAgo(2.9) },
    ];
    const profiles = { u1: { display_name: "Alice" }, u2: { display_name: "Bob" } };
    const result = calculateBreweryKPIs({ sessions, beerLogs: [], profiles });
    expect(result.topCustomer).toEqual({ name: "Alice", visits: 2 });
  });

  it("calculates peak hour", () => {
    const sessions = [
      { id: "1", user_id: "u1", started_at: new Date(now - 86400000).toISOString().replace(/T\d{2}/, "T17"), ended_at: null },
      { id: "2", user_id: "u2", started_at: new Date(now - 86400000).toISOString().replace(/T\d{2}/, "T17"), ended_at: null },
      { id: "3", user_id: "u3", started_at: new Date(now - 86400000).toISOString().replace(/T\d{2}/, "T14"), ended_at: null },
    ];
    const result = calculateBreweryKPIs({ sessions, beerLogs: [], periodDays: 7 });
    expect(result.peakHour).not.toBeNull();
    expect(result.peakHour!.count).toBeGreaterThan(0);
  });

  it("calculates review sentiment", () => {
    const beerLogs = [
      { id: "1", logged_at: daysAgo(1), rating: 5 },
      { id: "2", logged_at: daysAgo(2), rating: 4 },
      { id: "3", logged_at: daysAgo(3), rating: 3 },
      { id: "4", logged_at: daysAgo(4), rating: 1 },
    ];
    const result = calculateBreweryKPIs({ sessions: [], beerLogs });
    expect(result.reviewSentiment).toEqual({ positive: 2, neutral: 1, negative: 1 });
  });

  it("calculates loyalty conversion rate", () => {
    const sessions = [
      { id: "1", user_id: "u1", started_at: daysAgo(1), ended_at: null },
      { id: "2", user_id: "u2", started_at: daysAgo(2), ended_at: null },
      { id: "3", user_id: "u3", started_at: daysAgo(3), ended_at: null },
      { id: "4", user_id: "u4", started_at: daysAgo(4), ended_at: null },
    ];
    const loyaltyCards = [{ user_id: "u1" }, { user_id: "u2" }];
    const result = calculateBreweryKPIs({ sessions, beerLogs: [], loyaltyCards });
    expect(result.loyaltyConversionRate).toBe(50);
  });

  it("calculates follower growth rate", () => {
    const followers = [
      { created_at: daysAgo(5) },
      { created_at: daysAgo(10) },
      { created_at: daysAgo(15) },
      { created_at: daysAgo(35) },
      { created_at: daysAgo(40) },
    ];
    const result = calculateBreweryKPIs({ sessions: [], beerLogs: [], followers, periodDays: 30 });
    // 3 in current period, 2 in prior → 50% growth
    expect(result.followerGrowthRate).toBe(50);
  });

  it("calculates tap list freshness", () => {
    const beers = [
      { id: "b1", created_at: daysAgo(10), is_on_tap: true },
      { id: "b2", created_at: daysAgo(30), is_on_tap: true },
      { id: "b3", created_at: daysAgo(5), is_on_tap: false }, // not on tap, excluded
    ];
    const result = calculateBreweryKPIs({ sessions: [], beerLogs: [], beers });
    expect(result.tapListFreshness).toBe(20); // avg of 10 and 30
  });
});

describe("calculateBreweryKPISparklines", () => {
  it("returns arrays of correct length", () => {
    const result = calculateBreweryKPISparklines({ sessions: [], beerLogs: [] });
    expect(result.avgDuration).toHaveLength(7);
    expect(result.beersPerVisit).toHaveLength(7);
    expect(result.returningPct).toHaveLength(7);
    expect(result.retention).toHaveLength(4);
  });

  it("fills zeros for empty data", () => {
    const result = calculateBreweryKPISparklines({ sessions: [], beerLogs: [] });
    expect(result.avgDuration.every(v => v === 0)).toBe(true);
    expect(result.beersPerVisit.every(v => v === 0)).toBe(true);
  });
});

// ── Drinker KPIs ────────────────────────────────────────────────────────────

describe("calculateDrinkerKPIs", () => {
  const now = Date.now();
  const daysAgo = (d: number) => new Date(now - d * 86400000).toISOString();

  it("returns default values for empty data", () => {
    const result = calculateDrinkerKPIs({ sessions: [], beerLogs: [] });
    expect(result.avgRating).toBeNull();
    expect(result.beersPerSession).toBeNull();
    expect(result.favoriteStyle).toBeNull();
    expect(result.avgAbv).toBeNull();
    expect(result.totalPours).toBe(0);
    expect(result.sessionsThisMonth).toBe(0);
    expect(result.longestSession).toBeNull();
    expect(result.avgSessionDuration).toBeNull();
    expect(result.newBeersThisMonth).toBe(0);
    expect(result.citiesVisited).toBe(0);
    expect(result.statesVisited).toBe(0);
    expect(result.socialScore).toBe(0);
    expect(result.achievementPct).toBeNull();
  });

  it("calculates avg rating", () => {
    const beerLogs = [
      { logged_at: daysAgo(1), rating: 4, quantity: 1 },
      { logged_at: daysAgo(2), rating: 5, quantity: 1 },
      { logged_at: daysAgo(3), rating: 0, quantity: 1 }, // no rating, excluded
    ];
    const result = calculateDrinkerKPIs({ sessions: [], beerLogs });
    expect(result.avgRating).toBe(4.5);
  });

  it("calculates beers per session", () => {
    const sessions = [
      { id: "1", started_at: daysAgo(1), ended_at: daysAgo(0.9) },
      { id: "2", started_at: daysAgo(2), ended_at: daysAgo(1.9) },
    ];
    const beerLogs = [
      { logged_at: daysAgo(1), quantity: 3 },
      { logged_at: daysAgo(2), quantity: 2 },
      { logged_at: daysAgo(2), quantity: 1 },
    ];
    const result = calculateDrinkerKPIs({ sessions, beerLogs });
    expect(result.beersPerSession).toBe(3); // 6 pours / 2 sessions
    expect(result.totalPours).toBe(6);
  });

  it("calculates favorite style with percentage", () => {
    const beerLogs = [
      { logged_at: daysAgo(1), quantity: 3, beer: { style: "IPA" } },
      { logged_at: daysAgo(2), quantity: 1, beer: { style: "Stout" } },
      { logged_at: daysAgo(3), quantity: 1, beer: { style: "IPA" } },
    ];
    const result = calculateDrinkerKPIs({ sessions: [], beerLogs });
    expect(result.favoriteStyle).toEqual({ name: "IPA", pct: 80 });
  });

  it("calculates avg ABV", () => {
    const beerLogs = [
      { logged_at: daysAgo(1), quantity: 1, beer: { abv: 6.5 } },
      { logged_at: daysAgo(2), quantity: 1, beer: { abv: 5.5 } },
      { logged_at: daysAgo(3), quantity: 1, beer: { abv: 0 } }, // 0 excluded
    ];
    const result = calculateDrinkerKPIs({ sessions: [], beerLogs });
    expect(result.avgAbv).toBe(6);
  });

  it("calculates longest and avg session duration", () => {
    const sessions = [
      { id: "1", started_at: daysAgo(1), ended_at: new Date(new Date(daysAgo(1)).getTime() + 60 * 60000).toISOString() },
      { id: "2", started_at: daysAgo(2), ended_at: new Date(new Date(daysAgo(2)).getTime() + 120 * 60000).toISOString() },
    ];
    const result = calculateDrinkerKPIs({ sessions, beerLogs: [] });
    expect(result.longestSession).toBe(120);
    expect(result.avgSessionDuration).toBe(90);
  });

  it("calculates cities and states visited", () => {
    const sessions = [
      { id: "1", started_at: daysAgo(1), ended_at: null, brewery_id: "b1" },
      { id: "2", started_at: daysAgo(2), ended_at: null, brewery_id: "b2" },
    ];
    const breweries = [
      { id: "b1", city: "Charlotte", state: "NC" },
      { id: "b2", city: "Asheville", state: "NC" },
    ];
    const result = calculateDrinkerKPIs({ sessions, beerLogs: [], breweries });
    expect(result.citiesVisited).toBe(2);
    expect(result.statesVisited).toBe(1);
  });

  it("calculates social score", () => {
    const result = calculateDrinkerKPIs({
      sessions: [],
      beerLogs: [],
      friendCount: 10,
      reactionCount: 25,
      commentCount: 5,
    });
    expect(result.socialScore).toBe(40);
  });

  it("calculates achievement completion", () => {
    const result = calculateDrinkerKPIs({
      sessions: [],
      beerLogs: [],
      achievementCount: 8,
      totalAchievements: 20,
    });
    expect(result.achievementPct).toBe(40);
  });

  it("calculates new beers this month", () => {
    const thisMonth = new Date();
    const beerLogs = [
      { beer_id: "b1", logged_at: new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 5).toISOString(), quantity: 1 },
      { beer_id: "b2", logged_at: new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 10).toISOString(), quantity: 1 },
      { beer_id: "b3", logged_at: daysAgo(60), quantity: 1 }, // old, not new this month
    ];
    const result = calculateDrinkerKPIs({ sessions: [], beerLogs });
    expect(result.newBeersThisMonth).toBe(2);
  });
});
