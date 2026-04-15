# REQ-117 — Stat Write-Path Guards (Orphan Fix)
**Status:** ✅ Complete · **Sprint:** 177 · **Backfilled:** 2026-04-15

## Summary
The Plumbing — 2 P0 orphans fixed: `profiles.unique_beers` (8 display surfaces, never incremented) and `brewery_visits` table (18 read paths, Brand CRM, only seeded). Migration 113 installs triggers + backfill. 34 guard tests.

## Acceptance Criteria
- [x] `profiles.unique_beers` write-path trigger.
- [x] `brewery_visits` populated via session completion trigger.
- [x] Backfill script runs once.
- [x] 34 guard tests verify no re-orphaning.

## Implementation
- Primary: [lib/stat-write-paths](../../lib/), [supabase/migrations/113_*](../../supabase/migrations/)

## Tests
- Unit: [stat-write-paths.test.ts](../../lib/__tests__/stat-write-paths.test.ts), [orphaned-columns-guard.test.ts](../../lib/__tests__/orphaned-columns-guard.test.ts)

## History
- Plan: [sprint-177-plan.md](../history/plans/sprint-177-plan.md)
- Retro: [sprint-177-retro.md](../history/retros/sprint-177-retro.md)
