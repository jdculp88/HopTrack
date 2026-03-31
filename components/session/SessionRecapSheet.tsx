'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, ChevronRight, Trophy, ChevronLeft, Camera } from 'lucide-react'
import Image from 'next/image'
import type { Options as ConfettiOptions } from 'canvas-confetti'
import { getGlass, getGlassSvgContent } from '@/lib/glassware'
import { Session, BeerLog } from '@/types/database'
import { SESSION_XP, getLevelProgress } from '@/lib/xp'

// ── Cream color palette (self-contained, like The Board) ─────────────────────
const C = {
  bg: '#faf6f0',
  card: 'rgba(255,255,255,0.75)',
  cardBorder: 'rgba(180,155,120,0.13)',
  accent: '#b7522f',
  accentSoft: 'rgba(183,82,47,0.10)',
  gold: '#c8943a',
  goldSoft: 'rgba(200,148,58,0.10)',
  text1: '#2e2418',
  text2: '#6b5d4e',
  text3: '#a39580',
  text4: '#c4b8a6',
  divider: 'rgba(180,155,120,0.10)',
  avatarBg: '#efe7da',
  ring: 'linear-gradient(135deg, #b7522f 0%, #c8943a 100%)',
}

interface SessionRecapSheetProps {
  isOpen: boolean
  session: Session | null
  breweryName: string
  beerLogs: BeerLog[]
  xpGained: number
  newAchievements: Array<{ id: string; name: string; icon?: string; xp_reward: number }>
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

interface SparklePos {
  top: string
  left?: string
  right?: string
  delay: number
}

function Sparkles() {
  const positions: SparklePos[] = [
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
            top: pos.top,
            left: pos.left,
            right: pos.right,
            color: C.gold,
            animation: `recap-sparkle 2s ease-in-out infinite`,
            animationDelay: `${pos.delay}s`,
          }}
        >
          {i % 2 === 0 ? '✦' : '✧'}
        </span>
      ))}
      <style>{`
        @keyframes recap-sparkle {
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

// ── Stagger animation helper ─────────────────────────────────────────────────
const stagger = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number], delay },
})

// ── Star rating hints ────────────────────────────────────────────────────────
const HINTS = ['', 'Not great', 'It was okay', 'Good spot', 'Really liked it', 'Loved it']

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
  const [beerNotes, setBeerNotes] = useState<Record<string, string>>({})
  const [breweryRating, setBreweryRating] = useState(0)
  const [breweryHoverRating, setBreweryHoverRating] = useState(0)
  const [breweryReviewSubmitted, setBreweryReviewSubmitted] = useState(false)
  const [hasExistingBreweryReview, setHasExistingBreweryReview] = useState(false)
  const [existingBreweryRating, setExistingBreweryRating] = useState(0)
  const [breweryReviewLoading, setBreweryReviewLoading] = useState(false)
  const [breweryStats, setBreweryStats] = useState<BreweryStats | null>(null)
  const [progressAnimated, setProgressAnimated] = useState(false)
  const [beerHistory, setBeerHistory] = useState<Record<string, { timesTried: number; avgRating: number | null }>>({})
  const [sessionPhotos, setSessionPhotos] = useState<Array<{ id: string; photo_url: string }>>([])
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)

  const isBrewerySession = session && session.context !== 'home' && session.brewery_id
  const isHomeSession = !isBrewerySession
  const allLogs = beerLogs ?? []
  const totalBeers = allLogs.reduce((sum, l) => sum + (l.quantity ?? 1), 0)
  const duration = session ? formatDuration(session.started_at, session.ended_at) : ''
  const dateStr = session ? formatSessionDate(session.started_at, session.ended_at) : ''
  const uniqueStyles = Array.from(new Set(allLogs.map((l) => l.beer?.style).filter(Boolean)))
  const newTries = allLogs.filter(l => !l.rating || l.rating === 0).length

  // XP breakdown
  const xpBreakdown = [
    { label: 'Session completed', value: SESSION_XP.session_start },
    ...(totalBeers > 0 ? [{ label: `${totalBeers} beer${totalBeers > 1 ? 's' : ''} checked in`, value: totalBeers * SESSION_XP.per_beer }] : []),
    ...(allLogs.filter(l => l.rating && l.rating > 0).length > 0
      ? [{ label: `${allLogs.filter(l => l.rating && l.rating > 0).length} new beer${allLogs.filter(l => l.rating && l.rating > 0).length > 1 ? 's' : ''} tried`, value: allLogs.filter(l => l.rating && l.rating > 0).length * SESSION_XP.per_rating }]
      : []),
    ...(totalBeers >= 3 ? [{ label: '3+ beers bonus', value: SESSION_XP.three_plus_beers_bonus }] : []),
    ...((breweryStats?.visit_count ?? 0) > 1 ? [{ label: `${breweryStats?.visit_count ?? 0}${getOrdinalSuffix(breweryStats?.visit_count ?? 0)} visit streak (${breweryName})`, value: 10 }] : []),
    ...newAchievements.map(a => ({ label: `🏆 ${a.name}`, value: a.xp_reward })),
  ]

  // Level progress
  const profile = session ? { xp: session.xp_awarded ?? 0 } : null
  const levelInfo = profile ? getLevelProgress(profile.xp) : null

  const getRating = (log: BeerLog) => recapRatings[log.id] ?? log.rating ?? 0

  // Fetch brewery review status + stats
  useEffect(() => {
    if (!isOpen || !isBrewerySession) return
    const breweryId = session!.brewery_id

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

  // Fetch per-beer history stats
  useEffect(() => {
    if (!isOpen || allLogs.length === 0) return
    const beerIds = allLogs.map(l => l.beer_id ?? l.beer?.id).filter(Boolean)
    if (beerIds.length === 0) return

    fetch(`/api/beer-logs/stats?beer_ids=${beerIds.join(',')}`)
      .then(r => r.json())
      .then(data => { if (data.stats) setBeerHistory(data.stats) })
      .catch(() => {})
  }, [isOpen, allLogs])

  // Fetch session photos
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
      setTimeout(() => {
        import('canvas-confetti').then(m => m.default({ particleCount: 80, spread: 70, origin: { y: 0.4 }, colors: ['#c8943a', '#b7522f', '#fff'] }))
      }, 300)
      setTimeout(() => setProgressAnimated(true), 800)
    }
    if (!isOpen) {
      setFired(false)
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
      setActivePhotoIndex(0)
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

  // Save all tasting notes on close (fire-and-forget)
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

  const handleBreweryReview = useCallback(async () => {
    if (!isBrewerySession || breweryRating === 0) return
    setBreweryReviewLoading(true)
    const breweryId = session!.brewery_id
    const res = await fetch(`/api/brewery/${breweryId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: breweryRating, comment: null }),
    })
    if (res.ok) setBreweryReviewSubmitted(true)
    setBreweryReviewLoading(false)
  }, [isBrewerySession, session, breweryRating])

  // Auto-submit brewery rating on star click
  const handleBreweryStarClick = useCallback((val: number) => {
    setBreweryRating(val)
    // Auto-submit after a brief moment
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

  return (
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

            {/* ═══ CELEBRATION HEADER ═══ */}
            <div className="text-center relative overflow-hidden" style={{ padding: '50px 20px 20px' }}>
              <Sparkles />
              <motion.p
                {...stagger(0.1)}
                className="uppercase tracking-[2px] font-semibold"
                style={{ fontSize: 11, color: C.gold }}
              >
                {isHomeSession ? 'Home Session Complete' : 'Session Complete'}
              </motion.p>
              <motion.h1
                {...stagger(0.15)}
                className="font-display font-bold leading-none"
                style={{ fontSize: 32, color: C.text1, margin: '8px 0 4px' }}
              >
                {isHomeSession ? 'Home Session' : 'Great Round'}
              </motion.h1>
              {!isHomeSession && (
                <motion.p {...stagger(0.2)} style={{ fontSize: 14, color: C.text2, marginBottom: 6 }}>
                  {breweryName}
                </motion.p>
              )}
              <motion.p {...stagger(0.25)} style={{ fontSize: 12, color: C.text3 }}>
                {dateStr}
              </motion.p>

              {/* XP pill */}
              {xpGained > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 400, damping: 24 }}
                  className="inline-flex items-center gap-1 rounded-full"
                  style={{
                    marginTop: 16,
                    padding: '8px 20px',
                    background: `linear-gradient(135deg, ${C.goldSoft}, ${C.accentSoft})`,
                    border: `1px solid rgba(200,148,58,0.25)`,
                    fontSize: 20,
                    fontWeight: 700,
                    color: C.gold,
                  }}
                >
                  +<AnimatedXP target={xpGained} />
                  <span style={{ fontSize: 13, fontWeight: 500, marginLeft: 2 }}>XP</span>
                </motion.div>
              )}
            </div>

            {/* ═══ SESSION PHOTOS ═══ */}
            {sessionPhotos.length > 0 && (
              <motion.div
                {...stagger(0.18)}
                className="relative overflow-hidden"
                style={{
                  margin: '16px 20px 0',
                  borderRadius: 16,
                  border: `1px solid ${C.cardBorder}`,
                  aspectRatio: '16/9',
                  background: C.avatarBg,
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={sessionPhotos[activePhotoIndex]?.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={sessionPhotos[activePhotoIndex]?.photo_url}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                </AnimatePresence>
                {sessionPhotos.length > 1 && (
                  <>
                    <button
                      onClick={() => setActivePhotoIndex(i => (i - 1 + sessionPhotos.length) % sessionPhotos.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', color: C.text2 }}
                      aria-label="Previous photo"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setActivePhotoIndex(i => (i + 1) % sessionPhotos.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', color: C.text2 }}
                      aria-label="Next photo"
                    >
                      <ChevronRight size={16} />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {sessionPhotos.map((_, i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full transition-all"
                          style={{ background: i === activePhotoIndex ? C.gold : 'rgba(255,255,255,0.5)' }}
                        />
                      ))}
                    </div>
                  </>
                )}
                <div
                  className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', fontSize: 10, color: C.text2, fontWeight: 500 }}
                >
                  <Camera size={12} />
                  {sessionPhotos.length}
                </div>
              </motion.div>
            )}

            {/* ═══ STATS ROW ═══ */}
            <motion.div
              {...stagger(0.2)}
              className="flex overflow-hidden"
              style={{
                margin: '20px 20px 0',
                background: C.card,
                borderRadius: 16,
                border: `1px solid ${C.cardBorder}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              {[
                { value: duration, label: 'Duration' },
                { value: String(totalBeers), label: 'Beers' },
                { value: String(newTries), label: 'New Tries' },
                { value: breweryStats ? `${breweryStats.visit_count}${getOrdinalSuffix(breweryStats.visit_count)}` : '—', label: 'Visit' },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="flex-1 text-center"
                  style={{ padding: '16px 8px', borderRight: i < 3 ? `1px solid ${C.divider}` : 'none' }}
                >
                  <motion.p
                    initial={{ opacity: 0, scale: 0.5, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.35 + i * 0.07, type: 'spring', stiffness: 400, damping: 24 }}
                    className="font-display font-bold"
                    style={{ fontSize: 24, color: C.text1 }}
                  >
                    {stat.value}
                  </motion.p>
                  <p style={{ fontSize: 10, color: C.text3, letterSpacing: 0.5, marginTop: 4, fontWeight: 500 }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>

            {/* ═══ FUN FACT ═══ */}
            {breweryStats && breweryStats.visit_count > 1 && (
              <motion.div
                {...stagger(0.3)}
                className="flex items-start gap-2.5"
                style={{
                  margin: '16px 20px 0',
                  padding: '14px 16px',
                  background: C.accentSoft,
                  borderRadius: 12,
                  border: `1px solid rgba(183,82,47,0.08)`,
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>📊</span>
                <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.5 }}>
                  You've spent <strong style={{ color: C.accent, fontWeight: 600 }}>{breweryStats.total_time_formatted}</strong> at {breweryName} across {breweryStats.visit_count} visits.
                  {breweryStats.most_ordered_beer && (
                    <> Your most-ordered beer here is <strong style={{ color: C.accent, fontWeight: 600 }}>{breweryStats.most_ordered_beer.name}</strong> ({breweryStats.most_ordered_beer.count} times).</>
                  )}
                  {breweryStats.visitor_rank > 0 && breweryStats.visitor_rank <= 10 && (
                    <> You're their <strong style={{ color: C.accent, fontWeight: 600 }}>#{breweryStats.visitor_rank} most frequent</strong> visitor on HopTrack.</>
                  )}
                </p>
              </motion.div>
            )}

            {/* ═══ RATE THE BREWERY ═══ */}
            {isBrewerySession && (
              <motion.div {...stagger(0.35)}>
                <SectionTitle>Rate the Brewery</SectionTitle>
                <div
                  style={{
                    margin: '0 20px',
                    padding: 20,
                    background: C.card,
                    backdropFilter: 'blur(16px)',
                    borderRadius: 16,
                    border: `1px solid ${C.cardBorder}`,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  }}
                >
                  {hasExistingBreweryReview && !breweryReviewSubmitted ? (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(v => (
                          <span key={v} style={{ fontSize: 16, color: v <= existingBreweryRating ? C.gold : C.text4, lineHeight: 1 }}>★</span>
                        ))}
                      </div>
                      <span style={{ fontSize: 10, color: C.text3, background: C.divider, padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>
                        Rated previously
                      </span>
                    </div>
                  ) : breweryReviewSubmitted ? (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(v => (
                          <span key={v} style={{ fontSize: 32, color: v <= breweryRating ? C.gold : C.text4, lineHeight: 1 }}>★</span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-3.5" style={{ marginBottom: 16 }}>
                        <div
                          className="flex items-center justify-center"
                          style={{ width: 48, height: 48, borderRadius: 12, background: C.avatarBg, fontSize: 24 }}
                        >
                          🏭
                        </div>
                        <div>
                          <p className="font-display font-semibold" style={{ fontSize: 18, color: C.text1 }}>{breweryName}</p>
                          {breweryStats && (
                            <p style={{ fontSize: 12, color: C.text3, marginTop: 2 }}>
                              {breweryStats.visit_count > 1 ? `${breweryStats.visit_count}${getOrdinalSuffix(breweryStats.visit_count)} visit` : 'First visit'}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(v => (
                          <span
                            key={v}
                            role="button"
                            tabIndex={0}
                            className="select-none transition-transform hover:scale-[1.2]"
                            style={{
                              fontSize: 32,
                              color: v <= (breweryHoverRating || breweryRating) ? C.gold : C.text4,
                              cursor: 'pointer',
                              lineHeight: 1,
                            }}
                            onMouseEnter={() => setBreweryHoverRating(v)}
                            onMouseLeave={() => setBreweryHoverRating(0)}
                            onClick={() => handleBreweryStarClick(v)}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <p className="text-center italic" style={{ fontSize: 12, color: C.text3, marginTop: 8, minHeight: 18 }}>
                        {breweryRating === 0 ? 'Tap to rate your experience' : HINTS[breweryRating]}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ═══ YOUR BEERS THIS SESSION ═══ */}
            {allLogs.length > 0 && (
              <motion.div {...stagger(0.4)}>
                <SectionTitle>Your Beers This Session</SectionTitle>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {allLogs.map((log, i) => {
                    const rating = getRating(log)
                    const isDone = rating > 0
                    const beerName = log.beer?.name || 'Unknown beer'
                    const beerStyle = log.beer?.style
                    const beerAbv = log.beer?.abv
                    const communityRating = log.beer?.avg_rating
                    const logTime = new Date(log.logged_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                    const beerId = log.beer_id ?? log.beer?.id
                    const history = beerId ? beerHistory[beerId] : null

                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 + i * 0.06 }}
                        style={{
                          margin: '0 20px',
                          padding: '16px 18px',
                          background: C.card,
                          backdropFilter: 'blur(16px)',
                          borderRadius: 16,
                          border: `1px solid ${C.cardBorder}`,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                        }}
                      >
                        {/* Beer top row */}
                        <div className="flex items-start gap-3.5">
                          <div
                            className="flex items-center justify-center flex-shrink-0"
                            style={{
                              width: 44, height: 44, borderRadius: 10,
                              background: `linear-gradient(135deg, ${C.goldSoft}, ${C.accentSoft})`,
                            }}
                          >
                            <GlassIcon glassType={log.beer?.glass_type} instanceId={`recap-${log.id}`} size={22} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-display font-semibold truncate" style={{ fontSize: 16, color: C.text1 }}>{beerName}</p>
                            <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 3 }}>
                              {beerStyle && (
                                <span style={{
                                  fontSize: 10, color: C.accent, background: C.accentSoft,
                                  padding: '2px 8px', borderRadius: 20, fontWeight: 600, letterSpacing: 0.3,
                                }}>{beerStyle}</span>
                              )}
                              {beerAbv && <span style={{ fontSize: 11, color: C.text3 }}>{beerAbv}%</span>}
                              <span style={{ fontSize: 11, color: C.text4 }}>·</span>
                              <span style={{ fontSize: 11, color: C.text3 }}>{logTime}</span>
                            </div>
                          </div>
                        </div>

                        {/* Beer stats row */}
                        <div className="flex gap-4" style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.divider}` }}>
                          <div className="flex flex-col">
                            <span style={{ fontSize: 14, fontWeight: 700, color: C.text1 }}>
                              {history ? `${history.timesTried}${getOrdinalSuffix(history.timesTried)}` : '1st'}
                            </span>
                            <span style={{ fontSize: 10, color: C.text3, marginTop: 1, letterSpacing: 0.3 }}>time trying</span>
                          </div>
                          <div className="flex flex-col">
                            <span style={{ fontSize: 14, fontWeight: 700, color: C.text1 }}>
                              {history?.avgRating ? `${history.avgRating.toFixed(1)} ★` : '—'}
                            </span>
                            <span style={{ fontSize: 10, color: C.text3, marginTop: 1, letterSpacing: 0.3 }}>your avg</span>
                          </div>
                          {(communityRating ?? 0) > 0 && (
                            <div className="flex flex-col">
                              <span style={{ fontSize: 14, fontWeight: 700, color: C.text1 }}>{communityRating!.toFixed(1)} ★</span>
                              <span style={{ fontSize: 10, color: C.text3, marginTop: 1, letterSpacing: 0.3 }}>community</span>
                            </div>
                          )}
                        </div>

                        {/* Rating section */}
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.divider}` }}>
                          {isDone ? (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-px">
                                {[1, 2, 3, 4, 5].map(v => (
                                  <span key={v} style={{ fontSize: 16, color: v <= rating ? C.gold : C.text4, lineHeight: 1 }}>★</span>
                                ))}
                              </div>
                              <span style={{ fontSize: 10, color: C.text3, background: C.divider, padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>
                                {log.rating && log.rating > 0 ? 'Rated previously' : 'Just rated'}
                              </span>
                            </div>
                          ) : (
                            <div>
                              <p style={{ fontSize: 11, fontWeight: 500, color: C.text3, marginBottom: 6 }}>Rate this beer</p>
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map(v => (
                                  <BeerStar key={v} value={v} current={rating} logId={log.id} onRate={handleBeerRate} />
                                ))}
                              </div>
                              <textarea
                                value={beerNotes[log.id] || ''}
                                onChange={e => setBeerNotes(prev => ({ ...prev, [log.id]: e.target.value }))}
                                placeholder="Add a tasting note... (optional)"
                                rows={2}
                                style={{
                                  width: '100%',
                                  marginTop: 10,
                                  padding: '10px 14px',
                                  border: `1px solid ${C.cardBorder}`,
                                  borderRadius: 10,
                                  background: 'rgba(255,255,255,0.5)',
                                  fontFamily: "'DM Sans', sans-serif",
                                  fontSize: 13,
                                  color: C.text1,
                                  resize: 'none',
                                  outline: 'none',
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* ═══ ACHIEVEMENTS ═══ */}
            {newAchievements.length > 0 && (
              <motion.div {...stagger(0.55)}>
                <SectionTitle>Achievements Unlocked</SectionTitle>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '0 20px' }}>
                  {newAchievements.map((ach, i) => (
                    <motion.div
                      key={ach.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className="flex items-center gap-3"
                      style={{
                        padding: '14px 16px',
                        background: C.card,
                        backdropFilter: 'blur(16px)',
                        borderRadius: 16,
                        border: `1px solid ${C.cardBorder}`,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      }}
                    >
                      <div
                        className="flex items-center justify-center flex-shrink-0"
                        style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${C.goldSoft}, ${C.accentSoft})`, fontSize: 18 }}
                      >
                        {ach.icon || '🏆'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-semibold" style={{ fontSize: 15, color: C.text1 }}>{ach.name}</p>
                        <p style={{ fontSize: 12, color: C.text3, marginTop: 2 }}>Achievement unlocked · +{ach.xp_reward} XP</p>
                      </div>
                      <Trophy size={14} style={{ color: C.gold, flexShrink: 0 }} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ═══ XP BREAKDOWN ═══ */}
            {xpGained > 0 && (
              <motion.div {...stagger(0.6)}>
                <SectionTitle>XP Earned</SectionTitle>
                <div
                  style={{
                    margin: '0 20px',
                    padding: '18px 20px',
                    background: `linear-gradient(135deg, rgba(200,148,58,0.08), rgba(255,255,255,0.6))`,
                    backdropFilter: 'blur(16px)',
                    borderRadius: 16,
                    border: `1px solid rgba(200,148,58,0.15)`,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  }}
                >
                  {xpBreakdown.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between"
                      style={{ padding: '6px 0', borderTop: i > 0 ? `1px solid ${C.divider}` : 'none' }}
                    >
                      <span style={{ fontSize: 13, color: C.text2 }}>{item.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.gold }}>+{item.value} XP</span>
                    </div>
                  ))}
                  <div
                    className="flex items-center justify-between"
                    style={{ padding: '10px 0 0', marginTop: 6, borderTop: `2px solid rgba(200,148,58,0.2)` }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 600, color: C.text1 }}>Total Earned</span>
                    <span className="font-display font-bold" style={{ fontSize: 20, color: C.gold }}>+{xpGained} XP</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ═══ LEVEL PROGRESS ═══ */}
            {levelInfo && levelInfo.next && (
              <motion.div
                {...stagger(0.65)}
                style={{
                  margin: '12px 20px 0',
                  padding: '18px 20px',
                  background: C.card,
                  backdropFilter: 'blur(16px)',
                  borderRadius: 16,
                  border: `1px solid ${C.cardBorder}`,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                }}
              >
                <div className="flex items-baseline justify-between" style={{ marginBottom: 10 }}>
                  <p style={{ fontSize: 13, color: C.text2 }}>
                    Level <span style={{ fontWeight: 700, color: C.text1 }}>{levelInfo.current.level}</span> → <span style={{ fontWeight: 700, color: C.text1 }}>{levelInfo.next.level}</span>
                  </p>
                  <p style={{ fontSize: 12, color: C.text3 }}>
                    {levelInfo.current.xp_required.toLocaleString()} / {levelInfo.next.xp_required.toLocaleString()} XP
                  </p>
                </div>
                <div style={{ width: '100%', height: 8, borderRadius: 10, background: C.avatarBg, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      borderRadius: 10,
                      background: C.ring,
                      transition: 'width 1.5s ease',
                      width: progressAnimated ? `${levelInfo.progress}%` : '0%',
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* ═══ ACTIONS ═══ */}
            <motion.div
              {...stagger(0.75)}
              style={{ padding: '24px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              {onShare && (
                <button
                  onClick={onShare}
                  className="flex items-center justify-center gap-2 font-semibold transition-all active:scale-[0.98]"
                  style={{
                    width: '100%',
                    padding: 16,
                    borderRadius: 14,
                    border: 'none',
                    background: C.ring,
                    color: '#fff',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 15,
                    fontWeight: 600,
                    letterSpacing: 0.3,
                    boxShadow: '0 4px 16px rgba(183,82,47,0.25)',
                    cursor: 'pointer',
                  }}
                >
                  <span>↗</span> Share Your Session
                </button>
              )}
              <button
                onClick={handleClose}
                className="transition-all active:scale-[0.98]"
                style={{
                  width: '100%',
                  padding: 14,
                  borderRadius: 14,
                  border: `1px solid ${C.cardBorder}`,
                  background: C.card,
                  color: C.text2,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
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

// ── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="uppercase font-semibold"
      style={{ fontSize: 10, letterSpacing: 1.5, color: C.accent, margin: '24px 20px 12px', paddingLeft: 2 }}
    >
      {children}
    </p>
  )
}

function BeerStar({ value, current, logId, onRate }: { value: number; current: number; logId: string; onRate: (logId: string, rating: number) => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <span
      role="button"
      tabIndex={0}
      className="select-none transition-transform hover:scale-[1.2]"
      style={{
        fontSize: 22,
        color: value <= current || hovered ? C.gold : C.text4,
        cursor: 'pointer',
        lineHeight: 1,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onRate(logId, value)}
    >
      ★
    </span>
  )
}

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}
