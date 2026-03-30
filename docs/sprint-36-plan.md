# Sprint 36 — Close the Loop

**Theme:** Stability, sales-readiness, and the features that close the first paid brewery.
**Status:** Not started
**Sprint Lead:** Morgan

---

## Context

Sprint 36 is the convergence sprint. By this point:
- The brewery dashboard is genuinely valuable (S34)
- The consumer experience is shareable (S35)
- We need everything tightened up to put in front of a paying customer

Taylor's first close target: a warm intro through Drew's Asheville network. The product needs to be demo-ready and contractable.

---

## Tickets

### P0 — Brewery Claim Flow Polish
**Owner:** Avery · **Est:** 1 session

The claim flow exists but it's not polished enough to be the closing moment in a sales demo. Right now it feels like a form. It needs to feel like a handshake.

**What to build:**
- Step 1: "Is this your brewery?" confirmation with logo/name/address
- Step 2: Brief onboarding — "Set up your tap list in 2 minutes"
- Step 3: Confetti + "You're live on HopTrack" celebration moment
- 14-day trial messaging baked in throughout
- Remove friction: pre-fill brewery info from existing DB record

---

### P0 — Rate Limiting on Public APIs
**Owner:** Riley · **Est:** half session

Before any brewery pays us, the API needs to be protected.

**APIs that need rate limiting:**
- `/api/reactions` — POST
- `/api/sessions` — POST
- `/api/friends` — POST
- `/api/brewery/[id]/reviews` — POST

**Approach:** Next.js middleware + upstash/redis OR simple in-memory rate limit per IP. Start simple, upgrade if needed.

---

### P1 — Brewery Admin Email Notifications
**Owner:** Avery · **Est:** 1 session

Brewery owners need to know when their location is active — especially early adopters who are watching HopTrack for the first time.

**What to build:**
- Weekly digest email: visit count, new check-ins, top beer, new followers
- Trigger: Sunday 9am via Supabase Edge Function cron
- Template: cream/gold aesthetic matching the brand
- Opt-out toggle in brewery admin settings

---

### P1 — "Powered by HopTrack" on Board + QR Tents
**Owner:** Jamie (design) + Avery (build) · **Est:** half session

Every TV display in every taproom is a free billboard. Every QR tent on a table is a free acquisition card.

**What to build:**
- Subtle "Powered by HopTrack" + HopMark in Board footer (already has HopMark, just needs consistent treatment)
- QR tent footer: "Download HopTrack — track every pour" + App Store badge placeholder
- Small, tasteful — Drew will pull it if it's embarrassing

---

### P1 — Case Study Infrastructure
**Owner:** Sage · **Est:** half session (docs only)

Taylor needs a before/after story for the first close.

**What to build:**
- `docs/sales/case-study-template.md` — standard format: brewery profile, pain before, solution, metrics after
- Metrics we can pull: visit counts, unique visitors, check-ins per session, top beers, repeat visitor %
- "HopTrack Report" page in brewery admin that generates a one-page PDF-ready summary (stretch)

---

### P2 — Migration Consolidation
**Owner:** Quinn + Riley · **Est:** half session

37 migrations is getting long. Consolidate where safe.

**What to do:**
- Audit migrations 028–037 for any that can be squashed
- Document final clean migration state
- Update seed files to reflect consolidated state

---

### P2 — @ Mentions in Comments
**Owner:** Avery · **Est:** 1 session

**What to build:**
- `@username` detection in comment input (triggered on `@`)
- Inline user picker dropdown (search from friends list)
- Notification: `mention` type → "Joshua mentioned you in a comment"
- Migration 040: `mention` notification type

---

## Deferred / Carry
- Group sessions (complex, Sprint 37+)
- Referral mechanic (Sprint 37)
- Supabase Edge Function for session-end (performance sprint)
- TestFlight (Apple Developer account still needed)

---

## Team Notes
- **Taylor:** "Sprint 36 is the sprint where we close. Everything else supports that."
- **Drew:** "The claim flow polish is everything. If a brewery owner sees a clunky claim page after I've been hyping this product, I'm done."
- **Riley:** Rate limiting is not optional before we take money. Non-negotiable P0.
- **Jordan:** Claim flow should use the existing `BreweryOnboardingCard` component as a base — don't rebuild what's there.
- **Casey:** Reese and I want sign-off rights on anything that touches the claim flow before it ships. This is the money page.
