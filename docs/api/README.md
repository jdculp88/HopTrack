# API 🔌

*Public and internal APIs.* Owned by [Jordan](../../.claude/agents/jordan.md).

**Back to [wiki home](../README.md).**

---

## The two APIs

HopTrack exposes two API surfaces:

- **Internal API** — Next.js route handlers under [app/api/](../../app/). Used by the consumer app and brewery dashboard. Not versioned — lives and dies with the frontend. Patterns and helpers are documented in [architecture/api-layer.md](../architecture/api-layer.md).
- **Public API v1** — versioned, API-key-authenticated, documented. Shipped in [Sprint 85](../history/retros/sprint-85-retro.md) per [REQ-083](../requirements/REQ-083-public-api-v1.md). The public reference lives at [api-reference.md](api-reference.md).

## Pages

- **[api-reference.md](api-reference.md)** — the full Public API v1 reference. Endpoints, auth, rate limits, versioning, error codes.
- **[claude-code-setup.md](claude-code-setup.md)** — how we use Claude Code (the CLI tool) day-to-day. Settings, hooks, custom skills.
- **public-api-v1.md** *(to write)* — the narrative overview: why Public API, who uses it, the Toast/Square integrations that consume it, the rate-limit story.

## Patterns

Every internal API route should use the response helpers in [lib/api-response.ts](../../lib/) — `apiSuccess(data)` and `apiError(code, message)`. Never return raw `NextResponse.json()`. This is enforced in [lib/__tests__/api-response-patterns.test.ts](../../lib/__tests__/api-response-patterns.test.ts) and called out in the [hoptrack-conventions skill](../../.claude/skills/hoptrack-conventions/SKILL.md).

Request validation uses Zod schemas from [lib/schemas/](../../lib/). Coverage in [lib/__tests__/schemas.test.ts](../../lib/__tests__/schemas.test.ts).

Authentication uses `requireAuth()` (see [architecture/auth-and-rls.md](../architecture/auth-and-rls.md)). Never inline role checks — use the helper.

## Cross-links

- **Architecture** — [architecture/api-layer.md](../architecture/api-layer.md) is the design doc.
- **Rate limits** — [operations/rate-limit-upgrade.md](../operations/rate-limit-upgrade.md).
- **POS integrations** — see [REQ-073](../requirements/REQ-073-pos-integration.md) (Toast, Square adapters — [Sprint 87](../history/retros/sprint-87-retro.md)).

---

> **Status (2026-04-15):** `api-reference.md` and `claude-code-setup.md` are in place. `public-api-v1.md` narrative is the remaining stub for Jordan.
