# Privacy Policy

**Effective Date:** [DATE]
**Last Updated:** [DATE]
**Entity:** [HopTrack LLC], a North Carolina limited liability company

---

## Overview

HopTrack ("we," "us," "our") operates the HopTrack platform at hoptrack.beer (the "Service"). This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our Service.

By using HopTrack, you agree to the collection and use of information as described in this policy. If you do not agree, please do not use the Service.

---

## Information We Collect

### Information You Provide

| Data | When | Required? |
|------|------|-----------|
| Email address | Account creation | Yes |
| Display name | Account creation | Yes |
| Username | Account creation | Yes |
| Password | Account creation (via Supabase Auth) | Yes |
| Profile bio | Profile setup | No |
| Home city | Profile setup | No |
| Avatar photo | Profile setup | No |
| Beer ratings and reviews | Session logging | Voluntary |
| Session photos | Session logging | Voluntary |

### Information Collected Automatically

| Data | Purpose | Basis |
|------|---------|-------|
| Device and browser info | Error tracking (Sentry) | Legitimate interest |
| IP address | Security, rate limiting | Legitimate interest |
| Usage patterns | Product improvement | Legitimate interest |
| Cookie data | Authentication, preferences | Consent (see Cookie Policy) |
| Push notification tokens | Notification delivery | Explicit consent |

### Information From Third Parties

- **Supabase Auth:** If you sign in via a social provider (Google, Apple), we receive your email and display name from that provider.
- **Stripe:** If you are a brewery partner with a paid subscription, Stripe processes your billing information. We receive only non-sensitive confirmation data (subscription status, plan tier), not your full payment card details.

---

## How We Use Your Information

We use your information to:

1. **Provide the Service** — Accounts, sessions, ratings, achievements, social features, brewery discovery
2. **Improve the Service** — Bug fixes, performance optimization, feature development
3. **Communicate with you** — Transactional emails (welcome, password reset), product updates (opt-in), push notifications (opt-in)
4. **Generate analytics for brewery partners** — Aggregate, anonymized data only (e.g., "47 sessions logged this week"). We never share individual user identity or activity with breweries unless you explicitly interact with a brewery's loyalty program.
5. **Ensure security** — Rate limiting, fraud detection, abuse prevention
6. **Comply with legal obligations** — Responding to lawful requests, tax/billing record retention

We do **not** use your data for:
- Selling to third parties
- Targeted advertising
- Profiling for credit, insurance, or employment decisions

---

## How We Share Your Information

We do not sell your personal information. We share data only in these circumstances:

### With Other Users (Based on Your Settings)
- Public profile: display name, avatar, username, bio, stats
- Session activity: visible to friends or public, depending on your privacy settings
- Reviews and ratings: visible on beer and brewery pages

### With Brewery Partners
- **Aggregate analytics only:** Session counts, popular beers, peak hours. No individual user identity.
- **Loyalty program data:** If you join a brewery's loyalty program, the brewery can see your loyalty status, points, and visit history at their brewery only.

### With Service Providers (Sub-Processors)

| Provider | Purpose | Data Processed | Location |
|----------|---------|----------------|----------|
| Supabase | Database, authentication, file storage | All user data | AWS us-east-1 (US) |
| Vercel | Hosting, CDN, edge functions | Request logs, IP addresses | Global edge, US origin |
| Sentry | Error monitoring | Anonymous device info, error context | US |
| Resend | Transactional email | Email addresses, email content | US |
| Stripe | Payment processing | Brewery billing info | US |
| Anthropic | AI features (HopRoute) | Anonymized brewery/beer data only | US |

### As Required by Law
We may disclose information if required by law, subpoena, court order, or government request.

---

## Data Retention

| Data Type | Retention Period | Reason |
|-----------|-----------------|--------|
| Account data (email, name, bio) | Until account deletion | Core service function |
| Session data (beers, ratings, reviews) | Indefinite | Core product feature (history, stats, achievements) |
| Push notification tokens | Until revoked or account deletion | Notification delivery |
| Error tracking (Sentry) | 90 days | Sentry default retention |
| Email delivery logs (Resend) | 30 days | Delivery troubleshooting |
| Billing records (Stripe) | 7 years | Legal/tax requirements |
| Brewery API keys | Until revoked or account deletion | API access |
| Admin audit logs | Indefinite | Security and compliance |

---

## Your Rights and Choices

### All Users

- **Access your data:** View your profile, sessions, and activity in the app at any time
- **Correct your data:** Edit your profile information in Settings
- **Delete your account:** Use the Delete Account option in Settings. This permanently removes your profile, sessions, reviews, friend connections, achievements, and all associated data.
- **Control visibility:** Set your profile to public or private in Settings
- **Manage notifications:** Enable/disable push notifications and email preferences in Settings
- **Request data export:** Email privacy@hoptrack.beer (automated export coming soon)

### US State Privacy Law Rights

HopTrack respects the privacy rights granted by state consumer privacy laws. As of 2026, comprehensive privacy laws are in effect in 20+ states including California (CCPA/CPRA), Virginia, Colorado, Connecticut, Utah, Iowa, Indiana, Tennessee, Texas, Montana, Oregon, Delaware, Maryland, Minnesota, Nebraska, New Hampshire, New Jersey, Kentucky, Rhode Island, and others.

Regardless of your state, HopTrack provides all US users with the following rights:

- **Right to Know:** What personal information we collect, how we use it, and who we share it with
- **Right to Delete:** Delete your personal information (use Delete Account in Settings or email us)
- **Right to Correct:** Correct inaccurate personal information (edit your profile in Settings)
- **Right to Opt Out of Sale:** We do not sell personal information. We do not engage in targeted advertising using your personal data. We do not share personal information for cross-context behavioral advertising.
- **Right to Non-Discrimination:** We will not treat you differently for exercising your privacy rights
- **Right to Data Portability:** Request a machine-readable copy of your data (email privacy@hoptrack.beer)

**For California Residents (CCPA/CPRA):** You have additional rights under the California Consumer Privacy Act and California Privacy Rights Act. Categories of personal information collected in the past 12 months are described in the "Information We Collect" section above. We do not sell or share (as defined by the CPRA) personal information. We do not use sensitive personal information for purposes beyond what is necessary to provide the Service.

**For Texas Residents (TDPSA):** The Texas Data Privacy and Security Act applies to businesses operating in Texas regardless of revenue or data volume thresholds. You have the right to know, access, correct, delete, and obtain a portable copy of your data.

**For Maryland/Delaware Residents:** These states apply privacy protections at a lower threshold (35,000 consumers). Your rights are the same as listed above.

**For Nebraska Residents:** Nebraska's privacy law applies to all businesses operating in the state regardless of data volume. Your rights are the same as listed above.

To exercise any of these rights: use in-app controls or email privacy@hoptrack.beer. We respond within 45 days (or 30 days where state law requires it). If we need additional time, we will notify you.

We do not require account verification beyond confirming your email address to process privacy requests.

### European Residents (GDPR)

If you are located in the European Economic Area, you have additional rights:

- **Access:** Request a copy of your personal data
- **Rectification:** Request correction of inaccurate data
- **Erasure:** Request deletion of your data ("right to be forgotten")
- **Portability:** Request your data in a machine-readable format
- **Restrict processing:** Request we limit how we use your data
- **Object:** Object to processing based on legitimate interest
- **Withdraw consent:** Withdraw consent at any time without affecting prior processing

**Legal bases for processing:** Consent (account creation, notifications), Contractual necessity (providing the Service), Legitimate interest (security, analytics, product improvement).

To exercise these rights: email privacy@hoptrack.beer. We respond within 30 days.

---

## Data Security

We implement industry-standard security measures:

- **Encryption in transit:** All connections use HTTPS/TLS
- **Encryption at rest:** Database encrypted at rest (Supabase/AWS standard)
- **Row Level Security:** Supabase RLS policies ensure users can only access their own data
- **Authentication:** Secure auth via Supabase Auth (bcrypt password hashing, JWTs)
- **POS token encryption:** Brewery POS integration tokens encrypted with AES-256-GCM
- **Rate limiting:** Applied to authentication and mutation endpoints
- **Access control:** Role-based access for brewery admin features
- **Monitoring:** Sentry error tracking, uptime monitoring, security logging

No system is 100% secure. If we discover a data breach affecting your personal information, we will notify you and applicable authorities as required by law (within 72 hours for GDPR-covered individuals).

---

## Children's Privacy

HopTrack is an alcohol-related platform. **You must be at least 21 years old to use this Service.** We do not knowingly collect information from anyone under 21. If we learn we have collected data from someone under 21, we will delete it promptly. Contact us at privacy@hoptrack.beer if you believe a minor has provided us with personal information.

---

## Global Privacy Control (GPC) and Universal Opt-Out

HopTrack recognizes and honors the **Global Privacy Control (GPC)** browser signal. When we detect a GPC signal from your browser, we treat it as a valid opt-out request for:

- Sale of personal information (we do not sell data, but we honor the signal as confirmation)
- Sharing of personal information for cross-context behavioral advertising (we do not engage in this)
- Targeted advertising based on personal information

As of 2026, the following states require recognition of universal opt-out mechanisms: California, Colorado, Connecticut, Delaware, Maryland, Minnesota, Montana, Nebraska, New Hampshire, New Jersey, Oregon, and Texas. HopTrack honors GPC signals regardless of your state.

You can enable GPC in your browser settings or by installing a GPC-compatible browser extension. Learn more at globalprivacycontrol.org.

---

## International Data Transfers

HopTrack is based in the United States. If you access the Service from outside the US, your information will be transferred to and processed in the US. By using the Service, you consent to this transfer.

---

## Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of material changes by:

- Posting the updated policy on this page with a new "Last Updated" date
- Sending an email notification for significant changes

Your continued use of the Service after changes constitutes acceptance of the updated policy.

---

## Contact Us

For privacy-related questions or to exercise your rights:

- **Email:** privacy@hoptrack.beer
- **Mail:** [HopTrack LLC], [Physical Address], [City, State ZIP]

---

*This document is a template and should be reviewed by a qualified attorney before publication.*
