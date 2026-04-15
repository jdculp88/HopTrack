# Testing 🧪

*How HopTrack proves it works.* Owned by [Casey](../../.claude/agents/casey.md) and [Reese](../../.claude/agents/qa-automation.md).

**Back to [wiki home](../README.md).**

---

## The state of testing (2026-04-15)

- **Vitest** is the active suite — **2128 tests** as of [Sprint 178](../history/retros/sprint-178-retro.md), colocated in `__tests__/` directories next to the code they cover.
- **Playwright** E2E is **frozen** in [e2e.frozen/](../../e2e.frozen/) since [Sprint 173](../history/retros/sprint-173-ci-unblock.md). The `test:e2e` script and `@playwright/test` devDependency were removed. Do not attempt to run it without a thaw plan.
- **CI** runs Vitest on every push via [.github/workflows/ci.yml](../../.github/workflows/ci.yml). Casey's rule lives in the [hoptrack-debug skill](../../.claude/skills/hoptrack-debug/SKILL.md): **check CI first.** S173 cost us 106 silently-red runs — never again.

## Where tests live

Tests are colocated, not centralized. The convention is `<module>/__tests__/<name>.test.ts`:

- [lib/__tests__/](../../lib/__tests__/) — the biggest bucket, everything in `lib/` gets unit-tested here. Examples: [schemas.test.ts](../../lib/__tests__/schemas.test.ts), [rls-safety.test.ts](../../lib/__tests__/rls-safety.test.ts), [crm.test.ts](../../lib/__tests__/crm.test.ts), [tier-gates.test.ts](../../lib/__tests__/tier-gates.test.ts).
- [components/__tests__/](../../components/__tests__/) — React component tests. Examples: [theme-toggle.test.tsx](../../components/__tests__/theme-toggle.test.tsx), [SensoryNotesPicker.test.tsx](../../components/__tests__/SensoryNotesPicker.test.tsx).
- [hooks/__tests__/](../../hooks/__tests__/) — custom hooks. Examples: [useHaptic.test.ts](../../hooks/__tests__/useHaptic.test.ts), [useLongPress.test.ts](../../hooks/__tests__/useLongPress.test.ts), [useDetentSheet.test.ts](../../hooks/__tests__/useDetentSheet.test.ts).
- [e2e.frozen/](../../e2e.frozen/) — Playwright specs, frozen. 87 tests at freeze time.

## Deep dives

- **[vitest-guide.md](vitest-guide.md)** *(to write)* — how to write a test that matches our patterns. The `createMockClient(): any` Supabase mock pattern. Cross-links to the [hoptrack-testing skill](../../.claude/skills/hoptrack-testing/SKILL.md).
- **[playwright-state.md](playwright-state.md)** *(to write)* — what's frozen, why, what a thaw would cost. The [Sprint 173 CI unblock](../history/retros/sprint-173-ci-unblock.md) story.
- **[coverage-map.md](coverage-map.md)** *(to write)* — which REQs have tests, which don't, where the gaps are. This is the **reverse index**: test file → REQ(s) it covers.

## Traceability

The [RTM in requirements/README.md](../requirements/README.md) goes REQ → test. This folder's **coverage-map.md** goes test → REQ. Between them, any cell in the matrix is reachable.

If you ship a feature without a test, the RTM will flag it with `⚠️ gap` and Casey will find you. We'd rather flag it honestly than pretend.

## Running tests locally

```bash
npm test              # full Vitest suite
npm test -- --watch   # watch mode
npm test -- path/to/file.test.ts   # single file
```

CI runs the same command. If it passes locally it should pass in CI — if not, see the [hoptrack-debug skill](../../.claude/skills/hoptrack-debug/SKILL.md) debug playbook.

---

> **Status (2026-04-15):** this README exists and links everywhere real. `vitest-guide.md`, `playwright-state.md`, and `coverage-map.md` are still to write — Casey and Reese own Wave 4.
