# HopTrack Sales Prep Sprint — Brief

**Authors:** Morgan (PM) + Taylor (Sales) + Jamie (Marketing)
**Date:** 2026-03-24
**Status:** Draft — pending sprint scheduling

---

## Sprint Goal

Give breweries everything they need to say yes.

By the end of this sprint, a brewery owner who hears about HopTrack for the first time — from a cold email, a warm intro, or a sales call — should be able to:

1. Land on a page that explains exactly what HopTrack is and what it costs
2. Understand the specific benefits for their brewery
3. Start the claim process immediately
4. (For sales calls) Let Taylor walk through a live demo environment without needing a real brewery account

This sprint is not about consumer marketing. It is about converting **brewery decision-makers** — owners, general managers, and marketing managers — into signed-up, verified HopTrack accounts.

---

## Background

HopTrack needs a brewery-facing presence that explains cost and benefits clearly. Currently, there is no dedicated page explaining pricing, no outbound sales email template, and no demo environment for sales calls.

This sprint creates all three, plus coordinates the assets needed for Taylor to begin brewery outreach.

---

## Deliverable 1: Brewery Marketing Landing Page (`/for-breweries`)

### Route

`/for-breweries` — a standalone page, separate from the consumer-facing marketing site

### Audience

- Brewery owners
- General managers
- Marketing managers at breweries

**Not** the beer-drinking consumer. Different voice, different benefits, different CTA.

### Page Structure

---

**Hero Section**

Headline: "Turn every check-in into a customer relationship"

Subhead: HopTrack gives your brewery a dashboard, a loyalty program, and real-time analytics — built on the check-ins your customers are already making.

CTA button: "Claim Your Brewery" → `/brewery-admin/claim`

Secondary link: "See how it works" → scrolls to features section

---

**Pricing Section**

Three tiers. Names and pricing from Jamie's brand doc:

| Tier | Price | Included |
|---|---|---|
| **Tap** | $49/mo | Brewery dashboard, analytics, loyalty program, claim verification |
| **Cask** | $149/mo | Everything in Tap + API access, TV display ("The Board"), priority support |
| **Barrel** | Custom pricing | Multi-location support, white-label, dedicated account manager |

**Tap** is the entry-level tier for independent single-location breweries. This is the tier Taylor will lead with in outreach.

**Cask** is for breweries that want deeper integration — their tap list on a TV screen in the taproom, API access for their website, and a direct line to support.

**Barrel** is for brewery groups, regional chains, and white-label partners. Pricing on contact.

---

**Feature Comparison Table**

| Feature | Tap | Cask | Barrel |
|---|---|---|---|
| Brewery dashboard | Yes | Yes | Yes |
| Check-in analytics | Yes | Yes | Yes |
| Loyalty stamp program | Yes | Yes | Yes |
| Claim verification | Yes | Yes | Yes |
| API access | No | Yes | Yes |
| TV tap list display ("The Board") | No | Yes | Yes |
| Priority support | No | Yes | Yes |
| Multi-location management | No | No | Yes |
| White-label | No | No | Yes |
| Dedicated account manager | No | No | Yes |

---

**Social Proof Section**

"Join [X] breweries already on HopTrack"

*(Placeholder — to be updated with real number once brewery pilots begin.)*

If available before launch: one or two short pull quotes from Drew's review or from pilot brewery feedback.

---

**FAQ Section**

- **How does claiming work?** Brewery owners submit a claim with their business details. Our team verifies ownership within 2–3 business days and activates the dashboard.
- **How long does verification take?** Typically 2–3 business days. We may reach out to confirm details.
- **Can I try it free?** We offer a 30-day free trial on the Tap tier. No credit card required to start the claim process.
- **What if my brewery is already on HopTrack?** If customers have already checked in at your brewery, your listing exists — you just need to claim it. Your check-in history and ratings will be there when you log in.
- **Do I need to install anything?** No. HopTrack is a web app. Your customers use the HopTrack consumer app; you manage everything from your browser.

---

**Closing CTA**

"Ready to own your customer relationships?"

Button: "Claim Your Brewery" → `/brewery-admin/claim`

---

### Design Notes for Jamie

- Page should use the brewery-facing brand voice: professional, direct, confident — not the consumer-facing "discover great beer" tone
- Use neutral/dark color palette to feel like B2B software, not a lifestyle app
- Feature comparison table should be scannable at a glance — avoid dense prose in the table
- Hero image or illustration: something that evokes the taproom + data/dashboard (not beer-porn photography)

---

## Deliverable 2: Sales Outreach Email

**Owner:** Taylor
**Format:** Plain-text friendly, short enough to read on a phone

---

**Subject line:** Your customers are already tracking their visits — HopTrack lets you own that relationship

---

**Email body:**

Hi [Name],

Beer fans are already using HopTrack to log their visits, rate their pints, and earn loyalty stamps at breweries like [yours].

The question is whether you're the one managing that experience — or whether it's just happening without you.

With a verified HopTrack account, you get:

- **A real-time dashboard** showing check-ins, visitor trends, and your top-rated beers
- **A digital loyalty program** your customers can use from the same app they're already in
- **Analytics** that help you understand who's coming in, when, and what they're ordering

Plans start at $49/month. Setup takes minutes. We verify ownership within 2–3 business days.

[Claim your brewery on HopTrack →]

— Taylor
HopTrack

P.S. If your brewery is already in our system, your check-in history is waiting for you. Claim it and it's yours.

---

**Usage notes for Taylor:**
- Personalize `[Name]` and optionally `[yours]` with the specific brewery name
- The link `[Claim your brewery on HopTrack →]` goes to `/brewery-admin/claim`
- This email is designed for cold outreach. For warm intros or inbound leads, shorten further and lean into the specific brewery context
- A/B test subject line: alternative — "Your brewery has [X] check-ins on HopTrack — have you claimed it yet?"

---

## Deliverable 3: Demo Environment

**Owner:** Riley (infrastructure)
**Purpose:** Give Taylor a live, working brewery admin environment to use during sales calls — without requiring a real brewery account or production data

### Scope

- Riley provisions a separate Supabase project for demo use
- Demo brewery: **Pint & Pixel** (use the existing seed data / brand identity from the design system)
- A demo login credential (email + password) that grants brewery admin access to the Pint & Pixel dashboard
- Demo data: pre-seeded check-ins, ratings, tap list, loyalty program, and analytics
- The demo environment should show the product at its best — good data, realistic tap list, active loyalty program

### Requirements

- [ ] Separate Supabase project (not staging, not production)
- [ ] Demo credentials documented and shared with Taylor via 1Password or equivalent
- [ ] Demo account bypasses the claim verification flow (pre-approved)
- [ ] Tap list has 8–12 realistic beers with variety (IPAs, stouts, lagers, seasonals)
- [ ] Analytics show 30+ days of seeded check-in data so charts are populated
- [ ] Loyalty program is configured and active (e.g., 8 stamps = free pint)
- [ ] Demo environment URL documented in this repo

### What the Demo Is Not

- Not a sandbox for developer testing (use staging for that)
- Not connected to real user accounts
- Not a permanent fixture — can be reset between sales calls if needed

### Riley's Action Items

- [ ] Provision demo Supabase project
- [ ] Create seed script for Pint & Pixel demo data (or extend existing seeds)
- [ ] Document demo URL and credentials
- [ ] Confirm Taylor can access the demo independently before outreach begins

---

## Sprint Timing

**Suggested sprint:** Sprint 9 or Sprint 10, depending on velocity after Sprint 8.

If Sprint 8 (PWA polish + tap list CRUD) runs long, push Sales Prep to Sprint 10. The demo environment and landing page do not block the brewery admin work — they can run in parallel.

### Sprint Owner Assignment

| Deliverable | Owner |
|---|---|
| `/for-breweries` page build | Jordan |
| Pricing tier content + FAQ copy | Morgan + Jamie |
| Feature comparison table | Morgan |
| Sales outreach email | Taylor |
| Email A/B test subject lines | Taylor |
| Design: landing page mockup | Jamie |
| Demo environment provisioning | Riley |
| Demo seed data | Riley |
| Demo credential documentation | Riley |

---

## Success Criteria

This sprint is successful when:

1. `/for-breweries` is live and shows correct pricing for all three tiers
2. Taylor has sent the first outreach email to at least 10 brewery contacts
3. Riley has confirmed the demo environment works end-to-end and Taylor has tested it independently
4. All FAQ answers are accurate and up to date with the current product

---

*Brief authored by Morgan, Taylor, and Jamie. Last updated: 2026-03-24.*
