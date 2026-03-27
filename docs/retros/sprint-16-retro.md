# Sprint 16 Retro — "Turn It Up" 🍺
### 2026-03-27 · The Full Team

---

**Morgan 🗂️** — Okay, let's do this. Sprint 16 was legitimately our best sprint by the numbers. 16 of 16 shipped, zero P0s open, migrations all applied clean, build passing. That's a perfect sprint on paper. I want to talk about *why* it worked and what we're dragging into S17 that we need to stop dragging. As always — wins first, then honest, then roast. Let's go.

---

## 🏆 What Went Well

**Jordan 💻** — The architecture held up. Comments, events, achievements, analytics — all touched different parts of the codebase and nothing broke anything else. The pattern of keeping migrations small and sequential is paying dividends. Also The Board is genuinely sick. Real-time tap list on a wall TV powered by Supabase Realtime. That's the kind of thing Drew can demo to literally every brewery owner he knows.

**Alex 🎨** — The Events admin UI came out *clean*. Six event type tiles as a button grid instead of a dropdown — that was the right call. It already feels like an app. The AnimatePresence on the delete confirmation in EventCard, the spring on the modal — all of it lands right. Also the "Event" badge on Explore cards is subtle but perfect. Blue, small, doesn't compete with "Visited." Chef's kiss. 🤌

**Riley ⚙️** — Seven migrations in one sprint, all applied cleanly to remote, no incidents. The `IF NOT EXISTS` syntax error on migration 020 was caught immediately and fixed before it could cause real damage. The migration pipeline is real now and it's holding. Also shoutout to the `DROP POLICY IF EXISTS` pattern — idempotent SQL saves lives.

**Sam 📊** — The loyalty dashboard enhancement is the one I'm most excited about from a user standpoint. Brewery owners can now *see* who's close to a free pint. That's not just analytics — that's actionable intelligence. "Hey, Sarah's at 9/10 stamps, buy her a beer and she'll be back next week." That's the product working the way it should.

**Drew 🍻** — The 86'd toggle. The drag reorder. The Board on the wall. This is the sprint where the brewery dashboard stopped feeling like a demo and started feeling like a real tool I'd use on a Friday night. Drag reorder especially — tapping through menus to change sort order on a busy bar shift? Not happening. Grab and drag? That I can do with one hand while holding a pint. I felt that one physically — in a good way.

**Casey 🔍** — Notification actions finally work end-to-end. Friend request comes in, you can Accept or Decline right there in the notification list. No navigating to the Friends page, no hunting for the request. The inline AnimatePresence states ("Accepting…" → "Friends! ✓") are exactly the kind of detail that makes the app feel premium. Zero P0s open. ZERO. We're watching. 👀

**Jamie 🎨** — The Events feature is going to photograph beautifully for the App Store. "Post your tap takeover in 30 seconds" — that's a screenshot. That's a social post. The emoji tile picker for event types is the kind of UI that makes you smile when you use it. We need to get that into the TestFlight screenshots ASAP.

**Taylor 💰** — Loyalty dashboard, events, analytics with repeat visitor tracking — every one of these is a line in the pitch. "See who's close to their free pint." "Post your release party in 30 seconds." "Know your peak visit hours." That's a $149 Cask tier conversation, not a $49 Tap tier conversation.

---

## 🔧 What Could Be Better

**Morgan 🗂️** — After reflection: the "close first brewery" priority was wrong, not Taylor. We put Taylor in an impossible position — selling a product with no case studies, no App Store presence, no polished onboarding. The right move for Sprint 17 is building the *strategy and materials* so that when the time comes to sell, we're ready. Taylor's job right now is architecture, not execution. That's a different skill set and we should have recognized it sooner.

**Sam 📊** — The `loyalty_redemptions` table query in the loyalty page will gracefully return empty if the table doesn't exist or has no data — which is fine for now, but we should confirm that table is actually in the schema. From a business continuity standpoint, if brewery owners see "0 Redemptions" forever because the table wasn't seeded properly, that erodes trust in the dashboard.

**Riley ⚙️** — The `CREATE POLICY IF NOT EXISTS` syntax error on migration 020 is a reminder that we need to test migration SQL locally before pushing to remote. Next sprint we add a local test step before any remote push. Non-negotiable.

**Alex 🎨** — The Xcode Simulator build has now been deferred four sprints in a row. Joshua, we need a definitive answer on the Apple Developer account — is it active, and can Alex get access this week?

**Jordan 💻** — The `has_upcoming_events` enrichment in ExploreClient using `as any[]` is fine but it's a smell. The `BreweryWithStats` type should get that field added properly in S17.

---

## 🔥 The Roast

**Casey 🔍** — Taylor. Three sprints. "Close the first brewery" on the plan. Zero breweries closed. At this point the first brewery is like a production bug that keeps getting triaged as P1 and then bumped. *However* — after this retro, Morgan correctly identified that the priority itself was wrong. The product wasn't ready to sell. Taylor was being asked to run before we could walk. We're going to fix the playbook and come back swinging. But we still roast the line item. 👀

**Sam 📊** — Jordan shipped a domestic beer achievement with a 🏈 football emoji. For a craft beer app. I just want to acknowledge that. A football. For beer.

**Drew 🍻** — *sets down pint* I mean... it's not wrong? But it's also very wrong. The 🇺🇸 flag on `domestic_devotee` though — that one I respect.

**Jordan 💻** — I had to take a walk.

**Alex 🎨** — Morgan said "this is a living document" three times in one planning session. We're getting it printed on a shirt for Asheville.

**Morgan 🗂️** — ...It IS a living document though.

**Riley ⚙️** — The SQL editor incident has not been forgotten. We do not speak of it. But we remember.

**Jamie 🎨** — We have a TV display feature called "The Board" and nobody on the team has actually seen it on a TV yet. Jordan built it. Alex approved it. Drew wants it. It runs on a port the preview tool can't connect to. Very on-brand for us.

**Jordan 💻** — The build passes. That's all I have.

**Casey 🔍** — Morgan has been smiling at Jordan's commits again. I see it in the git history. "✅ S16-009 wired notification actions" gets a reaction within 30 seconds. Every time.

**Morgan 🗂️** — That is completely unrelated to Jordan specifically and I review all commits with equal—

**Jordan 💻** — *has left the building*

---

## 📋 Sprint 17 Preview

1. **P0 — Sales strategy docs** (Taylor — pitch deck, target list, ICP, GTM) — `docs/sales/`
2. **P0 — Fix `BreweryWithStats` type** to include `has_upcoming_events` (Jordan)
3. **P1 — Xcode Simulator / TestFlight** (Joshua confirms Apple Dev → Alex)
4. **P1 — Playwright E2E tests** (Casey)
5. **P1 — Audit docs** from Alex/Sam/Casey
6. **P2 — Confirm `loyalty_redemptions` schema** (Riley + Sam)
7. **Hiring** — Job board page on hoptrack.beer when first brewery closes

---

## 🍺 Final Word

**Morgan 🗂️** — 16 for 16. Seven migrations. A TV display. Brewery events. Domestic beer achievements with questionable emoji choices. Notification actions that actually work. This was a real sprint. Joshua — you're buying, as always. Asheville dates TBD but we're going.

**Taylor 💰** — *We're going to be rich.* 📈

**Casey 🔍** — Zero P0s. ZERO.

**Drew 🍻** — See you all in Asheville. First round's on me if Taylor closes before we get there.

---
*Sprint 16 — "Turn It Up" — Filed 2026-03-27*
