# Sprint 156 Retro — The Triple Shot

**Facilitator:** Sage (Project Manager)
**Date:** 2026-04-04
**Sprint:** Sprint 156 — The Triple Shot
**Status:** COMPLETE
**Vibes:** Three espresso shots in one cup. Compliance, engagement, and modernization all at once. We came in hot and left caffeinated.

---

## The Room

*Sage opens the retro board with three columns already labeled: Compliance, Living Room, Speed Demon. Morgan is reviewing the "use cache" revert PR on her phone and pretending she isn't. Jordan is staring at a wall, which means he's either processing the dynamicIO embarrassment or thinking about architecture. Joshua is leaning back, arms behind his head — the posture of a man who asked for three options and got all three. Dakota has already committed something during the retro. Casey is holding a sign that says "66 UNIT TESTS. STILL NO E2E."*

---

## What We Shipped

Three tracks. Zero compromises. One humbling revert.

### Track 1: Compliance Shield

**FTC Review Disclosure (P0 — resolved):**
- `RatingDisclosure` component on all 3 rating surfaces (QuickRatingSheet, BeerReviewSection, BreweryReview)
- Terms of Service updated with "Incentivized Reviews & XP" section — now 14 sections total
- Sam's Sprint 155 P0 finding: closed. Before a single real user rated a beer.

**21+ Age Verification:**
- `DOBInput` component (3 dropdowns — month/day/year)
- Signup page integration — age validated before account creation
- No minors getting XP on our watch

**Review Moderation:**
- `ReportButton` on all review surfaces
- `shouldAutoFlag()` with blocklist for auto-flagging problematic content
- Report API endpoint
- Superadmin `/moderation` queue with clear/remove actions

**Location Data Consent:**
- `LocationConsentModal` — asks before we touch GPS
- `useGeolocation` consent gate — no sneaky location grabs
- API persists consent to user profile

**WCAG:**
- Skip-to-content link added to `StorefrontShell`
- `id="main-content"` on StorefrontShell `<main>` element

### Track 2: The Living Room

**Supabase Realtime:**
- `useRealtimeSubscription` — generic hook, first Realtime usage in the codebase
- Foundation for everything live going forward

**Realtime Tap Lists:**
- `RealtimeTapList` client component wrapping `BreweryTapListSection`
- `JustTappedBadge` for beers tapped within 2 hours — gold pulse, "Just Tapped" label
- Brewery owners update tap list, consumers see it live. No refresh.

**"Drinking Now" Presence:**
- `useBreweryPresence` hook (Supabase Presence API)
- `DrinkingNowStrip` with avatar stack + green pulse dot
- Presence API fallback for graceful degradation
- Walk into a brewery page and see who's there. That's the dream.

**Trending Content:**
- `computeScore()` with time-decay algorithm (recency-weighted engagement)
- Trending API (public, 5-min cache)
- Cron refresh endpoint for background recomputation
- `TrendingSection` on Discover tab with beer/brewery pill tabs

**Session OG Images:**
- Edge runtime route at `/og/session`
- 1200x630 dark+gold branded cards
- Share a session, get a beautiful card. Jamie cried.

### Track 3: The Speed Demon

**View Transitions:**
- CSS `::view-transition` rules in globals
- `supportsViewTransitions()` utility for progressive enhancement
- Page navigations feel native. Alex is happy.

**"use cache" — DEFERRED:**
- Morgan pitched it as the headline feature
- `cacheComponents` flag incompatible with existing `revalidate`/`runtime` exports across 13+ files
- ISR patterns preserved — brewery detail (60s), dashboard (30s) revalidation intact
- Needs dedicated migration sprint to reconcile all caching strategies
- Jordan recommended `dynamicIO` without reading the docs. The key doesn't exist in Next.js 16.2.1. He took a walk.

---

## Roll Call Highlights

**Sage:** "Three tracks. Two migrations. Thirty new files. Sixty-six tests. And one spectacular revert. I've got the notes on all of it. Let's start with the compliance track because Sam has been waiting since Sprint 155 to close that FTC P0."

**Joshua:** "I said give me three options. Y'all gave me three options. I said run them all at once. Y'all ran them all at once. I don't know why we pretend the options are exclusive. Just do all of them."

**Morgan:** "We closed Sam's P0 FTC finding from Sprint 155 in the very next sprint. That's program discipline. The 'use cache' deferral is the right call — I pitched it too early, and Jordan and I both jumped before reading the fine print. The ISR patterns we have work. We don't break working things to chase shiny things. This is a living document, and 'deferred' is a valid state."

**Jordan:** "Okay. Let me address the elephant. I recommended dynamicIO as the path forward for 'use cache.' The dynamicIO key does not exist in Next.js 16.2.1. I should have read the docs before recommending an architecture direction to the team. Avery caught it in review. I took a walk. The Realtime work, though — that's real. First Supabase Realtime subscription in the codebase. useRealtimeSubscription is a generic hook that any component can use. The tap list is just the first consumer. Presence for 'Drinking Now' uses the Presence API with a fallback. This is the kind of infrastructure that makes features feel alive."

**Avery:** "Jordan's Realtime foundation is clean. The hook is generic, composable, properly typed. RealtimeTapList wraps the existing BreweryTapListSection without duplicating logic — that's how we do it here. The JustTappedBadge is a nice touch from Dakota. The 'use cache' investigation wasn't wasted time — we now know exactly which 13 files need to change when we're ready. That's not how we do it here yet, but it will be."

**Dakota:** "Already building it. Built the RatingDisclosure component, the DOBInput, the ReportButton, the LocationConsentModal, the RealtimeTapList, the JustTappedBadge, the DrinkingNowStrip, the TrendingSection, the session OG route, and the view transition utility. Thirty files. One sprint. Already built it. Already built all of it."

**Riley:** "Two migrations this sprint — 097 for compliance tables and 098 for trending. The Realtime subscriptions are clean — no new infrastructure needed, Supabase handles the WebSocket layer. The trending cron is lightweight. The migration pipeline is real, and these two went through clean."

**Quinn:** "Let me check the migration state first. 097 adds the compliance schema — content reports table, location consent column on profiles, age verification fields. 098 adds trending scores table with the time-decay index. Both clean, both reversible. The Realtime channel subscriptions don't need migrations — they're ephemeral by design."

**Casey:** "Sixty-six new tests. SIXTY-SIX. That's our biggest testing sprint ever. RatingDisclosure rendering tests, DOBInput validation tests, age calculation edge cases, report API tests, moderation queue tests, trending algorithm tests, presence hook tests, view transition utility tests. ZERO P0 bugs open right now. ZERO. But I want to point out — still no new E2E tests. I'm watching it."

**Reese:** "Sixty-six tests covering compliance validation, Realtime hooks, trending score computation, and view transition detection. The DOBInput tests alone are 12 cases — leap years, underage rejection, edge dates. The shouldAutoFlag blocklist tests verify every word in the list. Covered."

**Sam:** "From a business continuity standpoint, Track 1 is the most important work we've done since fixing the 1000-row cap. The FTC disclosure is no longer a P0 — it's shipped. Every rating surface shows the disclosure. The Terms of Service are updated. Age verification means we're not giving loyalty rewards to minors. The moderation queue means we can handle bad actors before they poison the review ecosystem. And location consent means we're GDPR-ready on the geo front. I can sleep now."

**Drew:** "The 'Drinking Now' strip — I felt that physically. The good way this time. Walk up to a brewery page and see 'Marcus, Jess, and 4 others are here right now.' That's not a feature. That's a reason to leave your house. And the 'Just Tapped' badge? If I'm a brewery owner and I tap a new IPA and it shows up with a gold pulse saying 'Just Tapped' — I'm pulling out my phone to show my regulars. That sells itself. We're going to be rich. Wait, that's Taylor's line."

**Alex:** "View transitions. Finally. Page navigations feel native now. The CSS is minimal — ::view-transition-old and ::view-transition-new with cross-fade, plus the utility function for progressive enhancement. The session OG images are gorgeous — dark background, gold accents, beer name in Playfair, brewery name underneath. It already feels like an app. The DrinkingNowStrip with the green pulse dot? Chef's — wait, that's Jamie's line. It looks incredible."

**Finley:** "The hierarchy is right. The compliance elements are present but not intrusive — the RatingDisclosure is subtle, the age verification is a clean three-dropdown pattern, the report button is tucked into the action menu. The trending section on Discover has proper visual weight — beer and brewery tabs, time-decay scores driving the sort, not just raw counts. The information architecture serves the user without overwhelming them."

**Taylor:** "The FTC fix means our ratings are legally defensible now. The 'Drinking Now' feature is a sales pitch I didn't have to write — 'Your customers can see who's at your bar right now.' That closes deals. Real-time tap lists mean the brewery owner's work shows up instantly. Session OG cards mean every check-in is marketing. We're going to be rich."

**Parker:** "Real-time presence means I can track engagement quality, not just quantity. If people are seeing 'Marcus is here' and that's driving them to visit — that's social proof I can measure. The moderation queue means I won't be managing bad review cleanup manually when we scale. They're not churning on my watch, and now I have better tools to keep them."

**Jamie:** "The session OG cards. I actually got emotional. Dark background, gold typography, the beer name in Playfair Display — every shared session is now a brand moment. When someone shares a check-in on Instagram, that card IS HopTrack. Chef's kiss. Also the 'Just Tapped' badge is pure gold. Literally."

---

## What Went Well

- **Sam's FTC P0** from Sprint 155 closed in the very next sprint — compliance discipline
- **Jordan's Realtime foundation** — first Supabase Realtime in the codebase, generic and composable
- **Dakota** shipped 30 files across all three tracks without inventing a single new pattern
- **Casey and Reese** delivered 66 new tests — largest testing output in any sprint
- **Drew** validated the "Drinking Now" and "Just Tapped" features as genuinely compelling for brewery owners
- **"use cache" deferral** was the right call — saved the team from a multi-file refactor with unclear benefit
- Three tracks ran in parallel with zero conflicts or blocking dependencies
- Both migrations (097, 098) applied clean

## What Could Be Better

- Morgan and Jordan both championed "use cache" without reading the Next.js 16.2.1 docs first
- The dynamicIO recommendation was embarrassing — configuration key doesn't exist in our version
- Still no new E2E tests despite Casey's growing frustration
- "Run all three options" is fun but makes scope management harder — Sage had to track 3x the usual
- View transitions are CSS-only right now — need JavaScript API integration for full control

---

## Roasts

**Casey on Morgan:** "Morgan pitched 'use cache' as the headline feature of Track 3. It lasted one build attempt. One. The build failed, Morgan said 'we should defer this,' and Track 3 became 'view transitions and a utility function.' I've seen longer-lived promotional offers at Arby's."

**Avery on Jordan:** "Jordan recommended dynamicIO as the technical path forward. The key does not exist in Next.js 16.2.1. Our CTO recommended a configuration option that doesn't exist in our framework version. That's not how we do it here. That's not how anyone does it anywhere. Because it doesn't exist."

**Jordan:** "I had to take a walk."

**Morgan:** "Jordan, we both took that walk. Together. In silence. It was actually kind of nice."

**The entire team:** *uncomfortable silence*

**Drew on Dakota:** "Dakota built 30 files and said 'already building it' for every single one. At this point, 'already building it' isn't a catchphrase. It's a medical condition. Somewhere between a compulsion and a superpower."

**Dakota:** "Already building the next sprint."

**Sam on Joshua:** "Joshua asked for 3 options. We presented 3 options. He said 'do all of them.' That's not choosing. That's a buffet. From a business continuity standpoint, we got lucky they didn't conflict."

**Joshua:** "It's not luck. I know my team."

**Taylor on Casey:** "Casey got 66 unit tests and zero E2E tests. The E2E dream is now entering its 8th sprint of being a dream. At this point Casey should put it on a vision board."

**Casey:** "I'm watching it. Menacingly."

**Reese on Reese:** "I wrote tests for a DOB input that handles leap years. February 29th, 2004 — is this person 21 or 22? I wrote 12 test cases. For a date picker. Covered. Excessively covered."

**Parker on the "Drinking Now" feature:** "We built a feature that shows you who's at the bar right now. Drew said it's 'a reason to leave your house.' I say it's a reason to hire a therapist, because we're building FOMO into a beer app. They're not churning on my watch — they're not leaving the couch without my permission."

**Jamie on the session OG cards:** "I cried at a 1200x630 JPEG. In Playfair Display. With a gold gradient. I regret nothing. Chef's kiss."

**Sage on everyone:** "Three tracks. Two migrations. Thirty new files. Sixty-six tests. One spectacular revert. One walk taken by two people who definitely aren't dating. And Joshua didn't even blink when he said 'run all three.' I've got the notes. All of them."

---

## Sprint 156 By The Numbers

| Metric | Before | After |
|--------|--------|-------|
| Files created | — | ~30 |
| Files modified | — | ~20 |
| Migrations | 096 | 098 (+2: 097, 098) |
| Unit tests | 1,364 | 1,430 (+66) |
| E2E tests | 87 | 87 |
| Rating surfaces with FTC disclosure | 0 | 3 |
| ToS sections | 13 | 14 |
| Realtime subscriptions in codebase | 0 | 1 (generic hook) |
| Supabase Presence channels | 0 | 1 |
| OG image routes | 1 (home/brewery) | 2 (+session) |
| "use cache" attempts | 1 | 0 (deferred) |
| dynamicIO keys that exist in 16.2.1 | 0 | still 0 |
| Walks taken by CTO | — | 1 (possibly with company) |
| Dakota files built | — | 30 |
| Casey's E2E dream sprint count | 7 | 8 |

---

## Action Items

| Item | Owner | Priority |
|------|-------|----------|
| "use cache" migration sprint — reconcile revalidate/runtime across 13+ files | Jordan, Avery | P1 (dedicated sprint) |
| E2E tests for compliance flows (age verification, moderation) | Casey, Reese | P1 |
| View transitions JavaScript API integration | Alex, Dakota | P2 |
| Trending algorithm tuning with real user data (post-launch) | Sam, Quinn | P2 |
| LLC formation + Stripe setup | Joshua | P0-BLOCKER |

---

## KNOWN Issues
**EMPTY.** Fourth consecutive sprint with zero known issues. Build is clean. Tests pass. Compliance is handled. The vibes are immaculate.

---

*"Three shots. One cup. No sugar. We closed a P0, shipped Realtime, and learned that reading docs before recommending architecture is not optional. This is a living document — and today it's buzzing."* — Morgan

*"I said do all three. They did all three. That's my team."* — Joshua

*"We're going to be rich. In real time."* — Taylor
