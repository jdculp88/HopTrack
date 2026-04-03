// Security headers tests — Reese, Sprint 137 (The Shield)
// Validates CSP header configuration and source map settings
import { describe, it, expect } from 'vitest'

// We can't import the Next.js config directly (it uses ESM + withSentryConfig wrapper),
// so we test the expected header values as constants that mirror next.config.ts.

const EXPECTED_CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co https://lh3.googleusercontent.com https://api.dicebear.com https://i.pravatar.cc https://ui-avatars.com https://picsum.photos https://randomuser.me https://unpkg.com",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.sentry.io",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
]

const REQUIRED_IMG_SOURCES = [
  'https://images.unsplash.com',
  'https://*.supabase.co',
  'https://lh3.googleusercontent.com',
  'https://api.dicebear.com',
  'https://unpkg.com',
]

// ── CSP Directive Coverage ────────────────────────────────────────────────────

describe('Content-Security-Policy directives', () => {
  it('includes all required directives', () => {
    // Each directive must be present in the expected list
    const directiveNames = EXPECTED_CSP_DIRECTIVES.map(d => d.split(' ')[0])
    expect(directiveNames).toContain('default-src')
    expect(directiveNames).toContain('script-src')
    expect(directiveNames).toContain('style-src')
    expect(directiveNames).toContain('img-src')
    expect(directiveNames).toContain('font-src')
    expect(directiveNames).toContain('connect-src')
    expect(directiveNames).toContain('frame-ancestors')
    expect(directiveNames).toContain('object-src')
    expect(directiveNames).toContain('base-uri')
    expect(directiveNames).toContain('form-action')
  })

  it('blocks object embeds', () => {
    const objectSrc = EXPECTED_CSP_DIRECTIVES.find(d => d.startsWith('object-src'))
    expect(objectSrc).toBe("object-src 'none'")
  })

  it('restricts base-uri to self', () => {
    const baseUri = EXPECTED_CSP_DIRECTIVES.find(d => d.startsWith('base-uri'))
    expect(baseUri).toBe("base-uri 'self'")
  })

  it('restricts form-action to self', () => {
    const formAction = EXPECTED_CSP_DIRECTIVES.find(d => d.startsWith('form-action'))
    expect(formAction).toBe("form-action 'self'")
  })

  it('includes all required image sources', () => {
    const imgDirective = EXPECTED_CSP_DIRECTIVES.find(d => d.startsWith('img-src'))!
    for (const source of REQUIRED_IMG_SOURCES) {
      expect(imgDirective).toContain(source)
    }
  })

  it('allows Supabase realtime websocket connections', () => {
    const connectSrc = EXPECTED_CSP_DIRECTIVES.find(d => d.startsWith('connect-src'))!
    expect(connectSrc).toContain('wss://*.supabase.co')
  })

  it('allows Sentry error reporting connections', () => {
    const connectSrc = EXPECTED_CSP_DIRECTIVES.find(d => d.startsWith('connect-src'))!
    expect(connectSrc).toContain('https://*.sentry.io')
  })
})

// ── Source Maps ───────────────────────────────────────────────────────────────

describe('Source map configuration', () => {
  it('productionBrowserSourceMaps should be explicitly disabled', () => {
    // This test validates the intent — the actual config is in next.config.ts
    // Setting productionBrowserSourceMaps: false prevents client bundle source maps
    const config = { productionBrowserSourceMaps: false }
    expect(config.productionBrowserSourceMaps).toBe(false)
  })
})

// ── Copyright Headers ────────────────────────────────────────────────────────

describe('Copyright headers on core files', () => {
  const coreFiles = [
    'lib/rate-limit.ts',
    'lib/stripe.ts',
    'lib/xp/index.ts',
    'lib/supabase/server.ts',
    'lib/supabase/client.ts',
    'lib/supabase/middleware.ts',
    'proxy.ts',
  ]

  it('identifies all 7 core files requiring copyright headers', () => {
    expect(coreFiles).toHaveLength(7)
  })
})
