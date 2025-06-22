import { logger } from "@/logger";
import { pb } from "@/pocketbase";
import cors from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import type { DeviceResponse } from "@joystick/core";
import { createAuthPlugin, STREAM_API_URL } from "@joystick/core";
import { Elysia } from "elysia";
export const TO_REPLACE = ["camera", "action"];

async function addDevice(deviceName: string, configuration: any) {
  await fetch(`${STREAM_API_URL}/v3/config/paths/add/${deviceName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(configuration),
  });
}

async function deleteDevice(deviceName: string) {
  await fetch(`${STREAM_API_URL}/v3/config/paths/delete/${deviceName}`, {
    method: "DELETE",
  });
}

async function initializeDevices() {
  try {
    const devices = await pb
      .collection("devices")
      .getFullList<DeviceResponse>();

    logger.info(`Found ${devices.length} devices`);
    for (const device of devices) {
      if (device.mode === "live") {
        if (!device.configuration?.name) {
          throw new Error("Device name not found, cant initialize device");
        }
        await addDevice(device.configuration?.name, device.configuration);
        logger.info(`Initialized device ${device.configuration?.name}`);
      }
    }

    logger.info("All devices initialized successfully");
  } catch (error) {
    logger.error(error);
    logger.error("Failed to initialize devices", error);
    throw error;
  }
}

const app = new Elysia()
  .use(
    swagger({
      documentation: {
        info: {
          title: "Switcher API",
          version: "0.0.0",
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
            apiKey: {
              type: "apiKey",
              in: "header",
              name: "X-API-Key",
            },
          },
        },
        security: [{ bearerAuth: [] }, { apiKey: [] }],
      },
    })
  )
  .use(cors())
  .use(createAuthPlugin(pb, Bun.env.JWT_SECRET))
  .onError(({ code, error, request }) => {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error({ code, error, path: request.url }, "Request error occurred");
    return { success: false, error: errorMessage };
  })
  .onRequest(({ request }) => {
    logger.info(
      { method: request.method, path: request.url },
      "Incoming request"
    );
  })
  .post("/api/mode/:device/:mode", async ({ params, set }) => {
    try {
      const { device: deviceId, mode } = params;

      const deviceResult = await pb
        .collection("devices")
        .getFullList<DeviceResponse>(1, {
          filter: `id = "${deviceId}"`,
        });

      if (deviceResult.length !== 1) {
        throw new Error(`Device ${deviceId} not found`);
      }

      const device = deviceResult[0];

      if (!device.configuration?.name) {
        throw new Error("Device name not found");
      }

      switch (mode) {
        case "live":
          addDevice(device.configuration?.name, device.configuration);
          break;
        case "off":
          deleteDevice(device.configuration?.name);
          break;
        case "auto":
          deleteDevice(device.configuration?.name);
          break;
        default:
          throw new Error("Invalid mode");
      }

      return { success: true };
    } catch (error) {
      set.status = 401;
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }) // Standard health check endpoint
  .get("/api/health", async () => {
    return {
      status: "healthy",
      service: "switcher",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || "unknown",
    };
  })
  .listen(Bun.env.PORT || 8080);

logger.info(
  `🦊 Switcher API server running at ${Bun.env.HOST}:${Bun.env.PORT || 8080}`
);

try {
  await initializeDevices();
} catch (error) {
  logger.error("Failed to initialize devices", error);
  throw error;
}
