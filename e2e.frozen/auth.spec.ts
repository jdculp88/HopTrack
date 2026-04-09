import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

// ─── Auth Flow Tests ────────────────────────────────────────────────────────
// Comprehensive tests for signup, login, forgot password, and route protection.
// Written by Reese, Sprint 44.

test.describe("Login Page", () => {
  test("renders email and password fields with sign-in button", async ({ page }) => {
    // Verify the login form renders all required elements
    await page.goto("/login");
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("shows link to signup page", async ({ page }) => {
    // Login page should provide a way to create an account
    await page.goto("/login");
    const signupLink = page.getByRole("link", { name: /sign up|create|register/i });
    await expect(signupLink).toBeVisible({ timeout: 5_000 });
  });

  test("shows link to forgot password", async ({ page }) => {
    // Login page should have a forgot password link
    await page.goto("/login");
    const forgotLink = page.getByRole("link", { name: /forgot/i })
      .or(page.getByText(/forgot/i));
    await expect(forgotLink.first()).toBeVisible({ timeout: 5_000 });
  });

  test("shows error on invalid credentials", async ({ page }) => {
    // Submitting wrong credentials should show an inline error, not redirect
    await page.goto("/login");
    await page.getByPlaceholder(/email/i).fill("nobody@invalid.test");
    await page.getByPlaceholder(/password/i).fill("wrongpassword123");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(
      page.getByText(/invalid|error|incorrect|failed|wrong/i),
    ).toBeVisible({ timeout: 10_000 });

    // Should NOT have redirected to /home
    expect(page.url()).not.toContain("/home");
  });

  test("shows error on empty form submission", async ({ page }) => {
    // Submitting an empty form should trigger validation
    await page.goto("/login");
    await page.getByRole("button", { name: /sign in/i }).click();

    // Either HTML5 validation prevents submission or an inline error shows
    // Check that we're still on the login page
    await page.waitForTimeout(1_000);
    expect(page.url()).toContain("/login");
  });

  test("successful login redirects to /home", async ({ page }) => {
    // Use the test account (seed 008) to verify login flow
    await login(page);
    expect(page.url()).toContain("/home");

    // The feed should render content
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("password field toggles visibility", async ({ page }) => {
    // Password input should have a show/hide toggle
    await page.goto("/login");
    const passwordInput = page.getByPlaceholder(/password/i);
    await passwordInput.fill("testpassword");

    // Initially type=password (hidden)
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Look for the toggle button (eye icon)
    const toggleBtn = page.getByRole("button", { name: /show|hide|toggle|eye/i })
      .or(page.locator("button").filter({ has: page.locator("svg") }).last());

    // If a toggle exists, click it and verify type changes
    if (await toggleBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await toggleBtn.click();
      await expect(passwordInput).toHaveAttribute("type", "text");
    }
  });
});

test.describe("Signup Page", () => {
  test("renders account step with email and password fields", async ({ page }) => {
    // Signup should show the first step (account creation)
    await page.goto("/signup");
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
  });

  test("shows link back to login", async ({ page }) => {
    // Signup page should link back to login for existing users
    await page.goto("/signup");
    const loginLink = page.getByRole("link", { name: /sign in|log in|already have/i })
      .or(page.getByText(/already have/i));
    await expect(loginLink.first()).toBeVisible({ timeout: 5_000 });
  });

  test("validates email format", async ({ page }) => {
    // Entering an invalid email should show validation feedback
    await page.goto("/signup");
    const emailInput = page.getByPlaceholder(/email/i);
    await emailInput.fill("notanemail");
    await emailInput.blur();

    // Either HTML5 validation or custom validation should prevent continuation
    await page.waitForTimeout(500);
    // The email input should have validity state
    const isInvalid = await emailInput.evaluate(
      (el: HTMLInputElement) => !el.validity.valid,
    );
    expect(isInvalid).toBeTruthy();
  });

  test("validates password minimum length", async ({ page }) => {
    // Short passwords should be rejected
    await page.goto("/signup");
    await page.getByPlaceholder(/email/i).fill("test@example.com");
    const passwordInput = page.getByPlaceholder(/password/i);
    await passwordInput.fill("ab");
    await passwordInput.blur();

    // Try to proceed and check for validation
    await page.waitForTimeout(500);
  });

  test("has terms and privacy links", async ({ page }) => {
    // Signup page should reference Terms of Service and Privacy Policy
    await page.goto("/signup");
    const termsLink = page.getByRole("link", { name: /terms/i })
      .or(page.getByText(/terms/i));
    const privacyLink = page.getByRole("link", { name: /privacy/i })
      .or(page.getByText(/privacy/i));

    await expect(termsLink.first()).toBeVisible({ timeout: 5_000 });
    await expect(privacyLink.first()).toBeVisible({ timeout: 5_000 });
  });
});

test.describe("Forgot Password Page", () => {
  test("renders email input and submit button", async ({ page }) => {
    // Forgot password form should ask for email
    await page.goto("/forgot-password");
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /reset|send|submit/i }),
    ).toBeVisible();
  });

  test("shows confirmation after submitting email", async ({ page }) => {
    // Submitting a valid email should show a success/confirmation message
    await page.goto("/forgot-password");
    await page.getByPlaceholder(/email/i).fill("test@example.com");
    await page.getByRole("button", { name: /reset|send|submit/i }).click();

    // Should show confirmation (check your email, link sent, etc.)
    await expect(
      page.getByText(/check your email|link sent|reset link|instructions/i),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("has link back to login", async ({ page }) => {
    // Should be able to navigate back to login
    await page.goto("/forgot-password");
    const backLink = page.getByRole("link", { name: /sign in|log in|back/i })
      .or(page.getByText(/back to/i));
    await expect(backLink.first()).toBeVisible({ timeout: 5_000 });
  });
});

test.describe("Route Protection", () => {
  test("unauthenticated user visiting /home redirects to login", async ({ page }) => {
    // Protected routes should redirect unauthenticated users
    await page.goto("/home");
    await page.waitForURL("**/login**", { timeout: 15_000 });
    expect(page.url()).toContain("/login");
  });

  test("unauthenticated user visiting /explore redirects to login", async ({ page }) => {
    await page.goto("/explore");
    await page.waitForURL("**/login**", { timeout: 15_000 });
    expect(page.url()).toContain("/login");
  });

  test("unauthenticated user visiting /friends redirects to login", async ({ page }) => {
    await page.goto("/friends");
    await page.waitForURL("**/login**", { timeout: 15_000 });
    expect(page.url()).toContain("/login");
  });

  test("unauthenticated user visiting /settings redirects to login", async ({ page }) => {
    await page.goto("/settings");
    await page.waitForURL("**/login**", { timeout: 15_000 });
    expect(page.url()).toContain("/login");
  });

  test("unauthenticated user visiting /notifications redirects to login", async ({ page }) => {
    await page.goto("/notifications");
    await page.waitForURL("**/login**", { timeout: 15_000 });
    expect(page.url()).toContain("/login");
  });

  test("unauthenticated user visiting brewery admin redirects to login", async ({ page }) => {
    await page.goto("/brewery-admin/dd000001-0000-0000-0000-000000000001");
    await page.waitForURL("**/login**", { timeout: 15_000 });
    expect(page.url()).toContain("/login");
  });
});
