/**
 * E2E Session Helpers — Sprint 150 (The Playwright)
 *
 * Reusable utilities for session/check-in flow E2E tests.
 *
 * Reese
 */

import { type Page, expect } from "@playwright/test";

// ─── Session Flow Helpers ───────────────────────────────────────────────────

/**
 * Open the checkin entry drawer from anywhere in the app.
 * Clicks the main "Check In" / "+" action button in the nav.
 */
export async function openCheckinDrawer(page: Page): Promise<void> {
  // The check-in button is in the bottom nav or header — look for it
  const checkinBtn = page
    .getByRole("button", { name: /check in|start.*session/i })
    .or(page.locator('[aria-label="Start a session"]').first());

  await checkinBtn.first().click();

  // Wait for the drawer to appear
  await expect(
    page
      .getByPlaceholder(/search breweries/i)
      .or(page.getByText(/start your visit/i)),
  ).toBeVisible({ timeout: 8_000 });
}

/**
 * Search for a brewery in the checkin drawer and start a session.
 * Assumes the checkin drawer is already open.
 */
export async function startBrewerySession(
  page: Page,
  breweryName: string,
): Promise<void> {
  // Type in the search input
  const searchInput = page.getByPlaceholder(/search breweries/i);
  await searchInput.fill(breweryName);

  // Wait for search results and click the matching brewery
  await page.waitForTimeout(500); // debounce
  const result = page.getByRole("button", { name: new RegExp(breweryName, "i") }).first();
  await expect(result).toBeVisible({ timeout: 8_000 });
  await result.click();

  // Click "Start your visit" on the confirm card
  const startBtn = page.getByRole("button", { name: /start your visit/i });
  await expect(startBtn).toBeVisible({ timeout: 5_000 });
  await startBtn.click();

  // Wait for TapWallSheet to appear (the tap list view)
  await expect(
    page
      .getByPlaceholder(/search the tap list|search all beers/i)
      .or(page.getByText(/end session/i)),
  ).toBeVisible({ timeout: 10_000 });
}

/**
 * Log a beer during an active session.
 * Assumes TapWallSheet is visible.
 */
export async function logBeer(
  page: Page,
  beerName: string,
): Promise<void> {
  // Search for the beer in the tap wall
  const searchInput = page.getByPlaceholder(/search the tap list|search all beers/i);

  if (await searchInput.isVisible()) {
    await searchInput.fill(beerName);
    await page.waitForTimeout(400); // debounce
  }

  // Click the beer card/button
  const beerBtn = page.getByRole("button", { name: new RegExp(beerName, "i") }).first();
  await expect(beerBtn).toBeVisible({ timeout: 5_000 });
  await beerBtn.click();

  // Wait for the beer to be logged (should appear in the logged beers list)
  await page.waitForTimeout(500);
}

/**
 * End the current session and wait for the recap to appear.
 * Assumes an active session with TapWallSheet or ActiveSessionBanner visible.
 */
export async function endSession(page: Page): Promise<void> {
  // Click "End session"
  const endBtn = page.getByRole("button", { name: /end session/i }).first();
  await expect(endBtn).toBeVisible({ timeout: 5_000 });
  await endBtn.click();

  // Click "End & save" confirmation
  const confirmBtn = page.getByRole("button", { name: /end & save/i });
  await expect(confirmBtn).toBeVisible({ timeout: 5_000 });
  await confirmBtn.click();

  // Wait for recap sheet to appear (shows XP or session summary)
  await waitForRecap(page);
}

/**
 * Wait for the SessionRecapSheet to be visible.
 */
export async function waitForRecap(page: Page): Promise<void> {
  await expect(
    page
      .getByText(/xp/i)
      .or(page.getByText(/session complete/i))
      .or(page.getByText(/beers? checked/i)),
  ).toBeVisible({ timeout: 15_000 });
}
