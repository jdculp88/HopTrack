import { type Page, expect } from "@playwright/test";

// ─── Test Account ────────────────────────────────────────────────────────────
// Created by seed 008. Has sessions, friends, achievements, and brewery admin
// access to all 4 demo breweries.
export const TEST_USER = {
  email: "testflight@hoptrack.beer",
  password: "HopTrack2026!",
  username: "hopreviewer",
  displayName: "Hop Reviewer",
} as const;

// Demo brewery IDs (from seed 024 / 009)
export const BREWERIES = {
  mountainRidge: "dd000001-0000-0000-0000-000000000001",
  riverBend: "dd000001-0000-0000-0000-000000000002",
  smokyBarrel: "dd000001-0000-0000-0000-000000000003",
  // Pint & Pixel — primary test brewery (Joshua's, has full seed data)
  pintAndPixel: "dd000001-0000-0000-0000-000000000001",
} as const;

/**
 * Log in via the /login page UI.
 * Waits for redirect to /home before returning.
 */
export async function login(
  page: Page,
  email = TEST_USER.email,
  password = TEST_USER.password,
): Promise<void> {
  await page.goto("/login");

  // Fill credentials
  await page.getByPlaceholder(/email/i).fill(email);
  await page.getByPlaceholder(/password/i).fill(password);

  // Submit
  await page.getByRole("button", { name: /sign in/i }).click();

  // Wait for the app shell to load (redirects to /home)
  await page.waitForURL("**/home", { timeout: 15_000 });

  // Sanity: the feed should be rendering something
  await expect(page.locator("body")).not.toBeEmpty();
}
