// Rate limiting tests — Reese, Sprint 104
// Tests the checkRateLimit and rateLimitResponse utilities from lib/rate-limit.ts
// Uses vi.useFakeTimers() to test window expiry without sleeping
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

// Import the real implementation — no mocking here, this IS the unit under test
import { checkRateLimit, getClientIP, rateLimitResponse } from '@/lib/rate-limit'

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Generate a unique key per test so in-memory store state doesn't bleed between tests.
 */
let keyCounter = 0
function uniqueKey(prefix = 'test-key'): string {
  return `${prefix}-${++keyCounter}-${Math.random().toString(36).slice(2)}`
}

function makeRequest(ip = '192.168.1.1'): Request {
  return new Request('http://localhost/api/test', {
    headers: {
      'x-forwarded-for': ip,
      'Content-Type': 'application/json',
    },
  })
}

// ── checkRateLimit ────────────────────────────────────────────────────────────

describe('checkRateLimit — allows requests under limit', () => {
  it('allows the first request', () => {
    const key = uniqueKey()
    const result = checkRateLimit(key, { limit: 5, windowMs: 60_000 })
    expect(result.success).toBe(true)
  })

  it('allows requests up to the limit', () => {
    const key = uniqueKey()
    const opts = { limit: 5, windowMs: 60_000 }
    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit(key, opts)
      expect(result.success).toBe(true)
    }
  })

  it('remaining decrements with each request', () => {
    const key = uniqueKey()
    const opts = { limit: 5, windowMs: 60_000 }
    const first = checkRateLimit(key, opts)
    const second = checkRateLimit(key, opts)
    expect(second.remaining).toBeLessThan(first.remaining)
  })

  it('remaining is 0 on the last allowed request', () => {
    const key = uniqueKey()
    const opts = { limit: 3, windowMs: 60_000 }
    checkRateLimit(key, opts) // 1
    checkRateLimit(key, opts) // 2
    const third = checkRateLimit(key, opts) // 3 (at limit)
    expect(third.success).toBe(true)
    expect(third.remaining).toBe(0)
  })

  it('resetAt is in the future', () => {
    const key = uniqueKey()
    const result = checkRateLimit(key, { limit: 5, windowMs: 60_000 })
    expect(result.resetAt).toBeGreaterThan(Date.now())
  })
})

describe('checkRateLimit — blocks requests over limit', () => {
  it('blocks the request immediately after limit is exceeded', () => {
    const key = uniqueKey()
    const opts = { limit: 3, windowMs: 60_000 }
    checkRateLimit(key, opts) // 1 — ok
    checkRateLimit(key, opts) // 2 — ok
    checkRateLimit(key, opts) // 3 — ok (at limit)
    const fourth = checkRateLimit(key, opts) // 4 — over limit
    expect(fourth.success).toBe(false)
  })

  it('blocked result has remaining=0', () => {
    const key = uniqueKey()
    const opts = { limit: 2, windowMs: 60_000 }
    checkRateLimit(key, opts)
    checkRateLimit(key, opts)
    const blocked = checkRateLimit(key, opts)
    expect(blocked.success).toBe(false)
    expect(blocked.remaining).toBe(0)
  })

  it('continues blocking on subsequent requests over limit', () => {
    const key = uniqueKey()
    const opts = { limit: 1, windowMs: 60_000 }
    checkRateLimit(key, opts) // 1 — ok
    const second = checkRateLimit(key, opts) // 2 — blocked
    const third = checkRateLimit(key, opts)  // 3 — still blocked
    expect(second.success).toBe(false)
    expect(third.success).toBe(false)
  })

  it('a limit of 1 allows exactly one request then blocks', () => {
    const key = uniqueKey()
    const opts = { limit: 1, windowMs: 60_000 }
    expect(checkRateLimit(key, opts).success).toBe(true)
    expect(checkRateLimit(key, opts).success).toBe(false)
  })
})

describe('checkRateLimit — uses default limits when not specified', () => {
  it('uses limit=30 and windowMs=60000 by default', () => {
    const key = uniqueKey()
    // Make 30 requests — all should succeed
    for (let i = 0; i < 30; i++) {
      expect(checkRateLimit(key).success).toBe(true)
    }
    // 31st should fail
    expect(checkRateLimit(key).success).toBe(false)
  })
})

describe('checkRateLimit — resets after window expires', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows requests again after window expires', () => {
    const key = uniqueKey()
    const opts = { limit: 2, windowMs: 1_000 } // 1 second window

    // Exhaust the limit
    checkRateLimit(key, opts)
    checkRateLimit(key, opts)
    expect(checkRateLimit(key, opts).success).toBe(false)

    // Advance time past the window
    vi.advanceTimersByTime(1_001)

    // Should be allowed again (new window)
    expect(checkRateLimit(key, opts).success).toBe(true)
  })

  it('remaining resets to full limit after window expires', () => {
    const key = uniqueKey()
    const opts = { limit: 5, windowMs: 2_000 }

    // Use up some requests
    checkRateLimit(key, opts)
    checkRateLimit(key, opts)
    const mid = checkRateLimit(key, opts)
    expect(mid.remaining).toBe(2)

    // Advance past window
    vi.advanceTimersByTime(2_001)

    // Fresh window — remaining should be back to limit - 1 (after first call)
    const fresh = checkRateLimit(key, opts)
    expect(fresh.success).toBe(true)
    expect(fresh.remaining).toBe(4) // limit - 1 for this first request
  })

  it('different keys have independent windows', () => {
    const keyA = uniqueKey('key-a')
    const keyB = uniqueKey('key-b')
    const opts = { limit: 2, windowMs: 60_000 }

    // Exhaust key A
    checkRateLimit(keyA, opts)
    checkRateLimit(keyA, opts)
    expect(checkRateLimit(keyA, opts).success).toBe(false)

    // Key B should still be available
    expect(checkRateLimit(keyB, opts).success).toBe(true)
  })
})

describe('checkRateLimit — different limits for different route types', () => {
  it('sessions route: limit of 20 per hour', () => {
    const key = uniqueKey('ip:sessions')
    const opts = { limit: 20, windowMs: 60 * 60 * 1000 }
    for (let i = 0; i < 20; i++) {
      expect(checkRateLimit(key, opts).success).toBe(true)
    }
    expect(checkRateLimit(key, opts).success).toBe(false)
  })

  it('leaderboard route: limit of 30 per minute', () => {
    const key = uniqueKey('ip:leaderboard')
    const opts = { limit: 30, windowMs: 60_000 }
    for (let i = 0; i < 30; i++) {
      expect(checkRateLimit(key, opts).success).toBe(true)
    }
    expect(checkRateLimit(key, opts).success).toBe(false)
  })

  it('feed route: limit of 30 per minute', () => {
    const key = uniqueKey('ip:feed')
    const opts = { limit: 30, windowMs: 60_000 }
    for (let i = 0; i < 30; i++) {
      expect(checkRateLimit(key, opts).success).toBe(true)
    }
    expect(checkRateLimit(key, opts).success).toBe(false)
  })

  it('stricter limit blocks sooner than lenient limit', () => {
    const strictKey = uniqueKey('ip:strict')
    const lenientKey = uniqueKey('ip:lenient')

    // Strict: block at 5
    const strictOpts = { limit: 5, windowMs: 60_000 }
    for (let i = 0; i < 5; i++) checkRateLimit(strictKey, strictOpts)
    expect(checkRateLimit(strictKey, strictOpts).success).toBe(false)

    // Lenient: still OK at 5
    const lenientOpts = { limit: 30, windowMs: 60_000 }
    for (let i = 0; i < 5; i++) checkRateLimit(lenientKey, lenientOpts)
    expect(checkRateLimit(lenientKey, lenientOpts).success).toBe(true)
  })
})

// ── getClientIP ───────────────────────────────────────────────────────────────

describe('getClientIP', () => {
  it('extracts IP from x-forwarded-for header', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    })
    expect(getClientIP(req)).toBe('1.2.3.4')
  })

  it('extracts first IP when x-forwarded-for has multiple IPs', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8, 9.10.11.12' },
    })
    expect(getClientIP(req)).toBe('1.2.3.4')
  })

  it('trims whitespace from extracted IP', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '  1.2.3.4  ' },
    })
    expect(getClientIP(req)).toBe('1.2.3.4')
  })

  it('returns "unknown" when no x-forwarded-for header', () => {
    const req = new Request('http://localhost')
    expect(getClientIP(req)).toBe('unknown')
  })
})

// ── rateLimitResponse ─────────────────────────────────────────────────────────

describe('rateLimitResponse — integration with HTTP response', () => {
  it('returns null when under limit', () => {
    const req = makeRequest(`10.0.0.${++keyCounter}`)
    const result = rateLimitResponse(req, `endpoint-${uniqueKey()}`, { limit: 10, windowMs: 60_000 })
    expect(result).toBeNull()
  })

  it('returns a Response when over limit', () => {
    // Use a unique IP+endpoint combo to avoid state from other tests
    const ip = `10.99.${++keyCounter}.1`
    const endpoint = `endpoint-${uniqueKey()}`
    const opts = { limit: 1, windowMs: 60_000 }

    // First call OK
    rateLimitResponse(makeRequest(ip), endpoint, opts)
    // Second call should be blocked
    const second = rateLimitResponse(makeRequest(ip), endpoint, opts)
    expect(second).not.toBeNull()
    expect(second).toBeInstanceOf(Response)
  })

  it('blocked response has status 429', () => {
    const ip = `10.88.${++keyCounter}.1`
    const endpoint = `endpoint-${uniqueKey()}`
    const opts = { limit: 1, windowMs: 60_000 }

    rateLimitResponse(makeRequest(ip), endpoint, opts)
    const blocked = rateLimitResponse(makeRequest(ip), endpoint, opts)
    expect(blocked!.status).toBe(429)
  })

  it('blocked response includes Retry-After header', () => {
    const ip = `10.77.${++keyCounter}.1`
    const endpoint = `endpoint-${uniqueKey()}`
    const opts = { limit: 1, windowMs: 60_000 }

    rateLimitResponse(makeRequest(ip), endpoint, opts)
    const blocked = rateLimitResponse(makeRequest(ip), endpoint, opts)
    expect(blocked!.headers.get('Retry-After')).not.toBeNull()
  })

  it('blocked response includes X-RateLimit-Remaining: 0', () => {
    const ip = `10.66.${++keyCounter}.1`
    const endpoint = `endpoint-${uniqueKey()}`
    const opts = { limit: 1, windowMs: 60_000 }

    rateLimitResponse(makeRequest(ip), endpoint, opts)
    const blocked = rateLimitResponse(makeRequest(ip), endpoint, opts)
    expect(blocked!.headers.get('X-RateLimit-Remaining')).toBe('0')
  })

  it('blocked response body contains error message', async () => {
    const ip = `10.55.${++keyCounter}.1`
    const endpoint = `endpoint-${uniqueKey()}`
    const opts = { limit: 1, windowMs: 60_000 }

    rateLimitResponse(makeRequest(ip), endpoint, opts)
    const blocked = rateLimitResponse(makeRequest(ip), endpoint, opts)
    const json = await blocked!.json()
    expect(json.error).toBeDefined()
    expect(typeof json.error).toBe('string')
  })

  it('uses IP + endpoint as the rate limit key (different endpoints have independent limits)', () => {
    const ip = `10.44.${++keyCounter}.1`
    const opts = { limit: 1, windowMs: 60_000 }

    // Exhaust endpoint A
    rateLimitResponse(makeRequest(ip), `endpoint-a-${uniqueKey()}`, opts)
    const endpointA2 = rateLimitResponse(makeRequest(ip), `endpoint-a-${keyCounter}`, opts)

    // Different endpoint B should still be OK (same IP)
    const endpointB = rateLimitResponse(makeRequest(ip), `endpoint-b-${uniqueKey()}`, opts)
    expect(endpointB).toBeNull()
  })

  it('different IPs have independent limits for the same endpoint', () => {
    const endpoint = `shared-endpoint-${uniqueKey()}`
    const opts = { limit: 1, windowMs: 60_000 }

    const ip1 = `10.33.${++keyCounter}.1`
    const ip2 = `10.33.${keyCounter}.2`

    // Exhaust ip1
    rateLimitResponse(makeRequest(ip1), endpoint, opts)
    const blocked = rateLimitResponse(makeRequest(ip1), endpoint, opts)
    expect(blocked!.status).toBe(429)

    // ip2 should still be OK
    const ip2Result = rateLimitResponse(makeRequest(ip2), endpoint, opts)
    expect(ip2Result).toBeNull()
  })
})
