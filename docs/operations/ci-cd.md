# CI/CD — Operations View

*How HopTrack ships, scheduled jobs, and who to ping when CI is red.* Owned by [Riley](../../.claude/agents/riley.md) and [Quinn](../../.claude/agents/infra-engineer.md).

**Back to [operations](README.md) · [wiki home](../README.md).**

The engineering-facing blueprint lives in [architecture/ci-cd.md](../architecture/ci-cd.md). This page is the **operations view**: where workflows run, what they cost, and what to do when they fail.

---

## The continuous-integration pipeline

Every push to `main` and every PR triggers [.github/workflows/ci.yml](../../.github/workflows/ci.yml). The job is a single `build` runner that flows:

1. **Install dependencies** — Sprint 173 workaround for npm bug #4828 (lockfile regenerated on macOS, Rolldown optional deps missing). See [Sprint 173 CI unblock](../history/retros/sprint-173-ci-unblock.md).
2. **Lint** — `npm run lint` (all warnings + errors).
3. **Lint --quiet regression guard** — errors only; makes regressions loud in CI annotations.
4. **Type check** — `npx tsc --noEmit`.
5. **Wiki link check** — `npm run docs:check-links` via [scripts/check-wiki-links.mjs](../../scripts/check-wiki-links.mjs). Added Sprint 178+ wiki reorg.
6. **Unit tests** — `npm run test:coverage` (Vitest, 2128+ tests).
7. **Build** — `npm run build` with placeholder env vars so no real secrets are needed.

**Rule #1 when CI is red:** read it. The [hoptrack-debug skill](../../.claude/skills/hoptrack-debug/SKILL.md) starts with "check CI first." The Sprint 173 lesson was 106 silently-red runs — that does not happen to us again.

## The scheduled workflows

All live in [.github/workflows/](../../.github/workflows/):

| Workflow | File | Schedule | Purpose | Ops escalation |
|---|---|---|---|---|
| **Barback** | [barback.yml](../../.github/workflows/barback.yml) | cron | AI beer crawler ([REQ-071](../requirements/REQ-071-the-barback-ai-beer-crawler.md)) | Riley → Jordan. Cost watch via Anthropic usage. |
| **AI suggestions** | [ai-suggestions.yml](../../.github/workflows/ai-suggestions.yml) | cron | Haiku-powered recs ([REQ-079](../requirements/REQ-079-promotion-hub.md)) | Riley. Usage metric in Haiku dashboard. |
| **Weekly digest** | [weekly-digest.yml](../../.github/workflows/weekly-digest.yml) | weekly | Brewery digest email ([REQ-072](../requirements/REQ-072-multi-location-brewery-support.md)) | Parker + Riley. Check [email-routing.md](email-routing.md) if digests fail. |
| **Stats snapshot** | [stats-snapshot.yml](../../.github/workflows/stats-snapshot.yml) | nightly | KPI rollup ([REQ-069](../requirements/REQ-069-enhanced-kpis-analytics.md), [REQ-104](../requirements/REQ-104-intelligence-layer.md)) | Riley. Snapshot writes to Supabase. |
| **Onboarding drip** | [onboarding-drip.yml](../../.github/workflows/onboarding-drip.yml) | daily | New brewery email cadence | Parker + Riley. |
| **Trial lifecycle** | [trial-lifecycle.yml](../../.github/workflows/trial-lifecycle.yml) | daily | Trial expiration + conversion ([REQ-089](../requirements/REQ-089-stripe-billing.md)) | Taylor + Riley. Stripe + email. |
| **Staging deploy** | [staging.yml](../../.github/workflows/staging.yml) | manual | Deploy-to-staging trigger | Riley. See [staging-env-setup.md](staging-env-setup.md). |

## Secrets & env

- **CI secrets** — GitHub repo Actions secrets. Configured [Sprint 150](../history/retros/sprint-150-retro.md).
- **Build env** — CI uses placeholder values so no real Supabase/Stripe secrets hit logs. Production env is separated entirely.
- **Rotation cadence** — quarterly; owner Riley.

## When something breaks

1. **CI red on PR** — fix before merging. Do NOT merge a red build. Don't skip hooks with `--no-verify`.
2. **CI red on main** — top priority. Post in team chat, page Riley if infra, page Jordan if code. Historical context: [Sprint 173 CI unblock](../history/retros/sprint-173-ci-unblock.md).
3. **Scheduled workflow failed** — check the Actions tab for the failed run, read the error, fix the underlying issue (NOT the schedule). See [hoptrack-debug skill](../../.claude/skills/hoptrack-debug/SKILL.md).
4. **Deploy failed** — rollback per [launch-day-ops.md](launch-day-ops.md).

## Cross-links

- **Engineering view** — [architecture/ci-cd.md](../architecture/ci-cd.md).
- **Debug order** — [hoptrack-debug skill](../../.claude/skills/hoptrack-debug/SKILL.md).
- **Launch day** — [launch-day-ops.md](launch-day-ops.md).
- **Staging environment** — [staging-environment.md](staging-environment.md), [staging-env-setup.md](staging-env-setup.md).
- **Uptime monitoring** — [uptime-monitoring.md](uptime-monitoring.md).

---

> **Status (2026-04-15):** 8 workflows documented with owners and escalation paths. If a new workflow lands, add a row to the table above and file its ownership with Riley.
