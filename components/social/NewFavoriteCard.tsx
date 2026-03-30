'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { formatRelativeTime } from '@/lib/dates'
import { EmojiPulse } from '@/components/social/EmojiPulse'
import { StarRating } from '@/components/ui/StarRating'

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

export function NewFavoriteCard({
  favorite,
  index = 0,
}: {
  favorite: NewFavoriteItem
  index?: number
  reactionCounts?: Record<string, number>
  userReactions?: string[]
}) {
  const bubbleIdx = index % 4;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className="rounded-2xl p-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, color-mix(in srgb, var(--accent-gold) 10%, var(--surface)), color-mix(in srgb, var(--accent-amber) 4%, var(--surface)))",
        border: "1px solid color-mix(in srgb, var(--accent-gold) 22%, var(--border))",
      }}
    >
      {/* Bubble decorations */}
      <div className={`${LARGE_BUBBLE_POS[bubbleIdx]} w-14 h-14 rounded-full pointer-events-none`} style={{ background: 'var(--accent-gold)', opacity: 0.06 }} />
      <div className={`${SMALL_BUBBLE_POS[bubbleIdx]} w-4 h-4 rounded-full pointer-events-none`} style={{ background: 'var(--accent-gold)', opacity: 0.08 }} />

      {/* Header row: Heart icon + "{firstName} found a new favorite" + timestamp */}
      <div className="flex items-center gap-1.5 mb-2.5 relative z-10">
        <Heart size={11} strokeWidth={2} fill="currentColor" style={{ color: "var(--accent-gold)" }} />
        <p className="text-[11px] leading-none flex-1 min-w-0" style={{ color: "var(--text-muted)" }}>
          <Link href={`/profile/${favorite.username}`} className="font-semibold hover:underline underline-offset-2" style={{ color: "var(--text-primary)" }}>
            {favorite.displayName.split(' ')[0]}
          </Link>
          {" "}found a new favorite
        </p>
        <span className="text-[10px] font-mono flex-shrink-0" style={{ color: "var(--text-muted)" }}>
          {formatRelativeTime(favorite.createdAt)}
        </span>
      </div>

      {/* Beer name — hero text */}
      <p className="font-display text-lg font-bold leading-tight mb-1.5 relative z-10" style={{ color: "var(--text-primary)" }}>
        {favorite.beerName}
      </p>

      {/* Stars + brewery on one line */}
      <div className="flex items-center gap-2 mb-2 relative z-10">
        <StarRating value={5} readonly size="sm" />
        <span className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
          {favorite.breweryName}{favorite.beerStyle ? ` · ${favorite.beerStyle}` : ""}
        </span>
      </div>

      <div className="relative z-10">
        <EmojiPulse itemKey={`favorite-${favorite.id}`} />
      </div>
    </motion.div>
  )
}
