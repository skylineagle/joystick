import { STREAM_API_URL, SWITCHER_API_URL } from "@/config";
import { pb } from "@/pocketbase";
import { runCommandOnDevice } from "@/ssh";
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
            return acc.replaceAll(`$${key}`, value.toString());
          }
          return acc;
        },
        run.command
      );

      const output =
        run.target === RunTargetOptions.device
          ? await runCommandOnDevice(device, command)
          : await $`${{ raw: command }}`.text();
      // run.target === RunTargetOptions.device
      //   ? device.information?.password
      //     ? await $`sshpass -p ${device.information?.password} ssh -o StrictHostKeyChecking=no ${device.information?.user}@${device.information?.host} '${command}'`.text()
      //     : await $`ssh -o StrictHostKeyChecking=no ${device.information?.user}@${device.information?.host} '${command}'`.text()
      //   : await $`${{ raw: command }}`.text();

      const response = {
        success: true,
        output,
      };

      if (params.action === "set-mode") {
        enhancedLogger.info("set-mode");
        await pb.collection("devices").update(params.device, {
          mode: body?.mode,
        });
        await updateStatus(params.device);
      }

      const userId = headers["x-user-id"] ?? "system";

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
      const errorMessage =
        error instanceof Error && error.name === "ShellError"
          ? (error as unknown as { stderr: string }).stderr
          : error instanceof Error
          ? error.message
          : String(error);

      enhancedLogger.error(
        {
          error: errorMessage,
        },
        "Error executing command"
      );

      const userId = headers["x-user-id"] ?? "system";

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
              error: errorMessage,
            },
            success: false,
          });
        }
      }

      return {
        success: false,
        error: errorMessage,
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

// Battery status endpoint that returns random battery data
app.get("/api/battery", async () => {
  // Generate random battery values within realistic ranges
  const voltage = 3200 + Math.random() * 1300; // Between 3200mV and 4500mV
  const current = 50 + Math.random() * 450; // Between 50mA and 500mA
  const consumption = Math.random() * 1400; // Between 0 and 1400mAh
  // Calculate power in milliwatts (voltage in V * current in mA = power in mW)
  const power = (voltage * current).toFixed(2);

  return {
    voltage: parseFloat(voltage.toFixed(2)),
    current: parseFloat(current.toFixed(2)),
    power: parseFloat((voltage * current).toFixed(2)),
    consumption: parseFloat(consumption.toFixed(2)),
  };
});

// GPS status endpoint that returns random GPS data
app.get("/api/gps", async () => {
  // Generate random GPS coordinates within realistic ranges
  // Base coordinates (can be adjusted to any desired location)
  const baseLat = 37.7749; // Example: San Francisco latitude
  const baseLng = -122.4194; // Example: San Francisco longitude

  // Add small random variations to simulate movement or GPS accuracy
  const variation = 0.01; // Approximately 1km of variation
  const latitude = baseLat + (Math.random() * variation * 2 - variation);
  const longitude = baseLng + (Math.random() * variation * 2 - variation);

  // Generate random altitude
  const altitude = 10 + Math.random() * 100; // Between 10 and 110 meters

  return {
    latitude: parseFloat(latitude.toFixed(6)),
    longitude: parseFloat(longitude.toFixed(6)),
    altitude: parseFloat(altitude.toFixed(2)),
  };
});

app.get("/api/imu", async () => {
  // Generate more realistic IMU data that simulates gentle movement
  // Values typically range from -2 to 2 for accelerometer data
  const now = Date.now();

  // Create smooth sinusoidal motion with different frequencies
  const x = Math.sin(now / 2000) * 0.8; // Slower x-axis movement
  const y = Math.sin(now / 1500) * 0.6; // Medium y-axis movement
  const z = Math.sin(now / 1000) * 0.4 + 1; // Faster z-axis movement with offset (gravity)

  // Add some small random noise to make it more realistic
  const noise = 0.05;

  return {
    x: parseFloat((x + (Math.random() * noise * 2 - noise)).toFixed(3)),
    y: parseFloat((y + (Math.random() * noise * 2 - noise)).toFixed(3)),
    z: parseFloat((z + (Math.random() * noise * 2 - noise)).toFixed(3)),
  };
});

// Standard health check endpoint
app.get("/api/health", async () => {
  return {
    status: "healthy",
    service: "joystick",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || "unknown",
  };
});

app.get("/api/ping/:device", async ({ params, query }) => {
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

    const expectedResult = query?.["result"] ?? "1 packets received";
    const result = await $`ping -c 1 ${device?.information?.host}`.text();
    const isOnline = result.includes(expectedResult);

    return isOnline;
  } catch (error) {
    return false;
  }
});

app.use(cors()).listen(Bun.env.PORT || 8000);
console.log(
  `🦊 Server is running at ${Bun.env.HOST ?? "localhost"}:${
    Bun.env.PORT ?? 8000
  }`
);
