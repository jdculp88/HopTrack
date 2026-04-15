# REQ-105 — Consumer IA Restructure (PillTabs, Explore modes)
**Status:** ✅ Complete · **Sprint:** 160 · **Backfilled:** 2026-04-15

## Summary
Consumer app IA rebuild — PillTabs primitive + 2 hooks, Profile 4 tabs (Activity / Stats / Lists / Breweries), Explore 4 modes (Near Me / Trending / Following / Styles), Brewery 5 sticky tabs, hero shrink, Liquid Glass MinimizedSessionBar.

## Acceptance Criteria
- [x] PillTabs primitive with URL sync.
- [x] `useTabUrlSync` and `useScrollMemory` hooks.
- [x] Profile 4-tab layout.
- [x] Explore 4-mode layout + 2 new API endpoints.
- [x] Brewery page with 5 sticky tabs.
- [x] MinimizedSessionBar with liquid-glass effect.

## Implementation
- Primary: [components/PillTabs](../../components/), [hooks/useTabUrlSync](../../hooks/), [hooks/useScrollMemory](../../hooks/)

## Tests
- Unit: [pill-tabs.test.tsx](../../lib/__tests__/pill-tabs.test.tsx)

## History
- Retro: [sprint-160-retro.md](../history/retros/sprint-160-retro.md)
