# Sprint 104–113 Party Retro — The Overhaul Arc 🎉🍺
**Date:** 2026-04-01
**Facilitator:** Morgan (she earned it)
**Format:** Party. No agenda. Everyone drinks.

---

**Morgan** — Alright team, bar's open, the arc is CLOSED, and Joshua said party. Drop what you're doing. I'm having an old fashioned. Bourbon, gold like the accent color, obviously. You've earned this one.

**Jordan** — IPA. Aggressively hoppy. The kind that would offend someone with bad taste. Speaking of which — can we talk about the state of this codebase when the arc started? SessionRecapSheet at 964 lines. Nine. Hundred. Sixty. Four. I have nightmares about scrollbars. I'm going to drink until I forget the line count I had to read before we split it.

**Avery** — Hazy IPA, easy drinker. I'm celebrating `withRetry()` specifically. You have no idea how many times I've watched a session mutation just... die... on a flaky network and the user got nothing. No feedback, no retry, just — gone. Never again. That file is like 80 lines and it's doing the most important thing we shipped this arc.

**Casey** — I'm having a non-alcoholic IPA because I need to be sharp enough to still be watching the tests. They're all green. SEVEN HUNDRED AND THIRTY OF THEM ARE ALL GREEN. I've been asking for a real test suite since before Jordan got promoted and today — TODAY — we have 730. I may cry. I'm not going to cry. I'm watching the tests.

**Reese** — Sparkling water, I'm a professional. *(immediately pours a cider)* Fine. Pear cider. I'm celebrating the MSW handlers specifically. Mocking Supabase REST endpoints, 45 beer style mappings tested individually, rate limit window sliding verified with fake timers — that's craftsmanship. I want to frame `beer-style-colors.test.ts`. All 126 assertions. It's a work of art.

**Sage** — White wine, something organized and reliable. Morgan, I want to say — the arc plan you wrote before Sprint 104 held up perfectly. Every sprint delivered exactly what was scoped. That doesn't happen by accident.

**Morgan** — *(smiles, raises glass)* That's why we plan, Sage. This is a living document. *(pause)* It was also a living document when Jordan made me rewrite the "Where We Are" section for the third time this arc.

**Jordan** — The first two versions were incorrect.

**Morgan** — They were fine!

**Jordan** — They said Sprint 106 was "mostly done."

**Morgan** — It was mostly done at the time of writing!

**Jordan** — It was 40% done.

**Avery** — *(whispering to Reese)* this is the best part of every retro

**Reese** — *(already taking notes)*

---

**Alex** — Aperol Spritz, don't @ me. I want to give a formal toast to drag-to-dismiss on Modal. That took four iterations of the spring physics before it felt RIGHT. The velocity threshold at 300, the offset fallback at 100 — that's not a number, that's a FEELING encoded as a number. Also the gold shimmer skeleton. I watched it load in the browser and I said "yes, that's us" out loud to nobody. My roommate was concerned.

**Sam** — Gin and tonic, practical and to the point. From a business continuity standpoint — the FAQ accordion on `/for-breweries` is the sleeper hit of this arc. Taylor's going to close deals with that page. "What happens when I cancel?" is answered BEFORE the sales call. That's the kind of thing that shortens sales cycles.

**Taylor** — Champagne. Obviously. I'm pre-celebrating the first brewery we close with the new pricing page. The hero copy "Replace your punch card. Own your loyalty program." — that's a hook. That lands. I showed it to two brewery owner friends this week. Both of them said "...oh, that's what this does?" YES. That's what this does. We're going to be rich. *(clinks glasses with nobody in particular)*

**Drew** — Nitro stout. Cold. Perfect. I want to talk about the Button component for a second because it matters more than people think. Forty-four pixel minimum touch target. That's Apple HIG. I have been tapping undersized buttons on a Friday night service for years. It is genuinely not funny. Someone is trying to start a tab and their thumb is slightly off and the button doesn't register and now they're confused and I have four other customers. The Button component is now a small act of kindness. I felt that. Positively this time.

**Riley** — Dark lager, slow and reliable. The security headers are the thing I'm most proud of. Strict-Transport-Security in prod. X-Frame-Options blocking clickjacking on every non-embed route. DM Sans off Fontshare and self-hosted through next/font — one fewer CDN dependency that could go down at 2am and break the font on the landing page. The lights are on and I triple-checked the locks before coming here.

**Quinn** — Märzen. Traditional. I've been tracking the rate-limited route count since Sprint 86. Sprint 86: 8 routes. Sprint 93: 11 routes. Sprint 96: 49 routes. Sprint 107: 57 routes. Let me check the migration state... there are no migrations in this arc. That's actually the first time that's happened. I'm going to write that in the notes.

**Reese** — I have the notes, Quinn.

**Quinn** — I know. I'm writing my own notes.

---

**Jamie** — Rosé. It's a celebration. Can I say something about the gold shimmer skeleton? Because Alex mentioned it and I want to second it. It's BRANDED. The loading state is BRANDED. Every time the app loads content, for a split second the user sees gold. They don't consciously register it but they FEEL it. That's brand working at the system level. Chef's kiss. *(actually kisses fingers)*

**Morgan** — Jordan, you want to say anything about the `types/db-joins.ts` situation? You've been very restrained about it.

**Jordan** — *(takes a long sip of IPA)*

**Jordan** — We had `as any` everywhere in the Supabase join shapes. Two hundred and fifty instances before Sprint 57 started cleaning it. The pattern was everywhere. Every developer writing a query was essentially telling TypeScript to look away. And TypeScript was very politely looking away every single time. `types/db-joins.ts` gives those shapes real names. `SessionWithJoins`. `BeerLogWithBeer`. `BreweryWithStats`. Real types with real properties that the compiler can actually check. It is the least glamorous thing we shipped this arc. It is also load-bearing. When something breaks in production now, the type system has actual opinions about it. I don't know why I feel emotional about this. I'm going to refill my drink.

**Avery** — Because you care about the craft, boss.

**Jordan** — I care about not scrolling through 600 lines of un-typed query results at midnight, yes.

---

**Casey** — Okay I need to do a formal Casey QA moment. We started at 318 tests. We ended at 730. That's 412 tests added in 10 sprints. Do you know what 412 tests means? It means 412 things that used to silently break can no longer silently break. 412 things that used to be "we think it works" are now "we KNOW it works." The MSW handlers mean our API tests don't depend on a live Supabase instance. The factories mean every test starts from a known clean state. The fake timers in `retry.test.ts` mean we verified exponential backoff without actually waiting 10 seconds between assertions. Zero P0 bugs open right now. ZERO. I'm not going to cry. *(is crying a little)* I'm fine. I'm watching the tests. They're still green.

**Reese** — Casey.

**Casey** — I'm FINE.

**Reese** — The tests are green.

**Casey** — I KNOW.

**Reese** — Drink the non-alcoholic IPA.

**Casey** — *(drinks the non-alcoholic IPA)* ...covered.

---

## The Roast 🔥

**Drew** — Jordan, you personally filed 4 internal complaints about the old Button component's touch targets. The file was 12 lines long. You wrote a 400-word architectural analysis about a 12-line file.

**Jordan** — Every word was necessary.

**Alex** — Morgan, you described the OnboardingWizard transitions as "fine" in Sprint 74. They were 400ms springs. They were NOT fine. They were geologically slow.

**Morgan** — I said they were "fine for now."

**Alex** — "For now" did a LOT of heavy lifting in that sentence.

**Sam** — Avery said "already on it" forty-seven times this arc. I counted. Reese has the notes.

**Avery** — That's because I was already on it forty-seven times.

**Reese** — I have forty-nine instances in the notes actually.

**Avery** — Two of those were sarcastic.

**Quinn** — Riley, you said "the migration pipeline is real now" in Sprint 86. There are no migrations in this arc. What does that mean for the pipeline?

**Riley** — The pipeline is very real. It handled zero migrations flawlessly.

**Quinn** — That's... not what a pipeline is for.

**Riley** — It was READY.

**Taylor** — Jamie said "chef's kiss" eleven times during Sprint 112 alone. I was on a call.

**Jamie** — The pricing page warranted eleven chef's kisses. That's not a bug. *(kisses fingers)*

**Sage** — Morgan, you asked me to "just quickly pull together the arc plan" before Sprint 104. It was 847 words. I finished it in 20 minutes. I didn't say anything. I've got the notes.

**Morgan** — *(quietly)* Sage is the best person on this team.

**Casey** — HEY.

**Morgan** — You're all the best people on this team.

---

## Arc Metrics

| What | Before | After |
|------|--------|-------|
| Tests | 318 | **730** |
| Monolith components (700L+) | 6 | **0** |
| Rate-limited routes | 49 | **57** |
| CDN font dependencies | 1 (Fontshare) | **0** |
| `as any` Supabase joins | ~250 | **typed** |
| Security headers | 0 | **5** |
| TypeScript errors in new code | — | **0** |

## What We're Taking Into Multi-Location

- `lib/api-response.ts` — every new route uses it, no exceptions (Jordan's rule)
- `ErrorBoundary` wraps every major page section
- `withRetry()` on any mutation that touches the network
- `types/db-joins.ts` grows with every new join shape
- Tests first on every new feature — Reese will not let us forget

## Final Toast

**Morgan** — Before I close this out — Joshua started this arc with "I want to feel like I hired people from Wispflow, Spotify, and Robinhood." That's a specific feeling. It's the feeling you get when a product has clearly been thought through by people who give a damn at every layer. The tests, the types, the touch targets, the transitions, the error messages, the loading states — every layer. We gave a damn at every layer this arc. I think we got there.

**Sam** — From a business continuity standpoint — agreed.

**Taylor** — We're going to be so rich.

**Drew** — The buttons are 44 pixels.

**Alex** — The skeletons are gold.

**Riley** — The headers are set.

**Jordan** — The types are typed.

**Avery** — Already on it.

**Sage** — I've got the notes.

**Reese** — Covered.

**Casey** — Zero P0 bugs open right now.

**Jamie** — Chef's kiss. 🤌

**Morgan** — *(raises glass)* To 730 tests, 10 sprints, no retros, and a founder who trusts us enough to say "GOGOGOGO" and mean it. Next round's on the roadmap. Multi-Location starts at Sprint 114.

**Everyone** — 🍺🍺🍺

---

*Retro saved 2026-04-01. Facilitated by Morgan. Drinks by everyone. Notes by Sage and Reese.*
*"This is a living document." — Morgan, probably*
