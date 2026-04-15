# REQ-093 — Data Standardization + Social Links
**Status:** ✅ Complete · **Sprints:** 132, 135 · **Backfilled:** 2026-04-15

## Summary
Data quality pass — `formatCity`, `formatState`, `normalizeAddress`, `US_STATES`, state dropdown, zip code field, and social-link columns across the brewery schema. Bulk normalization of 7,177 breweries.

## Acceptance Criteria
- [x] `lib/brewery-utils.ts` helpers for consistent formatting.
- [x] Migration 088 added 4 social-link columns.
- [x] Migration 089 deduped + normalized brewery addresses.
- [x] SocialIcons component in storefront.

## Implementation
- Primary: [lib/brewery-utils](../../lib/)
- Components: [components/SocialIcons](../../components/)
- Migrations: [supabase/migrations/](../../supabase/migrations/)

## Tests
- Unit: [brewery-utils.test.ts](../../lib/__tests__/brewery-utils.test.ts)

## History
- Plans: [sprint-132-plan.md](../history/plans/sprint-132-plan.md), [sprint-135-plan.md](../history/plans/sprint-135-plan.md)
- Retros: [sprint-132-retro.md](../history/retros/sprint-132-retro.md), [sprint-135-retro.md](../history/retros/sprint-135-retro.md)
