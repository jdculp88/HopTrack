# Sprint 131 — The Storefront
**Theme:** Public brewery pages (no account required)
**Status:** COMPLETE
**Date:** 2026-04-01 (retroactive)

---

## Goals
- Make every `/brewery/[id]` page publicly accessible without authentication
- Implement two-tier storefront: Basic (unclaimed/free) vs Premium (Tap+, $49/mo)
- Gate premium content behind claim CTA for unclaimed breweries
- Add SEO metadata for public indexing

## Key Deliverables
- `StorefrontShell` component (no app nav, HopTrack branding header, sticky mobile CTA bar, footer)
- `AuthGate` component (blur overlay + signup CTA for interactive features)
- `StorefrontGate` component (tier-based content gate for unclaimed breweries)
- Middleware updated: `/brewery` removed from protected paths
- Conditional layout: StorefrontShell for unauthenticated, AppShell for authenticated
- Reviews API GET made public
- SEO: description, canonical URL added to `generateMetadata` (JSON-LD + OG already existed)
- 7 components updated with `isAuthenticated` props (hero, rating, review, events, challenges, mug clubs, reviews section)

## Results
- 4 new files, 10 modified, 0 migrations
- 22 new tests (894 -> 916 total)
- KNOWN: Brand Team page shows 0 members (pre-existing RLS query issue)
