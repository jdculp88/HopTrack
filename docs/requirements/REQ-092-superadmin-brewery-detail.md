# REQ-092 — Superadmin Brewery Detail + Impersonation
**Status:** ✅ Complete · **Sprint:** 140 · **Backfilled:** 2026-04-15

## Summary
Per-brewery deep-dive page for superadmins (9 sections) plus "View as Brewery" cookie-based read-only impersonation. Command Center linking.

## Acceptance Criteria
- [x] 9-section brewery detail page.
- [x] Cookie-based impersonation (read-only).
- [x] Links from Command Center to detail pages.
- [x] Migration 090 for impersonation session.

## Implementation
- Primary: [app/(superadmin)/breweries/](../../app/)
- Impersonation: [lib/](../../lib/), [proxy.ts](../../proxy.ts)
- Migration: [supabase/migrations/](../../supabase/migrations/)

## Tests
- Unit: [superadmin-brewery-list.test.ts](../../lib/__tests__/superadmin-brewery-list.test.ts), [superadmin-user.test.ts](../../lib/__tests__/superadmin-user.test.ts), [superadmin-intelligence.test.ts](../../lib/__tests__/superadmin-intelligence.test.ts)

## History
- Plan: [sprint-140-plan.md](../history/plans/sprint-140-plan.md)
- Retro: [sprint-140-retro.md](../history/retros/sprint-140-retro.md)

## See also
- [REQ-091](REQ-091-superadmin-command-center.md)
