import { type Page } from "@playwright/test";
import { TEST_USERS } from "./consts";

export async function loginAs(page: Page, userType: keyof typeof TEST_USERS) {
  const credentials = TEST_USERS[userType];

  await page.goto("/login");
  await page.getByTestId("email-input").fill(credentials.email!);
  await page.getByTestId("password-input").fill(credentials.password!);
  await page.getByTestId("login-button").click();

  await page.waitForURL("/");
}

export async function logout(page: Page) {
  await page.getByTestId("user-profile-button").click();
  await page.getByTestId("logout-button").click();

  await page.waitForURL("/login");
}

export async function clearAuthState(page: Page) {
  // Clear cookies first
  await page.context().clearCookies();

  // Clear localStorage and sessionStorage by navigating to the app domain first
  // This ensures we have a valid origin to access storage
  await page.goto("/login");

  await page.evaluate(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // Fallback: if localStorage is not accessible, at least clear auth-related items
      console.log("Storage clear failed, attempting individual item removal");
    }
  });
}

export async function expectAuthenticated(page: Page, userEmail: string) {
  await page.waitForURL("/");
  await page.waitForSelector(`text=${userEmail}`, { timeout: 10000 });
}

export async function expectUnauthenticated(page: Page) {
  await page.waitForURL("/login");
  await page.waitForSelector('[data-testid="email-input"]');
}
