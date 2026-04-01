// CRM — Customer Intelligence for Brewery Owners
// Sprint 89 — The Rolodex
// Single source of truth for customer segments, engagement scoring, and profiles

// ─── Segment Definitions ─────────────────────────────────────────────────────

export type CustomerSegment = "vip" | "power" | "regular" | "new";

export interface SegmentConfig {
  id: CustomerSegment;
  label: string;
  minVisits: number;
  maxVisits: number | null;
  color: string;
  bgColor: string;
  emoji: string;
  description: string;
}

export const SEGMENTS: SegmentConfig[] = [
  {
    id: "vip",
    label: "VIP",
    minVisits: 10,
    maxVisits: null,
    color: "var(--accent-gold)",
    bgColor: "rgba(212,168,67,0.15)",
    emoji: "👑",
    description: "Loyal regulars who visit 10+ times",
  },
  {
    id: "power",
    label: "Power",
    minVisits: 5,
    maxVisits: 9,
    color: "#a78bfa",
    bgColor: "rgba(167,139,250,0.15)",
    emoji: "⚡",
    description: "Engaged customers with 5-9 visits",
  },
  {
    id: "regular",
    label: "Regular",
    minVisits: 2,
    maxVisits: 4,
    color: "#60a5fa",
    bgColor: "rgba(96,165,250,0.15)",
    emoji: "🍺",
    description: "Returning customers with 2-4 visits",
  },
  {
    id: "new",
    label: "New",
    minVisits: 1,
    maxVisits: 1,
    color: "#4ade80",
    bgColor: "rgba(74,222,128,0.15)",
    emoji: "🌱",
    description: "First-time visitors",
  },
];

/** Get segment config by visit count */
export function computeSegment(visits: number): CustomerSegment {
  if (visits >= 10) return "vip";
  if (visits >= 5) return "power";
  if (visits >= 2) return "regular";
  return "new";
}

/** Get full segment config for a visit count */
export function getSegmentConfig(visits: number): SegmentConfig {
  const segmentId = computeSegment(visits);
  return SEGMENTS.find(s => s.id === segmentId)!;
}

/** Get segment config by ID */
export function getSegmentById(id: CustomerSegment): SegmentConfig {
  return SEGMENTS.find(s => s.id === id)!;
}

// ─── Engagement Scoring ──────────────────────────────────────────────────────

export interface EngagementFactors {
  visits: number;
  lastVisitDate: string | null;
  beersLogged: number;
  avgRating: number | null;
  hasLoyaltyCard: boolean;
  isFollowing: boolean;
}

/**
 * Compute engagement score 0-100 from multiple signals.
 *
 * Weights:
 *   - Frequency (visits):   35 pts — capped at 30 visits
 *   - Recency:              30 pts — decays over 90 days
 *   - Depth (beers logged): 15 pts — capped at 50 beers
 *   - Loyalty:              10 pts — has active loyalty card
 *   - Connection:           10 pts — follows the brewery
 */
export function computeEngagementScore(factors: EngagementFactors): number {
  // Frequency: 0-35 pts (linear up to 30 visits)
  const frequencyScore = Math.min(factors.visits / 30, 1) * 35;

  // Recency: 0-30 pts (full points if visited today, decays to 0 at 90 days)
  let recencyScore = 0;
  if (factors.lastVisitDate) {
    const daysSinceVisit = Math.max(
      0,
      (Date.now() - new Date(factors.lastVisitDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    recencyScore = Math.max(0, 1 - daysSinceVisit / 90) * 30;
  }

  // Depth: 0-15 pts (linear up to 50 beers)
  const depthScore = Math.min(factors.beersLogged / 50, 1) * 15;

  // Loyalty: 0 or 10 pts
  const loyaltyScore = factors.hasLoyaltyCard ? 10 : 0;

  // Connection: 0 or 10 pts
  const connectionScore = factors.isFollowing ? 10 : 0;

  return Math.round(frequencyScore + recencyScore + depthScore + loyaltyScore + connectionScore);
}

/** Human-readable engagement level */
export function getEngagementLevel(score: number): string {
  if (score >= 80) return "Champion";
  if (score >= 60) return "Engaged";
  if (score >= 40) return "Warming Up";
  if (score >= 20) return "Casual";
  return "New Face";
}

// ─── Customer Profile ────────────────────────────────────────────────────────

export interface CustomerProfile {
  userId: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  segment: CustomerSegment;
  segmentConfig: SegmentConfig;
  engagementScore: number;
  engagementLevel: string;
  stats: {
    totalVisits: number;
    totalBeersLogged: number;
    uniqueBeers: number;
    avgRating: number | null;
    firstVisit: string | null;
    lastVisit: string | null;
  };
  topStyles: { style: string; count: number }[];
  topBeers: { name: string; count: number; rating: number | null }[];
  hasLoyaltyCard: boolean;
  loyaltyStamps: number;
  isFollowing: boolean;
}

/**
 * Build a customer profile from raw data.
 * This runs server-side — call from RSC or API route.
 */
export function buildCustomerProfile(data: {
  profile: { id: string; display_name: string; username: string; avatar_url: string | null };
  sessions: { id: string; started_at: string; ended_at: string | null }[];
  beerLogs: { beer_id: string; beer_name: string; beer_style: string; rating: number; quantity: number }[];
  loyaltyCard: { stamps_earned: number } | null;
  isFollowing: boolean;
}): CustomerProfile {
  const { profile, sessions, beerLogs, loyaltyCard, isFollowing } = data;

  const totalVisits = sessions.length;
  const totalBeersLogged = beerLogs.reduce((sum, l) => sum + (l.quantity ?? 1), 0);
  const uniqueBeers = new Set(beerLogs.map(l => l.beer_id)).size;
  const ratings = beerLogs.filter(l => l.rating > 0).map(l => l.rating);
  const avgRating = ratings.length > 0
    ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
    : null;

  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
  );
  const lastVisit = sortedSessions[0]?.started_at ?? null;
  const firstVisit = sortedSessions[sortedSessions.length - 1]?.started_at ?? null;

  // Top styles
  const styleCounts: Record<string, number> = {};
  beerLogs.forEach(l => {
    if (l.beer_style) {
      styleCounts[l.beer_style] = (styleCounts[l.beer_style] ?? 0) + (l.quantity ?? 1);
    }
  });
  const topStyles = Object.entries(styleCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([style, count]) => ({ style, count }));

  // Top beers
  const beerMap: Record<string, { name: string; count: number; totalRating: number; ratedCount: number }> = {};
  beerLogs.forEach(l => {
    if (!beerMap[l.beer_id]) {
      beerMap[l.beer_id] = { name: l.beer_name, count: 0, totalRating: 0, ratedCount: 0 };
    }
    beerMap[l.beer_id].count += l.quantity ?? 1;
    if (l.rating > 0) {
      beerMap[l.beer_id].totalRating += l.rating;
      beerMap[l.beer_id].ratedCount += 1;
    }
  });
  const topBeers = Object.values(beerMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(b => ({
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
    hasLoyaltyCard: !!loyaltyCard,
    isFollowing,
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
    stats: {
      totalVisits,
      totalBeersLogged,
      uniqueBeers,
      avgRating,
      firstVisit,
      lastVisit,
    },
    topStyles,
    topBeers,
    hasLoyaltyCard: !!loyaltyCard,
    loyaltyStamps: loyaltyCard?.stamps_earned ?? 0,
    isFollowing,
  };
}
