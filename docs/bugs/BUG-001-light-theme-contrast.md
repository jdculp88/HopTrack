# BUG-001 — Light Theme Contrast & Sidebar Styling
**Status:** Open
**Priority:** Medium
**Reported:** 2026-03-23
**Reported By:** Morgan (Project Owner)
**Assigned To:** Alex (UI/UX), Jordan (Dev)

## Description
When switching to light mode, two issues are visible:

1. **Contrast issues on page elements** — some text, cards, and UI elements don't have sufficient contrast against the light background. Elements using hardcoded dark hex values (`#0F0E0C`, `#1C1A16`, etc.) instead of CSS variables are not responding to the theme switch.

2. **Left sidebar feels out of place** — the sidebar retains dark styling in light mode, creating a jarring split between the sidebar and main content area. Needs a cohesive light treatment.

## Steps to Reproduce
1. Open the app
2. Toggle to Light Mode via the sidebar or Settings → Appearance
3. Observe contrast inconsistencies and sidebar disconnect

## Expected Behavior
- All page elements use semantic CSS variables and respond correctly to theme toggle
- Sidebar in light mode uses warm off-white surface with appropriate border and text colors
- Smooth, cohesive appearance in both themes

## Root Cause (suspected)
Many components still use hardcoded Tailwind hex classes (e.g. `bg-[#1C1A16]`, `text-[#F5F0E8]`) instead of the new CSS variable tokens. These need to be migrated to `bg-[var(--surface)]`, `text-[var(--text-primary)]` etc.

## Fix Plan
- Audit all components for hardcoded hex colors
- Replace with CSS variable equivalents
- Special attention to `AppNav` / sidebar which has the most hardcoded values
- Review in both themes before closing

## Notes
- Added to next team meeting agenda
