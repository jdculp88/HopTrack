import { test, expect } from "@playwright/test";
import { login, TEST_USER } from "./helpers/auth";

// ─── Core Consumer Flows ─────────────────────────────────────────────────────
// Authenticated happy paths through the consumer app.
// These tests run against the testflight account (seed 008).

test.describe("Core Consumer Flows", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("home feed renders with tab bar", async ({ page }) => {
    // Feed tab bar should be visible (Friends / Discover / You)
    await expect(page.getByText("Friends")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Discover")).toBeVisible();
  });

  test("switch between feed tabs", async ({ page }) => {
    await expect(page.getByText("Friends")).toBeVisible({ timeout: 10_000 });

    // Switch to Discover tab
    await page.getByText("Discover").click();
    // Discover should have some content — BOTW, Trending, etc.
    await page.waitForTimeout(500);

    // Switch to You tab
    await page.getByText("You").click();
    await page.waitForTimeout(500);
  });

  test("navigate to explore page", async ({ page }) => {
    await page.getByRole("link", { name: /explore/i }).first().click();
    await page.waitForURL("**/explore", { timeout: 10_000 });

    // Explore page should have a search input or brewery content
    await expect(
      page.getByPlaceholder(/search/i).or(page.getByText(/breweries/i).first()),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("navigate to friends page", async ({ page }) => {
    await page.getByRole("link", { name: /friends/i }).first().click();
    await page.waitForURL("**/friends", { timeout: 10_000 });

    // Friends page should render (empty state or friend list)
    await expect(
      page.getByText(/drinking solo/i)
        .or(page.getByText(/friends/i).first()),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("view own profile", async ({ page }) => {
    await page.goto(`/profile/${TEST_USER.username}`);
    await page.waitForURL(`**/profile/${TEST_USER.username}`, { timeout: 10_000 });

    // Display name or username should be visible
    await expect(
      page.getByText(TEST_USER.displayName)
        .or(page.getByText(TEST_USER.username)),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("navigate to notifications", async ({ page }) => {
    // Click the bell icon / Alerts link in bottom nav
    await page.getByRole("link", { name: /alert|notification/i }).first().click();
    await page.waitForURL("**/notifications", { timeout: 10_000 });

    // Should render notifications page (possibly empty)
    const body = await page.textContent("body");
    expect(body).toBeTruthy();
  });

  test("navigate to settings", async ({ page }) => {
    await page.goto("/settings");
    await page.waitForURL("**/settings", { timeout: 10_000 });

    await expect(
      page.getByText(/settings/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("start session drawer opens and closes", async ({ page }) => {
    // Click the Start Session FAB / button
    const sessionBtn = page.getByRole("button", { name: /start session/i })
      .or(page.getByRole("link", { name: /start session/i }));
    await sessionBtn.first().click();

    // The drawer/modal should appear
    await expect(
      page.getByText(/where are you/i)
        .or(page.getByText(/start/i)),
    ).toBeVisible({ timeout: 5_000 });

    // Close with Escape
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
  });
});
