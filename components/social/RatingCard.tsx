'use client'

import { motion } from 'framer-motion'
import { StarRating } from '@/components/ui/StarRating'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { formatRelativeTime } from '@/lib/dates'

export interface FriendRating {
  id: string
  rating: number
  comment: string | null
  created_at: string
  beer: { id: string; name: string; style: string | null } | null
  profile: { id: string; username: string; display_name: string; avatar_url: string | null } | null
}

const LARGE_BUBBLE_POS = [
  "absolute -top-3 -right-3",
  "absolute top-1 -right-4",
  "absolute -top-4 right-6",
  "absolute top-2 -right-2",
] as const;

const SMALL_BUBBLE_POS = [
  "absolute bottom-2 right-9",
  "absolute bottom-1 right-3",
  "absolute bottom-3 right-14",
  "absolute bottom-2 right-6",
] as const;

export function RatingCard({ rating: review, index = 0 }: { rating: FriendRating; index?: number }) {
  if (!review.profile || !review.beer) return null

  const bubbleIdx = index % 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl relative overflow-hidden"
      style={{ background: 'var(--surface-warm)', border: '1px solid var(--surface-warm-border)' }}
    >
      <div className={`${LARGE_BUBBLE_POS[bubbleIdx]} w-14 h-14 rounded-full pointer-events-none`} style={{ background: 'var(--accent-gold)', opacity: 0.05 }} />
      <div className={`${SMALL_BUBBLE_POS[bubbleIdx]} w-4 h-4 rounded-full pointer-events-none`} style={{ background: 'var(--accent-amber)', opacity: 0.07 }} />
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
        <p className="text-sm leading-tight" style={{ color: 'var(--text-primary)' }}>
          <span className="font-semibold">{review.profile.display_name.split(' ')[0]}</span>
          <span style={{ color: 'var(--text-muted)' }}> rated </span>
          <span className="font-medium">{review.beer.name}</span>
        </p>
        {review.comment && (
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
            &ldquo;{review.comment}&rdquo;
          </p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <StarRating value={review.rating} readonly size="sm" />
        <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
          {formatRelativeTime(review.created_at)}
        </span>
      </div>
    </motion.div>
  )
}
