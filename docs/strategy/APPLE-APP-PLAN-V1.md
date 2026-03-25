# HopTrack Apple Mobile App Plan — V1

**Owner:** Alex (UI/UX Lead)
**Date:** 2026-03-24
**Status:** Planning

---

## Overview

HopTrack currently runs as a Next.js web application that is mobile-responsive but is not a native app. This document outlines two paths toward a first-class Apple mobile experience, makes a concrete recommendation, and provides implementation checklists, UX specs, and a sprint plan.

---

## Current State

- Next.js web app, mobile-responsive via Tailwind breakpoints
- Works in Safari on iOS but lacks native app behaviors
- No offline support, no home screen icon, no splash screen
- No App Store presence

---

## Two Paths Forward

### Path A: Progressive Web App (PWA)

Convert the existing Next.js app into an installable PWA that users can add to their home screen. Delivered via Safari on iOS.

**Pros:**
- Minimal new infrastructure — builds on the existing Next.js codebase
- No App Store review cycle for most updates
- Instant deployment to all users
- Works for Android as well
- Faster to ship a high-quality experience

**Cons:**
- iOS PWA support has historically lagged behind Android/Chrome
- No push notifications on iOS (still limited as of iOS 16.4+)
- Cannot access all native APIs (Bluetooth, NFC, etc.)
- Users must manually add to home screen — no App Store discovery

---

### Path B: React Native / Expo

Build a separate React Native app (potentially using Expo) that shares business logic but maintains a separate native UI layer.

**Pros:**
- Full native app experience
- App Store presence and discoverability
- Access to all native APIs
- Push notifications via APNs

**Cons:**
- Significant new codebase to maintain in parallel
- Expo managed workflow has its own constraints; bare workflow increases complexity
- Longer time to first release
- Requires Apple Developer Program membership ($99/yr) before anything ships
- React Native UI components diverge from the web UI — risk of design inconsistency

---

## Recommendation: PWA First, App Store Wrapper Second

**Recommendation:** Ship a polished PWA in Sprint 8, then wrap it in a WKWebView shell (via Capacitor) for App Store submission in Sprint 10.

**Rationale:**
1. The Next.js codebase is already the source of truth for UI. A PWA reuses 100% of it.
2. The core HopTrack use case (check-ins, tap lists, brewery browsing) does not require native APIs that are unavailable to PWAs.
3. A Capacitor shell gives us an App Store listing without a full React Native rewrite.
4. This approach lets us validate the mobile experience with real users before investing in a native rebuild.

If push notifications or hardware access become critical requirements, revisit React Native in a future planning cycle.

---

## PWA Implementation Checklist

### manifest.json

- [ ] `/public/manifest.json` created and linked in `<head>`
- [ ] `name`: "HopTrack"
- [ ] `short_name`: "HopTrack"
- [ ] `display`: "standalone"
- [ ] `background_color`: matches app background (check brand guide)
- [ ] `theme_color`: matches brand primary
- [ ] `start_url`: "/"
- [ ] `icons` array: all required sizes (see below)
- [ ] `orientation`: "portrait" (or "any")

### Service Worker

- [ ] Service worker registered via `next-pwa` or custom `sw.js`
- [ ] Caching strategy defined: network-first for API routes, cache-first for static assets
- [ ] Offline fallback page created (`/offline`)
- [ ] Service worker tested in Safari iOS (behavior differs from Chrome)
- [ ] Verify no service worker errors on first install

### iOS-Specific Meta Tags (in `<head>`)

```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="HopTrack" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

- [ ] All four meta tags present in `_document.tsx` or Next.js `<Head>`
- [ ] `viewport-fit=cover` confirmed — required for safe area inset support

### Apple Touch Icons (all sizes required)

- [ ] 57x57px — `apple-touch-icon-57x57.png`
- [ ] 60x60px — `apple-touch-icon-60x60.png`
- [ ] 72x72px — `apple-touch-icon-72x72.png`
- [ ] 76x76px — `apple-touch-icon-76x76.png`
- [ ] 114x114px — `apple-touch-icon-114x114.png`
- [ ] 120x120px — `apple-touch-icon-120x120.png`
- [ ] 144x144px — `apple-touch-icon-144x144.png`
- [ ] 152x152px — `apple-touch-icon-152x152.png`
- [ ] 180x180px — `apple-touch-icon-180x180.png` (primary — iPhone Retina)

Link tags in `<head>`:
```html
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png" />
<!-- repeat for each size -->
```

### Splash Screens

- [ ] Generate launch images for common iPhone screen sizes (use `pwa-asset-generator` or similar)
- [ ] Link splash screens with `apple-touch-startup-image` meta tags
- [ ] Test on iPhone SE, iPhone 14, iPhone 14 Pro (Dynamic Island), iPhone 14 Pro Max

### Add to Home Screen Prompt

- [ ] Custom in-app banner prompting iOS users to add to home screen (Safari does not show the native install prompt automatically)
- [ ] Detect if running in standalone mode: `window.navigator.standalone === true`
- [ ] Show banner only when not already installed and only after meaningful engagement (e.g., 2+ sessions or first check-in)
- [ ] Banner includes: icon preview, "Add HopTrack to your home screen", step-by-step Safari share sheet instructions
- [ ] Dismiss persists via localStorage — do not re-show after user dismisses

---

## iOS-Specific UX Considerations

### Safe Area Insets

- [ ] `env(safe-area-inset-bottom)` applied to bottom nav / tab bar
- [ ] `env(safe-area-inset-top)` applied where status bar overlaps content
- [ ] Test on iPhone 14 Pro (Dynamic Island) and iPhone SE (no notch)
- [ ] Bottom nav must clear the home indicator bar on notchless iPhones

### Overscroll / Bounce Behavior

- [ ] Decide: allow or suppress rubber-band overscroll
- [ ] If suppressing: `overscroll-behavior: none` on `<body>` or scroll containers
- [ ] Modal sheets: ensure modal scroll does not propagate to body

### Font Size — Prevent Auto-Zoom

- [ ] All input fields use a minimum font size of **16px**
- [ ] Safari on iOS auto-zooms any input with font size < 16px — this breaks layout
- [ ] Audit: `<input>`, `<textarea>`, `<select>` throughout the app

### Tap Target Sizes

- [ ] Minimum touch target size: **44x44pt** (Apple HIG requirement)
- [ ] Audit bottom nav icons, action buttons, filter chips, card tap areas
- [ ] Use padding rather than margin to expand tap areas without affecting visual size

### Momentum Scrolling

- [ ] `-webkit-overflow-scrolling: touch` on scroll containers (legacy but still relevant for some iOS versions)
- [ ] Verify smooth scroll on long tap lists and brewery lists
- [ ] Sticky headers must not interfere with scroll momentum

---

## TestFlight / App Store Path (Capacitor WKWebView Wrapper)

### What Is This

Capacitor (by Ionic) wraps the Next.js web app in a native iOS shell using WKWebView. The app is submitted to the App Store as a native app, but the UI is the PWA.

### Prerequisites

- [ ] Apple Developer Program enrollment ($99/yr)
- [ ] Xcode installed (latest stable)
- [ ] `@capacitor/core` and `@capacitor/ios` installed
- [ ] `capacitor.config.ts` configured with `webDir: "out"` (static export) or a local dev server URL for development

### Capacitor Setup Steps

1. `npm install @capacitor/core @capacitor/cli @capacitor/ios`
2. `npx cap init HopTrack com.hoptrack.app`
3. Configure `next.config.js` for static export: `output: 'export'`
4. `npm run build`
5. `npx cap add ios`
6. `npx cap sync`
7. `npx cap open ios` — opens Xcode
8. Configure bundle ID, signing, and capabilities in Xcode

### App Store Requirements Checklist

- [ ] App icon: 1024x1024px PNG, no alpha channel, no rounded corners (Apple applies mask)
- [ ] Screenshots: required for iPhone 6.7" (iPhone 14 Pro Max), 6.5", 5.5"; optional but recommended for iPad
- [ ] App description: written, reviewed, no placeholder text
- [ ] Privacy policy URL: must be live and accessible
- [ ] App category selected: Food & Drink
- [ ] Age rating questionnaire completed
- [ ] Bundle ID registered in Apple Developer portal
- [ ] Provisioning profile and signing certificate configured
- [ ] No use of private APIs
- [ ] No calls to `UIWebView` (deprecated — Capacitor uses WKWebView, which is compliant)
- [ ] App does not crash on launch
- [ ] Tested on physical device, not just simulator
- [ ] TestFlight internal testing completed before external submission
- [ ] App Review Information: demo account credentials provided if app requires login

---

## Suggested Sprint Breakdown

### Sprint 8 — PWA Polish

- manifest.json and all icon sizes
- iOS meta tags and viewport-fit
- Service worker with offline fallback
- Add to Home Screen prompt component
- Safe area inset fixes (bottom nav, modals)
- Input font size audit (16px minimum)
- Tap target audit
- Splash screen generation
- QA on iPhone SE, iPhone 14, iPhone 14 Pro

### Sprint 10 — App Store Prep

- Capacitor integration and iOS project scaffold
- Static export configuration and build validation
- App icon 1024x1024 final asset
- App Store screenshots (all required sizes)
- Privacy policy page live at `/privacy`
- Bundle ID and Apple Developer account setup
- TestFlight internal build submission
- App Store Connect listing draft (title, description, category, keywords)
- Submit for App Store review

---

## Design Specs Alex Wants to Validate

| Item | Target Spec | Status |
|---|---|---|
| Bottom nav height on iPhone (with home indicator) | Min 83px total (49px bar + 34px safe area) | To validate |
| Bottom nav height on iPhone SE (no home indicator) | Min 49px | To validate |
| Modal safe area (bottom sheet) | `padding-bottom: env(safe-area-inset-bottom)` | To implement |
| Keyboard avoidance on modals | Modal must scroll above software keyboard | To test |
| Tap targets on bottom nav icons | 44x44pt minimum hit area | To audit |
| Input font size across all forms | 16px minimum | To audit |
| Overscroll behavior on tap list | Confirm desired behavior | Decision needed |

---

## Open Questions

1. Do we want push notifications? If yes, PWA push on iOS 16.4+ is possible but requires testing — or we go Capacitor + APNs sooner.
2. Static export vs. server-side rendering in Capacitor: next steps depend on this architectural choice.
3. Who owns App Store Connect and Apple Developer Program enrollment — Jordan or Riley?

---

*Document owner: Alex. Last updated: 2026-03-24.*
