import { test, expect } from "@playwright/test";
import { login, BREWERIES } from "./helpers/auth";

// ─── Brewery Admin Flows ─────────────────────────────────────────────────────
// Tests the brewery owner dashboard using the testflight user, who has owner
// access to all 3 demo breweries (seed 009 creates brewery_accounts).

const BREWERY_ID = BREWERIES.mountainRidge;
const ADMIN_BASE = `/brewery-admin/${BREWERY_ID}`;

test.describe("Brewery Admin", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("access brewery dashboard overview", async ({ page }) => {
    await page.goto(ADMIN_BASE);
    await page.waitForURL(`**${ADMIN_BASE}`, { timeout: 15_000 });

    // Overview should render with brewery content
    await expect(
      page.getByText(/overview/i)
        .or(page.getByText(/mountain ridge/i))
        .first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("view tap list", async ({ page }) => {
    await page.goto(`${ADMIN_BASE}/tap-list`);
    await page.waitForURL(`**/tap-list`, { timeout: 15_000 });

    // Tap list should show beer entries or Add button
    await expect(
      page.getByText(/tap list/i)
        .or(page.getByRole("button", { name: /add/i }))
        .first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("view analytics page", async ({ page }) => {
    await page.goto(`${ADMIN_BASE}/analytics`);
    await page.waitForURL(`**/analytics`, { timeout: 15_000 });

    await expect(
      page.getByText(/analytics/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("view customers page", async ({ page }) => {
    await page.goto(`${ADMIN_BASE}/customers`);
    await page.waitForURL(`**/customers`, { timeout: 15_000 });

    await expect(
      page.getByText(/customer insights/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("view events page", async ({ page }) => {
    await page.goto(`${ADMIN_BASE}/events`);
    await page.waitForURL(`**/events`, { timeout: 15_000 });

    await expect(
      page.getByText(/events/i)
        .or(page.getByRole("button", { name: /create/i }))
        .first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("view loyalty page", async ({ page }) => {
    await page.goto(`${ADMIN_BASE}/loyalty`);
    await page.waitForURL(`**/loyalty`, { timeout: 15_000 });

    await expect(
      page.getByText(/loyalty/i)
        .or(page.getByText(/stamp/i))
        .first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("view sessions page", async ({ page }) => {
    await page.goto(`${ADMIN_BASE}/sessions`);
    await page.waitForURL(`**/sessions`, { timeout: 15_000 });

    await expect(
      page.getByText(/session/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("view billing page", async ({ page }) => {
    await page.goto(`${ADMIN_BASE}/billing`);
    await page.waitForURL(`**/billing`, { timeout: 15_000 });

    await expect(
      page.getByText(/billing|plan|pricing/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
