'use client'

// DetentSheet — Sprint 170 (The Glass)
// iOS-style 3-detent bottom sheet for the active session experience.
// Peek: minimized bar (brewery name + beer count + time)
// Half: session summary + quick action buttons
// Full: complete TapWall content (header + beer list + session tray)

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Beer, ChevronUp, ChevronDown, Clock, Plus, Square, Users } from 'lucide-react'
import { useDetentSheet, type Detent } from '@/hooks/useDetentSheet'
import { useSession } from '@/hooks/useSession'
import { useSessionContext } from '@/contexts/SessionContext'
import { useToast } from '@/components/ui/Toast'
import { spring, transition, variants } from '@/lib/animation'
import { buildMeshGradient, getBubbleGlow } from '@/lib/session-colors'
import { TapWallHeader } from '@/components/session/tap-wall/TapWallHeader'
import { TapWallBeerList } from '@/components/session/tap-wall/TapWallBeerList'
import { TapWallSessionTray } from '@/components/session/tap-wall/TapWallSessionTray'
import QuickRatingSheet from '@/components/session/QuickRatingSheet'
import type { TapWallBeer } from '@/components/session/tap-wall/TapWallBeerCard'
import type { Session, BeerLog } from '@/types/database'
import type { TapWallMode } from '@/contexts/SessionContext'

// ─── Elapsed Time ─────────────────────────────────────────────────────────────

function useElapsedTime(startedAt: string) {
  const [elapsed, setElapsed] = useState('')

  const compute = useCallback(() => {
    const start = new Date(startedAt)
    const diffMs = Date.now() - start.getTime()
    const mins = Math.floor(diffMs / 60000)
    const hours = Math.floor(mins / 60)
    const rem = mins % 60
    setElapsed(hours > 0 ? `${hours}h ${rem}m` : `${mins}m`)
  }, [startedAt])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- compute initial elapsed time on mount, then interval updates
    compute()
    const interval = setInterval(compute, 60000)
    return () => clearInterval(interval)
  }, [compute])

  return elapsed
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface DetentSheetProps {
  session: Session
  breweryName: string
  breweryId: string | null
  homeMode?: boolean
  initialDetent: Detent
  onDetentChange: (detent: Detent) => void
  onSessionEnd: (result: {
    xpGained: number
    newAchievements: any[]
    session?: any
    beerLogs?: any[]
    xpBase?: number
    xpTier?: 'normal' | 'lucky' | 'golden'
    xpMultiplier?: number
    leveledUp?: boolean
    newLevelInfo?: { level: number; name: string } | null
    streakMilestone?: number | null
  }) => void
  onSessionCancelled?: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DetentSheet({
  session,
  breweryName,
  breweryId,
  homeMode = false,
  initialDetent,
  onDetentChange,
  onSessionEnd,
  onSessionCancelled,
}: DetentSheetProps) {
  const { currentDetent, snapTo, dragProps, sheetHeight } = useDetentSheet({
    initialDetent,
    onDetentChange,
  })

  const {
    beerLogs,
    addBeerLog: ctxAddBeerLog,
    updateBeerLog: ctxUpdateBeerLog,
    removeBeerLog: ctxRemoveBeerLog,
    sessionNote,
    setSessionNote,
    participants,
    setParticipants,
  } = useSessionContext()

  const toast = useToast()
  const elapsed = useElapsedTime(session.started_at)
  const contentRef = useRef<HTMLDivElement>(null)

  // ─── TapWall State ────────────────────────────────────────────────────────

  const [beers, setBeers] = useState<TapWallBeer[]>([])
  const [beerLoading, setBeerLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [loggingBeer, setLoggingBeer] = useState<string | null>(null)
  const [incrementingLog, setIncrementingLog] = useState<string | null>(null)
  const [decrementingLog, setDecrementingLog] = useState<string | null>(null)
  const [ratingSheet, setRatingSheet] = useState<{ log: BeerLog; beerName: string; previousRating?: number | null } | null>(null)
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [ending, setEnding] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [showNoteInput, setShowNoteInput] = useState(!!session.note)
  const [showInvite, setShowInvite] = useState(false)
  const [friendSearch, setFriendSearch] = useState('')
  const [friendResults, setFriendResults] = useState<Array<{ id: string; username: string; display_name: string | null; avatar_url: string | null }>>([])
  const [inviting, setInviting] = useState<string | null>(null)
  const [previousRatings, setPreviousRatings] = useState<Map<string, number>>(new Map())
  const { logBeer, updateBeerLog, incrementBeerQuantity, removeBeerLog, endSession, cancelSession } = useSession()

  const isFull = currentDetent === 'full'
  const isHalfOrFull = currentDetent === 'half' || currentDetent === 'full'

  // ─── Data Fetching (same as TapWallSheet, fetches when at full) ───────────

  useEffect(() => {
    if (!isFull) return
    fetch(`/api/sessions/${session.id}/participants`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setParticipants(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [isFull, session.id, setParticipants])

  useEffect(() => {
    if (!friendSearch.trim() || friendSearch.length < 2) { setFriendResults([]); return }
    const timer = setTimeout(() => {
      fetch(`/api/users/search?q=${encodeURIComponent(friendSearch)}&limit=5`)
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => setFriendResults(Array.isArray(data) ? data : []))
        .catch(() => setFriendResults([]))
    }, 250)
    return () => clearTimeout(timer)
  }, [friendSearch])

  useEffect(() => {
    if (!isFull) return
    setBeerLoading(true)
    const url = homeMode
      ? (query.trim() ? `/api/beers?q=${encodeURIComponent(query)}&limit=20` : null)
      : (breweryId ? `/api/beers?brewery_id=${breweryId}` : null)
    if (!url) { setBeers([]); setBeerLoading(false); return }
    fetch(url)
      .then((r) => r.json())
      .then((d) => setBeers((d.beers as TapWallBeer[]) ?? []))
      .catch(() => setBeers([]))
      .finally(() => setBeerLoading(false))
  }, [isFull, breweryId, homeMode]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isFull || !homeMode) return
    if (!query.trim()) { setBeers([]); return }
    setBeerLoading(true)
    const timer = setTimeout(() => {
      fetch(`/api/beers?q=${encodeURIComponent(query)}&limit=20`)
        .then((r) => r.json())
        .then((d) => setBeers((d.beers as TapWallBeer[]) ?? []))
        .catch(() => setBeers([]))
        .finally(() => setBeerLoading(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [query, isFull, homeMode])

  useEffect(() => {
    if (!isFull) return
    fetch('/api/beer-logs/rated')
      .then((r) => r.json())
      .then((d) => {
        const map = new Map<string, number>()
        for (const entry of d.rated ?? []) map.set(entry.beer_id, entry.rating)
        setPreviousRatings(map)
      })
      .catch(() => {})
  }, [isFull])

  // ─── Handlers (from TapWallSheet) ─────────────────────────────────────────

  async function handleInvite(friendId: string) {
    setInviting(friendId)
    try {
      const res = await fetch(`/api/sessions/${session.id}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: friendId }),
      })
      if (res.ok) {
        const participant = await res.json()
        setParticipants([...participants, participant])
        setShowInvite(false)
        setFriendSearch('')
        setFriendResults([])
      }
    } finally {
      setInviting(null)
    }
  }

  async function handleLogBeer(beer: TapWallBeer) {
    setLoggingBeer(beer.id)
    const tempLog: BeerLog = {
      id: `temp-${beer.id}`,
      session_id: session.id,
      user_id: session.user_id,
      beer_id: beer.id,
      brewery_id: breweryId,
      quantity: 1,
      rating: null,
      flavor_tags: null,
      serving_style: null,
      comment: null,
      photo_url: null,
      logged_at: new Date().toISOString(),
      beer: { id: beer.id, name: beer.name, style: beer.style, abv: beer.abv, avg_rating: beer.avg_rating },
    }
    ctxAddBeerLog(tempLog)
    setLoggingBeer(null)
    const result = await logBeer(session.id, { beer_id: beer.id, brewery_id: breweryId ?? undefined })
    if (result) {
      ctxUpdateBeerLog(tempLog.id, { ...result, beer: tempLog.beer })
      const prevRating = previousRatings.get(beer.id)
      setRatingSheet({ log: result, beerName: beer.name, previousRating: prevRating ?? null })
    } else {
      ctxRemoveBeerLog(tempLog.id)
    }
  }

  async function handleIncrement(log: BeerLog) {
    setIncrementingLog(log.id)
    const updated = await incrementBeerQuantity(log.id, log.quantity ?? 1)
    if (updated) ctxUpdateBeerLog(log.id, { ...log, quantity: updated.quantity })
    setIncrementingLog(null)
  }

  async function handleDecrement(log: BeerLog) {
    setDecrementingLog(log.id)
    const currentQty = log.quantity ?? 1
    if (currentQty <= 1) {
      const ok = await removeBeerLog(log.id)
      if (ok) ctxRemoveBeerLog(log.id)
    } else {
      const updated = await updateBeerLog(log.id, { quantity: currentQty - 1 })
      if (updated) ctxUpdateBeerLog(log.id, { ...log, quantity: currentQty - 1 })
    }
    setDecrementingLog(null)
  }

  async function handleSaveRating(logId: string, rating: number, comment?: string) {
    const existing = beerLogs.find(l => l.id === logId)
    if (existing) ctxUpdateBeerLog(logId, { ...existing, rating, comment: comment ?? existing.comment })
    await updateBeerLog(logId, { rating, comment })
    setRatingSheet(null)
  }

  async function handleEndSession() {
    setEnding(true)
    if (sessionNote.trim()) {
      await fetch(`/api/sessions/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: sessionNote.trim() }),
      }).catch(() => {})
    }
    const result = await endSession(session.id)
    setEnding(false)
    setShowEndConfirm(false)
    if (result) {
      onSessionEnd({
        xpGained: result.xpGained,
        newAchievements: result.newAchievements,
        session: result.session,
        beerLogs: result.beerLogs,
        xpBase: result.xpBase,
        xpTier: result.xpTier,
        xpMultiplier: result.xpMultiplier,
        leveledUp: result.leveledUp,
        newLevelInfo: result.newLevelInfo,
        streakMilestone: result.streakMilestone,
      })
    }
  }

  async function handleCancelSession() {
    setCancelling(true)
    const success = await cancelSession(session.id)
    setCancelling(false)
    setShowCancelConfirm(false)
    if (success) {
      toast.info('Session cancelled')
      onSessionCancelled?.()
    } else {
      toast.error('Failed to cancel session')
    }
  }

  // ─── Computed Values ──────────────────────────────────────────────────────

  const totalPours = beerLogs.reduce((sum, l) => sum + (l.quantity ?? 1), 0)
  const meshGradient = buildMeshGradient(beerLogs)
  const bubbleGlow = getBubbleGlow(beerLogs)
  const uniqueStyles = new Set(beerLogs.map(l => (l.beer as any)?.style).filter(Boolean)).size

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <motion.div
        {...dragProps}
        className="fixed left-0 right-0 z-50 flex flex-col rounded-t-2xl overflow-hidden"
        data-detent-sheet
        style={{
          ...dragProps.style,
          height: sheetHeight,
          bottom: isFull ? 0 : 72, // Sprint 171: peek/half sit above mobile nav (72px), full covers all
          background: 'var(--bg)',
          boxShadow: 'var(--shadow-elevated)',
          touchAction: isFull ? 'pan-y' : 'none',
        }}
      >
        {/* ── Peek Zone — Drag Handle (always visible, always draggable) ──── */}
        <div
          className="flex-shrink-0 relative cursor-grab active:cursor-grabbing select-none"
          style={{
            background: meshGradient,
            boxShadow: `${bubbleGlow}, inset 0 1px 0 rgba(255,255,255,0.25), inset 0 0 0 1px color-mix(in srgb, var(--accent-gold) 25%, transparent)`,
            transition: 'background 0.6s ease, box-shadow 0.6s ease',
          }}
        >
          {/* Liquid Glass overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.00) 65%, rgba(255,255,255,0.08) 100%)',
            }}
          />

          {/* Drag indicator bar */}
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-8 h-1 rounded-full bg-black/30" />
          </div>

          <div className="flex items-center justify-between px-4 pb-3 relative">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-7 h-7 rounded-full bg-black/20 flex items-center justify-center backdrop-blur-sm">
                  <Beer size={14} className="text-white" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border border-black/20 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-black leading-none truncate">{breweryName}</p>
                <p className="text-xs text-black/70 leading-none mt-0.5 font-mono">
                  {totalPours} {totalPours === 1 ? 'beer' : 'beers'} · {elapsed}
                </p>
              </div>
            </div>
            <button
              onClick={() => snapTo(isFull ? 'peek' : 'full')}
              className="flex items-center gap-1.5 flex-shrink-0 p-1"
              aria-label={isFull ? 'Minimize session' : 'Expand session'}
            >
              <span className="text-xs font-semibold text-black/70">
                {isFull ? 'Minimize' : 'Expand'}
              </span>
              {isFull ? <ChevronDown size={16} className="text-black/70" /> : <ChevronUp size={16} className="text-black/70" />}
            </button>
          </div>
        </div>

        {/* ── Half Zone — Summary + Quick Actions (visible at half+) ──────── */}
        <AnimatePresence>
          {isHalfOrFull && (
            <motion.div
              initial={variants.slideUpSmall.initial}
              animate={variants.slideUpSmall.animate}
              exit={variants.slideUpSmall.exit}
              transition={transition.fast}
              className="flex-shrink-0 px-4 py-4 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 rounded-xl" style={{ background: 'var(--surface)' }}>
                  <p className="text-lg font-bold font-mono" style={{ color: 'var(--accent-gold)' }}>{totalPours}</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Pours</p>
                </div>
                <div className="text-center p-2 rounded-xl" style={{ background: 'var(--surface)' }}>
                  <p className="text-lg font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{uniqueStyles}</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Styles</p>
                </div>
                <div className="text-center p-2 rounded-xl" style={{ background: 'var(--surface)' }}>
                  <p className="text-lg font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{elapsed}</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Time</p>
                </div>
              </div>

              {/* Quick actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => snapTo('full')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--accent-gold)', color: 'var(--bg)' }}
                >
                  <Plus size={16} />
                  Log Beer
                </button>
                <button
                  onClick={() => { snapTo('full'); setShowEndConfirm(true) }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                >
                  <Square size={14} />
                  End
                </button>
              </div>

              {/* Participants preview */}
              {participants.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <Users size={12} style={{ color: 'var(--text-muted)' }} />
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {participants.length} {participants.length === 1 ? 'friend' : 'friends'} drinking along
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Full Zone — TapWall Content (visible at full, scrollable) ───── */}
        {isFull && (
          <div
            ref={contentRef}
            className="flex-1 overflow-y-auto overscroll-contain"
            style={{ touchAction: 'pan-y' }}
          >
            <TapWallHeader
              breweryName={breweryName}
              elapsed={elapsed}
              beerLogs={beerLogs}
              totalPours={totalPours}
              query={query}
              onQueryChange={setQuery}
              onMinimize={() => snapTo('peek')}
              homeMode={homeMode}
            />

            <TapWallBeerList
              beers={beers}
              beerLoading={beerLoading}
              query={query}
              homeMode={homeMode}
              beerLogs={beerLogs}
              loggingBeer={loggingBeer}
              incrementingLog={incrementingLog}
              decrementingLog={decrementingLog}
              onLogBeer={handleLogBeer}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
            />

            <TapWallSessionTray
              breweryName={breweryName}
              homeMode={homeMode}
              beerLogs={beerLogs}
              totalPours={totalPours}
              elapsed={elapsed}
              showEndConfirm={showEndConfirm}
              setShowEndConfirm={setShowEndConfirm}
              showCancelConfirm={showCancelConfirm}
              setShowCancelConfirm={setShowCancelConfirm}
              ending={ending}
              cancelling={cancelling}
              onEndSession={handleEndSession}
              onCancelSession={handleCancelSession}
              participants={participants}
              showInvite={showInvite}
              setShowInvite={setShowInvite}
              friendSearch={friendSearch}
              setFriendSearch={setFriendSearch}
              friendResults={friendResults}
              inviting={inviting}
              onInvite={handleInvite}
              sessionNote={sessionNote}
              setSessionNote={setSessionNote}
              showNoteInput={showNoteInput}
              setShowNoteInput={setShowNoteInput}
            />
          </div>
        )}
      </motion.div>

      {/* Rating sheet (renders outside the detent sheet) */}
      {ratingSheet && (
        <QuickRatingSheet
          beerLog={ratingSheet.log}
          beerName={ratingSheet.beerName}
          isOpen={!!ratingSheet}
          onSave={handleSaveRating}
          onSkip={() => setRatingSheet(null)}
          previousRating={ratingSheet.previousRating}
        />
      )}
    </>
  )
}
