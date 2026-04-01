'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Users, AlertTriangle, Plus } from 'lucide-react'
import { getStyleFamily } from '@/lib/beerStyleColors'
import { getStyleHex } from '@/lib/session-colors'
import { UserAvatar } from '@/components/ui/UserAvatar'
import type { BeerLog } from '@/types/database'

type Participant = {
  id: string
  user_id: string
  status: string
  profile?: {
    id?: string
    display_name: string | null
    username: string
    avatar_url: string | null
  } | null
}

type FriendResult = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

interface TapWallSessionTrayProps {
  breweryName: string
  homeMode: boolean
  beerLogs: BeerLog[]
  totalPours: number
  elapsed: string
  // End/cancel confirm state
  showEndConfirm: boolean
  setShowEndConfirm: (v: boolean) => void
  showCancelConfirm: boolean
  setShowCancelConfirm: (v: boolean) => void
  ending: boolean
  cancelling: boolean
  onEndSession: () => void
  onCancelSession: () => void
  // Participants / invite
  participants: Participant[]
  showInvite: boolean
  setShowInvite: (v: boolean) => void
  friendSearch: string
  setFriendSearch: (v: string) => void
  friendResults: FriendResult[]
  inviting: string | null
  onInvite: (friendId: string) => void
  // Session note
  sessionNote: string
  setSessionNote: (v: string) => void
  showNoteInput: boolean
  setShowNoteInput: (v: boolean) => void
}

export function TapWallSessionTray({
  breweryName,
  homeMode,
  beerLogs,
  totalPours,
  elapsed,
  showEndConfirm,
  setShowEndConfirm,
  showCancelConfirm,
  setShowCancelConfirm,
  ending,
  cancelling,
  onEndSession,
  onCancelSession,
  participants,
  showInvite,
  setShowInvite,
  friendSearch,
  setFriendSearch,
  friendResults,
  inviting,
  onInvite,
  sessionNote,
  setSessionNote,
  showNoteInput,
  setShowNoteInput,
}: TapWallSessionTrayProps) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 px-4 pb-safe pt-3"
      style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}
    >
      {/* End session confirmation */}
      <AnimatePresence>
        {showEndConfirm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pb-3">
              <p className="text-sm font-medium text-center mb-3" style={{ color: 'var(--text-primary)' }}>
                {homeMode ? 'Finish your home session?' : `End your session at ${breweryName}?`}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEndConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={onEndSession}
                  disabled={ending}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
                  style={{ background: 'var(--accent-gold)', color: 'var(--bg)' }}
                >
                  {ending ? <><Loader2 size={14} className="animate-spin" /> Ending...</> : 'End & save'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel session confirmation */}
      <AnimatePresence>
        {showCancelConfirm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pb-3">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle size={16} style={{ color: 'var(--danger)' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>
                  Cancel session?
                </p>
              </div>
              <p className="text-xs text-center mb-3" style={{ color: 'var(--text-muted)' }}>
                All {totalPours} beer {totalPours === 1 ? 'log' : 'logs'} and notes will be permanently deleted. No XP will be awarded.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                >
                  Keep going
                </button>
                <button
                  onClick={onCancelSession}
                  disabled={cancelling}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
                  style={{ background: 'var(--danger)', color: '#fff' }}
                >
                  {cancelling ? <><Loader2 size={14} className="animate-spin" /> Cancelling...</> : 'Yes, cancel'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drinking With */}
      <div className="py-1">
        <div className="flex items-center gap-2">
          {participants.filter((p) => p.status === 'accepted').map((p) => (
            <div key={p.id} title={p.profile?.display_name ?? p.profile?.username ?? ''}>
              <UserAvatar
                profile={{
                  display_name: p.profile?.display_name ?? p.profile?.username ?? '',
                  avatar_url: p.profile?.avatar_url ?? null,
                  username: p.profile?.username ?? '',
                }}
                size="xs"
              />
            </div>
          ))}
          {participants.filter((p) => p.status === 'pending').length > 0 && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              +{participants.filter((p) => p.status === 'pending').length} pending
            </span>
          )}
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors"
            style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            <Users size={11} />
            {participants.length > 0 ? 'Invite more' : 'Invite friends'}
          </button>
        </div>

        <AnimatePresence>
          {showInvite && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-2"
            >
              <input
                type="text"
                value={friendSearch}
                onChange={(e) => setFriendSearch(e.target.value)}
                placeholder="Search friends to invite..."
                className="w-full px-3 py-2 rounded-xl text-sm border outline-none"
                style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
              {friendResults.length > 0 && (
                <div className="mt-1 rounded-xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  {friendResults.map((friend) => {
                    const alreadyInvited = participants.some((p) => p.user_id === friend.id)
                    return (
                      <button
                        key={friend.id}
                        onClick={() => !alreadyInvited && onInvite(friend.id)}
                        disabled={alreadyInvited || inviting === friend.id}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors disabled:opacity-60"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        <div className="flex items-center gap-2">
                          <UserAvatar
                            profile={{ display_name: friend.display_name ?? friend.username, avatar_url: friend.avatar_url, username: friend.username }}
                            size="xs"
                          />
                          <span>{friend.display_name ?? friend.username}</span>
                        </div>
                        {alreadyInvited ? (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Invited</span>
                        ) : inviting === friend.id ? (
                          <Loader2 size={12} className="animate-spin" style={{ color: 'var(--accent-gold)' }} />
                        ) : (
                          <Plus size={14} style={{ color: 'var(--accent-gold)' }} />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Session note */}
      <AnimatePresence>
        {showNoteInput ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden py-1"
          >
            <input
              type="text"
              value={sessionNote}
              onChange={(e) => setSessionNote(e.target.value)}
              placeholder="Add a note... (date night, solo Friday)"
              className="w-full px-3 py-2 rounded-xl text-sm border outline-none"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </motion.div>
        ) : (
          <button
            onClick={() => setShowNoteInput(true)}
            className="text-xs py-1"
            style={{ color: 'var(--text-muted)' }}
          >
            + Add a note
          </button>
        )}
      </AnimatePresence>

      {/* Bottom bar: cancel · dot strip · end session */}
      <div className="flex items-center justify-between gap-3 py-2">
        <button
          onClick={() => { setShowCancelConfirm(true); setShowEndConfirm(false) }}
          className="text-xs px-2 py-1.5 rounded-lg transition-colors flex-shrink-0"
          style={{ color: 'var(--text-muted)' }}
        >
          Cancel
        </button>

        {/* Beer color dot strip + count */}
        <div className="flex items-center gap-2 flex-1 justify-center min-w-0">
          {beerLogs.length > 0 && (
            <div className="flex flex-shrink-0">
              {beerLogs.slice(0, 6).map((log, i) => {
                const family = getStyleFamily((log.beer as { style?: string | null } | undefined)?.style)
                const hex = getStyleHex(family)
                return (
                  <span
                    key={log.id}
                    className="block w-2.5 h-2.5 rounded-full"
                    style={{
                      background: hex.primary,
                      border: '1.5px solid var(--surface)',
                      marginLeft: i > 0 ? '-3px' : 0,
                      position: 'relative',
                      zIndex: 6 - i,
                    }}
                  />
                )
              })}
            </div>
          )}
          <p className="text-xs font-mono truncate" style={{ color: 'var(--text-muted)' }}>
            {totalPours} {totalPours === 1 ? 'beer' : 'beers'} · {elapsed}
          </p>
        </div>

        <button
          onClick={() => { setShowEndConfirm(true); setShowCancelConfirm(false) }}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition-all flex-shrink-0"
          style={{
            background: beerLogs.length > 0
              ? getStyleHex(getStyleFamily((beerLogs[0].beer as { style?: string | null } | undefined)?.style)).primary
              : 'var(--accent-gold)',
            color: '#fff',
            transition: 'background 0.4s ease',
          }}
        >
          End session
        </button>
      </div>
    </div>
  )
}
