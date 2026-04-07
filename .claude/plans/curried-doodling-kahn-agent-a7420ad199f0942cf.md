# Sprint 150 — "The Playwright" Implementation Plan

## Executive Summary

Sprint 150 transforms E2E tests from soft-fail decoration into hard-fail gatekeepers.
The sprint delivers three things: (1) real Supabase credentials in CI so E2E tests
actually hit a database, (2) three new E2E spec files covering the most critical
user journeys, (3) unit test gap fills for the S149 retro items. By sprint end,
`continue-on-error: true` is removed and every PR must pass E2E to merge.

---

## Phase 1 — CI Infrastructure (Days 1-2) — Riley + Quinn

**Goal:** Wire real Supabase dev credentials into GitHub Actions so E2E tests can
authenticate, read seed data, and create/end sessions against a real database.

### Task 1.1: Configure GitHub Secrets

Add the following repository secrets via GitHub Settings > Secrets and variables > Actions:

- `E2E_SUPABASE_URL` — the dev project URL (https://xxxx.supabase.co)
- `E2E_SUPABASE_ANON_KEY` — the dev project anon key
- `E2E_SUPABASE_SERVICE_ROLE_KEY` — service role key (needed for DB seeding/cleanup)
- `E2E_TEST_USER_EMAIL` — `testflight@hoptrack.beer`
- `E2E_TEST_USER_PASSWORD` — `HopTrack2026!`

**Rationale:** Using dedicated `E2E_` prefixes avoids collision with build-time
placeholders that currently exist in CI. The test user credentials are already
hardcoded in `e2e/helpers/auth.ts` (lines 8-11), but storing them as secrets
keeps the pattern consistent and makes rotation possible.

### Task 1.2: Update CI Workflow

**File:** `.github/workflows/ci.yml`

Changes to the existing E2E step (lines 53-67):

1. Remove `continue-on-error: true` (line 61)
2. Replace placeholder env vars with real secrets:
   ```
   NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.E2E_SUPABASE_URL }}
   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.E2E_SUPABASE_ANON_KEY }}
   SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.E2E_SUPABASE_SERVICE_ROLE_KEY }}
   ```
3. Add a pre-E2E step for database seeding/cleanup (Task 1.3)
4. Add a post-E2E step for cleanup

The Build step (lines 43-49) keeps its placeholder values — it only needs Next.js
to compile, not connect to Supabase.

### Task 1.3: Create E2E Database Seed/Cleanup Script

**New file:** `e2e/scripts/ci-seed.ts`

This script runs before E2E tests in CI to ensure the test user and demo brewery
data exist. It uses the service role client to:

1. Verify the test user (`testflight@hoptrack.beer`) exists with known password
2. Verify the 3 demo breweries exist by their seed UUIDs
3. Clean up any stale session data from previous CI runs (delete sessions where
   `user_id` matches test user and `started_at` is more than 1 hour old)
4. Verify brewery_accounts link exists (test user -> mountainRidge as owner)

The script exits 0 on success, 1 on failure. CI step:
```yaml
- name: Seed E2E test data
  run: npx tsx e2e/scripts/ci-seed.ts
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.E2E_SUPABASE_URL }}
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.E2E_SUPABASE_SERVICE_ROLE_KEY }}
```

**New file:** `e2e/scripts/ci-cleanup.ts`

Runs after E2E tests (regardless of pass/fail) to clean up sessions, beer_logs,
and any other ephemeral data created during the test run. Uses the service role
client. Scoped to the test user only — never touches other data.

### Task 1.4: Update Playwright Config for CI Stability

**File:** `playwright.config.ts`

Changes:
1. Increase CI timeout from 30s to 45s (line 10) — real Supabase queries add latency
2. Add `expect.timeout: 10_000` for CI (default expect timeout is 5s, too tight for real DB)
3. Add `actionTimeout: 15_000` for CI
4. Increase retries from 1 to 2 in CI (line 7) — network flakiness mitigation
5. Keep webServer command as `npm run dev` but increase its timeout to 120s for CI

### Risk Mitigation: CI Supabase Doesn't Work

If the dev Supabase instance is unreliable or has RLS issues in CI:

**Fallback A:** Add a `health-check` step before E2E that hits `/api/health` and
skips E2E if the response is not 200. This keeps CI green while the team debugs.

**Fallback B:** Keep `continue-on-error: true` temporarily but add a required
separate job that runs only the smoke tests (no auth needed). This gives partial
hard-fail coverage immediately.

---

## Phase 2 — E2E Test Helpers & Fixtures (Days 1-3) — Reese

**Goal:** Build reusable helper functions so new spec files are concise and focused
on user journeys rather than plumbing.

### Task 2.1: Expand Auth Helper

**File:** `e2e/helpers/auth.ts` (modify existing)

Add:
- `BREWERY_ADMIN_URL` constant — `/brewery-admin/${BREWERIES.mountainRidge}`
- `loginAndNavigate(page, path)` — combines login + goto + waitForURL
- `logout(page)` — navigate to /settings, click sign out, wait for /login
- `expectAuthenticated(page)` — asserts we're NOT on /login
- `expectUnauthenticated(page)` — asserts we ARE on /login

The existing `login()` function (lines 24-43) stays unchanged — it works well.

### Task 2.2: Create Session Helper

**New file:** `e2e/helpers/session.ts`

```
startSessionAtBrewery(page, breweryId?) — click Start Session FAB, select brewery
  from search/nearby, wait for TapWall to open
endSession(page) — click End Session in TapWall, wait for Recap sheet
closeRecap(page) — dismiss the recap sheet
searchBreweryInDrawer(page, query) — type in the checkin drawer search input
```

These helpers encapsulate the UI interactions found in:
- `components/session/CheckinEntryDrawer.tsx` — drawer open, search, select brewery
- `components/session/TapWallSheet.tsx` — active session UI, end session
- `components/session/SessionRecapSheet.tsx` — post-session recap

### Task 2.3: Create Brewery Admin Helper

**New file:** `e2e/helpers/brewery.ts`

```
navigateToBreweryAdmin(page, breweryId) — goto + wait for dashboard
navigateToAdminSection(page, breweryId, section) — goto specific admin page
expectDashboardLoaded(page) — assert KPI cards or overview content visible
```

### Task 2.4: Create Data Cleanup Utility

**New file:** `e2e/helpers/cleanup.ts`

A lightweight API-based cleanup that specs can call in `afterEach` to remove
test data created during the test. Uses fetch against the app's API endpoints
rather than direct DB access (since E2E tests run in the browser context).

---

## Phase 3 — New E2E Specs (Days 2-5) — Casey + Reese

**Goal:** Add 3 new spec files covering the most critical user journeys, and
strengthen 2 existing specs.

### Task 3.1: Session Flow Spec (HIGHEST PRIORITY)

**New file:** `e2e/session-flow.spec.ts`

This is the single most important E2E test — it covers the core consumer value
proposition: checking in at a brewery.

**Tests:**

1. **"full session lifecycle: start → log beer → rate → end → recap"**
   - Login as test user
   - Click "Start Session" button on /home (the FAB)
   - In CheckinEntryDrawer: search for "Mountain Ridge" (demo brewery)
   - Select the result, wait for TapWall to open
   - Verify TapWall shows brewery name and timer
   - Find a beer in the tap list, tap to log it
   - Rate the beer (tap star rating)
   - Click "End Session"
   - Verify Recap sheet opens with: XP earned, beer count, brewery name
   - Close recap
   - Verify redirect back to /home

2. **"home session: start at home → log beer → end"**
   - Login, click Start Session
   - Click "Drinking at home" pill in the drawer
   - Verify TapWall opens in home mode
   - End session, verify recap

3. **"session drawer shows nearby breweries or search"**
   - Login, click Start Session
   - Verify drawer shows "Where are you?" heading or nearby breweries
   - Verify search input is present with "Search breweries..." placeholder
   - Type a query, verify results appear
   - Close drawer with Escape

4. **"session drawer search returns no results for garbage query"**
   - Open drawer, search "zzznotabrewery999"
   - Verify "No breweries found" message appears

**Key selectors** (from CheckinEntryDrawer.tsx analysis):
- Start Session button: `page.getByRole("button", { name: /start session/i })`
- "Where are you?" heading: `page.getByText("Where are you?")`
- Search input: `page.getByPlaceholder("Search breweries...")`
- "Drinking at home": `page.getByText("Drinking at home")`
- Brewery row: `page.getByText(/Mountain Ridge/i)`
- "Start your visit" button: `page.getByText(/Start your visit/i)`

### Task 3.2: Storefront Spec

**New file:** `e2e/storefront.spec.ts`

Tests the public brewery page experience, including unauthenticated access
(S131 feature: brewery pages are public, with gated sections).

**Tests:**

1. **"unauthenticated user can view brewery page basics"**
   - Navigate to `/brewery/dd000001-0000-0000-0000-000000000001` without login
   - Verify brewery name visible ("Mountain Ridge" or similar)
   - Verify basic info renders: city, state, map pin
   - Verify page does NOT redirect to /login (brewery pages are public)

2. **"unauthenticated user sees auth gate on protected sections"**
   - Navigate to brewery page without login
   - Verify AuthGate CTA is visible: "Sign up to [feature]"
   - Verify "Create Account" link points to /signup with return path
   - Verify "Already have an account? Log in" link is visible

3. **"unclaimed brewery shows storefront gate on premium sections"**
   - (If a demo brewery is unclaimed/free tier) verify StorefrontGate
   - Verify "Own this brewery? Claim it" CTA is visible
   - Verify blurred content overlay is present

4. **"authenticated user sees full brewery page"**
   - Login, navigate to brewery page
   - Verify tap list section, events section, reviews section are visible
   - Verify "Start Session" or "Check in here" CTA is present

5. **"brewery 404 for invalid ID"**
   - Navigate to `/brewery/00000000-0000-0000-0000-000000000000`
   - Verify 404 / "not found" state renders

**Key selectors** (from brewery page and gate components):
- AuthGate: `page.getByText(/Sign up to/i)`, `page.getByText(/Create Account/i)`
- StorefrontGate: `page.getByText(/Own this brewery/i)`, `page.getByText(/Claim it/i)`
- Brewery name: use the demo brewery name from seed data

### Task 3.3: Brewery Admin Interactions Spec (Strengthen Existing)

**File:** `e2e/brewery-admin-flows.spec.ts` (modify existing, 85 lines)

The current spec only verifies pages load. Add real interactions:

1. **"tap list: view beer details"**
   - Navigate to tap list, click on a beer name
   - Verify beer detail panel/modal opens with style, ABV, rating info

2. **"analytics: filter by time range and verify chart updates"**
   - Navigate to analytics, click 7d → 30d → 90d
   - Verify the content area updates (at minimum, no JS errors)

3. **"customers: search for a customer"**
   - Navigate to customers page
   - If search input exists, type a query
   - Verify results or empty state

4. **"navigate between admin sections via sidebar"**
   - Start on dashboard, click through nav: Tap List → Analytics → Customers
   - Verify URL changes and content loads for each

### Task 3.4: Claim Funnel Post-Claim (Strengthen Existing)

**File:** `e2e/claim-funnel.spec.ts` (modify existing, 82 lines)

Add test for the onboarding wizard that appears after claiming:

1. **"post-claim onboarding wizard shows 4 steps"**
   - After successful claim (existing test), verify OnboardingWizard appears
   - Verify step labels: "Upload Logo", "Add Beers", "Loyalty Program", "Preview Board"
   - Verify Next/Back navigation between steps
   - Verify Skip/Complete dismisses the wizard

**Note:** This test may need to be `test.skip` if the claim flow is not idempotent
against the dev database. Add a flag for this.

### Task 3.5: Brand Page Spec (STRETCH GOAL)

**New file:** `e2e/brand-page.spec.ts`

Only if time permits after Tasks 3.1-3.4:

1. **"brand page loads with locations"**
   - Navigate to `/brand/{slug}` for a seeded brand
   - Verify brand name, description, location cards visible
   - Verify location count matches

2. **"brand page shows map or location list"**
   - Verify BrandLocationsClient renders location cards
   - If map is present, verify it renders without JS errors

---

## Phase 4 — Unit Test Gap Fill (Days 2-4) — Dakota + Reese

### Task 4.1: Health Endpoint Tests

**New file:** `lib/__tests__/health.test.ts`

Tests the `/api/health` route handler at `app/api/health/route.ts`.

**Pattern:** Follow the cron test pattern (S147) — mock dependencies, test response shapes.

**Tests:**

1. **Auth bypass** — verify GET handler does NOT call requireAuth (health is public)
2. **200 healthy** — mock Supabase query returns success → response is
   `{ status: "healthy", database: "connected", latency_ms: number, timestamp: string, version: string }`
   with status 200 and `Cache-Control: no-store` header
3. **503 degraded** — mock Supabase query returns `{ error: { message: "..." } }` →
   response is `{ status: "degraded", database: "unreachable", latency_ms: number }`
   with status 503
4. **503 unhealthy** — mock Supabase client throws an exception →
   response is `{ status: "unhealthy", error: "Service unavailable" }` with status 503
5. **Version field** — when `VERCEL_GIT_COMMIT_SHA` is set, version is first 7 chars;
   when unset, version is "dev"

**Mocks needed:**
- `vi.mock("@/lib/supabase/service")` — mock `createServiceClient` to return a
  chainable Supabase mock (use the Proxy pattern from `cron-trial-lifecycle.test.ts` lines 19-31)
- `vi.mock("@/lib/logger")` — mock `createLogger` to return no-op logger

### Task 4.2: UserAvatar Component Tests

**New file:** `lib/__tests__/user-avatar.test.tsx`

Tests `components/ui/UserAvatar.tsx` and the `AvatarStack` export.

**Pattern:** React Testing Library (render, screen) — matches existing component tests
like `error-boundary.test.tsx` and `a11y.test.tsx`.

**Mocks needed:**
- `vi.mock("next/image")` — mock Next.js Image component to render a plain `<img>`
- `vi.mock("@/lib/xp")` — mock `getLevelFromXP` to return `{ level: 5 }`

**Tests:**

1. **Renders with avatar_url** — provide profile with avatar_url, verify `<img>` renders
   with correct alt text (display_name)
2. **Renders initials fallback** — profile without avatar_url, verify initials text
   rendered (e.g., "HR" for "Hop Reviewer")
3. **Initials for single name** — profile with display_name "Joshua", verify "J"
4. **All 5 sizes render** — iterate xs/sm/md/lg/xl, verify container has correct class
5. **Shows level badge when showLevel=true** — verify badge element with level number
6. **Hides level badge when showLevel=false** (default) — verify no badge
7. **Calculates level from XP when level not provided** — profile with xp but no level,
   verify getLevelFromXP is called
8. **Falls back to username when display_name is null** — verify fallback chain
9. **AvatarStack renders correct number of avatars** — 6 profiles with max=4,
   verify 4 avatars + "+2" overflow indicator
10. **AvatarStack renders all when under max** — 3 profiles with max=4, verify 3 avatars, no overflow
11. **AvatarStack shows no overflow for exact match** — 4 profiles with max=4, no "+0"

### Task 4.3: Expand api-helpers Tests

**File:** `lib/__tests__/api-helpers.test.ts` (modify existing, 127 lines)

The current file (lines 1-127) only tests constants and getFirstName. Add tests
for the three actual helper functions.

**Add new describe blocks:**

1. **`describe("requireAuth")`**
   - Returns user object when authenticated
   - Returns null when not authenticated (getUser returns null)
   - Mock: `supabase.auth.getUser()` return value

2. **`describe("requireBreweryAdmin")`**
   - Returns account when user has owner role
   - Returns account when user has manager role
   - Returns null when user has staff role (not in ADMIN_ROLES)
   - Returns null when no brewery_accounts row exists
   - Accepts custom roles parameter (pass STAFF_ROLES, verify staff role passes)
   - Mock: `supabase.from("brewery_accounts").select().eq().eq().maybeSingle()`

3. **`describe("requirePremiumTier")`**
   - Returns true for cask tier
   - Returns true for barrel tier
   - Returns false for tap tier
   - Returns false for free tier
   - Returns false when brewery not found (data is null)
   - Accepts custom tiers parameter
   - Mock: `supabase.from("breweries").select().eq().single()`

**Mock pattern:** Use the Proxy-based chain builder from `cron-trial-lifecycle.test.ts`
(lines 19-31) to create a mock SupabaseClient that supports deep chaining.

---

## Phase 5 — Test Infrastructure Polish (Days 4-5) — Riley + Casey

### Task 5.1: Test Isolation Audit

Review all 8 existing specs + 3 new specs for test isolation issues:

- No spec should depend on another spec's side effects
- Each authenticated spec should login fresh in `beforeEach`
- Session-creating tests must clean up in `afterEach` (end any active session)
- Claim funnel test should check for existing claim before attempting new one

### Task 5.2: Playwright Config Refinement

**File:** `playwright.config.ts`

Final configuration for hard-fail CI:

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["html"], ["github"]] : "html",
  timeout: process.env.CI ? 45_000 : 30_000,

  expect: {
    timeout: process.env.CI ? 10_000 : 5_000,
  },

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    actionTimeout: process.env.CI ? 15_000 : 10_000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

Key changes: GitHub Actions reporter for inline annotations, increased timeouts
for CI, 2 retries for flake resilience.

### Task 5.3: Add Test Tagging

Tag specs for selective CI runs:

- `@smoke` — no-auth tests (smoke.spec.ts)
- `@auth` — requires login (all authenticated specs)
- `@admin` — requires brewery admin access
- `@session` — creates/modifies session data (needs cleanup)

This enables future workflow optimizations: smoke tests can run even without
Supabase credentials as a fast-fail gate.

---

## Priority Order / Sprint Calendar

| Day | Task | Owner | Depends On |
|-----|------|-------|------------|
| 1 | 1.1 GitHub Secrets | Riley | — |
| 1 | 2.1 Expand auth helper | Reese | — |
| 1 | 2.2 Create session helper | Reese | — |
| 1 | 4.1 Health endpoint tests | Dakota | — |
| 2 | 1.2 Update CI workflow | Riley | 1.1 |
| 2 | 1.3 CI seed/cleanup script | Riley | 1.1 |
| 2 | 2.3 Brewery admin helper | Reese | — |
| 2 | 4.2 UserAvatar tests | Dakota | — |
| 3 | 1.4 Playwright config | Riley | 1.2 |
| 3 | 3.1 Session flow spec | Casey + Reese | 2.1, 2.2 |
| 3 | 4.3 Expand api-helpers tests | Dakota | — |
| 4 | 3.2 Storefront spec | Casey | 2.1 |
| 4 | 3.3 Strengthen admin flows | Reese | 2.3 |
| 4 | 3.4 Strengthen claim funnel | Casey | — |
| 5 | 5.1 Isolation audit | Casey | 3.1-3.4 |
| 5 | 5.2 Final Playwright config | Riley | 5.1 |
| 5 | 5.3 Test tagging | Reese | 5.1 |
| 5 | 3.5 Brand page spec (stretch) | Casey | if time |

**Critical path:** 1.1 → 1.2 → 1.3 → 3.1 (session flow) → 5.1 → remove continue-on-error

---

## Verification Strategy — Definition of Done

The sprint is DONE when ALL of the following are true:

### CI Gates (Hard Requirements)
- [ ] `continue-on-error: true` removed from E2E step in ci.yml
- [ ] CI workflow passes on a fresh PR with all E2E tests
- [ ] E2E tests run against real dev Supabase (not placeholders)
- [ ] CI includes seed step before E2E and cleanup step after

### E2E Coverage (Spec Count)
- [ ] 11+ E2E spec files (8 existing + 3 new: session-flow, storefront, brand-page or claim strengthened)
- [ ] Session flow spec has 4+ tests covering the full lifecycle
- [ ] Storefront spec has 4+ tests covering auth/unauth access
- [ ] All existing 8 specs continue to pass without modification (or with approved changes)

### Unit Test Coverage (S149 Retro Gaps)
- [ ] `lib/__tests__/health.test.ts` exists with 5+ tests covering all 3 response states
- [ ] `lib/__tests__/user-avatar.test.tsx` exists with 8+ tests covering render variants
- [ ] `lib/__tests__/api-helpers.test.ts` expanded with 10+ new tests for helper functions
- [ ] All 1,228+ existing unit tests still pass
- [ ] `npm run test:coverage` shows no regression

### Infrastructure
- [ ] Playwright config has CI-appropriate timeouts and retry count
- [ ] E2E helpers directory has auth.ts, session.ts, brewery.ts
- [ ] CI seed script verifies test user and demo data before E2E runs

---

## File Inventory — New and Modified

### New Files (9)
1. `e2e/session-flow.spec.ts` — full check-in lifecycle E2E tests
2. `e2e/storefront.spec.ts` — public brewery page E2E tests
3. `e2e/helpers/session.ts` — session start/end/recap helpers
4. `e2e/helpers/brewery.ts` — brewery admin navigation helpers
5. `e2e/helpers/cleanup.ts` — test data cleanup utility
6. `e2e/scripts/ci-seed.ts` — CI database seeding script
7. `e2e/scripts/ci-cleanup.ts` — CI database cleanup script
8. `lib/__tests__/health.test.ts` — health endpoint unit tests
9. `lib/__tests__/user-avatar.test.tsx` — UserAvatar component unit tests

### Modified Files (5)
1. `.github/workflows/ci.yml` — real credentials, remove soft-fail, add seed/cleanup steps
2. `playwright.config.ts` — CI timeouts, retries, GitHub reporter
3. `e2e/helpers/auth.ts` — additional utility functions
4. `e2e/brewery-admin-flows.spec.ts` — add real interaction tests
5. `lib/__tests__/api-helpers.test.ts` — add requireAuth/Admin/Tier tests

### Stretch Goal Files (1)
6. `e2e/brand-page.spec.ts` — brand page E2E tests (if time)
7. `e2e/claim-funnel.spec.ts` — post-claim onboarding tests (if time)

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Dev Supabase unreachable in CI | Medium | High | Fallback A: health-check gate. Fallback B: separate smoke job |
| Session tests create data that pollutes dev DB | Medium | Medium | CI cleanup script, scoped to test user only |
| Flaky tests from network latency | High | Medium | 2 retries, increased timeouts, `toBeVisible({ timeout })` |
| Existing specs break with real DB | Low | High | Run existing specs first locally against dev DB before CI changes |
| Claim funnel creates duplicate claims | Medium | Low | Check for existing claim, use test.skip if not idempotent |
| Test user password changes | Low | High | Store in GitHub secrets, not hardcoded |

---

## Dependencies & External Coordination

- **Riley** needs admin access to the GitHub repo settings to add secrets
- **Riley** needs the dev Supabase project credentials (URL, anon key, service role key)
- **Quinn** reviews Riley's CI changes
- **Avery** reviews all new test files before merge
- **Casey** owns the E2E test plan and signs off on coverage adequacy
- **Dakota** owns unit test gap fills and merges independently of E2E work

The unit test track (Phase 4) has ZERO dependency on the CI infrastructure track
(Phase 1). Dakota can start immediately on Day 1. The E2E spec writing track
(Phase 3) depends on Phase 2 helpers being ready, which Reese starts on Day 1.
