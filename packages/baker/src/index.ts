import {
  createJob,
  deleteJob,
  getJobStatus,
  getNextExecution,
  startJob,
  stopJob,
} from "@/baker";
import { logger } from "@/logger";
import { pb } from "@/pocketbase";
import cors from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import type { DeviceAutomation } from "@joystick/core";
import {
  createAuthPlugin,
  POCKETBASE_URL,
  STREAM_API_URL,
} from "@joystick/core";
import { Elysia } from "elysia";

new Elysia()
  .use(
    swagger({
      documentation: {
        info: { title: "Baker API", version: "0.0.0" },
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
  .post("/jobs/:device", async ({ params, body }) => {
    try {
      const { device } = params;
      const parsedBody = typeof body === "string" ? JSON.parse(body) : body;
      const automation = parsedBody as DeviceAutomation;
      if (
        !automation ||
        automation?.off?.minutes === 0 ||
        automation?.on?.minutes === 0
      ) {
        logger.info(`Automation values are invalid for device ${device}`);
        return { success: false, error: "Invalid automation values" };
      }
      logger.info("Creating new job");
      await createJob(device, automation);

      return { success: true };
    } catch (error) {
      // Regular job creation error
      logger.error("Failed to create job", {
        device: params.device,
        error,
      });

      return { success: false, error: "An unknown error occurred" };
    }
  })
  .post("/jobs/:device/start", async ({ params }) => {
    try {
      const { device } = params;
      logger.info({ device }, "Starting job");
      await startJob(device);
      return { success: true };
    } catch (error: unknown) {
      logger.error("Failed to start job", { device: params.device, error });
      if (error instanceof Error)
        return { success: false, error: error.message };
      return { success: false, error: "An unknown error occurred" };
    }
  })
  .post("/jobs/:device/stop", async ({ params }) => {
    try {
      const { device } = params;
      logger.info({ device }, "Stopping job");
      await stopJob(device);
      return { success: true };
    } catch (error: unknown) {
      logger.error("Failed to stop job", { device: params.device, error });
      if (error instanceof Error)
        return { success: false, error: error.message };
      return { success: false, error: "An unknown error occurred" };
    }
  })
  .get("/jobs/:device", async ({ params }) => {
    try {
      const { device } = params;
      const status = getJobStatus(device);
      logger.info("Retrieved job status", { device, status });
      return { success: true, status };
    } catch (error: unknown) {
      logger.error("Failed to get job status", {
        device: params.device,
        error,
      });
      if (error instanceof Error)
        return { success: false, error: error.message };
      return { success: false, error: "An unknown error occurred" };
    }
  })
  .delete("/jobs/:device", async ({ params }) => {
    try {
      const { device } = params;
      logger.info({ device }, "Deleting job");
      await deleteJob(device);
      return { success: true };
    } catch (error: unknown) {
      logger.error("Failed to delete job", { device: params.device, error });
      if (error instanceof Error)
        return { success: false, error: error.message };
      return { success: false, error: "An unknown error occurred" };
    }
  })
  .get("/jobs/:device/next", async ({ params, set }) => {
    try {
      const { device } = params;
      const result = await getNextExecution(device);
      const status = getJobStatus(device);

      if (!result || !result.nextExecution) {
        const fallbackTime = new Date(Date.now() + 60000); // 1 minute from now
        return {
          success: true,
          nextExecution: fallbackTime.toString(),
          jobName: device,
          status,
        };
      }

      return {
        success: true,
        nextExecution: result.nextExecution.toString(),
        jobName: result.jobName,
        status,
      };
    } catch (error) {
      logger.error("Failed to get next execution", {
        device: params.device,
        error,
      });

      const fallbackTime = new Date(Date.now() + 60000); // 1 minute from now
      return {
        success: false,
        nextExecution: fallbackTime.toString(),
        jobName: params.device,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  }) // Standard health check endpoint
  .get("/api/health", async () => {
    return {
      status: "healthy",
      service: "baker",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || "unknown",
    };
  })
  .listen(3000);

logger.info("🦊 Baker API server running at http://localhost:3000");
logger.debug(`Pocketbase URL: ${POCKETBASE_URL}`);
logger.debug(`Stream URL: ${STREAM_API_URL}`);
