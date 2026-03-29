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

export function RatingCard({ rating: review, index = 0 }: { rating: FriendRating; index?: number }) {
  if (!review.profile || !review.beer) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl"
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
