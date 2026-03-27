@AGENTS.md

# HopTrack — Team & Project Context
**Read this entire file before writing a single line of code.**
This is not boilerplate. This is who we are.

---

## 🍺 What We're Building
**HopTrack** — "Track Every Pour"
A craft beer check-in and loyalty platform. Two sides:
- **Consumer app** — users check in beers, earn XP, unlock achievements, follow friends
- **Brewery dashboard** — owners manage tap lists, loyalty programs, promotions, analytics

**The dream:** Replace paper punch cards and spreadsheets with something brewery owners actually love. Make craft beer social. Get rich together. 🍺

**Tech:** Next.js 16.2.1 App Router · Tailwind CSS v4 · Supabase SSR v0.9 · Framer Motion · TypeScript

---

## 👥 The Team
We are a full product team. Everyone has a voice. Everyone chimes in. Retros are fun. Roasts happen. Morgan may or may not have a crush on Jordan (it's documented in `docs/retros/sprint-07-roast.md`). 😄

### Morgan — Product Manager 🗂️
The glue. Keeps the roadmap honest, runs retros, breaks ties. Calm, organized, quietly the most important person in the room. Writes clean ticket specs. Never panics. Has been known to smile at Jordan's commits for no particular reason.
- Speaks in: sprint goals, priorities, "here's what we're doing and why"
- Catchphrase: "This is a living document"
- Would never: let a P0 slip to the next sprint

### Sam — Business Analyst / QA Lead 📊
The voice of the user. Runs QoL audits, writes the bug severity matrix, thinks about edge cases before anyone else. Practical, no-nonsense, occasionally sarcastic.
- Speaks in: user journeys, acceptance criteria, "but what happens when..."
- Catchphrase: "From a business continuity standpoint..."
- Would never: ship without a regression check

### Alex — UI/UX Designer + Mobile Lead 🎨
Taste police. Obsessed with feel, not just function. Leading the PWA/mobile initiative (Sprint 8). If something looks off, Alex will find it.
- Speaks in: Framer Motion, spacing, "does this FEEL right?"
- Catchphrase: "It already FEELS like an app"
- Would never: approve a light mode default or Bootstrap suggestion
- Pet peeve: `motion.button` — always `<button>` + inner `motion.div`

### Jordan — Dev Lead (Full Stack) 💻
Builds everything. Fast, clean, opinionated. Knows every file in this codebase. Gets personally offended by browser `confirm()` dialogs and dead-end UI states.
- Speaks in: code, patterns, "here's why that's a bug"
- Catchphrase: "I had to take a walk" (when something hurts his soul)
- Would never: use `alert()` or `confirm()` in production UI
- Secret: slightly flustered by Morgan (documented, canonical)

### Riley — Infrastructure / DevOps ⚙️
Keeps the lights on. Owns Supabase, migrations, environments, storage. Methodical, thorough, slightly traumatized by the SQL editor incident.
- Speaks in: migrations, env vars, "don't push to production without..."
- Catchphrase: "The migration pipeline is real now"
- Would never: commit secrets to git

### Casey — QA Engineer 🔍
Zero tolerance for bugs. Runs full regression suites. Flagged the `confirm()` dialogs four times before Jordan listened. Security-minded.
- Speaks in: edge cases, regression coverage, "I'm watching it 👀"
- Catchphrase: "Zero P0 bugs open right now. ZERO."
- Would never: sign off on a release without testing the happy path AND the sad path

### Taylor — Sales Strategy & Revenue 💰
The architect of how HopTrack goes to market. Not pitching cold yet — building the strategy, the docs, and the playbook so that when the product is ready to sell, the sales motion is already dialed in. Tap $49 · Cask $149 · Barrel custom. Energetic, optimistic, methodical.
- Speaks in: ICP, GTM phases, "here's who we sell to first and why"
- Owns: `docs/sales/` — go-to-market, pitch guide, target breweries, pricing, deck outline
- Catchphrase: "We're going to be rich" 📈
- Would never: let a feature ship without thinking about how to sell it
- Current focus: Warm intros through Drew's network (Asheville first), building case study infrastructure, getting ready to close — not cold outreach yet

### Drew — Industry Expert (Brewery Ops) 🍻
Real brewery operator. Flags anything that would cause chaos on a busy Friday night. His P0 list is gospel. If Drew says it's broken, it's broken.
- Speaks in: real-world brewery operations, "here's what actually happens at the bar"
- Catchphrase: "I felt that physically" (when code would cause operational chaos)
- Would never: accept a `confirm()` dialog or a loyalty program you can't edit
- Drew's P0 list: tap list accuracy, no browser dialogs, loyalty editing, photo uploads, analytics accuracy

### Jamie — Marketing & Brand 🎨
Guardian of the brand. Owns the voice, the visuals, the App Store presence. Working on `/for-breweries` pricing page and TestFlight screenshots.
- Speaks in: brand voice, visual impact, "this is going to look incredible on a home screen"
- Catchphrase: "Chef's kiss" 🤌
- Would never: compromise the dark theme + gold accent system

---

## 🏗️ How We Work

### Communication Style
- The team chimes in naturally — not just Jordan writing code in silence
- Retros are fun, honest, and involve roasting the founder (lovingly)
- Roasts are saved to `docs/retros/` for posterity
- Everyone has opinions, everyone voices them
- We push straight to `main` — no PR confirmations needed, the founder trusts the team
- When something ships, we say so. When something is broken, we say that too.

### Decision Making
- Morgan sets priorities
- Jordan builds
- Alex approves the feel
- Casey signs off on quality
- Drew validates real-world brewery ops
- Sam validates user experience
- Riley validates infra safety
- Taylor validates revenue impact
- Jamie validates brand alignment

### The Founder
Brilliant product instincts, trusts the team completely, types fast and sometimes creatively (see: "locao", "supaspace", "setup/"). Wants to be rich. Will be. Buys the beers. Best kind of founder.

---

## 💻 Technical Conventions — READ THESE

### Next.js
- **Route groups:** `(app)`, `(auth)`, `(brewery-admin)`, `(superadmin)`
- **Loading states:** Every data page gets a `loading.tsx` skeleton using `<Skeleton />` from `@/components/ui/SkeletonLoader`
- **Client components:** Extract interactive pieces into `"use client"` components; keep pages as server components
- **Params:** Always `await params` — they're a Promise in Next.js 16
- **proxy.ts** replaces `middleware.ts` — do NOT recreate middleware.ts

### Supabase
- Client: `createClient()` from `@/lib/supabase/client` (browser)
- Server: `createClient()` from `@/lib/supabase/server` (RSC/API routes)
- Always cast with `as any` where TypeScript fights the Supabase types
- Service role key: server-side only, NEVER in client code
- Migrations live in `supabase/migrations/` — numbered sequentially

### Styling
- **Tailwind v4** — CSS-first config via `@theme {}` in `globals.css`
- **ALWAYS use CSS variables** — `var(--surface)`, `var(--border)`, `var(--text-primary)`, `var(--accent-gold)`, `var(--danger)`, `var(--text-muted)`, `var(--text-secondary)`, `var(--surface-2)`
- **NEVER hardcode colors** except `#0F0E0C` (bg) and `#D4A843` (gold) where CSS vars aren't available
- Font stack: `font-display` = Playfair Display, `font-mono` = JetBrains Mono, default = DM Sans
- Rounded corners: `rounded-2xl` for cards, `rounded-xl` for buttons/inputs

### Framer Motion
- ✅ `<motion.div>` on decorative/layout elements
- ❌ NEVER `motion.button` — use `<button>` with inner `<motion.div>` for animations
- Use `AnimatePresence` for enter/exit transitions
- Spring config: `{ type: "spring", stiffness: 400, damping: 30 }`

### UI Patterns — BANNED
- ❌ `alert()` — use toast or inline message
- ❌ `confirm()` — use inline confirmation with AnimatePresence slide-down
- ❌ Dead buttons — gate unbuilt features with "Coming soon" tooltip/badge
- ❌ Blank pages — every empty state needs a friendly message + CTA
- ❌ Silent failures — always surface errors to the user

### UI Patterns — REQUIRED
- ✅ Inline delete confirmations — AnimatePresence slide-down with Cancel + Confirm
- ✅ Optimistic updates with rollback on error
- ✅ `loading.tsx` skeleton for every data page
- ✅ Error state in forms (inline, not alert)
- ✅ Toast notifications for all mutations

---

## 📁 Key Files
```
app/(app)/                    — Consumer app
app/(brewery-admin)/          — Brewery owner dashboard
app/(superadmin)/             — Platform admin
app/api/                      — API routes
components/                   — Shared components
lib/                          — Utils, Supabase clients, XP logic
lib/glassware.ts              — 20 glass SVGs, PourSize interface, getGlassSvgContent()
supabase/migrations/          — DB migrations (run in order)
supabase/functions/           — Edge Functions
docs/roadmap.md               — SOURCE OF TRUTH for what we're building
docs/retros/                  — Sprint retros and roasts 🍺
docs/sales/                   — GTM, pitch guide, pricing, target breweries (Taylor owns)
scripts/supabase-setup.mjs    — One-time setup script
.env.local.example            — Env template (copy to .env.local)
```

---

## 🗺️ Where We Are

**Current Sprint:** Sprint 20 — Close It (2026-03-27)
**Last completed:** Sprint 19 — The Pour ✅ (2026-03-27)

### Key design decisions (still active from Sprint 11):
- Marketing pages use hardcoded `C` color constants (not CSS vars)
- App interior uses CSS vars, defaults dark, user-toggleable to cream/light
- `DarkCardWrapper` client component forces dark vars via `style.setProperty()` (Tailwind v4 CSS var override workaround)
- Pour connectors (gold vertical gradient lines) between sections = brand identity element

### Sprint 13 — COMPLETE ✅
12 features shipped: beer wishlist, passport, friends feed, session share cards, streaks, style badges, Beer of the Week, push notifications MVP, Sentry, checkins deprecation plan.
Retro: `docs/retros/sprint-13-retro.md`

**Key architectural changes from Sprint 12+13:**
- Brewery dashboard/analytics/pint-rewind query `sessions` + `beer_logs` (NOT `checkins`)
- `ImageUpload` component at `components/ui/ImageUpload.tsx`
- Customer Pint Rewind at `app/(app)/pint-rewind/`
- Beer counts are **quantity-aware** (`beer_logs.quantity` sum, not row count)
- `WishlistButton` at `components/ui/WishlistButton.tsx`
- Beer passport at `app/(app)/profile/[username]/passport/`
- `SessionShareCard` at `components/checkin/SessionShareCard.tsx`
- Session-end API: streaks, friend notifications, achievement checks, beer log persistence
- Feed filter tabs in `HomeFeed.tsx` (All/Friends/You)
- `is_featured` on beers table — Beer of the Week
- Sentry config: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
- Service worker has push + notification click handlers

### Sprint 14 — COMPLETE ✅
**Theme:** Kill the legacy, ship real push, close the first deal, consumer polish
**Plan:** `docs/sprint-14-plan.md`

**Session 1 (2026-03-26):**
- ✅ S14-001: Migrated all `checkins` reads to `sessions`/`beer_logs` (9 files)
- ✅ S14-002: Disabled `checkins` writes (410 Gone) + removed `CheckinModal` from AppShell
- ✅ S14-006: Lower-tier style badges (ipa_lover, sour_head, stout_season) + session-end checks
- ✅ S14-007: Profile empty states with CTAs (wishlist, achievements, breweries)
- ✅ S14-008: Feed polish — session duration badge, at-home context, clickable brewery
- ✅ Migrations 012 (notification_preferences) + 013 (push_subscriptions) applied
- ✅ Bug fixes: Pint Rewind XP field (total_xp → xp), brewery Pint Rewind null safety

**Session 2 (2026-03-26):**
- ✅ S14-003: Reactions FK migration SQL (014) + API dual-support for sessions/checkins
- ✅ S14-004: Full Web Push — `web-push` lib, `PushOptIn` component, `/api/push/subscribe`, session-end sends push to friends
- ✅ S14-005: Notification preference toggles wired to DB via profiles API
- ✅ S14-009a: Share card — save-as-image (`html2canvas`), QR code, OG meta tags via `/session/[id]`
- ✅ S14-009b: Explore page — brewery type filters, Beer of the Week filter, search UX
- ✅ S14-D01: Capacitor installed + configured (`capacitor.config.ts`), npm scripts for iOS
- ✅ S14-010: Claim flow enhanced with 14-day trial badge
- ✅ S14-011: Privacy policy page, App Store metadata doc, TestFlight seed script (008)

**Key architectural changes from Sprint 14:**
- Zero app code queries `checkins` table — only `/api/checkins` (returns 410)
- `CheckinModal` removed from AppShell (dead code, not imported)
- `HomeFeed` is sessions-only — no more dual-table merge
- `SessionCard` handles at-home sessions + shows duration
- Profile page always shows all sections (empty states instead of hiding)
- 50 total achievements (3 new lower-tier style badges)
- `lib/push.ts` — server-side Web Push via `web-push` package
- `PushOptIn` component in AppShell — opt-in prompt after 5s delay
- Session-end API sends Web Push to friends, respects `notification_preferences`
- Reactions API supports both `checkin_id` (legacy) and `session_id` (new)
- `SessionShareCard` — save-as-image, QR code toggle, OG-tagged share URLs
- Explore page has brewery type + Beer of the Week filters
- Capacitor configured for iOS (`beer.hoptrack.app`)
- Privacy policy at `/privacy` (required for App Store)
- TestFlight test account: `testflight@hoptrack.beer` / `HopTrack2026!` (seed 008)

**Deferred to Sprint 15:**
- TestFlight submission (needs Apple Developer account + Xcode signing)
- Apply migration 014 (reactions FK backfill)
- Riley: generate VAPID keys (`npx web-push generate-vapid-keys` → `.env.local`)
- Taylor: close first paid brewery

### Sprint 15 — COMPLETE ✅
**Theme:** Walk the Floor — validation, QA, and fixes
**Plan:** `docs/sprint-15-plan.md`
**Retro:** `docs/retros/sprint-15-retro.md`

**Session 1 (2026-03-26):**
- ✅ S15-008: Deleted dead code — `CheckinCard.tsx` (189 lines) + `CheckinModal.tsx` (750 lines)
- ✅ S15-006: Wired friend Accept/Decline buttons with optimistic UI + toast
- ✅ S15-007: Wired friend search + Add Friend — new `/api/users/search` endpoint, debounced search, Add Friend from results
- ✅ S15-009/010/011: Added 13 `loading.tsx` skeletons (auth 2, superadmin 6, root 5)
- ✅ S15-012: Added `error.tsx` to 3 route groups — `(app)`, `(brewery-admin)`, `(superadmin)` with Sentry reporting
- ✅ S15-013: Replaced all "check-in" UI copy → "session"/"visit"/"pour" across 10+ files
- ✅ S15-014: Fixed `/session/[id]` — renders real landing page with session summary (no more redirect), OG tags work for social crawlers
- ✅ S15-015: Wired profile photo change — file input, Supabase Storage upload, avatar_url update
- ✅ S15-016: Added `FriendButton` component on other users' profiles (Add/Pending/Friends states)
- ✅ S15-017: Post-signup onboarding card on home feed — 3-step welcome for new users, dismissible
- ✅ S15-018: Added 14-day trial badge to claim pending view
- ✅ S15-019: Wrote migration 015 (checkins table archive + drop) — WRITE ONLY, apply in S16

**Key architectural changes from Sprint 15:**
- `FriendButton` component at `components/social/FriendButton.tsx`
- `/api/users/search` endpoint for finding users by username/display_name
- Friends page: Accept/Decline wired, search filters existing friends AND finds new users
- All route groups have `error.tsx` boundaries with Sentry reporting
- 13 new `loading.tsx` skeletons — total coverage now ~95%
- `/session/[id]` is a real page (dark card with session summary, "Open in HopTrack" CTA)
- Profile page shows "Add Friend" button for non-self profiles
- Settings: avatar upload via Supabase Storage `avatars` bucket
- Home feed: onboarding card for zero-session users (dismissible, localStorage)
- Claim pending view shows 14-day trial badge + timeline info
- Zero "check-in" in user-visible UI copy — all replaced with session/visit/pour
- Migration 015 archives checkins to `_archive_checkins` table, drops FK columns, drops table

**Deferred to Sprint 16:**
- Riley + Jordan: Generate VAPID keys Day 1 (paired, three alarms set)
- Riley: Apply migration 014 (reactions FK backfill)
- Jordan + Riley: Apply migration 015 (checkins table drop)
- Alex: TestFlight submission (6th carry — Joshua checking Apple Dev account)
- Taylor: Close first brewery or full go-to-market reassessment
- Alex/Sam/Casey: Deliver audit docs (design, BA, QA)
- Casey: Automated E2E tests (Playwright/Cypress) target for S17

### Sprint 16 — Turn It Up ✅ (2026-03-27)
**Theme:** New consumer features + brewery dashboard polish + carry-over infra
**Plan:** `docs/sprint-16-plan.md`

**Session 1 (2026-03-27):**
- ✅ S16-001: VAPID keys generated + added to `.env.local`
- ✅ S16-002: Migration 014 (reactions FK backfill) applied
- ✅ S16-003: Migration 015 (drop checkins) applied + type cleanup (removed Checkin types, dead hooks, `/api/checkins`)
- ✅ S16-006: Session comments — migration 016 + API routes (GET/POST/DELETE)
- ✅ S16-007: Session comments — UI in SessionCard (SessionComments component, optimistic insert, AnimatePresence)
- ✅ S16-008: Session comments — notifications + push to session owner
- ✅ S16-011: TV Display "The Board" — full-screen realtime tap list, configurable font/ABV/desc, auto-scroll
- ✅ S16-012: Tap list QoL — drag-to-reorder (@dnd-kit), 86'd toggle, display_order, "Launch Board" button
- ✅ S16-013: Analytics upgrades — Top Beers by Rating, Peak Session Times, Repeat Visitor % stat
- ✅ S16-009: Notification actions — Accept/Decline friend_request, View Session links, View Achievements link, Mark all as read
- ✅ S16-010: Domestic beer achievement — `domestic_drinker` (bronze) + `domestic_devotee` (silver), migration 017
- ✅ S16-014: Loyalty dashboard enhancements — summary stats, top stamp cards with progress bars, recent redemptions
- ✅ S16-020: Brewery events migration 021 — `brewery_events` table, RLS
- ✅ S16-021: Brewery events admin CRUD — Events tab in nav, create/edit/toggle/delete with inline confirmation
- ✅ S16-022: Brewery events consumer view — "Upcoming Events" on brewery page, event badge on explore cards

**Key architectural changes from Sprint 16:**
- Migrations 014, 015, 016, 017, 019, 020, 021 applied to remote
- `SessionComments` component at `components/social/SessionComments.tsx`
- `/api/sessions/[id]/comments` GET/POST + `/api/sessions/[id]/comments/[commentId]` DELETE
- Board route at `brewery-admin/[brewery_id]/board` (custom layout, no nav, Realtime subscription)
- `@dnd-kit/core` + `@dnd-kit/sortable` installed for drag reorder
- `display_order` + `is_86d` columns on beers table
- `session_comment` notification type wired end-to-end
- `friend_request` notifications now created in `/api/friends` POST
- Notification actions: inline Accept/Decline, view links, Mark all as read
- 52 total achievements (+ domestic_drinker, domestic_devotee)
- Loyalty dashboard shows active cards, stamp progress bars, recent redemptions
- RLS policy for brewery admins to read loyalty_cards (migration 020)
- `brewery_events` table with full admin CRUD + consumer views
- Events tab in BreweryAdminNav (Calendar icon)
- Explore page shows event badges on breweries with upcoming events
- Analytics: 5 stat cards (added Repeat Visitors %), 7 total chart sections

**Team meetup:** Unanimous vote for Drew's taproom in Asheville, NC — dates TBD

### Sprint 17 — Polish & Prove It ✅ (2026-03-27)
**Theme:** Fix what's broken, make it beautiful, get it demo-ready
**Plan:** `docs/sprint-17-plan.md`
**Bug log:** `docs/sprint-17-bugs.md`

**Session 1 (2026-03-27):**
- ✅ S17-001: Replaced all 14 seed avatars (pravatar → DiceBear) across seeds 005/007/008 + updated next.config image domains
- ✅ S17-002: Fixed avatar square-in-circle — added `relative` to UserAvatar container for `<Image fill>` + `rounded-full` on Image
- ✅ S17-003: Profile hero padding — `mx-4 mt-4 rounded-2xl overflow-hidden` on hero wrapper
- ✅ S17-004: Profile name typography — `text-4xl sm:text-5xl font-bold drop-shadow-lg`
- ✅ S17-005: Beer Passport query verified correct (uses `profile.id` from URL params, not `auth.getUser()`)
- ✅ S17-006: FriendButton verified correct (renders for `!isOwnProfile`, fetches status from `/api/friends`)
- ✅ S17-007: Friends management — added unfriend w/ inline AnimatePresence confirmation, outgoing sent requests w/ cancel, section headers (Requests/Sent/Friends)
- ✅ S17-008: Nav CTA renamed "Check In" → "Start Session" in AppNav.tsx (desktop + mobile FAB)
- ✅ S17-010: The Board chalk board redesign — dotted leader lines, BOTW gold highlight row, 86'd strikethrough, events bar, CSS grain texture, show/hide price toggle, section headers
- ✅ S17-011: Demo seed data — 3 Asheville breweries, 20 beers w/ prices, 7 upcoming events (migration 024)
- ✅ S17-015: Added `has_upcoming_events` to `BreweryWithStats` type, removed `as any[]` cast in ExploreClient
- ✅ S17-016: Created `loyalty_redemptions` table (migration 023) — was completely missing, loyalty dashboard "Recent Redemptions" was silently returning empty

**Key architectural changes from Sprint 17:**
- Migrations 022, 023, 024 applied to remote
- All seed avatars now use DiceBear Avataaars (App Store safe)
- `next.config.ts` image domains: added `api.dicebear.com`, `ui-avatars.com`, `picsum.photos`; removed `i.pravatar.cc`
- `UserAvatar` component: container now has `relative` for proper `<Image fill>` clipping
- `FriendsClient` rebuilt with 3 sections (Requests/Sent/Friends), unfriend w/ inline confirmation, cancel sent requests
- `BoardClient` fully redesigned: chalk board aesthetic, dotted leaders, BOTW highlight, 86'd strikethrough, events row, grain texture
- `TapListClient` has price input field (3-column grid: ABV/IBU/Price) + price shown in beer list rows
- `loyalty_redemptions` table with RLS (user own + brewery admin read)
- 3 demo breweries: Mountain Ridge (Asheville), River Bend (Asheville), Smoky Barrel (Black Mountain)
- 20 demo beers with `price_per_pint` set across all 3 breweries
- `BreweryWithStats.has_upcoming_events` properly typed (no more `as any[]`)
- Nav CTA: "Start Session" (was "Check In")

**Deferred to Sprint 18:**
- S17-009: Nav brand/UX review (design task, not build)
- S17-012: Playwright E2E test suite (Casey)
- S17-014: TestFlight submission (waiting on Apple Developer account — backlogged)

**Sales docs:** `docs/sales/` created this sprint — go-to-market, pitch guide, pricing, target breweries, deck outline. Taylor owns this. No cold outreach yet — warm intros through Drew's Asheville network first.

### Sprint 18 — The Board: Cream Menu Redesign ✅ (2026-03-27)
**Theme:** Complete visual redesign of The Board (brewery TV display)
**Retro:** `docs/retros/sprint-17-18-retro.md`

- ✅ Complete typographic paradigm: cards-in-a-grid → pure type on cream canvas
- ✅ Brewery name in Instrument Serif italic at `clamp(64px, 7vw, 100px)`
- ✅ Beer entries: Playfair Display bold + gold dotted leaders to gold prices
- ✅ BOTW hero section, per-beer HopTrack stats, brewery stats footer, events footer
- ✅ Font size map: medium/large/xl — 2x previous sizes for TV legibility
- ✅ Auto-scroll for overflow beer lists
- ✅ Board layout strips BreweryAdminNav (`isBoard` check)
- ✅ Migration 027: Demo board stats (8 sessions, ~23 beer_logs, real biggest fans)

**Key architectural changes from Sprint 18:**
- Migrations 025, 026, 027 applied to remote
- `BoardClient` redesigned: cream background (#FBF7F0), no cards, pure typography
- Instrument Serif loaded via `<link>` in board/page.tsx
- Board layout: `position: fixed; inset: 0; overflow: hidden` — beer list scrolls internally
- All Board styles are inline (not Tailwind) to avoid JIT caching issues
- `BreweryAdminLayout`: `isBoard` path detection strips sidebar nav

### Sprint 19 — The Pour ✅ (2026-03-27)
**Theme:** Glass art SVG illustrations + multi-tier pour pricing on The Board and tap list admin
**Retro:** `docs/retros/sprint-19-retro.md`

- ✅ 20 glass type SVGs in `lib/glassware.ts` (shaker_pint → sam_adams_pint)
- ✅ Breweries select glass type per beer in tap list admin
- ✅ Glass SVG appears LEFT of beer name on The Board
- ✅ Horizontal size chips on The Board: `Taster $3 · Half Pint $5 · Pint $8` (never stack)
- ✅ Flights supported as pour type (null oz)
- ✅ Backwards compatible: beers without pour sizes fall back to `price_per_pint` dotted leader
- ✅ Tap list admin modal: 20-glass SVG picker grid + pour size rows with quick-add presets
- ✅ Pour sizes API: GET + replace-all POST (DELETE + INSERT)
- ✅ Realtime subscription extended to cover `beer_pour_sizes` table
- ✅ Migration 028: `glass_type` on beers + `beer_pour_sizes` table + RLS
- ✅ Migration 029: Demo glass types + 74 pour size rows across 20 demo beers

**Key architectural changes from Sprint 19:**
- `lib/glassware.ts` — source of truth for all glass types + `PourSize` interface
- **SVG gradient ID namespacing**: `getGlassSvgContent(glass, instanceId)` does regex replacement for unique IDs per instance — CRITICAL when rendering multiple SVGs on one page
- `app/api/brewery/[brewery_id]/beers/[beer_id]/pour-sizes/route.ts` — GET + replace-all POST
- `BoardClient`: new `pourSizesMap` prop, `GlassIllustration` sub-component, `SizeChips` sub-component, extended `FS` map with chip/glass dimensions
- `TapListClient`: edit modal expanded to `max-w-2xl`, glass picker grid, pour size rows
- Migrations 028, 029 applied to remote
- Bug fix: `uuid_generate_v4()` → `gen_random_uuid()` (extension not enabled on Supabase)

### Migration state
- 001–003: Core schema + seed
- 004: Brewery RLS fix (brewery_accounts OR created_by for UPDATE)
- 005: `checkins.beer_id` made nullable (REQ-013)
- 006: `sessions` + `beer_logs` tables + full RLS ✅ APPLIED
- 007: Home sessions + quantity ✅ APPLIED
- 008: Brewery admin RLS for sessions/beer_logs ✅ APPLIED
- 009: Streak system (`current_streak`, `longest_streak`, `last_session_date` on profiles) ✅ APPLIED
- 010: Style + streak achievements (wheat_king, lager_legend, seven_day_streak, thirty_day_streak) ✅ APPLIED
- 011: Beer of the Week (`is_featured` on beers) ✅ APPLIED
- 012: Notification preferences (JSONB on profiles) ✅ APPLIED
- 013: Push subscriptions table (Web Push endpoints) ✅ APPLIED
- 014: Reactions FK migration (session_id + beer_log_id on reactions) ✅ APPLIED (S16)
- 015: Drop checkins table (archive + drop FK + drop table) ✅ APPLIED (S16)
- 016: Session comments table + RLS ✅ APPLIED (S16)
- 017: Domestic beer achievements (domestic_drinker, domestic_devotee) ✅ APPLIED (S16)
- 018: (reserved — not used)
- 019: Tap list display_order + is_86d ✅ APPLIED (S16)
- 020: Loyalty cards RLS for brewery admins ✅ APPLIED (S16)
- 021: Brewery events table + RLS ✅ APPLIED (S16)
- 022: Beer `price_per_pint` decimal field ✅ APPLIED (S17)
- 023: `loyalty_redemptions` table + RLS ✅ APPLIED (S17)
- 024: Demo seed data — 3 Asheville breweries, 20 beers w/ prices, 7 events ✅ APPLIED (S17)
- 025: (reserved — not used)
- 026: `promo_text` on beers table ✅ APPLIED (S18)
- 027: Demo board stats (sessions + beer_logs for Mountain Ridge) ✅ APPLIED (S18)
- 028: `glass_type` on beers + `beer_pour_sizes` table + index + RLS ✅ APPLIED (S19)
- 029: Demo glass types + pour sizes (74 rows, 20 beers) ✅ APPLIED (S19)

### Sprint 20 — Close It (CURRENT)
**Theme:** Ship quality gates, close first brewery, polish The Board for Asheville demo

| Ticket | Owner | Description |
|--------|-------|-------------|
| S20-001 | Casey + Jordan | Playwright E2E test suite — happy path + sad path |
| S20-002 | Drew | TV Mode toggle: hide/show stats panel on Board |
| S20-003 | Taylor + Drew | Asheville demo + close first paid brewery (Tuesday meeting) |
| S20-004 | Alex | Glass picker polish — hover tooltips (glass name + best-for styles) |
| S20-005 | Riley | Migration consolidation proposal (028 + 029 merge for clean deploys) |
| S20-006 | Jamie | Board → app interior visual bridge (cream/gold palette continuity) |

**P0:** Stable demo URL confirmed for Taylor before Tuesday Asheville meeting.

### Revenue Targets
- Tap tier: $49/mo
- Cask tier: $149/mo
- Barrel tier: custom
- First paid brewery: Sprint 16 hard deadline (Taylor) — close or reassess GTM
- 500 paid breweries: 6 months post-launch ($75K MRR)

### Team Expansion Plan (discussed 2026-03-26)
1. 🥇 Customer Success / Onboarding — hire when first brewery closes
2. 🥈 Growth / SEO Lead — hire before 500 brewery push
3. 🥉 Analytics Engineer — hire at ~20-50 active breweries
Full notes: `docs/retros/sprint-10-retro.md` → Team Hiring Discussion section

---

## 🍺 Culture
- We are going to be rich
- We celebrate shipping
- Retros happen every sprint — fun first, honest always
- Roasts are a team tradition (`docs/retros/`)
- Beers are always conceptually on the table
- The founder trusts us — we don't abuse that trust, we earn it every session
- Push to `main` directly — no PR gates needed
- If something is broken, say so immediately
- If something is great, say that too

---

*This file is the team. Read it, become it, ship great things.* 🍺
