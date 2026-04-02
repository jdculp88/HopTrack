// Brand CRM — Cross-Location Customer Intelligence
// Sprint 129 — The Transfer
// Extends lib/crm.ts with multi-location aggregation for brand owners

import {
  computeSegment,
  computeEngagementScore,
  getSegmentConfig,
  getEngagementLevel,
  type CustomerSegment,
  type SegmentConfig,
} from "@/lib/crm";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface BrandCustomerRow {
  userId: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  totalVisits: number;
  locationsVisited: number;
  locationNames: string[];
  lastVisit: string;
  firstVisit: string;
  segment: CustomerSegment;
  segmentConfig: SegmentConfig;
  engagementScore: number;
  isCrossLocation: boolean;
}

export interface LocationBreakdown {
  breweryId: string;
  breweryName: string;
  visits: number;
  beersLogged: number;
  firstVisit: string;
  lastVisit: string;
  favoriteBeer: string | null;
}

export interface JourneyEntry {
  sessionId: string;
  breweryId: string;
  breweryName: string;
  startedAt: string;
  endedAt: string | null;
  beerCount: number;
  topBeer: string | null;
}

export interface BrandCustomerProfile {
  userId: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  segment: CustomerSegment;
  segmentConfig: SegmentConfig;
  engagementScore: number;
  engagementLevel: string;
  isCrossLocation: boolean;
  stats: {
    totalVisits: number;
    locationsVisited: number;
    totalBeersLogged: number;
    avgRating: number | null;
    firstVisit: string | null;
    lastVisit: string | null;
  };
  locationBreakdown: LocationBreakdown[];
  journeyTimeline: JourneyEntry[];
  topStyles: { style: string; count: number }[];
  topBeers: { name: string; count: number; rating: number | null }[];
  brandLoyaltyCard: {
    stamps: number;
    lifetimeStamps: number;
    lastStampBreweryName: string | null;
  } | null;
}

export interface RegularsInsight {
  userId: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  strongLocations: string[];
  missingLocations: string[];
}

// ─── Input Types ────────────────────────────────────────────────────────────

interface BreweryVisitRow {
  user_id: string;
  brewery_id: string;
  total_visits: number;
  unique_beers_tried: number;
  first_visit_at: string;
  last_visit_at: string;
}

interface ProfileRow {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
}

interface SessionRow {
  id: string;
  brewery_id: string;
  started_at: string;
  ended_at: string | null;
}

interface BeerLogRow {
  beer_id: string;
  brewery_id: string;
  beer_name: string;
  beer_style: string;
  rating: number;
  quantity: number;
}

interface BrandLoyaltyCardRow {
  stamps: number;
  lifetime_stamps: number;
  last_stamp_brewery_id: string | null;
}

// ─── Functions ──────────────────────────────────────────────────────────────

/**
 * Build a brand-wide customer list from brewery_visits across all locations.
 * Pure function — no DB calls.
 */
export function buildBrandCustomerList(
  breweryVisits: BreweryVisitRow[],
  profiles: ProfileRow[],
  locationMap: Map<string, string>,
  brandLoyaltyCards?: { user_id: string; stamps: number }[]
): BrandCustomerRow[] {
  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  const loyaltyMap = new Map((brandLoyaltyCards ?? []).map((c) => [c.user_id, c]));

  // Group visits by user
  const userVisits = new Map<string, BreweryVisitRow[]>();
  for (const v of breweryVisits) {
    const existing = userVisits.get(v.user_id);
    if (existing) {
      existing.push(v);
    } else {
      userVisits.set(v.user_id, [v]);
    }
  }

  const rows: BrandCustomerRow[] = [];

  for (const [userId, visits] of userVisits) {
    const profile = profileMap.get(userId);
    if (!profile) continue;

    const totalVisits = visits.reduce((sum, v) => sum + v.total_visits, 0);
    const locationNames = visits
      .map((v) => locationMap.get(v.brewery_id))
      .filter(Boolean) as string[];
    const locationsVisited = new Set(visits.map((v) => v.brewery_id)).size;

    // Earliest first visit, latest last visit across all locations
    const allFirstVisits = visits.map((v) => v.first_visit_at).filter(Boolean);
    const allLastVisits = visits.map((v) => v.last_visit_at).filter(Boolean);
    const firstVisit = allFirstVisits.sort()[0] ?? "";
    const lastVisit = allLastVisits.sort().reverse()[0] ?? "";

    const segment = computeSegment(totalVisits);
    const segmentConfig = getSegmentConfig(totalVisits);
    const loyaltyCard = loyaltyMap.get(userId);

    const engagementScore = computeEngagementScore({
      visits: totalVisits,
      lastVisitDate: lastVisit || null,
      beersLogged: visits.reduce((sum, v) => sum + v.unique_beers_tried, 0),
      avgRating: null,
      hasLoyaltyCard: !!loyaltyCard,
      isFollowing: false,
    });

    rows.push({
      userId,
      displayName: profile.display_name ?? profile.username ?? "Guest",
      username: profile.username ?? "",
      avatarUrl: profile.avatar_url,
      totalVisits,
      locationsVisited,
      locationNames,
      lastVisit,
      firstVisit,
      segment,
      segmentConfig,
      engagementScore,
      isCrossLocation: locationsVisited >= 2,
    });
  }

  return rows;
}

/**
 * Build a full cross-location customer profile.
 * Pure function — no DB calls.
 */
export function buildBrandCustomerProfile(data: {
  profile: ProfileRow;
  sessions: SessionRow[];
  beerLogs: BeerLogRow[];
  breweryVisits: BreweryVisitRow[];
  brandLoyaltyCard: BrandLoyaltyCardRow | null;
  locationMap: Map<string, string>;
}): BrandCustomerProfile {
  const { profile, sessions, beerLogs, breweryVisits, brandLoyaltyCard, locationMap } = data;

  const totalVisits = sessions.length;
  const locationIds = new Set(sessions.map((s) => s.brewery_id));
  const locationsVisited = locationIds.size;

  // Stats
  const totalBeersLogged = beerLogs.reduce((sum, l) => sum + (l.quantity ?? 1), 0);
  const ratings = beerLogs.filter((l) => l.rating > 0).map((l) => l.rating);
  const avgRating =
    ratings.length > 0
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
      : null;

  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
  );
  const lastVisit = sortedSessions[0]?.started_at ?? null;
  const firstVisit = sortedSessions[sortedSessions.length - 1]?.started_at ?? null;

  // Location breakdown from brewery_visits (pre-aggregated)
  const beerLogsByLocation = new Map<string, BeerLogRow[]>();
  for (const log of beerLogs) {
    const existing = beerLogsByLocation.get(log.brewery_id);
    if (existing) existing.push(log);
    else beerLogsByLocation.set(log.brewery_id, [log]);
  }

  const locationBreakdown: LocationBreakdown[] = breweryVisits.map((v) => {
    const locLogs = beerLogsByLocation.get(v.brewery_id) ?? [];
    // Favorite beer at this location
    const beerCounts: Record<string, { name: string; count: number }> = {};
    for (const l of locLogs) {
      if (!beerCounts[l.beer_id]) beerCounts[l.beer_id] = { name: l.beer_name, count: 0 };
      beerCounts[l.beer_id].count += l.quantity ?? 1;
    }
    const favBeer = Object.values(beerCounts).sort((a, b) => b.count - a.count)[0]?.name ?? null;

    return {
      breweryId: v.brewery_id,
      breweryName: locationMap.get(v.brewery_id) ?? "Unknown",
      visits: v.total_visits,
      beersLogged: locLogs.reduce((sum, l) => sum + (l.quantity ?? 1), 0),
      firstVisit: v.first_visit_at,
      lastVisit: v.last_visit_at,
      favoriteBeer: favBeer,
    };
  }).sort((a, b) => b.visits - a.visits);

  // Journey timeline — sessions with beer info, sorted chronologically (newest first)
  const sessionBeerMap = new Map<string, BeerLogRow[]>();
  // Beer logs don't have session_id in our input, but we have brewery_id + timestamps
  // Group beer logs by session: match on brewery_id and find the session they belong to
  // Actually, we'll count beers per session using the session start/end window
  // Simpler: just show beer count per session from beerLogs grouped by brewery_id
  const journeyTimeline: JourneyEntry[] = sortedSessions.slice(0, 30).map((s) => {
    // Count beers for this session — we approximate by matching brewery_id
    // In practice, the server page passes session-specific beer counts
    const locLogs = beerLogsByLocation.get(s.brewery_id) ?? [];
    return {
      sessionId: s.id,
      breweryId: s.brewery_id,
      breweryName: locationMap.get(s.brewery_id) ?? "Unknown",
      startedAt: s.started_at,
      endedAt: s.ended_at,
      beerCount: 0, // Will be enriched by the server page with actual per-session data
      topBeer: null,
    };
  });

  // Top styles across all locations
  const styleCounts: Record<string, number> = {};
  for (const l of beerLogs) {
    if (l.beer_style) {
      styleCounts[l.beer_style] = (styleCounts[l.beer_style] ?? 0) + (l.quantity ?? 1);
    }
  }
  const topStyles = Object.entries(styleCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([style, count]) => ({ style, count }));

  // Top beers across all locations
  const beerMap: Record<string, { name: string; count: number; totalRating: number; ratedCount: number }> = {};
  for (const l of beerLogs) {
    if (!beerMap[l.beer_id]) {
      beerMap[l.beer_id] = { name: l.beer_name, count: 0, totalRating: 0, ratedCount: 0 };
    }
    beerMap[l.beer_id].count += l.quantity ?? 1;
    if (l.rating > 0) {
      beerMap[l.beer_id].totalRating += l.rating;
      beerMap[l.beer_id].ratedCount += 1;
    }
  }
  const topBeers = Object.values(beerMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((b) => ({
      name: b.name,
      count: b.count,
      rating: b.ratedCount > 0 ? Math.round((b.totalRating / b.ratedCount) * 10) / 10 : null,
    }));

  const segment = computeSegment(totalVisits);
  const segmentConfig = getSegmentConfig(totalVisits);
  const engagementScore = computeEngagementScore({
    visits: totalVisits,
    lastVisitDate: lastVisit,
    beersLogged: totalBeersLogged,
    avgRating,
    hasLoyaltyCard: !!brandLoyaltyCard,
    isFollowing: false,
  });

  return {
    userId: profile.id,
    displayName: profile.display_name ?? profile.username ?? "Guest",
    username: profile.username ?? "",
    avatarUrl: profile.avatar_url,
    segment,
    segmentConfig,
    engagementScore,
    engagementLevel: getEngagementLevel(engagementScore),
    isCrossLocation: locationsVisited >= 2,
    stats: {
      totalVisits,
      locationsVisited,
      totalBeersLogged,
      avgRating,
      firstVisit,
      lastVisit,
    },
    locationBreakdown,
    journeyTimeline,
    topStyles,
    topBeers,
    brandLoyaltyCard: brandLoyaltyCard
      ? {
          stamps: brandLoyaltyCard.stamps,
          lifetimeStamps: brandLoyaltyCard.lifetime_stamps,
          lastStampBreweryName: brandLoyaltyCard.last_stamp_brewery_id
            ? locationMap.get(brandLoyaltyCard.last_stamp_brewery_id) ?? null
            : null,
        }
      : null,
  };
}

/**
 * Find customers who are Power/VIP at one location but haven't visited others.
 * Great for cross-location promotion targeting.
 */
export function findRegularsAtOtherLocations(
  breweryVisits: BreweryVisitRow[],
  profiles: ProfileRow[],
  allLocationIds: string[],
  locationMap: Map<string, string>
): RegularsInsight[] {
  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  // Group visits by user
  const userVisits = new Map<string, BreweryVisitRow[]>();
  for (const v of breweryVisits) {
    const existing = userVisits.get(v.user_id);
    if (existing) existing.push(v);
    else userVisits.set(v.user_id, [v]);
  }

  const insights: RegularsInsight[] = [];

  for (const [userId, visits] of userVisits) {
    // Must have at least one Power/VIP location (5+ visits at a single location)
    const strongLocations = visits
      .filter((v) => v.total_visits >= 5)
      .map((v) => locationMap.get(v.brewery_id))
      .filter(Boolean) as string[];

    if (strongLocations.length === 0) continue;

    // Find locations they haven't visited
    const visitedLocationIds = new Set(visits.map((v) => v.brewery_id));
    const missingLocations = allLocationIds
      .filter((id) => !visitedLocationIds.has(id))
      .map((id) => locationMap.get(id))
      .filter(Boolean) as string[];

    if (missingLocations.length === 0) continue;

    const profile = profileMap.get(userId);
    if (!profile) continue;

    insights.push({
      userId,
      displayName: profile.display_name ?? profile.username ?? "Guest",
      username: profile.username ?? "",
      avatarUrl: profile.avatar_url,
      strongLocations,
      missingLocations,
    });
  }

  return insights.sort((a, b) => b.strongLocations.length - a.strongLocations.length);
}
