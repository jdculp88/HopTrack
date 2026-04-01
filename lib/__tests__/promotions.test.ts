import { describe, it, expect } from "vitest";

// ─── Promotion Hub Summary Logic ─────────────────────────────────────────────
// These test the aggregation logic used by both the server component and the API

interface AdData {
  is_active: boolean;
  impressions: number;
  clicks: number;
  budget_cents: number;
  spent_cents: number;
}

interface ChallengeData {
  is_active: boolean;
  is_sponsored: boolean;
  impressions: number;
  joins_from_discovery: number;
  participant_count: number;
}

interface ClubData {
  is_active: boolean;
  annual_fee: number;
  member_count: number;
}

function computePromotionSummary(
  ads: AdData[],
  challenges: ChallengeData[],
  clubs: ClubData[]
) {
  const activeAds = ads.filter(a => a.is_active);
  const adImpressions = ads.reduce((sum, a) => sum + (a.impressions || 0), 0);
  const adClicks = ads.reduce((sum, a) => sum + (a.clicks || 0), 0);

  const activeSponsoredChallenges = challenges.filter(c => c.is_active && c.is_sponsored);
  const activeStandardChallenges = challenges.filter(c => c.is_active && !c.is_sponsored);
  const challengeImpressions = challenges.reduce((sum, c) => sum + (c.impressions || 0), 0);
  const challengeJoins = challenges.reduce((sum, c) => sum + (c.joins_from_discovery || 0), 0);
  const challengeParticipants = challenges.reduce((sum, c) => sum + c.participant_count, 0);

  const activeClubs = clubs.filter(c => c.is_active);
  const totalMembers = clubs.reduce((sum, c) => sum + c.member_count, 0);
  const projectedRevenue = clubs.reduce((sum, c) => sum + (c.annual_fee * c.member_count), 0);

  const totalActivePromotions = activeAds.length + activeSponsoredChallenges.length + activeClubs.length;
  const totalImpressions = adImpressions + challengeImpressions;
  const totalEngagement = adClicks + challengeJoins + totalMembers;

  return {
    summary: {
      totalActivePromotions,
      totalImpressions,
      totalEngagement,
      estimatedReach: Math.round(totalImpressions * 0.6),
    },
    ads: {
      activeCount: activeAds.length,
      totalImpressions: adImpressions,
      totalClicks: adClicks,
      ctr: adImpressions > 0 ? Number(((adClicks / adImpressions) * 100).toFixed(1)) : 0,
    },
    challenges: {
      activeSponsoredCount: activeSponsoredChallenges.length,
      activeStandardCount: activeStandardChallenges.length,
      totalImpressions: challengeImpressions,
      totalJoins: challengeJoins,
      totalParticipants: challengeParticipants,
    },
    mugClubs: {
      activeCount: activeClubs.length,
      totalMembers,
      projectedRevenue,
    },
  };
}

// ─── Tier Gating Logic ───────────────────────────────────────────────────────

function getTierAccess(tier: string) {
  const isPremium = ["cask", "barrel"].includes(tier);
  return {
    canCreateAds: isPremium,
    canCreateMugClubs: isPremium,
    canSponsorChallenges: isPremium,
    canCreateStandardChallenges: true, // all tiers
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Promotion Hub Summary", () => {
  it("computes correct totals with mixed data", () => {
    const result = computePromotionSummary(
      [
        { is_active: true, impressions: 1000, clicks: 50, budget_cents: 5000, spent_cents: 2000 },
        { is_active: false, impressions: 500, clicks: 25, budget_cents: 3000, spent_cents: 3000 },
      ],
      [
        { is_active: true, is_sponsored: true, impressions: 300, joins_from_discovery: 15, participant_count: 20 },
        { is_active: true, is_sponsored: false, impressions: 0, joins_from_discovery: 0, participant_count: 8 },
      ],
      [
        { is_active: true, annual_fee: 10000, member_count: 5 },
      ]
    );

    expect(result.summary.totalActivePromotions).toBe(3); // 1 active ad + 1 sponsored challenge + 1 club
    expect(result.summary.totalImpressions).toBe(1800); // 1500 ad + 300 challenge
    expect(result.summary.totalEngagement).toBe(95); // 75 clicks + 15 joins + 5 members
    expect(result.summary.estimatedReach).toBe(1080); // 1800 * 0.6
  });

  it("handles empty data", () => {
    const result = computePromotionSummary([], [], []);
    expect(result.summary.totalActivePromotions).toBe(0);
    expect(result.summary.totalImpressions).toBe(0);
    expect(result.summary.totalEngagement).toBe(0);
    expect(result.summary.estimatedReach).toBe(0);
  });

  it("counts only active promotions", () => {
    const result = computePromotionSummary(
      [
        { is_active: false, impressions: 500, clicks: 10, budget_cents: 0, spent_cents: 0 },
      ],
      [
        { is_active: false, is_sponsored: true, impressions: 200, joins_from_discovery: 5, participant_count: 10 },
      ],
      [
        { is_active: false, annual_fee: 5000, member_count: 3 },
      ]
    );

    expect(result.summary.totalActivePromotions).toBe(0);
    // Impressions still count from all (active + inactive) for historical stats
    expect(result.summary.totalImpressions).toBe(700);
  });

  it("computes CTR correctly", () => {
    const result = computePromotionSummary(
      [{ is_active: true, impressions: 200, clicks: 10, budget_cents: 0, spent_cents: 0 }],
      [],
      []
    );
    expect(result.ads.ctr).toBe(5.0);
  });

  it("handles zero impressions for CTR", () => {
    const result = computePromotionSummary(
      [{ is_active: true, impressions: 0, clicks: 0, budget_cents: 0, spent_cents: 0 }],
      [],
      []
    );
    expect(result.ads.ctr).toBe(0);
  });

  it("computes projected mug club revenue", () => {
    const result = computePromotionSummary(
      [],
      [],
      [
        { is_active: true, annual_fee: 10000, member_count: 10 }, // $100 * 10 = $1000
        { is_active: true, annual_fee: 15000, member_count: 5 },  // $150 * 5 = $750
      ]
    );
    expect(result.mugClubs.projectedRevenue).toBe(175000); // $1750 in cents
    expect(result.mugClubs.totalMembers).toBe(15);
    expect(result.mugClubs.activeCount).toBe(2);
  });

  it("separates sponsored from standard challenges", () => {
    const result = computePromotionSummary(
      [],
      [
        { is_active: true, is_sponsored: true, impressions: 100, joins_from_discovery: 5, participant_count: 10 },
        { is_active: true, is_sponsored: true, impressions: 200, joins_from_discovery: 8, participant_count: 15 },
        { is_active: true, is_sponsored: false, impressions: 0, joins_from_discovery: 0, participant_count: 7 },
        { is_active: false, is_sponsored: true, impressions: 50, joins_from_discovery: 2, participant_count: 3 },
      ],
      []
    );
    expect(result.challenges.activeSponsoredCount).toBe(2);
    expect(result.challenges.activeStandardCount).toBe(1);
    expect(result.challenges.totalParticipants).toBe(35);
    expect(result.challenges.totalJoins).toBe(15);
  });
});

describe("Tier Gating", () => {
  it("free tier: only standard challenges", () => {
    const access = getTierAccess("free");
    expect(access.canCreateAds).toBe(false);
    expect(access.canCreateMugClubs).toBe(false);
    expect(access.canSponsorChallenges).toBe(false);
    expect(access.canCreateStandardChallenges).toBe(true);
  });

  it("tap tier: only standard challenges", () => {
    const access = getTierAccess("tap");
    expect(access.canCreateAds).toBe(false);
    expect(access.canCreateMugClubs).toBe(false);
    expect(access.canSponsorChallenges).toBe(false);
    expect(access.canCreateStandardChallenges).toBe(true);
  });

  it("cask tier: full access", () => {
    const access = getTierAccess("cask");
    expect(access.canCreateAds).toBe(true);
    expect(access.canCreateMugClubs).toBe(true);
    expect(access.canSponsorChallenges).toBe(true);
    expect(access.canCreateStandardChallenges).toBe(true);
  });

  it("barrel tier: full access", () => {
    const access = getTierAccess("barrel");
    expect(access.canCreateAds).toBe(true);
    expect(access.canCreateMugClubs).toBe(true);
    expect(access.canSponsorChallenges).toBe(true);
    expect(access.canCreateStandardChallenges).toBe(true);
  });
});
