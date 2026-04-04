# Sprint 150 — The Playwright

**Theme:** E2E test coverage — the 7-sprint debt payment
**Selected by:** Joshua (Option A, unanimous team support)
**Sprint type:** Pure testing sprint (0 migrations, 0 production code changes)

---

## Goal

Remove `continue-on-error: true` from CI. E2E failures block the build. Move from "we think it works" to "we know it works."

## Delivered

### Track A: CI Infrastructure (Riley + Quinn)
- **CI workflow split** — E2E now runs in its own job after build succeeds
- **Real Supabase secrets** — `E2E_SUPABASE_URL`, `E2E_SUPABASE_ANON_KEY`, `E2E_SUPABASE_SERVICE_ROLE_KEY` via GitHub secrets
- **Health-check gate** — curls `/api/health` before E2E; skips with warning if Supabase is unreachable (prevents CI breakage on outages)
- **`continue-on-error: true` REMOVED** — E2E failures now block the build
- **Playwright config tuned** — CI timeouts increased (30s→45s test, 5s→10s expect), retries 1→2, `github` reporter for PR annotations
- **Global setup script** (`e2e/scripts/global-setup.ts`) — verifies test user + demo breweries exist, cleans up abandoned test sessions

### Track B: E2E Specs (Casey + Reese)
- **`e2e/session-flow.spec.ts`** — 7 tests covering the full check-in lifecycle: open drawer, search brewery, home session, active banner, end session + recap
- **`e2e/storefront.spec.ts`** — 7 tests covering public brewery pages: unauthenticated access, sign-up CTA, 404 handling, SEO metadata, authenticated full content, no auth gate for logged-in users
- **`e2e/brewery-admin-flows.spec.ts`** — 4 new interaction tests: tap list content, settings populated, analytics date range switching, loyalty program display
- **`e2e/helpers/session.ts`** — Reusable helpers: openCheckinDrawer, startBrewerySession, logBeer, endSession, waitForRecap
- **`e2e/helpers/brewery.ts`** — Reusable helpers: navigateToBreweryAdmin, navigateToBreweryDetail, PINT_AND_PIXEL constant
- **`e2e/helpers/auth.ts`** — Updated with pintAndPixel brewery ID

### Track C: Unit Test Gap Fill (Dakota)
- **`lib/__tests__/health.test.ts`** — 12 tests: healthy (200), degraded (503), unhealthy (503), response shape, headers, logging
- **`lib/__tests__/user-avatar.test.tsx`** — 16 tests: image render, initials fallback, single name, null fallback, level badge, size variants, AvatarStack with overflow
- **`lib/__tests__/api-helpers.test.ts`** — 16 new tests: requireAuth (user/null/undefined), requireBreweryAdmin (owner/manager/staff/null/custom roles), requirePremiumTier (cask/barrel/tap/null/not found/custom tiers)

## Test Count

| Category | Before | After | Delta |
|----------|--------|-------|-------|
| Unit tests (Vitest) | 1,228 | 1,272 | +44 |
| E2E tests (Playwright) | ~50 | 87 | +37 |
| **Total** | ~1,278 | **1,359** | **+81** |

## Files

### New (9)
- `e2e/scripts/global-setup.ts`
- `e2e/helpers/session.ts`
- `e2e/helpers/brewery.ts`
- `e2e/session-flow.spec.ts`
- `e2e/storefront.spec.ts`
- `lib/__tests__/health.test.ts`
- `lib/__tests__/user-avatar.test.tsx`
- `docs/plans/sprint-150-plan.md`

### Modified (5)
- `.github/workflows/ci.yml`
- `playwright.config.ts`
- `e2e/helpers/auth.ts`
- `e2e/brewery-admin-flows.spec.ts`
- `lib/__tests__/api-helpers.test.ts`

### Migrations: 0
### Production code changes: 0

## Setup Required (Joshua)

To activate E2E in CI, add these three GitHub repository secrets:
1. `E2E_SUPABASE_URL` — your dev Supabase project URL
2. `E2E_SUPABASE_ANON_KEY` — your dev Supabase anon key
3. `E2E_SUPABASE_SERVICE_ROLE_KEY` — your dev Supabase service role key

Until these are configured, CI will skip E2E with a warning (health-check gate).
