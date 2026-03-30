import { test, expect } from "@playwright/test";

// ─── Smoke Tests ──────────────────────────────────────────────────────────────
// Critical paths that should NEVER break. No auth required.
// Run with: npm run test:e2e

test.describe("Public Pages", () => {
  test("landing page loads with HopTrack branding", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/HopTrack/);
    // Page should have visible content (not a blank white screen)
    await expect(page.locator("body")).not.toBeEmpty();
    // No JS errors that crash the page
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  test("for-breweries pricing page loads", async ({ page }) => {
    await page.goto("/for-breweries");
    // Should contain pricing-related content
    await expect(
      page.getByText(/brewery/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("privacy page loads", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByText(/privacy/i).first()).toBeVisible();
  });

  test("terms page loads", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.getByText(/terms/i).first()).toBeVisible();
  });
});

test.describe("Auth Pages", () => {
  test("login page renders form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("signup page renders all fields", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
  });

  test("login with invalid credentials shows error", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder(/email/i).fill("fake@invalid.test");
    await page.getByPlaceholder(/password/i).fill("wrongpassword123");
    await page.getByRole("button", { name: /sign in/i }).click();
    // Should show an error — not redirect to /home
    await expect(
      page.getByText(/invalid|error|incorrect|failed/i),
    ).toBeVisible({ timeout: 8_000 });
  });

  test("forgot-password page loads", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
  });
});

test.describe("Brewery Welcome (QR landing)", () => {
  test("brewery welcome page renders or shows not-found", async ({ page }) => {
    // Random UUID will 404, but the page should not crash
    await page.goto("/brewery-welcome/00000000-0000-0000-0000-000000000000");
    const body = await page.textContent("body");
    expect(body).toBeTruthy();
    // Should not be a blank page
    expect(body!.length).toBeGreaterThan(10);
  });
});
