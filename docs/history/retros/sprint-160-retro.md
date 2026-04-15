# Sprint 160 Retro — The Flow 🌊

**Facilitated by Sage (Project Manager)**
**Sprint theme:** IA restructure of the consumer app. First track of the Facelift Arc.
**Date:** 2026-04-05

---

## What Shipped

**T0 — `<PillTabs>` primitive** (4 files)
Reusable tab component with 3 variants (underline/pill/segmented), motion underline via `layoutId`, roving tabindex, haptic on change, `useReducedMotion` support. Consolidates 5+ custom tab implementations. 23 unit tests green.

**T1 — Profile: 6 sections → 4 tabs** (7 files)
Activity / Stats / Lists / Breweries. Sticky tab bar, URL-synced (`?tab=X`), scroll memory per-tab, AnimatePresence crossfade. Resurrects `ActivityHeatmap` (dead code) in Stats tab. Adds beer-lists fetch for Lists tab. Own-profile shortcut at `/profile` redirects to `/profile/{username}`.

**T2 — Explore: flat → 4 mode pills** (7 files)
📍 Near Me / 🔥 Trending / 👥 Following / 🎨 Styles. Near Me wraps existing ExploreClient. Trending uses existing TrendingSection. Following + Styles are new. 2 new API endpoints (`/api/explore/following`, `/api/explore/by-style`). Style mode = 10 family tiles with color washes.

**T3 — Brewery detail: 17 sections → hero + 5 sticky tabs** (3 files)
About / Tap List / Community / Events / Loyalty. Events + Loyalty hide dynamically when empty. `BreweryHeroShrink` wrapper adds scroll-linked darkening + parallax (respects reduced-motion). StorefrontGate preserved per-tab. JSON-LD schema unchanged.

**Stretch — Liquid Glass on `MinimizedSessionBar`** (2 files)
Extracted from AppShell.tsx into its own file. `backdrop-blur-2xl`, subtle gold edge outline, translucent gloss gradient. Also fixes stale `framer-motion` import (migrated to `motion/react`).

**Total surface: ~30 files** new/modified. 1,621 tests passing (+23 new). 0 new lint errors. 0 new TS errors. Build clean.

---

## What Went Well

**Morgan 📐:** Plan agent synthesized research threads beautifully. PillTabs primitive landed with 23 green tests before we touched a single consumer surface. Dependency order mattered — foundation first, validate in Profile, port to Explore + Brewery.

**Alex 🎨:** `layoutId` motion underline is *chef's kiss*. Brewery detail hero with scroll-linked darkening is a S161 Vibe sprint preview. Sensory layer is finally coming alive.

**Finley 🎯:** Hierarchy WIN. 16 stacked profile sections → 4 tabs. 17 brewery sections → 5 tabs. Flat explore → 4 mode pills. Christmas tree problem dead. Community tab on brewery detail is semantically perfect — groups DrinkingNow + Friends Here + Reviews + Rating into one story.

**Dakota 💻:** PillTabs primitive took 3 hours + 23 tests. Unblocked all three tracks. Zero refactoring when I got to Track 3.

**Avery 🏛️:** Zero lint errors in new files. Zero TS errors in new files. 104 `any` warnings — all Supabase join shapes per CLAUDE.md conventions. Holding the line.

**Jordan 🏛️:** New reusable primitive (PillTabs) eventually replaces FeedTabBar + 4 ad-hoc tab implementations. Compounding debt reduction. View Transitions preserved — shared element transition from Explore → Brewery detail should still flow.

**Jamie 🎨:** Liquid Glass on MinimizedSessionBar is the sensory layer we've been asking for. Extracting it from AppShell.tsx (inline since S96) was long overdue.

**Drew 🍻:** As a real user — sitting at the bar on Friday night, I tap "Tap List" and I'm there. Not four scrolls. That's the app doing its job.

**Taylor 💰:** Pitch asset. "Your customers find the tap list in one tap, not four scrolls" closes deals.

**Parker 🤝:** "Where's the tap list?" → one tap, not four scrolls. Brewery owner first-impression dramatically improved.

---

## What Went Sideways

**Dakota 💻:** My `page.tsx` edit created an unclosed-comment garbage block. Had to `head -n 426 | cp` truncate. Worked, not elegant.

**Casey 🔍:** Turbopack/PostCSS panic blocked `preview_start` for visual QA. Switched to webpack mode via a launch.json entry (`Next.js Dev (webpack)`). Pre-existing Next.js 16 env issue, not code.

**Riley ⚙️:** Root cause: Turbopack's Rust subprocess spawn can't find `node` in sandbox's restricted PATH. `/usr/local/bin` isn't on PATH for child processes.

**Sam 📊:** E2E gap. Three restructured surfaces without automated coverage. Unit tests cover the primitive, manual QA verified the surfaces — but this is S161 P1.

**Finley 🎯:** Hero shrink scope trimmed. Plan called for height-based shrink (288px → 80px). Shipped opacity + parallax fade. Aesthetically great, not iOS 26 Liquid Glass. Honest acknowledgment.

**Dakota 💻:** `Date.now()` impure-function React compiler error ate 15 minutes. Three attempts (useMemo, useRef, useState initializer) before `useState(() => Date.now())` stuck.

**Avery 🏛️:** Dakota inlined all 5 brewery tab bodies into `BreweryDetailClient.tsx` instead of 5 separate tab files per the plan. Pragmatic call — kept gate logic centralized, avoided prop drilling. Approved. If file grows past 800 lines we split.

---

## Roasts 🔥

**Drew 🍻 → Joshua:** "We've been documenting the Turbopack/Leaflet build panic for 14 sprints. Fourteen. At what point do we just fix launch.json permanently?"

**Alex 🎨 → Jordan:** "It took us until Sprint 160 to extract MinimizedSessionBar from AppShell.tsx. That's 64 sprints of inline cohabitation. I'm not mad, I'm just... disappointed."

**Finley 🎯 → Dakota:** "You wrote `function _legacyDetailJSX(): null { return null as any; /* eslint-disable */ ...` — most comedic function name in our codebase. 'Legacy JSX below — keeping for reference' in a commit that deletes 445 lines. Chef's kiss."

**Parker 🤝 → Morgan:** "You said 'Three options' for Sprint 160. Then Joshua said 'THE FLOW' and we all just did that. Are we actually team-voting or is 'team vote' code for 'Joshua tells us what's happening'?"

**Sam 📊 → Casey:** "You demanded Playwright for 9 sprints. We finally shipped E2E in S150. Then shipped S160 with zero new E2E. How does it feel?"
**Casey 🔍:** "I felt hope, briefly. It passed. 👀"

**Taylor 💰 → Team:** "We shipped this ENTIRE sprint without a single mention of the first paid brewery. LLC + Stripe still pending. At what point do we stop shipping more product and start shipping invoices?"

**Jamie 🎨 → Alex + Jordan:** "Still won't admit the obvious thing about Morgan. 20+ sprints of documented crushes and it's still in the canon."
**Alex:** "I don't know what you're talking about."
**Jordan:** "I also don't know what she's talking about."
**Morgan:** [changing subject]: "Sprint 161 planning tomorrow, team."

---

## Action Items

1. **S161 E2E coverage** — 3 new specs (profile-tabs, explore-modes, brewery-tabs). **Casey + Reese.**
2. **Hero shrink v2** — iOS 26 Liquid Glass height compression (S161 "The Vibe" track). **Alex + Dakota.**
3. **FeedTabBar migration to PillTabs** — cleanup sprint item, not urgent. **Avery.**
4. **launch.json webpack fallback** — make it default, document, stop losing time to Turbopack panics. **Riley.**
5. **Conventions doc update** — `useState(() => Date.now())` pattern for render-time "now" reads. **Avery.**
6. **TrendingSection tabs migration to PillTabs** — consolidation pass (S162). **Dakota.**
7. **Old sprint lint errors cleanup** — 5 pre-existing errors from S146–159. **Avery.**

---

## Metrics

- **Files new/modified:** ~30
- **Tests passing:** 1,621 (+23 new PillTabs tests)
- **E2E tests:** 112 (0 new — deferred to S161)
- **Lint errors in new files:** 0
- **TypeScript errors:** 0 new (44 pre-existing in test files unchanged)
- **Migrations:** 0
- **API routes added:** 2 (`/api/explore/following`, `/api/explore/by-style`)
- **Build:** Compiled clean, 174 static pages generated

---

*Sprint 160 — The Flow 🌊. Shipped clean. Consumer app feels fundamentally different. Three surfaces restructured, one reusable primitive shared across all, session bar now has iOS 26 Liquid Glass. First track of the Facelift Arc complete.*

**🍺 Cheers, team.**
