/**
 * lib/hop-route.ts
 * HopRoute AI prompt builder, context assembly, scoring, and output parser.
 * Sprint 39 — HopRoute Phase 1
 * Sprint 178 — Smart Concierge upgrade (taste fingerprint, brewery scoring, distance metrics)
 */

import { haversineDistance } from "@/lib/geo";
import type { PersonalityResult } from "@/lib/personality";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface HopRouteBeer {
  id: string;
  name: string;
  style: string | null;
  abv?: number | null;
  avg_rating?: number | null;
  aroma_notes?: string[];
  taste_notes?: string[];
  finish_notes?: string[];
  is_wishlisted?: boolean;
  is_trending?: boolean;
  pour_sizes?: Array<{ name: string; oz: number; price: number }>;
}

export interface HopRouteBrewery {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  brewery_type: string | null;
  is_sponsored?: boolean;
  vibe_tags?: string[];
  relevance_score?: number;
  relevance_reasons?: string[];
  description?: string | null;
  visit_history?: { total_visits: number; last_visit_display: string; unique_beers_tried: number } | null;
  friend_activity?: Array<{ friend_name: string; beer_name: string; rating: number; when_display: string }>;
  top_beers?: HopRouteBeer[];
}

export interface HopRouteInput {
  location: { lat: number; lng: number; city: string };
  time_window: { start: string; end: string };
  stop_count: number; // 2-5
  group_size: "solo" | "couple" | "small" | "large";
  vibe: string[];
  transport: "walking" | "rideshare" | "driving";
  taste_dna?: Array<{ style: string; avg_rating: number }>;
  taste_fingerprint?: TasteFingerprint;
  social_context?: Array<{ brewery_id: string; brewery_name: string; friend_name: string; visit_count: number }>;
  breweries: HopRouteBrewery[];
}

export interface HopRouteStop {
  brewery_id: string;
  stop_order: number;
  arrival_time: string;
  departure_time: string;
  travel_to_next_minutes: number;
  recommended_beers: Array<{ beer_id: string | null; name: string; reason: string }>;
  reasoning_text: string;
  social_context: string | null;
  is_sponsored: boolean;
}

export interface HopRouteOutput {
  title: string;
  stops: HopRouteStop[];
}

// ─── Taste Fingerprint ──────────────────────────────────────────────────────

export interface TasteFingerprint {
  topStyles: Array<{ style: string; avgRating: number; count: number }>;
  topAromaNotes: string[];
  topTasteNotes: string[];
  topFinishNotes: string[];
  topFlavorTags: string[];
  abvRange: { min: number; max: number; avg: number };
  personalityCode: string;
  personalityArchetype: string;
  explorationMode: "variety" | "reliable";
  intensityPreference: "bold" | "smooth";
}

export interface BeerLogWithSensory {
  rating: number | null;
  beer: {
    style: string | null;
    abv: number | null;
    aroma_notes: string[] | null;
    taste_notes: string[] | null;
    finish_notes: string[] | null;
  } | null;
}

export interface BeerReviewRow {
  rating: number | null;
  flavor_tags: string[] | null;
}

/**
 * Builds a rich taste fingerprint from the user's beer log history, reviews,
 * and personality result. Used to personalize HopRoute recommendations.
 */
export function computeTasteFingerprint(
  beerLogs: BeerLogWithSensory[],
  reviews: BeerReviewRow[],
  personality: PersonalityResult,
): TasteFingerprint {
  // Filter to beers rated >= 3.5 (the "liked" beers)
  const likedLogs = beerLogs.filter(
    (l) => typeof l.rating === "number" && l.rating >= 3.5 && l.beer,
  );

  // Top styles by avg rating (from all rated logs, not just liked)
  const styleMap = new Map<string, { total: number; count: number }>();
  for (const log of beerLogs) {
    const style = log.beer?.style;
    if (!style || typeof log.rating !== "number") continue;
    const existing = styleMap.get(style) ?? { total: 0, count: 0 };
    styleMap.set(style, { total: existing.total + log.rating, count: existing.count + 1 });
  }
  const topStyles = Array.from(styleMap.entries())
    .map(([style, { total, count }]) => ({ style, avgRating: Math.round((total / count) * 10) / 10, count }))
    .sort((a, b) => b.avgRating - a.avgRating || b.count - a.count)
    .slice(0, 8);

  // Sensory note frequency from liked beers
  const aromaFreq = new Map<string, number>();
  const tasteFreq = new Map<string, number>();
  const finishFreq = new Map<string, number>();

  for (const log of likedLogs) {
    for (const note of log.beer?.aroma_notes ?? []) {
      aromaFreq.set(note, (aromaFreq.get(note) ?? 0) + 1);
    }
    for (const note of log.beer?.taste_notes ?? []) {
      tasteFreq.set(note, (tasteFreq.get(note) ?? 0) + 1);
    }
    for (const note of log.beer?.finish_notes ?? []) {
      finishFreq.set(note, (finishFreq.get(note) ?? 0) + 1);
    }
  }

  const topN = (freq: Map<string, number>, n: number) =>
    Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([note]) => note);

  // Flavor tags from reviews
  const tagFreq = new Map<string, number>();
  for (const review of reviews) {
    for (const tag of review.flavor_tags ?? []) {
      tagFreq.set(tag, (tagFreq.get(tag) ?? 0) + 1);
    }
  }

  // ABV range from liked beers
  const abvValues = likedLogs
    .map((l) => l.beer?.abv)
    .filter((v): v is number => typeof v === "number" && v > 0);

  const abvRange = abvValues.length > 0
    ? {
        min: Math.round(Math.min(...abvValues) * 10) / 10,
        max: Math.round(Math.max(...abvValues) * 10) / 10,
        avg: Math.round((abvValues.reduce((a, b) => a + b, 0) / abvValues.length) * 10) / 10,
      }
    : { min: 0, max: 0, avg: 0 };

  return {
    topStyles,
    topAromaNotes: topN(aromaFreq, 5),
    topTasteNotes: topN(tasteFreq, 5),
    topFinishNotes: topN(finishFreq, 5),
    topFlavorTags: topN(tagFreq, 5),
    abvRange,
    personalityCode: personality.code,
    personalityArchetype: personality.archetype,
    explorationMode: personality.axes.variety === "E" ? "variety" : "reliable",
    intensityPreference: personality.axes.hopIntensity === "B" ? "bold" : "smooth",
  };
}

// ─── Brewery Relevance Scoring ──────────────────────────────────────────────

export interface BreweryForScoring {
  id: string;
  name: string;
  vibe_tags: string[];
  on_tap_beer_ids: string[];
  on_tap_sensory_notes: string[]; // flattened aroma + taste + finish from all on-tap beers
  avg_tap_age_days: number; // avg days since on-tap beers were added
  recent_checkin_count: number; // check-ins in last 24h (trending signal)
}

export interface ScoringUserContext {
  personality: PersonalityResult;
  tasteFingerprintNotes: string[]; // top 10 combined sensory notes
  wishlistBeerIds: Set<string>;
  visitHistory: Map<string, { total_visits: number; last_visit_at: string | null }>;
  vibeFilters: string[];
}

export interface BreweryScore {
  score: number;
  reasons: string[];
}

/**
 * Pre-scores a brewery's relevance to a user before sending to Claude.
 * Returns a 0-100 score and human-readable reasons.
 */
export function scoreBreweryRelevance(
  brewery: BreweryForScoring,
  ctx: ScoringUserContext,
): BreweryScore {
  let score = 0;
  const reasons: string[] = [];

  // 1. Wishlist match (0-30) — strongest signal
  const wishlistMatches = brewery.on_tap_beer_ids.filter((id) => ctx.wishlistBeerIds.has(id));
  if (wishlistMatches.length > 0) {
    score += Math.min(30, wishlistMatches.length * 15);
    reasons.push(`${wishlistMatches.length} wishlisted beer${wishlistMatches.length > 1 ? "s" : ""} on tap`);
  }

  // 2. Taste profile overlap (0-20) — how well on-tap beers match user's sensory preferences
  if (ctx.tasteFingerprintNotes.length > 0 && brewery.on_tap_sensory_notes.length > 0) {
    const noteSet = new Set(brewery.on_tap_sensory_notes.map((n) => n.toLowerCase()));
    const matches = ctx.tasteFingerprintNotes.filter((n) => noteSet.has(n.toLowerCase()));
    const overlap = matches.length / ctx.tasteFingerprintNotes.length;
    const points = Math.round(overlap * 20);
    if (points > 0) {
      score += points;
      reasons.push(`Flavor profile match (${matches.slice(0, 3).join(", ")})`);
    }
  }

  // 3. Visit history fit (0-15) — Explorer → prefer new; Loyalist → prefer revisits
  const visit = ctx.visitHistory.get(brewery.id);
  const isExplorer = ctx.personality.axes.variety === "E";
  if (isExplorer) {
    if (!visit) {
      score += 15;
      reasons.push("New brewery for you");
    } else if (visit.total_visits === 1) {
      score += 8;
    } else {
      score += 3;
    }
  } else {
    // Loyalist
    if (visit && visit.total_visits >= 2) {
      score += 15;
      reasons.push("One of your favorites");
    } else if (visit) {
      score += 10;
    } else {
      score += 5;
    }
  }

  // 4. Vibe match (0-15)
  if (ctx.vibeFilters.length > 0 && brewery.vibe_tags.length > 0) {
    const vibeSet = new Set(brewery.vibe_tags.map((v) => v.toLowerCase()));
    const vibeMatches = ctx.vibeFilters.filter((v) => vibeSet.has(v.toLowerCase()));
    const vibeScore = Math.round((vibeMatches.length / ctx.vibeFilters.length) * 15);
    if (vibeScore > 0) {
      score += vibeScore;
      if (vibeMatches.length > 0) {
        reasons.push(`Vibe match: ${vibeMatches.join(", ")}`);
      }
    }
  } else if (ctx.vibeFilters.length === 0) {
    // No vibe filter = neutral, give partial credit
    score += 7;
  }

  // 5. Tap freshness (0-10) — fresh tap lists score higher
  if (brewery.avg_tap_age_days > 0) {
    // 0-7 days = 10 pts, 7-14 days = 7 pts, 14-30 days = 4 pts, 30+ = 1 pt
    if (brewery.avg_tap_age_days <= 7) score += 10;
    else if (brewery.avg_tap_age_days <= 14) score += 7;
    else if (brewery.avg_tap_age_days <= 30) score += 4;
    else score += 1;
  }

  // 6. Trending boost (0-10) — recent activity
  if (brewery.recent_checkin_count > 0) {
    const trendPoints = Math.min(10, Math.round(Math.log2(brewery.recent_checkin_count + 1) * 3));
    score += trendPoints;
    if (trendPoints >= 5) {
      reasons.push("Trending right now");
    }
  }

  return { score: Math.min(100, score), reasons };
}

// ─── Route Distance Metrics ─────────────────────────────────────────────────

export interface RouteMetricsStop {
  brewery_id: string;
  stop_order: number;
  lat: number;
  lng: number;
}

export interface RouteLeg {
  from_order: number;
  to_order: number;
  distance_miles: number;
  walk_minutes: number;
}

export interface RouteMetrics {
  legs: RouteLeg[];
  total_distance_miles: number;
  avg_stop_distance_miles: number;
}

const WALKING_SPEED_MPH = 3.0;

/**
 * Computes straight-line (haversine) distances between consecutive stops
 * and estimates walking time at 3 mph.
 */
export function computeRouteMetrics(stops: RouteMetricsStop[]): RouteMetrics {
  const sorted = [...stops].sort((a, b) => a.stop_order - b.stop_order);
  const legs: RouteLeg[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const from = sorted[i];
    const to = sorted[i + 1];
    const distance_miles = Math.round(haversineDistance(from.lat, from.lng, to.lat, to.lng) * 100) / 100;
    const walk_minutes = Math.round((distance_miles / WALKING_SPEED_MPH) * 60);

    legs.push({
      from_order: from.stop_order,
      to_order: to.stop_order,
      distance_miles,
      walk_minutes,
    });
  }

  const total_distance_miles = Math.round(legs.reduce((sum, l) => sum + l.distance_miles, 0) * 100) / 100;
  const avg_stop_distance_miles = legs.length > 0
    ? Math.round((total_distance_miles / legs.length) * 100) / 100
    : 0;

  return { legs, total_distance_miles, avg_stop_distance_miles };
}

// ─── Prompt Builder ─────────────────────────────────────────────────────────

/** Build the system + user messages for Claude */
export function buildHopRoutePrompt(input: HopRouteInput): { system: string; user: string } {
  const vibeTagDesc = input.breweries.flatMap(b => b.vibe_tags ?? []);
  const uniqueVibes = [...new Set(vibeTagDesc)].slice(0, 10).join(", ");

  const hasRichData = input.breweries.some(b => b.relevance_score !== undefined);

  const system = `You are a craft beer expert, local guide, and the brains behind HopRoute — HopTrack's AI brewery crawl planner.
You plan brewery routes that feel like they were designed by the most knowledgeable regular at the best bar in town.
You know every taproom's personality, what to order first, and how to pace a crawl so everyone has a great time.

Rules:
- Return ONLY valid JSON matching the schema exactly — no markdown, no explanation
- Select exactly ${input.stop_count} breweries from the provided list
- Order stops geographically to minimize travel time given the transport mode
- Times must fit within the provided time window
- Each stop should be 45-90 minutes (beer + atmosphere)
- Prefer sponsored breweries slightly (max 1 per route, marked is_sponsored: true)
- Higher relevance_score breweries are better matches for this user — weight them accordingly
- "title" must be a catchy, memorable route name (3-6 words) that captures the mood or geography${uniqueVibes ? `\n- Vibe tags present in this area: ${uniqueVibes} — use these to color your reasoning_text` : ""}
${hasRichData ? `- reasoning_text should be 2-3 sentences. Reference SPECIFIC beers by name, mention sensory notes that match the user's taste fingerprint, call out friend activity, note if a beer is on the user's wishlist, and mention relevance_reasons
- For recommended_beers, the reason field should mention specific flavors: "Chocolate and coffee notes match your stout love" not just "Great stout"
- Reference visit history when present: "Your first time here" or "You've been here 3 times — they know your name"
- social_context should mention friend names and what they drank/rated when available` : `- reasoning_text should be 1-2 sentences, warm and personal — reference the user's top styles, the brewery's vibe tags, or friend activity
- social_context is null unless a friend has visited recently`}

JSON schema:
{
  "title": "string (catchy route name, 3-6 words)",
  "stops": [
    {
      "brewery_id": "uuid",
      "stop_order": 1,
      "arrival_time": "ISO 8601",
      "departure_time": "ISO 8601",
      "travel_to_next_minutes": 0,
      "recommended_beers": [{"beer_id": "uuid or null", "name": "string", "reason": "string"}],
      "reasoning_text": "string",
      "social_context": "string or null",
      "is_sponsored": false
    }
  ]
}`;

  // Build taste section — prefer fingerprint over legacy taste_dna
  let tasteSummary: string;
  if (input.taste_fingerprint) {
    const fp = input.taste_fingerprint;
    const styleLines = fp.topStyles.slice(0, 5).map(s => `${s.style} (${s.avgRating}★, ${s.count} pours)`).join(", ");
    const parts = [
      `User Taste Fingerprint:`,
      `- Personality: ${fp.personalityArchetype} (${fp.personalityCode}) — ${fp.explorationMode === "variety" ? "Explorer who seeks variety" : "Loyalist who knows what they like"}, ${fp.intensityPreference === "bold" ? "loves bold/hop-forward flavors" : "prefers smooth/balanced flavors"}`,
      `- Top styles: ${styleLines || "still exploring"}`,
    ];
    if (fp.topAromaNotes.length > 0) parts.push(`- Favorite aromas: ${fp.topAromaNotes.join(", ")}`);
    if (fp.topTasteNotes.length > 0) parts.push(`- Favorite tastes: ${fp.topTasteNotes.join(", ")}`);
    if (fp.topFinishNotes.length > 0) parts.push(`- Preferred finish: ${fp.topFinishNotes.join(", ")}`);
    if (fp.topFlavorTags.length > 0) parts.push(`- Flavor tags: ${fp.topFlavorTags.join(", ")}`);
    if (fp.abvRange.avg > 0) parts.push(`- ABV sweet spot: ${fp.abvRange.min}% - ${fp.abvRange.max}% (avg ${fp.abvRange.avg}%)`);
    parts.push(`- Mode: ${fp.explorationMode === "variety" ? "Variety seeker — prioritize breweries they HAVEN'T visited" : "Reliable picks — include breweries they already love"}`);
    tasteSummary = parts.join("\n");
  } else if (input.taste_dna?.length) {
    tasteSummary = `User's top styles: ${input.taste_dna.slice(0, 5).map(t => `${t.style} (${t.avg_rating.toFixed(1)}★)`).join(", ")}`;
  } else {
    tasteSummary = "No taste history yet — suggest approachable crowd-pleasers";
  }

  const socialSummary = input.social_context?.length
    ? `Friend activity: ${input.social_context.map(s => `${s.friend_name} visited ${s.brewery_name} ${s.visit_count}× recently`).join("; ")}`
    : "No recent friend activity";

  const groupDesc = {
    solo: "solo drinker",
    couple: "couple",
    small: "small group (3-5)",
    large: "large group (6+)",
  }[input.group_size];

  const vibeDesc = input.vibe.length ? input.vibe.join(", ") : "any vibe";

  // Build brewery list — use rich data when available
  const breweryList = input.breweries.map(b => {
    const entry: Record<string, unknown> = {
      id: b.id,
      name: b.name,
      type: b.brewery_type,
      lat: b.latitude,
      lng: b.longitude,
      vibe_tags: b.vibe_tags ?? [],
      is_sponsored: b.is_sponsored ?? false,
    };

    // Rich data fields (Track 3 & 4)
    if (b.relevance_score !== undefined) entry.relevance_score = b.relevance_score;
    if (b.relevance_reasons?.length) entry.relevance_reasons = b.relevance_reasons;
    if (b.description) entry.description = b.description.slice(0, 80);
    if (b.visit_history) entry.visit_history = b.visit_history;
    if (b.friend_activity?.length) entry.friend_activity = b.friend_activity.slice(0, 2);

    // Rich beer data (Track 4)
    if (b.top_beers?.length && b.top_beers[0].aroma_notes !== undefined) {
      entry.beers = b.top_beers.slice(0, 8).map((beer, i) => {
        const beerEntry: Record<string, unknown> = {
          id: beer.id,
          name: beer.name,
          style: beer.style,
        };
        if (beer.abv) beerEntry.abv = beer.abv;
        if (beer.avg_rating) beerEntry.avg_rating = beer.avg_rating;
        if (beer.aroma_notes?.length) beerEntry.aroma_notes = beer.aroma_notes.slice(0, 3);
        if (beer.taste_notes?.length) beerEntry.taste_notes = beer.taste_notes.slice(0, 3);
        if (beer.finish_notes?.length) beerEntry.finish_notes = beer.finish_notes.slice(0, 3);
        if (beer.is_wishlisted) beerEntry.is_wishlisted = true;
        if (beer.is_trending) beerEntry.is_trending = true;
        // Pour sizes for top 3 beers only (token budget)
        if (i < 3 && beer.pour_sizes?.length) beerEntry.pour_sizes = beer.pour_sizes;
        return beerEntry;
      });
    } else {
      entry.top_beers = (b.top_beers ?? []).map(beer => ({
        id: beer.id,
        name: beer.name,
        style: beer.style,
      }));
    }

    return entry;
  });

  const user = `Plan a HopRoute for a ${groupDesc} in ${input.location.city}.

Time window: ${input.time_window.start} to ${input.time_window.end}
Transport: ${input.transport}
Vibe: ${vibeDesc}
Stops requested: ${input.stop_count}

${tasteSummary}
${socialSummary}

Available breweries (${breweryList.length}):
${JSON.stringify(breweryList, null, 2)}

Return exactly ${input.stop_count} stops as valid JSON.`;

  return { system, user };
}

// ─── Sponsored Stop Enforcement ─────────────────────────────────────────────

/** Max 1 sponsored stop per route — enforced here */
export function enforceMaxOneSponsoredStop(stops: HopRouteStop[]): HopRouteStop[] {
  let sponsoredSeen = false;
  return stops.map(stop => {
    if (stop.is_sponsored) {
      if (sponsoredSeen) return { ...stop, is_sponsored: false };
      sponsoredSeen = true;
    }
    return stop;
  });
}
