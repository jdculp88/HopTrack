# Sprints 64-73 Master Plan: Shore It Up
**PM:** Morgan | **Assistant:** Sage
**Created:** 2026-03-30
**Theme:** Tech debt, documentation finalization, folder/file organization

> "We built a product in 63 sprints. Now we make it a codebase anyone can walk into and understand in an afternoon." — Morgan

---

## Overview

Three phases across 10 sprints:

| Phase | Sprints | Theme |
|-------|---------|-------|
| **Phase 1: Clean House** | 64-66 | Remove dead code, fix types, clean logs, organize folders |
| **Phase 2: Document Everything** | 67-70 | README, API docs, architecture, env setup, roadmap refresh |
| **Phase 3: Harden & Ship** | 71-73 | Testing, performance, CI/CD, final audit |

---

## Phase 1: Clean House (Sprints 64-66)

### Sprint 64 — Zero Noise
**Theme:** Remove console.log, clean dead code, delete stale files

| # | Ticket | Owner | Priority |
|---|--------|-------|----------|
| 1 | Remove/replace all `console.log` in 15 production files (→ `console.warn` for intentional warnings only, delete the rest) | Avery | P0 |
| 2 | Audit `components/checkin/` — confirm which are dead vs. used by sessions; delete truly dead ones, rename folder to `components/session/` and update all imports | Avery + Jordan | P0 |
| 3 | Delete stale docs: `docs/bugs/` (all resolved), `docs/screenshots/README.md` + empty dir, `docs/validation/`, `docs/agendas/`, `docs/sprint-17-bugs.md`, `docs/sprint-18-bugs.md` | Sage | P1 |
| 4 | Delete duplicate/stale strategy docs: `docs/strategy/roadmap.md` (duplicate of `docs/roadmap.md`), `docs/strategy/SALES-PREP-SPRINT-BRIEF.md` (superseded by `docs/sales/`), `docs/strategy/competitive-differentiation.md` (Sprint 1 era) | Sage | P1 |
| 5 | Consolidate brand docs: merge `docs/strategy/BRAND-IDENTITY-V1.md` + `docs/strategy/brand-guide.md` → `docs/brand/brand-guide.md` | Jamie + Sage | P1 |
| 6 | Move `docs/strategy/APPLE-APP-PLAN-V1.md` → `docs/brand/apple-app-plan.md` | Sage | P2 |

**Definition of Done:** Zero `console.log` in API routes. `components/checkin/` either renamed or dead code deleted. docs/ is 20+ files lighter.

---

### Sprint 65 — Type Safety Sweep (Part 1)
**Theme:** Cut `as any` count from 105 → ~50

| # | Ticket | Owner | Priority |
|---|--------|-------|----------|
| 1 | Create `types/supabase-helpers.ts` — shared row types for common join shapes (profile+beer, session+beers, brewery+reviews) | Jordan | P0 |
| 2 | Fix `as any` in all `app/api/` route handlers (server-side — highest impact) | Avery | P0 |
| 3 | Fix `as any` in `lib/queries/feed.ts` — proper interfaces for all feed query return types | Avery | P0 |
| 4 | Fix `as any` in `components/social/` (DiscoveryCard, RatingCard, DrinkingNow, FeedCard variants) | Avery | P1 |
| 5 | Fix `as any` in brewery-admin client components (TapListClient, AnalyticsClient, DashboardClient) | Avery | P1 |
| 6 | Document remaining intentional `as any` with `// supabase join shape` comments | Jordan | P1 |

**Definition of Done:** `as any` count ≤ 50. All API routes fully typed. `types/supabase-helpers.ts` exists and is used.

---

### Sprint 66 — Folder Surgery
**Theme:** Reorganize docs/, lib/, and project structure

| # | Ticket | Owner | Priority |
|---|--------|-------|----------|
| 1 | Create `docs/plans/` — move all `sprint-*-plan.md` files (12-40) into it | Sage | P0 |
| 2 | Create `docs/archive/` — move: `checkins-deprecation-plan.md`, `URL-REFERENCE.md`, `sprint-17-bugs.md`, `sprint-18-bugs.md`, `sprint-29-testing-weekend.md`, `sprint-30-testing-audit.md`, `documentation-audit.md` | Sage | P0 |
| 3 | Consolidate `docs/meetings/` (5 files) → `docs/archive/meetings/` | Sage | P1 |
| 4 | Create `docs/ops/` cleanup — verify `STAGING-ENV-SETUP.md` accuracy, keep `DREW-BREWERY-OPS-REVIEW.md` | Quinn + Drew | P1 |
| 5 | Split `lib/queries/feed.ts` (19.6KB) → `lib/queries/feed/index.ts`, `lib/queries/feed/types.ts`, `lib/queries/feed/friends.ts`, `lib/queries/feed/discover.ts`, `lib/queries/feed/you.ts` | Avery + Jordan | P1 |
| 6 | Move `hooks/` → `lib/hooks/` for co-location with lib utilities; update all imports | Avery | P2 |
| 7 | Create `.env.local.example` with all required env vars documented with comments | Riley | P0 |

**Definition of Done:** `docs/` has clean top-level: `roadmap.md`, `launch-checklist.md`, `sprint-history.md`, `app-store-metadata.md`, `sprint-64-73-master-plan.md`, plus `plans/`, `retros/`, `sales/`, `brand/`, `ops/`, `requirements/`, `archive/`. `lib/queries/feed.ts` is split. `.env.local.example` exists.

---

## Phase 2: Document Everything (Sprints 67-70)

### Sprint 67 — README & Onboarding
**Theme:** A developer can clone and run in 10 minutes

| # | Ticket | Owner | Priority |
|---|--------|-------|----------|
| 1 | Write comprehensive `README.md`: project overview, tech stack, setup instructions (Supabase, env vars, migrations), dev commands, deployment | Sage + Morgan | P0 |
| 2 | Update `roadmap.md` — current sprint is 67 (not 41), all sprints 41-66 marked COMPLETE with one-line summaries | Sage | P0 |
| 3 | Create `CONTRIBUTING.md` — code style, PR-less workflow, commit conventions, who reviews what | Morgan + Jordan | P1 |
| 4 | Create `supabase/migrations/README.md` — naming convention, how to apply, rollback procedures | Riley + Quinn | P1 |
| 5 | Verify and update `docs/ops/STAGING-ENV-SETUP.md` against actual infra | Riley | P1 |

**Definition of Done:** New developer can `git clone`, read README, set up env, run `npm run dev`, and see the app. Roadmap is current.

---

### Sprint 68 — API Reference
**Theme:** Document every endpoint

| # | Ticket | Owner | Priority |
|---|--------|-------|----------|
| 1 | Create `docs/API-REFERENCE.md` — all 55 endpoints: method, path, auth requirement, request/response shape, rate limit status | Sage + Avery | P0 |
| 2 | Group endpoints by domain: auth, sessions, beers, breweries, friends, notifications, billing, admin, social, hop-route | Sage | P0 |
| 3 | Document rate-limited endpoints (8 total) with limits and response codes | Avery | P1 |
| 4 | Document `proxy.ts` routing logic (replaces middleware.ts) | Jordan | P1 |
| 5 | Add error response format documentation (standard error shape across all routes) | Avery | P2 |

**Definition of Done:** `docs/API-REFERENCE.md` covers all 55 endpoints with enough detail to build a client against.

---

### Sprint 69 — Architecture & Systems
**Theme:** How it all fits together

| # | Ticket | Owner | Priority |
|---|--------|-------|----------|
| 1 | Create `docs/ARCHITECTURE.md`: request flow diagram (Next.js → Supabase), auth architecture, RLS strategy, file storage (avatars, photos), real-time (Board), external integrations (Stripe, Anthropic, Sentry) | Jordan + Riley | P0 |
| 2 | Document the XP/achievement system: `lib/xp/`, `lib/achievements/`, how they trigger, where they display | Avery | P1 |
| 3 | Document the feed system: three tabs, query strategy, card type union, seeding | Avery | P1 |
| 4 | Document the HopRoute AI system: prompt, API, rate limiting, credit management | Jordan | P1 |
| 5 | Document the theme system: CSS vars, DarkCardWrapper, card-bg-* classes, beerStyleColors | Alex + Avery | P2 |
| 6 | Document the animation system: `lib/animation.ts`, spring configs, MotionConfig, reduced motion | Alex | P2 |

**Definition of Done:** `docs/ARCHITECTURE.md` is the system map. New engineer reads it and understands how data flows, how auth works, and where to find things.

---

### Sprint 70 — Requirements & Brand Finalization
**Theme:** Close every open doc, finalize brand assets

| # | Ticket | Owner | Priority |
|---|--------|-------|----------|
| 1 | Audit all REQ files (REQ-001 through REQ-025) — mark status (COMPLETE/DEPRECATED), add final notes | Sam + Sage | P0 |
| 2 | Create `docs/requirements/README.md` — index of all requirements with status and sprint delivered | Sage | P0 |
| 3 | Finalize `docs/brand/brand-guide.md` — colors, typography, logo usage, tone of voice, do's and don'ts | Jamie | P1 |
| 4 | Update `docs/app-store-metadata.md` — verify screenshots list, description, keywords match current app | Jamie | P1 |
| 5 | Update `docs/sales/` — Taylor reviews all 8 files for accuracy against current product | Taylor | P1 |
| 6 | Create `docs/sales/case-study-template.md` if missing or update existing | Taylor | P2 |

**Definition of Done:** Every doc in `docs/` is either current, archived, or deleted. Zero stale docs at root level. Brand guide is final. Sales docs reflect the real product.

---

## Phase 3: Harden & Ship (Sprints 71-73)

### Sprint 71 — Type Safety Sweep (Part 2)
**Theme:** Cut `as any` to near-zero, finalize TypeScript strictness

| # | Ticket | Owner | Priority |
|---|--------|-------|----------|
| 1 | Fix remaining `as any` in consumer app client components (profile, explore, beer-lists, passport) | Avery | P0 |
| 2 | Fix remaining `as any` in `components/` (achievement, loyalty, wishlist, hop-route) | Avery | P0 |
| 3 | Run `npx tsc --noEmit` — zero errors, zero warnings | Jordan | P0 |
| 4 | Audit generated `types/database.ts` — regenerate from current schema if stale | Quinn | P1 |
| 5 | Add typed API response helpers: `ApiSuccess<T>`, `ApiError` wrapper in `lib/api/responses.ts` | Jordan | P1 |

**Definition of Done:** `as any` count ≤ 10 (only truly unavoidable Supabase join shapes). Clean `tsc` build. Type helpers exist.

---

### Sprint 72 — Test & Performance
**Theme:** E2E coverage, memoization, build optimization

| # | Ticket | Owner | Priority |
|---|--------|-------|----------|
| 1 | Audit all 7 E2E specs — fix flaky tests, remove skipped tests that should run | Reese + Casey | P0 |
| 2 | Add E2E coverage for: delete account, billing flow (mock Stripe), beer lists CRUD | Reese | P0 |
| 3 | Profile home feed with React DevTools — add `useMemo`/`useCallback` where measurable impact | Avery | P1 |
| 4 | Profile explore page — same memoization audit | Avery | P1 |
| 5 | Run `npm run build` — verify zero warnings, analyze bundle size, document in `docs/ops/BUILD-NOTES.md` | Riley + Quinn | P1 |
| 6 | Verify all ISR pages revalidate correctly (brewery-welcome, brewery detail) | Quinn | P2 |

**Definition of Done:** All E2E tests pass. Build is clean. Performance baseline documented. No flaky tests.

---

### Sprint 73 — Final Audit & Seal
**Theme:** One last pass. Everything reviewed. Everything documented. Ship shape.

| # | Ticket | Owner | Priority |
|---|--------|-------|----------|
| 1 | Full codebase grep: no `TODO`, `FIXME`, `HACK` without a linked ticket or documented reason | Casey + Sage | P0 |
| 2 | Update `docs/launch-checklist.md` — re-audit all 124 items, mark new completions from Sprints 64-73 | Morgan + Sage | P0 |
| 3 | Update `docs/sprint-history.md` — add Sprints 64-73 summaries | Sage | P0 |
| 4 | Update `CLAUDE.md` — reflect current sprint (73), any new architectural decisions, new file locations | Morgan | P0 |
| 5 | Final `docs/` audit — verify folder structure matches Sprint 66 plan, no orphaned files | Sage | P1 |
| 6 | Delete `docs/strategy/` folder if fully migrated to `docs/brand/` and `docs/sales/` | Sage | P1 |
| 7 | Write Sprint 64-73 retro (the big one) | Everyone | P0 |
| 8 | Update `package.json` description and version to `1.0.0` | Riley | P2 |

**Definition of Done:** Every file in the repo has a reason to exist. Every doc is current. Launch checklist updated. CLAUDE.md is truth. The codebase is walk-in ready.

---

## Success Metrics

| Metric | Before (Sprint 63) | Target (Sprint 73) |
|--------|-------------------|---------------------|
| `as any` casts | ~105 files | ≤ 10 |
| `console.log` in prod | 15 files | 0 |
| API docs | 0 endpoints documented | 55/55 |
| README | Boilerplate | Comprehensive setup guide |
| Architecture doc | None | Complete system map |
| docs/ stale files | ~30 | 0 |
| E2E test specs | 7 (some flaky) | 10+ (all green) |
| `tsc --noEmit` | Unknown | 0 errors |

---

## Sprint Cadence

- Push to `main` directly (no change)
- Retro at the end of Sprint 73 (the big 10-sprint retro)
- No new features — this is housekeeping only
- If we find bugs during cleanup, fix them inline (don't punt)
- Sage tracks all docs changes, Morgan tracks overall progress

---

*"Ten sprints to make it bulletproof. Let's go."* — Morgan 🗂️
