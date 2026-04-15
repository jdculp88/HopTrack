# Vitest Guide

*How we write tests at HopTrack.* Owned by [Casey](../../.claude/agents/casey.md) and [Reese](../../.claude/agents/qa-automation.md).

**Back to [testing](README.md) · [wiki home](../README.md).**

---

## The basics

- **Runner:** Vitest (not Jest). Config: [vitest.config.ts](../../vitest.config.ts).
- **Environment:** jsdom for DOM tests, node otherwise. Vitest picks based on imports.
- **Location:** colocated under `__tests__/` next to the code. Never in a top-level `tests/` dir.
- **Run locally:** `npm test` (full), `npm test -- --watch`, `npm test -- path/to/file.test.ts`.
- **CI command:** `npm run test:coverage` — runs via [.github/workflows/ci.yml](../../.github/workflows/ci.yml).

## The Supabase mock pattern

Almost every test that touches business logic needs a Supabase client stub. The canonical pattern is `createMockClient(): any`:

```ts
import { createMockClient } from "@/lib/__tests__/msw-handlers";
const client = createMockClient();
client.from("beers").select("*")...; // chainable, returns { data, error }
```

Live examples in [lib/__tests__/msw-handlers.ts](../../lib/__tests__/msw-handlers.ts). Full reasoning in the [hoptrack-testing skill](../../.claude/skills/hoptrack-testing/SKILL.md).

## Factories

Hand-written factories live in [lib/__tests__/factories.ts](../../lib/__tests__/factories.ts). Prefer these over hand-building fixtures.

## When a test should exist

From the [hoptrack-testing skill](../../.claude/skills/hoptrack-testing/SKILL.md):

1. **Every business logic function** — one test per function, covering the happy path and at least one error case.
2. **Every API route** — one test per handler minimum. Brand-aware routes get auth-boundary tests.
3. **Every hook** — behavior tests, not implementation tests.
4. **Every schema** — parse-valid and parse-invalid.
5. **Every migration** — if it writes data or changes RLS, add a guard test in [lib/__tests__/](../../lib/__tests__/).

## Cross-cutting guards

These run on every push and are the safety net. Keep them passing:

- [lib/__tests__/api-response-patterns.test.ts](../../lib/__tests__/api-response-patterns.test.ts)
- [lib/__tests__/brand-routes-use-shared-auth.test.ts](../../lib/__tests__/brand-routes-use-shared-auth.test.ts)
- [lib/__tests__/dry-patterns.test.ts](../../lib/__tests__/dry-patterns.test.ts)
- [lib/__tests__/motion-imports.test.ts](../../lib/__tests__/motion-imports.test.ts)
- [lib/__tests__/orphaned-columns-guard.test.ts](../../lib/__tests__/orphaned-columns-guard.test.ts)
- [lib/__tests__/rls-safety.test.ts](../../lib/__tests__/rls-safety.test.ts)
- [lib/__tests__/stat-write-paths.test.ts](../../lib/__tests__/stat-write-paths.test.ts)
- [lib/__tests__/type-safety-audit.test.ts](../../lib/__tests__/type-safety-audit.test.ts)
- [lib/__tests__/use-cache-audit.test.ts](../../lib/__tests__/use-cache-audit.test.ts)
- [lib/__tests__/wcag-skip-links.test.ts](../../lib/__tests__/wcag-skip-links.test.ts)

## The pre-existing debt rule

Sprint 173 lesson: if a test is failing when you arrive, don't `.skip` it and move on. Triage it, fix it, or file it as a sprint task. Do not normalize CI ignoring failures.

## Cross-links

- [testing/README.md](README.md) — the strategy.
- [testing/coverage-map.md](coverage-map.md) — reverse RTM.
- [testing/playwright-state.md](playwright-state.md) — the frozen E2E story.
- [hoptrack-testing skill](../../.claude/skills/hoptrack-testing/SKILL.md) — the full operational reference.
