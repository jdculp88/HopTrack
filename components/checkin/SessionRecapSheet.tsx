'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Beer, Star, Trophy, X, Share2 } from 'lucide-react'
import confetti from 'canvas-confetti'
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

function StarDisplay({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-xs" style={{ color: 'var(--text-muted)' }}>No rating</span>
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          style={{
            color: s <= rating ? 'var(--accent-gold)' : 'var(--border)',
            fill: s <= rating ? 'var(--accent-gold)' : 'transparent',
          }}
        />
      ))}
    </div>
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

  useEffect(() => {
    if (isOpen && !fired) {
      setFired(true)
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#D4A843', '#E8841A', '#FFFFFF'],
      })
    }
    if (!isOpen) setFired(false)
  }, [isOpen, fired])

  const ratedLogs = beerLogs.filter((b) => b.rating != null)
  const avgRating = ratedLogs.length > 0
    ? (ratedLogs.reduce((sum, b) => sum + (b.rating || 0), 0) / ratedLogs.length).toFixed(1)
    : null

  const duration = session ? formatDuration(session.started_at, session.ended_at) : ''

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col overflow-y-auto"
          style={{ background: '#0F0E0C' }}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.1 }}
            className="flex flex-col min-h-full px-6 pt-safe pb-safe"
          >
            {/* Close button */}
            <div className="flex justify-end pt-4 pb-2">
              <button
                onClick={onClose}
                className="p-2 rounded-xl"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Hero */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
              className="flex flex-col items-center text-center py-8"
            >
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
                style={{ background: 'linear-gradient(135deg, #D4A843 0%, #E8841A 100%)' }}
              >
                <Beer size={40} className="text-black" />
              </div>
              <p className="font-mono text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--accent-gold)' }}>
                Session Complete
              </p>
              <h1 className="text-3xl font-bold font-display mb-2" style={{ color: 'var(--text-primary)' }}>
                Cheers! 🥂
              </h1>
              <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                {breweryName}
              </p>
              {duration && (
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  {duration} · {beerLogs.length} {beerLogs.length === 1 ? 'beer' : 'beers'}
                  {avgRating ? ` · avg ★ ${avgRating}` : ''}
                </p>
              )}
            </motion.div>

            {/* XP */}
            {xpGained > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl mb-4 self-center"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <span className="text-lg">✨</span>
                <span className="font-semibold" style={{ color: 'var(--accent-gold)' }}>
                  +{xpGained} XP earned
                </span>
              </motion.div>
            )}

            {/* Achievements */}
            {newAchievements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="mb-4 space-y-2"
              >
                {newAchievements.map((ach) => (
                  <div
                    key={ach.id}
                    className="flex items-center gap-3 p-4 rounded-2xl"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{ background: 'linear-gradient(135deg, #D4A843 0%, #E8841A 100%)' }}
                    >
                      {ach.icon || '🏆'}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {ach.name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Achievement unlocked · +{ach.xp_reward} XP
                      </p>
                    </div>
                    <Trophy size={16} className="ml-auto" style={{ color: 'var(--accent-gold)' }} />
                  </div>
                ))}
              </motion.div>
            )}

            {/* Beer log recap */}
            {beerLogs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="mb-6"
              >
                <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                  What you had
                </p>
                <div className="space-y-2">
                  {beerLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between px-4 py-3 rounded-xl"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">🍺</span>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {log.beer?.name || 'Unknown beer'}
                        </span>
                      </div>
                      <StarDisplay rating={log.rating} />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="mt-auto pb-6 space-y-3"
            >
              {onShare && (
                <button
                  onClick={onShare}
                  className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #D4A843 0%, #E8841A 100%)',
                    color: '#0F0E0C',
                  }}
                >
                  <Share2 size={18} />
                  Share your session
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full py-4 rounded-xl font-semibold transition-all"
                style={{
                  background: 'var(--surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                }}
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
