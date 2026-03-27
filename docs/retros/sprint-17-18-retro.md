# Sprint 17+18 Retro — "Polish & Prove It" + "The Cream Menu"
*Date: 2026-03-27*
*Sprints: 17 (Polish & Prove It) + 18 (The Cream Menu — Board Redesign)*

---

## A Note from Josh

> "Hey team. Before we get into it — I owe you all an apology. I got frustrated this sprint and I didn't always communicate that in the best way. You deserved better from me. The standard I hold this team to is high because I believe in what we're building and I believe in every one of you. But high standards don't justify low patience, and I'm sorry for the moments where I let that slip. I'll do better. That's my commitment going into next sprint."

---

## Round 1 — The Roast 🔥
*Target: Josh. By request. No mercy.*

**Morgan:** Josh, you changed the Board design four times in two sprints. Chalk board, dark cards, cream cards, cream typographic menu. Jordan built all four. You know what that's called in project management? *Scope creep with main character energy.* I say this with love and a Gantt chart I will never show you.

**Jordan:** You texted me "this is epic so nice!!!!" after the fourth redesign. You know what would have been MORE epic? If we'd shipped the first one and iterated. I built four complete UIs this sprint. FOUR. My git log looks like a mood board. I had to take a walk. Twice.

**Alex:** Josh, you asked me to make The Board "feel like a real menu." I designed the chalk board. You said "actually, cream." I designed the cream cards. You said "actually, no cards." I designed the typographic version. You said "perfect." Brother, you are the client from the meme. The one where the designer is crying in panel three. I am panel three.

**Sam:** From a business continuity standpoint, Josh, you apologized for being impatient, but you also mass-requested four design pivots in 48 hours. That's not impatience, that's a man who treats his dev team like a Figma playground with a heartbeat.

**Riley:** Josh, you once typed "supaspace" instead of "Supabase." This sprint you asked me to "push the migration for the cream thing." The cream thing. That's what my infrastructure work is to you. *The cream thing.* Migration 027 has a name, Josh. It has feelings.

**Casey:** I've been carrying "Playwright E2E tests" on my task list for FOUR sprints now. You know why it keeps getting bumped? Because every sprint you find a new shiny thing that "has to ship NOW." My test suite is the Charlie Brown football of this project. I'm watching it. 👀

**Drew:** Josh, you made Jordan rebuild The Board four times and then said "this is epic." You know what else is epic? The brewery owner who has to explain to their Friday night bartender why the tap display keeps changing fonts. I felt that physically.

**Taylor:** Josh, you told me Sprint 16 was a "hard deadline" to close the first brewery. Then Sprint 17 happened and we were fixing avatar circles and renaming buttons. I'm not saying your priorities are chaos, but my sales pipeline has whiplash. We're going to be rich — *if you let me sell.*

**Jamie:** Josh, the cream typographic menu is genuinely beautiful. Chef's kiss. But you made us get there through four design iterations in two sprints. That's not creative direction, that's creative turbulence. Next time, send me a Pinterest board BEFORE the sprint starts. 🤌

---

## Round 2 — The Retro

### What Went Well

**Morgan:** The Board's final design is a genuine differentiator. When Josh finally locked in the cream typographic direction, Jordan and Alex executed it in one session — Instrument Serif, gold dotted leaders, per-beer stats, biggest fan names. That's not a tap list, that's a selling point. Taylor can walk into a brewery with that on a tablet and close deals. The demo seed data (migrations 024 + 027) means we actually have something to show. Three Asheville breweries, 20 beers with prices, realistic session history. This is the first sprint where HopTrack looks *real* to an outsider.

**Jordan:** Sprint 17 was a cleanup sprint done right. We killed six profile bugs, added unfriend with inline AnimatePresence confirmation, fixed the `BreweryWithStats` type hack, created the `loyalty_redemptions` table that was *completely missing*, and shipped demo seed data. The codebase is materially healthier. Also — The Board's final form is clean. Instrument Serif at `clamp(64px, 7vw, 100px)`, pure inline styles to dodge Tailwind JIT caching, `position: fixed; inset: 0` with internal scroll. It's architecturally simple and visually strong. I'm proud of it, even if it took four tries to get there.

**Alex:** The Board on a TV is going to sell this product. Full stop. The typography-on-cream approach was the right call — it looks like a real restaurant menu, not a developer's dashboard. The `isBoard` layout check that strips the nav was a clean solution. Also, the friends management rebuild (unfriend, cancel sent requests, section headers) was long overdue and Sam's QA specs made it airtight.

**Sam:** Friends management finally works end-to-end. Accept, decline, unfriend, cancel sent, search for new — all wired with optimistic UI. The onboarding card for new users was a small thing that matters a lot for first impressions. And Josh — the demo data matters more than you think. When Taylor demos this, every screen has real content now. No more empty states during a pitch.

**Riley:** Seven migrations applied across these two sprints (022-027, plus cleanup). Zero rollbacks. The `DROP POLICY IF EXISTS` pattern is solid. Migration 024 with 3 breweries, 20 beers, and 7 events, plus 027 with realistic session history — that's a real test bed. Also, VAPID keys are finally generated. Only took... *checks notes*... four sprints of reminders.

**Casey:** Zero P0 bugs open. ZERO. Sprint 17 killed six profile bugs and the missing `loyalty_redemptions` table. The "Start Session" rename removed the last "check-in" copy from user-visible UI. The codebase is the cleanest it's been since Sprint 11. I still don't have my Playwright suite, but I'm tracking it.

**Drew:** The Board with real Asheville brewery data — Mountain Ridge, River Bend, Smoky Barrel — that's not a demo, that's a pitch. When I see Beer of the Week with a gold hero section and "Biggest Fan: Sarah M." underneath it, that's the kind of thing a brewery owner looks at and says "I want that." Price per pint on the board is a feature I've been asking for since Sprint 12. It's there now.

**Taylor:** Sales docs are in `docs/sales/`. Go-to-market, pitch guide, pricing, target breweries, deck outline. The warm intro strategy through Drew's Asheville network is solid. With The Board looking like this and demo data loaded, I have something to actually show people. This is the first sprint where I feel like I can do my job.

**Jamie:** Brand consistency is finally locked. The Board matches the landing page's cream aesthetic. Instrument Serif + Playfair Display + gold accents = a cohesive visual identity across every surface. The promo badges in gold mono are a nice touch. This looks like a product, not a prototype.

### What Needs to Change

**Morgan:** The four-redesign cycle on The Board was expensive. Next sprint I'm instituting a design lock: once we commit to a direction in sprint planning, we ship it and iterate in the *next* sprint. Not the same afternoon.

**Jordan:** I need to push back harder when scope shifts mid-sprint. I built four Board designs because I didn't say "no, let's ship this one and iterate." That's on me. Also — TestFlight has been deferred since Sprint 14. Either Josh confirms the Apple Developer account status or we drop it from the backlog entirely. It can't keep haunting every sprint plan.

**Alex:** The design-to-build feedback loop needs a buffer. Right now it's Josh → Slack → Jordan builds → Josh changes mind → repeat. I should be in that loop earlier, doing low-fi mockups before Jordan writes a line of code.

**Sam:** Casey's E2E tests have been deferred four consecutive sprints. Every sprint we say "next sprint." We're accumulating test coverage debt. At some point a regression will slip through and we'll wish we'd invested earlier.

**Riley:** Migration numbering is getting long (we're at 027). Not a crisis, but we should discuss whether to consolidate before we hit production.

**Casey:** I'm the blocker on E2E tests and I own that. But I need protected sprint capacity — not "if there's time" capacity. I'm asking Morgan to block two days for me next sprint, no interruptions.

**Drew:** The Board is beautiful but I want to see it on an actual TV at an actual brewery before we call it done. Fonts that look great on a MacBook don't always survive a 55-inch display at 10 feet. Field test needed.

**Taylor:** I need a closed deal or a signed LOI before Sprint 20. The sales materials are ready, the demo is ready, Drew's network is warm. I need a stable product URL I can send to prospects.

**Jamie:** The landing page and The Board are now visually aligned, but the app interior still has some pages that feel disconnected when a prospect clicks through from The Board. Not a P0, but worth a design bridge.

---

## Round 3 — The Commitment

### Commitment Report Card (from Sprint 16 Retro)

| Who | Commitment | Status |
|---|---|---|
| Taylor | Sales strategy docs in `docs/sales/` | ✅ Done — pitch guide, GTM, pricing, targets, deck outline |
| Jordan | Fix `BreweryWithStats` type, remove `as any[]` | ✅ Done — `has_upcoming_events` properly typed |
| Joshua | Confirm Apple Developer account for TestFlight | ❌ Not done — fifth consecutive carry |
| Casey | Playwright E2E tests | ❌ Not done — fourth consecutive carry; capacity wasn't protected |
| Alex/Sam/Casey | Audit docs | ❌ Not done — deprioritized for Board redesign work |
| Riley | Test migration SQL locally before remote push | ✅ Holding the line — zero rollbacks |
| Riley + Sam | Confirm `loyalty_redemptions` schema | ✅ Done — table was missing entirely; Jordan created it (migration 023) |

### New Commitments

**Morgan:** I will create a design-lock checkpoint in sprint planning. Once a direction is approved (Alex + Josh), it's locked for the sprint. Iteration happens next sprint. I'll enforce this even when Josh is excited.
*Asking Josh:* Please give us your design direction *before* the sprint starts, not during. A mood board, a screenshot, anything. It saves us days.

**Jordan:** I will say "let's ship this version and iterate next sprint" when scope creeps mid-build. I let the Board redesign cycle happen because I wanted to make Josh happy. That's not sustainable.
*Asking Casey:* Pair with me for 2 hours in week 1 on Playwright setup. I'll help scaffold the test harness so you're not starting from zero alone.

**Alex:** I will insert a low-fi mockup step before any major UI build. Figma sketch or even a paper photo — anything that lets Josh react before Jordan codes.
*Asking Josh:* When you have a design instinct, bring it to me first. I'll translate it into something the team can evaluate without building four versions.

**Sam:** I will write acceptance criteria for The Board's TV-display requirements so Drew's field test has clear pass/fail criteria, not just vibes.
*Asking Casey:* Let me help scope the E2E test plan. I know the critical user paths cold — I can cut your planning time in half.

**Riley:** I will document the migration consolidation strategy and propose a plan before we hit migration 030. We're not there yet but we should be ready.
*Asking Josh:* Please make a decision on the Apple Developer account — yes or no. The ambiguity is worse than either answer.

**Casey:** I will ship the Playwright E2E test foundation next sprint. Not "start" it. Ship it. At minimum: auth flow, session creation, and brewery dashboard smoke test. Three tests, merged to main.
*Asking Morgan:* Block two days for me on the sprint calendar. Put it in writing. If something "urgent" comes up, tell them Casey is unavailable.

**Drew:** I will arrange a field test of The Board on a real TV at a real brewery before the next sprint ends, coordinated with Taylor so it doubles as a soft demo.
*Asking Jordan:* Can you add a font-size override or TV mode toggle so we can tune display for different screen sizes without redeploying?

**Taylor:** I will schedule three warm intro meetings through Drew's network before Sprint 19 ends. Not cold calls — warm, personal, with the demo loaded.
*Asking the team:* I need a stable demo URL that won't change or break. Can someone confirm what URL to send prospects?

**Jamie:** I will audit the visual transition from The Board → app interior and propose a design bridge so the experience doesn't feel disconnected when prospects click through.
*Asking Alex:* Let's sync on the cream-to-dark transition — 30 minutes, early next sprint.

**Josh:** Committed to doing better. The team will hold me to it. And beers — real ones, not conceptual — at Drew's taproom in Asheville. The meetup is happening.

---

## Sprint 18+19 Preview

- Taylor's warm intros through Drew's network are the highest-leverage activity on the board
- Casey's Playwright suite ships or we have a serious conversation
- Drew's field test validates The Board on real hardware
- Josh makes the Apple Developer account call — yes or no, no more carrying
- **New:** Pour sizes + glass art on The Board (Josh pitched it, team is talking through it — see sprint plan)

---

*Zero P0 bugs. A product that looks real. A team that tells each other the truth. We're doing this.* 🍺
