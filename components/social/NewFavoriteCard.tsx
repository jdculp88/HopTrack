'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { variants, transition } from '@/lib/animation'
import { Heart } from 'lucide-react'
import { formatRelativeTime } from '@/lib/dates'
import { EmojiPulse } from '@/components/social/EmojiPulse'
import { StarRating } from '@/components/ui/StarRating'
import { getFirstName } from '@/lib/first-name'

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
      initial={variants.slideUpSmall.initial}
      animate={variants.slideUpSmall.animate}
      transition={{ delay: index * 0.03, ...transition.normal }}
      className="card-bg-featured rounded-2xl p-4 relative overflow-hidden"
    >
      {/* Header row: Heart icon + "{firstName} found a new favorite" + timestamp */}
      <div className="flex items-center gap-1.5 mb-2.5 relative z-10">
        <Heart size={11} strokeWidth={2} fill="currentColor" style={{ color: "var(--accent-gold)" }} />
        <p className="text-[11px] leading-none flex-1 min-w-0" style={{ color: "var(--text-muted)" }}>
          <Link href={`/profile/${favorite.username}`} className="font-semibold hover:underline underline-offset-2" style={{ color: "var(--text-primary)" }}>
            {getFirstName(favorite.displayName, null)}
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
