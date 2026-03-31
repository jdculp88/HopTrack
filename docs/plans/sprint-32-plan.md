# Sprint 32 — The Vibe
**Date:** 2026-03-29
**PM:** Morgan
**Theme:** Make it feel alive — social depth, smart recommendations, micro-interactions, and the features that make people say "wait, that's cool"

---

## Sprint Goals
1. **Brewery Follow system** — follow breweries, get notified on new taps/events
2. **Beer Recommendations engine** — "Because you liked X" on Discover tab + beer detail
3. **Activity heatmap on profile** — GitHub-style contribution grid showing pour history
4. **Cheers animations** — confetti burst on cheers, celebratory micro-interactions
5. **Explore geolocation** — "Near Me" sort, distance badges on brewery cards
6. **Notification grouping** — roll up "5 people cheered your session" into single cards
7. **Brewery admin: Customer Insights** — "Who are my regulars" with visit frequency tiers
8. **Session photos in feed** — photo carousel on SessionCard, camera icon in active session

---

## Tickets

### S32-001: Brewery Follow System
**Owner:** Avery (Dev Lead) · **Reviewer:** Jordan
**Priority:** P0
- Migration 037: `brewery_follows` table (user_id, brewery_id, created_at) + UNIQUE + RLS
- `POST/DELETE /api/brewery/[brewery_id]/follow` — toggle follow
- `FollowBreweryButton` component — heart icon with fill animation, follow count
- Show on brewery detail page (next to rating header)
- Show on explore brewery cards (small heart icon)
- Feed: notify followers when brewery adds new beer or creates event (in-app notification)
- Add `brewery_follow` notification type

### S32-002: Beer Recommendations — "For You"
**Owner:** Avery · **Reviewer:** Jordan
**Priority:** P1
- Server-side recommendation engine in `lib/recommendations.ts`:
  - Query user's top 5 beer styles (from beer_logs)
  - Find highest-rated beers in those styles that user hasn't tried
  - Weight by: friend ratings > community ratings > recency
- `RecommendationSection` on Discover tab — "Because you love IPAs" horizontal scroll
- `SimilarBeers` section on beer detail page — 4 similar beers (same style, different brewery)
- No migration needed — computed from existing data

### S32-003: Activity Heatmap
**Owner:** Avery · **Reviewer:** Jordan
**Priority:** P1
- `ActivityHeatmap` component — 52-week grid (GitHub-style), color intensity = pour count
- Data: aggregate beer_logs by date for user
- Show on You tab (below stats grid) and profile page
- 4 intensity levels: 0 (empty), 1-2 (light gold), 3-5 (medium gold), 6+ (full gold)
- Tooltip on hover/tap: "March 15 — 4 pours at Mountain Ridge"
- Responsive: full grid on desktop, last 26 weeks on mobile

### S32-004: Cheers Animations
**Owner:** Avery · **Reviewer:** Alex (feel check)
**Priority:** P1
- When user taps 🍺 cheers on a session card:
  - Beer glass clink animation (two glasses meeting, Framer Motion)
  - Gold particle burst from the cheers icon
  - Haptic feedback on mobile (navigator.vibrate)
- When receiving 10th cheers on own session: confetti celebration (reuse existing confetti import)
- `useCheersAnimation` hook for animation state management
- Performance: requestAnimationFrame, cleanup on unmount

### S32-005: Explore Geolocation
**Owner:** Avery · **Reviewer:** Riley (privacy)
**Priority:** P1
- "Near Me" toggle button on explore page (uses `navigator.geolocation`)
- Sort breweries by distance when enabled
- Distance badge on BreweryCard: "0.3 mi" / "2.1 mi"
- `haversineDistance()` utility in `lib/geo.ts`
- Graceful fallback: if geolocation denied, hide "Near Me" toggle
- Privacy: location never sent to server, computed client-side
- Cache coordinates for session (don't re-prompt on tab switch)

### S32-006: Notification Grouping
**Owner:** Avery · **Reviewer:** Jordan
**Priority:** P1
- Group logic in `NotificationsClient.tsx`:
  - Same type + same target within 1 hour → grouped
  - "Marcus, Drew, and 3 others cheered your session"
  - Expandable to see individual notifications
- Group types: `reaction`, `session_cheers`, `session_comment`
- Avatar stack (up to 3 overlapping avatars) for grouped notifications
- Unread count badge shows grouped count (not individual)

### S32-007: Brewery Admin — Customer Insights
**Owner:** Avery · **Reviewer:** Jordan
**Priority:** P2
- New tab in brewery admin nav: "Customers" (Users icon)
- `/brewery-admin/[id]/customers` page
- Tier badges: Regular (5+ visits), Power User (15+ visits), VIP (30+ visits)
- Table: avatar, name, visits, last visit, favorite beer, total pours
- Sort by: visits, last visit, name
- Search by name
- No migration needed — computed from sessions + beer_logs

### S32-008: Session Photo Display
**Owner:** Avery · **Reviewer:** Alex
**Priority:** P2
- `SessionCard` shows photo if session has one (below brewery name, rounded-xl, aspect-video)
- Photo carousel if multiple photos (swipe on mobile, arrows on desktop)
- Camera icon in `TapWallSheet` header — upload photo during active session
- Photos stored in Supabase Storage `session-photos` bucket
- Migration 038: `session_photos` table (session_id, photo_url, created_at) + RLS
- Limit: 5 photos per session

---

## Deferred (Sprint 33+)
- Timeline beer journey visualization
- Delete account flow
- Email change in settings
- Brewery comparison analytics
- Advanced search with saved filters
- E2E test coverage expansion (Casey, we see you)

---

## Team Assignments
| Who | What |
|-----|------|
| Morgan | Sprint plan, coordination, retro |
| Sage | Ticket specs, progress tracking |
| Avery | All build tickets (S32-001 through S32-008) |
| Jordan | Architecture review on all PRs |
| Alex | Feel check on S32-004 (animations), S32-008 (photos) |
| Riley | Privacy review on S32-005 (geolocation) |
| Quinn | Migration 037, 038 |
| Casey | Testing all tickets, regression |
| Sam | User journey validation |
| Drew | Brewery admin validation (S32-007) |
| Taylor | Revenue impact assessment |
| Jamie | Brand alignment check |

---

*"This is a living document."* — Morgan
