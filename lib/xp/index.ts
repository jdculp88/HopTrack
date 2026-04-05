// Copyright 2026 HopTrack. All rights reserved.
// Active XP values used by session-end API
export const SESSION_XP = {
  session_start: 25,
  per_beer: 15,
  per_rating: 10,
  first_visit_bonus: 50,
  three_plus_beers_bonus: 25,
} as const;

export const LEVELS = [
  { level: 1,  name: "Hop Curious",       xp_required: 0 },
  { level: 2,  name: "Tasting Notes",     xp_required: 100 },
  { level: 3,  name: "Draft Dweller",     xp_required: 250 },
  { level: 4,  name: "Brew Buddy",        xp_required: 500 },
  { level: 5,  name: "Regular",           xp_required: 1000 },
  { level: 6,  name: "Pint Pilgrim",      xp_required: 1750 },
  { level: 7,  name: "Tap Room Traveler", xp_required: 2750 },
  { level: 8,  name: "Craft Connoisseur", xp_required: 4000 },
  { level: 9,  name: "Brew Hound",        xp_required: 5500 },
  { level: 10, name: "Cask Master",       xp_required: 7500 },
  { level: 11, name: "Cellar Keeper",     xp_required: 10000 },
  { level: 12, name: "Grain & Glory",     xp_required: 13000 },
  { level: 13, name: "Fermentation Sage", xp_required: 16500 },
  { level: 14, name: "Yeast Whisperer",   xp_required: 20500 },
  { level: 15, name: "Liquid Librarian",  xp_required: 25000 },
  { level: 16, name: "Hop Alchemist",     xp_required: 30500 },
  { level: 17, name: "Brewmaster",        xp_required: 37000 },
  { level: 18, name: "Craft Legend",      xp_required: 44500 },
  { level: 19, name: "Hopvangelist",      xp_required: 53000 },
  { level: 20, name: "Grand Cicerone",    xp_required: 62500 },
] as const;

export function getLevelFromXP(xp: number): (typeof LEVELS)[number] {
  let current: (typeof LEVELS)[number] = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.xp_required) {
      current = level;
    } else {
      break;
    }
  }
  return current;
}

export function getNextLevel(currentLevel: number): (typeof LEVELS)[number] | null {
  const next = LEVELS.find((l) => l.level === currentLevel + 1);
  return next ?? null;
}

export function getLevelProgress(xp: number): {
  current: (typeof LEVELS)[number];
  next: (typeof LEVELS)[number] | null;
  progress: number; // 0-100
  xpToNext: number;
} {
  const current = getLevelFromXP(xp);
  const next = getNextLevel(current.level);

  if (!next) {
    return { current, next: null, progress: 100, xpToNext: 0 };
  }

  const xpInLevel = xp - current.xp_required;
  const xpNeeded = next.xp_required - current.xp_required;
  const progress = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));
  const xpToNext = next.xp_required - xp;

  return { current, next, progress, xpToNext };
}

// Variable XP rewards (Sprint 161 — The Vibe)
// Applied once per session to the total XP to create a WOW moment.
// Distribution: 94% normal (±20% variance), 5% lucky (2×), 1% golden (5×).
export type XpTier = "normal" | "lucky" | "golden";

export function rollXpMultiplier(): { multiplier: number; tier: XpTier } {
  const roll = Math.random();

  // 1% golden
  if (roll < 0.01) {
    return { multiplier: 5.0, tier: "golden" };
  }
  // 5% lucky (0.01 → 0.06)
  if (roll < 0.06) {
    return { multiplier: 2.0, tier: "lucky" };
  }
  // 94% normal: 0.8 to 1.2 (±20% variance)
  const variance = 0.8 + Math.random() * 0.4;
  return { multiplier: variance, tier: "normal" };
}

export function applyXpMultiplier(baseXp: number): {
  finalXp: number;
  tier: XpTier;
  multiplier: number;
} {
  const { multiplier, tier } = rollXpMultiplier();
  const finalXp = Math.round(baseXp * multiplier);
  return { finalXp, tier, multiplier };
}

