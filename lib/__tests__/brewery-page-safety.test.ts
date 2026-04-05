import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Sprint 127 — The Reckoning
 * Guardrail tests for the brewery detail page data pipeline.
 *
 * Ensures:
 * 1. Beer query uses narrow select (not brewery:breweries(*))
 * 2. Brand data is fetched separately with null guards
 * 3. BrandLoyaltyStampCard is conditionally rendered with proper guards
 */

const BREWERY_PAGE_PATH = join(process.cwd(), 'app/(app)/brewery/[id]/page.tsx')
const BREWERY_DETAIL_CLIENT_PATH = join(process.cwd(), 'app/(app)/brewery/[id]/BreweryDetailClient.tsx')
const CACHED_DATA_PATH = join(process.cwd(), 'lib/cached-data.ts')

describe('Brewery Detail Page — Data Safety', () => {
  const pageSource = readFileSync(BREWERY_PAGE_PATH, 'utf-8')
  const clientSource = readFileSync(BREWERY_DETAIL_CLIENT_PATH, 'utf-8')
  // S160: Rendering logic moved to BreweryDetailClient; guard lives there now.
  const renderSource = clientSource

  it('beer query uses narrow brewery select (not wildcard)', () => {
    // Sprint 158: beers query moved to lib/cached-data.ts (getCachedBreweryPublicData)
    const cachedSource = readFileSync(CACHED_DATA_PATH, 'utf-8')
    const beerQueryPattern = /\.from\("beers"\)[\s\S]{0,100}\.select\(([^)]+)\)/
    const match = cachedSource.match(beerQueryPattern)
    expect(match).not.toBeNull()

    const selectArg = match![1]
    // Should NOT contain brewery:breweries(*)
    expect(selectArg).not.toMatch(/brewery:breweries\(\*\)/)
  })

  it('brand data is fetched separately (not joined on main brewery query)', () => {
    // The main brewery query should use .select("*") without brand join
    // Brand data should be fetched in a separate query from brewery_brands
    expect(pageSource).toContain('.from("brewery_brands")')
    expect(pageSource).toContain('brewery.brand_id')
  })

  it('BrandLoyaltyStampCard has triple null guard', () => {
    // Must check: hasBrandLoyalty && brewery.brand_id && brandName
    expect(renderSource).toMatch(/hasBrandLoyalty\s*&&\s*brewery\.brand_id\s*&&\s*brandName/)
  })

  it('brandName is extracted as string, not object', () => {
    // brandName should be set from brandRow?.name (string), not brandRow (object)
    expect(pageSource).toContain('brandRow?.name')
  })
})
