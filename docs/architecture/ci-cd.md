# CI / CD — Engineering View

*The engineering angle on how HopTrack ships. The ops runbook is [operations/ci-cd.md](../operations/ci-cd.md).* Owned by [Riley](../../.claude/agents/riley.md) and [Jordan](../../.claude/agents/jordan.md).

**Back to [architecture](README.md) · [wiki home](../README.md).**

---

## Pipeline shape

One job, one runner. Steps in order:

1. Checkout
2. Install (Sprint 173 workaround — drop `package-lock.json` and `npm install` because of [npm bug #4828](https://github.com/npm/cli/issues/4828) on Rolldown optional deps)
3. `npm run lint`
4. `npm run lint -- --quiet` (regression guard)
5. `npx tsc --noEmit`
6. `npm run docs:check-links` (wiki link validation — added Sprint 178+)
7. `npm run test:coverage`
8. `npm run build` with placeholder env

Workflow: [.github/workflows/ci.yml](../../.github/workflows/ci.yml).

## The Sprint 173 "check CI first" rule

From [Sprint 173 CI unblock retro](../history/retros/sprint-173-ci-unblock.md): CI was silently red for **106 runs** while retros said green. The fix was 5 commits — lint, types, tests, build env, and E2E freeze. The cultural fix is baked into the [hoptrack-debug skill](../../.claude/skills/hoptrack-debug/SKILL.md): **Rule #1 when anything is broken — check CI first.**

Ritual guards:

- `gh run list` at sprint open and close.
- `--quiet` lint second pass surfaces errors in a noisy warning stream.
- No "pre-existing" memory hole: if a test was broken before, we still track it.

## Pre-existing debt rule

The Sprint 173 lesson includes a testing rule ([hoptrack-testing skill](../../.claude/skills/hoptrack-testing/SKILL.md)): if a test is failing when you arrive, don't mark it `.skip` and move on. Triage it, fix it, or file it — but don't let CI learn to ignore it.

## Scheduled workflows

Eight of them — ops view in [operations/ci-cd.md](../operations/ci-cd.md) has the full table with owners and escalation paths. Engineering-side notes:

- **Barback** uses Sonnet and has a dollar cap.
- **AI suggestions** uses Haiku.
- **Digest**, **onboarding-drip**, **trial-lifecycle** are pure data pipelines with no AI — they call Resend.
- **Stats snapshot** writes back to Supabase via service role.
- **Staging deploy** is manual-trigger only.

## Deploy target

Production runs on Vercel. The build succeeds on Vercel with the same env pattern as CI but real credentials. Sentry ingests errors from all environments; tags separate `production` / `staging` / `preview`.

## Pre-commit + pre-push

We don't ship hooks that block local work — commits can fail CI without blocking your branch. The Sprint 173 lesson is that **CI is the only authoritative gate**. Don't skip it with `--no-verify`.

## Cross-links

- [operations/ci-cd.md](../operations/ci-cd.md) — ops runbook.
- [testing/README.md](../testing/README.md) — the test suite CI enforces.
- [hoptrack-debug skill](../../.claude/skills/hoptrack-debug/SKILL.md) — the debug playbook.
