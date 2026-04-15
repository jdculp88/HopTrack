# REQ-101 — Supabase Realtime (Tap Lists, Presence)
**Status:** ✅ Complete · **Sprint:** 156 · **Backfilled:** 2026-04-15

## Summary
Supabase Realtime channels for live tap list updates and "Drinking Now" presence.

## Acceptance Criteria
- [x] Realtime channel for tap list changes.
- [x] Presence channel for drinkers currently at a brewery.
- [x] Trending content powered by realtime aggregations.
- [x] Session OG image generation.

## Implementation
- Primary: [hooks/useRealtime](../../hooks/), [lib/](../../lib/)
- Realtime hook: [lib/realtime-hook](../../lib/)

## Tests
- Unit: [realtime-hook.test.ts](../../lib/__tests__/realtime-hook.test.ts)

## History
- Retro: [sprint-156-retro.md](../history/retros/sprint-156-retro.md)

## See also
- [architecture/realtime.md](../architecture/realtime.md)
