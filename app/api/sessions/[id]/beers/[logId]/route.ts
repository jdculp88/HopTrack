import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH /api/sessions/[id]/beers/[logId] — update a beer log (rating, comment, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; logId: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: sessionId, logId } = await params
  const body = await request.json()
  const { rating: rawRating, comment } = body

  // Half-star support (Sprint 162): snap to nearest 0.5, require 0.5-5.0 when provided.
  let rating: number | null | undefined = rawRating
  if (typeof rawRating === "number") {
    rating = Math.round(rawRating * 2) / 2
    if (rating < 0.5 || rating > 5.0) {
      return NextResponse.json({ error: 'Rating must be between 0.5 and 5.0' }, { status: 400 })
    }
  }

  // Verify ownership
  const { data: log } = await supabase
    .from('beer_logs')
    .select('id, user_id, session_id')
    .eq('id', logId)
    .eq('session_id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (!log) {
    return NextResponse.json({ error: 'Beer log not found' }, { status: 404 })
  }

  const updates: Record<string, any> = {}
  if (rating !== undefined) updates.rating = rating
  if (comment !== undefined) updates.comment = comment || null

  const { data: updated, error } = await supabase
    .from('beer_logs')
    .update(updates)
    .eq('id', logId)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to update beer log' }, { status: 500 })
  }

  return NextResponse.json({ beerLog: updated })
}
