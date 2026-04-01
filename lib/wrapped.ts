/**
 * HopTrack Wrapped — Year-in-Review data engine
 * Sprint 84 — The Wrap
 *
 * Aggregates a user's beer journey into shareable stats.
 * Extends PintRewind patterns with date-range filtering.
 */

import { LEVELS } from "@/lib/xp";
import { getStyleVars } from "@/lib/beerStyleColors";

// ─── Types ──────────────────────────────────────────────────────

export interface WrappedStats {
  period: { start: string; end: string; label: string };
  totalSessions: number;
  totalBeers: number;
  uniqueBeers: number;
  uniqueBreweries: number;
  uniqueStyles: number;
  topBrewery: { name: string; city: string | null; visits: number } | null;
  topBeer: { name: string; brewery: string | null; count: number } | null;
  topStyle: { style: string; count: number } | null;
  personality: { archetype: string; emoji: string; tagline: string };
  avgRating: number | null;
  ratingPersonality: string;
  longestStreak: number;
  xpEarned: number;
  level: { level: number; title: string };
  achievementsUnlocked: number;
  friendsMade: number;
  citiesVisited: string[];
  adventurerScore: number;
  homeSessions: number;
  brewerySessions: number;
  legendarySession: { beerCount: number; breweryName: string } | null;
}

// ─── Personality archetypes ─────────────────────────────────────

const ARCHETYPES: Record<string, { archetype: string; emoji: string; tagline: string }> = {
  "IPA":             { archetype: "The Hophead",            emoji: "🌿", tagline: "If it's not bitter, it's not better" },
  "Double IPA":      { archetype: "The Hophead",            emoji: "🌿", tagline: "Double the hops, double the glory" },
  "Hazy IPA":        { archetype: "The Haze Chaser",        emoji: "🌫️", tagline: "Juice is the truth" },
  "Session IPA":     { archetype: "The Hophead",            emoji: "🌿", tagline: "Low ABV, high standards" },
  "Stout":           { archetype: "The Dark Arts",          emoji: "🌑", tagline: "Life's too short for light beer" },
  "Imperial Stout":  { archetype: "The Dark Arts",          emoji: "🌑", tagline: "Thick, dark, and unapologetic" },
  "Porter":          { archetype: "The Dark Arts",          emoji: "🌑", tagline: "Roasted roots run deep" },
  "Sour":            { archetype: "The Sour Seeker",        emoji: "⚡", tagline: "Pucker up — complexity is the point" },
  "Gose":            { archetype: "The Sour Seeker",        emoji: "⚡", tagline: "Salt, sour, and everything after" },
  "Berliner Weisse": { archetype: "The Sour Seeker",        emoji: "⚡", tagline: "The tart side of craft" },
  "Lager":           { archetype: "The Purist",             emoji: "✨", tagline: "Clean lines. Crisp finish. No compromises" },
  "Pilsner":         { archetype: "The Purist",             emoji: "✨", tagline: "Simplicity is the ultimate sophistication" },
  "Wheat":           { archetype: "The Easy Drinker",       emoji: "🌾", tagline: "Smooth, light, always right" },
  "Hefeweizen":      { archetype: "The Easy Drinker",       emoji: "🌾", tagline: "Banana and clove, all day long" },
  "Belgian":         { archetype: "The Belgian Explorer",   emoji: "🏰", tagline: "Complexity brewed over centuries" },
  "Saison":          { archetype: "The Farmhouse Fan",      emoji: "🌾", tagline: "Rustic, dry, and full of character" },
  "Amber":           { archetype: "The All-Rounder",        emoji: "🍺", tagline: "Balanced in all things" },
  "Red Ale":         { archetype: "The All-Rounder",        emoji: "🍺", tagline: "Malt forward, heart forward" },
  "Pale Ale":        { archetype: "The All-Rounder",        emoji: "🍺", tagline: "The gateway that never gets old" },
  "Blonde Ale":      { archetype: "The Easy Drinker",       emoji: "☀️", tagline: "Sunshine in a glass" },
  "Cream Ale":       { archetype: "The Easy Drinker",       emoji: "☀️", tagline: "Smooth as it gets" },
  "Barleywine":      { archetype: "The Heavy Hitter",       emoji: "🥊", tagline: "Go big or go home" },
  "Kolsch":          { archetype: "The Purist",             emoji: "✨", tagline: "Cologne's finest export" },
  "Cider":           { archetype: "The Orchard Explorer",   emoji: "🍎", tagline: "Apples, pressed with purpose" },
  "Mead":            { archetype: "The Time Traveler",      emoji: "🍯", tagline: "Ancient drink, modern soul" },
};

const DEFAULT_PERSONALITY = { archetype: "The Explorer", emoji: "🧭", tagline: "Every pour is a new adventure" };

export function getWrappedPersonality(topStyle: string | null, uniqueStyles: number): { archetype: string; emoji: string; tagline: string } {
  if (!topStyle) return DEFAULT_PERSONALITY;
  if (uniqueStyles >= 10) {
    return { archetype: "The Renaissance Drinker", emoji: "🎨", tagline: "Why pick one style when you can try them all?" };
  }
  return ARCHETYPES[topStyle] ?? DEFAULT_PERSONALITY;
}

export function getRatingPersonality(avgRating: number | null): string {
  if (avgRating === null) return "The Silent Sipper";
  if (avgRating >= 4.5) return "The Eternal Optimist";
  if (avgRating >= 4.0) return "The Generous Critic";
  if (avgRating >= 3.5) return "The Fair Judge";
  if (avgRating >= 3.0) return "The Honest Reviewer";
  if (avgRating >= 2.5) return "The Tough Crowd";
  return "The Brutal Critic";
}

export function getLevelTitle(level: number): string {
  return LEVELS.find(l => l.level === level)?.name ?? "Beer Enthusiast";
}

// Total possible styles for adventurer score
const TOTAL_STYLES = 26;

export function getAdventurerScore(uniqueStyles: number): number {
  return Math.min(100, Math.round((uniqueStyles / TOTAL_STYLES) * 100));
}

export function getShareText(stats: WrappedStats, username: string): string {
  const parts = [
    `My HopTrack Wrapped: "${stats.personality.archetype}" ${stats.personality.emoji}`,
    `${stats.totalBeers} beers across ${stats.uniqueBreweries} breweries`,
    stats.topStyle ? `Top style: ${stats.topStyle.style}` : null,
    `Level ${stats.level.level}: ${stats.level.title}`,
    `See yours at hoptrack.beer/wrapped`,
  ].filter(Boolean);
  return parts.join(" · ");
}

export function getWrappedColors(topStyle: string | null): { c1: string; c2: string; c3: string } {
  if (!topStyle) {
    return { c1: "var(--accent-gold)", c2: "var(--accent-amber)", c3: "var(--accent-gold)" };
  }
  const vars = getStyleVars(topStyle);
  return { c1: vars.primary, c2: vars.light, c3: vars.soft };
}
