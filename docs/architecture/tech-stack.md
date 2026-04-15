# Tech Stack

*The libraries, frameworks, and tools HopTrack is built on.* Owned by [Jordan](../../.claude/agents/jordan.md).

**Back to [architecture](README.md) · [wiki home](../README.md).**

---

## The short version

Next.js 16 App Router · Tailwind CSS v4 · Supabase SSR v0.9 · Framer Motion via `motion/react` · TypeScript strict mode · Vitest · Capacitor iOS wrapper · GitHub Actions · Sentry · Resend · Stripe · Anthropic Claude (Haiku + Sonnet).

Pinned versions live in [package.json](../../package.json). When in doubt, read the lockfile — not these docs.

## Framework — Next.js 16.2.1

**App Router only.** No Pages Router anywhere in the repo. Route groups organize the app:

- `app/(consumer)/` — consumer app (check-ins, feed, profile, HopRoute, passport).
- `app/(brewery)/` — brewery owner dashboard.
- `app/(superadmin)/` — platform admin (Command Center, impersonation).
- `app/(auth)/` — login, signup, claim flow.
- `app/api/` — route handlers. Patterns in [api-layer.md](api-layer.md).

This is **not the Next.js you know.** The repo has [AGENTS.md](../../AGENTS.md) open with the warning: read `node_modules/next/dist/docs/` before writing App Router code. APIs and conventions diverge from pre-14 patterns.

Auth redirects run through [proxy.ts](../../proxy.ts), **not** `middleware.ts`.

## Styling — Tailwind CSS v4

- CSS-first config: tokens live in [app/globals.css](../../app/globals.css) as `:root` custom properties, not in `tailwind.config.ts`.
- Dark mode default, light + OLED Black variants, theme switch via `data-theme` attribute (see [REQ-001](../requirements/REQ-001-theme-toggle.md)).
- Tokens grouped: `--color-*`, `--surface-*`, `--text-*`, beer-style color families, shadow scale, motion scale.
- Full palette + rules in [design/design-system.md](../design/design-system.md) and the [hoptrack-design-system skill](../../.claude/skills/hoptrack-design-system/SKILL.md).

## Database — Supabase (Postgres + Auth + Storage + Realtime)

- **SSR client** via `@supabase/ssr` v0.9. Three clients: browser, server, service-role. Colocated under `lib/supabase/`.
- **Auth:** Supabase Auth with JWT. Guardrails in [auth-and-rls.md](auth-and-rls.md).
- **RLS:** every user-data table has RLS policies written in the same migration as the table (see [supabase-migration skill](../../.claude/skills/supabase-migration/SKILL.md)).
- **Realtime:** WebSocket channels for tap lists + presence. See [realtime.md](realtime.md).
- **Storage:** brewery logos, beer images, session photos. Bucket setup in [scripts/supabase-setup.mjs](../../scripts/supabase-setup.mjs).

Connection pooling via pgBouncer — see [operations/connection-pooling.md](../operations/connection-pooling.md).

## Language — TypeScript strict mode

- `strict: true` and `noEmit` enforced in CI ([.github/workflows/ci.yml](../../.github/workflows/ci.yml)).
- Schema types auto-generated from Supabase: `npm run db:types` → [types/database.ts](../../types/database.ts).
- Join shapes hand-curated in [types/supabase-helpers.ts](../../types/supabase-helpers.ts).
- Type-safety audit in [lib/__tests__/type-safety-audit.test.ts](../../lib/__tests__/type-safety-audit.test.ts).

## Motion — Framer Motion via `motion/react`

- Import from `motion/react` (NOT the legacy `framer-motion` package). Consolidated in [Sprint 157](../history/retros/sprint-157-retro.md); enforced by [lib/__tests__/motion-imports.test.ts](../../lib/__tests__/motion-imports.test.ts).
- **Banned:** `motion.button`. Wrap in `motion.div` and pass handler to child. Details in [hoptrack-design-system skill](../../.claude/skills/hoptrack-design-system/SKILL.md).
- `MotionConfig` is mounted once at the root to normalize durations.

## State & data

- Server Components render Supabase data directly — no client-side data layer.
- Client components use `useQuery`-style hooks thin-wrapped over Supabase in [hooks/](../../hooks/).
- Optimistic updates via `useOptimistic` where it matters (sessions, wishlist, reactions).
- Zod schemas for API request validation live in [lib/schemas/](../../lib/). Coverage in [lib/__tests__/schemas.test.ts](../../lib/__tests__/schemas.test.ts).

## Testing

- **Vitest** for units (2128+ tests). Colocated `__tests__/` dirs — see [testing/README.md](../testing/README.md).
- **Playwright** E2E **frozen** in [e2e.frozen/](../../e2e.frozen/) since [Sprint 173](../history/retros/sprint-173-ci-unblock.md).
- Coverage via `@vitest/coverage-v8`. Full strategy: [hoptrack-testing skill](../../.claude/skills/hoptrack-testing/SKILL.md).

## Payments — Stripe

- Subscriptions with three tiers (Tap/Cask/Barrel). Details in [billing-and-stripe.md](billing-and-stripe.md).
- Webhooks handled in `app/api/webhooks/stripe/`. Idempotency via event IDs.
- Brand-level billing consolidated in [Sprint 121](../history/retros/sprint-121-retro.md) — see [REQ-072](../requirements/REQ-072-multi-location-brewery-support.md).

## AI — Anthropic Claude

- **Barback crawler** (scheduled) uses Sonnet for beer extraction. Cost-capped. See [REQ-071](../requirements/REQ-071-the-barback-ai-beer-crawler.md).
- **Smart promotions, digests, recommendations** use Haiku 4.5 for sub-$5/mo inference costs ([Sprint 146](../history/retros/sprint-146-retro.md)). See [intelligence-layer.md](intelligence-layer.md).
- **HopRoute Concierge** uses Haiku with taste-fingerprint input ([Sprint 178](../history/retros/sprint-178-retro.md), [REQ-118](../requirements/REQ-118-hoproute-concierge.md)).

## Email — Resend

- Transactional and marketing email through Resend. Setup + routing in [operations/email-routing.md](../operations/email-routing.md).
- Cron workflows send [weekly digest](../../.github/workflows/weekly-digest.yml), [onboarding drip](../../.github/workflows/onboarding-drip.yml), [trial lifecycle](../../.github/workflows/trial-lifecycle.yml).

## Observability — Sentry

- `@sentry/nextjs` configured in [sentry.client.config.ts](../../sentry.client.config.ts), [sentry.server.config.ts](../../sentry.server.config.ts), [sentry.edge.config.ts](../../sentry.edge.config.ts).
- `/api/health` endpoint feeds uptime monitoring. See [operations/uptime-monitoring.md](../operations/uptime-monitoring.md).

## Mobile — Capacitor

- iOS wrapper via Capacitor v8. Config in [capacitor.config.ts](../../capacitor.config.ts).
- Build flow: `npm run cap:build` (Next export + cap sync).
- App Store plan in [design/apple-app-plan.md](../design/apple-app-plan.md).

## Build tooling

- **Bundler:** Rolldown-backed Next.js (watch for the lockfile quirk from [Sprint 173](../history/retros/sprint-173-ci-unblock.md) — it's documented in [ci.yml](../../.github/workflows/ci.yml)).
- **Linter:** ESLint 9 with `eslint-config-next`. [eslint.config.mjs](../../eslint.config.mjs).
- **PostCSS:** Tailwind v4 postcss plugin. [postcss.config.mjs](../../postcss.config.mjs).
- **Bundle analysis:** `npm run analyze` triggers `@next/bundle-analyzer`.

## Cross-links

- [system-overview.md](system-overview.md) — end-to-end request flow.
- [hoptrack-conventions skill](../../.claude/skills/hoptrack-conventions/SKILL.md) — how to write code that fits.
- [hoptrack-codebase-map skill](../../.claude/skills/hoptrack-codebase-map/SKILL.md) — where each subsystem lives on disk.
