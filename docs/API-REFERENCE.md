# HopTrack API Reference
**Last updated:** 2026-04-01 (Sprint 103)
**Total endpoints:** 98+
**Auth:** Supabase JWT (via cookie). All endpoints require auth unless noted.
**Rate limiting:** Applied via `rateLimitResponse()` in `lib/rate-limit.ts`.

---

## Sessions (15 endpoints)

| Method | Path | Description | Rate Limit |
|--------|------|-------------|------------|
| POST | `/api/sessions` | Start new session (brewery or home) | 20/hour |
| GET | `/api/sessions` | Fetch sessions for feed with beer logs | - |
| GET | `/api/sessions/active` | Get current user's active session | - |
| PATCH | `/api/sessions/[id]` | Update session (note, share_to_feed) | - |
| PATCH | `/api/sessions/[id]/end` | End session, award XP, check achievements | 30/min |
| GET | `/api/sessions/[id]/beers` | Fetch beer logs for session | - |
| POST | `/api/sessions/[id]/beers` | Log beer to active session | 60/min |
| PATCH | `/api/sessions/[id]/beers/[logId]` | Update beer log | - |
| GET | `/api/sessions/[id]/comments` | Fetch session comments | - |
| POST | `/api/sessions/[id]/comments` | Post comment, notify owner | 30/min |
| DELETE | `/api/sessions/[id]/comments/[commentId]` | Delete comment | - |
| GET | `/api/sessions/[id]/participants` | List participants | - |
| POST | `/api/sessions/[id]/participants` | Invite friend | - |
| PATCH | `/api/sessions/[id]/participants/status` | Accept/decline invite | - |
| POST | `/api/sessions/[id]/photos` | Add photo (max 5) | 20/min |

## Beer Logs (4 endpoints)

| Method | Path | Description | Rate Limit |
|--------|------|-------------|------------|
| PATCH | `/api/beer-logs/[id]` | Update beer log | - |
| DELETE | `/api/beer-logs/[id]` | Delete beer log | - |
| GET | `/api/beer-logs/rated` | Get beers user has rated (deduped) | - |
| GET | `/api/beer-logs/stats` | Per-beer stats (times tried, avg rating) | - |

## Beers (3 endpoints)

| Method | Path | Description | Rate Limit |
|--------|------|-------------|------------|
| GET | `/api/beers` | Search/filter beers. **No auth required.** | - |
| POST | `/api/beers` | Create beer (brewery admin) | - |
| GET | `/api/beer/[beer_id]/reviews` | Fetch beer reviews + user's own | - |
| POST | `/api/beer/[beer_id]/reviews` | Create/update review | 20/min |
| DELETE | `/api/beer/[beer_id]/reviews` | Delete review | - |

## Breweries (15 endpoints)

| Method | Path | Description | Rate Limit |
|--------|------|-------------|------------|
| GET | `/api/breweries` | Search/nearby breweries. **No auth required.** | - |
| POST | `/api/breweries` | Create brewery | - |
| POST | `/api/brewery-claims` | Submit ownership claim | - |
| GET | `/api/brewery/[id]/reviews` | Fetch brewery reviews | - |
| POST | `/api/brewery/[id]/reviews` | Create/update review | 20/min |
| DELETE | `/api/brewery/[id]/reviews` | Delete review | - |
| PATCH | `/api/brewery/[id]/reviews/[rid]/respond` | Owner responds to review | - |
| DELETE | `/api/brewery/[id]/reviews/[rid]/respond` | Owner removes response | - |
| GET | `/api/brewery/[id]/follow` | Follow status + count | - |
| POST | `/api/brewery/[id]/follow` | Follow brewery | 30/min |
| DELETE | `/api/brewery/[id]/follow` | Unfollow | - |
| POST | `/api/brewery/[id]/featured-beer` | Set featured beer (admin) | - |
| PATCH | `/api/brewery/[id]/settings` | Update brewery info (admin) | - |
| POST | `/api/brewery/[id]/messages` | Send message to customers by tier | - |
| GET | `/api/brewery/[id]/digest` | Generate weekly digest | 10/min |
| PATCH | `/api/brewery/[id]/promotions` | Update HopRoute eligibility | - |
| GET | `/api/brewery/[id]/user-stats` | User stats at brewery | - |
| GET | `/api/brewery/[id]/customers/export` | Export customer CSV (admin) | - |
| POST | `/api/brewery/[id]/beers/[bid]/pour-sizes` | Set pour sizes (admin) | - |

## Friends (5 endpoints)

| Method | Path | Description | Rate Limit |
|--------|------|-------------|------------|
| GET | `/api/friends` | List friendships | - |
| POST | `/api/friends` | Send friend request | 30/min |
| PATCH | `/api/friends` | Accept/block request | - |
| DELETE | `/api/friends` | Remove friendship | - |
| GET | `/api/friends/active` | Friends with active sessions | - |

## Notifications & Social (4 endpoints)

| Method | Path | Description | Rate Limit |
|--------|------|-------------|------------|
| PATCH | `/api/notifications` | Mark all read | - |
| POST | `/api/reactions` | Toggle reaction | 60/min |
| GET | `/api/leaderboard` | XP leaderboard (monthly/alltime) | 30/min |
| GET | `/api/pint-rewind` | Annual review data | 10/min |

## Wishlist (3 endpoints)

| Method | Path | Description | Rate Limit |
|--------|------|-------------|------------|
| POST | `/api/wishlist` | Add to wishlist | - |
| DELETE | `/api/wishlist` | Remove from wishlist | - |
| GET | `/api/wishlist/on-tap` | Wishlist beers on tap at brewery | - |

## Beer Lists (7 endpoints)

| Method | Path | Description | Rate Limit |
|--------|------|-------------|------------|
| GET | `/api/beer-lists` | List user's beer lists. **Public lists: no auth.** | - |
| POST | `/api/beer-lists` | Create list | - |
| GET | `/api/beer-lists/[id]` | Get list with items. **Public: no auth.** | - |
| PATCH | `/api/beer-lists/[id]` | Update list metadata | - |
| DELETE | `/api/beer-lists/[id]` | Delete list | - |
| POST | `/api/beer-lists/[id]/items` | Add beer to list | - |
| DELETE | `/api/beer-lists/[id]/items` | Remove beer from list | - |

## HopRoute (3 endpoints)

| Method | Path | Description | Rate Limit |
|--------|------|-------------|------------|
| POST | `/api/hop-route/generate` | Generate AI brewery route (Claude) | 5/min |
| GET | `/api/hop-route/[id]` | Fetch route with stops and beers | - |
| PATCH | `/api/hop-route/[id]/status` | Transition route state | - |

## User Profiles (4 endpoints)

| Method | Path | Description | Rate Limit |
|--------|------|-------------|------------|
| PATCH | `/api/profiles` | Update profile | - |
| GET | `/api/users/check-username` | Check availability. **No auth.** | 20/min |
| GET | `/api/users/search` | Search users | 60/min |
| DELETE | `/api/users/delete-account` | Delete account (cascading) | - |

## Billing (3 endpoints)

| Method | Path | Description | Rate Limit |
|--------|------|-------------|------------|
| POST | `/api/billing/checkout` | Create Stripe checkout (brewery admin) | - |
| POST | `/api/billing/portal` | Create Stripe portal (brewery admin) | - |
| POST | `/api/billing/webhook` | Stripe webhook. **Signature auth only.** | - |

## Referrals (2 endpoints)

| Method | Path | Description | Rate Limit |
|--------|------|-------------|------------|
| GET | `/api/referrals` | Get/create referral code + stats | - |
| POST | `/api/referrals` | Redeem referral code | 5/hour |

## Push Notifications (2 endpoints)

| Method | Path | Description | Rate Limit |
|--------|------|-------------|------------|
| POST | `/api/push/subscribe` | Register Web Push subscription | - |
| DELETE | `/api/push/subscribe` | Unregister subscription | - |

## Challenges (7 endpoints)

| Method | Path | Description | Rate Limit |
|--------|------|-------------|------------|
| GET | `/api/brewery/[brewery_id]/challenges` | List brewery challenges (admin) | - |
| POST | `/api/brewery/[brewery_id]/challenges` | Create challenge (admin) | - |
| PATCH | `/api/brewery/[brewery_id]/challenges` | Update challenge (admin) | - |
| DELETE | `/api/brewery/[brewery_id]/challenges` | Delete challenge (admin) | - |
| GET | `/api/brewery/[brewery_id]/challenges/participants` | Challenge participant stats | - |
| POST | `/api/challenges/join` | Join a challenge | - |
| GET | `/api/challenges/my-challenges` | User's active challenges | - |
| GET | `/api/challenges/nearby` | Discover sponsored challenges near location | - |
| POST | `/api/challenges/[id]/impression` | Track sponsored challenge impression | - |

---

## Admin (2 endpoints)

| Method | Path | Description | Rate Limit |
|--------|------|-------------|------------|
| PATCH | `/api/admin/claims` | Approve/reject claims (superadmin) | - |
| GET | `/api/admin/stats` | Platform stats (superadmin) | - |

---

## Error Format

All endpoints return errors as:
```json
{ "error": "Human-readable error message" }
```

Status codes: `400` (bad request), `401` (unauthorized), `404` (not found), `429` (rate limited), `500` (server error).

## Rate Limiting

Rate limits return `429` with:
```json
{ "error": "Rate limit exceeded" }
```

Limits are per-IP, configured in `lib/rate-limit.ts`.

## POS Integration (9 endpoints)

| Method | Path | Description | Rate Limit |
|--------|------|-------------|------------|
| POST | `/api/pos/connect/[provider]` | Initiate POS OAuth connection (Toast/Square) | - |
| POST | `/api/pos/disconnect/[provider]` | Disconnect POS provider | - |
| POST | `/api/pos/callback/[provider]` | OAuth callback handler | - |
| GET | `/api/pos/status` | Get POS connection status for brewery | - |
| POST | `/api/pos/sync/[provider]` | Manual sync trigger | - |
| GET | `/api/pos/sync-logs` | Fetch sync history | - |
| POST | `/api/pos/webhook/toast` | Toast POS webhook receiver | HMAC verified |
| POST | `/api/pos/webhook/square` | Square POS webhook receiver | HMAC verified |
| GET/POST | `/api/pos/mapping` | Beer mapping management | - |

## Ads & Ad Engine (5 endpoints)

| Method | Path | Description | Rate Limit |
|--------|------|-------------|------------|
| GET | `/api/ads/feed` | Fetch geo-targeted ads for consumer feed | - |
| POST | `/api/ads/impression` | Record ad impression | - |
| POST | `/api/ads/click` | Record ad click | - |
| GET/POST | `/api/brewery/[id]/ads` | Brewery ad CRUD (list + create) | - |
| GET/PATCH/DELETE | `/api/brewery/[id]/ads/[ad_id]` | Individual ad management | - |

## Mug Clubs (3 endpoints)

| Method | Path | Description | Rate Limit |
|--------|------|-------------|------------|
| GET/POST | `/api/brewery/[id]/mug-clubs` | List/create mug clubs | - |
| GET/PATCH/DELETE | `/api/brewery/[id]/mug-clubs/[clubId]` | Individual club management | - |
| GET/POST | `/api/brewery/[id]/mug-clubs/[clubId]/members` | Member management | - |

## Redemptions (2 endpoints)

| Method | Path | Description | Rate Limit |
|--------|------|-------------|------------|
| POST | `/api/redemptions/generate` | Generate 6-char redemption code (5-min expiry) | 5/min |
| POST | `/api/brewery/[id]/redemptions/confirm` | Staff confirms redemption code | 10/min |

## Promotions (2 endpoints)

| Method | Path | Description | Rate Limit |
|--------|------|-------------|------------|
| GET/POST | `/api/brewery/[id]/promotions` | Brewery promotions CRUD | - |
| GET | `/api/brewery/[id]/promotions/summary` | Promotion analytics summary | - |

## Event RSVPs (1 endpoint)

| Method | Path | Description | Rate Limit |
|--------|------|-------------|------------|
| GET/POST/DELETE | `/api/events/[event_id]/rsvp` | RSVP management (going/interested) | - |

## Smart Triggers (1 endpoint)

| Method | Path | Description | Rate Limit |
|--------|------|-------------|------------|
| POST | `/api/beers/[beer_id]/on-tap` | Fire wishlist-on-tap smart notification | - |

## Wrapped & Digest (2 endpoints)

| Method | Path | Description | Rate Limit |
|--------|------|-------------|------------|
| GET | `/api/wrapped` | HopTrack Wrapped year-in-review stats | - |
| POST | `/api/cron/weekly-digest` | Cron: batch weekly digest emails | CRON_SECRET |

## Auth (1 endpoint)

| Method | Path | Description | Rate Limit |
|--------|------|-------------|------------|
| POST | `/api/auth/welcome` | Fire welcome email after signup | 5/min |

---

## Routing

`proxy.ts` handles auth session refresh and pathname forwarding. It replaces `middleware.ts` (do NOT recreate middleware.ts).
