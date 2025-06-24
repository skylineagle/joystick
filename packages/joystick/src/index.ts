import { pb } from "@/pocketbase";
import { tryImpersonate } from "@/utils";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import type {
  ActionsResponse,
  DeviceResponse,
  RunResponse,
} from "@joystick/core";
import {
  createAuthPlugin,
  getActiveDeviceConnection,
  runCommandOnDevice,
  RunTargetOptions,
  STREAM_API_URL,
  SWITCHER_API_URL,
} from "@joystick/core";
import { $ } from "bun";
import { Elysia, t } from "elysia";
import { validate } from "jsonschema";
import { enhancedLogger, setupLoggingMiddleware } from "./enhanced-logger";
import {
  addNotificationClient,
  removeNotificationClient,
  sendNotification,
  type SendNotificationRequest,
} from "./notifications";
import { generateRandomCPSIResult, updateStatus } from "./utils";

const app = new Elysia()
  .use(cors())
  .use(
    swagger({
      documentation: {
        info: {
          title: "Joystick API",
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
  .use(createAuthPlugin(pb))
  .use(setupLoggingMiddleware())
  .ws("/notifications", {
    open(ws: any) {
      addNotificationClient(ws);
    },
    close(ws: any) {
      removeNotificationClient(ws);
    },
    message(ws: any, message: any) {
      enhancedLogger.debug(
        { message },
        "Received message from notification client"
      );
    },
  })
  .get("/", () => "Command Runner API")
  .post(
    "/api/run/:device/:action",
    async ({ params, body, set, auth }) => {
      try {
        enhancedLogger.startActionTimer();
        enhancedLogger.info(
          {
            device: params.device,
            action: params.action,
            parameters: body || {},
          },
          "Running command"
        );

        const userId = auth.userId || "system";
        const userName = auth.user?.name || auth.user?.email || "system";
        const userPb =
          auth.isApiKey || auth.isInternal ? pb : await tryImpersonate(userId);

        const result = await userPb
          .collection("devices")
          .getFullList<DeviceResponse>(1, {
            filter: `id = "${params.device}"`,
            expand: "device",
          });

        if (result.length !== 1) {
          throw new Error(`Device ${params.device} not found`);
        }

        const device = result[0];

        const actionResult = await userPb
          .collection("actions")
          .getFullList<ActionsResponse>(1, {
            filter: `name="${params.action}"`,
          });

        if (actionResult.length !== 1) {
          throw new Error(`Action ${params.action} not found`);
        }

        const action = actionResult[0];

        const runResult = await userPb
          .collection("run")
          .getFullList<RunResponse>(1, {
            filter: `action = "${action.id}" && device = "${device.expand?.device.id}"`,
          });

        if (runResult.length === 0) {
          throw new Error(
            `Action ${params.action} not found for device ${device.expand?.device.name}`
          );
        }

        const run = runResult[0];

        if (run.parameters) {
          if (!body) throw new Error("Parameters are required for this action");
          if (!validate(body, run.parameters)) {
            throw new Error("Invalid parameters for this action");
          }
        }

        const defaultParameters = {
          device: params.device,
          mediamtx: STREAM_API_URL,
          switcher: SWITCHER_API_URL,
          ...device.information,
        };
        enhancedLogger.info(
          {
            defaultParameters,
          },
          "Default parameters"
        );
        const command = Object.entries({
          ...body,
          ...defaultParameters,
        }).reduce((acc, [key, value]) => {
          if (acc.includes(`$${key}`)) {
            return acc.replaceAll(`$${key}`, String(value));
          }
          return acc;
        }, run.command);

        const output =
          run.target === RunTargetOptions.device
            ? await runCommandOnDevice(device, command)
            : await $`${{ raw: command }}`.text();

        const response = {
          success: true,
          output,
        };

        if (params.action === "set-mode") {
          await userPb.collection("devices").update(params.device, {
            mode: (body as any)?.mode,
          });
          await updateStatus(params.device);
        }

        enhancedLogger.info(
          {
            user: { name: userName, id: userId },
            device,
            action: params.action,
            success: true,
          },
          "Command executed successfully"
        );

        return response;
      } catch (error) {
        enhancedLogger.error(
          {
            error,
            device: params.device,
            action: params.action,
          },
          "Command execution failed"
        );

        set.status = 500;
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      body: t.Optional(t.Record(t.String(), t.Any())),
    }
  )
  .get("/api/cpsi", () => generateRandomCPSIResult())
  .get("/api/battery", () => {
    const voltage = 3200 + Math.random() * 1300;
    const current = 50 + Math.random() * 450;
    const consumption = Math.random() * 1400;

    return {
      voltage: parseFloat(voltage.toFixed(2)),
      current: parseFloat(current.toFixed(2)),
      power: parseFloat((voltage * current).toFixed(2)),
      consumption: parseFloat(consumption.toFixed(2)),
    };
  })
  .get("/api/gps", () => {
    const baseLat = 37.7749;
    const baseLng = -122.4194;
    const variation = 0.01;
    const latitude = baseLat + (Math.random() * variation * 2 - variation);
    const longitude = baseLng + (Math.random() * variation * 2 - variation);
    const altitude = 10 + Math.random() * 100;

    return {
      latitude: parseFloat(latitude.toFixed(6)),
      longitude: parseFloat(longitude.toFixed(6)),
      altitude: parseFloat(altitude.toFixed(2)),
    };
  })
  .get("/api/imu", () => {
    const now = Date.now();
    const x = Math.sin(now / 2000) * 0.8;
    const y = Math.sin(now / 1500) * 0.6;
    const z = Math.sin(now / 1000) * 0.4 + 1;
    const noise = 0.05;

    return {
      x: parseFloat((x + (Math.random() * noise * 2 - noise)).toFixed(3)),
      y: parseFloat((y + (Math.random() * noise * 2 - noise)).toFixed(3)),
      z: parseFloat((z + (Math.random() * noise * 2 - noise)).toFixed(3)),
    };
  })
  .get("/api/health", () => ({
    status: "healthy",
    service: "joystick",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || "unknown",
  }))
  .get("/api/ping/:device", async ({ params, query }) => {
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

      if (!device || !device.information) {
        return {
          success: false,
          available: false,
          error: "Device not found or device information missing",
        };
      }

      const { host: activeHost } = getActiveDeviceConnection(
        device.information
      );

      if (!activeHost) {
        return {
          success: false,
          available: false,
          error: "Active host not found for device",
        };
      }

      const expectedResult = query?.["result"] ?? "1 packets received";
      const result = await $`ping -c 1 ${activeHost}`.text();
      const isOnline = result.includes(expectedResult);

      return isOnline;
    } catch (error) {
      console.log(error);
      return false;
    }
  })
  .post(
    "/api/notifications/send",
    async ({ body, auth, set }) => {
      try {
        const userId = auth.userId ?? "";
        const userName = auth.user?.name || auth.user?.email || "system";

        const request: SendNotificationRequest = {
          type: body.type || "info",
          title: body.title,
          message: body.message,
          userId: !auth.isSuperuser && userId ? userId : undefined,
          deviceId: body.deviceId,
          dismissible: body.dismissible !== false,
        };

        return await sendNotification(request, userId, userName);
      } catch (error) {
        set.status = 500;
        return {
          error:
            error instanceof Error
              ? error.message
              : "Failed to send notification",
        };
      }
    },
    {
      body: t.Object({
        type: t.Optional(
          t.Union([
            t.Literal("info"),
            t.Literal("success"),
            t.Literal("warning"),
            t.Literal("error"),
            t.Literal("emergency"),
          ])
        ),
        title: t.String(),
        message: t.String(),
        userId: t.Optional(t.String()),
        deviceId: t.Optional(t.String()),
        dismissible: t.Optional(t.Boolean()),
      }),
    }
  )
  .listen(Bun.env.PORT || 8000);

console.log(
  `🦊 Server is running at ${Bun.env.HOST ?? "localhost"}:${
    Bun.env.PORT ?? 8000
  }`
);
