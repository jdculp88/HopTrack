import { test, expect } from "@playwright/test";
import { login, TEST_USER } from "./helpers/auth";

// ─── Core Consumer Flows ─────────────────────────────────────────────────────
// These tests cover the authenticated happy paths through the consumer app.
// They run sequentially within the describe block (shared login state).

test.describe("Core Consumer Flows", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("login and see home feed", async ({ page }) => {
    // Feed tab bar should be visible (Friends / Discover / You)
    await expect(page.getByText("Friends")).toBeVisible();
    await expect(page.getByText("Discover")).toBeVisible();
  });

  test("navigate to explore", async ({ page }) => {
    // Click Explore in bottom nav (mobile) or sidebar (desktop)
    await page.getByRole("link", { name: /explore/i }).first().click();
    await page.waitForURL("**/explore");

    // Explore page should have a search input or brewery cards
    await expect(
      page.getByPlaceholder(/search/i).or(page.getByText(/breweries/i)),
    ).toBeVisible();
  });

  test("navigate to friends", async ({ page }) => {
    await page.getByRole("link", { name: /friends/i }).first().click();
    await page.waitForURL("**/friends");

    // Friends page should render (could be empty state or friend list)
    await expect(
      page
        .getByText(/drinking solo/i)
        .or(page.getByText(/friends/i).first()),
    ).toBeVisible();
  });

  test("view profile", async ({ page }) => {
    await page.goto(`/profile/${TEST_USER.username}`);
    await page.waitForURL(`**/profile/${TEST_USER.username}`);

    // Username or display name should be visible on the profile page
    await expect(
      page
        .getByText(TEST_USER.displayName)
        .or(page.getByText(TEST_USER.username)),
    ).toBeVisible();
  });

  test("start session drawer opens and closes", async ({ page }) => {
    // Click the Start Session FAB / button
    await page
      .getByRole("button", { name: /start session/i })
      .or(page.getByRole("link", { name: /start session/i }))
      .first()
      .click();

    // The drawer should show "Where are you?" prompt
    await expect(page.getByText(/where are you/i)).toBeVisible({
      timeout: 5_000,
    });

    // Close the drawer (press Escape)
    await page.keyboard.press("Escape");

    // Drawer should be gone
    await expect(page.getByText(/where are you/i)).not.toBeVisible({
      timeout: 5_000,
    });
  });
});
