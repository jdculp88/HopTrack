import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/beer-logs/stats?beer_ids=id1,id2,id3
// Returns per-beer stats for the authenticated user: times tried, average rating
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const beerIds = url.searchParams.get('beer_ids')?.split(',').filter(Boolean) ?? []

  if (beerIds.length === 0) {
    return NextResponse.json({ stats: {} })
  }

  // Query all logs for these beers by this user (excluding current session if needed)
  const { data: logs } = await supabase
    .from('beer_logs')
    .select('beer_id, rating, logged_at')
    .eq('user_id', user.id)
    .in('beer_id', beerIds)

  // Aggregate per beer
  const stats: Record<string, { timesTried: number; avgRating: number | null }> = {}

  for (const beerId of beerIds) {
    const beerLogs = (logs ?? []).filter((l: any) => l.beer_id === beerId)
    const ratedLogs = beerLogs.filter((l: any) => l.rating && l.rating > 0)
    const avgRating = ratedLogs.length > 0
      ? ratedLogs.reduce((sum: number, l: any) => sum + Number(l.rating), 0) / ratedLogs.length
      : null

    stats[beerId] = {
      timesTried: beerLogs.length,
      avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
    }
  }

  return NextResponse.json({ stats })
}
