'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Check, Loader2, Beer, Plus, Users, ChevronDown, AlertTriangle } from 'lucide-react'
import { getStyleFamily } from '@/lib/beerStyleColors'
import { getStyleHex, buildMeshGradient } from '@/lib/session-colors'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { FullScreenDrawer } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/SkeletonLoader'
import { useSession } from '@/hooks/useSession'
import { useSessionContext } from '@/contexts/SessionContext'
import { useToast } from '@/components/ui/Toast'
import QuickRatingSheet from '@/components/session/QuickRatingSheet'
import { formatABV } from '@/lib/utils'
import type { Session, BeerLog } from '@/types/database'

interface TapWallBeer {
  id: string
  name: string
  style: string | null
  abv: number | null
  avg_rating: number | null
}

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

function BeerSkeletonRow() {
  return (
    <div
      className="flex items-center gap-3 p-4 rounded-2xl"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-3/5 rounded" />
        <Skeleton className="h-3 w-2/5 rounded" />
      </div>
      <Skeleton className="w-20 h-9 rounded-xl flex-shrink-0" />
    </div>
  )
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
  // Beer logs from context — persist across mount/unmount
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

  // Ephemeral UI state (local only)
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

  // Debounced friend search for invite
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

  // In home mode, re-fetch on query change (debounced)
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

  // Fetch previously-rated beer IDs on open (for smart re-review skip)
  useEffect(() => {
    if (!isOpen) return
    fetch('/api/beer-logs/rated')
      .then((r) => r.json())
      .then((d) => {
        const map = new Map<string, number>()
        for (const entry of d.rated ?? []) {
          map.set(entry.beer_id, entry.rating)
        }
        setPreviousRatings(map)
      })
      .catch(() => {})
  }, [isOpen])

  // beer_id → log in this session (from context)
  const loggedBeerMap = new Map<string, BeerLog>()
  for (const log of beerLogs) {
    if (log.beer_id) loggedBeerMap.set(log.beer_id, log)
  }

  const filtered = query.trim()
    ? beers.filter((b) => b.name.toLowerCase().includes(query.toLowerCase()))
    : beers

  const loggedBeers = filtered.filter((b) => loggedBeerMap.has(b.id))
  const unloggedBeers = filtered.filter((b) => !loggedBeerMap.has(b.id))

  async function handleLogBeer(beer: TapWallBeer) {
    if (loggedBeerMap.has(beer.id)) return
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

    const result = await logBeer(session.id, {
      beer_id: beer.id,
      brewery_id: breweryId ?? undefined,
    })

    if (result) {
      ctxUpdateBeerLog(tempLog.id, { ...result, beer: tempLog.beer })
      // Show rating sheet — pass previous rating if user has already rated this beer
      const prevRating = previousRatings.get(beer.id)
      setRatingSheet({ log: result, beerName: beer.name, previousRating: prevRating ?? null })
    } else {
      ctxRemoveBeerLog(tempLog.id)
    }
  }

  async function handleIncrement(log: BeerLog) {
    setIncrementingLog(log.id)
    const updated = await incrementBeerQuantity(log.id, log.quantity ?? 1)
    if (updated) {
      ctxUpdateBeerLog(log.id, { ...log, quantity: updated.quantity })
    }
    setIncrementingLog(null)
  }

  async function handleDecrement(log: BeerLog) {
    setDecrementingLog(log.id)
    const currentQty = log.quantity ?? 1
    if (currentQty <= 1) {
      // Remove the log entirely
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
    if (existing) {
      ctxUpdateBeerLog(logId, { ...existing, rating, comment: comment ?? existing.comment })
    }
    await updateBeerLog(logId, { rating, comment })
    setRatingSheet(null)
  }

  async function handleEndSession() {
    setEnding(true)
    // Save session note if present
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

  // Total pours (sum of quantities)
  const totalPours = beerLogs.reduce((sum, l) => sum + (l.quantity ?? 1), 0)

  // Last beer logged
  const lastBeer = beerLogs.length > 0 ? beerLogs[beerLogs.length - 1] : null

  return (
    <>
      <FullScreenDrawer open={isOpen} onClose={onClose}>
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            onClick={onMinimize ?? onClose}
            className="p-2 -ml-2 rounded-xl transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            title="Minimize"
          >
            <ChevronDown size={20} />
          </button>
          <div className="text-center flex-1 px-2 min-w-0">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
              <p className="font-display font-bold text-base leading-tight truncate" style={{ color: 'var(--text-primary)' }}>
                {breweryName}
              </p>
            </div>
            <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              {elapsed}
              {lastBeer?.beer && <span> · {lastBeer.beer.name}</span>}
            </p>
          </div>
          {/* Mesh gradient beer count badge */}
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden"
            style={{
              background: buildMeshGradient(beerLogs),
              transition: 'background 0.6s ease',
            }}
          >
            <span
              className="text-sm font-bold font-mono text-white"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
            >
              {totalPours}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pt-4 pb-2 flex-shrink-0">
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }}>
              <Search size={15} />
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={homeMode ? 'Search all beers...' : 'Search the tap list...'}
              className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-colors"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>

        {/* Beer list */}
        <div className="flex-1 overflow-y-auto px-4 pb-32 space-y-2">
          {beerLoading ? (
            <>
              {[...Array(5)].map((_, i) => <BeerSkeletonRow key={i} />)}
            </>
          ) : homeMode && !query.trim() ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <span className="text-5xl">🍺</span>
              <p className="font-display text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                What are you having?
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Search for a beer to log it.
              </p>
            </div>
          ) : beers.length === 0 && !homeMode ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <span className="text-5xl">🍺</span>
              <p className="font-display text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                No beers on tap yet
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                The tap list for this brewery hasn&apos;t been added yet.
              </p>
            </div>
          ) : (
            <>
              {/* Already had this session */}
              {loggedBeers.length > 0 && (
                <>
                  <div className="flex items-center gap-2 pt-2 pb-1">
                    <p className="text-[10.5px] font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                      Already Had
                    </p>
                    <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                  </div>
                  {loggedBeers.map((beer) => {
                    const log = loggedBeerMap.get(beer.id)!
                    return (
                      <BeerCard
                        key={beer.id}
                        beer={beer}
                        logged
                        quantity={log.quantity ?? 1}
                        incrementing={incrementingLog === log.id}
                        decrementing={decrementingLog === log.id}
                        onIncrement={() => handleIncrement(log)}
                        onDecrement={() => handleDecrement(log)}
                        loading={false}
                        onLog={() => {}}
                      />
                    )
                  })}
                  {unloggedBeers.length > 0 && (
                    <div className="flex items-center gap-2 pt-3 pb-1">
                      <p className="text-[10.5px] font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                        {homeMode ? 'More Results' : 'On Tap'}
                      </p>
                      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                    </div>
                  )}
                </>
              )}

              {/* Unlogged beers */}
              {unloggedBeers.map((beer) => (
                <BeerCard
                  key={beer.id}
                  beer={beer}
                  logged={false}
                  quantity={1}
                  incrementing={false}
                  decrementing={false}
                  onIncrement={() => {}}
                  onDecrement={() => {}}
                  loading={loggingBeer === beer.id}
                  onLog={() => handleLogBeer(beer)}
                />
              ))}

              {query.trim() && filtered.length === 0 && (
                <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>
                  No beers match &ldquo;{query}&rdquo;
                </p>
              )}
            </>
          )}
        </div>

        {/* Session tray */}
        <div
          className="absolute bottom-0 left-0 right-0 px-4 pb-safe pt-3"
          style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}
        >
          {/* End session confirmation */}
          <AnimatePresence>
            {showEndConfirm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pb-3">
                  <p className="text-sm font-medium text-center mb-3" style={{ color: 'var(--text-primary)' }}>
                    {homeMode ? 'Finish your home session?' : `End your session at ${breweryName}?`}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowEndConfirm(false)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
                      style={{
                        background: 'var(--surface-2)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEndSession}
                      disabled={ending}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
                      style={{ background: 'var(--accent-gold)', color: 'var(--bg)' }}
                    >
                      {ending ? <><Loader2 size={14} className="animate-spin" /> Ending...</> : 'End & save'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cancel session confirmation */}
          <AnimatePresence>
            {showCancelConfirm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pb-3">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <AlertTriangle size={16} style={{ color: 'var(--danger)' }} />
                    <p className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>
                      Cancel session?
                    </p>
                  </div>
                  <p className="text-xs text-center mb-3" style={{ color: 'var(--text-muted)' }}>
                    All {totalPours} beer {totalPours === 1 ? 'log' : 'logs'} and notes will be permanently deleted. No XP will be awarded.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
                      style={{
                        background: 'var(--surface-2)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      Keep going
                    </button>
                    <button
                      onClick={handleCancelSession}
                      disabled={cancelling}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
                      style={{ background: 'var(--danger)', color: '#fff' }}
                    >
                      {cancelling ? <><Loader2 size={14} className="animate-spin" /> Cancelling...</> : 'Yes, cancel'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Drinking With */}
          <div className="py-1">
            <div className="flex items-center gap-2">
              {participants.filter((p) => p.status === 'accepted').map((p) => (
                <div key={p.id} title={p.profile?.display_name ?? p.profile?.username ?? ''}>
                  <UserAvatar
                    profile={{ display_name: p.profile?.display_name ?? p.profile?.username ?? '', avatar_url: p.profile?.avatar_url ?? null, username: p.profile?.username ?? '' }}
                    size="xs"
                  />
                </div>
              ))}
              {participants.filter((p) => p.status === 'pending').length > 0 && (
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  +{participants.filter((p) => p.status === 'pending').length} pending
                </span>
              )}
              <button
                onClick={() => setShowInvite(!showInvite)}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors"
                style={{
                  background: 'var(--surface-2)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border)',
                }}
              >
                <Users size={11} />
                {participants.length > 0 ? 'Invite more' : 'Invite friends'}
              </button>
            </div>

            <AnimatePresence>
              {showInvite && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mt-2"
                >
                  <input
                    type="text"
                    value={friendSearch}
                    onChange={(e) => setFriendSearch(e.target.value)}
                    placeholder="Search friends to invite..."
                    className="w-full px-3 py-2 rounded-xl text-sm border outline-none"
                    style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                  {friendResults.length > 0 && (
                    <div className="mt-1 rounded-xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                      {friendResults.map((friend) => {
                        const alreadyInvited = participants.some((p) => p.user_id === friend.id)
                        return (
                          <button
                            key={friend.id}
                            onClick={() => !alreadyInvited && handleInvite(friend.id)}
                            disabled={alreadyInvited || inviting === friend.id}
                            className="w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors disabled:opacity-60"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            <div className="flex items-center gap-2">
                              <UserAvatar profile={{ display_name: friend.display_name ?? friend.username, avatar_url: friend.avatar_url, username: friend.username }} size="xs" />
                              <span>{friend.display_name ?? friend.username}</span>
                            </div>
                            {alreadyInvited ? (
                              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Invited</span>
                            ) : inviting === friend.id ? (
                              <Loader2 size={12} className="animate-spin" style={{ color: 'var(--accent-gold)' }} />
                            ) : (
                              <Plus size={14} style={{ color: 'var(--accent-gold)' }} />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Session note */}
          <AnimatePresence>
            {showNoteInput ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden py-1"
              >
                <input
                  type="text"
                  value={sessionNote}
                  onChange={(e) => setSessionNote(e.target.value)}
                  placeholder="Add a note... (date night, solo Friday)"
                  className="w-full px-3 py-2 rounded-xl text-sm border outline-none"
                  style={{
                    background: 'var(--surface-2)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </motion.div>
            ) : (
              <button
                onClick={() => setShowNoteInput(true)}
                className="text-xs py-1"
                style={{ color: 'var(--text-muted)' }}
              >
                + Add a note
              </button>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between gap-3 py-2">
            <button
              onClick={() => { setShowCancelConfirm(true); setShowEndConfirm(false) }}
              className="text-xs px-2 py-1.5 rounded-lg transition-colors flex-shrink-0"
              style={{ color: 'var(--text-muted)' }}
            >
              Cancel
            </button>

            {/* Beer color dot strip + count */}
            <div className="flex items-center gap-2 flex-1 justify-center min-w-0">
              {beerLogs.length > 0 && (
                <div className="flex flex-shrink-0">
                  {beerLogs.slice(0, 6).map((log, i) => {
                    const family = getStyleFamily((log.beer as { style?: string | null } | undefined)?.style)
                    const hex = getStyleHex(family)
                    return (
                      <span
                        key={log.id}
                        className="block w-2.5 h-2.5 rounded-full"
                        style={{
                          background: hex.primary,
                          border: '1.5px solid var(--surface)',
                          marginLeft: i > 0 ? '-3px' : 0,
                          position: 'relative',
                          zIndex: 6 - i,
                        }}
                      />
                    )
                  })}
                </div>
              )}
              <p className="text-xs font-mono truncate" style={{ color: 'var(--text-muted)' }}>
                {totalPours} {totalPours === 1 ? 'beer' : 'beers'} · {elapsed}
              </p>
            </div>

            <button
              onClick={() => { setShowEndConfirm(true); setShowCancelConfirm(false) }}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all flex-shrink-0"
              style={{
                background: beerLogs.length > 0
                  ? getStyleHex(getStyleFamily((beerLogs[0].beer as { style?: string | null } | undefined)?.style)).primary
                  : 'var(--accent-gold)',
                color: '#fff',
                transition: 'background 0.4s ease',
              }}
            >
              End session
            </button>
          </div>
        </div>
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

// ─── QtyStepper ────────────────────────────────────────────────────────────────
function QtyStepper({
  qty,
  onInc,
  onDec,
  incrementing,
  decrementing,
  primaryHex,
}: {
  qty: number
  onInc: () => void
  onDec: () => void
  incrementing: boolean
  decrementing: boolean
  primaryHex: string
}) {
  return (
    <div
      className="flex items-center rounded-xl overflow-hidden"
      style={{
        background: primaryHex + '0D',
        border: `1px solid ${primaryHex}22`,
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onDec() }}
        disabled={decrementing}
        className="w-8 h-8 flex items-center justify-center text-base font-medium transition-colors disabled:opacity-40"
        style={{ color: primaryHex }}
        title={qty <= 1 ? 'Remove' : 'One less'}
      >
        {decrementing ? <Loader2 size={11} className="animate-spin" /> : '−'}
      </button>
      <span
        className="min-w-6 text-center text-sm font-bold font-mono"
        style={{
          color: primaryHex,
          borderLeft: `1px solid ${primaryHex}15`,
          borderRight: `1px solid ${primaryHex}15`,
          lineHeight: '2rem',
        }}
      >
        {qty}
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); onInc() }}
        disabled={incrementing}
        className="w-8 h-8 flex items-center justify-center text-base font-medium transition-colors disabled:opacity-40"
        style={{ color: primaryHex }}
        title="Had another"
      >
        {incrementing ? <Loader2 size={11} className="animate-spin" /> : '+'}
      </button>
    </div>
  )
}

// ─── Beer Card ─────────────────────────────────────────────────────────────────
function BeerCard({
  beer,
  logged,
  quantity,
  incrementing,
  decrementing,
  onIncrement,
  onDecrement,
  loading,
  onLog,
}: {
  beer: TapWallBeer
  logged: boolean
  quantity: number
  incrementing: boolean
  decrementing: boolean
  onIncrement: () => void
  onDecrement: () => void
  loading: boolean
  onLog: () => void
}) {
  const family = getStyleFamily(beer.style)
  const hex = getStyleHex(family)

  return (
    <div
      onClick={!logged ? onLog : undefined}
      className="relative rounded-2xl overflow-hidden transition-all"
      style={{
        border: `1.5px solid ${logged ? hex.primary + '30' : 'var(--border)'}`,
        background: logged
          ? `radial-gradient(ellipse at 85% 20%, ${hex.primary}0A 0%, transparent 50%), var(--surface)`
          : 'var(--surface)',
        boxShadow: logged ? `0 2px 10px ${hex.primary}10` : undefined,
        cursor: logged ? 'default' : 'pointer',
      }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{
          background: logged ? hex.primary : 'transparent',
          transition: 'background 0.3s',
        }}
      />

      <div className="pl-5 pr-4 py-3">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              background: logged ? hex.primary : 'var(--surface-2)',
              border: `1px solid ${logged ? hex.primary : 'var(--border)'}`,
            }}
          >
            {logged ? (
              <Check size={14} className="text-white" />
            ) : (
              <Beer size={15} style={{ color: hex.primary, opacity: 0.55 }} />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold text-sm leading-tight truncate" style={{ color: 'var(--text-primary)' }}>
              {beer.name}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {/* Style pill */}
              {beer.style && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded"
                  style={{
                    background: hex.primary + '14',
                    border: `1px solid ${hex.primary}20`,
                    color: hex.primary,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full block" style={{ background: hex.primary }} />
                  {beer.style}
                </span>
              )}
              {beer.abv != null && (
                <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  {formatABV(beer.abv)}
                </span>
              )}
              {beer.avg_rating != null && (
                <span className="text-[11px] font-mono" style={{ color: logged ? hex.primary : 'var(--text-muted)' }}>
                  ★ {beer.avg_rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>

          {/* Action */}
          <div className="flex-shrink-0">
            {logged ? (
              <QtyStepper
                qty={quantity}
                onInc={onIncrement}
                onDec={onDecrement}
                incrementing={incrementing}
                decrementing={decrementing}
                primaryHex="#D4A843"
              />
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onLog() }}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-60 flex items-center gap-1"
                style={{
                  background: 'var(--accent-gold)',
                  color: 'var(--bg)',
                }}
              >
                {loading ? <Loader2 size={12} className="animate-spin" /> : "I'm having this"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
