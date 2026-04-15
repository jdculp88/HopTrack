# Sprint 75 — Revenue Plumbing
**PM:** Morgan | **Date:** 2026-03-31
**Arc:** Launch or Bust (Sprints 75-78)

> The onboarding wizard shipped early (Sprint 74), so we're pulling F-001 and F-002 forward. No revenue without billing. No trial conversion without email. This sprint closes both gaps.

---

## Goals

### Goal 1: Complete Stripe Billing (F-001)
**Owner:** Avery (Dev Lead) | **Reviewer:** Jordan (Architecture)

The Stripe integration from Sprint 46 is functional but incomplete. We need to make it production-ready.

**Deliverables:**
1. **Annual billing option** — Add yearly pricing to `lib/stripe.ts` ($470/yr Tap = 20% discount, $1,430/yr Cask = 20% discount). Toggle on BillingClient between monthly/annual. New Stripe price IDs in config.
2. **In-app subscription management** — Cancel/downgrade UI in BillingClient (not just Stripe portal redirect). Inline confirmation with AnimatePresence, clear explanation of what happens on cancel (downgrade to free at period end).
3. **Webhook hardening** — Add handling for `invoice.payment_failed`, `invoice.paid`, `customer.subscription.trial_will_end` events. Proper error logging. Idempotency checks.
4. **Trial-to-paid flow** — When trial expires (14 days), show upgrade prompt on dashboard. Block premium features gracefully (not hard lockout, gentle "Upgrade to keep using X" inline messages).

**Convention:** All code works in demo mode when Stripe keys are absent (per stub convention). `isStripeConfigured()` guard stays.

### Goal 2: Email Infrastructure (F-002)
**Owner:** Avery (Dev Lead) | **Infra:** Riley + Quinn

Build the email sending system and first set of templates. Stubbed until Resend API key is added.

**Deliverables:**
1. **Email service layer** — `lib/email.ts` with `sendEmail()` function. Uses Resend SDK. Falls back to console.log when `RESEND_API_KEY` is not set (dev mode). Install `resend` package.
2. **Email templates** — React Email templates in `emails/` directory:
   - `welcome.tsx` — New user welcome (consumer sign-up)
   - `brewery-welcome.tsx` — Brewery claim/sign-up welcome
   - `trial-warning.tsx` — Day 10 of 14 trial warning
   - `trial-expired.tsx` — Trial ended, upgrade CTA
   - `password-reset.tsx` — Password reset link
   - `weekly-digest.tsx` — Brewery weekly stats summary (template only, sending logic in later sprint)
3. **Drip trigger system** — `lib/email-triggers.ts` with functions:
   - `onUserSignUp(userId)` — sends welcome email
   - `onBreweryClaim(breweryId, userId)` — sends brewery welcome
   - `onTrialWarning(breweryId)` — called by scheduled job (future)
   - `onTrialExpired(breweryId)` — called by scheduled job (future)
   - `onPasswordReset(email, token)` — wired to auth reset flow
4. **Wire into existing flows** — Connect `onUserSignUp` to sign-up API, `onBreweryClaim` to claim flow, `onPasswordReset` to reset flow.
5. **Env config** — Add `RESEND_API_KEY` and `RESEND_FROM_EMAIL` to `.env.local.example`.

**Convention:** Full email UI renders in dev (console.log output shows what would send). Zero cost until Resend key is added.

---

## Out of Scope
- CI/CD pipeline (Sprint 76)
- Staging environment (Sprint 76)
- Actually creating Stripe account (blocked on business entity)
- Weekly digest cron job (Sprint 79, Stick Around arc)
- REQ-069 / REQ-070 (queued for future arcs)

## Dependencies
- `resend` npm package (new dependency)
- `@react-email/components` npm package (email templates)

## Success Criteria
- [ ] BillingClient shows monthly/annual toggle with correct pricing
- [ ] Cancel subscription flow works inline (not just portal redirect)
- [ ] Webhook handles payment_failed + trial_will_end events
- [ ] Trial expiry shows graceful upgrade prompts (not hard lockout)
- [ ] `lib/email.ts` sends via Resend when configured, logs when not
- [ ] 6 email templates render correctly
- [ ] Sign-up triggers welcome email
- [ ] Claim flow triggers brewery welcome email
- [ ] Password reset sends email with token
- [ ] `npm run build` passes clean

---

*"We're going to be rich — but first we need the pipes to carry the money." — Taylor*
