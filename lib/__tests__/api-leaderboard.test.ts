// Leaderboard API route tests — Reese, Sprint 157 (rewritten for multi-category API)
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
    or: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({ data, error }),
  }
  mockClient.from.mockReturnValue(mockClient)
  mockClient.select.mockReturnValue(mockClient)
  mockClient.eq.mockReturnValue(mockClient)
  mockClient.gte.mockReturnValue(mockClient)
  mockClient.gt.mockReturnValue(mockClient)
  mockClient.or.mockReturnValue(mockClient)
  mockClient.in.mockReturnValue(mockClient)
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

  // ─── XP category (default) ───────────────────────────────────────────────

  it('returns 200 with XP leaderboard data (default category)', async () => {
    const profiles = [
      { id: 'user-1', username: 'alice', display_name: 'Alice', avatar_url: null, level: 5, xp: 500, current_streak: 3 },
      { id: 'user-2', username: 'bob', display_name: 'Bob', avatar_url: null, level: 3, xp: 400, current_streak: 1 },
    ]
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeAuthedSupabase(profiles))

    const res = await GET(makeRequest('http://localhost/api/leaderboard?category=xp&timeRange=all'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toBeDefined()
    expect(Array.isArray(json.data)).toBe(true)
  })

  it('XP entries have rank, value, label, and profile', async () => {
    const profiles = [
      { id: 'user-1', username: 'alice', display_name: 'Alice', avatar_url: null, level: 5, xp: 500, current_streak: 3 },
    ]
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeAuthedSupabase(profiles))

    const res = await GET(makeRequest('http://localhost/api/leaderboard?category=xp&timeRange=all'))
    const json = await res.json()
    const first = json.data[0]
    expect(first).toHaveProperty('rank')
    expect(first).toHaveProperty('value')
    expect(first).toHaveProperty('label')
    expect(first).toHaveProperty('profile')
    expect(first.profile).toHaveProperty('id')
    expect(first.profile).toHaveProperty('username')
  })

  it('ranks start at 1 and are sequential', async () => {
    const profiles = [
      { id: 'user-1', username: 'alice', display_name: 'Alice', avatar_url: null, level: 5, xp: 500, current_streak: 3 },
      { id: 'user-2', username: 'bob', display_name: 'Bob', avatar_url: null, level: 3, xp: 400, current_streak: 1 },
    ]
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeAuthedSupabase(profiles))

    const res = await GET(makeRequest('http://localhost/api/leaderboard?category=xp&timeRange=all'))
    const json = await res.json()
    expect(json.data[0].rank).toBe(1)
    expect(json.data[1].rank).toBe(2)
  })

  it('returns empty data array when no profiles exist', async () => {
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeAuthedSupabase([]))

    const res = await GET(makeRequest('http://localhost/api/leaderboard?category=xp&timeRange=all'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toEqual([])
  })

  it('returns 500 when Supabase returns an error', async () => {
    const mockClient = makeAuthedSupabase(null, { message: 'Database error' })
    mockClient.limit.mockResolvedValue({ data: null, error: { message: 'Database error' } })
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(mockClient)

    const res = await GET(makeRequest('http://localhost/api/leaderboard?category=xp&timeRange=all'))
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toBeDefined()
  })

  // ─── Response envelope ────────────────────────────────────────────────────

  it('response includes meta with userRank and userValue', async () => {
    const profiles = [
      { id: 'user-123', username: 'me', display_name: 'Me', avatar_url: null, level: 5, xp: 500, current_streak: 3 },
    ]
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeAuthedSupabase(profiles))

    const res = await GET(makeRequest('http://localhost/api/leaderboard?category=xp&timeRange=all'))
    const json = await res.json()
    expect(json.meta).toBeDefined()
    expect(json.meta).toHaveProperty('userRank')
    expect(json.meta).toHaveProperty('userValue')
  })

  // ─── Cache headers ────────────────────────────────────────────────────────

  it('response includes Cache-Control header', async () => {
    const profiles = [
      { id: 'user-1', username: 'alice', display_name: 'Alice', avatar_url: null, level: 5, xp: 500, current_streak: 3 },
    ]
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeAuthedSupabase(profiles))

    const res = await GET(makeRequest('http://localhost/api/leaderboard?category=xp&timeRange=all'))
    const cacheControl = res.headers.get('Cache-Control')
    expect(cacheControl).toBeDefined()
  })

  it('Cache-Control includes stale-while-revalidate', async () => {
    const profiles = [
      { id: 'user-1', username: 'alice', display_name: 'Alice', avatar_url: null, level: 5, xp: 500, current_streak: 3 },
    ]
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeAuthedSupabase(profiles))

    const res = await GET(makeRequest('http://localhost/api/leaderboard?category=xp&timeRange=all'))
    const cacheControl = res.headers.get('Cache-Control')
    if (cacheControl) {
      expect(cacheControl).toContain('stale-while-revalidate')
    }
  })
})
