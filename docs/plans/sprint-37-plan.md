# Sprint 37 — Grow Together

**Theme:** Growth mechanics, collaborative drinking, and the data story that closes deals.
**Status:** Complete
**Date:** 2026-03-30
**Sprint Lead:** Morgan

---

## Context

Sprint 36 closed the loop on sales-readiness. Sprint 37 is about building the engine that multiplies HopTrack's reach — referrals that reward users for bringing friends, group sessions that make drinking together visible in the app, and the HopTrack Report page that gives brewery owners a shareable proof of value story.

One critical S36 carry: `/api/sessions` POST was not rate-limited. That ships Day 1.

---

## Tickets

### S37-000 — Fix S36 Carry: Rate Limit Sessions POST
**Owner:** Riley · **Est:** 15 min

`/api/sessions` POST was specified in S36's rate limiting scope but was not applied. Add it now — this is the highest-volume write endpoint.

**Limit:** 10 sessions/hour per IP (sessions are not meant to be rapid-fire)

---

### P0 — Referral System
**Owner:** Avery · **Est:** 1.5 sessions

Every user becomes an acquisition channel. Invite codes drive signups, referrers earn XP.

**Migration 039 (partial):** `referral_codes` + `referral_uses` tables
- `referral_codes(id, user_id, code UNIQUE, created_at, use_count)`
- `referral_uses(id, referrer_id, referred_id UNIQUE, created_at)`
- `profiles.referred_by` — nullable, set on signup

**What to build:**
- `/api/referrals` — GET (get or create user's code), POST (redeem a code on signup)
- Referral card in Settings → "Invite Friends" section
- Invite link: `hoptrack.beer/join?ref=[code]`
- On successful referral: referrer gets +250 XP + `first_referral` or `connector` achievement
- Signup page: detect `?ref=` param, store in localStorage, submit on account creation

---

### P0 — Group Sessions V1
**Owner:** Avery · **Est:** 1.5 sessions

Let users tag friends to their session — "drinking together" as a first-class concept.

**Migration 039 (partial):** `session_participants` table
- `session_participants(id, session_id, user_id, invited_by, status, created_at)`
- `status: 'pending' | 'accepted' | 'declined'`
- UNIQUE(session_id, user_id)

**What to build:**
- `/api/sessions/[id]/participants` — GET (list), POST (invite), DELETE (leave/remove)
- "Drinking with" section in TapWallSheet footer — search friends, tap to invite
- Notification: `group_invite` type → "Joshua invited you to their session at Mountain Ridge"
- Participant avatars shown on SessionCard in feed ("with Drew, Mika +2")
- Accept/decline in notifications (same pattern as friend requests)

---

### P1 — HopTrack Report Page
**Owner:** Avery · **Est:** 1 session

Taylor needs a shareable proof-of-value for the first close. One page. Beautiful. Print-ready.

**Route:** `/brewery-admin/[brewery_id]/report`

**What to build:**
- Full-page cream/gold layout (matches The Board aesthetic)
- HopMark header with brewery name + generated date
- Key metrics grid: visits (7d/30d/90d), unique visitors, repeat %, avg rating
- "Your Top Beers" list (top 5 by pours)
- "Your Peak Hours" bar chart (reuse analytics data)
- "Your Biggest Fans" — top 3 customer avatars
- Print button (window.print()) + `@media print` CSS
- Nav item: "Report" with FileText icon

---

### P1 — Beer List Shareable URLs
**Owner:** Avery · **Est:** half session

Beer lists (S35) are public but have no consumer-facing page. Fix that.

**Route:** `/lists/[username]/[listId]` (under `(app)` route group)

**What to build:**
- Server component: fetch list + items + profile, verify `is_public`
- Layout: profile header (avatar, display name), list title + description
- Beer cards: name, style, brewery, avg rating, note
- If viewer is authenticated: AddToListButton on each beer
- If viewer is the owner: edit link back to profile

---

### P2 — Migration Consolidation Document
**Owner:** Quinn · **Est:** half session (docs only)

38 migrations is getting long. Document the final clean state — no actual squashing yet (too risky with remote data), but lay the groundwork.

**What to produce:**
- `docs/migration-state.md` — table of all 39 migrations, what they do, which are safe to squash in a future dev-env consolidation

---

## Deferred / Carry
- Supabase Edge Function for weekly brewery digest email (requires Resend account)
- TestFlight (Apple Developer account still needed)
- Feed infinite scroll beyond current implementation
- `beers.avg_rating` migration to pull from `beer_reviews` (decided against backfill)

---

## Team Notes
- **Morgan:** "The referral system is the thing that turns users into marketers. Ship it clean."
- **Taylor:** "The HopTrack Report page is my leave-behind after the demo. It has to look incredible."
- **Jordan:** "Group sessions — keep it simple. V1 is invite + accept + show in feed. Don't over-engineer."
- **Riley:** "Sessions POST rate limiting. I can't believe this slipped through S36. That's on me."
- **Drew:** "Group sessions need to work on mobile in the taproom. Tap once, invite. That's it."

---

## Key Architectural Changes
- Migration 039: `referral_codes`, `referral_uses`, `session_participants` tables + `profiles.referred_by`
- `/api/referrals` — GET/POST referral code management
- `/api/sessions/[id]/participants` — CRUD for group session participants
- `NotificationType` extended: `group_invite`, `first_referral`
- `/brewery-admin/[brewery_id]/report` — print-ready analytics summary page
- `/lists/[username]/[listId]` — public beer list page
- `lib/rate-limit.ts` applied to `/api/sessions` POST (limit: 10/hour)
