# Sprint 93 — The Hardening 🔧
**PM:** Morgan | **Arc:** The Flywheel (Sprint 3 of 6)
**Date:** 2026-04-01

> Every remaining QA/BA audit item gets closed. Data integrity, rate limiting, accessibility, P2 polish — ALL of it. Plus: ad engine foundation. The system gets tougher.

---

## Audit Burndown — Every Item Remaining

**Source:** `docs/plans/qa-audit-sprint-91.md`

### Already fixed (Sprint 92): P0 #1-3, P1 #4-9, #12, #14-15, P2 #16, #20-22 ✅
### This sprint closes: P1 #10-11, #13, P2 #17-19, #23-29 — **ALL remaining items**

---

## Goal 1: Data Integrity Fixes (P1 #10, #11)
**Owner:** Avery (Dev Lead) | **Reviewer:** Jordan (Architecture)

### 1a. Fix silent delete failures — TapListClient
**File:** `app/(brewery-admin)/brewery-admin/[brewery_id]/tap-list/TapListClient.tsx`

- **Line 280:** `beer_pour_sizes` delete — no error check. Add `{ error }` destructure, rollback + error toast on failure.
- **Line 412:** `batchDelete()` — `Promise.all()` ignores individual errors. Catch failures, report count, rollback UI.
- **Line 449:** `handleDelete()` — delete with no error check. Add error handling + rollback.

### 1b. Batch drag-sort (P1 #11)
**File:** `TapListClient.tsx:340-357`

Replace N individual `UPDATE` calls with a single `Promise.all()` batch. Add error handling — if any update fails, refetch from DB and show error toast.

### 1c. Fix `forEach(async...)` anti-pattern
**File:** `TapListClient.tsx:431-433, 440-442`

`sortByStyle()` and `sortAlphabetical()` use `forEach(async (b, i) => ...)` — fires async operations without awaiting them. Toast fires before operations complete. Replace with `Promise.all(sorted.map(...))` and add error handling.

---

## Goal 2: Rate Limiting (P1 #13)
**Owner:** Avery (Dev Lead) | **Reviewer:** Riley (Infra)

Add `rateLimitResponse()` from `@/lib/rate-limit` to 11 mutation endpoints:

| # | Endpoint | File | Limit |
|---|----------|------|-------|
| 1 | `POST /api/wishlist` | `app/api/wishlist/route.ts` | 30/min |
| 2 | `DELETE /api/wishlist` | `app/api/wishlist/route.ts` | 30/min |
| 3 | `POST /api/challenges/join` | `app/api/challenges/join/route.ts` | 10/min |
| 4 | `POST /api/brewery/[id]/featured-beer` | `app/api/brewery/[brewery_id]/featured-beer/route.ts` | 10/min |
| 5 | `PATCH /api/brewery/[id]/settings` | `app/api/brewery/[brewery_id]/settings/route.ts` | 10/min |
| 6 | `POST /api/billing/checkout` | `app/api/billing/checkout/route.ts` | 5/min |
| 7 | `POST /api/billing/portal` | `app/api/billing/portal/route.ts` | 5/min |
| 8 | `POST /api/billing/cancel` | `app/api/billing/cancel/route.ts` | 5/min |
| 9 | `POST /api/push/subscribe` | `app/api/push/subscribe/route.ts` | 10/min |
| 10 | `POST /api/brewery-claims` | `app/api/brewery-claims/route.ts` | 5/min |
| 11 | `POST /api/breweries` | `app/api/breweries/route.ts` | 5/min |

Pattern: Import `rateLimitResponse` → call at top of handler → return 429 if over limit.

---

## Goal 3: P2 Polish — Brewery Admin
**Owner:** Avery (Dev Lead)

### 3a. Add 4 missing pages to sidebar nav (P2 #18)
**File:** `components/brewery-admin/BreweryAdminNav.tsx`

Add to `NAV_ITEMS`: Sessions, Embed, Board, POS Sync Log.

### 3b. Wire OnboardingCard `hasQr`/`hasShared` (P2 #19)
**File:** `app/(brewery-admin)/brewery-admin/[brewery_id]/page.tsx`

Currently always passing `false`. Wire `hasQr` from localStorage (QR page visited) and `hasShared` from localStorage (public page shared). Pass real values to `BreweryOnboardingCard`.

### 3c. Skip-to-content links (P2 #23-24)
**Files:** `app/(brewery-admin)/layout.tsx`, `app/(superadmin)/layout.tsx`

Add `<a href="#main-content" className="sr-only focus:not-sr-only ...">Skip to main content</a>` before nav. Add `id="main-content"` to `<main>` elements.

### 3d. Aria-label on icon-only close button (P2 #25)
**File:** `app/(brewery-admin)/brewery-admin/[brewery_id]/loyalty/LoyaltyClient.tsx:531`

Add `aria-label="Close"` to the `<button>` with `<X>` icon.

---

## Goal 4: P2 Remaining — Full Audit Close-Out
**Owner:** Avery (Dev Lead) | **Reviewer:** Jordan (Architecture)

### 4a. API inconsistent response envelopes (P2 #17)
Audit internal API routes that return raw `{ error }` objects vs. v1's standardized `{ data, meta, error }` envelope. Create a `apiInternalResponse()` helper or document the convention gap. At minimum, ensure all error responses return `{ error: string }` consistently.

### 4b. Wrapped/Pint Rewind client-side fetch (P2 #26)
**Files:** `app/(app)/wrapped/WrappedClient.tsx`, `app/(app)/pint-rewind/PintRewindCards.tsx`

Move data fetching to server component, pass as props. Eliminates double loading flash.

### 4c. Settings hash anchor (P2 #27)
**File:** `app/(app)/settings/SettingsClient.tsx`

Verify `#invite-friends` scrolls to the invite section. Add `id="invite-friends"` to the section if missing. Wire `useEffect` to scroll on mount if hash present.

### 4d. POS routes inconsistent envelopes (P2 #28)
**Files:** `app/api/pos/*/route.ts`

Audit and standardize response shapes across 9 POS endpoints.

### 4e. Validate beer_id in session beer log (P2 #29)
**File:** `app/api/sessions/[id]/beers/route.ts`

Before inserting, validate that `beer_id` exists in the `beers` table. Return 400 if not found.

---

## Goal 5: Ad Engine Foundation (F-028)
**Owner:** Avery (Dev Lead) | **Reviewer:** Jordan (Architecture)

Brewery ad cards in the feed — geo-targeted, native-feeling cards.

### Migration 061: `brewery_ads` table
- `id`, `brewery_id` (FK), `title`, `body`, `image_url`, `cta_url`, `cta_label`
- `radius_km` (default 25), `budget_cents`, `spent_cents`, `impressions`, `clicks`
- `starts_at`, `ends_at`, `is_active`, `tier_required` (cask/barrel)
- `created_at`, `updated_at`
- RLS: brewery admins CRUD own, consumers SELECT active within radius

### API Endpoints
- `GET /api/ads/feed` — return 1 ad for user's location (haversine), respect budget/dates/tier
- `POST /api/ads/impression` — increment impression count
- `POST /api/ads/click` — increment click count
- `POST /api/brewery/[id]/ads` — create ad (tier-gated)
- `GET /api/brewery/[id]/ads` — list brewery's ads
- `PATCH /api/brewery/[id]/ads/[ad_id]` — update ad
- `DELETE /api/brewery/[id]/ads/[ad_id]` — delete ad

### Feed Integration
- `BreweryAdFeedCard` component — native card style, "Sponsored" badge, brewery logo, CTA button
- Insert into feed every ~8 cards if geo-eligible ad available
- Track impressions via intersection observer

### Brewery Admin UI
- Ads section in Resources or standalone `/ads` page
- Create/edit form: title, body, image upload, CTA, radius slider, date range, budget
- Performance stats: impressions, clicks, CTR, spend

---

## Test Plan
- [ ] TapList delete shows error toast on DB failure (all 3 paths)
- [ ] Drag-sort uses batched updates, shows error on failure
- [ ] sortByStyle/sortAlphabetical properly await all updates
- [ ] All 11 rate-limited endpoints return 429 on excess requests
- [ ] Sessions, Embed, Board, POS Sync visible in admin sidebar
- [ ] OnboardingCard reflects real QR/shared state
- [ ] Skip-to-content links work in brewery admin + superadmin
- [ ] LoyaltyClient close button has aria-label
- [ ] Wrapped/Pint Rewind load without double flash
- [ ] Settings #invite-friends scrolls correctly
- [ ] beer_id validation returns 400 for invalid IDs
- [ ] Ad feed returns geo-targeted ad card
- [ ] Ad impression/click tracking increments correctly
- [ ] Brewery admin can create/edit/delete ads (tier-gated)
- [ ] Existing tests pass (`npm run test`)
- [ ] Build passes (`npm run build`)

---

*This is a living document.* 🍺
