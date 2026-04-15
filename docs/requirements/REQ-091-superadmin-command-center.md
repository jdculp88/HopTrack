# REQ-091 — Superadmin Command Center
**Status:** ✅ Complete · **Sprint:** 136 · **Backfilled:** 2026-04-15

## Summary
Superadmin dashboard with 7 sections, 25 queries, Recharts visualizations, auto-refresh. The platform's bird's-eye view.

## Acceptance Criteria
- [x] 7 dashboard sections: overview, revenue, users, breweries, content, health, activity.
- [x] Sparkline extraction for inline metrics.
- [x] Auto-refresh cadence.
- [x] Hydration fix for Recharts SSR.

## Implementation
- Primary: [app/(superadmin)/](../../app/), [components/Sparkline](../../components/)

## Tests
- Unit: [superadmin-metrics.test.ts](../../lib/__tests__/superadmin-metrics.test.ts), [superadmin-stats.test.ts](../../lib/__tests__/superadmin-stats.test.ts), [superadmin-brewery.test.ts](../../lib/__tests__/superadmin-brewery.test.ts)

## History
- Retro: [sprint-136-retro.md](../history/retros/sprint-136-retro.md)

## See also
- [REQ-092](REQ-092-superadmin-brewery-detail.md) *(Sprint 140 extension)*
