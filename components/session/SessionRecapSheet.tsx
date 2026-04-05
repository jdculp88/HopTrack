'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Session, BeerLog } from '@/types/database'
import { SESSION_XP, type XpTier } from '@/lib/xp'
import { C, formatDuration, formatSessionDate, getOrdinalSuffix } from './recap/recapUtils'
import RecapHeader from './recap/RecapHeader'
import RecapPhotoGallery from './recap/RecapPhotoGallery'
import RecapStats from './recap/RecapStats'
import RecapBreweryRating from './recap/RecapBreweryRating'
import RecapBeerLogs from './recap/RecapBeerLogs'
import RecapAchievements from './recap/RecapAchievements'
import RecapShareActions from './recap/RecapShareActions'
import type { BreweryStats } from './recap/recapUtils'
import { XpTierCelebration } from '@/components/celebrations/XpTierCelebration'
import { LevelUpCelebration } from '@/components/celebrations/LevelUpCelebration'
import { StreakMilestoneCelebration } from '@/components/celebrations/StreakMilestoneCelebration'

type CelebrationKind = 'xpTier' | 'levelUp' | 'streak' | null

interface SessionRecapSheetProps {
  isOpen: boolean
  session: Session | null
  breweryName: string
  beerLogs: BeerLog[]
  xpGained: number
  newAchievements: Array<{ id: string; name: string; icon?: string; xp_reward: number }>
  // Sprint 161 — The Vibe (all optional for backward compat)
  xpTier?: XpTier
  xpMultiplier?: number
  xpBase?: number
  leveledUp?: boolean
  newLevelInfo?: { level: number; name: string } | null
  streakMilestone?: number | null
  onClose: () => void
  onShare?: () => void
}

export default function SessionRecapSheet({
  isOpen,
  session,
  breweryName,
  beerLogs,
  xpGained,
  newAchievements,
  xpTier = 'normal',
  xpMultiplier = 1,
  xpBase = xpGained,
  leveledUp = false,
  newLevelInfo = null,
  streakMilestone = null,
  onClose,
  onShare,
}: SessionRecapSheetProps) {
  const [fired, setFired] = useState(false)
  const [activeCelebration, setActiveCelebration] = useState<CelebrationKind>(null)
  const [celebrationQueue, setCelebrationQueue] = useState<Exclude<CelebrationKind, null>[]>([])
  const [recapRatings, setRecapRatings] = useState<Record<string, number>>({})
  const [beerNotes, setBeerNotes] = useState<Record<string, string>>({})
  const [breweryRating, setBreweryRating] = useState(0)
  const [breweryHoverRating, setBreweryHoverRating] = useState(0)
  const [breweryReviewSubmitted, setBreweryReviewSubmitted] = useState(false)
  const [hasExistingBreweryReview, setHasExistingBreweryReview] = useState(false)
  const [existingBreweryRating, setExistingBreweryRating] = useState(0)
  const [_breweryReviewLoading, setBreweryReviewLoading] = useState(false)
  const [breweryStats, setBreweryStats] = useState<BreweryStats | null>(null)
  const [progressAnimated, setProgressAnimated] = useState(false)
  const [beerHistory, setBeerHistory] = useState<Record<string, { timesTried: number; avgRating: number | null }>>({})
  const [sessionPhotos, setSessionPhotos] = useState<Array<{ id: string; photo_url: string }>>([])

  const isBrewerySession = session && session.context !== 'home' && session.brewery_id
  const isHomeSession = !isBrewerySession
  const allLogs = useMemo(() => beerLogs ?? [], [beerLogs])
  const totalBeers = allLogs.reduce((sum, l) => sum + (l.quantity ?? 1), 0)
  const duration = session ? formatDuration(session.started_at, session.ended_at) : ''
  const dateStr = session ? formatSessionDate(session.started_at, session.ended_at) : ''
  const newTries = allLogs.filter(l => !l.rating || l.rating === 0).length

  // XP breakdown
  const xpBreakdown = [
    { label: 'Session completed', value: SESSION_XP.session_start },
    ...(totalBeers > 0 ? [{ label: `${totalBeers} beer${totalBeers > 1 ? 's' : ''} checked in`, value: totalBeers * SESSION_XP.per_beer }] : []),
    ...(allLogs.filter(l => l.rating && l.rating > 0).length > 0
      ? [{
          label: `${allLogs.filter(l => l.rating && l.rating > 0).length} new beer${allLogs.filter(l => l.rating && l.rating > 0).length > 1 ? 's' : ''} tried`,
          value: allLogs.filter(l => l.rating && l.rating > 0).length * SESSION_XP.per_rating,
        }]
      : []),
    ...(totalBeers >= 3 ? [{ label: '3+ beers bonus', value: SESSION_XP.three_plus_beers_bonus }] : []),
    ...((breweryStats?.visit_count ?? 0) > 1
      ? [{ label: `${breweryStats?.visit_count ?? 0}${getOrdinalSuffix(breweryStats?.visit_count ?? 0)} visit streak (${breweryName})`, value: 10 }]
      : []),
    ...newAchievements.map(a => ({ label: `🏆 ${a.name}`, value: a.xp_reward })),
  ]

  // ── Data fetching ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen || !isBrewerySession) return
    const breweryId = session!.brewery_id

    fetch(`/api/brewery/${breweryId}/reviews`)
      .then(r => r.json())
      .then(data => {
        if (data.userReview) {
          setHasExistingBreweryReview(true)
          setExistingBreweryRating(data.userReview.rating)
        }
      })
      .catch(() => {})

    fetch(`/api/brewery/${breweryId}/user-stats`)
      .then(r => r.json())
      .then(data => setBreweryStats(data))
      .catch(() => {})
  }, [isOpen, isBrewerySession, session])

  useEffect(() => {
    if (!isOpen || allLogs.length === 0) return
    const beerIds = allLogs.map(l => l.beer_id ?? l.beer?.id).filter(Boolean)
    if (beerIds.length === 0) return

    fetch(`/api/beer-logs/stats?beer_ids=${beerIds.join(',')}`)
      .then(r => r.json())
      .then(data => { if (data.stats) setBeerHistory(data.stats) })
      .catch(() => {})
  }, [isOpen, allLogs])

  useEffect(() => {
    if (!isOpen || !session?.id) return
    fetch(`/api/sessions/${session.id}/photos`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setSessionPhotos(data) })
      .catch(() => {})
  }, [isOpen, session])

  useEffect(() => {
    if (isOpen && !fired) {
      setFired(true)

      // Build celebration queue (Sprint 161 — The Vibe)
      const queue: Exclude<CelebrationKind, null>[] = []
      if (xpTier !== 'normal') queue.push('xpTier')
      if (leveledUp && newLevelInfo) queue.push('levelUp')
      if (streakMilestone) queue.push('streak')

      if (queue.length > 0) {
        setCelebrationQueue(queue)
        setActiveCelebration(queue[0])
      } else {
        // No special celebration — fall back to standard confetti burst
        setTimeout(() => {
          import('canvas-confetti').then(m =>
            m.default({ particleCount: 80, spread: 70, origin: { y: 0.4 }, colors: ['#c8943a', '#b7522f', '#fff'] })
          )
        }, 300)
      }

      setTimeout(() => setProgressAnimated(true), 800)
    }
    if (!isOpen) {
      setFired(false)
      setActiveCelebration(null)
      setCelebrationQueue([])
      setRecapRatings({})
      setBeerNotes({})
      setBreweryRating(0)
      setBreweryHoverRating(0)
      setBreweryReviewSubmitted(false)
      setHasExistingBreweryReview(false)
      setExistingBreweryRating(0)
      setBreweryStats(null)
      setProgressAnimated(false)
      setBeerHistory({})
      setSessionPhotos([])
    }
  }, [isOpen, fired, xpTier, leveledUp, newLevelInfo, streakMilestone])

  // Advance the celebration queue
  const handleCelebrationDismiss = useCallback(() => {
    setCelebrationQueue((prev) => {
      const next = prev.slice(1)
      setActiveCelebration(next[0] ?? null)
      return next
    })
  }, [])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleBeerRate = useCallback(async (logId: string, rating: number) => {
    setRecapRatings(prev => ({ ...prev, [logId]: rating }))
    if (session?.id) {
      fetch(`/api/sessions/${session.id}/beers/${logId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      }).catch(() => {})
    }
  }, [session])

  const saveBeerNotes = useCallback(() => {
    if (!session?.id) return
    Object.entries(beerNotes).forEach(([logId, note]) => {
      if (note.trim()) {
        fetch(`/api/sessions/${session.id}/beers/${logId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ comment: note.trim() }),
        }).catch(() => {})
      }
    })
  }, [session, beerNotes])

  const handleClose = useCallback(() => {
    saveBeerNotes()
    onClose()
  }, [saveBeerNotes, onClose])

  const handleBreweryStarClick = useCallback((val: number) => {
    setBreweryRating(val)
    setTimeout(async () => {
      if (!isBrewerySession) return
      setBreweryReviewLoading(true)
      const breweryId = session!.brewery_id
      const res = await fetch(`/api/brewery/${breweryId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: val, comment: null }),
      })
      if (res.ok) setBreweryReviewSubmitted(true)
      setBreweryReviewLoading(false)
    }, 200)
  }, [isBrewerySession, session])

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Celebration queue — stacks above the sheet (z-[200]) */}
      {(xpTier === 'lucky' || xpTier === 'golden') && (
        <XpTierCelebration
          show={activeCelebration === 'xpTier'}
          tier={xpTier}
          multiplier={xpMultiplier}
          baseXp={xpBase}
          finalXp={xpGained}
          onDismiss={handleCelebrationDismiss}
        />
      )}
      {leveledUp && newLevelInfo && (
        <LevelUpCelebration
          show={activeCelebration === 'levelUp'}
          newLevel={newLevelInfo.level}
          levelName={newLevelInfo.name}
          onDismiss={handleCelebrationDismiss}
        />
      )}
      {streakMilestone && (
        <StreakMilestoneCelebration
          show={activeCelebration === 'streak'}
          streakDays={streakMilestone}
          onDismiss={handleCelebrationDismiss}
        />
      )}

      <AnimatePresence>
        {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] overflow-y-auto"
          style={{
            background: C.bg,
            backgroundImage: `radial-gradient(ellipse at 50% -5%, ${C.goldSoft} 0%, transparent 50%), radial-gradient(ellipse at 30% 100%, ${C.accentSoft} 0%, transparent 40%)`,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <div className="max-w-[430px] mx-auto relative" style={{ minHeight: '100vh', paddingBottom: 40 }}>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center text-lg transition-colors"
              style={{
                background: 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(8px)',
                border: `1px solid ${C.cardBorder}`,
                color: C.text3,
              }}
              aria-label="Close recap"
            >
              ✕
            </button>

            <RecapHeader
              isHomeSession={!!isHomeSession}
              breweryName={breweryName}
              dateStr={dateStr}
              xpGained={xpGained}
            />

            <RecapPhotoGallery photos={sessionPhotos} />

            <RecapStats
              duration={duration}
              totalBeers={totalBeers}
              newTries={newTries}
              breweryStats={breweryStats}
              breweryName={breweryName}
              xpGained={xpGained}
              xpBreakdown={xpBreakdown}
              session={session}
              progressAnimated={progressAnimated}
            />

            {isBrewerySession && (
              <RecapBreweryRating
                breweryName={breweryName}
                breweryStats={breweryStats}
                breweryRating={breweryRating}
                breweryHoverRating={breweryHoverRating}
                breweryReviewSubmitted={breweryReviewSubmitted}
                hasExistingBreweryReview={hasExistingBreweryReview}
                existingBreweryRating={existingBreweryRating}
                onHoverEnter={setBreweryHoverRating}
                onHoverLeave={() => setBreweryHoverRating(0)}
                onStarClick={handleBreweryStarClick}
              />
            )}

            <RecapBeerLogs
              logs={allLogs}
              recapRatings={recapRatings}
              beerNotes={beerNotes}
              beerHistory={beerHistory}
              onBeerRate={handleBeerRate}
              onNoteChange={(logId, note) => setBeerNotes(prev => ({ ...prev, [logId]: note }))}
            />

            <RecapAchievements achievements={newAchievements} />

            <RecapShareActions onClose={handleClose} onShare={onShare} />

          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  )
}
