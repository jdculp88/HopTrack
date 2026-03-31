# Sprint 82 Retro — The Full Menu 🍺🍷🍹🥤

**Date:** 2026-03-31
**Facilitator:** Morgan
**Arc:** Stick Around (Sprints 79–84)

---

## What Shipped

- ✅ Non-beer tap list items — beer, cider, wine, cocktail, non-alcoholic (F-011 Phase 1)
- ✅ Category field per item type
- ✅ Food pivot — menu image upload in Settings, displayed on consumer brewery page
- ✅ Board grouped by beverage type with section headers
- ✅ Consumer brewery page grouped by type
- ✅ HopRoute location autocomplete with Nominatim API (F-030)
- ✅ Challenge feed cards fixed (Sprint 81 carry-over — sonner→useToast, UserAvatar props, formatRelativeTime)
- ✅ ChallengeMilestoneFeedCard — 50%/75% friend progress milestones in feed
- ✅ 10 new challenge join validation tests (39 total for challenges)
- ✅ Glass picker filtered by drink type (GLASSES_BY_TYPE)
- ✅ Glass library expanded 20 → 53 glasses (one-for-one from all 5 guides)
- ✅ Resources section in brewery admin nav with 5 glassware guides
- ✅ REQ-072 (multi-location brewery support) documented for The Flywheel arc
- ✅ Migration 055: `item_type` + `category` on `beers`, `menu_image_url` on `breweries`

---

## Team Credits

**Morgan 🗂️**
Started as "add non-beer items to the tap list" and turned into a full beverage platform expansion mid-sprint. The food pivot — shelving tap list food items and shipping menu image upload instead — was the right call and we executed cleanly. Goals met, plus a surprise bonus feature at the end. Sprint grade: A.

**Avery 💻**
Already on it — and then on it again. Built the non-beer type selector, wired up the Board grouping, fixed the consumer page rendering, shipped the HopRoute autocomplete with Nominatim, fixed three Sprint 81 carry-over bugs in the Challenge feed cards, added the glass picker filtering, and then closed the sprint building 33 new glass SVGs from scratch. That last one was a lot of paths. Worth it. Build's clean the whole way through.

**Jordan 🏛️**
The glass library expansion was architecturally sound — 33 new entries following the exact same `GlassType` pattern, unique `gradientNum` values, proper gradient ID substitution. The `GLASSES_BY_TYPE` map in `TapListClient` is the right place for that logic. Worth noting: `lib/glassware.ts` was built as a beer glass library and is now a full beverage glassware library. The pattern held. No refactor needed.

**Quinn ⚙️**
Migration 055 added `item_type` with a CHECK constraint and `menu_image_url` to breweries. There was a wrinkle where `supabase db push` didn't detect it as new — `item_type` had already been partially applied. The column was there, the constraint wasn't. Flagged for production: `menu_image_url` needs a manual confirm via `ALTER TABLE breweries ADD COLUMN IF NOT EXISTS menu_image_url text;`

**Riley ⚙️**
Heard. Adding to the production migration checklist. The `IF NOT EXISTS` guard is exactly right — safe to re-run. Stack is healthy.

**Casey 🔍**
Ten new challenge join tests shipped — double-join detection, expired/inactive/missing challenge validation, concurrent detection, required fields. The `sonner` import bug hiding in three files since Sprint 81 is gone. `useToast` across the board. No more silent import failures waiting to blow up in production. I'm watching. 👀

**Reese 🧪**
The `ChallengeMilestoneFeedCard` is a new component — milestone at 50% and 75%, animated progress bar, proper friend filtering. Adding to the E2E test matrix for Sprint 83.

**Sam 📊**
The glass picker filtering is exactly right. Showing a cocktail brewer a Yard Glass or a Boot Glass is noise. Now you select "Cocktail" and you get coupes, martinis, rocks glasses, highballs. The one-for-one match to the guides gives the feature authority. Brewers will trust it. The Resources page explaining the connection is a nice touch — it teaches the feature rather than just giving access to it.

**Alex 🎨**
The Resources cards look clean. Emoji + colored background per type, external link icon on hover, subtle group-hover scale. One thing to revisit: the glass picker grid could show the oz range below the name rather than just in the tooltip. Logging for Sprint 83.

**Drew 🍻**
The food menu upload is how this actually works in a real taproom. You're not typing out every burger and flatbread into a database — you take a photo of the specials board or scan the laminated menu. Done. I felt that physically — in a good way.

**Taylor 💰**
"HopTrack manages your entire bar, not just your beer" — that's a sentence I can say to a brewery owner now and it's true. Cider, wine, cocktails, NA beverages, food menu on the page. This expands our ICP beyond pure craft beer taprooms. Logging for the pitch guide. Also: 53 glasses in the picker with full guide access in Resources is a feature worth calling out in the onboarding wizard.

**Jamie 🎨**
The Resources section is genuinely useful content sitting inside the product. The glassware guides are beautiful — high-quality reference material that makes HopTrack feel like it was built by people who actually know craft beverage. That's brand. Chef's kiss. 🤌

---

## Carry-overs to Sprint 83

- 🔁 `menu_image_url` production column confirm (Quinn)
- 🔁 E2E coverage for ChallengeMilestoneFeedCard (Reese)
- 🔁 Glass picker oz label visible in grid (Alex)

---

## Key Architectural Changes

- `types/database.ts` — `ItemType` union, `ITEM_TYPE_LABELS`, `ITEM_TYPE_EMOJI`; `item_type` + `category` on `Beer`; `menu_image_url` on `Brewery`
- `supabase/migrations/055_menu_item_types.sql` — `item_type` CHECK constraint, `category`, `menu_image_url`, `idx_beers_item_type`, `idx_challenges_brewery_name_unique`
- `lib/glassware.ts` — expanded from 20 → 53 glass types; new entries: 4 cider, 10 wine, 12 cocktail, 7 NA
- `TapListClient.tsx` — `ITEM_TYPES` (5 types, food excluded from UI), `GLASSES_BY_TYPE` (per-type glass filtering, glass resets on type change)
- `BoardClient.tsx` — grouped by `item_type` with section headers, "On Menu" vs "On Tap" label
- `app/(app)/brewery/[id]/page.tsx` — grouped items + Food Menu section with `menu_image_url`
- `BrewerySettingsClient.tsx` — food menu image upload (`ImageUpload`, `bucket="brewery-covers"`, folder `{id}/menu`)
- `app/api/brewery/[brewery_id]/settings/route.ts` — now saves `cover_image_url` + `menu_image_url`
- `HopRouteNewClient.tsx` — Nominatim location autocomplete (debounced, dropdown)
- `ChallengeFeedCard.tsx` — fixed: `useToast`, `formatRelativeTime`, `UserAvatar` profile prop
- `ChallengeMilestoneFeedCard.tsx` — NEW: 50%/75% milestone feed card with animated progress bar
- `components/brewery-admin/BreweryAdminNav.tsx` — Resources nav item added
- `app/(brewery-admin)/.../resources/page.tsx` — NEW: 5 glassware guide cards
- `public/guides/` — NEW: 5 static HTML guide files
- `lib/__tests__/challenges.test.ts` — 10 new join validation tests

---

*This is a living document. 🍺*
