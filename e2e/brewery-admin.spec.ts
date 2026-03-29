import { test, expect } from "@playwright/test";
import { login, BREWERIES } from "./helpers/auth";

// ─── Brewery Admin Flows ─────────────────────────────────────────────────────
// Tests the brewery owner dashboard using the testflight user, who has owner
// access to all 4 demo breweries (seed 009 creates brewery_accounts).

const BREWERY_ID = BREWERIES.mountainRidge;
const ADMIN_BASE = `/brewery-admin/${BREWERY_ID}`;

test.describe("Brewery Admin", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("login and access brewery dashboard", async ({ page }) => {
    await page.goto(ADMIN_BASE);
    await page.waitForURL(`**${ADMIN_BASE}`);

    // Overview page should render with the brewery name or dashboard content
    await expect(
      page
        .getByText(/overview/i)
        .or(page.getByText(/mountain ridge/i))
        .first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("view tap list", async ({ page }) => {
    await page.goto(`${ADMIN_BASE}/tap-list`);
    await page.waitForURL(`**/tap-list`);

    // Tap list should show beer entries or an "Add Beer" button
    await expect(
      page
        .getByText(/tap list/i)
        .or(page.getByRole("button", { name: /add/i }))
        .first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("view analytics", async ({ page }) => {
    await page.goto(`${ADMIN_BASE}/analytics`);
    await page.waitForURL(`**/analytics`);

    // Analytics page should have chart areas or stat cards
    await expect(
      page
        .getByText(/analytics/i)
        .or(page.getByText(/sessions/i))
        .first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("view events page", async ({ page }) => {
    await page.goto(`${ADMIN_BASE}/events`);
    await page.waitForURL(`**/events`);

    await expect(
      page
        .getByText(/events/i)
        .or(page.getByRole("button", { name: /create/i }))
        .first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("view loyalty page", async ({ page }) => {
    await page.goto(`${ADMIN_BASE}/loyalty`);
    await page.waitForURL(`**/loyalty`);

    await expect(
      page
        .getByText(/loyalty/i)
        .or(page.getByText(/stamp/i))
        .first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
