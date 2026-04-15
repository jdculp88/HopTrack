# Sprint 15 Plan — "Walk the Floor" 🍻

**Date:** 2026-03-26
**PM:** Morgan
**Theme:** Validation — design, QA, and BA audit every flow, then Jordan fixes what they find. No new features until the foundation is bulletproof.
**Sprint leads:** Jordan (fixes), Alex (design audit), Sam (BA/UX audit), Casey (QA regression), Riley (infra)

> **Sprint goal:** Every page loads gracefully, every error is caught, every button does what it says, every label says "session" not "check-in", dead code is gone, push notifications actually work, and the app is TestFlight-ready. No new features. Just trust.

---

## Phase 0: Infra — Day One (Riley)

### S15-001: Generate VAPID keys and configure environment
**Owner:** Riley
**Priority:** 🔴 P0
**What:** Push notifications are broken in production without VAPID keys. This unblocks everything.
- Run `npx web-push generate-vapid-keys`
- Add `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` to `.env.local` + production
- Verify `lib/push.ts` can send a test push
- Confirm `PushOptIn` subscribes successfully in Chrome + Safari
**Blocks:** All push-related QA

### S15-002: Apply migration 014 (reactions FK backfill)
**Owner:** Riley + Jordan
**Priority:** 🔴 P0
**What:** Migration 014 adds `session_id` and `beer_log_id` to reactions, backfills data. Written in S14, never applied.
- Review migration SQL one final time
- Apply via `supabase db push`
- Verify reactions API dual-support still works (`checkin_id` + `session_id`)
- Casey regression on reactions after migration
**Blocks:** S15-019 (checkins drop plan)

---

## Phase 1: Walk the Floor — Audits (Week 1)

All three auditors walk every page and flow independently. Findings go into shared audit docs with severity ratings.

### S15-003: Design audit — every page, every state
**Owner:** Alex
**Priority:** 🔴 P0
**What:** Walk every route at 375px / 768px / 1280px. Document:
- Visual inconsistencies (spacing, color, typography, border-radius)
- Missing loading states (13 known)
- Dead buttons, misleading labels, dead-end states
- Mobile responsiveness issues
- Dark theme + gold accent consistency
- Motion violations (any `motion.button`?)
**Deliverable:** `docs/audits/sprint-15-design-audit.md`

### S15-004: BA/UX audit — every user journey end-to-end
**Owner:** Sam
**Priority:** 🔴 P0
**What:** Walk every critical journey and document gaps:
- Signup → first session → share → profile → passport
- Friend request lifecycle (send, accept, decline)
- Explore → brewery detail → start session at brewery
- Brewery claim → pending → approved → admin dashboard
- Settings: profile edit, notification prefs, photo change
- Brewery admin: tap list CRUD, analytics, Pint Rewind, loyalty
- Superadmin: users, breweries, claims, stats
**Deliverable:** `docs/audits/sprint-15-ba-audit.md` with P0/P1/P2 ratings

### S15-005: QA regression — full pass, every route
**Owner:** Casey
**Priority:** 🔴 P0
**What:** Full regression:
- Happy path + sad path for every CRUD operation
- Push notification delivery (after S15-001)
- Session-end API (streaks, friend push, achievement checks, beer log persistence)
- Reactions on sessions (after S15-002)
- All 50 achievements trigger correctly
- Share card save-as-image + QR code
- Explore filters (type, Beer of the Week, search)
- Notification preference toggles save + respected
- Toast notifications fire for all mutations
- Mobile viewport testing (375px)
**Deliverable:** `docs/audits/sprint-15-qa-report.md`
**Standard:** Zero P0 bugs at sprint end.

---

## Phase 2: Fix What They Find (Jordan — Week 1-2)

### P0 — Critical Flow Fixes

#### S15-006: Wire friend Accept/Decline buttons
**Owner:** Jordan
**Priority:** 🔴 P0
**What:** `FriendsClient.tsx` has Accept/Decline buttons with no `onClick` handlers.
- Add handlers calling `PATCH /api/friends` (accept) / `DELETE /api/friends` (decline)
- Loading state on buttons during API call
- Optimistic UI: move accepted friend to friends list, remove declined
- Toast on success/error
- `useRouter().refresh()` after mutation
**File:** `app/(app)/friends/FriendsClient.tsx`

#### S15-007: Wire friend search + Add Friend
**Owner:** Jordan
**Priority:** 🔴 P0
**What:** Friends search box updates state but never filters. No way to add friends.
- Client-side filter of existing friends by username/display_name
- Debounced API search (300ms) to find all users
- "Add Friend" button on search results → `POST /api/friends`
- Toast on success
**Files:** `app/(app)/friends/FriendsClient.tsx`, new `app/api/users/search/route.ts`

#### S15-008: Delete dead code
**Owner:** Jordan
**Priority:** 🔴 P0
**What:** Two components with zero imports:
- `components/social/CheckinCard.tsx` (189 lines)
- `components/checkin/CheckinModal.tsx` (750 lines)
- Delete both, verify build passes
**Estimate:** 10 minutes

### P1 — Loading & Error States

#### S15-009: Add loading.tsx to auth routes
**Owner:** Jordan
**Priority:** 🟡 P1
**What:** `app/(auth)/login/loading.tsx` + `app/(auth)/signup/loading.tsx`
- Centered card skeleton with form field placeholders

#### S15-010: Add loading.tsx to superadmin routes
**Owner:** Jordan
**Priority:** 🟡 P1
**What:** 6 files:
- `superadmin/loading.tsx` (stats grid)
- `superadmin/users/loading.tsx` (table)
- `superadmin/breweries/loading.tsx` (table)
- `superadmin/claims/loading.tsx` (table)
- `superadmin/stats/loading.tsx` (stats grid)
- `superadmin/content/loading.tsx` (cards)

#### S15-011: Add loading.tsx to remaining routes
**Owner:** Jordan
**Priority:** 🟡 P1
**What:** 5 files:
- Root `/` landing page skeleton
- `/privacy` text skeleton
- `/for-breweries` pricing skeleton
- `/session/[id]` minimal skeleton
- `brewery-admin/` index redirect skeleton

#### S15-012: Add error.tsx to 3 route groups
**Owner:** Jordan
**Priority:** 🟡 P1
**What:** Zero `error.tsx` files exist. Add:
- `app/(app)/error.tsx`
- `app/(brewery-admin)/error.tsx`
- `app/(superadmin)/error.tsx`
- All: `"use client"`, `Sentry.captureException(error)`, friendly message, "Try again" reset button, CSS vars

### P1 — UI Copy & Flow Fixes

#### S15-013: Replace all "check-in" copy → "session"/"visit"/"pour"
**Owner:** Jordan
**Priority:** 🟡 P1
**What:** 14 locations across 8 files:
1. `brewery/[id]/page.tsx` — "Check-ins" → "Visits"
2. `profile/[username]/page.tsx` — "Check-ins" → "Sessions"
3. `friends/FriendsClient.tsx` (3 locations) — tab label, leaderboard label, friend row stat
4. `tap-list/TapListClient.tsx` — beer count label → "pours"
5. `superadmin/users/page.tsx` — table header → "Sessions"
6. `superadmin/page.tsx` — stat label → "Total Sessions"
7. `privacy/page.tsx` — legal text update
8. `layout.tsx` — SEO keywords

#### S15-014: Fix /session/[id] share page for social crawlers
**Owner:** Jordan
**Priority:** 🟡 P1
**What:** Currently redirects — OG meta tags may not work. Build a real landing page:
- Session summary card (brewery, beers, XP, duration)
- "Open in HopTrack" CTA button
- Keep existing OG meta tags
**File:** `app/session/[id]/page.tsx`

#### S15-015: Wire "Change photo" button in settings
**Owner:** Jordan
**Priority:** 🟡 P1
**What:** Dead button. Connect to `ImageUpload` component:
- Upload to Supabase Storage `avatars` bucket
- Update `profiles.avatar_url` on success
- Preview before save
- Toast on success
**File:** `app/(app)/settings/SettingsClient.tsx`

#### S15-016: Add "Add Friend" button on other users' profiles
**Owner:** Jordan
**Priority:** 🟡 P1
**What:** Viewing another user's profile has no friend action.
- Check friendship status → show "Add Friend" / "Pending" / "Friends" state
- Call `POST /api/friends` on click
- Toast on success
**File:** `app/(app)/profile/[username]/page.tsx` (extract `FriendButton.tsx` client component)

### P2 — Polish

#### S15-017: Post-signup onboarding card
**Owner:** Jordan + Alex
**Priority:** 🟢 P2
**What:** New users land on empty feed with no guidance.
- Detect first-time user (0 sessions)
- Welcome card: "Start a session" / "Log a beer" / "Add friends"
- Dismiss on first session or manual tap
- Store dismiss in `localStorage`

#### S15-018: Claim flow — trial badge on pending view
**Owner:** Jordan
**Priority:** 🟢 P2
**What:** 14-day trial badge shows on success step but NOT on pending view.
- Add trial info block to pending claim status
- Add timeline messaging ("typically approved within 24 hours")
**File:** `app/(brewery-admin)/brewery-admin/claim/ClaimBreweryClient.tsx`

---

## Phase 3: Ship Prep (Week 2)

### S15-019: Write migration 015 — checkins table drop
**Owner:** Jordan + Riley
**Priority:** 🟡 P1
**What:** Phase 4-5 of `docs/checkins-deprecation-plan.md`:
- Archive `checkins` to JSON export
- Drop FK constraints
- Drop table
- Update `types/database.ts` to remove Checkin types
- Remove `app/api/checkins/route.ts`
- **WRITE ONLY — apply in Sprint 16**

### S15-020: TestFlight submission
**Owner:** Alex
**Priority:** 🟡 P1 (5th carry — must ship)
**What:** Hard deadline. No more carries.
- Confirm Apple Developer account is active (Day 1 — escalate to founder if not)
- Build with Capacitor (`npm run ios:build`)
- Test on physical device
- Submit to TestFlight

### S15-021: Close first brewery
**Owner:** Taylor
**Priority:** 🔴 P0
**What:** Midpoint check-in.
- If signed: begin onboarding, trigger Customer Success hire discussion
- If not signed by sprint end: Morgan + Taylor hard reassess go-to-market

---

## Standing Commitments

- **Drew:** Validate brewery admin flows post-fixes, confirm tap list + loyalty + analytics are production-ready
- **Jamie:** Review all copy changes (S15-013), confirm brand consistency across all fixes
- **Morgan:** Triage audit findings, break priority ties, run midpoint check-in + retro
- **Sam:** 2 REQ backfill docs on top of BA audit
- **Casey:** Re-test every fix Jordan ships. Zero P0 at sprint end.

---

## Implementation Order

```
Day 1 (Parallel):
  Riley: VAPID keys (S15-001)
  Riley + Jordan: Apply migration 014 (S15-002)
  Jordan: Delete dead code (S15-008) — 10 min
  Alex: Begin design audit (S15-003)
  Sam: Begin BA/UX audit (S15-004)
  Casey: Begin QA regression (S15-005)

Days 2-3:
  Jordan: Wire friend Accept/Decline (S15-006)
  Jordan: Wire friend search + Add Friend (S15-007)
  Auditors: Continue walking the floor
  Casey: Test push after VAPID keys are live

Days 4-5 (Week 1 close):
  Jordan: Loading states — auth (S15-009), superadmin (S15-010), remaining (S15-011)
  Jordan: Error boundaries — 3 route groups (S15-012)
  Auditors: Deliver audit reports

Days 6-7 (Week 2 start):
  Jordan: UI copy replacement — 14 locations (S15-013)
  Jordan: Fix /session/[id] share page (S15-014)
  Jordan: Wire profile photo change (S15-015)
  Casey: Re-test all Week 1 fixes

Days 8-9:
  Jordan: Add Friend button on profiles (S15-016)
  Jordan: Onboarding card (S15-017)
  Jordan: Claim flow trial badge (S15-018)
  Alex: TestFlight build + submission (S15-020)

Day 10:
  Jordan + Riley: Write checkins drop migration (S15-019)
  Casey: Final full regression
  Morgan: Sprint retro

Ongoing:
  Taylor: Close brewery (S15-021)
  Casey: QA on every fix as it ships
  Sam: REQ backfill (2 docs)
```

---

## Migrations This Sprint

| # | Name | What |
|---|------|------|
| 014 | `reactions_fk_backfill` | APPLY existing — session_id + beer_log_id on reactions |
| 015 | `drop_checkins` | WRITE ONLY — archive + drop checkins table (apply in S16) |

---

## Success Criteria

- [ ] VAPID keys live, push delivers when app is closed (Chrome + Safari)
- [ ] Migration 014 applied, reactions work on sessions
- [ ] Friend Accept/Decline buttons functional with optimistic UI
- [ ] Friend search works + "Add Friend" from search results
- [ ] "Add Friend" button visible on other users' profiles
- [ ] `CheckinCard.tsx` and `CheckinModal.tsx` deleted
- [ ] 13 pages have `loading.tsx` skeletons
- [ ] 3 route-group `error.tsx` files exist
- [ ] Zero UI instances of "check-in" — all replaced with "session"/"visit"/"pour"
- [ ] `/session/[id]` renders a real page with OG tags (not redirect)
- [ ] "Change photo" button works with ImageUpload
- [ ] New user onboarding card on empty home feed
- [ ] Claim pending view shows 14-day trial info
- [ ] Migration 015 written and reviewed (not applied)
- [ ] Audit docs delivered: design, BA/UX, QA report
- [ ] TestFlight submitted OR blocker escalated with resolution plan
- [ ] First brewery signed OR go-to-market strategy reassessed
- [ ] Zero P0 bugs (Casey's standard)

---

*"Walk every floor before you open the doors."* — Morgan

*"Zero P0 bugs. ZERO."* — Casey (dynasty: 5 and counting, if she has her way)

*"If it doesn't feel right, it isn't right."* — Alex

*"We're going to be rich — but first, we're going to be solid."* — Taylor

🍺
