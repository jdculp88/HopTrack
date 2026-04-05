// Intelligence engine unit tests — Avery + Reese, Sprint 158
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  calculateMagicNumber,
  calculateTimeToValue,
  calculateContentVelocity,
  calculateFeatureAdoption,
  calculateBreweryHealth,
  calculateSocialGraph,
  calculatePredictiveSignals,
  calculateRevenueV2,
  calculateIntelligenceData,
} from "@/lib/superadmin-intelligence";

// ─── Mock Supabase Client Factory ──────────────────────────────────────────

type QueryResult = { data?: any; count?: number | null };
/**
 * Override value per table. If an array is given, successive .from() calls
 * for that table pop results in order (for functions that call the same
 * table multiple times). A single object is reused every time.
 */
type FromOverrides = Record<string, QueryResult | QueryResult[]>;

function createChain(result: QueryResult) {
  const chain: any = {};
  const self = () => chain;

  Object.assign(chain, {
    select: vi.fn().mockImplementation(self),
    eq: vi.fn().mockImplementation(self),
    gt: vi.fn().mockImplementation(self),
    lt: vi.fn().mockImplementation(self),
    gte: vi.fn().mockImplementation(self),
    lte: vi.fn().mockImplementation(self),
    in: vi.fn().mockImplementation(self),
    not: vi.fn().mockImplementation(self),
    or: vi.fn().mockImplementation(self),
    order: vi.fn().mockImplementation(self),
    limit: vi.fn().mockImplementation(self),
    single: vi.fn().mockImplementation(self),
    maybeSingle: vi.fn().mockImplementation(self),
    then(resolve: (val: QueryResult) => void) {
      return Promise.resolve(result).then(resolve);
    },
  });

  return chain;
}

/**
 * Creates a mock Supabase client. Each .from(table) spawns an independent
 * chain that resolves to the data configured in fromOverrides.
 *
 * If an array of results is provided for a table, successive .from() calls
 * consume them in order (useful when a function queries the same table
 * multiple times, e.g. calculatePredictiveSignals calls sessions twice).
 */
function createMockClient(fromOverrides: FromOverrides = {}) {
  const callCounters = new Map<string, number>();

  return {
    from(table: string) {
      const override = fromOverrides[table];
      let result: QueryResult;

      if (Array.isArray(override)) {
        const idx = callCounters.get(table) ?? 0;
        callCounters.set(table, idx + 1);
        result = override[idx] ?? { data: [], count: 0 };
      } else {
        result = override ?? { data: [], count: 0 };
      }

      return createChain(result);
    },
  };
}

// Helpers to create ISO date strings relative to now
function isoAgo(days: number): string {
  return new Date(Date.now() - days * 86400000).toISOString();
}

// ── calculateMagicNumber ──────────────────────────────────────────────────

describe("calculateMagicNumber", () => {
  it("returns empty array when fewer than 10 old users exist", async () => {
    const client = createMockClient({
      profiles: { data: [{ id: "u1", created_at: isoAgo(100) }] },
    });
    const result = await calculateMagicNumber(client);
    expect(result).toEqual([]);
  });

  it("returns empty array when profiles query returns null", async () => {
    const client = createMockClient({
      profiles: { data: null },
    });
    const result = await calculateMagicNumber(client);
    expect(result).toEqual([]);
  });

  it("returns 4 signal insights when sufficient users exist", async () => {
    // 15 users created 100 days ago
    const users = Array.from({ length: 15 }, (_, i) => ({
      id: `user-${i}`,
      created_at: isoAgo(100),
    }));

    // Some sessions for a few users (recent = retained)
    const sessions = [
      { user_id: "user-0", brewery_id: "b1", started_at: isoAgo(5) },
      { user_id: "user-0", brewery_id: "b2", started_at: isoAgo(4) },
      { user_id: "user-1", brewery_id: "b1", started_at: isoAgo(3) },
    ];

    const client = createMockClient({
      profiles: { data: users },
      sessions: { data: sessions },
      beer_logs: { data: [] },
      friendships: { data: [] },
    });

    const result = await calculateMagicNumber(client);
    expect(result).toHaveLength(4);
    // Each insight has required shape
    for (const insight of result) {
      expect(insight).toHaveProperty("signal");
      expect(insight).toHaveProperty("correlation");
      expect(insight).toHaveProperty("cohortSize");
      expect(insight).toHaveProperty("controlSize");
      expect(insight).toHaveProperty("cohortRetention90d");
      expect(insight).toHaveProperty("controlRetention90d");
      expect(typeof insight.correlation).toBe("number");
    }
  });

  it("sorts results by correlation descending", async () => {
    const users = Array.from({ length: 20 }, (_, i) => ({
      id: `user-${i}`,
      created_at: isoAgo(100),
    }));

    const client = createMockClient({
      profiles: { data: users },
      sessions: { data: [] },
      beer_logs: { data: [] },
      friendships: { data: [] },
    });

    const result = await calculateMagicNumber(client);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].correlation).toBeLessThanOrEqual(result[i - 1].correlation);
    }
  });
});

// ── calculateTimeToValue ──────────────────────────────────────────────────

describe("calculateTimeToValue", () => {
  it("returns all nulls when no profiles exist", async () => {
    const client = createMockClient({
      profiles: { data: [] },
    });
    const result = await calculateTimeToValue(client);
    expect(result.medianSignupToFirstCheckin).toBeNull();
    expect(result.medianFirstCheckinToFirstRating).toBeNull();
    expect(result.medianFirstCheckinToSecondBrewery).toBeNull();
    expect(result.medianSignupToFriendAdded).toBeNull();
    expect(result.trends).toEqual([]);
  });

  it("returns all nulls when profiles query returns null", async () => {
    const client = createMockClient({
      profiles: { data: null },
    });
    const result = await calculateTimeToValue(client);
    expect(result.medianSignupToFirstCheckin).toBeNull();
    expect(result.trends).toEqual([]);
  });

  it("computes median signup-to-checkin time correctly", async () => {
    // 3 users: signed up 60 days ago, first checkin at known offsets
    const baseTime = Date.now() - 60 * 86400000;
    const profiles = [
      { id: "u1", created_at: new Date(baseTime).toISOString() },
      { id: "u2", created_at: new Date(baseTime).toISOString() },
      { id: "u3", created_at: new Date(baseTime).toISOString() },
    ];

    // First check-in 60 minutes, 120 minutes, 180 minutes after signup
    const sessions = [
      { user_id: "u1", brewery_id: "b1", started_at: new Date(baseTime + 60 * 60000).toISOString() },
      { user_id: "u2", brewery_id: "b1", started_at: new Date(baseTime + 120 * 60000).toISOString() },
      { user_id: "u3", brewery_id: "b1", started_at: new Date(baseTime + 180 * 60000).toISOString() },
    ];

    const client = createMockClient({
      profiles: { data: profiles },
      sessions: { data: sessions },
      beer_logs: { data: [] },
      friendships: { data: [] },
    });

    const result = await calculateTimeToValue(client);
    // median of [60, 120, 180] = 120 minutes
    expect(result.medianSignupToFirstCheckin).toBe(120);
  });

  it("returns trends array with at least one entry when profiles exist", async () => {
    const profiles = [
      { id: "u1", created_at: isoAgo(20) },
    ];

    const client = createMockClient({
      profiles: { data: profiles },
      sessions: { data: [] },
      beer_logs: { data: [] },
      friendships: { data: [] },
    });

    const result = await calculateTimeToValue(client);
    expect(result.trends).toHaveLength(1);
    expect(result.trends[0].metric).toBe("Signup \u2192 First Check-in");
  });
});

// ── calculateContentVelocity ──────────────────────────────────────────────

describe("calculateContentVelocity", () => {
  it("returns zero velocities when no data exists", async () => {
    const client = createMockClient({
      sessions: { data: [] },
      beer_logs: { data: [] },
      beers: { data: [] },
    });

    const result = await calculateContentVelocity(client, 30);
    expect(result.checkinsPerDay).toBe(0);
    expect(result.ratingsPerDay).toBe(0);
    expect(result.reviewsPerDay).toBe(0);
    expect(result.newBeersPerDay).toBe(0);
    expect(result.acceleration).toBe(0);
    expect(result.dailySeries).toHaveLength(30);
  });

  it("calculates daily rates correctly", async () => {
    // 10 sessions over 10 days = 1.0 per day
    const sessions = Array.from({ length: 10 }, (_, i) => ({
      started_at: isoAgo(i),
    }));
    // 5 rated logs, 2 with review text
    const beerLogs = [
      { logged_at: isoAgo(1), rating: 4, review_text: "Good" },
      { logged_at: isoAgo(2), rating: 3, review_text: "OK" },
      { logged_at: isoAgo(3), rating: 5, review_text: null },
      { logged_at: isoAgo(4), rating: 0, review_text: null },
      { logged_at: isoAgo(5), rating: 4, review_text: null },
    ];

    const client = createMockClient({
      sessions: { data: sessions },
      beer_logs: { data: beerLogs },
      beers: { data: [] },
    });

    const result = await calculateContentVelocity(client, 10);
    expect(result.checkinsPerDay).toBe(1);
    // 4 rated (rating > 0) out of 5 logs over 10 days = 0.4
    expect(result.ratingsPerDay).toBe(0.4);
    // 2 with review_text over 10 days = 0.2
    expect(result.reviewsPerDay).toBe(0.2);
  });

  it("computes positive acceleration when second half has more sessions", async () => {
    // rangeDays = 20, halfRange = 10 days ago
    // First half (20-10 days ago): 2 sessions
    // Second half (10-0 days ago): 8 sessions
    const sessions = [
      { started_at: isoAgo(15) },
      { started_at: isoAgo(12) },
      { started_at: isoAgo(9) },
      { started_at: isoAgo(8) },
      { started_at: isoAgo(7) },
      { started_at: isoAgo(5) },
      { started_at: isoAgo(3) },
      { started_at: isoAgo(2) },
      { started_at: isoAgo(1) },
      { started_at: isoAgo(0) },
    ];

    const client = createMockClient({
      sessions: { data: sessions },
      beer_logs: { data: [] },
      beers: { data: [] },
    });

    const result = await calculateContentVelocity(client, 20);
    expect(result.acceleration).toBeGreaterThan(0);
  });

  it("returns 100 acceleration when first half is zero but second half has data", async () => {
    const sessions = [
      { started_at: isoAgo(1) },
      { started_at: isoAgo(2) },
    ];

    const client = createMockClient({
      sessions: { data: sessions },
      beer_logs: { data: [] },
      beers: { data: [] },
    });

    const result = await calculateContentVelocity(client, 30);
    // All sessions are in second half (< 15 days ago)
    // firstHalf = 0, secondHalf > 0 => acceleration = 100
    expect(result.acceleration).toBe(100);
  });

  it("daily series has correct length for custom range", async () => {
    const client = createMockClient({
      sessions: { data: [] },
      beer_logs: { data: [] },
      beers: { data: [] },
    });

    const result = await calculateContentVelocity(client, 7);
    expect(result.dailySeries).toHaveLength(7);
  });
});

// ── calculateFeatureAdoption ──────────────────────────────────────────────

describe("calculateFeatureAdoption", () => {
  it("returns empty array when MAU is zero", async () => {
    const client = createMockClient({
      sessions: { data: [] },
    });
    const result = await calculateFeatureAdoption(client);
    expect(result).toEqual([]);
  });

  it("returns 8 feature items when users are active", async () => {
    // sessions is called 3 times: MAU, prior MAU, check-in feature query
    const mauSessions = [{ user_id: "u1" }, { user_id: "u2" }, { user_id: "u3" }];

    const client = createMockClient({
      sessions: [
        { data: mauSessions },     // MAU
        { data: [] },              // prior MAU
        { data: mauSessions },     // check-in feature query
      ],
      beer_logs: [
        { data: [{ user_id: "u1", rating: 4 }] },  // ratings
        { data: [] },                                 // reviews
      ],
      friendships: { data: [] },
      user_achievements: { data: [] },
      brewery_follows: { data: [] },
      reactions: { data: [] },
      session_comments: { data: [] },
    });

    const result = await calculateFeatureAdoption(client);
    expect(result).toHaveLength(8);
    expect(result[0]).toHaveProperty("feature");
    expect(result[0]).toHaveProperty("adoptionPct");
    expect(result[0]).toHaveProperty("totalUsers");
  });

  it("calculates adoption percentage correctly", async () => {
    // 4 MAU users, 2 use ratings
    const mauSessions = [
      { user_id: "u1" }, { user_id: "u2" },
      { user_id: "u3" }, { user_id: "u4" },
    ];
    const ratingLogs = [{ user_id: "u1" }, { user_id: "u2" }];

    const client = createMockClient({
      sessions: [
        { data: mauSessions },     // MAU
        { data: [] },              // prior MAU
        { data: mauSessions },     // check-in feature query
      ],
      beer_logs: [
        { data: ratingLogs },       // ratings
        { data: [] },               // reviews
      ],
      friendships: { data: [] },
      user_achievements: { data: [] },
      brewery_follows: { data: [] },
      reactions: { data: [] },
      session_comments: { data: [] },
    });

    const result = await calculateFeatureAdoption(client);
    // Check-ins: 4/4 = 100%, Ratings: 2/4 = 50%
    const checkins = result.find((f) => f.feature === "Check-ins");
    expect(checkins?.adoptionPct).toBe(100);
    const ratings = result.find((f) => f.feature === "Ratings");
    expect(ratings?.adoptionPct).toBe(50);
  });

  it("sorts features by adoption percentage descending", async () => {
    const mauSessions = [{ user_id: "u1" }, { user_id: "u2" }];

    const client = createMockClient({
      sessions: [
        { data: mauSessions },
        { data: [] },
        { data: mauSessions },
      ],
      beer_logs: [
        { data: [{ user_id: "u1" }] },
        { data: [] },
      ],
      friendships: { data: [] },
      user_achievements: { data: [] },
      brewery_follows: { data: [] },
      reactions: { data: [{ user_id: "u1" }, { user_id: "u2" }] },
      session_comments: { data: [] },
    });

    const result = await calculateFeatureAdoption(client);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].adoptionPct).toBeLessThanOrEqual(result[i - 1].adoptionPct);
    }
  });
});

// ── calculateBreweryHealth ────────────────────────────────────────────────

describe("calculateBreweryHealth", () => {
  it("returns empty top10/bottom10 when no verified breweries exist", async () => {
    const client = createMockClient({
      brewery_accounts: { data: [] },
    });
    const result = await calculateBreweryHealth(client);
    expect(result.top10).toEqual([]);
    expect(result.bottom10).toEqual([]);
  });

  it("returns empty when brewery_accounts returns null", async () => {
    const client = createMockClient({
      brewery_accounts: { data: null },
    });
    const result = await calculateBreweryHealth(client);
    expect(result.top10).toEqual([]);
    expect(result.bottom10).toEqual([]);
  });

  it("computes scores bounded 0-100 for each brewery", async () => {
    const accounts = [
      { brewery_id: "b1", brewery: { id: "b1", name: "Brew A", city: "Asheville", state: "NC" } },
      { brewery_id: "b2", brewery: { id: "b2", name: "Brew B", city: "Charlotte", state: "NC" } },
    ];

    const client = createMockClient({
      brewery_accounts: { data: accounts },
      beers: { data: [{ brewery_id: "b1", updated_at: isoAgo(3) }] },
      sessions: { data: [{ brewery_id: "b1", user_id: "u1" }] },
      loyalty_programs: { data: [{ brewery_id: "b1", is_active: true }] },
      beer_logs: [
        { data: [] },  // recent ratings
        { data: [] },  // prior ratings
      ],
      brewery_follows: { data: [{ brewery_id: "b1" }] },
    });

    const result = await calculateBreweryHealth(client);
    const allScores = [...result.top10, ...result.bottom10];
    for (const item of allScores) {
      expect(item.score).toBeGreaterThanOrEqual(0);
      expect(item.score).toBeLessThanOrEqual(100);
      expect(item.breakdown.contentFreshness).toBeGreaterThanOrEqual(0);
      expect(item.breakdown.contentFreshness).toBeLessThanOrEqual(25);
      expect(item.breakdown.engagementRate).toBeGreaterThanOrEqual(0);
      expect(item.breakdown.engagementRate).toBeLessThanOrEqual(25);
      expect(item.breakdown.loyaltyAdoption).toBeGreaterThanOrEqual(0);
      expect(item.breakdown.loyaltyAdoption).toBeLessThanOrEqual(25);
      expect(item.breakdown.ratingTrend).toBeGreaterThanOrEqual(0);
      expect(item.breakdown.ratingTrend).toBeLessThanOrEqual(25);
    }
  });

  it("awards max content freshness for recently updated tap lists", async () => {
    const accounts = [
      { brewery_id: "b1", brewery: { id: "b1", name: "Fresh Brew", city: "Test", state: "NC" } },
    ];

    const client = createMockClient({
      brewery_accounts: { data: accounts },
      beers: { data: [{ brewery_id: "b1", updated_at: isoAgo(2) }] },
      sessions: { data: [] },
      loyalty_programs: { data: [] },
      beer_logs: [{ data: [] }, { data: [] }],
      brewery_follows: { data: [] },
    });

    const result = await calculateBreweryHealth(client);
    const brew = [...result.top10, ...result.bottom10].find((b) => b.breweryId === "b1");
    // Updated 2 days ago => within 7 days => contentFreshness = 25
    expect(brew?.breakdown.contentFreshness).toBe(25);
  });

  it("gives max loyalty score for active loyalty program", async () => {
    const accounts = [
      { brewery_id: "b1", brewery: { id: "b1", name: "Loyal Brew", city: "Test", state: "NC" } },
    ];

    const client = createMockClient({
      brewery_accounts: { data: accounts },
      beers: { data: [] },
      sessions: { data: [] },
      loyalty_programs: { data: [{ brewery_id: "b1", is_active: true }] },
      beer_logs: [{ data: [] }, { data: [] }],
      brewery_follows: { data: [] },
    });

    const result = await calculateBreweryHealth(client);
    const brew = [...result.top10, ...result.bottom10].find((b) => b.breweryId === "b1");
    expect(brew?.breakdown.loyaltyAdoption).toBe(25);
  });
});

// ── calculateSocialGraph ──────────────────────────────────────────────────

describe("calculateSocialGraph", () => {
  it("returns default values when platform is empty", async () => {
    // friendships is called twice: count query, then data query
    const client = createMockClient({
      profiles: { count: 0 },
      friendships: [
        { count: 0 },
        { data: [] },
      ],
      reactions: { count: 0 },
      session_comments: { count: 0 },
      brewery_follows: { count: 0 },
      sessions: { count: 0 },
    });

    const result = await calculateSocialGraph(client);
    expect(result.avgFriendsPerUser).toBe(0);
    expect(result.networkDensity).toBe(0);
  });

  it("computes orphan rate correctly", async () => {
    // 10 total users, 4 have friends (2 friendship pairs)
    const client = createMockClient({
      profiles: { count: 10 },
      friendships: [
        { count: 2 },
        {
          data: [
            { requester_id: "u1", addressee_id: "u2" },
            { requester_id: "u3", addressee_id: "u4" },
          ],
        },
      ],
      reactions: { count: 0 },
      session_comments: { count: 0 },
      brewery_follows: { count: 0 },
      sessions: { count: 1 },
    });

    const result = await calculateSocialGraph(client);
    // orphanRate = (10 - 4) / 10 * 100 = 60%
    expect(result.orphanRate).toBe(60);
    // avgFriendsPerUser = (2 * 2) / 10 = 0.4
    expect(result.avgFriendsPerUser).toBe(0.4);
  });

  it("computes social feature adoption ratios", async () => {
    const client = createMockClient({
      profiles: { count: 100 },
      friendships: [
        { count: 50 },
        { data: [] },
      ],
      reactions: { count: 20 },
      session_comments: { count: 10 },
      brewery_follows: { count: 30 },
      sessions: { count: 100 },
    });

    const result = await calculateSocialGraph(client);
    // reactions: 20 / 100 * 100 = 20%
    expect(result.socialFeatureAdoption.reactions).toBe(20);
    // comments: 10 / 100 * 100 = 10%
    expect(result.socialFeatureAdoption.comments).toBe(10);
    // follows: 30 / 100 * 100 = 30%
    expect(result.socialFeatureAdoption.follows).toBe(30);
  });
});

// ── calculatePredictiveSignals ────────────────────────────────────────────

describe("calculatePredictiveSignals", () => {
  it("returns empty array when no session data exists", async () => {
    const client = createMockClient({
      sessions: { data: [] },
      beer_logs: { data: [] },
      profiles: { data: [] },
    });

    const result = await calculatePredictiveSignals(client);
    expect(result).toEqual([]);
  });

  it("identifies user churn risk when frequency drops by 50%+", async () => {
    // Prior period: user had 4 sessions
    // Recent period: user had 1 session (75% drop)
    const recentSessions = [{ user_id: "u-churn" }];
    const priorSessions = Array.from({ length: 4 }, () => ({ user_id: "u-churn" }));

    // sessions is called twice (recent, prior) in Promise.all — use array override
    const client = createMockClient({
      sessions: [
        { data: recentSessions },
        { data: priorSessions },
      ],
      beer_logs: [
        { data: [] },
        { data: [] },
      ],
      profiles: { data: [{ id: "u-churn", display_name: "Churn User", username: "churnuser" }] },
    });

    const result = await calculatePredictiveSignals(client);
    const churnSignal = result.find((s) => s.type === "user_churn");
    expect(churnSignal).toBeDefined();
    expect(churnSignal!.probability).toBe(75);
    expect(churnSignal!.name).toBe("Churn User");
  });

  it("detects trending styles with 50%+ growth and minimum volume", async () => {
    // Recent: IPA = 10 logs. Prior: IPA = 5 logs. Growth = 100%
    const client = createMockClient({
      sessions: [
        { data: [] },
        { data: [] },
      ],
      beer_logs: [
        { data: Array.from({ length: 10 }, () => ({ beer: { style: "IPA" } })) },
        { data: Array.from({ length: 5 }, () => ({ beer: { style: "IPA" } })) },
      ],
      profiles: { data: [] },
    });

    const result = await calculatePredictiveSignals(client);
    const trending = result.find((s) => s.type === "trending_style" && s.name === "IPA");
    expect(trending).toBeDefined();
    expect(trending!.probability).toBe(100); // 100% growth
    expect(trending!.reason).toContain("5 \u2192 10");
  });

  it("does NOT flag trending style below minimum volume of 5", async () => {
    const client = createMockClient({
      sessions: [
        { data: [] },
        { data: [] },
      ],
      beer_logs: [
        { data: Array.from({ length: 3 }, () => ({ beer: { style: "Saison" } })) },
        { data: Array.from({ length: 1 }, () => ({ beer: { style: "Saison" } })) },
      ],
      profiles: { data: [] },
    });

    const result = await calculatePredictiveSignals(client);
    const saison = result.find((s) => s.name === "Saison");
    expect(saison).toBeUndefined();
  });
});

// ── calculateRevenueV2 ───────────────────────────────────────────────────

describe("calculateRevenueV2", () => {
  it("returns zeros when no accounts exist", async () => {
    const client = createMockClient({
      brewery_accounts: { data: [] },
      brewery_claims: { data: [] },
    });

    const result = await calculateRevenueV2(client);
    expect(result.projectedMRR).toBe(0);
    expect(result.trialConversionRate).toBe(0);
    expect(result.churnRateMonthly).toBe(0);
  });

  it("computes MRR from paid accounts", async () => {
    const accounts = [
      { subscription_tier: "tap", subscription_status: "active", verified: true, trial_ends_at: null },
      { subscription_tier: "cask", subscription_status: "active", verified: true, trial_ends_at: null },
      { subscription_tier: "tap", subscription_status: "active", verified: true, trial_ends_at: null },
    ];

    const client = createMockClient({
      brewery_accounts: { data: accounts },
      brewery_claims: { data: [] },
    });

    const result = await calculateRevenueV2(client);
    // 2 x tap ($49) + 1 x cask ($149) = $247 MRR
    expect(result.projectedMRR).toBeGreaterThanOrEqual(247);
  });

  it("handles division by zero in churn rate", async () => {
    // No converted or churned accounts
    const accounts = [
      { subscription_tier: null, subscription_status: null, verified: false, trial_ends_at: null },
    ];

    const client = createMockClient({
      brewery_accounts: { data: accounts },
      brewery_claims: { data: [] },
    });

    const result = await calculateRevenueV2(client);
    expect(result.trialConversionRate).toBe(0);
    expect(result.churnRateMonthly).toBe(0);
    expect(Number.isFinite(result.estimatedLTV)).toBe(true);
    expect(Number.isFinite(result.monthsToTarget)).toBe(true);
  });

  it("computes trial conversion rate correctly", async () => {
    const futureDate = new Date(Date.now() + 7 * 86400000).toISOString();
    const pastDate = new Date(Date.now() - 7 * 86400000).toISOString();
    const accounts = [
      // 2 converted (active paid)
      { subscription_tier: "tap", subscription_status: "active", verified: true, trial_ends_at: pastDate },
      { subscription_tier: "cask", subscription_status: "active", verified: true, trial_ends_at: pastDate },
      // 1 churned (verified, no tier, expired trial)
      { subscription_tier: null, subscription_status: null, verified: true, trial_ends_at: pastDate },
    ];

    const client = createMockClient({
      brewery_accounts: { data: accounts },
      brewery_claims: { data: [{ status: "approved" }] },
    });

    const result = await calculateRevenueV2(client);
    // conversion = 2 / (2 + 1) = 66.7%
    expect(result.trialConversionRate).toBeCloseTo(66.7, 0);
    // churn = 1 / (2 + 1) = 33.3%
    expect(result.churnRateMonthly).toBeCloseTo(33.3, 0);
  });

  it("estimates LTV based on churn rate", async () => {
    const pastDate = new Date(Date.now() - 30 * 86400000).toISOString();
    const accounts = [
      // 4 converted
      ...Array.from({ length: 4 }, () => ({
        subscription_tier: "tap",
        subscription_status: "active",
        verified: true,
        trial_ends_at: pastDate,
      })),
      // 1 churned
      {
        subscription_tier: null,
        subscription_status: null,
        verified: true,
        trial_ends_at: pastDate,
      },
    ];

    const client = createMockClient({
      brewery_accounts: { data: accounts },
      brewery_claims: { data: [] },
    });

    const result = await calculateRevenueV2(client);
    // avgTierPrice = (4*49)/4 = 49
    // churnRate = 1/5 = 20%
    // LTV = 49 / 0.2 = 245
    expect(result.estimatedLTV).toBe(245);
  });

  it("returns 999 months to target when no growth is possible", async () => {
    // No growth, no revenue
    const client = createMockClient({
      brewery_accounts: { data: [] },
      brewery_claims: { data: [] },
    });

    const result = await calculateRevenueV2(client);
    // projectedMRR = 0, monthlyGrowth = 0, target not met => 999
    expect(result.monthsToTarget).toBe(999);
  });
});

// ── calculateIntelligenceData (aggregator) ────────────────────────────────

describe("calculateIntelligenceData", () => {
  it("returns complete IntelligenceData shape", async () => {
    const client = createMockClient({
      profiles: { data: [], count: 0 },
      sessions: { data: [], count: 0 },
      beer_logs: { data: [] },
      beers: { data: [] },
      friendships: { data: [], count: 0 },
      brewery_accounts: { data: [] },
      brewery_claims: { data: [] },
      user_achievements: { data: [] },
      brewery_follows: { data: [], count: 0 },
      reactions: { data: [], count: 0 },
      session_comments: { data: [], count: 0 },
    });

    const result = await calculateIntelligenceData(client);
    expect(result).toHaveProperty("magicNumber");
    expect(result).toHaveProperty("timeToValue");
    expect(result).toHaveProperty("contentVelocity");
    expect(result).toHaveProperty("featureAdoption");
    expect(result).toHaveProperty("breweryHealth");
    expect(result).toHaveProperty("socialGraph");
    expect(result).toHaveProperty("predictiveSignals");
    expect(result).toHaveProperty("revenueV2");
    expect(result).toHaveProperty("generatedAt");
    expect(typeof result.generatedAt).toBe("string");
  });

  it("lazy-loads magicNumber and breweryHealth as empty", async () => {
    const client = createMockClient({
      profiles: { data: [], count: 0 },
      sessions: { data: [], count: 0 },
      beer_logs: { data: [] },
      beers: { data: [] },
      friendships: { data: [], count: 0 },
      brewery_accounts: { data: [] },
      brewery_claims: { data: [] },
      user_achievements: { data: [] },
      brewery_follows: { data: [], count: 0 },
      reactions: { data: [], count: 0 },
      session_comments: { data: [], count: 0 },
    });

    const result = await calculateIntelligenceData(client);
    // These are intentionally empty in the aggregator (lazy-loaded via separate endpoints)
    expect(result.magicNumber).toEqual([]);
    expect(result.breweryHealth).toEqual({ top10: [], bottom10: [] });
  });
});
