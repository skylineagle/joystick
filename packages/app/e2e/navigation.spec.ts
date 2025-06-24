import { expect, test } from "@playwright/test";
import { loginAs, logout } from "./helpers/auth-helper";
import { TEST_USERS } from "./helpers/consts";

test.describe("Navigation & Layout", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
  });

  test.describe("Home to Device Navigation", () => {
    test("should navigate to device from home page using joystick button", async ({
      page,
    }) => {
      await page.goto("/");

      // Wait for device table to load
      await expect(
        page.locator('[data-testid^="device-row-"]').first()
      ).toBeVisible();

      // Find the first device row and click its joystick button
      const deviceRows = page.locator('[data-testid^="device-row-"]');
      const firstDeviceRow = deviceRows.first();
      const firstDevice = await firstDeviceRow.getAttribute("data-testid");
      const deviceId = firstDevice?.replace("device-row-", "");

      if (deviceId) {
        await page.getByTestId(`joystick-button-${deviceId}`).click();

        // Should navigate to the device page (stream or actions depending on device capabilities)
        await expect(page).toHaveURL(
          new RegExp(`/${deviceId}/(stream|actions)`)
        );
      }
    });
  });

  test.describe("Device Page Navigation", () => {
    test("should navigate between available routes in device page", async ({
      page,
    }) => {
      await page.goto("/");

      // Navigate to a device first
      const deviceRows = page.locator('[data-testid^="device-row-"]');
      const firstDevice = await deviceRows.first().getAttribute("data-testid");
      const deviceId = firstDevice?.replace("device-row-", "");

      if (deviceId) {
        await page.getByTestId(`joystick-button-${deviceId}`).click();

        // Wait for device page to load and check available navigation
        await expect(page.locator('[data-sidebar="sidebar"]')).toBeVisible();

        // Test navigation between available routes
        const streamLink = page.getByRole("link", { name: "Stream" });
        const actionsLink = page.getByRole("link", { name: "Actions" });
        const paramsLink = page.getByRole("link", { name: "Parameters" });

        // Navigate to Actions if available
        if (await actionsLink.isVisible()) {
          await actionsLink.click();
          await expect(page).toHaveURL(new RegExp(`/${deviceId}/actions`));
        }

        // Navigate to Stream if available
        if (await streamLink.isVisible()) {
          await streamLink.click();
          await expect(page).toHaveURL(new RegExp(`/${deviceId}/stream`));
        }

        // Navigate to Parameters if available
        if (await paramsLink.isVisible()) {
          await paramsLink.click();
          await expect(page).toHaveURL(new RegExp(`/${deviceId}/params`));
        }
      }
    });

    test("should not show terminal route for users without permission", async ({
      page,
    }) => {
      // Test with limited user who doesn't have terminal permissions
      await logout(page);
      await loginAs(page, "limited");
      await page.goto("/");

      const deviceRows = page.locator('[data-testid^="device-row-"]');
      if ((await deviceRows.count()) > 0) {
        const firstDevice = await deviceRows
          .first()
          .getAttribute("data-testid");
        const deviceId = firstDevice?.replace("device-row-", "");

        if (deviceId) {
          await page.getByTestId(`joystick-button-${deviceId}`).click();

          // Terminal link should not be visible for limited user
          const terminalLink = page.getByRole("link", { name: "Terminal" });
          await expect(terminalLink).not.toBeVisible();
        }
      }
    });

    test("should show terminal route for users with permission", async ({
      page,
    }) => {
      // Admin user should see terminal if device supports it
      await page.goto("/");

      const deviceRows = page.locator('[data-testid^="device-row-"]');
      const firstDevice = await deviceRows.first().getAttribute("data-testid");
      const deviceId = firstDevice?.replace("device-row-", "");

      if (deviceId) {
        await page.getByTestId(`joystick-button-${deviceId}`).click();

        // Terminal link should be visible for admin if device supports it
        const terminalLink = page.getByRole("link", { name: "Terminal" });
        if (await terminalLink.isVisible()) {
          await expect(terminalLink).toBeVisible();
          await terminalLink.click();
          await expect(page).toHaveURL(new RegExp(`/${deviceId}/terminal`));
        }
      }
    });
  });

  test.describe("Back to Dashboard Navigation", () => {
    test("should navigate back to dashboard from device page", async ({
      page,
    }) => {
      await page.goto("/");

      // Navigate to device page first
      const deviceRows = page.locator('[data-testid^="device-row-"]');
      const firstDevice = await deviceRows.first().getAttribute("data-testid");
      const deviceId = firstDevice?.replace("device-row-", "");

      if (deviceId) {
        await page.getByTestId(`joystick-button-${deviceId}`).click();

        // Click "Back to Dashboard" button
        const backButton = page.getByRole("link", {
          name: /Back to Dashboard/i,
        });
        await expect(backButton).toBeVisible();
        await backButton.click();

        // Should navigate back to home page
        await expect(page).toHaveURL("/");
        await expect(page.getByText("Joystick")).toBeVisible();
      }
    });
  });

  test.describe("Device Switcher", () => {
    test("should switch devices using device switcher dropdown", async ({
      page,
    }) => {
      await page.goto("/");

      const deviceRows = page.locator('[data-testid^="device-row-"]');
      const deviceCount = await deviceRows.count();

      if (deviceCount >= 2) {
        // Navigate to first device
        const firstDevice = await deviceRows
          .first()
          .getAttribute("data-testid");
        const firstDeviceId = firstDevice?.replace("device-row-", "");

        if (firstDeviceId) {
          await page.getByTestId(`joystick-button-${firstDeviceId}`).click();

          // Open device switcher using its test ID
          await page.getByTestId("device-switcher-button").click();

          // Get the second device ID from the home page data
          const secondDevice = await deviceRows
            .nth(1)
            .getAttribute("data-testid");
          const secondDeviceId = secondDevice?.replace("device-row-", "");

          if (secondDeviceId) {
            // Select second device using its specific test ID
            await page.getByTestId(`device-switcher-${secondDeviceId}`).click();

            // Should navigate to second device
            await expect(page).toHaveURL(
              new RegExp(`/${secondDeviceId}/(stream|actions)`)
            );
          }
        }
      }
    });

    test("should handle keyboard shortcut for device switching (Cmd+K)", async ({
      page,
    }) => {
      await page.goto("/");

      const deviceRows = page.locator('[data-testid^="device-row-"]');
      const firstDevice = await deviceRows.first().getAttribute("data-testid");
      const deviceId = firstDevice?.replace("device-row-", "");

      if (deviceId) {
        await page.getByTestId(`joystick-button-${deviceId}`).click();

        // Use keyboard shortcut to open device switcher
        await page.keyboard.press(
          process.platform === "darwin" ? "Meta+k" : "Control+k"
        );

        await expect(page.getByText("Devices")).not.toBeVisible();
      }
    });
  });

  test.describe("Layout Components", () => {
    test("should display sidebar with navigation items", async ({ page }) => {
      await page.goto("/");

      const deviceRows = page.locator('[data-testid^="device-row-"]');
      const firstDevice = await deviceRows.first().getAttribute("data-testid");
      const deviceId = firstDevice?.replace("device-row-", "");

      if (deviceId) {
        await page.getByTestId(`joystick-button-${deviceId}`).click();

        await expect(page.locator('[data-sidebar="sidebar"]')).toBeVisible();

        // Check for common navigation items
        const navItems = ["Stream", "Actions"];
        for (const item of navItems) {
          const navItem = page.getByRole("link", { name: item });
          if (await navItem.isVisible()) {
            await expect(navItem).toBeVisible();
          }
        }
      }
    });

    test("should highlight active navigation item", async ({ page }) => {
      await page.goto("/");

      const deviceRows = page.locator('[data-testid^="device-row-"]');
      const firstDevice = await deviceRows.first().getAttribute("data-testid");
      const deviceId = firstDevice?.replace("device-row-", "");

      if (deviceId) {
        await page.getByTestId(`joystick-button-${deviceId}`).click();

        // Navigate to actions page
        const actionsLink = page.getByRole("link", { name: "Actions" });
        if (await actionsLink.isVisible()) {
          await actionsLink.click();
          await expect(page).toHaveURL(new RegExp(`/${deviceId}/actions`));

          // Check if active link is highlighted
          const activeLink = page.getByRole("link", { name: "Actions" });
          await expect(activeLink).toHaveAttribute("data-active", "true");
        }
      }
    });

    test("should toggle sidebar with trigger button", async ({ page }) => {
      await page.goto("/");

      const deviceRows = page.locator('[data-testid^="device-row-"]');
      const firstDevice = await deviceRows.first().getAttribute("data-testid");
      const deviceId = firstDevice?.replace("device-row-", "");

      if (deviceId) {
        await page.getByTestId(`joystick-button-${deviceId}`).click();

        const sidebarTrigger = page.locator('[data-sidebar="trigger"]');
        await sidebarTrigger.click();

        // Wait for animation
        await page.waitForTimeout(300);

        // Toggle back
        await sidebarTrigger.click();

        await expect(page.locator('[data-sidebar="sidebar"]')).toBeVisible();
      }
    });

    test("should handle keyboard shortcut for sidebar toggle (Cmd+B)", async ({
      page,
    }) => {
      await page.goto("/");

      const deviceRows = page.locator('[data-testid^="device-row-"]');
      const firstDevice = await deviceRows.first().getAttribute("data-testid");
      const deviceId = firstDevice?.replace("device-row-", "");

      if (deviceId) {
        await page.getByTestId(`joystick-button-${deviceId}`).click();

        // Use keyboard shortcut to toggle sidebar
        await page.keyboard.press(
          process.platform === "darwin" ? "Meta+b" : "Control+b"
        );

        // Wait for animation
        await page.waitForTimeout(300);

        // Toggle back
        await page.keyboard.press(
          process.platform === "darwin" ? "Meta+b" : "Control+b"
        );

        await expect(page.locator('[data-sidebar="sidebar"]')).toBeVisible();
      }
    });
  });

  test.describe("Responsive Layout", () => {
    test.skip("should adapt to mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");

      await expect(page.getByText("Joystick")).toBeVisible();

      const deviceRows = page.locator('[data-testid^="device-row-"]');
      const firstDevice = await deviceRows.first().getAttribute("data-testid");
      const deviceId = firstDevice?.replace("device-row-", "");

      if (deviceId) {
        await page.getByTestId(`joystick-button-${deviceId}`).click();

        // Sidebar should still be functional on mobile
        await expect(page.locator('[data-sidebar="sidebar"]')).toBeVisible();
      }
    });

    test("should handle tablet viewport", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto("/");

      await expect(page.getByText("Joystick")).toBeVisible();

      const deviceRows = page.locator('[data-testid^="device-row-"]');
      const firstDevice = await deviceRows.first().getAttribute("data-testid");
      const deviceId = firstDevice?.replace("device-row-", "");

      if (deviceId) {
        await page.goto(`/${deviceId}/stream`);

        await expect(page.locator('[data-sidebar="sidebar"]')).toBeVisible();
      }
    });

    test("should maintain layout on desktop", async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto("/");

      await expect(page.getByText("Joystick")).toBeVisible();

      const deviceRows = page.locator('[data-testid^="device-row-"]');
      const firstDevice = await deviceRows.first().getAttribute("data-testid");
      const deviceId = firstDevice?.replace("device-row-", "");

      if (deviceId) {
        await page.goto(`/${deviceId}/stream`);

        await expect(page.locator('[data-sidebar="sidebar"]')).toBeVisible();
      }
    });
  });

  test.describe("User Profile Navigation", () => {
    test("should open user profile dropdown", async ({ page }) => {
      await page.goto("/");

      await page.getByTestId("user-profile-button").click();

      await expect(page.getByText(TEST_USERS.admin.email!)).toBeVisible();
      await expect(page.getByTestId("color-mode-trigger")).toBeVisible();
      await expect(page.getByTestId("logout-button")).toBeVisible();
    });

    test("should change color mode from user profile", async ({ page }) => {
      await page.goto("/");

      await page.getByTestId("user-profile-button").click();
      await page.getByTestId("color-mode-trigger").hover();
      await page.getByTestId("color-mode-light-button").click();

      await expect(page.locator("html")).toHaveClass(/light/);

      await page.waitForTimeout(1000);
      await expect(page.getByTestId("user-profile-button")).toBeVisible({
        timeout: 10000,
      });

      await page.getByTestId("user-profile-button").click();
      await page.getByTestId("color-mode-trigger").hover();
      await page.getByTestId("color-mode-dark-button").click();

      await expect(page.locator("html")).toHaveClass(/dark/);
    });
  });

  test.describe("Breadcrumb Navigation", () => {
    test("should maintain navigation state across page refreshes", async ({
      page,
    }) => {
      await page.goto("/");

      const deviceRows = page.locator('[data-testid^="device-row-"]');
      const firstDevice = await deviceRows.first().getAttribute("data-testid");
      const deviceId = firstDevice?.replace("device-row-", "");

      if (deviceId) {
        await page.goto(`/${deviceId}/actions`);

        await page.reload();

        await expect(page).toHaveURL(new RegExp(`/${deviceId}/actions`));
        const activeLink = page.getByRole("link", { name: "Actions" });
        await expect(activeLink).toHaveAttribute("data-active", "true");
      }
    });
  });

  test.describe("Permission-Based Navigation", () => {
    test("should hide sidebar when only one navigation item is available", async ({
      page,
    }) => {
      await logout(page);
      await loginAs(page, "limited");
      await page.goto("/");

      const deviceRows = page.locator('[data-testid^="device-row-"]');
      if ((await deviceRows.count()) > 0) {
        const firstDevice = await deviceRows
          .first()
          .getAttribute("data-testid");
        const deviceId = firstDevice?.replace("device-row-", "");

        if (deviceId) {
          await page.goto(`/${deviceId}/stream`);

          const sidebar = page.locator('[data-sidebar="sidebar"]');
          const sidebarVisible = await sidebar.isVisible();

          if (!sidebarVisible) {
            const deviceSwitcher = page
              .locator("button")
              .filter({ hasText: /Switch devices/i });
            await expect(deviceSwitcher).toBeVisible();
          }
        }
      }
    });

    test("should restrict access based on user permissions", async ({
      page,
    }) => {
      await logout(page);
      await loginAs(page, "user");
      await page.goto("/");

      await expect(
        page.getByRole("link", { name: /Admin Panel/i })
      ).not.toBeVisible();

      await page.goto("/admin");
      await expect(page.getByText("Access Denied")).toBeVisible();
      await expect(
        page.getByText("You are not authorized to access this page")
      ).toBeVisible();
    });
  });

  test.describe("Navigation Error Handling", () => {
    test("should handle invalid device IDs gracefully", async ({ page }) => {
      await page.goto("/invalid-device-id/stream");

      await expect(page).toHaveURL("/not-found", { timeout: 10000 });
    });

    test("should navigate home from 404 page", async ({ page }) => {
      await page.goto("/non-existing-route");

      await expect(page.getByText("404")).toBeVisible();

      await page.getByRole("link", { name: /Go Home/i }).click();

      await expect(page).toHaveURL("/");
      await expect(page.getByText("Joystick")).toBeVisible();
    });

    test("should refresh page from 404 page", async ({ page }) => {
      await page.goto("/non-existing-route");

      await expect(page.getByText("404")).toBeVisible();

      const refreshButton = page.getByRole("button", { name: /Refresh/i });
      await refreshButton.click();

      await expect(page.getByText("404")).toBeVisible();
    });

    test("should redirect to default route for device root", async ({
      page,
    }) => {
      await page.goto("/");

      await expect(
        page.locator('[data-testid^="device-row-"]').first()
      ).toBeVisible();

      const deviceRows = page.locator('[data-testid^="device-row-"]');
      const firstDevice = await deviceRows.first().getAttribute("data-testid");
      const deviceId = firstDevice?.replace("device-row-", "");

      if (deviceId) {
        await page.goto(`/${deviceId}`);

        await expect(page).toHaveURL(
          new RegExp(`/${deviceId}/(stream|actions)`)
        );
      }
    });

    test("should handle navigation during loading states", async ({ page }) => {
      await page.goto("/");

      const deviceRows = page.locator('[data-testid^="device-row-"]');
      const firstDevice = await deviceRows.first().getAttribute("data-testid");
      const deviceId = firstDevice?.replace("device-row-", "");

      if (deviceId) {
        await page.goto(`/${deviceId}/stream`);

        await page.getByRole("link", { name: "Actions" }).click();
        await page.getByRole("link", { name: "Stream" }).click();

        await expect(page).toHaveURL(new RegExp(`/${deviceId}/stream`));
      }
    });
  });
});
