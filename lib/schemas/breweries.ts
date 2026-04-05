/**
 * Brewery schemas — Sprint 158 (Zod migration)
 */

import { z } from "zod";
import { optionalString } from "./common";

/** GET /api/breweries query params */
export const brewerySearchSchema = z.object({
  q: optionalString,
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  state: optionalString,
});

export type BrewerySearch = z.infer<typeof brewerySearchSchema>;
