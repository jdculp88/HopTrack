'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Beer, ChevronRight } from 'lucide-react'
import { Session } from '@/types/database'
import { InviteFriendsButton } from '@/components/session/InviteFriendsButton'
import type { SessionParticipant } from '@/types/database'

interface ActiveSessionBannerProps {
  session: Session
  breweryName: string
  onTap: () => void
  isOwner?: boolean
  participants?: SessionParticipant[]
}

function getTimeLabel(startedAt: Date): string {
  const elapsedMs = Date.now() - startedAt.getTime()
  const elapsedMins = Math.floor(elapsedMs / 60000)
  const elapsedHours = Math.floor(elapsedMins / 60)
  const remainingMins = elapsedMins % 60
  return elapsedHours > 0 ? `${elapsedHours}h ${remainingMins}m` : `${elapsedMins}m`
}

export default function ActiveSessionBanner({ session, breweryName, onTap, isOwner = true, participants }: ActiveSessionBannerProps) {
  const beerCount = session.beer_logs?.length || 0
  const startedAt = new Date(session.started_at)
  const [timeLabel, setTimeLabel] = useState(() => getTimeLabel(startedAt))

  useEffect(() => {
    const interval = setInterval(() => setTimeLabel(getTimeLabel(startedAt)), 60000)
    return () => clearInterval(interval)
  }, [startedAt])

  const acceptedParticipants = (participants ?? []).filter((p) => p.status === 'accepted')
  const participantCount = acceptedParticipants.length
  const groupLabel = participantCount > 0
    ? `You + ${participantCount} ${participantCount === 1 ? 'friend' : 'friends'}`
    : null

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 60, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 px-3 pb-2"
    >
      <motion.div
        className="rounded-2xl overflow-visible"
        style={{
          background: 'linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-amber) 100%)',
          boxShadow: '0 4px 20px color-mix(in srgb, var(--accent-gold) 40%, transparent)',
        }}
      >
        <div className="flex items-center justify-between px-4 py-2.5">
          {/* Left — tap to open recap */}
          <button onClick={onTap} className="flex items-center gap-2.5 flex-1 text-left min-w-0">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-black/20 flex-shrink-0">
              <Beer size={14} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-black/80 leading-none mb-0.5 font-mono uppercase tracking-wide">
                Active Session
              </p>
              <p className="text-sm font-bold text-black leading-none truncate">
                {breweryName}
              </p>
              {groupLabel && (
                <p className="text-[10px] text-black/70 leading-none mt-0.5 font-medium">
                  {groupLabel}
                </p>
              )}
            </div>
          </button>

          {/* Right — invite + stats */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isOwner && (
              <div onClick={(e) => e.stopPropagation()}>
                <InviteFriendsButton
                  sessionId={session.id}
                  isOwner={isOwner}
                  participants={participants}
                  showActivityPulse={true}
                />
              </div>
            )}
            <div className="text-right">
              <p className="text-xs text-black/70 leading-none">
                {beerCount} {beerCount === 1 ? 'beer' : 'beers'} · {timeLabel}
              </p>
            </div>
            <button onClick={onTap}>
              <ChevronRight size={18} className="text-black/70" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
