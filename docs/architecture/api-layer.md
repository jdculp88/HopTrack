# API Layer

*How HopTrack's API routes are shaped.* Owned by [Jordan](../../.claude/agents/jordan.md) and [Avery](../../.claude/agents/avery.md).

**Back to [architecture](README.md) · [wiki home](../README.md).**

---

## Two surfaces

HopTrack has two API surfaces:

1. **Internal API** — Next.js route handlers under [app/api/](../../app/). Consumed only by the consumer app and brewery dashboard. Not versioned. Breaks freely with the frontend.
2. **Public API v1** — versioned + API-key-authenticated under `app/api/v1/`. Consumed by POS integrations, partners, embedded widgets. See [REQ-083](../requirements/REQ-083-public-api-v1.md) and [api/api-reference.md](../api/api-reference.md).

Both surfaces share the same helpers and patterns. Only the versioning, auth, and rate-limit policy differ.

## The three rules of a HopTrack route

1. **Use the response helpers.** `apiSuccess(data)` and `apiError(code, message)` from [lib/api-response.ts](../../lib/) — **never** return raw `NextResponse.json()`. Enforced by [lib/__tests__/api-response-patterns.test.ts](../../lib/__tests__/api-response-patterns.test.ts).
2. **Validate with Zod.** Request bodies + query params go through schemas in [lib/schemas/](../../lib/). Coverage: [lib/__tests__/schemas.test.ts](../../lib/__tests__/schemas.test.ts).
3. **Auth via `requireAuth()`.** Never inline role checks. See [auth-and-rls.md](auth-and-rls.md). Brand-aware routes use the shared brand-auth layer enforced by [lib/__tests__/brand-routes-use-shared-auth.test.ts](../../lib/__tests__/brand-routes-use-shared-auth.test.ts).

## Route shape — the canonical handler

```ts
// app/api/some-resource/route.ts
import { apiSuccess, apiError } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { SomeInputSchema } from "@/lib/schemas";

export async function POST(req: Request) {
  const auth = await requireAuth(req);
  if (!auth.ok) return apiError("UNAUTHENTICATED", auth.reason);

  const parsed = SomeInputSchema.safeParse(await req.json());
  if (!parsed.success) return apiError("INVALID_INPUT", parsed.error.message);

  // ...business logic...
  return apiSuccess(result);
}
```

The full list of banned patterns and required patterns lives in the [hoptrack-conventions skill](../../.claude/skills/hoptrack-conventions/SKILL.md).

## Response envelope

All responses return a discriminated union:

- Success: `{ ok: true, data: <payload> }`
- Error: `{ ok: false, code: string, message: string }`

Clients decide error presentation from `code`, not from status text. Status codes follow HTTP semantics (401/403/404/409/422/500) so middleware and browser tooling still behave.

## Rate limiting

Per-route limits keyed on IP + user ID live in [lib/rate-limiting.ts](../../lib/). Coverage in [lib/__tests__/rate-limiting.test.ts](../../lib/__tests__/rate-limiting.test.ts). The Sprint 137 audit ([retro](../history/retros/sprint-137-retro.md)) closed the last gaps; ops runbook in [operations/rate-limit-upgrade.md](../operations/rate-limit-upgrade.md).

Public API v1 has a separate, stricter policy tied to API keys (see [REQ-083](../requirements/REQ-083-public-api-v1.md)).

## Query size caps

Supabase has a PostgREST `max_rows` cap (10000 as of [Sprint 155](../history/retros/sprint-155-retro.md) after the stats bug fix). When a route expects to count more than ~1000 rows, use explicit `count: "exact"` and apply a deliberate upper bound. Audited in [lib/__tests__/stats-query-limits.test.ts](../../lib/__tests__/stats-query-limits.test.ts).

## Error boundaries and retries

- Client errors bubble into React `ErrorBoundary` components ([lib/__tests__/error-boundary.test.tsx](../../lib/__tests__/error-boundary.test.tsx)).
- Transient failures use the retry helper in [lib/retry.ts](../../lib/) — tested in [lib/__tests__/retry.test.ts](../../lib/__tests__/retry.test.ts).
- `/api/health` ([lib/__tests__/health.test.ts](../../lib/__tests__/health.test.ts)) powers [operations/uptime-monitoring.md](../operations/uptime-monitoring.md).

## Performance and caching

`use cache` boundaries were adopted in [Sprint 158](../history/retros/sprint-158-retro.md) across 12 pages ([REQ-104](../requirements/REQ-104-intelligence-layer.md)). Audit: [lib/__tests__/use-cache-audit.test.ts](../../lib/__tests__/use-cache-audit.test.ts).

## Cross-links

- [auth-and-rls.md](auth-and-rls.md)
- [realtime.md](realtime.md) — the WebSocket path (not an HTTP API)
- [billing-and-stripe.md](billing-and-stripe.md) — webhook patterns
- [api/README.md](../api/README.md) and [api/api-reference.md](../api/api-reference.md)
