import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiUnauthorized, apiServerError } from '@/lib/api-response'

// GET /api/sessions/active — get the current user's active session
export async function GET(_request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiUnauthorized()

  const { data: session, error } = await supabase
    .from('sessions')
    .select(`
      *,
      brewery:breweries(id, name, city, state),
      beer_logs(
        id, beer_id, quantity, rating, flavor_tags, serving_style, comment, photo_url, logged_at,
        beer:beers(id, name, style, abv)
      )
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    return apiServerError('sessions/active GET')
  }

  // Auto-expire sessions older than 6 hours
  if (session) {
    const startedAt = new Date(session.started_at)
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000)
    if (startedAt < sixHoursAgo) {
      await supabase
        .from('sessions')
        .update({ is_active: false, ended_at: new Date().toISOString() })
        .eq('id', session.id)
      return NextResponse.json({ session: null })
    }
  }

  return NextResponse.json({ session: session || null })
}
