import {
  ActionsResponse,
  RunTargetOptions,
  TypedPocketBase,
} from "@/types/db.types";
import { ParamNode } from "@/types/params";
import { DeviceWithModel } from "@/types/types";
import cors from "@elysiajs/cors";
import { $ } from "bun";
import { Elysia, t } from "elysia";
import { validate } from "jsonschema";
import PocketBase from "pocketbase";
import { logger } from "./logger";

const pb = new PocketBase(Bun.env.POCKETBASE_URL) as TypedPocketBase;

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

app
  .get("/", () => "Command Runner API")
  .post(
    "/api/run/:device/:action",
    async ({ params, body }) => {
      try {
        logger.info("Running command");

        // Get the device from PocketBase
        const result = await pb
          .collection("devices")
          .getFullList<DeviceWithModel>(1, {
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
        const actionParams = action.params as ParamNode | undefined;

        // Validate parameters if action has a params schema
        if (actionParams) {
          if (!body) throw new Error("Parameters are required for this action");
          if (!validate(body, actionParams))
            throw new Error("Invalid parameters for this action");
        }

        // Get the action from PocketBase
        const runResult = await pb.collection("run").getFullList(1, {
          filter: `action = "${action.id}" && device = "${device.expand?.device.id}"`,
        });

        if (runResult.length === 0)
          throw new Error(
            `Action ${params.action} not found for device ${device.expand?.device.name}`
          );

        const run = runResult[0];

        const command = Object.entries(body ?? {}).reduce(
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
            ? device.configuration?.password
              ? await $`sshpass -p ${device.configuration?.password} ssh -o StrictHostKeyChecking=no ${device.configuration?.user}@${device.configuration?.host} '${command}'`.text()
              : await $`ssh -o StrictHostKeyChecking=no ${device.configuration?.user}@${device.configuration?.host} '${command}'`.text()
            : await $`${{ raw: command }}`.text();

        const response = {
          success: true,
          output,
        };
        logger.info(response);
        return response;
      } catch (error) {
        logger.error(error);
      }
    },
    {
      body: t.Optional(t.Any()),
    }
  );

app.use(cors()).listen(Bun.env.PORT || 3000);

console.log(
  `🦊 Server is running at ${app.server?.hostname}:${app.server?.port}`
);
