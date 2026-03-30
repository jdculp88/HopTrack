import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getLevelFromXP, SESSION_XP } from '@/lib/xp'
import { sendPushToUser } from '@/lib/push'

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

  // Clean up pending participants (S38-010) — accepted ones stay for history
  await (supabase as any)
    .from('session_participants')
    .delete()
    .eq('session_id', sessionId)
    .eq('status', 'pending')

  // Streak calculation (with grace period)
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('xp, level, current_streak, longest_streak, last_session_date, streak_grace_used_at')
    .eq('id', user.id)
    .single()

  let streakUpdates: any = null
  let streakGraceUsed = false
  if (profile) {
    const today = new Date().toISOString().split('T')[0]
    const lastDate = profile.last_session_date

    if (lastDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      const dayBefore = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]
      let currentStreak = profile.current_streak || 0

      if (lastDate === yesterday || lastDate === dayBefore) {
        // Normal streak continuation
        currentStreak += 1
      } else if (currentStreak >= 3) {
        // Streak would break — check grace period eligibility
        const graceUsedAt = profile.streak_grace_used_at
        const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()
        const graceAvailable = !graceUsedAt || graceUsedAt < thirtyDaysAgo

        if (graceAvailable) {
          // Grace period: preserve streak instead of resetting
          currentStreak += 1
          streakGraceUsed = true
        } else {
          currentStreak = 1
        }
      } else {
        currentStreak = 1
      }

      streakUpdates = {
        current_streak: currentStreak,
        last_session_date: today,
        ...(streakGraceUsed ? { streak_grace_used_at: new Date().toISOString() } : {}),
      }
    }
  }

  // Atomic XP increment via RPC — no race condition
  const newXp = (profile?.xp || 0) + xpGained
  const newLevel = getLevelFromXP(newXp).level

  const { data: rpcResult, error: rpcError } = await (supabase as any)
    .rpc('increment_xp', {
      p_user_id: user.id,
      p_xp_amount: xpGained,
      p_new_level: newLevel,
      p_is_first_visit: isFirstVisit && !isHomeSession,
      p_streak_updates: streakUpdates,
    })

  // Fallback to direct update if RPC doesn't exist yet (migration not applied)
  if (rpcError) {
    const updates: any = { xp: newXp, level: newLevel }
    if (isFirstVisit && !isHomeSession) {
      updates.unique_breweries = (profile?.unique_breweries || 0) + 1
    }
    if (streakUpdates) {
      updates.current_streak = streakUpdates.current_streak
      updates.longest_streak = Math.max(profile?.longest_streak || 0, streakUpdates.current_streak)
      updates.last_session_date = streakUpdates.last_session_date
    }
    await (supabase as any).from('profiles').update(updates).eq('id', user.id)
  }

  // ─── Achievement checks (batched) ────────────────────────────────────
  const newAchievements: any[] = []

  // Batch: fetch session count + user's existing achievements + all achievements in one round
  const [sessionsCountRes, existingAchievementsRes, allAchievementsRes] = await Promise.all([
    (supabase as any).from('sessions').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    (supabase as any).from('user_achievements').select('achievement_id').eq('user_id', user.id),
    (supabase as any).from('achievements').select('id, key, name, description, icon, xp_reward, tier'),
  ])

  const sessionCount = sessionsCountRes.count || 0
  const existingAchievementIds = new Set(
    ((existingAchievementsRes.data ?? []) as any[]).map((a: any) => a.achievement_id)
  )
  const achievementsByKey = new Map(
    ((allAchievementsRes.data ?? []) as any[]).map((a: any) => [a.key, a])
  )

  const streakForCheck = streakUpdates?.current_streak ?? profile?.current_streak ?? 0

  // Session-based achievement checks
  const achievementChecks = [
    { key: 'first_checkin', condition: sessionCount >= 1 },
    { key: 'getting_started', condition: sessionCount >= 5 },
    { key: 'regular', condition: sessionCount >= 10 },
    { key: 'session_sampler', condition: beerCount >= 3 },
    { key: 'seven_day_streak', condition: streakForCheck >= 7 },
    { key: 'thirty_day_streak', condition: streakForCheck >= 30 },
  ]

  const achievementsToInsert: { user_id: string; achievement_id: string }[] = []

  for (const check of achievementChecks) {
    if (!check.condition) continue
    const achievement = achievementsByKey.get(check.key)
    if (!achievement || existingAchievementIds.has(achievement.id)) continue
    achievementsToInsert.push({ user_id: user.id, achievement_id: achievement.id })
    newAchievements.push(achievement)
    existingAchievementIds.add(achievement.id) // prevent double-insert
  }

  // Style-based achievement checks
  const sessionBeerIds = beerLogs.map((b: any) => b.beer_id).filter(Boolean)

  if (sessionBeerIds.length > 0) {
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
        const achievement = achievementsByKey.get(sa.key)
        if (!achievement || existingAchievementIds.has(achievement.id)) continue
        achievementsToInsert.push({ user_id: user.id, achievement_id: achievement.id })
        newAchievements.push(achievement)
        existingAchievementIds.add(achievement.id)
      }
    }
  }

  // Batch insert all new achievements
  if (achievementsToInsert.length > 0) {
    await (supabase as any).from('user_achievements').insert(achievementsToInsert)
  }

  // ─── Notify friends ──────────────────────────────────────────────────
  if (session.share_to_feed) {
    // Batch: fetch user profile + brewery name + friendships in parallel
    const [userProfileRes, breweryRes, friendshipsRes] = await Promise.all([
      (supabase as any).from('profiles').select('display_name, username').eq('id', user.id).single(),
      session.brewery_id
        ? (supabase as any).from('breweries').select('name').eq('id', session.brewery_id).single()
        : Promise.resolve({ data: null }),
      (supabase as any)
        .from('friendships')
        .select('requester_id, addressee_id')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted'),
    ])

    const displayName = userProfileRes.data?.display_name || userProfileRes.data?.username || 'Someone'
    const breweryName = breweryRes.data?.name ?? null

    const friendIds = ((friendshipsRes.data ?? []) as any[]).map((f: any) =>
      f.requester_id === user.id ? f.addressee_id : f.requester_id
    )

    if (friendIds.length > 0) {
      const notifBody = breweryName
        ? `${displayName} visited ${breweryName} and had ${beerCount} beer${beerCount !== 1 ? 's' : ''}`
        : `${displayName} logged ${beerCount} beer${beerCount !== 1 ? 's' : ''} at home`

      const notifications = friendIds.map((friendId: string) => ({
        user_id: friendId,
        type: 'friend_checkin',
        title: `${displayName} just checked in!`,
        body: notifBody,
        data: { session_id: sessionId, user_id: user.id },
      }))

      // Insert all notifications (fire and forget)
      ;(supabase as any).from('notifications').insert(notifications).then(() => {})

      // Batch: fetch all friend push preferences + subscriptions
      const { data: friendProfiles } = await (supabase as any)
        .from('profiles')
        .select('id, notification_preferences')
        .in('id', friendIds)

      const pushEligibleFriends = ((friendProfiles ?? []) as any[]).filter((fp: any) => {
        const prefs = fp.notification_preferences || { friend_activity: true }
        return prefs.friend_activity !== false
      })

      // Send push in parallel (fire and forget)
      for (const fp of pushEligibleFriends) {
        sendPushToUser(supabase, fp.id, {
          title: `${displayName} just checked in!`,
          body: notifBody,
          tag: `friend-checkin-${sessionId}`,
          data: { url: '/home', session_id: sessionId },
        }).catch(() => {})
      }
    }
  }

  // Fetch the completed session for the recap
  const { data: completedSession } = await (supabase as any)
    .from('sessions')
    .select(`
      *,
      beer_logs(id, beer_id, rating, quantity, comment, serving_style, logged_at, beer:beers(id, name, style, glass_type, abv, avg_rating))
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
    streakGraceUsed,
  })
}
