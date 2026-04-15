# REQ-069: Enhanced KPIs & Analytics (Drinker + Brewery)

**Status:** COMPLETE (Sprint 124)
**Priority:** P1
**Category:** Enhancement
**Sides:** Consumer + Brewery
**Effort:** M (3-5 sprints)
**Related:** REQ-007, REQ-057, F-010
**Sprint Arc:** Stick Around (Sprints 79-84)

## Problem

Drinker profiles show a basic 4-stat grid (Sessions, Unique Beers, Breweries, Streak) plus XP/level and Taste DNA. We collect far more data than we surface. Users have no trends over time, no fun facts, and limited shareable stats.

Brewery dashboards show Today's Snapshot and basic KPIs but are missing revenue-adjacent metrics (avg visit duration, beers per session, loyalty conversion), customer health metrics (new vs returning, churn signals), and competitive benchmarks.

## Solution

### Drinker Profile — 12 New Metrics (Zero Migrations)

| # | Metric | Source |
|---|--------|--------|
| 1 | Average Rating Given | `beer_logs.rating` |
| 2 | Beers Per Session | `beer_logs` count / `sessions` count |
| 3 | Favorite Style (with %) | `beer_logs` → `beers.style` |
| 4 | Average ABV | `beer_logs` → `beers.abv` |
| 5 | Total Pours | `SUM(beer_logs.quantity)` |
| 6 | Sessions This Month / Year | `sessions.started_at` filtered |
| 7 | Longest Session | `sessions.ended_at - started_at` |
| 8 | Average Session Duration | Same, averaged |
| 9 | New Beers This Month | First-time `beer_id` this month |
| 10 | States/Cities Visited | `breweries.state/city` via sessions |
| 11 | Social Score | friends + reactions + comments |
| 12 | Achievement Completion % | `user_achievements` / total |

UX: Collapsible "Your Stats" card on profile, `card-bg-stats` treatment, mono font for numbers, "Share Stats" button.

### Brewery Dashboard — 12 New KPIs (11 No Migration, 1 Optional)

| # | Metric | Source | Migration? |
|---|--------|--------|-----------|
| 1 | Avg Session Duration | `sessions` timestamps | No |
| 2 | Beers Per Visit | `beer_logs` / `sessions` | No |
| 3 | New vs Returning Visitors | `brewery_visits.total_visits` | No |
| 4 | Customer Retention Rate | Two-period session comparison | No |
| 5 | Loyalty Conversion Rate | `loyalty_cards` / visitors | No |
| 6 | Loyalty Redemptions | `loyalty_redemptions` filtered | No |
| 7 | Top Customer | Most sessions in period | No |
| 8 | Peak Hour | Already computed, surface as KPI | No |
| 9 | Avg Rating Trend | Period comparison | No |
| 10 | Review Sentiment | Rating buckets | No |
| 11 | Follower Growth Rate | Period comparison | No |
| 12 | Tap List Freshness | `beers.created_at` proxy | Optional |

UX: Second row of 4 KPI cards on dashboard with Sparkline trends. New "Customer Health" and "Loyalty" sections on analytics page.

## Acceptance Criteria

1. Drinker profile shows at least 8 new stats in collapsible section
2. Stats computed from existing data (no placeholders)
3. Brewery dashboard adds at least 4 new KPI cards with sparklines
4. Analytics page adds Customer Health and Loyalty sections
5. All stats respect time range filter (7d/30d/90d/All)
6. Empty states for insufficient data
7. CSV export includes new brewery metrics
8. Mobile-responsive KPI card stacking
9. No new migrations for initial ship
10. Performance: derived from already-fetched data where possible

---

## RTM Links

### Implementation
[lib/kpi](../../lib/)

### Tests
[kpi.test.ts](../../lib/__tests__/kpi.test.ts)

### History
- [retro](../history/retros/sprint-124-retro.md)
- *(no dedicated plan file)*

## See also
[REQ-007](REQ-007-brewery-insights.md), [REQ-104](REQ-104-intelligence-layer.md)

> Added 2026-04-15 during the wiki reorg — see the [RTM](README.md) for the master table.
