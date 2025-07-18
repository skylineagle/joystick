import { pb } from "@/pocketbase";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import type { DeviceResponse } from "@joystick/core";
import { createAuthPlugin, getActiveDeviceConnection } from "@joystick/core";
import Client from "android-sms-gateway";
import { Elysia, t } from "elysia";
import { logger } from "./logger";
import type {
  FetchClient,
  PendingSmsMessage,
  SmsResponse,
  WebhookEvent,
} from "./types";

// In-memory store to track pending SMS messages by phone number
const pendingSmsMessages = new Map<string, PendingSmsMessage>();

const httpFetchClient: FetchClient = {
  get: async (url, headers = {}) => {
    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    return response.json();
  },
  post: async (url, body, headers = {}) => {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    return response.json();
  },
  delete: async (url, headers = {}) => {
    const response = await fetch(url, {
      method: "DELETE",
      headers,
    });

    return response.json();
  },
};

const apiClient = new Client(
  Bun.env.SMS_USER || "sms",
  Bun.env.SMS_KEY || "test",
  httpFetchClient,
  Bun.env.SMS_SERVER_URL || "https://api.sms-gate.app"
);

// Create a Bun server using Elysia
const app = new Elysia()
  .use(
    swagger({
      documentation: {
        info: { title: "Whisper API", version: "0.0.0" },
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
  .post(
    "/api/:device/send-sms",
    async ({ params, body, set, query, auth }) => {
      try {
        const { message } = body;

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

        const { phone: activePhone } = getActiveDeviceConnection(
          device.information
        );

        if (!activePhone) {
          set.status = 400;
          return {
            success: false,
            error: "Device does not have an active phone number",
          };
        }

        if (!message) {
          set.status = 400;
          return { error: "Message is required" };
        }

        try {
          // const result = await apiClient.send({
          //   phoneNumbers: [activePhone],
          //   message,
          // });
          const result = { state: "yay" };
          if (result.state === "Failed") {
            throw new Error("Failed to send SMS");
          }

          await pb.collection("message").create({
            device: params.device,
            direction: "to",
            message,
            phone: activePhone,
            user: auth.userId,
          });

          if ((query?.["response"] ?? "true") === "false") {
            return;
          }

          const phoneKey = activePhone;

          const responsePromise = new Promise<SmsResponse[]>(
            (resolve, reject) => {
              const createTimeout = (isInitial = false) => {
                return setTimeout(
                  () => {
                    const pendingMessage = pendingSmsMessages.get(phoneKey);
                    if (pendingMessage) {
                      pendingSmsMessages.delete(phoneKey);
                      if (pendingMessage.responses.length > 0) {
                        pendingMessage.finalResolve(pendingMessage.responses);
                      } else {
                        reject(new Error("SMS response timeout"));
                      }
                    }
                  },
                  isInitial ? 80000 : 5000
                );
              };

              pendingSmsMessages.set(phoneKey, {
                resolve: (value: SmsResponse) => {
                  const pendingMessage = pendingSmsMessages.get(phoneKey);
                  if (pendingMessage) {
                    clearTimeout(pendingMessage.timeout);
                    pendingMessage.responses.push(value);
                    pendingMessage.timeout = createTimeout(false);
                  }
                },
                reject,
                timeout: createTimeout(true),
                responses: [],
                finalResolve: resolve,
              });
            }
          );

          const responses = await responsePromise;
          return responses?.map((response) => response.message).join("\n");
        } catch (error: unknown) {
          set.status = 500;
          return {
            error: `Failed to send SMS: ${
              error instanceof Error ? error.message : String(error)
            }`,
          };
        }
      } catch (authError) {
        if (
          authError instanceof Error &&
          (authError.message.includes("Authentication") ||
            authError.message.includes("permissions"))
        ) {
          set.status = authError.message.includes("permissions") ? 403 : 401;
          return { success: false, error: authError.message };
        }
        throw authError;
      }
    },
    {
      body: t.Object({
        message: t.String(),
      }),
    }
  )

  .post("/api/receive-sms", async ({ body, set }) => {
    const { event, id, status, payload } = body as WebhookEvent;

    if (event === "sms:received" && payload?.phoneNumber) {
      const pendingMessage = pendingSmsMessages.get(payload.phoneNumber);

      if (pendingMessage) {
        const response: SmsResponse = {
          id: id || "unknown",
          status,
          message: payload?.message,
          timestamp: Date.now(),
        };

        pendingMessage.resolve(response);
        set.status = 200;
      }

      let deviceId;
      try {
        const devices = await pb.collection("devices").getFullList({
          filter: `information.phone='${payload.phoneNumber}' || information.secondSlotPhone='${payload.phoneNumber}'`,
        });

        const activeDevice = devices.find((device) => {
          const { phone } = getActiveDeviceConnection(device.information);

          return phone === payload.phoneNumber;
        });
        logger.debug(activeDevice);

        if (activeDevice && activeDevice.id) {
          deviceId = activeDevice.id;
        }
        logger.debug(deviceId);

        await pb.collection("message").create({
          device: deviceId,
          direction: "from",
          message: payload.message,
          phone: payload.phoneNumber,
        });
      } catch {}

      return { success: true };
    }

    set.status = 200;
    return { success: true };
  })
  // Standard health check endpoint
  .get("/api/health", async () => {
    return {
      status: "healthy",
      service: "whisper",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || "unknown",
    };
  })
  // SMS server health check proxy endpoint
  .get("/api/health/sms", async () => {
    try {
      const smsServerUrl = Bun.env.SMS_SERVER_URL || "https://api.sms-gate.app";
      const response = await fetch(
        `${smsServerUrl}/${
          Bun.env.SMS_SERVER_URL ? "/health" : "3rdparty/v1/health"
        }`
      );

      if (response.status === 200) {
        return {
          status: "healthy",
          service: "sms-server",
          uptime: null, // SMS server doesn't provide this information
          timestamp: new Date().toISOString(),
          smsServerUrl,
          proxyService: "whisper",
        };
      } else {
        return {
          status: "offline",
          service: "sms-server",
          timestamp: new Date().toISOString(),
          error: `SMS server returned status ${response.status}`,
          smsServerUrl,
          proxyService: "whisper",
        };
      }
    } catch (error) {
      logger.error({ error }, "Failed to check SMS server health");
      return {
        status: "offline",
        service: "sms-server",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        smsServerUrl: Bun.env.SMS_SERVER_URL || "https://api.sms-gate.app",
        proxyService: "whisper",
      };
    }
  })
  .listen(Bun.env.PORT || 8081, () =>
    console.log(
      `🚀 SMS Server is running at ${Bun.env.HOST || "localhost"}:${
        Bun.env.PORT || 8081
      }`
    )
  );
