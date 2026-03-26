# Sprint 14 Plan — "Clean House, Open Doors" 🍻

**Date:** 2026-03-26
**PM:** Morgan
**Theme:** Kill the legacy, ship real push notifications, close the first deal
**Sprint leads:** Jordan (dev), Riley (infra), Alex (mobile), Taylor (revenue), Jamie (brand)

> **Sprint goal:** The `checkins` table stops being queried. Push notifications work for real. Taylor signs a brewery. Alex ships to TestFlight. The codebase is clean enough to hand to a new hire without embarrassment.

---

## Phase 0: Day One Decisions

### S14-D01: Capacitor → TestFlight — SHIPPING
**Owner:** Alex
**What:** Decision made: we're shipping it. No more carries.
- Day 1: `npm install @capacitor/core @capacitor/cli @capacitor/ios`, `npx cap init`, generate iOS project
- Day 2-3: App icon (1024x1024 + all sizes), splash screen, iOS signing + provisioning profile
- Day 4: Build, test on simulator, fix any WebView issues
- Day 5: TestFlight submission
- Alex owns this end-to-end. Jamie provides App Store copy + screenshots in parallel.
**Priority:** 🔴 P0

### S14-D02: First paid brewery — close or pivot
**Owner:** Taylor + Morgan
**What:** Taylor has been "one more meeting" away for 3 sprints.
- Hard deadline: signed contract by end of Sprint 14 or reassess the revenue timeline
- Taylor reports status at sprint midpoint
**Priority:** 🔴 P0

---

## Phase 1: Kill the `checkins` Table (Phase 2-3 of Deprecation Plan)

### S14-001: Migrate all remaining `checkins` reads to `sessions` + `beer_logs`
**Owner:** Jordan
**Priority:** 🔴 P0
**What:** Per `docs/checkins-deprecation-plan.md`, Phase 2 — replace every remaining query that touches `checkins`:
- `app/(app)/home/page.tsx` — sessions-only feed (remove checkins merge)
- `app/(app)/profile/[username]/page.tsx` — Beer Journal from beer_logs
- `app/(app)/beer/[id]/page.tsx` — reviews + flavor tags from beer_logs
- `app/(app)/brewery/[id]/page.tsx` — stats aggregates from sessions/beer_logs
- `app/(superadmin)/` pages — stats from sessions/beer_logs
- `app/api/admin/stats/route.ts` — stats API
- `HomeFeed.tsx` — remove dual-table merge logic, sessions only

### S14-002: Disable `checkins` writes + remove legacy components
**Owner:** Jordan
**Priority:** 🔴 P0
**What:** Phase 3 of deprecation plan:
- Return 410 Gone from `POST /api/checkins`
- Remove `useCheckin` hook (or mark deprecated)
- Remove `CheckinModal` from AppShell (currently disabled with `&& false`)
- Clean up imports and dead code
- Update `types/database.ts` to mark checkins types as deprecated

### S14-003: Plan reactions FK migration
**Owner:** Jordan + Riley
**Priority:** 🟡 P1
**What:** The `reactions` table has a FK to `checkins.id`. Before we can drop `checkins` (Phase 4-5), we need a migration plan:
- Map reactions to sessions/beer_logs
- Write migration SQL (don't apply yet — Sprint 15)
- Document in deprecation plan

---

## Phase 2: Real Push Notifications

### S14-004: Full Web Push with VAPID keys
**Owner:** Riley + Jordan
**Priority:** 🔴 P0
**What:** Push notifications currently only work in-app. Ship real Web Push:
- Generate VAPID key pair, store in env vars
- New migration: `push_subscriptions` table (user_id, endpoint, keys, created_at)
- Browser `PushManager.subscribe()` in app shell (opt-in prompt)
- Server-side push sending from session-end API (friend notifications)
- Test on Chrome + Safari (iOS 16.4+)

### S14-005: Notification preferences — wire up settings toggles
**Owner:** Jordan
**Priority:** 🟡 P1
**What:** Settings page has notification toggles but they're no-ops (`onChange={() => {}}`):
- Add `notification_preferences` JSONB column to `profiles` (migration 012)
- Wire toggles to save: friend_activity, achievements, weekly_stats
- Session-end API respects preferences before sending push
- Default: all enabled

---

## Phase 3: Consumer Polish

### S14-006: Add lower-tier style badges
**Owner:** Jordan
**Priority:** 🟡 P1
**What:** Add stepping-stone badges below existing ones:
- `ipa_lover` — 10 IPAs (stepping stone to `hop_head` at 20)
- `sour_head` — 5 sours (stepping stone to `sour_patch` at 10)
- `stout_season` — 5 stouts/porters (stepping stone to `dark_side` at 10)
- Add to `lib/achievements/definitions.ts`
- Session-end API already checks styles — just needs new entries
- ~1 hour

### S14-007: Profile empty states + polish
**Owner:** Jordan + Alex
**Priority:** 🟡 P1
**What:** Several profile sections hide when empty instead of showing helpful CTAs:
- Wishlist: "Save beers you want to try" placeholder with link to explore
- Achievements: "Start earning badges" with link to achievements page
- Top Breweries: "Visit breweries to see your favorites"
- Achievement badges: show unlock date
- Add photos from beer_logs to Beer Journal entries (if `cover_image_url` exists)

### S14-008: Feed polish — session duration + context badges
**Owner:** Jordan
**Priority:** 🟡 P1
**What:** Make SessionCard richer:
- Add duration badge ("1h 30m") to SessionCard footer
- Add context label ("At home" vs brewery name)
- Show Beer of the Week badge if a session beer is currently featured
- Make brewery name clickable in card header

### S14-009a: Share card improvements
**Owner:** Jamie + Jordan
**Priority:** 🟡 P1
**What:** Current share card is DOM-based text sharing. Level it up:
- Add Open Graph meta tags for shared session URLs (rich link previews on social)
- Add "Save as image" option using html2canvas or dom-to-image
- QR code linking back to brewery page

### S14-009b: Explore page filters
**Owner:** Jordan + Alex
**Priority:** 🟢 P2
**What:** Explore page is basic — search + visited filter only:
- Add brewery type filter (brewpub, taproom, production)
- Add "has Beer of the Week" filter
- Improve search with debounce loading indicator
- Add "last visited" date on brewery cards for returning users

---

## Phase 4: Revenue & Brand

### S14-010: First paid brewery close
**Owner:** Taylor
**Priority:** 🔴 P0
**What:** Sign the contract. Tap tier, $49/mo.
- Midpoint check-in: Taylor reports status
- If signed: trigger Customer Success hire discussion
- If not signed by sprint end: Morgan + Taylor reassess timeline and strategy

### S14-011: App Store prep
**Owner:** Jamie + Alex
**Priority:** 🟡 P1
**What:** TestFlight is shipping — App Store prep runs in parallel:
- App Store screenshots (5 screens: home feed, passport, brewery, tap wall, share card)
- App Store description + keywords
- App icon finalization (1024x1024 master + all required sizes)
- Privacy policy URL (needed for submission)
- App preview video (optional but high-impact)

---

## Standing Commitments

- **Sam:** 2 REQ backfill docs minimum
- **Casey:** QA regression on checkins migration + push notifications + all S14 features
- **Casey:** Verify zero regressions from checkins removal (critical — test every page that used to query checkins)

---

## Implementation Order

```
Day 1:
1. Alex: Capacitor init + iOS project setup (S14-D01)
2. Riley: Generate VAPID keys, create push_subscriptions migration (S14-004)
3. Jordan: Start checkins read migration — home feed first (S14-001)

Week 1:
4. Jordan: Continue checkins migration — profile, beer, brewery pages (S14-001)
5. Jordan: Remove legacy CheckinModal + useCheckin + disable writes (S14-002)
6. Riley + Jordan: Web Push subscription flow + server-side sending (S14-004)
7. Jordan: Notification preferences backend (S14-005)
8. Alex: iOS build, signing, simulator testing (S14-D01)
9. Jamie: App Store copy, screenshots, description (S14-011)
10. Casey: Regression testing on migrated pages (CRITICAL)

Week 2:
11. Alex: TestFlight submission (S14-D01)
12. Jordan: Lower-tier style badges (S14-006) — 1 hour
13. Jordan: Profile empty states + achievement dates (S14-007)
14. Jordan: Feed polish — duration + context badges (S14-008)
15. Jordan + Jamie: Share card improvements — OG tags, save-as-image (S14-009a)
16. Jordan: Explore page filters (S14-009b)
17. Jordan + Riley: Reactions FK migration plan (S14-003)
18. Casey: Full regression pass on everything

Ongoing:
- Taylor: Close the brewery (S14-010)
- Sam: REQ backfill (2 docs)
- Casey: QA on every feature as it ships
```

---

## Migrations This Sprint

| # | Name | What |
|---|------|------|
| 012 | `notification_preferences` | JSONB column on `profiles` for notification settings |
| 013 | `push_subscriptions` | New table for Web Push subscription storage |

---

## Success Criteria

- [ ] Zero queries to `checkins` table in app code
- [ ] `POST /api/checkins` returns 410 Gone
- [ ] `CheckinModal` removed from codebase
- [ ] Web Push notifications deliver when app is closed (Chrome + Safari)
- [ ] Notification toggles in settings actually save and are respected
- [ ] ~~TestFlight build submitted to Apple~~ → deferred to S15
- [x] App Store metadata + privacy policy ready
- [ ] 3 new lower-tier style badges live (ipa_lover, sour_head, stout_season)
- [ ] Profile empty states show CTAs instead of hiding
- [ ] SessionCard shows duration + context
- [ ] Share card has OG meta tags for rich link previews
- [ ] First paid brewery signed OR revenue timeline reassessed
- [ ] Zero P0 bugs (Casey's standard)

---

*"Clean the house so we can open the doors."* — Morgan

*"We're going to be rich."* — Taylor (this time he means it)

*"I'm watching. 👀"* — Casey
