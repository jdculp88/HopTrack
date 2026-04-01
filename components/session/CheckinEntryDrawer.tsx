'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, MapPin, Loader2, ChevronRight, Home, Clock } from 'lucide-react'
import { FullScreenDrawer } from '@/components/ui/Modal'
import { generateGradientFromString } from '@/lib/utils'
import { useSession } from '@/hooks/useSession'
import { useToast } from '@/components/ui/Toast'
import type { Session, Brewery } from '@/types/database'

interface CheckinEntryDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSessionStarted: (session: Session, breweryName: string) => void
  onHomeSessionStarted?: (session: Session) => void
  preselectedBrewery?: Brewery | null
}

const SPRING = { type: 'spring' as const, stiffness: 400, damping: 30 }

export default function CheckinEntryDrawer({ isOpen, onClose, onSessionStarted, onHomeSessionStarted, preselectedBrewery }: CheckinEntryDrawerProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Brewery[]>([])
  const [searching, setSearching] = useState(false)
  const [nearbyBreweries, setNearbyBreweries] = useState<Brewery[]>([])
  const [recentBreweries, setRecentBreweries] = useState<Brewery[]>([])
  const [autoDetected, setAutoDetected] = useState<Brewery | null>(null)
  const [locationError, setLocationError] = useState(false)
  // Unified loading state: brewery id, 'home', or null
  const [startingSession, setStartingSession] = useState<string | null>(null)
  const [startError, setStartError] = useState<string | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchAbortRef = useRef<AbortController | null>(null)
  const { startSession, startHomeSession } = useSession()
  const { error: toastError } = useToast()

  // Load recent breweries from localStorage
  const loadRecentBreweries = useCallback(() => {
    try {
      const stored = localStorage.getItem('hoptrack_recent_breweries')
      if (stored) {
        const parsed: Brewery[] = JSON.parse(stored)
        setRecentBreweries(parsed.slice(0, 3))
      }
    } catch {
      // Silent fail — localStorage may be unavailable
    }
  }, [])

  // Save brewery to recents
  const saveToRecents = useCallback((brewery: Brewery) => {
    try {
      const stored = localStorage.getItem('hoptrack_recent_breweries')
      const existing: Brewery[] = stored ? JSON.parse(stored) : []
      // Remove duplicate, prepend, keep max 5
      const updated = [brewery, ...existing.filter(b => b.id !== brewery.id)].slice(0, 5)
      localStorage.setItem('hoptrack_recent_breweries', JSON.stringify(updated))
    } catch {
      // Silent fail
    }
  }, [])

  async function detectNearbyBreweries() {
    if (!navigator.geolocation) {
      setLocationError(true)
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const res = await fetch(`/api/breweries?lat=${latitude}&lng=${longitude}&limit=5`)
          const data = await res.json()
          const nearby: Brewery[] = data.breweries ?? []
          setNearbyBreweries(nearby)
          if (nearby.length === 1) setAutoDetected(nearby[0])
        } catch {
          setLocationError(true)
        }
      },
      () => {
        setLocationError(true)
      }
    )
  }

  // Reset + detect on open
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery('')
      setResults([])
      setStartingSession(null)
      setStartError(null)
      setShowSearch(false)
      setAutoDetected(null)
      setLocationError(false)
      loadRecentBreweries()
      if (!preselectedBrewery) {
        detectNearbyBreweries()
      }
    } else {
      // Cancel any in-flight search when drawer closes
      searchAbortRef.current?.abort()
    }
  }, [isOpen, preselectedBrewery, loadRecentBreweries])

  // Focus input when search is shown
  useEffect(() => {
    if (showSearch) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [showSearch])

  // Debounced search with AbortController
  useEffect(() => {
    if (!query.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([])
      setSearching(false)
      return
    }

    const timer = setTimeout(async () => {
      // Cancel previous in-flight request
      searchAbortRef.current?.abort()
      const controller = new AbortController()
      searchAbortRef.current = controller

      setSearching(true)
      try {
        const res = await fetch(
          `/api/breweries?q=${encodeURIComponent(query)}&limit=10`,
          { signal: controller.signal }
        )
        const data = await res.json()
        setResults(data.breweries ?? [])
      } catch (err: any) {
        // Ignore abort errors — that's intentional cancellation
        if (err?.name !== 'AbortError') {
          setResults([])
        }
      }
      setSearching(false)
    }, 300)

    return () => {
      clearTimeout(timer)
      searchAbortRef.current?.abort()
    }
  }, [query])

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => { searchAbortRef.current?.abort() }
  }, [])

  async function handleSelectBrewery(brewery: Brewery) {
    setStartingSession(brewery.id)
    setStartError(null)
    const session = await startSession(brewery.id, true)
    if (!session) {
      setStartingSession(null)
      setStartError('Could not start session. Please try again.')
      toastError('Failed to start session')
      return
    }
    // Haptic confirmation on session start
    navigator.vibrate?.(50)
    saveToRecents(brewery)
    onSessionStarted(session, brewery.name)
    onClose()
  }

  async function handleStartHomeSession() {
    setStartingSession('home')
    setStartError(null)
    const session = await startHomeSession()
    if (!session) {
      setStartingSession(null)
      setStartError('Could not start session. Please try again.')
      toastError('Failed to start session')
      return
    }
    onHomeSessionStarted?.(session)
    onClose()
  }

  const isStarting = startingSession !== null
  const displayList = query.trim() ? results : nearbyBreweries

  return (
    <FullScreenDrawer open={isOpen} onClose={onClose} aria-label="Start a session">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-xl transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>
        <h1 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
          Start Session
        </h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Quick-start: At Home pill — always visible unless preselected */}
        {!preselectedBrewery && (
          <button
            onClick={handleStartHomeSession}
            disabled={isStarting}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all disabled:opacity-60"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--surface-2)' }}
            >
              {startingSession === 'home' ? (
                <Loader2 size={15} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
              ) : (
                <Home size={15} style={{ color: 'var(--text-muted)' }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                Drinking at home
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Log beers without a brewery
              </p>
            </div>
            <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
          </button>
        )}

        {/* Start error */}
        <AnimatePresence>
          {startError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="px-4 py-3 rounded-xl text-sm"
              style={{
                background: 'color-mix(in srgb, var(--danger) 15%, transparent)',
                border: '1px solid color-mix(in srgb, var(--danger) 30%, transparent)',
                color: 'var(--danger)',
              }}
            >
              {startError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pre-selected brewery — arrived from brewery page CTA */}
        {preselectedBrewery && (
          <BreweryConfirmCard
            brewery={preselectedBrewery}
            label="You're visiting here"
            startingSession={startingSession}
            onSelect={handleSelectBrewery}
          />
        )}

        {/* Single auto-detected brewery — big confirm card */}
        <AnimatePresence>
          {!preselectedBrewery && autoDetected && !showSearch && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              <BreweryConfirmCard
                brewery={autoDetected}
                label="Detected nearby"
                startingSession={startingSession}
                onSelect={handleSelectBrewery}
              />
              <button
                onClick={() => { setAutoDetected(null); setShowSearch(true) }}
                className="w-full py-2.5 text-sm font-medium transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                Not here? Search instead
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search mode — show when: no preselected, no auto-detected, showSearch forced, or 2+ nearby */}
        {!preselectedBrewery && (!autoDetected || showSearch) && (
          <div className="space-y-4">
            {!autoDetected && !showSearch && (
              <div>
                <h2 className="font-sans text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Where are you?
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Find or search for a brewery.
                </p>
              </div>
            )}

            {locationError && !showSearch && (
              <div
                className="flex items-center gap-2.5 px-4 py-3 rounded-2xl"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                }}
              >
                <MapPin size={14} style={{ color: 'var(--text-muted)' }} className="flex-shrink-0" />
                <p className="text-sm flex-1" style={{ color: 'var(--text-secondary)' }}>
                  Location unavailable — search for your brewery below.
                </p>
                <button
                  onClick={() => {
                    setLocationError(false)
                    detectNearbyBreweries()
                  }}
                  className="text-xs font-medium px-3 py-1.5 rounded-xl flex-shrink-0 transition-colors"
                  style={{
                    background: 'color-mix(in srgb, var(--accent-gold) 15%, transparent)',
                    color: 'var(--accent-gold)',
                    border: '1px solid color-mix(in srgb, var(--accent-gold) 30%, transparent)',
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Recent breweries — show before search when no query and no nearby results yet */}
            {!query.trim() && recentBreweries.length > 0 && nearbyBreweries.length === 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                  <p className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Recent
                  </p>
                </div>
                {recentBreweries.map((brewery) => (
                  <BreweryRow
                    key={`recent-${brewery.id}`}
                    brewery={brewery}
                    startingSession={startingSession}
                    onSelect={handleSelectBrewery}
                  />
                ))}
              </div>
            )}

            {/* Search input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              </div>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search breweries..."
                className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none transition-colors"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-gold)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                }}
              />
            </div>

            {/* Results list */}
            <div className="space-y-2">
              {!query.trim() && nearbyBreweries.length > 1 && (
                <div className="flex items-center gap-2">
                  <MapPin size={12} style={{ color: 'var(--accent-gold)' }} />
                  <p className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Nearby
                  </p>
                </div>
              )}
              {displayList.map((brewery) => (
                <BreweryRow
                  key={brewery.id}
                  brewery={brewery}
                  startingSession={startingSession}
                  onSelect={handleSelectBrewery}
                />
              ))}
              {query.trim() && results.length === 0 && !searching && (
                <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>
                  No breweries found for &ldquo;{query}&rdquo;
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </FullScreenDrawer>
  )
}

/* ────────────────────────────────────────────
 * Sub-components — extracted to reduce JSX nesting
 * ──────────────────────────────────────────── */

function BreweryConfirmCard({
  brewery,
  label,
  startingSession,
  onSelect,
}: {
  brewery: Brewery
  label: string
  startingSession: string | null
  onSelect: (b: Brewery) => void
}) {
  const isLoading = startingSession === brewery.id
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <MapPin size={14} style={{ color: 'var(--accent-gold)' }} />
        <p className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--accent-gold)' }}>
          {label}
        </p>
      </div>

      <div
        className="rounded-2xl p-5 space-y-4"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex-shrink-0"
            style={{ background: generateGradientFromString(brewery.name) }}
          />
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
              {brewery.name}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {brewery.city}{brewery.state ? `, ${brewery.state}` : ''}
            </p>
          </div>
        </div>

        <button
          onClick={() => onSelect(brewery)}
          disabled={isLoading}
          className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all disabled:opacity-70"
          style={{
            background: 'linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-amber) 100%)',
            color: 'var(--bg)',
          }}
        >
          {isLoading ? (
            <><Loader2 size={18} className="animate-spin" /> Starting...</>
          ) : (
            <>Start your visit <ChevronRight size={18} /></>
          )}
        </button>
      </div>
    </motion.div>
  )
}

function BreweryRow({
  brewery,
  startingSession,
  onSelect,
}: {
  brewery: Brewery
  startingSession: string | null
  onSelect: (b: Brewery) => void
}) {
  const isLoading = startingSession === brewery.id
  return (
    <button
      type="button"
      onClick={() => onSelect(brewery)}
      disabled={isLoading}
      className="w-full text-left disabled:opacity-60"
    >
      <motion.div
        whileTap={{ scale: 0.98 }}
        transition={SPRING}
        className="flex items-center gap-4 p-4 rounded-2xl transition-all"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
        }}
      >
        <div
          className="w-12 h-12 rounded-xl flex-shrink-0"
          style={{ background: generateGradientFromString(brewery.name) }}
        />
        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {brewery.name}
          </p>
          <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>
            {brewery.city}{brewery.state ? `, ${brewery.state}` : ''}
            {brewery.brewery_type && ` \u00b7 ${brewery.brewery_type}`}
          </p>
        </div>
        {isLoading ? (
          <Loader2 size={16} className="animate-spin flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
        ) : (
          <ChevronRight size={16} className="flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
        )}
      </motion.div>
    </button>
  )
}
