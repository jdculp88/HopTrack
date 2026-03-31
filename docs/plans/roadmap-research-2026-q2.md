# HopTrack Q2 2026 Roadmap Research
**Authors:** Morgan (PM), Sage (PM Assistant), Sam (Business Analyst)
**Date:** 2026-03-31
**Sprint:** Pre-Sprint 74

> This document captures deep market research, competitive analysis, gap assessment, and feature proposals to guide HopTrack's roadmap for the next 6-12 months. It is NOT a sprint plan. It is the research that sprint plans will be built from.

---

## 1. Executive Summary

HopTrack has shipped an impressive product over 73 sprints: a consumer check-in app with sessions, achievements, social feed, streaks, and an AI-powered brewery crawl planner (HopRoute), paired with a brewery dashboard featuring tap list management, The Board TV display, loyalty programs, analytics, and events. We have 48 of 50 requirements complete, 47 migrations applied, and a build that passes clean.

**Where we stand:**
- Product is feature-rich but pre-revenue (zero paying breweries)
- Launch checklist is 44% complete (billing and launch-day ops are the biggest gaps)
- Untappd for Business charges $899-$1,199/year; we're positioned at $588-$1,788/year (Tap/Cask monthly)
- The craft beer industry is contracting (brewery closings outpaced openings in 2025 for the second straight year), but taproom experiences are thriving and small breweries are growing
- SMB restaurant SaaS faces 31-58% annual churn -- retention must be designed into the product from day one

**The honest assessment:**
We have built a product with more consumer features than Untappd and more brewery-specific depth than any loyalty platform. But we have not closed a single customer. The next 6 months must prioritize: (1) closing the launch gap, (2) getting to first revenue, (3) building the retention loops that prevent SMB churn, and (4) filling genuine feature gaps that the market expects.

---

## 2. Market Landscape

### 2.1 Untappd (The Incumbent)

**Business model:** Consumer app (free + $4.99/mo Supporter tier) + Untappd for Business ($899/yr Essentials, $1,199/yr Premium). Trusted by ~20,000 businesses in 75+ countries.

**What they do well:**
- Massive consumer base and beer database (3M+ beverages)
- POS integrations (Toast, Square, GoTab)
- AI-powered menu design tools (new 2025)
- Website builder for businesses (launched Feb 2025)
- Distribution analytics for breweries (Premium tier)

**Where they're vulnerable:**
- Repeated price increases (50%+ hike in 2021, tiered paywall in 2023) with slowing feature development
- Display reliability problems (menus failing on smart TV browsers)
- Cookie-cutter branding -- menus look like Untappd, not the brewery
- No loyalty program functionality whatsoever
- Consumer app stability issues (53% of user reports are crashes, frequent API outages)
- Privacy complaints (data sharing/selling concerns on Trustpilot)
- PE ownership creates a "maximize extraction" dynamic, not a "serve breweries" dynamic
- Non-beer items heavily restricted on lower tier
- No real social features on the business side (no customer engagement, no messaging)

**Our advantage over Untappd:** Full-stack platform (loyalty + analytics + tap list + events + customer messaging + social). Untappd is a check-in app that bolted on business tools. We built both sides together.

**Our disadvantage:** Zero consumer base. Untappd has network effects we cannot replicate at launch.

### 2.2 Direct Competitors (Business Side)

| Competitor | Focus | Price | Our Edge |
|---|---|---|---|
| Untappd for Business | Menu + analytics | $899-$1,199/yr | Loyalty, events, customer messaging, The Board |
| Taplist.io | TV menus | $400-$700/yr | Full platform vs. single feature |
| DigitalPour | POS-driven menus | Custom | Lighter weight, consumer app, loyalty |
| BeerMenus | Online discovery | $599/yr | Consumer social, brewery dashboard |
| Arryved | POS-native menus | POS bundle | We're platform, they're POS add-on |
| Evergreen | Digital menus | Custom | Consumer app, full B2B dashboard |

**Key observation:** No competitor combines consumer social + brewery operations. They all do one or the other. This remains our moat.

### 2.3 Loyalty Platform Competitors

| Platform | Price | Key Strength | Why We Win |
|---|---|---|---|
| Toast Loyalty | $185/mo (+ POS) | POS-integrated, credit card linked | Brewery-specific, no POS lock-in, consumer social layer |
| Square Loyalty | ~$45-$90/mo | Easy setup, POS-integrated | Brewery-specific features, events, The Board |
| Stamp Me | $39-$199/mo | Simple digital stamps, gamification | Full platform, not just stamps |
| StampClub | Varies | 50+ POS integrations | Consumer app, analytics, brewery focus |

**Key insight:** Toast Loyalty at $185/mo makes our Cask tier at $149/mo look like a bargain -- and we include tap list, events, analytics, and a consumer app they don't have. This is a strong pricing story.

### 2.4 Craft Beer Industry Context

The industry is at an inflection point:
- Total beer sales down 3% (~$2B decline), craft down 4%+
- Brewery closings outpaced openings for second straight year (434 closings vs. 268 openings in 2025)
- BUT: 49% of survey respondents reported growth, especially small taprooms under 1,000 barrels
- Taprooms evolving into "third spaces" -- community hubs with food, events, non-beer options
- Non-alcoholic beer grew 22.3%, NA beer sales up 111% by volume since 2021
- Gen Z over-indexes for experiential venues but has low awareness of craft's independent roots
- Lager renaissance continuing through 2026

**What this means for us:** The breweries that survive are the ones investing in taproom experience, customer relationships, and data. That is exactly what HopTrack sells. Our ICP (owner-operated, 500-3,000 visitors, paper punch cards) is the brewery that needs us most.

### 2.5 Loyalty & Engagement Trends (2025-2026)

Key patterns from market research:
- **Relationships over transactions:** "Buy 10 get 1 free" is table stakes. Modern loyalty is about making customers feel like insiders.
- **Gamification drives results:** 148% higher conversion vs. standard promotions. Streaks, challenges, progress bars, and badges are proven.
- **Personalization is expected:** AI-tailored offers based on ordering history show 4x higher engagement than generic messages.
- **Collaboration over pure competition:** Best apps layer cooperative challenges alongside competitive leaderboards.
- **Credit-card-linked enrollment:** Toast's frictionless signup (swipe card, opt in) sets the bar for ease.
- **Progress visualization:** Endowed progress effect increases completion rates by up to 40%.
- **Subscription models emerging:** Panera's Unlimited Sip Club model generates massive foot traffic.

### 2.6 PWA vs. Native Assessment

Current consensus for 2026:
- PWAs achieve 85-95% of native performance for typical business apps
- PWAs are 40-60% cheaper to build and maintain
- PWA install friction is lower (no app store), reaching 43x more users in some cases
- BUT: iOS PWA experience still lags Android (no auto-install prompts, push requires iOS 16.4+)
- Native apps carry perception of quality and trust for consumer apps
- "PWA first, native if needed" is the standard playbook

**Our position:** PWA + Capacitor is the right architecture. Ship PWA now for immediate reach. Submit to App Store when Apple Developer account is secured. Do not delay launch waiting for native.

---

## 3. Gap Analysis

### 3.1 What We Have That Competitors Don't

These are genuine differentiators:
- **Dual-sided platform** (consumer social + brewery ops) -- nobody else does this
- **The Board** (live TV tap display) -- Untappd has menus but not this level of brewery-branded display
- **HopRoute AI** (brewery crawl planner) -- completely unique feature
- **Achievement/XP system** -- 52 achievements, beer-themed levels, celebration overlays
- **Session-based model** (vs. single check-ins) -- captures the full visit, not just one beer
- **Brewery events** -- first-class events system with consumer discovery
- **Customer messaging** (tier-based: VIP/Power/Regular/New) -- Untappd has no equivalent
- **QR Table Tents** (3 formats) -- physical-to-digital bridge

### 3.2 Table Stakes We're Missing

These are features the market expects that we don't have yet:

| Gap | Severity | Why It Matters |
|---|---|---|
| **POS integration** | HIGH | Untappd, DigitalPour, Arryved all integrate with POS. Breweries hate double-entry. |
| **Barcode/label scanning** | MEDIUM | Untappd's camera scan for beer identification is a core UX. We rely on search only. |
| **Email integration** | MEDIUM | No transactional email, no drip campaigns, no receipt emails. Every SaaS competitor has this. |
| **Self-serve onboarding** | HIGH | Current claim flow requires manual setup. At scale, Taylor can't hand-hold every brewery. |
| **Non-beer menu items** | MEDIUM | Taprooms now serve cocktails, wine, food, NA options. Untappd charges extra for this. We should include it. |
| **Billing/subscription management** | CRITICAL | Stripe integration is stubbed but not live. Cannot collect revenue. |
| **CI/CD pipeline** | HIGH | No automated testing or deployment. Manual deploy is a liability at scale. |
| **Staging environment** | HIGH | No staging Supabase project. Risky to test migrations against production. |

### 3.3 Competitive Gaps (Nice to Have, Not Blocking)

| Gap | Competitors Who Have It | Priority |
|---|---|---|
| Website builder for breweries | Untappd (new 2025) | P3 -- nice but not core |
| Distribution analytics | Untappd Premium | P3 -- for production breweries, not taprooms |
| Multi-language support | Several | P3 -- US-first launch |
| Dark/light branded menu themes | Taplist.io, Evergreen | P2 -- we have The Board, but more theme options would help |
| API access for integrations | Untappd Premium | P2 -- enables ecosystem |

### 3.4 Retention Gaps (Critical for SMB SaaS Survival)

SMB restaurant SaaS sees 31-58% annual churn. These features directly fight churn:

| Gap | Why It Fights Churn |
|---|---|
| **Automated weekly/monthly reports** | Brewery owner sees value without logging in. "Here's what happened this week." |
| **ROI dashboard** | Show "your loyalty program drove X repeat visits worth $Y." If they can see the money, they stay. |
| **Onboarding drip sequence** | Day 1-14 emails that teach features progressively. Reduces time-to-value. |
| **Usage-based health scoring** | We detect low-engagement breweries before they churn and intervene. |
| **Annual billing option** | Live in pricing docs but not implemented. Annual contracts reduce churn significantly. |

### 3.5 Consumer Retention Gaps

| Gap | Why It Matters |
|---|---|
| **Collaborative challenges** | Duolingo Friend Quests model. "Drink 5 new styles with a friend this month." |
| **Seasonal/time-limited events** | Create urgency. Strava-style monthly challenges. |
| **Year-in-review / Wrapped** | Spotify Wrapped for beer. Shareable, viral, retention anchor. |
| **Taste profile sharing** | Beer DNA is built but not shareable as a card/story for Instagram/social. |
| **Discovery beyond HopRoute** | Recommendations feel static. Need "Because you liked X, try Y" dynamic suggestions. |

---

## 4. Feature Proposals

### Tier P0 -- Must Have Before Launch (or within 30 days)

---

#### F-001: Complete Stripe Billing Integration
**One-line:** Wire up real Stripe products, webhook lifecycle, subscription cancel, and annual billing.
**Category:** Infrastructure
**Side:** Brewery
**Why:** Cannot collect revenue without this. Launch blocker.
**Priority:** P0
**Effort:** S (1-2 sprints)
**Revenue impact:** Direct -- literally enables revenue
**Needs design?** No (billing UI exists)
**Needs REQ?** No (REQ already covered in launch checklist)

---

#### F-002: Email Infrastructure (Transactional + Drip)
**One-line:** Integrate Resend for transactional emails (welcome, password reset, trial expiring) and basic drip sequences.
**Category:** Infrastructure
**Side:** Both
**Why:** Every SaaS product needs email. Trial conversion depends on day-5 and day-12 touchpoints. Currently manual.
**Priority:** P0
**Effort:** S (1-2 sprints)
**Revenue impact:** Direct -- trial conversion depends on email nudges
**Needs design?** Yes -- email templates (welcome, trial warning, trial expired, weekly digest)
**Needs REQ?** Yes -- Sam should spec the drip sequence and triggers

---

#### F-003: Self-Serve Brewery Onboarding Flow
**One-line:** Guided step-by-step setup wizard after claim: add beers, configure tap list, set up loyalty, preview The Board.
**Category:** Enhancement
**Side:** Brewery
**Why:** Current onboarding is manual. At 50+ breweries, Taylor cannot personally set up each one. Self-serve onboarding completion rate > 70% is a Phase 3 GTM target.
**Priority:** P0
**Effort:** M (3-5 sprints)
**Revenue impact:** Direct -- faster time-to-value means higher trial conversion
**Needs design?** Yes -- full onboarding wizard flow (Alex)
**Needs REQ?** Yes -- define steps, progress tracking, completion criteria

---

#### F-004: CI/CD Pipeline
**One-line:** GitHub Actions for lint, type check, build, and E2E test on push to main.
**Category:** Infrastructure
**Side:** Internal
**Why:** Pushing directly to main without automated checks is sustainable at our current scale but will break as we grow. One bad push to production with paying customers is a churn event.
**Priority:** P0
**Effort:** S (1-2 sprints)
**Revenue impact:** Indirect -- prevents outages that cause churn
**Needs design?** No
**Needs REQ?** No

---

#### F-005: Staging Environment
**One-line:** Second Supabase project for staging with seed data, separate Vercel preview deployment.
**Category:** Infrastructure
**Side:** Internal
**Why:** Testing migrations against production is unacceptable once we have paying customers. Riley has flagged this since Sprint 49.
**Priority:** P0
**Effort:** S (1-2 sprints)
**Revenue impact:** Indirect -- prevents data loss / downtime
**Needs design?** No
**Needs REQ?** No

---

### Tier P1 -- First 3 Months Post-Launch

---

#### F-006: POS Integration (Phase 1 -- Toast + Square)
**One-line:** Sync tap list changes bidirectionally with Toast POS and Square POS so brewery staff update in one place.
**Category:** New Feature
**Side:** Brewery
**Why:** The #1 reason breweries choose Untappd/DigitalPour/Arryved over alternatives. Double-entry is the top operational friction. Drew would call this a P0 if he saw how many breweries it blocks.
**Priority:** P1
**Effort:** L (6+ sprints -- API integrations are complex, need partner approval)
**Revenue impact:** Direct -- POS integration is a Cask/Barrel upsell and a churn reducer
**Needs design?** Yes -- settings UI for connecting POS, sync status indicators
**Needs REQ?** Yes -- define sync behavior, conflict resolution, error handling

---

#### F-007: Automated Brewery Reports (Weekly Digest)
**One-line:** Automated weekly email to brewery owners: visits, top beers, loyalty redemptions, new regulars, comparison to last week.
**Category:** New Feature
**Side:** Brewery
**Why:** The #1 churn-prevention tool in SMB SaaS. If the owner sees value in their inbox without logging in, they stay. Toast, Square, and every successful restaurant SaaS does this.
**Priority:** P1
**Effort:** S (1-2 sprints, depends on F-002 email infra)
**Revenue impact:** Indirect -- directly fights churn
**Needs design?** Yes -- email template with data visualizations
**Needs REQ?** Yes -- define metrics, frequency, personalization rules

---

#### F-008: Beer Barcode/Label Scanning
**One-line:** Camera-based UPC barcode scan or label recognition to identify beers during session check-in.
**Category:** New Feature
**Side:** Consumer
**Why:** Untappd's scan feature is a core UX that users expect. Our search-only approach adds friction, especially for packaged beer. At-home sessions (which we support with the "At Home" pill) especially benefit.
**Priority:** P1
**Effort:** M (3-5 sprints -- needs UPC database access or image recognition API)
**Revenue impact:** Indirect -- reduces session friction, increases check-in completion
**Needs design?** Yes -- camera UI, scan feedback, "beer not found" flow
**Needs REQ?** Yes -- define database source, fallback behavior, user-submitted additions

---

#### F-009: Collaborative Challenges
**One-line:** Time-limited challenges (monthly/seasonal) where friends or brewery communities work toward shared goals. "Try 5 new styles this month" or "Visit 3 breweries on the Asheville Trail."
**Category:** New Feature
**Side:** Consumer (with brewery sponsorship potential)
**Why:** Duolingo Friend Quests and Strava Challenges are the proven engagement model for 2026. Our streak system is solo-oriented. Collaborative challenges add the social accountability loop that drives retention. Gamified campaigns show 148% higher conversion.
**Priority:** P1
**Effort:** M (3-5 sprints)
**Revenue impact:** Indirect -- retention driver. Brewery-sponsored challenges = direct Barrel tier feature.
**Needs design?** Yes -- challenge creation, progress tracking, leaderboard, completion celebration
**Needs REQ?** Yes -- define challenge types, reward system, brewery sponsorship model

---

#### F-010: ROI Dashboard for Breweries
**One-line:** Dashboard card showing "Your loyalty program drove X repeat visits this month, worth an estimated $Y in revenue."
**Category:** Enhancement
**Side:** Brewery
**Why:** The single best defense against churn is showing the owner their money. If they can see "HopTrack drove $2,400 in repeat visits this month" next to their $149/mo cost, they never cancel.
**Priority:** P1
**Effort:** S (1-2 sprints)
**Revenue impact:** Direct -- prevents churn, justifies price
**Needs design?** Yes -- ROI card with clear before/after visualization
**Needs REQ?** Yes -- define calculation methodology, data sources, assumptions

---

#### F-011: Non-Beer Menu Support
**One-line:** Extend beer model to support wine, cocktails, NA beverages, and food items on tap list and The Board.
**Category:** Enhancement
**Side:** Brewery
**Why:** Taprooms are evolving into full-service venues. 2026 trend: non-beer options are expected. Untappd charges $300/yr extra for this (Premium tier). We should include it at Cask level.
**Priority:** P1
**Effort:** M (3-5 sprints -- schema changes, UI updates across tap list, Board, consumer views)
**Revenue impact:** Direct -- removes objection for brewpubs with food/cocktail programs. Cask upsell.
**Needs design?** Yes -- extended menu item types, Board display for mixed menus
**Needs REQ?** Yes -- define supported item types, fields per type, display rules

---

#### F-012: Year-in-Review (HopTrack Wrapped)
**One-line:** Annual shareable summary: total beers, unique styles, favorite brewery, top beer, miles traveled, friends made, achievements unlocked. Instagram Story-optimized format.
**Category:** New Feature
**Side:** Consumer
**Why:** Spotify Wrapped is the gold standard for viral retention features. Creates an annual moment of sharing that drives organic installs. Zero marginal cost after build.
**Priority:** P1
**Effort:** S (1-2 sprints)
**Revenue impact:** Indirect -- viral acquisition, brand awareness
**Needs design?** Yes -- shareable card series (5-7 slides), animations, Instagram Story format
**Needs REQ?** No -- straightforward data aggregation

---

#### F-013: Enhanced Taste Recommendations (AI v2)
**One-line:** "Because you rated [IPA] 4.5 stars, you might like [Brewery X's Hazy IPA] -- on tap now near you."
**Category:** Enhancement
**Side:** Consumer
**Why:** Current recommendation engine is basic. AI-powered, context-aware recommendations (location, time, taste profile, what's on tap nearby) would be a genuine differentiator. Food/drink apps in 2026 are expected to personalize.
**Priority:** P1
**Effort:** M (3-5 sprints)
**Revenue impact:** Indirect -- drives sessions, increases brewery visits (breweries see the value)
**Needs design?** Yes -- recommendation cards in feed, push notification format
**Needs REQ?** Yes -- define algorithm inputs, recommendation triggers, display contexts

---

### Tier P2 -- 3-6 Months Post-Launch

---

#### F-014: POS Integration (Phase 2 -- Keg Tracking)
**One-line:** Track keg levels via POS pour data. Auto-86 when keg kicks. Show "running low" indicators on The Board.
**Category:** Enhancement
**Side:** Brewery
**Why:** DigitalPour's core differentiator is POS-driven keg tracking. Brewery staff hate manually 86-ing beers. This is the "wow" feature that closes Barrel tier deals.
**Priority:** P2
**Effort:** M (3-5 sprints, depends on F-006 POS Phase 1)
**Revenue impact:** Direct -- Barrel tier feature
**Needs design?** Yes -- keg level indicators on Board and dashboard
**Needs REQ?** Yes -- define keg tracking model, POS data requirements

---

#### F-015: Brewery-Sponsored Challenges & Promotions
**One-line:** Breweries create challenges visible to all app users: "Visit us 3 times this month for a free pint." Sponsored challenges appear in Discover feed.
**Category:** New Feature
**Side:** Both
**Why:** This is the B2C-to-B2B flywheel. Breweries pay to reach consumers. Consumers get fun challenges. Revenue stream beyond subscriptions.
**Priority:** P2
**Effort:** M (3-5 sprints, depends on F-009 Challenges)
**Revenue impact:** Direct -- new revenue stream (pay-per-challenge or included in Barrel tier)
**Needs design?** Yes -- challenge creation UI for breweries, consumer discovery, promotion placement
**Needs REQ?** Yes -- define pricing model, visibility rules, analytics for sponsors

---

#### F-016: Public API (v1)
**One-line:** REST API for brewery data, tap lists, and basic session data. Enables third-party integrations and widget embeds.
**Category:** Infrastructure
**Side:** Brewery
**Why:** Untappd Premium includes API access. Barrel tier should too. Enables ecosystem: tap list widgets on brewery websites, integration with brewery management software.
**Priority:** P2
**Effort:** M (3-5 sprints)
**Revenue impact:** Direct -- Barrel tier feature
**Needs design?** No (API docs, not UI)
**Needs REQ?** Yes -- define endpoints, authentication, rate limits, versioning

---

#### F-017: Multi-Location Support
**One-line:** One brewery account manages multiple taproom locations with shared branding but independent tap lists, analytics, and loyalty.
**Category:** New Feature
**Side:** Brewery
**Why:** Barrel tier explicitly promises this but it doesn't exist yet. Regional craft breweries (Sierra Nevada, Oskar Blues, etc.) are the Barrel ICP.
**Priority:** P2
**Effort:** L (6+ sprints -- schema, permissions, analytics aggregation)
**Revenue impact:** Direct -- enables Barrel tier sales
**Needs design?** Yes -- location switcher, aggregate vs. per-location analytics
**Needs REQ?** Yes -- define data model, permission inheritance, billing per location

---

#### F-018: Brewery CRM (Customer Intelligence)
**One-line:** Unified customer profile showing visit history, loyalty status, spending patterns, taste preferences, and engagement score. Enable segmented outreach.
**Category:** New Feature
**Side:** Brewery
**Why:** "I have no idea who my regulars are" is the #1 pain point in our ICP research. The customer insights page exists but needs to evolve into a real CRM with actionable segments.
**Priority:** P2
**Effort:** M (3-5 sprints)
**Revenue impact:** Direct -- Cask/Barrel tier value driver, fights churn by being indispensable
**Needs design?** Yes -- customer profile page, segmentation UI, outreach triggers
**Needs REQ?** Yes -- define segments, scoring model, outreach actions

---

#### F-019: In-App Notifications v2 (Smart Triggers)
**One-line:** Context-aware push notifications: "Your wishlist beer [X] just tapped at [Brewery Y]", "Your friend [Z] just started a session at [Brewery]", "You're 1 visit away from your loyalty reward."
**Category:** Enhancement
**Side:** Consumer
**Why:** Smart push notifications show 4x higher engagement than generic ones. Our current push is basic. Contextual triggers drive visits (which drives brewery value).
**Priority:** P2
**Effort:** S (1-2 sprints -- building on existing push infra)
**Revenue impact:** Indirect -- drives engagement that breweries see as value
**Needs design?** Yes -- notification templates, preference controls
**Needs REQ?** No -- enhancement of existing system

---

#### F-020: Brewery Clubs / Mug Club Digital
**One-line:** Digital "mug club" memberships managed through HopTrack. Brewery charges annual fee, members get perks (discounts, early access, exclusive events).
**Category:** New Feature
**Side:** Both
**Why:** Mug clubs are a beloved brewery tradition. Most are managed on paper or spreadsheets. Digitizing them creates recurring revenue for breweries AND sticky usage for HopTrack.
**Priority:** P2
**Effort:** M (3-5 sprints)
**Revenue impact:** Direct -- premium feature for Cask/Barrel. Revenue share potential.
**Needs design?** Yes -- membership management, member perks, consumer-facing club page
**Needs REQ?** Yes -- define membership model, payment handling, perk types

---

### Tier P3 -- 6+ Months / Nice to Have

---

#### F-021: Brewery Website Builder (Lite)
**One-line:** Simple, branded single-page website auto-generated from brewery profile: hours, location, tap list, events, about.
**Category:** New Feature
**Side:** Brewery
**Why:** Untappd launched this in Feb 2025. Many small breweries have terrible or no websites. But this is not our core -- it's a "nice to include" for Barrel tier, not a priority.
**Priority:** P3
**Effort:** M (3-5 sprints)
**Revenue impact:** Indirect -- Barrel tier sweetener
**Needs design?** Yes -- templates, customization
**Needs REQ?** No

---

#### F-022: Beer Journal / Tasting Notes
**One-line:** Extended personal tasting notes per beer: aroma, flavor, mouthfeel, appearance. Exportable.
**Category:** Enhancement
**Side:** Consumer
**Why:** BeerAdvocate and RateBeer cater to the connoisseur segment. Our beer logs capture ratings but not detailed notes. Attracts the "serious beer nerd" segment.
**Priority:** P3
**Effort:** S (1-2 sprints)
**Revenue impact:** None directly -- engagement feature
**Needs design?** Yes -- tasting note UI (flavor wheel, sliders)
**Needs REQ?** No

---

#### F-023: Brewery Marketplace / Merch
**One-line:** Breweries sell merchandise (glasses, shirts, gift cards) through their HopTrack profile.
**Category:** New Feature
**Side:** Both
**Why:** Revenue diversification for breweries. Commission revenue for HopTrack. But complex (fulfillment, payments, returns).
**Priority:** P3
**Effort:** L (6+ sprints)
**Revenue impact:** Direct -- commission model
**Needs design?** Yes -- full e-commerce flow
**Needs REQ?** Yes

---

#### F-024: Apple Watch / Wear OS Companion
**One-line:** Quick check-in, session timer, and notification display on smartwatch.
**Category:** New Feature
**Side:** Consumer
**Why:** Strava has shown wearable integration drives engagement. But our user base doesn't justify the investment yet.
**Priority:** P3
**Effort:** M (3-5 sprints)
**Revenue impact:** None
**Needs design?** Yes
**Needs REQ?** No

---

#### F-025: Structured Data / JSON-LD for SEO
**One-line:** Add LocalBusiness, Event, and Product schema markup to brewery pages for rich search results.
**Category:** Enhancement
**Side:** Both
**Why:** Free organic traffic. Brewery pages appearing in Google with hours, ratings, and events drives consumer acquisition at zero cost.
**Priority:** P3
**Effort:** S (1-2 sprints)
**Revenue impact:** Indirect -- organic acquisition
**Needs design?** No
**Needs REQ?** No

---

#### F-026: Subscription / Mug Club Pass (Consumer)
**One-line:** Consumer-facing subscription ($4.99/mo) for premium features: advanced stats, export data, ad-free, early access to challenges, custom profile themes.
**Category:** New Feature
**Side:** Consumer
**Why:** Untappd Supporter is $4.99/mo. Consumer revenue diversifies beyond B2B. But too early -- need user base first.
**Priority:** P3
**Effort:** M (3-5 sprints)
**Revenue impact:** Direct -- consumer revenue stream
**Needs design?** Yes -- premium features, paywall, profile badges
**Needs REQ?** Yes -- define feature gates, pricing, trial

---

#### F-027: AI Beer Sommelier Chat
**One-line:** In-app AI chat that answers questions like "What should I try if I like hazy IPAs but want something lighter?" Uses taste profile and nearby tap list data.
**Category:** New Feature
**Side:** Consumer
**Why:** We already have Anthropic API integration for HopRoute. Extending to a conversational recommendation engine would be a genuine differentiator. AI chatbots in consumer apps are projected to drive $102B in retail spend by 2026.
**Priority:** P3
**Effort:** M (3-5 sprints)
**Revenue impact:** Indirect -- engagement differentiator
**Needs design?** Yes -- chat UI, response format, integration with tap lists
**Needs REQ?** Yes -- define capabilities, safety (alcohol-related content), API cost management

---

#### F-028: Brewery Ad Engine (Feed Ads)
**One-line:** Breweries purchase geo-targeted ad cards that appear in users' Friends feed. Ads are shown only to users within the brewery's area.
**Category:** New Feature
**Side:** Both (brewery creates, consumer sees)
**Why:** New revenue stream beyond subscriptions. Geo-targeting means ads are relevant (local brewery promoting a tap release to nearby users). Non-intrusive -- cards blend with the feed, not interstitials. This is the B2C-to-B2B flywheel Taylor has been talking about.
**Priority:** P2
**Effort:** M (3-5 sprints -- ad serving logic, geo-targeting, frequency capping, billing)
**Revenue impact:** Direct -- pay-per-impression or monthly ad budget. Could be included in Barrel tier.
**Needs design?** Yes -- ad card design for feed (must feel native, not banner-ad), ad creation UI for breweries, targeting controls, budget/spend dashboard
**Needs REQ?** Yes -- define ad format, targeting radius, frequency caps, pricing model, content policies, consumer opt-out

---

#### F-029: Brewery Promotion Hub
**One-line:** Central management page in brewery admin for all promotional tools: ad campaigns, sponsored HopRoute stops, challenges, featured placement, and promotional analytics.
**Category:** New Feature
**Side:** Brewery
**Why:** As we add more monetization levers (ads, sponsored HopRoutes, challenges, featured placement), breweries need one place to manage it all. Without this, promotional tools get scattered across 4 different pages and adoption suffers.
**Priority:** P2
**Effort:** M (3-5 sprints -- hub page, campaign management, analytics dashboard)
**Revenue impact:** Direct -- the UI that drives upsell adoption. If they can't find it, they can't buy it.
**Needs design?** Yes -- promotion hub layout, campaign creation wizard, spend analytics, ROI per campaign
**Needs REQ?** Yes -- define promotion types, campaign lifecycle (draft→active→paused→ended), budget controls, analytics metrics

---

#### F-030: HopRoute Location Autocomplete
**One-line:** Auto-complete location/city input while typing during HopRoute creation. Reduces friction and typos.
**Category:** Enhancement (bug/feature)
**Side:** Consumer
**Why:** Currently users must type the full location manually. Autocomplete reduces friction, prevents typos, and improves the data quality of generated routes. Table stakes UX for any location input in 2026.
**Priority:** P1
**Effort:** S (1-2 sprints -- integrate Places API or similar, debounced search, dropdown UI)
**Revenue impact:** Indirect -- reduces HopRoute creation abandonment
**Needs design?** Yes -- autocomplete dropdown, loading state, selected location display
**Needs REQ?** No -- straightforward enhancement

---

## 5. Recommended Sprint Arcs

### Arc 1: "Launch or Bust" (Sprints 74-78) -- 5 sprints
**Theme:** Close every launch blocker. Get to first revenue.

| Sprint | Focus | Features |
|---|---|---|
| 74 | Revenue Plumbing | F-001 (Stripe billing), F-005 (staging env) |
| 75 | Email & Onboarding | F-002 (email infra), start F-003 (onboarding wizard) |
| 76 | Onboarding & CI | F-003 continued, F-004 (CI/CD pipeline) |
| 77 | Launch Prep | Launch checklist items (legal review, monitoring, on-call, support emails) |
| 78 | Launch Week | First brewery closes, launch party at Drew's taproom |

**Exit criteria:** Stripe live, email sending, CI/CD running, staging environment, first paid brewery.

---

### Arc 2: "Stick Around" (Sprints 79-84) -- 6 sprints
**Theme:** Retention, retention, retention. Fight SMB churn before it starts.

| Sprint | Focus | Features |
|---|---|---|
| 79 | Brewery Value | F-007 (weekly digest emails), F-010 (ROI dashboard) |
| 80-81 | Consumer Stickiness | F-009 (collaborative challenges), F-012 (Wrapped/Year-in-Review) |
| 82 | Menu Expansion | F-011 (non-beer items), F-030 (HopRoute location autocomplete) |
| 83 | Smart Engagement | F-019 (smart push triggers), F-013 (AI recommendations v2) |
| 84 | Polish & Measure | Metrics review, churn analysis, feedback from first 5 breweries |

**Exit criteria:** Weekly digests live, ROI dashboard showing value, challenges launched, first retention cohort measured.

---

### Arc 3: "Open the Pipes" (Sprints 85-90) -- 6 sprints
**Theme:** POS integrations, API access, and the features that close Cask/Barrel deals.

| Sprint | Focus | Features |
|---|---|---|
| 85-87 | POS Phase 1 | F-006 (Toast + Square integration) |
| 88 | Barcode Scan | F-008 (beer barcode scanning) |
| 89 | CRM & Intelligence | F-018 (brewery CRM) |
| 90 | API & Multi-Location | F-016 (public API v1), start F-017 (multi-location) |

**Exit criteria:** At least one POS integration live, barcode scanning in consumer app, API documented.

---

### Arc 4: "The Flywheel" (Sprints 91-96) -- 6 sprints
**Theme:** B2C-to-B2B flywheel. Brewery-sponsored engagement. New revenue streams.

| Sprint | Focus | Features |
|---|---|---|
| 91-92 | Sponsored Challenges | F-015 (brewery-sponsored challenges & promotions) |
| 93 | Ad Engine & Promotions Hub | F-028 (brewery ad engine), F-029 (promotion hub) |
| 94 | Mug Clubs | F-020 (digital mug club memberships) |
| 95-96 | Multi-Location & Scale | F-017 continued, F-014 (keg tracking) |

**Exit criteria:** Brewery-sponsored challenges generating revenue, mug club pilot with 3+ breweries.

---

## 6. Requirements Needed (Sam's List)

Sam's assessment of which proposals need formal REQ documents before engineering begins:

| REQ | Feature | Why It Needs a REQ |
|---|---|---|
| REQ-051 | F-002: Email Infrastructure | Drip sequence timing, triggers, and content need spec. Wrong cadence kills trial conversion. |
| REQ-052 | F-003: Self-Serve Onboarding | Steps, completion criteria, and success metrics need definition. This is the revenue funnel. |
| REQ-053 | F-006: POS Integration | Sync behavior, conflict resolution, error handling, and partner API requirements are complex. |
| REQ-054 | F-007: Weekly Digest | Metrics selection, personalization rules, and frequency need spec. |
| REQ-055 | F-008: Barcode Scanning | Database source, fallback behavior, user-contributed data need definition. |
| REQ-056 | F-009: Collaborative Challenges | Challenge types, reward system, social mechanics, and brewery sponsorship model. |
| REQ-057 | F-010: ROI Dashboard | Calculation methodology must be defensible. Brewery owners will question the numbers. |
| REQ-058 | F-011: Non-Beer Menu Items | Supported types, fields, display rules, and migration path for existing data. |
| REQ-059 | F-013: AI Recommendations v2 | Algorithm inputs, recommendation triggers, and Anthropic API cost management. |
| REQ-060 | F-015: Brewery-Sponsored Challenges | Pricing model, visibility rules, analytics for sponsors. This IS the business model expansion. |
| REQ-061 | F-016: Public API | Endpoints, authentication, rate limits, versioning, developer docs. |
| REQ-062 | F-017: Multi-Location | Data model, permission inheritance, billing, analytics aggregation. |
| REQ-063 | F-018: Brewery CRM | Customer segments, scoring model, outreach actions, privacy compliance. |
| REQ-064 | F-020: Mug Clubs | Membership model, payment handling, perk types, brewery billing. |
| REQ-065 | F-026: Consumer Subscription | Feature gates, pricing, trial structure. |
| REQ-066 | F-027: AI Sommelier | Capabilities, safety guardrails, cost management. |
| REQ-067 | F-028: Brewery Ad Engine | Ad format, targeting radius, frequency caps, pricing model, content policies, consumer opt-out. |
| REQ-068 | F-029: Brewery Promotion Hub | Promotion types, campaign lifecycle (draft→active→paused→ended), budget controls, analytics metrics. |

**Sam's note:** "From a business continuity standpoint, F-001 through F-005 don't need new REQs because they're infrastructure with clear acceptance criteria in the launch checklist. But everything from F-006 onward touches user behavior, revenue, or third-party systems -- those need specs before a single line of code is written."

---

## 7. Design Needed (Alex's List)

Features requiring explicit design work before or during implementation:

### High Priority (Arc 1-2)
- **F-002:** Email templates -- welcome, trial day-5 check-in, trial day-12 warning, trial expired, weekly digest
- **F-003:** Brewery onboarding wizard -- step-by-step flow with progress indicator, each step's UI
- **F-007:** Weekly digest email -- data visualization in email format (works in all email clients)
- **F-009:** Collaborative challenges -- challenge cards, progress tracking, leaderboard, completion celebration
- **F-010:** ROI dashboard card -- clear before/after visualization, money saved vs. subscription cost
- **F-012:** Year-in-Review Wrapped -- 5-7 slide series, shareable Instagram Story format, animations

### Medium Priority (Arc 3-4)
- **F-006:** POS integration settings -- connect/disconnect UI, sync status, error states
- **F-008:** Barcode scanner -- camera viewfinder, scan feedback animation, "not found" flow
- **F-011:** Non-beer menu items -- extended item creation forms, Board display for mixed menus
- **F-013:** AI recommendation cards -- contextual placement in feed and notifications
- **F-015:** Brewery-sponsored challenges -- creation UI for breweries, consumer-facing promotional placement
- **F-018:** Brewery CRM -- customer profile page, segment builder, outreach UI
- **F-020:** Mug club -- membership management admin, consumer-facing club page and perks display
- **F-028:** Brewery ad engine -- native ad card for feed (must not feel like a banner ad), ad creation UI, targeting controls, budget/spend dashboard
- **F-029:** Brewery promotion hub -- hub layout, campaign creation wizard, spend analytics, ROI per campaign
- **F-030:** HopRoute location autocomplete -- autocomplete dropdown, loading state, selected location display

### Lower Priority
- **F-022:** Tasting notes -- flavor wheel, sensory sliders
- **F-026:** Consumer subscription -- premium badge, paywall screens
- **F-027:** AI Sommelier -- chat UI, response cards

---

## 8. Open Questions for Joshua

1. **Apple Developer Account** -- This has been carrying for 7+ sprints. TestFlight and App Store submission are blocked on it. Is there a timeline? The $99/yr investment unlocks the App Store channel.

2. **Business Entity / LLC** -- Required before accepting payments. Is this formed? Stripe onboarding needs it.

3. **Stripe Account** -- Has a Stripe account been created? This is literally the #1 blocker for revenue.

4. **First Brewery Conversation** -- Drew has warm intros in Asheville. Has the first conversation happened? Taylor's strategy depends on it. We're building but nobody is selling.

5. **Budget for Third-Party Services** -- Email (Resend ~$20/mo), barcode DB (varies), POS integration partner fees. What's the operating budget for SaaS tooling?

6. **Launch Timeline** -- Are we targeting a specific date? "Launch when ready" is fine, but Taylor needs a date to schedule brewery demos against. Suggestion: target Sprint 78 (approximately 5 weeks from now) as launch week.

7. **Consumer Subscription** (F-026) -- Is this on the radar? Untappd charges $4.99/mo for Supporter. Do we want to monetize the consumer side or keep it free to grow the base?

8. **POS Integration Priority** -- Toast and Square are the two most common POS systems in craft breweries. Should we pursue one first? Toast has a more formal partner program. Square is more open.

9. **Conference Presence** -- Craft Brewers Conference is April 20-22, 2026 in... are we going? Even as attendees (not exhibitors), it's a chance to validate with 50+ brewery owners in one place.

10. **Hiring Timeline** -- The GTM plan says "hire Customer Success when first brewery closes." Is that realistic? What's the budget for a part-time hire?

---

## Appendix: Research Sources

### Competitive Intelligence
- Untappd for Business pricing and features: BeerMenus definitive guide, BeerAdvocate
- Untappd user complaints: JustUseApp, Trustpilot, StatusGator, Breweries in PA blog
- Craft beer app landscape: Beer Connoisseur, BestApp.com, VinePair
- Digital menu competitors: Evergreen blog, Taplist.io, DigitalPour

### Industry Trends
- Craft beer market data: Brewers Association 2025 Year in Beer, NIQ US Craft Beer Report
- Taproom trends: Toast brewery industry trends, Hop Culture, Craft Brewing Business
- Gen Z craft beer: NIQ analysis 2025

### Loyalty & Engagement
- Restaurant loyalty best practices: Eatapp, OpenLoyalty, DoorDash Merchant blog, Antavo
- Toast Loyalty review: Favecard
- Gamification trends: Smartico, StriveCloud, StudioKrew, PUG Interactive
- Strava engagement model: Trophy.so case study, StriveCloud, Latterly.org

### Technology
- PWA vs native: Progressier, DigitalApplied, MagicBell, Novasarc
- AI in food/drink: MDPI systematic review, Intelegain, Bryj.ai
- B2B SaaS benchmarks: Vitally churn benchmarks, Lighter Capital, Vena Solutions

### B2B SaaS GTM
- Go-to-market playbooks: DesignRevision, Default, Directive Consulting
- Restaurant SaaS landscape: DoorDash, Cuboh, Tracxn

---

*Morgan: "This is a living document. But unlike most living documents, this one needs to turn into sprints within a week. Joshua -- read the Open Questions section. Those are blockers."*

*Sage: "I've got the notes. All 30 features cataloged, 18 REQs queued, and 4 sprint arcs sketched. Ready to break these into tickets when you give the green light."*

*Sam: "From a business continuity standpoint... we've built a great product. But zero revenue after 73 sprints is a risk. The next 5 sprints need to be the most focused we've ever been."*
