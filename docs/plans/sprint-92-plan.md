# Sprint 92 — The Polish 🧹
**PM:** Morgan | **Arc:** The Flywheel (Sprint 2 of 6)
**Date:** TBD

> Burn down the P0s and critical P1s from the Sprint 91 deep audit. Ship sponsored challenge analytics enhancements. Keep the Flywheel turning.

---

## Sprint 92 Goals

### Goal 1: P0 Bug Fixes (from QA Audit)
**Owner:** Avery (Dev Lead) | **Reviewer:** Jordan (Architecture)

1. **ActiveSessionsCounter fix** — DashboardClient.tsx:56-68 polls but ignores response. Wire the fetch result into state.
2. **Embed page auth check** — Add `brewery_accounts` access check (same pattern as every other admin page).
3. **motion.button cleanup** — Replace `<motion.button>` with `<button>` + inner `<motion.div>` in ApiKeyManager.tsx:211 and BillingClient.tsx:325.

### Goal 2: P1 Consumer Fixes
**Owner:** Avery (Dev Lead)

1. **Remove hardcoded fake data from Discover** — home/page.tsx:164-178. Remove fake seasonal beers + curated collections, or replace with real DB queries.
2. **Remove or fix curated collection cards** — DiscoveryCard.tsx:352. 6 "Coming soon" cards are worse than 0 cards.
3. **Fix beer list Edit link** — lists/[username]/[listId]/page.tsx:104-115. Link to `/beer-lists/[listId]` not `/profile/[username]`.
4. **Fix broken notification link** — NotificationsClient.tsx:726. Change `/profile/achievements` to `/achievements`.

### Goal 3: P1 Brewery Admin Fixes
**Owner:** Avery (Dev Lead)

1. **Add toasts to Loyalty mutations** — LoyaltyClient.tsx (6 operations).
2. **Add toasts to Events mutations** — EventsClient.tsx (4 operations).
3. **Add 3 missing loading.tsx skeletons** — challenges/, embed/, customers/[user_id]/.
4. **Fix leaderboard XP column** — leaderboard/route.ts:27. Verify `xp_earned` vs `xp_awarded`.

### Goal 4: P1 API Auth Fixes
**Owner:** Avery (Dev Lead) | **Reviewer:** Riley (Infra)

1. **Add auth checks to 5 GET endpoints** — /api/beers, /api/breweries, /api/breweries/browse, /api/sessions/[id]/photos, /api/beers/barcode/[code].

### Goal 5: P2 Quick Wins
**Owner:** Avery (Dev Lead)

1. Non-interactive seasonal beer cards — remove or link
2. Promotions page mobile padding fix
3. Events delete success toast
4. Embed + Challenges metadata exports

---

## What's NOT in Sprint 92
- Drag-sort batching (Sprint 93)
- Silent delete failure fixes (Sprint 93)
- Rate limiting additions (Sprint 93)
- Sponsored challenge promotion hub (Sprint 93)

---

## Test Plan
- [ ] `npm run build` passes clean
- [ ] ActiveSessionsCounter updates on poll
- [ ] Embed page returns 403 for non-admin users
- [ ] Zero `motion.button` instances in codebase
- [ ] Discover tab shows no fake brewery names
- [ ] Beer list Edit button opens list editor
- [ ] Achievement notification link works
- [ ] Loyalty + Events show toasts on all mutations
- [ ] 3 new loading.tsx files exist
- [ ] 5 API GET endpoints require auth
- [ ] Existing tests pass (`npm run test`)

---

*This is a living document.* 🍺
