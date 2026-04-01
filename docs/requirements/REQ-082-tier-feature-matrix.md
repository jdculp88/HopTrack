# REQ-082: Tier Feature Matrix

**Status:** COMPLETE
**Sprint:** 96 (The Lockdown)
**Feature:** F-033

## Overview
Comprehensive tier-based feature gating system with a `FEATURE_MATRIX` constant mapping 20 features across 4 subscription tiers, plus a redesigned billing page that clearly communicates tier value.

## Requirements
- `FEATURE_MATRIX` constant: 20 features x 4 tiers (Free, Tap, Cask, Barrel) with boolean/limit values
- Features include: tap list management, loyalty program, analytics, challenges, sponsored challenges, ads, mug clubs, POS sync, CRM, API access, custom branding, weekly digest, and more
- Billing page redesign: side-by-side tier comparison with feature checkmarks and limits
- Upgrade prompts: contextual "Upgrade to [tier]" CTAs shown when user hits a gated feature
- Tier gating utility: `hasFeature(tier, feature)` function for consistent access checks across codebase
- Clear tier differentiation: Free (basic listing), Tap (active management), Cask (growth tools), Barrel (enterprise)

## Acceptance Criteria
- `FEATURE_MATRIX` covers all 20 gated features with correct tier assignments
- `hasFeature()` returns correct boolean for every tier + feature combination
- Billing page shows all 4 tiers with feature comparison grid
- Each feature row shows checkmark, X, or limit value per tier
- Current tier highlighted with "Current Plan" badge
- Upgrade CTA buttons link to checkout for appropriate tier
- Gated features across the app use `hasFeature()` consistently (no hardcoded tier checks)
- Annual pricing toggle shows savings percentage

## Technical Notes
- `FEATURE_MATRIX` defined as typed constant object in billing/tier utilities
- `hasFeature(tier: SubscriptionTier, feature: FeatureKey): boolean` — single source of truth
- Billing page is server component with client interactive elements (toggle, CTAs)
- Feature keys are string literals for type safety
- Matrix is extensible: adding a feature = one new row in the constant
