# HopTrack Q3 2026 Roadmap Research
**Authors:** Morgan (Program Manager), Sam (Business Analyst), Jordan (CTO)
**Date:** 2026-04-04
**Sprint:** Post-Sprint 154
**Predecessor:** `docs/plans/roadmap-research-2026-q2.md` (Pre-Sprint 74)

> This document captures deep competitive research, compliance analysis, platform modernization opportunities, feature gap assessment, and proposed sprint arcs to guide HopTrack's product roadmap for Q3 2026 and beyond. It is NOT a sprint plan. It is the research that sprint plans will be built from.
>
> This is a living document.

---

## 1. Executive Summary

HopTrack has shipped 154 sprints across a 16-person team. The product is feature-rich on both the consumer and brewery sides: sessions, achievements, social feed, loyalty, challenges, AI recommendations, full brewery dashboard with analytics, CRM, POS integration, brand multi-location management, and a comprehensive superadmin command center. We have 1,334 unit tests, 87 E2E tests, and zero known bugs (KNOWN section has been empty since Sprint 147).

**Where we stand today:**
- Product is pre-revenue. LLC formation and Stripe live keys remain Joshua's only hard blocker.
- Launch checklist is 67% complete (up from 44% at Q2 research time).
- 7,177 US breweries seeded, 2,361 beers cataloged, zero paying customers.
- Untappd for Business now charges $899-$1,199/year. We are positioned at Tap $588/yr, Cask $1,788/yr, Barrel custom.
- The craft beer market is stabilizing after contraction. Taproom experiences, non-alcoholic options, and technology adoption are growing.
- 20 US state privacy laws will be in effect or enforceable by end of 2026.

**The honest assessment:**
Since the Q2 research, we have closed every major product gap identified: brand management, billing, AI features, testing infrastructure, production hardening, and revenue readiness materials. The product itself is launch-ready. What follows is a forward-looking analysis of where the product needs to go AFTER first revenue -- the features, compliance requirements, and platform investments that will define Q3 and beyond.

**Key themes for Q3 2026:**
1. **Compliance hardening** -- age verification, expanded privacy compliance, FTC review guidelines, accessibility audit
2. **Consumer stickiness** -- the features that make users come back daily, not weekly
3. **Brewery value deepening** -- analytics and tools that justify the subscription price
4. **Platform modernization** -- leveraging Next.js 16, React 19.2, and Supabase capabilities we are not yet using

---

## 2. Competitive Landscape (Updated April 2026)

### 2.1 Untappd -- The Incumbent

**Current state (April 2026):**
- Still the dominant consumer beer social network with 9M+ registered users
- Expanded beyond beer in October 2025: now supports cider, mead, wine, sake, RTD cocktails, spirits, THC drinks, non-alcoholic beverages -- 900+ total drink categories (up from 450 beer styles)
- Untappd for Business: $899/yr (Essentials) and $1,199/yr (Premium)
- Added website builder for businesses (launched February 2025)
- Premium tier includes Beer Distribution Stats Dashboard (venue-level performance across verified/unverified locations)
- POS integrations with Toast, Square, and GoTab
- New app icon rolling out in early 2026
- "Recappd" 2025 year-in-review with faction-based missions and leaderboards

**Where Untappd remains vulnerable:**
- Repeated price increases continue to drive brewery owners to alternatives
- No loyalty program functionality -- still zero loyalty features after all these years
- Consumer privacy complaints persist (Trustpilot reports of data sharing, inability to delete accounts)
- Display reliability issues (digital menus failing on smart TV browsers)
- Customer service is email-only, often taking a week or more to respond
- PE ownership (Next Glass) continues to prioritize extraction over innovation
- Non-beer categories require the $1,199/yr Premium tier

**Our advantage over Untappd:**
- Full loyalty system (stamp cards, mug clubs, brand-wide loyalty, redemption codes)
- Customer messaging and CRM
- Challenges and gamification tied to brewery visits
- Multi-location brand management
- AI-powered promotion suggestions
- Significantly lower entry price ($49/mo vs $899/yr)
- Privacy-first design (cookie consent, data deletion, GDPR/CCPA assessment done)

**Our disadvantage vs Untappd:**
- Zero consumer base (they have 9M+ users and massive network effects)
- Smaller beer database (2,361 vs 3M+ beverages)
- No distribution analytics (their Premium dashboard tracks beer performance across venues)
- No native mobile app (PWA only; they have native iOS and Android)

**Strategic takeaway:** Untappd's expansion beyond beer signals they see the ceiling on beer-only check-ins. Their loyalty gap remains our biggest differentiator. Their price increases create ongoing acquisition opportunities with brewery owners.

### 2.2 Brewery-Facing Tools

| Competitor | Focus | Price | 2026 Update | HopTrack Edge |
|---|---|---|---|---|
| **Untappd for Business** | Menu + analytics + website builder | $899-$1,199/yr | Website builder, distribution dashboard, 900 categories | Loyalty, CRM, messaging, challenges, lower price |
| **Evergreen (fka TapHunter)** | Beverage program management | Custom | 300K+ item database, nutritional labeling, inventory management | Consumer app, social features, brand management |
| **Arryved** | POS + brewery management | Custom | Tapwyse partnership for custom-branded apps, QR payments, production visibility | Not a POS competitor -- complementary integration |
| **BeerMenus** | Digital menu management | $599/yr max | Never raised prices on existing customers, beer + wine + spirits database | Full platform vs menu-only, loyalty, analytics |
| **Taplist.io** | TV + web menus | $49-59/mo | POS sync, multi-location, up to 4 TVs on Pro plan | Full consumer platform, loyalty, CRM |
| **DigitalPour** | POS-driven menus | Custom | POS integration focus, inventory tracking, reporting | Consumer side, modern web stack |
| **Pourwall** | Free digital draft menus | Free | Minimal feature set, single screen on free tier | Everything |
| **BeerMS** | Custom digital menus | $350/yr | Simple, affordable | Full platform vs menu-only |
| **GoTab** | POS + ordering | Custom | Strong brewery POS, ordering, tab management | Not a POS competitor -- integration target |
| **Toast** | Restaurant POS | Varies | Flight builders, keg tracking, mobile ordering, loyalty, email marketing, 10% revenue lift from mobile ordering | Integration target, not direct competitor |
| **Square** | POS + loyalty | Varies | Square Loyalty built-in, robust ecosystem | Integration target |

**Emerging threat -- Arryved + Tapwyse:** Arryved's partnership with Tapwyse to offer custom-branded mobile apps for breweries is worth monitoring. If a brewery can get a branded app with POS, loyalty, and push notifications all in one, that is a direct threat to our value proposition.

### 2.3 Consumer Beer Apps

| App | Focus | Status |
|---|---|---|
| **Untappd** | Beer check-in + social | Dominant, expanding to all beverages |
| **RateBeer** | Beer ratings/reviews | Niche, still active |
| **BreweryDB** | Brewery discovery + road trips | BrewRoutes feature for planning |
| **Brewfather** | Homebrewing | Different market segment |
| **Beerspotting** | Social beer tasting | Small, community-focused |

**Key finding:** No serious new entrant has challenged Untappd on the consumer beer social front since our Q2 research. The market is still Untappd-dominated with fragmented niche alternatives. This is both a risk (network effects are real) and an opportunity (one strong competitor means dissatisfied users have nowhere to go -- until we give them somewhere).

### 2.4 Table Stakes Features (2026)

**For beer check-in apps:**
- Check-in with rating and notes
- Beer database search
- Social feed (friends' activity)
- Badges/achievements
- Venue/brewery discovery with map
- Personal stats and year-in-review
- Non-beer beverage support (new in 2025-2026)

**For brewery management tools:**
- Digital menu management (TV, web, QR, print)
- POS integration (Toast, Square at minimum)
- Basic analytics (visits, popular items, revenue)
- Loyalty program
- Customer messaging/email
- Multi-location support
- Online ordering or link to ordering
- Website builder or embeddable widget

**HopTrack coverage:** We hit all consumer table stakes. On the brewery side, we cover everything except website builder and online ordering.

---

## 3. Compliance and Legal Analysis

### 3.1 Age Verification

**Current HopTrack state:** No age verification beyond app store ratings and self-reported date of birth during signup.

**Federal landscape:**
- The National Minimum Drinking Age Law (1984) conditions federal highway funding on states setting 21 as minimum drinking age
- TTB regulates alcohol advertising but does not mandate age-gating for apps that do not sell alcohol directly
- HopTrack does not sell alcohol, so TTB direct sales regulations do not apply

**State app store age verification laws (new, critical):**
- **Utah** App Store Accountability Act: developer obligations effective May 6, 2026
- **Texas** App Store Accountability Act: scheduled for January 1, 2026 (currently enjoined by federal court)
- **Louisiana** App Store Accountability Act: effective July 1, 2026
- **California**: similar legislation effective January 1, 2027
- These laws establish age categories (child/young teenager/older teenager/adult) and require app stores to obtain parental consent for minors
- App developers must have processes to silo age verification data and delete it after use

**Recommendation:**
- **P1 (Pre-launch):** Add date-of-birth age gate on signup flow (must be 21+ to create account). This is the bare minimum for an alcohol-related app.
- **P2 (Post-launch):** Implement age verification API integration for App Store compliance when we publish native apps
- **P2:** Document and enforce data siloing for any age verification data collected
- **P3:** Monitor Alabama, Florida, New York, and Ohio legislation for additional state requirements

### 3.2 GDPR / CCPA / State Privacy

**Current HopTrack state:** Cookie consent implemented (Sprint 77), GDPR/CCPA assessment documented (Sprint 151), privacy page updated with California Residents section, delete account functionality exists.

**2026 compliance landscape:**
- 20 US state comprehensive privacy laws will be in effect or enforceable by end of 2026
- Oregon (effective January 1, 2026): stricter limits on precise geolocation data, youth data, targeted ads to minors
- CCPA enhanced requirements (January 1, 2026): automated decision-making rules, mandatory opt-out confirmations
- March 2025 FTC investigative sweep targeted geolocation data collection specifically
- GDPR remains relevant for any EU users (opt-in model, stricter than US)

**Location data risks (HIGH PRIORITY):**
- HopTrack collects session-level geolocation (brewery check-ins)
- Location data is explicitly called out in multiple state laws as high-risk
- Oregon 2026 updates impose stricter limits on geolocation-based marketing
- FTC enforcement climate is described as the most aggressive in US privacy history

**Recommendations:**
- **P1:** Implement explicit opt-in for location data collection (not just browser permission -- in-app consent flow explaining what we collect and why)
- **P1:** Add "Do Not Sell or Share My Personal Information" link per CCPA requirements
- **P1:** Implement data retention policy (auto-purge location data older than N months, configurable)
- **P2:** Add Universal Opt-Out Mechanism support (Global Privacy Control signal detection)
- **P2:** Conduct data mapping exercise to document all personal data flows
- **P3:** Implement automated data deletion pipeline for user requests (currently manual via delete account)

### 3.3 Accessibility (WCAG 2.1 AA / Section 508)

**Current HopTrack state:** Skip-to-content link (Sprint 56), ARIA audit completed (Sprint 56), color contrast bumped to WCAG AA (Sprint 56), focus traps in modals, viewport WCAG 1.4.4 fix (Sprint 154).

**2026 requirements:**
- ADA Title II now references WCAG 2.1 Level AA (not just 2.0) -- simply conforming to Section 508 is no longer sufficient
- Large public entities compliance deadline: April 24, 2026
- EN 301 549 V4.1.1 (planned 2026) will incorporate WCAG 2.2 AA requirements
- WCAG 3.0 is in development (expected 2026+)
- Mobile app accessibility requirements apply to our PWA

**Gap assessment (HopTrack vs WCAG 2.1 AA):**
- Keyboard navigation: partially done (modals and drawers have focus traps)
- Screen reader support: ARIA roles added in Sprint 56 but no comprehensive audit since then (38+ sprints ago)
- Touch target sizes: 44px minimum implemented in Sprint 43 but not verified across new components
- Color contrast: verified for text in Sprint 56 but not for interactive elements, icons, or chart data
- Motion: `prefers-reduced-motion` respected via MotionConfig but no audit of all animation paths
- Form labels: FormField component exists but not universally adopted

**Recommendations:**
- **P1:** Conduct full WCAG 2.1 AA audit against current codebase (38 sprints of new components since last audit)
- **P1:** Verify all interactive elements meet 44px touch target minimum
- **P2:** Screen reader testing pass with VoiceOver (iOS) and TalkBack (Android)
- **P2:** Audit all Recharts visualizations for accessibility (alt text, keyboard navigation, color-only information)
- **P3:** Begin evaluating WCAG 2.2 AA new success criteria (focus appearance, dragging movements, consistent help)

### 3.4 FTC Consumer Review Guidelines

**Current HopTrack state:** Users can rate beers and breweries. No moderation queue. No disclosure requirements for incentivized reviews.

**2026 FTC rules (critical):**
- The FTC Consumer Review and Testimonials Rule took effect October 21, 2024
- Civil penalties up to $51,744 PER VIOLATION
- Prohibited: procuring, suppressing, boosting, or editing reviews in ways that distort consumer perception
- Prohibited: fake reviews (human or AI-generated), reviews from nonexistent individuals
- FTC sent warning letters to companies in December 2025 for potential violations
- Any incentivized reviews (loyalty points for reviews, XP for ratings) must be clearly disclosed

**HopTrack exposure:**
- We award XP for beer ratings -- this could be construed as incentivized reviews
- No disclosure that ratings contribute to XP
- No review moderation system
- Brewery owners can respond to reviews but cannot edit or suppress them (good)

**Recommendations:**
- **P0:** Add disclosure on rating UI: "You earn XP for rating beers" or similar transparent language
- **P1:** Implement review moderation queue (reported reviews, inappropriate content filtering)
- **P1:** Ensure brewery owner responses cannot suppress or hide negative reviews
- **P2:** Add "Was this review helpful?" voting (authentic engagement, not manipulation)
- **P2:** Document review integrity policy (what constitutes a legitimate review, grounds for removal)

### 3.5 Alcohol Advertising Regulations

**Current HopTrack state:** Brewery owners can create promotions and send messages to customers. No age verification on promotional content.

**2026 regulatory landscape:**
- TTB regulates alcohol advertising. Digital apps, QR codes, and mobile placements are explicitly covered.
- Beer Institute updated Advertising and Marketing Code effective January 1, 2026: modernized audience targeting requirements, extended to non-alcohol products, digital media standards for brewer-owned channels
- State laws vary widely: some restrict pricing claims, limit promotion timing, or impose proximity rules (500 feet from schools/churches)
- Meta (Facebook/Instagram) requires 21+ age verification, geofencing, and prohibits excessive drinking content in alcohol ads

**HopTrack exposure:**
- Brewery promotions and ad campaigns (F-028, Sprint 93) function as advertising
- No age verification gate on promotional content display
- No state-specific compliance checks for promotion content
- No responsible consumption messaging

**Recommendations:**
- **P1:** Add responsible drinking disclaimer to promotion display ("Must be 21+. Drink responsibly.")
- **P2:** Implement promotion content guidelines for brewery owners (no health claims, no targeting minors, no excessive consumption messaging)
- **P2:** Add promotion scheduling restrictions (respect state happy hour laws where applicable)
- **P3:** State-by-state promotion compliance engine (long-term, when operating at scale)

### 3.6 Data Retention and Location Data

**Current HopTrack state:** No formal data retention policy. Session location data stored indefinitely.

**Recommendations:**
- **P1:** Define and implement data retention schedule:
  - Session location data: retain precise GPS for 90 days, then aggregate to city/state level
  - Notification data: purge after 90 days
  - Analytics data: retain aggregated indefinitely, purge individual-level after 12 months
  - Deleted account data: hard delete within 30 days
- **P1:** Implement automated data lifecycle management (cron job for purging)
- **P2:** Create data retention policy page (public-facing, linked from privacy policy)

---

## 4. Platform Modernization Opportunities

### 4.1 Next.js 16 Features We Should Leverage

**Currently using:** Next.js 16.2.1 with App Router, Turbopack (stable as of 16.0).

**Available but not yet adopted:**

| Feature | Description | HopTrack Use Case | Priority |
|---|---|---|---|
| **"use cache" directive** | Explicit caching for pages, components, and functions | Cache brewery detail pages, beer search results, analytics dashboards | P1 |
| **View Transitions API** | Native page transition animations (React 19.2) | Smooth tab switches, page navigations -- replace some Framer Motion usage | P2 |
| **React Compiler (stable)** | Automatic memoization, eliminates manual useMemo/useCallback | Already partially active; enable fully, remove manual memos | P2 |
| **Layout deduplication** | Shared layouts downloaded once when prefetching multiple URLs | Already benefits us via App Router -- verify it is working | P3 |
| **Turbopack File System Caching** | Persistent dev cache across restarts (16.1) | Faster local development | P2 |
| **DevTools MCP** | AI-assisted debugging integration | Developer experience improvement | P3 |

**Recommendations:**
- **P1:** Adopt "use cache" directive on heavy data pages (brewery detail, beer search, analytics, Command Center)
- **P2:** Evaluate View Transitions for tab switching and page navigation (could replace AnimatePresence in some cases, reducing bundle)
- **P2:** Fully enable React Compiler and audit for manual memoization that can be removed

### 4.2 React 19.2 Features

**Currently using:** React 19 (via Next.js 16.2.1).

| Feature | Use Case | Priority |
|---|---|---|
| **Activity component** | Render "hidden" parts of UI in background (preload tabs, keep state) | P2 -- useful for brewery admin tab preloading |
| **useFormStatus** | Real-time form submission status | P2 -- replace manual isSubmitting state |
| **Async transitions** | Handle pending states automatically | P2 -- simplify mutation loading states |
| **View Transitions** | CSS-based page transitions | P2 -- see Next.js 16 section above |

### 4.3 Supabase Realtime

**Currently using:** Standard Supabase queries. No Realtime channels.

**Available capabilities:**
- **Broadcast:** Low-latency ephemeral messages between clients (sub-100ms)
- **Presence:** Track who is online, who is viewing what
- **Postgres Changes:** Subscribe to database changes in real-time
- **Authorization:** Fine-grained channel access control

**HopTrack use cases (HIGH VALUE):**
- **Live tap list updates:** Brewery updates tap list, all viewers see changes instantly (Postgres Changes)
- **"Drinking Now" presence:** Show which friends are currently at a brewery (Presence)
- **Real-time session companions:** See who joined your group session live (Presence + Broadcast)
- **Live Command Center:** Superadmin sees sessions, claims, and activity in real-time (Postgres Changes)
- **Brewery dashboard live counters:** "Active sessions" and "Visitors today" update without polling (Presence)
- **Real-time notification delivery:** Push notifications arrive instantly without polling (Broadcast)

**Recommendations:**
- **P1:** Implement Realtime for tap list updates (biggest brewery value -- "your menu is always current")
- **P1:** Implement Presence for "Drinking Now" feature (biggest consumer social value)
- **P2:** Live Command Center updates for superadmin
- **P2:** Real-time notification delivery
- **P3:** Group session live companion tracking

### 4.4 Supabase Edge Functions

**Currently using:** Edge Functions for some computation. Background tasks up to 400 seconds on paid plans.

**New capabilities (2025-2026):**
- `EdgeRuntime.waitUntil()` for guaranteed completion of async work
- Background tasks up to 400 seconds (paid plans)
- Rate limiting on recursive calls
- Dashboard-based editing and deployment
- Customizable compute limits coming (memory, CPU, duration)

**HopTrack use cases:**
- **Barback AI crawl jobs:** Long-running crawl tasks as background Edge Functions (vs current Node.js script)
- **AI recommendation generation:** Move Claude API calls to Edge Functions for better cold start performance
- **Webhook processing:** Process POS webhooks with guaranteed completion via waitUntil
- **Email digest computation:** Weekly digest stat calculation as Edge Function

### 4.5 PWA State of Play (2026)

**Current HopTrack state:** PWA with service worker, install prompt (Sprint 145), standalone mode CSS (Sprint 154).

**iOS limitations (still significant):**
- Push notifications work only after home screen install (iOS 16.4+)
- No Background Sync, Periodic Background Sync, or Background Fetch
- No rich media push (text-only)
- Limited offline storage compared to native
- No Web Bluetooth or NFC
- Apple continues to make incremental improvements but full parity with native is unlikely

**Android advantages:**
- Full push notification support
- Automatic install prompts based on engagement
- Web Bluetooth and NFC available
- Better offline storage and background processing

**Strategic assessment:**
PWA is the right choice for launch. The iOS limitations are real but manageable for our use case (we do not need background sync, NFC, or Web Bluetooth). Push notifications on iOS require home screen install -- this means our install prompt (Sprint 145) is critical for iOS push adoption.

**Long-term native app consideration:**
If we reach 10,000+ active users and need background location, rich push, or hardware features, a React Native wrapper (or Capacitor) around the existing web app would be the path. Not needed for Q3 2026.

**Recommendations:**
- **P2:** Improve offline experience (cache recent session data, allow offline beer rating with sync)
- **P2:** Rich push notification content for Android (images, action buttons)
- **P3:** Evaluate Capacitor or React Native wrapper for App Store presence if user count justifies it

---

## 5. Feature Gap Analysis

### 5.1 Social Features

**What Untappd does that we do not:**
- Massive beer database (3M+ vs our 2,361)
- Venue check-in (separate from beer check-in -- "I'm here")
- Badges tied to specific venues, styles, events
- Toast/sharing to external social media (Instagram, X)
- Beer lists curated by influencers/publications

**What we do that Untappd does not:**
- Group sessions (drink with friends, tracked together)
- Brewery challenges (gamified visit goals)
- Direct brewery-to-customer messaging
- Friend activity feed with reactions and comments
- Loyalty integration (social + rewards)

**Gaps to close (prioritized):**
1. **Beer database growth (P1):** 2,361 beers is insufficient. The Barback crawler needs to scale beyond Charlotte NC pilot. Target: 50,000+ beers by end of Q3.
2. **External sharing (P2):** Share check-in cards to Instagram Stories, X, etc. Web Share API exists (Sprint 84) but no formatted share cards.
3. **Venue check-in without beer logging (P2):** "I'm at [brewery]" without requiring a full session. Lower friction social signal.
4. **Badge/achievement expansion (P3):** Currently 10 achievement categories. Untappd has hundreds. More variety drives engagement.

### 5.2 Brewery Analytics

**What competitors offer that we could deepen:**
- **Toast:** Purchase data tied to customer profiles, keg tracking with depletion estimates, flight builder analytics, menu performance by day/hour
- **Untappd Premium:** Distribution analytics (where your beers are being poured across all venues)
- **Arryved:** Production visibility (tank status, inventory, distribution scheduling)

**What we have:**
- Session analytics (visits, duration, beers/visit)
- Customer health metrics (retention, churn risk, engagement scoring)
- Loyalty performance (conversion, redemptions)
- KPI sparklines with WoW trends
- Brand cross-location comparison
- CSV export

**Gaps to close (prioritized):**
1. **Revenue attribution (P1):** Connect loyalty redemptions and promotions to estimated revenue impact. "Your loyalty program drove $X in repeat visits this month."
2. **Peak hour heatmap (P2):** Visual day/hour heatmap of traffic patterns. Helps brewery owners staff appropriately.
3. **Beer performance analytics (P2):** Which beers drive the most sessions, highest ratings, longest session duration. Help breweries decide what to keep on tap.
4. **Competitive benchmarking (P3):** "Your brewery is in the top 20% for customer retention in your city." Anonymous aggregate comparisons.

### 5.3 Loyalty Features

**What dedicated loyalty platforms offer in 2026:**
- POS-integrated point earning (earn on every purchase, not just check-ins)
- Tiered VIP programs (Bronze/Silver/Gold with escalating rewards)
- AI-driven personalized offers (right offer, right time, right customer)
- Card-linked rewards (automatic earning via credit card, no app needed)
- Subscription/membership models (monthly "mug club" with perks)
- Gamification beyond stamps (mini-games, challenges, leaderboards)
- Omnichannel earning (in-store, online, delivery)
- Marketing automation tied to loyalty (automated emails/SMS based on loyalty tier)

**What we have:**
- Stamp-based loyalty (earn stamps per visit, redeem for rewards)
- Mug clubs with perks
- Brand-wide loyalty (earn anywhere, redeem anywhere)
- Redemption codes with staff verification
- Challenge system with XP rewards

**Gaps to close (prioritized):**
1. **Tiered VIP programs (P1):** Bronze/Silver/Gold customer tiers based on visit frequency. Higher tiers get better rewards. This is the #1 feature loyalty platforms sell.
2. **Automated loyalty communications (P2):** "You're 2 stamps away from a free pint!" push notification. Milestone celebrations. Win-back messages for lapsed members.
3. **POS-integrated earning (P2):** When POS integration is live (Toast/Square), earn loyalty points on every purchase, not just check-ins. This is the gold standard.
4. **Birthday/anniversary rewards (P3):** Automatic reward on customer's birthday or anniversary of first visit. Simple but effective retention.

### 5.4 Consumer Engagement and Gamification

**Industry trends for 2026:**
- Gamification is moving beyond badges to missions, seasons, and collaborative challenges
- Untappd's "Recappd" introduced faction-based missions and leaderboards
- Digital beer menus are incorporating QR-code ordering and augmented reality labels
- Non-alcoholic beer tracking is growing (30% YoY sales growth)

**Gaps to close:**
1. **Seasonal events / missions (P2):** Time-limited community challenges ("Asheville IPA Week", "Stout Season"). Creates FOMO and drives engagement spikes.
2. **Leaderboards (P2):** Weekly/monthly leaderboards by city, style, or overall. Competitive engagement loop.
3. **Beer journal / tasting notes (P2):** Structured tasting notes (aroma, flavor, mouthfeel, appearance) beyond star rating. Differentiator for serious beer enthusiasts.
4. **Non-alcoholic tracking (P3):** Explicit NA beer category support with its own achievements. Growing market segment.

### 5.5 Discovery and Recommendations

**What exists:**
- AI recommendations via Claude Haiku ("Brewed for You" card)
- HopRoute AI crawl planner
- Nearby brewery discovery with map
- Search with pg_trgm fuzzy matching

**Gaps to close:**
1. **Trending beers / breweries (P1):** "Trending in Charlotte this week" based on check-in velocity. Simple, high-engagement content.
2. **Collaborative filtering (P2):** "People who liked [beer X] also liked [beer Y]." Classic recommendation pattern we are not using.
3. **Event-based discovery (P2):** "Happening near you this weekend" -- brewery events, tap takeovers, releases. Our events system exists but has no consumer-facing discovery.
4. **Style exploration paths (P3):** "You love IPAs. Here's a path to explore West Coast vs New England vs Hazy." Guided tasting journeys.

### 5.6 Integration Opportunities

| Integration | Value | Effort | Priority |
|---|---|---|---|
| **Google Business Profile API** | Sync brewery hours, photos, ratings to Google Maps | Medium | P2 |
| **Apple Business Connect** | Same for Apple Maps (ads coming to Apple Maps in 2026) | Medium | P2 |
| **Toast POS** | Real-time tap list sync, purchase data, loyalty earning | High (OAuth + API) | P1 (already scaffolded) |
| **Square POS** | Same as Toast | High (OAuth + API) | P1 (already scaffolded) |
| **Google Calendar** | "Add to calendar" for brewery events | Low | P3 |
| **Instagram / X sharing** | Formatted share cards for check-ins | Medium | P2 |
| **OpenTable / Resy** | Reservation links on brewery pages | Low (link only) | P3 |

---

## 6. Proposed Q3 2026 Sprint Arcs

Based on all research above, here are 4 proposed arcs. Joshua picks the order. Each arc is independent and can be reshuffled based on business priorities.

---

### Arc 1: The Compliance Shield (3-4 sprints)

**Theme:** Legal and regulatory hardening before scaling to real users.

**Why now:** 20 US state privacy laws active in 2026. FTC enforcement at historic highs. Age verification laws taking effect in Utah (May 2026) and Louisiana (July 2026). A single FTC review violation is $51,744. We cannot scale to paying breweries with compliance gaps.

**Business impact:**
- Risk mitigation: avoid regulatory fines that could kill a startup
- Trust signal: "HopTrack takes privacy seriously" is a selling point to brewery owners
- App Store readiness: age verification is required for alcohol-related app listing

**Key features:**
- Sprint A: Age verification gate on signup (21+ enforcement), FTC review disclosure (XP for ratings transparency), review moderation queue, responsible drinking disclaimers on promotions
- Sprint B: Location data consent flow (explicit opt-in), "Do Not Sell" link, data retention policy implementation (automated purging), Universal Opt-Out Mechanism support
- Sprint C: Full WCAG 2.1 AA accessibility audit and remediation pass (38 sprints of new components since last audit)
- Sprint D (optional): Promotion content guidelines engine, automated data lifecycle management, privacy policy update

**Dependencies:** None. Can start immediately.

---

### Arc 2: The Engagement Engine (4-5 sprints)

**Theme:** Consumer stickiness features that drive daily active use and organic growth.

**Why now:** Product is feature-complete for launch, but retention is the existential question. SMB restaurant SaaS faces 31-58% annual churn. The consumer side must be compelling enough that brewery owners see value in the platform's user base. Every brewery owner will ask: "How many people actually use this?"

**Business impact:**
- Retention: daily engagement features reduce consumer churn
- Acquisition: shareable content drives organic growth (each share is a free impression)
- Brewery value: more engaged consumers = more valuable platform for brewery owners
- Revenue: engaged users drive more brewery visits = higher brewery ROI = lower subscription churn

**Key features:**
- Sprint A: Supabase Realtime implementation -- live tap list updates (brewery value), "Drinking Now" presence (consumer social), real-time notification delivery
- Sprint B: Trending content engine (trending beers/breweries by city), event-based discovery ("Happening near you"), venue check-in (lightweight "I'm here" without full session)
- Sprint C: Social sharing cards (formatted check-in images for Instagram/X), leaderboards (weekly/monthly by city), seasonal missions framework
- Sprint D: Beer journal / structured tasting notes, achievement expansion (50+ new badges), collaborative filtering recommendations ("people who liked X also liked Y")
- Sprint E (optional): Barback scale-up (50K+ beer database), style exploration paths, NA beer tracking category

**Dependencies:** Supabase Realtime requires paid plan features (already on paid plan).

---

### Arc 3: The Revenue Accelerator (3-4 sprints)

**Theme:** Deepen brewery analytics and loyalty to justify subscription price and reduce churn.

**Why now:** After first paying customers, the #1 question becomes: "Is this worth $49/month?" The answer must be provably yes. Revenue attribution, VIP tiers, and automated loyalty communications are what turn a "nice tool" into an indispensable business system.

**Business impact:**
- Retention: provable ROI reduces subscription churn
- Upsell: advanced analytics and VIP tiers are Cask/Barrel differentiators
- Revenue: higher perceived value = willingness to upgrade tiers
- Competitive moat: loyalty depth that no competitor matches

**Key features:**
- Sprint A: Revenue attribution dashboard ("Your loyalty program drove $X in repeat visits"), peak hour heatmap, beer performance analytics (which beers drive sessions)
- Sprint B: Tiered VIP loyalty (Bronze/Silver/Gold based on visit frequency, escalating rewards), automated loyalty milestone notifications ("2 stamps away!")
- Sprint C: POS integration activation (Toast and Square OAuth live), POS-integrated loyalty earning (points on every purchase), purchase data flowing into analytics
- Sprint D (optional): Birthday/anniversary auto-rewards, competitive benchmarking ("Top 20% for retention in your city"), brewery-to-brewery performance comparison (anonymized)

**Dependencies:** Sprint C depends on Toast/Square API partner approval (already scaffolded in Sprints 86-88).

---

### Arc 4: The Modern Stack (3 sprints)

**Theme:** Platform modernization -- leverage the tools we already have but are not using.

**Why now:** Next.js 16 shipped "use cache", View Transitions, and the React Compiler. Supabase Edge Functions gained background tasks and waitUntil. We are running on a modern stack but using 2024 patterns. Modernizing now means faster page loads, lower bundle size, and better developer velocity for every subsequent sprint.

**Business impact:**
- Performance: faster pages = higher conversion, lower bounce
- DX: faster builds, less boilerplate = more features per sprint
- Cost: better caching = fewer database queries = lower Supabase bill at scale
- Future-proofing: WCAG 2.2, React Compiler, and View Transitions are the baseline for 2027

**Key features:**
- Sprint A: "use cache" directive adoption across all heavy data pages (brewery detail, beer search, Command Center, analytics), Turbopack file system caching enabled, manual memoization audit and removal
- Sprint B: View Transitions for page navigation and tab switches (replace AnimatePresence where appropriate), React Compiler fully enabled, Activity component for tab preloading
- Sprint C: Barback migration to Edge Functions (background tasks), AI recommendation pipeline optimization, offline PWA improvements (cache recent session data, offline beer rating with sync)

**Dependencies:** None. Can start immediately. Low risk -- all features are stable in Next.js 16.2.1.

---

## 7. Recommended Arc Ordering

**If Joshua wants to prioritize risk reduction:**
1. The Compliance Shield (legal protection before scaling)
2. The Revenue Accelerator (prove ROI to first customers)
3. The Engagement Engine (grow the consumer base)
4. The Modern Stack (platform investment)

**If Joshua wants to prioritize growth:**
1. The Engagement Engine (consumer stickiness first)
2. The Revenue Accelerator (prove value to breweries)
3. The Compliance Shield (harden as we scale)
4. The Modern Stack (platform investment)

**Morgan's recommendation:** Start with The Compliance Shield. The FTC review disclosure is a P0 that should ship before any real user rates a beer on our platform. Age verification is required for any App Store listing. One compliance violation at our stage could be fatal. Then move to The Engagement Engine -- the consumer base is everything. Brewery owners buy because users use.

---

## 8. Items NOT Addressed (Out of Scope for Q3)

These were identified but are either already planned, already built, or too far out:

- **Brand Events / The Stage** -- BACKLOGGED by Joshua (Sprint 131), deferred 4x. Not proposing again.
- **Brand Promotions / The Megaphone** -- BACKLOGGED by Joshua (Sprint 131), deferred 4x. Not proposing again.
- **Native mobile app (React Native / Capacitor)** -- Not justified until 10,000+ active users.
- **International expansion** -- Not relevant until US market is established.
- **White-label / API-as-product** -- Premature. Focus on direct value.
- **Keg tracking / inventory management** -- POS territory, not our lane.
- **Website builder for breweries** -- Low differentiation. Squarespace/Wix serve this better.

---

## 9. Research Sources

### Competitive Landscape
- [Untappd Expands Beyond Beer -- American Craft Beer](https://www.americancraftbeer.com/untappd-expands-beyond-beer/)
- [With The Recent Changes, Is This The Downfall Of Untappd? -- Breweries in PA](https://breweriesinpa.com/with-the-recent-changes-is-this-the-downfall-of-untappd/)
- [Untappd for Business: The Definitive Guide -- BeerMenus](https://www.beermenus.com/blog/260-untappd-for-business)
- [Beer Distribution Stats Dashboard -- Untappd Help](https://help.untappd.com/hc/en-us/articles/44261033097876-Beer-Distribution-Stats-Dashboard-Premium-Tier-Only)
- [What Taprooms Learned In 2025 & How Your Brewery Can Win In 2026 -- Arryved](https://arryved.com/optimizing-your-taproom/what-taprooms-learned-in-2025-how-your-brewery-can-win-in-2026/)
- [The Best Brewery Software For Success In 2026 -- Toast](https://pos.toasttab.com/blog/on-the-line/brewery-software)
- [8 Best Brewery POS Systems for 2026 -- GoTab](https://gotab.com/latest/8-best-brewery-and-restaurant-pos-systems-for-2026-ranked)
- [Untappd for Business alternative: BeerMenus](https://www.beermenus.com/blog/261-untappd-for-business-alternative-beermenus)
- [Untappd Alternatives -- Evergreen](https://www.evergreenhq.com/blog/untappd-alternatives-best-digital-beer-menu-solutions/)
- [Top 10 Best Apps for Beer Lovers 2026 -- top10.com](https://www.top10.com/apps-for-beer-lovers)

### Compliance and Legal
- [State laws introduce age verification rules for app developers -- McNees Law](https://www.mcneeslaw.com/age-verification-laws-app-developers-compliance/)
- [The 1-2-3s of Age Verification Compliance -- ACT](https://actonline.org/2025/12/12/the-1-2-3s-of-age-verification-compliance-in-the-united-states/)
- [App Store Age Verification Laws -- Loeb & Loeb](https://www.loeb.com/en/insights/publications/2025/12/app-store-age-verification-laws-trigger-new-federal-and-state-childrens-privacy-requirements)
- [CCPA Requirements 2026 Complete Compliance Guide -- SecurePrivacy](https://secureprivacy.ai/blog/ccpa-requirements-2026-complete-compliance-guide)
- [20 State Privacy Laws in Effect in 2026 -- MultiState](https://www.multistate.us/insider/2026/2/4/all-of-the-comprehensive-privacy-laws-that-take-effect-in-2026)
- [Global Data Privacy Laws 2026 Guide -- Usercentrics](https://usercentrics.com/guides/data-privacy/data-privacy-laws/)
- [Accessibility Testing Services 2026 Complete Guide -- Vervali](https://www.vervali.com/blog/accessibility-testing-services-in-2026-the-complete-guide-to-wcag-2-2-ada-section-508-and-eaa-compliance/)
- [FTC Endorsements, Influencers, and Reviews -- FTC.gov](https://www.ftc.gov/business-guidance/advertising-marketing/endorsements-influencers-reviews)
- [FTC Consumer Review Rule Warning Letters -- FTC.gov](https://www.ftc.gov/business-guidance/blog/2025/12/warning-letter-or-ten-businesses-comply-ftcs-consumer-review-rule)
- [Alcohol Advertising Regulations -- Brewers' Law](https://brewerslaw.com/federal-advertising-rules-for-alcoholic-beverages/)
- [Beer Institute Updates Advertising Code -- Beer Institute](https://www.beerinstitute.org/press-releases/beer-institute-updates-advertising-code-to-promote-responsible-marketing/)
- [State-by-State Social Media Ad Restrictions for Alcohol -- Intentionally Creative](https://get-creative.co/news/state-by-state-social-media-ad-restrictions-for-alcohol-retailers-a-2025-compliance-update)

### Platform Modernization
- [Next.js 16 -- nextjs.org](https://nextjs.org/blog/next-16)
- [Complete Guide to Next.js 16 + React 19.2 in Production -- DEV Community](https://dev.to/x4nent/complete-guide-to-nextjs-16-react-192-in-production-rsc-security-view-transitions-turbopack-5090)
- [Supabase Realtime Docs -- supabase.com](https://supabase.com/docs/guides/realtime)
- [Supabase Edge Functions: Background Tasks, Ephemeral Storage, WebSockets -- DEV Community](https://dev.to/supabase/supabase-edge-functions-introducing-background-tasks-ephemeral-storage-and-websockets-pe)
- [PWA on iOS: The Complete Guide for 2026 -- MobiLoud](https://www.mobiloud.com/blog/progressive-web-apps-ios)
- [PWA iOS Limitations and Safari Support 2026 -- MagicBell](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide)

### Industry Trends
- [Top 10 Brewery Industry Trends and Statistics in 2026 -- Toast](https://pos.toasttab.com/blog/on-the-line/brewery-industry-trends-and-statistics)
- [The Craft Beer Trends to Watch in 2026 -- Growler Guys](https://thegrowlerguys.com/beer-trends-to-watch-in-2026/)
- [2026 Beer Industry Trends -- Beer Connoisseur](https://beerconnoisseur.com/beer-industry-trends-2026/)
- [Shaping the Year Ahead: Expert Outlook 2026 -- Brewer Magazine](https://thebrewermagazine.com/shaping-the-year-ahead-expert-outlook-2026/)
- [The Future of Restaurant Loyalty Trends 2026 -- DoorDash](https://merchants.doordash.com/en-us/blog/future-of-restaurant-loyalty)
- [Best QSR Loyalty Program Software in 2026 -- Voucherify](https://www.voucherify.io/blog/top-9-loyalty-program-tools-for-quick-service-restaurants-qsrs-in-2025)

---

*Research compiled by Morgan, Sam, and Jordan. April 4, 2026.*
*This is a living document.*
