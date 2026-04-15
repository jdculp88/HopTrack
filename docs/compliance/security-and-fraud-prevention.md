# HopTrack Security & Fraud Prevention
**Owner:** Jordan (Architecture) + Casey (QA)
**Last updated:** Sprint 103

---

## Overview

HopTrack protects brewery owners and their customers across every feature that involves rewards, promotions, advertising, and financial transactions. This document covers how we prevent fraud, abuse, and unauthorized access throughout the platform.

---

## 1. Redemption Code System (Loyalty + Mug Clubs)

**How it works:** When a customer earns enough stamps for a loyalty reward (or claims a mug club perk), they generate a 6-character code in the app. The code is shown to the bartender, who enters it on the brewery dashboard to confirm the redemption.

**Fraud protections:**
- Codes expire in **5 minutes** — no stockpiling, no screenshot sharing
- Codes use **safe characters only** (no O/0, I/1, L confusion)
- Rate limited: **5 code generations per minute** per user, **10 confirmations per minute** per staff
- Codes are **single-use** — once confirmed, the code is consumed and stamps are decremented
- Staff must be a **verified brewery admin** to confirm codes (RLS-enforced)
- Code collision retry: if a generated code already exists, the system retries automatically
- All redemptions are logged with timestamps, user ID, and confirming staff ID

**What this prevents:** Fake loyalty redemptions, code sharing between users, screenshot-based fraud, rapid-fire exploit attempts.

---

## 2. Sponsored Challenges & Promotions

**How it works:** Brewery owners create sponsored challenges (visit X times, try Y beers, explore Z styles) and promotions that appear in the consumer feed and discovery.

**Fraud protections:**
- Challenge creation is **tier-gated** — only Cask and Barrel tier breweries can create sponsored challenges
- Impressions and clicks use **dedicated tracking endpoints** with deduplication (one impression per user per session)
- Challenge progress is calculated **server-side** from verified session data — users cannot self-report progress
- Geo-discovery uses **haversine distance** — challenges only appear to users within the configured radius
- Promotion budgets are tracked per-campaign — spending pauses when budget is exhausted
- All sponsored content is clearly **labeled** in the feed (no dark patterns)

**What this prevents:** Fake impression inflation, click fraud, unauthorized promotion creation, budget overruns, misleading advertising.

---

## 3. Brewery Ad Engine

**How it works:** Breweries create native feed ads that appear in the consumer Discover feed, targeted by geography.

**Fraud protections:**
- Ad creation is **tier-gated** (Cask+ only)
- Impressions are **deduplicated** per user per ad per session
- Click tracking records the ad, user, and timestamp — all auditable
- Ads must pass through the brewery admin (no self-serve consumer ads)
- Geo-targeting uses the same haversine system as challenges — verified server-side
- Rate limiting on impression/click endpoints prevents bot-like behavior
- Ad content is tied to the creating brewery — no impersonation possible

**What this prevents:** Impression bots, click fraud, unauthorized ad placement, geo-targeting exploits.

---

## 4. Session & Check-in Integrity

**How it works:** Users start sessions at breweries, log beers, earn XP, and build streaks.

**Fraud protections:**
- XP calculation is **entirely server-side** — the client sends session data, the server computes XP
- XP uses **atomic database increment** (RPC function) — no read-modify-write race conditions
- Session creation is rate limited: **20 sessions per hour** per IP
- Beer logging is rate limited: **60 logs per minute** per user
- Session end is rate limited: **30 per minute** per user
- Cancel session **hard-deletes** all data — no XP, no stats, no history
- Streak grace period is server-validated with a dedicated database column
- First-visit bonus checks against **all historical sessions** at the brewery

**What this prevents:** XP farming, rapid session cycling, fake first-visit bonuses, streak manipulation.

---

## 5. API Security

**Rate limiting:** Applied to all mutation endpoints via `lib/rate-limit.ts` (in-memory, per-IP). Critical endpoints:
- Auth: 5/min
- Sessions: 20/hour
- Beer logs: 60/min
- Comments: 30/min
- Redemptions: 5/min generate, 10/min confirm
- Messages: 5/hour per brewery

**Row Level Security (RLS):** Every Supabase table has RLS policies:
- Users can only read/write their own data
- Brewery admins can only manage their own brewery
- Superadmin has service-role access for platform operations
- Public data (breweries, beers, events) is read-only for authenticated users

**API Keys (Public API v1):**
- SHA-256 hashed storage — raw keys never stored in database
- `ht_live_` prefix for identification
- Max 5 keys per brewery
- Brewery-scoped — a key for Brewery A cannot access Brewery B's data
- Revocable from the brewery admin Settings page
- Rate limited: 100 req/min authenticated, 20 req/min unauthenticated

**POS Webhooks:**
- HMAC-SHA256 signature verification on all webhook payloads
- Replay protection via timestamp validation
- Provider-specific secret keys stored with AES-256-GCM encryption

---

## 6. Smart Notifications

**Fraud protections:**
- Frequency capped: **3 smart notifications per user per day**
- Deduplication: same trigger type + key won't fire again within **24 hours**
- User preference controls — every smart trigger type can be individually disabled
- Rate limit tracking in dedicated `notification_rate_limits` table with auto-cleanup

---

## 7. Billing & Payments

**Fraud protections:**
- All payment processing through **Stripe** — HopTrack never touches credit card data
- Subscription management via Stripe Customer Portal — no custom payment handling
- Webhook verification using Stripe signature
- Tier changes enforce feature gates — downgrading removes access to premium features
- Trial periods tracked server-side — cannot be extended by client manipulation

---

## Future Phases

**Phase 2 (planned):** QR code-based verification for in-person session validation
**Phase 3 (planned):** POS-validated sessions — sessions confirmed by actual POS transaction data

---

*This document should be updated whenever new fraud prevention measures are added. Every feature that touches rewards, money, or promotions needs a section here.*
