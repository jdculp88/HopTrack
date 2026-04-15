# Auth & RLS

*How HopTrack authenticates users and enforces row-level access.* Owned by [Riley](../../.claude/agents/riley.md), [Quinn](../../.claude/agents/infra-engineer.md), and [Avery](../../.claude/agents/avery.md).

**Back to [architecture](README.md) · [wiki home](../README.md).**

---

## Authentication — Supabase Auth with SSR

HopTrack uses `@supabase/ssr` v0.9. Three clients live under `lib/supabase/`:

- **browser client** — used in client components.
- **server client** — used in Server Components and route handlers; reads the session cookie.
- **service-role client** — server-only, bypasses RLS. Used sparingly (migrations, crawlers, scheduled jobs).

Auth redirects are handled by [proxy.ts](../../proxy.ts). We do **not** use `middleware.ts`.

## The `requireAuth` helper

Every API route that needs a user goes through `requireAuth()` in [lib/auth/](../../lib/). It returns `{ ok: true, user, claims }` or `{ ok: false, reason }`. Never inline `session.user.role === "..."` checks — use the helper.

Brand-aware routes (brewery dashboards, brand-level APIs) use the shared brand-auth layer. Enforcement: [lib/__tests__/brand-routes-use-shared-auth.test.ts](../../lib/__tests__/brand-routes-use-shared-auth.test.ts) fails CI if a brand route inlines its own auth.

Unit tests: [lib/__tests__/brand-auth.test.ts](../../lib/__tests__/brand-auth.test.ts).

## User roles

- **Consumer** — default drinker identity.
- **Brewery staff** — scoped to a location (Sprint 114, [REQ-072](../requirements/REQ-072-multi-location-brewery-support.md)).
- **Brand roles** — Owner, Brand Manager, Regional Manager (Sprint 122, [REQ-095](../requirements/REQ-095-brand-team-roles.md)). Regional Manager is location-scoped.
- **Superadmin** — platform admin. See [REQ-091](../requirements/REQ-091-superadmin-command-center.md) and [REQ-092](../requirements/REQ-092-superadmin-brewery-detail.md).

Impersonation (superadmin → "View as Brewery") is cookie-based and read-only. See [Sprint 140 retro](../history/retros/sprint-140-retro.md).

## Row Level Security (RLS)

Every user-data table has RLS policies. **RLS policies live in the same migration as the table** — that's non-negotiable. The [supabase-migration skill](../../.claude/skills/supabase-migration/SKILL.md) enforces it.

The Sprint 123 incident ([retro](../history/retros/sprint-123-retro.md)) fixed a recursive RLS bug and added 16 API-standardization checks. Sprint 147 fixed the 14-sprint-old Brand Team RLS bug ([retro](../history/retros/sprint-147-retro.md)). These scars inform every new policy.

Guardrails:

- [lib/__tests__/rls-safety.test.ts](../../lib/__tests__/rls-safety.test.ts) — cross-cutting RLS safety checks.
- [lib/__tests__/brewery-page-safety.test.ts](../../lib/__tests__/brewery-page-safety.test.ts) — per-page safety.

## API key auth (public API)

Public API v1 uses scoped API keys stored hashed in the DB. Creation, rotation, revocation, and usage tracking in [lib/api-keys/](../../lib/). See [REQ-083](../requirements/REQ-083-public-api-v1.md) and tests [lib/__tests__/api-keys.test.ts](../../lib/__tests__/api-keys.test.ts) + [api-keys-extended.test.ts](../../lib/__tests__/api-keys-extended.test.ts).

## Cross-links

- [api-layer.md](api-layer.md) — where `requireAuth` gets called.
- [multi-location-brand.md](multi-location-brand.md) — brand role mechanics.
- [compliance/security-and-fraud-prevention.md](../compliance/security-and-fraud-prevention.md).
- [REQ-080 Fraud Prevention](../requirements/REQ-080-fraud-prevention.md).
