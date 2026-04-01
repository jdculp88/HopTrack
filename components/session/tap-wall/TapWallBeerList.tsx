'use client'

import { Skeleton } from '@/components/ui/SkeletonLoader'
import { TapWallBeerCard, type TapWallBeer } from './TapWallBeerCard'
import { TapWallEmptyState } from './TapWallEmptyState'
import type { BeerLog } from '@/types/database'

interface TapWallBeerListProps {
  beers: TapWallBeer[]
  beerLoading: boolean
  query: string
  homeMode: boolean
  beerLogs: BeerLog[]
  loggingBeer: string | null
  incrementingLog: string | null
  decrementingLog: string | null
  onLogBeer: (beer: TapWallBeer) => void
  onIncrement: (log: BeerLog) => void
  onDecrement: (log: BeerLog) => void
}

function BeerSkeletonRow() {
  return (
    <div
      className="flex items-center gap-3 p-4 rounded-2xl"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-3/5 rounded" />
        <Skeleton className="h-3 w-2/5 rounded" />
      </div>
      <Skeleton className="w-20 h-9 rounded-xl flex-shrink-0" />
    </div>
  )
}

export function TapWallBeerList({
  beers,
  beerLoading,
  query,
  homeMode,
  beerLogs,
  loggingBeer,
  incrementingLog,
  decrementingLog,
  onLogBeer,
  onIncrement,
  onDecrement,
}: TapWallBeerListProps) {
  // Build beer_id → log map
  const loggedBeerMap = new Map<string, BeerLog>()
  for (const log of beerLogs) {
    if (log.beer_id) loggedBeerMap.set(log.beer_id, log)
  }

  const filtered = query.trim()
    ? beers.filter((b) => b.name.toLowerCase().includes(query.toLowerCase()))
    : beers

  const loggedBeers = filtered.filter((b) => loggedBeerMap.has(b.id))
  const unloggedBeers = filtered.filter((b) => !loggedBeerMap.has(b.id))

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-32 space-y-2">
      {beerLoading ? (
        <>
          {[...Array(5)].map((_, i) => <BeerSkeletonRow key={i} />)}
        </>
      ) : homeMode && !query.trim() ? (
        <TapWallEmptyState variant="home-prompt" />
      ) : beers.length === 0 && !homeMode ? (
        <TapWallEmptyState variant="no-tap-list" />
      ) : (
        <>
          {/* Already had this session */}
          {loggedBeers.length > 0 && (
            <>
              <div className="flex items-center gap-2 pt-2 pb-1">
                <p className="text-[10.5px] font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Already Had
                </p>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>
              {loggedBeers.map((beer) => {
                const log = loggedBeerMap.get(beer.id)!
                return (
                  <TapWallBeerCard
                    key={beer.id}
                    beer={beer}
                    logged
                    quantity={log.quantity ?? 1}
                    incrementing={incrementingLog === log.id}
                    decrementing={decrementingLog === log.id}
                    onIncrement={() => onIncrement(log)}
                    onDecrement={() => onDecrement(log)}
                    loading={false}
                    onLog={() => {}}
                  />
                )
              })}
              {unloggedBeers.length > 0 && (
                <div className="flex items-center gap-2 pt-3 pb-1">
                  <p className="text-[10.5px] font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    {homeMode ? 'More Results' : 'On Tap'}
                  </p>
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                </div>
              )}
            </>
          )}

          {/* Unlogged beers */}
          {unloggedBeers.map((beer) => (
            <TapWallBeerCard
              key={beer.id}
              beer={beer}
              logged={false}
              quantity={1}
              incrementing={false}
              decrementing={false}
              onIncrement={() => {}}
              onDecrement={() => {}}
              loading={loggingBeer === beer.id}
              onLog={() => onLogBeer(beer)}
            />
          ))}

          {query.trim() && filtered.length === 0 && (
            <TapWallEmptyState variant="no-results" query={query} />
          )}
        </>
      )}
    </div>
  )
}
