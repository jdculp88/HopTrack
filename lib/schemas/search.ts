/**
 * Search schemas — Sprint 158 (Zod migration)
 */

import { z } from "zod";

/** GET /api/search query params */
export const searchQuerySchema = z.object({
  q: z.string().min(1),
  limit: z.coerce.number().int().min(1).max(20).default(8),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;
