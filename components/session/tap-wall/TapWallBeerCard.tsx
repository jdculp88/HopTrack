'use client'

import { Check, Beer, Loader2 } from 'lucide-react'
import { getStyleFamily } from '@/lib/beerStyleColors'
import { getStyleHex } from '@/lib/session-colors'
import { BeerStyleBadge } from '@/components/ui/BeerStyleBadge'
import { formatABV } from '@/lib/utils'

export interface TapWallBeer {
  id: string
  name: string
  style: string | null
  abv: number | null
  avg_rating: number | null
}

interface QtyStepperProps {
  qty: number
  onInc: () => void
  onDec: () => void
  incrementing: boolean
  decrementing: boolean
  primaryHex: string
}

function QtyStepper({ qty, onInc, onDec, incrementing, decrementing, primaryHex }: QtyStepperProps) {
  return (
    <div
      className="flex items-center rounded-xl overflow-hidden"
      style={{
        background: primaryHex + '0D',
        border: `1px solid ${primaryHex}22`,
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onDec() }}
        disabled={decrementing}
        className="w-8 h-8 flex items-center justify-center text-base font-medium transition-colors disabled:opacity-40"
        style={{ color: primaryHex }}
        title={qty <= 1 ? 'Remove' : 'One less'}
      >
        {decrementing ? <Loader2 size={11} className="animate-spin" /> : '−'}
      </button>
      <span
        className="min-w-6 text-center text-sm font-bold font-mono"
        style={{
          color: primaryHex,
          borderLeft: `1px solid ${primaryHex}15`,
          borderRight: `1px solid ${primaryHex}15`,
          lineHeight: '2rem',
        }}
      >
        {qty}
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); onInc() }}
        disabled={incrementing}
        className="w-8 h-8 flex items-center justify-center text-base font-medium transition-colors disabled:opacity-40"
        style={{ color: primaryHex }}
        title="Had another"
      >
        {incrementing ? <Loader2 size={11} className="animate-spin" /> : '+'}
      </button>
    </div>
  )
}

export interface TapWallBeerCardProps {
  beer: TapWallBeer
  logged: boolean
  quantity: number
  incrementing: boolean
  decrementing: boolean
  onIncrement: () => void
  onDecrement: () => void
  loading: boolean
  onLog: () => void
}

export function TapWallBeerCard({
  beer,
  logged,
  quantity,
  incrementing,
  decrementing,
  onIncrement,
  onDecrement,
  loading,
  onLog,
}: TapWallBeerCardProps) {
  const family = getStyleFamily(beer.style)
  const hex = getStyleHex(family)

  return (
    <div
      onClick={!logged ? onLog : undefined}
      className="relative rounded-[14px] overflow-hidden transition-all"
      style={{
        border: `1.5px solid ${logged ? hex.primary + '30' : 'var(--border)'}`,
        background: logged
          ? `radial-gradient(ellipse at 85% 20%, ${hex.primary}0A 0%, transparent 50%), var(--surface)`
          : 'var(--surface)',
        boxShadow: logged ? `0 2px 10px ${hex.primary}10` : undefined,
        cursor: logged ? 'default' : 'pointer',
      }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{
          background: logged ? hex.primary : 'transparent',
          transition: 'background 0.3s',
        }}
      />

      <div className="pl-5 pr-4 py-3">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              background: logged ? hex.primary : 'var(--surface-2)',
              border: `1px solid ${logged ? hex.primary : 'var(--border)'}`,
            }}
          >
            {logged ? (
              <Check size={14} className="text-white" />
            ) : (
              <Beer size={15} style={{ color: hex.primary, opacity: 0.55 }} />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold text-sm leading-tight truncate" style={{ color: 'var(--text-primary)' }}>
              {beer.name}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {beer.style && (
                <BeerStyleBadge style={beer.style} size="xs" />
              )}
              {beer.abv != null && (
                <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  {formatABV(beer.abv)}
                </span>
              )}
              {beer.avg_rating != null && (
                <span className="text-[11px] font-mono" style={{ color: logged ? hex.primary : 'var(--text-muted)' }}>
                  ★ {beer.avg_rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>

          {/* Action */}
          <div className="flex-shrink-0">
            {logged ? (
              <QtyStepper
                qty={quantity}
                onInc={onIncrement}
                onDec={onDecrement}
                incrementing={incrementing}
                decrementing={decrementing}
                primaryHex={hex.primary}
              />
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onLog() }}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-60 flex items-center gap-1"
                style={{
                  background: hex.primary,
                  color: '#fff',
                  boxShadow: `0 2px 8px ${hex.primary}28`,
                }}
              >
                {loading ? <Loader2 size={12} className="animate-spin" /> : "I'm having this"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
