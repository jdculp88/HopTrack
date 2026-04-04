/**
 * Superadmin Brewery Detail — data fetching engine
 * Sprint 140 — The Bridge
 *
 * Accepts a Supabase service client and returns all data needed
 * for the brewery account detail page. Mirrors the pattern in
 * lib/superadmin-metrics.ts — single Promise.all, typed result.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  calculateBreweryKPIs,
  calculateBreweryKPISparklines,
  type BreweryKPIs,
  type BreweryKPISparklines,
} from "@/lib/kpi";

// ── Types ──────────────────────────────────────────────────────────────

export interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  verified: boolean;
  propagated_from_brand: boolean;
  created_at: string;
  profile: {
    display_name: string | null;
    username: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
}

export interface TapListSnapshot {
  totalBeers: number;
  onTap: number;
  styles: { name: string; count: number }[];
}

export interface LoyaltySummary {
  active: boolean;
  programName: string | null;
  stampsRequired: number | null;
  cardsIssued: number;
  totalRedemptions: number;
}

export interface TimelineItem {
  id: string;
  type: "session" | "review" | "follow";
  actor: string;
  actorAvatar: string | null;
  detail: string;
  timestamp: string;
}

export interface AdminAction {
  id: string;
  action_type: string;
  notes: string | null;
  created_at: string;
  admin_user_id: string;
}

export interface BreweryDetailData {
  brewery: any;
  brand: any | null;
  team: TeamMember[];
  kpis: BreweryKPIs;
  sparklines: BreweryKPISparklines;
  tapList: TapListSnapshot;
  loyalty: LoyaltySummary;
  timeline: TimelineItem[];
  adminActions: AdminAction[];
  totalSessions: number;
  totalFollowers: number;
  uniqueVisitors: number;
}

// ── Main fetch function ────────────────────────────────────────────────

export async function fetchBreweryDetail(
  service: SupabaseClient,
  breweryId: string
): Promise<BreweryDetailData | null> {
  // ── Parallel fetch (14 queries) ──────────────────────────────────────
  const [
    { data: brewery },
    { data: teamRaw },
    { data: allSessions },
    { data: allBeerLogs },
    { data: beers },
    { data: breweryVisits },
    { data: loyaltyProgram },
    { data: loyaltyCardsRaw },
    { data: loyaltyRedemptions },
    { data: followersRaw },
    { data: recentSessions },
    { data: recentReviews },
    { data: recentFollows },
    { data: adminActionsRaw },
  ] = await Promise.all([
    // 1. Brewery profile with brand join
    service
      .from("breweries")
      .select("*, brand:brewery_brands(id, name, slug, logo_url)")
      .eq("id", breweryId)
      .maybeSingle() as any,

    // 2. Team: brewery_accounts + profiles
    service
      .from("brewery_accounts")
      .select("id, user_id, role, verified, propagated_from_brand, created_at, profile:profiles(display_name, username, email, avatar_url)")
      .eq("brewery_id", breweryId)
      .order("created_at", { ascending: true }) as any,

    // 3. All sessions (for KPIs)
    service
      .from("sessions")
      .select("id, user_id, started_at, ended_at, is_active")
      .eq("brewery_id", breweryId)
      .eq("is_active", false)
      .limit(10000) as any,

    // 4. All beer logs (for KPIs)
    service
      .from("beer_logs")
      .select("id, beer_id, user_id, rating, quantity, logged_at, session_id, beer:beers(name, style, abv, created_at)")
      .eq("brewery_id", breweryId)
      .limit(10000) as any,

    // 5. Beers (tap list snapshot)
    service
      .from("beers")
      .select("id, name, style, is_on_tap, created_at")
      .eq("brewery_id", breweryId)
      .limit(500) as any,

    // 6. Brewery visits (visitor KPIs)
    service
      .from("brewery_visits")
      .select("user_id, total_visits")
      .eq("brewery_id", breweryId)
      .limit(1000) as any,

    // 7. Active loyalty program
    service
      .from("loyalty_programs")
      .select("id, name, stamps_required, is_active")
      .eq("brewery_id", breweryId)
      .eq("is_active", true)
      .maybeSingle() as any,

    // 8. Loyalty cards count
    service
      .from("loyalty_cards")
      .select("user_id")
      .eq("brewery_id", breweryId) as any,

    // 9. Loyalty redemptions
    service
      .from("loyalty_redemptions")
      .select("id, redeemed_at")
      .eq("brewery_id", breweryId) as any,

    // 10. All followers (for KPIs + count)
    service
      .from("brewery_follows")
      .select("id, created_at")
      .eq("brewery_id", breweryId) as any,

    // 11. Recent sessions (timeline) — last 10 with profile
    service
      .from("sessions")
      .select("id, user_id, started_at, ended_at, profile:profiles(display_name, username, avatar_url), beer_logs(id)")
      .eq("brewery_id", breweryId)
      .eq("is_active", false)
      .order("started_at", { ascending: false })
      .limit(10) as any,

    // 12. Recent reviews (timeline) — last 10 with profile
    service
      .from("brewery_reviews")
      .select("id, rating, comment, created_at, profile:profiles!user_id(display_name, username, avatar_url)")
      .eq("brewery_id", breweryId)
      .order("created_at", { ascending: false })
      .limit(10) as any,

    // 13. Recent follows (timeline) — last 5 with profile
    service
      .from("brewery_follows")
      .select("id, created_at, profile:profiles!user_id(display_name, username, avatar_url)")
      .eq("brewery_id", breweryId)
      .order("created_at", { ascending: false })
      .limit(5) as any,

    // 14. Admin action history
    service
      .from("admin_actions")
      .select("id, action_type, notes, created_at, admin_user_id")
      .eq("target_type", "brewery")
      .eq("target_id", breweryId)
      .order("created_at", { ascending: false })
      .limit(20) as any,
  ]);

  if (!brewery) return null;

  // ── Process team ─────────────────────────────────────────────────────
  const team: TeamMember[] = ((teamRaw as any[]) ?? []).map((a: any) => ({
    id: a.id,
    user_id: a.user_id,
    role: a.role ?? "staff",
    verified: a.verified ?? false,
    propagated_from_brand: a.propagated_from_brand ?? false,
    created_at: a.created_at,
    profile: a.profile ?? null,
  }));

  // ── Calculate KPIs ───────────────────────────────────────────────────
  const sessions = (allSessions as any[]) ?? [];
  const beerLogs = (allBeerLogs as any[]) ?? [];
  const visits = (breweryVisits as any[]) ?? [];
  const loyaltyCards = (loyaltyCardsRaw as any[]) ?? [];
  const redemptions = (loyaltyRedemptions as any[]) ?? [];
  const followers = (followersRaw as any[]) ?? [];
  const beerList = (beers as any[]) ?? [];

  // Build profile lookup for top customer
  const userIds = [...new Set(sessions.map((s: any) => s.user_id).filter(Boolean))];
  const profiles: Record<string, { display_name?: string; username?: string }> = {};
  if (userIds.length > 0) {
    const { data: profilesRaw } = await service
      .from("profiles")
      .select("id, display_name, username")
      .in("id", userIds.slice(0, 100)) as any;
    for (const p of (profilesRaw as any[]) ?? []) {
      profiles[p.id] = { display_name: p.display_name, username: p.username };
    }
  }

  const kpis = calculateBreweryKPIs({
    sessions,
    beerLogs,
    breweryVisits: visits,
    loyaltyCards,
    loyaltyRedemptions: redemptions,
    followers,
    beers: beerList,
    profiles,
  });

  const sparklines = calculateBreweryKPISparklines({ sessions, beerLogs });

  // ── Tap list snapshot ────────────────────────────────────────────────
  const styleCounts: Record<string, number> = {};
  for (const b of beerList) {
    if (b.style) styleCounts[b.style] = (styleCounts[b.style] ?? 0) + 1;
  }
  const tapList: TapListSnapshot = {
    totalBeers: beerList.length,
    onTap: beerList.filter((b: any) => b.is_on_tap).length,
    styles: Object.entries(styleCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count })),
  };

  // ── Loyalty summary ──────────────────────────────────────────────────
  const loyalty: LoyaltySummary = {
    active: !!loyaltyProgram,
    programName: (loyaltyProgram as any)?.name ?? null,
    stampsRequired: (loyaltyProgram as any)?.stamps_required ?? null,
    cardsIssued: loyaltyCards.length,
    totalRedemptions: redemptions.length,
  };

  // ── Build timeline ───────────────────────────────────────────────────
  const timeline: TimelineItem[] = [];

  for (const s of (recentSessions as any[]) ?? []) {
    const profile = s.profile;
    const name = profile?.display_name ?? profile?.username ?? "Anonymous";
    const logCount = s.beer_logs?.length ?? 0;
    timeline.push({
      id: s.id,
      type: "session",
      actor: name,
      actorAvatar: profile?.avatar_url ?? null,
      detail: `Checked in${logCount > 0 ? ` — ${logCount} beer${logCount > 1 ? "s" : ""}` : ""}`,
      timestamp: s.started_at,
    });
  }

  for (const r of (recentReviews as any[]) ?? []) {
    const profile = r.profile;
    const name = profile?.display_name ?? profile?.username ?? "Anonymous";
    timeline.push({
      id: r.id,
      type: "review",
      actor: name,
      actorAvatar: profile?.avatar_url ?? null,
      detail: `Left a ${r.rating}-star review`,
      timestamp: r.created_at,
    });
  }

  for (const f of (recentFollows as any[]) ?? []) {
    const profile = f.profile;
    const name = profile?.display_name ?? profile?.username ?? "Anonymous";
    timeline.push({
      id: f.id,
      type: "follow",
      actor: name,
      actorAvatar: profile?.avatar_url ?? null,
      detail: "Started following",
      timestamp: f.created_at,
    });
  }

  // Sort by timestamp descending
  timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Unique visitors
  const uniqueVisitors = new Set(sessions.map((s: any) => s.user_id).filter(Boolean)).size;

  return {
    brewery,
    brand: (brewery as any)?.brand ?? null,
    team,
    kpis,
    sparklines,
    tapList,
    loyalty,
    timeline: timeline.slice(0, 15),
    adminActions: (adminActionsRaw as any[]) ?? [],
    totalSessions: sessions.length,
    totalFollowers: followers.length,
    uniqueVisitors,
  };
}
