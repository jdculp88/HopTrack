# Sprint 31 — Launch Polish

**Date:** TBD (follows Sprint 30)
**Theme:** P1 cleanup, code quality, revenue readiness — get demo-ready and sales-ready
**Source:** Full Team Testing Audit (`docs/sprint-30-testing-audit.md`)
**Depends on:** Sprint 30 (all P0s resolved)
**PM:** Morgan + Sage

---

## Sprint Goal

Sprint 30 made everything work. Sprint 31 makes it beautiful, maintainable, and ready to sell. Code quality sweep, type safety, architecture refactors, and the first revenue-enabling features (billing CTA, brewery onboarding). By end of sprint, we can demo to a brewery owner with confidence.

---

## Architecture & Code Quality

| # | Item | Priority | Owner | Status |
|---|------|----------|-------|--------|
| S31-001 | Generate Supabase types + reduce `as any` casts in `home/page.tsx` (29 → 0) | P1 | Jordan + Quinn | 🔲 |
| S31-002 | Split `HomeFeed.tsx` (1305 lines) into 5+ files: FriendsTab, DiscoverTab, YouTab, OnboardingCard, FeedItemCard | P1 | Avery + Jordan | 🔲 |
| S31-003 | Refactor `home/page.tsx` data fetching — extract into functions, add try/catch, consider caching for community content | P1 | Jordan + Avery | 🔲 |
| S31-004 | Fix `Brewery` type field mismatch (`brewery_type` vs `type`) | P2 | Avery | 🔲 |
| S31-005 | Update `Profile` type — add `notification_preferences`, `is_superadmin`, `share_live` | P2 | Avery | 🔲 |
| S31-006 | Update `Beer` type — add `glass_type`, `price_per_pint`, `display_order`, `is_86d`, `promo_text` | P2 | Avery | 🔲 |
| S31-007 | Fix Sessions GET API — use explicit FK hint `brewery:breweries!brewery_id(...)` | P2 | Avery | 🔲 |
| S31-008 | Add request body validation (try/catch on `request.json()`) across POST endpoints | P2 | Avery | 🔲 |
| S31-009 | Fix superadmin stats — use service role client for admin routes | P1 | Riley | 🔲 |
| S31-010 | Fix feed array index keys → use unique IDs from feed item data | P2 | Avery | 🔲 |
| S31-011 | React Context for reaction data (replace 4-level prop drilling) | P3 | Avery + Jordan | 🔲 |
| S31-012 | Clean up dead code — remove `LeaderboardRow.tsx` if unused, remove checkins from `schema.sql` | P3 | Avery | 🔲 |

---

## Auth & Account

| # | Item | Priority | Owner | Status |
|---|------|----------|-------|--------|
| S31-013 | Add "Forgot password?" link + password reset flow (Supabase Auth) | P1 | Avery + Riley | 🔲 |
| S31-014 | Add username uniqueness check on signup (debounce + API check) | P1 | Avery | 🔲 |
| S31-015 | Add username uniqueness check on settings change | P2 | Avery | 🔲 |
| S31-016 | Auth signup step transitions — add AnimatePresence | P2 | Avery + Alex | 🔲 |
| S31-017 | Link Terms and Privacy Policy on signup page | P2 | Avery | 🔲 |

---

## Revenue & Brewery Admin

| # | Item | Priority | Owner | Status |
|---|------|----------|-------|--------|
| S31-018 | Trial badge + days remaining in BreweryAdminNav sidebar | P1 | Avery + Taylor | 🔲 |
| S31-019 | "Upgrade" CTA in sidebar footer → links to `/brewery-admin/[id]/billing` | P1 | Avery + Taylor | 🔲 |
| S31-020 | Create `/brewery-admin/[id]/billing` page (even if just links to Stripe) | P1 | Avery + Taylor | 🔲 |
| S31-021 | Brewery admin first-run onboarding card — 4-step checklist (Add beers, Create loyalty, Generate QR, Share page) | P2 | Avery + Alex | 🔲 |
| S31-022 | "Are you the owner? Claim this brewery" link on consumer brewery pages | P2 | Avery | 🔲 |
| S31-023 | Fix `/for-breweries` copy — replace "Check-ins" with "Sessions/Visits" | P2 | Jamie + Avery | 🔲 |
| S31-024 | Add "Launch The Board" to brewery admin dashboard Quick Actions | P2 | Avery | 🔲 |
| S31-025 | Tap list form — add numeric validation for ABV/IBU/price fields | P2 | Avery | 🔲 |
| S31-026 | Mobile brewery admin tab strip — add scroll fade/indicator | P2 | Alex + Avery | 🔲 |

---

## UX Polish

| # | Item | Priority | Owner | Status |
|---|------|----------|-------|--------|
| S31-027 | UserAvatar level badge — use CSS vars (fix light theme) | P2 | Avery | 🔲 |
| S31-028 | Session share page `/session/[id]` — replace hardcoded colors with CSS vars | P2 | Avery | 🔲 |
| S31-029 | Landing page "check-in" copy sweep (3 instances) | P2 | Jamie + Avery | 🔲 |
| S31-030 | Profile page "checked in" → "logged" or "poured" | P2 | Avery | 🔲 |
| S31-031 | `aria-label` on social card interactive elements (ReactionBar, DrinkingNow, etc.) | P2 | Avery | 🔲 |
| S31-032 | DrinkingNow "Cheers" button — fix nested interactive elements (button inside Link) | P2 | Avery | 🔲 |
| S31-033 | StarRating half-star on touch devices | P3 | Avery | 🔲 |

---

## Performance

| # | Item | Priority | Owner | Status |
|---|------|----------|-------|--------|
| S31-034 | Optimize session-end achievement checks — batch fetch, single insert | P2 | Quinn + Jordan | 🔲 |
| S31-035 | Optimize push notification loop — batch fetch friend preferences | P2 | Quinn | 🔲 |
| S31-036 | Move reaction count queries into main Promise.all in page.tsx | P2 | Avery | 🔲 |
| S31-037 | Fix `total_checkins` race — atomic increment via RPC (if not done in S30) | P2 | Quinn | 🔲 |

---

## Infrastructure Cleanup

| # | Item | Priority | Owner | Status |
|---|------|----------|-------|--------|
| S31-038 | Remove dead checkins code from seed files (block-commented SQL) | P3 | Quinn | 🔲 |
| S31-039 | Update `schema.sql` — remove `checkins` table definition and references | P3 | Quinn | 🔲 |
| S31-040 | Remove duplicate RLS policies on `brewery_claims` and `profiles` | P3 | Quinn | 🔲 |

---

## Team Assignments

| Team Member | Primary Focus |
|-------------|--------------|
| **Jordan** | Architecture review (HomeFeed split, page.tsx refactor, type unification) |
| **Avery** | Build lead — owns most tickets |
| **Riley + Quinn** | Supabase types generation, service role setup, performance optimization |
| **Alex** | Design review (brewery onboarding card, mobile nav, AnimatePresence) |
| **Casey + Reese** | Full regression after all changes — aim for E2E test suite this sprint |
| **Sam** | Re-walk all user journeys post-Sprint-30 fixes |
| **Drew** | Brewery admin re-test — validate onboarding, billing CTA, tap list |
| **Taylor** | Billing page spec, tier gating strategy, close first brewery |
| **Jamie** | Copy audit (all remaining "check-in" references), marketing page polish |
| **Morgan + Sage** | Sprint coordination, retro, Sprint 32 planning |

---

## Definition of Done (Sprint 31)

- [ ] Zero `as any` on home page data fetching
- [ ] HomeFeed split into 5+ manageable files
- [ ] Password reset flow functional
- [ ] Brewery admin has trial countdown + upgrade CTA
- [ ] Billing page exists (even as placeholder linking to Stripe)
- [ ] First-run brewery onboarding card designed and built
- [ ] All "check-in" copy replaced across entire app + marketing
- [ ] Type definitions match actual database schema
- [ ] N+1 queries in session-end reduced by 80%+
- [ ] Casey gives the sign-off

---

*Sprint 31 — Launch Polish. Make it beautiful, make it sellable, make Taylor happy.* 🍺
