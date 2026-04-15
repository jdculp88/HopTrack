# REQ-109 — Board Display Formats
**Status:** ✅ Complete · **Sprint:** 167 · **Backfilled:** 2026-04-15

## Summary
5 display formats for The Board (TV display), Slideshow cinematic mode. Foundation for Display Suite in Sprint 175.

## Acceptance Criteria
- [x] 5 display-format options: standard, compact, detailed, minimal, slideshow.
- [x] Slideshow cinematic transitions.
- [x] Format picker in brewery admin.

## Implementation
- Primary: [app/(brewery)/board/](../../app/), [lib/board-settings](../../lib/)

## Tests
- Unit: [board-settings.test.ts](../../lib/__tests__/board-settings.test.ts), [board-themes.test.ts](../../lib/__tests__/board-themes.test.ts), [board-display-scale.test.ts](../../lib/__tests__/board-display-scale.test.ts)

## History
- Retro: [sprint-167-retro.md](../history/retros/sprint-167-retro.md)

## See also
- [REQ-006](REQ-006-tv-display.md) *(original Board)* · [REQ-115](REQ-115-display-suite.md) *(Sprint 175 foundation)*
