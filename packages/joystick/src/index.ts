import { pb } from "@/pocketbase";
import { type ActionsResponse, RunTargetOptions } from "@/types/db.types";
import type { DeviceResponse, RunResponse } from "@/types/types";
import cors from "@elysiajs/cors";
import { $ } from "bun";
import { Elysia, t } from "elysia";
import { validate } from "jsonschema";
import { logger } from "./logger";
import { generateRandomCPSIResult, updateStatus } from "./utils";
import { STREAM_API_URL } from "@/config";

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
  })
  .get("/", () => "Command Runner API");

app.post(
  "/api/run/:device/:action",
  async ({ params, body }) => {
    try {
      logger.info("Running command");

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
          filter: `name = "${params.action}"`,
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
        joystick: "http://localhost:8000",
      };

      const command = Object.entries({ ...body, ...defaultParamters }).reduce(
        (acc, [key, value]) => {
          if (acc.includes(`$${key}`)) {
            return acc.replace(`$${key}`, value);
          }
          return acc;
        },
        run.command
      );

      const output =
        run.target === RunTargetOptions.device
          ? device.information?.password
            ? await $`sshpass -p ${device.information?.password} ssh -o StrictHostKeyChecking=no ${device.information?.user}@${device.information?.host} '${command}'`.text()
            : await $`ssh -o StrictHostKeyChecking=no ${device.information?.user}@${device.information?.host} '${command}'`.text()
          : await $`${{ raw: command }}`.text();

      const response = {
        success: true,
        output,
      };

      await updateStatus(params.device);

      return response;
    } catch (error) {
      logger.error(error);
    }
  },
  {
    body: t.Optional(t.Any()),
  }
);

app.get("/api/cpsi", async () => {
  return generateRandomCPSIResult();
});

app.get("/api/healtcheck", async () => {
  return {
    status: "connected",
    lastConnected: new Date().toISOString(),
  };
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
        `${STREAM_API_URL}/v3/config/paths/add/${device.configuration?.name}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(device.configuration),
        }
      );

      if (!addResponse.ok) {
        throw new Error("Failed to add path");
      }
      break;
    case "off":
      const deleteResponse = await fetch(
        `${STREAM_API_URL}/v3/config/paths/delete/${device.configuration?.name}`,
        {
          method: "DELETE",
        }
      );

      if (!deleteResponse.ok) {
        throw new Error("Failed to delete path");
      }
      break;
    case "auto":
      const response = await fetch(
        `${STREAM_API_URL}/v3/config/paths/delete/${device.configuration?.name}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete path");
      }
      break;
    default:
      throw new Error("Invalid mode");
  }

  await pb.collection("devices").update(deviceId, {
    mode,
  });
});

app.use(cors()).listen(Bun.env.PORT || 8000);
console.log(`🦊 Server is running at ${Bun.env.HOST}:${Bun.env.PORT}`);
