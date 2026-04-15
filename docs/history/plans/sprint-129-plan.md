# Sprint 129 — The Transfer
**Theme:** Cross-location customer intelligence
**Status:** COMPLETE
**Date:** 2026-04-01 (retroactive)

---

## Goals
- Build brand-level CRM with cross-location customer profiles
- Enable regional manager location scoping for brand access
- Surface "regulars at your other locations" insights for multi-location brands

## Key Deliverables
- `lib/brand-crm.ts` — 3 pure functions: `buildBrandCustomerList`, `buildBrandCustomerProfile`, `findRegularsAtOtherLocations` (reuses `computeSegment`/`computeEngagementScore` from `lib/crm.ts`)
- `lib/brand-auth.ts` `verifyBrandAccessWithScope()` for regional manager location scoping
- 2 API endpoints (brand customer list with search/segment/sort, brand customer detail with cross-location profile)
- Brand customer list page with segment filter pills + "Cross-Location" pseudo-filter + insight cards
- Brand customer profile page with location breakdown, journey timeline, taste profile, brand loyalty status
- Loading skeletons for both pages
- "Brand Customers" nav link (desktop + mobile)
- Migration 087: `idx_brewery_visits_brewery_id` index

## Results
- 10 new files, 2 modified, 1 migration
- 13 new tests (861 -> 874 total)
- KNOWN: pre-existing hydration mismatch (AppShell) and button nesting (BreweryRatingHeader) still queued
