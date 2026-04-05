/**
 * Beer schemas — Sprint 158 (Zod migration)
 */

import { z } from "zod";
import { uuid, optionalString } from "./common";

/** GET /api/beers query params */
export const beerSearchSchema = z.object({
  q: optionalString,
  brewery_id: uuid.optional(),
  style: optionalString,
  item_type: optionalString,
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type BeerSearch = z.infer<typeof beerSearchSchema>;
