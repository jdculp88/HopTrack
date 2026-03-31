import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getLevelFromXP, SESSION_XP } from '@/lib/xp'
import { sendPushToUser } from '@/lib/push'
import { rateLimitResponse } from '@/lib/rate-limit'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rl = rateLimitResponse(request, 'sessions/end', { limit: 30, windowMs: 60_000 })
  if (rl) return rl

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: sessionId } = await params

  // Get session with beer logs
  const { data: session, error: sessionError } = await supabase
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
    const { data: existingSessions } = await supabase
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
  const { error: endError } = await supabase
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
  await supabase
    .from('session_participants')
    .delete()
    .eq('session_id', sessionId)
    .eq('status', 'pending')

  // Streak calculation (with grace period)
  const { data: profile } = await supabase
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

  const { data: rpcResult, error: rpcError } = await supabase
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
      updates.unique_breweries = ((profile as any)?.unique_breweries || 0) + 1
    }
    if (streakUpdates) {
      updates.current_streak = streakUpdates.current_streak
      updates.longest_streak = Math.max(profile?.longest_streak || 0, streakUpdates.current_streak)
      updates.last_session_date = streakUpdates.last_session_date
    }
    await supabase.from('profiles').update(updates).eq('id', user.id)
  }

  // ─── Achievement checks (batched) ────────────────────────────────────
  const newAchievements: any[] = []

  // Batch: fetch session count + user's existing achievements + all achievements in one round
  const [sessionsCountRes, existingAchievementsRes, allAchievementsRes] = await Promise.all([
    supabase.from('sessions').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('user_achievements').select('achievement_id').eq('user_id', user.id),
    supabase.from('achievements').select('id, key, name, description, icon, xp_reward, tier'),
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
    const { data: allUserLogs } = await supabase
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
    await supabase.from('user_achievements').insert(achievementsToInsert)
  }

  // ─── Notify friends ──────────────────────────────────────────────────
  if (session.share_to_feed) {
    // Batch: fetch user profile + brewery name + friendships in parallel
    const [userProfileRes, breweryRes, friendshipsRes] = await Promise.all([
      supabase.from('profiles').select('display_name, username').eq('id', user.id).single(),
      session.brewery_id
        ? supabase.from('breweries').select('name').eq('id', session.brewery_id).single()
        : Promise.resolve({ data: null }),
      supabase
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
      ;supabase.from('notifications').insert(notifications).then(() => {})

      // Batch: fetch all friend push preferences + subscriptions
      const { data: friendProfiles } = await supabase
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

  // ─── Challenge progress tracking ────────────────────────────────────
  const completedChallenges: any[] = []

  if (!isHomeSession && session.brewery_id) {
    // Get user's active challenges at this brewery
    const { data: activeParticipations } = await (supabase
      .from("challenge_participants")
      .select(`
        id,
        current_progress,
        challenge:challenges(
          id,
          challenge_type,
          target_value,
          target_beer_ids,
          reward_xp,
          reward_loyalty_stamps,
          name,
          icon
        )
      `)
      .eq("user_id", user.id)
      .is("completed_at", null) as any)

    const participations = (activeParticipations ?? []).filter(
      (p: any) => p.challenge?.brewery_id === session.brewery_id || true
    )

    if (participations.length > 0) {
      // Gather session data needed for progress checks
      const sessionBeerIdsSet = new Set(beerLogs.map((b: any) => b.beer_id).filter(Boolean))

      // Fetch unique styles logged this session (for style_variety type)
      let sessionStyles: string[] = []
      if (sessionBeerIdsSet.size > 0) {
        const { data: sessionBeers } = await (supabase
          .from("beers")
          .select("id, style")
          .in("id", [...sessionBeerIdsSet]) as any)
        sessionStyles = (sessionBeers ?? []).map((b: any) => b.style).filter(Boolean)
      }

      // Fetch user's all-time visit count to this brewery (for visit_streak)
      const { count: visitCount } = await supabase
        .from("sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("brewery_id", session.brewery_id)
        .eq("is_active", false) as any

      // Fetch user's all-time unique styles at this brewery (for style_variety)
      const { data: allBreweryLogs } = await (supabase
        .from("beer_logs")
        .select("beer:beers(style)")
        .eq("user_id", user.id)
        .eq("brewery_id", session.brewery_id) as any)
      const allBreweryStyles = new Set(
        (allBreweryLogs ?? []).map((l: any) => (l.beer as any)?.style).filter(Boolean)
      )

      // Fetch distinct beers user has logged at this brewery (for beer_count and specific_beers)
      const { data: allBreweryBeerLogs } = await (supabase
        .from("beer_logs")
        .select("beer_id")
        .eq("user_id", user.id)
        .eq("brewery_id", session.brewery_id)
        .not("beer_id", "is", null) as any)
      const allBreweryBeerIds = new Set((allBreweryBeerLogs ?? []).map((l: any) => l.beer_id))

      for (const participation of participations) {
        const challenge = participation.challenge as any
        if (!challenge) continue

        let newProgress = participation.current_progress

        switch (challenge.challenge_type) {
          case "beer_count":
            // Count distinct beers logged at this brewery (cumulative)
            newProgress = allBreweryBeerIds.size
            break

          case "specific_beers":
            // Count how many target beers the user has tried
            if (challenge.target_beer_ids?.length > 0) {
              const tried = (challenge.target_beer_ids as string[]).filter((id: string) =>
                allBreweryBeerIds.has(id)
              )
              newProgress = tried.length
            }
            break

          case "visit_streak":
            // Total visits to this brewery
            newProgress = (visitCount ?? 0)
            break

          case "style_variety":
            // Unique styles tried at this brewery
            newProgress = allBreweryStyles.size
            break
        }

        if (newProgress <= participation.current_progress) continue

        const isCompleted = newProgress >= challenge.target_value
        const updatePayload: any = { current_progress: newProgress }
        if (isCompleted) {
          updatePayload.completed_at = new Date().toISOString()
        }

        await supabase
          .from("challenge_participants")
          .update(updatePayload)
          .eq("id", participation.id)

        if (isCompleted) {
          // Award challenge XP
          if (challenge.reward_xp > 0) {
            const challengeNewXp = (profile?.xp || 0) + xpGained + challenge.reward_xp
            const challengeNewLevel = getLevelFromXP(challengeNewXp).level
            await supabase.rpc("increment_xp", {
              p_user_id: user.id,
              p_xp_amount: challenge.reward_xp,
              p_new_level: challengeNewLevel,
              p_is_first_visit: false,
              p_streak_updates: null,
            }).then(() => {})
          }

          // Award loyalty stamps if configured
          if (challenge.reward_loyalty_stamps > 0) {
            const { data: loyaltyProgram } = await (supabase
              .from("loyalty_programs")
              .select("id")
              .eq("brewery_id", session.brewery_id)
              .eq("is_active", true)
              .single() as any)

            if (loyaltyProgram) {
              const { data: existingCard } = await (supabase
                .from("loyalty_cards")
                .select("id, stamps")
                .eq("user_id", user.id)
                .eq("program_id", loyaltyProgram.id)
                .single() as any)

              if (existingCard) {
                await supabase
                  .from("loyalty_cards")
                  .update({ stamps: existingCard.stamps + challenge.reward_loyalty_stamps })
                  .eq("id", existingCard.id)
              }
            }
          }

          completedChallenges.push({
            id: challenge.id,
            name: challenge.name,
            icon: challenge.icon,
            reward_xp: challenge.reward_xp,
          })
        }
      }
    }
  }

  // Fetch the completed session for the recap
  const { data: completedSession } = await supabase
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
    completedChallenges,
    sessionId,
    session: completedSession ?? null,
    beerLogs: completedSession?.beer_logs ?? [],
    streakGraceUsed,
  })
}
