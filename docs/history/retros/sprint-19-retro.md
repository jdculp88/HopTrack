# Sprint 19 Retro — "The Pour"
*Date: 2026-03-27*
*Theme: Pour sizes + glass art on The Board*

---

## Round 1 — The Roast 🔥

**Morgan:** Josh, you gave us your mockup BEFORE the sprint. You locked in the design BEFORE Jordan wrote a line of code. You said "I love how everything looks, just add the chips and the glass art." And we shipped it in one session. You want to know what that's called? **That's called learning.** Welcome to the team, Josh. Only took nineteen sprints.

**Jordan:** You came in with an HTML mockup, a glass guide with 20 illustrated glasses, and a one-sentence brief: "price chips where the price is, glass SVG left of the name, never stack." That was it. I built the entire thing without a single mid-sprint design pivot. No walks. Zero. I genuinely don't know what to do with myself.

**Alex:** Josh. You sent me a 560-line HTML mockup with hand-crafted SVG beer glass illustrations and correct typography hierarchy. The Lora serif, the Source Code Pro mono, the dotted leaders, the chip layout — it was all there. You know what that means? You're actually a designer. You've been doing four-pivot design-by-Slack for eighteen sprints when you could have just been sending us mockups. I need a moment.

**Sam:** From a business continuity standpoint, Josh, the fact that you provided clear requirements and didn't change them mid-sprint has created a dangerous precedent. The team is now going to *expect* this from you. You've set the bar. You can never go back. I hope you understand what you've done.

**Riley:** Josh, you pushed to main twenty-two times this year and called every migration "the cream thing" or "the pour thing." This sprint? Migration 028 and 029. Named. Numbered. Correct. "pour_sizes." I didn't have to ask what it was. I'm going to need a minute to process this growth.

**Casey:** I still don't have Playwright. But Josh gave Jordan a crystal-clear brief so Jordan could help ME scaffold the test harness next session like he promised. The Charlie Brown football has been picked up off the ground. I am cautiously optimistic. 👀

**Drew:** Josh sent us a mockup where the Barrel-Aged Imperial Stout at 10.5% ABV only has Taster / Half / Snifter pour options and no Growler. He didn't put that in the brief. That came from the migration. Jordan looked at the beer, looked at the ABV, and made the right call. I felt that. That's a team that understands real brewery operations now. *That's* the roast — you built such a good team that they're making your product decisions correctly without you.

**Taylor:** Josh, you told me in Sprint 16 that closing the first brewery was a "hard deadline." We are now in Sprint 19. I have a sales deck, a pitch guide, target breweries, and a demo that makes people say "holy wow." The Board with glass art and pour chips is a five-minute close. The only thing that was missing was the product. Now we have the product. So if we don't close one this sprint — that one's on me. 📈

**Jamie:** The roast is that your mockup was better brand execution than anything I handed you this sprint. The Lora serif, the cream, the gold chips, the glass illustrations — that was a coherent visual system in raw HTML. You're either secretly a designer or you've just been absorbing everything Alex and I have been saying for nineteen sprints. Either way: chef's kiss, you absolute menace. 🤌

---

## Round 2 — The Retro

### What Went Well

**Morgan:** This was our cleanest sprint execution since Sprint 12. Josh gave us a real brief with a real mockup. The team had everything they needed on day one. Zero scope creep. One session. Eight files. 1,335 insertions. Shipped to a screenshot that made Josh say "holy wow." That is what a locked design direction does for a team.

**Jordan:** Architecturally, `lib/glassware.ts` is the move I'm most proud of. Twenty glass types, all the SVG art, the gradient ID substitution system so you can render multiple glasses on the same page without conflicts, `bestFor[]` metadata for future style recommendations — it's a real library, not a one-off. We can use it on the consumer beer detail page, share cards, passport, anywhere. And the Board layout — glass illustration flex column on the left, beer info flex on the right, dotted leader to the size chips — it's clean. The fallback to `price_per_pint` for beers with no pour sizes means nothing broke for existing data. That's the kind of detail that makes me not have to take a walk.

**Alex:** The screenshot. That's the win. Mountain Ridge Brewing in Instrument Serif italic. Summit Sunset Hazy in Playfair Display bold. IPA Glass illustration next to it. Taster $3 · Half Pint $5 · Pint $8 · Growler $14 in chips. That is a menu. Not a dashboard, not a CRUD screen — a *menu* that a brewery would be proud to put on their wall. The glass art reads beautifully at TV scale. The Pilsner glass on the Trailhead Lager vs. the IPA glass on the Ridgeline IPA — a customer can literally see what they're getting.

**Sam:** The pour size data model is flexible enough to handle real-world brewery behavior. Monks Garden Tripel at River Bend offers a "Goblet 13oz $10" size — because the glass is the serve. The Mountain Mead offers Flight / Half Flute / Flute — because it's a Flute glass and you serve it in flute pours. The Barrel-Aged Imperial stops at 12oz because nobody should be filling a growler with 10.5% bourbon barrel stout. That's not just a feature, that's operations knowledge baked into the product.

**Riley:** 028 and 029 applied first push. Only hiccup was `uuid_generate_v4()` vs `gen_random_uuid()` — caught and fixed in thirty seconds. The public-read RLS on `beer_pour_sizes` is important because The Board is unauthenticated. Realtime subscription now covers both `beers` AND `beer_pour_sizes` tables — add a size in the admin, it appears on The Board within a second. That's a feature that will demo well.

**Drew:** Field test is happening this week at the taproom. Two things I want to confirm on a real 55-inch TV: chip readability from 10 feet, and glass illustration clarity at the large font size setting. But from the screenshot on a laptop screen? It looks like a professional menu board that would cost a brewery $2,000 to commission from a design studio. We're giving it to them for $49/month.

**Taylor:** Booking demo meetings this week. The screenshot is the pitch. No deck needed for the first call — just pull up The Board on a tablet, walk them through adding a beer with glass type and pour sizes, show it appear on the TV display in real time. That's the whole demo. Drew's network in Asheville is warm. Going Tuesday.

**Jamie:** The glass art makes HopTrack look like a craft product for craft people. The Weizen glass on the Wildflower Wheat. The Snifter on the Barrel-Aged Imperial. The Stange on the Kölsch. Every brewery owner who sees this is going to think "whoever built this actually knows beer." That's brand trust built into the UI. The visual language of this product is now complete.

### What Needs to Change

**Morgan:** Casey's Playwright tests did not ship again. That's five sprints of carry and two explicit retro commitments. Next sprint I'm putting it as the FIRST ticket and nothing else gets reviewed until Casey has the test harness scaffolded. Jordan is pairing. It is happening.

**Jordan:** I committed to pairing with Casey on Playwright. I did not do it. That's on me. Next session: we open with a two-hour pairing block on Playwright before I write a single new feature line.

**Alex:** The glass picker grid in the modal — twenty SVG thumbnails at 36px wide — it works, it's functional, but it could be more elegant. Sprint 20 polish task.

**Sam:** We have no automated test coverage of the pour sizes flow. Goes in the Playwright brief.

**Riley:** We're at migration 029. Consolidation conversation needs to happen before Sprint 22. Writing the proposal this sprint.

**Drew:** I need the font size to be tunable per-screen without a redeploy. "TV Mode" that auto-scales for large displays. P1 for next sprint.

**Taylor:** Need a stable demo URL confirmed before Tuesday's meeting.

---

## Round 3 — The Commitment

### Commitment Report Card (from Sprint 17+18 Retro)

| Who | Commitment | Status |
|---|---|---|
| Morgan | Design-lock checkpoint in sprint planning | ✅ Josh sent a mockup. It worked. |
| Jordan | Push back on mid-sprint scope creep | ✅ Zero pivots this sprint. |
| Jordan | Pair with Casey on Playwright setup | ❌ Shipping took over. |
| Alex | Low-fi mockup step before major UI build | ✅ Josh sent the mockup; process worked. |
| Sam | Write Board TV acceptance criteria | ⚠️ Not formally written. Drew's field test covers it. |
| Riley | Migration consolidation strategy | ⚠️ Not started. Still pre-030. On deck. |
| Casey | Ship Playwright E2E foundation | ❌ Not done. Fifth carry. Last time. |
| Drew | Arrange field test on real TV | ✅ Scheduled this week. |
| Taylor | 3 warm intro meetings scheduled | ✅ Going Tuesday. |
| Jamie | Audit Board → app interior visual transition | ⚠️ Noted. Sprint 20 scope. |
| Josh | Give design direction before the sprint | ✅ Mockup + glass guide + one clear brief. The team noticed. |

### New Commitments

**Morgan:** Playwright is S20-001. First ticket opened, first thing reviewed. Non-negotiable.
*Asking Josh:* Confirm the demo URL for Taylor before Tuesday.

**Jordan:** Playwright pairing with Casey is the first thing I do next sprint. Not after standup. First.
*Asking Alex:* Send me glass picker UI notes. I'll make it elegant while building other things.

**Alex:** Wireframe glass picker improvement before session 1 of Sprint 20.
*Asking Drew:* Send field test results with photos. I need to see chips and glass art from 10 feet.

**Sam:** Write the Playwright test brief: auth, pour sizes add/verify on Board, session create, brewery dashboard smoke. Casey and Jordan get it before session 1.
*Asking Riley:* Calendar sync on migration consolidation before Sprint 21.

**Riley:** Migration consolidation proposal in `docs/` before Sprint 20 planning.
*Asking Taylor:* Send me the demo URL question — I'll get you an answer today.

**Casey:** Playwright ships next sprint. Auth flow, pour sizes add/verify on Board, session create. Three tests merged to main. This is the last time this appears in a retro without a ✅.
*Asking Jordan:* Be there for the pairing session. I'll have the repo scaffolded the night before.

**Drew:** Field test results — photos, font size notes, chip readability from distance — back to Alex and Jordan by end of week. P0 request: TV Mode for Sprint 20.
*Asking Taylor:* Come to Asheville Tuesday. I'll intro you to two owners in person.

**Taylor:** Going to Asheville. Live demo on the taproom TV with glass art and pour chips on a 55-inch screen.
*Asking Josh:* Confirm the URL. We're going to be rich. 📈

**Jamie:** Board → app interior visual bridge proposal in Sprint 20. One design doc, no build yet.
*Asking Morgan:* P2 design task in Sprint 20 plan.

**Josh:** You gave us a mockup. It shipped in one session. The screenshot was "holy wow." Keep doing that.

---

## Sprint 19 — Final Numbers

| Metric | Count |
|---|---|
| Tickets shipped (P0) | 7/7 |
| Migrations applied | 2 (028, 029) |
| Glass types built | 20 |
| Demo beers with glass + sizes | 20/20 |
| Pour size rows in demo data | 74 |
| Mid-sprint design pivots | 0 |
| Walks Jordan had to take | 0 |
| Times Josh said "holy wow" | 1 |
| P0 bugs | 0 |

---

## Sprint 20 Preview — "Close It"

**Theme:** Field validation + first brewery close + Playwright finally

**P0:**
- S20-001: Casey + Jordan — Playwright E2E foundation. Ships or we talk about why.
- S20-002: Drew — TV Mode toggle (auto-scale for large displays)
- S20-003: Taylor + Drew — Asheville demo + close attempt

**P1:**
- S20-004: Alex — Glass picker UI polish
- S20-005: Riley — Migration consolidation proposal
- S20-006: Jamie — Board → app interior visual bridge doc

**The goal:** By the end of Sprint 20, we have a signed brewery or a clear answer on why not.

---

*Seven tickets. One session. Twenty glass types. Zero walks. The Board looks like a product. Let's go close a brewery.* 🍺
