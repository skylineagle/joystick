import { STREAM_API_URL, SWITCHER_API_URL } from "@/config";
import { pb } from "@/pocketbase";
import { type ActionsResponse, RunTargetOptions } from "@/types/db.types";
import type { DeviceResponse, RunResponse } from "@/types/types";
import cors from "@elysiajs/cors";
import { $ } from "bun";
import { Elysia, t } from "elysia";
import { validate } from "jsonschema";
import { enhancedLogger, setupLoggingMiddleware } from "./enhanced-logger";
import { generateRandomCPSIResult, updateStatus } from "./utils";

const app = new Elysia();

// Apply the logging middleware
setupLoggingMiddleware(app);

app.get("/", () => "Command Runner API");

app.post(
  "/api/run/:device/:action",
  async ({ params, body, headers, request }) => {
    try {
      // Start timing the action
      enhancedLogger.startActionTimer();
      enhancedLogger.info(
        {
          device: params.device,
          action: params.action,
          parameters: body || {},
        },
        "Running command"
      );

      // Get the device from PocketBase
      const result = await pb
        .collection("devices")
        .getFullList<DeviceResponse>(1, {
          filter: `id = "${params.device}"`,
          expand: "device",
        });

      if (result.length !== 1)
        throw new Error(`Device ${params.device} not found`);

      const device = result[0];

      // Get the action from PocketBase
      const actionResult = await pb
        .collection("actions")
        .getFullList<ActionsResponse>(1, {
          filter: `name="${params.action}"`,
        });

      if (actionResult.length !== 1)
        throw new Error(`Action ${params.action} not found`);

      const action = actionResult[0];

      // Get the action from PocketBase
      const runResult = await pb.collection("run").getFullList<RunResponse>(1, {
        filter: `action = "${action.id}" && device = "${device.expand?.device.id}"`,
      });

      if (runResult.length === 0)
        throw new Error(
          `Action ${params.action} not found for device ${device.expand?.device.name}`
        );

      const run = runResult[0];

      // Validate parameters if action has a params schema
      if (run.parameters) {
        if (!body) throw new Error("Parameters are required for this action");
        if (!validate(body, run.parameters))
          throw new Error("Invalid parameters for this action");
      }

      // Replace parameters in the command
      const defaultParamters = {
        device: params.device,
        mediamtx: STREAM_API_URL,
        switcher: SWITCHER_API_URL,
        ...device.information,
      };

      enhancedLogger.debug(
        `using those default parameters: ${JSON.stringify(defaultParamters)}`
      );

      const command = Object.entries({ ...body, ...defaultParamters }).reduce(
        (acc, [key, value]) => {
          if (acc.includes(`$${key}`)) {
            return acc.replace(`$${key}`, value);
          }
          return acc;
        },
        run.command
      );

      const output =
        run.target === RunTargetOptions.device
          ? device.information?.password
            ? await $`sshpass -p ${device.information?.password} ssh -o StrictHostKeyChecking=no ${device.information?.user}@${device.information?.host} '${command}'`.text()
            : await $`ssh -o StrictHostKeyChecking=no ${device.information?.user}@${device.information?.host} '${command}'`.text()
          : await $`${{ raw: command }}`.text();

      const response = {
        success: true,
        output,
      };

      await pb.collection("devices").update(params.device, {
        mode: body?.mode,
      });

      await updateStatus(params.device);

      // Get the current user for the action logging
      const authStore = pb.authStore.model;
      const userId = authStore ? authStore.id : "system";

      // Log the action completion using helper function
      await enhancedLogger.logCommandAction({
        userId,
        deviceId: params.device,
        actionId: action.id,
        parameters: body || {},
        result: response,
        success: true,
      });

      enhancedLogger.info(
        {
          device: params.device,
          action: params.action,
          executionTime: enhancedLogger.getExecutionTime(),
        },
        "Command executed successfully"
      );

      return response;
    } catch (error) {
      enhancedLogger.error(
        { error: error instanceof Error ? error.message : String(error) },
        "Error executing command"
      );

      // Get the current user for the action logging
      const authStore = pb.authStore.model;
      const userId = authStore ? authStore.id : "system";

      // If we have action info, log the failed action
      if (params?.device && params?.action) {
        const actionResult = await pb
          .collection("actions")
          .getFullList<ActionsResponse>(1, {
            filter: `name="${params.action}"`,
          });

        if (actionResult.length === 1) {
          await enhancedLogger.logCommandAction({
            userId,
            deviceId: params.device,
            actionId: actionResult[0].id,
            parameters: body || {},
            result: {
              error: error instanceof Error ? error.message : String(error),
            },
            success: false,
          });
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
  {
    body: t.Optional(t.Any()),
  }
);

app.get("/api/cpsi", async () => {
  return generateRandomCPSIResult();
});

app.get("/api/healtcheck", async () => {
  // Log a system heartbeat action
  await enhancedLogger.logSystemAction({
    actionName: "heartbeat",
    details: {
      timestamp: new Date().toISOString(),
      service: "joystick",
    },
  });

  return {
    status: "connected",
    lastConnected: new Date().toISOString(),
  };
});

app.get("/api/ping/:device", async ({ params }) => {
  try {
    if (!params.device) {
      return {
        success: false,
        error: "Device ID is required",
      };
    }

    const device = await pb
      .collection("devices")
      .getOne<DeviceResponse>(params.device);

    if (!device) {
      return {
        success: false,
        available: false,
        error: "Device not found",
      };
    }

    const result = await $`ping -c 1 ${device?.information?.host}`.text();
    const isOnline = result.includes("1 packets received");

    return isOnline;
  } catch (error) {
    return false;
  }
});

app.use(cors()).listen(Bun.env.PORT || 8000);
console.log(`🦊 Server is running at ${Bun.env.HOST}:${Bun.env.PORT}`);
