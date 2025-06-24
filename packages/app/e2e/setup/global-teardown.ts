import { testDb } from "../helpers/db-helper";

async function globalTeardown() {
  console.log("🧹 Starting global test teardown...");

  try {
    // Authenticate as admin for cleanup
    await testDb.authenticateAsAdmin();

    // Clean up all test data
    await testDb.cleanupTestData();

    // Disconnect from PocketBase
    await testDb.disconnect();

    console.log("🎉 Global test teardown completed successfully!");
  } catch (error) {
    console.error("❌ Global test teardown failed:", error);
    // Don't throw error in teardown to avoid masking test failures
  }
}

export default globalTeardown;
