# Sprint 13 Retro — "The Social Sprint" 🍻

**Date:** 2026-03-26
**Facilitator:** Morgan
**Sprint:** Sprint 13 — Consumer Delight & Social
**Status:** NEARLY COMPLETE ✅ (code shipped, a few carries)
**Vibes:** Electric. Like walking into a taproom and every seat is full and every tap is pouring.

---

## The Room

*Morgan opens the retro board. Jordan is already leaning back in his chair like he just ran a marathon. Alex is swiping through the passport UI on their phone with a grin. Taylor has a pitch deck open on a second monitor. Casey has a checklist with more green checkmarks than anyone thought possible. Drew has a beer. Of course Drew has a beer.*

---

## What We Shipped

This was our biggest sprint. Period. We shipped **12 features** in two sessions:

1. **Beer Wishlist** (S13-001) — `WishlistButton` component, full CRUD API, profile wishlist section, auto-remove on beer log. Users can finally save beers they want to try.
2. **Beer Passport** (S13-002) — `/profile/[username]/passport` with stamp grid, stats header, style/brewery/rating filters. The passport metaphor is *alive*.
3. **Friends Feed** (S13-003) — All/Friends/You filter tabs on the home feed. Beer names now show correctly in `SessionCard`. The social loop is closed.
4. **Session Share Card** (S13-004) — Dark + gold modal with brewery name, beers logged, XP earned. Web Share API on mobile, clipboard fallback on desktop. Jamie is already planning the Instagram campaign.
5. **Streak System** (S13-007) — Migration 009 added `current_streak`, `longest_streak`, `last_session_date` to profiles. Session-end API calculates streaks with 1-day grace period. Flame icon on profile.
6. **Beer Style Badges** (S13-008) — `wheat_king` and `lager_legend` achievements with style-based checks. Style achievement system is extensible for IPA/Sour/Stout badges.
7. **Beer of the Week** (S13-006) — `is_featured` column on beers (migration 011), brewery admin toggle (max 1), featured badge on consumer beer cards and brewery pages.
8. **Push Notifications MVP** (S13-005) — In-app friend notifications on session end. Service worker handles push + notification click routing. Full Web Push with VAPID keys is next.
9. **Sentry Error Monitoring** (S13-009) — `@sentry/nextjs` wired up with client, server, and edge configs. Global error page at `app/global-error.tsx`. Riley can finally sleep.
10. **`checkins` Deprecation Plan** (S13-C02) — Full plan at `docs/checkins-deprecation-plan.md`. Timeline committed. No more ambiguity.
11. **REQ Backfill** (S13-C04) — REQ-012 (Beer Wishlist) and REQ-013 (Beer Passport) documented. Sam is caught up.
12. **Migrations 009, 010, 011** all written and applied. Riley delivered. The streak is real (pun intended).

---

## Roll Call Highlights

**Morgan:** "This is the sprint where HopTrack became a *product* people would open for fun. Wishlist, passport, friends feed, share cards — these aren't just features, they're loops. Users discover beers, save them, try them, share them, compare with friends. That's the flywheel. This is a living document and right now it's a very, very good one."

**Jordan:** "Twelve features in two sessions. I'm not going to pretend that wasn't intense. The session-end API is doing real work now — streaks, friend notifications, achievement checks, beer log persistence — it's the hub of the whole system. The passport was my favorite to build. The stamp grid with the gold borders on 5-star ratings... Alex nailed the design spec. I just... built what she described and it worked. The friends feed filter tabs were clean too. And uh, Morgan's sprint plan was really well-structured. The phased approach made it possible to ship this much without losing our minds."
*Alex mouths "down bad" to Casey. Casey nods. Jordan stares at his coffee.*

**Alex:** "The passport is the best thing in this app. You open it and you see every beer you've ever tried, laid out like stamps. The gold borders on favorites. The filter chips. It already FEELS like something you'd show someone at a bar. And the share card — dark background, gold text, brewery name, your beers — that's going to be everywhere on Instagram. It FEELS premium. Also, the wishlist heart icon animates on tap. Small thing but it matters."

**Sam:** "From a business continuity standpoint, this sprint addressed every major gap in the consumer experience. Wishlist gives users a reason to come back. Passport gives them a sense of progress. Friends feed gives them social proof. Share cards give them a reason to recruit. The deprecation plan for `checkins` is critical — we now have a committed timeline to remove the legacy table. REQ-012 and REQ-013 are documented. I'm caught up on backfill for the first time in three sprints."

**Drew:** "I felt that physically — the friends feed. You're sitting at the bar and you see your buddy just checked in across town. That's real. That's what makes people keep the app open. The Beer of the Week toggle is exactly what brewery owners need for Friday specials. One tap, featured beer, done. No spreadsheets, no chalkboard photos. My P0 list? Clear. All of it. For the first time since Sprint 3."

**Riley:** "The migration pipeline is real now — and I mean actually real this time, not 'I promise' real. 009 for streaks, 010 for style achievements, 011 for featured beers. All written, all applied, all tested. Sentry is live — client errors, server errors, edge errors, all captured. The global error page catches unhandled crashes gracefully. And the checkins deprecation plan has my name on the timeline. I'm committed."

**Casey:** "Zero P0 bugs open right now. ZERO. I tested every new feature — wishlist CRUD, auto-remove on log, passport filters, friends feed tabs, share card generation, streak calculation with grace period, Beer of the Week toggle, push notification delivery. The session-end API is doing a LOT now and it's all covered. I'm satisfied. For now. 👀"

**Taylor:** "Okay the BREWERY. I'm in final conversations. They've seen the passport, the share cards, the Beer of the Week toggle — they get it. The pitch is stronger than it's ever been because now I can show them what their CUSTOMERS see, not just the dashboard. Wishlist + passport + share cards = users marketing the brewery FOR them. We're going to be rich. 📈 I just need one more meeting."

**Jamie:** "The share card is going to change everything for growth. Users share their session — dark theme, gold accents, brewery name, beer list — and it's basically a free ad for HopTrack AND the brewery. Instagram Stories, Twitter, group chats. That's the organic growth loop we've been missing. Chef's kiss. 🤌 The passport stamps are also incredibly screenshot-worthy. App Store screenshots are going to write themselves."

---

## What Went Well

- **12 features shipped in two sessions** — highest output sprint in project history
- Beer wishlist + passport + friends feed = the consumer flywheel is REAL
- Session share card = organic growth loop ready to go
- Streak system with grace period — engagement hook shipped
- Beer of the Week — brewery owners get instant promotional tool
- Sentry monitoring — we can see errors before users report them
- `checkins` deprecation plan committed — tech debt has a timeline
- All 3 migrations (009, 010, 011) written AND applied — Riley's redemption arc
- REQ backfill caught up (Sam)
- Drew's P0 list: fully clear for the first time
- Casey's zero P0 streak: still alive
- Session-end API is a proper hub — streaks, notifications, achievements all centralized
- The Morgan → Jordan sprint plan → execution pipeline is *dialed*

## What Could Improve

- **Capacitor → TestFlight** still not shipped — carried from Sprint 11 → 12 → 13. Fourth carry would be embarrassing. Alex needs to ship or we need to make a call.
- **First paid brewery** still not closed — Taylor is close but "close" has been the status for three sprints
- **Full Web Push with VAPID keys** — MVP is in-app only, need real push for engagement
- **App Store submission prep** blocked on TestFlight build
- Sprint velocity was incredible but came in bursts — need to discuss sustainability
- Some features (style badges) only have 2 of 5 planned achievements — need to finish the set

## Action Items (Carry to Sprint 14)

- **Alex:** Capacitor → TestFlight — SHIP IT or we descope it. Decision by Sprint 14 Day 1.
- **Taylor:** Close the brewery. Period. One more meeting → signed contract.
- **Riley:** Full Web Push with VAPID keys — push notifications need to work when the app is closed
- **Jamie + Alex:** App Store prep — blocked on TestFlight, but screenshots and copy can start now
- **Jordan:** Finish remaining style badges (ipa_lover, sour_head, stout_season)
- **Casey:** Full regression on all Sprint 13 features
- **Sam:** Continue REQ backfill cadence (2 per sprint)

---

## Roast Corner 🔥

**Casey on Taylor:** "Taylor said 'one more meeting' in Sprint 11. And Sprint 12. At this point the brewery is going to IPO before Taylor closes them."

**Taylor on Alex:** "Capacitor → TestFlight has been carried more times than a keg at last call. Alex, the App Store literally just needs an IPA file, not a barrel-aged release strategy."

**Drew on Riley:** "Riley finally applied migrations. Three of them. In one sprint. Riley discovered batch processing and it changed everything. Welcome to 2026, Riley."

**Riley:** "...The migration pipeline is real now."
**Everyone:** "DRINK."

**Alex on Jordan:** "'Morgan's sprint plan was really well-structured.' Jordan, you said the quiet part loud. Again. That's two retros in a row. At this point it's not subtext, it's just... text."

**Jordan:** "I had to take a walk."

**Morgan:** *pushes hair behind ear, makes a very detailed note in her planner, does not look up*

**Sam on the whole team:** "We shipped 12 features in two sessions and no one has been outside in 48 hours. We're building a beer app. Please go drink a beer. At a real brewery. With sunlight."

**Drew:** "I literally invited all of you last Friday. ONE person showed up. And it was the founder."

**Jamie on Drew:** "Drew keeps saying 'I felt that physically' about database changes. At this point his nervous system is wired to PostgreSQL."

**Drew:** "I felt that physically."
**Everyone:** "DRINK."

---

## Sprint 13 By The Numbers

- **Features shipped:** 12 (new record)
- **Migrations applied:** 3 (009, 010, 011)
- **New components:** WishlistButton, SessionShareCard, passport page, friends feed tabs
- **API routes added/modified:** 6
- **P0 bugs:** 0 (Casey's dynasty continues)
- **Breweries closed:** 0 (Taylor... we're watching)
- **Times Jordan complimented Morgan's work:** 1 (three-sprint streak, documented)
- **Times Morgan made eye contact in response:** 0 (but the hair thing... noted)
- **Drew's P0 list items remaining:** 0 (HISTORIC)
- **Beers actually consumed by team during sprint:** unclear, but Drew had at least 3

---

## Looking Ahead — Sprint 14

Morgan will publish the Sprint 14 plan, but early signals:
- **TestFlight decision** — ship or descope, no more carries
- **First revenue** — Taylor closes or we reassess the timeline
- **Full push notifications** — VAPID keys, background push, notification preferences
- **Remaining style badges** — complete the set (ipa_lover, sour_head, stout_season)
- **`checkins` table deprecation** — begin executing the plan
- **App Store submission** — if TestFlight lands, Jamie + Alex prep the listing

---

*"This is the sprint where HopTrack became sticky. Users don't just log beers now — they collect stamps, chase streaks, share sessions, and watch what friends are drinking. That's not a utility. That's a product."* — Morgan

*"We're going to be rich."* — Taylor (sprint 13 of saying this. one day he'll be right.)

*"I'm watching. 👀"* — Casey (always)

*"I felt that physically."* — Drew (about everything)

🍺
