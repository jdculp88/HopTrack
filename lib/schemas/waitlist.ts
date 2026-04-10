/**
 * Waitlist schema — Sprint 174 (The Coming Soon)
 *
 * Validates payloads from the public hoptrack.beer waitlist form.
 * Used by POST /api/waitlist/subscribe.
 */

import { z } from "zod";
import { US_STATES } from "@/lib/brewery-utils";

const stateValues = US_STATES.map((s) => s.value) as [string, ...string[]];

export const waitlistSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Enter a valid email")
      .max(254, "Email is too long"),
    city: z.string().trim().min(1, "City is required").max(100, "City is too long"),
    state: z.enum(stateValues, { message: "Pick a state" }),
    audience_type: z.enum(["user", "brewery"]),
    brewery_name: z
      .string()
      .trim()
      .max(100, "Brewery name is too long")
      .optional()
      .nullable(),
    // Honeypot — must be empty. Bots that fill every field will trip this.
    website: z.string().max(0).optional().nullable(),
  })
  .refine(
    (d) =>
      d.audience_type !== "brewery" ||
      (d.brewery_name != null && d.brewery_name.length > 0),
    { message: "Brewery name is required", path: ["brewery_name"] }
  );

export type WaitlistInput = z.infer<typeof waitlistSchema>;
