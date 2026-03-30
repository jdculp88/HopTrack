# Sprints 41-50 Master Plan: Make It Crisp

**Author:** Morgan (with Sage)
**Date:** 2026-03-30
**Philosophy:** Polish what we have. Clean, quick, apparent workflows. Crisp and clear. Every page earns its place.

> "We built a lot. Now we make it undeniable." — Morgan

---

## The Principles

1. **No new surfaces** until existing ones are polished
2. **Every page must be visually cohesive** — consistent spacing, typography, information hierarchy
3. **Workflows must be obvious** — a new user should never wonder "what do I do next?"
4. **Data makes the product real** — seed real breweries, real coordinates, real variety
5. **Infrastructure earns trust** — rate limits, E2E tests, edge functions, type safety
6. **Revenue features are product features** — if it helps Taylor close, it ships

---

## Sprint 41 — Crystal Clear
**Theme:** Fix HopRoute, seed real data, page cohesion audit
**Priority:** Make the product work with real data. Every page reviewed for clarity.

| # | Ticket | Owner | P | Notes |
|---|--------|-------|---|-------|
| 001 | Seed 50+ real breweries across 10 US cities with GPS coords | Quinn | P0 | Migration 042. Real names, real coordinates, clustered for HopRoute |
| 002 | Fix migration 041 brewery name mismatches | Quinn | P0 | River Bend Ales, Smoky Barrel Craft Co. — names don't match seed 024 |
| 003 | Apply migrations 040+041 to Supabase remote | Riley | P0 | Carried from S40 retro |
| 004 | Run `NOTIFY pgrst, 'reload schema'` after migrations | Riley | P0 | Carried from S40 retro |
| 005 | Verify HopRoute generates with real brewery data | Avery | P0 | End-to-end: pick city → generate → see route |
| 006 | Seed beers for new breweries (5-8 per brewery, real styles) | Quinn | P1 | Pour sizes, glass types, ABV/IBU — make The Board work for any seeded brewery |
| 007 | Page cohesion audit — consumer app | Alex | P1 | Every page: consistent card radius, spacing, typography, empty states, CTAs |
| 008 | Page cohesion audit — brewery admin | Alex | P1 | Dashboard, analytics, tap list, customers, events, board, QR, billing — unified layout |
| 009 | Navigation clarity — consumer | Alex | P1 | Bottom nav labels, FAB placement, tab indicators, "where am I" confidence |
| 010 | Navigation clarity — brewery admin | Alex | P1 | Sidebar active states, mobile tab strip, section headers |
| 011 | Jordan: `as any` reduction sweep | Jordan | P1 | Target: reduce by 50%+ from current ~178 casts |
| 012 | Streak grace period — wire logic | Avery | P2 | `streak_grace_used_at` field exists (migration 038), needs session-end logic |

**Definition of Done:** HopRoute generates real routes in any seeded city. Every page visually reviewed.

---

## Sprint 42 — Smooth Operator
**Theme:** Workflow polish — make every user action feel intentional and complete
**Priority:** The "new user test" — can someone pick up HopTrack and know exactly what to do?

| # | Ticket | Owner | P | Notes |
|---|--------|-------|---|-------|
| 001 | Onboarding flow redesign — 3-screen welcome (what is HopTrack, start a session, find breweries) | Alex/Avery | P0 | Replace current card with proper full-screen onboarding |
| 002 | Session start flow audit — reduce taps from "I want to drink" to "I'm drinking" | Avery | P1 | Brewery search → start should be 3 taps max |
| 003 | Session recap flow audit — ensure rate/review/share is intuitive | Avery | P1 | No dead ends, clear "Done" action, post-session CTA |
| 004 | Explore page redesign — search-first, map view toggle, distance badges | Alex/Avery | P1 | Make finding a brewery the easiest thing in the app |
| 005 | Brewery detail page audit — info hierarchy, CTA placement, reviews visible | Alex | P1 | Hero → rating → on-tap → events → reviews → leaderboard |
| 006 | Profile page audit — stats visible, achievements prominent, Taste DNA readable | Alex | P1 | |
| 007 | Friends page audit — search/add/manage flow, pending states clear | Avery | P2 | |
| 008 | Settings page audit — organized sections, toggles work, destructive actions gated | Avery | P2 | |
| 009 | Notifications page audit — grouped, actionable, mark-all-read visible | Avery | P2 | |
| 010 | Brewery claim flow polish — make it demo-ready for Taylor | Avery/Taylor | P1 | Carried from feature audit |

**Definition of Done:** A new user can complete signup → explore → start session → end session → view recap → share, with zero confusion.

---

## Sprint 43 — The Dashboard
**Theme:** Brewery admin becomes the sales demo
**Priority:** Every brewery admin page should make an owner say "I need this"

| # | Ticket | Owner | P | Notes |
|---|--------|-------|---|-------|
| 001 | Dashboard home — KPI cards (today's visits, week trend, active sessions, follower count) | Avery | P0 | First thing a brewery owner sees after login |
| 002 | Email/promo to customer segments — "Message your VIPs" | Avery | P0 | Push notification + in-app message to tier segments. No Mailchimp. |
| 003 | Review response from brewery dashboard — owner reply on reviews | Avery | P1 | Migration: `owner_response` + `responded_at` on brewery_reviews |
| 004 | Customers page sort/filter upgrade — by tier, last visit, total spend | Avery | P1 | |
| 005 | Analytics: time-range selector (7d/30d/90d/all) | Avery | P1 | Currently shows all-time only |
| 006 | Tap list: batch actions (86 multiple, reorder by category) | Avery | P2 | |
| 007 | Events: recurring event support (weekly trivia, monthly release) | Avery | P2 | |
| 008 | Billing page: Stripe integration prep (payment intent, subscription model) | Quinn | P2 | Stub the integration, wire when Stripe account ready |
| 009 | Brewery admin mobile responsiveness sweep | Alex | P1 | Every admin page usable on phone |
| 010 | "Weekly Digest" email — wire Resend for real email sending | Quinn | P2 | Digest data endpoint exists, needs email transport |

**Definition of Done:** Taylor can demo the entire brewery admin in 5 minutes and close.

---

## Sprint 44 — Lock It Down
**Theme:** Infrastructure hardening — E2E, rate limits, edge functions
**Priority:** Ship nothing new until the foundation is solid

| # | Ticket | Owner | P | Notes |
|---|--------|-------|---|-------|
| 001 | Playwright E2E: auth flow (signup, login, forgot password, reset) | Reese | P0 | |
| 002 | Playwright E2E: session lifecycle (start, add beer, end, recap) | Reese | P0 | |
| 003 | Playwright E2E: brewery admin (tap list CRUD, analytics view, customers) | Reese | P0 | |
| 004 | Playwright E2E: HopRoute (generate, start, check-in, complete) | Reese | P1 | |
| 005 | Playwright E2E: social (friends, reactions, comments) | Reese | P1 | |
| 006 | Rate limiting expansion — apply to all public GET/POST endpoints | Riley | P0 | `/api/reactions`, `/api/sessions`, `/api/friends`, `/api/feed`, `/api/reviews` |
| 007 | Session-end Edge Function — move heavy logic to Supabase Edge Function | Quinn | P1 | Achievements, XP, push notifications, streak calc |
| 008 | Error monitoring audit — verify Sentry captures all server + client errors | Riley | P1 | |
| 009 | Supabase type generation — `supabase gen types` → `types/supabase.ts` | Quinn | P1 | Enables removing remaining `as any` casts |
| 010 | CI/CD: GitHub Actions — lint, typecheck, Playwright on PR | Riley | P1 | |
| 011 | Migration consolidation plan — document which can be squashed | Quinn | P2 | |

**Definition of Done:** E2E tests pass in CI. Rate limits on all public APIs. Casey signs off.

---

## Sprint 45 — Social Glue
**Theme:** Make the social features sticky — the moat deepens
**Priority:** Every social interaction should feel rewarding

| # | Ticket | Owner | P | Notes |
|---|--------|-------|---|-------|
| 001 | Beer lists UI — create, edit, share, browse others' lists | Avery | P0 | Tables exist (migration 038), need full UI |
| 002 | Beer lists on profile — "My Lists" section with card previews | Avery | P1 | |
| 003 | Beer lists on Discover tab — "Popular Lists" section | Avery | P1 | |
| 004 | Group sessions UI — invite friends to join your session | Avery | P1 | Tables exist (migration 039), need invitation UI + accept flow |
| 005 | Group session feed cards — "Morgan, Jordan, and 2 others at Mountain Ridge" | Avery | P1 | |
| 006 | Brewery leaderboard on The Board — opt-in top visitors on TV display | Avery/Drew | P2 | Drew: "Put this on the TV" |
| 007 | HopRoute social — invite friends to join a planned route | Avery | P2 | |
| 008 | HopRoute explore — browse public completed routes by city | Avery | P2 | |
| 009 | Feed infinite scroll performance audit | Jordan | P2 | Ensure pagination doesn't re-fetch or duplicate |
| 010 | Seasonal/editorial content management — admin UI for Jamie's curated lists | Avery | P3 | Currently hardcoded mock data |

**Definition of Done:** Users can create and share beer lists. Group sessions show on feed. Social features feel alive.

---

## Sprint 46 — Revenue Ready
**Theme:** Close the loop — everything Taylor needs to sell
**Priority:** First paid brewery or full reassessment

| # | Ticket | Owner | P | Notes |
|---|--------|-------|---|-------|
| 001 | Stripe integration — subscription billing (Tap/Cask/Barrel) | Quinn/Avery | P0 | Wire Stripe Checkout + webhooks + portal |
| 002 | Trial → paid conversion flow — 14-day trial ends, upgrade prompt | Avery | P0 | |
| 003 | Case study: auto-generate from brewery data | Sage | P1 | Template exists, wire real metrics pull |
| 004 | "Powered by HopTrack" — make it a link, track clicks | Jamie | P2 | Every Board + QR tent drives traffic |
| 005 | Referral dashboard — see who you've referred, XP earned | Avery | P2 | |
| 006 | Brewery referral program — brewery refers another brewery, both get 1 month free | Taylor/Avery | P2 | |
| 007 | Sales demo mode — toggle in superadmin that populates a brewery with fake demo data | Avery | P2 | Taylor can demo without touching real data |
| 008 | Landing page `/for-breweries` refresh — updated copy, real screenshots, testimonials section | Jamie/Alex | P1 | |
| 009 | App Store metadata refresh — screenshots, description, keywords | Jamie/Alex | P2 | |
| 010 | Pricing page A/B prep — track which tier gets clicked most | Taylor | P3 | |

**Definition of Done:** Stripe processes payments. Trial conversion flow works. Taylor has everything.

---

## Sprint 47 — The Feel
**Theme:** Micro-interactions, animations, and the details that make it feel premium
**Priority:** Make every tap, swipe, and transition feel intentional

| # | Ticket | Owner | P | Notes |
|---|--------|-------|---|-------|
| 001 | Page transitions — AnimatePresence route transitions (subtle fade/slide) | Alex/Avery | P1 | |
| 002 | Pull-to-refresh on feed | Avery | P1 | PWA convention, users expect it |
| 003 | Haptic feedback on key actions (cheers, achievement unlock, session start) | Avery | P1 | Already in cheers, extend to others |
| 004 | Achievement unlock celebration — full-screen confetti + badge reveal | Alex/Avery | P1 | Currently just a card in feed |
| 005 | Loading state polish — skeleton shimmer consistency across all pages | Alex | P2 | |
| 006 | Empty state illustrations — custom SVG illustrations for key empty states | Alex | P2 | "The taps are dry" with art |
| 007 | Dark mode recap option — toggle or auto-detect | Alex/Avery | P2 | Carried from feature audit |
| 008 | Toast notification polish — position, duration, dismiss gesture | Avery | P2 | |
| 009 | Scroll behavior audit — snap points, momentum, rubber band | Alex | P2 | |
| 010 | Accessibility audit — screen reader, keyboard nav, contrast ratios | Sam/Casey | P1 | WCAG 2.1 AA target |

**Definition of Done:** The app feels premium. Every interaction has feedback. Accessibility passes.

---

## Sprint 48 — Smart & Personal
**Theme:** Intelligence layer — recommendations, insights, personalization
**Priority:** Make HopTrack feel like it knows you

| # | Ticket | Owner | P | Notes |
|---|--------|-------|---|-------|
| 001 | Recommendation engine v2 — collaborative filtering (users who liked X also liked Y) | Jordan/Avery | P1 | Current engine is style-based only |
| 002 | "Your Beer DNA" shareable card — visual Taste DNA with personality label | Alex/Avery | P1 | "You're a Hophead" / "Malt Maven" / "Sour Seeker" |
| 003 | Wishlist → Visit planner notifications — "3 beers on your list are on tap nearby" | Avery | P1 | API exists, need push notification trigger |
| 004 | Brewery insights email — weekly "Here's what happened" for brewery owners | Quinn | P1 | Wire Resend, auto-pull metrics |
| 005 | Smart session suggestions — "You usually visit Mountain Ridge on Fridays" | Avery | P2 | |
| 006 | Beer similarity engine — "If you liked this IPA, try..." on beer detail page | Jordan/Avery | P2 | `getSimilarBeers()` exists, needs UI prominence |
| 007 | Seasonal awareness — surface seasonal/limited beers based on time of year | Avery | P2 | |
| 008 | HopRoute AI improvements — better prompts, more personality in route descriptions | Avery | P2 | |
| 009 | Taste DNA evolution — show how your palate has changed over time | Alex/Avery | P3 | Monthly snapshots |
| 010 | Achievement recommendations — "You're 2 sessions away from Stout Season!" | Avery | P3 | |

**Definition of Done:** Recommendations feel personal. Brewery owners get actionable insights.

---

## Sprint 49 — Scale Prep
**Theme:** Production readiness — performance, monitoring, multi-tenant safety
**Priority:** Ready for 100 breweries and 10K users

| # | Ticket | Owner | P | Notes |
|---|--------|-------|---|-------|
| 001 | Database query audit — N+1 detection, index coverage, slow query log | Quinn | P0 | |
| 002 | Image optimization — CDN, lazy loading, WebP conversion | Riley | P1 | |
| 003 | Bundle size audit — code splitting, dynamic imports, tree shaking | Jordan | P1 | |
| 004 | Caching strategy — ISR for public pages, SWR for feed, Redis for hot data | Riley/Jordan | P1 | |
| 005 | Multi-tenant security audit — RLS review, ensure brewery A can't see brewery B data | Casey/Quinn | P0 | |
| 006 | Upstash Redis rate limiting — replace in-memory rate limiter | Quinn | P1 | Current is per-instance, won't work at scale |
| 007 | Monitoring dashboard — Grafana or Supabase dashboard for key metrics | Riley | P2 | |
| 008 | Backup strategy — automated DB backups, point-in-time recovery | Riley | P1 | |
| 009 | Staging environment — separate Supabase project, deploy preview | Riley | P1 | |
| 010 | Load testing — simulate 100 concurrent sessions, 1000 feed loads | Reese | P2 | |

**Definition of Done:** No N+1 queries. RLS audit passes. Staging environment live. Ready for real traffic.

---

## Sprint 50 — Ship It
**Theme:** Launch checklist — the final sprint before we go live
**Priority:** Everything needed for public launch

| # | Ticket | Owner | P | Notes |
|---|--------|-------|---|-------|
| 001 | Launch checklist audit — every item from `docs/launch-checklist.md` green | Morgan/Sage | P0 | |
| 002 | App Store submission (if Apple Dev account ready) | Alex | P0 | |
| 003 | SEO — meta tags, structured data, sitemap, robots.txt | Jamie | P1 | |
| 004 | Analytics — Vercel Analytics or PostHog for user behavior tracking | Riley | P1 | |
| 005 | Legal — finalize ToS, privacy policy, cookie policy | Morgan | P1 | |
| 006 | Social media launch assets — screenshots, video walkthrough, press kit | Jamie | P1 | |
| 007 | Brewery onboarding guide — PDF/video for new brewery signups | Taylor/Sage | P1 | |
| 008 | Support infrastructure — help@hoptrack.beer, FAQ page, in-app help | Sage | P2 | |
| 009 | First 10 brewery outreach campaign — warm intros, Drew's network | Taylor/Drew | P0 | |
| 010 | Launch party planning — Asheville, Drew's taproom, the team, beers | Everyone | P0 | We earned this 🍺 |

**Definition of Done:** App is live. First 10 breweries onboarded. We're going to be rich.

---

## Summary: The Arc

| Sprint | Theme | One-Liner |
|--------|-------|-----------|
| **41** | Crystal Clear | Fix HopRoute, seed real data, visual cohesion |
| **42** | Smooth Operator | Workflow polish, every action intuitive |
| **43** | The Dashboard | Brewery admin becomes the sales weapon |
| **44** | Lock It Down | E2E tests, rate limits, edge functions |
| **45** | Social Glue | Beer lists, group sessions, social depth |
| **46** | Revenue Ready | Stripe, trial conversion, sales tools |
| **47** | The Feel | Micro-interactions, animations, premium UX |
| **48** | Smart & Personal | Recommendations, insights, personalization |
| **49** | Scale Prep | Performance, monitoring, multi-tenant safety |
| **50** | Ship It | Launch checklist, App Store, go live |

---

## Open Feature Tracker (carried from audit)

| Feature | Sprint | Status |
|---------|--------|--------|
| Email/promo to customer segments | S43 | Planned |
| Review response from brewery dashboard | S43 | Planned |
| Streak grace period logic | S41 | Planned |
| Rate limiting expansion | S44 | Planned |
| Session-end Edge Function | S44 | Planned |
| Dark mode recap option | S47 | Planned |
| E2E test expansion | S44 | Planned |
| Migration consolidation | S44 | Planned |
| Brewery claim flow polish | S42 | Planned |
| Beer lists UI | S45 | Planned (tables exist) |
| Group sessions UI | S45 | Planned (tables exist) |
| Brewery leaderboard on Board | S45 | Planned |
| Stripe integration | S46 | Planned |
| Resend email integration | S43 | Planned |

---

*"We built the dream. Now we make it undeniable."* — Morgan

*This is a living document.* 🍺
