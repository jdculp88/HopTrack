import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getLevelFromXP } from '@/lib/xp'

// New XP values for sessions
const SESSION_XP = {
  session_start: 25,
  per_beer: 15,
  per_rating: 10,
  first_visit_bonus: 50,
  three_plus_beers_bonus: 25,
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: sessionId } = await params

  // Get session with beer logs
  const { data: session, error: sessionError } = await (supabase as any)
    .from('sessions')
    .select(`
      *,
      beer_logs(id, beer_id, rating, quantity)
    `)
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }
  if (!session.is_active) {
    return NextResponse.json({ error: 'Session already ended' }, { status: 400 })
  }

  const beerLogs: any[] = session.beer_logs || []
  // beerCount = total pours (respects quantity field)
  const beerCount = beerLogs.reduce((sum: number, b: any) => sum + (b.quantity || 1), 0)
  const ratedCount = beerLogs.filter((b: any) => b.rating != null).length
  const isHomeSession = session.context === 'home'

  // Calculate XP
  let xpGained = SESSION_XP.session_start
  xpGained += beerCount * SESSION_XP.per_beer
  xpGained += ratedCount * SESSION_XP.per_rating
  if (beerCount >= 3) xpGained += SESSION_XP.three_plus_beers_bonus

  // First visit bonus only applies to brewery sessions
  let isFirstVisit = false
  if (!isHomeSession && session.brewery_id) {
    const { data: existingSessions } = await (supabase as any)
      .from('sessions')
      .select('id')
      .eq('user_id', user.id)
      .eq('brewery_id', session.brewery_id)
      .neq('id', sessionId)
      .limit(1)

    isFirstVisit = !existingSessions || existingSessions.length === 0
    if (isFirstVisit) xpGained += SESSION_XP.first_visit_bonus
  }

  // End the session
  const { error: endError } = await (supabase as any)
    .from('sessions')
    .update({
      is_active: false,
      ended_at: new Date().toISOString(),
      xp_awarded: xpGained,
    })
    .eq('id', sessionId)

  if (endError) {
    return NextResponse.json({ error: 'Failed to end session' }, { status: 500 })
  }

  // Award XP to user
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('xp, level, unique_breweries')
    .eq('id', user.id)
    .single()

  if (profile) {
    const newXp = (profile.xp || 0) + xpGained
    const levelData = getLevelFromXP(newXp)
    const newLevel = levelData.level

    const updates: any = { xp: newXp, level: newLevel }
    if (isFirstVisit && !isHomeSession) {
      updates.unique_breweries = (profile.unique_breweries || 0) + 1
    }

    await (supabase as any)
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
  }

  // Check achievements (session-based)
  const newAchievements: any[] = []

  const { data: allSessions } = await (supabase as any)
    .from('sessions')
    .select('id')
    .eq('user_id', user.id)

  const sessionCount = allSessions?.length || 0

  const achievementChecks = [
    { key: 'first_checkin', condition: sessionCount >= 1 },
    { key: 'getting_started', condition: sessionCount >= 5 },
    { key: 'regular', condition: sessionCount >= 10 },
    { key: 'session_sampler', condition: beerCount >= 3 },
  ]

  for (const check of achievementChecks) {
    if (!check.condition) continue
    const { data: achievement } = await (supabase as any)
      .from('achievements')
      .select('id, name, description, icon, xp_reward, tier')
      .eq('key', check.key)
      .maybeSingle()

    if (!achievement) continue

    const { data: existing } = await (supabase as any)
      .from('user_achievements')
      .select('id')
      .eq('user_id', user.id)
      .eq('achievement_id', achievement.id)
      .maybeSingle()

    if (!existing) {
      await (supabase as any)
        .from('user_achievements')
        .insert({ user_id: user.id, achievement_id: achievement.id })
      newAchievements.push(achievement)
    }
  }

  return NextResponse.json({
    xpGained,
    isFirstVisit,
    beerCount,
    newAchievements,
    sessionId,
  })
}
