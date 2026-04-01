'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Beer, ChevronRight } from 'lucide-react'
import { Session, BeerLog } from '@/types/database'
import { InviteFriendsButton } from '@/components/session/InviteFriendsButton'
import { spring } from '@/lib/animation'
import { buildMeshGradient, getBubbleGlow } from '@/lib/session-colors'
import type { SessionParticipant } from '@/types/database'

interface ActiveSessionBannerProps {
  session: Session
  breweryName: string
  beerLogs?: BeerLog[]
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

export default function ActiveSessionBanner({ session, breweryName, beerLogs = [], onTap, isOwner = true, participants }: ActiveSessionBannerProps) {
  const beerCount = beerLogs.reduce((sum, l) => sum + (l.quantity ?? 1), 0)
  const lastBeer = beerLogs.length > 0 ? beerLogs[beerLogs.length - 1] : null
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

  const meshGradient = buildMeshGradient(beerLogs)
  const bubbleGlow = getBubbleGlow(beerLogs)

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 60, opacity: 0 }}
      transition={spring.default}
      className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 px-3 pb-2"
    >
      <motion.div
        className="rounded-2xl overflow-visible"
        style={{
          background: meshGradient,
          boxShadow: bubbleGlow,
          transition: 'background 0.6s ease, box-shadow 0.6s ease',
        }}
      >
        <div className="flex items-center justify-between px-4 py-2.5">
          {/* Left — tap to open tap wall */}
          <button onClick={onTap} className="flex items-center gap-2.5 flex-1 min-w-0 text-left overflow-hidden">
            <div className="relative flex-shrink-0">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-black/20">
                <Beer size={14} className="text-white" />
              </div>
              {/* Live indicator */}
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border border-black/20 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-xs font-semibold text-black/80 leading-none mb-0.5 font-mono uppercase tracking-wide">
                Active Session
              </p>
              <p className="text-sm font-bold text-black leading-none truncate">
                {breweryName}
              </p>
              {lastBeer?.beer && (
                <p className="text-[10px] text-black/70 leading-none mt-0.5 font-medium truncate">
                  Last: {lastBeer.beer.name}
                </p>
              )}
              {!lastBeer?.beer && groupLabel && (
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
