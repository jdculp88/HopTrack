# Sprint 30 — Full Team Testing Audit

**Date:** 2026-03-29 (Sunday)
**Coordinator:** Morgan (PM) + Sage (PM Assistant)
**Teams:** All 13 team members deployed across 5 audit groups

---

## Executive Summary

Five teams audited HopTrack across every surface — consumer UX, architecture, infrastructure, QA edge cases, and brand/revenue readiness. **121 total findings** across all teams, deduplicated to approximately **85 unique issues**.

The audit revealed several **systemic issues** that multiple teams caught independently, which validates their severity:

| Issue | Caught By |
|-------|-----------|
| `wishlists` vs `wishlist` table name | All 5 teams |
| Friends DELETE has no auth check | Jordan, Casey |
| `motion.button` violations | Casey, Alex |
| FriendJoinedCard "Follow" dead button | Jordan, Casey, Taylor |
| Hardcoded `#D4A843` in 30-40 files | Jamie, Casey, Alex |
| `user_achievements` RLS blocks feed | Sam, Riley |
| Brewery admin CSS var namespace wrong | Alex, Drew, Jamie |

---

## P0 — Ship Blockers (12 unique)

### RLS / Data Layer (Riley + Quinn)
| ID | Finding | Fix |
|----|---------|-----|
| **RQ-1** | `notifications` table has NO INSERT RLS policy — every notification insert silently blocked. Zero in-app notifications have ever been delivered. | Add `FOR INSERT TO authenticated WITH CHECK (true)` |
| **RQ-2** | `beers` table has no UPDATE or DELETE RLS policy — all tap list admin operations (edit, delete, reorder, 86 toggle) fail silently from client. | Add UPDATE/DELETE policies scoped to brewery_accounts |
| **RQ-3** | `user_achievements` RLS `auth.uid() = user_id` blocks friend achievement feed cards — entire card type missing from Friends tab. | Add `FOR SELECT TO authenticated USING (true)` |

### Data Integrity (Jordan + Avery)
| ID | Finding | Fix |
|----|---------|-----|
| **JA-1** | `wishlists` vs `wishlist` table name in `home/page.tsx:163` — You tab "Want-to-Try" silently empty. | Change to `.from("wishlist")` |
| **JA-2** | Friends DELETE endpoint has no ownership check — any user can delete any friendship by ID. | Add `.or(requester_id.eq.${user.id},addressee_id.eq.${user.id})` |
| **JA-3** | `ReactionBar` receives non-session IDs (achievement, profile, review IDs) as `sessionId` — creates orphaned reaction rows or FK failures. | Disable cheers on non-session cards or add polymorphic target system |

### UI / UX (Casey, Alex, Sam)
| ID | Finding | Fix |
|----|---------|-----|
| **CR-1** | `Button` component uses `motion.button` — the most-used component violates the most explicit ban. Every button affected. | Refactor to `<button>` with inner `<motion.div>` |
| **CR-2** | FriendJoinedCard "Follow" button has no onClick — dead button (banned pattern). | Wire to friend request API or add "Coming soon" badge |
| **CR-3** | DrinkingNow "Cheers" POSTs to `POST /api/notifications` which doesn't exist (only PATCH) — silent 405. | Fix endpoint or create POST handler |
| **ASD-1** | Brewery admin dashboard, sessions page, and QR tent page all use `var(--color-*)` — nonexistent CSS variables. Three entire pages render unstyled. The product we sell is visually broken. | Replace `var(--color-*)` with `var(--*)` across 3 files |
| **ASD-2** | Delete Account button has no onClick handler — dead-end for users. | Add handler or "Coming soon" indicator |
| **ASD-3** | Friends feed still unverified after Sprint 29 FK fix — pushed blind, never confirmed. | Restart dev server, hard reload, confirm feed loads. Day 1 Sprint 30. |

---

## P1 — Must Fix Before Launch (28 unique)

### Architecture / Code Quality
| ID | Finding |
|----|---------|
| JA-4 | Duplicate `timeAgo` function in 5 social card files — `lib/utils.ts` already exports `formatRelativeTime` |
| JA-5 | Duplicate `formatRelativeTime` in both `lib/utils.ts` AND `lib/dates.ts` |
| JA-6 | XP level titles completely different between `lib/xp/index.ts` and `pint-rewind/route.ts` |
| JA-7 | XP calculation values different between `lib/xp` and session-end API — `calculateCheckinXP` is dead code |
| JA-8 | 29x `as any` casts in `home/page.tsx` — zero type safety on most important page |
| JA-9 | `HomeFeed.tsx` is 1305 lines with 6 components in one file |
| JA-10 | `home/page.tsx` is a 362-line monolith with 16 parallel queries |
| JA-12 | DrinkingNow "Cheers" sends `session_cheers` notification type not in `NotificationType` union |
| JA-13 | Race condition in session-end XP — read-modify-write pattern, not atomic |

### Infrastructure
| ID | Finding |
|----|---------|
| RQ-5 | `push_subscriptions` schema vs API column mismatch (`keys jsonb` vs `p256dh`/`auth` columns) — push may be completely broken |
| RQ-6 | `beer_logs.beer_id` is `text` with no FK to `beers` — same class of bug as brewery_id was |
| RQ-7 | `reactions` missing `UNIQUE(user_id, session_id, type)` constraint — duplicate reactions possible |
| RQ-8 | `session_comments.user_id` FK targets `auth.users`, not `profiles` — profile joins may fail |
| RQ-9 | Superadmin stats uses anon client — RLS filters results |

### UI / UX
| ID | Finding |
|----|---------|
| AX-2 | `motion.button` in 4 additional components (FlavorTagPicker, ServingStylePicker, ThemeToggle, AchievementBadge) |
| AX-3 | ~40 files still hardcode `#D4A843` |
| AX-4 | ~30 files hardcode `#0F0E0C` — breaks light/cream theme |
| AX-5 | Mobile bottom nav has no Notifications access — users miss all social activity |
| AX-8 | CheckinEntryDrawer header still says "Check In" (Sprint 15 copy sweep missed it) |
| AX-9 | BreweryCheckinButton still says "Check In Here" |
| SAM-4 | No password reset / forgot password flow |
| SAM-5 | No username uniqueness check on signup |
| SAM-9 | Explore search links to OpenBreweryDB IDs that 404 when clicked |
| SAM-10 | Feed comment counts never passed to SessionCard — ReactionBar comment count always hidden |
| CR-4 | `FullScreenDrawer` missing `role="dialog"`, `aria-modal`, and focus trap — entire checkin flow inaccessible |
| CR-5 | `ReactionBar` error has no toast — cheers count flickers with no explanation |
| T-3 | No upgrade/billing CTA anywhere in brewery admin — zero path from trial to paid |
| J-1 | Brewery dashboard uses `--color-*` prefix in inline styles (3 files) — partially overlaps with ASD-1 |

---

## P2 — Fix Before Public Launch (35 unique)

### Performance
- N+1 queries in session-end achievement checks (up to 32 sequential DB calls)
- N+1 push notification queries (100+ queries with 50 friends)
- Sequential reaction count queries in page.tsx (should be parallel)
- Race condition on `total_checkins` increment

### Brand / Copy
- `/for-breweries` pricing page says "Check-ins" (should be "Sessions")
- `StreakFeedCard` says "check-in streak"
- Landing page still uses "check-in" copy in 3 places
- Profile page says "checked in" instead of "logged"
- Session share page `/session/[id]` heavily hardcoded (10+ instances of `#D4A843`)
- 20 files hardcode `#E8841A` (accent amber) instead of `var(--accent-amber)`

### UX Polish
- `CuratedCollectionsList` cards have cursor-pointer but no action
- No brewery admin first-run onboarding / setup wizard
- No "Claim this brewery" CTA on consumer brewery pages
- Auth signup transitions have no AnimatePresence
- UserAvatar level badge breaks in light theme
- Mobile brewery admin tab strip has no scroll indicator
- Tap list form has no numeric validation for ABV/IBU/price
- Feed uses array index as key instead of unique IDs
- No "Launch Board" in brewery admin quick actions
- No active session count on brewery dashboard
- DrinkingNow "Cheers" button inside Link creates nested interactive elements

### Data / Type Safety
- `Profile` type missing `notification_preferences`, `is_superadmin`, `share_live`
- `Beer` type missing 5 columns from migrations 019-029
- `Brewery` type field mismatch: `brewery_type` vs `type`
- Sessions GET API uses implicit FK join (will break like friends feed did)
- No request body validation — malformed JSON returns unhandled 500
- Missing `push_subscriptions` UPDATE policy
- Hardcoded editorial content in server component (seasonal/curated)

---

## P3 — Nice to Have (10 unique)

- Prop drilling through 4 levels for reaction data (consider React Context)
- `HomeFeed` has 18 props (group into sub-objects)
- Dead `LeaderboardRow.tsx` component (possibly unused)
- `profile.total_checkins` field name (semantic confusion)
- Duplicate RLS policies on `brewery_claims`
- `schema.sql` still defines dropped `checkins` table
- Auth pages hardcode hover colors
- Toast uses `Math.random()` for IDs
- BreweryAdminNav dropdown no outside-click close
- StarRating half-star feature desktop-only (no touch support)

---

## Positive Findings (Things That Are Working Well)

The audit wasn't all bad. The team found significant strengths:

- **HopMark component** — rock solid across all 4 variants and 5 themes
- **Loading/error boundary coverage is 100%** — every route group covered
- **Zero `alert()` or `confirm()` dialogs** in the entire codebase
- **Auth is consistent** on ALL write endpoints
- **Focus trap** works properly in Modal
- **Optimistic updates with rollback** correctly implemented (WishlistButton, ReactionBar, SessionComments, FriendButton)
- **Superadmin and brewery admin routes** properly verify access
- **`/for-breweries` pricing page** is demo-ready with clear tiers
- **Claim flow** works end-to-end with trial messaging
- **Feed cards** are CSS-var native and screenshot-worthy
- **Brewery admin nav** is comprehensive with multi-brewery support
- **Board typography redesign** is beautiful

---

## Sprint 30 Day 1 Priority Actions

### Immediate (one migration fixes 3 RLS P0s)
```sql
-- Migration 034: Fix critical RLS policies
-- 1. Notifications INSERT
CREATE POLICY "Authenticated users can insert notifications"
ON notifications FOR INSERT TO authenticated WITH CHECK (true);

-- 2. Beers UPDATE/DELETE for brewery admins
CREATE POLICY "Brewery admins can update beers" ON beers FOR UPDATE
USING (EXISTS (SELECT 1 FROM brewery_accounts ba
WHERE ba.brewery_id = beers.brewery_id AND ba.user_id = auth.uid()));

CREATE POLICY "Brewery admins can delete beers" ON beers FOR DELETE
USING (EXISTS (SELECT 1 FROM brewery_accounts ba
WHERE ba.brewery_id = beers.brewery_id AND ba.user_id = auth.uid()));

-- 3. User achievements public read
CREATE POLICY "Authenticated users can read achievements"
ON user_achievements FOR SELECT TO authenticated USING (true);
```

### Day 1 Code Fixes
1. Fix `wishlists` → `wishlist` in `home/page.tsx`
2. Fix `var(--color-*)` → `var(--*)` in 3 brewery admin files
3. Add ownership check to friends DELETE endpoint
4. Restart dev server + verify friends feed loads
5. Disable ReactionBar cheers on non-session cards

### Day 1 Verification
- Kill dev server, restart, hard reload, confirm feed populates
- Run `NOTIFY pgrst, 'reload schema';` after migration 034

---

## Team Reports (Full Detail)

| Team | File |
|------|------|
| Alex + Sam + Drew | Consumer UX — 33 findings (5 P0, 15 P1, 13 P2) |
| Jordan + Avery | Architecture — 29 findings (3 P0, 10 P1, 10 P2, 6 P3) |
| Riley + Quinn | Infrastructure — 22 findings (4 P0, 5 P1, 8 P2, 5 P3) |
| Casey + Reese | QA Edge Cases — 30 findings (5 P0, 8 P1, 11 P2, 6 P3) |
| Jamie + Taylor | Brand & Revenue — 20 findings (0 P0, 2 P1, 8 P2, 3 P3) |

---

*Compiled by Sage. Reviewed by Morgan. This is a living document.* 🍺
