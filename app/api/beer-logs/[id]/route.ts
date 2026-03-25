import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH /api/beer-logs/[id] — update a beer log (add/edit rating, note, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  // Only allow updating these fields
  const allowedUpdates: any = {}
  if (body.rating !== undefined) allowedUpdates.rating = body.rating
  if (body.comment !== undefined) allowedUpdates.comment = body.comment
  if (body.flavor_tags !== undefined) allowedUpdates.flavor_tags = body.flavor_tags
  if (body.serving_style !== undefined) allowedUpdates.serving_style = body.serving_style
  if (body.photo_url !== undefined) allowedUpdates.photo_url = body.photo_url

  if (Object.keys(allowedUpdates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data: beerLog, error } = await (supabase as any)
    .from('beer_logs')
    .update(allowedUpdates)
    .eq('id', id)
    .eq('user_id', user.id)  // Ensure user owns this log
    .select(`
      *,
      beer:beers(id, name, style, abv, avg_rating)
    `)
    .single()

  if (error) {
    console.error('Error updating beer log:', error)
    return NextResponse.json({ error: 'Failed to update beer log' }, { status: 500 })
  }

  return NextResponse.json({ beerLog })
}

// DELETE /api/beer-logs/[id] — remove a beer log
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { error } = await (supabase as any)
    .from('beer_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete beer log' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
