# Rate Limiter — Upstash Redis Upgrade Path

**Owner:** Riley / Quinn
**Status:** Documented — implement before traffic exceeds ~100 concurrent users
**Sprint:** 149 (The Launchpad)

---

## Current State

`lib/rate-limit.ts` uses an in-memory `Map` for sliding window rate limiting. It works correctly on a single process.

**Problem:** Vercel serverless functions spin up multiple isolates. Each has its own `Map`, so a client can exceed the rate limit by a factor of N (where N = concurrent function instances). At low traffic this is fine. At scale it is not.

---

## Recommended Solution

Replace the `Map` store with `@upstash/ratelimit` + `@upstash/redis`.

**Why Upstash:**
- Free tier: 10K commands/day (sufficient for early traffic)
- Serverless-native (no connection pooling needed)
- Sub-millisecond latency from Vercel edge
- Drop-in replacement for our existing pattern

**Packages:**
```bash
npm install @upstash/ratelimit @upstash/redis
```

**Env vars:**
```
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=AX...
```

---

## Migration Path

The existing `checkRateLimit()` and `rateLimitResponse()` function signatures stay identical. Only the internal store changes. No route code modifications needed.

```typescript
// Before (in-memory)
const store = new Map<string, { count: number; resetAt: number }>();

// After (Upstash)
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(30, "60 s"),
});
```

The `checkRateLimit()` function becomes:
```typescript
export async function checkRateLimit(key: string, opts?: RateLimitOptions) {
  const { success, remaining, reset } = await ratelimit.limit(key);
  if (!success) return { limited: true, remaining: 0, resetAt: reset };
  return { limited: false, remaining, resetAt: reset };
}
```

---

## Fallback Strategy

Keep the in-memory implementation as a fallback when `UPSTASH_REDIS_REST_URL` is not configured:

```typescript
const useRedis = !!process.env.UPSTASH_REDIS_REST_URL;
```

This ensures local development and CI continue to work without Redis.

---

## Timeline

- **Now → 100 concurrent users:** Current in-memory implementation is sufficient
- **100+ concurrent users:** Implement Upstash Redis upgrade
- **1000+ concurrent users:** Consider Upstash Pro tier or evaluate Vercel KV

---

## Cost

- **Free tier:** 10K commands/day, 1MB max data (handles ~7 req/min sustained)
- **Pay-as-you-go:** $0.20 per 100K commands beyond free tier
- **Estimated monthly cost at 500 active breweries:** < $5/mo
