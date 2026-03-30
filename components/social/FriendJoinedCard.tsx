'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { UserPlus } from 'lucide-react'
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

  const firstName = (friend.displayName || friend.username).split(' ')[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className="rounded-2xl overflow-hidden flex relative"
      style={{
        background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-gold) 8%, var(--surface)), var(--surface))',
        border: '1px solid color-mix(in srgb, var(--accent-gold) 20%, var(--border))',
      }}
    >
      {/* Bubble decorations */}
      <div className="absolute -top-3 -right-3 w-14 h-14 rounded-full pointer-events-none" style={{ background: 'var(--accent-gold)', opacity: 0.06 }} />
      <div className="absolute bottom-2 right-10 w-4 h-4 rounded-full pointer-events-none" style={{ background: 'var(--accent-amber)', opacity: 0.08 }} />

      {/* Gold accent bar */}
      <div
        className="w-1 flex-shrink-0"
        style={{ background: 'var(--accent-gold)', opacity: 0.7 }}
      />

      {/* Icon column */}
      <div
        className="flex items-center justify-center w-14 flex-shrink-0"
        style={{ background: 'color-mix(in srgb, var(--accent-gold) 10%, transparent)' }}
      >
        <UserPlus size={20} strokeWidth={1.75} style={{ color: 'var(--accent-gold)' }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 px-4 py-3">
        <p className="text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>
          <Link
            href={`/profile/${friend.username}`}
            className="font-semibold hover:underline underline-offset-2"
          >
            {firstName}
          </Link>
          <span style={{ color: 'var(--text-muted)' }}> joined your crew</span>
        </p>

        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          {friend.mutualFriends > 0 && (
            <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
              {friend.mutualFriends} friend{friend.mutualFriends !== 1 ? 's' : ''} in common
            </span>
          )}
          <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
            {formatRelativeTime(friend.joinedAt)}
          </span>
          <Link
            href={`/profile/${friend.username}`}
            className="text-[10px] font-mono font-medium"
            style={{ color: 'var(--accent-gold)' }}
          >
            Say hi →
          </Link>
        </div>
      </div>

      {/* Inline follow button */}
      <div className="flex items-center pr-4">
        <button
          onClick={handleFollow}
          disabled={status === 'pending'}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: status === 'pending'
              ? 'var(--surface-2)'
              : 'color-mix(in srgb, var(--accent-gold) 18%, transparent)',
            color: status === 'pending' ? 'var(--text-muted)' : 'var(--accent-gold)',
            border: '1px solid color-mix(in srgb, var(--accent-gold) 30%, transparent)',
          }}
        >
          {status === 'pending' ? 'Pending' : 'Follow'}
        </button>
      </div>
    </motion.div>
  )
}
