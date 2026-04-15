# REQ-090 — Smart Search (pg_trgm + Typeahead)
**Status:** ✅ Complete · **Sprints:** 114, 138 · **Backfilled:** 2026-04-15

## Summary
Trigram-backed search across breweries and beers, with typeahead autocomplete. Deployed globally in Sprint 138 (bartender sprint).

## Acceptance Criteria
- [x] Postgres `pg_trgm` extension enabled.
- [x] Typeahead search component deployed.
- [x] GlobalSearch component in consumer app.
- [x] SearchTypeahead used in brewery admin.

## Implementation
- Primary: [components/GlobalSearch](../../components/), [components/SearchTypeahead](../../components/)
- Server: [lib/](../../lib/), [supabase/migrations/](../../supabase/migrations/)

## Tests
- Unit: [sprint-138-bartender.test.ts](../../lib/__tests__/sprint-138-bartender.test.ts)

## History
- Retro: [sprint-138-retro.md](../history/retros/sprint-138-retro.md)
