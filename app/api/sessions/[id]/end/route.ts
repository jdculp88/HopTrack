import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getLevelFromXP } from '@/lib/xp'
import { sendPushToUser } from '@/lib/push'

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

  // Award XP to user + update streak
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('xp, level, unique_breweries, current_streak, longest_streak, last_session_date')
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

    // Streak calculation
    const today = new Date().toISOString().split('T')[0]
    const lastDate = profile.last_session_date
    let currentStreak = profile.current_streak || 0

    if (lastDate === today) {
      // Already logged today — no streak change
    } else {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      const dayBefore = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]

      if (lastDate === yesterday || lastDate === dayBefore) {
        // Consecutive (with 1-day grace period) — extend streak
        currentStreak += 1
      } else {
        // Streak broken — start fresh
        currentStreak = 1
      }

      updates.current_streak = currentStreak
      updates.longest_streak = Math.max(profile.longest_streak || 0, currentStreak)
      updates.last_session_date = today
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

  // Fetch updated profile to get the current streak value after update
  const { data: updatedProfile } = await (supabase as any)
    .from('profiles')
    .select('current_streak')
    .eq('id', user.id)
    .single()
  const streakForCheck = updatedProfile?.current_streak || 0

  const achievementChecks = [
    { key: 'first_checkin', condition: sessionCount >= 1 },
    { key: 'getting_started', condition: sessionCount >= 5 },
    { key: 'regular', condition: sessionCount >= 10 },
    { key: 'session_sampler', condition: beerCount >= 3 },
    { key: 'seven_day_streak', condition: streakForCheck >= 7 },
    { key: 'thirty_day_streak', condition: streakForCheck >= 30 },
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

  // Style-based achievement checks (only check styles present in this session)
  const sessionStyles = beerLogs
    .map((b: any) => b.beer_id)
    .filter(Boolean)

  if (sessionStyles.length > 0) {
    // Fetch all user's beer logs with styles
    const { data: allUserLogs } = await (supabase as any)
      .from('beer_logs')
      .select('beer:beers(style)')
      .eq('user_id', user.id)
      .not('beer_id', 'is', null)

    if (allUserLogs) {
      const styleCounts: Record<string, number> = {}
      for (const log of allUserLogs) {
        const style = (log.beer as any)?.style
        if (style) styleCounts[style] = (styleCounts[style] || 0) + 1
      }

      // Map style groups to achievement keys
      const styleAchievements = [
        { key: 'ipa_lover', styles: ['IPA', 'Double IPA', 'Hazy IPA', 'Session IPA', 'New England IPA', 'West Coast IPA'], threshold: 10 },
        { key: 'hop_head', styles: ['IPA', 'Double IPA', 'Hazy IPA', 'Session IPA', 'New England IPA', 'West Coast IPA'], threshold: 20 },
        { key: 'sour_head', styles: ['Sour', 'Gose', 'Berliner Weisse', 'Flanders Red', 'Lambic', 'Gueuze'], threshold: 5 },
        { key: 'sour_patch', styles: ['Sour', 'Gose', 'Berliner Weisse', 'Flanders Red', 'Lambic', 'Gueuze'], threshold: 10 },
        { key: 'stout_season', styles: ['Stout', 'Imperial Stout', 'Porter', 'Milk Stout', 'Oatmeal Stout'], threshold: 5 },
        { key: 'dark_side', styles: ['Stout', 'Imperial Stout', 'Porter', 'Milk Stout', 'Oatmeal Stout'], threshold: 10 },
        { key: 'wheat_king', styles: ['Wheat', 'Hefeweizen', 'Witbier', 'Wheat Ale', 'American Wheat'], threshold: 10 },
        { key: 'lager_legend', styles: ['Lager', 'Pilsner', 'Kolsch', 'Helles', 'Munich Lager', 'Vienna Lager'], threshold: 10 },
        { key: 'domestic_drinker', styles: ['Lager', 'Pilsner', 'Cream Ale', 'Blonde Ale', 'American Lager', 'American Blonde Ale'], threshold: 5 },
        { key: 'domestic_devotee', styles: ['Lager', 'Pilsner', 'Cream Ale', 'Blonde Ale', 'American Lager', 'American Blonde Ale'], threshold: 20 },
      ]

      for (const sa of styleAchievements) {
        const count = sa.styles.reduce((sum, s) => sum + (styleCounts[s] || 0), 0)
        if (count < sa.threshold) continue

        const { data: achievement } = await (supabase as any)
          .from('achievements')
          .select('id, name, description, icon, xp_reward, tier')
          .eq('key', sa.key)
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
    }
  }

  // Notify friends (in-app) — fire and forget
  if (session.share_to_feed) {
    const { data: userProfile } = await (supabase as any)
      .from('profiles')
      .select('display_name, username')
      .eq('id', user.id)
      .single()

    const displayName = userProfile?.display_name || userProfile?.username || 'Someone'
    const breweryName = session.brewery_id
      ? (await (supabase as any).from('breweries').select('name').eq('id', session.brewery_id).single()).data?.name
      : null

    const { data: friendships } = await (supabase as any)
      .from('friendships')
      .select('requester_id, addressee_id')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq('status', 'accepted')

    const friendIds = ((friendships ?? []) as any[]).map((f: any) =>
      f.requester_id === user.id ? f.addressee_id : f.requester_id
    )

    if (friendIds.length > 0) {
      const notifications = friendIds.map((friendId: string) => ({
        user_id: friendId,
        type: 'friend_checkin',
        title: `${displayName} just checked in!`,
        body: breweryName
          ? `${displayName} visited ${breweryName} and had ${beerCount} beer${beerCount !== 1 ? 's' : ''}`
          : `${displayName} logged ${beerCount} beer${beerCount !== 1 ? 's' : ''} at home`,
        data: { session_id: sessionId, user_id: user.id },
      }));

      // Insert all notifications (fire and forget)
      (supabase as any).from('notifications').insert(notifications).then(() => {})

      // Send Web Push to friends who have push enabled for friend_activity
      for (const friendId of friendIds) {
        // Check notification preference
        const { data: friendProfile } = await (supabase as any)
          .from('profiles')
          .select('notification_preferences')
          .eq('id', friendId)
          .single()

        const prefs = friendProfile?.notification_preferences || { friend_activity: true }
        if (prefs.friend_activity === false) continue

        const pushBody = breweryName
          ? `${displayName} visited ${breweryName} and had ${beerCount} beer${beerCount !== 1 ? 's' : ''}`
          : `${displayName} logged ${beerCount} beer${beerCount !== 1 ? 's' : ''} at home`

        sendPushToUser(supabase, friendId, {
          title: `${displayName} just checked in!`,
          body: pushBody,
          tag: `friend-checkin-${sessionId}`,
          data: { url: '/home', session_id: sessionId },
        }).catch(() => {}) // fire and forget
      }
    }
  }

  // Fetch the completed session with full beer log details for the recap
  const { data: completedSession } = await (supabase as any)
    .from('sessions')
    .select(`
      *,
      beer_logs(id, beer_id, rating, quantity, comment, serving_style, logged_at, beer:beers(id, name, style))
    `)
    .eq('id', sessionId)
    .single()

  return NextResponse.json({
    xpGained,
    isFirstVisit,
    beerCount,
    newAchievements,
    sessionId,
    session: completedSession ?? null,
    beerLogs: completedSession?.beer_logs ?? [],
  })
}
