'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { useToast } from '@/components/ui/Toast'
import { formatRelativeTime } from '@/lib/dates'

export interface FriendJoinedItem {
  id: string
  userId: string
  username: string
  displayName: string
  avatarUrl: string | null
  mutualFriends: number
  joinedAt: string
}

export function FriendJoinedCard({
  friend,
  index = 0,
}: {
  friend: FriendJoinedItem
  index?: number
}) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'error'>('idle')
  const { success: toastSuccess, error: toastError } = useToast()

  async function handleFollow() {
    if (status === 'pending') return
    setStatus('pending')
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressee_id: friend.userId }),
      })
      if (!res.ok) {
        const data = await res.json()
        if (res.status === 409) {
          // Already friends or pending
          setStatus('pending')
          return
        }
        throw new Error(data.error || 'Failed to send request')
      }
      toastSuccess('Friend request sent!')
    } catch (err: any) {
      setStatus('error')
      toastError(err.message || 'Something went wrong')
      setTimeout(() => setStatus('idle'), 2000)
    }
  }

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
        {formatRelativeTime(friend.joinedAt)}
      </p>
      <button
        onClick={handleFollow}
        disabled={status === 'pending'}
        className="mt-3 text-sm font-semibold px-6 py-2 rounded-full text-white transition-all hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          background: status === 'pending'
            ? 'var(--surface-2)'
            : 'linear-gradient(145deg, var(--accent-gold), var(--accent-amber, var(--accent-gold)))',
          color: status === 'pending' ? 'var(--text-muted)' : undefined,
        }}
      >
        {status === 'pending' ? 'Pending' : 'Follow'}
      </button>
    </motion.div>
  )
}
