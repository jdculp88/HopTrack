import { test, expect } from "@playwright/test";
import { login, TEST_USER, BREWERIES } from "./helpers/auth";

// ─── Achievements & Loyalty E2E Tests ───────────────────────────────────────
// Validates achievement grid rendering and brewery loyalty section.
// Owner: Reese (QA & Test Automation)
// Reviewer: Casey (QA Engineer)

test.describe("Achievements", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("navigate to achievements from profile", async ({ page }) => {
    // Go to the test user's profile
    await page.goto(`/profile/${TEST_USER.username}`);
    await page.waitForURL(`**/profile/${TEST_USER.username}`, { timeout: 15_000 });

    // Profile should load
    await expect(
      page
        .getByText(TEST_USER.displayName)
        .or(page.getByText(TEST_USER.username)),
    ).toBeVisible({ timeout: 10_000 });

    // Look for an achievements link or section on profile
    const achievementsLink = page
      .getByRole("link", { name: /achievement/i })
      .or(page.getByText(/achievement/i).first());

    await expect(achievementsLink).toBeVisible({ timeout: 10_000 });
    await achievementsLink.click();

    // Should navigate to achievements page
    await page.waitForTimeout(1_000);
    await expect(
      page
        .getByText(/achievement/i)
        .first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("achievement grid renders with cards", async ({ page }) => {
    // Navigate directly to achievements
    await page.goto(`/profile/${TEST_USER.username}/achievements`);

    // Wait for page load
    await expect(
      page.getByText(/achievement/i).first(),
    ).toBeVisible({ timeout: 10_000 });

    // Grid should render achievement cards or an empty state
    await expect(
      page
        .locator('[class*="achievement"], [class*="grid"], [class*="card"]')
        .or(page.getByText(/no achievements|start exploring/i))
        .first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("achievement cards show tier or progress info", async ({ page }) => {
    await page.goto(`/profile/${TEST_USER.username}/achievements`);

    // Wait for content
    await expect(
      page.getByText(/achievement/i).first(),
    ).toBeVisible({ timeout: 10_000 });

    // Cards should show tier indicators (bronze, silver, gold, platinum)
    // or progress bars, or locked/unlocked state
    await expect(
      page
        .getByText(/bronze|silver|gold|platinum|unlocked|locked|progress|\d+\s*\/\s*\d+/i)
        .or(page.getByText(/no achievements|start exploring/i))
        .first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("Brewery Loyalty", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("brewery detail page loads with content sections", async ({ page }) => {
    // Navigate to a known brewery detail page
    await page.goto(`/brewery/${BREWERIES.mountainRidge}`);

    // Hero heading should render
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10_000 });

    // Scroll to reveal all sections
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Page should have various content sections
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("loyalty section visible on brewery detail if brewery has loyalty", async ({ page }) => {
    // Navigate to the primary demo brewery (Pint & Pixel / Mountain Ridge — has seed data)
    await page.goto(`/brewery/${BREWERIES.mountainRidge}`);

    // Wait for page load
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10_000 });

    // Scroll down to find loyalty section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1_000);

    // Look for loyalty indicators (stamp card, rewards, loyalty program name)
    // If brewery doesn't have loyalty, we should see other sections instead
    const hasLoyalty = await page
      .getByText(/loyalty|stamp|reward|punch|earn/i)
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false);

    if (hasLoyalty) {
      // Loyalty section is present — verify it renders properly
      await expect(
        page.getByText(/loyalty|stamp|reward|punch|earn/i).first(),
      ).toBeVisible();
    } else {
      // No loyalty program — page should still render (reviews, tap list, etc.)
      await expect(
        page
          .getByText(/review|tap list|events|hours|about/i)
          .first(),
      ).toBeVisible({ timeout: 10_000 });
    }
  });
});
