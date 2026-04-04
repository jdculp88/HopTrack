# Uptime Monitoring — HopTrack

> Sprint 151 — The Ops Room (Riley)

## Overview

HopTrack uses an external uptime monitoring service to poll the `/api/health` endpoint and alert on outages. This document covers setup and configuration.

## Recommended Service: UptimeRobot

**Why UptimeRobot:**
- Free tier: 50 monitors, 5-minute check intervals
- Keyword monitoring (check response body, not just HTTP status)
- Public status page with custom subdomain
- Email + webhook alerts
- No credit card required

**Alternative:** Better Uptime (nicer UI, incident pages, but paid for keyword monitoring)

## Monitor Configuration

### Monitor 1: Health Endpoint (Primary)

| Setting | Value |
|---------|-------|
| Type | Keyword |
| URL | `https://hoptrack.beer/api/health` |
| Keyword | `"healthy"` |
| Keyword Type | Exists |
| Interval | 5 minutes |
| Timeout | 30 seconds |
| Alert Contact | On-call email |

**Why keyword, not HTTP:** The health endpoint returns HTTP 200 even when checking services. The `"healthy"` keyword confirms the database is actually connected. A 200 response without `"healthy"` in the body means something is degraded.

### Monitor 2: Homepage (Availability)

| Setting | Value |
|---------|-------|
| Type | HTTP(s) |
| URL | `https://hoptrack.beer` |
| Interval | 5 minutes |
| Timeout | 30 seconds |
| Alert Contact | On-call email |

**Why:** Catches Vercel/CDN-level outages that the health endpoint might not detect (different infrastructure path).

### Monitor 3: API Responsiveness

| Setting | Value |
|---------|-------|
| Type | HTTP(s) |
| URL | `https://hoptrack.beer/api/v1/beers/search?q=ipa` |
| Interval | 15 minutes |
| Timeout | 30 seconds |
| Expected Status | 200 |
| Alert Contact | On-call email |

**Why:** Confirms the public API is functional end-to-end (PostgREST + DB + application logic).

## Alert Configuration

### Alert Contacts

| Contact | Type | Recipients | When |
|---------|------|------------|------|
| On-call Primary | Email | Riley | All monitors |
| Escalation | Email | Morgan | After 10 min unresolved |
| Founder | Email | Joshua | After 30 min unresolved |

### Alert Thresholds

- **Down alert:** After 2 consecutive failed checks (10 minutes)
- **Up alert:** After 1 successful check (immediate recovery notification)
- **SSL expiry:** 14 days before certificate expiration

## Status Page

### Setup

1. Create public status page in UptimeRobot dashboard
2. Configure subdomain: `status.hoptrack.beer`
3. Add CNAME record: `status.hoptrack.beer` → UptimeRobot status page URL
4. Add all 3 monitors to the status page
5. Customize branding (dark theme, gold accent — match HopTrack brand)

### Page Components

- Overall Status indicator (Operational / Degraded / Major Outage)
- Individual monitor status (Health API, Homepage, Public API)
- 90-day uptime percentage per monitor
- Incident history (auto-generated from downtime events)

## Setup Steps

### 1. Create Account
- Go to [uptimerobot.com](https://uptimerobot.com)
- Sign up with the HopTrack team email

### 2. Add Monitors
- Dashboard > Add New Monitor
- Configure each of the 3 monitors above
- Set alert contacts for each

### 3. Configure Alert Contacts
- My Settings > Alert Contacts
- Add email contacts per the table above

### 4. Create Status Page
- Status Pages > Add Status Page
- Add monitors, set custom domain
- Configure CNAME DNS record

### 5. Verify
```bash
# Check DNS propagation
dig CNAME status.hoptrack.beer

# Manually test health endpoint
curl -s https://hoptrack.beer/api/health | jq .

# Expected response:
# {
#   "status": "healthy",
#   "database": "connected",
#   "checks": {
#     "email": "configured",
#     "cron": "configured",
#     "sentry": "configured"
#   },
#   "latency_ms": 42,
#   "timestamp": "2026-04-04T...",
#   "version": "abc1234"
# }
```

## Integration with Launch Day Ops

The T-24h checklist in `docs/launch-day-ops.md` includes:
- [ ] Verify all 3 UptimeRobot monitors are green
- [ ] Confirm alert contacts receive test notifications
- [ ] Status page accessible at `status.hoptrack.beer`

## Incident Response

When UptimeRobot triggers an alert:
1. Check the monitor that failed (Health / Homepage / API)
2. Follow the incident response runbook in `docs/launch-day-ops.md`
3. For Health endpoint failures: check Supabase Dashboard first
4. For Homepage failures: check Vercel status and recent deployments
5. For API failures: check Sentry for error details
