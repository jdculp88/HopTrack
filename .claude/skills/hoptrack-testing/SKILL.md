---
name: hoptrack-testing
description: HopTrack testing standards, patterns, and requirements — Vitest for unit tests, Playwright for E2E, Casey's coverage rules, Reese's automation standards, what to mock (Supabase → `as any`), what to test (happy path AND sad path), what NOT to test (framework internals), how to run tests (`npm test`, `npm run test:e2e`), how to debug test failures, the React compiler test patterns, the S173 stale-test lesson (when a design decision changes, update the tests that reference it), and the `createMockClient(): any` pattern for Supabase mocks. Use AGGRESSIVELY whenever writing tests, fixing broken tests, debugging flaky tests, adding coverage, reviewing test files, or answering "should this have a test" or "why is this test failing". Also use when someone says "the test is broken" — the debug playbook is here. Pushy loading is correct because 1861+ tests is a lot to reason about and the team gets coverage debt fast if skills don't fire.
---

# HopTrack Testing Standards

Casey owns quality. Reese owns automation. Together they keep us at 1861+ passing tests with zero flakes. This skill is their rulebook.

## The Test Philosophy

**Zero tolerance for bugs.** Not low tolerance — ZERO. (Casey's catchphrase: "Zero P0 bugs open right now. ZERO.")

**Test the sad path as hard as the happy path.** Users hit broken states more often than we think. Sam writes acceptance criteria for both.

**Reese's rule: "Covered."** If Reese says a thing is covered, it's covered. If she doesn't say it, assume it isn't.

## Test Stack

| Type | Tool | Config | Run |
|---|---|---|---|
| Unit tests | **Vitest** | `vitest.config.ts` | `npm test` (with `--run` for CI) |
| E2E tests | **Playwright** | `playwright.config.ts` | `npm run test:e2e` |
| Type checking | **tsc** | `tsconfig.json` | `npx tsc --noEmit` |
| Linting | **ESLint** | `eslint.config.mjs` | `npm run lint` + `npm run lint -- --quiet` (errors only) |
| Coverage | **Vitest `v8` provider** | `vitest.config.ts` | `npm run test:coverage` |

## What Goes Where

```
lib/__tests__/              — Unit tests for lib/ utilities
components/__tests__/       — Unit tests for React components
hooks/__tests__/            — Unit tests for custom hooks
e2e/                        — All Playwright E2E tests
e2e/scripts/global-setup.ts — E2E global setup (verifies test user + demo breweries)
e2e/helpers/                — Shared E2E helpers (auth, brewery, session, navigation)
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

## Playwright E2E Patterns

### Test User
```typescript
// e2e/helpers/auth.ts
export const TEST_USER = {
  email: "testflight@hoptrack.beer",
  password: "HopTrack2026!",
  username: "hopreviewer",
}
```

This user lives in `hoptrack-staging` (NOT seeded as of S173 — the E2E job is `if: false` in CI until staging is seeded). Do NOT hardcode a different user.

### Demo Brewery IDs
```typescript
// e2e/helpers/auth.ts
export const BREWERIES = {
  mountainRidge: "dd000001-0000-0000-0000-000000000001",
  riverBend: "dd000001-0000-0000-0000-000000000002",
  smokyBarrel: "dd000001-0000-0000-0000-000000000003",
}
```

### Global Setup
`e2e/scripts/global-setup.ts` verifies test data exists BEFORE any test runs. If staging is empty, it prints a warning but doesn't fail — tests will fail on login anyway.

### The Port Conflict Rule (S173 lesson)
`playwright.config.ts` has `reuseExistingServer: true` **unconditionally**. Do NOT set it to `!process.env.CI` — that was the S173 bug that caused the port 3000 conflict in CI.

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

# E2E (all specs)
npm run test:e2e

# E2E (single spec)
npm run test:e2e -- e2e/auth.spec.ts

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
- E2E suite soft-fails in CI (`if: false` on e2e job) until `hoptrack-staging` is seeded — see `memory/feedback_staging_supabase_empty.md`

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
