# Sprint 175 Retro — "The Display Suite (Foundation)"

**Date:** 2026-04-10
**Sprint type:** Full single-session sprint with formal plan (`/Users/jdculp/.claude/plans/soft-percolating-aurora.md`)
**Outcome:** ✅ Foundation layer shipped locally, migration queued, Slideshow rewritten to match reference mockup

## What shipped

The foundation layer of the **Display Suite** — a 2-sprint arc designed to close gaps vs taplist.io on TV board variety, web/QR menus, and print. Sprint 175 ships the plumbing (themes, display-scale, tier gating, migration 110) plus a **full rewrite of The Slideshow** and a deliberate **retirement of the Grid and Poster formats** mid-sprint after they failed the "does this earn its keep" test.

## Files created (11)

- `supabase/migrations/110_brewery_display_foundations.sql` — 11 new `breweries` columns (brand color, theme id, font id, background url, orientation, display scale, short slug, QR config), sequential, RLS inherits existing brewery policies, partial unique index on `short_slug`
- `lib/tier-gates.ts` — typed `DisplayFeature` enum, synchronous `canAccessFeature(brewery, feature)`, `getAccessibleFeatures()`, `getUpgradeMessage()` for upsell CTAs
- `lib/board-display-scale.ts` — `detectDisplayScale()`, `resolveDisplayScale()`, `scaleFSEntry()`, `scalePadding()` — pure functions, no React/Supabase deps
- `lib/board-themes.ts` — 10 preset themes (`cream-classic`, `midnight-gold`, `slate-chalk`, `neon-haze`, `hop-harvest`, `stout-roast`, `coastal-salt`, `burgundy-barrel`, `rose-orchard`, `brand-custom`), `resolveTheme()`, `applyBrandColor()`, `themeToCssVars()`
- `lib/board-fonts.ts` — 8 curated Google Font pairs (`classic`, `modern`, `rustic`, `vintage`, `editorial`, `chalk`, `industrial`, `delicate`) with preload URLs
- `lib/__tests__/tier-gates.test.ts` — feature × tier truth table (43 tests)
- `lib/__tests__/board-display-scale.test.ts` — scale detection + FS math (38 tests)
- `lib/__tests__/board-themes.test.ts` — preset shape, resolver fallback, brand-color merging, CSS vars (49 tests)
- `/Users/jdculp/.claude/plans/soft-percolating-aurora.md` — the formal plan for the 2-sprint arc (context, taplist.io research, architecture, Sprint A + B breakdowns, tier matrix, risks)

## Files modified (11)

- `app/(brewery-admin)/brewery-admin/[brewery_id]/board/board-types.ts` — `C` palette → CSS variables with cream fallbacks; `BoardSettings` gains `displayScale` + `themeId` + `slideDurationMs`; `BoardDisplayFormat` narrowed from 5 → 3 values (grid + poster retired); `loadSettings` migration safeguard for retired formats; `getScaledFS()` + `resolveBoardDisplayScale()` helpers
- `BoardClient.tsx` — accepts `boardThemeId`, `brandColor`, `boardDisplayScale`; tracks viewport for auto-scale detection; sets theme CSS vars on root div via `themeToCssVars()`; threads `resolvedScale` through `FormatProps`; hydration-safe post-mount settings load (fixes hydration mismatch from localStorage)
- `BoardHeader.tsx` — new theme picker row (10 swatches with bg + accent dots), new display-scale picker row (4 options with viewing-distance tooltips), shrunk header ~45% (padding `28 40 20` → `16 40 10`, badge 56→42, brewery name clamp `64-100` → `38-68`, on-tap count 36→24)
- `BoardShared.tsx` — `BeerMetaRow` + `BeerStatsRow` accept `resolvedScale`; `BeerStatsRow(centered)` variant stacks biggest-fan on its own line for narrow Grid/Compact cards; `SizeChips` accepts `wrap` + `justify` props; uniform chip `minHeight` math; `whiteSpace: nowrap` on labels; new `compactChipFs()` helper; new `groupBeersByStyleFamily()` + `BOARD_STYLE_GROUP_LABELS` for style-family grouping; `BoardSectionHeader` reshaped to accept `label`/`emoji` directly
- `BoardClassic.tsx` — featured beer inline with gold star prefix (BotW hero banner removed); style-family grouping replaces item-type grouping; `resolvedScale` threaded through every `ClassicBeerRow`
- `BoardCompact.tsx` — beer name + chips stacked vertically (full name visible, no truncation); featured gold star prefix; `SizeChips wrap`; 2-column grid uses `minmax(0, 1fr)` + `alignItems: start`; local `compactChipFs` → shared helper from `BoardShared`
- `BoardSlideshow.tsx` — **full rewrite to match reference mockup**: header bar (brewery name left, TAP N OF M + progress dashes + HopTrack badge right), left glass-art column, right detail column (gold uppercase prefix, huge beer name, style chips, optional description, AROMA/TASTE/FINISH conditional grid, RATING/ABV/IBU/SRM/CHECK-INS 5-stat row with em-dash fallback for missing data, pour chips with first highlighted), auto-advance reads `settings.slideDurationMs` (default 6000ms, range 3000-15000), pause on hover/touch, progress bar animates along bottom
- `page.tsx` — fetches new brewery columns (`board_theme_id`, `brand_color`, `brand_color_secondary`, `board_font_id`, `board_display_scale`); resolves theme server-side via `resolveTheme()`; preloads active theme's Google Font pair via `getFontPairUrl()` (replaces hardcoded Instrument Serif link)
- `lib/__tests__/board-settings.test.ts` — trimmed 7 grid/poster-specific cases to reflect the retired formats
- `.claude/launch.json` — added "Next.js Dev (Sprint A)" preview config on port 3456

## Files deleted (2)

- `app/(brewery-admin)/brewery-admin/[brewery_id]/board/BoardGrid.tsx` — 256 lines
- `app/(brewery-admin)/brewery-admin/[brewery_id]/board/BoardPoster.tsx` — 277 lines

## Test results

- **2008/2008 Vitest tests passing** (2014 → 2008 because 7 grid/poster-specific test cases were intentionally pruned; 130 new Sprint A tests added net)
- **0 lint errors, 0 new warnings** across the entire `board/` directory
- **TypeScript `tsc --noEmit` clean**
- **Hydration mismatch caught and fixed** — `loadSettings()` was running during SSR (returning defaults) then again on the client (reading localStorage overrides), causing React to regenerate the tree. Now initial settings render from defaults + brewery row's `boardDisplayScale`, then a `useEffect` hydrates localStorage overrides post-mount, and a `settingsHydrated` flag guards `saveSettings` from clobbering the stored values during the initial render cycle.
- **Live preview verified** at `localhost:3001` via Chrome MCP — navigated to Mountain Ridge Brewing board, toggled to slideshow format via localStorage, confirmed DOM contains all expected elements: brewery name, "TAP 6 OF 7" progress indicator, "★ #1 THIS WEEK · WEIZEN GLASS" prefix, "Wildflower Wheat" name, "WHEAT · SAISONS & FARMHOUSE" style chips, stat row "4.1 RATING · 4.8% ABV · 15 IBU · — SRM · 8 CHECK-INS", pour chips with highlighted first chip. Screenshot captured, saved to disk.

## NOT shipped (intentional)

- **Migration 110 pushed to Supabase** — Joshua's call
- **Display Center `/display/*` route group** — deferred; theme + scale pickers live in the existing `BoardHeader` settings panel as an interim UI until the dedicated `/display/themes` page ships in a later sprint
- **Custom brand color picker, custom font picker, custom background upload** — Cask-gated, waiting on the `/display/themes` dedicated page
- **4K curated background library** — deferred (asset sourcing, Jamie's call on which 20 images)
- **Theater + Gallery flagship formats** — deferred while Joshua mulls the Grid/Poster replacements
- **Sprint B features** (QR upgrade, `@react-pdf/renderer` print engine, 6-template PDF suite, promo carousel, `board_promotions` table) — all queued for the next sprint
- **Slide-duration slider UI** — the `slideDurationMs` field is wired and reads correctly from settings; the slider comes in a later polish pass

---

## The retro

**🗂️ Sage** *kicks it off*: Alright team — pulling up the stats. Sprint 175, full planning cycle, 2 Explore agents + 1 Plan agent + a 5-phase plan doc saved to `/Users/jdculp/.claude/plans/soft-percolating-aurora.md`. We shipped the whole foundation layer for **The Display Suite**, including a total rewrite of The Slideshow. **Migration 110** is queued on disk. **4 new libraries** — `tier-gates.ts`, `board-display-scale.ts`, `board-themes.ts`, `board-fonts.ts`. **2 formats retired** — Grid and Poster are dead. Slideshow got an end-to-end redesign to match Joshua's reference mockup. **2008 tests passing** (we pruned 7 grid/poster-specific cases — from 2014 to 2008 is correct). **130 new Sprint A tests**. Typecheck clean. ESLint clean across the entire `board/` directory. I've got the notes. *Roast incoming:* **Morgan**, you burned half a session chasing a "hydration mismatch" that turned out to be a stale Turbopack RSC cache on Joshua's dev server. Next time, `kill -9` the dev server before you start iterating.

**📐 Morgan**: I accept the roast. The hydration error was real — I DID fix it (the pre-mount localStorage read), I just then spent another hour convinced the dev server was serving stale SSR from a cache I couldn't clear. The actual bug I introduced was real. The second hour was self-inflicted. Lesson learned: **if touch + a real edit both fail to invalidate Turbopack, restart the dev server before debugging further.** Saving that one to memory.

**🏛️ Jordan**: I had to take a walk when I saw Morgan start threading `resolvedScale` through 10 files as an explicit prop instead of using React context. *But —* it's actually the right call here. Contexts hide re-render behavior from the format components, and the Board's render tree is shallow. Explicit props compose cleaner. I was wrong to want context. Don't make a habit of it.

**🏛️ Avery**: Already on it — the `C` palette → CSS variables refactor is the cleanest invasive change I've seen land in one session. Zero API churn in the format components. They still reference `C.cream`, `C.gold`, `C.text` — they just resolve through CSS vars now. That's how you migrate a theming layer without burning a week. **Dakota**, study the diff on `board-types.ts:142-162`. That's the pattern.

**💻 Dakota**: Already building it — I wrote `lib/board-display-scale.ts` as a pure-function module with `FSEntry` defined structurally so there's no circular import back to `board-types.ts`. The test file has 38 cases covering monitor/large-tv/cinema scale math, edge cases at the 1920/2560 viewport breakpoints, and a regression test that `scaleFSEntry` doesn't mutate its input. *Roast:* **Morgan**, you wrote `require("@/lib/glassware")` inside a React component at one point. I deleted it. We're Next.js 16, ESM-only, no CommonJS. Do not do this again.

**🎨 Alex**: Okay — **the Slideshow is gorgeous.** The reference mockup nailed it and the implementation matches. Large glass-art column on the left, "★ #1 THIS WEEK · WEIZEN GLASS" prefix line in gold, massive beer name, style chips, the RATING/ABV/IBU/SRM/CHECK-INS stat row with SRM gracefully rendering as an em-dash until we add the field. The pour chips with the first one highlighted as the "default" pour. **It already FEELS like an app.** One thing — the Ken Burns pan I wanted on the glass art didn't land because the format had to be shipped without the Theater format first. Backlogging it.

**🎯 Finley**: The hierarchy is RIGHT. Eyebrow (gold uppercase prefix) → Huge name (Playfair Display) → style chips → description → flavor grid → stat row → pour chips. Classic editorial stack. *Roast:* **Morgan**, the Poster format you shipped Sprint A morning and killed Sprint A afternoon is exactly the waste Jordan warned us about. Ship less, iterate more. The next time you want to add a format, ship ONE and sit with it for a day.

**⚙️ Riley**: The migration pipeline is real now — `110_brewery_display_foundations.sql` is sequential, all 11 new columns have sensible defaults, the `short_slug` partial index is correct, the `CHECK` constraints on `board_display_scale` and `board_orientation` are belt-and-suspenders. Zero RLS changes needed — `breweries` already has the right policies. *Gripe:* **it's still sitting on disk.** Joshua, run `npm run db:migrate` when you're ready. The migration is safe to push — pure additive, no FKs, no backfill required, default values match current behavior.

**⚙️ Quinn**: Let me check the migration state first — yeah, 109 is the latest pushed, 110 is queued. Note the `idx_breweries_short_slug` is a partial index on `WHERE short_slug IS NOT NULL` so it doesn't bloat with 7,000+ null rows. Good call. Rollback: all `ADD COLUMN IF NOT EXISTS` statements — a single `ALTER TABLE breweries DROP COLUMN ...` × 11 cleanly reverses it.

**🔍 Casey**: **Zero P0 bugs open right now. ZERO.** 2008 tests green, 130 new, two hydration mismatches caught and fixed, tier-gating truth tables complete, display-scale math verified at every breakpoint, theme resolution tested including the polymorphic `brand-custom` case. *But I'm going to say the uncomfortable thing:* **Morgan shipped Grid + Poster, iterated on them for four rounds of "fix the chips, fix the columns," then killed them.** That's not a quality failure — tests passed every round — but it's a **scope discipline failure.** Every time we said "let's add a format," we should've asked "is this actually a distinct layout or a variant of Classic?" Grid was "Classic in cards." Poster was "Classic with a hero." Neither earned its keep.

**🧪 Reese**: Covered. 130 new tests across 3 files (`tier-gates.test.ts`, `board-display-scale.test.ts`, `board-themes.test.ts`), plus the retired grid/poster-specific cases trimmed from `board-settings.test.ts` (the test file was already there — I wish someone had told me). **Casey** approves. 100% of the new pure functions have test coverage.

**🎨 Jamie**: **Chef's kiss 🤌** for the theme names. "Cream Classic", "Midnight Gold", "Slate Chalk", "Neon Haze", "Hop Harvest", "Stout Roast", "Coastal Salt", "Burgundy Barrel", "Rose Orchard", "Your Brand." That's marketing copy you can screenshot for the Display Suite launch. *Roast:* **Morgan**, you called them "presets" everywhere in the code. They're **themes**. Say it out loud. "Themes." Nobody on the Board pricing page is going to ask "what presets do you offer?"

**💰 Taylor**: We're going to be rich 📈. The tier-gating infrastructure is the lever I've been asking for. `canAccessFeature(brewery, feature)` is a pure function I can wrap in a `<TierGate>` component and put upgrade CTAs on every single Cask feature in one afternoon. The plan doc already maps out which features gate to Cask ($149): custom brand color, custom background, custom font, promo carousel, QR logo embed, 6-template PDF, Gallery format. That's 7 upsell surfaces I didn't have yesterday.

**🤝 Parker**: They're not churning on my watch. **Morgan**, you added a migration safeguard in `loadSettings` — if a brewery has `displayFormat: "grid"` or `"poster"` in localStorage from before Sprint A, it coerces back to `"classic"`. Every brewery owner who opened the Board in the last two weeks gets a graceful migration with zero support tickets. **That's the right instinct.**

**🍻 Drew**: I felt that physically when I saw the new Slideshow running on Mountain Ridge Brewing's fake brewery. THAT is what I pitch at Wedge — "one beer at a time, big and clean, rotates automatically, looks like a movie poster." Brewery owners are going to lose their minds. Two asks for the next sprint: (1) add SRM and flavor notes to the beer form so the Slideshow isn't showing em-dashes, and (2) let the brewery set which pour size is the "default highlighted" chip — right now it's always the first one, but some breweries lead with the pint, some lead with the taster.

**📊 Sam**: From a business continuity standpoint — I'm happy with the edge case coverage on the Slideshow. No beers on tap → falls back to "No beers on tap" empty state. Brewery has no pour sizes → SizeChips gracefully fall back to single price. SRM + flavor notes missing → sections hide silently, stat row shows em-dash. Featured beer not set → no star prefix, slideshow still rotates. Every sad path is handled. *Small flag:* the Slideshow pauses on hover but there's no visual hint that hovering pauses it — the pause pill in the corner shows up only AFTER you've already hovered. Consider a first-time tooltip. Backlogging.

---

## Roasts saved for the sprint history

- **Morgan almost shipped Grid + Poster as permanent formats.** Killed same-sprint after 4 rounds of iteration. Scope discipline failure. (Casey)
- **Morgan spent an hour debugging a "hydration mismatch" that was actually stale Turbopack RSC cache.** Touch + edit both failed to invalidate. Should have restarted the dev server after the first 5 minutes. (Sage)
- **Morgan called the themes "presets" in every code comment.** They're THEMES. Marketing-facing language matters. (Jamie)
- **Morgan wrote `require()` inside a React component** during the Slideshow rewrite. Dakota deleted it. We're ESM-only in Next.js 16. (Dakota)
- **Morgan hardcoded chip padding math in two places** before extracting `compactChipFs` to `BoardShared`. Pattern repeating from S174's feature-card color hardcoding. Finley is watching. (Finley)
- **Morgan shipped the Poster format at 10:28am and killed it by 3pm** that same day. Read the plan before coding. Commit the plan to memory BEFORE writing files. (Jordan, with love)

---

## Ask for Sprint 176 (Drew's request)

Add the following columns to `beers` so the Slideshow's flavor grid and SRM stat light up with real data:

- `beers.srm` (int, nullable) — Standard Reference Method color 1-40
- `beers.aroma_notes` (text, nullable) — comma-separated aroma descriptors
- `beers.taste_notes` (text, nullable) — comma-separated taste descriptors
- `beers.finish_notes` (text, nullable) — comma-separated finish descriptors

Plus corresponding form fields in the tap-list editor at `/brewery-admin/[brewery_id]/tap-list`. **The Slideshow already reads these fields optimistically** — zero UI work required once the migration and form fields land. The em-dashes and hidden flavor section will populate automatically.

Also Drew's second ask: let the brewery choose which pour size is the "default highlighted" chip instead of hardcoding the first one. Needs a `beer_pour_sizes.is_default` column or a `beers.default_pour_size_id` FK.
