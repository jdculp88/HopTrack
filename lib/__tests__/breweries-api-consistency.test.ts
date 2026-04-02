import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Sprint 127 — The Reckoning
 * Guardrail test: all .from("breweries").select() calls in the breweries API
 * must include the brand join for consistent response shape.
 *
 * Root cause: Only the lat/lng query path included brand:brewery_brands(id, name, slug).
 * Search, zip, and default paths returned .select("*") without the join,
 * causing CheckinEntryDrawer brand labels to appear inconsistently.
 */

const BREWERIES_API_PATH = join(process.cwd(), 'app/api/breweries/route.ts')

describe('Breweries API — Brand Join Consistency', () => {
  const source = readFileSync(BREWERIES_API_PATH, 'utf-8')

  it('all .from("breweries").select() calls include the brand join', () => {
    // Find all .select() calls that come after .from("breweries")
    const selectPattern = /\.from\("breweries"\)\s*\n?\s*\.select\(([^)]+)\)/g
    const matches: string[] = []
    let match: RegExpExecArray | null

    while ((match = selectPattern.exec(source)) !== null) {
      matches.push(match[1])
    }

    expect(matches.length).toBeGreaterThan(0)

    for (const selectArg of matches) {
      expect(selectArg).toContain('brand:brewery_brands')
    }
  })

  it('brand join selects id, name, slug fields', () => {
    const brandJoinPattern = /brand:brewery_brands\(([^)]+)\)/g
    const joins: string[] = []
    let match: RegExpExecArray | null

    while ((match = brandJoinPattern.exec(source)) !== null) {
      joins.push(match[1])
    }

    expect(joins.length).toBeGreaterThan(0)

    for (const fields of joins) {
      expect(fields).toContain('id')
      expect(fields).toContain('name')
      expect(fields).toContain('slug')
    }
  })

  it('has at least 5 query paths (nearby, zip, name, re-fetch, default)', () => {
    const selectPattern = /\.from\("breweries"\)\s*\n?\s*\.select\(/g
    const matches = source.match(selectPattern)
    expect(matches).not.toBeNull()
    expect(matches!.length).toBeGreaterThanOrEqual(5)
  })
})
