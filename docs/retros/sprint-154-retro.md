# Sprint 154 Retro — The Native Feel

**Facilitator:** Sage (Project Manager)
**Date:** 2026-04-04
**Sprint Goal:** Make HopTrack feel like a $10M native app on mobile

---

## What Shipped

### Track 1: Bundle & Code Splitting
- **8 dead dependencies removed** — mapbox-gl (~700KB), @mapbox/mapbox-gl-geocoder, @types/mapbox-gl, fuse.js, idb, bad-words, react-email, @react-email/components. 207 packages pruned total. (Jordan, Dakota)
- **Recharts lazy-loaded** — `components/charts/LazyRecharts.tsx` wraps all chart components with `next/dynamic`. 5 admin pages updated (CommandCenter, UserDetail, Analytics, BrandReports, PintRewind). Charts only load when analytics pages are visited. (Dakota, Avery)

### Track 2: Mobile Interaction Polish
- **`useHaptic` hook** — `hooks/useHaptic.ts` with 6 named presets (tap/press/selection/success/error/celebration), respects `prefers-reduced-motion`, graceful no-op when vibration API unavailable. (Alex, Dakota)
- **Haptic feedback on mobile nav** — bottom bar tabs fire `selection` on tap, check-in FAB fires `press`. (Alex)
- **Overscroll containment** — `overscroll-behavior-y: contain` on body + `overscroll-contain` on Modal scroll areas. No more scroll chaining through modals/drawers. (Finley, Alex)
- **Scroll-snap on 10 carousels** — RecommendationsScroll, DrinkingNow, DiscoveryCard (2x), NearbyChallenges, Explore Near Me, Explore Recently Visited, YouTab achievements, Brewery detail friends, BreweryMenus category pills. (Alex, Dakota)

### Track 3: Image & Resource Optimization
- **8 raw `<img>` tags converted to `next/image`** — session share page, superadmin brewery detail (cover + avatars), superadmin users list, user detail, challenges preview, PintRewind top visitor. Lazy loading + AVIF/WebP format negotiation. (Dakota)
- **Preconnect resource hints** — Supabase (dynamic from env), Google Fonts, Google Fonts static CDN added to root layout `<head>`. (Riley)

### Track 4: PWA & Standalone Polish
- **Viewport `maximumScale: 1` removed** — pinch-to-zoom re-enabled (WCAG 1.4.4 compliance). 16px font floor already prevents iOS input zoom. (Sam, Alex)
- **Standalone mode CSS** — `user-select: none` on UI elements, `user-select: text` preserved on content areas (p, article, textarea, input, [role="article"], [contenteditable]). Full `overscroll-behavior: none` in standalone. (Alex, Finley)
- **Console.log cleaned** from `useInstallPrompt.ts` — no production console noise. (Dakota)

### Track 5: Skipped (Jordan's call)
- **Leaflet CSS** stays in globals.css — Turbopack CSS module panic workaround from Sprint 147 still necessary.
- **dnd-kit/QR lazy-load** — already route-split naturally by Next.js. Wrapper would add complexity for no gain.
- **Lighthouse formal audit** — deferred to next sprint. Should baseline 4 key routes.

---

## Numbers

| Metric | Before | After |
|--------|--------|-------|
| Dependencies | 40 | 32 (-8) |
| npm packages | 1,105 | 898 (-207) |
| Unit tests | 1,328 | 1,334 (+6) |
| E2E tests | 87 | 87 |
| Test files | 74 | 75 (+1) |
| New files | — | 3 |
| Modified files | — | ~25 |
| Migrations | — | 0 |
| Build time | — | 19.6s clean |

---

## What Went Well

- **Jordan**: 207 packages removed. mapbox-gl was 700KB of dead weight since Sprint 126. Never imported. Not once.
- **Dakota**: LazyRecharts wrapper — one file, drop-in replacement, five consumers in ten minutes.
- **Alex**: Scroll-snap on ten carousels. The Near Me section snaps now. That's native. Been asking since Sprint 8.
- **Avery**: useHaptic is the right pattern — centralized, preset-based, reduced-motion aware. Pattern-approved.
- **Riley**: Preconnect hints for Supabase + Google Fonts. Tiny change, measurable first-load impact. Zero migrations.
- **Casey**: 1,334 tests. All passing. Clean build. Watching. 👀
- **Finley**: Overscroll-behavior fix — invisible when it works. That's good design.
- **Sam**: Viewport maximumScale fix resolved a WCAG 1.4.4 violation. We were technically non-compliant.
- **Drew**: The app is demo-ready. When I walk into Burial, the carousels snap. Felt that physically. Good way.
- **Taylor**: 207 fewer packages = 207 fewer things that break in production. Risk management. We're going to be rich.
- **Parker**: PWA standalone mode — brewery owners can't tell it's not from the App Store. Not churning on my watch.
- **Jamie**: Overscroll + scroll-snap = the feel. Worth more than any marketing copy.
- **Quinn**: Zero migrations. Healthiest sprint for the nervous system.
- **Reese**: Six tests for useHaptic. All presets, reduced-motion, missing API, runtime changes. Covered.

## What Could Be Better

- **Jordan**: Leaflet CSS still in globals.css due to Turbopack bug. Can't fix until Next.js upstream resolves.
- **Casey**: No formal Lighthouse audit this sprint. Track 5 was planned but deferred. Should baseline next sprint.
- **Avery**: LazyRecharts uses individual dynamic() per component. Works, but a barrel re-export would be cleaner when Turbopack matures.
- **Sam**: Remaining admin `<img>` tags using blob URLs are acceptable but should be documented as intentional.

## Roasts

- Joshua told us to "make it feel like a $10M app." We deleted things. That's subtraction. You're welcome.
- Jordan blocked a CSS move because of a "Turbopack panic." Drew panics every Friday when the POS goes down. Not the same.
- Alex has been asking for scroll-snap since Sprint 8. 146 sprints. Alex was always right. It's going in the pitch deck.
- Dakota shipped LazyRecharts in ten minutes. Avery taught him well. Maybe too well. Avery is "proud. ...And slightly nervous."
- Reese tested for phones that can't vibrate. Phones from 2012. Covered, indeed.
- Jamie wants Morgan to show emotion. Just once. Fist pump. Something. Morgan: "This is a living document."

---

## Action Items

| Item | Owner | Priority |
|------|-------|----------|
| LLC formation + Stripe setup | Joshua | P0-BLOCKER |
| Lighthouse audit (baseline 4 routes, target >= 90) | Casey, Alex | P1 |
| Document blob URL `<img>` pattern as intentional | Avery | P2 |
| Superadmin claim email notifications | Riley | P1 |
| Trial expiration enforcement at API layer | Avery | P1 |

---

## KNOWN Issues
**EMPTY.** Second consecutive sprint with zero known issues.

---

*Sprint 154 — The Native Feel. The app snaps. The bundle is lean. The bartender can't tell it's not native. We're ready.* 🍺
