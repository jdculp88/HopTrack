# HopTrack Deep QA/BA Audit Report
**Date:** 2026-04-01 (Sprint 91)
**Auditors:** Casey (QA), Sam (BA), Drew (Brewery Ops), Reese (Automation), Quinn (Infra), Alex (UI/UX)

---

## Summary

- **83 API routes** audited
- **40+ pages** across consumer, brewery admin, and superadmin
- **70+ client components** reviewed
- **149 Vitest tests** passing
- **Zero hardcoded secrets** in source
- **Zero `alert()` or `confirm()` calls** (banned patterns)

---

## P0 — Must Fix (3)

| # | Area | Issue | File(s) | Fix Sprint |
|---|------|-------|---------|------------|
| 1 | Brewery Admin | **ActiveSessionsCounter never updates** — polls endpoint but ignores response. "Active Now" KPI frozen at SSR value. | `DashboardClient.tsx:56-68` | 92 ✅ |
| 2 | Brewery Admin | **Embed page missing auth check** — any logged-in user can access any brewery's embed config. | `embed/page.tsx` | 92 ✅ |
| 3 | Brewery Admin | **`motion.button` violations** — 2 instances of banned pattern. | `ApiKeyManager.tsx:211`, `BillingClient.tsx:325` | 92 ✅ |

---

## P1 — Should Fix (12)

| # | Area | Issue | File(s) | Fix Sprint |
|---|------|-------|---------|------------|
| 4 | Consumer | **Hardcoded fake data in Discover** — seasonal beers + curated collections use fake brewery names/IDs | `home/page.tsx:164-178` | 92 ✅ |
| 5 | Consumer | **6 curated collection cards all "Coming soon"** — prominent section with zero value | `DiscoveryCard.tsx:352` | 92 ✅ |
| 6 | Consumer | **Beer list Edit button links to profile** instead of list editor | `lists/[username]/[listId]/page.tsx:104-115` | 92 ✅ |
| 7 | Consumer | **Broken notification link** — `/profile/achievements` doesn't exist, should be `/achievements` | `NotificationsClient.tsx:726` | 92 ✅ |
| 8 | Brewery Admin | **Missing toasts on Loyalty mutations** — 6 operations complete silently | `LoyaltyClient.tsx` | 92 ✅ |
| 9 | Brewery Admin | **Missing toasts on Events mutations** — 4 operations complete silently | `EventsClient.tsx` | 92 ✅ |
| 10 | Brewery Admin | **Silent delete failures** — Events, Loyalty, Tap List delete operations don't check DB result | `EventsClient.tsx`, `LoyaltyClient.tsx`, `TapListClient.tsx` | 93 ✅ |
| 11 | Brewery Admin | **Drag-sort sends N individual updates** — 30 beers = 30 sequential DB calls, no error handling | `TapListClient.tsx:340-357` | 93 ✅ |
| 12 | API | **5 GET endpoints missing auth** — `/api/beers`, `/api/breweries`, `/api/breweries/browse`, `/api/sessions/[id]/photos`, `/api/beers/barcode/[code]` | Various | 92 ✅ |
| 13 | API | **Missing rate limits on 11+ mutation endpoints** | Various | 93 ✅ |
| 14 | API | **Leaderboard monthly XP query may use wrong column** — `xp_earned` vs `xp_awarded` | `leaderboard/route.ts:27` | 92 ✅ |
| 15 | Brewery Admin | **3 pages missing loading.tsx** — challenges, embed, customer profile detail | 3 dirs | 92 ✅ |

---

## P2 — Nice to Fix (15+)

| # | Area | Issue | Fix Sprint |
|---|------|-------|------------|
| 16 | Consumer | Non-interactive seasonal beer cards in Discover | 92 ✅ |
| 17 | API | Inconsistent response envelopes (v1 vs internal routes) | 93 ✅ |
| 18 | Brewery Admin | 4 pages not in sidebar nav (Sessions, Embed, Board, POS Sync) | 93 ✅ |
| 19 | Brewery Admin | OnboardingCard `hasQr`/`hasShared` always false | 93 ✅ |
| 20 | Brewery Admin | Promotions page missing mobile top padding (`pt-16`) | 92 ✅ |
| 21 | Brewery Admin | Events delete no success toast | 92 ✅ |
| 22 | Brewery Admin | Embed + Challenges pages missing metadata export | 92 ✅ |
| 23 | Accessibility | Missing skip-to-content links in brewery admin + superadmin | 93 ✅ |
| 24 | Accessibility | Missing `id="main-content"` on admin `<main>` elements | 93 ✅ |
| 25 | Accessibility | Icon-only close button missing aria-label in Loyalty | 93 ✅ |
| 26 | Consumer | Wrapped/Pint Rewind use client-side fetch (double loading flash) | 93 ✅ |
| 27 | Consumer | Settings hash anchor `#invite-friends` not verified | 93 ✅ |
| 28 | API | POS routes inconsistent envelope shapes | 93 ✅ |
| 29 | API | `POST /api/sessions/[id]/beers` doesn't validate beer_id existence | 93 ✅ |
| 30 | API | Challenges + challenge_participants were missing from Database types (FIXED in Sprint 91) | Done |

---

## What Passed

- All nav links work across all 3 app sections
- All pages have empty states with CTAs
- All loading skeletons present (3 exceptions noted)
- All data displayed can be created by users
- Zero banned patterns (alert/confirm)
- AnimatePresence on every delete flow
- Session flow end-to-end complete
- WCAG/ARIA: skip-to-content (consumer), role attributes, focus traps
- No service role client in browser code
- CSS variables used throughout (no hardcoded colors)
- 149 Vitest tests passing

---

*This is a living document.* 🍺
