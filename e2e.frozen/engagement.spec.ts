import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

// ─── Engagement E2E Tests ───────────────────────────────────────────────────
// Validates leaderboard system and streak display (Sprint 157 features).
// Owner: Reese (QA & Test Automation)
// Reviewer: Casey (QA Engineer)

test.describe("Leaderboard Page", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("leaderboard page loads at /leaderboards", async ({ page }) => {
    await page.goto("/leaderboards");
    await page.waitForURL("**/leaderboards", { timeout: 15_000 });

    // Page should render with a heading or leaderboard content
    await expect(
      page
        .getByText(/leaderboard/i)
        .or(page.getByText(/rank/i))
        .first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("category tabs are visible", async ({ page }) => {
    await page.goto("/leaderboards");

    // Should show the 5 leaderboard categories
    await expect(
      page.getByText(/xp/i).first(),
    ).toBeVisible({ timeout: 10_000 });

    await expect(
      page.getByText(/check-ins/i).or(page.getByText(/checkins/i)).first(),
    ).toBeVisible({ timeout: 10_000 });

    await expect(
      page.getByText(/styles/i).first(),
    ).toBeVisible({ timeout: 10_000 });

    await expect(
      page.getByText(/breweries/i).first(),
    ).toBeVisible({ timeout: 10_000 });

    await expect(
      page.getByText(/streak/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("can switch between categories", async ({ page }) => {
    await page.goto("/leaderboards");

    // Wait for the default category to render
    await expect(
      page.getByText(/xp/i).first(),
    ).toBeVisible({ timeout: 10_000 });

    // Click "Check-ins" category
    await page.getByText(/check-ins/i).or(page.getByText(/checkins/i)).first().click();
    await page.waitForTimeout(500);

    // Page should still be loaded (not crashed)
    await expect(page.locator("body")).not.toBeEmpty();

    // Click "Styles" category
    await page.getByText(/styles/i).first().click();
    await page.waitForTimeout(500);
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("scope selector is visible", async ({ page }) => {
    await page.goto("/leaderboards");

    // Wait for page to load
    await expect(
      page.getByText(/leaderboard/i).or(page.getByText(/xp/i)).first(),
    ).toBeVisible({ timeout: 10_000 });

    // Should show scope options (Global, Friends, City)
    await expect(
      page.getByText(/global/i).first(),
    ).toBeVisible({ timeout: 10_000 });

    await expect(
      page.getByText(/friends/i).first(),
    ).toBeVisible({ timeout: 10_000 });

    await expect(
      page.getByText(/city/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("leaderboard rows render with rank numbers", async ({ page }) => {
    await page.goto("/leaderboards");

    // Wait for leaderboard content
    await expect(
      page.getByText(/xp/i).first(),
    ).toBeVisible({ timeout: 10_000 });

    // Give time for data to load
    await page.waitForTimeout(1_000);

    // Should render leaderboard rows — look for rank indicators (#1, 1st, etc.)
    // or user entries (avatar, username, score)
    await expect(
      page
        .getByText(/^#?\d+$/)
        .or(page.locator('[class*="rank"], [class*="leaderboard"], [class*="row"]').first())
        .or(page.getByText(/no data|no entries|be the first/i))
        .first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("time range selector is present", async ({ page }) => {
    await page.goto("/leaderboards");

    // Wait for page to load
    await expect(
      page.getByText(/leaderboard/i).or(page.getByText(/xp/i)).first(),
    ).toBeVisible({ timeout: 10_000 });

    // Should have time range options (Week, Month, All Time)
    await expect(
      page
        .getByText(/week/i)
        .or(page.getByText(/month/i))
        .or(page.getByText(/all time/i))
        .first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("Streak Display", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("streak information is visible on profile or leaderboard", async ({ page }) => {
    // Streaks may appear on the leaderboard page or profile
    await page.goto("/leaderboards");

    // Wait for page to load
    await expect(
      page.getByText(/leaderboard/i).or(page.getByText(/xp/i)).first(),
    ).toBeVisible({ timeout: 10_000 });

    // Switch to Streak category
    await page.getByText(/streak/i).first().click();
    await page.waitForTimeout(500);

    // Streak tab should show streak-related content
    // (flame icon, day counts, freeze info, or empty state)
    await expect(
      page
        .getByText(/streak/i)
        .or(page.getByText(/day/i))
        .or(page.getByText(/no data|be the first/i))
        .first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
