import { pb } from "@/pocketbase";
import { sendMessage } from "@/rut.utils";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import {
  createAuthPlugin,
  type DeviceResponse,
  getActiveDeviceConnection,
} from "@joystick/core";
import { Elysia, t } from "elysia";
import { logger } from "./logger";
import type {
  AndroidSmsGatewayEvent,
  PendingSmsMessage,
  SmsResponse,
  WebhookEvent,
} from "./types";

// In-memory store to track pending SMS messages by phone number
const pendingSmsMessages = new Map<string, PendingSmsMessage>();

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
  // Unauthenticated endpoint for receiving SMS
  .post("/api/receive-sms", async ({ body: rawBody, set }) => {
    const body = rawBody as WebhookEvent;
    const event = body.event;
    const message =
      "message" in body
        ? body.message
        : (body as AndroidSmsGatewayEvent).payload?.message;
    const phoneNumber =
      "phoneNumber" in body
        ? body.phoneNumber
        : (body as AndroidSmsGatewayEvent).payload?.phoneNumber;
    const status = "status" in body && body.status;
    const id = "id" in body && body.id;

    if (event === "sms:received" && phoneNumber) {
      const pendingMessage = pendingSmsMessages.get(phoneNumber);

      if (pendingMessage) {
        const response: SmsResponse = {
          id: id || "unknown",
          status: status || "unknown",
          message,
          timestamp: Date.now(),
        };

        pendingMessage.resolve(response);
        set.status = 200;
      }

      let deviceId;
      try {
        const devices = await pb.collection("devices").getFullList({
          filter: `information.phone='${phoneNumber}' || information.secondSlotPhone='${phoneNumber}'`,
        });

        const activeDevice = devices.find((device) => {
          const { phone } = getActiveDeviceConnection(device.information);

          return phone === phoneNumber;
        });

        if (activeDevice && activeDevice.id) {
          deviceId = activeDevice.id;
        }

        await pb.collection("message").create({
          device: deviceId,
          direction: "from",
          message,
          phone: phoneNumber,
        });

        if (Bun.env.ENABLE_SLOT_SYNC === "true" && deviceId) {
          try {
            const device = await pb
              .collection("devices")
              .getOne<DeviceResponse>(deviceId);
            const deviceInfo = device.information;

            if (deviceInfo) {
              let newActiveSlot = deviceInfo.activeSlot || "primary";

              if (
                phoneNumber === deviceInfo.phone &&
                deviceInfo.activeSlot !== "primary"
              ) {
                newActiveSlot = "primary";
              } else if (
                phoneNumber === deviceInfo.secondSlotPhone &&
                deviceInfo.activeSlot !== "secondary"
              ) {
                newActiveSlot = "secondary";
              }

              if (newActiveSlot !== deviceInfo.activeSlot) {
                await pb.collection("devices").update(deviceId, {
                  information: {
                    ...deviceInfo,
                    activeSlot: newActiveSlot,
                  },
                });
              }
            }
          } catch (error) {
            logger.error("Failed to sync device slot:", error);
          }
        }
      } catch {}

      return { success: true };
    }

    set.status = 200;
    return { success: true };
  })
  // Authenticated group for all other endpoints
  .group("/api", (app) =>
    app
      .use(createAuthPlugin(pb, Bun.env.JWT_SECRET))
      .post(
        "/:device/send-sms",
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

            if (!message) {
              set.status = 400;
              return { error: "Message is required" };
            }

            logger.info(JSON.stringify(body));

            try {
              if (body?.slot === "both") {
                await sendMessage(device.information.phone, message);
                await sendMessage(device.information.secondSlotPhone, message);
              } else {
                await sendMessage(
                  body?.slot === "secondary"
                    ? device.information.secondSlotPhone
                    : device.information.phone,
                  message
                );
              }

              await pb.collection("message").create({
                device: params.device,
                direction: "to",
                message,
                phone:
                  body?.slot === "both"
                    ? -1
                    : body?.slot === "secondary"
                    ? device.information.secondSlotPhone
                    : device.information.phone,
                user: auth.userId,
              });

              if ((query?.["response"] ?? "true") === "false") {
                return;
              }

              const phoneKey =
                body?.slot === "both"
                  ? -1
                  : body?.slot === "secondary"
                  ? device.information.secondSlotPhone
                  : device.information.phone;

              const responsePromise = new Promise<SmsResponse[]>(
                (resolve, reject) => {
                  const createTimeout = (isInitial = false) => {
                    return setTimeout(
                      () => {
                        const pendingMessage = pendingSmsMessages.get(phoneKey);
                        if (pendingMessage) {
                          pendingSmsMessages.delete(phoneKey);
                          if (pendingMessage.responses.length > 0) {
                            pendingMessage.finalResolve(
                              pendingMessage.responses
                            );
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
              set.status = authError.message.includes("permissions")
                ? 403
                : 401;
              return { success: false, error: authError.message };
            }
            throw authError;
          }
        },
        {
          body: t.Object({
            message: t.String(),
            slot: t.Optional(
              t.Union([
                t.Literal("primary"),
                t.Literal("secondary"),
                t.Literal("both"),
              ])
            ),
          }),
        }
      )
      // Standard health check endpoint
      .get("/health", async () => {
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
      .get("/health/sms", async () => {
        try {
          const smsServerUrl =
            Bun.env.SMS_SERVER_URL || "https://api.sms-gate.app";
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
  )
  .listen(Bun.env.PORT || 8081, () =>
    console.log(
      `🚀 SMS Server is running at ${Bun.env.HOST || "localhost"}:${
        Bun.env.PORT || 8081
      }`
    )
  );
