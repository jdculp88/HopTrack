'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UserPlus } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { FeedCardWrapper } from '@/components/social/FeedCardWrapper'
import { EmojiPulse } from '@/components/social/EmojiPulse'
import { getFirstName } from '@/lib/first-name'
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

  const firstName = getFirstName(friend.displayName, friend.username)

  return (
    <FeedCardWrapper
      accentColor="var(--accent-gold)"
      icon={<UserPlus size={20} strokeWidth={1.75} />}
      backgroundStyle={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center">
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
      </div>
      <EmojiPulse itemKey={`friend-joined-${friend.userId}`} />
    </FeedCardWrapper>
  )
}
