# REQ-095 — Multi-Tier Brand Team Roles
**Status:** ✅ Complete · **Sprint:** 122 · **Backfilled:** 2026-04-15

## Summary
3-tier brand team roles — Owner, Brand Manager, Regional Manager — with location scoping and audit log.

## Acceptance Criteria
- [x] Three role levels with distinct capabilities.
- [x] Per-location scoping for Regional Manager.
- [x] Brand Team management page.
- [x] Audit log of role changes and sensitive actions.
- [x] Migration 080.

## Implementation
- Primary: [lib/brand-auth](../../lib/), [lib/brand-team-activity](../../lib/)
- Pages: [app/(brewery)/team/](../../app/)

## Tests
- Unit: [brand-team-activity.test.ts](../../lib/__tests__/brand-team-activity.test.ts), [brand-auth.test.ts](../../lib/__tests__/brand-auth.test.ts)

## History
- Retro: [sprint-122-retro.md](../history/retros/sprint-122-retro.md)

## See also
- [REQ-072](REQ-072-multi-location-brewery-support.md) · [compliance/README.md](../compliance/README.md)
