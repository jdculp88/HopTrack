'use client'

interface TapWallEmptyStateProps {
  variant: 'home-prompt' | 'no-tap-list' | 'no-results'
  query?: string
}

export function TapWallEmptyState({ variant, query }: TapWallEmptyStateProps) {
  if (variant === 'no-results') {
    return (
      <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>
        No beers match "{query}"
      </p>
    )
  }

  if (variant === 'home-prompt') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
        <span className="text-5xl">🍺</span>
        <p className="font-display text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          What are you having?
        </p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Search for a beer to log it.
        </p>
      </div>
    )
  }

  // no-tap-list
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
      <span className="text-5xl">🍺</span>
      <p className="font-display text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
        No beers on tap yet
      </p>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        The tap list for this brewery hasn't been added yet.
      </p>
    </div>
  )
}
