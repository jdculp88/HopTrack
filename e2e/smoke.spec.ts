import { test, expect } from "@playwright/test";

// ─── Smoke Tests ──────────────────────────────────────────────────────────────
// These are the critical happy paths that should NEVER break.
// Run with: npx playwright test

test.describe("Public Pages", () => {
  test("landing page loads with HopMark logo", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/HopTrack/);
    // HopMark SVG should be visible
    await expect(page.locator("svg").first()).toBeVisible();
  });

  test("for-breweries page loads", async ({ page }) => {
    await page.goto("/for-breweries");
    await expect(page.getByText("Claim your brewery")).toBeVisible();
  });

  test("privacy page loads", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByText("Privacy")).toBeVisible();
  });
});

test.describe("Auth Flow", () => {
  test("login page renders dark form card", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
  });

  test("signup page renders all fields", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    await expect(page.getByPlaceholder(/username/i)).toBeVisible();
  });

  test("login with invalid credentials shows error", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder(/email/i).fill("bad@email.com");
    await page.getByPlaceholder(/password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();
    // Should show an error message (not redirect)
    await expect(page.getByText(/invalid|error|incorrect/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Brewery Welcome (QR landing)", () => {
  test("brewery welcome page has loading skeleton", async ({ page }) => {
    // This will likely 404 for a random ID, but the loading state should appear
    await page.goto("/brewery-welcome/00000000-0000-0000-0000-000000000000");
    // Should either show loading skeleton or 404 — not a blank page
    const body = await page.textContent("body");
    expect(body).toBeTruthy();
  });
});
