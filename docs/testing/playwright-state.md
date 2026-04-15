# Playwright — State of Play

*Playwright is frozen. Here's why, and what it would take to thaw.* Owned by [Casey](../../.claude/agents/casey.md) and [Reese](../../.claude/agents/qa-automation.md).

**Back to [testing](README.md) · [wiki home](../README.md).**

---

## Current state (2026-04-15)

- **Frozen since:** [Sprint 173](../history/retros/sprint-173-ci-unblock.md).
- **Location:** [e2e.frozen/](../../e2e.frozen/) — kept at repo root under that name so nobody forgets.
- **Scripts removed:** `test:e2e` is no longer in [package.json](../../package.json).
- **Dependency removed:** `@playwright/test` is no longer a devDependency.
- **CI:** no Playwright steps in [.github/workflows/ci.yml](../../.github/workflows/ci.yml).
- **Tests at freeze:** 87 specs.

Don't try to run `npm run test:e2e` — it'll fail. That's the point.

## Why we froze

Sprint 173 surfaced CI had been silently red for 106 runs. E2E was contributing a pile of flakiness on top of real failures, making the signal unreadable. The choice was:

1. Stabilize E2E (days of work, uncertain outcome).
2. Freeze E2E and re-establish green CI on the unit suite.

We picked (2). Vitest coverage has grown to 2128+ tests since; the unit suite now covers the bulk of what E2E was asserting.

## What it would take to thaw

From the [hoptrack-testing skill](../../.claude/skills/hoptrack-testing/SKILL.md) thaw checklist:

1. **Seed `hoptrack-staging`** — currently empty. Would take a half-day seed sprint (deferred).
2. **Pick a subset.** Don't try to re-run all 87. Start with the 10 that cover the critical paths (auth, session, billing webhook).
3. **Retune the flaky ones.** Most flakes were around timing, not logic.
4. **Wire into CI** as a separate job with `continue-on-error: true` until stable.
5. **Re-add `@playwright/test`** to devDependencies and the `test:e2e` script to [package.json](../../package.json).
6. **Update** [operations/ci-cd.md](../operations/ci-cd.md) and this page.

## What we ship without E2E

- Vitest unit suite as the primary safety net.
- Integration tests in [lib/__tests__/integration/](../../lib/__tests__/integration/) cover cross-module flows.
- Manual QA before major releases — Casey's regression pass.
- The [operations/launch-checklist.md](../operations/launch-checklist.md) gate.

## Cross-links

- [Sprint 173 CI unblock retro](../history/retros/sprint-173-ci-unblock.md) — the story.
- [testing/README.md](README.md) — current state of testing.
- [hoptrack-testing skill](../../.claude/skills/hoptrack-testing/SKILL.md).
