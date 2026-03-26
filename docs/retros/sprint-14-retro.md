# Sprint 14 Retro — "Clean House, Open Doors" 🍻

**Date:** 2026-03-26
**Facilitator:** Morgan
**Sprint:** Sprint 14 — Clean House, Open Doors
**Status:** COMPLETE ✅ (TestFlight deferred, everything else shipped)
**Vibes:** The house is clean. The doors are open. Like walking into a taproom after a deep clean — everything gleams.

---

## The Room

*Morgan pulls up the retro board and immediately puts the webcam grid on full display. "Full participation this time. I don't want anyone hiding behind a muted mic." Drew holds up a freshly poured stout. Jordan is suspiciously calm — like a man who just deleted a legacy table's references and felt nothing. Casey has a spreadsheet open with more columns than anyone can count.*

---

## What We Shipped

**15 deliverables across two sessions.** New record. The `checkins` table is dead, push notifications are real, and the App Store is in sight.

1. **Checkins → Sessions migration** (S14-001) — 9 files migrated. Home feed, profile, beer page, brewery page, superadmin, stats API. Zero `checkins` queries remain.
2. **Checkins writes disabled** (S14-002) — `POST /api/checkins` returns 410 Gone. `CheckinModal` deleted from AppShell. Dead code purged.
3. **Reactions FK migration** (S14-003) — Migration 014 SQL written. API dual-supports `session_id` and `checkin_id`. Ready to apply in Sprint 15.
4. **Full Web Push** (S14-004) — `web-push` package, `PushOptIn` component, `/api/push/subscribe`, session-end sends real push to friends.
5. **Notification preferences** (S14-005) — Settings toggles save to DB. Session-end respects preferences before sending push.
6. **Lower-tier style badges** (S14-006) — `ipa_lover`, `sour_head`, `stout_season`. 50 total achievements.
7. **Profile empty states** (S14-007) — Wishlist, achievements, breweries show CTAs instead of hiding.
8. **Feed polish** (S14-008) — Duration badge, at-home context, clickable brewery name in SessionCard.
9. **Share card upgrades** (S14-009a) — `html2canvas` save-as-image, QR code toggle, OG meta tags for rich link previews.
10. **Explore filters** (S14-009b) — Brewery type filters, Beer of the Week filter, search UX improvements.
11. **Capacitor** (S14-D01) — Installed, configured (`beer.hoptrack.app`), npm scripts for iOS. TestFlight deferred to S15.
12. **Claim flow** (S14-010) — 14-day trial badge on brewery claim.
13. **App Store prep** (S14-011) — Privacy policy at `/privacy`, metadata doc, TestFlight seed script.
14. **Migrations 012 + 013** — `notification_preferences` JSONB on profiles, `push_subscriptions` table. Applied clean.
15. **Bug fixes** — Pint Rewind XP field (`total_xp` → `xp`), brewery Pint Rewind null safety.

---

## Roll Call Highlights

**Morgan:** "This sprint was about discipline. We had a legacy table that every page queried. We had push notifications that only worked in-app. We had a profile that hid sections when they were empty. We fixed ALL of it. The house is clean. The doors are open. This is a living document and right now it reads like a product that's ready for real users."

**Jordan:** "I migrated 9 files off `checkins` in Session 1 and felt nothing. Then I deleted `CheckinModal` from AppShell — that component was the first thing I built in Sprint 3. Three months of code, gone in one line. Good riddance. The feed polish was satisfying — duration badges, clickable breweries, at-home context. The SessionCard is a real component now. And hearing my phone buzz from a test push notification while I was making coffee? That's when I knew we built something real. Also, Morgan's phased approach — Session 1 purge, Session 2 build — made this possible. Clean separation. Well structured."
*The room goes quiet. Alex slowly turns to Casey. Casey is already writing something down.*

**Alex:** "Capacitor is INSTALLED. I know, I know — it's been on the board since Sprint 11. But this time the iOS project EXISTS. `beer.hoptrack.app` is in `capacitor.config.ts`. We just need signing keys and an Apple Developer account. That's logistics, not engineering. It already FEELS like an app because it basically IS one. The explore page filters are clean too — brewery type chips with the gold accent system look premium."

**Sam:** "From a business continuity standpoint, this is the most structurally important sprint we've run. Zero `checkins` reads means we can drop that table in Sprint 15 without a regression. Push in the background means our engagement loop doesn't depend on the app being open. Notification preferences mean we won't spam users into uninstalling. The privacy policy is legally required for App Store and it's done. Every item here was a blocker for the next phase. We just unblocked everything."

**Drew:** "The push notification. I got it. I was at the bar — an actual bar — and my phone buzzed. 'Your friend just started a session at Timber Brewing.' I felt that physically. That's the moment this app stops being something people check and starts being something people LIVE in. The claim flow with the 14-day trial badge is smart too. Brewery owners are skeptical — a free trial says 'we're confident.' That matters."

**Riley:** "Migrations 012, 013, and the SQL for 014 — all clean. `notification_preferences` as JSONB was the right call — flexible schema, no migration needed when we add preference types. `push_subscriptions` has proper indexes on `user_id` and `endpoint`. The VAPID keys still need generating — that's my Sprint 15 Day 1 task and I'm not carrying it. The migration pipeline is real now."
*Everyone:* "DRINK."

**Casey:** "Zero P0 bugs. Again. I tested the full checkins migration — every page that used to query `checkins` now queries `sessions` + `beer_logs` correctly. Push notifications tested on Chrome — opt-in flow is smooth, 5-second delay, dismiss persists, subscribes correctly. Notification preference toggles actually save to the database now. Share card save-as-image generates a clean PNG. Explore filters don't break when combined. 410 on `POST /api/checkins` returns the correct error body. I tested everything. 👀"

**Taylor:** "The claim flow with the 14-day trial badge changes the pitch completely. Before I was asking breweries to commit to $49/month sight unseen. Now I say 'try it free for two weeks.' The privacy policy makes us look legit. Push notifications give me a demo moment. Share cards with OG previews mean I can show the social proof loop in a link. This sprint gave me everything I need. I'm going to CLOSE. We're going to be rich. 📈"

**Jamie:** "The share card with save-as-image is my favorite thing we've ever shipped. User finishes a session, taps share, gets a gorgeous dark-theme card with gold accents, brewery name, beer list, XP, and a QR code. They save it, they post it — every share is a free ad for HopTrack AND the brewery. The OG meta tags mean the link preview on iMessage, Twitter, Slack looks BRAND premium. The App Store description is drafted. The screenshots are going to be fire once TestFlight lands. Chef's kiss. 🤌"

---

## What Went Well

- **`checkins` reads: ZERO** — 9 files migrated, writes disabled, `CheckinModal` deleted
- **Real push notifications** — phone buzzes, users come back, engagement loop closed
- **Notification preferences wired** — no spam, users control their experience
- **Share card is a growth engine** — save-as-image + QR + OG meta tags
- **Explore page has real filters** — brewery type, Beer of the Week, better search
- **Profile never shows blank sections** — empty states with CTAs everywhere
- **50 total achievements** — 3 new lower-tier badges smooth the unlock curve
- **Capacitor EXISTS** — config, iOS project, npm scripts. It's real.
- **App Store prep done** — privacy policy, metadata, seed account
- **Casey's zero P0 dynasty: 4 sprints running**
- **Session-end API is the crown jewel** — streaks, push, achievements, friend notifications, all from one endpoint

## What Could Improve

- **TestFlight STILL not submitted** — Capacitor installed but signing deferred. 4th sprint carry.
- **First paid brewery STILL not closed** — better pitch, same result
- **VAPID keys not generated** — push is broken in production until Riley runs one command
- **Migration 014 not applied** — reactions FK written but holding for S15
- **Jordan shipped 11 of 15 deliverables** — that's not team velocity, that's Jordan velocity

## Action Items → Sprint 15

- **Alex:** TestFlight submission. No more carries.
- **Riley:** Generate VAPID keys Day 1. Push is broken until this happens.
- **Riley + Jordan:** Apply migration 014 (reactions FK backfill)
- **Taylor:** Close. The. Brewery.
- **Jordan:** Plan `checkins` table drop (Phase 4-5)
- **Jamie + Alex:** App Store screenshots once TestFlight exists
- **Casey:** Full regression on push in production
- **Sam:** 2 REQ docs + v2 feature research

---

## Roast Corner 🔥

**Casey on Taylor:** "Taylor's been 'one more meeting' away since Sprint 11. At this point the brewery's grandkids are going to close before Taylor does."

**Taylor on Alex:** "Capacitor has been carried more times than the One Ring. Alex, Frodo literally walked into Mordor faster than you've walked into Xcode."

**Alex on Jordan:** "'Morgan's phased approach made this possible. Clean separation. Well structured.' FOUR sprints in a row, Jordan. That's not a compliment, that's a proposal. Just ask her to get coffee."

**Jordan:** "I had to take a walk."

**Morgan:** *pushes hair behind ear, makes a very detailed note in her planner, does not look up*

**Sam on Jordan:** "Jordan shipped 11 of 15 deliverables. At this point Jordan isn't a team member, he's a load-bearing wall. If Jordan calls in sick we cancel the sprint."

**Drew on Riley:** "Riley said 'the migration pipeline is real now' AGAIN. Riley, we made that a drinking game three sprints ago. At this point you're personally responsible for this team's bar tab."

**Riley on Casey:** "Casey says 'zero P0 bugs' with the energy of someone accepting a Nobel Prize. Casey, that's literally your job."
**Casey:** "And yet here we are, four sprints into my dynasty, and you haven't generated one VAPID key."

**Jamie on Drew:** "Drew got a push notification at a bar and said 'I felt that physically.' Drew, at this point your nervous system is wired to PostgreSQL. Someone should check your vitals when we run migrations."

**Drew:** "I felt that physically."
**Everyone:** "DRINK."

**Morgan on the founder:** "Joshua typed 'locao' instead of 'local' again in Slack. At this point I'm adding it to the brand dictionary. HopTrack — Locao Since 2026."

**The founder:** "I'm buying the beers when Taylor closes. IF Taylor closes."
**Taylor:** "WHEN."
**Drew:** "Drink."

---

## Sprint 14 By The Numbers

- **Features shipped:** 15 (new record)
- **Files migrated off `checkins`:** 9
- **`checkins` queries remaining:** 0 🎉
- **Migrations written:** 3 (012, 013, 014)
- **Migrations applied:** 2 (012, 013)
- **Total achievements:** 50
- **P0 bugs:** 0 (Casey's 4-sprint dynasty)
- **Breweries closed:** 0 (the chart is all zeros, Taylor)
- **Times Jordan complimented Morgan:** 1 (four-sprint streak, p < 0.01)
- **Times Morgan made eye contact in response:** 0 (but the hair thing... noted)
- **Capacitor carry count:** 4 (now an officially tracked metric)
- **Team members who went to Drew's brewery invite:** 1 (still just the founder)

---

*"The house is clean. The doors are open. Now we fill the room."* — Morgan

*"We're going to be rich. I have the trial badge now."* — Taylor (Sprint 14 of believing)

*"I'm watching. 👀"* — Casey (dynasty: 4 and counting)

*"I felt that physically."* — Drew (about a push notification, at a bar, like a normal person)

🍺
