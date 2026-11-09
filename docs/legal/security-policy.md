# Security Policy

**Effective Date:** [DATE]
**Last Updated:** [DATE]
**Entity:** [HopTrack LLC], a North Carolina limited liability company

---

## Overview

HopTrack takes the security of your data seriously. This document describes the technical and organizational measures we implement to protect user data, brewery partner data, and the integrity of the HopTrack platform.

This policy is intended for brewery partners evaluating HopTrack, users who want to understand our security posture, and for internal reference.

---

## Infrastructure Security

### Hosting and Deployment

| Component | Provider | Security Features |
|-----------|----------|-------------------|
| Application hosting | Vercel | Edge network, automatic HTTPS, DDoS protection, SOC 2 Type II compliant |
| Database & Auth | Supabase (AWS us-east-1) | SOC 2 Type II, encrypted at rest (AES-256), encrypted in transit (TLS 1.2+), daily backups |
| Error monitoring | Sentry | SOC 2 Type II, encrypted in transit |
| Email delivery | Resend | TLS encryption, SPF/DKIM/DMARC email authentication |
| Payment processing | Stripe | PCI DSS Level 1, the highest level of payment security certification |

### Network Security

- **HTTPS everywhere:** All connections to HopTrack use TLS 1.2 or higher. HTTP requests are automatically redirected to HTTPS.
- **HSTS:** HTTP Strict Transport Security headers prevent protocol downgrade attacks.
- **Content Security Policy:** CSP headers restrict resource loading to trusted origins.
- **No mixed content:** All resources (scripts, images, APIs) are served over HTTPS.

---

## Application Security

### Authentication

- **Password hashing:** User passwords are hashed using bcrypt with a cost factor of 10 (via Supabase Auth). We never store plaintext passwords.
- **Session management:** JWT-based sessions with configurable expiration. Refresh tokens rotate automatically.
- **Social login:** OAuth 2.0 via Google and Apple (handled by Supabase Auth). We receive only the minimum required profile data.
- **No custom auth:** We use Supabase Auth, a battle-tested authentication platform, rather than rolling our own. This reduces attack surface significantly.

### Authorization

- **Row Level Security (RLS):** Every database table has RLS policies that ensure users can only read and write their own data. Brewery partners can only access their own brewery's data.
- **Role-based access:** Brewery admin features are restricted to authenticated users with the `brewery_admin` role for their specific brewery.
- **Superadmin isolation:** Superadmin routes and APIs are restricted to explicitly authorized accounts.
- **API route protection:** All mutating API endpoints verify authentication and authorization before processing requests.

### Rate Limiting

- **Authentication endpoints:** Rate-limited to prevent brute force attacks (Supabase-native rate limiting on auth, plus custom rate limits on HopTrack auth endpoints)
- **API endpoints:** All mutating endpoints (POST, PUT, DELETE) are rate-limited
- **Username check:** 20 requests/minute
- **Welcome/onboarding:** 5 requests/minute
- **General API:** Configurable per-endpoint based on sensitivity

### Input Validation and Injection Prevention

- **SQL injection:** Prevented by using Supabase's client SDK (parameterized queries) and RLS. No raw SQL queries from user input.
- **XSS:** React's default JSX escaping prevents cross-site scripting. No `dangerouslySetInnerHTML` on user-controlled content.
- **CSRF:** Token-based authentication (JWT) is inherently CSRF-resistant for API calls. Cookie-based auth flows use SameSite attributes.

---

## Data Security

### Encryption

| Data State | Method | Standard |
|------------|--------|----------|
| In transit | TLS 1.2+ | Industry standard |
| At rest (database) | AES-256 | AWS/Supabase managed |
| At rest (file storage) | AES-256 | AWS S3 server-side encryption |
| POS integration tokens | AES-256-GCM | Application-level encryption with per-token IVs |
| Passwords | bcrypt (cost 10) | One-way hash, no decryption possible |

### Data Isolation

- **Multi-tenant isolation:** Brewery data is isolated at the database level via RLS policies. Brewery A cannot query or access Brewery B's data.
- **User isolation:** Users can only access their own profile, sessions, and settings. Social features (friends, public profiles) respect visibility settings.
- **Environment separation:** Staging and production environments use separate Supabase instances with separate credentials.

### Backups

- **Database backups:** Supabase provides daily automatic backups with point-in-time recovery (paid tier).
- **Backup retention:** Per Supabase's retention policy (7 days for daily backups on Pro tier).
- **Backup encryption:** Backups are encrypted at rest using the same AES-256 encryption as the production database.

---

## Operational Security

### Access Control

- **Production access:** Limited to the founder/operator. No shared credentials.
- **Environment variables:** Secrets (API keys, database credentials) are stored in Vercel environment variables, never in source code.
- **Source control:** Sensitive files (.env, credentials) are excluded via .gitignore. GitHub branch protection on main.

### Monitoring and Alerting

- **Error tracking:** Sentry captures and alerts on application errors in real-time.
- **Health monitoring:** `/api/health` endpoint checks database connectivity, latency, and service version.
- **Uptime monitoring:** External uptime monitoring configured (UptimeRobot or equivalent).
- **CI/CD pipeline:** GitHub Actions runs linting, type checking, build verification, and E2E tests on every push.

### Dependency Management

- **Dependency auditing:** `npm audit` run as part of CI pipeline.
- **Lock file:** `package-lock.json` ensures reproducible builds with exact dependency versions.
- **Minimal dependencies:** We avoid unnecessary dependencies to reduce supply chain risk.

---

## Incident Response

### Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|---------|
| SEV-1 | Service down or data breach | Immediate (< 1 hour) | Database compromise, auth bypass, full outage |
| SEV-2 | Significant degradation | < 4 hours | Partial outage, payment processing failure, data corruption |
| SEV-3 | Minor issue | < 24 hours | UI bugs, non-critical feature failure, performance degradation |

### Breach Response Procedure

In the event of a confirmed data breach:

1. **Containment (0–1 hours):** Isolate affected systems, revoke compromised credentials, deploy patches
2. **Assessment (1–24 hours):** Determine scope, affected users/data, root cause
3. **Notification (within 72 hours):**
   - Affected users notified via email
   - Affected brewery partners notified per DPA obligations
   - Regulatory authorities notified where required (GDPR: 72 hours; state laws: varies)
4. **Remediation (1–7 days):** Full root cause analysis, security patches, process improvements
5. **Post-incident review:** Document lessons learned, update security measures

Full incident response runbook: `docs/launch-day-ops.md`

---

## Vulnerability Reporting

If you discover a security vulnerability in HopTrack, please report it responsibly:

- **Email:** security@hoptrack.beer
- **What to include:** Description of the vulnerability, steps to reproduce, potential impact
- **What we ask:** Please do not publicly disclose the vulnerability until we've had a chance to address it (we aim for 72 hours for critical issues, 30 days for non-critical)

We do not currently offer a bug bounty program but will credit responsible reporters in our security acknowledgments (with permission).

---

## Compliance

### Current Compliance Posture

| Requirement | Status | Notes |
|-------------|--------|-------|
| HTTPS/TLS | Implemented | All connections encrypted |
| Password security | Implemented | bcrypt hashing via Supabase |
| Data deletion | Implemented | Account deletion cascade (Sprint 60) |
| Cookie consent | Implemented | Accept/decline banner (Sprint 77) |
| Privacy policy | Published | `/privacy` — needs LLC entity update |
| Terms of service | Published | `/terms` — needs LLC entity update |
| CCPA compliance | Documented | Below thresholds, California section in privacy policy |
| GDPR awareness | Documented | Low EU exposure at launch, core rights implemented |
| PCI DSS | Delegated to Stripe | We never handle or store card data |
| CAN-SPAM | Implemented | Unsubscribe links, physical address in footers |
| FTC review disclosures | Implemented | Incentivized review notice in ToS |

### Not Yet Applicable (Scale Triggers)

| Requirement | Trigger | Action Needed |
|-------------|---------|---------------|
| SOC 2 Type II | Enterprise customers or $1M+ ARR | Formal audit (~$20K–50K) |
| GDPR Data Export (DSAR) | 500+ EU users | Build `/api/users/export` endpoint |
| CCPA "Do Not Sell" link | Revenue > $25M or 100K+ CA users | Add footer link |
| HIPAA | Never (not applicable) | N/A — no health data |

---

## Security Contact

- **Security issues:** security@hoptrack.beer
- **Privacy requests:** privacy@hoptrack.beer
- **General support:** support@hoptrack.beer

---

*This document is a template and should be reviewed by a qualified attorney and/or security professional before publication.*
