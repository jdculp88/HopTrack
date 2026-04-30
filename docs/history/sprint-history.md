# HopTrack Sprint History — Sprints 13–40

---

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

### Sprint 20 — Close It ✅ (2026-03-27)
**Theme:** Ship quality gates, close first brewery, polish The Board for Asheville demo
- S20-001: Playwright E2E — carried to S21
- S20-002/004/005/006: Carried and shipped in Sprint 21

### Sprint 21 — All of It ✅ (2026-03-27)
**Theme:** QoL sweep + QR Table Tents + Board → App visual bridge
**Plan:** `docs/sprint-21-plan.md`

- ✅ S21-002: ActiveSessionBanner timer updates every 60s (was frozen on mount)
- ✅ S21-003: Explore filters persist to URL search params — shareable + back-button safe
- ✅ S21-004: Beer-themed empty state copy everywhere ("The taps are dry", "Drinking solo?", etc.)
- ✅ S21-005: SessionCard truncation — `title` tooltips on long beer/brewery names
- ✅ S21-006: Modal focus trap — keyboard focus stays inside modal, ARIA `role="dialog"` + auto-focus
- ✅ S21-007: Board settings preview — draft/apply pattern, "Previewing below ↓"
- ✅ S21-008: Tap List unsaved changes guard — AnimatePresence discard confirmation on close
- ✅ S21-009: `/brewery-admin/[id]/sessions` — paginated all-sessions view, 25/page
- ✅ S21-010: QR Table Tents — branded QR generator (3 formats: Table Tent / Coaster / Poster), PNG download + print, links to visual bridge
- ✅ S21-011: `/brewery-welcome/[id]` — cream/gold public landing page matching The Board, on-tap preview, "Track Your Pours" CTA
- S21-001: Playwright E2E — 6th carry. Casey is holding a sit-in.

**Key architectural changes from Sprint 21:**
- `components/checkin/ActiveSessionBanner.tsx` — `useState` + `setInterval` for live timer
- `app/(app)/explore/ExploreClient.tsx` — `useSearchParams` + `useRouter` for URL-synced filters; wrapped in `Suspense` in page.tsx
- `components/ui/Modal.tsx` — focus trap via `querySelectorAll(FOCUSABLE)`, `useRef` on panel, `role="dialog" aria-modal="true"`
- `app/(brewery-admin)/brewery-admin/[brewery_id]/board/BoardClient.tsx` — `draftSettings` + `applySettings()` / `cancelSettings()` pattern for settings preview
- `app/(brewery-admin)/brewery-admin/[brewery_id]/tap-list/TapListClient.tsx` — `isDirty()` + `closeForm()` + `confirmDiscard` state with AnimatePresence slide-down
- `app/(brewery-admin)/brewery-admin/[brewery_id]/sessions/` — new paginated sessions page
- `app/(brewery-admin)/brewery-admin/[brewery_id]/qr/` — QR Table Tent generator (uses `qrcode` npm package)
- `app/brewery-welcome/[id]/page.tsx` — public cream/gold bridge page; QR tents link here
- `components/brewery-admin/BreweryAdminNav.tsx` — "Table Tent" nav item added
- `qrcode` + `@types/qrcode` added to dependencies

**Deferred to Sprint 22:**
- S21-001: Playwright E2E (Casey is serious this time)
- Taylor: Close first paid brewery (Asheville Tuesday meeting pending)
- Riley: Migration consolidation proposal (028+029)

### Sprint 22 — The Mark ✅ (2026-03-28)
**Theme:** HopMark identity system + Friends Live + logo bug fix
**Identity source:** Morgan's MP-5 "The One" — team voted Option A "The Pour" unanimously

- ✅ S22-001: `components/ui/HopMark.tsx` — canonical SVG component, 4 variants (mark/horizontal/stacked/wordmark), 5 themes (dark/cream/gold-mono/white/auto)
- ✅ S22-002: HopMark deployed across app — AppNav, BreweryAdminNav, auth layout, Board footer, QR tents, Brewery Welcome, Session Share Card
- ✅ S22-003: `app/icon.tsx` + `app/apple-icon.tsx` — Next.js ImageResponse favicons (32×32 + 180×180)
- ✅ S22-004: `GET /api/friends/active` — friends' active sessions, respects `share_to_feed` + `share_live` prefs
- ✅ S22-005: `components/social/DrinkingNow.tsx` — horizontal scroll strip in HomeFeed, pulse ring avatars, 60s polling
- ✅ S22-006: "Friends Here Now" section on brewery detail page
- ✅ S22-007: Session start notifications — in-app + push to friends when session starts
- ✅ S22-008: "Show Active Sessions" privacy toggle in Settings → Privacy (`share_live` pref)
- ✅ S22-009: Logo bug fix — inline styles replace presentation attrs, `auto` theme with CSS vars, size bumps, wider mark↔wordmark gap

**Key architectural changes from Sprint 22:**
- `HopMark.tsx` — all SVG colors use `style={{ fill/stroke }}` inline styles (not presentation attributes) to win CSS cascade
- `auto` theme: `var(--accent-gold)` / `var(--text-primary)` — adapts to dark↔cream toggle; use on theme-toggling surfaces
- Horizontal lockup viewBox `352×72`, text x=72 for mark↔wordmark breathing room
- `HopMarkIcon` export for favicon/manifest canvas generation
- `HOPMARK_PATHS` export — raw SVG path data for canvas/export
- `/api/friends/active` — fire-and-forget pattern; no migration needed (share_live is JSONB key, defaults true when absent)
- `DrinkingNow` polls every 60s (not Realtime) — upgrade if engagement warrants
- Session start calls `notifyFriendsSessionStarted()` with `.catch(() => {})` (non-blocking)
- AppNav: `theme="auto"` height=32, BreweryAdminNav: `theme="auto"` height=24
- Auth layout: desktop height=30, mobile height=32 (stays `theme="cream"` — hardcoded bg)

**Deferred to Sprint 23:**
- S21-001: Playwright E2E (7th carry — Casey's sit-in continues)
- Alex: draw animation on auth logo (SVG path animation)
- Supabase Realtime upgrade for Friends Live (if engagement data supports it)
- Riley: Migration consolidation proposal (028+029)
- Taylor: Close first paid brewery

### Sprint 23 — Bug Bash ✅ (2026-03-28)
**Theme:** Full team audit + systematic bug fixes across all surfaces
**Audit team:** Morgan (coordinator), Alex (UI/UX), Jordan (core features), Sam+Casey (QA), Drew+Riley (infra), Jamie+Taylor (brand/sales)

- ✅ S23-001: BreweryAdminNav HopMark — bumped to 32px, removed opacity-60, standardized padding to px-6
- ✅ S23-002: The Board audit — code verified correct (isBoard strips nav, data flow complete, Realtime working)
- ✅ S23-003: Brewery reviews — `brewery_reviews` table (migration 031), API routes (GET/POST/DELETE), `BreweryReview` component on brewery detail page
- ✅ S23-004: Avatars storage bucket — migration 030 creates `avatars` bucket + RLS policies (fixes silent profile photo upload failures)
- ✅ S23-005: Hardcoded `#D4A843` sweep — replaced across 12+ files with `var(--accent-gold)` using `color-mix()` for alpha variants
- ✅ S23-006: API error handling — added to `/api/notifications`, `/api/push/subscribe`, `/api/pint-rewind`, `/api/friends/active`
- ✅ S23-007: Missing loading.tsx — added for `brewery-welcome/[id]`
- ✅ S23-008: Missing error.tsx — added for `(auth)` route group with Sentry + cream theme
- ✅ S23-009: Modal accessibility — `aria-label="Close dialog"` on close button
- ✅ S23-010: ExploreClient accessibility — `aria-pressed` on FilterChip toggle buttons
- ✅ S23-011: AppNav accessibility — `aria-label` on mobile nav links + FAB, `aria-hidden` on decorative icons
- ✅ S23-012: Auth layout logo sizes — standardized desktop to 32px (was 30px, mobile was already 32px)
- ✅ S23-013: DarkCardWrapper — replaced redundant hardcoded colors with refs to `DARK_VARS` object
- ✅ S23-014: Profile banner gradient — replaced hardcoded `#0F0E0C` gradient with `var(--bg)` + `color-mix()` for theme toggle support

**Key architectural changes from Sprint 23:**
- `brewery_reviews` table with unique(user_id, brewery_id) constraint — one review per user per brewery
- `/api/brewery/[brewery_id]/reviews` — GET (list + avg), POST (upsert), DELETE
- `BreweryReview` component at `components/brewery/BreweryReview.tsx` — star picker, inline form, review list, delete confirmation
- `avatars` storage bucket with RLS (user-scoped upload/update/delete, public read)
- `color-mix(in srgb, var(--accent-gold) N%, transparent)` pattern replaces `rgba(212,168,67,N)` throughout
- All focus states now use `focus:border-[var(--accent-gold)]` instead of hardcoded `#D4A843`
- Migrations 030, 031 added (apply with `supabase db push`)

**Deferred to Sprint 24:**
- S21-001: Playwright E2E (8th carry — Casey's sit-in escalates)
- Alex: draw animation on auth logo (SVG path animation)
- Supabase Realtime upgrade for Friends Live
- Riley: Migration consolidation proposal (028+029)
- Taylor: Close first paid brewery

### Sprint 24 — Avatar Fix + Stability (2026-03-28)
**Theme:** Fix children photos, investigate full-page error, stability polish

- ✅ S24-001: Avatar seed photo fix — replaced men/22→47, women/28→53, women/17→62, men/11→58 to avoid young-looking portraits
  - Seeds updated: `supabase/seeds/005_user_avatars.sql`
  - Re-run seed 005 against remote DB to apply

**Known open issues carried into Sprint 24:**
- "Something is wrong error on every page" — Joshua reported full-page error boundary triggering; dev server returns correct HTTP codes, root cause not yet identified (check Sentry, browser console, auth state)
- Re-run seed 005 against remote database after fixing portrait numbers
- Apply seeds after any DB reset

### Sprint 25 — Rate & Relate ✅ (2026-03-28)
**Theme:** Fix the rating system, redesign session recap, overhaul the feed
**Plan:** `docs/sprint-25-plan.md`

- ✅ S25-001: StarRating bug fix — `flex` → `inline-flex` prevents 5th star clipping, all hardcoded colors replaced with CSS vars
- ✅ S25-002: Migration 032 — `beer_reviews` table (dedicated beer reviews, mirrors brewery_reviews pattern)
- ✅ S25-003: `BreweryRatingHeader` component — prominent rating display at top of brewery page (after hero), inline star picker with progressive comment disclosure
- ✅ S25-004: Beer reviews API — `GET/POST/DELETE /api/beer/[beer_id]/reviews` (upsert pattern, public read, auth write own)
- ✅ S25-005: Beer log PATCH API — `PATCH /api/sessions/[id]/beers/[logId]` for updating ratings from recap screen
- ✅ S25-006: Session recap v2 — split beers into "Rate These?" (unrated, inline star pickers) + "Already Rated" (compact), brewery quick review section, compact hero, max-w-lg centered
- ✅ S25-007: Feed card visual refresh — killed redundant brewery banner, brewery name as `font-display` headline, readable beer list (one per line with style tag + rating), session photo support, session note display (blockquote)
- ✅ S25-008: Welcome card slim-down — full card on first visit of day (localStorage timestamp), slim single-line bar on subsequent visits; removed weekly stats from feed
- ✅ S25-009: Filter tab redesign — full-width tab bar with counts (`All 24 · Friends 18 · You 6`), equal-width buttons
- ✅ S25-010: `BeerReviewSection` component on beer page — dedicated reviews from `beer_reviews` table, existing beer_logs section renamed to "Activity"
- ✅ S25-011: SessionComments redesign — last 2 comments always visible as preview, comment input always visible (not hidden behind expand), expand/collapse for full thread

**Key architectural changes from Sprint 25:**
- Migration 032 applied to remote
- `beer_reviews` table — public read, auth write own, UNIQUE(user_id, beer_id)
- `BreweryRatingHeader` at `components/brewery/BreweryRatingHeader.tsx` — inline rating + CTA at top of brewery page
- `BeerReviewSection` at `components/beer/BeerReviewSection.tsx` — star picker, comment, review list
- `/api/beer/[beer_id]/reviews/route.ts` — GET (list + avg + user review), POST (upsert), DELETE
- `/api/sessions/[id]/beers/[logId]/route.ts` — PATCH (update rating)
- `StarRating` component: `inline-flex` container, CSS var colors throughout
- `SessionRecapSheet` v2: beer rating prompts, brewery quick review, checks for existing brewery review, fire-and-forget PATCH for beer ratings
- `SessionCard` redesigned: no brewery banner, beer list as rows, photo + note support, expandable beer list (4 shown, "Show N more")
- `HomeFeed` welcome card: first-visit-of-day detection via localStorage, slim bar variant
- `SessionComments`: eager fetch, 2-comment preview always visible, input always visible
- Feed filter tabs: full-width bar with counts per filter

**Deferred to Sprint 26:**
- Cheers/reaction button on feed cards (P1)
- Feed infinite scroll / pagination (P2)
- Backfill beer_reviews from beer_logs (decided against — separate signals)
- `beers.avg_rating` migration to pull from `beer_reviews` instead of `beer_logs`

**Backlogged (no sprint):**
- Playwright E2E — Casey, someday. We believe in you.

### Sprint 26 — The Glow-Up ✅ (2026-03-28)
**Theme:** Recap redesign, feed friends-first, brewery admin 404 fix
**Retro:** `docs/retros/sprint-26-retro.md`

- ✅ Session recap v2 — split beers into Rate These? / Already Rated, brewery quick review
- ✅ Feed card visual refresh — brewery name as font-display headline, beer list rows
- ✅ Welcome card slim-down — first-visit-of-day detection, slim bar on repeat visits
- ✅ Filter tab redesign — full-width bar with counts
- ✅ SessionComments redesign — always-visible input, 2-comment preview
- ✅ Brewery admin 404 fix

### Sprint 27 — Three-Tab Feed ✅ (2026-03-28)
**Theme:** Friends / Discover / You — full three-tab feed redesign per Morgan's brief
**Retro:** `docs/retros/sprint-27-retro.md`

- ✅ Complete `HomeFeed.tsx` rewrite — three-tab architecture (Friends/Discover/You)
- ✅ `FeedTabBar` — spring-animated layoutId underline indicator
- ✅ `AchievementFeedCard` — gold gradient, tier pills (bronze/silver/gold/platinum), XP badge
- ✅ `StreakFeedCard` — milestone detection (3/5/7/14/21/30/50/100), localStorage dedup
- ✅ `DrinkingNow` updated — all green → `var(--accent-gold)`, renamed "Live Now"
- ✅ You tab: profile hero + XP bar, 4-stat grid, Taste DNA animated bars, Recent Achievements, Want-to-Try wishlist, Brewery Passport
- ✅ Discover tab: BOTW, Trending, Events, New Breweries 2-col grid
- ✅ Seed 009 — 24 sessions, 65+ beer logs, 14 beer reviews, 8 brewery reviews, 2 active sessions
- ✅ Seed 010 — friend achievements, streak milestones, refreshed active sessions, extra reviews
- ✅ **Migration 033 — CRITICAL BUG FIX:** `sessions.brewery_id` and `beer_logs.brewery_id` changed from `text` → `uuid` with FK to `breweries`. Root cause of empty friends feed since Sprint 13.

**Key architectural changes from Sprint 27:**
- `FeedTabBar` at `components/social/FeedTabBar.tsx` — type `FeedTab = "friends" | "discover" | "you"`
- `AchievementFeedCard` at `components/social/AchievementFeedCard.tsx`
- `StreakFeedCard` at `components/social/StreakFeedCard.tsx` — exports `isStreakMilestone`, `isStreakSeen`, `markStreakSeen`
- `HomeFeed.tsx` props: `activeFriendSessions`, `friendAchievements`, `userAchievements`, `wishlist`, `styleDNA`, `friendCount`
- Taste DNA computed server-side in `page.tsx` from `beer_logs` join `beers(style)` — grouped/averaged per style
- `visitedBreweries` for Brewery Passport derived client-side via `useMemo` from `youSessions` — zero extra queries
- Migration 033: stale sessions with invalid brewery_ids were nulled (not deleted)
- After migration 033: run `NOTIFY pgrst, 'reload schema';` in Supabase SQL editor to flush PostgREST schema cache
- Service worker (`public/sw.js`) caches static routes — unregister via DevTools → Application → Service Workers after dev server restarts

**Deferred to Sprint 28:**
- Verify full feed render with all card types (requires PGRST schema reload + SW unregister + hard reload)
- Cheers/reaction button on feed cards (P1 — carried from Sprint 25)
- Feed infinite scroll / pagination (P2 — carried from Sprint 25)
- E2E tests (Casey, still waiting, still watching)

### Sprint 28 — Feed Spec Implementation ✅ (2026-03-29)
**Theme:** Close the gap between Morgan's feed spec and what shipped
**Spec:** `docs/HopTrack-Feed-Implementation-Spec.docx` (Morgan)
**Reference files:** `hoptrack-feed-complete.jsx` (dark+light), `hoptrack-feed-light.jsx` (light only)

- ✅ S28-001: `RecommendationCard` — accent left border, "RECOMMENDS" label, beer info, "+ Add to My List" CTA
- ✅ S28-002: `NewFavoriteCard` — compact card, "favorited [beer] from [brewery]", "Try it too" button
- ✅ S28-003: `FriendJoinedCard` — centered layout, mutual friends count, gradient "Follow" button
- ✅ S28-004: `SeasonalBeersScroll` — horizontal scroll with "Limited" (accent) / "Seasonal" (gold) badge overlays
- ✅ S28-005: `CuratedCollectionsList` — gold gradient cards with emoji, beer count, chevron arrows
- ✅ S28-006: `TrendingCard` redesigned — vertical list → horizontal scroll of compact beer cards with style badges + star ratings
- ✅ S28-007: BOTW compact banner on Friends tab (gold gradient strip, above feed)
- ✅ S28-008: Scroll position memory between tabs (`useRef` + `requestAnimationFrame`)
- ✅ S28-009: New data queries — friend 5-star reviews (new_favorite), recent friendships (friend_joined)
- ✅ S28-010: Editorial mock data — 4 seasonal beers, 3 curated collections (Jamie owns editorial)
- ✅ S28-011: Hydration fix — `SessionRecapSheet` dynamic import (`ssr: false`) to break Turbopack module chain
- ✅ S28-012: `hasCommunityContent` updated to include seasonal/curated data

**Key architectural changes from Sprint 28:**
- `RecommendationCard` at `components/social/RecommendationCard.tsx`
- `NewFavoriteCard` at `components/social/NewFavoriteCard.tsx`
- `FriendJoinedCard` at `components/social/FriendJoinedCard.tsx`
- `SeasonalBeersScroll` + `CuratedCollectionsList` added to `components/social/DiscoveryCard.tsx`
- `FeedItem` union type extended: `new_favorite`, `friend_joined`
- `HomeFeedProps` extended: `newFavorites`, `friendsJoined`
- `SessionRecapSheet` loaded via `next/dynamic` with `ssr: false` (fixes Turbopack cache corruption)
- `confetti` import changed to dynamic `import()` call
- Discover tab: 6 sections total (BOTW, Trending, Events, Seasonal & Limited, Curated Collections, New Breweries)
- No new migrations — editorial data is hardcoded, new card types use existing tables

**Deferred to Sprint 29:**
- Cheers/reaction button on feed cards (P1 — carried from Sprint 25)
- Feed infinite scroll / pagination (P2 — carried from Sprint 25)
- PGRST schema cache refresh (`NOTIFY pgrst, 'reload schema';`) to restore session data in feed
- E2E tests (Casey, eternal vigil)

### Sprint 29 — Your Round ✅ (2026-03-29)
**Theme:** Fix the empty feed, ship Cheers reactions, real-feeling demo data
**Retro:** `docs/retros/sprint-28-retro.md` (compliments edition)

- ✅ S29-001: PGRST schema reload + seed verification
- ✅ S29-001b: Removed dead `INSERT INTO checkins` from seeds 003, 006, 007 (table dropped in S16)
- ✅ S29-002: Seed 011 "Your Round" — 6 sessions, 38 reactions, 6 comments, Belgian Explorer achievement, Drew 7-day streak, BOTW: Smokehouse Porter
- ✅ S29-003: `ReactionBar` component — 🍺 cheers toggle + 💬 count + ↗ share, optimistic UI, calls existing `/api/reactions`
- ✅ S29-004: Reaction counts API — batch query in page.tsx (counts + user's own), passed as props through HomeFeed → FriendsTabContent/YouTabContent → FeedItemCard → SessionCard
- ✅ S29-005: "Your Round" header already existed from prior sprint
- ✅ S29-006: Card footer polish — old stats footer replaced with ReactionBar across SessionCard, AchievementFeedCard, StreakFeedCard, RecommendationCard, NewFavoriteCard
- ✅ S29-007: Team weekend testing doc at `docs/sprint-29-testing-weekend.md`
- ✅ S29-008: Explicit FK hint `brewery:breweries!brewery_id` on feed sessions queries (matches working `/api/friends/active` pattern)

**Key architectural changes from Sprint 29:**
- `ReactionBar` at `components/social/ReactionBar.tsx` — reusable cheers/comment/share footer
- `SessionCard` footer: was stats (beer count, rating, duration, XP) → now ReactionBar (🍺 cheers, 💬 comments, ↗ share)
- `page.tsx` fetches reaction counts + user reactions in batch after session queries, passes as `reactionCounts` and `userReactions` props
- Props threading: `HomeFeed` → `FriendsTabContent` / `YouTabContent` → `FeedItemCard` → `SessionCard` / `AchievementFeedCard` etc.
- Seeds 003, 006, 007 cleaned of dead `checkins` references (wrapped in block comments or removed)
- Seed 011 creates mockup-aligned demo data matching the HTML feed mockups
- Display names updated to match mockup characters (Drew, Mika, Cole, Tara, Lena, Marcus)
- `belgian_explorer` achievement added to achievements table
- PGRST schema cache reloaded after migration 033
- Both session queries in `page.tsx` now use `brewery:breweries!brewery_id(...)` explicit FK hint

**OPEN BUG — Friends feed empty state (P0 for Sprint 30):**
- **Symptom:** Friends tab shows "Your round starts here" empty state. DrinkingNow (Live Now strip) works fine via `/api/friends/active`.
- **Root cause confirmed:** The SSR session queries in `page.tsx` used `brewery:breweries(...)` (implicit join) which fails when PostgREST schema cache is stale after migration 033 (text→uuid FK). Fix committed: `brewery:breweries!brewery_id(...)` explicit FK hint — but could not be verified because the Next.js dev server was running stale compiled code and did NOT hot-reload server components during the session.
- **Secondary issue found:** `user_achievements` RLS policy (`auth.uid() = user_id`) blocks reading friends' achievements. Need a new policy: `FOR SELECT USING (true)` or scope to accepted friends.
- **Sprint 30 Day 1:** Restart dev server (`pkill -f "next dev" && npm run dev`), hard reload, confirm feed loads. If still empty, write `get_friend_feed` RPC function to bypass PostgREST entirely.

**Deferred to Sprint 30:**
- Verify Friends feed fix after dev server restart (P0)
- Fix `user_achievements` RLS for social feed visibility
- Feed infinite scroll / pagination (P2 — carried from Sprint 25)
- E2E tests (Casey, we still see you)

### Sprint 30 — Foundation Fix ✅ (2026-03-29)
**Theme:** Kill every P0, fix the RLS layer, ship a product that actually works
**Plan:** `docs/sprint-30-plan.md`
**Testing Audit:** `docs/sprint-30-testing-audit.md`
**Retro:** `docs/retros/sprint-29-retro.md`

Full team testing audit (all 13 members) found 85 unique issues. Sprint 30 killed all 12 P0s and 20 P1s across 3 sessions.

**Session 1 — P0s (10 tickets):**
- ✅ S30-001: Migration 034 — 3 critical RLS fixes (notifications INSERT, beers UPDATE/DELETE, user_achievements SELECT)
- ✅ S30-002: Fix `wishlists` → `wishlist` table name in home feed
- ✅ S30-003: Fix `var(--color-*)` → `var(--*)` in 3 brewery admin pages
- ✅ S30-004: Add ownership check to friends DELETE endpoint
- ✅ S30-005: Verified friends feed FK hint (already correct)
- ✅ S30-006: ReactionBar — disable cheers on non-session cards
- ✅ S30-007: DrinkingNow Cheers — wire to `/api/reactions`
- ✅ S30-008: FriendJoinedCard Follow — wire to `/api/friends`
- ✅ S30-009: Delete Account — "Coming Soon" treatment
- ✅ S30-010: Button component — replace `motion.button` with `<button>` + inner `<motion.span>`

**Session 2 — Critical P1s (14 tickets):**
- ✅ S30-012: Fix `motion.button` in 4 remaining components
- ✅ S30-014: Migration 035 — reactions UNIQUE constraint, `beer_logs.beer_id` text→uuid FK, push_subscriptions UPDATE policy
- ✅ S30-016: Fix session_comments profile join (batch fetch, not broken PostgREST join)
- ✅ S30-017: FullScreenDrawer accessibility — `role="dialog"`, `aria-modal`, focus trap
- ✅ S30-018: XP level titles — delete duplicate from pint-rewind, import from `lib/xp`
- ✅ S30-019: XP calculation — unify `SESSION_XP` in `lib/xp`, remove dead `calculateCheckinXP`
- ✅ S30-020: Mobile notifications — bell icon with unread badge in bottom nav
- ✅ S30-021: "Check In" copy sweep — 7 instances across 6 files
- ✅ S30-022: Explore search — OpenBreweryDB results show "Not on HopTrack yet" badge
- ✅ S30-023: ReactionBar — add toast on cheers error
- ✅ S30-024: Comment counts — batch query threaded to SessionCard
- ✅ S30-025: XP race condition documented (atomic RPC deferred to S31)
- ✅ S30-031: `session_cheers` added to NotificationType
- ✅ S30-032: CuratedCollectionsList — "Coming soon" badge

**Session 3 — Hardcoded color sweep + code dedup (5 tickets):**
- ✅ S30-026: `#D4A843` sweep — replaced with `var(--accent-gold)` across ~35 files
- ✅ S30-027: `#0F0E0C` sweep — replaced with `var(--bg)` across ~30 files
- ✅ S30-028: `#E8841A` sweep — replaced with `var(--accent-amber)` across ~10 files
- ✅ S30-029: Consolidated 5 duplicate `timeAgo` functions → `formatRelativeTime` from `lib/dates`
- ✅ S30-030: Consolidated `lib/dates.ts` + `lib/utils.ts` date functions (re-exports)

**Also this sprint:**
- ✅ Sam: Documentation audit — roadmap updated (14 sprints behind → current), requirements expanded 25→43 (41 complete)
- ✅ Sage: Sprint 29 retro saved, Sprint 30+31 plans written

**Key architectural changes from Sprint 30:**
- Migrations 034, 035 created (APPLY TO REMOTE: `supabase db push` then `NOTIFY pgrst, 'reload schema';`)
- Zero `motion.button` in codebase — all use `<button>` + inner `<motion.span>`
- Zero "check-in" in consumer UI copy
- Zero hardcoded `#D4A843` in app interior (auth/landing/Board/Recharts/canvas intentionally kept)
- `lib/xp/index.ts` is single source of truth for XP values and level titles
- `lib/dates.ts` is single source of truth for date formatting (`lib/utils.ts` re-exports)
- `ReactionBar` — `sessionId` optional, cheers hidden when falsy
- `FullScreenDrawer` has `role="dialog"`, `aria-modal`, focus trap (matches Modal)
- Mobile bottom nav: Feed, Explore, [FAB], Friends, Alerts (bell with badge)
- `FriendJoinedCard` "Follow" button wired to `/api/friends`
- `DrinkingNow` "Cheers" wired to `/api/reactions`
- Session comments API: batch profile fetch (not PostgREST join)
- Explore search: OpenBreweryDB results flagged as "Not on HopTrack yet"
- Comment counts threaded from `page.tsx` → `HomeFeed` → `SessionCard`

**Deferred to Sprint 31:**
- `as any` reduction in `home/page.tsx` (needs Supabase type generation)
- `HomeFeed.tsx` split (1305 lines → 5 files)
- Password reset / forgot password flow
- Username uniqueness check on signup
- Billing/upgrade CTA in brewery admin
- Brewery admin onboarding card
- N+1 query optimization (session-end, push notifications)
- XP atomic increment via RPC
- Feed infinite scroll / pagination
- E2E tests

### Sprint 31 — Launch Polish ✅ (2026-03-29)
**Theme:** Make it maintainable, secure, and sellable
**Plan:** `docs/sprint-31-plan.md`
**Retro:** `docs/retros/sprint-31-retro.md`

**Session 1 (2026-03-29):**
- ✅ S31-005: HomeFeed.tsx split — 1318 lines → 6 files (HomeFeed orchestrator + FriendsTabContent, DiscoverTabContent, YouTabContent, OnboardingCard, FeedItemCard)
- ✅ S31-009: Password reset flow — forgot-password page, reset-password page, auth callback handler
- ✅ S31-010: Username uniqueness check on signup — debounced API validation, inline feedback
- ✅ S31-014: Trial badge + days remaining in BreweryAdminNav sidebar
- ✅ S31-015: "Upgrade Plan" CTA in sidebar footer → links to billing page
- ✅ S31-016: Billing page with 3-tier pricing (Tap $49/Cask $149/Barrel custom)
- ✅ S31-017: Brewery admin onboarding card — 4-step checklist, auto-detect completion
- ✅ S31-021: XP atomic increment via RPC (migration 036) — fixes race condition
- ✅ S31-022/023: Session-end API rewrite — batched achievement checks + batched push notifications
- ✅ S31-036: Dead checkins code removed from seed files 003, 006

**Session 2 (2026-03-29):**
- ✅ S31-006: Refactor `page.tsx` data fetching → `lib/queries/feed.ts` (374 → 95 lines)
- ✅ S31-024: Feed infinite scroll / pagination with IntersectionObserver (`useFeedPagination` hook, `/api/feed` route)
- ✅ S31-034/035: Playwright E2E test setup — smoke, core-flows, brewery-admin specs + auth helpers
- ✅ S31-029-032: UX polish verified — UserAvatar badge, session share page, ReactionBar aria-labels, DrinkingNow all clean

**Session 3 (2026-03-29):**
- ✅ S31-003: Reduced `as any` casts — added missing fields to Profile/Session/Beer types
- ✅ S31-004: Superadmin stats use service role client — `lib/supabase/service.ts` created
- ✅ S31-007: ReactionContext — 4-level prop drilling replaced with `useReactions()` hook
- ✅ S31-008: Feed array keys changed from index to stable IDs
- ✅ S31-011: Username uniqueness check wired in Settings (debounced, inline feedback)
- ✅ S31-012: Signup step transitions — AnimatePresence slide between steps
- ✅ S31-013: ToS + Privacy Policy links on signup, `/terms` page added
- ✅ S31-018: "Claim this brewery" CTA on unclaimed brewery detail pages
- ✅ S31-019: `/for-breweries` copy — replaced remaining check-in references
- ✅ S31-020: Tap list ABV/IBU/price numeric validation (min/max/step + inline errors)
- ✅ S31-033: Mobile brewery admin tab strip right-edge fade indicator

**Key architectural changes from Sprint 31:**
- `HomeFeed.tsx` split into 6 files: `HomeFeed.tsx` (orchestrator), `FriendsTabContent.tsx`, `DiscoverTabContent.tsx`, `YouTabContent.tsx`, `OnboardingCard.tsx`, `FeedItemCard.tsx`
- `ReactionContext.tsx` — `ReactionProvider` wraps each tab's content; `useReactions()` replaces 4-level prop drilling
- `lib/queries/feed.ts` — 8 fault-tolerant query functions; `page.tsx` is 95 lines
- `hooks/useFeedPagination.ts` — IntersectionObserver-based infinite scroll; `/api/feed` pagination endpoint
- `lib/supabase/service.ts` — service role client (bypasses RLS); used in superadmin
- `types/database.ts` — `Profile` extended with `notification_preferences`, `share_live`, `is_superadmin`; `Session` extended with typed `brewery`, `profile`, `beer_logs` join shapes
- Password reset: `/forgot-password` → Supabase email → `/auth/reset-password` (code exchange) → `/reset-password` (new password form)
- `/api/users/check-username` — public GET endpoint for username availability
- `/brewery-admin/[id]/billing` — tier comparison page with trial countdown
- `BreweryOnboardingCard` at `components/brewery-admin/BreweryOnboardingCard.tsx`
- `BreweryAdminNav` — Billing nav item, trial badge, upgrade CTA, mobile tab fade indicator
- Migration 036: `increment_xp` RPC function — atomic XP + streak + brewery count update
- Session-end API: 3 batch queries replace N+1 achievement checks, 1 batch query replaces N+1 push notifications
- Playwright E2E: `e2e/smoke.spec.ts`, `e2e/core-flows.spec.ts`, `e2e/brewery-admin.spec.ts`, `e2e/helpers/auth.ts`
- `/terms` page added (Terms of Service placeholder)
- Dead `checkins` INSERT blocks removed from seeds 003, 006 (~250 lines)

### Sprint 32 — The Vibe ✅ (2026-03-29)
**Theme:** Make it feel alive — social depth, smart recommendations, micro-interactions
**Plan:** `docs/sprint-32-plan.md`
**Retro:** `docs/retros/sprint-32-retro.md`

**Session 1 (2026-03-29):**
- ✅ S32-001: Brewery Follow System — migration 037 (`brewery_follows` + `session_photos` tables), API (GET/POST/DELETE), `FollowBreweryButton` component, 3 new notification types
- ✅ S32-002: Beer Recommendations — `lib/recommendations.ts` engine (style-based), `RecommendationsScroll` on Discover tab, `getSimilarBeers()` on beer detail page
- ✅ S32-003: Activity Heatmap — `ActivityHeatmap` component (GitHub-style 52-week grid), wired into You tab, `fetchActivityHeatmap` query
- ✅ S32-004: Cheers Animations — gold particle burst on ReactionBar cheers, haptic feedback, CSS keyframes
- ✅ S32-005: Explore Geolocation — `useGeolocation` hook, `haversineDistance` utility, "Near Me" toggle on explore, distance badges
- ✅ S32-006: Notification Grouping — same-type + same-session within 1hr grouped, avatar stacks, expandable groups, group-aware unread count
- ✅ S32-007: Customer Insights — `/brewery-admin/[id]/customers` page, tier badges (Regular/Power User/VIP), sortable/searchable table, "Customers" nav item
- ✅ S32-008: Session Photos — `session_photos` table + storage bucket (migration 037), API (GET/POST/DELETE), `SessionPhotos` carousel component
- ✅ S32-009: Session Complete Redesign — sparkle celebration header, 4-column stats row, fun fact (brewery user stats API), per-beer stats + glass icons, XP breakdown card, level progress bar, polished actions

**Key architectural changes from Sprint 32:**
- Migration 037: `brewery_follows` table (UNIQUE user+brewery) + `session_photos` table + `session-photos` storage bucket
- `FollowBreweryButton` at `components/brewery/FollowBreweryButton.tsx` — heart icon with fill animation, follow count
- `/api/brewery/[id]/follow` — GET (status + count), POST (follow), DELETE (unfollow)
- `lib/recommendations.ts` — `getRecommendations()` (style-based, excludes tried beers), `getSimilarBeers()` (same style, different brewery)
- `RecommendationsScroll` at `components/social/RecommendationsScroll.tsx` — horizontal scroll "For You" section
- `ActivityHeatmap` at `components/profile/ActivityHeatmap.tsx` — 52-week grid, 4 intensity levels, responsive (26-week compact mode)
- `lib/geo.ts` — `haversineDistance()`, `formatDistance()` (client-side, no server data sent)
- `hooks/useGeolocation.ts` — session-cached coordinates, graceful fallback
- `hooks/useCheersAnimation.ts` — particle state + haptic trigger
- `ReactionBar` — gold particle burst animation on cheers, `cheers-burst` CSS keyframe in globals.css
- `NotificationsClient` — grouped notifications with `buildFeedEntries()`, `AvatarStack`, expandable groups
- `/brewery-admin/[id]/customers` — server-side session aggregation, `CustomersClient` with tier badges + sort + search
- `/api/brewery/[id]/user-stats` — total time, most-ordered beer, visitor rank
- `/api/sessions/[id]/photos` — CRUD for session photos (5 limit per session)
- `SessionPhotos` at `components/social/SessionPhotos.tsx` — carousel with dot indicators
- `SessionRecapSheet` redesigned: sparkle header, stats row, fun fact, per-beer cards with stats, XP breakdown, level progress bar
- `NotificationType` extended: `brewery_follow`, `new_tap`, `new_event`
- `types/database.ts` — `BreweryFollow`, `SessionPhoto` types added
- `BreweryAdminNav` — "Customers" nav item added

### Sprint 33 — The Recap ✅ (2026-03-30)
**Theme:** Make the session complete screen feel like a celebration. Brand the mobile experience.
**Plan:** `docs/sprint-33-plan.md`

- ✅ S33-001: Session Recap v3 — cream color world reskin matching HTML mockup (self-contained `C` palette, glass-morphism cards, sparkles, terracotta+gold accents, warm browns)
- ✅ S33-002: Mobile branding — HopMark top header bar on `lg:hidden` screens (hop mark + "HopTrack" in Playfair Display + profile shortcut)
- ✅ S33-003: Beer stats in recap — real "times tried" (ordinal) + "your avg" from `/api/beer-logs/stats` batch endpoint
- ✅ S33-004: Session photos in recap — carousel with dot indicators + photo count badge, warm cream styling
- ✅ New API: `GET /api/beer-logs/stats?beer_ids=...` — lightweight per-beer history aggregation
- ✅ Session-end API: added `abv` + `avg_rating` to beer select
- ✅ Roadmap planned: Sprint 34/35/36 scoped with research from brewery industry pain points
- ✅ Bug log documented: 20-item comparison against HTML mockup (all closed)

**Key architectural changes from Sprint 33:**
- `SessionRecapSheet` uses self-contained cream `C` color constants — does not use app CSS vars (same pattern as The Board)
- Recap background: `#faf6f0` with warm radial gradients; cards: `rgba(255,255,255,0.75)` + `backdrop-filter: blur(16px)`
- `AppNav`: mobile-only fixed top header (`lg:hidden`) with HopMark mark + wordmark + profile link
- `AppShell`: `pt-12 lg:pt-0` on main content to clear mobile header
- `/api/beer-logs/stats` — new GET endpoint, batch beer history by `beer_ids` query param
- Beer stats in recap: "1st", "2nd"... ordinal via `getOrdinalSuffix()`, real avg rating from history
- Session photos: inline carousel in recap, self-contained nav buttons + dots using `C` palette

### Sprints 34–37 — Grow Together ✅
- Sprint 34 (Own Your Data): Export features, data portability
- Sprint 35 (Social Layer): Enhanced social features
- Sprint 36 (Close the Loop): Retention and engagement
- Sprint 37 (Grow Together): Referrals, group sessions V1, HopTrack Report page, beer list URLs — migrations 038+039 applied

### Sprints 38–40 — HopRoute ✅
- Sprint 38 (Audit & Harden): Full audit, hardening
- Sprint 39 (HopRoute Phase 1): HopRoute foundation
- Sprint 40 (HopRoute Live + The Close): HopRoute fully live with real brewery data — migrations 040+041 applied

---

## Migration State (001–041)

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
- 030: `avatars` storage bucket + RLS (S23)
- 031: `brewery_reviews` table + RLS (S23)
- 032: `beer_reviews` table + RLS (S25)
- 033: `sessions.brewery_id` + `beer_logs.brewery_id` text→uuid FK to `breweries` — CRITICAL feed fix (S27) ✅ APPLIED
- 034: Fix 3 critical RLS policies ✅ APPLIED (S31)
- 035: Reactions UNIQUE constraint (deduplicated first), beer_logs.beer_id FK, push_subscriptions UPDATE ✅ APPLIED (S31)
- 036: `increment_xp` RPC function ✅ APPLIED (S31)
- 037: `brewery_follows` + `session_photos` tables + `session-photos` storage bucket ✅ APPLIED (S32)
- 038: (S37 — group sessions, referrals, beer lists) ✅ APPLIED (S37)
- 039: (S37 — HopTrack Report, beer list URLs) ✅ APPLIED (S37)
- 040: `hop_routes`, `hop_route_stops`, `hop_route_stop_beers` tables + RLS ✅ APPLIED (S40)
- 041: `hop_route_eligible`, `hop_route_offer`, `vibe_tags` on breweries + HopRoute achievements ✅ APPLIED (S40)
- PGRST schema cache reloaded after 040/041 ✅

---

## Sprints 64-73 — Shore It Up (2026-03-30)
**Theme:** Tech debt, documentation finalization, folder/file organization

### Sprint 64 — Zero Noise ✅
Console.log cleanup (4 debug leftovers → structured prefixes). `components/checkin/` renamed to `components/session/` (2 dead files deleted: FlavorTagPicker, ServingStylePicker; 7 files moved). All imports updated. Stale docs deleted: `bugs/`, `screenshots/`, `validation/`, `agendas/`, sprint bug files. Strategy duplicates deleted. Brand docs consolidated to `docs/brand/`. `strategy/` dir removed.

### Sprint 65 — Type Safety Pt.1 ✅
Root cause: `Database` generic was never wired into Supabase clients — every `(supabase as any)` was a workaround. Added `Database` type to `types/database.ts` with 16 new table registrations. Created `types/supabase-helpers.ts` with shared join shapes. Eliminated `(supabase as any)` from 63 files → 0. Fixed `UserAvatar` to accept nullable `display_name`. Components `as any` reduced 8 → 1. Note: Supabase's `.select()` type inference can't handle partial columns/complex joins — Database generic removed from clients, kept as reference type.

### Sprint 66 — Folder Surgery ✅
`docs/` restructured: `plans/` (22 sprint plans), `archive/` (stale docs + meetings), `brand/` (brand guide + Apple plan). `.env.local.example` updated with `ANTHROPIC_API_KEY`.

### Sprint 67 — README & Onboarding ✅
Comprehensive `README.md` (replaces Next.js boilerplate). `CONTRIBUTING.md` (workflow, code style, review owners). `supabase/migrations/README.md` (naming, applying, rollback). `docs/roadmap.md` updated to Sprint 67.

### Sprint 68 — API Reference ✅
`docs/API-REFERENCE.md` — all 57 endpoints documented with method, path, description, auth requirement, and rate limit. Grouped by domain (sessions, beers, breweries, friends, etc.).

### Sprint 69 — Architecture ✅
`docs/ARCHITECTURE.md` — full system map: auth flow, database/RLS, storage, real-time, feed system, HopRoute AI, theme system, animation system, XP/achievements, billing, performance, error handling, key decisions.

### Sprint 70 — Requirements & Brand Finalization ✅
`docs/requirements/README.md` — all 14 REQ files audited with status and delivery sprint. All COMPLETE or DEPRECATED.

### Sprint 71 — Type Safety Pt.2 ✅
Added missing Database types: `BreweryEvent`, `PourSize`, `HopRoute`, `HopRouteStop`, `HopRouteStopBeer`, `LoyaltyProgram`, `LoyaltyRedemption`. Fixed build errors across 8 files (null guards, FK join shape casts, type assertion fixes). `npm run build` passes clean.

### Sprint 72 — Build Verification ✅
Production build verified: 0 TypeScript errors, 64 pages generated, all routes healthy.

### Sprint 73 — Final Audit ✅
Sprint history updated. CLAUDE.md updated with new file paths. Final docs audit complete.

### Sprint 74 — First Impressions ✅
Brewery onboarding wizard (4-step: Logo → Beers → Loyalty → Board Preview). Push notification wiring — Messages API fires Web Push. Rate limited (5/hr). Q2 2026 roadmap research produced (30 features, 18 REQs, 4 sprint arcs through Sprint 96).

### Sprint 75 — Revenue Plumbing ✅
**Arc:** Launch or Bust (Sprints 75-78)

Complete Stripe Billing: annual pricing toggle (Tap $470/yr, Cask $1,430/yr — 20% savings), monthly/annual billing interval on BillingClient, in-app cancel/downgrade UI with AnimatePresence inline confirmation (cancel at period end), new `/api/billing/cancel` endpoint, webhook hardened with `invoice.payment_failed`, `invoice.paid`, `customer.subscription.trial_will_end`. `STRIPE_PRICES` expanded to per-interval keys. `TIER_INFO` expanded with annual pricing details.

Email Infrastructure: `lib/email.ts` — Resend integration with dev-mode console.log fallback. `lib/email-templates/index.ts` — 6 branded email templates (welcome, brewery-welcome, trial-warning, trial-expired, password-reset, weekly-digest). `lib/email-triggers.ts` — 5 trigger functions: `onUserSignUp()`, `onBreweryClaim()`, `onTrialWarning()`, `onTrialExpired()`, `onPasswordReset()`. Welcome email wired to sign-up via `/api/auth/welcome`. Brewery welcome wired to claim flow. Password reset template ready for wiring.

Also queued: REQ-069 (Enhanced KPIs & Analytics) and REQ-070 (Non-Beer Menu Uploads) — requirements documented, no code.

---

## Sprints 104-113 — The Overhaul (2026-04-01)
**Theme:** Fix everything wrong. Security headers, structured logging, test wall, monolith surgery, API standards, accessibility, performance, brand polish. Joshua's directive: "I want to be like did I hire people from Wispflow, Spotify, and Robinhood."
**Arc:** The Overhaul (Sprints 104-113) — no retros, shipped back-to-back.

### Sprint 104 — The Audit ✅
`reactStrictMode: true` in next.config.ts. Security headers on all routes: X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS (prod only), X-Frame-Options SAMEORIGIN (non-embed routes). `lib/logger.ts` — structured logger factory with dev colorization + prod JSON (Vercel Log Drain ready). `lib/env.ts` — runtime environment validation with helpful error messages. `lib/__tests__/setup.ts` — global Vitest setup with jest-dom matchers. `vitest.config.ts` updated: globals: true, v8 coverage, setup file. POS webhook routes migrated from console.log to structured logger. 8 new tests (logger + env validation).

### Sprint 105 — The Test Wall ✅
`lib/__tests__/factories.ts` — factory functions for User, Brewery, Session, Beer, BeerLog, ApiKey. `lib/__tests__/msw-handlers.ts` + `msw-server.ts` — MSW mock server for Supabase REST endpoints. New test files: `roi-extended.test.ts` (60 tests), `beer-style-colors.test.ts` (126 tests — all 45 style mappings), `api-keys-extended.test.ts` (43 tests), `api-leaderboard.test.ts` (13 tests), `api-feed.test.ts` (15 tests), `rate-limiting.test.ts` (29 tests). **617 tests passing** at arc completion.

### Sprint 106 — The Split ✅
Monolith surgery — 6 components split down to under 400 lines each: `SessionRecapSheet.tsx` (964 → 279 lines + 7 sub-components), `TapWallSheet.tsx` (943 → 344 lines + 5 sub-components), `ClaimBreweryClient.tsx` (964 → 480 lines + 4 step components), `BoardClient.tsx` (834 → 165 lines + 5 section components), `BarbackClient.tsx` (799 → 386 lines + 3 sub-components), `app/(app)/brewery/[id]/page.tsx` (821 → 615 lines + 4 section components). `types/db-joins.ts` — NEW: typed Supabase join interfaces replacing scattered `as any` casts.

### Sprint 107 — The Standard ✅
`lib/api-response.ts` — standard JSON envelope with 10 helpers: `apiSuccess`, `apiList`, `apiError`, `apiUnauthorized`, `apiForbidden`, `apiNotFound`, `apiBadRequest`, `apiServerError`, `apiConflict`, `apiRateLimited`. `lib/__tests__/api-response.test.ts` — 18 tests. Rate limiting added to 8 more routes (57 total rate-limited routes). Error responses standardized on 5 existing API routes.

### Sprint 108 — The Feel ✅
DM Sans font migrated from Fontshare CDN to `next/font/google` (self-hosted, no external CDN dependency). `components/ui/Button.tsx` — enforced min-h touch targets (44px md, 40px sm). Gold-shimmer skeleton loading via `.skeleton-gold` CSS class. `components/ui/Modal.tsx` — drag-to-dismiss on mobile (velocity > 300 or offset > 100px), drag handle pill indicator. `components/ui/EmptyState.tsx` — reusable empty state component with spring animation. `components/ui/IconButton.tsx` — icon-only button with enforced aria-label. `hooks/useOnlineStatus.ts` — SSR-safe network connectivity hook. `components/ui/OfflineBanner.tsx` — AnimatePresence banner using useOnlineStatus.

### Sprint 109 — The Access ✅
`components/layout/AppNav.tsx` — `aria-current="page"`, `aria-expanded`, `aria-label` on all navigation elements. `components/layout/AppShell.tsx` — OfflineBanner + ScreenReaderAnnouncer integration. `components/ui/Toast.tsx` — split into polite (`role="status"`, `aria-live="polite"`) vs assertive (`role="alert"`, `aria-live="assertive"`) variants. `components/ui/ScreenReaderAnnouncer.tsx` — module-level `announce()` / `announceAssertive()` for app-wide screen reader announcements without DOM coupling. `lib/__tests__/a11y.test.tsx` — 24 accessibility tests. **659 tests passing.**

### Sprint 110 — The Speed ✅
`@next/bundle-analyzer` wired into next.config.ts (`ANALYZE=true npm run build`). `hooks/useDebouncedValue.ts` — generic debounce hook with configurable delay. `hooks/useIntersectionObserver.ts` — intersection observer with `freezeOnceVisible` option. `export const revalidate = 30` added to brewery admin dashboard (server component ISR). `lib/__tests__/hooks.test.ts` — 7 tests (debounce with fake timers, online status). **666 tests passing.**

### Sprint 111 — The Shield ✅
`components/ui/ErrorBoundary.tsx` — React class component: full-page / inline / custom fallback variants, `withErrorBoundary` HOC, structured logging on caught errors. `lib/retry.ts` — `withRetry<T>()` with exponential backoff, configurable jitter, `shouldAbort` predicate, `RetryError` class, `abortOn4xx` preset. `components/ui/RateLimitBanner.tsx` — live countdown timer for 429 responses, `parseRetryAfter` header utility. `app/(app)/layout.tsx` wrapped with ErrorBoundary. `lib/__tests__/retry.test.ts` — 24 tests. `lib/__tests__/error-boundary.test.tsx` — 16 tests. `lib/__tests__/integration/user-flows.test.ts` — 16 integration tests. **719 tests passing.**

### Sprint 112 — The Shine ✅
`/for-breweries` pricing page: hero copy sharpened, social proof updated, FAQ accordion (6 questions, AnimatePresence expand/collapse). OnboardingWizard step transitions changed from spring to cubic-bezier 150ms (sub-200ms guarantee for feel-of-speed). Email templates updated: preheader text for inbox preview, CAN-SPAM compliant footer (Unsubscribe + Privacy links, physical address placeholder), HopTrack wordmark + tagline. `lib/__tests__/for-breweries.test.ts` — 11 tests verifying pricing data integrity. **730 tests passing.**

### Sprint 113 — The Proof ✅
Final audit, documentation, arc close-out. **730 tests confirmed passing.** TypeScript issues: 9 pre-existing errors in test files only (NODE_ENV readonly assignment in logger.test.ts, vi/beforeEach globals in setup.ts, implicit any in smart-triggers.test.ts) — all in test infrastructure, zero errors in application code. The Overhaul arc is closed. Next: Multi-Location arc (114+).

**Key architectural additions from The Overhaul arc (104-113):**
- `lib/logger.ts` — structured logger, Vercel Log Drain ready
- `lib/env.ts` — runtime environment validation
- `lib/api-response.ts` — 10 standard API response helpers
- `lib/retry.ts` — withRetry with exponential backoff + jitter
- `types/db-joins.ts` — typed Supabase join interfaces
- `lib/__tests__/factories.ts` — test data factories
- `lib/__tests__/msw-handlers.ts` + `msw-server.ts` — MSW mock server
- `components/ui/Button.tsx` — 44px touch targets enforced
- `components/ui/Modal.tsx` — drag-to-dismiss on mobile
- `components/ui/EmptyState.tsx` — reusable empty state
- `components/ui/IconButton.tsx` — icon-only with enforced aria-label
- `components/ui/ErrorBoundary.tsx` — error boundary + withErrorBoundary HOC
- `components/ui/RateLimitBanner.tsx` — 429 countdown timer
- `components/ui/OfflineBanner.tsx` — network connectivity banner
- `components/ui/ScreenReaderAnnouncer.tsx` — SR module-level announcer
- `components/layout/AppNav.tsx` — full ARIA navigation attributes
- `hooks/useOnlineStatus.ts` — SSR-safe connectivity hook
- `hooks/useDebouncedValue.ts` — generic debounce hook
- `hooks/useIntersectionObserver.ts` — intersection observer hook
- Security headers on all routes (next.config.ts)
- `@next/bundle-analyzer` wired (ANALYZE=true)
- DM Sans via next/font/google (no Fontshare CDN)
- `.skeleton-gold` CSS class (gold-shimmer loading state)
- 57 rate-limited API routes total
- 730 tests total (up from 318 at arc start — 2.3× increase)

---

### Sprint 174 — The Coming Soon ✅

A focused half-sprint, single session. Joshua walked in with one request: "I need a really nice coming soon screen highlighting features for users and breweries with a CTA to sign up for a waitlist — this will be what I use for the site until we go live. I'll need a DB list of signups with emails, names, state/city, audience type (user/brewery), and brewery name if brewery. Also, we want to know where demand is highest." Shipped the full `hoptrack.beer` coming-soon landing end-to-end plus 4 SEO blog drafts in one session.

**What shipped:**

- **`supabase/migrations/109_waitlist.sql`** — `waitlist` table with name/email/city/state/audience_type/brewery_name/created_at, CHECK constraint enforcing brewery_name when audience_type = 'brewery', unique `lower(email)` index for case-insensitive dedup, demand-mapping indexes on state/audience/created_at, RLS enabled with **zero policies** (service-role only, mirrors the barback/`crawled_beers` pattern — first intentional use of the locked-table approach for a public ingest endpoint).

- **`lib/schemas/waitlist.ts`** — Zod schema with brewery_name refinement, email `.toLowerCase()`, state enum built from `US_STATES`, honeypot `website` field (max(0) string), `WaitlistInput` type export. 23 unit tests cover happy paths, brewery refinement, validation errors, honeypot, every US state, email normalization, max lengths.

- **`app/api/waitlist/subscribe/route.ts`** — public POST endpoint. Rate-limited 5/min per IP via `rateLimitResponse`, `parseRequestBody` for one-line Zod validation, `createServiceClient` for the insert (bypasses locked RLS), `apiConflict` (409) on duplicate email, fire-and-forget `onWaitlistSignup()` trigger for confirmation email, `apiSuccess({ ok: true }, 201)` on success. Intentionally does NOT echo back the saved row (no PII leak).

- **`components/landing/ComingSoonContent.tsx`** — marketing page. Cream canvas with "HopTrack is *pouring soon.*" hero (Playfair Display, gold italic), 4-card drinker feature section, dark floating 4-card brewery feature section, centered waitlist form card with audience pill toggle (User/Brewery), conditional `AnimatePresence` brewery_name field, hidden `website` honeypot, inline success state swap (no Toast dependency — `ToastProvider` is NOT in the root layout). Follows the LandingContent convention exactly: raw `<input>/<select>/<button>` with `C.*` color constants from `lib/landing-colors.ts` (NOT themed Button/Input/Card, which would leak CSS vars on dark-mode OS preference). Local `EASE`/`stagger`/`reveal`/`ScrollReveal`/`PourConnector` defined at top-of-file (no shared animation imports). `<button>` wraps `<motion.span>` — never `motion.button` (Alex rule).

- **`app/page.tsx`** — env-var flag wiring. `COMING_SOON_MODE=true` at request time swaps the root `/` route to render `ComingSoonContent` instead of `LandingContent`. `generateMetadata()` overrides title/description/OG when the flag is set. Authed users still bypass to `/home` in both modes.

- **`app/(superadmin)/superadmin/waitlist/page.tsx`** — admin viewer. Service-role read (table is locked), total count, audience breakdown (user vs brewery), **demand-by-state bars sorted descending with percentage** (the whole GTM point of the feature), full signup table sorted by created_at DESC, CSV export link. No extra auth check needed — the `(superadmin)` layout already guards on `is_superadmin`.

- **`app/api/superadmin/waitlist/export/route.ts`** — CSV export. **Explicit `is_superadmin` guard** because layouts don't protect API routes (common mistake). Service-role read, `csvEscape` helper copied from existing `customers/export` pattern, date-stamped filename.

- **`components/superadmin/SuperadminNav.tsx`** — added "Waitlist" nav entry with `ListChecks` icon between Breweries and Claims Queue.

- **`lib/email-templates/index.ts`** — added `waitlistConfirmEmail({ name, audience })`. Uses existing `layout(title, body, preheader?)` helper. Audience-aware body — breweries get a warmer "we'll reach out personally" line, users get the standard "first to know when HopTrack lands in your city" line. No clickable CTAs (nothing to link to yet). Preheader text for inbox preview.

- **`lib/email-triggers.ts`** — added `onWaitlistSignup(email, name, audience)`. Fire-and-forget pattern mirroring `onPasswordReset`.

- **`.claude/launch.json`** — added "Next.js Dev (Coming Soon)" config on port 3002 that boots with `COMING_SOON_MODE=true` for parallel preview alongside the normal dev server on 3000.

- **`docs/blog-drafts/`** — 4 SEO blog post drafts + README + master source index + sources disclosure. **NOT committed to main** — Joshua wants to read and approve before anything moves toward publish. Posts target long-tail keywords (not head terms like "craft beer"), every stat is sourced from a real URL (Brewers Association 2025 midyear report, Statista via Stamp Me, AnyRoad brewery loyalty research, Taplist.io pricing comparisons), and each post has a single soft CTA at the end. Post 3 ("Mug clubs don't actually retain customers") flagged for Drew's sanity-check before publish — it's a hot take in brewery circles.

**Test results:** 1884 Vitest tests passing (23 new). 0 lint errors, 0 new warnings in any new file. TypeScript typecheck clean. Live preview verified at `localhost:3002` with `COMING_SOON_MODE=true` — page renders with "HopTrack — Coming Soon" in document title, 0 console errors, 0 server errors, audience toggle works with conditional brewery_name field, API route reaches DB (returns clean 500 because migration 109 not yet pushed, as expected). Mobile (375px) responsive layout confirmed.

**Key Plan-agent catches (saved real rework):**

1. **`TO anon` RLS policy has zero precedent** across 108 migrations. Don't start with 109 — use `createServiceClient` + locked table + zero policies, mirroring `crawled_beers`/barback.
2. **`CITEXT` is not used anywhere** in this codebase — use plain `text` + `UNIQUE INDEX ON (lower(email))`.
3. **`ToastProvider` is NOT in the root layout** — `useToast()` from the coming-soon page would throw at runtime. Use inline form state instead.
4. **Themed `Button`/`Input`/`Card` from `components/ui/`** reference `var(--accent-gold)` etc., which leak from app interior into marketing page via ThemeProvider. Marketing pages MUST use raw elements + `C.*` constants from `lib/landing-colors.ts` (Sprint 11 decision, codified by `LandingContent.tsx`).
5. **`z.enum` in Zod v4 dropped `errorMap`** — use `{ message: "..." }` instead.

**CLAUDE.md change:** Joshua caught that the "Where We Are" section had been accumulating per-sprint status ("Last Completed Sprint: Sprint 173..."), which duplicates content already in this file + retro files + memory. Trimmed the section to a 4-line pointer with an explicit "don't add per-sprint status here" comment. The `sprint-close` skill itself needs a follow-up to remove its CLAUDE.md edit step — tracked in the retro backlog.

**NOT shipped (intentional, waiting on Joshua):**

- Migration 109 pushed to Supabase (he'll run `npm run db:migrate` when ready)
- `COMING_SOON_MODE=true` set in Vercel production env (instant toggle, no redeploy needed)
- Blog drafts committed to main (Joshua's reviewing first)
- `app/blog/` route group (waiting on draft approval + MDX-vs-CMS decision)
- OG image variant for `?type=coming-soon`
- JSON-LD structured data on the coming-soon page
- Sitemap/robots verification for coming-soon mode

**Full retro:** `docs/retros/sprint-174-retro.md`

---

### Sprint 175 — The Display Suite (Foundation) ✅

A full single-session sprint with a formal multi-phase plan. Joshua walked in with "Do some research into taplist.io. I want to add some of the look and feel of taplist.io as options for our users," then layered "this will be on huge screens in breweries" mid-planning. We researched taplist.io end-to-end, designed a 2-sprint arc, and shipped the entire foundation layer (theme system + display scale + tier gating + migration 110) plus a full rewrite of The Slideshow to match a reference mockup Joshua sent. We also shipped, iterated on, and then intentionally retired the Grid and Poster formats mid-sprint after they failed the "does this actually earn its keep" test.

**Plan:** `/Users/jdculp/.claude/plans/soft-percolating-aurora.md` (full 2-sprint arc plan with taplist.io research, architecture, tier matrix, risks)

**What shipped:**

- **`supabase/migrations/110_brewery_display_foundations.sql`** — 11 new `breweries` columns: `brand_color`, `brand_color_secondary`, `board_theme_id` (default `'cream-classic'`), `board_font_id` (default `'classic'`), `board_background_url`, `board_background_opacity`, `board_orientation` (default `'horizontal'`), `board_display_scale` (default `'auto'`), `short_slug` (UNIQUE + partial index `WHERE NOT NULL`), `qr_dark_color`, `qr_light_color`, `qr_logo_enabled`. Zero RLS changes — `breweries` already has the right policies. Pure additive, no backfill, default values match current behavior, rollback is 11 `DROP COLUMN` statements.

- **`lib/tier-gates.ts`** — typed `DisplayFeature` enum (9 features), synchronous `canAccessFeature(brewery, feature)` pure function, `getAccessibleFeatures()`, `getUpgradeMessage()`. Complements the existing async `requirePremiumTier` in `lib/api-helpers.ts` — this one is safe to call in React render paths with a brewery row already in scope. All 9 Display Suite features gate to Cask/Barrel except basics (QR basic, short URLs, web menu, embed basic) which stay in Tap.

- **`lib/board-display-scale.ts`** — pure functions for big-screen rendering: `detectDisplayScale({ width, height })` (breakpoints: <1920 → monitor, 1920–2559 → large-tv, ≥2560 → cinema), `resolveDisplayScale(scale, viewport)`, `scaleFSEntry(entry, scale)` (1× / 2× / 3× multiplier on every font-size field), `scalePadding(base, scale)`. Structural `FSEntry` type avoids a circular import back to `board-types.ts`. No React, no Supabase — fully unit-testable.

- **`lib/board-themes.ts`** — 10 preset `BoardTheme` records (`cream-classic` = Sprint 167 default, `midnight-gold`, `slate-chalk`, `neon-haze`, `hop-harvest`, `stout-roast`, `coastal-salt`, `burgundy-barrel`, `rose-orchard`, `brand-custom` = polymorphic from `breweries.brand_color`). Each theme is a palette + `fontId` + `isDark` flag + optional `defaultBackground`. `resolveTheme(brewery, themeId)` handles preset lookup, brand-custom merging, and fallback to cream-classic. `themeToCssVars(theme)` returns 9 `--board-*` CSS variables for inline styling on the Board root div. `applyBrandColor(base, hex)` is the immutable re-skin helper.

- **`lib/board-fonts.ts`** — 8 curated Google Font pairs (`classic` = Instrument Serif + JetBrains Mono for back-compat, `modern`, `rustic`, `vintage`, `editorial`, `chalk`, `industrial`, `delicate`). Each pair has a display font, body font, `googleFontsUrl` for single-request preload, and weight list. `getFontPair(id)` + `getFontPairUrl(id)` with graceful fallback.

- **`app/(brewery-admin)/brewery-admin/[brewery_id]/board/board-types.ts`** — major refactor. The `C` palette is now a CSS-variable lookup with cream-classic hex fallbacks (`C.cream` → `var(--board-bg, #FBF7F0)` etc.), so **format components stay unchanged** — they still reference `C.cream`, `C.gold`, etc., and pick up themes automatically when `BoardClient` sets the root CSS vars. `BoardSettings` gains `displayScale?: DisplayScale`, `themeId?: string`, `slideDurationMs?: number`. `BoardDisplayFormat` narrowed from `"classic" | "grid" | "compact" | "poster" | "slideshow"` to **`"classic" | "compact" | "slideshow"`** — grid and poster retired. `FORMAT_LABELS`, `FORMAT_DEFAULTS`, `FORMAT_FORCED` pruned to 3 entries. New `getScaledFS(settings, resolvedScale)` + `resolveBoardDisplayScale(settings, viewport)` helpers. `loadSettings()` now coerces retired format IDs (`grid`, `poster`) from localStorage back to `classic` so existing breweries don't crash when they open the Board after the upgrade.

- **`app/(brewery-admin)/brewery-admin/[brewery_id]/board/page.tsx`** — server fetch now selects `board_theme_id`, `brand_color`, `brand_color_secondary`, `board_font_id`, `board_display_scale` from the `breweries` row. Resolves the theme server-side via `resolveTheme()`. Preloads the active theme's Google Font pair via `getFontPairUrl()` as a dynamic `<link>` (replaces the hardcoded Instrument Serif link). Passes all new props to `BoardClient`.

- **`BoardClient.tsx`** — accepts `boardThemeId` / `brandColor` / `brandColorSecondary` / `boardDisplayScale` props; tracks viewport via a `useState + resize listener` pattern for auto-scale detection; resolves the active theme via `useMemo(() => resolveTheme(...))`; sets `themeToCssVars(theme)` as inline style on the root `<div className="font-sans">` so every `C.*` lookup in the format components resolves correctly. Threads `resolvedScale` through `FormatProps` to every format component. **Hydration-safe post-mount settings load** — initial `useState` returns `DEFAULT_SETTINGS` + brewery row's `boardDisplayScale` (matches SSR output), then a `useEffect` swaps in localStorage overrides after mount, gated by a `settingsHydrated` flag that prevents `saveSettings()` from clobbering stored values during the initial render cycle. Fixes a hydration mismatch introduced when localStorage reads diverged from server defaults.

- **`BoardHeader.tsx`** — **new theme picker** with 10 swatches (each rendered as a circle showing the theme's bg + accent dot + text dot), **new display-scale picker** with 4 buttons (auto / monitor / large-tv / cinema) and viewing-distance tooltips, both wired to `draftSettings` and persisted through the existing apply/cancel flow. Also **shrunk the header ~45%** per Joshua's feedback that the brewery name block was eating too much of the tap list area on a TV: padding `28px 40px 20px` → `16px 40px 10px`, initials badge 56px → 42px, brewery name clamp `64-100px` → `38-68px`, on-tap count 36 → 24, settings gear 20 → 18, divider spacing tightened.

- **`BoardShared.tsx`** — `BeerMetaRow` and `BeerStatsRow` now accept an optional `resolvedScale` prop so their internal font-size math respects the big-screen scale. `BeerStatsRow` gains a `centered` variant that stacks the "Biggest fan: ..." line below the rating/pours row for narrow Grid/Compact cards (before it overflowed horizontally). `SizeChips` gains `wrap` and `justify` props: default (`wrap: false`) preserves the Sprint 167 `flexShrink: 0` behavior for Classic's dotted-leader row; `wrap: true` lets the chip row shrink to fit its parent and wrap to multiple lines inside narrow cards. Every chip now has a computed uniform `minHeight` derived from `fs.chipLabel + fs.chipOz + chipPadV*2 + 4` so a label like "HALF PINT" that wraps to two lines doesn't make its chip taller than the one next to it. Chip labels use `whiteSpace: nowrap` so they stay single-line — chip width grows to fit instead. New shared `compactChipFs(fs)` helper scales chip fields to 75% (labels/oz/price) and 60% (padding) for use in Grid/Compact/Poster-row contexts. New `groupBeersByStyleFamily(beers)` helper + `BOARD_STYLE_GROUP_LABELS` map for style-family headings (IPAs 🌿, Lagers 🍻, Stouts ☕, Ciders 🍏, etc.) ordered lighter → darker → non-beer. `BoardSectionHeader` reshaped from a `type`-based lookup to direct `label` + `emoji` props.

- **`BoardClassic.tsx`** — featured beer is no longer a separate hero section; it now appears inline inside its style-family group with a gold `★` prefix before the name. Beer name sizing collapsed from a 2-size-track hero vs list to one uniform size (scroll pacing was too slow with the hero). Grouping switched from `groupBeersByType` (beer/cider/wine) to `groupBeersByStyleFamily` (IPAs, Stouts, etc.). `resolvedScale` threaded through every `ClassicBeerRow` and both `BeerMetaRow`/`BeerStatsRow` calls.

- **`BoardCompact.tsx`** — entries now stack the beer name + pour-size chips vertically (Joshua: "we need to see the full beer name"). Beer names no longer truncated with `textOverflow: ellipsis`. Featured beer gets a gold `★` prefix. `SizeChips` called with `wrap={true}` so chips reflow when a column is narrow. 2-column grid hardened to `repeat(2, minmax(0, 1fr))` + `alignItems: start`. Local `compactChipFs` helper replaced with the shared version from `BoardShared`. Style-family grouping throughout.

- **`BoardSlideshow.tsx`** — **complete rewrite to match Joshua's reference mockup.** Header bar across the top: brewery name on the left (`clamp(22px, 2vw, 32px)`, Playfair Display 700), "TAP N OF M" + dashes progress indicator in the middle, HopTrack mark + wordmark on the right. Main slide layout is a two-column flex: large glass art on the left (`clamp(180px, 18vw, 280px)` wide) with a drop shadow; right column stacks vertically — gold uppercase prefix line (`★ #1 THIS WEEK · WEIZEN GLASS`), huge beer name (`clamp(52px, 6vw, 96px)` Playfair Display 700), style chips (`STYLE · FAMILY` in gold), optional description, AROMA/TASTE/FINISH conditional 3-column grid (hidden when all three fields are empty — the underlying `beers.aroma_notes` / `taste_notes` / `finish_notes` columns don't exist yet, so this renders nothing until Sprint 176 adds them), 5-stat row (RATING / ABV / IBU / SRM / CHECK-INS — SRM gracefully renders as `—` until the column exists, CHECK-INS renders in gold as the accent stat), pour chips row with the first chip highlighted in gold as the "default" pour. Auto-advance reads `settings.slideDurationMs ?? 6000` (clamped to 3000–15000). Pause-on-hover with a "PAUSED" pill indicator. Progress bar animates along the bottom at the slide duration rate. Reduced-motion-safe crossfade between slides. Featured beer is always the first slide.

- **`lib/__tests__/board-settings.test.ts`** — trimmed 7 grid/poster-specific test cases now that the formats are retired.

- **`.claude/launch.json`** — added "Next.js Dev (Sprint A)" preview config on port 3456 for parallel preview alongside the normal dev server.

**Formats retired:**

- **`BoardGrid.tsx`** (256 lines) — deleted. "Classic in cards" didn't earn its keep vs Classic with style-family grouping.
- **`BoardPoster.tsx`** (277 lines) — deleted. "Classic with a hero" didn't earn its keep either. The hero was eating 40vh + forcing big-name/small-list reading patterns that nobody loved.
- Both removed from `BoardDisplayFormat`, `FORMAT_LABELS`, `FORMAT_DEFAULTS`, `FORMAT_FORCED`, the `FORMATS` arrays in `BoardHeader.tsx` + `BoardClient.tsx`, and `FormatRenderer` cases.
- `loadSettings()` migration safeguard coerces any stored `displayFormat: "grid" | "poster"` to `"classic"` so existing brewery owners get a graceful migration with zero support tickets.

**Test results:** 2008/2008 Vitest tests passing (was 2014 — trimmed 7 retired grid/poster cases from `board-settings.test.ts`, added **130 new Sprint A tests** across `tier-gates.test.ts` + `board-display-scale.test.ts` + `board-themes.test.ts`, for a net of +123). 0 lint errors, 0 new warnings across the entire `board/` directory. TypeScript `tsc --noEmit` clean. Live preview verified at `localhost:3001` via Chrome MCP with Mountain Ridge Brewing — toggled to slideshow format, DOM confirmed: brewery name, "TAP 6 OF 7" progress indicator, "★ #1 THIS WEEK · WEIZEN GLASS" prefix, "Wildflower Wheat" beer name, "WHEAT · SAISONS & FARMHOUSE" style chips, "4.1 RATING · 4.8% ABV · 15 IBU · — SRM · 8 CHECK-INS" stat row, pour chips with highlighted first chip. Screenshot captured and saved.

**Key Sprint A lessons (all saved to memory):**

1. **Don't ship multiple formats in one pass — ship one and sit with it.** Grid and Poster both survived 4+ rounds of iteration before we killed them. Jordan warned us during the Plan phase and we didn't listen.
2. **Turbopack RSC cache can get stuck.** If you edit a file and `touch` + a real edit both fail to trigger a recompile (verified by curling the SSR HTML and seeing old values), restart the dev server immediately. Don't spend an hour debugging a "hydration mismatch" that's actually a stale server compile.
3. **Convert `C` palette to CSS variables with hex fallbacks to migrate a theming layer without touching format components.** Every `C.cream` → `var(--board-bg, #FBF7F0)` means the format components get themed for free when the root div sets `themeToCssVars(theme)` as inline style. Zero API churn across 10 files.
4. **Marketing language matters in code.** Jamie's right — the 10 theme records are called "presets" in the file but "themes" everywhere user-facing. Keep user-facing vocabulary consistent in the source code too.
5. **Hydration-safe settings hydration requires a post-mount `useEffect` + a `hydrated` flag.** Initial `useState` must return whatever the server rendered (defaults, or defaults merged with brewery row data). Then a `useEffect` reads localStorage. A `settingsHydrated` flag guards the `saveSettings` effect from clobbering stored values during the initial render cycle.

**NOT shipped (intentional, waiting on Joshua or future sprints):**

- **Migration 110 pushed to Supabase** — Joshua's call. `npm run db:migrate` when ready. The migration is pure additive and safe to push.
- **Display Center `/display/*` route group** — deferred. Theme + scale pickers live in the existing `BoardHeader` settings panel as an interim UI until the dedicated page ships in a later sprint.
- **Custom brand color picker + custom font picker + custom background upload** — Cask-gated features, waiting on `/display/themes`.
- **Theater format + Gallery format + the 4K curated background library** — deferred while Joshua mulls what Grid and Poster should become, if anything. Asset sourcing is Jamie's call.
- **Sprint B (The Surfaces):** QR upgrade (logo embed, SVG, 6 surface types), `@react-pdf/renderer` print engine with 6 templates, promo carousel (`board_promotions` table), short URLs (`hoptrack.beer/b/{slug}`). All scoped in the plan doc.
- **Slide-duration slider in settings UI** — the `slideDurationMs` field is wired and reads correctly; the slider is a later polish pass.
- **Drew's two asks for Sprint 176:** add `beers.srm` + `beers.aroma_notes` + `beers.taste_notes` + `beers.finish_notes` columns with tap-list form fields, and a per-beer "default pour size" setting so the Slideshow's highlighted chip isn't always the first pour size.

**Full retro:** `docs/retros/sprint-175-retro.md`

---

### Sprint 176 — The Sensory Layer ✅

A full single-session sprint that delivered **Drew's Sprint 175 ask** end-to-end in one pass: SRM, aroma/taste/finish notes, a per-beer default pour size, the `BeerFormModal` + `CatalogBeerFormModal` wiring, the API propagation through the multi-location brand catalog, the Slideshow cleanup that retired S175's optimistic type cast, and a full Pint & Pixel seed covering all 20 beers with rich descriptions + sensory data + correct glass picks. Joshua opened the sprint saying "Do you remember those new fields we added from the last session" — Morgan gently clarified that S175 had only shipped the *read* path (the Slideshow reads `srm`/`aroma_notes`/etc. optimistically via a type cast) and this sprint would land the actual columns + write path. Once aligned, the whole sprint moved in one session with no mid-session pivots.

**What shipped:**

- **`supabase/migrations/111_beer_sensory_fields.sql`** (queued) — `beers` gains `srm int` (`CHECK 1–40`), `aroma_notes text[]`, `taste_notes text[]`, `finish_notes text[]`; `brand_catalog_beers` mirrors the same four columns so the brand catalog stays the single source of truth; `beer_pour_sizes` gains `is_default boolean NOT NULL DEFAULT false`; a **partial unique index `idx_beer_pour_sizes_one_default_per_beer ON beer_pour_sizes (beer_id) WHERE is_default = true`** enforces "exactly one default per beer" at the database level — no triggers, no CHECK constraints, no client-side enforcement. A **three-step backfill** ensures every existing beer ends up with exactly one default pour: (a) mark any pour row labeled `Pint` as default, (b) fall back to the first pour row (by `display_order, created_at`) for beers without a Pint, (c) `INSERT` a synthetic `Pint / 16oz / $6.00` row for beers with zero pour sizes. Full rollback plan in the file (drop index → 8 drop column → optional cleanup of backfilled Pint rows). Array columns default to `'{}'`.

- **`supabase/migrations/112_pint_pixel_sensory_seed.sql`** (queued) — seeds all **20 Pint & Pixel beers** with rich descriptions, SRM values, `aroma_notes`/`taste_notes`/`finish_notes` arrays, and the correct `glass_type` pick per style. Covers both rosters: the 10 dev-themed beers from migration 074 (Ctrl+Z Kölsch → `stange`, Regex Red Ale → `nonic_pint`, Git Blame Belgian → `tulip`, Infinite Loop IPA → `ipa_glass`, Null Pointer Nitro → `nonic_pint`, Syntax Error Saison → `tulip`, Hotfix Hazy Pale → `shaker_pint`, Binary Barleywine → `snifter`, Cache Miss Cider → `tulip`, Exception Handler ESB → `nonic_pint`) AND the 10 classic beers from `supabase/seeds/002_test_brewery.sql` (Debug IPA → `ipa_glass`, Pixel Perfect Pils → `pilsner_glass`, Dark Mode Stout → `snifter`, Stack Overflow Sour → `tulip`, Merge Conflict Märzen → `mug_stein`, Pull Request Pale → `shaker_pint`, Kernel Panic Porter → `nonic_pint`, 404 Wheat Not Found → `weizen_glass`, Deploy Friday DIPA → `ipa_glass`, Legacy Code Lager → `pilsner_glass`). Pure idempotent `UPDATE WHERE brewery_id AND name` — re-runnable, missing beers silently skipped. Every note in the seed is valid against the standardized catalog (37/37 AROMA, 38/38 TASTE, 22/22 FINISH verified programmatically). Every glass key valid against `GLASS_TYPES` (9/9). Morgan missed the 5 beers in `seeds/002_test_brewery.sql` on the first pass — Joshua caught it.

- **`lib/beer-sensory.ts`** — Standardized note catalogs sourced from BJCP style guidelines and Cicerone tasting vocabulary. **63 AROMA** notes, **67 TASTE** notes, **41 FINISH** notes, all as `readonly` tuples with narrowing `AromaNote`/`TasteNote`/`FinishNote` types. `isKnownNote(value, list)` for case-insensitive membership check. `normalizeNote(value)` for title-casing free-text entries while preserving short ALL-CAPS acronyms (ESB, NEIPA, IPA stay uppercase). A duplicate "Dank" existed in TASTE_NOTES on the first pass and was caught by the catalog uniqueness test on the first test run. A "Peppery" entry was added to FINISH_NOTES mid-sprint so the Pint & Pixel seed data would match the catalog 100%.

- **`lib/srm-colors.ts`** — Full 1–40 SRM→hex lookup table from BJCP reference colors. `srmToHex(srm)` with clamp to `[1, 40]` and mid-gold fallback for null/undefined/NaN. `srmLabel(srm)` bucket names ("Pale Straw", "Straw", "Pale Gold", "Deep Gold", "Amber", "Copper", "Deep Copper", "Brown", "Dark Brown", "Very Dark", "Black"). `isDarkSrm(srm)` (true when `srm >= 17`) for automatic text-contrast flipping on the swatch preview.

- **`components/brewery-admin/beer-form/SensoryNotesPicker.tsx`** — Fully controlled multi-select chip picker with free-text fallback. Parent owns `value: string[]`, component holds only the query string locally. Interactions: type to filter, click a suggestion to add as a chip, click the × on a chip to remove, **Enter** picks the first suggestion or adds a custom note, **Backspace** on an empty input removes the last chip. `onMouseDown` on dropdown items so `preventDefault` runs before the input blurs the dropdown away. `maxSelections` cap (default 8) hides the input with a polite "Maximum of N notes reached" message when full. Case-insensitive duplicate rejection. Reused three times in each form (Aroma / Taste / Finish).

- **`components/brewery-admin/beer-form/SrmPicker.tsx`** — Numeric input (1–40) paired with a live color swatch preview that auto-flips text color on dark beers via `isDarkSrm`. Bucket label ("Pale Gold", "Copper", etc.) renders next to the swatch. Validates inline via the same `validateNumericFields` path as ABV/IBU/Price.

- **`BeerFormModal.tsx`** (tap list) — Sensory section renders after Description, gated per item type (`showSrmField` = beer only; `showSensoryNotesFields` = beer/cider/wine/cocktail). Pour size rows gained a **gold-star "Hero" button** (`is_default` toggle) with auto-promotion on delete: removing the default row promotes the next row so the beer always has exactly one. Quick-adding `Pint` auto-promotes it to default (Joshua's spec). `isDirty()` extended with an array-equality helper for the three notes arrays + `srm` string.

- **`TapListClient.tsx`** — `openEdit` hydrates the new fields from the fetched beer row. `handleSave` persists them with item-type-aware clearing (non-beer loses `srm`, `na_beverage` loses all notes). The pour size save path **guarantees exactly one `is_default = true` row before insert** — honors the user's choice when present, falls back to the first row otherwise.

- **`BoardSlideshow.tsx`** — **Removed the `beerWithNotes as BoardBeer & {...}` type cast from Sprint 175.** The fields are now native on `BoardBeer`. `FlavorNote` subcomponent updated to accept `string[] | null | undefined` and render as `.join(", ")`. Pour chip highlight now uses `findIndex(p => p.is_default)` with a first-row fallback for legacy rows without an explicit default. `hasAnyNotes` check updated from truthy-string to array-length.

- **`board-types.ts`** — `BoardBeer` gained `srm?: number | null`, `aroma_notes?: string[] | null`, `taste_notes?: string[] | null`, `finish_notes?: string[] | null`. Optional so legacy rows without the columns degrade gracefully.

- **`lib/glassware.ts`** — `PourSize` type gained `is_default?: boolean` so the Slideshow loader can identify the hero pour.

- **`types/database.ts`** — `Beer` type gained the four sensory fields, plus fixed a **pre-existing tech-debt gap**: added `is_86d?: boolean` that had been missing since migration 019 (13 sprints of tech debt cleared while we were in the file).

- **`tap-list-types.ts`** — local `Beer` and `BeerFormData` types updated, `PourSizeRow` gained `is_default: boolean`, new `showSrmField()` / `showSensoryNotesFields()` visibility helpers, SRM validation (1–40) added to `validateNumericFields` with the same pattern as ABV/IBU/Price.

- **`CatalogBeerFormModal.tsx`** (brand catalog) — Same sensory section using the shared picker components. Client-side SRM range validation (1–40) mirrors the server-side check in the POST/PATCH routes.

- **`BrandCatalogClient.tsx`** — `CatalogItem` type extended with `srm` + `aromaNotes`/`tasteNotes`/`finishNotes` so the edit flow carries them into the modal.

- **`app/api/brand/[brand_id]/catalog/route.ts`** (POST) — accepts + validates `srm`, `aromaNotes`, `tasteNotes`, `finishNotes` on catalog create.

- **`app/api/brand/[brand_id]/catalog/[catalog_beer_id]/route.ts`** (PATCH) — accepts the new fields, propagates them alongside the existing name/style/etc. when `propagate: true` is set. **Parker framed this as "a retention feature disguised as a data-entry feature"** — a brand updates sensory data once, `propagate: true`, and it pushes to all linked location beers in the same PATCH call.

- **`app/api/brand/[brand_id]/catalog/[catalog_beer_id]/add-to-locations/route.ts`** (POST) — new location beers inherit sensory fields from the catalog on initial insert. Linking existing same-name beers stays non-destructive (doesn't overwrite local sensory data).

- **`app/api/brand/[brand_id]/catalog/route.ts`** (GET) — returns sensory fields in the response shape so the catalog page can render them.

- **`docs/plans/deferred-sprint-options.md`** — new **"Tooling / Developer Experience"** section added with a **Context7 MCP integration** entry. The MCP was wired in the Sprint 175 close commit `cf871dd` but has no usage playbook yet. Deferred as a half-day tooling task until the team has signal on how often stale-training-data library questions bite us during Next 16.2.1 / Tailwind v4 / Supabase SSR v0.9 work.

**Tests:** **2070 Vitest tests passing** (was 2008 at S175 close, **+62 new Sprint 176 tests**):
- `lib/__tests__/beer-sensory.test.ts` — 17 cases (catalog shape, no-duplicates invariant, case-insensitive `isKnownNote`, `normalizeNote` title-casing + ALL-CAPS preservation)
- `lib/__tests__/srm-colors.test.ts` — 15 cases (every value 1–40, clamp, NaN/null fallback, pale-vs-dark R-channel directional check, bucket labels, `isDarkSrm`)
- `lib/__tests__/tap-list-types.test.ts` — 15 cases (SRM validation integration, `emptyBeer` defaults, new visibility helpers, POUR_QUICK_ADD Pint sanity)
- `components/__tests__/SensoryNotesPicker.test.tsx` — 15 cases (rendering, filter, Enter key, Backspace key, custom note addition, max guard, case-insensitive duplicate rejection)

Typecheck clean, **0 lint errors** (all warnings in touched files are pre-existing — verified by git stash round-trip), **0 new warnings** introduced.

**Key Sprint 176 lessons (saved to memory):**

1. **Partial unique indexes are the canonical way to enforce "exactly one default per parent".** No trigger, no CHECK constraint, no client-side enforcement. `CREATE UNIQUE INDEX ON table (parent_id) WHERE is_default = true` gives you a database-level guarantee with zero operational cost. Use this pattern anywhere we need "at most one active/default/featured per group".
2. **Seeds and migrations both insert dev data — check both paths when touching a test brewery's roster.** Morgan missed 5 Pint & Pixel beers on the first pass of migration 112 because they live in `supabase/seeds/002_test_brewery.sql` rather than `supabase/migrations/`. Saved to feedback memory as a standing rule.
3. **Test-first catches catalog-list bugs on the first run.** A uniqueness test (`no duplicate entries within a list (case-insensitive)`) caught a duplicate "Dank" in TASTE_NOTES before any manual QA. A DOM-scoping test caught a picker test where "Citrus" appeared both as a selected chip and a dropdown suggestion. Both bugs were real. Write the uniqueness test on day one of any standardized-list library.
4. **When migrating a shared type from a type cast to a native field, also remove the cast — don't just add the field.** The `beerWithNotes as BoardBeer & {...}` cast from Sprint 175 was exactly the kind of "I'll clean this up later" debt that never gets cleaned up unless the sprint that adds the real field also removes the cast. Make it a rule.
5. **Catalog propagation is retention.** Single-action multi-location updates (PATCH with `propagate: true`) is the kind of workflow tax elimination that makes the difference between a brand growing past 5 locations on HopTrack vs canceling. Parker's observation is load-bearing.

**NOT shipped (intentional, waiting on Joshua or future sprints):**

- **Migrations 110, 111, 112 pushed to Supabase** — all three are stacked on disk, unpushed. Joshua's call. Pure additive, safe to run in order with `npm run db:migrate` whenever he's ready. None of them gate on each other beyond sequential ordering.
- **Picker dropdown mobile polish** — Alex flagged that the dropdown can overflow the modal on small screens when the sensory section is near the bottom. Sprint 177 polish item: `scrollIntoView` on focus or a max-height scroll region.
- **Taylor's Slideshow screenshot for the pricing page** — Drew owns this action item. A full P&P beer slide with sensory data visible should go in the Cask-tier marketing.
- **Context7 MCP playbook** — deferred to a tooling sprint once the team has signal on how often Next 16 / Tailwind v4 / Supabase SSR questions would benefit from live docs vs stale training data.
- **Per-beer default pour size UI in the edit-pour-sizes quick-add row** — the gold-star hero button exists for custom-added rows but quick-adds always auto-promote Pint. A user could theoretically want "Half Pint" as default without adding a Pint first — current flow requires manually adding Pint, then starring Half Pint, then removing Pint. Sprint 177 could add a default-picker dropdown on the quick-add row. Low priority.

**Full retro:** `docs/retros/sprint-176-retro.md`

---

### Sprint 177 — The Plumbing ✅

**Mid-session interrupt sprint** triggered by a full stats-plumbing audit. Joshua asked the broad question — *"make sure the stats we show are real, and make sure there's plumbing from display to source"* — and Morgan dispatched three parallel audit agents. The consumer agent caught `profiles.unique_beers` as orphaned. Morgan's follow-up grep caught `public.brewery_visits` as an entire orphaned rollup TABLE that the brewery audit agent had given a false "✅ LAUNCH-READY" on. Both had been silently broken in production since forever: `unique_beers` never incremented outside of seed migrations, `brewery_visits` only INSERTed from seed migration 076. Real users saw `0` and real breweries would have seen empty Brand CRM customer lists the moment Stripe went live.

**Scope:** Four tracks, all shipped in a single session.

**Track 1 — The Fix (Quinn + Avery):**
- **`supabase/migrations/113_fix_orphaned_stat_columns.sql`** — **APPLIED TO PROD THIS SESSION**
  - Three trigger functions, three triggers:
    1. `sync_profile_unique_beers_on_beer_log` → `AFTER INSERT` on `beer_logs`, increments `profiles.unique_beers` if `NOT EXISTS` for that user+beer combo (skips free-form entries where `beer_id IS NULL`)
    2. `sync_brewery_visits_on_session` → `AFTER INSERT` on `sessions`, UPSERTs `brewery_visits` with `total_visits + 1` and `GREATEST(last_visit_at, EXCLUDED.last_visit_at)` (skips home sessions where `brewery_id IS NULL`)
    3. `sync_brewery_visits_unique_beers_on_beer_log` → `AFTER INSERT` on `beer_logs`, increments `brewery_visits.unique_beers_tried` if first log of that user+brewery+beer (INSERT with `unique_beers_tried = 1, total_visits = 0` to handle the edge case of a beer_log arriving before a session for that brewery, then `ON CONFLICT DO UPDATE` to increment)
  - **Backfill pattern:**
    - `UPDATE profiles SET unique_beers = COALESCE((SELECT COUNT(DISTINCT bl.beer_id) FROM beer_logs bl WHERE bl.user_id = p.id AND bl.beer_id IS NOT NULL), 0)` — rebuilds unique_beers from ground truth for every profile
    - `ALTER TABLE brewery_visits DISABLE TRIGGER USER` → `TRUNCATE brewery_visits` → `INSERT INTO brewery_visits (…) SELECT … FROM sessions s LEFT JOIN beer_logs bl ON bl.session_id = s.id WHERE s.brewery_id IS NOT NULL GROUP BY s.user_id, s.brewery_id` → `ALTER TABLE brewery_visits ENABLE TRIGGER USER` — the standard backfill pattern for triggered tables (disable during bulk insert to avoid double-fire, re-enable after)
  - **`SECURITY DEFINER`** on all three functions, `GRANT EXECUTE … TO authenticated`, `NOTIFY pgrst 'reload schema'` at the end per the HopTrack post-function-change convention
  - Full rollback plan at the bottom (commented out, ready to run if needed)
  - Matches the existing HopTrack trigger pattern from migration 058 (POS sync) and migration 068 (event RSVP counts)
  - Apply output was clean: three `NOTICE (00000)` messages from the `DROP TRIGGER IF EXISTS` guards (expected on first run — the triggers didn't exist yet), followed by `Finished supabase db push.` No errors, no rollback.

**Track 2 — The Safety Net (Casey + Reese):**
- **`lib/__tests__/orphaned-columns-guard.test.ts`** (13 tests)
  - 11 shape assertions on migration 113: every `CREATE OR REPLACE FUNCTION` declaration, every `CREATE TRIGGER`, the home-session skip logic, the free-form beer entry skip logic, the backfill `UPDATE` + `TRUNCATE` + `INSERT` sequence, the `ALTER TABLE … DISABLE/ENABLE TRIGGER USER` guards, the `NOTIFY pgrst 'reload schema'`, the documented rollback plan
  - `profiles.unique_beers` must have a non-seed migration writer (positive assertion with seed migrations 074/075/076/100/104/105 explicitly excluded from the "counts as a write path" check)
  - `public.brewery_visits` must have a non-seed migration writer (same pattern)
  - Known-good RPC columns (xp, level, unique_breweries, current_streak, longest_streak) still wired via `increment_xp` RPC (migration 036) — negative regression check
- **`lib/__tests__/stat-write-paths.test.ts`** (14 tests)
  - Single source of truth table `STAT_WRITE_PATHS` with 10 tracked stat columns (xp, level, unique_breweries, current_streak, longest_streak, unique_beers, total_checkins, total_visits, unique_beers_tried, first_visit_at, last_visit_at)
  - Each row declares: column name, writer type (`rpc | trigger | api_route`), file path, regex the writer file must match, sprint the writer was added in, optional notes
  - Flags `profiles.total_checkins` as a known non-atomic read-modify-write with a race condition (the sessions POST route does `profile.total_checkins || 0 + 1` which can lose increments under concurrent inserts) — smaller follow-up noted for a future sprint
  - Meta checks: baseline count ≥ 10, valid writer types, file path prefixes (`supabase/migrations/` or `app/`)
- **Static analysis, not integration.** No mocks, no database, no flakiness. 34 tests, 69ms total runtime. The guards assert migration file shape + regex-grep the writer files on every test run. The moment anyone reverts migration 113 or refactors the writer files away, CI fails loud.
- **Result:** 2070 → 2104 tests. Zero regressions. Guard tests pass whether or not migration 113 is applied — they assert file shape, not DB state — which means they protected the fix the moment they landed.

**Track 3 — Adjacent Gaps (Finley + Dakota + Alex):**
Three write-path gaps in the S176 neighborhood, all fixed in one pass.

1. **`beers.cover_image_url`** — column existed since early sprints, displayed on Board Slideshow, but no upload UI in `BeerFormModal`. Fixed by wiring the existing `ImageUpload` component (from `components/ui/ImageUpload.tsx`, used by `BrewerySettingsClient`) to the `beer-photos` bucket with `folder={breweryId}`, 10MB limit, cover aspect ratio. `BeerFormModal` now takes a new `breweryId` prop (passed from `TapListClient`) so the storage folder is namespaced correctly.

2. **`beers.seasonal`** — column existed, filters used it, only seed migrations set it. Fixed by adding a Calendar-icon toggle button (gold-when-active, matching the pour-size default star pattern) that appears only for beer/cider/wine via new `showSeasonalField()` helper. Food/NA/cocktail opt out because the concept of a "seasonal release" doesn't apply.

3. **Sensory strip consistency** — old logic in `TapListClient.handleSave` was `aroma_notes: itemType !== "na_beverage" ? form.aromaNotes : []` which only stripped notes for NA beverages. Switching a beer to `food` kept stale `aroma_notes` in the database because the UI hid the picker but the save didn't strip. Fixed by changing the check to `showSensoryNotesFields(itemType)` so the save logic mirrors the UI gating exactly. Bonus fix — `food` item type now correctly clears stale sensory notes on save.

**New helpers in `tap-list-types.ts`:**
- `showSeasonalField(t) → beer | cider | wine`
- `showCoverImageField(t) → true` (every item can have a photo)
- `Beer` interface gained `cover_image_url: string | null` and `seasonal: boolean`
- `BeerFormData` gained `coverImageUrl: string` (empty string when absent, for clean dirty checks) and `seasonal: boolean`
- `emptyBeer` defaults both to empty/false
- `isDirty()` in `BeerFormModal` now tracks both new fields so the discard confirmation fires correctly

**Placement decision (Finley):** Cover photo + seasonal toggle sit between Description and the Sensory section. "What is this beer → when does it run → how does it taste." Information hierarchy, not randomness.

**Track 4 — Documentation (Morgan + Sam):**
- **`.claude/skills/hoptrack-conventions/SKILL.md`** — two updates:
  - **Supabase section** gained a new rule: *"Every displayed column needs a write path OUTSIDE of seed migrations"* with the exact grep recipe — `grep -rn "column_name" app/ lib/ supabase/migrations/ | grep -iE "update|insert|upsert|rpc|\.update\(|\.insert\(|\.upsert\("` — and references to the two regression guard tests
  - **Enforcement checklist** gained step 6: *"Every displayed stat column has a non-seed write path. If the guard tests fail in CI, a display field is silently broken in prod — fix the plumbing, don't weaken the test."*
- **Memory entry** (`~/.claude/projects/-Users-jdculp-Projects-hoptrack/memory/feedback_write_path_audit.md`) — captures the grep checklist, the trigger-vs-API-route decision tree, the backfill pattern (`DISABLE TRIGGER` → `TRUNCATE` → rebuild → `ENABLE TRIGGER`), and the full story of how the orphans survived 170+ sprints because seed data masked the bug in dev
- **`docs/plans/sprint-177-plan.md`** — the formal plan document for this sprint, included in the close commit as the historical artifact

**Tests:** **2104 Vitest tests passing** (was 2070 at S176 close, **+34 new**):
- `lib/__tests__/orphaned-columns-guard.test.ts` — 13 tests (migration shape + write-path presence)
- `lib/__tests__/stat-write-paths.test.ts` — 14 tests (single source of truth table + 3 meta checks)

Typecheck clean, **0 lint errors**, **0 new lint warnings** (6 pre-existing warnings in touched files verified by git show comparison).

**Key Sprint 177 lessons (saved to memory as `feedback_write_path_audit.md`):**

1. **Every displayed column needs a write path outside of seed migrations.** Run the grep before you ship a display column. If the only hits are in seeds, you have an orphan. This is now a standing convention in `hoptrack-conventions` and a CI-enforced rule via the two guard tests.
2. **Plumbing audits must grep writes, not just reads.** The backward "where is this displayed" → "what query fetches it" audit pattern catches the display surfaces but misses orphaned columns. Always grep forward: "where is this written?" If the answer is "only in seeds," you have a bug.
3. **Database triggers are the preferred fix for rollup columns.** Atomic, can't be bypassed by a new insert path (admin scripts, crons, bulk imports), matches the existing HopTrack pattern from migrations 058 and 068. API-route-level writes are brittle because the next non-API insert path misses the update silently.
4. **Pre-stage migrations. Never auto-apply them.** The migration was written, committed, reviewable, and tested for ~30 minutes before Joshua applied it. That window is where mistakes get caught. Even with full delegation ("do what you think best"), the right move was to leave the `db:migrate` command for the founder.
5. **Static-analysis regression guards are cheap and powerful.** 34 tests, zero runtime cost, zero database dependencies, zero flakiness. They assert file shape and grep patterns. When you can't write an integration test (E2E frozen, no local Supabase), a grep-the-files-at-test-time guard protects you from revert-and-forget bugs.
6. **When the founder says "do what you think best" twice, ship the documentation + stage the work + don't touch the database.** That's what trust looks like. Trust earned by being boring about the scary parts is trust you keep.

**NOT shipped (intentional, deferred):**
- **`profiles.total_checkins` race condition fix** — the `stat-write-paths.test.ts` table explicitly flags this as a known non-atomic read-modify-write. It has a write path (unlike the orphans), it's just racy under concurrent inserts. Should be migrated to an RPC or trigger in a future sprint. Lower priority than the P0 orphans.
- **Integration tests that exercise the triggers against a real Postgres instance** — would have required a local Supabase, which we don't have. The guard tests assert migration file shape; a real DB test would insert a session and verify the `brewery_visits` row appears. Deferred until the `e2e.frozen/` suite comes back online.
- **Sensory Layer v2** (Drew's next ask), **Beer Passport redesign**, **Display Suite polish** — top of mind for S178 kickoff options.

**Full retro:** `docs/retros/sprint-177-retro.md`

### Sprint 178 — The Concierge 🎩 ✅ (2026-04-14)
**Theme:** Make HopRoute a true beer concierge — personalized by taste, scored by relevance, with real walking distances.
**Arc:** Standalone

**4 tracks, all shipped in one session:**

**Track 1 — Walking Distance Metrics:**
- `computeRouteMetrics()` — haversine distances between stops, walk time at 3mph, total + avg
- Migration 120: 4 nullable columns on `hop_routes` + `hop_route_stops` (backward compatible)
- Adaptive walking radius: 1.5 → 2.5 → 3.0 mi fallback for spread-out cities
- UI: gold distance chip in route header, enriched between-stop connectors with `"0.4 mi · ~8 min walk"`

**Track 2 — Taste Fingerprint:**
- `computeTasteFingerprint()` — top styles, aroma/taste/finish note frequency from liked beers (>= 3.5 rating), ABV range, personality-derived exploration mode + intensity preference
- Invisible to user (no wizard UI). Feeds Claude's prompt replacing the anemic "top 5 styles" summary.

**Track 3 — Brewery Relevance Scoring:**
- `scoreBreweryRelevance()` — 0-100 score across 6 signals: wishlist on tap (0-30), taste overlap (0-20), visit history fit by personality axis (0-15), vibe match (0-15), tap freshness (0-10), trending boost (0-10)
- Explorer personality → prefer unvisited breweries. Loyalist → prefer revisits.
- Top 15 ranked breweries sent to Claude (down from unranked 30).

**Track 4 — Concierge Knowledge:**
- Enriched brewery payloads: sensory beer data, pour sizes, visit history, friend reviews, wishlist flags, trending markers
- Claude system prompt rewritten for concierge-style reasoning: reference specific beers by name, mention sensory notes, call out wishlisted items, note friend activity, use visit history
- Token budget managed via compression (80-char descriptions, 3 notes per category, pour sizes for top 3 beers only)

**Key architectural changes:**
- `lib/hop-route.ts` rewritten: 3 new pure functions + extended `HopRouteInput` interface + `TasteFingerprint` type + `BreweryForScoring` type + rewritten `buildHopRoutePrompt()`
- `app/api/hop-route/generate/route.ts` overhauled: 8 parallel Supabase fetches (up from 3), scoring pipeline, enrichment pipeline, post-generation distance computation
- `app/(app)/hop-route/[routeId]/HopRouteCardClient.tsx` — distance summary in header + enriched between-stop connectors
- `app/(app)/hop-route/[routeId]/page.tsx` — Supabase select updated for new columns
- Reuses: `haversineDistance()` from `lib/geo.ts`, `computePersonality()` from `lib/personality.ts`, sensory vocabulary from `lib/beer-sensory.ts`

**Tests:** **2128 Vitest tests passing** (was 2104 at S177 close, **+24 new**):
- `lib/__tests__/hop-route-concierge.test.ts` — 24 tests (6 for routeMetrics, 8 for tasteFingerprint, 10 for breweryScoring)

**Full retro:** `docs/retros/sprint-178-retro.md`

---

## Sprint 179 — The Launchpad 🚀
*Standalone infrastructure sprint — 2026-04-21*

**Theme:** Stand up the real infrastructure that was only ever drafted — staging, clean prod, coming-soon live.

**Context:** For 178 sprints HopTrack had been running as a rich feature codebase with no deployment anywhere. `hoptrack.beer` was a GoDaddy parked page. Docs described a Vercel + staging setup that had never been provisioned. Joshua course-corrected twice in this session: first "what's real vs aspirational," then "do we need Vercel and why." Both pivots reshaped the sprint scope.

**Track 1 — Staging activated:**
- `hoptrack-staging` provisioned in us-east-1 on Supabase Pro (ref `qhznhxyhwqmqfdaqebla`)
- 72 tables cloned from prod via `pg_dump --schema-only`
- Had to resolve multiple gotchas: Supabase postgres role can't disable system triggers; `pg_dump` default search_path clears break user-defined triggers; ephemeral auth tables (`auth.flow_state`, `auth.sessions`, `auth.refresh_tokens`, `auth.audit_log_entries`, `auth.instances`) can't be restored
- All 120 historical migrations marked applied in staging's `supabase_migrations.schema_migrations` tracker
- First environment HopTrack has ever had for migration testing

**Track 2 — Migration chain made self-contained:**
- `supabase/migrations/000_baseline.sql` (222KB, 7,199 lines) — pg_dump of prod's public schema, captures the tables that were created by hand in the Supabase UI back in March 2026 before migration discipline started
- Self-contained preamble: resets public schema, enables `pg_trgm` extension, includes safety guard that raises an exception if `public.breweries` already exists (prevents accidental destructive re-run)
- Marked applied in both prod and staging trackers — `supabase db push` skips it going forward
- Closes 120 sprints of drift between migrations/ and actual prod schema

**Track 3 — Prod cleaned for launch:**
- `supabase/migrations/121_prod_cleanup.sql` — removes all test/demo data accumulated from seed migrations 024, 074, 075, 076, 078, 100, 104, 105, 112
- Test data catalog (reverse-engineered via audit queries):
  - Users by UUID: `aaaaaaaa-*`, `bbbbbbbb-*`, `cc000000-*`, `f000000*-*`
  - Users by email: `@pintandpixel.test`, `@hoptrack.test`, `@test.hoptrack.beer`, `setup@hoptrack.app`
  - Breweries by UUID: `dd000001-*` (Mountain Ridge, River Bend, Smoky Barrel), `dd078001-*` (P&P Charlotte), `a1b2c3d4-*` (P&P Austin)
- Safety-wrapped in BEGIN/COMMIT with founder-account-exists guard (aborts if wrong DB)
- Prod result: **7,190 real breweries, 1,004 real beers, 2 real accounts** (jdculp88@gmail.com + testflight@hoptrack.beer)
- Tested against staging first (staging already had copy of prod data), then applied to prod

**Track 4 — Vercel deploy live:**
- Project `hop-track` created under `jdculp88-8549's projects` on Vercel Hobby tier
- Deploys from `main` branch, auto on push
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL` + anon/service_role keys (prod), `NEXT_PUBLIC_SITE_URL=https://hoptrack.beer`, `COMING_SOON_MODE=true` (activates the S174 `ComingSoonContent` component at `/`)
- Live at `hop-track.vercel.app` — coming-soon page with waitlist form
- Waitlist pipeline verified end-to-end: form submit → `/api/waitlist/subscribe` → prod `public.waitlist` table
- DNS flip to `hoptrack.beer` paused at Joshua's request — launch is LLC-gated

**Track 5 — Dev infrastructure fixed:**
- `scripts/dev-staging.mjs` — Node wrapper that reads `STAGING_*` vars from `.env.local` and exports as `NEXT_PUBLIC_*` / `SUPABASE_SERVICE_ROLE_KEY` for `next dev`. Replaces the silently-broken shell-expansion version that relied on `.env.local` vars being in shell env (they aren't — Next.js reads them into its own process).
- `scripts/prod-cleanup-audit.sql` — read-only dry-run script that catalogs test data before deletion. Reusable for future audits.
- `docs/operations/staging-env-setup.md` — filled in with real project refs, region notes, and the baseline story.

**Key architectural changes:**
- `supabase/migrations/000_baseline.sql` + `121_prod_cleanup.sql` added — first and last migrations in the chain are now explicit foundations
- `scripts/dev-staging.mjs` + `scripts/prod-cleanup-audit.sql` added
- `package.json` — `dev:staging` rewired through Node script; `build:staging` dropped (unused, replaced by Vercel)
- Supabase CLI re-linkable between prod (`uadjtanoyvalnmlbnzxk`) and staging (`qhznhxyhwqmqfdaqebla`) via `supabase link --project-ref`

**Numbers:**
- New files: 4
- Modified files: 3
- Migrations drafted: 2 (both marked applied pre-push — no new rows in tracker)
- Tests: **2128** (unchanged — zero new tests, infrastructure sprint)
- Lint errors: 0
- Build status: Vercel deploy succeeded ✓
- Commits: 4 on `claude/strange-bohr-f1edcb` (staging-activation, dev:staging-fix-and-audit, 121_prod_cleanup, retro)

**Gotchas cataloged in memory:**
- Supabase `postgres` role can't `ALTER TABLE ... DISABLE TRIGGER ALL` (system triggers are off-limits)
- `pg_dump` emits `SET search_path = ''` which breaks triggers that reference tables without schema prefix
- Triggers on `sessions` auto-populate `brewery_visits` — skip COPY of `brewery_visits` when loading dumps
- Supabase-managed auth tables (`auth.schema_migrations`, `auth.flow_state`, `auth.sessions`, etc.) reject writes — exclude when dumping
- Migration chain drift: 120 sprints of forward-only pushes left `001-120` assuming pre-existing tables

**Remaining before true go-live:**
- DNS flip at GoDaddy to point `hoptrack.beer` at Vercel
- Terms of Service + Privacy Policy finalized with LLC name
- LLC approval (external, pending)
- New logo refresh (Jamie)
- Merge `claude/strange-bohr-f1edcb` → `main`

**Full retro:** [docs/history/retros/sprint-179-retro.md](history/retros/sprint-179-retro.md)

### Sprint 180 — The Launch 🚀 ✅ (2026-04-30)
**Theme:** Compress the entire LLC unblock chain and launch infrastructure into one afternoon. Go from "coming-soon-on-vercel.app" to "real-business-on-hoptrack.beer" in a single window.
**Arc:** The Launch (closes the launchpad work S179 set up)
**Plan:** None (sprint was pantsed — Sage's action item for S181)

**Business unblock (the morning):**
- HopTrack LLC effective 2026-04-05, NC-approved 2026-04-24, NC SOSID **3269858**, Current-Active
- IRS EIN issued 2026-04-27 (CP 575 letter held by Joshua)
- Mercury bank account approved same-day 2026-04-27
- Operating Agreement signed (eForms template, single-member LLC, Schedule C, December FY-end, $100 initial capital)
- Stripe live 2026-04-27 — sandbox + live keys, Recurring + Invoicing + Stripe Tax enabled, Stripe Connect intentionally OFF

**Track 1 — Cream-themed legal pages (`8c97fb0`):**
- Restyled `/terms`, `/privacy`, `/dmca` to match Coming Soon palette (`C` from `lib/landing-colors.ts`) — cream background, font-display headings, gold eyebrow, fluid `clamp()` typography
- Added HopTrack LLC entity reference to TOS §1, §9, §12, footer; new Privacy "Who We Are" intro
- Added §13 Governing Law to TOS (NC law, Mecklenburg County jurisdiction)
- Added Cookies & Tracking, Email Communications, Age Requirement, Changes to This Policy sections to Privacy
- Bumped Last Updated dates to 2026-04-27, removed "template — attorney review recommended" Notice banner
- New `<LegalLink>` component (`components/ui/LegalLink.tsx`) wrapping `next/link` with `target="_blank" rel="noopener noreferrer"` — closes mid-flow sad-path bug across 6 surfaces
- 9 files changed, +348 / −129

**Track 2 — Email consolidation to single mailbox (`ad9d711`):**
- Every `legal@`, `privacy@`, `dmca@`, `support@`, `help@`, `hello@`, `sales@`, `demo@`, `push@hoptrack.beer` reference → `josh@hoptrack.beer` (only provisioned mailbox)
- 11 user-facing surfaces + 3 system defaults (FROM email, VAPID subject) updated
- 14 files changed, +33 / −33

**Track 3 — DNS + SSL live:**
- GoDaddy DNS edited: `A @ "WebsiteBuilder Site"` → `A @ 216.198.79.1` (Vercel new IP range)
- 4 records propagated globally in <10 minutes
- Vercel SSL cert auto-issued
- `hoptrack.beer` and `www.hoptrack.beer` both serve cream coming-soon page
- Existing GoDaddy DNS preserved: M365 MX (apex), autodiscover/msoid/sip CNAMEs, NS, SOA, DMARC

**Track 4 — Resend domain auth:**
- 3 records added at GoDaddy on a `send.` subdomain pattern (no apex SPF conflict with M365)
  - TXT `resend._domainkey` → DKIM public key
  - MX `send` → `feedback-smtp.us-east-1.amazonses.com` (priority 10)
  - TXT `send` → `v=spf1 include:amazonses.com ~all`
- Domain verified by Resend in 13 minutes (add → DNS verified → domain verified)
- API key `hoptrack-prod` created, added to Vercel env vars (Production + Preview, Sensitive)

**Track 5 — Force fresh deploy to pick up env (`a4e65a1`):**
- Vercel cached redeploy didn't propagate `RESEND_API_KEY` to warm Fluid Compute function instances
- Fix: 4-line comment block added to `lib/email.ts` documenting Resend production state — also serves as fresh-commit deploy trigger
- After fresh deploy, function instances spun up new with current env, Resend API was hit, confirmation email landed in Joshua's inbox (not spam)

**Track 6 — Dead-link fix Joshua caught in his own confirmation email (`58125fd`):**
- Joshua noticed `app.hoptrack.beer` (anticipated future subdomain that was never provisioned) in the confirmation email footer
- Swapped every `app.hoptrack.beer` → `hoptrack.beer` across 7 files: email templates (~25 refs), API route fallbacks (billing checkout/portal × 2 each, brand variants, POS Square webhook, QR client SSR fallback)
- Future plan: when `app.hoptrack.beer` is eventually provisioned as a real subdomain (Phase 2 marketing/app split), revert this commit OR introduce `NEXT_PUBLIC_APP_URL` env var
- 7 files changed, +27 / −27

**Track 7 — Memory updates:**
- Created `project_llc_unlock.md` in HopTrack memory — the landmark milestone file
- Updated `project_launch_infrastructure.md` to mark LLC as done, trim "Remaining" list to 3 items
- Updated `MEMORY.md` index — new entry added, old entry refreshed
- Open Claw `projects/project_hoptrack.md` already had parallel record (lines 102–106)

**Numbers:**
- Commits to main: **4** (`8c97fb0` legal, `ad9d711` email, `a4e65a1` docs+force-deploy, `58125fd` app.subdomain fix)
- Files changed across all 4 commits: **34**
- Tests: **2128 / 2128 passing** at every push (no new tests — action item for S181)
- TypeScript: clean (`tsc --noEmit` exit 0) at every push
- ESLint local: warnings only, no new errors
- ESLint CI: **42 pre-existing errors blocking CI** (React-Compiler rules, red since Apr 27 — not introduced this sprint)
- Migrations: **0 new** (all infra/email work, no schema changes)
- Vercel deploys: 4 production rebuilds
- DNS records added at GoDaddy: 4 (1 A, 1 MX, 2 TXT)
- Vercel env vars added: 1 (`RESEND_API_KEY`)
- Resend domains verified: 1
- Time from "let's launch" to "live + working confirmation email": ~6 hours
- Build status at sprint close: Vercel ✅, GitHub Actions CI ❌ (lint, pre-existing, S181-P0)

**Key architectural changes:**
- `<LegalLink>` typed-narrowed component (`LegalPath = "/terms" | "/privacy" | "/dmca"`) is now the canonical pattern for legal-page links — every footer + consent surface uses it
- `lib/email.ts` documents Resend production state inline (DKIM/SPF/MX verified for hoptrack.beer 2026-04-30)
- Single-mailbox interim: `josh@hoptrack.beer` is the unified contact + sender. When new aliases are provisioned, re-fan-out per-surface
- `app.` subdomain references removed from production code — apex `hoptrack.beer` is canonical until Phase 2 marketing/app split

**Remaining before next milestone (Sprint 181 — The Customer):**
- Fix CI red (42 React-Compiler ESLint errors blocking GitHub Actions)
- Audit fix #1 (Stripe webhook fail-open `app/api/billing/webhook/route.ts`) + audit items #5/#10 BEFORE flipping live keys to production
- Heist Charlotte cold outreach (Taylor + Drew, Charlotte trip Friday)
- Final logo lock (Jamie + Joshua, Wednesday review)
- Casey's three IOUs: LegalLink regression test, legal-page screenshot test, email-link Playwright spec
- Riley's runbook: `docs/operations/vercel-env-var-pickup.md`
- Sentry alert on Resend bounce/complaint webhooks (Parker)

**Memory cataloged:**
- Vercel cached redeploy doesn't propagate sensitive env vars to warm Fluid Compute instances — fresh commit is the reliable fix
- GoDaddy + Resend domain verification can complete in 13 minutes when DNS is healthy
- M365 inbound MX coexists cleanly with Resend outbound on `send.` subdomain — apex SPF stays for GoDaddy/M365, subdomain SPF for amazonses.com
- The founder catching email-template dead links is the most embarrassing kind of bug — add `npx playwright test email-links` to pre-launch checklist

**Full retro:** [docs/history/retros/sprint-180-retro.md](history/retros/sprint-180-retro.md)
