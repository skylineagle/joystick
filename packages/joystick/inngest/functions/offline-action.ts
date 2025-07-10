import { inngest } from "../client";
import { pb } from "@/pocketbase";
import {
  getActiveDeviceConnection,
  runCommandOnDevice,
  RunTargetOptions,
} from "@joystick/core";
import type { DeviceResponse, RunResponse } from "@joystick/core";
import { $ } from "bun";

type OfflineActionPayload = {
  deviceId: string;
  action: string;
  params?: Record<string, unknown>;
  ttl?: number; // in seconds, undefined means infinite
};

export default inngest.createFunction(
  { id: "offline-action" },
  { event: "device/offline.action" },
  async ({ event, step, logger }) => {
    const { deviceId, action, params, ttl } =
      event.data as OfflineActionPayload;

    // Step 1: Get device and action details
    const device = await step.run("get-device", async () => {
      const result = await pb
        .collection("devices")
        .getFullList<DeviceResponse>(1, {
          filter: `id = "${deviceId}"`,
          expand: "device",
        });

      if (result.length === 0) {
        throw new Error(`Device ${deviceId} not found`);
      }

      return result[0];
    });

    // Step 2: Get run configuration
    const run = await step.run("get-run", async () => {
      const result = await pb.collection("run").getFullList<RunResponse>(1, {
        filter: `action.name = "${action}" && device = "${device.expand?.device.id}"`,
      });

      if (result.length === 0) {
        throw new Error(
          `Action ${action} not found for device ${device.expand?.device.name}`
        );
      }

      return result[0];
    });

    // Step 3: Get healthcheck run configuration
    const healthcheckRun = await step.run("get-healthcheck-run", async () => {
      const result = await pb.collection("run").getFullList<RunResponse>(1, {
        filter: `action.name = "healthcheck" && device = "${device.expand?.device.id}"`,
      });

      if (result.length === 0) {
        throw new Error(
          `Healthcheck action not found for device ${device.expand?.device.name}`
        );
      }

      return result[0];
    });

    // Step 4: Wait for device to be online
    await step.run("wait-for-device", async () => {
      const startTime = Date.now();
      const maxWaitTime = ttl ? ttl * 1000 : Infinity; // Convert TTL to milliseconds

      // Build healthcheck command with parameters
      const defaultParameters = {
        device: deviceId,
        ...device.information,
      };

      const healthcheckCommand = Object.entries({
        ...defaultParameters,
        ...params,
      }).reduce((acc, [key, value]) => {
        if (acc.includes(`$${key}`)) {
          return acc.replaceAll(`$${key}`, String(value));
        }
        return acc;
      }, healthcheckRun.command);

      while (true) {
        try {
          // Run healthcheck based on target
          const result =
            healthcheckRun.target === RunTargetOptions.device
              ? await runCommandOnDevice(device, healthcheckCommand)
              : await $`${{ raw: healthcheckCommand }}`.text();

          if (
            typeof result === "string"
              ? result.replace("\n", "") === "true"
              : result
          ) {
            logger.info(`Device ${device.name} is online`);
            return;
          }
        } catch (error) {
          logger.error(error);
          logger.debug(`Device ${device.name} is offline, retrying...`);
        }

        // Check if we've exceeded TTL
        if (Date.now() - startTime > maxWaitTime) {
          throw new Error(
            `Timeout waiting for device ${device.name} to be online`
          );
        }

        // Wait before next attempt
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    });

    // Step 5: Run the actual action
    return await step.run("run-action", async () => {
      // Build command with parameters
      const defaultParameters = {
        device: deviceId,
        ...device.information,
      };

      const command = Object.entries({
        ...defaultParameters,
        ...params,
      }).reduce((acc, [key, value]) => {
        if (acc.includes(`$${key}`)) {
          return acc.replaceAll(`$${key}`, String(value));
        }
        return acc;
      }, run.command);

      logger.info(`Running command: ${command}`);

      // Execute command based on target
      const result =
        run.target === RunTargetOptions.device
          ? await runCommandOnDevice(device, command)
          : await $`${{ raw: command }}`.text();

      return { success: true, output: result };
    });
  }
);
