# REQ-118 — HopRoute Concierge (Taste Fingerprint)
**Status:** ✅ Complete · **Sprint:** 178 · **Backfilled:** 2026-04-15

## Summary
The Concierge — HopRoute smart concierge with taste fingerprint, brewery scoring, walking distances, concierge knowledge base. Migration 120. +24 tests.

## Acceptance Criteria
- [x] Taste fingerprint computed per drinker.
- [x] Brewery scoring blends fingerprint + context.
- [x] Walking-distance metric on recommendations.
- [x] Concierge knowledge base seeded.
- [x] Migration 120.

## Implementation
- Primary: [lib/hop-route-concierge](../../lib/)
- Migration: [supabase/migrations/120_*](../../supabase/migrations/)

## Tests
- Unit: [hop-route-concierge.test.ts](../../lib/__tests__/hop-route-concierge.test.ts)

## History
- Retro: [sprint-178-retro.md](../history/retros/sprint-178-retro.md)

## See also
- [REQ-086](REQ-086-hoproute-phase1.md) · [architecture/intelligence-layer.md](../architecture/intelligence-layer.md)
