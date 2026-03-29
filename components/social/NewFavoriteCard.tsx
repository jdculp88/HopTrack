'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserAvatar } from '@/components/ui/UserAvatar'

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

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export function NewFavoriteCard({
  favorite,
  index = 0,
}: {
  favorite: NewFavoriteItem
  index?: number
}) {
  const [liked, setLiked] = useState(false)

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
              {timeAgo(favorite.createdAt)}
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

      {/* Footer */}
      <div
        className="flex items-center gap-3 mt-2.5 pt-2.5"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <button
          onClick={() => setLiked(!liked)}
          className="flex items-center gap-1.5 text-[13px] transition-all"
          style={{
            color: liked ? 'var(--accent-gold)' : 'var(--text-muted)',
            fontWeight: liked ? 600 : 400,
          }}
        >
          🍺 {favorite.likes + (liked ? 1 : 0)}
        </button>
        <button
          className="text-[11px] font-semibold px-3 py-1 rounded-full"
          style={{
            background: 'color-mix(in srgb, var(--accent-gold) 10%, transparent)',
            color: 'var(--accent-gold)',
          }}
        >
          Try it too
        </button>
      </div>
    </motion.div>
  )
}
