'use client'

import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import type { Session, BeerLog } from '@/types/database'

// ─── Types ─────────────────────────────────────────────────────────────────────

export type TapWallMode = 'closed' | 'peek' | 'half' | 'full'

interface SessionContextValue {
  // State
  activeSession: Session | null
  sessionBreweryName: string
  beerLogs: BeerLog[]
  sessionNote: string
  participants: Array<{ id: string; user_id: string; status: string; profile: { id: string; username: string; display_name: string | null; avatar_url: string | null } | null }>
  tapWallMode: TapWallMode

  // Session lifecycle
  setActiveSession: (session: Session | null, breweryName?: string) => void
  clearSession: () => void

  // Beer log mutations (persist across TapWallSheet mount/unmount)
  addBeerLog: (log: BeerLog) => void
  updateBeerLog: (tempId: string, updatedLog: BeerLog) => void
  removeBeerLog: (logId: string) => void
  replaceBeerLogs: (logs: BeerLog[]) => void

  // Other state setters
  setSessionNote: (note: string) => void
  setParticipants: (participants: SessionContextValue['participants']) => void
  setTapWallMode: (mode: TapWallMode) => void
  setSessionBreweryName: (name: string) => void
}

// ─── Context ───────────────────────────────────────────────────────────────────

const SessionContext = createContext<SessionContextValue | null>(null)

// ─── Provider ──────────────────────────────────────────────────────────────────

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [activeSession, setActiveSessionState] = useState<Session | null>(null)
  const [sessionBreweryName, setSessionBreweryName] = useState('')
  const [beerLogs, setBeerLogs] = useState<BeerLog[]>([])
  const [sessionNote, setSessionNote] = useState('')
  const [participants, setParticipants] = useState<SessionContextValue['participants']>([])
  const [tapWallMode, setTapWallMode] = useState<TapWallMode>('closed')

  const setActiveSession = useCallback((session: Session | null, breweryName?: string) => {
    setActiveSessionState(session)
    if (breweryName !== undefined) setSessionBreweryName(breweryName)
    if (session) {
      // Initialize beer logs from session data
      setBeerLogs(session.beer_logs ?? [])
      setSessionNote(session.note ?? '')
    }
  }, [])

  const clearSession = useCallback(() => {
    setActiveSessionState(null)
    setSessionBreweryName('')
    setBeerLogs([])
    setSessionNote('')
    setParticipants([])
    setTapWallMode('closed')
  }, [])

  const addBeerLog = useCallback((log: BeerLog) => {
    setBeerLogs(prev => [...prev, log])
  }, [])

  const updateBeerLog = useCallback((tempId: string, updatedLog: BeerLog) => {
    setBeerLogs(prev => prev.map(l => l.id === tempId ? updatedLog : l))
  }, [])

  const removeBeerLog = useCallback((logId: string) => {
    setBeerLogs(prev => prev.filter(l => l.id !== logId))
  }, [])

  const replaceBeerLogs = useCallback((logs: BeerLog[]) => {
    setBeerLogs(logs)
  }, [])

  const value = useMemo<SessionContextValue>(() => ({
    activeSession,
    sessionBreweryName,
    beerLogs,
    sessionNote,
    participants,
    tapWallMode,
    setActiveSession,
    clearSession,
    addBeerLog,
    updateBeerLog,
    removeBeerLog,
    replaceBeerLogs,
    setSessionNote,
    setParticipants,
    setTapWallMode,
    setSessionBreweryName,
  }), [
    activeSession, sessionBreweryName, beerLogs, sessionNote, participants, tapWallMode,
    setActiveSession, clearSession, addBeerLog, updateBeerLog, removeBeerLog, replaceBeerLogs,
  ])

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useSessionContext() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSessionContext must be used within a SessionProvider')
  return ctx
}
