# REQ-097 — Storefront (Public Brewery Pages)
**Status:** ✅ Complete · **Sprint:** 131 · **Backfilled:** 2026-04-15

## Summary
Public-facing brewery pages with tier-gated content. `StorefrontShell`, `AuthGate`, and `StorefrontGate` components control what visitors see without logging in.

## Acceptance Criteria
- [x] Public brewery profile page.
- [x] Tier-gated premium sections.
- [x] AuthGate component controls anonymous-vs-signed-in views.
- [x] SEO-friendly (metadata, og tags).

## Implementation
- Primary: [app/storefront/](../../app/), [lib/storefront](../../lib/)
- Components: [components/StorefrontShell](../../components/), [components/AuthGate](../../components/), [components/StorefrontGate](../../components/)

## Tests
- Unit: [storefront.test.ts](../../lib/__tests__/storefront.test.ts)

## History
- Plan: [sprint-131-plan.md](../history/plans/sprint-131-plan.md)
- Retro: [sprint-131-retro.md](../history/retros/sprint-131-retro.md)

## See also
- [design/app-store-metadata.md](../design/app-store-metadata.md)
