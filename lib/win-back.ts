/**
 * Win-Back Intelligence — identify at-risk customers for re-engagement
 * Sprint 159 — The Accelerator
 */

import { createServiceClient } from "@/lib/supabase/service";
import { computeSegment, computeEngagementScore, type CustomerSegment, type EngagementFactors } from "@/lib/crm";

// ── Types ───────────────────────────────────────────────────────────────────

export interface WinBackCandidate {
  userId: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  visits: number;
  lastVisit: string;
  daysSinceVisit: number;
  engagementScore: number;
  segment: CustomerSegment;
  suggestedAction: string;
  messageTemplate: string;
}

// ── Message Templates ───────────────────────────────────────────────────────

export function getWinBackTemplate(segment: CustomerSegment, breweryName: string): { action: string; template: string } {
  switch (segment) {
    case "vip":
      return {
        action: "Send a personal welcome-back message",
        template: `Hey! It's been a while since your last visit to ${breweryName}. We miss our regulars — come see what's new on tap this week!`,
      };
    case "power":
      return {
        action: "Invite them back with what's new",
        template: `We've got some great new brews on tap at ${breweryName}. It's been a bit since your last visit — come check them out!`,
      };
    case "regular":
      return {
        action: "Offer an incentive to return",
        template: `We'd love to see you back at ${breweryName}! Stop by this week and earn double loyalty stamps on your next pour.`,
      };
    default:
      return {
        action: "Re-engage with a friendly nudge",
        template: `Thanks for visiting ${breweryName}! We've added some exciting new options to our tap list. Come back and explore!`,
      };
  }
}

// ── Main Function ───────────────────────────────────────────────────────────

export async function identifyWinBackCandidates(
  breweryId: string,
  opts: { minVisits?: number; minDaysGone?: number; limit?: number } = {},
): Promise<WinBackCandidate[]> {
  const { minVisits = 3, minDaysGone = 14, limit = 10 } = opts;
  const service = createServiceClient();
  const now = Date.now();

  // Get all sessions for this brewery, grouped by user
  const { data: sessions } = await (service as any)
    .from("sessions")
    .select("user_id, started_at")
    .eq("brewery_id", breweryId)
    .eq("is_active", false)
    .order("started_at", { ascending: false })
    .limit(50000);

  if (!sessions || sessions.length === 0) return [];

  // Aggregate per user: visit count + last visit
  const userMap = new Map<string, { visits: number; lastVisit: string }>();
  for (const s of sessions) {
    const existing = userMap.get(s.user_id);
    if (!existing) {
      userMap.set(s.user_id, { visits: 1, lastVisit: s.started_at });
    } else {
      existing.visits++;
      if (s.started_at > existing.lastVisit) existing.lastVisit = s.started_at;
    }
  }

  // Filter: min visits + min days since last visit
  const cutoffMs = minDaysGone * 86400000;
  const candidates: { userId: string; visits: number; lastVisit: string; daysSinceVisit: number }[] = [];

  for (const [userId, data] of userMap) {
    if (data.visits < minVisits) continue;
    const daysSince = (now - new Date(data.lastVisit).getTime()) / 86400000;
    if (daysSince < minDaysGone) continue;
    candidates.push({ userId, ...data, daysSinceVisit: Math.round(daysSince) });
  }

  if (candidates.length === 0) return [];

  // Fetch profiles, loyalty cards, and follows for engagement scoring
  const userIds = candidates.map(c => c.userId);
  const [{ data: profiles }, { data: loyaltyCards }, { data: follows }, { data: beerLogCounts }] = await Promise.all([
    (service as any).from("profiles").select("id, display_name, username, avatar_url").in("id", userIds).limit(500),
    (service as any).from("loyalty_cards").select("user_id").eq("brewery_id", breweryId).in("user_id", userIds).limit(500),
    (service as any).from("brewery_follows").select("user_id").eq("brewery_id", breweryId).in("user_id", userIds).limit(500),
    (service as any).from("beer_logs").select("user_id").in("user_id", userIds).limit(50000),
  ]);

  const profileMap = new Map<string, any>((profiles ?? []).map((p: any) => [p.id, p]));
  const loyaltySet = new Set((loyaltyCards ?? []).map((lc: any) => lc.user_id));
  const followSet = new Set((follows ?? []).map((f: any) => f.user_id));
  const beerCountMap = new Map<string, number>();
  for (const bl of beerLogCounts ?? []) {
    beerCountMap.set(bl.user_id, (beerCountMap.get(bl.user_id) ?? 0) + 1);
  }

  // Fetch brewery name for templates
  const { data: brewery } = await (service as any)
    .from("breweries")
    .select("name")
    .eq("id", breweryId)
    .single();
  const breweryName = brewery?.name ?? "our brewery";

  // Score and rank
  const result: WinBackCandidate[] = candidates
    .map(c => {
      const profile = profileMap.get(c.userId);
      if (!profile) return null;

      const factors: EngagementFactors = {
        visits: c.visits,
        lastVisitDate: c.lastVisit,
        beersLogged: beerCountMap.get(c.userId) ?? 0,
        avgRating: null,
        hasLoyaltyCard: loyaltySet.has(c.userId),
        isFollowing: followSet.has(c.userId),
      };
      const engagementScore = computeEngagementScore(factors);
      const segment = computeSegment(c.visits);
      const { action, template } = getWinBackTemplate(segment, breweryName);

      return {
        userId: c.userId,
        displayName: profile.display_name ?? profile.username,
        username: profile.username ?? "",
        avatarUrl: profile.avatar_url,
        visits: c.visits,
        lastVisit: c.lastVisit,
        daysSinceVisit: c.daysSinceVisit,
        engagementScore,
        segment,
        suggestedAction: action,
        messageTemplate: template,
      } satisfies WinBackCandidate;
    })
    .filter((c): c is WinBackCandidate => c !== null)
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, limit);

  return result;
}
