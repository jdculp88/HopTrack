# HopTrack Launch Day Operations
**Owner:** Morgan (coordination) · Riley (infrastructure)
**Created:** Sprint 77 — The Countdown
**Updated:** Sprint 151 — The Ops Room
**Status:** Ready to execute when launch date is set

---

## T-7d: Pre-Launch Week

### Infrastructure Preparation
- [ ] Verify all UptimeRobot monitors are green (see `docs/uptime-monitoring.md`)
- [ ] Confirm alert contacts receive test notifications
- [ ] Status page accessible at `status.hoptrack.beer`
- [ ] DNS records for `hoptrack.beer` verified (`dig A hoptrack.beer`, `dig MX hoptrack.beer`)
- [ ] Support email routing configured and tested (see `docs/email-routing.md`)
- [ ] Connection pooling verified in Supabase Dashboard (see `docs/connection-pooling.md`)
- [ ] Trigger each cron workflow manually from GitHub Actions → confirm expected 401/200

### Team Preparation
- [ ] On-call rotation confirmed with Riley, Quinn, Avery, Jordan
- [ ] All team members have access to: Supabase Dashboard, Sentry, Vercel, Stripe Dashboard
- [ ] Incident response runbook walk-through completed (30-min team session)
- [ ] Launch day communication channel set up (Slack #launch or similar)

---

## T-24h: Pre-Launch Checklist

### Infrastructure Verification
- [ ] All production env vars set in Vercel (see `.env.production.example` audit section)
- [ ] Supabase production project healthy (Dashboard → Project → Health)
- [ ] All migrations applied to production (`supabase db push`)
- [ ] `NOTIFY pgrst, 'reload schema';` run in production SQL editor
- [ ] Realtime enabled on `beers` and `beer_pour_sizes` tables
- [ ] Storage buckets (`avatars`, `session-photos`) have RLS policies
- [ ] Stripe webhook registered: `https://hoptrack.beer/api/billing/webhook`
- [ ] Resend domain verified, sending works
- [ ] Sentry DSN set and receiving events
- [ ] Email health check: `curl -H "Authorization: Bearer $CRON_SECRET" https://hoptrack.beer/api/health/email`
- [ ] Health endpoint: `curl https://hoptrack.beer/api/health` → all checks "configured"
- [ ] UptimeRobot monitors all green

### Application Verification
- [ ] `npm run build` passes clean locally
- [ ] CI pipeline green on `main`
- [ ] Visit `https://hoptrack.beer` — homepage loads
- [ ] Sign up → verify email flow works
- [ ] Create a test session at a brewery → end session → XP awarded
- [ ] Brewery claim flow works → onboarding wizard appears
- [ ] Billing page loads with correct pricing
- [ ] HopRoute generate works (test with one city)
- [ ] Push notifications fire (test with push tester)
- [ ] OG images render: `/og?type=home` and `/og?type=brewery&brewery=Test`

### Content Readiness
- [ ] Beer of the Week set (`is_featured = true` on standout beer)
- [ ] Editorial collections current (seasonal content in DiscoveryCard)
- [ ] Demo breweries have good data (photos, beers, reviews)

### Team Readiness
- [ ] All team members aware of launch time
- [ ] On-call rotation confirmed (see below)
- [ ] Incident response runbook reviewed by all
- [ ] Support email routing verified (`support@`, `help@`, `sales@hoptrack.beer`)

---

## T-0: Launch Sequence

1. **T-0:00** — Deploy final build to Vercel production
2. **T+0:05** — Smoke test: homepage, signup, brewery detail, session flow
3. **T+0:10** — Monitor Sentry for errors, check Supabase dashboard for load
4. **T+0:15** — Send launch announcement email (via Resend)
5. **T+0:30** — Post to social media (@hoptrack)
6. **T+1:00** — First status check: error rate, response times, user signups
7. **T+2:00** — Second status check
8. **T+4:00** — Third status check, decide if launch party is a go

---

## On-Call Rotation (Launch Week)

| Time Block | Primary | Secondary | Focus Area |
|-----------|---------|-----------|------------|
| Morning (8am-12pm) | Riley | Quinn | Infrastructure, DB, auth |
| Afternoon (12pm-5pm) | Avery | Jordan | App bugs, UI issues |
| Evening (5pm-10pm) | Riley | Avery | Full stack coverage |

**Escalation path:** On-call → Morgan → Joshua
**Response SLA:** Acknowledge within 15 minutes, fix or workaround within 1 hour

---

## Incident Response Runbook

### Severity Levels

| Level | Definition | Response | Example |
|-------|-----------|----------|---------|
| **SEV-1** | Service down, all users affected | Immediate (all hands) | Database unreachable, auth broken |
| **SEV-2** | Major feature broken, some users affected | 30 min response | Session flow failing, billing errors |
| **SEV-3** | Minor issue, workaround available | Next business day | UI glitch, slow query, cosmetic bug |

### SEV-1: Service Down

**Database unreachable:**
1. Check Supabase Dashboard → Project Health
2. Check if connection pooling is exhausted (Settings → Database → Connection Pooling)
3. If Supabase status page shows outage: wait, monitor, communicate to users
4. If our issue: check for runaway queries in SQL Editor → `SELECT * FROM pg_stat_activity`
5. Last resort: restart connection pooler from Supabase dashboard

**Auth broken (can't log in):**
1. Check Supabase Auth → Users tab — can you see users?
2. Check `proxy.ts` hasn't been modified accidentally
3. Check env vars: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Verify Supabase Auth settings in dashboard (email confirmations, redirect URLs)

**App won't load / 500 errors:**
1. Check Sentry for error details
2. Check Vercel → Deployments → latest deployment logs
3. Check Vercel → Functions tab for serverless function errors
4. If recent deploy broke it: **rollback** (see below)

### SEV-2: Major Feature Broken

**Session flow failing:**
1. Check `/api/sessions/` endpoints in Vercel Functions tab
2. Check Sentry for the specific error
3. Common cause: Supabase RLS policy blocking the query
4. Quick fix: identify the failing query, test in Supabase SQL Editor

**Billing errors:**
1. Check Stripe Dashboard → Events for failed webhooks
2. Check `/api/billing/webhook` logs in Vercel Functions
3. Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
4. Re-send failed webhook events from Stripe dashboard if needed

**Email not sending:**
1. Check Resend Dashboard → Logs
2. Verify domain is still verified
3. Check `RESEND_API_KEY` env var
4. Run email health check: `curl -H "Authorization: Bearer $CRON_SECRET" https://hoptrack.beer/api/health/email`
5. Fallback: emails log to console — no user-facing failure, just delayed delivery

**Scheduled jobs not running:**
1. Check GitHub Actions → Workflows tab for the failing workflow
2. Verify workflow schedule is correct (cron expression, UTC times)
3. Check workflow logs for curl errors or HTTP 4xx/5xx responses
4. Verify `CRON_SECRET` matches in both GitHub Actions secrets AND Vercel env vars
5. Manual trigger: use `workflow_dispatch` from GitHub Actions UI to test
6. If endpoint returns 500: check Vercel Functions logs for the cron route

**Connection pool exhaustion:**
1. Check Supabase Dashboard → Settings → Database → Active Connections
2. Run: `SELECT count(*) FROM pg_stat_activity;` in SQL Editor
3. Look for long-running queries: `SELECT * FROM pg_stat_activity WHERE state = 'active' ORDER BY query_start;`
4. Cancel stuck queries: `SELECT pg_cancel_backend(pid) FROM pg_stat_activity WHERE state = 'active' AND query_start < NOW() - INTERVAL '5 minutes';`
5. See `docs/connection-pooling.md` for architecture details

---

## Rollback Strategy

### Option 1: Vercel Instant Rollback (fastest)
1. Go to Vercel → Project → Deployments
2. Find the last known good deployment
3. Click "..." → "Promote to Production"
4. Deployment switches instantly (< 30 seconds)

### Option 2: Git Revert
```bash
# Find the bad commit
git log --oneline -10

# Revert it (creates a new commit, preserves history)
git revert <bad-commit-hash>
git push origin main

# CI will run, Vercel will auto-deploy
```

### Option 3: Feature-Level Disable
For non-critical features that are broken but don't warrant full rollback:
- HopRoute: set `ANTHROPIC_API_KEY=` (empty) → generation disabled, rest of app works
- Stripe billing: set `STRIPE_SECRET_KEY=` (empty) → billing shows demo mode
- Email: set `RESEND_API_KEY=` (empty) → emails fallback to console.log
- Push notifications: disable in Supabase Edge Functions settings

---

## Post-Launch Monitoring (First 48 Hours)

### Key Metrics to Watch
- **Sentry:** Error rate, new error types, affected users
- **Supabase:** Active connections, query performance, storage usage
- **Vercel:** Function invocations, cold starts, error rates
- **Stripe:** Successful checkouts, webhook delivery rate

### Health Check Schedule
| Time | Check |
|------|-------|
| T+1h | Error rate, user signups, first sessions |
| T+2h | Database connections, query performance |
| T+4h | Full metrics review |
| T+8h | End of day 1 summary |
| T+24h | Day 1 retro: what worked, what didn't |
| T+48h | Post-launch retro (full team) |

---

*Riley: "The migration pipeline is real now. The incident pipeline is too."* ⚙️
*Morgan: "We plan for the worst so we can celebrate the best."* 🍺
