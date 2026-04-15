# REQ-087 — Three-Tab Feed
**Status:** ✅ Complete · **Sprint:** 27 · **Backfilled:** 2026-04-15

## Summary
Consumer feed restructured into three tabs: Friends, Global, You. Shipped "Three-Tab Feed" sprint theme.

## Acceptance Criteria
- [x] Three discrete feed tabs with URL state.
- [x] Tab-specific query paths and pagination.
- [x] Later evolved in Sprint 160 (PillTabs primitive, see REQ-105).

## Implementation
- Primary: [app/(consumer)/feed/](../../app/), [lib/queries/](../../lib/)

## Tests
- Unit: [api-feed.test.ts](../../lib/__tests__/api-feed.test.ts)

## History
- Plan: *(no dedicated plan file)*
- Retro: [sprint-27-retro.md](../history/retros/sprint-27-retro.md)

## See also
- [REQ-105](REQ-105-consumer-ia-restructure.md) *(PillTabs follow-on)*
