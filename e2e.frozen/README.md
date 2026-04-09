# E2E Tests — FROZEN 🧊

**Status:** On ice since Sprint 173 (2026-04-09)
**Reason:** `hoptrack-staging` Supabase instance is empty (0 tables, 0 migrations). Running E2E against an empty DB means every auth-dependent test times out on login → 45s × 2 retries × 112 tests = ~4 hours of dead test time per CI run.
**Decision:** Freeze the entire E2E infrastructure until staging is seeded AND we're ready to invest in maintaining the suite again.

## What's in here

This directory contains the complete HopTrack E2E test infrastructure that was previously at `/e2e` + `/playwright.config.ts` at the repo root. Nothing was deleted — everything was moved here verbatim.

```
e2e.frozen/
├── README.md                         (this file)
├── playwright.config.ts              (moved from repo root)
├── helpers/
│   ├── auth.ts                       (TEST_USER, login helper)
│   ├── brewery.ts                    (BREWERIES IDs, nav helpers)
│   └── session.ts                    (session flow helpers)
├── scripts/
│   └── global-setup.ts               (verifies test data exists pre-run)
└── *.spec.ts                         (16 spec files, 112 tests total)
    ├── achievements-loyalty.spec.ts
    ├── auth.spec.ts
    ├── brewery-admin-extended.spec.ts
    ├── brewery-admin-flows.spec.ts
    ├── brewery-admin.spec.ts
    ├── claim-funnel.spec.ts
    ├── core-flows.spec.ts
    ├── discover.spec.ts
    ├── engagement.spec.ts
    ├── hoproute.spec.ts
    ├── session-flow.spec.ts
    ├── smoke.spec.ts
    ├── social-flows.spec.ts
    └── storefront.spec.ts
```

## Why the full freeze (vs. `if: false` in CI)

1. **`if: false`** leaves a phantom job in every CI run (marked "skipped" in the GitHub Actions UI). Noise.
2. Playwright in `devDependencies` still installs on every `npm ci` — adds ~500MB to CI install time for zero value.
3. Spec files sit in `/e2e/` at the repo root, visible in every directory listing — onboarding confusion ("are these tests running?").
4. The `test:e2e` npm scripts still exist, inviting someone to run them locally and get a confusing wall of errors.

Moving everything under `/e2e.frozen/` makes the "on ice" state immediately obvious and physically separates frozen infrastructure from active code.

## What changed in the main repo when we froze

- `/e2e/` → `/e2e.frozen/` (git mv — history preserved)
- `/playwright.config.ts` → `/e2e.frozen/playwright.config.ts`
- `.github/workflows/ci.yml` — entire `e2e:` job deleted
- `package.json` — `@playwright/test` removed from devDependencies, `test:e2e` + `test:e2e:ui` scripts removed
- `package-lock.json` — regenerated without Playwright (smaller, faster installs)
- `memory/feedback_staging_supabase_empty.md` — still documents the seed ops sprint (unchanged)
- `.claude/skills/hoptrack-testing/SKILL.md` — updated to reflect the frozen state

## How to thaw

When you're ready to bring E2E back — typically after `hoptrack-staging` is seeded OR when you're ready to invest in E2E maintenance — follow these steps:

### Prerequisite: seed `hoptrack-staging`

Per `memory/feedback_staging_supabase_empty.md`:

1. Install Supabase CLI if not already: `brew install supabase/tap/supabase`
2. Authenticate: `supabase login`
3. Link to staging: `supabase link --project-ref <hoptrack-staging-ref>`
4. Push all migrations: `supabase db push` (applies all ~103 migrations)
5. Create test user in Supabase Dashboard:
   - Email: `testflight@hoptrack.beer`
   - Password: `HopTrack2026!`
   - Auto Confirm User: **YES**
6. Run seed SQL in SQL Editor (in order):
   - `supabase/migrations/024_seed_demo_data.sql`
   - `supabase/migrations/025_testflight_brewery_admin.sql`
   - `supabase/seeds/008_testflight_user.sql`

### Thaw steps

1. **Move the files back:**
   ```bash
   git mv e2e.frozen/playwright.config.ts playwright.config.ts
   git mv e2e.frozen e2e
   rm e2e/README.md   # this file — no longer needed
   ```

2. **Re-add Playwright to devDependencies:**
   ```bash
   npm install --save-dev @playwright/test@latest
   ```

3. **Re-add npm scripts** to `package.json`:
   ```json
   "test:e2e": "npx playwright test",
   "test:e2e:ui": "npx playwright test --ui",
   ```

4. **Install Playwright browsers:**
   ```bash
   npx playwright install --with-deps chromium
   ```

5. **Run the suite locally first** to see what's rotted:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL="<staging-url>" \
   NEXT_PUBLIC_SUPABASE_ANON_KEY="<staging-anon-key>" \
   SUPABASE_SERVICE_ROLE_KEY="<staging-service-role-key>" \
   npm run test:e2e
   ```

6. **Fix whatever broke during the freeze:**
   - Selectors that reference changed components
   - Routes that were renamed
   - Type changes in helpers
   - New features that need test coverage (or existing tests that now cover different behavior)

7. **Add the E2E job back to `.github/workflows/ci.yml`.** The original job is preserved in git history at commit `dbafee0` (or whatever the commit right before the freeze was). Use `git show` to recover the exact config:
   ```bash
   git log --oneline --all -- .github/workflows/ci.yml | head -5
   git show <commit-before-freeze>:.github/workflows/ci.yml
   ```
   Key pieces to preserve:
   - Health check gate with `NEXT_PUBLIC_SUPABASE_URL` from secrets
   - Playwright `reuseExistingServer: true` pattern (S173 port-conflict lesson)
   - `continue-on-error: false` this time — we want E2E to actually gate CI

8. **Add the GitHub Actions secrets** (if not already there):
   - `E2E_SUPABASE_URL`
   - `E2E_SUPABASE_ANON_KEY`
   - `E2E_SUPABASE_SERVICE_ROLE_KEY`

9. **Update `.claude/skills/hoptrack-testing/SKILL.md`** — remove the "FROZEN" section, re-add the active E2E guidance.

10. **Update `docs/claude-code-setup.md`** — flip E2E from "frozen" to "active" in the setup guide.

11. **Run CI and confirm green.**

12. **Add a new test** — it's a good sanity check that the thaw worked AND it justifies reopening the investment.

## What to do with broken tests during the freeze

**Don't fix them during the freeze.** The whole point of freezing is to stop paying maintenance tax on E2E while other priorities take over. If a teammate is tempted to "just fix one test," remind them that the suite isn't running anywhere — fixing one test doesn't unfreeze the rest.

If E2E coverage for a specific flow is genuinely blocking a decision (e.g., "we don't know if the payment flow works end-to-end"), the right answer is:
1. Expand unit test coverage for that specific flow (Vitest + React Testing Library)
2. Manual QA the flow with Casey
3. Defer the decision until the E2E thaw

## Related

- `memory/feedback_staging_supabase_empty.md` — The seed ops sprint that unlocks the thaw
- `docs/retros/sprint-173-ci-unblock.md` — The full story of why E2E got frozen
- `.claude/skills/hoptrack-testing/SKILL.md` — Current testing standards (unit tests are still active)
- `.claude/skills/hoptrack-debug/SKILL.md` — Debug playbook (check CI first rule)

---

*Frozen with love. Waiting for the thaw.* 🧊🍺
