export const XP_VALUES = {
  checkin: 10,
  new_beer: 5,
  new_brewery: 10,
  rating: 2,
  comment: 3,
  photo: 5,
  achievement_bronze: 50,
  achievement_silver: 100,
  achievement_gold: 200,
  achievement_platinum: 500,
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

export function calculateCheckinXP(opts: {
  hasRating: boolean;
  hasComment: boolean;
  hasPhoto: boolean;
  isNewBeer: boolean;
  isNewBrewery: boolean;
}): number {
  let total = XP_VALUES.checkin;
  if (opts.hasRating) total += XP_VALUES.rating;
  if (opts.hasComment) total += XP_VALUES.comment;
  if (opts.hasPhoto) total += XP_VALUES.photo;
  if (opts.isNewBeer) total += XP_VALUES.new_beer;
  if (opts.isNewBrewery) total += XP_VALUES.new_brewery;
  return total;
}
