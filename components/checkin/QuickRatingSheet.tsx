'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, X } from 'lucide-react'
import { BeerLog } from '@/types/database'

interface QuickRatingSheetProps {
  beerLog: BeerLog
  beerName: string
  onSave: (logId: string, rating: number, comment?: string) => Promise<void>
  onSkip: () => void
  isOpen: boolean
}

export default function QuickRatingSheet({
  beerLog,
  beerName,
  onSave,
  onSkip,
  isOpen,
}: QuickRatingSheetProps) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)

  const ratingLabels: Record<number, string> = {
    1: 'Disappointing 😕',
    2: 'Not great 🤔',
    3: 'Pretty good 😊',
    4: 'Really good! 😄',
    5: 'Outstanding! 🤩',
  }

  async function handleSave() {
    if (!rating) { onSkip(); return }
    setSaving(true)
    await onSave(beerLog.id, rating, comment || undefined)
    setSaving(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onSkip}
            className="fixed inset-0 z-50 bg-black/60"
          />
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl pb-safe"
            style={{ background: 'var(--surface)' }}
          >
            <div className="px-5 pt-5 pb-8">
              {/* Handle */}
              <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--border)' }} />

              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: 'var(--accent-gold)' }}>
                    Just logged
                  </p>
                  <h2 className="text-xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
                    How was {beerName}?
                  </h2>
                </div>
                <button
                  onClick={onSkip}
                  className="p-2 rounded-xl"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Stars */}
              <div className="flex items-center justify-center gap-3 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className="p-1"
                  >
                    <motion.div
                      whileTap={{ scale: 1.3 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                      <Star
                        size={36}
                        className="transition-colors"
                        style={{
                          color: star <= (hovered || rating) ? 'var(--accent-gold)' : 'var(--border)',
                          fill: star <= (hovered || rating) ? 'var(--accent-gold)' : 'transparent',
                        }}
                      />
                    </motion.div>
                  </button>
                ))}
              </div>

              {/* Rating label */}
              <AnimatePresence mode="wait">
                {(rating > 0 || hovered > 0) && (
                  <motion.p
                    key={hovered || rating}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-center text-sm mb-5"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {ratingLabels[hovered || rating]}
                  </motion.p>
                )}
                {rating === 0 && hovered === 0 && (
                  <div key="empty" className="mb-5 h-5" />
                )}
              </AnimatePresence>

              {/* Optional note */}
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a quick note... (optional)"
                rows={2}
                maxLength={280}
                className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none transition-colors mb-5"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              />

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onSkip}
                  className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors"
                  style={{
                    background: 'var(--surface-2)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                  }}
                >
                  Skip
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || rating === 0}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                  style={{
                    background: rating > 0 ? 'var(--accent-gold)' : 'var(--surface-2)',
                    color: rating > 0 ? '#0F0E0C' : 'var(--text-muted)',
                  }}
                >
                  {saving ? 'Saving...' : 'Save Rating'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
