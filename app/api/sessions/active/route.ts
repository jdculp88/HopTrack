import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/sessions/active — get the current user's active session
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: session, error } = await (supabase as any)
    .from('sessions')
    .select(`
      *,
      beer_logs(
        id, beer_id, rating, flavor_tags, serving_style, comment, photo_url, logged_at
      )
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error fetching active session:', error)
    return NextResponse.json({ error: 'Failed to fetch active session' }, { status: 500 })
  }

  // Auto-expire sessions older than 6 hours
  if (session) {
    const startedAt = new Date(session.started_at)
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000)
    if (startedAt < sixHoursAgo) {
      await (supabase as any)
        .from('sessions')
        .update({ is_active: false, ended_at: new Date().toISOString() })
        .eq('id', session.id)
      return NextResponse.json({ session: null })
    }
  }

  return NextResponse.json({ session: session || null })
}
