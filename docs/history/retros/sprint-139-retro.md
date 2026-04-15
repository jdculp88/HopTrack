# Sprint 139 Retro — The Guide
**Facilitated by:** Morgan (PM)
**Date:** 2026-04-03
**Theme:** User Guides & Brewery Onboarding Polish

---

## What Shipped

- **Tooltip + HelpIcon** — 2 new foundation components (`components/ui/Tooltip.tsx`, `components/ui/HelpIcon.tsx`). Tooltip: CSS positioning, AnimatePresence, tap-to-toggle mobile, `useId()` a11y. HelpIcon: gold `?` circle, supports tooltip + link + combined modes.
- **Resources page tabbed redesign** — 4 tabs (Guides, Glassware, API, POS) with pill toggles, AnimatePresence crossfade, URL hash sync for deep linking. Replaced single 470-line scroll.
- **23 FAQ items** — Organized by 6 nav groups (Getting Started, Content, Engage, Insights, Operations, Account). Accordion pattern with search filter. Written by Sam.
- **PageHeader enhanced** — New `helpAction` prop (composable ReactNode, server-compatible).
- **FormField enhanced** — New `helpText` prop for inline guidance.
- **EmptyState enhanced** — New `helpLink` prop for contextual help links.
- **Nav updated** — "Help" link added to Account group (HelpCircle icon).
- **Dashboard help link** — "Need help getting started? Browse our guides" below header.
- **Onboarding wizard polish** — "Why this matters" context on all 4 steps (Logo, Beers, Loyalty, Preview). "Browse setup guides" link on Preview step.
- **Onboarding card** — "Need help? Browse our guides" link at bottom.
- **4 feature pages wired** — HelpIcon with tooltip + deep link on Loyalty, Analytics, POS Sync, Tap List.
- **13 new tests** (1,078 → 1,091), 0 migrations, build clean, 0 new lint errors.

## Stats
- **5 new files**, ~14 modified
- **0 migrations**
- **13 new tests** (1,078 → 1,091)
- **0 new lint errors** (16 pre-existing React compiler errors unchanged)

## Who Built What

- **Morgan** — Sprint scoping, plan approval, ceremony
- **Sam** — Wrote all 23 FAQ items, organized by nav group taxonomy
- **Alex** — Resources tab UX design, pill toggle styling
- **Jordan** — Architecture review, AnalyticsInner scope fix, component API design
- **Avery** — All implementation: Tooltip, HelpIcon, ResourcesClient, PageHeader/FormField/EmptyState enhancements, onboarding polish, feature page wiring
- **Casey** — Test coverage, build verification, lint audit
- **Drew** — Validated onboarding "why" copy from real-world brewery ops perspective
- **Taylor** — Validated tier FAQ as conversion tool
- **Jamie** — Brand consistency check on Resources tabs
- **Riley** — Confirmed zero infra risk, validated URL hash deep linking
- **Sage** — Sprint notes, stats tracking

## What Went Well

- **Zero-migration sprint** — Pure UI/UX work, no schema risk
- **Composable architecture** — `helpAction` prop follows existing `action` pattern, no breaking changes
- **One session** — Entire sprint built and verified in a single session
- **Joshua's request honored** — Tabbed Resources page was explicitly requested, delivered exactly as asked
- **Brand consistency** — Gold pills, dark surfaces, Playfair headers all match existing design system

## What We Learned

- **AnalyticsInner scope issue** — `breweryId` wasn't passed through the Suspense wrapper to the inner component. Caught in build, not at runtime. Reinforces: always build before shipping.
- **`divideColor` isn't CSS** — It's a Tailwind class concept, not a valid style property. Use `divide-[var(--border)]` class instead.
- **Board page is the display itself** — No admin header to attach HelpIcon to. Correctly skipped.
- **AnimatePresence mode="wait"** — Crossfade between tabs works but has a brief moment where old content is visible during exit. Acceptable for this use case.

## Roast Corner

- **Drew** on **Jordan**: "He had to take a walk because a prop wasn't passed through a Suspense wrapper. The man treats React scope issues like personal betrayal."
- **Casey** on **Avery**: "Built the whole sprint in one session and the only bug was a CSS property that doesn't exist. `divideColor`? Were you inventing new CSS specs?"
- **Jordan** on **Alex**: "Alex called a tabbed help page 'chef's kiss territory.' It's tabs. They're TABS, Alex."
- **Alex** on **Drew**: "Drew said the loyalty context line 'felt good physically.' The man has FEELINGS about onboarding copy."
- **Taylor** on **Sam**: "Sam wrote 23 FAQ answers and every single one starts with 'Go to [Feature] in the [Section] section.' She writes instructions like GPS directions."
- **Sam** on **Taylor**: "Taylor saw a tier comparison FAQ and immediately called it 'basically a sales page.' The man sees revenue in HELP CONTENT."
- **Morgan** on **Joshua**: "He said 'Plan it, scope it, Ship it!!!' with THREE exclamation marks. The most punctuation the founder has ever used. We've unlocked something."

## Action Items

- Consider adding video tutorial placeholders in future sprint (architecture supports it)
- The Guides search could evolve into a global admin search (Cmd+K pattern exists from S138)
- Empty states across admin pages could be updated to include `helpLink` props — low-effort, high-value follow-up

---

*This is a living document.* 🍺
