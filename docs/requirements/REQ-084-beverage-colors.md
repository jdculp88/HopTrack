# REQ-084: Beverage Category Colors

**Status:** COMPLETE
**Sprint:** 83 (The Palette)
**Feature:** F-011 (Phase 2)

## Overview
Extended color system for non-beer beverage categories (cider, wine, cocktail, non-alcoholic), providing distinct visual identity through CSS variables and card background rules.

## Requirements
- 4 new color families: cider (amber/apple tones), wine (burgundy/grape), cocktail (teal/vibrant), NA (green/fresh)
- CSS variables for each family: `--[category]-primary`, `--[category]-light`, `--[category]-soft` in both dark and light themes
- `beerStyleColors.ts` expanded: `getStyleFamily()` accepts optional `itemType` parameter to return category-appropriate colors
- `card-bg-reco` rules: `data-style` attribute supports category values (e.g., `data-style="cider"`) for category-tinted card backgrounds
- Embed menu grouping: embedded beer menu widget groups items by `item_type` with category-colored section headers
- Consistent application: brewery detail tap list, feed cards, session drawer, and search results all use category colors

## Acceptance Criteria
- Cider items display amber/apple color treatment across all views
- Wine items display burgundy/grape color treatment across all views
- Cocktail items display teal/vibrant color treatment across all views
- NA items display green/fresh color treatment across all views
- Colors work correctly in both dark and light themes
- `getStyleFamily("cider")` returns cider color family (not beer fallback)
- Embedded menu groups items by type with colored section dividers
- Card backgrounds apply correct category gradient via `data-style` attribute
- No visual regression on existing beer style colors

## Technical Notes
- CSS variables defined in `globals.css` under `@theme {}` for both `:root` and `[data-theme="light"]`
- `lib/beerStyleColors.ts`: `getStyleFamily(style, itemType?)` — itemType override takes precedence over style lookup
- `card-bg-reco[data-style="cider|wine|cocktail|na"]` selectors in `globals.css`
- Color values chosen for WCAG AA contrast against both dark and light surface colors
- Embed widget uses `item_type` field from menu API to determine grouping and color assignment
