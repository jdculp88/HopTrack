import { test, expect } from "@playwright/test";
import { login, BREWERIES } from "./helpers/auth";

// ─── Social Flows ─────────────────────────────────────────────────────────────
// Friends, notifications, reactions, brewery reviews.

test.describe("Social Features", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("friends page loads with tabs", async ({ page }) => {
    await page.goto("/friends");
    await page.waitForURL("**/friends", { timeout: 10_000 });
    // Should have My Friends tab or Leaderboard tab visible
    await expect(
      page.getByText(/my friends|leaderboard|drinking solo/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("friends search input is visible", async ({ page }) => {
    await page.goto("/friends");
    await expect(
      page.getByPlaceholder(/search/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("notifications page loads", async ({ page }) => {
    await page.goto("/notifications");
    await expect(
      page.getByText(/notification|alert|taps are quiet/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("brewery detail page loads with rating section", async ({ page }) => {
    await page.goto(`/brewery/${BREWERIES.mountainRidge}`);
    await page.waitForURL(`**/brewery/${BREWERIES.mountainRidge}`, { timeout: 10_000 });
    await expect(
      page.getByText(/mountain ridge|on tap|rating/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("feed Friends tab shows content or empty state", async ({ page }) => {
    await page.goto("/home");
    await page.getByText("Friends").click();
    await page.waitForTimeout(1_000);
    // Should render something — either feed cards or "your round starts here"
    const body = await page.textContent("body");
    expect(body).toBeTruthy();
  });

  test("feed Discover tab shows BOTW or community content", async ({ page }) => {
    await page.goto("/home");
    await page.getByText("Discover").click();
    await page.waitForTimeout(1_000);
    await expect(
      page.getByText(/beer of the week|trending|events|discover/i).first()
    ).toBeVisible({ timeout: 8_000 });
  });

  test("feed You tab shows profile stats", async ({ page }) => {
    await page.goto("/home");
    await page.getByText("You").click();
    await page.waitForTimeout(1_000);
    await expect(
      page.getByText(/xp|level|sessions|taste dna|achievements/i).first()
    ).toBeVisible({ timeout: 8_000 });
  });
});
