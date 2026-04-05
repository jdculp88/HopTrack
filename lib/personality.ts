// Beer Personality — Sprint 162 (The Identity)
//
// Four-axis archetype system producing 16 named archetypes from existing
// beer_log + rating data. Identity expression layer for profile pages +
// shareable stat cards.
//
// IMPORTANT: This is a NEW system. It does NOT replace the single-style
// archetypes in lib/wrapped.ts or lib/pint-rewind.ts (those have 94+ test
// assertions and remain untouched). Use this for profile identity surfaces only.
//
// Axes:
//   Variety:       E (Explorer)  vs L (Loyalist)   — style breadth
//   Hop Intensity: B (Bold)      vs S (Smooth)     — hop-forward preference
//   Timing:        H (Hunter)    vs R (Regular)    — new vs repeat pours
//   Critique:      J (Judge)     vs O (Optimist)   — rating severity

import { getStyleFamily } from "./beerStyleColors";

// ─── Types ─────────────────────────────────────────────────────────────────

export type VarietyAxis = "E" | "L";
export type HopAxis = "B" | "S";
export type TimingAxis = "H" | "R";
export type CritiqueAxis = "J" | "O";

export interface PersonalityAxes {
  variety: VarietyAxis;
  hopIntensity: HopAxis;
  timing: TimingAxis;
  critique: CritiqueAxis;
}

export interface PersonalitySignals {
  varietyScore: number;    // uniqueStyles / max(totalBeers, 5)
  hopShare: number;        // hopForwardCount / totalBeers
  uniquenessRatio: number; // uniqueBeers / totalBeers
  avgRating: number | null;
  ratingStdDev: number | null;
  ratedCount: number;      // number of logs with a rating
  totalBeers: number;
  uniqueStyles: number;
  uniqueBeers: number;
}

export interface PersonalityResult {
  code: string;             // 4-letter code e.g. "EBHJ"
  archetype: string;        // e.g. "The Hop Hunter"
  emoji: string;
  tagline: string;
  axes: PersonalityAxes;
  signals: PersonalitySignals;
  hasEnoughData: boolean;   // false if totalBeers < 5
}

export interface PersonalityBeerLog {
  beer_id?: string | null;
  rating?: number | null;
  beer?: { id?: string | null; style?: string | null; item_type?: string | null } | null;
}

// ─── Thresholds ────────────────────────────────────────────────────────────

const MIN_BEERS_FOR_DATA = 5;
const VARIETY_THRESHOLD = 0.3;      // >= 30% unique styles per beer = Explorer
const HOP_THRESHOLD = 0.35;         // >= 35% hop-forward pours = Bold
const UNIQUENESS_THRESHOLD = 0.6;   // >= 60% unique beers = Hunter
const JUDGE_AVG_CEILING = 3.8;      // avg rating below this = Judge
const JUDGE_STDDEV_FLOOR = 0.9;     // stddev at or above this = Judge
const MIN_RATINGS_FOR_CRITIQUE = 3;

// ─── Signal computation ────────────────────────────────────────────────────

function computeSignals(logs: PersonalityBeerLog[]): PersonalitySignals {
  const totalBeers = logs.length;

  const styleSet = new Set<string>();
  const beerSet = new Set<string>();
  let hopForwardCount = 0;

  for (const log of logs) {
    const style = log.beer?.style;
    if (style) styleSet.add(style);

    const beerId = log.beer?.id ?? log.beer_id;
    if (beerId) beerSet.add(beerId);

    if (getStyleFamily(style, log.beer?.item_type) === "ipa") {
      hopForwardCount += 1;
    }
  }

  const uniqueStyles = styleSet.size;
  const uniqueBeers = beerSet.size;

  const ratedLogs = logs.filter(
    (l): l is PersonalityBeerLog & { rating: number } =>
      typeof l.rating === "number" && l.rating > 0,
  );
  let avgRating: number | null = null;
  let ratingStdDev: number | null = null;
  if (ratedLogs.length >= 1) {
    const sum = ratedLogs.reduce((acc, l) => acc + l.rating, 0);
    avgRating = sum / ratedLogs.length;
    const variance =
      ratedLogs.reduce((acc, l) => acc + Math.pow(l.rating - avgRating!, 2), 0) /
      ratedLogs.length;
    ratingStdDev = Math.sqrt(variance);
  }

  // Smooth variety score — prevents division noise at low beer counts.
  const varietyDenominator = Math.max(totalBeers, MIN_BEERS_FOR_DATA);
  const varietyScore = totalBeers === 0 ? 0 : uniqueStyles / varietyDenominator;

  const hopShare = totalBeers === 0 ? 0 : hopForwardCount / totalBeers;
  const uniquenessRatio = totalBeers === 0 ? 0 : uniqueBeers / totalBeers;

  return {
    varietyScore,
    hopShare,
    uniquenessRatio,
    avgRating,
    ratingStdDev,
    ratedCount: ratedLogs.length,
    totalBeers,
    uniqueStyles,
    uniqueBeers,
  };
}

function computeAxes(signals: PersonalitySignals): PersonalityAxes {
  const variety: VarietyAxis =
    signals.varietyScore >= VARIETY_THRESHOLD ? "E" : "L";

  const hopIntensity: HopAxis =
    signals.hopShare >= HOP_THRESHOLD ? "B" : "S";

  const timing: TimingAxis =
    signals.uniquenessRatio >= UNIQUENESS_THRESHOLD ? "H" : "R";

  // Critique needs enough ratings; default to Optimist otherwise.
  let critique: CritiqueAxis = "O";
  if (signals.ratedCount >= MIN_RATINGS_FOR_CRITIQUE && signals.avgRating !== null) {
    const toughAvg = signals.avgRating < JUDGE_AVG_CEILING;
    const wideRange =
      signals.ratingStdDev !== null && signals.ratingStdDev >= JUDGE_STDDEV_FLOOR;
    critique = toughAvg || wideRange ? "J" : "O";
  }

  return { variety, hopIntensity, timing, critique };
}

// ─── 16 Archetype Map ──────────────────────────────────────────────────────

interface ArchetypeEntry {
  archetype: string;
  emoji: string;
  tagline: string;
}

const ARCHETYPES: Record<string, ArchetypeEntry> = {
  // Explorer × Bold
  EBHJ: {
    archetype: "The Hop Hunter",
    emoji: "🎯",
    tagline: "Always chasing the next hop bomb — and calling it straight.",
  },
  EBHO: {
    archetype: "The Hazy Evangelist",
    emoji: "🌈",
    tagline: "Every new IPA is a celebration. Keep them coming.",
  },
  EBRJ: {
    archetype: "The Critical Connoisseur",
    emoji: "🔍",
    tagline: "Your IPA rotation is tight, your standards are tighter.",
  },
  EBRO: {
    archetype: "The Cheerful Explorer",
    emoji: "🌟",
    tagline: "Your hop favorites come back, and so does the smile.",
  },
  // Explorer × Smooth
  ESHJ: {
    archetype: "The Style Curator",
    emoji: "🎨",
    tagline: "New styles, sharp opinions, no wasted pours.",
  },
  ESHO: {
    archetype: "The Wanderer",
    emoji: "🧭",
    tagline: "Every style has a story, and you're collecting all of them.",
  },
  ESRJ: {
    archetype: "The Quiet Critic",
    emoji: "🤫",
    tagline: "Range across the board, but you don't hand out stars lightly.",
  },
  ESRO: {
    archetype: "The Renaissance Drinker",
    emoji: "🎭",
    tagline: "Anything on the menu. Everything gets a fair shake.",
  },
  // Loyalist × Bold
  LBHJ: {
    archetype: "The IPA Scholar",
    emoji: "📚",
    tagline: "You know your hops. You've compared every vintage.",
  },
  LBHO: {
    archetype: "The Hop Head",
    emoji: "🌿",
    tagline: "If it's not green and bitter, you're probably not drinking it.",
  },
  LBRJ: {
    archetype: "The IPA Purist",
    emoji: "💎",
    tagline: "One style. One rotation. Zero compromises.",
  },
  LBRO: {
    archetype: "The Daily Hop",
    emoji: "🍻",
    tagline: "Your IPA is waiting. The mug club knows your name.",
  },
  // Loyalist × Smooth
  LSHJ: {
    archetype: "The Lager Scholar",
    emoji: "📐",
    tagline: "Clean lines, new breweries, textbook judging.",
  },
  LSHO: {
    archetype: "The Clean Seeker",
    emoji: "✨",
    tagline: "A crisp lager from a new tap = perfect day.",
  },
  LSRJ: {
    archetype: "The Purist",
    emoji: "🍺",
    tagline: "A well-made classic. Anything less doesn't make the list.",
  },
  LSRO: {
    archetype: "The Loyal Local",
    emoji: "❤️",
    tagline: "Same bar. Same pour. Always a great night.",
  },
};

const DEFAULT_ARCHETYPE: ArchetypeEntry = {
  archetype: "The New Pour",
  emoji: "🌱",
  tagline: "Your beer story is just beginning.",
};

// ─── Main API ──────────────────────────────────────────────────────────────

/**
 * Computes a user's 4-letter Beer Personality archetype from their beer log history.
 * Pass all beer_logs for the user (joined with beers table for style + item_type).
 * Returns hasEnoughData=false if fewer than 5 beers logged.
 */
export function computePersonality(
  logs: PersonalityBeerLog[],
): PersonalityResult {
  const signals = computeSignals(logs);
  const axes = computeAxes(signals);
  const code = `${axes.variety}${axes.hopIntensity}${axes.timing}${axes.critique}`;
  const hasEnoughData = signals.totalBeers >= MIN_BEERS_FOR_DATA;

  const entry = hasEnoughData
    ? (ARCHETYPES[code] ?? DEFAULT_ARCHETYPE)
    : DEFAULT_ARCHETYPE;

  return {
    code: hasEnoughData ? code : "----",
    archetype: entry.archetype,
    emoji: entry.emoji,
    tagline: entry.tagline,
    axes,
    signals,
    hasEnoughData,
  };
}

/** Get archetype entry by 4-letter code. Returns default if code invalid. */
export function getArchetypeByCode(code: string): ArchetypeEntry {
  return ARCHETYPES[code] ?? DEFAULT_ARCHETYPE;
}

/** All 16 archetypes, indexed by code — for marketing / debugging. */
export function listAllArchetypes(): Array<{ code: string } & ArchetypeEntry> {
  return Object.entries(ARCHETYPES).map(([code, entry]) => ({ code, ...entry }));
}
