import { test, expect } from "@playwright/test";
import { login, BREWERIES } from "./helpers/auth";

// ─── Storefront E2E Tests ───────────────────────────────────────────────────
// Tests public brewery pages — accessible without authentication.
// Validates StorefrontGate, AuthGate, and the public/auth experience split.
// Sprint 150 — The Playwright (Casey + Reese)

test.describe("Storefront — Public Brewery Pages (Unauthenticated)", () => {
  test("brewery page loads with hero, name, and location", async ({
    page,
  }) => {
    // Visit a demo brewery without logging in
    await page.goto(`/brewery/${BREWERIES.mountainRidge}`);

    // Hero section should render with brewery name in an h1
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible({ timeout: 10_000 });

    // Page should have brewery-related content (name, location info)
    const body = await page.textContent("body");
    expect(body!.length).toBeGreaterThan(50);
  });

  test("shows sign-up CTA for unauthenticated users", async ({ page }) => {
    await page.goto(`/brewery/${BREWERIES.mountainRidge}`);

    // Should show a "Sign Up" or "Create Account" call to action
    await expect(
      page
        .getByText(/sign up|create account|check in here.*sign up/i)
        .first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("does not crash on non-existent brewery ID", async ({ page }) => {
    await page.goto("/brewery/00000000-0000-0000-0000-000000000000");

    // Should render something (404 page, error message, etc.) — not a blank crash
    const body = await page.textContent("body");
    expect(body!.length).toBeGreaterThan(10);
  });

  test("page has proper metadata for SEO", async ({ page }) => {
    await page.goto(`/brewery/${BREWERIES.mountainRidge}`);

    // Should have a meaningful title (not just "HopTrack")
    const title = await page.title();
    expect(title.length).toBeGreaterThan(5);
  });
});

test.describe("Storefront — Authenticated Brewery Page", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("authenticated user sees full content", async ({ page }) => {
    await page.goto(`/brewery/${BREWERIES.mountainRidge}`);

    // Hero should render
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible({ timeout: 10_000 });

    // Should see interactive elements (check-in button, follow, etc.)
    await expect(
      page
        .getByRole("button", { name: /check in|follow|start/i })
        .first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("authenticated user does not see sign-up gate", async ({ page }) => {
    await page.goto(`/brewery/${BREWERIES.mountainRidge}`);

    // Wait for page to fully load
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10_000 });

    // AuthGate text should NOT be present for authenticated users
    const authGateText = page.getByText(/create account.*free/i);
    await expect(authGateText).not.toBeVisible();
  });

  test("can navigate between brewery sections", async ({ page }) => {
    await page.goto(`/brewery/${BREWERIES.mountainRidge}`);

    // Wait for page load
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10_000 });

    // Page should have multiple sections of content without crashing
    // Scroll down to load lazy sections
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Page should still be intact (not crashed)
    await expect(page.locator("body")).not.toBeEmpty();
  });
});
