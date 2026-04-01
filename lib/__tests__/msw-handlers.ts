/**
 * MSW request handlers for Supabase REST API — Sprint 105 (The Test Wall)
 * Intercepts Supabase PostgREST calls in tests so no real network is needed.
 *
 * Supabase REST endpoints follow the pattern:
 *   https://<project>.supabase.co/rest/v1/<table>
 *
 * We match on the pathname only (wildcard origin) so tests work with any
 * NEXT_PUBLIC_SUPABASE_URL value or the placeholder used in CI.
 */
import { http, HttpResponse } from "msw";
import {
  createMockUser,
  createMockBrewery,
  createMockBeer,
  createMockSession,
  createMockBeerLog,
} from "./factories";

// ─── Handler definitions ──────────────────────────────────────────────────────

export const handlers = [
  // GET /rest/v1/profiles
  http.get(/\/rest\/v1\/profiles/, () => {
    return HttpResponse.json([createMockUser()]);
  }),

  // GET /rest/v1/breweries
  http.get(/\/rest\/v1\/breweries/, () => {
    return HttpResponse.json([createMockBrewery()]);
  }),

  // GET /rest/v1/beers
  http.get(/\/rest\/v1\/beers/, () => {
    return HttpResponse.json([createMockBeer()]);
  }),

  // POST /rest/v1/sessions
  http.post(/\/rest\/v1\/sessions/, () => {
    return HttpResponse.json(createMockSession(), { status: 201 });
  }),

  // GET /rest/v1/beer_logs
  http.get(/\/rest\/v1\/beer_logs/, () => {
    return HttpResponse.json([createMockBeerLog()]);
  }),
];
