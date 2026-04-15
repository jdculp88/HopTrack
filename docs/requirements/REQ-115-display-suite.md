# REQ-115 — Display Suite Foundation
**Status:** ✅ Complete · **Sprint:** 175 · **Backfilled:** 2026-04-15

## Summary
Display Suite foundation — 4 new libs (tier-gates, display-scale, themes, fonts), migration 110 queued (11 brewery cols), BoardHeader -45%, full Slideshow rewrite to match reference mockup. Grid + Poster formats retired.

## Acceptance Criteria
- [x] `tier-gates`, `display-scale`, `themes`, `fonts` libs created.
- [x] Migration 110 adds 11 brewery display columns.
- [x] BoardHeader shrunk 45%.
- [x] Slideshow rewritten to match reference.
- [x] Grid and Poster formats deprecated.

## Implementation
- Primary: [lib/tier-gates](../../lib/), [lib/board-display-scale](../../lib/), [lib/board-themes](../../lib/)

## Tests
- Unit: [board-display-scale.test.ts](../../lib/__tests__/board-display-scale.test.ts), [board-themes.test.ts](../../lib/__tests__/board-themes.test.ts), [tier-gates.test.ts](../../lib/__tests__/tier-gates.test.ts)

## History
- Retro: [sprint-175-retro.md](../history/retros/sprint-175-retro.md)

## See also
- [REQ-109](REQ-109-board-display-formats.md)
