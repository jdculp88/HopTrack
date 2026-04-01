# Sprint 93 — The Hardening 🔧
**PM:** Morgan | **Arc:** The Flywheel (Sprint 3 of 6)
**Date:** TBD

> Data integrity fixes, rate limiting, ad engine foundation. The system gets tougher.

---

## Sprint 93 Goals

### Goal 1: Data Integrity Fixes (from QA Audit)
**Owner:** Avery (Dev Lead) | **Reviewer:** Jordan (Architecture)

1. **Fix silent delete failures** — Events, Loyalty, Tap List delete operations must check DB result and rollback UI on error. Show error toast on failure.
2. **Batch drag-sort updates** — TapListClient.tsx:340-357. Replace N individual updates with a single RPC or batched update. Add error handling.
3. **Fix `forEach(async...)` anti-pattern** — TapListClient.tsx sortByStyle/sortAlphabetical must properly await async operations.

### Goal 2: Rate Limiting
**Owner:** Avery (Dev Lead) | **Reviewer:** Riley (Infra)

Add rate limits to 11+ mutation endpoints currently missing them:
- `POST /api/wishlist`, `DELETE /api/wishlist`
- `POST /api/challenges/join`
- `POST /api/brewery/[id]/featured-beer`
- `PATCH /api/brewery/[id]/settings`
- `POST /api/billing/checkout`, `/api/billing/portal`, `/api/billing/cancel`
- `POST /api/push/subscribe`
- `POST /api/brewery-claims`
- `POST /api/breweries`

### Goal 3: Ad Engine Foundation (F-028)
**Owner:** Avery (Dev Lead) | **Reviewer:** Jordan (Architecture)

Brewery ad cards in the feed — geo-targeted, native-feeling cards that breweries can create to reach nearby users.

*Detailed spec TBD at sprint start based on Sprint 92 velocity.*

### Goal 4: P2 Polish (from QA Audit)
**Owner:** Avery (Dev Lead)

1. **Add 4 missing pages to brewery admin sidebar nav** — Sessions, Embed, Board, POS Sync Log
2. **Fix OnboardingCard** — Wire `hasQr` and `hasShared` props from dashboard data
3. **Add skip-to-content links** to brewery admin + superadmin layouts
4. **Add `id="main-content"`** to admin `<main>` elements
5. **Fix aria-label** on icon-only close button in LoyaltyClient

---

## Test Plan
- [ ] Delete operations show error toast on DB failure
- [ ] Drag-sort tap list completes in 1-2 DB calls (not N)
- [ ] Rate-limited endpoints return 429 on excess requests
- [ ] New nav items visible in brewery admin sidebar
- [ ] Skip-to-content links work in admin/superadmin
- [ ] Existing tests pass (`npm run test`)

---

*This is a living document.* 🍺
