import { type TypedPocketBase } from "@joystick/core";
import PocketBase from "pocketbase";
import {
  TEST_USERS,
  TEST_MODELS,
  TEST_DEVICES,
  TEST_ACTIONS,
  TEST_RUN,
  TEST_PERMISSIONS,
} from "./consts";

interface TestDataIds {
  users: string[];
  models: string[];
  devices: string[];
  actions: string[];
  runs: string[];
  permissions: string[];
}

export class TestDatabaseHelper {
  public pb: TypedPocketBase;
  private baseUrl: string;
  private testDataIds: TestDataIds = {
    users: [],
    models: [],
    devices: [],
    actions: [],
    runs: [],
    permissions: [],
  };

  constructor() {
    this.baseUrl = "http://localhost:8090";
    this.pb = new PocketBase(this.baseUrl) as TypedPocketBase;
  }

  async authenticateAsAdmin() {
    try {
      await this.pb
        .collection("_superusers")
        .authWithPassword("admin@joystick.io", "Aa123456");
      console.log("✅ Authenticated as admin for test setup");
    } catch (error) {
      console.error("❌ Failed to authenticate as admin:", error);
      throw new Error(
        "Cannot authenticate with PocketBase admin. Please ensure PocketBase is running and admin credentials are correct."
      );
    }
  }

  async seedTestData(): Promise<TestDataIds> {
    console.log("🌱 Seeding test data...");

    try {
      console.log("👥 Creating test users...");
      for (const userData of Object.values(TEST_USERS)) {
        try {
          const user = await this.pb.collection("users").create({
            id: userData.id,
            email: userData.email,
            password: userData.password,
            passwordConfirm: userData.passwordConfirm,
            verified: userData.verified,
          });
          this.testDataIds.users.push(user.id);
          console.log(`   ✅ Created user: ${userData.email}`);
        } catch (error: unknown) {
          if (
            error instanceof Error &&
            error.message.includes("already exists")
          ) {
            console.log(
              `   ⚠️  User ${userData.email} already exists, skipping`
            );
            try {
              const existingUser = await this.pb
                .collection("users")
                .getFirstListItem(`email="${userData.email}"`);
              this.testDataIds.users.push(existingUser.id);
            } catch (error) {
              // Ignore if we can't find existing user
              console.log(error);
              throw error;
            }
          } else {
            console.log(
              `   ❌ Failed to create user ${userData.email}:`,
              error instanceof Error ? error.message : "Unknown error"
            );
            throw error;
          }
        }
      }

      console.log("📱 Creating test models...");
      for (const modelData of Object.values(TEST_MODELS)) {
        try {
          const model = await this.pb.collection("models").create(modelData);
          this.testDataIds.models.push(model.id);
          console.log(`   ✅ Created model: ${modelData.name}`);
        } catch (error: unknown) {
          if (
            error instanceof Error &&
            error.message.includes("already exists")
          ) {
            console.log(
              `   ⚠️  Model ${modelData.name} already exists, skipping`
            );
            try {
              const existingModel = await this.pb
                .collection("models")
                .getFirstListItem(`id="${modelData.id}"`);
              this.testDataIds.models.push(existingModel.id);
            } catch {
              // Ignore if we can't find existing model
            }
          } else {
            console.log(
              `   ❌ Failed to create model ${modelData.name}:`,
              error instanceof Error ? error.message : "Unknown error"
            );
            throw error;
          }
        }
      }

      console.log("🖥️  Creating test devices...");
      for (const deviceData of Object.values(TEST_DEVICES)) {
        try {
          const device = await this.pb.collection("devices").create(deviceData);
          this.testDataIds.devices.push(device.id);
          console.log(`   ✅ Created device: ${deviceData.name}`);
        } catch (error: unknown) {
          if (
            error instanceof Error &&
            error.message.includes("already exists")
          ) {
            console.log(
              `   ⚠️  Device ${deviceData.name} already exists, skipping`
            );
            try {
              const existingDevice = await this.pb
                .collection("devices")
                .getFirstListItem(`id="${deviceData.id}"`);
              this.testDataIds.devices.push(existingDevice.id);
            } catch {
              // Ignore if we can't find existing device
            }
          } else {
            console.log(
              `   ❌ Failed to create device ${deviceData.name}:`,
              error instanceof Error ? error.message : "Unknown error"
            );
            throw error;
          }
        }
      }

      console.log("⚡ Creating test actions...");
      for (const actionData of Object.values(TEST_ACTIONS)) {
        try {
          const action = await this.pb.collection("actions").create(actionData);
          this.testDataIds.actions.push(action.id);
          console.log(`   ✅ Created action: ${actionData.name}`);
        } catch (error: unknown) {
          if (
            error instanceof Error &&
            error.message.includes("already exists")
          ) {
            console.log(
              `   ⚠️  Action ${actionData.name} already exists, skipping`
            );
            try {
              const existingAction = await this.pb
                .collection("actions")
                .getFirstListItem(`id="${actionData.id}"`);
              this.testDataIds.actions.push(existingAction.id);
            } catch {
              // Ignore if we can't find existing action
            }
          } else {
            console.log(
              `   ❌ Failed to create action ${actionData.name}:`,
              error instanceof Error ? error.message : "Unknown error"
            );
            throw error;
          }
        }
      }

      console.log("🏃 Creating test runs...");
      for (const runData of Object.values(TEST_RUN)) {
        try {
          const run = await this.pb.collection("run").create(runData);
          this.testDataIds.runs.push(run.id);
          console.log(`   ✅ Created run: ${runData.id}`);
        } catch (error: unknown) {
          if (
            error instanceof Error &&
            error.message.includes("already exists")
          ) {
            console.log(`   ⚠️  Run ${runData.id} already exists, skipping`);
            try {
              const existingRun = await this.pb
                .collection("run")
                .getFirstListItem(`id="${runData.id}"`);
              this.testDataIds.runs.push(existingRun.id);
            } catch {
              // Ignore if we can't find existing run
            }
          } else {
            console.log(
              `   ❌ Failed to create run ${runData.id}:`,
              error instanceof Error ? error.message : "Unknown error"
            );
            throw error;
          }
        }
      }

      console.log("🔐 Creating test permissions...");
      for (const permissionData of Object.values(TEST_PERMISSIONS)) {
        try {
          const permission = await this.pb
            .collection("permissions")
            .create(permissionData);
          this.testDataIds.permissions.push(permission.id);
          console.log(`   ✅ Created permission: ${permissionData.name}`);
        } catch (error) {
          if (
            error instanceof Error &&
            error.message.includes("already exists")
          ) {
            console.log(
              `   ⚠️  Permission ${permissionData.name} already exists, skipping`
            );
            try {
              const existingPermission = await this.pb
                .collection("permissions")
                .getFirstListItem(`name="${permissionData.name}"`);
              this.testDataIds.permissions.push(existingPermission.id);
            } catch {
              // Ignore if we can't find existing permission
            }
          } else {
            console.log(
              `   ❌ Failed to create permission ${permissionData.name}:`,
              error instanceof Error ? error.message : "Unknown error"
            );
            throw error;
          }
        }
      }

      console.log("🎉 Test data seeding completed successfully!");
      return this.testDataIds;
    } catch (error) {
      console.error("❌ Failed to seed test data:", error);
      throw error;
    }
  }

  async cleanupTestData(): Promise<void> {
    console.log("🧹 Cleaning up test data...");
    console.log(this.testDataIds);
    try {
      for (const id of this.testDataIds.permissions) {
        try {
          await this.pb.collection("permissions").delete(id);
          console.log(`   ✅ Deleted permission: ${id}`);
        } catch (error: unknown) {
          if (error instanceof Error && error.message.includes("not found")) {
            console.log(
              `   ⚠️  Could not delete permission ${id}:`,
              error?.message
            );
          }
        }
      }

      for (const id of this.testDataIds.runs) {
        try {
          await this.pb.collection("run").delete(id);
          console.log(`   ✅ Deleted run: ${id}`);
        } catch (error: unknown) {
          if (error instanceof Error && error.message.includes("not found")) {
            console.log(
              `   ⚠️  Could not delete run ${id}:`,
              error instanceof Error ? error.message : "Unknown error"
            );
          }
        }
      }

      for (const id of this.testDataIds.actions) {
        try {
          await this.pb.collection("actions").delete(id);
          console.log(`   ✅ Deleted action: ${id}`);
        } catch (error: unknown) {
          if (error instanceof Error && error.message.includes("not found")) {
            console.log(
              `   ⚠️  Could not delete action ${id}:`,
              error instanceof Error ? error.message : "Unknown error"
            );
          }
        }
      }

      for (const id of this.testDataIds.devices) {
        try {
          await this.pb.collection("devices").delete(id);
          console.log(`   ✅ Deleted device: ${id}`);
        } catch (error: unknown) {
          if (error instanceof Error && error.message.includes("not found")) {
            console.log(
              `   ⚠️  Could not delete device ${id}:`,
              error instanceof Error ? error.message : "Unknown error"
            );
          }
        }
      }

      for (const id of this.testDataIds.models) {
        try {
          await this.pb.collection("models").delete(id);
          console.log(`   ✅ Deleted model: ${id}`);
        } catch (error: unknown) {
          if (error instanceof Error && error.message.includes("not found")) {
            console.log(
              `   ⚠️  Could not delete model ${id}:`,
              error instanceof Error ? error.message : "Unknown error"
            );
          }
        }
      }

      for (const id of this.testDataIds.users) {
        try {
          await this.pb.collection("users").delete(id);
          console.log(`   ✅ Deleted user: ${id}`);
        } catch (error: unknown) {
          if (error instanceof Error && error.message.includes("not found")) {
            console.log(
              `   ⚠️  Could not delete user ${id}:`,
              error instanceof Error ? error.message : "Unknown error"
            );
          }
        }
      }

      console.log("🎉 Test data cleanup completed!");

      this.testDataIds = {
        users: [],
        models: [],
        devices: [],
        actions: [],
        runs: [],
        permissions: [],
      };
    } catch (error) {
      console.error("❌ Failed to cleanup test data:", error);
      throw error;
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.pb.health.check();
      return true;
    } catch {
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.pb.authStore.clear();
  }
}

export const testDb = new TestDatabaseHelper();
