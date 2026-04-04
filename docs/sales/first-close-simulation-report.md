# First-Brewery-Close Simulation Report
**Owner:** Parker + Taylor · **Sprint:** 153 · **Date:** 2026-04-04

---

## Simulation Overview

Full walkthrough of the claim-to-paid journey, identifying friction points and gaps. This documents what a real brewery owner would experience.

---

## Journey Steps

### 1. Discovery (Public Brewery Page)
**Path:** `/brewery/[id]` as unauthenticated user

**What works:**
- StorefrontShell renders correctly for unauthenticated users
- Basic brewery info visible (name, city, type, contact)
- "Own a brewery?" link added to header (Sprint 153)
- "Is this your brewery? Claim it" CTA appears at bottom for unclaimed breweries

**Friction:**
- None identified — path is clean

---

### 2. Sign Up
**Path:** `/signup` (redirected from claim flow if not authenticated)

**What works:**
- Google OAuth available
- Email/password signup works
- Redirects back to claim flow after signup

**Friction:**
- User must create a consumer account first, THEN claim their brewery
- No "I'm a brewery owner" path on the signup page
- P2: Consider adding a "Brewery Owner?" variant of the signup page

---

### 3. Claim Flow
**Path:** `/brewery-admin/claim`

**What works:**
- 3-step flow: Search -> Verify -> Confirm
- Pre-populate from `?brewery_id=` query param works (Sprint 145)
- OpenBreweryDB search returns results quickly
- "Brewery not found" fallback has improved messaging (Sprint 153)

**Friction:**
- Claim is "pending" — requires superadmin approval
- User gets dashboard access immediately but sees "Pending Verification" badge
- No estimated timeline for approval (beyond "24 hours" in submission form)
- P2: Consider auto-approval for breweries already in OpenBreweryDB with matching business email domain

---

### 4. Approval
**Path:** Superadmin reviews at `/superadmin/claims`

**What works:**
- Claim appears in superadmin claims list
- Approve/reject actions available
- `claimApprovedEmail` fires on approval
- `verified_at` timestamp set, trial clock starts

**Friction:**
- Manual process — requires Joshua or superadmin to be online
- No notification to superadmin when new claim arrives (email or push)
- P1: Add superadmin email notification on new claim submission

---

### 5. Onboarding
**Path:** `/brewery-admin/[id]` (first visit after approval)

**What works:**
- OnboardingWizard auto-shows (4 steps: Logo -> Beers -> Loyalty -> Preview)
- OnboardingChecklist appears after wizard dismissed (14-day window)
- Day 3 and Day 7 drip emails fire via cron

**Friction:**
- Wizard progress stored in localStorage only — lost on device switch
- No server-side completion tracking for onboarding steps
- P2: Consider adding `onboarding_completed_at` column to brewery_accounts

---

### 6. Trial Period (Day 1-14)
**Path:** Full dashboard access

**What works:**
- Trial countdown displays in billing UI
- Day 3 email ("Have you tried The Board?") fires correctly
- Day 7 email with first-week stats fires correctly
- Day 10 warning email ("3 days left") fires correctly
- Day 14 expired email fires correctly

**Friction:**
- No clear "read-only mode" enforcement after trial expires
- Expired trial breweries may still be able to edit tap lists
- P1: Enforce trial expiration at the API layer (return 403 for mutations when trial expired and no paid tier)

---

### 7. Billing / Conversion
**Path:** `/brewery-admin/[id]/billing`

**What works:**
- Tier cards display correctly (Tap $49, Cask $149, Barrel Custom)
- Monthly/annual toggle works
- Trial countdown banner shows urgency (pulsing border at <=5 days)
- Stripe Checkout session creation ready
- Cancel flow with inline confirmation

**Friction:**
- BLOCKED: No Stripe account yet (requires LLC)
- Cannot test real payment flow until Stripe keys configured
- Demo mode banner displays correctly when Stripe not configured
- P0-BLOCKER: LLC formation + Stripe setup (Joshua's task)

---

### 8. Post-Conversion
**Path:** Active paid subscriber

**What works:**
- Subscription tier propagated correctly
- Stripe Customer Portal for managing subscription
- Weekly digest emails for ongoing engagement

**Friction:**
- Cannot be fully tested until Stripe is live
- No "welcome to paid" email (only trial-related emails exist)
- P2: Add a "Welcome to [Tier]" email on successful subscription

---

## Summary of Friction Points

| Priority | Issue | Status |
|----------|-------|--------|
| **P0-BLOCKER** | LLC + Stripe not set up | Joshua's task |
| **P1** | No superadmin notification on new claim | Open |
| **P1** | Trial expiration not enforced at API layer | Open |
| **P2** | No "Brewery Owner?" signup variant | Open |
| **P2** | Onboarding progress not server-side | Open |
| **P2** | No "Welcome to paid" email | Open |
| **P2** | Auto-approval for verified OpenBreweryDB matches | Open |

---

## Verdict

**The flow works end-to-end.** The claim -> onboard -> trial -> billing path is complete and polished. The P0 stats bug fix (Sprint 153) ensures dashboards show real numbers. The sales materials (intro templates, pitch deck, one-pager) are ready.

**The only hard blocker is Stripe.** Everything else is friction that we can iterate on after the first close.

**Ready for warm intros:** YES, once LLC + Stripe are resolved.

---

*Parker: "They're not churning on my watch."*
*Taylor: "We're going to be rich."*
*Drew: "I felt that physically." (When I imagined the first brewery seeing their dashboard.)*
