import { logger } from "@/logger";
import { pb } from "@/pocketbase";
import { getDeviceHost } from "@/utils";
import cors from "@elysiajs/cors";
import { cron } from "@elysiajs/cron";
import { swagger } from "@elysiajs/swagger";
import type { DeviceResponse } from "@joystick/core";
import { createAuthPlugin, STREAM_API_URL } from "@joystick/core";
import { Elysia, t } from "elysia";
export const TO_REPLACE = ["camera", "action"];

const SLOT_HEALTH_CHECK_INTERVAL =
  parseInt(Bun.env.SLOT_HEALTH_CHECK_INTERVAL || "30") || 30;

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

async function runSlotCheckAction(
  device: DeviceResponse,
  host: string
): Promise<boolean> {
  try {
    logger.debug(
      `Running slot check action for device [${device.id}] ${device.name} on host ${host}`
    );
    const joystickApiUrl = Bun.env.JOYSTICK_API_URL || "http://localhost:8000";

    const response = await fetch(
      `${joystickApiUrl}/api/run/${device.id}/slot-check`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": Bun.env.JOYSTICK_API_KEY || "dev-api-key-12345",
        },
        body: JSON.stringify({
          host,
        }),
      }
    );

    if (!response.ok) {
      logger.error(
        `Failed to run slot check action for device [${device.id}] ${device.name}: ${response.statusText}`
      );
      return false;
    }

    const result = await response.json();

    if (!result.success) {
      logger.error(
        `Failed to run slot check action for device [${device.id}] ${device.name}: ${result.error}`
      );
      return false;
    }

    return typeof result.output === "boolean"
      ? result.output
      : typeof result.output === "string"
      ? result.output.trim().replace(/\s+/g, "").toLowerCase() === "true"
      : false;
  } catch (error) {
    logger.debug(`Health check failed for ${host}: ${error}`);
    return false;
  }
}

async function checkDeviceHealth(device: DeviceResponse): Promise<void> {
  if (!device.information?.autoSlotSwitch) {
    return;
  }

  const hasSecondSlot = device.information.secondSlotHost;
  if (!hasSecondSlot) {
    logger.warn(
      `Device [${device.id}] ${device.name} has no second slot host but auto slot switch is enabled`
    );
    return;
  }

  const currentSlot = device.information.activeSlot || "primary";
  const currentSlotHealthy = await runSlotCheckAction(
    device,
    getDeviceHost(device, currentSlot) ?? ""
  );

  if (currentSlotHealthy) {
    logger.info(`Device [${device.id}] ${device.name} active slot is healthy`);
    return;
  }

  logger.info(`Device [${device.id}] ${device.name} active slot is unhealthy`);

  const alternateSlot = currentSlot === "primary" ? "secondary" : "primary";
  const alternateSlotHealthy = await runSlotCheckAction(
    device,
    getDeviceHost(device, alternateSlot) ?? ""
  );

  if (alternateSlotHealthy) {
    logger.info(
      `Device [${device.id}] ${device.name} alternate slot is healthy`
    );
    logger.info(
      `Switching device [${device.id}] ${device.name} from ${currentSlot} to ${alternateSlot} slot due to health check failure`
    );

    try {
      await pb.collection("devices").update(device.id, {
        information: {
          ...device.information,
          activeSlot: alternateSlot,
        },
      });

      logger.info(
        `Successfully switched device [${device.id}] ${device.name} to ${alternateSlot} slot`
      );
    } catch (error) {
      logger.error(
        `Failed to switch device [${device.id}] ${device.name} slot: ${error}`
      );
    }
  } else {
    logger.info(
      `Device [${device.id}] ${device.name} active alternate slot is also unhealthy`
    );
  }
}

async function performHealthChecks(): Promise<void> {
  try {
    const devices = await pb.collection("devices").getFullList<DeviceResponse>({
      filter:
        'information.autoSlotSwitch = true && information.secondSlotHost != ""',
    });

    logger.debug(
      `Performing health checks on ${devices.length} devices with auto slot switching enabled`
    );

    const healthCheckPromises = devices.map((device) =>
      checkDeviceHealth(device)
    );
    await Promise.allSettled(healthCheckPromises);
    logger.debug(
      `Finished running health checks on ${devices.length} devices with auto slot switching enabled`
    );
  } catch (error) {
    logger.error("Error during health checks:", error);
  }
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
  .use(
    cron({
      pattern: `*/${SLOT_HEALTH_CHECK_INTERVAL} * * * * *`,
      name: "slot-health-check",
      run: async () => {
        await performHealthChecks();
      },
    })
  )
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
  })
  .post(
    "/api/slot/:device/:slot",
    async ({ params, set }) => {
      try {
        const { device: deviceId, slot } = params;

        const deviceResult = await pb
          .collection("devices")
          .getFullList<DeviceResponse>(1, {
            filter: `id = "${deviceId}"`,
          });

        if (deviceResult.length !== 1) {
          set.status = 404;
          return {
            success: false,
            error: `Device ${deviceId} not found`,
          };
        }

        const device = deviceResult[0];

        if (!device.information) {
          set.status = 400;
          return {
            success: false,
            error: "Device information not found",
          };
        }

        if (slot === "secondary" && !device.information.secondSlotHost) {
          set.status = 400;
          return {
            success: false,
            error: "Secondary slot not configured for this device",
          };
        }

        await pb.collection("devices").update(device.id, {
          information: {
            ...device.information,
            activeSlot: slot,
          },
        });

        logger.info(`Manually switched device ${deviceId} to ${slot} slot`);

        return { success: true, activeSlot: slot };
      } catch (error) {
        set.status = 500;
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      params: t.Object({
        device: t.String(),
        slot: t.Union([t.Literal("primary"), t.Literal("secondary")]),
      }),
    }
  )
  .post("/api/health/check", async () => {
    try {
      await performHealthChecks();
      return { success: true, message: "Health checks completed" };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  })
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
