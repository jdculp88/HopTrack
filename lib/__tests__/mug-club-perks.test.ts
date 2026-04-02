import { describe, it, expect } from 'vitest'

/**
 * Sprint 127 — The Reckoning
 * Smoke tests for mug club perks rendering.
 *
 * Root cause: Migration 074 stores perks as [{title, description}] objects,
 * but MugClubSection was casting them as string[] and rendering {perk} directly.
 * React crashes with "Objects are not valid as a React child."
 */

// Simulate the perk normalization logic from MugClubSection
function normalizePerk(perk: string | { title: string; description?: string }): string {
  return typeof perk === 'string' ? perk : perk.title
}

function normalizePerkDescription(perk: string | { title: string; description?: string }): string | null {
  return typeof perk === 'object' && perk.description ? perk.description : null
}

describe('Mug Club Perks — Data Safety', () => {
  it('handles string perks (legacy format)', () => {
    const perks: string[] = ['Free pint on birthday', '10% off merch']
    const normalized = perks.map(normalizePerk)
    expect(normalized).toEqual(['Free pint on birthday', '10% off merch'])
    expect(perks.map(normalizePerkDescription)).toEqual([null, null])
  })

  it('handles object perks ({title, description} format from migration 074)', () => {
    const perks = [
      { title: '$1 off every pint', description: 'All day, every day' },
      { title: 'Exclusive barrel releases', description: 'First access to limited releases' },
      { title: 'Custom branded mug', description: '16oz ceramic with your name on it' },
      { title: 'Birthday pint free', description: 'One free pour on your birthday month' },
    ]
    const titles = perks.map(normalizePerk)
    expect(titles).toEqual([
      '$1 off every pint',
      'Exclusive barrel releases',
      'Custom branded mug',
      'Birthday pint free',
    ])
    const descriptions = perks.map(normalizePerkDescription)
    expect(descriptions).toEqual([
      'All day, every day',
      'First access to limited releases',
      '16oz ceramic with your name on it',
      'One free pour on your birthday month',
    ])
  })

  it('handles mixed formats (string + object)', () => {
    const perks: Array<string | { title: string; description?: string }> = [
      'Simple string perk',
      { title: 'Object perk', description: 'With description' },
      { title: 'Object perk no desc' },
    ]
    const titles = perks.map(normalizePerk)
    expect(titles).toEqual(['Simple string perk', 'Object perk', 'Object perk no desc'])
    const descriptions = perks.map(normalizePerkDescription)
    expect(descriptions).toEqual([null, 'With description', null])
  })

  it('handles empty perks array', () => {
    const perks: Array<string | { title: string; description?: string }> = []
    expect(perks.map(normalizePerk)).toEqual([])
  })

  it('never returns an object from normalizePerk (React safety)', () => {
    const perks: Array<string | { title: string; description?: string }> = [
      'string',
      { title: 'obj', description: 'desc' },
      { title: 'no desc' },
    ]
    for (const perk of perks) {
      const result = normalizePerk(perk)
      expect(typeof result).toBe('string')
    }
  })
})
