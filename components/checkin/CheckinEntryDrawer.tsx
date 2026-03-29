'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, MapPin, Loader2, ChevronRight, Home } from 'lucide-react'
import { FullScreenDrawer } from '@/components/ui/Modal'
import { generateGradientFromString } from '@/lib/utils'
import { useSession } from '@/hooks/useSession'
import type { Session, Brewery } from '@/types/database'

interface CheckinEntryDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSessionStarted: (session: Session, breweryName: string) => void
  onHomeSessionStarted?: (session: Session) => void
  preselectedBrewery?: Brewery | null
}

export default function CheckinEntryDrawer({ isOpen, onClose, onSessionStarted, onHomeSessionStarted, preselectedBrewery }: CheckinEntryDrawerProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Brewery[]>([])
  const [searching, setSearching] = useState(false)
  const [nearbyBreweries, setNearbyBreweries] = useState<Brewery[]>([])
  const [autoDetected, setAutoDetected] = useState<Brewery | null>(null)
  const [locationError, setLocationError] = useState(false)
  const [startingFor, setStartingFor] = useState<string | null>(null)
  const [startingHome, setStartingHome] = useState(false)
  const [startError, setStartError] = useState<string | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { startSession, startHomeSession } = useSession()

  // Reset + detect on open
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setResults([])
      setStartingFor(null)
      setStartError(null)
      setShowSearch(false)
      // If a brewery was pre-selected (e.g. from brewery page CTA), skip location detection
      if (!preselectedBrewery) {
        detectNearbyBreweries()
      }
    }
  }, [isOpen, preselectedBrewery])

  // Focus input when search is shown
  useEffect(() => {
    if (showSearch) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [showSearch])

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
          const results: Brewery[] = data.breweries ?? []
          setNearbyBreweries(results)
          if (results.length === 1) setAutoDetected(results[0])
        } catch {
          setLocationError(true)
        }
      },
      () => {
        setLocationError(true)
      }
    )
  }

  // Debounced search
  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/breweries?q=${encodeURIComponent(query)}&limit=10`)
        const data = await res.json()
        setResults(data.breweries ?? [])
      } catch {
        setResults([])
      }
      setSearching(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  async function handleSelectBrewery(brewery: Brewery) {
    setStartingFor(brewery.id)
    setStartError(null)
    const session = await startSession(brewery.id, true)
    if (!session) {
      setStartingFor(null)
      setStartError('Could not start session. Please try again.')
      return
    }
    onSessionStarted(session, brewery.name)
    onClose()
  }

  async function handleStartHomeSession() {
    setStartingHome(true)
    setStartError(null)
    const session = await startHomeSession()
    if (!session) {
      setStartingHome(false)
      setStartError('Could not start session. Please try again.')
      return
    }
    onHomeSessionStarted?.(session)
    onClose()
  }

  const displayList = query.trim() ? results : nearbyBreweries

  return (
    <FullScreenDrawer open={isOpen} onClose={onClose}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-xl transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <X size={20} />
        </button>
        <h1 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
          Start Session
        </h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
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
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <MapPin size={14} style={{ color: 'var(--accent-gold)' }} />
              <p className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--accent-gold)' }}>
                You&rsquo;re visiting here
              </p>
            </div>

            <div
              className="rounded-2xl p-5 space-y-4"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex-shrink-0"
                  style={{ background: generateGradientFromString(preselectedBrewery.name) }}
                />
                <div className="flex-1 min-w-0">
                  <h2 className="font-display text-xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {preselectedBrewery.name}
                  </h2>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {preselectedBrewery.city}{preselectedBrewery.state ? `, ${preselectedBrewery.state}` : ''}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleSelectBrewery(preselectedBrewery)}
                disabled={startingFor === preselectedBrewery.id}
                className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-amber) 100%)',
                  color: 'var(--bg)',
                }}
              >
                {startingFor === preselectedBrewery.id ? (
                  <><Loader2 size={18} className="animate-spin" /> Starting...</>
                ) : (
                  <>Start your visit <ChevronRight size={18} /></>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Single auto-detected brewery — big confirm card */}
        <AnimatePresence>
          {!preselectedBrewery && autoDetected && !showSearch && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <MapPin size={14} style={{ color: 'var(--accent-gold)' }} />
                <p className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--accent-gold)' }}>
                  Detected nearby
                </p>
              </div>

              <div
                className="rounded-2xl p-5 space-y-4"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex-shrink-0"
                    style={{ background: generateGradientFromString(autoDetected.name) }}
                  />
                  <div className="flex-1 min-w-0">
                    <h2 className="font-display text-xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                      {autoDetected.name}
                    </h2>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {autoDetected.city}{autoDetected.state ? `, ${autoDetected.state}` : ''}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectBrewery(autoDetected)}
                  disabled={startingFor === autoDetected.id}
                  className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-amber) 100%)',
                    color: 'var(--bg)',
                  }}
                >
                  {startingFor === autoDetected.id ? (
                    <><Loader2 size={18} className="animate-spin" /> Starting...</>
                  ) : (
                    <>Start your visit <ChevronRight size={18} /></>
                  )}
                </button>
              </div>

              <button
                onClick={() => { setAutoDetected(null); setShowSearch(true) }}
                className="w-full py-3 text-sm font-medium transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                Not here? Search →
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search mode — show when: no preselected, no auto-detected, showSearch forced, or 2+ nearby */}
        {!preselectedBrewery && (!autoDetected || showSearch) && (
          <div className="space-y-5">
            {!autoDetected && !showSearch && (
              <div>
                <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
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
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Location unavailable — search for your brewery below.
                </p>
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
                <p className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Nearby
                </p>
              )}
              {displayList.map((brewery) => (
                <button
                  key={brewery.id}
                  type="button"
                  onClick={() => handleSelectBrewery(brewery)}
                  disabled={startingFor === brewery.id}
                  className="w-full text-left disabled:opacity-60"
                >
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
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
                        {brewery.brewery_type && ` · ${brewery.brewery_type}`}
                      </p>
                    </div>
                    {startingFor === brewery.id ? (
                      <Loader2 size={16} className="animate-spin flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    ) : (
                      <ChevronRight size={16} className="flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    )}
                  </motion.div>
                </button>
              ))}
              {query.trim() && results.length === 0 && !searching && (
                <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>
                  No breweries found for &ldquo;{query}&rdquo;
                </p>
              )}
            </div>
          </div>
        )}
        {/* Home drinking option */}
        {!preselectedBrewery && (
          <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={handleStartHomeSession}
              disabled={startingHome}
              className="w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all disabled:opacity-60"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--surface-2)' }}
              >
                {startingHome ? (
                  <Loader2 size={16} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
                ) : (
                  <Home size={16} style={{ color: 'var(--text-muted)' }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  Drinking at home
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Log beers without visiting a brewery
                </p>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
        )}
      </div>
    </FullScreenDrawer>
  )
}
