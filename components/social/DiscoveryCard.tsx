'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { TrendingUp, Calendar, Star } from 'lucide-react'
import { StarRating } from '@/components/ui/StarRating'
import { UserAvatar } from '@/components/ui/UserAvatar'

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

// ─── Trending Beer Review ────────────────────────────────────────────────────
export function TrendingCard({ reviews, index = 0 }: { reviews: TrendingReview[]; index?: number }) {
  if (reviews.length === 0) return null
  const top3 = reviews.slice(0, 3)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="rounded-2xl p-4"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={14} style={{ color: 'var(--accent-gold)' }} />
        <span className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--accent-gold)' }}>
          Trending This Week
        </span>
      </div>
      <div className="space-y-2.5">
        {top3.map((review) => (
          <div key={review.id} className="flex items-start gap-3">
            {review.profile && (
              <UserAvatar
                profile={{
                  id: review.profile.id,
                  username: review.profile.username,
                  display_name: review.profile.display_name,
                  avatar_url: review.profile.avatar_url,
                } as any}
                size="sm"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {review.beer?.name || 'Unknown'}
                </span>
                {review.beer?.style && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                    {review.beer.style}
                  </span>
                )}
              </div>
              {review.comment && (
                <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                  &ldquo;{review.comment}&rdquo;
                </p>
              )}
            </div>
            <StarRating value={review.rating} readonly size="sm" />
          </div>
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
            } as any}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
              <span className="font-semibold">{review.profile.display_name.split(' ')[0]}</span>
              <span style={{ color: 'var(--text-muted)' }}> reviewed </span>
              <span className="font-medium">{review.brewery.name}</span>
            </p>
            {review.comment && (
              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                &ldquo;{review.comment}&rdquo;
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
          className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
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
