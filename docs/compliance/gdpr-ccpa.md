# GDPR/CCPA Compliance Assessment — HopTrack

> Sprint 151 — The Ops Room (Sam)
> Assessment Date: April 4, 2026

## Executive Summary

HopTrack is a US-based craft beer check-in platform launching with an Asheville, NC focus. At launch, EU exposure is minimal and CCPA thresholds are not met. Existing privacy controls (account deletion, data security, no data selling) provide a solid foundation. This assessment identifies what we have, what we need, and when.

---

## GDPR Assessment

### Applicability at Launch

| Factor | Status | Notes |
|--------|--------|-------|
| EU users expected | Low | US-only launch, Asheville-focused |
| EU marketing planned | No | No EU ad spend or outreach |
| EU data processing | Minimal | Supabase (AWS us-east-1), Sentry, Resend — all US-based |

**Conclusion:** GDPR applies if ANY EU resident uses HopTrack, but enforcement risk is very low at launch scale. Proactive compliance recommended as a best practice.

### Data We Collect

| Data Category | Examples | Lawful Basis |
|---------------|----------|-------------|
| Account info | Email, display name, username | Consent (account creation) |
| Session data | Beers logged, ratings, breweries visited | Consent + Legitimate interest |
| Profile info | Bio, home city, avatar | Consent (optional) |
| Push tokens | Web Push subscription | Explicit consent (opt-in) |
| Device info | Anonymous error tracking via Sentry | Legitimate interest |
| Location data | Session geo-coordinates (optional) | Consent |

### What We Already Have

- **Right to Deletion:** Account deletion flow (`/api/auth/delete-account`) with full cascade delete (Sprint 60)
- **Data Security:** Row Level Security (RLS) on all tables, HTTPS/TLS, AES-256-GCM for POS tokens
- **Consent:** Push notifications are opt-in, cookie consent banner records accept/decline
- **No Data Selling:** Privacy policy explicitly states this
- **Transparency:** Privacy policy documents all data collection
- **Data Minimization:** We collect only what the product needs

### Gaps to Address

| Gap | Priority | When to Fix |
|-----|----------|-------------|
| No data export (DSAR) | P2 | Before 1,000 EU users or EU marketing |
| No DPO appointment | P3 | Not required at current scale (<250 employees) |
| No consent granularity | P2 | Cookie consent is all-or-nothing; no per-category toggles |
| No data processing register | P3 | Recommended at scale, not legally required yet |
| Sub-processor list not public | P2 | Document Supabase, Sentry, Resend, Stripe as sub-processors |

### Recommendations

1. **Now:** Add sub-processor list to privacy page (Supabase, Sentry, Resend, Stripe)
2. **At 500 users:** Implement data export endpoint (`GET /api/users/export`)
3. **At EU launch:** Full cookie consent with category toggles, DPO consideration
4. **Ongoing:** Annual privacy review

---

## CCPA Assessment

### Applicability Thresholds

| Threshold | Required | HopTrack Status |
|-----------|----------|-----------------|
| Annual gross revenue > $25M | Any one | $0 (pre-revenue) |
| Buy/sell data of 100K+ CA consumers | Any one | 0 (no data selling) |
| 50%+ revenue from selling data | Any one | 0% (no data selling) |

**Conclusion:** CCPA does NOT currently apply to HopTrack. None of the three thresholds are met. However, proactive compliance is low-cost and builds trust.

### What We Already Have

- **Right to Delete:** Account deletion with cascade (Sprint 60)
- **Right to Know:** Privacy policy documents all collection
- **No Data Selling:** Explicit in privacy policy
- **Non-discrimination:** No feature gating based on privacy choices

### What We Added (Sprint 151)

- **California Residents section** added to privacy page (`app/privacy/page.tsx`)
- **Data Retention section** added to privacy page
- Explicit CCPA rights enumeration (know, delete, opt-out of sale, non-discrimination)

### Gaps to Address

| Gap | Priority | When to Fix |
|-----|----------|-------------|
| No "Do Not Sell" link | P3 | Required only when threshold is met |
| No CCPA-specific data export | P2 | Same as GDPR DSAR — build once, serve both |
| No privacy request intake form | P2 | Currently email-only; form would be more accessible |

### Recommendations

1. **Now:** California Residents section in privacy policy (done, Sprint 151)
2. **At $1M ARR:** Add "Do Not Sell My Personal Information" footer link (even if not selling)
3. **At threshold:** Full CCPA compliance audit, designated privacy contact

---

## Data Retention Policy

| Data Type | Retention Period | Justification |
|-----------|-----------------|---------------|
| Account data (email, name, bio) | Until account deletion | Core product function |
| Session data (beers, ratings) | Indefinite | Core product feature (history, stats, achievements) |
| Beer logs and reviews | Indefinite | User-generated content, product value |
| Push notification tokens | Until revoked or account deletion | Required for notification delivery |
| Error tracking (Sentry) | 90 days | Sentry default retention |
| Email delivery logs (Resend) | 30 days | Troubleshooting failed deliveries |
| Billing records (Stripe) | 7 years | Legal/tax requirements |
| API keys | Until revoked or account deletion | Brewery API access |
| Crawled beer data (Barback) | Indefinite | Public data enrichment |
| Admin audit logs | Indefinite | Compliance and security |

### Deletion Cascade

When a user deletes their account (`/api/auth/delete-account`):
- Profile data: deleted
- Sessions and beer logs: deleted
- Reviews, comments, reactions: deleted
- Friend connections: deleted
- Achievements: deleted
- Push subscriptions: deleted
- Notification preferences: deleted
- Auth record: deleted via `auth.admin.deleteUser()`

Billing records in Stripe are retained per legal requirements.

---

## Service Providers (Sub-Processors)

| Provider | Purpose | Data Processed | Location |
|----------|---------|---------------|----------|
| Supabase | Database, auth, storage | All user data | AWS us-east-1 (US) |
| Sentry | Error tracking | Anonymous device info, error context | US |
| Resend | Transactional email | Email addresses, email content | US |
| Stripe | Billing | Brewery owner billing info | US |
| Vercel | Hosting, CDN | Request logs, IP addresses | Global edge, US origin |
| Anthropic | AI features (HopRoute, suggestions) | Anonymized brewery/beer data | US |

---

## Review Schedule

| Review | Frequency | Owner |
|--------|-----------|-------|
| Privacy policy accuracy | Quarterly | Sam |
| Data collection audit | Semi-annually | Sam + Riley |
| Sub-processor review | Annually | Morgan |
| Full compliance assessment | Annually or at threshold triggers | Sam |

---

## Summary

HopTrack is in good shape for launch:
- Core privacy rights (deletion, transparency, no selling) are implemented
- GDPR risk is low at launch scale
- CCPA does not currently apply
- Sprint 151 added California Residents and Data Retention sections to the privacy page
- Key gaps (data export, consent granularity) are documented with clear trigger points

**Next compliance milestone:** Build data export endpoint when approaching 500+ EU users or $1M ARR.
