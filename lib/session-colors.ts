/**
 * Session Color System — Sprint 97
 * Computes beer-responsive mesh gradients from active session beer logs.
 * Uses raw hex values (CSS vars can't be interpolated in gradient stops).
 * Maps to the same BeerStyleFamily keys as beerStyleColors.ts.
 */

import { getStyleFamily, BeerStyleFamily } from './beerStyleColors'
import type { BeerLog } from '@/types/database'

/** Raw hex values for gradient rendering — one per style family */
const FAMILY_HEX: Record<BeerStyleFamily, { primary: string; light: string }> = {
  ipa:      { primary: '#4A7C2E', light: '#6B9D4F' },
  stout:    { primary: '#3D2B1F', light: '#5C4033' },
  sour:     { primary: '#9B2D5E', light: '#BB4D7E' },
  porter:   { primary: '#5B3A6B', light: '#7B5A8B' },
  lager:    { primary: '#2E6B8A', light: '#4E8BAA' },
  saison:   { primary: '#C4853E', light: '#D4A55E' },
  cider:    { primary: '#A0522D', light: '#C47A5A' },
  wine:     { primary: '#722F37', light: '#9B4D57' },
  cocktail: { primary: '#2D7A7A', light: '#4D9A9A' },
  na:       { primary: '#7A9B3E', light: '#9ABB5E' },
  default:  { primary: '#C4883E', light: '#D4A76A' },
}

/**
 * Builds a mesh gradient string from an array of beer logs.
 * Each unique style family contributes a radial gradient layer.
 * Transitions smoothly as beers are added to a session.
 *
 * - 0 beers: warm amber fallback (brand default)
 * - 1 style: single radial gradient
 * - 2+ styles: layered radial gradients over a linear base
 */
export function buildMeshGradient(beerLogs: BeerLog[]): string {
  // Collect unique style families (deduplicated, max 6 layers)
  const seen = new Set<BeerStyleFamily>()
  const families: BeerStyleFamily[] = []
  for (const log of beerLogs) {
    const style = (log.beer as { style?: string | null } | undefined)?.style
    const family = getStyleFamily(style)
    if (!seen.has(family)) {
      seen.add(family)
      families.push(family)
      if (families.length >= 6) break
    }
  }

  if (families.length === 0) {
    return 'linear-gradient(135deg, #D4A76A 0%, #C4883E 100%)'
  }

  if (families.length === 1) {
    const c = FAMILY_HEX[families[0]]
    return `radial-gradient(ellipse at 30% 50%, ${c.light} 0%, ${c.primary} 100%)`
  }

  // Spread radial blobs across the surface with slight sinusoidal y-offset
  const layers = families.map((family, i) => {
    const c = FAMILY_HEX[family]
    const x = 20 + (i * 60) / (families.length - 1)
    const y = 30 + Math.sin(i * 1.5) * 25
    return `radial-gradient(ellipse at ${Math.round(x)}% ${Math.round(y)}%, ${c.light}CC 0%, transparent 65%)`
  })

  const first = FAMILY_HEX[families[0]]
  const last = FAMILY_HEX[families[families.length - 1]]
  const base = `linear-gradient(135deg, ${first.primary} 0%, ${last.primary} 100%)`

  return `${layers.join(', ')}, ${base}`
}

/**
 * Returns the raw hex values for a given style family.
 * Use when CSS vars can't be used (e.g. gradient stops, canvas, inline alpha).
 */
export function getStyleHex(family: BeerStyleFamily): { primary: string; light: string } {
  return FAMILY_HEX[family] ?? FAMILY_HEX.default
}

/**
 * Computes the box-shadow glow color for the session bubble,
 * derived from the first beer's style family.
 */
export function getBubbleGlow(beerLogs: BeerLog[]): string {
  if (beerLogs.length === 0) return '0 4px 20px rgba(196, 136, 62, 0.4)'
  const style = (beerLogs[0].beer as { style?: string | null } | undefined)?.style
  const family = getStyleFamily(style)
  const hex = FAMILY_HEX[family].primary
  return `0 4px 20px ${hex}66, 0 2px 8px ${hex}33`
}
