# HopTrack Legal Documents

> **Status:** DRAFT — All documents use `[HopTrack LLC]` as entity placeholder.
> Once NC LLC approval lands, find-and-replace with the exact legal name.
> **Attorney review required before any document goes live.**

---

## Document Index

| Document | File | Status | Needed For |
|----------|------|--------|------------|
| Privacy Policy | `privacy-policy.md` | Draft | Waitlist + Full Launch |
| Terms of Service | `terms-of-service.md` | Draft | Waitlist + Full Launch |
| Cookie Policy | `cookie-policy.md` | Draft | Waitlist + Full Launch |
| Data Processing Agreement | `data-processing-agreement.md` | Draft | Brewery Onboarding |
| Subscription & Billing Terms | `subscription-terms.md` | Draft | Stripe Go-Live |
| Waitlist Terms | `waitlist-terms.md` | Draft | Pre-Launch Signup |
| Security Policy | `security-policy.md` | Draft | Brewery Sales + Trust |

---

## Legal Launch Sequence

### Phase 1: Waitlist / "Notify Me" Page
_Can ship as soon as LLC clears + domain email works_

- [ ] LLC approved — replace `[HopTrack LLC]` with legal entity name in all docs
- [ ] Set up `privacy@hoptrack.beer` email forwarding
- [ ] Set up `legal@hoptrack.beer` email forwarding
- [ ] Set up `security@hoptrack.beer` email forwarding
- [ ] Update `app/privacy/page.tsx` with enhanced Privacy Policy content
- [ ] Update `app/terms/page.tsx` with enhanced ToS content
- [ ] Create `/cookie-policy` page from `cookie-policy.md`
- [ ] **Age gate: date-of-birth entry at signup, NOT just a checkbox** (industry standard per Beer Institute/Brewers Association codes; required for App Store 17+ rating later; store DOB, reject under-21)
- [ ] Deploy Waitlist Terms on signup page (inline or linked)
- [ ] Verify CAN-SPAM compliance: physical address in marketing email footer, unsubscribe link
- [ ] Separate transactional vs marketing email streams (transactional = password reset, account confirmations; marketing = updates, brewery features — different compliance rules)
- [ ] Implement Global Privacy Control (GPC) signal detection — 12+ states require it as of 2026
- [ ] SSL/HTTPS confirmed on production domain

### Phase 2: Brewery Onboarding (First Paid Customers)
_Before accepting any brewery signups or money_

- [ ] Attorney review of Privacy Policy + ToS + Subscription Terms (budget: $500–1,500 for 2-hour review)
- [ ] Attorney review of DPA (budget: $300–800 — can often bundle with above)
- [ ] DPA signing flow ready (DocuSign, PandaDoc, or PDF + email)
- [ ] Stripe account live with correct entity info
- [ ] Set up `support@hoptrack.beer` email
- [ ] Set up `sales@hoptrack.beer` email
- [ ] Set up `billing@hoptrack.beer` email
- [ ] Publish Security Policy (public or shared on request)
- [ ] **Build FTC-compliant incentivized review indicator in UI** — every rating that earned XP needs a visible tag (e.g., "XP Check-in" badge next to the rating). Required by FTC Endorsement Guides + Consumer Reviews Rule.
- [ ] **Self-service cancellation flow** — must be in the dashboard, no phone/email required (California CARL mandates online cancel if online signup)
- [ ] **Auto-renewal consent checkbox at subscription** — standalone, not buried in ToS. Store consent timestamp + record for 3+ years (CARL requirement).
- [ ] **Renewal reminder emails** — 15-45 days before annual renewal (CARL), 3 days before monthly (best practice)

### Phase 3: Scale Triggers
_Monitor these thresholds — action required when hit_

- [ ] 500+ EU users → implement data export endpoint (GDPR DSAR)
- [ ] $1M ARR → add "Do Not Sell" footer link (CCPA)
- [ ] 10+ brewery partners → formalize incident notification SLA
- [ ] App Store launch → age rating configuration + App Store privacy labels

---

## Physical Address Requirement

CAN-SPAM and state privacy laws require a physical mailing address. Options:

1. **Registered Agent address** — whatever NC provides with the LLC
2. **PO Box** — ~$20/month, keeps home address private
3. **Virtual office** — ~$50/month, gives a street address (some services)

**Decision needed:** Which address to use in legal docs and email footers.

---

## Email Addresses to Configure

| Address | Purpose | Priority |
|---------|---------|----------|
| `privacy@hoptrack.beer` | Privacy requests, CCPA/GDPR | Phase 1 |
| `legal@hoptrack.beer` | Legal notices, ToS questions | Phase 1 |
| `support@hoptrack.beer` | Customer support | Phase 2 |
| `sales@hoptrack.beer` | Brewery sales inquiries | Phase 2 |
| `billing@hoptrack.beer` | Billing questions | Phase 2 |

All can forward to Joshua's personal email initially. Separate inboxes when volume warrants it.
