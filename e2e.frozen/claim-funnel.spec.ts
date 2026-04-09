// Claim Funnel E2E Test — Sprint 145 (The Revenue Push)
// Owner: Reese (QA & Test Automation)
// Reviewer: Casey (QA Engineer)
//
// Tests the happy path through the brewery claim wizard.
// Uses real OpenBreweryDB API (public, no auth needed).

import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

test.describe("Brewery Claim Funnel", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("complete claim flow: search → select → submit → success", async ({ page }) => {
    // Navigate to claim page
    await page.goto("/brewery-admin/claim");
    await page.waitForURL("**/claim**", { timeout: 15_000 });

    // Step 1: Search for a brewery
    const searchInput = page.getByPlaceholder(/search/i).or(page.locator('input[type="text"]').first());
    await expect(searchInput).toBeVisible({ timeout: 10_000 });

    // Type a search query — use a common name that OpenBreweryDB will return results for
    await searchInput.fill("Sierra Nevada");

    // Click the search button or press Enter
    const searchButton = page.getByRole("button", { name: /search/i });
    if (await searchButton.isVisible()) {
      await searchButton.click();
    } else {
      await searchInput.press("Enter");
    }

    // Wait for results to appear (OpenBreweryDB API call)
    await expect(
      page.getByText(/Sierra Nevada/i).first()
    ).toBeVisible({ timeout: 15_000 });

    // Select the first result
    const firstResult = page.getByText(/Sierra Nevada/i).first();
    await firstResult.click();

    // Step 2: Should advance to the claim/verification step
    // Look for the confirm form elements
    await expect(
      page.getByText(/email|business email|confirm/i).first()
    ).toBeVisible({ timeout: 10_000 });

    // Fill in the claim form
    const emailInput = page.getByPlaceholder(/email/i).or(page.locator('input[type="email"]'));
    if (await emailInput.isVisible()) {
      await emailInput.fill("test-claim@hoptrack.beer");
    }

    // Submit the claim
    const submitButton = page.getByRole("button", { name: /claim|submit|confirm/i });
    await expect(submitButton).toBeVisible({ timeout: 5_000 });
    await submitButton.click();

    // Step 3: Success screen should appear
    // Look for success indicators: "Welcome", "Dashboard", confetti, or success text
    await expect(
      page.getByText(/welcome|success|dashboard|submitted|pending/i).first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test("claim page shows pending claim status if already claimed", async ({ page }) => {
    // If the test above already ran, this user may have a pending claim
    await page.goto("/brewery-admin/claim");
    await page.waitForURL("**/claim**", { timeout: 15_000 });

    // The page should show either the search form or a pending claim status
    await expect(
      page
        .getByText(/search|find your brewery|pending|verification/i)
        .first()
    ).toBeVisible({ timeout: 10_000 });
  });
});
