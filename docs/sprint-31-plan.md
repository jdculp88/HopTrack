# Sprint 31 — Launch Polish

**Date:** 2026-03-29 (follows Sprint 30)
**Theme:** Launch Polish — code quality, auth hardening, revenue readiness, demo confidence
**Source:** Sprint 30 deferred items + Full Team Testing Audit (`docs/sprint-30-testing-audit.md`)
**Depends on:** Sprint 30 (all P0s resolved, migrations 034+035 created)
**PM:** Morgan + Sage

---

## Sprint Goal

Sprint 30 made everything work. Sprint 31 makes it maintainable, secure, and sellable. We apply the last two migrations, split the 1242-line HomeFeed monolith, ship password reset and username validation, add the billing CTA that Taylor needs to close, and give Casey real E2E tests to run. By end of sprint, we can hand a brewery owner a login and walk away confident.

---

## Session 1 — Infrastructure + Migrations (Day 1)

*"Apply the fixes we wrote last sprint, generate real types, make the foundation solid."*

| # | Item | Priority | Owner | AC |
|---|------|----------|-------|----|
| S31-001 | Apply migration 034 to remote (`supabase db push`) — 3 RLS fixes (notifications INSERT, beers UPDATE/DELETE, user_achievements SELECT) | P0 | Riley + Quinn | Migration applied, `NOTIFY pgrst, 'reload schema';` run, verified in Supabase dashboard |
| S31-002 | Apply migration 035 to remote — reactions UNIQUE, beer_logs.beer_id text->uuid FK, push_subscriptions UPDATE | P0 | Riley + Quinn | Migration applied, PGRST reloaded, no errors in Supabase logs |
| S31-003 | Generate Supabase types (`supabase gen types typescript`) + reduce `as any` casts in `home/page.tsx` (29 casts -> 0) | P1 | Jordan + Quinn | `types/supabase.ts` generated, `page.tsx` uses typed client, zero `as any` on data-fetching lines |
| S31-004 | Fix superadmin stats — use service role client for admin routes (currently uses anon client, misses RLS-blocked data) | P1 | Riley | Superadmin dashboard shows accurate user/brewery/session counts |

---

## Session 2 — Architecture Refactors

*"Break the monoliths into pieces Jordan can actually review."*

| # | Item | Priority | Owner | AC |
|---|------|----------|-------|----|
| S31-005 | Split `HomeFeed.tsx` (1242 lines) into 5+ files: `FriendsTabContent.tsx`, `DiscoverTabContent.tsx`, `YouTabContent.tsx`, `OnboardingCard.tsx`, `FeedItemCard.tsx` | P1 | Avery + Jordan | Each file < 300 lines, HomeFeed.tsx is a thin orchestrator (~150 lines), all imports work, no visual regression |
| S31-006 | Refactor `home/page.tsx` data fetching (337 lines, 16 parallel queries) — extract query functions into `lib/queries/feed.ts`, add try/catch per query, consider ISR caching for community content (BOTW, events, trending) | P1 | Jordan + Avery | `page.tsx` < 100 lines, query errors don't crash the whole feed, stale community content handled gracefully |
| S31-007 | React Context for reaction data — replace 4-level prop drilling (`page.tsx` -> `HomeFeed` -> `TabContent` -> `SessionCard`) with `ReactionProvider` | P2 | Avery + Jordan | `reactionCounts` and `userReactions` consumed via `useReactions()` hook, prop chain eliminated |
| S31-008 | Fix feed array index keys -> use unique IDs from feed item data (React key warning fix) | P2 | Avery | Zero React key warnings in console on feed load |

---

## Session 3 — Auth & Account Security

*"No one should be able to sign up with someone else's username."*

| # | Item | Priority | Owner | AC |
|---|------|----------|-------|----|
| S31-009 | Password reset flow — "Forgot password?" link on login, Supabase `resetPasswordForEmail`, `/auth/reset-password` page with new password form | P1 | Avery + Riley | User clicks "Forgot password?", receives email, clicks link, sets new password, logs in successfully |
| S31-010 | Username uniqueness check on signup — debounced API call to `/api/users/check-username`, inline "taken" / "available" feedback | P1 | Avery | Signup form shows red "Username taken" within 500ms of typing, blocks submit if taken |
| S31-011 | Username uniqueness check on settings change — same pattern as signup | P2 | Avery | Settings username field validates uniqueness before save, shows inline error |
| S31-012 | Auth signup step transitions — AnimatePresence between signup form steps | P2 | Avery + Alex | Steps slide in/out smoothly, no layout shift |
| S31-013 | Link Terms of Service and Privacy Policy on signup page | P2 | Avery | Links to `/terms` and `/privacy` visible below signup button |

---

## Session 4 — Revenue & Brewery Admin

*"Taylor needs a billing page to point breweries at."*

| # | Item | Priority | Owner | AC |
|---|------|----------|-------|----|
| S31-014 | Trial badge + days remaining in BreweryAdminNav sidebar — show "14-day trial" with countdown | P1 | Avery + Taylor | Badge shows "X days left" based on `brewery.created_at`, gold badge styling |
| S31-015 | "Upgrade" CTA in sidebar footer -> links to `/brewery-admin/[id]/billing` | P1 | Avery + Taylor | CTA visible on every brewery admin page, links correctly |
| S31-016 | Create `/brewery-admin/[id]/billing` page — tier comparison (Tap $49 / Cask $149 / Barrel custom), "Contact us" for Barrel, placeholder Stripe link for Tap/Cask | P1 | Avery + Taylor | Page renders tier cards, CTAs work, Drew validates it makes sense operationally |
| S31-017 | Brewery admin first-run onboarding card — 4-step checklist (Add beers, Create loyalty program, Generate QR tents, Share brewery page), dismissible, persisted to localStorage | P2 | Avery + Alex | Card shows on first visit, steps link to correct pages, dismiss persists across sessions |
| S31-018 | "Claim this brewery" CTA on consumer brewery pages (for unclaimed breweries) | P2 | Avery | CTA visible on brewery detail page when brewery has no `brewery_accounts` entries, links to claim flow |
| S31-019 | Fix `/for-breweries` copy — replace remaining "Check-ins" with "Sessions/Visits" | P2 | Jamie + Avery | Zero "check-in" on marketing pricing page |
| S31-020 | Tap list form — add numeric validation for ABV (0-100), IBU (0-200), price (0-999) fields | P2 | Avery | Non-numeric input rejected, out-of-range shows inline error |

---

## Session 5 — Performance & Feed Polish

*"Kill the N+1s, ship infinite scroll, make the feed fast."*

| # | Item | Priority | Owner | AC |
|---|------|----------|-------|----|
| S31-021 | XP atomic increment via Supabase RPC — `increment_xp(user_id, amount)` function, replaces read-then-write in session-end API | P1 | Quinn + Jordan | RPC created, session-end calls it, concurrent session ends don't lose XP |
| S31-022 | Optimize session-end achievement checks — batch fetch user's existing achievements in single query, single INSERT for new ones | P2 | Quinn + Jordan | Session-end makes 2 achievement queries max (was N+1 per achievement type) |
| S31-023 | Optimize push notification loop — batch fetch friend push preferences + subscriptions in single query | P2 | Quinn | Push notification send makes 1 query for all friends (was 1 per friend) |
| S31-024 | Feed infinite scroll / pagination — load 20 sessions initially, fetch next page on scroll to bottom, loading spinner at bottom | P2 | Avery | Feed loads first 20, scrolling to bottom fetches next 20, no full page reload |
| S31-025 | Move reaction count queries into main `Promise.all` in page.tsx (currently sequential after session queries) | P2 | Avery | Reaction counts fetched in parallel with sessions, not after |

---

## Session 6 — UX Polish & Type Safety

*"The last 5% that makes it feel professional."*

| # | Item | Priority | Owner | AC |
|---|------|----------|-------|----|
| S31-026 | Update `Profile` type — add `notification_preferences`, `is_superadmin`, `share_live` fields | P2 | Avery | Type matches DB schema, no more `as any` on profile fields |
| S31-027 | Update `Beer` type — add `glass_type`, `price_per_pint`, `display_order`, `is_86d`, `promo_text` | P2 | Avery | Type matches DB schema |
| S31-028 | Fix `Brewery` type field mismatch (`brewery_type` vs `type`) | P2 | Avery | Consistent field name across types and queries |
| S31-029 | UserAvatar level badge — use CSS vars for badge colors (fix light theme rendering) | P2 | Avery | Badge visible and readable in both dark and light themes |
| S31-030 | Session share page `/session/[id]` — replace hardcoded colors with CSS vars | P2 | Avery | Share page respects theme, no hardcoded hex values |
| S31-031 | `aria-label` on social card interactive elements (ReactionBar, DrinkingNow cheers, share buttons) | P2 | Avery | All interactive elements have descriptive aria-labels |
| S31-032 | DrinkingNow "Cheers" button — fix nested interactive elements (button inside Link) | P2 | Avery | No nested `<button>` inside `<a>`, uses `stopPropagation` or restructured markup |
| S31-033 | Mobile brewery admin tab strip — add horizontal scroll fade indicator | P2 | Alex + Avery | Fade gradient visible when tabs overflow on mobile |

---

## Session 7 — E2E Tests & Infra Cleanup

*"Casey, it's finally happening."*

| # | Item | Priority | Owner | AC |
|---|------|----------|-------|----|
| S31-034 | Playwright E2E test suite — install, configure, write tests for: login, start session, log beer, end session, view feed | P1 | Casey + Reese | `npx playwright test` passes 5+ core flow tests, CI-ready config |
| S31-035 | E2E: brewery admin flow — login as brewery owner, edit tap list, view analytics, launch Board | P2 | Casey + Reese | 3+ brewery admin tests passing |
| S31-036 | Remove dead checkins code from seed files (block-commented SQL in seeds 003, 006, 007) | P3 | Quinn | Zero references to `checkins` table in any seed file |
| S31-037 | Update `schema.sql` — remove `checkins` table definition and references | P3 | Quinn | Schema file reflects actual DB state |
| S31-038 | Remove duplicate RLS policies on `brewery_claims` and `profiles` (if any exist) | P3 | Quinn | No duplicate policy names in migration history |

---

## Deferred to Sprint 32

### Not in scope for Sprint 31
- HomeFeed prop grouping (18 props -> 4 sub-objects) — do after Context refactor
- StarRating half-star support on touch devices (P3)
- Toast ID collision fix (P3)
- BreweryAdminNav outside-click close (P3)
- Staging Supabase project (Riley — needs budget approval)
- Email integration via Resend (depends on staging infra)
- App Store / TestFlight submission (blocked on Apple Developer account)
- Migration consolidation (028+029) — Riley, lower priority now that they're applied

---

## Team Assignments

| Team Member | Primary Focus |
|-------------|--------------|
| **Riley + Quinn** | Day 1: apply migrations 034+035 + PGRST reload. Then: Supabase types generation, service role setup, XP RPC, N+1 optimization, infra cleanup |
| **Jordan** | Architecture review on HomeFeed split + page.tsx refactor. Type unification. XP RPC design. Code review everything |
| **Avery** | Build lead — owns 25+ tickets. HomeFeed split, auth flows, billing page, feed scroll, type updates, UX polish |
| **Alex** | Design review: brewery onboarding card, mobile nav scroll indicator, signup AnimatePresence, billing page layout |
| **Casey + Reese** | Playwright E2E setup + 8+ test cases. Full regression after HomeFeed split. This is the sprint. No more carries |
| **Sam** | Re-walk all user journeys post-Sprint-30. Validate password reset, username check, billing page UX |
| **Drew** | Brewery admin validation — onboarding card, billing page, tap list validation, Board launch from dashboard |
| **Taylor** | Billing page spec (tier features, Stripe integration plan), trial countdown logic, close first brewery |
| **Jamie** | Copy audit: all remaining "check-in" references in marketing pages, `/for-breweries` page polish |
| **Morgan + Sage** | Sprint coordination, daily standups, retro planning, Sprint 32 pre-planning |

---

## Ticket Summary

| Priority | Count | Focus |
|----------|-------|-------|
| P0 | 2 | Apply migrations 034+035 (Day 1 blocker) |
| P1 | 12 | Types, HomeFeed split, auth flows, billing, XP RPC, E2E tests |
| P2 | 19 | UX polish, type safety, performance, onboarding, feed scroll |
| P3 | 5 | Dead code cleanup, infra housekeeping |
| **Total** | **38** | |

---

## Definition of Done (Sprint 31)

- [ ] Migrations 034+035 applied to remote, PGRST reloaded
- [ ] Zero `as any` on home page data fetching
- [ ] HomeFeed.tsx split into 5+ files, each < 300 lines
- [ ] Password reset flow works end-to-end (email -> reset -> login)
- [ ] Username uniqueness validated on signup and settings
- [ ] Brewery admin has trial countdown + "Upgrade" CTA in sidebar
- [ ] Billing page exists with tier comparison cards
- [ ] First-run brewery onboarding card built
- [ ] All "check-in" copy replaced across entire app + marketing
- [ ] Type definitions match actual database schema
- [ ] XP increment is atomic (no race conditions)
- [ ] N+1 queries in session-end reduced by 80%+
- [ ] Feed supports infinite scroll (20 sessions per page)
- [ ] Playwright installed with 8+ passing E2E tests
- [ ] Casey gives the sign-off

---

## Verification Checklist

- [ ] `supabase gen types typescript` generates clean types
- [ ] Home feed loads with no `as any` casts
- [ ] HomeFeed split: `FriendsTabContent`, `DiscoverTabContent`, `YouTabContent` render correctly
- [ ] Forgot password email sends and reset works
- [ ] Duplicate username blocked on signup with inline error
- [ ] Brewery admin sidebar shows trial days remaining
- [ ] `/brewery-admin/[id]/billing` renders tier cards
- [ ] Brewery onboarding card shows on first visit, dismisses permanently
- [ ] `npx playwright test` passes all core flow tests
- [ ] Session-end XP uses RPC (check network tab or DB logs)
- [ ] Feed loads 20 sessions, scroll loads 20 more
- [ ] Zero console errors on feed, brewery admin, and auth pages
- [ ] Light theme: UserAvatar badge visible, session share page correct
- [ ] Mobile: brewery admin tabs scroll with fade indicator

---

*Sprint 31 — Launch Polish. Make it maintainable, make it sellable, make Taylor happy.* 🍺
