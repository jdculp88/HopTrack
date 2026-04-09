---
name: hoptrack-testing
description: HopTrack testing standards, patterns, and requirements — Vitest for unit tests (ACTIVE, 1861+ tests), Playwright E2E currently FROZEN in /e2e.frozen/ since Sprint 173 (do not try to run test:e2e — the scripts and devDependency were removed), Casey's coverage rules, Reese's automation standards, what to mock (Supabase → `as any`), what to test (happy path AND sad path), how to run tests (`npm test`, NOT `npm run test:e2e`), how to debug test failures, the `createMockClient(): any` pattern for Supabase mocks, the S173 stale-test lesson (when a design decision changes, update the tests that reference it). Use AGGRESSIVELY whenever writing tests, fixing broken tests, debugging flaky tests, adding coverage, reviewing test files, or answering "should this have a test" or "why is this test failing". Also use when someone says "the test is broken" or "should I write an E2E test" — the FROZEN warning is critical.
---

# HopTrack Testing Standards

Casey owns quality. Reese owns automation. Together they keep us at 1861+ passing tests with zero flakes. This skill is their rulebook.

## ⚠️ IMPORTANT: E2E Tests Are FROZEN (Sprint 173)

**Playwright E2E is currently frozen.** Do NOT attempt to:
- Run `npm run test:e2e` — the script was removed from package.json
- Write new `*.spec.ts` files under `/e2e/` — that directory no longer exists
- Add `@playwright/test` imports — Playwright was removed from devDependencies

**Why:** `hoptrack-staging` Supabase is empty. Running 112 auth-dependent tests against an empty DB produces ~4 hours of timeouts per CI run. S173 retro decided to freeze the entire infrastructure until the staging seed ops sprint is complete.

**Where the tests live now:** `/e2e.frozen/` at the repo root. All 16 spec files + helpers + playwright.config.ts are preserved there. See `/e2e.frozen/README.md` for the full thaw procedure when we're ready to bring E2E back.

**If you genuinely need E2E-level coverage for a specific flow during the freeze:**
1. Expand unit test coverage with Vitest + React Testing Library (`lib/__tests__/integration/`)
2. Manual QA with Casey
3. Defer the decision until the thaw

**What's still active:** Unit tests (Vitest). 1861+ passing. Run with `npm test` or `npm run test:coverage`. Coverage reports via `@vitest/coverage-v8`.

## The Test Philosophy

**Zero tolerance for bugs.** Not low tolerance — ZERO. (Casey's catchphrase: "Zero P0 bugs open right now. ZERO.")

**Test the sad path as hard as the happy path.** Users hit broken states more often than we think. Sam writes acceptance criteria for both.

**Reese's rule: "Covered."** If Reese says a thing is covered, it's covered. If she doesn't say it, assume it isn't.

## Test Stack

| Type | Tool | Config | Run | Status |
|---|---|---|---|---|
| Unit tests | **Vitest** | `vitest.config.ts` | `npm test` (with `--run` for CI) | ✅ Active |
| E2E tests | ~~Playwright~~ | ~~`playwright.config.ts`~~ | — | 🧊 **FROZEN** (see `/e2e.frozen/`) |
| Type checking | **tsc** | `tsconfig.json` | `npx tsc --noEmit` | ✅ Active |
| Linting | **ESLint** | `eslint.config.mjs` | `npm run lint` + `npm run lint -- --quiet` (errors only) | ✅ Active |
| Coverage | **Vitest `v8` provider** | `vitest.config.ts` | `npm run test:coverage` | ✅ Active |

## What Goes Where

```
lib/__tests__/              — Unit tests for lib/ utilities (ACTIVE)
components/__tests__/       — Unit tests for React components (ACTIVE)
hooks/__tests__/            — Unit tests for custom hooks (ACTIVE)
e2e.frozen/                 — FROZEN Playwright E2E (do not edit, see README)
e2e.frozen/scripts/         — Frozen global-setup
e2e.frozen/helpers/         — Frozen helpers (auth, brewery, session)
```

## Vitest Patterns

### The Supabase Mock Pattern (S173 lesson)

**CRITICAL:** When mocking the Supabase client, the return type MUST be `: any` or TypeScript will fight you forever. This is in CLAUDE.md as a convention — `superadmin-intelligence.test.ts` spent 6 sprints in "pre-existing, not ours" limbo because of this. Don't repeat that.

```typescript
// ✅ CORRECT — the fix from S173
function createMockClient(fromOverrides: FromOverrides = {}): any {
  return {
    from(table: string) {
      return createChain(fromOverrides[table] ?? { data: [], count: 0 })
    },
  }
}

// ❌ WRONG — will cause 45 TS2345 errors that block CI type check
function createMockClient(fromOverrides: FromOverrides = {}) {
  return {
    from(table: string) { /* ... */ }
  }
}
```

### The Chain Declaration Pattern (TDZ fix)

When building mock query chains that reference themselves, declare the variable FIRST then assign methods. Otherwise you get TS2448 "block-scoped variable used before declaration."

```typescript
// ✅ CORRECT — S173 cron-weekly-digest fix
function buildChain(data: any) {
  const chain: any = {}
  chain.select = vi.fn().mockReturnValue(chain)
  chain.eq = vi.fn().mockReturnValue(chain)
  chain.single = vi.fn().mockResolvedValue({ data })
  chain.then = (resolve: any) => resolve({ data: Array.isArray(data) ? data : [data] })
  return chain
}

// ❌ WRONG — TDZ error
function buildChain(data: any) {
  const chain: any = {
    select: vi.fn().mockReturnValue(chain),  // ← TS2448
  }
  return chain
}
```

### Module Export Checks Without Type Errors

When checking if a module export was removed (e.g., `runtime` on Edge route), use the `in` operator not property access:

```typescript
// ✅ CORRECT — no type error if runtime was removed
expect("runtime" in mod).toBe(false)

// ❌ WRONG — TS2339 if runtime export was deleted
expect(mod.runtime).toBeUndefined()
```

### Common Imports

```typescript
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest"
import { render, screen, fireEvent, act } from "@testing-library/react"
```

### Setup Patterns

- **`beforeEach`** — clear localStorage, reset module mocks, reset DOM state
- **`beforeAll`** — mock browser APIs (`window.matchMedia`, `navigator.vibrate`, etc.)
- **Mock `matchMedia`** — jsdom doesn't implement it, required for any component using `useReducedMotion`, `useMedia`, or theme queries

## What to Test

### ALWAYS test:
- ✅ Pure functions in `lib/` — every branch, every edge case
- ✅ API route handlers — auth, validation, success, error paths
- ✅ React components that have state or conditionals — render variants
- ✅ Custom hooks — happy path + error path + cleanup
- ✅ Supabase query helpers — mock the client, verify the query shape
- ✅ Schema validation (Zod schemas) — valid + invalid inputs
- ✅ Utility functions — boundary cases especially
- ✅ **Security-sensitive code** — RLS policy checks, auth flows, tier gates

### DON'T test:
- ❌ Framework internals (don't test that React renders)
- ❌ Third-party libs (don't test Supabase)
- ❌ CSS visual appearance (use screenshot tests in E2E if needed)
- ❌ Implementation details (test what the function does, not how)

## Playwright E2E Patterns (FROZEN — for reference only)

All Playwright patterns are preserved in `/e2e.frozen/` but the infrastructure is not active. Do not run them. Do not add new ones. When we thaw:

- Test user: `testflight@hoptrack.beer` / `HopTrack2026!` / username `hopreviewer`
- Demo breweries: `dd000001-0000-0000-0000-00000000000{1,2,3}`
- `playwright.config.ts` must have `reuseExistingServer: true` (S173 port conflict lesson)
- `global-setup.ts` verifies seed data before any test runs

Full thaw procedure: `/e2e.frozen/README.md`

## Running Tests

```bash
# Unit tests (local watch mode)
npm test

# Unit tests (CI / run once)
npm test -- --run

# Single file
npm test -- --run lib/__tests__/personality.test.ts

# Coverage
npm run test:coverage

# E2E tests: FROZEN — scripts removed from package.json in S173.
# Do NOT run `npm run test:e2e` — it no longer exists.
# See /e2e.frozen/README.md to thaw when ready.

# Type check
npx tsc --noEmit

# Lint (full — warnings included)
npm run lint

# Lint (errors only — S173 regression guard)
npm run lint -- --quiet
```

## Debugging Test Failures

### Step 1: Did the test pass before?
```bash
git stash && npm test -- --run path/to/failing.test.ts && git stash pop
```
If yes on clean HEAD, your change broke it. If no, it's pre-existing (but don't let that be a 6-sprint pre-existing like S173's superadmin-intelligence — fix it or log it as debt).

### Step 2: Read the actual error
Don't assume. Read the exact assertion, the expected vs received values, the stack trace.

### Step 3: Check if a design decision changed (S173 lesson)
If a component test fails and the test assertions look stale, check if a recent sprint intentionally changed the behavior. S172 flipped the default theme from dark → light but didn't update the S170 theme-toggle tests, which silently broke 6 tests for 9 days.

### Step 4: Isolate with `--run --reporter=verbose`
```bash
npm test -- --run --reporter=verbose path/to/failing.test.ts
```

### Step 5: Check the mock setup
Most test failures are mock setup issues, not logic bugs. Is the Supabase mock returning the right shape? Is `beforeEach` clearing the right state?

## Coverage Targets (Casey's Standard)

- **Critical paths:** 100% (auth, billing, data mutations)
- **New code:** tests written alongside the feature (no "we'll add tests later")
- **Bug fixes:** ALWAYS include a regression test that would have caught the bug
- **Overall lib/:** 80%+ line coverage

## Known Test Debt (Track Here, Not "Pre-Existing Limbo")

- `lib/__tests__/superadmin-intelligence.test.ts` — fixed in S173 after 6 sprints of being ignored as "pre-existing" ✅
- **E2E suite FROZEN** in S173 — moved from `/e2e` to `/e2e.frozen/`, `@playwright/test` removed from devDependencies, e2e job removed from ci.yml. Reason: `hoptrack-staging` is empty. Full thaw procedure: `/e2e.frozen/README.md`. Seed ops sprint: `memory/feedback_staging_supabase_empty.md`.

## The Pre-Existing Debt Rule (S173 lesson)

When you find a failing test or type error that "isn't yours":
1. **Do NOT** tag it "pre-existing, not ours" and move on
2. **Do** add it to `docs/plans/tech-debt.md` with a sprint-by date
3. **Do** fix it if it's quick (under 15 minutes)
4. **Do** escalate to Casey + Sage if it's a bigger fix

The 6-sprint inheritance of `superadmin-intelligence.test.ts` errors was a process failure, not a code failure. Don't repeat it.

## Related Skills

- **`hoptrack-conventions`** — code rules (which patterns to test against)
- **`hoptrack-debug`** — broader debug playbook (tests are one piece of it)
- **`hoptrack-codebase-map`** — where test files live
