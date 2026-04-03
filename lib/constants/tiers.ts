/**
 * Tier & achievement styling constants — Sprint 134 (The Tidy)
 *
 * Consolidates tier colors, styles, and rank styles that were duplicated
 * across AchievementBadge, AchievementFeedCard, LeaderboardRow, and
 * LeaderboardClient (6+ files).
 */

// ─── Achievement Tier Colors ────────────────────────────────────────────────

export const TIER_COLORS: Record<string, string> = {
  bronze: "var(--badge-bronze)",
  silver: "var(--badge-silver)",
  gold: "var(--badge-gold)",
  platinum: "#8BAABF",
} as const;

// ─── Achievement Tier Full Styles (ring, glow, label) ───────────────────────

export interface TierStyle {
  ring: string;
  glow: string;
  label: string;
  color: string;
}

export const TIER_STYLES: Record<string, TierStyle> = {
  bronze: {
    ring: "ring-2",
    glow: "shadow-[0_0_12px_rgba(160,120,80,0.3)]",
    label: "Bronze",
    color: "var(--badge-bronze)",
  },
  silver: {
    ring: "ring-2",
    glow: "shadow-[0_0_12px_rgba(138,144,152,0.3)]",
    label: "Silver",
    color: "var(--badge-silver)",
  },
  gold: {
    ring: "ring-2",
    glow: "shadow-[0_0_12px_rgba(200,148,58,0.4)]",
    label: "Gold",
    color: "var(--badge-gold)",
  },
  platinum: {
    ring: "ring-2",
    glow: "shadow-[0_0_16px_rgba(139,170,191,0.5)]",
    label: "Platinum",
    color: "#8BAABF",
  },
} as const;

// ─── Leaderboard Rank Styles ────────────────────────────────────────────────

export interface RankStyle {
  bg: string;
  text: string;
  label: string;
}

export const RANK_STYLES: Record<number, RankStyle> = {
  1: {
    bg: "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
    text: "var(--accent-gold)",
    label: "\u{1F947}",  // 🥇
  },
  2: {
    bg: "color-mix(in srgb, #C0C0C0 15%, transparent)",
    text: "#C0C0C0",
    label: "\u{1F948}",  // 🥈
  },
  3: {
    bg: "color-mix(in srgb, #CD7F32 15%, transparent)",
    text: "#CD7F32",
    label: "\u{1F949}",  // 🥉
  },
} as const;

// ─── Achievement Category Labels ────────────────────────────────────────────

export const CATEGORY_LABELS: Record<string, string> = {
  explorer: "Explorer",
  variety: "Variety",
  social: "Social",
  loyalty: "Loyalty",
  streak: "Streak",
  milestone: "Milestone",
  seasonal: "Seasonal",
  special: "Special",
  quantity: "Quantity",
  time: "Time",
  quality: "Quality",
} as const;
