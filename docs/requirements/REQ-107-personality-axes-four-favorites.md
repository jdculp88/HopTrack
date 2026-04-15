# REQ-107 — Personality Axes + Four Favorites
**Status:** ✅ Complete · **Sprint:** 162 · **Backfilled:** 2026-04-15

## Summary
4-axis personality model, Four Favorites card, half-star ratings, percentile buckets, Your Round redesign, 4 OG story cards. Closed the Facelift arc.

## Acceptance Criteria
- [x] 4-axis personality computation per drinker.
- [x] Four Favorites top-row card.
- [x] Half-star rating input.
- [x] Percentile bucket display.
- [x] Your Round card redesigned.
- [x] 4 OG story card templates.
- [x] Migrations shipped.

## Implementation
- Primary: [lib/personality](../../lib/), [lib/percentiles](../../lib/), [lib/your-round](../../lib/)

## Tests
- Unit: [personality.test.ts](../../lib/__tests__/personality.test.ts), [personality-axis-labels.test.ts](../../lib/__tests__/personality-axis-labels.test.ts), [percentiles.test.ts](../../lib/__tests__/percentiles.test.ts), [your-round.test.ts](../../lib/__tests__/your-round.test.ts)

## History
- Retro: [sprint-162-retro.md](../history/retros/sprint-162-retro.md)

## See also
- [REQ-088](REQ-088-your-round.md) *(earlier Your Round)*
