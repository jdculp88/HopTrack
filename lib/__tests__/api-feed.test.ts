// Feed API route tests — Reese, Sprint 104
// Tests the GET /api/feed route auth, response shape, and tab filtering
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

import { GET } from '../../app/api/feed/route'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRequest(url = 'http://localhost/api/feed') {
  return new NextRequest(url)
}

const MOCK_USER = { id: 'user-123', email: 'test@example.com' }

const MOCK_SESSION = {
  id: 'session-1',
  user_id: 'user-123',
  brewery_id: 'brewery-1',
  started_at: '2026-04-01T20:00:00Z',
  ended_at: '2026-04-01T22:00:00Z',
  is_active: false,
  share_to_feed: true,
  profile: { id: 'user-123', username: 'alice', display_name: 'Alice', avatar_url: null, current_streak: 3 },
  brewery: { id: 'brewery-1', name: 'Test Brewery', city: 'Asheville', state: 'NC' },
  beer_logs: [],
}

function makeAuthedSupabase({
  sessions = [MOCK_SESSION],
  friendships = [] as unknown[],
  reactions = [] as unknown[],
  userReactions = [] as unknown[],
  comments = [] as unknown[],
  sessionsError = null,
}: {
  sessions?: unknown[]
  friendships?: unknown[]
  reactions?: unknown[]
  userReactions?: unknown[]
  comments?: unknown[]
  sessionsError?: unknown
} = {}) {
  // We need to handle multiple .from() calls returning different chains
  const friendshipChain = {
    select: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ data: friendships, error: null }),
  }

  const sessionChain = {
    select: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockResolvedValue({ data: sessions, error: sessionsError }),
  }

  const reactionCountChain = {
    select: vi.fn().mockReturnThis(),
    in: vi.fn().mockResolvedValue({ data: reactions, error: null }),
  }

  const userReactionChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockResolvedValue({ data: userReactions, error: null }),
  }

  const commentChain = {
    select: vi.fn().mockReturnThis(),
    in: vi.fn().mockResolvedValue({ data: comments, error: null }),
  }

  let fromCallCount = 0
  const fromFn = vi.fn().mockImplementation((table: string) => {
    if (table === 'friendships') return friendshipChain
    if (table === 'sessions') return sessionChain
    if (table === 'reactions') {
      // First call = all reaction counts, second call = user's reactions
      fromCallCount++
      return fromCallCount % 2 === 1 ? reactionCountChain : userReactionChain
    }
    if (table === 'session_comments') return commentChain
    return sessionChain
  })

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: MOCK_USER },
        error: null,
      }),
    },
    from: fromFn,
  }
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

describe('GET /api/feed', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─── Auth ────────────────────────────────────────────────────────────────

  it('returns 401 when not authenticated', async () => {
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeUnauthSupabase())
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
  })

  it('401 response includes error field', async () => {
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeUnauthSupabase())
    const res = await GET(makeRequest())
    const json = await res.json()
    expect(json.error).toBeDefined()
  })

  // ─── Success shape ────────────────────────────────────────────────────────

  it('returns 200 with sessions array when authenticated', async () => {
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeAuthedSupabase())
    const res = await GET(makeRequest())
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json.sessions)).toBe(true)
  })

  it('response includes reactionCounts, userReactions, commentCounts, hasMore', async () => {
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeAuthedSupabase())
    const res = await GET(makeRequest())
    const json = await res.json()
    expect(json).toHaveProperty('sessions')
    expect(json).toHaveProperty('reactionCounts')
    expect(json).toHaveProperty('userReactions')
    expect(json).toHaveProperty('commentCounts')
    expect(json).toHaveProperty('hasMore')
  })

  it('sessions array contains expected mock session', async () => {
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeAuthedSupabase())
    const res = await GET(makeRequest())
    const json = await res.json()
    expect(json.sessions).toHaveLength(1)
    expect(json.sessions[0].id).toBe('session-1')
  })

  it('returns empty sessions array when no sessions exist', async () => {
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeAuthedSupabase({ sessions: [] }))
    const res = await GET(makeRequest())
    const json = await res.json()
    expect(json.sessions).toEqual([])
    expect(json.hasMore).toBe(false)
  })

  // ─── Pagination ────────────────────────────────────────────────────────

  it('hasMore is false when sessions count is at or below PAGE_SIZE (20)', async () => {
    const sessions = Array.from({ length: 20 }, (_, i) => ({ ...MOCK_SESSION, id: `session-${i}` }))
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeAuthedSupabase({ sessions }))
    const res = await GET(makeRequest())
    const json = await res.json()
    expect(json.hasMore).toBe(false)
  })

  it('hasMore is true when sessions count exceeds PAGE_SIZE (21 returned)', async () => {
    const sessions = Array.from({ length: 21 }, (_, i) => ({ ...MOCK_SESSION, id: `session-${i}` }))
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeAuthedSupabase({ sessions }))
    const res = await GET(makeRequest())
    const json = await res.json()
    expect(json.hasMore).toBe(true)
    // Actual results should be capped at 20
    expect(json.sessions).toHaveLength(20)
  })

  // ─── Error handling ───────────────────────────────────────────────────────

  it('returns 500 when Supabase sessions query fails', async () => {
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeAuthedSupabase({ sessionsError: { message: 'DB connection failed' } })
    )
    const res = await GET(makeRequest())
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toBeDefined()
  })

  // ─── Tab parameter ────────────────────────────────────────────────────────

  it('returns 400 when tab parameter is invalid', async () => {
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeAuthedSupabase())
    const res = await GET(makeRequest('http://localhost/api/feed?tab=discover'))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('tab')
  })

  it('accepts tab=friends', async () => {
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeAuthedSupabase())
    const res = await GET(makeRequest('http://localhost/api/feed?tab=friends'))
    expect(res.status).toBe(200)
  })

  it('accepts tab=you', async () => {
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeAuthedSupabase())
    const res = await GET(makeRequest('http://localhost/api/feed?tab=you'))
    expect(res.status).toBe(200)
  })

  it('defaults to friends tab when no tab param provided', async () => {
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeAuthedSupabase())
    // Should not return 400 (which would indicate invalid tab)
    const res = await GET(makeRequest('http://localhost/api/feed'))
    expect(res.status).toBe(200)
  })

  // ─── Reaction and comment aggregation ─────────────────────────────────────

  it('reactionCounts is an object keyed by session ID', async () => {
    const reactions = [
      { session_id: 'session-1', type: 'cheers' },
      { session_id: 'session-1', type: 'cheers' },
      { session_id: 'session-1', type: 'fire' },
    ]
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeAuthedSupabase({ reactions })
    )
    const res = await GET(makeRequest())
    const json = await res.json()
    expect(typeof json.reactionCounts).toBe('object')
    // session-1 should have 2 cheers and 1 fire
    expect(json.reactionCounts['session-1']?.cheers).toBe(2)
    expect(json.reactionCounts['session-1']?.fire).toBe(1)
  })

  it('commentCounts is an object keyed by session ID', async () => {
    const comments = [
      { session_id: 'session-1' },
      { session_id: 'session-1' },
    ]
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeAuthedSupabase({ comments })
    )
    const res = await GET(makeRequest())
    const json = await res.json()
    expect(typeof json.commentCounts).toBe('object')
    expect(json.commentCounts['session-1']).toBe(2)
  })
})
