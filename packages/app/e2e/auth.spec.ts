import { expect, test } from "@playwright/test";
import { clearAuthState, loginAs, logout } from "./helpers/auth-helper";
import { TEST_USERS } from "./helpers/consts";

const INVALID_CREDENTIALS = {
  email: "invalid@test.com",
  password: "wrongpassword",
};

test.describe("Authentication & Authorization", () => {
  test.beforeEach(async ({ page }) => {
    // Clear auth state before each test
    // Test data is seeded by global setup
    await clearAuthState(page);
  });

  test.describe("Login Flow", () => {
    test("should display login form when not authenticated", async ({
      page,
    }) => {
      // clearAuthState in beforeEach already navigates to /login and clears auth state
      // Verify we're on login page and elements are visible
      await expect(page).toHaveURL("/login");
      await expect(page.getByTestId("email-input")).toBeVisible();
      await expect(page.getByTestId("password-input")).toBeVisible();
      await expect(page.getByTestId("login-button")).toBeVisible();
      await expect(page.getByText("Login")).toBeVisible();

      // Also test that protected routes redirect to login
      await page.goto("/");
      await expect(page).toHaveURL("/login");
    });

    test("should successfully login with valid admin credentials", async ({
      page,
    }) => {
      await loginAs(page, "admin");

      await expect(page).toHaveURL("/");

      const successToast = page
        .locator(".toast")
        .filter({ hasText: "Logged in successfully" });
      await expect(successToast).toBeVisible();
    });

    test("should successfully login with valid user credentials", async ({
      page,
    }) => {
      await loginAs(page, "user");

      await expect(page).toHaveURL("/");

      const successToast = page
        .locator(".toast")
        .filter({ hasText: "Logged in successfully" });
      await expect(successToast).toBeVisible();
    });

    test("should show error for invalid email", async ({ page }) => {
      await page.goto("/login");
      await page.getByTestId("email-input").fill(INVALID_CREDENTIALS.email);
      await page
        .getByTestId("password-input")
        .fill(INVALID_CREDENTIALS.password);
      await page.getByTestId("login-button").click();

      await expect(page).toHaveURL("/login");

      const errorToast = page
        .locator(".toast")
        .filter({ hasText: /Failed to authenticate|Invalid credentials/ });
      await expect(errorToast).toBeVisible();
    });

    test("should show error for invalid password", async ({ page }) => {
      await page.goto("/login");
      await page.getByTestId("email-input").fill(TEST_USERS.admin.email!);
      await page.getByTestId("password-input").fill("wrongpassword");
      await page.getByTestId("login-button").click();

      await expect(page).toHaveURL("/login");

      const errorToast = page
        .locator(".toast")
        .filter({ hasText: /Failed to authenticate|Invalid credentials/ });
      await expect(errorToast).toBeVisible();
    });

    test("should show loading state during login", async ({ page }) => {
      await page.goto("/login");
      await page.getByTestId("email-input").fill(TEST_USERS.admin.email!);
      await page.getByTestId("password-input").fill(TEST_USERS.admin.password!);

      const loginButton = page.getByTestId("login-button");
      await loginButton.click();

      await expect(loginButton).toHaveText("Logging in...");
      await expect(loginButton).toBeDisabled();
    });

    test("should validate required fields", async ({ page }) => {
      await page.goto("/login");

      await page.getByTestId("login-button").click();

      const emailInput = page.getByTestId("email-input");
      const passwordInput = page.getByTestId("password-input");

      await expect(emailInput).toHaveAttribute("required");
      await expect(passwordInput).toHaveAttribute("required");

      const emailValidity = await emailInput.evaluate(
        (el: HTMLInputElement) => el.validity.valid
      );
      const passwordValidity = await passwordInput.evaluate(
        (el: HTMLInputElement) => el.validity.valid
      );

      expect(emailValidity).toBe(false);
      expect(passwordValidity).toBe(false);
    });
  });

  test.describe("Session Management", () => {
    test("should persist session across page refresh", async ({ page }) => {
      await loginAs(page, "admin");
      await expect(page).toHaveURL("/");

      await page.reload();

      await expect(page).toHaveURL("/");
    });

    test("should persist session across browser tab close/open", async ({
      page,
      context,
    }) => {
      await loginAs(page, "admin");
      await expect(page).toHaveURL("/");

      await page.close();

      const newPage = await context.newPage();
      await newPage.goto("/");

      await expect(newPage).toHaveURL("/");
    });

    test("should redirect to login when session expires", async ({ page }) => {
      await loginAs(page, "admin");
      await expect(page).toHaveURL("/");

      await page.evaluate(() => {
        localStorage.removeItem("auth-storage");
        localStorage.removeItem("pocketbase_auth");
        sessionStorage.clear();
      });

      await page.reload();

      await expect(page).toHaveURL("/login");
    });
  });

  test.describe("Logout Flow", () => {
    test("should successfully logout", async ({ page }) => {
      await loginAs(page, "admin");
      await expect(page).toHaveURL("/");

      await logout(page);

      await expect(page).toHaveURL("/login");
      await expect(page.getByTestId("email-input")).toBeVisible();
    });

    test("should clear session data on logout", async ({ page }) => {
      await loginAs(page, "admin");
      await expect(page).toHaveURL("/");

      await logout(page);

      const authStorage = await page.evaluate(() =>
        localStorage.getItem("auth-storage")
      );
      const authData = authStorage ? JSON.parse(authStorage) : null;
      expect(authData?.state?.isAuthenticated).toBe(false);
      expect(authData?.state?.user).toBeNull();
    });

    test("should not allow access to protected routes after logout", async ({
      page,
    }) => {
      await loginAs(page, "admin");
      await expect(page).toHaveURL("/");

      await logout(page);

      await page.goto("/dashboard");
      await expect(page).toHaveURL("/login");

      await page.goto("/admin");
      await expect(page).toHaveURL("/login");

      await page.goto("/settings");
      await expect(page).toHaveURL("/login");
    });
  });

  test.describe("Route Protection", () => {
    test("should redirect to login for protected routes when not authenticated", async ({
      page,
    }) => {
      const protectedRoutes = [
        "/",
        "/dashboard",
        "/admin",
        "/settings",
        "/notifications/history",
      ];

      for (const route of protectedRoutes) {
        await page.goto(route);
        await expect(page).toHaveURL("/login");
      }
    });

    test("should redirect authenticated users away from login page", async ({
      page,
    }) => {
      await loginAs(page, "admin");
      await expect(page).toHaveURL("/");

      await page.goto("/login");
      await expect(page).toHaveURL("/");
    });

    test("should allow access to protected routes when authenticated", async ({
      page,
    }) => {
      await loginAs(page, "admin");

      await page.goto("/dashboard");
      await expect(page).toHaveURL("/dashboard");

      await page.goto("/admin");
      await expect(page).toHaveURL("/admin");

      await page.goto("/settings");
      await expect(page).toHaveURL("/settings");
    });

    test("should handle device-specific routes when authenticated", async ({
      page,
    }) => {
      await loginAs(page, "admin");

      await page.goto("/test-device-001/stream");
      await expect(page).toHaveURL("/test-device-001/stream");

      await page.goto("/test-device-001/params");
      await expect(page).toHaveURL("/test-device-001/params");

      await page.goto("/test-device-001/actions");
      await expect(page).toHaveURL("/test-device-001/actions");
    });
  });

  test.describe("Permission-Based Access", () => {
    test("admin user should have access to all features", async ({ page }) => {
      await loginAs(page, "admin");

      await page.goto("/admin");
      await expect(page).toHaveURL("/admin");
      await expect(page.getByText(/Analytics Dashboard/i)).toBeVisible();

      await page.goto("/dashboard");
      await expect(page).toHaveURL("/dashboard");

      await page.goto("/settings");
      await expect(page).toHaveURL("/settings");
    });

    test("regular user should have limited access", async ({ page }) => {
      await loginAs(page, "user");

      await page.goto("/");
      await expect(page).toHaveURL("/");

      await page.goto("/dashboard");
      await expect(page).toHaveURL("/dashboard");

      await page.goto("/settings");
      await expect(page).toHaveURL("/settings");
    });

    test("limited user should have minimal access", async ({ page }) => {
      await loginAs(page, "limited");

      await page.goto("/");
      await expect(page).toHaveURL("/");

      await page.goto("/dashboard");
      await expect(page).toHaveURL("/dashboard");
    });
  });

  test.describe("Error Handling", () => {
    test("should handle network errors gracefully", async ({ page }) => {
      await page.route(
        "**/api/collections/users/auth-with-password",
        (route) => {
          route.abort("failed");
        }
      );

      await page.goto("/login");
      await page.getByTestId("email-input").fill(TEST_USERS.admin.email!);
      await page.getByTestId("password-input").fill(TEST_USERS.admin.password!);
      await page.getByTestId("login-button").click();

      const errorToast = page
        .locator(".toast")
        .filter({ hasText: /Something went wrong/i });
      await expect(errorToast).toBeVisible();
    });

    test("should handle server errors gracefully", async ({ page }) => {
      await page.route(
        "**/api/collections/users/auth-with-password",
        (route) => {
          route.fulfill({
            status: 500,
            body: JSON.stringify({ message: "Internal server error" }),
          });
        }
      );

      await page.goto("/login");
      await page.getByTestId("email-input").fill(TEST_USERS.admin.email!);
      await page.getByTestId("password-input").fill(TEST_USERS.admin.password!);
      await page.getByTestId("login-button").click();

      const errorToast = page
        .locator(".toast")
        .filter({ hasText: /error|failed/i });
      await expect(errorToast).toBeVisible();
    });

    test("should handle malformed responses gracefully", async ({ page }) => {
      await page.route(
        "**/api/collections/users/auth-with-password",
        (route) => {
          route.fulfill({
            status: 200,
            body: "invalid json",
          });
        }
      );

      await page.goto("/login");
      await page.getByTestId("email-input").fill(TEST_USERS.admin.email!);
      await page.getByTestId("password-input").fill(TEST_USERS.admin.password!);
      await page.getByTestId("login-button").click();

      const errorToast = page
        .locator(".toast")
        .filter({ hasText: /Failed to authenticate, check app status/i });
      await expect(errorToast).toBeVisible();
    });
  });

  test.describe("UI/UX Validation", () => {
    test("should have proper accessibility attributes", async ({ page }) => {
      await page.goto("/login");

      const emailInput = page.getByTestId("email-input");
      const passwordInput = page.getByTestId("password-input");
      const loginButton = page.getByTestId("login-button");

      await expect(emailInput).toHaveAttribute("type", "email");
      await expect(passwordInput).toHaveAttribute("type", "password");
      await expect(loginButton).toHaveAttribute("type", "submit");

      await expect(page.getByText("Email")).toBeVisible();
      await expect(page.getByText("Password")).toBeVisible();
    });

    test("should display proper placeholders", async ({ page }) => {
      await page.goto("/login");

      await expect(page.getByTestId("email-input")).toHaveAttribute(
        "placeholder",
        "Enter your email"
      );
      await expect(page.getByTestId("password-input")).toHaveAttribute(
        "placeholder",
        "Enter your password"
      );
    });

    test("should show theme toggle", async ({ page }) => {
      await page.goto("/login");

      const themeToggle = page.locator('[data-testid="theme-toggle"]');
      await expect(themeToggle).toBeVisible();
    });

    test("should show logo", async ({ page }) => {
      await page.goto("/login");

      const logo = page.locator('img[alt*="Logo"]');
      await expect(logo).toBeVisible();
    });
  });
});
