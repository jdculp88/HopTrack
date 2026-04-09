/**
 * E2E Brewery Helpers — Sprint 150 (The Playwright)
 *
 * Reusable utilities for brewery-related E2E tests.
 *
 * Reese
 */

import { type Page, expect } from "@playwright/test";

// ─── Constants ──────────────────────────────────────────────────────────────

// Pint & Pixel — the primary test brewery (from seed data, Joshua's brewery)
export const PINT_AND_PIXEL = {
  id: "dd000001-0000-0000-0000-000000000001",
  name: "Pint & Pixel",
} as const;

// Mountain Ridge (demo brewery from seed 009)
export const MOUNTAIN_RIDGE = {
  id: "dd000001-0000-0000-0000-000000000001",
  name: "Mountain Ridge Brewing",
} as const;

// An unclaimed brewery ID for storefront tests (pick a real one from the 7,177 seed)
// Using a known OpenBreweryDB-seeded brewery that hasn't been claimed
export const UNCLAIMED_BREWERY_SEARCH = "Sierra Nevada" as const;

// ─── Navigation Helpers ─────────────────────────────────────────────────────

/**
 * Navigate to brewery admin dashboard for a given brewery.
 */
export async function navigateToBreweryAdmin(
  page: Page,
  breweryId: string,
): Promise<void> {
  await page.goto(`/brewery-admin/${breweryId}`);
  // Wait for dashboard to load — look for a heading or KPI card
  await expect(
    page.getByText(/overview|dashboard|today/i).first(),
  ).toBeVisible({ timeout: 10_000 });
}

/**
 * Navigate to consumer brewery detail page.
 */
export async function navigateToBreweryDetail(
  page: Page,
  breweryId: string,
): Promise<void> {
  await page.goto(`/brewery/${breweryId}`);
  // Wait for hero section to render
  await expect(page.locator("h1").first()).toBeVisible({ timeout: 10_000 });
}
