# REQ-083: Public API v1

**Status:** COMPLETE
**Sprint:** 85 (The Pipeline)
**Feature:** F-016

## Overview
Versioned public REST API at `/api/v1/` providing read-only access to brewery and beer data, secured with SHA-256 hashed API keys, rate limiting, and CORS support.

## Requirements
- 7 endpoints: brewery detail, tap list (beers + pour sizes), full menu (grouped by item_type), events, stats (key required), beer detail, beer search
- API key system: `ht_live_` prefixed keys, SHA-256 hashed storage, max 5 keys per brewery, revocable
- Standardized JSON envelope: `{ data, meta, error }` on all responses
- Rate limiting: 100 req/min authenticated, 20 req/min unauthenticated
- CORS: enabled for all `/api/v1/` routes via `next.config.ts` headers
- Pagination: `limit` and `offset` params on list endpoints with `meta.total` count
- Stats endpoint: brewery-scoped (API key must match brewery_id)
- ApiKeyManager UI: brewery admin Settings section for key creation, listing, and revocation
- API Documentation: Resources page section with getting started guide, endpoint reference, rate limit info

## Acceptance Criteria
- All 7 endpoints return correct data in `{ data, meta }` envelope
- Invalid/missing API key returns `{ error }` with 401 status
- Rate limit exceeded returns 429 with `Retry-After` header
- Stats endpoint rejects keys belonging to a different brewery (403)
- API key creation returns full key once (never shown again after creation)
- Key revocation immediately invalidates the key
- 5-key limit enforced (6th creation returns 400)
- CORS preflight (OPTIONS) returns correct headers
- Pagination returns accurate `meta.total` and respects `limit`/`offset`

## Technical Notes
- Migration 057: `api_keys` table with `hashed_key`, `brewery_id`, `name`, `revoked_at`, RLS + 5-key trigger
- `lib/api-keys.ts`: `generateApiKey()`, `validateApiKey()`, `hashApiKey()`, `apiResponse()`, `apiError()`, `apiOptions()`
- Key generation: `ht_live_` + 32 random hex chars; stored as SHA-256 hash (raw key never persisted)
- CORS headers added to `next.config.ts` for `/api/v1/:path*` pattern
- Rate limiting reuses existing middleware with separate buckets for authed vs unauthed
