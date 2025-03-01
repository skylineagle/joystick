import {
  createJob,
  deleteJob,
  getJobStatus,
  getNextExecution,
  startJob,
  stopJob,
} from "@/baker";
import { MEDIAMTX_API, POCKETBASE_URL } from "@/config";
import { logger } from "@/logger";
import type { DeviceAutomation } from "@/types/types";
import cors from "@elysiajs/cors";
import { Elysia } from "elysia";

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

app.post("/jobs/:device", async ({ params, body }) => {
  try {
    const { device } = params;
    const parsedBody = typeof body === "string" ? JSON.parse(body) : body;
    const automation = parsedBody as DeviceAutomation;
    if (
      !automation ||
      automation.minutesOff === 0 ||
      automation.minutesOn === 0
    ) {
      logger.info(`Automation values are invalid for device ${device}`);
      return { success: false, error: "Invalid automation values" };
    }
    logger.info("Creating new job");
    await createJob(device, automation);

    return { success: true };
  } catch (error: unknown) {
    logger.error(error);
    logger.error("Failed to create job", { device: params.device, error });
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "An unknown error occurred" };
  }
});

app.post("/jobs/:device/start", async ({ params }) => {
  try {
    const { device } = params;
    logger.info({ device }, "Starting job");
    await startJob(device);
    return { success: true };
  } catch (error: unknown) {
    logger.error("Failed to start job", { device: params.device, error });
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "An unknown error occurred" };
  }
});

app.post("/jobs/:device/stop", async ({ params }) => {
  try {
    const { device } = params;
    logger.info({ device }, "Stopping job");
    await stopJob(device);
    return { success: true };
  } catch (error: unknown) {
    logger.error("Failed to stop job", { device: params.device, error });
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "An unknown error occurred" };
  }
});

app.get("/jobs/:device", ({ params }) => {
  try {
    const { device } = params;
    const status = getJobStatus(device);
    logger.info("Retrieved job status", { device, status });
    return { success: true, status };
  } catch (error: unknown) {
    logger.error("Failed to get job status", { device: params.device, error });
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "An unknown error occurred" };
  }
});

app.delete("/jobs/:device", async ({ params }) => {
  try {
    const { device } = params;
    logger.info({ device }, "Deleting job");
    await deleteJob(device);
    return { success: true };
  } catch (error: unknown) {
    logger.error("Failed to delete job", { device: params.device, error });
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "An unknown error occurred" };
  }
});

app.get("/jobs/:device/next", async ({ params }) => {
  const { device } = params;
  const nextExecution = await getNextExecution(device);
  const status = getJobStatus(device);
  return {
    success: true,
    nextExecution: nextExecution.toString(),
    status,
  };
});

app.use(cors()).listen(3000);
logger.info("🦊 Baker API server running at http://localhost:3000");
logger.debug(`Pocketbase URL: ${POCKETBASE_URL}`);
logger.debug(`Stream URL: ${MEDIAMTX_API}`);
