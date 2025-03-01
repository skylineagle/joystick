import { MEDIAMTX_API } from "@/config";
import { logger } from "@/logger";
import { pb } from "@/pocketbase";
import type { DeviceResponse } from "@/types/types";
import cors from "@elysiajs/cors";
import { Elysia } from "elysia";

export const TO_REPLACE = ["camera", "action"];

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

app.post("/api/mode/:device/:mode", async ({ params, body }) => {
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

  switch (mode) {
    case "live":
      const addResponse = await fetch(
        `${MEDIAMTX_API}/v3/config/paths/add/${device.configuration?.name}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(device.configuration),
        }
      );
      break;
    case "off":
      const deleteResponse = await fetch(
        `${MEDIAMTX_API}/v3/config/paths/delete/${device.configuration?.name}`,
        {
          method: "DELETE",
        }
      );
      break;
    case "auto":
      const response = await fetch(
        `${MEDIAMTX_API}/v3/config/paths/delete/${device.configuration?.name}`,
        {
          method: "DELETE",
        }
      );
      break;
    default:
      throw new Error("Invalid mode");
  }
});

app.use(cors()).listen(Bun.env.PORT || 8080);
logger.info(
  `🦊 Switcher API server running at ${Bun.env.HOST}:${Bun.env.PORT || 8080}`
);
logger.debug(`MEDIAMTX URL: ${MEDIAMTX_API}`);
