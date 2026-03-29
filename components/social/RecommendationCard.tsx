'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserAvatar } from '@/components/ui/UserAvatar'

export interface RecommendationItem {
  id: string
  userId: string
  username: string
  displayName: string
  avatarUrl: string | null
  beerName: string
  beerStyle: string | null
  breweryName: string
  note: string | null
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

export function RecommendationCard({
  recommendation,
  index = 0,
}: {
  recommendation: RecommendationItem
  index?: number
}) {
  const [liked, setLiked] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="rounded-2xl p-4"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderLeft: '3px solid var(--accent-gold)',
      }}
    >
      {/* User row */}
      <div className="flex items-center gap-3 mb-3">
        <UserAvatar
          profile={{
            id: recommendation.userId,
            username: recommendation.username,
            display_name: recommendation.displayName,
            avatar_url: recommendation.avatarUrl,
          } as any}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {recommendation.displayName.split(' ')[0]}
          </span>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {timeAgo(recommendation.createdAt)}
          </p>
        </div>
      </div>

      {/* RECOMMENDS label */}
      <p
        className="text-[10px] font-mono uppercase tracking-widest mb-1"
        style={{ color: 'var(--accent-gold)' }}
      >
        Recommends
      </p>

      {/* Beer info */}
      <p className="font-display text-lg font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
        {recommendation.beerName}
      </p>
      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
        {recommendation.breweryName}
        {recommendation.beerStyle ? ` · ${recommendation.beerStyle}` : ''}
      </p>

      {/* Tasting note */}
      {recommendation.note && (
        <p
          className="text-[13px] leading-relaxed mt-3 pl-3 italic"
          style={{
            color: 'var(--text-secondary)',
            borderLeft: '2px solid color-mix(in srgb, var(--accent-gold) 30%, transparent)',
          }}
        >
          {recommendation.note}
        </p>
      )}

      {/* Footer */}
      <div
        className="flex items-center gap-4 mt-3 pt-3"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <button
          onClick={() => setLiked(!liked)}
          className="flex items-center gap-1.5 text-sm transition-all"
          style={{
            color: liked ? 'var(--accent-gold)' : 'var(--text-muted)',
            fontWeight: liked ? 600 : 400,
            transform: liked ? 'scale(1.05)' : 'scale(1)',
          }}
        >
          🍺 {recommendation.likes + (liked ? 1 : 0)}
        </button>
        <button
          className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
          style={{
            background: 'color-mix(in srgb, var(--accent-gold) 10%, transparent)',
            color: 'var(--accent-gold)',
            border: '1px solid color-mix(in srgb, var(--accent-gold) 20%, transparent)',
          }}
        >
          + Add to My List
        </button>
      </div>
    </motion.div>
  )
}
