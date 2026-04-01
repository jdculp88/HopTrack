'use client'

import { useState, useEffect, useCallback } from 'react'
import { FullScreenDrawer } from '@/components/ui/Modal'
import { useSession } from '@/hooks/useSession'
import { useSessionContext } from '@/contexts/SessionContext'
import { useToast } from '@/components/ui/Toast'
import QuickRatingSheet from '@/components/session/QuickRatingSheet'
import { TapWallHeader } from '@/components/session/tap-wall/TapWallHeader'
import { TapWallBeerList } from '@/components/session/tap-wall/TapWallBeerList'
import { TapWallSessionTray } from '@/components/session/tap-wall/TapWallSessionTray'
import type { TapWallBeer } from '@/components/session/tap-wall/TapWallBeerCard'
import type { Session, BeerLog } from '@/types/database'

interface TapWallSheetProps {
  isOpen: boolean
  onClose: () => void
  onMinimize?: () => void
  session: Session
  breweryName: string
  breweryId: string | null
  homeMode?: boolean
  onSessionEnd: (result: { xpGained: number; newAchievements: any[]; session?: any; beerLogs?: any[] }) => void
  onSessionCancelled?: () => void
}

function useElapsedTime(startedAt: string) {
  const [elapsed, setElapsed] = useState('')

  const compute = useCallback(() => {
    const start = new Date(startedAt)
    const now = new Date()
    const diffMs = now.getTime() - start.getTime()
    const mins = Math.floor(diffMs / 60000)
    const hours = Math.floor(mins / 60)
    const rem = mins % 60
    setElapsed(hours > 0 ? `${hours}h ${rem}m` : `${mins}m`)
  }, [startedAt])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    compute()
    const interval = setInterval(compute, 60000)
    return () => clearInterval(interval)
  }, [compute])

  return elapsed
}

export default function TapWallSheet({
  isOpen,
  onClose,
  onMinimize,
  session,
  breweryName,
  breweryId,
  homeMode = false,
  onSessionEnd,
  onSessionCancelled,
}: TapWallSheetProps) {
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
  const elapsed = useElapsedTime(session.started_at)

  // Fetch participants on open
  useEffect(() => {
    if (!isOpen) return
    fetch(`/api/sessions/${session.id}/participants`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setParticipants(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [isOpen, session.id, setParticipants])

  // Debounced friend search
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

  // Fetch beers on open
  useEffect(() => {
    if (!isOpen) return
    setBeerLoading(true)

    const url = homeMode
      ? (query.trim() ? `/api/beers?q=${encodeURIComponent(query)}&limit=20` : null)
      : (breweryId ? `/api/beers?brewery_id=${breweryId}` : null)

    if (!url) {
      setBeers([])
      setBeerLoading(false)
      return
    }

    fetch(url)
      .then((r) => r.json())
      .then((d) => setBeers((d.beers as TapWallBeer[]) ?? []))
      .catch(() => setBeers([]))
      .finally(() => setBeerLoading(false))
  }, [isOpen, breweryId, homeMode])

  // Home mode: debounced re-fetch on query change
  useEffect(() => {
    if (!isOpen || !homeMode) return
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
  }, [query, isOpen, homeMode])

  // Fetch previously-rated beers on open
  useEffect(() => {
    if (!isOpen) return
    fetch('/api/beer-logs/rated')
      .then((r) => r.json())
      .then((d) => {
        const map = new Map<string, number>()
        for (const entry of d.rated ?? []) map.set(entry.beer_id, entry.rating)
        setPreviousRatings(map)
      })
      .catch(() => {})
  }, [isOpen])

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
      onSessionEnd({ xpGained: result.xpGained, newAchievements: result.newAchievements, session: result.session, beerLogs: result.beerLogs })
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

  const totalPours = beerLogs.reduce((sum, l) => sum + (l.quantity ?? 1), 0)

  return (
    <>
      <FullScreenDrawer open={isOpen} onClose={onClose}>
        <TapWallHeader
          breweryName={breweryName}
          elapsed={elapsed}
          beerLogs={beerLogs}
          totalPours={totalPours}
          query={query}
          onQueryChange={setQuery}
          onMinimize={onMinimize ?? onClose}
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
      </FullScreenDrawer>

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
