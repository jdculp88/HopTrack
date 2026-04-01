// Leaderboard API route tests — Reese, Sprint 104
// Tests the GET /api/leaderboard route behavior
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock Supabase BEFORE importing the route
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

// Mock rate-limit so it never blocks during tests
vi.mock('@/lib/rate-limit', () => ({
  rateLimitResponse: vi.fn().mockReturnValue(null),
  checkRateLimit: vi.fn().mockReturnValue({ success: true, remaining: 29, resetAt: Date.now() + 60000 }),
  getClientIP: vi.fn().mockReturnValue('127.0.0.1'),
}))

import { GET } from '../../app/api/leaderboard/route'
import { createClient } from '@/lib/supabase/server'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRequest(url = 'http://localhost/api/leaderboard') {
  return new Request(url)
}

function makeAuthedSupabase(data: unknown, error: unknown = null) {
  const mockClient = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      }),
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({ data, error }),
  }
  // Chain terminates at .limit()
  mockClient.from.mockReturnValue(mockClient)
  mockClient.select.mockReturnValue(mockClient)
  mockClient.eq.mockReturnValue(mockClient)
  mockClient.gte.mockReturnValue(mockClient)
  mockClient.gt.mockReturnValue(mockClient)
  mockClient.order.mockReturnValue(mockClient)
  return mockClient
}

function makeUnauthSupabase() {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: null,
      }),
    },
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('GET /api/leaderboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─── Auth ────────────────────────────────────────────────────────────────

  it('returns 401 when no authenticated user', async () => {
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeUnauthSupabase())
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toBeDefined()
  })

  // ─── All-time leaderboard ─────────────────────────────────────────────────

  it('returns 200 with alltime leaderboard data when Supabase succeeds', async () => {
    const profiles = [
      { id: 'user-1', username: 'alice', display_name: 'Alice', avatar_url: null, xp: 500 },
      { id: 'user-2', username: 'bob', display_name: 'Bob', avatar_url: null, xp: 400 },
    ]
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeAuthedSupabase(profiles))

    const res = await GET(makeRequest('http://localhost/api/leaderboard?period=alltime'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.period).toBe('alltime')
    expect(json.leaderboard).toBeDefined()
  })

  it('alltime leaderboard is an array', async () => {
    const profiles = [
      { id: 'user-1', username: 'alice', display_name: 'Alice', avatar_url: null, xp: 500 },
    ]
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeAuthedSupabase(profiles))

    const res = await GET(makeRequest('http://localhost/api/leaderboard?period=alltime'))
    const json = await res.json()
    expect(Array.isArray(json.leaderboard)).toBe(true)
  })

  it('alltime leaderboard entries have rank, user_id, xp_earned, and profile', async () => {
    const profiles = [
      { id: 'user-1', username: 'alice', display_name: 'Alice', avatar_url: null, xp: 500 },
    ]
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeAuthedSupabase(profiles))

    const res = await GET(makeRequest('http://localhost/api/leaderboard?period=alltime'))
    const json = await res.json()
    const first = json.leaderboard[0]
    expect(first).toHaveProperty('rank')
    expect(first).toHaveProperty('user_id')
    expect(first).toHaveProperty('xp_earned')
    expect(first).toHaveProperty('profile')
  })

  it('alltime leaderboard rank starts at 1', async () => {
    const profiles = [
      { id: 'user-1', username: 'alice', display_name: 'Alice', avatar_url: null, xp: 500 },
      { id: 'user-2', username: 'bob', display_name: 'Bob', avatar_url: null, xp: 400 },
    ]
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeAuthedSupabase(profiles))

    const res = await GET(makeRequest('http://localhost/api/leaderboard?period=alltime'))
    const json = await res.json()
    expect(json.leaderboard[0].rank).toBe(1)
    expect(json.leaderboard[1].rank).toBe(2)
  })

  it('returns empty leaderboard array when no profiles exist', async () => {
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeAuthedSupabase([]))

    const res = await GET(makeRequest('http://localhost/api/leaderboard?period=alltime'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.leaderboard).toEqual([])
  })

  it('returns 500 when Supabase returns an error on alltime', async () => {
    const mockClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } }),
    }
    mockClient.from.mockReturnValue(mockClient)
    mockClient.select.mockReturnValue(mockClient)
    mockClient.order.mockReturnValue(mockClient)
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(mockClient)

    const res = await GET(makeRequest('http://localhost/api/leaderboard?period=alltime'))
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toBeDefined()
  })

  // ─── Monthly leaderboard ──────────────────────────────────────────────────

  it('returns 200 with monthly leaderboard when period=monthly', async () => {
    const rows = [
      { user_id: 'user-1', xp_awarded: 50, profile: { id: 'user-1', username: 'alice', display_name: 'Alice', avatar_url: null, xp: 500 } },
      { user_id: 'user-1', xp_awarded: 30, profile: { id: 'user-1', username: 'alice', display_name: 'Alice', avatar_url: null, xp: 500 } },
      { user_id: 'user-2', xp_awarded: 40, profile: { id: 'user-2', username: 'bob', display_name: 'Bob', avatar_url: null, xp: 400 } },
    ]

    const mockClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      gt: vi.fn().mockResolvedValue({ data: rows, error: null }),
    }
    mockClient.from.mockReturnValue(mockClient)
    mockClient.select.mockReturnValue(mockClient)
    mockClient.eq.mockReturnValue(mockClient)
    mockClient.gte.mockReturnValue(mockClient)
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(mockClient)

    const res = await GET(makeRequest('http://localhost/api/leaderboard?period=monthly'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.period).toBe('monthly')
    expect(Array.isArray(json.leaderboard)).toBe(true)
  })

  it('monthly leaderboard aggregates XP per user across multiple sessions', async () => {
    const rows = [
      { user_id: 'user-1', xp_awarded: 50, profile: { id: 'user-1', username: 'alice' } },
      { user_id: 'user-1', xp_awarded: 30, profile: { id: 'user-1', username: 'alice' } },
    ]

    const mockClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      gt: vi.fn().mockResolvedValue({ data: rows, error: null }),
    }
    mockClient.from.mockReturnValue(mockClient)
    mockClient.select.mockReturnValue(mockClient)
    mockClient.eq.mockReturnValue(mockClient)
    mockClient.gte.mockReturnValue(mockClient)
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(mockClient)

    const res = await GET(makeRequest('http://localhost/api/leaderboard?period=monthly'))
    const json = await res.json()
    // user-1 should have 80 XP total (50 + 30)
    const alice = json.leaderboard.find((e: { user_id: string }) => e.user_id === 'user-1')
    expect(alice.xp_earned).toBe(80)
  })

  it('defaults to monthly when no period param provided', async () => {
    const mockClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      gt: vi.fn().mockResolvedValue({ data: [], error: null }),
    }
    mockClient.from.mockReturnValue(mockClient)
    mockClient.select.mockReturnValue(mockClient)
    mockClient.eq.mockReturnValue(mockClient)
    mockClient.gte.mockReturnValue(mockClient)
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(mockClient)

    const res = await GET(makeRequest('http://localhost/api/leaderboard'))
    const json = await res.json()
    expect(json.period).toBe('monthly')
  })

  // ─── Cache-Control header ─────────────────────────────────────────────────

  it('alltime response includes Cache-Control header', async () => {
    const profiles = [{ id: 'user-1', username: 'alice', display_name: 'Alice', avatar_url: null, xp: 500 }]
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeAuthedSupabase(profiles))

    const res = await GET(makeRequest('http://localhost/api/leaderboard?period=alltime'))
    const cacheControl = res.headers.get('Cache-Control')
    expect(cacheControl).not.toBeNull()
    expect(cacheControl).toContain('max-age=300')
  })

  it('monthly response includes Cache-Control header', async () => {
    const mockClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      gt: vi.fn().mockResolvedValue({ data: [], error: null }),
    }
    mockClient.from.mockReturnValue(mockClient)
    mockClient.select.mockReturnValue(mockClient)
    mockClient.eq.mockReturnValue(mockClient)
    mockClient.gte.mockReturnValue(mockClient)
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(mockClient)

    const res = await GET(makeRequest('http://localhost/api/leaderboard?period=monthly'))
    const cacheControl = res.headers.get('Cache-Control')
    expect(cacheControl).not.toBeNull()
    expect(cacheControl).toContain('public')
  })

  it('Cache-Control includes stale-while-revalidate', async () => {
    const profiles = [{ id: 'user-1', username: 'alice', display_name: 'Alice', avatar_url: null, xp: 500 }]
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeAuthedSupabase(profiles))

    const res = await GET(makeRequest('http://localhost/api/leaderboard?period=alltime'))
    const cacheControl = res.headers.get('Cache-Control')
    expect(cacheControl).toContain('stale-while-revalidate')
  })
})
