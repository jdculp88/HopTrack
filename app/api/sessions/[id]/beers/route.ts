import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/sessions/[id]/beers — fetch all beer logs for a session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: sessionId } = await params

  // Fetch all beer logs for this session
  const { data: beerLogs, error } = await (supabase as any)
    .from('beer_logs')
    .select('*')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)
    .order('logged_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch beer logs' }, { status: 500 })
  }

  return NextResponse.json({ beerLogs })
}

// POST /api/sessions/[id]/beers — log a beer to an active session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: sessionId } = await params
  const body = await request.json()
  const { beer_id, brewery_id, rating, flavor_tags, serving_style, comment, photo_url } = body

  // Verify the session belongs to this user and is active
  const { data: session } = await (supabase as any)
    .from('sessions')
    .select('id, is_active, brewery_id, context')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }
  if (!session.is_active) {
    return NextResponse.json({ error: 'Session is no longer active' }, { status: 400 })
  }

  const { data: beerLog, error } = await (supabase as any)
    .from('beer_logs')
    .insert({
      session_id: sessionId,
      user_id: user.id,
      beer_id: beer_id || null,
      brewery_id: brewery_id || session.brewery_id || null,
      rating: rating || null,
      flavor_tags: flavor_tags || null,
      serving_style: serving_style || null,
      comment: comment || null,
      photo_url: photo_url || null,
    })
    .select('*')
    .single()

  if (error) {
    console.error('Error logging beer:', error)
    return NextResponse.json({ error: 'Failed to log beer' }, { status: 500 })
  }

  return NextResponse.json({ beerLog }, { status: 201 })
}
