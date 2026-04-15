# REQ-073: POS Integration (Toast + Square)

**Status:** QUEUED
**Priority:** P1
**Category:** Third-Party Integration / Revenue Feature
**Sides:** Brewery Admin (operations), Consumer (data freshness), Platform (revenue)
**Effort:** L (6+ sprints -- partner API approvals, OAuth flows, webhook infrastructure, keg tracking)
**Related:** F-006 (POS Phase 1 -- Toast + Square), F-014 (POS Phase 2 -- Keg Tracking), F-001 (billing tiers), REQ-071 (The Barback -- data freshness precedent)
**Sprint Arc:** Open the Pipes (Sprints 85-90)
**Author:** Sam (Business Analyst / QA Lead)
**Date:** 2026-03-31

---

## 1. Problem Statement

Brewery owners live inside their POS system. Toast. Square. Arryved. It is the center of their operation -- every pour, every tab, every shift close runs through it. When a brewery signs up for HopTrack, the first thing they have to do is re-enter their entire tap list by hand. Then every time they kick a keg or tap something new, they update two systems. That is the number one reason brewery SaaS tools churn: double entry.

From a business continuity standpoint, this is the gap that blocks Cask and Barrel tier sales. Taylor cannot walk into a brewery and pitch a $149/month tool that creates MORE work. The pitch only works if HopTrack reduces work -- and the single biggest work-reducer is "connect your POS, and your tap list stays in sync automatically."

**The gap:** HopTrack has zero integration with any POS system. Every tap list change requires manual entry in both the POS and HopTrack. This is a dealbreaker for busy taprooms.

**The opportunity:** Toast and Square are the two most common POS systems in craft breweries. Toast has a formal Partner Program with menu webhooks. Square has a well-documented open API with catalog and order endpoints. Integrating these two covers an estimated 60-70% of our target ICP.

**The revenue case:**
- POS integration is the feature that justifies Cask ($149/mo) pricing. Without it, Cask is a hard sell over Tap ($49/mo).
- Keg tracking (Phase 2) is the feature that justifies Barrel (custom) pricing. DigitalPour's entire value proposition is POS-driven keg tracking. We can match it and surpass it with our consumer + social layer.
- Toast Loyalty costs $185/mo on top of POS fees. Our Cask tier at $149/mo includes loyalty AND POS sync AND analytics AND a consumer app. That is a pricing story Taylor can close on.

**The constraint:** POS providers have partner programs with approval processes. Toast requires a formal application and sandbox access. Square is more open but still requires OAuth app review. We need to start the application process before we start writing code.

---

## 2. User Stories

### 2.1 Brewery Owner (Cask/Barrel Tier)

| ID | Story | Priority |
|----|-------|----------|
| US-01 | As a brewery owner, I want to connect my Toast POS to HopTrack so my tap list stays in sync automatically. | P0 |
| US-02 | As a brewery owner, I want to connect my Square POS to HopTrack so my tap list stays in sync automatically. | P0 |
| US-03 | As a brewery owner, I want to see the sync status of my POS connection (last sync time, any errors) so I know it is working. | P0 |
| US-04 | As a brewery owner, I want to manually trigger a sync if something looks out of date. | P1 |
| US-05 | As a brewery owner, I want to map POS menu items to HopTrack beer styles and descriptions, since my POS only has names and prices. | P1 |
| US-06 | As a brewery owner, I want to disconnect my POS at any time and have all stored tokens deleted immediately. | P0 |
| US-07 | As a brewery owner, I want new beers from my POS to appear on my HopTrack tap list without me doing anything. | P0 |
| US-08 | As a brewery owner, when I 86 a beer in my POS, I want it removed from my HopTrack tap list automatically. | P0 |
| US-09 | As a brewery owner, I want POS items that are not beer (food, merch, NA beverages) handled appropriately -- either skipped or created as the correct item type. | P1 |

### 2.2 Brewery Owner -- Sales Intelligence (Phase 2)

| ID | Story | Priority |
|----|-------|----------|
| US-10 | As a brewery owner, I want to see revenue per tap handle so I know which beers are earning their spot. | P2 |
| US-11 | As a brewery owner, I want to see pour velocity (pours per day per beer) so I can predict when kegs will kick. | P2 |
| US-12 | As a brewery owner, I want a "running low" indicator on The Board when a keg is estimated below 20% remaining. | P2 |
| US-13 | As a brewery owner, I want auto-86 -- when estimated remaining hits zero, the beer is automatically removed from my active tap list. | P2 |
| US-14 | As a brewery owner, I want a best sellers report (daily, weekly, monthly) pulled from actual POS sales data. | P2 |

### 2.3 Brewery Owner (Tap Tier -- Upsell Target)

| ID | Story | Priority |
|----|-------|----------|
| US-20 | As a Tap-tier brewery owner, I want to see that POS integration exists on Cask/Barrel so I understand what I am missing. | P1 |
| US-21 | As a Tap-tier brewery owner, I want a clear upgrade path when I try to access POS features. | P1 |

### 2.4 Consumer (Indirect Benefit)

| ID | Story | Priority |
|----|-------|----------|
| US-30 | As a consumer, I want the tap list at POS-connected breweries to always reflect what is actually on tap right now. | P0 |
| US-31 | As a consumer, I want to know that a brewery's tap list is POS-synced so I trust the data more. | P2 |

### 2.5 Superadmin (Platform Ops)

| ID | Story | Priority |
|----|-------|----------|
| US-40 | As a superadmin, I want to see which breweries have POS connections, their provider, and sync health. | P1 |
| US-41 | As a superadmin, I want alerts when a POS connection fails repeatedly so I can intervene. | P1 |
| US-42 | As a superadmin, I want to see aggregate POS stats (total connected, sync success rate, average latency). | P1 |

---

## 3. Phase 1 -- Menu Sync (Sprints 86-87)

### 3.1 Toast POS Integration

**Prerequisites:**
- Apply to Toast Partner Program (requires company info, use case, estimated volume)
- Obtain sandbox environment credentials
- Complete Toast's technical review process

**Integration points:**
- **OAuth2 flow:** Brewery owner clicks "Connect Toast" in HopTrack settings. Redirected to Toast authorization. On approval, we receive access + refresh tokens. Stored encrypted server-side.
- **Menu webhook subscription:** Subscribe to Toast menu change events via `menus.updated` webhook. When a Toast menu item changes (added, modified, removed), webhook fires to our callback URL.
- **Menu polling fallback:** If webhook delivery fails, poll Toast menu API every 15 minutes as a safety net.
- **Item mapping:** Toast menu items include name, price, and category. HopTrack needs style, ABV, description. First sync requires manual mapping. Subsequent new items get auto-mapped if the name fuzzy-matches an existing HopTrack beer or the Barback beer catalog.

**Toast-specific considerations:**
- Toast uses a restaurant-group model. A brewery may have multiple "restaurants" (locations) under one Toast account. We need to handle location selection during OAuth.
- Toast menu items have modifiers (size variants). Map the default/standard size to HopTrack pour size.
- Toast webhooks require HTTPS callback URLs. No localhost, no HTTP. Production-only or ngrok for dev.

### 3.2 Square POS Integration

**Prerequisites:**
- Create Square Developer account
- Register OAuth application
- Submit for production access review (if required by Square)

**Integration points:**
- **OAuth2 flow:** Brewery owner clicks "Connect Square" in HopTrack settings. Redirected to Square authorization. On approval, we receive access + refresh tokens.
- **Catalog webhook subscription:** Subscribe to `catalog.version.updated` webhook. When a Square catalog item changes, webhook fires to our callback URL.
- **Catalog polling fallback:** Poll Square Catalog API every 15 minutes if webhook delivery fails.
- **Item mapping:** Square catalog items include name, variations (sizes/prices), and category. Same mapping challenge as Toast -- HopTrack enriches with style, ABV, description.

**Square-specific considerations:**
- Square uses a "locations" model. Brewery selects which location during OAuth flow.
- Square catalog items can have item variations (e.g., "Pint" and "Half Pint" as separate variations). Map variations to HopTrack pour sizes.
- Square's webhook system uses event notification endpoints. We handle `catalog.version.updated` events.

### 3.3 Brewery Admin UI

**POS Settings Page:** `app/(brewery-admin)/brewery-admin/[brewery_id]/settings/pos/`

- **Connection cards:** One card per supported POS (Toast, Square). Shows connected/disconnected state.
- **Connect flow:** OAuth redirect button. After successful auth, shows "Connected" with provider name, connected date, last sync time.
- **Disconnect flow:** Inline confirmation (AnimatePresence, no `confirm()` dialog). On confirm: revoke token with provider, delete encrypted tokens from our DB, remove webhook subscriptions.
- **Sync status dashboard:** Last sync time, items synced count, any errors (with retry button). Simple traffic-light indicator: green (synced within 5 min), yellow (synced within 1 hour), red (sync failed).
- **Field mapping UI:** Table showing POS items mapped to HopTrack beers. Columns: POS item name, mapped HopTrack beer (dropdown), style (editable), ABV (editable), status (auto-mapped / manual / unmapped). "Auto-map" button attempts fuzzy matching on unmapped items.
- **Manual sync button:** "Sync Now" triggers an immediate pull from POS API. Debounced -- once per 5 minutes max.

**Tier gating:**
- Tap tier: POS settings page shows the connection cards in a locked state with an "Upgrade to Cask" CTA.
- Cask/Barrel tier: Full access to POS connection and sync features.

### 3.4 Conflict Resolution Rules

POS and HopTrack own different aspects of the beer data. Clear ownership prevents data fights.

| Field | Source of Truth | Rationale |
|-------|----------------|-----------|
| Name | POS | Brewery names their beers in the POS. HopTrack follows. |
| Price | POS | Price changes happen at the register. Always defer to POS. |
| Availability (on tap / 86'd) | POS | If it is gone from the POS menu, it is gone from the tap list. |
| Style | HopTrack | POS systems do not have beer style taxonomy. HopTrack owns this. |
| ABV | HopTrack | POS rarely tracks ABV. HopTrack enriches. |
| IBU | HopTrack | Same as ABV. |
| Description | HopTrack | POS descriptions are terse register labels. HopTrack has the full story. |
| Rating / Reviews | HopTrack | Consumer data lives in HopTrack exclusively. |
| Pour sizes | Merge | POS defines available sizes. HopTrack maps to our PourSize model. |

**Conflict scenarios:**
1. **Beer renamed in POS:** Update name in HopTrack. Preserve HopTrack-owned fields.
2. **Beer removed from POS:** Set `is_on_tap = false` in HopTrack. Do NOT delete the beer record (it has check-ins, ratings, history).
3. **New beer added in POS:** Create a new beer in HopTrack with POS name and price. Style/ABV/description default to null -- brewery owner maps them in the field mapping UI (or auto-map fills them).
4. **Beer exists in HopTrack but not in POS:** Leave it alone. The brewery may have manually added beers that are not sold through the POS (guest taps, special pours).

### 3.5 Auto-Sync Flow

```
[POS Menu Change]
  → [Webhook fires to /api/pos/webhook/{provider}]
  → [Verify webhook signature]
  → [Parse payload → extract menu items]
  → [Diff against current HopTrack tap list for this brewery]
  → [Apply changes: add new, update existing, deactivate removed]
  → [Log sync event to pos_sync_logs]
  → [If new unmapped items: notify brewery owner in-app]
```

**Latency target:** POS change to HopTrack tap list update in under 5 minutes.

---

## 4. Phase 2 -- Sales Intelligence (Sprint 88+)

### 4.1 Sales Data Pull

- **Toast:** Orders API provides per-item sales data. Pull daily aggregates (total pours, revenue) per menu item.
- **Square:** Orders API provides per-item transaction data. Same daily aggregate pattern.
- **Storage:** `pos_sales_daily` table -- brewery_id, beer_id, date, pour_count, revenue_cents, average_price_cents.
- **Pull frequency:** Nightly batch job (midnight local brewery time). Not real-time -- sales intelligence is a reporting feature, not an operational one.

### 4.2 Dashboard: Revenue Per Tap Handle

New analytics card on brewery dashboard:

- **Revenue per tap:** Bar chart showing revenue per beer over selected date range (7d / 30d / 90d).
- **Pour velocity:** Pours per day per beer. Trend line showing acceleration or deceleration.
- **Best sellers:** Ranked list with spark trends.
- **Slow movers:** Beers below a configurable threshold (e.g., fewer than 5 pours/day). Helps breweries decide when to rotate.

### 4.3 Keg Tracking (F-014 Foundation)

**Concept:** Estimate remaining keg volume based on pour count and keg size.

- Brewery sets keg size per beer (1/6 bbl, 1/4 bbl, 1/2 bbl, or custom gallons).
- System tracks cumulative pours since keg was tapped (from POS sales data).
- Estimated remaining = keg capacity - (pour count * average pour size).
- **Running low indicator:** When estimated remaining drops below 20%, show amber indicator on The Board and in the dashboard.
- **Auto-86:** When estimated remaining hits 0 (or configurable threshold), automatically set `is_on_tap = false`. Send push notification to brewery owner: "Looks like [Beer Name] just kicked. We've removed it from your tap list."
- **Reset:** When brewery taps a new keg of the same beer, they reset the counter (one-tap action in admin).

**Why this matters for Barrel tier:** DigitalPour charges custom pricing for POS-driven keg tracking. This is their core differentiator. Matching it and wrapping it in our consumer + social + loyalty platform makes our Barrel tier the obvious choice.

---

## 5. API Requirements

### 5.1 Toast Partner API

| Requirement | Detail |
|-------------|--------|
| Partner Program | Apply at `https://pos.toasttab.com/partners`. Requires company info, integration description, estimated install volume. |
| Authentication | OAuth2 with PKCE. Authorization code flow. |
| Sandbox | Toast provides a sandbox environment for development and testing. |
| Menu API | `GET /menus` returns full menu tree. `GET /menus/{menuId}` for specific menu. |
| Menu Webhooks | `menus.updated` event fires on any menu change. Payload includes restaurant GUID and change type. |
| Orders API (Phase 2) | `GET /orders` with date range filter. Per-item line items with quantity and price. |
| Rate Limits | Toast enforces per-partner rate limits. Typically 100 requests/minute. |
| Webhook Security | HMAC-SHA256 signature verification on webhook payloads using shared secret. |
| HTTPS Required | All callback URLs must be HTTPS. No exceptions. |

### 5.2 Square API

| Requirement | Detail |
|-------------|--------|
| Developer Account | Register at `https://developer.squareup.com`. Free. |
| Authentication | OAuth2 authorization code flow. |
| Sandbox | Square provides sandbox with test credentials. |
| Catalog API | `GET /v2/catalog/list` returns all catalog items. Supports type filtering. |
| Catalog Webhooks | `catalog.version.updated` event fires on catalog changes. |
| Orders API (Phase 2) | `GET /v2/orders/search` with date range and location filter. |
| Rate Limits | Square enforces per-application rate limits. Typically 20 requests/second. |
| Webhook Security | Signature verification using Square's webhook notification URL. SHA-256 HMAC. |
| HTTPS Required | Yes, callback URLs must be HTTPS. |

### 5.3 Our API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/pos/connect/{provider}` | GET | Initiate OAuth flow (redirect to provider auth page) |
| `/api/pos/callback/{provider}` | GET | OAuth callback (exchange code for tokens, store encrypted) |
| `/api/pos/disconnect/{provider}` | POST | Revoke token, delete connection, remove webhooks |
| `/api/pos/sync/{provider}` | POST | Manual sync trigger (pull current menu from POS) |
| `/api/pos/webhook/toast` | POST | Toast webhook receiver (menu changes) |
| `/api/pos/webhook/square` | POST | Square webhook receiver (catalog changes) |
| `/api/pos/status` | GET | Connection status for current brewery (provider, last sync, health) |
| `/api/pos/mapping` | GET/PUT | Retrieve and update field mapping (POS items to HopTrack beers) |
| `/api/pos/sales` | GET | Sales data for connected brewery (Phase 2) |

---

## 6. Security

### 6.1 Token Storage

- OAuth access tokens and refresh tokens stored in `pos_connections` table.
- Tokens encrypted at rest using AES-256-GCM. Encryption key stored as environment variable (`POS_TOKEN_ENCRYPTION_KEY`), never in code or database.
- Tokens decrypted only at the moment of API call, in server-side code. Never sent to the client. Never logged.
- Refresh token rotation: when a refresh is performed, old refresh token is invalidated immediately.

### 6.2 Webhook Verification

- **Toast:** Verify HMAC-SHA256 signature header against shared webhook secret. Reject any request with invalid or missing signature.
- **Square:** Verify Square's signature header using the webhook notification URL and signature key. Reject invalid signatures.
- **Replay protection:** Check webhook timestamp. Reject webhooks older than 5 minutes.
- **Idempotency:** Webhook handlers are idempotent. Processing the same webhook twice produces the same result.

### 6.3 Disconnection

When a brewery owner disconnects their POS:

1. Revoke access token with the POS provider API.
2. Delete the `pos_connections` row (tokens, metadata, everything).
3. Remove webhook subscriptions with the POS provider.
4. Existing synced beers remain in HopTrack (they have check-in history). But auto-sync stops immediately.
5. Log the disconnection event.

### 6.4 Access Control

- POS settings and data are scoped to the brewery. Only the brewery owner (or staff with admin role) can connect, disconnect, view sync status, or access sales data.
- RLS policies on `pos_connections` and `pos_sales_daily`: brewery owner only.
- Superadmin has read-only access to connection health (not tokens).

---

## 7. New Database Objects

### Tables

**`pos_connections`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| brewery_id | uuid (FK -> breweries) | UNIQUE per provider per brewery |
| provider | text | `toast` or `square` |
| access_token_encrypted | bytea | AES-256-GCM encrypted |
| refresh_token_encrypted | bytea | AES-256-GCM encrypted |
| token_expires_at | timestamptz | When access token expires |
| provider_location_id | text | Toast restaurant GUID or Square location ID |
| provider_merchant_id | text | Nullable -- Square merchant ID or Toast partner restaurant GUID |
| status | text | `active`, `error`, `disconnected` |
| last_sync_at | timestamptz | Nullable |
| last_sync_status | text | `success`, `partial`, `failed` |
| last_sync_item_count | integer | Number of items synced in last sync |
| webhook_subscription_id | text | Nullable -- provider's webhook subscription ID for cleanup |
| connected_at | timestamptz | |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now() |

**`pos_item_mappings`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| pos_connection_id | uuid (FK -> pos_connections) | |
| brewery_id | uuid (FK -> breweries) | Denormalized for query convenience |
| pos_item_id | text | Provider's item ID |
| pos_item_name | text | Name as it appears in the POS |
| beer_id | uuid (FK -> beers) | Nullable -- null means unmapped |
| mapping_type | text | `auto`, `manual`, `unmapped` |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now() |

**`pos_sync_logs`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| pos_connection_id | uuid (FK -> pos_connections) | |
| brewery_id | uuid (FK -> breweries) | Denormalized |
| sync_type | text | `webhook`, `manual`, `scheduled` |
| provider | text | `toast` or `square` |
| items_added | integer | |
| items_updated | integer | |
| items_removed | integer | |
| items_unmapped | integer | New items that could not be auto-mapped |
| status | text | `success`, `partial`, `failed` |
| error | text | Nullable |
| duration_ms | integer | |
| created_at | timestamptz | Default now() |

**`pos_sales_daily`** (Phase 2)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| brewery_id | uuid (FK -> breweries) | |
| beer_id | uuid (FK -> beers) | |
| date | date | |
| pour_count | integer | |
| revenue_cents | integer | Stored as cents to avoid float issues |
| average_price_cents | integer | |
| created_at | timestamptz | Default now() |

**Unique constraint on `pos_sales_daily`:** (brewery_id, beer_id, date) -- one row per beer per day per brewery.

### Columns Added to Existing Tables

**`beers` table:**
| Column | Type | Notes |
|--------|------|-------|
| pos_item_id | text | Nullable -- POS provider's item ID for this beer |
| pos_price_cents | integer | Nullable -- current POS price |
| pos_last_seen_at | timestamptz | Nullable -- last time this beer appeared in a POS sync |

**`breweries` table:**
| Column | Type | Notes |
|--------|------|-------|
| pos_provider | text | Nullable -- `toast`, `square`, or null |
| pos_connected | boolean | Default false |
| pos_last_sync_at | timestamptz | Nullable |

### RLS Policies

- `pos_connections`: SELECT/INSERT/UPDATE/DELETE restricted to brewery owner (match `brewery_id` to user's owned brewery).
- `pos_item_mappings`: Same as `pos_connections`.
- `pos_sync_logs`: SELECT for brewery owner (read-only). INSERT for service role only.
- `pos_sales_daily`: SELECT for brewery owner. INSERT for service role only.
- Superadmin: SELECT on all POS tables (no token columns exposed in superadmin views -- join only on non-sensitive columns).

---

## 8. Tier Gating

| Feature | Tap ($49/mo) | Cask ($149/mo) | Barrel (custom) |
|---------|-------------|----------------|-----------------|
| POS connection (Toast/Square) | Locked -- upgrade CTA | Yes | Yes |
| Auto menu sync | Locked | Yes | Yes |
| Manual sync | Locked | Yes | Yes |
| Field mapping UI | Locked | Yes | Yes |
| Sales intelligence dashboard | Locked | Locked -- upgrade CTA | Yes |
| Keg tracking + auto-86 | Locked | Locked | Yes |
| Revenue per tap handle | Locked | Locked | Yes |

**Upsell UI:**
- Tap tier owners see POS settings page with a locked overlay: "Connect your POS and never double-enter a tap list again. Upgrade to Cask to unlock." Big gold CTA button.
- Cask tier owners see sales intelligence cards in a locked state: "See which beers earn their spot. Upgrade to Barrel for sales intelligence and keg tracking."

---

## 9. Success Metrics

### Phase 1 (Menu Sync)

| Metric | Target | How We Measure |
|--------|--------|----------------|
| Menu sync latency | < 5 minutes from POS change to HopTrack update | Timestamp diff in pos_sync_logs |
| Manual tap list updates needed | Zero for connected breweries | Track manual beer edits for POS-connected breweries |
| Field mapping accuracy | >= 80% auto-mapped on first sync | Auto-mapped count / total items in first sync |
| Webhook delivery success rate | >= 99% | Webhook receipt logs vs. known POS changes |
| OAuth flow completion rate | >= 90% of started flows complete | OAuth start events vs. callback events |
| Time to connect | < 3 minutes from click to connected | User timing in analytics |
| Sync error rate | < 2% of syncs fail | pos_sync_logs status = failed / total syncs |
| Brewery satisfaction (qualitative) | "This saves me time" from 3+ breweries | Direct feedback |

### Phase 2 (Sales Intelligence)

| Metric | Target | How We Measure |
|--------|--------|----------------|
| Sales data freshness | < 24 hours (nightly batch) | Last pull timestamp |
| Keg tracking accuracy | Within 10% of actual remaining | Compare auto-86 predictions vs. actual keg kicks |
| Dashboard engagement | 3+ views per week by connected brewery owners | Analytics |
| Tier upgrade conversion | 10%+ of Tap-tier breweries who see POS upsell upgrade within 30 days | Funnel tracking |

---

## 10. Edge Cases

### 10.1 Multiple POS Terminals / Locations

- A brewery may have multiple Square terminals or Toast stations. These typically share one catalog/menu.
- During OAuth, the brewery selects which location to sync. We store `provider_location_id`.
- Multi-location breweries (see REQ-072) may have different POS instances per location. Each HopTrack location gets its own `pos_connections` row.

### 10.2 Non-Beer POS Items

POS menus contain food, merchandise, NA beverages, and other non-beer items. Handling:

| POS Item Category | HopTrack Action |
|-------------------|----------------|
| Beer / craft beer / draft beer | Map to HopTrack beer (item_type = `beer`) |
| Cider | Map to HopTrack item (item_type = `cider`) |
| Wine | Map to HopTrack item (item_type = `wine`) |
| Cocktail / mixed drink | Map to HopTrack item (item_type = `cocktail`) |
| Non-alcoholic beverage | Map to HopTrack item (item_type = `non_alcoholic`) |
| Food / merch / other | Skip by default. Do not create in HopTrack. Brewery can manually map if desired. |

Auto-categorization uses keyword matching on POS item name and category. Brewery owner can override any auto-categorization in the mapping UI.

### 10.3 Token Expiry and Refresh

- Access tokens have limited lifespans (Toast: ~12 hours, Square: ~30 days).
- Refresh tokens are used to obtain new access tokens automatically before expiry.
- If refresh fails (brewery revoked access on the POS side), set `pos_connections.status = 'error'`. Show error state in admin UI: "Your POS connection needs to be re-authorized." Provide re-connect button.
- After 3 consecutive failed refreshes over 48 hours, send push notification to brewery owner.

### 10.4 POS Provider API Downtime

- If a webhook fires but our processing fails, retry with exponential backoff (3 retries over 15 minutes).
- If the POS API is unreachable during a manual sync, show clear error: "Toast is currently unreachable. Your tap list shows the last known state. We'll retry automatically."
- Graceful degradation: HopTrack tap list always shows last-known state. No data is deleted due to a sync failure. Stale is better than empty.
- Sync health indicator on the admin dashboard turns yellow after 1 hour without successful sync, red after 6 hours.

### 10.5 Brewery Switches POS Systems

- Brewery disconnects Toast, connects Square (or vice versa).
- Old connection is fully cleaned up (tokens revoked, webhooks removed, connection deleted).
- New connection starts fresh. Existing beers in HopTrack remain (they have history). New POS items are mapped to existing beers where possible (fuzzy name match).
- `pos_item_mappings` from the old connection are archived (soft-deleted), not hard-deleted, in case the brewery switches back.

### 10.6 POS Menu Item Names Do Not Match HopTrack Beer Names

- POS might call it "HazyDays IPA 16oz" while HopTrack has "Hazy Days IPA."
- Auto-mapping uses normalized fuzzy matching: strip punctuation, normalize whitespace, remove pour size references, Levenshtein distance threshold of 0.8.
- Unmapped items are flagged in the mapping UI for manual resolution.
- Over time, confirmed mappings train the auto-mapper for that brewery (learning effect).

---

## 11. Risk Matrix

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R-01 | **Toast Partner Program rejection** -- application denied or delayed | Medium | Critical | Apply early (Sprint 85). Have Square as fallback. Both integrations are independent workstreams. |
| R-02 | **OAuth complexity** -- brewery owners confused by authorization flow | Medium | High | Crystal-clear UI with step-by-step. "Connect in 3 clicks" design. Error messages that explain what went wrong and what to do. |
| R-03 | **Field mapping burden** -- too many unmapped items overwhelm brewery owner | Medium | Medium | Auto-map aggressively using Barback beer catalog as reference. Only surface truly ambiguous items for manual mapping. |
| R-04 | **Webhook reliability** -- missed webhooks cause stale tap lists | Low | High | Polling fallback every 15 minutes. Sync health monitoring with alerts. Manual sync as escape valve. |
| R-05 | **Token storage breach** -- encrypted tokens compromised | Very Low | Critical | AES-256-GCM encryption. Encryption key as env var, not in DB. Tokens never logged or sent to client. Regular security audit. |
| R-06 | **POS API rate limits** -- hitting limits during high-sync periods | Low | Medium | Debounce webhook processing. Batch changes within 30-second windows. Respect rate limit headers. Exponential backoff on 429. |
| R-07 | **Scope creep into full POS** -- feature requests to handle payments, tabs, etc. | High | Medium | This is a SYNC integration, not a POS replacement. We read data from the POS. We do not write orders, process payments, or manage tables. Scope boundary is documented and enforced. |
| R-08 | **Keg tracking inaccuracy** -- estimates diverge from reality | Medium | Medium | Phase 2 only. Position as "estimate" not "measurement." Allow manual keg reset. Compare estimates vs. actual kick dates to calibrate over time. |
| R-09 | **Provider API changes** -- Toast or Square changes their API | Medium | Medium | Pin to specific API versions. Monitor provider changelogs. Build abstraction layer so provider-specific code is isolated. |
| R-10 | **Low adoption** -- breweries have POS but do not bother to connect | Medium | High | Make connection part of onboarding wizard. Highlight "zero double-entry" benefit. Taylor's demo script should show the sync in real-time. |

---

## 12. Acceptance Criteria

### Phase 1 Must Have (ships when ALL are met)

- [ ] Toast OAuth2 flow: brewery can connect and disconnect Toast POS from HopTrack admin
- [ ] Square OAuth2 flow: brewery can connect and disconnect Square POS from HopTrack admin
- [ ] Webhook receivers for Toast and Square with signature verification
- [ ] Menu changes in POS propagate to HopTrack tap list within 5 minutes
- [ ] New POS items auto-mapped to HopTrack beers at >= 80% accuracy
- [ ] Field mapping UI allows brewery to manually map unmapped items
- [ ] "Sync Now" manual trigger with debounce (max once per 5 minutes)
- [ ] Sync status dashboard: last sync time, items synced, error state
- [ ] Disconnect flow: revoke token, delete encrypted tokens, remove webhooks
- [ ] Tokens stored with AES-256-GCM encryption, never exposed to client
- [ ] Webhook replay protection (reject webhooks older than 5 minutes)
- [ ] Tap-tier sees locked POS settings with upgrade CTA
- [ ] Cask/Barrel-tier has full POS access
- [ ] `pos_connections`, `pos_item_mappings`, and `pos_sync_logs` tables with RLS policies
- [ ] Graceful degradation on POS API downtime (show last-known state)
- [ ] Non-beer items handled per category mapping rules
- [ ] At least one POS integration (Toast or Square) tested end-to-end in sandbox

### Phase 1 Should Have

- [ ] Polling fallback (15-minute interval) when webhooks are missed
- [ ] Auto-refresh of expiring tokens before they expire
- [ ] Push notification on connection errors
- [ ] Superadmin POS health dashboard
- [ ] Sync event history in admin (last 50 syncs with details)

### Phase 2 Must Have (ships when ALL are met)

- [ ] Nightly sales data pull from POS (pour count, revenue per beer per day)
- [ ] Revenue per tap handle chart in brewery dashboard
- [ ] Pour velocity metric (pours per day per beer)
- [ ] Best sellers and slow movers report
- [ ] Keg size configuration per beer
- [ ] Running low indicator at 20% estimated remaining
- [ ] Auto-86 when estimated remaining hits zero
- [ ] Keg reset action (one-tap in admin)
- [ ] `pos_sales_daily` table with RLS policies

---

## 13. Out of Scope

| Item | Why | When |
|------|-----|------|
| Writing to POS (orders, payments, tabs) | We are a sync layer, not a POS. | Never for Phase 1-2. |
| Arryved POS integration | Smaller market share. Validate Toast + Square first. | Post Phase 1, if demand exists. |
| GoTab POS integration | Same as Arryved. | Post Phase 1, if demand exists. |
| Real-time streaming (sub-second sync) | Overkill. 5-minute latency is fine for tap lists. | Only if demand justifies. |
| POS-driven loyalty (auto-stamp on purchase) | Different integration scope. Needs its own REQ. | Future REQ when POS Phase 1 is stable. |
| Multi-POS per brewery (Toast AND Square) | Edge case. Pick one. | Post Phase 1, if demand exists. |
| Credit-card-linked loyalty enrollment | Requires deep POS payment integration. Complex. | Future REQ (separate from POS sync). |
| Historical sales backfill (pre-connection) | API limits and data availability vary. | Phase 2 stretch goal at best. |

---

## 14. Implementation Timeline

| Sprint | Focus | Deliverables |
|--------|-------|-------------|
| 85 | Partner Applications + Schema | Apply to Toast Partner Program. Create Square developer app. Migration for `pos_connections`, `pos_item_mappings`, `pos_sync_logs`. Encryption utility (`lib/pos-crypto.ts`). |
| 86 | Toast Integration | Toast OAuth flow. Toast menu webhook. Toast menu polling fallback. Field mapping UI. Sync status dashboard. |
| 87 | Square Integration + Polish | Square OAuth flow. Square catalog webhook. Square polling fallback. Tier gating UI. Disconnect flow. End-to-end testing. |
| 88+ | Sales Intelligence | Sales data pull. Dashboard cards. Keg tracking. Auto-86. |

---

## Appendix A: Open Questions

1. **Toast Partner Program timeline:** How long does approval take? Do we need a live production URL or can we apply with sandbox-only? (Riley to research.)
2. **Encryption key management:** Single env var or KMS? For launch, env var is fine. For scale, consider AWS KMS or Supabase Vault. (Jordan to decide.)
3. **Which POS first?** Square is more open (no formal partner program). Toast is more common in craft breweries. Recommendation: build Square first (faster to start), Toast in parallel if partner approval comes through. (Morgan to decide.)
4. **Webhook testing in development:** Both providers require HTTPS callbacks. Use ngrok or Cloudflare Tunnel for dev/staging? (Riley to set up.)
5. **Auto-map training data:** Can we use The Barback's beer catalog as a reference for fuzzy matching POS item names to beer styles? (Jordan to evaluate.)
6. **POS-driven loyalty stamps:** If a POS sale is detected for a loyalty-enrolled customer, should it auto-stamp? This is a massive feature but a separate REQ. Flagging it now. (Sam to write REQ if demand validated.)

---

*"From a business continuity standpoint, double-entry is the silent killer of brewery SaaS adoption. Every minute a brewery owner spends updating two systems is a minute they're thinking about canceling one of them. POS integration makes sure the one they keep is HopTrack."*

-- Sam, Business Analyst / QA Lead

---

## RTM Links

### Implementation
[lib/pos-sync](../../lib/)

### Tests
[pos-sync.test.ts](../../lib/__tests__/pos-sync.test.ts)

### History
- [retro](../history/retros/sprint-87-retro.md)
- [plan](../history/plans/sprint-87-plan.md)

> Added 2026-04-15 during the wiki reorg — see the [RTM](README.md) for the master table.
