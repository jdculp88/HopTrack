'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { TrendingUp, Calendar } from 'lucide-react'
import { StarRating } from '@/components/ui/StarRating'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { useToast } from '@/components/ui/Toast'
import { getStyleFamily, getStyleVars } from '@/lib/beerStyleColors'
import { getFirstName } from '@/lib/first-name'

export interface BreweryReviewItem {
  id: string
  rating: number
  comment: string | null
  created_at: string
  brewery: { id: string; name: string; city: string | null; state: string | null } | null
  profile: { id: string; username: string; display_name: string; avatar_url: string | null } | null
}

export interface EventItem {
  id: string
  title: string
  description: string | null
  event_date: string
  start_time: string | null
  brewery: { id: string; name: string } | null
}

export interface TrendingReview {
  id: string
  rating: number
  comment: string | null
  created_at: string
  beer: { id: string; name: string; style: string | null; glass_type: string | null } | null
  profile: { id: string; username: string; display_name: string; avatar_url: string | null } | null
}

function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)

  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatTime(time: string | null): string {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hr = h % 12 || 12
  return `${hr}:${m.toString().padStart(2, '0')} ${ampm}`
}

// ─── Trending Beer Reviews — Horizontal Scroll ──────────────────────────────
export function TrendingCard({ reviews, index = 0 }: { reviews: TrendingReview[]; index?: number }) {
  if (reviews.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={14} style={{ color: 'var(--accent-gold)' }} />
        <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--accent-gold)' }}>
          Trending Near You
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide snap-x">
        {reviews.map((review, i) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05, duration: 0.25 }}
            className="card-bg-reco rounded-xl p-3.5 flex-shrink-0 snap-start"
            data-style={getStyleFamily(review.beer?.style)}
            style={{
              border: '1px solid var(--surface-warm-border)',
              minWidth: 150,
              maxWidth: 170,
            }}
          >
            <p className="font-display text-sm font-semibold leading-tight truncate" style={{ color: 'var(--text-primary)' }}>
              {review.beer?.name || 'Unknown'}
            </p>
            <p className="text-[11px] mt-1 truncate" style={{ color: 'var(--text-muted)' }}>
              {getFirstName(review.profile?.display_name, review.profile?.username)}
            </p>
            {review.beer?.style && (() => {
              const sv = getStyleVars(review.beer.style)
              return (
                <span
                  className="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 rounded-full"
                  style={{
                    background: `color-mix(in srgb, ${sv.primary} 12%, transparent)`,
                    color: sv.primary,
                  }}
                >
                  {review.beer.style}
                </span>
              )
            })()}
            <div className="mt-2">
              <StarRating value={review.rating} readonly size="sm" />
            </div>
            {review.comment && (
              <p className="text-[10px] mt-1.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                "{review.comment}"
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Brewery Review Card ─────────────────────────────────────────────────────
export function BreweryReviewCard({ review, index = 0 }: { review: BreweryReviewItem; index?: number }) {
  if (!review.brewery || !review.profile) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
    >
      <Link href={`/brewery/${review.brewery.id}`}>
        <div
          className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <UserAvatar
            profile={{
              id: review.profile.id,
              username: review.profile.username,
              display_name: review.profile.display_name,
              avatar_url: review.profile.avatar_url,
            }}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
              <span className="font-semibold">{getFirstName(review.profile.display_name, review.profile.username)}</span>
              <span style={{ color: 'var(--text-muted)' }}> reviewed </span>
              <span className="font-medium">{review.brewery.name}</span>
            </p>
            {review.comment && (
              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                "{review.comment}"
              </p>
            )}
          </div>
          <StarRating value={review.rating} readonly size="sm" />
        </div>
      </Link>
    </motion.div>
  )
}

// ─── Upcoming Event Card ─────────────────────────────────────────────────────
export function EventCard({ event, index = 0 }: { event: EventItem; index?: number }) {
  if (!event.brewery) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
    >
      <Link href={`/brewery/${event.brewery.id}`}>
        <div
          className="card-bg-notification rounded-xl px-4 py-3 flex items-center gap-3"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'color-mix(in srgb, var(--accent-gold) 12%, transparent)' }}
          >
            <Calendar size={18} style={{ color: 'var(--accent-gold)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {event.title}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {event.brewery.name} · {formatEventDate(event.event_date)}
              {event.start_time ? ` · ${formatTime(event.start_time)}` : ''}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// ─── Seasonal & Limited Beers — Horizontal Scroll ────────────────────────────

export interface SeasonalBeer {
  id: string
  name: string
  brewery: string
  style: string
  badge: 'Limited' | 'Seasonal' | 'New'
}

export function SeasonalBeersScroll({ beers }: { beers: SeasonalBeer[] }) {
  if (beers.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <p className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
        New & Noteworthy
      </p>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide snap-x">
        {beers.map((beer, i) => (
          <motion.div
            key={beer.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.25 }}
            className="card-bg-seasonal rounded-xl p-3.5 flex-shrink-0"
            style={{
              border: '1px solid var(--surface-warm-border)',
              minWidth: 140,
              maxWidth: 160,
              "--seasonal-color": getStyleVars(beer.style).primary,
            } as React.CSSProperties}
          >
            <span
              className="absolute top-2 right-2 text-[9px] font-mono font-bold px-2 py-0.5 rounded-md"
              style={{
                color: beer.badge === 'Limited' ? 'var(--danger, #c0583a)' : 'var(--accent-gold)',
                background: beer.badge === 'Limited'
                  ? 'color-mix(in srgb, var(--danger, #c0583a) 10%, transparent)'
                  : 'color-mix(in srgb, var(--accent-gold) 10%, transparent)',
                letterSpacing: '0.5px',
              }}
            >
              {beer.badge}
            </span>
            <p
              className="font-display text-sm font-semibold leading-tight pr-12"
              style={{ color: 'var(--text-primary)' }}
            >
              {beer.name}
            </p>
            <p className="text-[11px] mt-1 truncate" style={{ color: 'var(--text-muted)' }}>
              {typeof beer.brewery === 'string' ? beer.brewery : (beer.brewery as any)?.name ?? ''}
            </p>
            {(() => {
              const sv = getStyleVars(beer.style)
              return (
                <span
                  className="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 rounded-full"
                  style={{
                    background: `color-mix(in srgb, ${sv.primary} 12%, transparent)`,
                    color: sv.primary,
                  }}
                >
                  {beer.style}
                </span>
              )
            })()}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Curated Collections ─────────────────────────────────────────────────────

export type CollectionTagColor = 'gold' | 'dark' | 'amber' | 'green'

export interface CuratedCollection {
  id: string
  title: string
  count: number
  emoji: string
  description?: string
  tagColor?: CollectionTagColor
}

function getTagStyles(tagColor: CollectionTagColor = 'gold'): { bg: string; border: string; accent: string } {
  switch (tagColor) {
    case 'dark':
      return {
        bg: 'linear-gradient(135deg, color-mix(in srgb, var(--surface-2) 80%, transparent), var(--surface))',
        border: 'color-mix(in srgb, var(--border) 60%, transparent)',
        accent: 'var(--stout-espresso-mid)',
      }
    case 'amber':
      return {
        bg: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-amber) 10%, transparent), var(--surface))',
        border: 'color-mix(in srgb, var(--accent-amber) 20%, transparent)',
        accent: 'var(--accent-amber)',
      }
    case 'green':
      return {
        bg: 'linear-gradient(135deg, color-mix(in srgb, var(--ipa-green) 8%, transparent), var(--surface))',
        border: 'color-mix(in srgb, var(--ipa-green) 18%, transparent)',
        accent: 'var(--ipa-green)',
      }
    case 'gold':
    default:
      return {
        bg: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-gold) 10%, transparent), var(--surface))',
        border: 'color-mix(in srgb, var(--accent-gold) 18%, transparent)',
        accent: 'var(--accent-gold)',
      }
  }
}

export function CuratedCollectionsList({ collections }: { collections: CuratedCollection[] }) {
  const { info } = useToast()

  if (collections.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <p
        className="text-[10px] font-mono uppercase tracking-widest mb-3"
        style={{ color: 'var(--accent-gold)' }}
      >
        Curated Collections
      </p>
      <div className="space-y-2.5">
        {collections.map((col, i) => {
          const tagStyles = getTagStyles(col.tagColor)
          return (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
            >
              <button
                type="button"
                onClick={() => info('Collection coming soon — editorial loading!')}
                className="w-full text-left"
              >
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="card-bg-collection rounded-xl py-3.5 pr-4 flex items-center gap-3.5 relative overflow-hidden"
                  style={{
                    background: tagStyles.bg,
                    border: `1px solid ${tagStyles.border}`,
                    "--collection-color": tagStyles.accent,
                  } as React.CSSProperties}
                >
                  <span className="text-2xl flex-shrink-0">{col.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {col.title}
                    </p>
                    {col.description && (
                      <p className="text-[11px] mt-0.5 leading-snug" style={{ color: 'var(--text-secondary)' }}>
                        {col.description}
                      </p>
                    )}
                    <p className="font-mono text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                      {col.count} beers
                    </p>
                  </div>
                </motion.div>
              </button>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
