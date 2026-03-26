import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/sessions — start a new session (check-in at brewery or home)
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { brewery_id, share_to_feed = true, note, context = 'brewery' } = body

  if (context === 'brewery' && !brewery_id) {
    return NextResponse.json({ error: 'brewery_id is required for brewery sessions' }, { status: 400 })
  }

  // Close any existing active session for this user before starting a new one
  await (supabase as any)
    .from('sessions')
    .update({ is_active: false, ended_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('is_active', true)

  const { data: session, error } = await (supabase as any)
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
    console.error('Error creating session:', error)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }

  // Increment profile total_checkins — fetch current value then update
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('total_checkins')
    .eq('id', user.id)
    .single()

  if (profile) {
    await (supabase as any)
      .from('profiles')
      .update({ total_checkins: (profile.total_checkins || 0) + 1 })
      .eq('id', user.id)
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

  let query = (supabase as any)
    .from('sessions')
    .select(`
      *,
      profile:profiles!sessions_user_id_fkey(id, username, display_name, avatar_url),
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
    console.error('Error fetching sessions:', error)
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }

  return NextResponse.json({ sessions })
}
