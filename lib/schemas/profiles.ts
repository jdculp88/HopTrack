/**
 * Profile schemas — Sprint 157 (The Engagement Engine)
 */

import { z } from "zod";

/** Lowercase alphanumeric + underscore, sanitized on parse */
const username = z
  .string()
  .trim()
  .min(2, "Username must be at least 2 characters")
  .max(30, "Username must be 30 characters or less")
  .transform((v) => v.toLowerCase().replace(/[^a-z0-9_]/g, ""));

/** PATCH /api/profiles — update current user's profile */
export const profileUpdateSchema = z.object({
  display_name: z.string().trim().min(1).max(100).optional(),
  username: username.optional(),
  bio: z.string().trim().max(500).optional(),
  home_city: z.string().trim().max(100).optional(),
  avatar_url: z.string().url().optional().or(z.literal("")),
  is_public: z.boolean().optional(),
  notification_preferences: z.record(z.string(), z.boolean()).optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
