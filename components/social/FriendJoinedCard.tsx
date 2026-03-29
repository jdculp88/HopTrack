'use client'

import { motion } from 'framer-motion'
import { UserAvatar } from '@/components/ui/UserAvatar'

export interface FriendJoinedItem {
  id: string
  userId: string
  username: string
  displayName: string
  avatarUrl: string | null
  mutualFriends: number
  joinedAt: string
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

export function FriendJoinedCard({
  friend,
  index = 0,
}: {
  friend: FriendJoinedItem
  index?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className="rounded-2xl px-4 py-4 text-center"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex justify-center mb-2">
        <UserAvatar
          profile={{
            id: friend.userId,
            username: friend.username,
            display_name: friend.displayName,
            avatar_url: friend.avatarUrl,
          } as any}
          size="lg"
        />
      </div>
      <p className="font-display text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
        {friend.displayName} joined HopTrack
      </p>
      {friend.mutualFriends > 0 && (
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          {friend.mutualFriends} mutual friend{friend.mutualFriends !== 1 ? 's' : ''}
        </p>
      )}
      <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
        {timeAgo(friend.joinedAt)}
      </p>
      <button
        className="mt-3 text-sm font-semibold px-6 py-2 rounded-full text-white transition-all hover:scale-105"
        style={{
          background: 'linear-gradient(145deg, var(--accent-gold), var(--accent-amber, var(--accent-gold)))',
        }}
      >
        Follow
      </button>
    </motion.div>
  )
}
