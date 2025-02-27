import {
  createJob,
  deleteJob,
  getJobStatus,
  getNextExecution,
  startJob,
  stopJob,
} from "@/baker";
import { logger } from "@/logger";
import type { CameraAutomation } from "@/types/types";
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

app.post("/jobs/:camera", async ({ params, body }) => {
  try {
    const { camera } = params;
    const parsedBody = typeof body === "string" ? JSON.parse(body) : body;
    const automation = parsedBody as CameraAutomation;
    if (
      !automation ||
      automation.minutesOff === 0 ||
      automation.minutesOn === 0
    ) {
      logger.info(`Automation values are invalid for camera ${camera}`);
      return { success: false, error: "Invalid automation values" };
    }
    logger.info("Creating new job");
    await createJob(camera, automation);

    return { success: true };
  } catch (error: unknown) {
    logger.error(error);
    logger.error("Failed to create job", { camera: params.camera, error });
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "An unknown error occurred" };
  }
});

app.post("/jobs/:camera/start", async ({ params }) => {
  try {
    const { camera } = params;
    logger.info({ camera }, "Starting job");
    await startJob(camera);
    return { success: true };
  } catch (error: unknown) {
    logger.error("Failed to start job", { camera: params.camera, error });
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "An unknown error occurred" };
  }
});

app.post("/jobs/:camera/stop", async ({ params }) => {
  try {
    const { camera } = params;
    logger.info({ camera }, "Stopping job");
    await stopJob(camera);
    return { success: true };
  } catch (error: unknown) {
    logger.error("Failed to stop job", { camera: params.camera, error });
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "An unknown error occurred" };
  }
});

app.get("/jobs/:camera", ({ params }) => {
  try {
    const { camera } = params;
    const status = getJobStatus(camera);
    logger.info("Retrieved job status", { camera, status });
    return { success: true, status };
  } catch (error: unknown) {
    logger.error("Failed to get job status", { camera: params.camera, error });
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "An unknown error occurred" };
  }
});

app.delete("/jobs/:camera", async ({ params }) => {
  try {
    const { camera } = params;
    logger.info({ camera }, "Deleting job");
    await deleteJob(camera);
    return { success: true };
  } catch (error: unknown) {
    logger.error("Failed to delete job", { camera: params.camera, error });
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "An unknown error occurred" };
  }
});

app.get("/jobs/:camera/next", async ({ params }) => {
  const { camera } = params;
  const nextExecution = await getNextExecution(camera);
  const status = getJobStatus(camera);
  return {
    success: true,
    nextExecution: nextExecution.toString(),
    status,
  };
});

app.use(cors()).listen(3000);
logger.info("🦊 Baker API server running at http://localhost:3000");
logger.debug(`Pocketbase URL: ${process.env.POCKETBASE_URL}`);
logger.debug(`Stream URL: ${process.env.MEDIAMTX_API}`);
