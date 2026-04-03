# HopTrack — Brewery Onboarding Playbook
**Owner:** Parker (Customer Success Lead) · **Sprint 145**

---

## Purpose
This is the step-by-step guide for what happens when a brewery claims their listing through close. Every day matters — a brewery that sets up in the first 48 hours converts at 3x the rate of one that waits.

---

## Pre-Approval Checklist (Superadmin)

Before approving a claim, verify:
- [ ] Business email domain matches brewery website (or is a known owner email)
- [ ] Brewery exists in our database (7,177 from OpenBreweryDB) or is a legitimate new submission
- [ ] Claimant's role makes sense (owner or manager of a real brewery)
- [ ] No duplicate claims from different users for the same brewery
- [ ] If suspicious: Google the brewery + contact info to verify legitimacy

**Approval:** PATCH `/api/admin/claims` with `{ claimId, action: "approve" }` from `/superadmin/claims`
**Rejection:** Same route with `action: "reject"` — claimant gets a professional email asking for additional verification

---

## Day 0 — Approval Day

**Automated:**
- Claim approved email fires (celebratory, links to dashboard, mentions 14-day trial)
- `brewery_accounts.verified = true`, `verified_at = now()`
- Dashboard access unlocked
- Onboarding wizard auto-shows (logo → beers → loyalty → preview)
- Onboarding checklist appears on dashboard (persists 14 days)

**Parker's action:**
- Note the brewery name and owner in your tracking sheet
- No outreach yet — let them explore on their own for 24 hours

---

## Day 1 — Soft Check

**Parker's action:**
- Check if they've logged in since approval (check `sessions` or `brewery_accounts` last activity)
- If they uploaded a logo or added beers: great, leave them alone
- If dashboard is untouched: send a personal email

**Template (if untouched):**
> Subject: Quick question about [Brewery Name]
>
> Hey [First Name],
>
> Parker here from HopTrack — I saw your brewery just got verified. Welcome!
>
> I wanted to check: did the setup wizard open for you? It walks you through adding your logo, beers, and loyalty program in about 5 minutes.
>
> If you hit any snags or have questions about how things work, I'm right here. Reply anytime.
>
> Cheers,
> Parker

---

## Day 3 — The Board Tip

**Automated:**
- Day-3 onboarding email fires ("Have you tried The Board?")

**Parker's action:**
- Check setup progress:
  - Has logo? Has beers? Has loyalty program?
  - If all three: they're engaged, no action needed
  - If missing beers: consider a personal nudge about the tap list
- Log a note in the admin user notes (`/superadmin/breweries/[id]`)

---

## Day 7 — First Week Stats

**Automated:**
- Day-7 onboarding email fires (first-week stats: sessions, beers logged, followers)

**Parker's action:**
- Review their first-week stats in the dashboard
- If they have sessions: send a congratulatory note
- If zero sessions: escalate to Taylor — may need a more hands-on conversation
- Log notes

**Template (if zero sessions):**
> Subject: Getting your first check-in at [Brewery Name]
>
> Hey [First Name],
>
> I noticed [Brewery Name] hasn't had any customer check-ins yet — totally normal for the first week! Here are the two fastest ways to get started:
>
> 1. **QR Table Tents** — Print and place on tables. Customers scan to check in instantly.
> 2. **Tell your bartender** — "When someone orders, mention we're on HopTrack." Word of mouth works fast in taprooms.
>
> Want me to walk you through setting up the QR codes? Takes about 3 minutes.
>
> Parker

---

## Day 10 — Trial Warning Context

**Automated:**
- Trial warning email fires (3 days left)

**Parker's action:**
- Check if they're active (sessions, beers, loyalty edits in the last 3 days)
- If active: they'll likely convert. Let the email do its work.
- If inactive: flag to Taylor for a conversion call

---

## Day 13 — Pre-Expiration Touch

**Parker's action (manual):**
- If not yet subscribed and actively using the platform:

**Template:**
> Subject: Your trial ends tomorrow — quick thought
>
> Hey [First Name],
>
> Your HopTrack trial for [Brewery Name] ends tomorrow. After that, your dashboard goes read-only — but all your data stays safe.
>
> If you want to keep things running (tap list, loyalty, analytics, The Board), it's $49/mo for the Tap tier. No contract, cancel anytime.
>
> Want me to walk you through the upgrade? Takes 30 seconds.
>
> Parker

---

## Day 14 — Trial Expired

**Automated:**
- Trial expired email fires
- Dashboard goes read-only

**Parker's action:**
- If they were active: schedule a call (Taylor leads, Parker supports)
- If they were never active: mark as "cold" in notes, revisit in 30 days
- Log final status

---

## Day 30 — Win-Back (Inactive Only)

**Parker's action (if trial expired without converting):**

**Template:**
> Subject: Still here when you're ready
>
> Hey [First Name],
>
> Just wanted to let you know — your [Brewery Name] data is still safe on HopTrack. If you decide to come back, everything will be right where you left it.
>
> We've also shipped some new features since you last checked in: [mention 1-2 recent features].
>
> No pressure. We'll be here.
>
> Parker

---

## Metrics to Track

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Time to first beer added | < 24 hours | `beers.created_at` - `verified_at` |
| Time to first session | < 7 days | First `session.started_at` after `verified_at` |
| Setup completion rate | > 70% | Logo + beers + loyalty within 14 days |
| Trial → Paid conversion | > 25% | Breweries that upgrade before trial expires |
| Day-30 reactivation | > 10% | Expired trials that convert within 30 days |

---

## Escalation Path

- **Setup issues** → Parker handles directly (email + admin dashboard)
- **Billing questions** → Parker handles (point to billing page or Stripe portal)
- **Feature requests** → Parker logs to roadmap backlog, routes to Morgan
- **Unhappy/churning** → Parker flags to Taylor + Morgan immediately
- **Technical bugs** → Parker files with Casey, routes to Jordan if P0

---

*This is a living document. Update after every conversion to capture what worked.*
