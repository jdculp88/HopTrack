---
name: Sprint 74 Complete
description: Sprint 74 First Impressions — brewery onboarding wizard + push notification wiring shipped. Q2 roadmap research produced. Sprint 75 TBD.
type: project
---

Sprint 74 — First Impressions — COMPLETE (2026-03-31)

**Goal 1: Brewery Onboarding Wizard** — 4-step guided setup (Logo → Beers → Loyalty → Board Preview). Auto-shows on dashboard for freshly claimed breweries (0 beers + no logo). Each step isolated in `components/brewery-admin/onboarding/`. Progress persists to localStorage.

**Goal 2: Push Notification Wiring** — `sendPushToUser()` wired into Messages API. Rate limited 5/hr per brewery. Push count returned in API response + shown in MessagesClient toast.

**Files created:** OnboardingWizard.tsx, OnboardingStepLogo.tsx, OnboardingStepBeers.tsx, OnboardingStepLoyalty.tsx, OnboardingStepPreview.tsx
**Files edited:** Messages API route (push + rate limit), MessagesClient (push count toast), brewery dashboard page (wizard auto-show)
**No new migrations.** Build clean: 64 pages, 0 errors.

**Also produced:** `docs/plans/roadmap-research-2026-q2.md` — 30 features (F-001–F-030), 18 REQs (REQ-051–REQ-068), 4 sprint arcs through Sprint 96. Competitive analysis vs Untappd + 10 competitors.

**Retro:** `docs/retros/sprint-74-retro.md` — Sage facilitated her first retro.

**Joshua's direction:** Friends and family testing before market launch. Stub blockers (Stripe, email) with full UI but no live connectors. Keep costs near zero until launch. New monetization ideas: Ad Engine (F-028), Promotion Hub (F-029), HopRoute autocomplete (F-030) — all added to roadmap.

**Next:** Sprint 75 TBD. Candidates: Stripe billing stub, email infra stub, consumer polish for F&F feedback, E2E test coverage.
