'use client'

import { useState, useCallback } from 'react'
import { Session, BeerLog } from '@/types/database'

interface LogBeerPayload {
  beer_id?: string
  brewery_id?: string
  rating?: number
  flavor_tags?: string[]
  serving_style?: string
  comment?: string
  photo_url?: string
}

interface SessionResult {
  xpGained: number
  isFirstVisit: boolean
  beerCount: number
  newAchievements: any[]
  session?: Session | null
  beerLogs?: BeerLog[]
}

export function useSession() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startSession = useCallback(async (breweryId: string, shareToFeed = true): Promise<Session | null> => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brewery_id: breweryId, share_to_feed: shareToFeed, context: 'brewery' }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to start session'); return null }
      return data.session
    } catch {
      setError('Network error')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const startHomeSession = useCallback(async (): Promise<Session | null> => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ share_to_feed: true, context: 'home' }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to start session'); return null }
      return data.session
    } catch {
      setError('Network error')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const getActiveSession = useCallback(async (): Promise<Session | null> => {
    try {
      const res = await fetch('/api/sessions/active')
      const data = await res.json()
      if (!res.ok) return null
      return data.session
    } catch {
      return null
    }
  }, [])

  const logBeer = useCallback(async (sessionId: string, payload: LogBeerPayload): Promise<BeerLog | null> => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/sessions/${sessionId}/beers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to log beer'); return null }
      // Haptic confirmation on beer log success
      if (typeof navigator !== 'undefined') navigator.vibrate?.(30)
      return data.beerLog
    } catch {
      setError('Network error')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const updateBeerLog = useCallback(async (logId: string, updates: Partial<BeerLog>): Promise<BeerLog | null> => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/beer-logs/${logId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to update beer log'); return null }
      return data.beerLog
    } catch {
      setError('Network error')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const incrementBeerQuantity = useCallback(async (logId: string, currentQuantity: number): Promise<BeerLog | null> => {
    return updateBeerLog(logId, { quantity: currentQuantity + 1 } as any)
  }, [updateBeerLog])

  const endSession = useCallback(async (sessionId: string): Promise<SessionResult | null> => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/sessions/${sessionId}/end`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to end session'); return null }
      return data
    } catch {
      setError('Network error')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    startSession,
    startHomeSession,
    getActiveSession,
    logBeer,
    updateBeerLog,
    incrementBeerQuantity,
    endSession,
    loading,
    error,
  }
}
