import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendPushToUser } from '@/lib/push'
import { rateLimitResponse } from '@/lib/rate-limit'

// POST /api/sessions — start a new session (check-in at brewery or home)
export async function POST(request: NextRequest) {
  // 20 sessions per hour per IP — raised from 10 in S38-009 (power users hit the old limit)
  const limited = rateLimitResponse(request, 'sessions', { limit: 20, windowMs: 60 * 60 * 1000 })
  if (limited) return limited

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { brewery_id, share_to_feed = true, note, context = 'brewery' } = body

  if (context === 'brewery' && !brewery_id) {
    return NextResponse.json({ error: 'brewery_id is required for brewery sessions' }, { status: 400 })
  }

  // Close any existing active session for this user before starting a new one
  await supabase
    .from('sessions')
    .update({ is_active: false, ended_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('is_active', true)

  const { data: session, error } = await supabase
    .from('sessions')
    .insert({
      user_id: user.id,
      brewery_id: brewery_id || null,
      share_to_feed,
      note: note || null,
      context,
    })
    .select()
    .single()

  if (error) {
    console.error('[sessions] Error creating session:', error)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }

  // Increment profile total_checkins — fetch current value then update
  const { data: profile } = await supabase
    .from('profiles')
    .select('total_checkins')
    .eq('id', user.id)
    .single()

  if (profile) {
    await supabase
      .from('profiles')
      .update({ total_checkins: (profile.total_checkins || 0) + 1 })
      .eq('id', user.id)
  }

  // Notify friends that this user started a session (fire and forget)
  if (share_to_feed) {
    notifyFriendsSessionStarted(supabase, user.id, session.id, brewery_id).catch(() => {})
  }

  return NextResponse.json({ session }, { status: 201 })
}

// GET /api/sessions — get sessions for feed (with beer_logs)
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('user_id') || user.id
  const limit = parseInt(searchParams.get('limit') || '20')
  const cursor = searchParams.get('cursor')

  let query = supabase
    .from('sessions')
    .select(`
      *,
      profile:profiles!sessions_user_id_fkey(id, username, display_name, avatar_url),
      brewery:breweries(id, name, city, state),
      beer_logs(
        id, beer_id, rating, flavor_tags, serving_style, comment, photo_url, logged_at, quantity
      )
    `)
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit)

  if (cursor) {
    query = query.lt('started_at', cursor)
  }

  const { data: sessions, error } = await query

  if (error) {
    console.error('[sessions] Error fetching sessions:', error)
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }

  return NextResponse.json({ sessions })
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function notifyFriendsSessionStarted(
  supabase: any,
  userId: string,
  sessionId: string,
  breweryId: string | null,
) {
  // Get current user's profile
  const { data: myProfile } = await supabase
    .from('profiles')
    .select('display_name, username')
    .eq('id', userId)
    .single()
  const displayName = myProfile?.display_name || myProfile?.username || 'Someone'

  // Get brewery name if applicable
  let breweryName: string | null = null
  if (breweryId) {
    const { data: brewery } = await supabase
      .from('breweries')
      .select('name')
      .eq('id', breweryId)
      .single()
    breweryName = brewery?.name ?? null
  }

  // Get accepted friends
  const { data: friendships } = await supabase
    .from('friendships')
    .select('requester_id, addressee_id')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .eq('status', 'accepted')

  if (!friendships || friendships.length === 0) return

  const friendIds: string[] = friendships.map((f: any) =>
    f.requester_id === userId ? f.addressee_id : f.requester_id,
  )

  const body = breweryName
    ? `${displayName} just started a session at ${breweryName}`
    : `${displayName} just started a home session`

  // Create in-app notifications for friends with friend_activity enabled
  const notifications = friendIds.map((friendId: string) => ({
    user_id: friendId,
    type: 'friend_checkin',
    title: `${displayName} is drinking now`,
    body,
    data: { session_id: sessionId, user_id: userId },
  }))
  await supabase.from('notifications').insert(notifications)

  // Send push notifications
  for (const friendId of friendIds) {
    const { data: friendProfile } = await supabase
      .from('profiles')
      .select('notification_preferences')
      .eq('id', friendId)
      .single()
    const prefs = friendProfile?.notification_preferences ?? { friend_activity: true }
    if (prefs.friend_activity === false) continue

    sendPushToUser(supabase, friendId, {
      title: `${displayName} is drinking now`,
      body,
      tag: `friend-session-start-${sessionId}`,
      data: { url: breweryId ? `/brewery/${breweryId}` : `/profile/${myProfile?.username}` },
    })
  }
}
