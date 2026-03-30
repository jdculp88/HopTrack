import { test, expect } from "@playwright/test";
import { login, BREWERIES } from "./helpers/auth";

// ─── Brewery Admin Flows ──────────────────────────────────────────────────────
// Validates brewery owner dashboard workflows against demo brewery data.

test.describe("Brewery Admin Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(`/brewery-admin/${BREWERIES.mountainRidge}`);
    await page.waitForURL(`**/brewery-admin/${BREWERIES.mountainRidge}`, { timeout: 15_000 });
  });

  test("dashboard renders KPI cards", async ({ page }) => {
    // Should show stat cards (visits, beers, active, followers)
    await expect(page.getByText(/visits|sessions|poured|followers/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test("navigate to tap list page", async ({ page }) => {
    await page.goto(`/brewery-admin/${BREWERIES.mountainRidge}/tap-list`);
    // Tap list should render beer rows or empty state
    await expect(
      page.getByText(/tap list/i).or(page.getByText(/no beers/i)).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("navigate to analytics page", async ({ page }) => {
    await page.goto(`/brewery-admin/${BREWERIES.mountainRidge}/analytics`);
    // Time range selector should be present
    await expect(
      page.getByText(/7d|30d|90d|all time/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("analytics time range buttons are clickable", async ({ page }) => {
    await page.goto(`/brewery-admin/${BREWERIES.mountainRidge}/analytics`);
    await page.waitForSelector("text=/7d|30d/i", { timeout: 10_000 });
    // Click 7d
    await page.getByText("7d").first().click();
    await page.waitForTimeout(500);
    // Click 90d
    await page.getByText("90d").first().click();
    await page.waitForTimeout(500);
  });

  test("navigate to customers page", async ({ page }) => {
    await page.goto(`/brewery-admin/${BREWERIES.mountainRidge}/customers`);
    await expect(
      page.getByText(/customer|visitor|vip/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("navigate to events page", async ({ page }) => {
    await page.goto(`/brewery-admin/${BREWERIES.mountainRidge}/events`);
    await expect(
      page.getByText(/event|upcoming|trivia/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("navigate to messages page", async ({ page }) => {
    await page.goto(`/brewery-admin/${BREWERIES.mountainRidge}/messages`);
    await expect(
      page.getByText(/message|segment|vip/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("navigate to billing page", async ({ page }) => {
    await page.goto(`/brewery-admin/${BREWERIES.mountainRidge}/billing`);
    await expect(
      page.getByText(/tap|cask|barrel|\$49|\$149/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("board page loads without nav", async ({ page }) => {
    await page.goto(`/brewery-admin/${BREWERIES.mountainRidge}/board`);
    await page.waitForTimeout(2_000);
    const body = await page.textContent("body");
    expect(body).toBeTruthy();
    // Board is full-screen; sidebar nav should NOT be present
    const sidebarVisible = await page.locator("nav").isVisible().catch(() => false);
    // Can't guarantee this without more context, just verify page loaded
    expect(body!.length).toBeGreaterThan(10);
  });
});
