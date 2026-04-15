# Sprint 76 — The Safety Net
**PM:** Morgan | **Date:** 2026-03-31
**Arc:** Launch or Bust (Sprints 75-78)

> Revenue plumbing is done. Email is wired. Before we go live, we need to know the build won't break silently. This sprint adds the CI/CD pipeline and staging environment — the last two P0 infrastructure items before launch.

---

## Goals

### Goal 1: GitHub Actions CI/CD (F-004)
**Owner:** Riley + Quinn (Infrastructure) | **Reviewer:** Jordan (Architecture)

Every push to `main` should prove the app still builds. Right now we trust the team (and we should), but one bad merge away from launch is one too many.

**Deliverables:**
1. **GitHub Actions workflow** (`.github/workflows/ci.yml`) — runs on push to `main` and pull requests:
   - Lint (`npm run lint`)
   - Type check (`npx tsc --noEmit`)
   - Build (`npm run build`)
   - Playwright E2E tests (`npm run test:e2e`) — only if build passes, marked `continue-on-error` since CI lacks a live Supabase instance
   - Uses Node 22, caches `node_modules` and `.next/cache`
   - Uploads Playwright HTML report as artifact on failure
2. **Build status badge** in `README.md` — visible proof the build is green
3. **Playwright CI optimization** — already CI-aware (`retries: 1`, `workers: 1`, `forbidOnly` in CI). Just needs to run in the workflow.

**Convention:** CI is a safety net, not a gate. We still push to `main` directly. If CI fails, we fix it — we don't block on it.

### Goal 2: Staging Environment Configuration (F-005)
**Owner:** Riley + Quinn (Infrastructure) | **Reviewer:** Jordan (Architecture)

Document how to stand up and use a staging environment so we can test against real data without touching production.

**Deliverables:**
1. **Staging branch workflow** — pushes to `staging` branch trigger a separate CI workflow (lint + type check + build, no E2E)
2. **Staging environment documentation** — `docs/staging-environment.md` covering:
   - How to set up a staging Supabase project
   - How to run migrations against staging (`npm run db:migrate:staging`)
   - How to seed staging with test data
   - How to deploy to staging via Vercel preview deployments
   - Environment variable setup (staging vars already in `.env.local.example`)
3. **GitHub Actions staging workflow** (`.github/workflows/staging.yml`) — runs on push to `staging`:
   - Same checks as CI (lint, type check, build)
   - Does NOT run E2E (staging has its own DB, not wired to CI)

---

## Out of Scope
- Unit test framework (Vitest/Jest) — future sprint
- Production deployment automation via CI — manual Vercel deploy stays for now
- Creating the actual staging Supabase project — requires dashboard access
- Changing the push-to-main workflow — CI is a safety net, not a gate

## Dependencies
- GitHub repository access (for Actions)
- Vercel project linked to repo (for preview deploys on staging branch)

## Success Criteria
- [ ] Push to `main` triggers lint + type check + build + E2E
- [ ] Push to `staging` triggers lint + type check + build
- [ ] README shows build status badge
- [ ] `docs/staging-environment.md` covers full staging setup
- [ ] `npm run build` still passes clean
- [ ] Existing Playwright tests run in CI (continue-on-error until Supabase is wired)

---

*"The migration pipeline was phase one. This is phase two. No more shipping blind." — Riley*
