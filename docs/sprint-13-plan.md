# Sprint 13 Plan — "The Social Sprint" 🍻

**Date:** 2026-03-26
**PM:** Morgan
**Theme:** Consumer delight, social features, and closing the loop
**Sprint leads:** Jordan (dev), Alex (UX + mobile), Riley (infra), Taylor (revenue), Jamie (brand + growth)

> **Sprint goal:** Users open HopTrack for fun, not just logging. Beer wishlists, passport view, friends feed, and session share cards make the app sticky and shareable. Taylor closes the first paid brewery. Alex ships to TestFlight. Riley applies the damn migrations.

---

## Phase 0: Unfinished Business (Carry from Sprint 12)

### S13-C01: Apply migrations 007 + 008
**Owner:** Riley
**What:** Run `007_home_sessions_quantity.sql` and `008_brewery_admin_rls.sql` in Supabase SQL Editor
**Priority:** 🔴 P0 — BLOCKER. Do this before anything else.
**Why:** Written in Sprint 11, carried through Sprint 12. No more carrying.

### S13-C02: `checkins` table deprecation plan
**Owner:** Riley + Jordan
**What:** Write a deprecation plan for the `checkins` table:
- Identify all remaining code that queries `checkins`
- Migration to drop or archive the table
- Timeline commitment
**Priority:** 🟡 P1

### S13-C03: Capacitor → TestFlight
**Owner:** Alex
**What:** Build the iOS app with Capacitor, submit to TestFlight
- Carried from Sprint 11 → Sprint 12 → now Sprint 13
- This cannot carry again. Ship it or kill it.
**Priority:** 🟡 P1

### S13-C04: REQ backfill (2 docs minimum)
**Owner:** Sam
**Priority:** 🟡 P1

---

## Phase 1: Beer Wishlist (Consumer Profile Enhancement)

### S13-001: Beer wishlist
**Owner:** Jordan
**What:** Users can save beers they want to try
- New `wishlists` table: `id`, `user_id`, `beer_id`, `created_at`
- Migration 009: create table + RLS (users can CRUD their own)
- "Want to Try" button on beer detail page
- Wishlist section on user profile page
- Mark as "tried" when they log it (auto-remove from wishlist)
- API routes: `POST /api/wishlist`, `DELETE /api/wishlist/[id]`, `GET /api/wishlist`
**Design notes (Alex):**
- Heart/bookmark icon on beer cards
- Wishlist tab on profile page with beer card grid
- Empty state: "No beers on your list yet — explore breweries to find your next pour"
**Priority:** 🔴 P0

---

## Phase 2: Beer Passport

### S13-002: Beer passport — visual grid
**Owner:** Alex + Jordan
**What:** A visual grid of every unique beer a user has tried
- Query `beer_logs` grouped by `beer_id`, joined to `beers` for name/style/brewery
- Grid layout: beer "stamps" — small cards with beer name, brewery, date first tried
- Stats header: total unique beers, total styles, total breweries
- Filter by style, brewery, or rating
- Empty state: "Your passport is empty — start a session to collect your first stamp"
**Design notes (Alex):**
- Passport metaphor — each beer is a "stamp" in your passport
- Gold border on favorites (5-star ratings)
- Tap a stamp to see full beer detail
- Satisfying fill animation when a new stamp appears
**Priority:** 🔴 P0

---

## Phase 3: Social Feed

### S13-003: Friends activity on home feed
**Owner:** Jordan
**What:** See what friends are drinking in the home feed
- Query friends' sessions + beer_logs (respecting RLS)
- New `FriendSessionCard` component — "Morgan visited Pint & Pixel, had 3 beers"
- Interleave with user's own activity, sorted by time
- Tap friend's card → their profile
- Privacy: only show to accepted friends (existing `friends` table with `status = 'accepted'`)
**Priority:** 🔴 P0

### S13-004: Session share card
**Owner:** Jamie + Jordan
**What:** Beautiful share image when you end a session
- Generate a card image (or composited div → canvas → image) with:
  - Brewery name + logo
  - Beers logged (names + ratings)
  - Session duration
  - XP earned
  - HopTrack branding
- Share via Web Share API (native share sheet on mobile)
- Fallback: "Copy image" button
**Design notes (Jamie):**
- Dark theme + gold accent
- Brewery cover photo as background blur
- HopTrack logo watermark
- "Tracked on HopTrack" tagline
**Priority:** 🔴 P0

---

## Phase 4: Engagement & Retention

### S13-005: Push notifications — friend check-in
**Owner:** Riley + Jordan
**What:** "Your friend [name] just checked in at [brewery]"
- Supabase Edge Function triggered on new session
- Web Push API for PWA
- Notification preferences in settings (opt-in)
- Only notify for accepted friends
**Priority:** 🟡 P1

### S13-006: Beer of the Week (editorial)
**Owner:** Taylor + Jordan
**What:** Brewery owners can feature a "Beer of the Week" on their profile
- New column on `beers` table: `is_featured` boolean
- Brewery admin UI: toggle featured beer (max 1 at a time)
- Featured badge on beer card + brewery page
- Potential promo: "Try [Beer of the Week] and earn bonus XP"
**Priority:** 🟡 P1

### S13-007: Streak system
**Owner:** Jordan
**What:** Consecutive-day check-in streaks
- Track in `profiles` table: `current_streak`, `longest_streak`, `last_session_date`
- Update on session end
- Streak display on profile page (flame icon + count)
- Streak achievement: "7-Day Streak", "30-Day Streak"
- Grace period: allow 1 missed day before streak breaks (configurable)
**Priority:** 🟡 P1

### S13-008: Beer style badges
**Owner:** Jordan
**What:** Style-specific achievements
- "IPA Lover" — log 10 IPAs
- "Sour Head" — log 10 sours
- "Stout Season" — log 10 stouts
- "Wheat King" — log 10 wheat beers
- "Lager Legend" — log 10 lagers
- Map `beers.style` to badge categories
- Badge display on profile
**Priority:** 🟢 P2

---

## Phase 5: Infrastructure & Revenue

### S13-009: Error monitoring (Sentry)
**Owner:** Riley
**What:** Set up Sentry for Next.js — catch client + server errors
**Priority:** 🟡 P1

### S13-010: First paid brewery close
**Owner:** Taylor
**What:** Close. The. Brewery. Tap tier, $49/mo.
**Priority:** 🔴 P0 (Taylor's P0, the team's morale)

### S13-011: App Store submission prep
**Owner:** Jamie + Alex
**What:** Screenshots, description, keywords, icon for App Store listing
- Requires TestFlight build (S13-C03)
**Priority:** 🟡 P1 (blocked on S13-C03)

---

## Implementation Order

```
Week 1:
1. Riley: Apply migrations 007 + 008 (DAY ONE)
2. Jordan: Migration 009 (wishlists table)
3. Jordan: Beer wishlist API + UI (S13-001)
4. Alex + Jordan: Beer passport grid (S13-002)
5. Alex: Capacitor → TestFlight build (S13-C03)

Week 2:
6. Jordan: Friends activity feed (S13-003)
7. Jamie + Jordan: Session share card (S13-004)
8. Jordan: Streak system (S13-007)
9. Riley + Jordan: Push notifications MVP (S13-005)
10. Riley + Jordan: checkins deprecation plan (S13-C02)

Ongoing:
- Taylor: Close first brewery (S13-010)
- Sam: REQ backfill docs (S13-C04)
- Casey: QA regression on every new feature
- Jamie + Alex: App Store prep (S13-011)
```

---

## Success Criteria

- [ ] Migrations 007 + 008 applied in production Supabase
- [ ] Users can add/remove beers from wishlist
- [ ] Beer passport shows full grid of unique beers tried
- [ ] Home feed shows friends' sessions
- [ ] Session share card generates and shares
- [ ] TestFlight build submitted
- [ ] First paid brewery signed ($49/mo Tap tier)
- [ ] Zero P0 bugs (Casey's standard)

---

*"Users open HopTrack for fun, not just logging. That's the unlock."* — Morgan

*"We're going to be rich."* — Taylor

*"I'm watching. 👀"* — Casey

🍺
