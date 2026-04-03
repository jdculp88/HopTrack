// Legal pages tests — Reese, Sprint 137 (The Shield)
// Validates Terms of Service, Privacy Policy, and DMCA pages exist and export metadata
import { describe, it, expect } from 'vitest'

// ── Terms of Service ──────────────────────────────────────────────────────────

describe('Terms of Service page', () => {
  it('exports a default component', async () => {
    const mod = await import('@/app/terms/page')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  it('exports metadata with correct title', async () => {
    const mod = await import('@/app/terms/page')
    expect(mod.metadata).toBeDefined()
    expect(mod.metadata.title).toContain('Terms of Service')
  })
})

// ── DMCA Takedown Policy ──────────────────────────────────────────────────────

describe('DMCA Takedown Policy page', () => {
  it('exports a default component', async () => {
    const mod = await import('@/app/dmca/page')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  it('exports metadata with correct title', async () => {
    const mod = await import('@/app/dmca/page')
    expect(mod.metadata).toBeDefined()
    expect(mod.metadata.title).toContain('DMCA')
  })
})

// ── Privacy Policy ────────────────────────────────────────────────────────────

describe('Privacy Policy page', () => {
  it('exports a default component', async () => {
    const mod = await import('@/app/privacy/page')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  it('exports metadata with correct title', async () => {
    const mod = await import('@/app/privacy/page')
    expect(mod.metadata).toBeDefined()
    expect(mod.metadata.title).toContain('Privacy Policy')
  })
})

// ── Legal Page Coverage ───────────────────────────────────────────────────────

describe('Legal page coverage', () => {
  it('all three legal pages are importable', async () => {
    const [terms, dmca, privacy] = await Promise.all([
      import('@/app/terms/page'),
      import('@/app/dmca/page'),
      import('@/app/privacy/page'),
    ])
    expect(terms.default).toBeDefined()
    expect(dmca.default).toBeDefined()
    expect(privacy.default).toBeDefined()
  })
})
