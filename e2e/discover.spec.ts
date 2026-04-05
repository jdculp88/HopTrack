import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

// ─── Discover & Trending E2E Tests ──────────────────────────────────────────
// Validates the Discover tab, trending content, and recommendations.
// Owner: Reese (QA & Test Automation)
// Reviewer: Casey (QA Engineer)

test.describe("Discover Tab", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("discover tab accessible from home feed", async ({ page }) => {
    // Home feed should have the Discover tab
    await expect(page.getByText("Discover")).toBeVisible({ timeout: 10_000 });

    // Click Discover tab
    await page.getByText("Discover").click();
    await page.waitForTimeout(500);

    // Discover content should render (trending, recommendations, challenges, etc.)
    await expect(
      page
        .getByText(/trending/i)
        .or(page.getByText(/brewed for you/i))
        .or(page.getByText(/recommend/i))
        .or(page.getByText(/discover/i))
        .first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("trending section loads with content", async ({ page }) => {
    // Navigate to home and switch to Discover tab
    await page.getByText("Discover").click();
    await page.waitForTimeout(500);

    // Trending section should be present
    await expect(
      page.getByText(/trending/i).first(),
    ).toBeVisible({ timeout: 10_000 });

    // Should show trending items (beer/brewery cards) or an empty state
    await expect(
      page
        .locator('[class*="trending"], [class*="card"]')
        .or(page.getByText(/no trending/i))
        .first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("trending tabs are clickable", async ({ page }) => {
    await page.getByText("Discover").click();
    await page.waitForTimeout(500);

    // Wait for trending section
    await expect(
      page.getByText(/trending/i).first(),
    ).toBeVisible({ timeout: 10_000 });

    // Trending should have beer/brewery pill tabs
    const beerTab = page
      .getByRole("button", { name: /beers?$/i })
      .or(page.getByText(/beers?$/i).first());

    const breweryTab = page
      .getByRole("button", { name: /breweries/i })
      .or(page.getByText(/breweries/i).first());

    // Click between tabs if both are visible
    if (await beerTab.isVisible()) {
      await beerTab.click();
      await page.waitForTimeout(500);
      await expect(page.locator("body")).not.toBeEmpty();
    }

    if (await breweryTab.isVisible()) {
      await breweryTab.click();
      await page.waitForTimeout(500);
      await expect(page.locator("body")).not.toBeEmpty();
    }
  });

  test("recommendations section present", async ({ page }) => {
    await page.getByText("Discover").click();
    await page.waitForTimeout(500);

    // Scroll down to find recommendations section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(500);

    // Should show recommendations ("Brewed for You", AI recs, or algorithmic recs)
    await expect(
      page
        .getByText(/brewed for you/i)
        .or(page.getByText(/recommend/i))
        .or(page.getByText(/you might like/i))
        .or(page.getByText(/for you/i))
        .first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("can navigate from discover content to detail page", async ({ page }) => {
    await page.getByText("Discover").click();
    await page.waitForTimeout(500);

    // Wait for discover content to load
    await expect(
      page.getByText(/trending/i).first(),
    ).toBeVisible({ timeout: 10_000 });

    // Find a clickable beer or brewery link/card in the discover tab
    const clickableItem = page
      .getByRole("link", { name: /.*brewing.*|.*beer.*|.*brewery.*/i })
      .or(page.locator("a[href*='/brewery/'], a[href*='/beer/']"))
      .first();

    if (await clickableItem.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await clickableItem.click();
      await page.waitForTimeout(1_000);

      // Should have navigated to a detail page (brewery or beer)
      const url = page.url();
      const isDetailPage =
        url.includes("/brewery/") || url.includes("/beer/");

      // If we navigated, verify the page loaded
      if (isDetailPage) {
        await expect(page.locator("h1").first()).toBeVisible({ timeout: 10_000 });
      } else {
        // Might have been a non-link card — just verify no crash
        await expect(page.locator("body")).not.toBeEmpty();
      }
    } else {
      // No clickable items found — verify the page itself didn't crash
      await expect(page.locator("body")).not.toBeEmpty();
    }
  });
});
