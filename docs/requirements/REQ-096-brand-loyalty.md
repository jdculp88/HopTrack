# REQ-096 — Brand-Wide Loyalty Passport
**Status:** ✅ Complete · **Sprint:** 125 · **Backfilled:** 2026-04-15

## Summary
Earn-anywhere, redeem-anywhere brand loyalty. Cross-location stamp cards, unified redemption codes, tier-gated at Cask+.

## Acceptance Criteria
- [x] 3 tables for passport, stamps, redemptions (migration 082).
- [x] Session-end integration writes stamps.
- [x] `BrandLoyaltyStampCard` component on consumer app.
- [x] Admin page for brand loyalty management.
- [x] Tier gated to Cask/Barrel.

## Implementation
- Primary: [lib/brand-loyalty](../../lib/)
- Components: [components/BrandLoyaltyStampCard](../../components/)
- Migration: [supabase/migrations/](../../supabase/migrations/)

## Tests
- Unit: [brand-loyalty.test.ts](../../lib/__tests__/brand-loyalty.test.ts)

## History
- Plan: [sprint-125-plan.md](../history/plans/sprint-125-plan.md)
- Retro: [sprint-125-retro.md](../history/retros/sprint-125-retro.md)

## See also
- [REQ-003](REQ-003-loyalty-system.md) *(original single-location)* · [REQ-082](REQ-082-tier-feature-matrix.md)
