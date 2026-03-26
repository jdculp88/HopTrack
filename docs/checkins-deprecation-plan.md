# `checkins` Table Deprecation Plan

**Authors:** Riley + Jordan
**Date:** 2026-03-26
**Status:** Phase 4-5 (Ready to Drop) — migration 015 written, apply in Sprint 16

---

## Context

The `checkins` table was the original data model for beer logging. In Sprint 10, we introduced `sessions` + `beer_logs` as the new architecture — sessions represent brewery visits, beer_logs represent individual beers within a session. The old `checkins` table is now redundant but still referenced in ~20 files.

## Current State

- **New check-ins** go through `sessions` + `beer_logs` (Sprint 10+)
- **Old data** lives in `checkins` (Sprints 1-9 test data + seed data)
- **Home feed** reads from BOTH tables and merges them
- **Profile/beer/brewery pages** still query `checkins` for stats and history
- **Reactions** have a FK to `checkins.id`
- **`user_achievements`** has an optional `checkin_id` FK

## Deprecation Phases

### Phase 1: Dual-Read (Current — Sprint 13)
No breaking changes. Both tables coexist.
- Home feed merges `checkins` + `sessions` (already done)
- New activity only writes to `sessions` + `beer_logs`
- `/api/checkins` POST still works but is unused by the app

### Phase 2: Migrate Reads (Sprint 14)
Replace all `checkins` queries with `sessions` + `beer_logs` queries.

| File | What to change |
|------|---------------|
| `app/(app)/home/page.tsx` | Remove checkins query, sessions-only feed |
| `app/(app)/profile/[username]/page.tsx` | Replace checkins query with beer_logs for "Beer Journal" + favorite beer |
| `app/(app)/beer/[id]/page.tsx` | Replace checkins query with beer_logs for reviews + flavor tags |
| `app/(app)/brewery/[id]/page.tsx` | Replace stats queries with sessions + beer_logs aggregates |
| `app/(superadmin)/superadmin/page.tsx` | Replace count with sessions count |
| `app/(superadmin)/superadmin/stats/page.tsx` | Replace all stats with sessions-based |
| `app/api/admin/stats/route.ts` | Same as above |

### Phase 3: Disable Writes (Sprint 14)
- Return `410 Gone` from `POST /api/checkins`
- Remove `useCheckin` hook (or redirect to `useSession`)
- Remove `CheckinModal` component (already superseded by `CheckinEntryDrawer`)

### Phase 4: Clean Up FKs (Sprint 15)
- `reactions.checkin_id` — either:
  - Add `session_id` + `beer_log_id` columns to reactions, migrate data, drop `checkin_id`
  - OR keep reactions on legacy checkins only, add new reaction system for sessions
- `user_achievements.checkin_id` — set all to NULL, drop column

### Phase 5: Archive & Drop (Sprint 15+)
- Export `checkins` table to CSV/JSON archive
- Drop `checkins` table
- Remove all type definitions (`Checkin`, `CheckinWithDetails`, etc.)
- Remove `CheckinCard` component (or keep as `LegacyCheckinCard` if needed)
- Update seed scripts to use sessions/beer_logs only

## Files Inventory

### Must Change (17 files)
**Pages (7):** home, profile, beer, brewery, superadmin (3)
**API routes (3):** checkins, reactions, admin/stats
**Components (4):** CheckinCard, CheckinModal, BeerCard, SkeletonCheckinCard
**Types (1):** database.ts — Checkin types
**Hooks (1):** useCheckin.ts
**Seeds (3):** 003, 006, 007

### Can Remove Eventually (5 files)
- `app/api/checkins/route.ts`
- `hooks/useCheckin.ts`
- `components/checkin/CheckinModal.tsx`
- `components/social/CheckinCard.tsx` (after all legacy data migrated)
- `supabase/functions/achievement-eval/index.ts` (replaced by session-end API)

## Timeline

| Sprint | Phase | Deliverable |
|--------|-------|-------------|
| S13 | Phase 1 | This plan + dual-read ✅ |
| S14 | Phase 2-3 | Migrate all reads, disable writes ✅ |
| S14 | Phase 3b | Migration 014 written (reactions FK) ✅ |
| S15 | Phase 4-5 | Migration 015 written (archive + drop) ✅ — APPLY IN S16 |
| S15 | Cleanup | Dead code deleted (CheckinCard, CheckinModal) ✅ |
| S16 | Final | Apply migrations 014 + 015, remove /api/checkins route |

## Risks

- **Data loss:** Mitigated by archiving before drop
- **Reactions breaking:** Reactions FK is the biggest blocker — needs careful migration
- **Historical stats:** Some users may have checkins but no sessions — ensure totals are additive during transition

---

*"The migration pipeline is real now."* — Riley
