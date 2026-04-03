# Sprint 142 — The Superadmin II
## Consumer Account Detail + Advanced Platform Metrics

### Context
Joshua picked Option C and wants it "state of the art" — inspired by Stripe, Mixpanel, PostHog, Amplitude, and Linear. Sprint 140 built brewery account detail; this sprint builds the consumer equivalent plus adds cohort retention and funnel analytics to the Command Center. The goal: the most impressive admin dashboard in the craft beer space.

---

## Deliverables

### 1. Consumer Account Detail Page (6 tabs)
Click any user from the superadmin users list → full profile with everything an admin needs.

**Header**: Avatar, name, @username, email (copy button), segment badge (VIP/Power/Regular/New from CRM engine), churn risk indicator (green/amber/red based on last session date), engagement score bar (0-100), quick stats (sessions, level, streak, engagement).

**Tab: Overview**
- 30-day activity sparkline (Recharts AreaChart — sessions per day)
- Customer Intelligence card (segment + engagement level + explanation text)
- Lifecycle Pipeline (5 connected dots: Signed Up → First Session → Repeat → Loyal → Advocate)
- Beer DNA (top styles with horizontal percentage bars)
- Key Stats via StatsGrid (avg rating, beers/session, favorite style, ABV, cities, states)
- Key Dates list (created, first session, last session, streak)

**Tab: Activity**
- Filterable event stream (all/sessions/achievements/social)
- Day-grouped events with expandable detail
- 50 most recent events (sessions, achievements, reactions, comments merged)

**Tab: Sessions**
- GitHub-style session heatmap calendar (365 days, gold intensity)
- Sortable session table (date, brewery, duration, beers, avg rating)

**Tab: Social**
- Friends count, reactions given/received, comments count
- Influence score (computed from social metrics)

**Tab: Breweries**
- Brewery affinity table (name, visits, last visit, loyalty status, avg rating)
- "Home Brewery" highlight (most visited)

**Tab: Admin**
- Auto-save notes textarea (2s debounce, same pattern as brewery detail)
- Manual tags (add/remove pill badges: "Beta Tester", "Influencer", "At Risk", etc.)
- Profile metadata grid (email, push prefs, public/private, created, referral)

### 2. Cohort Retention Heatmap (Command Center)
- Rows = weekly sign-up cohorts (last 13 weeks)
- Columns = Week 0 through Week 12
- Cells = retention % with color intensity (green→amber→red)
- Hover tooltip with absolute numbers ("45 of 100 users")
- Custom CSS grid, no additional library

### 3. User Funnel (Command Center)
- 7-step horizontal bar funnel: Signed Up → Profile Complete → First Session → Second Session → Reviewed Beer → Added Friend → 5+ Sessions
- Conversion rate + drop-off percentage per step
- Animated bars with stagger

### 4. Users List Enhancement
- Add segment badge column (colored pills from CRM)
- Add "Last Active" column (relative time)
- Make rows clickable → link to user detail page
- Avatar images displayed

### 5. Session Heatmap Calendar Component
- GitHub-style 53×7 contribution grid
- Gold intensity mapping (0-4 levels)
- Day labels, month labels, hover tooltips
- Legend strip

---

## New Files (15)

| File | Purpose |
|------|---------|
| `supabase/migrations/092_superadmin_user_notes.sql` | admin_user_notes + admin_user_tags tables |
| `lib/superadmin-user.ts` | User detail data engine (15 parallel queries, reuses kpi.ts + crm.ts) |
| `app/api/superadmin/users/[user_id]/route.ts` | User detail GET |
| `app/api/superadmin/users/[user_id]/notes/route.ts` | Admin notes GET/PATCH |
| `app/api/superadmin/metrics/retention/route.ts` | Cohort retention API |
| `app/api/superadmin/metrics/funnel/route.ts` | User funnel API |
| `app/(superadmin)/superadmin/users/[user_id]/page.tsx` | Server component wrapper |
| `app/(superadmin)/superadmin/users/[user_id]/UserDetailClient.tsx` | Full 6-tab detail page |
| `app/(superadmin)/superadmin/users/[user_id]/loading.tsx` | Skeleton loader |
| `components/superadmin/RetentionHeatmap.tsx` | Cohort retention heatmap (CSS grid) |
| `components/superadmin/UserFunnel.tsx` | Horizontal bar funnel |
| `components/superadmin/SessionHeatmap.tsx` | GitHub-style 365-day calendar |
| `components/superadmin/ActivityTimeline.tsx` | Filterable day-grouped event feed |
| `lib/__tests__/superadmin-user.test.ts` | Data engine + pure function tests |
| `docs/plans/sprint-142-plan.md` | This plan |

## Modified Files (3)

| File | Change |
|------|--------|
| `lib/superadmin-metrics.ts` | Added `calculateRetentionCohorts()` + `calculateUserFunnel()` |
| `app/(superadmin)/superadmin/users/page.tsx` | Segment badges, last active, clickable rows, avatars |
| `app/(superadmin)/superadmin/CommandCenterClient.tsx` | Lazy-load retention heatmap + funnel sections |
