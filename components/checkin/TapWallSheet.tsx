'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Check, Loader2, Beer, Plus } from 'lucide-react'
import { FullScreenDrawer } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/SkeletonLoader'
import { useSession } from '@/hooks/useSession'
import QuickRatingSheet from '@/components/checkin/QuickRatingSheet'
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
  session: Session
  breweryName: string
  breweryId: string | null
  homeMode?: boolean
  onSessionEnd: (result: { xpGained: number; newAchievements: any[] }) => void
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
  session,
  breweryName,
  breweryId,
  homeMode = false,
  onSessionEnd,
}: TapWallSheetProps) {
  const [beers, setBeers] = useState<TapWallBeer[]>([])
  const [beerLoading, setBeerLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [localLogs, setLocalLogs] = useState<BeerLog[]>(session.beer_logs ?? [])
  const [loggingBeer, setLoggingBeer] = useState<string | null>(null)
  const [incrementingLog, setIncrementingLog] = useState<string | null>(null)
  const [ratingSheet, setRatingSheet] = useState<{ log: BeerLog; beerName: string } | null>(null)
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [ending, setEnding] = useState(false)
  // Map of beer_id → previous rating (from any past session)
  const [previousRatings, setPreviousRatings] = useState<Map<string, number>>(new Map())
  const { logBeer, updateBeerLog, incrementBeerQuantity, endSession } = useSession()
  const elapsed = useElapsedTime(session.started_at)

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

  // Sync logs from session prop on open
  useEffect(() => {
    if (isOpen) {
      setLocalLogs(session.beer_logs ?? [])
    }
  }, [isOpen, session.beer_logs])

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

  // beer_id → log in this session
  const loggedBeerMap = new Map<string, BeerLog>()
  for (const log of localLogs) {
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
    setLocalLogs((prev) => [...prev, tempLog])
    setLoggingBeer(null)

    const result = await logBeer(session.id, {
      beer_id: beer.id,
      brewery_id: breweryId ?? undefined,
    })

    if (result) {
      setLocalLogs((prev) => prev.map((l) => l.id === tempLog.id ? { ...result, beer: tempLog.beer } : l))
      // Skip rating sheet if user has already rated this beer in a past session
      if (!previousRatings.has(beer.id)) {
        setRatingSheet({ log: result, beerName: beer.name })
      }
    } else {
      setLocalLogs((prev) => prev.filter((l) => l.id !== tempLog.id))
    }
  }

  async function handleIncrement(log: BeerLog) {
    setIncrementingLog(log.id)
    const updated = await incrementBeerQuantity(log.id, log.quantity ?? 1)
    if (updated) {
      setLocalLogs((prev) => prev.map((l) => l.id === log.id ? { ...l, quantity: updated.quantity } : l))
    }
    setIncrementingLog(null)
  }

  async function handleSaveRating(logId: string, rating: number, comment?: string) {
    setLocalLogs((prev) => prev.map((l) => l.id === logId ? { ...l, rating, comment: comment ?? l.comment } : l))
    await updateBeerLog(logId, { rating, comment })
    setRatingSheet(null)
  }

  async function handleEndSession() {
    setEnding(true)
    const result = await endSession(session.id)
    setEnding(false)
    setShowEndConfirm(false)
    if (result) {
      onSessionEnd({ xpGained: result.xpGained, newAchievements: result.newAchievements })
    }
  }

  // Total pours (sum of quantities)
  const totalPours = localLogs.reduce((sum, l) => sum + (l.quantity ?? 1), 0)

  return (
    <>
      <FullScreenDrawer open={isOpen} onClose={onClose}>
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            onClick={onClose}
            className="p-2 -ml-2 rounded-xl transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X size={20} />
          </button>
          <div className="text-center flex-1 px-2">
            <p className="font-display font-bold text-base leading-tight" style={{ color: 'var(--text-primary)' }}>
              {breweryName}
            </p>
            <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              {elapsed}
            </p>
          </div>
          <div
            className="px-2.5 py-1 rounded-xl text-xs font-mono font-semibold"
            style={{ background: 'var(--surface-2)', color: 'var(--accent-gold)', border: '1px solid var(--border)' }}
          >
            {totalPours} {totalPours === 1 ? 'beer' : 'beers'}
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
                  <p className="text-xs font-mono uppercase tracking-widest pt-2 pb-1" style={{ color: 'var(--accent-gold)' }}>
                    Already had
                  </p>
                  {loggedBeers.map((beer) => {
                    const log = loggedBeerMap.get(beer.id)!
                    return (
                      <BeerRow
                        key={beer.id}
                        beer={beer}
                        logged
                        quantity={log.quantity ?? 1}
                        incrementing={incrementingLog === log.id}
                        onIncrement={() => handleIncrement(log)}
                        loading={false}
                        onLog={() => {}}
                      />
                    )
                  })}
                  {unloggedBeers.length > 0 && (
                    <p className="text-xs font-mono uppercase tracking-widest pt-3 pb-1" style={{ color: 'var(--text-muted)' }}>
                      {homeMode ? 'More results' : 'On tap'}
                    </p>
                  )}
                </>
              )}

              {/* Unlogged beers */}
              {unloggedBeers.map((beer) => (
                <BeerRow
                  key={beer.id}
                  beer={beer}
                  logged={false}
                  quantity={1}
                  incrementing={false}
                  onIncrement={() => {}}
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
                      style={{ background: 'var(--danger)', color: '#fff' }}
                    >
                      {ending ? <><Loader2 size={14} className="animate-spin" /> Ending...</> : 'End session'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between gap-3 py-2">
            <div>
              <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                {totalPours} {totalPours === 1 ? 'beer' : 'beers'} · {elapsed}
              </p>
            </div>
            <button
              onClick={() => setShowEndConfirm(true)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: 'var(--surface-2)',
                color: 'var(--danger)',
                border: '1px solid color-mix(in srgb, var(--danger) 30%, transparent)',
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
        />
      )}
    </>
  )
}

// ─── Beer Row ──────────────────────────────────────────────────────────────────
function BeerRow({
  beer,
  logged,
  quantity,
  incrementing,
  onIncrement,
  loading,
  onLog,
}: {
  beer: TapWallBeer
  logged: boolean
  quantity: number
  incrementing: boolean
  onIncrement: () => void
  loading: boolean
  onLog: () => void
}) {
  return (
    <div
      className="flex items-center gap-3 p-3.5 rounded-2xl transition-all"
      style={{
        background: logged
          ? 'color-mix(in srgb, var(--accent-gold) 8%, var(--surface))'
          : 'var(--surface)',
        border: logged
          ? '1px solid color-mix(in srgb, var(--accent-gold) 35%, transparent)'
          : '1px solid var(--border)',
      }}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: logged
            ? 'linear-gradient(135deg, #D4A843 0%, #E8841A 100%)'
            : 'var(--surface-2)',
        }}
      >
        {logged ? (
          <Check size={16} className="text-black" />
        ) : (
          <Beer size={16} style={{ color: 'var(--text-muted)' }} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className="font-display font-semibold text-sm leading-tight truncate"
          style={{ color: logged ? 'var(--accent-gold)' : 'var(--text-primary)' }}
        >
          {beer.name}
        </p>
        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
          {beer.style ?? 'Beer'}
          {beer.abv != null && ` · ${formatABV(beer.abv)}`}
          {beer.avg_rating != null && ` · ★ ${beer.avg_rating.toFixed(1)}`}
        </p>
      </div>

      {/* Action */}
      {logged ? (
        <div className="flex items-center gap-2 flex-shrink-0">
          {quantity > 1 && (
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg" style={{ background: 'var(--surface-2)', color: 'var(--accent-gold)' }}>
              ×{quantity}
            </span>
          )}
          <button
            onClick={onIncrement}
            disabled={incrementing}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-60"
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
            title="Had another one"
          >
            {incrementing ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
          </button>
        </div>
      ) : (
        <button
          onClick={onLog}
          disabled={loading}
          className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-60 flex items-center gap-1"
          style={{
            background: 'linear-gradient(135deg, #D4A843 0%, #E8841A 100%)',
            color: '#0F0E0C',
          }}
        >
          {loading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <>I&apos;m having this</>
          )}
        </button>
      )}
    </div>
  )
}
