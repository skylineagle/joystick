import { pb } from "@/pocketbase";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import type { DeviceResponse } from "@joystick/core";
import Client from "android-sms-gateway";
import { Elysia } from "elysia";
import { logger } from "./logger";
import type {
  FetchClient,
  PendingSmsMessage,
  SmsMessage,
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
      },
    })
  )
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
  });

app.post(
  "/api/:device/send-sms",
  async ({ params, body, set, request, query }) => {
    const { message } = body as SmsMessage;

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

    if (!device.information?.phone) {
      set.status = 400;
      return {
        success: false,
        error: "Device does not have a phone number",
      };
    }

    if (!message) {
      set.status = 400;
      return { error: "Message is required" };
    }

    try {
      // Send the SMS
      const result = await apiClient.send({
        phoneNumbers: [device.information.phone],
        message,
      });
      if (result.state === "Failed") {
        throw new Error("Failed to send SMS");
      }

      if ((query?.["response"] ?? "true") === "false") {
        return;
      }

      const phoneKey = device.information.phone;

      const responsePromise = new Promise<SmsResponse[]>((resolve, reject) => {
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
          ); // 80 seconds for initial timeout, 5 seconds for subsequent timeouts
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
          timeout: createTimeout(true), // Initial timeout
          responses: [],
          finalResolve: resolve,
        });
      });

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
  }
);

app.post("/api/receive-sms", ({ body, set }) => {
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

      // Call the resolve function which will handle adding the response and resetting the timeout
      pendingMessage.resolve(response);

      set.status = 200;
      return { success: true };
    }
  }

  set.status = 200;
  return { success: true };
});

// Standard health check endpoint
app.get("/api/health", async () => {
  return {
    status: "healthy",
    service: "whisper",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || "unknown",
  };
});

// SMS server health check proxy endpoint
app.get("/api/health/sms", async () => {
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
});

app
  .use(cors())
  .listen(Bun.env.PORT || 8081, () =>
    console.log(
      `🚀 SMS Server is running at ${app.server?.hostname}:${app.server?.port}`
    )
  );
