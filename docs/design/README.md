# Design 🎨

*The visual system and brand.* Owned by [Alex](../../.claude/agents/alex.md) and [Finley](../../.claude/agents/finley.md). Brand voice reviewed by [Jamie](../../.claude/agents/jamie.md).

**Back to [wiki home](../README.md).**

---

## The system

- **[design-system.md](design-system.md)** — the v2 design system. Tokens, components, spacing, the beer-style color families, the card-bg variants, the shadow system. Source of truth for how HopTrack *looks*.
- **[brand-guide.md](brand-guide.md)** — the brand. Logo, typography (Playfair Display · DM Sans · JetBrains Mono), voice, the gold accent rule. Jamie's territory.
- **[design-standards.md](design-standards.md)** — the standards that enforce the system. Framer Motion rules (no `motion.button`), reduced-motion rules, the haptic rules.
- **[apple-app-plan.md](apple-app-plan.md)** — the iOS app plan, Capacitor wrapper, App Store submission timeline.
- **[app-store-metadata.md](app-store-metadata.md)** — the App Store listing: screenshots, description, keywords.

The engineering-facing version of this lives in the [hoptrack-design-system skill](../../.claude/skills/hoptrack-design-system/SKILL.md) — same content, loaded when you're writing UI code.

## The archives

- **[mockups/](mockups/)** — the HTML experiments that fed the design system. Sprint-era concepts for [feed light/dark](mockups/hoptrack-feed-dark.html), [card backgrounds](mockups/hoptrack-card-backgrounds.html), [color system v2](mockups/hoptrack-color-system-v2.html), [type specimen](mockups/hoptrack-type-specimen.html), [session summary](mockups/hoptrack-session-summary.html), [identity final](mockups/hoptrack-identity-final.html), and the [logo continuous-line concepts](mockups/HopTrack%20Logo%20Continuous%20Line%20Concepts.pdf). Plus the menu mockup [pint_pixel_menu.pdf](mockups/pint_pixel_menu.pdf) and [mountain_ridge_menu_1.html](mockups/mountain_ridge_menu_1.html).

- **[glass-guides/](glass-guides/)** — the five HTML reference guides that seeded HopTrack's glass library ([Sprint 82](../history/retros/sprint-82-retro.md)): [beer](glass-guides/beer_glass_guide.html), [cider](glass-guides/cider_glass_guide.html), [wine](glass-guides/wine_glass_guide.html), [cocktail](glass-guides/cocktail_glass_guide.html), [non-alcoholic](glass-guides/non_alcoholic_glass_guide.html).

## Where the design shows up in code

- **Tokens** — CSS variables in [app/globals.css](../../app/globals.css).
- **Components** — [components/](../../components/) directory. Follow the patterns in [hoptrack-conventions skill](../../.claude/skills/hoptrack-conventions/SKILL.md).
- **Motion** — [components/ui/](../../components/) primitives wrap Framer Motion per design-standards rules.
- **Theme** — dark/light/OLED via the [theme-toggle](../../components/__tests__/theme-toggle.test.tsx) component (see [REQ-001](../requirements/REQ-001-theme-toggle.md)).

## Design arcs worth reading

- **The Overhaul** — consumer UI mandate, token migration (Sprint 171 — see [history](../history/README.md)).
- **The Design Audit** — full design doc implementation (Sprint 172 — see [history](../history/README.md)).
- **The Glow-Up** — shadow system, depth, card adoption ([Sprints 163-166](../history/README.md)).
- **The Facelift** — 4-axis personality, Four Favorites, half-star ratings ([Sprints 160-162](../history/README.md)).
- **The Vibe** — sensory layer, celebration trifecta, Liquid Glass ([Sprint 161](../history/retros/sprint-161-retro.md)).

## Cross-links

- **Frontend architecture** — [architecture/tech-stack.md](../architecture/tech-stack.md).
- **Brand in sales** — [sales/pitch-deck-outline.md](../sales/pitch-deck-outline.md) uses brand-guide colors and type.
- **Testing the UI** — [testing/README.md](../testing/README.md) and component `__tests__/` dirs.

---

> **Status (2026-04-15):** all linked docs and asset folders exist. No stubs in this section.
