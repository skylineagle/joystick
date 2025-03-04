import { cors } from "@elysiajs/cors";
import Client from "android-sms-gateway";
import { randomUUIDv7 } from "bun";
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

app.post("/api/send-sms", async ({ body, set, request, query }) => {
  const { phoneNumbers, message } = body as SmsMessage;

  if (!phoneNumbers || !phoneNumbers.length || !message) {
    set.status = 400;
    return { error: "Phone numbers and message are required" };
  }

  try {
    // Send the SMS
    const result = await apiClient.send({ phoneNumbers, message });
    if (result.state === "Failed") {
      throw new Error("Failed to send SMS");
    }

    if ((query?.["response"] ?? "false") === "false") {
      return;
    }

    const phoneKey = phoneNumbers[0];

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
});

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

app.get("/health", () => ({ status: "ok" }));

app
  .use(cors())
  .listen(Bun.env.PORT || 8081, () =>
    console.log(
      `🚀 SMS Server is running at ${app.server?.hostname}:${app.server?.port}`
    )
  );
