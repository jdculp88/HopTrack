'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { variants, transition, spring, microInteraction } from '@/lib/animation'
import { TrendingUp, Calendar, Star } from 'lucide-react'
import { StarRating } from '@/components/ui/StarRating'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { useToast } from '@/components/ui/Toast'
import { getStyleFamily, getStyleVars } from '@/lib/beerStyleColors'
import { BeerStyleBadge } from '@/components/ui/BeerStyleBadge'
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
  going_count?: number
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

// ─── Trending Beer Reviews — Horizontal Scroll (mirrored Reco layout) ───────
export function TrendingCard({ reviews, index = 0 }: { reviews: TrendingReview[]; index?: number }) {
  if (reviews.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <TrendingUp size={13} style={{ color: 'var(--accent-gold)' }} />
        <p
          className="text-[10px] font-mono uppercase tracking-widest"
          style={{ color: 'var(--accent-gold)' }}
        >
          Trending Near You
        </p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1 snap-x items-stretch">
        {reviews.map((review, i) => {
          const styleVars = getStyleVars(review.beer?.style)

          return (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex-shrink-0 snap-start flex"
            >
              <Link href={`/beer/${review.beer?.id ?? ''}`}>
                <div
                  className="w-[180px] h-full rounded-[14px] overflow-hidden transition-all hover:scale-[1.02] flex flex-col"
                  style={{
                    border: '1px solid var(--card-border)',
                    background: 'var(--card-bg)',
                  }}
                >
                  {/* Hero — gradient mirrored to LEFT */}
                  <div
                    className="relative px-3 pt-3 pb-2 flex-shrink-0 overflow-hidden"
                    style={{
                      height: '64px',
                      background: `radial-gradient(ellipse at 20% 20%, color-mix(in srgb, ${styleVars.primary} 8%, transparent) 0%, transparent 60%), linear-gradient(180deg, color-mix(in srgb, ${styleVars.primary} 6%, var(--card-bg)) 0%, var(--card-bg) 100%)`,
                    }}
                  >
                    {/* Glass SVG — LEFT side */}
                    <svg
                      className="absolute top-3 left-3"
                      width={32}
                      height={32}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={styleVars.primary}
                      strokeWidth={1}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ opacity: 0.3 }}
                    >
                      <path d="M7 3h10l-1.5 15a2 2 0 0 1-2 1.8h-3a2 2 0 0 1-2-1.8L7 3z" />
                    </svg>

                    {/* Beer name — padded left for icon */}
                    <p
                      className="font-sans font-bold leading-tight pl-8 line-clamp-2"
                      style={{ color: 'var(--text-primary)', fontSize: '14px', letterSpacing: '-0.01em' }}
                    >
                      {review.beer?.name || 'Unknown'}
                    </p>
                    <p
                      className="truncate mt-0.5 pl-8"
                      style={{ fontSize: '11px', color: 'var(--text-secondary)' }}
                    >
                      {getFirstName(review.profile?.display_name, review.profile?.username)}
                    </p>
                  </div>

                  {/* Body — badge, rating, comment */}
                  <div className="px-3 pb-3 flex flex-col flex-1">
                    <div className="flex flex-col">
                      {review.beer?.style && (
                        <div style={{ marginTop: '6px' }}>
                          <BeerStyleBadge style={review.beer.style} size="sm" fullWidth />
                        </div>
                      )}

                      <div className="flex items-center gap-1.5" style={{ marginTop: '6px' }}>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star
                              key={j}
                              size={10}
                              style={{
                                color: 'var(--accent-gold)',
                                fill: j < Math.round(review.rating) ? 'var(--accent-gold)' : 'transparent',
                              }}
                            />
                          ))}
                        </div>
                        <span
                          className="font-mono font-bold"
                          style={{ fontSize: '13px', color: 'var(--accent-gold)' }}
                        >
                          {review.rating.toFixed(1)}
                        </span>
                      </div>

                      {review.comment && (
                        <p
                          className="leading-relaxed line-clamp-2 mt-auto"
                          style={{ fontSize: '11px', color: styleVars.primary, paddingTop: '6px' }}
                        >
                          &ldquo;{review.comment}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Brewery Review Card ─────────────────────────────────────────────────────
export function BreweryReviewCard({ review, index = 0 }: { review: BreweryReviewItem; index?: number }) {
  if (!review.brewery || !review.profile) return null

  return (
    <motion.div
      initial={variants.slideUpSmall.initial}
      animate={variants.slideUpSmall.animate}
      transition={{ delay: index * 0.04, ...transition.normal }}
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
                &ldquo;{review.comment}&rdquo;
              </p>
            )}
          </div>
          {/* Rating — warm-bg container, same as SessionCard/RatingCard */}
          <div
            className="flex flex-col items-center flex-shrink-0 rounded-[10px]"
            style={{ background: 'var(--warm-bg)', padding: '8px 12px' }}
          >
            <span
              className="font-mono text-lg font-bold leading-none"
              style={{ color: 'var(--accent-gold)' }}
            >
              {review.rating.toFixed(1)}
            </span>
            <div className="flex items-center gap-0.5 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={8}
                  style={{
                    color: 'var(--accent-gold)',
                    fill: i < Math.round(review.rating) ? 'var(--accent-gold)' : 'transparent',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// ─── Upcoming Event Card ─────────────────────────────────────────────────────
export function EventCard({ event, index = 0 }: { event: EventItem; index?: number }) {
  if (!event.brewery) return null

  const d = new Date(event.event_date)
  const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
  const day = d.getDate()

  // Relative day label
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const eventDay = new Date(d)
  eventDay.setHours(0, 0, 0, 0)
  const diffDays = Math.round((eventDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const relativeDay =
    diffDays === 0 ? 'Today' :
    diffDays === 1 ? 'Tomorrow' :
    d.toLocaleDateString('en-US', { weekday: 'short' })

  const goingCount = event.going_count ?? 0

  return (
    <motion.div
      initial={variants.slideUpSmall.initial}
      animate={variants.slideUpSmall.animate}
      transition={{ delay: index * 0.04, ...transition.normal }}
    >
      <Link href={`/brewery/${event.brewery.id}`}>
        <div
          className="flex items-center gap-3.5 p-3.5 rounded-[14px] border relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-gold) 6%, var(--card-bg)) 0%, var(--card-bg) 60%)',
            borderColor: 'color-mix(in srgb, var(--accent-gold) 25%, var(--border))',
          }}
        >
          {/* Gold left accent bar */}
          <div
            className="absolute left-0 top-0 bottom-0 w-[3px]"
            style={{ background: 'var(--accent-gold)' }}
          />

          {/* Date chip */}
          <div
            className="w-14 h-14 flex-shrink-0 text-center rounded-xl flex flex-col items-center justify-center"
            style={{
              background: 'color-mix(in srgb, var(--accent-gold) 10%, var(--surface-2))',
              border: '1px solid color-mix(in srgb, var(--accent-gold) 20%, var(--border))',
            }}
          >
            <div
              className="font-mono text-[9px] font-bold tracking-[0.12em] uppercase leading-none"
              style={{ color: 'var(--accent-gold)' }}
            >
              {month}
            </div>
            <div
              className="font-mono text-xl font-bold leading-none mt-0.5"
              style={{ color: 'var(--text-primary)' }}
            >
              {day}
            </div>
          </div>

          {/* Event details */}
          <div className="flex-1 min-w-0">
            <p
              className="font-sans font-bold text-[15px] truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {event.title}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {event.brewery.name}
            </p>
            <p className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {relativeDay}
              {event.start_time ? ` · ${formatTime(event.start_time)}` : ''}
            </p>
          </div>

          {/* Going count */}
          {goingCount > 0 && (
            <div className="flex flex-col items-end flex-shrink-0">
              <span
                className="font-mono text-xl font-bold leading-none"
                style={{ color: 'var(--accent-gold)' }}
              >
                {goingCount}
              </span>
              <span
                className="font-mono text-[10px] mt-0.5"
                style={{ color: 'var(--text-muted)' }}
              >
                going
              </span>
            </div>
          )}
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
      initial={variants.slideUpSmall.initial}
      animate={variants.slideUpSmall.animate}
      transition={transition.normal}
    >
      <p className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
        New & Noteworthy
      </p>
      <div
        className="flex overflow-x-auto pb-1 snap-x -mx-1 px-1"
        style={{ gap: '10px', scrollbarWidth: 'none' }}
      >
        {beers.map((beer, i) => {
          const styleVars = getStyleVars(beer.style)
          const breweryName = typeof beer.brewery === 'string' ? beer.brewery : (beer.brewery as any)?.name ?? ''

          // Badge color: "New" = info-blue, "Limited" = gold, "Seasonal" = gold
          const badgeColor = beer.badge === 'New' ? '#3498DB' : 'var(--accent-gold)'
          const badgeShadow = beer.badge === 'New' ? '0 1px 4px rgba(52,152,219,0.3)' : '0 1px 4px rgba(196,136,62,0.3)'

          return (
            <motion.div
              key={beer.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex-shrink-0 snap-start"
            >
              <div
                className="rounded-[14px] overflow-hidden relative"
                style={{
                  minWidth: '145px',
                  maxWidth: '145px',
                  border: '1px solid var(--card-border)',
                  background: 'var(--card-bg)',
                  transition: 'all 0.2s',
                }}
              >
                {/* NEW / Limited / Seasonal badge */}
                <span
                  className="absolute font-mono font-bold uppercase"
                  style={{
                    top: '8px',
                    right: '8px',
                    fontSize: '8px',
                    letterSpacing: '0.1em',
                    padding: '2px 7px',
                    borderRadius: '5px',
                    color: '#fff',
                    background: badgeColor,
                    boxShadow: badgeShadow,
                    zIndex: 2,
                  }}
                >
                  {beer.badge}
                </span>

                {/* Hero — style-tinted, 90px, centered glass */}
                <div
                  className="flex items-center justify-center relative"
                  style={{
                    height: '90px',
                    background: `radial-gradient(ellipse at 50% 40%, color-mix(in srgb, ${styleVars.primary} 14%, transparent) 0%, transparent 70%), linear-gradient(180deg, color-mix(in srgb, ${styleVars.primary} 12%, var(--card-bg)) 0%, color-mix(in srgb, ${styleVars.primary} 4%, var(--card-bg)) 100%)`,
                  }}
                >
                  {/* Glass line-art — centered, 0.15 opacity */}
                  <svg
                    width={32}
                    height={32}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={styleVars.primary}
                    strokeWidth={1}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ opacity: 0.15 }}
                  >
                    <path d="M7 3h10l-1.5 15a2 2 0 0 1-2 1.8h-3a2 2 0 0 1-2-1.8L7 3z" />
                  </svg>
                </div>

                {/* Info area — separated by border-top */}
                <div
                  style={{
                    padding: '10px 12px 12px',
                    background: 'var(--card-bg)',
                    borderTop: '1px solid var(--border)',
                  }}
                >
                  <p
                    className="font-sans font-semibold leading-[1.25]"
                    style={{
                      fontSize: '13px',
                      color: 'var(--text-primary)',
                      marginBottom: '2px',
                    }}
                  >
                    {beer.name}
                  </p>
                  <p
                    className="truncate"
                    style={{
                      fontSize: '10px',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {breweryName}
                  </p>
                  {beer.style && (
                    <div style={{ marginTop: '8px' }}>
                      <BeerStyleBadge style={beer.style} size="sm" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
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
      initial={variants.slideUpSmall.initial}
      animate={variants.slideUpSmall.animate}
      transition={transition.normal}
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
              initial={variants.slideUpSmall.initial}
              animate={variants.slideUpSmall.animate}
              transition={{ delay: i * 0.04, ...transition.normal }}
            >
              <button
                type="button"
                onClick={() => info('Collection coming soon — editorial loading!')}
                className="w-full text-left"
              >
                <motion.div
                  whileTap={microInteraction.select}
                  transition={spring.default}
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
