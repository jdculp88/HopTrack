'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Share2, Trophy, Check, ChevronRight } from 'lucide-react'
import type { Options as ConfettiOptions } from 'canvas-confetti'
import { StarRating } from '@/components/ui/StarRating'
import { getGlass, getGlassSvgContent } from '@/lib/glassware'
import { Session, BeerLog } from '@/types/database'

interface SessionRecapSheetProps {
  isOpen: boolean
  session: Session | null
  breweryName: string
  beerLogs: BeerLog[]
  xpGained: number
  newAchievements: any[]
  onClose: () => void
  onShare?: () => void
}

function formatDuration(startedAt: string, endedAt?: string | null) {
  const start = new Date(startedAt)
  const end = endedAt ? new Date(endedAt) : new Date()
  const diffMs = end.getTime() - start.getTime()
  const hours = Math.floor(diffMs / 3600000)
  const mins = Math.floor((diffMs % 3600000) / 60000)
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

// Counts up from 0 to target on mount
function AnimatedXP({ target }: { target: number }) {
  const [count, setCount] = useState(0)
  const started = useRef(false)
  useEffect(() => {
    if (target <= 0 || started.current) return
    started.current = true
    const duration = 900
    const start = performance.now()
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    const id = setTimeout(() => requestAnimationFrame(step), 400)
    return () => clearTimeout(id)
  }, [target])
  return <>{count}</>
}

// Compact glass SVG
function GlassIcon({ glassType, instanceId, size = 36 }: { glassType?: string | null; instanceId: string; size?: number }) {
  const glass = getGlass(glassType || 'shaker_pint')
  if (!glass) return null
  return (
    <svg
      viewBox="0 0 80 120"
      width={size}
      height={size * 1.5}
      dangerouslySetInnerHTML={{ __html: getGlassSvgContent(glass, instanceId) }}
    />
  )
}

export default function SessionRecapSheet({
  isOpen,
  session,
  breweryName,
  beerLogs,
  xpGained,
  newAchievements,
  onClose,
  onShare,
}: SessionRecapSheetProps) {
  const [fired, setFired] = useState(false)
  const [recapRatings, setRecapRatings] = useState<Record<string, number>>({})
  const [ratedFromRecap, setRatedFromRecap] = useState<Set<string>>(new Set())
  const [breweryRating, setBreweryRating] = useState(0)
  const [breweryComment, setBreweryComment] = useState('')
  const [showBreweryComment, setShowBreweryComment] = useState(false)
  const [breweryReviewSubmitted, setBreweryReviewSubmitted] = useState(false)
  const [hasExistingBreweryReview, setHasExistingBreweryReview] = useState(false)
  const [existingBreweryRating, setExistingBreweryRating] = useState(0)
  const [breweryReviewLoading, setBreweryReviewLoading] = useState(false)

  const isBrewerySession = session && (session as any).context !== 'home' && (session as any).brewery_id
  const isHomeSession = !isBrewerySession

  useEffect(() => {
    if (!isOpen || !isBrewerySession) return
    const breweryId = (session as any).brewery_id
    fetch(`/api/brewery/${breweryId}/reviews`)
      .then((r) => r.json())
      .then((data) => {
        if (data.userReview) {
          setHasExistingBreweryReview(true)
          setExistingBreweryRating(data.userReview.rating)
        }
      })
      .catch(() => {})
  }, [isOpen, isBrewerySession, session])

  useEffect(() => {
    if (isOpen && !fired) {
      setFired(true)
      setTimeout(() => {
        import('canvas-confetti').then(m => m.default({ particleCount: 80, spread: 70, origin: { y: 0.4 }, colors: ['#D4A843', '#E8841A', '#fff'] }))
      }, 300)
    }
    if (!isOpen) {
      setFired(false)
      setRecapRatings({})
      setRatedFromRecap(new Set())
      setBreweryRating(0)
      setBreweryComment('')
      setShowBreweryComment(false)
      setBreweryReviewSubmitted(false)
      setHasExistingBreweryReview(false)
      setExistingBreweryRating(0)
    }
  }, [isOpen, fired])

  const allLogs = beerLogs ?? []
  const totalBeers = allLogs.reduce((sum, l) => sum + (l.quantity ?? 1), 0)
  const duration = session ? formatDuration(session.started_at, session.ended_at) : ''

  const uniqueStyles = Array.from(new Set(allLogs.map((l) => (l as any).beer?.style).filter(Boolean)))

  // All beers that are either already rated or just rated inline
  const getRating = (log: BeerLog) => recapRatings[log.id] ?? log.rating ?? 0
  const unratedLogs = allLogs.filter((b) => getRating(b) === 0)
  const ratedLogs = allLogs.filter((b) => getRating(b) > 0)

  // Top pour — highest rated 4+
  const topPour = [...allLogs]
    .map((log) => ({ log, rating: getRating(log) }))
    .filter((c) => c.rating >= 4)
    .sort((a, b) => b.rating - a.rating)[0] ?? null

  const handleBeerRate = useCallback(async (logId: string, rating: number) => {
    setRecapRatings((prev) => ({ ...prev, [logId]: rating }))
    setRatedFromRecap((prev) => new Set(prev).add(logId))
    if (session?.id) {
      fetch(`/api/sessions/${session.id}/beers/${logId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      }).catch(() => {})
    }
  }, [session])

  const handleBreweryReview = useCallback(async (rating: number) => {
    if (!isBrewerySession) return
    setBreweryReviewLoading(true)
    const breweryId = (session as any).brewery_id
    const res = await fetch(`/api/brewery/${breweryId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, comment: breweryComment || null }),
    })
    if (res.ok) {
      setBreweryReviewSubmitted(true)
      setBreweryRating(rating)
    }
    setBreweryReviewLoading(false)
  }, [isBrewerySession, session, breweryComment])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] overflow-y-auto"
          style={{ background: '#0F0E0C' }}
        >
          {/* Gold top accent line */}
          <div
            className="fixed top-0 left-0 right-0 h-[2px] z-10"
            style={{ background: 'linear-gradient(90deg, transparent, var(--accent-gold), var(--accent-amber), transparent)' }}
          />

          <div className="max-w-lg mx-auto px-5 pb-12">
            {/* Close */}
            <div className="flex justify-end pt-6 pb-2">
              <button
                onClick={onClose}
                className="p-2 rounded-xl transition-opacity hover:opacity-60"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Close recap"
              >
                <X size={20} />
              </button>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 1 — THE MOMENT
            ══════════════════════════════════════════════════════════════════ */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26, delay: 0.05 }}
              className="text-center pb-6"
            >
              {/* Eyebrow */}
              <p
                className="font-mono text-[10px] uppercase tracking-[0.3em] mb-3"
                style={{ color: 'var(--accent-gold)' }}
              >
                {isHomeSession ? 'Home Session Complete' : 'Session Complete'}
              </p>

              {/* Name — the hero */}
              <h1
                className="font-display font-bold leading-none mb-1"
                style={{
                  color: 'var(--text-primary)',
                  fontSize: 'clamp(2rem, 8vw, 3rem)',
                }}
              >
                {isHomeSession ? 'Home Session' : breweryName}
              </h1>

              {/* Session meta */}
              {(totalBeers > 0 || duration) && (
                <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                  {[
                    totalBeers > 0 && `${totalBeers} ${totalBeers === 1 ? 'beer' : 'beers'}`,
                    duration && duration,
                    uniqueStyles.length > 1 && `${uniqueStyles.length} styles`,
                  ].filter(Boolean).join(' · ')}
                </p>
              )}

              {/* Glass flight — bottom-aligned row */}
              {allLogs.length > 0 && (
                <motion.div
                  className="flex items-end justify-center gap-1 mt-6 flex-wrap"
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.07, delayChildren: 0.3 } } }}
                >
                  {allLogs.slice(0, 8).map((log, i) => (
                    <motion.div
                      key={log.id}
                      variants={{
                        hidden: { opacity: 0, y: 20, scale: 0.7 },
                        visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 420, damping: 24 } },
                      }}
                    >
                      <GlassIcon
                        glassType={(log as any).beer?.glass_type}
                        instanceId={`recap-${log.id}-${i}`}
                        size={allLogs.length > 5 ? 30 : 38}
                      />
                    </motion.div>
                  ))}
                  {allLogs.length > 8 && (
                    <span className="text-xs font-mono self-end pb-1 ml-1" style={{ color: 'var(--text-muted)' }}>
                      +{allLogs.length - 8}
                    </span>
                  )}
                </motion.div>
              )}

              {/* XP counter — large, gold, animated */}
              {xpGained > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.55, type: 'spring', stiffness: 400, damping: 24 }}
                  className="inline-flex items-baseline gap-1 mt-6 px-6 py-3 rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-gold) 12%, transparent), color-mix(in srgb, var(--accent-amber) 6%, transparent))',
                    border: '1px solid color-mix(in srgb, var(--accent-gold) 22%, transparent)',
                  }}
                >
                  <span className="text-3xl font-bold font-mono" style={{ color: 'var(--accent-gold)' }}>
                    +<AnimatedXP target={xpGained} />
                  </span>
                  <span className="text-sm font-medium" style={{ color: 'var(--accent-gold)', opacity: 0.8 }}>XP</span>
                </motion.div>
              )}

              {/* Achievements */}
              {newAchievements.length > 0 && (
                <div className="mt-4 space-y-2">
                  {newAchievements.map((ach, i) => (
                    <motion.div
                      key={ach.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + i * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-xl text-left"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-amber))' }}
                      >
                        {ach.icon || '🏆'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{ach.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Achievement unlocked · +{ach.xp_reward} XP</p>
                      </div>
                      <Trophy size={13} style={{ color: 'var(--accent-gold)' }} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 2 — RATE THE BREWERY
                Comes before beers because it's higher-level context.
                Only shown for brewery sessions, skipped if already reviewed.
            ══════════════════════════════════════════════════════════════════ */}
            {isBrewerySession && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-6"
              >
                <div
                  className="rounded-2xl p-5"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  {hasExistingBreweryReview && !breweryReviewSubmitted ? (
                    /* Already reviewed */
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'color-mix(in srgb, var(--accent-gold) 15%, transparent)' }}
                      >
                        <Check size={15} style={{ color: 'var(--accent-gold)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          You've reviewed {breweryName}
                        </p>
                        <StarRating value={existingBreweryRating} readonly size="sm" className="mt-1" />
                      </div>
                    </div>
                  ) : breweryReviewSubmitted ? (
                    /* Just submitted */
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'color-mix(in srgb, var(--accent-gold) 15%, transparent)' }}
                      >
                        <Check size={15} style={{ color: 'var(--accent-gold)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {breweryName} rated
                        </p>
                        <StarRating value={breweryRating} readonly size="sm" className="mt-1" />
                      </div>
                    </div>
                  ) : (
                    /* Rate the brewery */
                    <div>
                      <p className="font-display font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
                        How was {breweryName}?
                      </p>
                      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                        Leave a quick rating — it helps other drinkers find great spots.
                      </p>
                      <StarRating
                        value={breweryRating}
                        onChange={(v) => {
                          setBreweryRating(v)
                          setShowBreweryComment(true)
                        }}
                        size="lg"
                      />
                      <AnimatePresence>
                        {showBreweryComment && breweryRating > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-3 space-y-3">
                              <textarea
                                value={breweryComment}
                                onChange={(e) => setBreweryComment(e.target.value)}
                                placeholder="Any thoughts? (optional)"
                                rows={2}
                                className="w-full rounded-xl border px-3 py-2.5 text-sm resize-none outline-none"
                                style={{
                                  background: 'var(--surface-2)',
                                  borderColor: 'var(--border)',
                                  color: 'var(--text-primary)',
                                }}
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleBreweryReview(breweryRating)}
                                  disabled={breweryReviewLoading}
                                  className="px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-40 transition-all"
                                  style={{ background: 'var(--accent-gold)', color: '#0F0E0C' }}
                                >
                                  {breweryReviewLoading ? 'Saving…' : 'Submit'}
                                </button>
                                <button
                                  onClick={() => { setShowBreweryComment(false); setBreweryRating(0); setBreweryComment('') }}
                                  className="px-3 py-2 text-sm rounded-xl"
                                  style={{ color: 'var(--text-muted)' }}
                                >
                                  Skip
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 3 — RATE YOUR BEERS
                Each beer as a card with its glass art + inline stars.
                Once a star is tapped, the card dims to "done" state.
            ══════════════════════════════════════════════════════════════════ */}
            {allLogs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mb-6"
              >
                <h2
                  className="font-display font-bold text-lg mb-3"
                  style={{ color: 'var(--text-primary)' }}
                >
                  How were they?
                </h2>

                <div className="space-y-2.5">
                  {allLogs.map((log, i) => {
                    const rating = getRating(log)
                    const isDone = rating > 0
                    const beerName = (log as any).beer?.name || 'Unknown beer'
                    const beerStyle = (log as any).beer?.style

                    return (
                      <motion.div
                        key={log.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: isDone ? 0.7 : 1, y: 0 }}
                        transition={{ delay: 0.65 + i * 0.05 }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl"
                        style={{
                          background: isDone
                            ? 'color-mix(in srgb, var(--surface) 70%, transparent)'
                            : 'var(--surface)',
                          border: '1px solid var(--border)',
                          transition: 'opacity 0.3s',
                        }}
                      >
                        {/* Glass art */}
                        <div className="flex-shrink-0 w-8 flex items-end justify-center">
                          <GlassIcon
                            glassType={(log as any).beer?.glass_type}
                            instanceId={`beer-${log.id}-${i}`}
                            size={22}
                          />
                        </div>

                        {/* Beer info */}
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-medium truncate"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {beerName}
                          </p>
                          {beerStyle && (
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{beerStyle}</p>
                          )}
                        </div>

                        {/* Stars */}
                        <StarRating
                          value={rating}
                          onChange={(v) => handleBeerRate(log.id, v)}
                          readonly={isDone}
                          size="sm"
                        />
                      </motion.div>
                    )
                  })}
                </div>

                {/* Top Pour spotlight — appears when any beer is rated 4+ */}
                <AnimatePresence>
                  {topPour && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="rounded-2xl p-4 flex items-center gap-4"
                        style={{
                          background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-gold) 10%, var(--surface)), var(--surface))',
                          border: '2px solid color-mix(in srgb, var(--accent-gold) 35%, transparent)',
                        }}
                      >
                        <div className="flex-shrink-0">
                          <GlassIcon
                            glassType={(topPour.log as any).beer?.glass_type}
                            instanceId={`top-${topPour.log.id}`}
                            size={44}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-mono uppercase tracking-widest mb-0.5" style={{ color: 'var(--accent-gold)' }}>
                            Top Pour
                          </p>
                          <p className="font-display font-bold text-base truncate" style={{ color: 'var(--text-primary)' }}>
                            {(topPour.log as any).beer?.name || 'Unknown beer'}
                          </p>
                          {(topPour.log as any).beer?.style && (
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {(topPour.log as any).beer.style}
                            </p>
                          )}
                          <StarRating value={topPour.rating} readonly size="sm" className="mt-1.5" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 4 — SHARE & EXIT
            ══════════════════════════════════════════════════════════════════ */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
              className="space-y-3 pt-2"
            >
              {onShare && (
                <button
                  onClick={onShare}
                  className="w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-amber) 100%)',
                    color: '#0F0E0C',
                  }}
                >
                  <Share2 size={17} />
                  Share your session
                  <ChevronRight size={15} className="ml-auto opacity-60" />
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl font-medium transition-all active:scale-[0.98]"
                style={{
                  background: 'var(--surface)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                Done
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
