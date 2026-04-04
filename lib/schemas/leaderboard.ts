/**
 * Leaderboard schemas — Sprint 157 (The Engagement Engine)
 */

import { z } from "zod";
import { timeRange, paginationParams } from "./common";

/** GET /api/leaderboard query params */
export const leaderboardQuerySchema = z.object({
  category: z.enum(["xp", "checkins", "styles", "breweries", "streak"]).default("xp"),
  scope: z.enum(["global", "friends", "city"]).default("global"),
  timeRange: timeRange,
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type LeaderboardQuery = z.infer<typeof leaderboardQuerySchema>;

/** Leaderboard categories with display labels */
export const LEADERBOARD_CATEGORIES = [
  { id: "xp", label: "XP", icon: "Zap" },
  { id: "checkins", label: "Check-ins", icon: "Beer" },
  { id: "styles", label: "Styles", icon: "Palette" },
  { id: "breweries", label: "Breweries", icon: "MapPin" },
  { id: "streak", label: "Streak", icon: "Flame" },
] as const;
