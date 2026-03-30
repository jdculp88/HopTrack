'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
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
}: {
  favorite: NewFavoriteItem
  index?: number
  reactionCounts?: Record<string, number>
  userReactions?: string[]
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className="rounded-2xl overflow-hidden flex"
      style={{
        background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-gold) 8%, var(--surface)), var(--surface))',
        border: '1px solid color-mix(in srgb, var(--accent-gold) 20%, var(--border))',
      }}
    >
      {/* Gold accent bar */}
      <div
        className="w-1 flex-shrink-0"
        style={{ background: 'var(--accent-gold)', opacity: 0.7 }}
      />

      {/* Heart icon column */}
      <div
        className="flex items-center justify-center w-14 flex-shrink-0"
        style={{ background: 'color-mix(in srgb, var(--accent-gold) 10%, transparent)' }}
      >
        <Heart size={20} strokeWidth={1.75} style={{ color: 'var(--accent-gold)' }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 px-4 py-3">
        <p className="text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>
          <Link
            href={`/profile/${favorite.username}`}
            className="font-semibold hover:underline underline-offset-2"
          >
            {favorite.displayName.split(' ')[0]}
          </Link>
          <span style={{ color: 'var(--text-muted)' }}> favorited </span>
          <span className="font-display font-bold" style={{ color: 'var(--text-primary)' }}>
            {favorite.beerName}
          </span>
        </p>
        <p className="text-[10px] font-mono mt-1" style={{ color: 'var(--text-muted)' }}>
          {favorite.breweryName} · {formatRelativeTime(favorite.createdAt)}
        </p>
      </div>
    </motion.div>
  )
}
