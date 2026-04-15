# Public API v1 — Narrative

*Why the public API exists, who uses it, and where to point them.* Owned by [Jordan](../../.claude/agents/jordan.md).

**Back to [api](README.md) · [wiki home](../README.md).**

The full endpoint reference lives in [api-reference.md](api-reference.md). This page is the narrative overview.

---

## Why it exists

Public API v1 was built in [Sprint 85](../history/retros/sprint-85-retro.md) ([REQ-083](../requirements/REQ-083-public-api-v1.md)) for one reason: POS integrations ([REQ-073](../requirements/REQ-073-pos-integration.md)) need a stable, versioned surface that doesn't break every time the consumer app evolves.

If the only consumers were the HopTrack app and dashboard, we wouldn't need this. The moment Toast, Square, or a brewery's embedded widget needs to push pour data into us, we need a contract.

## Who uses it

- **POS adapters** — Toast and Square, shipped in [Sprint 87](../history/retros/sprint-87-retro.md) ([REQ-073](../requirements/REQ-073-pos-integration.md)). Write taps, sync sales.
- **Embed widgets** — the brewery-website tap list widget ([Sprint 80](../history/retros/sprint-80-retro.md)). Read-only.
- **Partners TBD** — we haven't opened the API to the outside yet. When we do, this narrative + [api-reference.md](api-reference.md) is the docs.

## Auth model

API keys, not user sessions. Keys are hashed in storage, scoped to a brand/location, and have explicit permission bits. Rotation is a user action from the brewery admin settings. See [auth-and-rls.md](../architecture/auth-and-rls.md#api-key-auth-public-api).

## Rate limits

Separate from the internal API's limits. Stricter. Based on plan tier — Cask+ gets higher quotas. Owner: Riley. Runbook: [operations/rate-limit-upgrade.md](../operations/rate-limit-upgrade.md).

## Versioning policy

- `/api/v1/` routes are **forward-compatible**. We never remove a field; we only add.
- Breaking changes ship as `/api/v2/`. v1 gets a 6-month sunset window with a deprecation header on every response.
- Additive changes (new endpoint, new optional field) go into v1 without a version bump.

## Error shape

Same discriminated-union envelope as the internal API — see [architecture/api-layer.md](../architecture/api-layer.md#response-envelope). Codes are stable across versions.

## Cross-links

- [api-reference.md](api-reference.md) — the endpoint-by-endpoint spec.
- [REQ-083 Public API v1](../requirements/REQ-083-public-api-v1.md).
- [REQ-073 POS Integration](../requirements/REQ-073-pos-integration.md).
- [architecture/api-layer.md](../architecture/api-layer.md).
