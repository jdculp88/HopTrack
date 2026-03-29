# Sprint 30 — Foundation Fix

**Date:** 2026-03-29
**Theme:** Kill every P0, fix the RLS layer, ship a product that actually works
**Source:** Full Team Testing Audit (`docs/sprint-30-testing-audit.md`)
**PM:** Morgan + Sage (coordination)

---

## Sprint Goal

The testing audit found 12 P0 ship-blockers — including silent RLS failures that mean notifications, tap list edits, and achievement feeds have never worked. This sprint fixes every P0 and the critical P1s that block core user flows. By end of sprint, every feature in HopTrack actually functions.

---

## Session 1 — RLS Emergency + Data Fixes

*"One migration, three P0s dead."*

| # | Item | Priority | Owner | Status |
|---|------|----------|-------|--------|
| S30-001 | Migration 034 — Fix 3 critical RLS policies (notifications INSERT, beers UPDATE/DELETE, user_achievements SELECT) | P0 | Riley + Quinn | 🔲 |
| S30-002 | Fix `wishlists` → `wishlist` table name in `home/page.tsx:163` | P0 | Avery | 🔲 |
| S30-003 | Fix `var(--color-*)` → `var(--*)` in 3 brewery admin files (dashboard, sessions, QR tent) | P0 | Avery | 🔲 |
| S30-004 | Add ownership check to friends DELETE endpoint (`api/friends/route.ts`) | P0 | Avery | 🔲 |
| S30-005 | Verify friends feed loads after dev server restart + hard reload | P0 | Jordan + Riley | 🔲 |
| S30-006 | Fix ReactionBar on non-session cards — disable cheers on AchievementFeedCard, StreakFeedCard, RecommendationCard, NewFavoriteCard (pass null sessionId or hide cheers toggle) | P0 | Avery | 🔲 |
| S30-007 | Fix DrinkingNow "Cheers" — either create POST `/api/notifications` or use existing reactions pattern | P0 | Avery | 🔲 |
| S30-008 | Fix FriendJoinedCard "Follow" — wire to `/api/friends` POST or add "Coming soon" badge | P0 | Avery | 🔲 |
| S30-009 | Fix Delete Account button — add "Coming soon" tooltip or wire to account deletion flow | P0 | Avery | 🔲 |
| S30-010 | Refactor `Button` component — replace `motion.button` with `<button>` + inner `<motion.div>` | P0 | Avery + Alex | 🔲 |
| S30-011 | Run `NOTIFY pgrst, 'reload schema';` after migration 034 | P0 | Riley | 🔲 |

---

## Session 2 — Critical P1s (Core Functionality)

*"Make every feature actually work end-to-end."*

| # | Item | Priority | Owner | Status |
|---|------|----------|-------|--------|
| S30-012 | Fix `motion.button` in 4 remaining components (FlavorTagPicker, ServingStylePicker, ThemeToggle, AchievementBadge) | P1 | Avery | 🔲 |
| S30-013 | Fix `push_subscriptions` schema mismatch — verify actual table columns, create corrective migration if needed | P1 | Riley + Quinn | 🔲 |
| S30-014 | Add `UNIQUE(user_id, session_id, type)` constraint on `reactions` table | P1 | Quinn | 🔲 |
| S30-015 | Fix `beer_logs.beer_id` text → uuid with FK to `beers` (same pattern as migration 033) | P1 | Riley + Quinn | 🔲 |
| S30-016 | Fix session_comments profile join — add FK to `profiles` or fix PostgREST hint | P1 | Quinn | 🔲 |
| S30-017 | Fix `FullScreenDrawer` accessibility — add `role="dialog"`, `aria-modal="true"`, focus trap | P1 | Avery + Alex | 🔲 |
| S30-018 | Fix XP level titles — delete duplicate `levelTitles` from pint-rewind, import from `lib/xp` | P1 | Avery | 🔲 |
| S30-019 | Fix XP calculation — unify SESSION_XP values, remove dead `calculateCheckinXP` | P1 | Avery + Jordan | 🔲 |
| S30-020 | Add mobile Notifications access to AppNav bottom bar (bell icon with unread badge) | P1 | Avery + Alex | 🔲 |
| S30-021 | Fix "Check In" copy sweep — CheckinEntryDrawer header, BreweryCheckinButton, StreakFeedCard | P1 | Avery | 🔲 |
| S30-022 | Fix Explore search — handle OpenBreweryDB IDs that don't exist in HopTrack (show "Not on HopTrack yet" state or filter) | P1 | Avery | 🔲 |
| S30-023 | Fix ReactionBar error handling — add toast on failure instead of silent rollback | P1 | Avery | 🔲 |
| S30-024 | Wire feed comment counts — pass `commentCount` from page.tsx through HomeFeed to SessionCard | P1 | Avery | 🔲 |
| S30-025 | Fix race condition in session-end XP — use atomic `xp = xp + $1` via RPC or raw SQL | P1 | Quinn + Jordan | 🔲 |

---

## Session 3 — Hardcoded Color Sweep + Code Quality

*"One pass, 40 files, consistent design system."*

| # | Item | Priority | Owner | Status |
|---|------|----------|-------|--------|
| S30-026 | Hardcoded `#D4A843` sweep — replace with `var(--accent-gold)` across ~40 files | P1 | Avery | 🔲 |
| S30-027 | Hardcoded `#0F0E0C` sweep — replace with `var(--bg)` across ~30 files | P1 | Avery | 🔲 |
| S30-028 | Hardcoded `#E8841A` sweep — replace with `var(--accent-amber)` across ~20 files | P1 | Avery | 🔲 |
| S30-029 | Consolidate `timeAgo` — delete 5 local copies, use `formatRelativeTime` from `lib/utils` | P1 | Avery | 🔲 |
| S30-030 | Consolidate `lib/dates.ts` — merge duplicates with `lib/utils.ts` | P1 | Avery | 🔲 |
| S30-031 | Fix `DrinkingNow` notification type — add `session_cheers` to NotificationType or use existing type | P1 | Avery | 🔲 |
| S30-032 | Fix CuratedCollectionsList — remove `cursor-pointer` and add "Coming soon" badge, or wire to route | P1 | Avery | 🔲 |

---

## Deferred to Sprint 31

### P1 (important but not blocking core flow)
- `as any` reduction in `home/page.tsx` (29 casts) — needs generated Supabase types
- `HomeFeed.tsx` split into 5+ files (1305 lines) — large refactor, needs Jordan review
- `home/page.tsx` monolith refactor (362 lines, 16 queries) — needs architecture decision
- No password reset / forgot password flow — needs Supabase Auth config
- No username uniqueness check on signup — needs debounce + API endpoint
- Superadmin stats using anon client — needs service role client setup
- No upgrade/billing CTA in brewery admin — needs billing strategy (Taylor + Morgan)

### P2 (polish for public launch)
- N+1 query optimization (session-end, push notifications)
- Session share page hardcoded colors
- Auth signup AnimatePresence transitions
- UserAvatar level badge light theme fix
- Mobile brewery admin scroll indicator
- Tap list numeric validation
- Brewery admin first-run onboarding
- "Claim this brewery" CTA on consumer brewery pages
- Feed array index keys → unique IDs
- Type safety improvements (Profile, Beer, Brewery types)
- Request body validation on POST endpoints
- Dead code cleanup (LeaderboardRow, schema.sql checkins)

### P3 (nice to have)
- React Context for reaction prop drilling
- HomeFeed prop grouping (18 → 4 sub-objects)
- StarRating half-star on touch devices
- Toast ID collision fix
- BreweryAdminNav outside-click close

---

## Migration Plan

### Migration 034 (Session 1 — Day 1)
```sql
-- Fix 3 critical RLS policies

-- 1. Notifications: allow authenticated users to create notifications
CREATE POLICY "Authenticated users can insert notifications"
ON notifications FOR INSERT TO authenticated WITH CHECK (true);

-- 2. Beers: allow brewery admins to update their beers
CREATE POLICY "Brewery admins can update beers" ON beers FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM brewery_accounts ba
  WHERE ba.brewery_id = beers.brewery_id AND ba.user_id = auth.uid()
));

-- 3. Beers: allow brewery admins to delete their beers
CREATE POLICY "Brewery admins can delete beers" ON beers FOR DELETE
USING (EXISTS (
  SELECT 1 FROM brewery_accounts ba
  WHERE ba.brewery_id = beers.brewery_id AND ba.user_id = auth.uid()
));

-- 4. User achievements: allow authenticated users to read all achievements
CREATE POLICY "Authenticated users can read achievements"
ON user_achievements FOR SELECT TO authenticated USING (true);
```

### Migration 035 (Session 2)
```sql
-- Fix reactions unique constraint
ALTER TABLE reactions
ADD CONSTRAINT reactions_user_session_type_unique
UNIQUE(user_id, session_id, type);

-- Fix beer_logs.beer_id text → uuid with FK
ALTER TABLE beer_logs
ALTER COLUMN beer_id TYPE uuid USING beer_id::uuid;

ALTER TABLE beer_logs
ADD CONSTRAINT beer_logs_beer_id_fkey
FOREIGN KEY (beer_id) REFERENCES beers(id) ON DELETE SET NULL;

-- Fix push_subscriptions UPDATE policy (if missing)
CREATE POLICY "Users can update own subscriptions"
ON push_subscriptions FOR UPDATE
USING (auth.uid() = user_id);
```

---

## Verification Checklist (End of Sprint)

- [ ] Friends feed shows sessions with brewery data
- [ ] Achievement cards appear on Friends tab
- [ ] Notifications create successfully (friend request → check DB)
- [ ] Tap list: edit, delete, reorder, 86 toggle all work from admin UI
- [ ] Wishlist items appear on You tab
- [ ] Brewery admin dashboard/sessions/QR pages render with correct styling
- [ ] All buttons either function or show "Coming soon"
- [ ] Zero `motion.button` in codebase
- [ ] Zero hardcoded `#D4A843` outside auth/marketing pages
- [ ] Cheers reaction works on session cards, hidden on non-session cards
- [ ] Mobile nav has notification bell
- [ ] XP level titles consistent between Pint Rewind and rest of app
- [ ] ReactionBar shows toast on error
- [ ] Comment counts visible in feed card footer

---

## Team Assignments

| Team Member | Primary Focus |
|-------------|--------------|
| **Riley + Quinn** | Migration 034+035, push_subscriptions verification, PGRST reload |
| **Avery** | All code fixes (S30-002 through S30-032) — this is Avery's sprint |
| **Jordan** | Architecture review on all Avery PRs, XP unification, feed verification |
| **Alex** | Button refactor review, FullScreenDrawer a11y, mobile nav design, color sweep review |
| **Casey + Reese** | Verification checklist — test every fix, sign off on each ticket |
| **Sam** | User journey re-walk after fixes, validate nothing regressed |
| **Drew** | Brewery admin re-test after CSS var fix + RLS fix |
| **Morgan + Sage** | Coordination, Sprint 31 pre-planning |
| **Taylor** | Prep Sprint 31 billing/upgrade CTA spec |
| **Jamie** | Prep Sprint 31 copy audit (marketing page "check-in" sweep) |

---

*Sprint 30 — Foundation Fix. Every P0 dies. Every feature works. No excuses.* 🍺
