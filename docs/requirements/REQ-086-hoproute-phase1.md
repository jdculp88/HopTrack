# REQ-086 — HopRoute Phase 1 + Live
**Status:** ✅ Complete · **Sprints:** 38-40 · **Backfilled:** 2026-04-15

## Summary
First real HopRoute — brewery crawl routes with live progression. Evolved across sprints 82 (autocomplete) and 178 (Concierge with taste fingerprint).

## Acceptance Criteria
- [x] AI-generated brewery crawl routes.
- [x] Live progression tracking.
- [x] Shipped across Sprints 38-40.

## Implementation
- Primary: [app/(consumer)/hoproute/](../../app/), [lib/](../../lib/)
- Origin brief: [product/hoproute-concept.docx](../product/hoproute-concept.docx)

## Tests
- Unit: [hop-route-concierge.test.ts](../../lib/__tests__/hop-route-concierge.test.ts) *(covers later Concierge iteration)*

## History
- Plan: [sprint-38-plan.md](../history/plans/sprint-38-plan.md), [sprint-39-plan.md](../history/plans/sprint-39-plan.md), [sprint-40-plan.md](../history/plans/sprint-40-plan.md)
- Retro: [sprint-38-40-retro.md](../history/retros/sprint-38-40-retro.md)
- Later: [Sprint 178 Concierge retro](../history/retros/sprint-178-retro.md) (REQ-118)

## See also
- [REQ-118](REQ-118-hoproute-concierge.md) · [architecture/intelligence-layer.md](../architecture/intelligence-layer.md)
