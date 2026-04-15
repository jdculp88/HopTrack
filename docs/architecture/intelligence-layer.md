# Intelligence Layer

*The AI and analytics engine — where HopTrack gets smart.* Owned by [Jordan](../../.claude/agents/jordan.md). Brewery-facing pieces co-owned by [Taylor](../../.claude/agents/taylor.md) and [Parker](../../.claude/agents/parker.md).

**Back to [architecture](README.md) · [wiki home](../README.md).**

---

## What lives here

The Intelligence Layer is the set of features that turn raw HopTrack data into decisions — for drinkers, breweries, and the platform team. It sits between the core write path (sessions, check-ins) and the product surfaces (feed, dashboards).

Three families:

1. **AI crawlers + generators** — Claude-powered services that create content.
2. **KPIs + scores** — computed metrics surfaced to breweries and platform.
3. **Recommenders** — personalization (HopRoute Concierge, Your Round, smart digest).

## AI crawlers + generators

- **Barback** ([REQ-071](../requirements/REQ-071-the-barback-ai-beer-crawler.md)) — scheduled crawler that extracts beer data from brewery websites. Sonnet-powered. Cost-capped. Lives at [scripts/barback-crawl.mjs](../../scripts/barback-crawl.mjs) and runs via [.github/workflows/barback.yml](../../.github/workflows/barback.yml). Tested indirectly in [lib/__tests__/cron-ai-suggestions.test.ts](../../lib/__tests__/cron-ai-suggestions.test.ts).
- **Smart promotions** ([REQ-079](../requirements/REQ-079-promotion-hub.md)) — Haiku generates promotion copy from brewery context. [lib/ai-promotions](../../lib/), [lib/__tests__/ai-promotions.test.ts](../../lib/__tests__/ai-promotions.test.ts).
- **Smart digest recommendations** ([REQ-104](../requirements/REQ-104-intelligence-layer.md)) — rule-based recs layered with Haiku for narrative. Tested in [lib/__tests__/digest-recommendations.test.ts](../../lib/__tests__/digest-recommendations.test.ts).
- **Haiku everywhere** ([Sprint 146](../history/retros/sprint-146-retro.md)) — Haiku 4.5 gets us sub-$5/mo on inference by handling 90% of generation tasks. Sonnet reserved for Barback.

## KPIs + scores

- **Magic Number** ([Sprint 158](../history/retros/sprint-158-retro.md)) — single engagement score per brewery. Computed in [lib/superadmin-intelligence](../../lib/).
- **Brewery Health Score** ([Sprint 159](../history/retros/sprint-159-retro.md)) — 0-100 gauge. Tap tier and up. [lib/brewery-health](../../lib/), [lib/__tests__/brewery-health.test.ts](../../lib/__tests__/brewery-health.test.ts).
- **Peer Benchmarking** ([Sprint 159](../history/retros/sprint-159-retro.md)) — anonymous comparisons between breweries in the same cohort. Cask+. [lib/brewery-benchmarks](../../lib/).
- **Customer Win-Back Intelligence** ([Sprint 159](../history/retros/sprint-159-retro.md)) — at-risk regular identification + one-on-one messaging. Cask+. [lib/win-back](../../lib/).
- **Enhanced KPIs** ([REQ-069](../requirements/REQ-069-enhanced-kpis-analytics.md)) — the 8 novel KPIs engine in [lib/kpi](../../lib/).

All of these are cached via `use cache` ([Sprint 158](../history/retros/sprint-158-retro.md)). Audit: [lib/__tests__/use-cache-audit.test.ts](../../lib/__tests__/use-cache-audit.test.ts).

## Recommenders

- **HopRoute Concierge** ([REQ-118](../requirements/REQ-118-hoproute-concierge.md), [Sprint 178](../history/retros/sprint-178-retro.md)) — per-drinker taste fingerprint + brewery scoring + walking distance. [lib/hop-route-concierge](../../lib/), [lib/__tests__/hop-route-concierge.test.ts](../../lib/__tests__/hop-route-concierge.test.ts). Jordan's "quiet refactor" ask in the S178 pulse was about extracting the scoring into a unified inference layer — that lands later.
- **Your Round** ([REQ-088](../requirements/REQ-088-your-round.md), reimagined via [REQ-107](../requirements/REQ-107-personality-axes-four-favorites.md)) — personalized beer card using 4-axis personality model. [lib/personality](../../lib/), [lib/your-round](../../lib/).
- **Trending** ([REQ-102](../requirements/REQ-102-engagement-engine.md)) — friends/city/style aggregations. [lib/trending](../../lib/).
- **Smart Triggers** — event-based recs via [lib/smart-triggers](../../lib/). Covers digest + nudges.

## Cost + observability

- Anthropic usage is watched daily. Barback is the only Sonnet consumer and has a hard dollar cap in its workflow.
- Haiku usage is per-brewery bucketed so we can identify a single account gone wild.
- Every AI call is logged via [lib/logger](../../lib/) with request ID and latency.

## Cross-links

- [data-model.md](data-model.md) — the tables that feed the intelligence layer.
- [api-layer.md](api-layer.md) — how the scores get to clients.
- [realtime.md](realtime.md) — the event-time recs path.
- [operations/ci-cd.md](../operations/ci-cd.md) — the cron schedule for Barback, digest, stats-snapshot.
