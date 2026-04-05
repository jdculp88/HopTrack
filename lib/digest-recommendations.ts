/**
 * Digest Recommendations — rule-based actionable insights for weekly digest emails
 * No AI cost — pure logic from existing KPI + CRM data
 * Sprint 159 — The Accelerator
 */

import type { BreweryKPIs } from "@/lib/kpi";

// ── Types ───────────────────────────────────────────────────────────────────

export interface DigestRecommendation {
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  priority: number; // 1 = highest
}

export interface DigestRecommendationInput {
  breweryId: string;
  topBeer: string | null;
  visits: number;
  visitsTrend: number; // % change WoW
  followerGrowth: number;
  loyaltyRedemptions: number;
  kpis: Pick<BreweryKPIs, "retentionRate" | "avgRatingTrend" | "tapListFreshness"> | null;
  vipsNotVisiting: number; // VIP customers who haven't visited in 14+ days
}

// ── Rule Engine ─────────────────────────────────────────────────────────────

export function generateDigestRecommendations(input: DigestRecommendationInput): DigestRecommendation[] {
  const { breweryId, topBeer, followerGrowth, kpis, vipsNotVisiting } = input;
  const base = `/brewery-admin/${breweryId}`;
  const recommendations: DigestRecommendation[] = [];

  // Rule 1: Feature top beer on The Board (P1)
  if (topBeer) {
    recommendations.push({
      title: `Feature "${topBeer}" on your Board`,
      description: `"${topBeer}" was your most popular pour this week. Highlight it on your Board to keep the momentum going.`,
      ctaText: "Update Your Board",
      ctaUrl: `${base}/board`,
      priority: 1,
    });
  }

  // Rule 2: VIP win-back alert (P1)
  if (vipsNotVisiting > 0) {
    const plural = vipsNotVisiting === 1 ? "VIP customer hasn't" : `VIP customers haven't`;
    recommendations.push({
      title: `${vipsNotVisiting} ${plural} visited in 2 weeks`,
      description: "Your most loyal customers are overdue for a visit. A personal message could bring them back.",
      ctaText: "View Customers",
      ctaUrl: `${base}/customers`,
      priority: 1,
    });
  }

  // Rule 3: Retention drop alert (P1)
  if (kpis?.retentionRate !== null && kpis?.retentionRate !== undefined && kpis.retentionRate < 30) {
    recommendations.push({
      title: "Retention rate needs attention",
      description: `Your retention rate is at ${Math.round(kpis.retentionRate)}%. Consider running a loyalty promotion to encourage repeat visits.`,
      ctaText: "Manage Loyalty",
      ctaUrl: `${base}/loyalty`,
      priority: 1,
    });
  }

  // Rule 4: Rating improvement celebration (P2)
  if (kpis?.avgRatingTrend !== null && kpis?.avgRatingTrend !== undefined && kpis.avgRatingTrend > 0) {
    const stars = kpis.avgRatingTrend.toFixed(1);
    recommendations.push({
      title: `Your ratings improved by ${stars} stars`,
      description: "Great news! Your beer ratings are trending up. Share this win with your team or on social media.",
      ctaText: "View Analytics",
      ctaUrl: `${base}/analytics`,
      priority: 2,
    });
  }

  // Rule 5: Follower growth nudge (P2)
  if (followerGrowth >= 5) {
    recommendations.push({
      title: `You gained ${followerGrowth} new followers`,
      description: "New followers are interested in your brewery. Send them a welcome message to start building loyalty.",
      ctaText: "Send Message",
      ctaUrl: `${base}/messages`,
      priority: 2,
    });
  }

  // Rule 6: Stale tap list warning (P2)
  if (kpis?.tapListFreshness !== null && kpis?.tapListFreshness !== undefined && kpis.tapListFreshness > 14) {
    const days = Math.round(kpis.tapListFreshness);
    recommendations.push({
      title: "Your tap list could use a refresh",
      description: `Your tap list hasn't been updated in ${days} days. Keeping it current drives repeat visits and builds trust.`,
      ctaText: "Update Tap List",
      ctaUrl: `${base}/tap-list`,
      priority: 2,
    });
  }

  // Sort by priority (lowest number = highest priority), return top 3
  return recommendations
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3);
}
