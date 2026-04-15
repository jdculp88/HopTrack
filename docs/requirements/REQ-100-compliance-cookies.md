# REQ-100 — Cookie Consent + Compliance Audit
**Status:** ✅ Complete · **Sprints:** 77, 151 · **Backfilled:** 2026-04-15

## Summary
Cookie consent banner (Sprint 77), age verification, location consent, legal pages, and the Sprint 151 compliance audit that shaped [compliance/](../compliance/README.md).

## Acceptance Criteria
- [x] Cookie consent banner with granular controls.
- [x] Age verification (21+ gate).
- [x] Location-consent prompt for nearby-breweries features.
- [x] Legal pages (Terms, Privacy, DMCA).
- [x] Compliance audit docs.

## Implementation
- Primary: [lib/compliance-audit](../../lib/), [lib/age-verification](../../lib/), [lib/location-consent](../../lib/), [lib/legal-pages](../../lib/)

## Tests
- Unit: [compliance-audit.test.ts](../../lib/__tests__/compliance-audit.test.ts), [age-verification.test.ts](../../lib/__tests__/age-verification.test.ts), [location-consent.test.ts](../../lib/__tests__/location-consent.test.ts), [legal-pages.test.ts](../../lib/__tests__/legal-pages.test.ts)

## History
- Plan: [sprint-151-plan.md](../history/plans/sprint-151-plan.md)
- Retros: [sprint-77-retro.md](../history/retros/sprint-77-retro.md), [sprint-151-retro.md](../history/retros/sprint-151-retro.md)

## See also
- [compliance/gdpr-ccpa.md](../compliance/gdpr-ccpa.md) · [REQ-103](REQ-103-ftc-age-gate.md)
