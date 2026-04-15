# HopTrack Wiki 🍺

*Track Every Pour. This is the documentation for how HopTrack is built, who builds it, and how it all fits together.*

**Last organized:** 2026-04-15 (post-Sprint 178 · The Concierge)
**Maintained by:** the HopTrack team ([org chart](team/README.md))

---

## Start here

If you're new, read [CLAUDE.md](../CLAUDE.md) at the repo root first — that's who the team is. Then come back here to learn how the product works.

If you're looking for something specific, jump straight in:

- **Building a feature?** Start at [architecture/system-overview.md](architecture/system-overview.md) to understand how the pieces fit, then check [requirements/README.md](requirements/README.md) for the RTM and see if your feature has a REQ.
- **Shipping a change?** Read the relevant [architecture](architecture/README.md) page, write or update the [REQ](requirements/README.md), add tests per [testing/README.md](testing/README.md), and the change is traceable end-to-end.
- **Going live or debugging prod?** See [operations/README.md](operations/README.md) and [operations/launch-day-ops.md](operations/launch-day-ops.md).
- **Selling to a brewery?** [sales/README.md](sales/README.md) has the pitch deck, ICP, and onboarding playbook.
- **Understanding the design?** [design/design-system.md](design/design-system.md) is the visual system; [design/mockups/](design/mockups/) has the Sprint-era HTML experiments.

---

## The wiki sections

Every section has a `README.md` that serves as its index. Every section links inline back here and across to sibling sections — nothing is stranded.

### 🏛️ [architecture/](architecture/README.md)
The product architecture blueprint. How Next.js 16, Supabase, Tailwind v4, and Framer Motion come together. Covers the [data model](architecture/data-model.md), [auth + RLS](architecture/auth-and-rls.md), [API layer](architecture/api-layer.md), [realtime](architecture/realtime.md), [intelligence layer](architecture/intelligence-layer.md), [multi-location brand rollup](architecture/multi-location-brand.md), [billing](architecture/billing-and-stripe.md), and [CI/CD](architecture/ci-cd.md).

Owned by [Avery](../.claude/agents/avery.md) and [Jordan](../.claude/agents/jordan.md).

### 📋 [requirements/](requirements/README.md)
The requirements library and the **Requirements Traceability Matrix (RTM)**. Every REQ → test files → code paths → sprint retro. If you want to know where a feature lives, start here.

Owned by [Sam](../.claude/agents/sam.md) and [Sage](../.claude/agents/sage.md).

### 🧪 [testing/](testing/README.md)
How we test. Vitest is the active suite; Playwright is frozen in [e2e.frozen/](../e2e.frozen/) since Sprint 173. Includes a reverse index (test file → REQ it covers) and the coverage map.

Owned by [Casey](../.claude/agents/casey.md) and [Reese](../.claude/agents/qa-automation.md).

### ⚙️ [operations/](operations/README.md)
Running HopTrack in production. Launch checklist, launch-day playbook, [connection pooling](operations/connection-pooling.md), [rate limits](operations/rate-limit-upgrade.md), [staging](operations/staging-environment.md), [uptime monitoring](operations/uptime-monitoring.md), [email routing](operations/email-routing.md).

Owned by [Riley](../.claude/agents/riley.md) and [Quinn](../.claude/agents/infra-engineer.md).

### 🔐 [compliance/](compliance/README.md)
Legal, security, privacy. [GDPR/CCPA assessment](compliance/gdpr-ccpa.md), [security & fraud prevention](compliance/security-and-fraud-prevention.md), FTC disclosures.

Owned by [Sam](../.claude/agents/sam.md) and [Casey](../.claude/agents/casey.md).

### 🎨 [design/](design/README.md)
The visual system. [Design system](design/design-system.md), [brand guide](design/brand-guide.md), [app store metadata](design/app-store-metadata.md), [Apple app plan](design/apple-app-plan.md), plus the HTML [mockups/](design/mockups/) and [glass-guides/](design/glass-guides/) archive.

Owned by [Alex](../.claude/agents/alex.md) and [Finley](../.claude/agents/finley.md).

### 🗺️ [product/](product/README.md)
Product strategy. The [live roadmap](product/roadmap.md), [archived roadmaps](product/roadmap-archive.md), personas, pricing tiers, and the [HopRoute concept brief](product/hoproute-concept.docx).

Owned by [Morgan](../CLAUDE.md).

### 💰 [sales/](sales/README.md)
Going to market. [ICP](sales/ideal-customer-profile.md), [pricing](sales/pricing-and-tiers.md), [pitch deck](sales/pitch-deck-outline.md), [onboarding playbook](sales/onboarding-playbook.md), [target breweries](sales/target-breweries.md), [first-close simulation](sales/first-close-simulation-report.md).

Owned by [Taylor](../.claude/agents/taylor.md) and [Parker](../.claude/agents/parker.md).

### 👥 [team/](team/README.md)
Who we are. [Org chart](team/README.md), [agent personas index](team/agents-index.md), [skills index](team/skills-index.md).

Owned by [Morgan](../CLAUDE.md).

### 📜 [history/](history/README.md)
The sprint archive. 178 sprints of [retros](history/retros/), [plans](history/plans/), and the [sprint history narrative](history/sprint-history.md). Grouped by arc so you can read the story.

Owned by [Sage](../.claude/agents/sage.md).

### 🔌 [api/](api/README.md)
Public and internal APIs. [API reference](api/api-reference.md), [Claude Code setup](api/claude-code-setup.md), Public API v1 (see [REQ-083](requirements/REQ-083-public-api-v1.md)).

Owned by [Jordan](../.claude/agents/jordan.md).

### 🗄️ [archive/](archive/README.md)
Deprecated, superseded, or historical docs — preserved for context, not maintained. [checkins deprecation plan](archive/checkins-deprecation-plan.md), [documentation audit](archive/documentation-audit.md), [josh-plan/](archive/josh-plan/), and stale duplicates.

---

## How traceability works

The wiki's backbone is the [RTM](requirements/README.md). Every shipped feature has a REQ that links to:

1. **Implementation** — the [lib/](../lib/), [app/](../app/), [components/](../components/), or [supabase/migrations/](../supabase/migrations/) files that make it real.
2. **Tests** — the [lib/__tests__/](../lib/__tests__/), [components/__tests__/](../components/__tests__/), [hooks/__tests__/](../hooks/__tests__/), or [e2e.frozen/](../e2e.frozen/) specs that prove it works.
3. **History** — the [sprint plan](history/plans/) and [retro](history/retros/) where it shipped.

Links are **inline**, embedded in prose — not footer link dumps. If a REQ says *"the user taps the wishlist button and the row updates,"* the words "wishlist button" should link straight to [components/ui/WishlistButton.tsx](../components/ui/WishlistButton.tsx). That's the whole idea.

## Conventions for editing this wiki

- **Never leave an orphan.** Every new doc gets linked from at least one section README.
- **Link inline.** Prose first, footer "Related" section only for cross-cutting refs.
- **Use relative paths.** `../components/Foo.tsx` not `/components/Foo.tsx` — survives repo renames.
- **Keep section READMEs scannable.** One paragraph per topic, link to the deep doc.
- **Archive don't delete.** Superseded docs move to [archive/](archive/README.md) with a deprecation note.
- **Update the [RTM](requirements/README.md)** when you ship a feature — new or existing REQ, new row or updated cell.

---

*This wiki is a living document. Every teammate owns their corner. If you find a gap, fix it.* 🍺
