/**
 * Brewery Health Score — individual brewery version
 * Adapts the superadmin calculateBreweryHealth() scoring for single-brewery use.
 * Sprint 159 — The Accelerator
 */

import { createServiceClient } from "@/lib/supabase/service";

// ── Types ───────────────────────────────────────────────────────────────────

export interface BreweryHealthBreakdown {
  contentFreshness: number;  // 0-25
  engagementRate: number;    // 0-25
  loyaltyAdoption: number;   // 0-25
  ratingTrend: number;       // 0-25
}

export interface BreweryHealthTip {
  category: keyof BreweryHealthBreakdown;
  message: string;
  ctaText: string;
  ctaPath: string; // relative to /brewery-admin/[id]/
}

export interface MyBreweryHealth {
  score: number; // 0-100
  breakdown: BreweryHealthBreakdown;
  tips: BreweryHealthTip[];
}

// ── Pure Scoring Functions (testable without Supabase) ──────────────────────

export function scoreContentFreshness(daysSinceUpdate: number): number {
  if (daysSinceUpdate <= 7) return 25;
  if (daysSinceUpdate <= 14) return 18;
  if (daysSinceUpdate <= 30) return 10;
  return 0;
}

export function scoreEngagementRate(sessionCount: number, followerCount: number): number {
  if (followerCount > 0) return Math.min(25, Math.round((sessionCount / followerCount) * 5));
  return sessionCount > 0 ? 10 : 0;
}

export function scoreLoyaltyAdoption(hasProgram: boolean, isActive: boolean): number {
  if (isActive) return 25;
  if (hasProgram) return 10;
  return 0;
}

export function scoreRatingTrend(recentAvg: number, priorAvg: number, hasRecentRatings: boolean): number {
  if (!hasRecentRatings) return 0;
  if (recentAvg >= priorAvg) return Math.min(25, Math.round(recentAvg * 5));
  return Math.max(0, Math.round(recentAvg * 5) - 5);
}

export function generateTips(breakdown: BreweryHealthBreakdown, daysSinceUpdate: number): BreweryHealthTip[] {
  const tips: BreweryHealthTip[] = [];
  const threshold = 15;

  if (breakdown.contentFreshness < threshold) {
    const daysText = daysSinceUpdate >= 999 ? "never been updated" : `hasn't been updated in ${Math.round(daysSinceUpdate)} days`;
    tips.push({
      category: "contentFreshness",
      message: `Your tap list ${daysText}. Keeping it fresh drives repeat visits.`,
      ctaText: "Update Tap List",
      ctaPath: "tap-list",
    });
  }

  if (breakdown.engagementRate < threshold) {
    tips.push({
      category: "engagementRate",
      message: "Your engagement rate is low. Try running a promotion or challenge to drive visits.",
      ctaText: "Create Promotion",
      ctaPath: "promo-hub",
    });
  }

  if (breakdown.loyaltyAdoption < threshold) {
    tips.push({
      category: "loyaltyAdoption",
      message: "Set up a loyalty program to boost customer retention and earn full marks.",
      ctaText: "Set Up Loyalty",
      ctaPath: "loyalty",
    });
  }

  if (breakdown.ratingTrend < threshold) {
    tips.push({
      category: "ratingTrend",
      message: "Your ratings are trending down. Check recent reviews for feedback opportunities.",
      ctaText: "View Reviews",
      ctaPath: "analytics",
    });
  }

  return tips;
}

// ── Main Function ───────────────────────────────────────────────────────────

export async function calculateMyBreweryHealth(breweryId: string): Promise<MyBreweryHealth> {
  const service = createServiceClient();
  const now = Date.now();
  const thirtyDaysAgo = new Date(now - 30 * 86400000).toISOString();
  const sixtyDaysAgo = new Date(now - 60 * 86400000).toISOString();

  const [
    { data: tapBeers },
    { data: recentSessions },
    { data: loyaltyPrograms },
    { data: recentRatings },
    { data: priorRatings },
    { count: followerCount },
  ] = await Promise.all([
    (service as any).from("beers").select("updated_at").eq("brewery_id", breweryId).eq("is_on_tap", true).limit(500),
    (service as any).from("sessions").select("user_id").eq("brewery_id", breweryId).eq("is_active", false).gte("started_at", thirtyDaysAgo).limit(10000),
    (service as any).from("loyalty_programs").select("is_active").eq("brewery_id", breweryId).limit(10),
    (service as any).from("beer_logs").select("rating, beer:beers!inner(brewery_id)").gt("rating", 0).gte("logged_at", thirtyDaysAgo).eq("beer.brewery_id", breweryId).limit(10000),
    (service as any).from("beer_logs").select("rating, beer:beers!inner(brewery_id)").gt("rating", 0).gte("logged_at", sixtyDaysAgo).lt("logged_at", thirtyDaysAgo).eq("beer.brewery_id", breweryId).limit(10000),
    (service as any).from("brewery_follows").select("*", { count: "exact", head: true }).eq("brewery_id", breweryId),
  ]);

  // Content Freshness
  const latestUpdate = (tapBeers ?? []).reduce((latest: number, b: any) => {
    const t = new Date(b.updated_at).getTime();
    return t > latest ? t : latest;
  }, 0);
  const daysSinceUpdate = latestUpdate > 0 ? (now - latestUpdate) / 86400000 : 999;
  const contentFreshness = scoreContentFreshness(daysSinceUpdate);

  // Engagement Rate
  const sessionCount = (recentSessions ?? []).length;
  const engagementRate = scoreEngagementRate(sessionCount, followerCount ?? 0);

  // Loyalty Adoption
  const loyalty = (loyaltyPrograms ?? [])[0];
  const loyaltyAdoption = scoreLoyaltyAdoption(!!loyalty, !!loyalty?.is_active);

  // Rating Trend
  const recentAvg = (recentRatings ?? []).length > 0
    ? (recentRatings ?? []).reduce((sum: number, r: any) => sum + r.rating, 0) / (recentRatings ?? []).length
    : 0;
  const priorAvg = (priorRatings ?? []).length > 0
    ? (priorRatings ?? []).reduce((sum: number, r: any) => sum + r.rating, 0) / (priorRatings ?? []).length
    : 0;
  const ratingTrend = scoreRatingTrend(recentAvg, priorAvg, (recentRatings ?? []).length > 0);

  const breakdown: BreweryHealthBreakdown = { contentFreshness, engagementRate, loyaltyAdoption, ratingTrend };
  const score = contentFreshness + engagementRate + loyaltyAdoption + ratingTrend;
  const tips = generateTips(breakdown, daysSinceUpdate);

  return { score, breakdown, tips };
}
