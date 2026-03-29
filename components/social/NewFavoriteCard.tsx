'use client'

import { motion } from 'framer-motion'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { ReactionBar } from '@/components/social/ReactionBar'
import { formatRelativeTime } from '@/lib/dates'

export interface NewFavoriteItem {
  id: string
  userId: string
  username: string
  displayName: string
  avatarUrl: string | null
  beerName: string
  beerStyle: string | null
  breweryName: string
  createdAt: string
  likes: number
}

export function NewFavoriteCard({
  favorite,
  index = 0,
  reactionCounts,
  userReactions,
}: {
  favorite: NewFavoriteItem
  index?: number
  reactionCounts?: Record<string, number>
  userReactions?: string[]
}) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className="rounded-2xl px-4 py-3"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {/* Compact content row */}
      <div className="flex items-center gap-3">
        <UserAvatar
          profile={{
            id: favorite.userId,
            username: favorite.username,
            display_name: favorite.displayName,
            avatar_url: favorite.avatarUrl,
          } as any}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {favorite.displayName.split(' ')[0]}
            </span>
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {formatRelativeTime(favorite.createdAt)}
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            ❤️ favorited{' '}
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {favorite.beerName}
            </span>
            {' '}from {favorite.breweryName}
          </p>
        </div>
      </div>

      {/* Reaction footer */}
      <ReactionBar
        reactionCounts={reactionCounts}
        userReactions={userReactions}
        showShare={false}
      />
    </motion.div>
  )
}
