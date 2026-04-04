/**
 * Session schemas — Sprint 157 (The Engagement Engine)
 */

import { z } from "zod";
import { uuid, optionalString, booleanParam, latitude, longitude } from "./common";

/** POST /api/sessions — start a new session */
export const sessionCreateSchema = z
  .object({
    brewery_id: uuid.optional(),
    share_to_feed: booleanParam,
    note: optionalString,
    context: z.enum(["brewery", "home"]).default("brewery"),
    session_latitude: latitude.optional(),
    session_longitude: longitude.optional(),
  })
  .refine(
    (data) => !(data.context === "brewery" && !data.brewery_id),
    { message: "brewery_id is required for brewery sessions", path: ["brewery_id"] }
  );

export type SessionCreateInput = z.infer<typeof sessionCreateSchema>;
