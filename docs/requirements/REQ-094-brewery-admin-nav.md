# REQ-094 — Brewery Admin Nav Reorganization
**Status:** ✅ Complete · **Sprint:** 133 · **Backfilled:** 2026-04-15

## Summary
Reorganized brewery admin sidebar into 6 logical groups (Content / Engage / Insights / Operations / Account / Overview), with a collapsible sidebar, brand DRY refactor, and a Mobile More sheet.

## Acceptance Criteria
- [x] Sidebar grouped into 6 categories.
- [x] Collapsible via toggle.
- [x] Mobile fallback via bottom sheet.

## Implementation
- Primary: [app/(brewery)/](../../app/), [components/](../../components/)

## Tests
- Unit: [brewery-admin-nav.test.ts](../../lib/__tests__/brewery-admin-nav.test.ts)

## History
- Plan: [sprint-133-plan.md](../history/plans/sprint-133-plan.md)
- Retro: [sprint-133-retro.md](../history/retros/sprint-133-retro.md)
