import { testDb } from "../helpers/db-helper";

async function globalSetup() {
  console.log("🚀 Starting global test setup...");

  try {
    // Verify PocketBase connection
    const isConnected = await testDb.verifyConnection();
    if (!isConnected) {
      throw new Error(
        "Cannot connect to PocketBase. Please ensure it is running on localhost:8090"
      );
    }
    console.log("✅ PocketBase connection verified");

    // Authenticate as admin
    await testDb.authenticateAsAdmin();

    // Clean any existing test data first
    console.log("🧹 Cleaning any existing test data...");
    await testDb.cleanupTestData();

    // Seed fresh test data
    await testDb.seedTestData();

    console.log("🎉 Global test setup completed successfully!");
    console.log("\n📋 Test accounts available:");
    console.log("   Admin: test-admin@joystick.io / admin123");
    console.log("   User:  test-user@joystick.io / Aa123456");
    console.log("   Limited: test-limited@joystick.io / limited123\n");
  } catch (error) {
    console.error("❌ Global test setup failed:", error);
    throw error;
  }
}

export default globalSetup;
