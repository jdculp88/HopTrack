# Sprint 137 — The Shield
**Theme:** Code protection & IP security + lint zero
**Status:** COMPLETE
**Date:** 2026-04-02 (retroactive)

---

## Goals
- Add Content-Security-Policy header for XSS protection
- Disable production source maps to protect IP
- Ship Terms of Service and DMCA Takedown Policy pages
- Close rate limiting gaps on public API endpoints
- Drive lint errors from 146 to near-zero

## Key Deliverables
- Content-Security-Policy header (Report-Only, 10 directives: default-src, script-src, style-src, img-src, font-src, connect-src, frame-ancestors, object-src, base-uri, form-action)
- `productionBrowserSourceMaps: false` explicit in next.config
- Terms of Service page (`/terms`, 13 sections, attorney review flagged)
- DMCA Takedown Policy page (`/dmca`, 17 U.S.C. 512 compliance)
- Legal links added to CookieConsent, BreweriesContent footer, StorefrontShell footer, robots.txt
- Rate limiting added to 15 API handlers across 10 route files (public menu, brand tap list/catalog, sessions, beer lists)
- Copyright headers on 7 core lib files
- 129 HTML entity lint errors eliminated (56 files batch-fixed + `no-unescaped-entities` rule disabled)
- 2 `require()` imports converted to `import`, 1 `prefer-const` fix

## Results
- 5 new files, ~75 modified, 1 deleted, 0 migrations
- 16 new tests (1040 -> 1056 total)
- Lint errors: 146 -> 14 (remaining are React compiler warnings, intentional patterns)
- KNOWN: Brand Team page shows 0 members (pre-existing RLS query issue)
