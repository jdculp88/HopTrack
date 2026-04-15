# Sprint 123 Retro — The Fix
**Facilitator:** Morgan
**Date:** 2026-04-02
**Theme:** Brand hardening — fix RLS recursion, standardize auth, mobile nav, error handling, tests
**Arc:** Multi-Location (Sprint 10 of 24)

---

## What We Shipped

- **Migration 081** — `is_brand_manager_or_owner()` SECURITY DEFINER function. Breaks the RLS recursion on `brand_accounts` that silently returned zero rows since Sprint 122.
- **16 API routes standardized** — all brand auth consolidated to `verifyBrandAccess()` from `lib/brand-auth.ts`. Removed 3 local helper functions (`getBrandRole`, `verifyMembership`, `verifyBrandRole`).
- **`lib/brand-auth.ts`** — shared brand auth utility with brewery_accounts fallback for defense in depth.
- **Mobile brand nav** — 3 brand tabs (Brand, Team, Catalog) in the mobile scrollable tab strip with gold accent + separator.
- **Brand error boundary** — `app/(brewery-admin)/brewery-admin/brand/[brand_id]/error.tsx` with Building2 icon and brand-specific messaging.
- **3 guardrail tests:**
  - `rls-safety.test.ts` — scans all migrations for self-referencing SELECT policies
  - `brand-routes-use-shared-auth.test.ts` — ensures all brand API routes import `verifyBrandAccess`
  - `brand-auth.test.ts` — unit tests for `verifyBrandAccess()` (5 cases)
- **Nav dropdown fix** — brand name in brewery selector is now a full clickable link to Brand Dashboard
- **Members API FK fix** — two-step profile hydration (brand_accounts FK points to auth.users, not profiles)
- **RLS dependency comments** on `lib/brand-propagation.ts` and `lib/brand-team-activity.ts`

## By the Numbers

| Metric | Before | After |
|--------|--------|-------|
| Tests | 756 | 765 (+9) |
| Files modified | — | 22 |
| Files created | — | 5 |
| Migrations | 080 | 081 |
| P0 bugs | 1 (silent RLS recursion) | 0 |
| Brand API routes with shared auth | 1 | 17 (all) |
| Mobile brand nav links | 0 | 3 |
| Build | clean | clean |

## What Went Well

- **Three-layer fix:** Database (SECURITY DEFINER) + application (verifyBrandAccess fallback) + CI (guardrail tests). The pattern can't recur without failing tests.
- **Parallel agent batches** for the 16 route conversions — fast, mechanical, correct.
- **Joshua found the bug** by clicking one button. Good product instincts.
- **Migration 081 pattern** is now the reference for all future self-referencing RLS needs.

## What We Learned

- **Self-referencing RLS policies are PostgreSQL's silent killer.** No error, no log, just empty results. This is the second time this pattern burned us (brewery_accounts Sprint 115, brand_accounts Sprint 122).
- **PostgREST FK joins fail silently** when the FK doesn't point to the target table. `brand_accounts.user_id` → `auth.users`, not `profiles`. Two-step hydration is the safe pattern.
- **Turbopack cache can serve stale server components** even after source file changes. `rm -rf .next` and restart is the nuclear option.
- **Inline auth patterns drift.** 16 routes each had their own copy of the same query with minor variations. Shared utilities + static analysis tests prevent this.

## Action Items

- [x] Apply migration 081
- [x] Standardize all brand API routes
- [x] Add guardrail tests
- [x] Mobile brand nav
- [x] Brand error boundary

## The Roast

- Jordan invented a bug that returns zero rows with zero errors. "Watch as I make the brand owner... disappear!"
- Jordan had to take TWO walks this sprint. One for the RLS recursion and one for the PostgREST FK join.
- Avery fixed 16 files in one sitting and Jordan's the one who needs a walk.
- Joshua found a P0 by clicking one button. Drew felt that physically.
- Taylor: "We shipped brand management where the brand owner couldn't manage the brand. That's like selling a car with no steering wheel."
- Morgan: "Joshua found a P0, then calmly said 'let's sprint plan' while Jordan was having an existential crisis. Best kind of founder."

---

*Sprint 123 — The Fix. Shipped clean. 765 tests. Zero P0s.*
