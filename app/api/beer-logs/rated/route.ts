import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/beer-logs/rated — returns beer_ids the user has previously rated
// Used to skip the rating sheet when re-logging a beer they've already reviewed
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await (supabase as any)
    .from('beer_logs')
    .select('beer_id, rating')
    .eq('user_id', user.id)
    .not('beer_id', 'is', null)
    .not('rating', 'is', null)
    .order('logged_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch rated beers' }, { status: 500 })
  }

  // Deduplicate: only keep the most recent rating per beer
  const seen = new Set<string>()
  const rated: { beer_id: string; rating: number }[] = []
  for (const log of data ?? []) {
    if (!seen.has(log.beer_id)) {
      seen.add(log.beer_id)
      rated.push({ beer_id: log.beer_id, rating: log.rating })
    }
  }

  return NextResponse.json({ rated })
}
