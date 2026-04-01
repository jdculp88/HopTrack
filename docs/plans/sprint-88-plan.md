# Sprint 88 Plan — The Monitor 📊
**PM:** Morgan | **Arc:** Open the Pipes (Sprints 85-90)
**Theme:** Give brewery owners full visibility into their POS sync health

---

## Context

Sprints 85-87 built the POS integration stack: Public API v1, connection foundation (migration 058, AES-256-GCM encryption, 9 API endpoints), and the sync engine (reconciliation, auto-mapper, adapters, 33 tests). The Settings page has connection cards, sync/disconnect, sync history, and mapping review with filter pills.

**What's missing:** The brewery dashboard has zero POS visibility. Owners must navigate to Settings to see if their sync is healthy, stale, or broken. There's no proactive alerting, no full sync log, and no way to see sync health at a glance from the place they look every day — the dashboard.

**Sprint 88 closes that gap.**

---

## Goals

### Goal 1: POS Status Card on Dashboard
**Owner:** Avery (Dev Lead) | **Reviewer:** Jordan (Architecture)

Add a `PosDashboardCard` to the brewery admin dashboard (right column, below ROI card). Shows:
- Connection status: provider name + green/yellow/red health dot
- Last sync time + item count
- Unmapped item count (if > 0, gold badge)
- "Sync Now" quick action button
- "View Details" link → Settings POS section
- Empty state: "Connect your POS" CTA → Settings

**Component:** `components/brewery-admin/PosDashboardCard.tsx` (client component)
**Data source:** `/api/pos/status` (already exists)
**Dashboard wiring:** Add to `app/(brewery-admin)/brewery-admin/[brewery_id]/page.tsx` right column

### Goal 2: Dedicated Sync Log Page
**Owner:** Avery (Dev Lead) | **Reviewer:** Jordan (Architecture)

New page at `/brewery-admin/[brewery_id]/pos-sync/` with:
- Full paginated sync history (20 per page)
- Filter pills: All / Success / Partial / Failed
- Provider filter: All / Toast / Square
- Sync type filter: All / Webhook / Manual / Scheduled
- Each row: status dot, provider, sync type, items (+added ~updated -removed), unmapped count, duration, timestamp
- Failed syncs show error message in expandable row
- Empty state: "No sync activity yet" with link to Settings

**API:** New `GET /api/pos/sync-logs` endpoint with pagination, filtering by status/provider/sync_type
**Page:** `app/(brewery-admin)/brewery-admin/[brewery_id]/pos-sync/page.tsx` (server component)
**Client:** `app/(brewery-admin)/brewery-admin/[brewery_id]/pos-sync/PosSyncLogClient.tsx`
**Loading:** `app/(brewery-admin)/brewery-admin/[brewery_id]/pos-sync/loading.tsx`

### Goal 3: Sync Health Alerts
**Owner:** Avery (Dev Lead) | **Reviewer:** Alex (UI/UX)

When POS sync is unhealthy, surface it proactively:
- **Dashboard alert banner:** Below Today's Snapshot, a gold/red banner shows when last sync failed or connection is stale (> 1 hour). "Your Toast sync failed 23m ago — View Details". AnimatePresence slide-down.
- **Activity feed integration:** Sync failures appear in the Recent Activity feed as an activity item (type: "sync_failure", red icon).
- Banner only shows for breweries with an active POS connection.

**Data source:** `/api/pos/status` health field (already computed as green/yellow/red)

### Goal 4: Quick Actions Update
**Owner:** Avery (Dev Lead)

Add "POS Sync" to the Quick Actions grid on the dashboard, linking to the new sync log page. Icon: `RefreshCw`. Only shows when brewery has an active POS connection.

---

## Non-Goals
- No new migration (all tables exist from Sprint 86)
- No changes to the sync engine itself
- No real POS API calls (still mock mode)
- No changes to the Settings POS section (already complete)

---

## Files to Create
| File | Type | Purpose |
|------|------|---------|
| `components/brewery-admin/PosDashboardCard.tsx` | Client component | POS status card for dashboard |
| `app/api/pos/sync-logs/route.ts` | API route | Paginated sync log endpoint |
| `app/(brewery-admin)/brewery-admin/[brewery_id]/pos-sync/page.tsx` | Server page | Sync log page |
| `app/(brewery-admin)/brewery-admin/[brewery_id]/pos-sync/PosSyncLogClient.tsx` | Client component | Sync log UI with filters |
| `app/(brewery-admin)/brewery-admin/[brewery_id]/pos-sync/loading.tsx` | Loading skeleton | Skeleton for sync log page |

## Files to Modify
| File | Change |
|------|--------|
| `app/(brewery-admin)/brewery-admin/[brewery_id]/page.tsx` | Add PosDashboardCard + sync alert banner + POS quick action |

---

## Acceptance Criteria
- [ ] Dashboard shows POS connection health at a glance (green/yellow/red)
- [ ] Dashboard shows alert banner when sync is unhealthy
- [ ] "Sync Now" on dashboard card triggers sync and updates status
- [ ] Dedicated sync log page loads with full history, filters work
- [ ] Sync log pagination works (20 per page)
- [ ] Failed syncs show error details in expandable row
- [ ] Empty states render correctly for all new components
- [ ] All components follow CSS var theming (no hardcoded colors)
- [ ] No `motion.button` violations
- [ ] Mobile-responsive (min-h-[44px] tap targets)

---

## Team Assignments
| Person | Role |
|--------|------|
| Morgan | Sprint plan, coordination |
| Avery | All implementation (Goals 1-4) |
| Jordan | Architecture review |
| Alex | UI/UX review (alert banner, dashboard card) |
| Casey | QA sign-off |
| Drew | Brewery ops validation |

---

*The pipes are flowing. Now we make sure the brewery can see the water.* 📊🍺
