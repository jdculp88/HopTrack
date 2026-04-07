'use client'

import { ChevronDown, Search } from 'lucide-react'
import { buildMeshGradient } from '@/lib/session-colors'
import type { BeerLog } from '@/types/database'

interface TapWallHeaderProps {
  breweryName: string
  elapsed: string
  beerLogs: BeerLog[]
  totalPours: number
  query: string
  onQueryChange: (q: string) => void
  onMinimize: () => void
  homeMode: boolean
}

export function TapWallHeader({
  breweryName,
  elapsed,
  beerLogs,
  totalPours,
  query,
  onQueryChange,
  onMinimize,
  homeMode,
}: TapWallHeaderProps) {
  const lastBeer = beerLogs.length > 0 ? beerLogs[beerLogs.length - 1] : null

  return (
    <>
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <button
          onClick={onMinimize}
          className="p-2 -ml-2 rounded-xl transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          title="Minimize"
        >
          <ChevronDown size={20} />
        </button>
        <div className="text-center flex-1 px-2 min-w-0">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
            <p className="font-display font-bold text-base leading-tight truncate" style={{ color: 'var(--text-primary)' }}>
              {breweryName}
            </p>
          </div>
          <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            {elapsed}
            {lastBeer?.beer && <span> · {(lastBeer.beer as { name?: string }).name}</span>}
          </p>
        </div>
        {/* Mesh gradient beer count badge */}
        <div
          className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{
            background: buildMeshGradient(beerLogs),
            transition: 'background 0.6s ease',
          }}
        >
          <span
            className="text-sm font-bold font-mono text-white"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
          >
            {totalPours}
          </span>
        </div>
      </div>

      {/* Search input */}
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }}>
            <Search size={15} />
          </div>
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={homeMode ? 'Search all beers...' : 'Search the tap list...'}
            className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-colors"
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>
    </>
  )
}
