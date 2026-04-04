/**
 * Shared Zod schemas — Sprint 157 (The Engagement Engine)
 *
 * Common validation types reused across multiple API routes.
 */

import { z } from "zod";

/** UUID v4 string */
export const uuid = z.string().uuid("Must be a valid UUID");

/** Pagination params from query string (string → number coercion) */
export const paginationParams = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

/** Time range for analytics and leaderboard queries */
export const timeRange = z.enum(["week", "month", "all"]).default("month");

/** Sort order */
export const sortOrder = z.enum(["asc", "desc"]).default("desc");

/** Trimmed non-empty string */
export const requiredString = z.string().trim().min(1, "This field is required");

/** Optional trimmed string (empty → undefined) */
export const optionalString = z.string().trim().optional().transform((v) => v || undefined);

/** Boolean that also accepts "true"/"false" strings (for query params) */
export const booleanParam = z
  .union([z.boolean(), z.enum(["true", "false"])])
  .transform((v) => v === true || v === "true")
  .default(true);

/** Latitude (-90 to 90) */
export const latitude = z.number().min(-90).max(90);

/** Longitude (-180 to 180) */
export const longitude = z.number().min(-180).max(180);
