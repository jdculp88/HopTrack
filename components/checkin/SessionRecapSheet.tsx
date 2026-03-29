'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Share2, Trophy, Check, ChevronRight } from 'lucide-react'
import type { Options as ConfettiOptions } from 'canvas-confetti'
import { StarRating } from '@/components/ui/StarRating'
import { getGlass, getGlassSvgContent } from '@/lib/glassware'
import { Session, BeerLog } from '@/types/database'
import { SESSION_XP, getLevelProgress } from '@/lib/xp'

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

function formatSessionDate(startedAt: string, endedAt?: string | null) {
  const start = new Date(startedAt)
  const end = endedAt ? new Date(endedAt) : new Date()
  const dayStr = start.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  const startTime = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const endTime = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${dayStr} · ${startTime} – ${endTime}`
}

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

// Sparkle decoration
function Sparkles() {
  const positions = [
    { top: '15%', left: '12%', delay: 0 },
    { top: '8%', right: '18%', delay: 0.4 },
    { top: '30%', left: '22%', delay: 0.8 },
    { top: '25%', right: '10%', delay: 1.2 },
    { top: '12%', left: '45%', delay: 0.6 },
    { top: '35%', right: '30%', delay: 1.5 },
  ]

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {positions.map((pos, i) => (
        <span
          key={i}
          className="absolute text-sm"
          style={{
            ...pos,
            color: 'var(--accent-gold)',
            animation: `sparkle-float 2s ease-in-out infinite`,
            animationDelay: `${pos.delay}s`,
          }}
        >
          {i % 2 === 0 ? '✦' : '✧'}
        </span>
      ))}
      <style>{`
        @keyframes sparkle-float {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
      `}</style>
    </div>
  )
}

interface BreweryStats {
  visit_count: number
  total_time_formatted: string
  most_ordered_beer: { name: string; count: number } | null
  visitor_rank: number
  total_visitors: number
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
  const [breweryRating, setBreweryRating] = useState(0)
  const [breweryComment, setBreweryComment] = useState('')
  const [showBreweryComment, setShowBreweryComment] = useState(false)
  const [breweryReviewSubmitted, setBreweryReviewSubmitted] = useState(false)
  const [hasExistingBreweryReview, setHasExistingBreweryReview] = useState(false)
  const [existingBreweryRating, setExistingBreweryRating] = useState(0)
  const [breweryReviewLoading, setBreweryReviewLoading] = useState(false)
  const [breweryStats, setBreweryStats] = useState<BreweryStats | null>(null)
  const [progressAnimated, setProgressAnimated] = useState(false)

  const isBrewerySession = session && (session as any).context !== 'home' && (session as any).brewery_id
  const isHomeSession = !isBrewerySession
  const allLogs = beerLogs ?? []
  const totalBeers = allLogs.reduce((sum, l) => sum + (l.quantity ?? 1), 0)
  const duration = session ? formatDuration(session.started_at, session.ended_at) : ''
  const dateStr = session ? formatSessionDate(session.started_at, session.ended_at) : ''
  const uniqueStyles = Array.from(new Set(allLogs.map((l) => (l as any).beer?.style).filter(Boolean)))

  // XP breakdown
  const xpBreakdown = [
    { label: 'Session completed', value: SESSION_XP.session_start },
    ...(totalBeers > 0 ? [{ label: `${totalBeers} beer${totalBeers > 1 ? 's' : ''} logged`, value: totalBeers * SESSION_XP.per_beer }] : []),
    ...(allLogs.filter(l => l.rating && l.rating > 0).length > 0
      ? [{ label: `${allLogs.filter(l => l.rating && l.rating > 0).length} beer${allLogs.filter(l => l.rating && l.rating > 0).length > 1 ? 's' : ''} rated`, value: allLogs.filter(l => l.rating && l.rating > 0).length * SESSION_XP.per_rating }]
      : []),
    ...(totalBeers >= 3 ? [{ label: '3+ beers bonus', value: SESSION_XP.three_plus_beers_bonus }] : []),
    ...newAchievements.map(a => ({ label: `🏆 ${a.name}`, value: a.xp_reward })),
  ]

  // Level progress
  const profile = session ? { xp: (session as any).xp_awarded ?? 0 } : null
  const levelInfo = profile ? getLevelProgress(profile.xp) : null

  const getRating = (log: BeerLog) => recapRatings[log.id] ?? log.rating ?? 0

  // Fetch brewery review status + brewery stats
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

    fetch(`/api/brewery/${breweryId}/user-stats`)
      .then((r) => r.json())
      .then((data) => setBreweryStats(data))
      .catch(() => {})
  }, [isOpen, isBrewerySession, session])

  useEffect(() => {
    if (isOpen && !fired) {
      setFired(true)
      setTimeout(() => {
        import('canvas-confetti').then(m => m.default({ particleCount: 80, spread: 70, origin: { y: 0.4 }, colors: ['#D4A843', '#E8841A', '#fff'] }))
      }, 300)
      setTimeout(() => setProgressAnimated(true), 800)
    }
    if (!isOpen) {
      setFired(false)
      setRecapRatings({})
      setBreweryRating(0)
      setBreweryComment('')
      setShowBreweryComment(false)
      setBreweryReviewSubmitted(false)
      setHasExistingBreweryReview(false)
      setExistingBreweryRating(0)
      setBreweryStats(null)
      setProgressAnimated(false)
    }
  }, [isOpen, fired])

  const handleBeerRate = useCallback(async (logId: string, rating: number) => {
    setRecapRatings((prev) => ({ ...prev, [logId]: rating }))
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
          style={{ background: 'var(--bg)' }}
        >
          <div className="max-w-lg mx-auto px-5 pb-12">
            {/* Close button */}
            <div className="flex justify-end pt-4 pb-2">
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition-opacity hover:opacity-60"
                style={{
                  background: 'color-mix(in srgb, var(--surface) 60%, transparent)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                }}
                aria-label="Close recap"
              >
                <X size={18} />
              </button>
            </div>

            {/* ═══ CELEBRATION HEADER ═══ */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26, delay: 0.05 }}
              className="text-center pb-5 relative"
            >
              <Sparkles />
              <p
                className="font-mono text-[11px] uppercase tracking-[2px] mb-2"
                style={{ color: 'var(--accent-gold)' }}
              >
                {isHomeSession ? 'Home Session Complete' : 'Session Complete'}
              </p>
              <h1
                className="font-display font-bold leading-none mb-1"
                style={{ color: 'var(--text-primary)', fontSize: 'clamp(2rem, 8vw, 2.5rem)' }}
              >
                {isHomeSession ? 'Home Session' : 'Great Round'}
              </h1>
              {!isHomeSession && (
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{breweryName}</p>
              )}
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{dateStr}</p>

              {/* XP pill */}
              {xpGained > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 400, damping: 24 }}
                  className="inline-flex items-center gap-1 mt-4 px-5 py-2 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-gold) 15%, transparent), color-mix(in srgb, var(--accent-amber) 10%, transparent))',
                    border: '1px solid color-mix(in srgb, var(--accent-gold) 25%, transparent)',
                  }}
                >
                  <span className="text-xl font-bold font-mono" style={{ color: 'var(--accent-gold)' }}>
                    +<AnimatedXP target={xpGained} />
                  </span>
                  <span className="text-sm font-medium" style={{ color: 'var(--accent-gold)', opacity: 0.8 }}>XP</span>
                </motion.div>
              )}
            </motion.div>

            {/* ═══ STATS ROW ═══ */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-4 gap-px rounded-2xl overflow-hidden mb-4"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              {[
                { value: duration, label: 'Duration' },
                { value: String(totalBeers), label: 'Beers' },
                { value: String(allLogs.filter(l => !l.rating || l.rating === 0).length), label: 'New Tries' },
                { value: breweryStats ? `${breweryStats.visit_count}${breweryStats.visit_count === 1 ? 'st' : breweryStats.visit_count === 2 ? 'nd' : breweryStats.visit_count === 3 ? 'rd' : 'th'}` : '—', label: 'Visit' },
              ].map((stat, i) => (
                <div key={stat.label} className="text-center py-4 px-2" style={{ borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
                  <motion.p
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35 + i * 0.07, type: 'spring', stiffness: 400, damping: 24 }}
                    className="font-display text-xl font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-[10px] font-mono uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                </div>
              ))}
            </motion.div>

            {/* ═══ FUN FACT ═══ */}
            {breweryStats && breweryStats.visit_count > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="flex items-start gap-3 p-4 rounded-xl mb-5"
                style={{
                  background: 'color-mix(in srgb, var(--accent-amber) 8%, var(--surface))',
                  border: '1px solid color-mix(in srgb, var(--accent-amber) 12%, transparent)',
                }}
              >
                <span className="text-lg flex-shrink-0 mt-0.5">📊</span>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  You've spent <strong style={{ color: 'var(--accent-amber)' }}>{breweryStats.total_time_formatted}</strong> at {breweryName} across {breweryStats.visit_count} visits.
                  {breweryStats.most_ordered_beer && (
                    <> Your most-ordered beer here is <strong style={{ color: 'var(--accent-amber)' }}>{breweryStats.most_ordered_beer.name}</strong> ({breweryStats.most_ordered_beer.count} times).</>
                  )}
                  {breweryStats.visitor_rank > 0 && breweryStats.visitor_rank <= 10 && (
                    <> You're their <strong style={{ color: 'var(--accent-amber)' }}>#{breweryStats.visitor_rank} most frequent</strong> visitor on HopTrack.</>
                  )}
                </p>
              </motion.div>
            )}

            {/* ═══ RATE THE BREWERY ═══ */}
            {isBrewerySession && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-5"
              >
                <p className="text-[10px] font-mono uppercase tracking-[1.5px] mb-3 px-0.5" style={{ color: 'var(--accent-amber)' }}>
                  Rate the Brewery
                </p>
                <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  {hasExistingBreweryReview && !breweryReviewSubmitted ? (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'color-mix(in srgb, var(--accent-gold) 15%, transparent)' }}>
                        <Check size={15} style={{ color: 'var(--accent-gold)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>You've reviewed {breweryName}</p>
                        <StarRating value={existingBreweryRating} readonly size="sm" className="mt-1" />
                      </div>
                    </div>
                  ) : breweryReviewSubmitted ? (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'color-mix(in srgb, var(--accent-gold) 15%, transparent)' }}>
                        <Check size={15} style={{ color: 'var(--accent-gold)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{breweryName} rated</p>
                        <StarRating value={breweryRating} readonly size="sm" className="mt-1" />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'color-mix(in srgb, var(--accent-gold) 10%, var(--surface-2))' }}>🏭</div>
                        <div>
                          <p className="font-display font-bold" style={{ color: 'var(--text-primary)' }}>{breweryName}</p>
                          {breweryStats && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{breweryStats.visit_count} visit{breweryStats.visit_count !== 1 ? 's' : ''}</p>}
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <StarRating
                          value={breweryRating}
                          onChange={(v) => { setBreweryRating(v); setShowBreweryComment(true) }}
                          size="lg"
                        />
                      </div>
                      <p className="text-center text-xs mt-2 italic min-h-[18px]" style={{ color: 'var(--text-muted)' }}>
                        {breweryRating === 0 ? 'Tap to rate your experience' : ['', 'Not great', 'It was okay', 'Good spot', 'Really liked it', 'Loved it'][breweryRating]}
                      </p>
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
                                className="w-full rounded-xl border px-3 py-2.5 text-sm resize-none outline-none transition-colors"
                                style={{ background: 'color-mix(in srgb, var(--surface-2) 50%, transparent)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                              />
                              <div className="flex items-center gap-2">
                                <button onClick={() => handleBreweryReview(breweryRating)} disabled={breweryReviewLoading} className="px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-40 transition-all" style={{ background: 'var(--accent-gold)', color: 'var(--bg)' }}>
                                  {breweryReviewLoading ? 'Saving…' : 'Submit'}
                                </button>
                                <button onClick={() => { setShowBreweryComment(false); setBreweryRating(0); setBreweryComment('') }} className="px-3 py-2 text-sm rounded-xl" style={{ color: 'var(--text-muted)' }}>Skip</button>
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

            {/* ═══ YOUR BEERS THIS SESSION ═══ */}
            {allLogs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="mb-5"
              >
                <p className="text-[10px] font-mono uppercase tracking-[1.5px] mb-3 px-0.5" style={{ color: 'var(--accent-amber)' }}>
                  Your Beers This Session
                </p>
                <div className="space-y-2.5">
                  {allLogs.map((log, i) => {
                    const rating = getRating(log)
                    const isDone = rating > 0
                    const beerName = (log as any).beer?.name || 'Unknown beer'
                    const beerStyle = (log as any).beer?.style
                    const beerAbv = (log as any).beer?.abv
                    const communityRating = (log as any).beer?.avg_rating
                    const logTime = new Date(log.logged_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.06 }}
                        className="rounded-2xl p-4"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                      >
                        {/* Beer top row */}
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-gold) 10%, transparent), color-mix(in srgb, var(--accent-amber) 8%, transparent))' }}>
                            <GlassIcon glassType={(log as any).beer?.glass_type} instanceId={`recap-${log.id}`} size={24} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-display font-bold text-[15px] truncate" style={{ color: 'var(--text-primary)' }}>{beerName}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              {beerStyle && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'color-mix(in srgb, var(--accent-amber) 10%, transparent)', color: 'var(--accent-amber)' }}>{beerStyle}</span>
                              )}
                              {beerAbv && <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{beerAbv}%</span>}
                              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>· {logTime}</span>
                            </div>
                          </div>
                        </div>

                        {/* Beer stats row */}
                        <div className="flex gap-4 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>—</span>
                            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>time trying</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>—</span>
                            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>your avg</span>
                          </div>
                          {communityRating > 0 && (
                            <div className="flex flex-col">
                              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{communityRating.toFixed(1)} ★</span>
                              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>community</span>
                            </div>
                          )}
                        </div>

                        {/* Rating section */}
                        <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                          {isDone ? (
                            <div className="flex items-center gap-2">
                              <StarRating value={rating} readonly size="sm" />
                              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'color-mix(in srgb, var(--border) 50%, transparent)', color: 'var(--text-muted)' }}>
                                {log.rating && log.rating > 0 ? 'Rated previously' : 'Just rated'}
                              </span>
                            </div>
                          ) : (
                            <div>
                              <p className="text-[11px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Rate this beer</p>
                              <StarRating value={rating} onChange={(v) => handleBeerRate(log.id, v)} size="md" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* ═══ XP BREAKDOWN ═══ */}
            {xpGained > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mb-3"
              >
                <p className="text-[10px] font-mono uppercase tracking-[1.5px] mb-3 px-0.5" style={{ color: 'var(--accent-amber)' }}>
                  XP Earned
                </p>
                <div
                  className="rounded-2xl p-5"
                  style={{
                    background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-gold) 8%, var(--surface)), color-mix(in srgb, var(--surface) 100%, transparent))',
                    border: '1px solid color-mix(in srgb, var(--accent-gold) 15%, transparent)',
                  }}
                >
                  {xpBreakdown.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5" style={{ borderTop: i > 0 ? '1px solid color-mix(in srgb, var(--border) 50%, transparent)' : 'none' }}>
                      <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                      <span className="text-[13px] font-semibold" style={{ color: 'var(--accent-gold)' }}>+{item.value} XP</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2.5 mt-1.5" style={{ borderTop: '2px solid color-mix(in srgb, var(--accent-gold) 20%, transparent)' }}>
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Total Earned</span>
                    <span className="font-display text-xl font-bold" style={{ color: 'var(--accent-gold)' }}>+{xpGained} XP</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ═══ LEVEL PROGRESS ═══ */}
            {levelInfo && levelInfo.next && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="rounded-2xl p-5 mb-5"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-baseline justify-between mb-3">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Level <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{levelInfo.current.level}</span> → <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{levelInfo.next.level}</span>
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{levelInfo.xpToNext.toLocaleString()} XP to go</p>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-[1500ms] ease-out"
                    style={{
                      width: progressAnimated ? `${levelInfo.progress}%` : '0%',
                      background: 'linear-gradient(to right, var(--accent-gold), var(--accent-amber))',
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* ═══ ACHIEVEMENTS ═══ */}
            {newAchievements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mb-5 space-y-2"
              >
                {newAchievements.map((ach, i) => (
                  <motion.div
                    key={ach.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.75 + i * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl text-left"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-amber))' }}>
                      {ach.icon || '🏆'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{ach.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Achievement unlocked · +{ach.xp_reward} XP</p>
                    </div>
                    <Trophy size={13} style={{ color: 'var(--accent-gold)' }} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* ═══ ACTIONS ═══ */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-3 pt-2"
            >
              {onShare && (
                <button
                  onClick={onShare}
                  className="w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-amber) 100%)',
                    color: 'var(--bg)',
                    boxShadow: '0 4px 16px color-mix(in srgb, var(--accent-amber) 25%, transparent)',
                  }}
                >
                  <Share2 size={17} />
                  Share Your Session
                  <ChevronRight size={15} className="ml-auto opacity-60" />
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl font-medium transition-all active:scale-[0.98]"
                style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
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
