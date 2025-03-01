import { cors } from "@elysiajs/cors";
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
  Bun.env.user || "2QI3ID",
  Bun.env.key || "9ajhrt8g4_a-q3",
  httpFetchClient
);

// Create a Bun server using Elysia
const app = new Elysia()
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

app.post("/api/send-sms", async ({ body, set }) => {
  const { phoneNumbers, message } = body as SmsMessage;

  if (!phoneNumbers || !phoneNumbers.length || !message) {
    set.status = 400;
    return { error: "Phone numbers and message are required" };
  }

  try {
    // Send the SMS
    const result = await apiClient.send({ phoneNumbers, message });
    logger.info(`result ${JSON.stringify(result)}`);
    const messageId = result.id;
    logger.info(`messageId ${messageId}`);

    const phoneKey = phoneNumbers[0];

    const responsePromise = new Promise<SmsResponse>((resolve, reject) => {
      const timeout = setTimeout(() => {
        pendingSmsMessages.delete(phoneKey);
        reject(new Error("SMS response timeout"));
      }, 80000);

      pendingSmsMessages.set(phoneKey, {
        resolve,
        reject,
        timeout,
      });
    });

    const response = await responsePromise;
    return response;
  } catch (error: unknown) {
    set.status = 500;
    return {
      error: `Failed to send SMS: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
});

app.post("/api/receive-sms", ({ body, set }) => {
  const { event, id, status, payload } = body as WebhookEvent;

  if (event === "sms:received" && payload?.phoneNumber) {
    const pendingMessage = pendingSmsMessages.get(payload.phoneNumber);

    if (pendingMessage) {
      const { resolve, timeout } = pendingMessage;

      clearTimeout(timeout);
      pendingSmsMessages.delete(payload.phoneNumber);

      const response: SmsResponse = {
        id: id || "unknown",
        status,
        message: payload?.message,
        timestamp: Date.now(),
      };

      resolve(response);
      set.status = 200;
      return { success: true };
    }
  }

  set.status = 200;
  return { success: true };
});

app.get("/health", () => ({ status: "ok" }));

app
  .use(cors())
  .listen(Bun.env.PORT || 1234, () =>
    console.log(
      `🚀 SMS Server is running at ${app.server?.hostname}:${app.server?.port}`
    )
  );
