# Architecture Blueprint 🏛️

*How HopTrack is built.* Owned by [Avery](../../.claude/agents/avery.md) and [Jordan](../../.claude/agents/jordan.md).

**Back to [wiki home](../README.md).**

---

## The ten-thousand-foot view

HopTrack is a Next.js 16 App Router application backed by Supabase, styled with Tailwind v4, animated with Framer Motion, and shipped through GitHub Actions. It has two faces: a consumer app (check-ins, XP, feed) under [app/(consumer)/](../../app/) and a brewery dashboard under [app/(brewery)/](../../app/). Both lean on a shared library of primitives in [lib/](../../lib/), hooks in [hooks/](../../hooks/), and typed Supabase clients in [types/](../../types/).

Start at [system-overview.md](system-overview.md) for the end-to-end picture. Jump to any subsystem from there.

## The blueprint (what each page covers)

- **[system-overview.md](system-overview.md)** — the whole thing on one page: request flow, consumer vs brewery routes, how the [API layer](api-layer.md) wraps Supabase, how [realtime](realtime.md) feeds the UI, where [billing](billing-and-stripe.md) sits.

- **[tech-stack.md](tech-stack.md)** *(to write)* — Next.js 16.2.1 App Router conventions, Tailwind v4 CSS variables, Supabase SSR v0.9, Framer Motion rules. Cross-links to the [hoptrack-conventions skill](../../.claude/skills/hoptrack-conventions/SKILL.md).

- **[data-model.md](data-model.md)** *(to write)* — Supabase schema, key tables, and how they relate. Owned by [Riley](../../.claude/agents/riley.md) and [Quinn](../../.claude/agents/infra-engineer.md). Cross-links to [supabase/migrations/](../../supabase/migrations/) and the [supabase-migration skill](../../.claude/skills/supabase-migration/SKILL.md).

- **[auth-and-rls.md](auth-and-rls.md)** *(to write)* — Supabase SSR auth, RLS policies, the `requireAuth` helper in [lib/auth/](../../lib/), brand team role scoping (see [REQ-072](../requirements/REQ-072-multi-location-brewery-support.md)).

- **[api-layer.md](api-layer.md)** *(to write)* — route patterns, `apiSuccess`/`apiError` helpers in [lib/api-response.ts](../../lib/), Zod schemas in [lib/schemas/](../../lib/), rate limiting (see [operations/rate-limit-upgrade.md](../operations/rate-limit-upgrade.md)).

- **[realtime.md](realtime.md)** *(to write)* — Supabase Realtime channels for tap lists and presence ([REQ shipped S156](../history/retros/sprint-156-retro.md)), the `use cache` boundary ([S158](../history/retros/sprint-158-retro.md)).

- **[intelligence-layer.md](intelligence-layer.md)** *(to write)* — the AI and analytics engine: Barback crawler ([REQ-071](../requirements/REQ-071-the-barback-ai-beer-crawler.md)), Concierge ([S178](../history/retros/sprint-178-retro.md)), Magic Number + Brewery Health ([S158-159](../history/)), Smart Recommendations.

- **[multi-location-brand.md](multi-location-brand.md)** *(to write)* — the brand ↔ location ↔ tap list rollup. See [REQ-072](../requirements/REQ-072-multi-location-brewery-support.md) and the Multi-Location arc ([sprints 114-137](../history/README.md)).

- **[billing-and-stripe.md](billing-and-stripe.md)** *(to write)* — Stripe subscriptions, brand-level billing ([sprint 121](../history/retros/sprint-121-retro.md)), tier enforcement via `checkBrandCovered`, the three tiers (Tap/Cask/Barrel — see [sales/pricing-and-tiers.md](../sales/pricing-and-tiers.md)).

- **[ci-cd.md](ci-cd.md)** *(to write)* — the eight GitHub Actions workflows in [.github/workflows/](../../.github/workflows/): [ci.yml](../../.github/workflows/ci.yml), [barback.yml](../../.github/workflows/barback.yml), [weekly-digest.yml](../../.github/workflows/weekly-digest.yml), [stats-snapshot.yml](../../.github/workflows/stats-snapshot.yml), and the lifecycle crons. The S173 "check CI first" lesson lives in the [hoptrack-debug skill](../../.claude/skills/hoptrack-debug/SKILL.md).

## Where this connects back

- Every [REQ](../requirements/README.md) links here for "how this fits into the whole."
- The [testing strategy](../testing/README.md) is shaped by this architecture (colocated `__tests__/` dirs, Vitest for units, Playwright frozen at [e2e.frozen/](../../e2e.frozen/)).
- [Operations](../operations/README.md) runs *this*. [Compliance](../compliance/README.md) enforces guardrails on *this*.
- The [hoptrack-codebase-map skill](../../.claude/skills/hoptrack-codebase-map/SKILL.md) is the file-level navigation companion to this blueprint.

---

> **Status (2026-04-15):** `system-overview.md` exists (migrated from the old `ARCHITECTURE.md`). The other nine files are stubs — Avery and Jordan fill these in Wave 2 of the wiki reorg. Every line above already links somewhere real.
