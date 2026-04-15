# Sprint 130 — The Welcome Mat
**Theme:** Brand onboarding & polish
**Status:** COMPLETE
**Date:** 2026-04-01 (retroactive)

---

## Goals
- Build brand onboarding wizard for new multi-location brands
- Add dashboard checklist card to guide brand setup
- Document brand feature tier gates
- Fix long-standing button nesting hydration bug

## Key Deliverables
- Brand Onboarding Wizard (4-step: Locations -> Loyalty -> Team -> Preview) in `components/brewery-admin/brand/onboarding/` (5 files, clones brewery OnboardingWizard pattern, localStorage persistence, auto-shows for brands with < 2 locations)
- `BrandOnboardingCard` dashboard checklist (gold gradient, animated progress bar, 4 steps)
- `BRAND_FEATURE_GATES` constant in `lib/stripe.ts` (tier gate documentation for 8 brand features)
- Regional manager scope badges on team page (actual location names, MapPin icons)
- Dashboard scope pill for scoped users via `verifyBrandAccessWithScope()`
- BreweryRatingHeader button nesting fix (`<button>` -> `<div role="button">`, 33-sprint bug since S83)
- 16 roadmap ideas captured to `docs/plans/deferred-sprint-options.md`

## Results
- 10 new files, 6 modified, 0 migrations
- 20 new tests (874 -> 894 total)
- FIXED: hydration mismatch from button nesting (S83 -> S130)
- KNOWN: Brand Team page shows 0 members (pre-existing RLS query issue)
