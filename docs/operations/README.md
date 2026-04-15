# Operations ⚙️

*Running HopTrack in production.* Owned by [Riley](../../.claude/agents/riley.md) and [Quinn](../../.claude/agents/infra-engineer.md).

**Back to [wiki home](../README.md).**

---

## The launch checklist

The living pre-launch gate lives in [launch-checklist.md](launch-checklist.md). It tracks completion across security, infra, billing, legal, and ops. Sprint 149 pulled it from 56% → 59%; Sprint 151 got it to 67%.

When we go live, the playbook is [launch-day-ops.md](launch-day-ops.md) — who's on call, where the dashboards live, how to roll back.

## The ops pages

- **[launch-checklist.md](launch-checklist.md)** — the gate.
- **[launch-day-ops.md](launch-day-ops.md)** — the playbook.
- **[connection-pooling.md](connection-pooling.md)** — Supabase pgBouncer config, query pool sizing, the transaction-vs-session decision.
- **[rate-limit-upgrade.md](rate-limit-upgrade.md)** — the rate-limit stack, per-route limits, the Sprint 137 audit that closed the gaps.
- **[staging-environment.md](staging-environment.md)** — how staging is configured. Merged with the old `ops/STAGING-ENV-SETUP.md`, now [staging-env-setup.md](staging-env-setup.md).
- **[uptime-monitoring.md](uptime-monitoring.md)** — where uptime is tracked, the `/api/health` endpoint, what pages oncall.
- **[email-routing.md](email-routing.md)** — Resend setup, transactional vs marketing split, the Sprint 75 rollout.

## CI/CD

The engineering view of CI lives in [architecture/ci-cd.md](../architecture/ci-cd.md). The **ops view** — how crons are scheduled, where they run, who gets paged when they fail — is the companion [ci-cd.md](ci-cd.md) *(to write)* in this folder. The eight workflows in [.github/workflows/](../../.github/workflows/) are:

- [ci.yml](../../.github/workflows/ci.yml) — PR + push CI (lint, types, tests, build).
- [barback.yml](../../.github/workflows/barback.yml) — the AI crawler (see [REQ-071](../requirements/REQ-071-the-barback-ai-beer-crawler.md)).
- [ai-suggestions.yml](../../.github/workflows/ai-suggestions.yml) — Haiku-powered suggestions.
- [weekly-digest.yml](../../.github/workflows/weekly-digest.yml) — brewery weekly digest emails.
- [stats-snapshot.yml](../../.github/workflows/stats-snapshot.yml) — nightly stats rollup.
- [onboarding-drip.yml](../../.github/workflows/onboarding-drip.yml) — new brewery onboarding email cadence.
- [trial-lifecycle.yml](../../.github/workflows/trial-lifecycle.yml) — trial expiration warnings + conversions.
- [staging.yml](../../.github/workflows/staging.yml) — deploy-to-staging trigger.

## Cross-links

- **Security and fraud**: [compliance/security-and-fraud-prevention.md](../compliance/security-and-fraud-prevention.md).
- **GDPR/CCPA**: [compliance/gdpr-ccpa.md](../compliance/gdpr-ccpa.md).
- **Brewery ops review** (Drew's real-world filter): [archive/drew-brewery-ops-review.md](../archive/drew-brewery-ops-review.md) — keep for context, superseded by in-line ops docs.

## When something breaks

Follow the order in the [hoptrack-debug skill](../../.claude/skills/hoptrack-debug/SKILL.md). **Rule #1: check CI first.** Then browser console, then server logs, then database state, then reproduce locally.

---

> **Status (2026-04-15):** all linked docs exist and are current. `ci-cd.md` (ops view) is the one remaining stub — Riley owns Wave 4.
