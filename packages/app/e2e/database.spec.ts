import { test, expect } from "@playwright/test";
import { testDb } from "./helpers/db-helper";
import { TEST_DEVICES, TEST_USERS } from "./helpers/consts";

test.describe("Database Integration", () => {
  test("should connect to database", async () => {
    const isConnected = await testDb.verifyConnection();
    expect(isConnected).toBe(true);
  });

  test("should have seeded test data available", async () => {
    // Verify PocketBase connection
    const isConnected = await testDb.verifyConnection();
    expect(isConnected).toBe(true);

    // Authenticate as admin to query data
    await testDb.authenticateAsAdmin();

    // Verify test users exist
    const pb = testDb.pb;
    const users = await pb.collection("users").getFullList();
    const testEmails = users.map((user) => user.email);

    expect(testEmails).toContain(TEST_USERS.admin.email);
    expect(testEmails).toContain(TEST_USERS.user.email);
    expect(testEmails).toContain(TEST_USERS.limited.email);

    // Verify test devices exist
    const devices = await pb.collection("devices").getFullList();
    const testDeviceNames = devices.map((device) => device.name);

    expect(testDeviceNames).toContain(TEST_DEVICES.device1.name);
    expect(testDeviceNames).toContain(TEST_DEVICES.device2.name);

    console.log("✅ Database integration test passed");
  });
});
