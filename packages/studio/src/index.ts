import { logger } from "@/logger";
import { pb } from "@/pocketbase";
import cors from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia, t } from "elysia";
import { GalleryService } from "./gallery";
import packageJson from "../package.json";

const app = new Elysia().use(
  swagger({
    documentation: {
      info: {
        title: "Studio API",
        version: "0.0.0",
      },
    },
  })
);
const galleryService = GalleryService.getInstance();

app.get("/", () => "Command Runner API");

// Gallery endpoints
app.get("/api/gallery/:device/events", async ({ params }) => {
  try {
    const events = await pb.collection("gallery").getFullList({
      filter: `device = "${params.device}"`,
      sort: "-created",
    });

    return { success: true, events };
  } catch (error) {
    logger.error(
      { error, device: params.device },
      "Error listing gallery events"
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
});

app.post(
  "/api/gallery/:device/start",
  async ({ params, body }) => {
    try {
      const config = body as {
        interval: number;
        autoPull: boolean;
      };
      await galleryService.startGalleryService(params.device, config);
      return { success: true };
    } catch (error) {
      logger.error(
        { error, device: params.device },
        "Error starting gallery service"
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
  {
    body: t.Object({
      interval: t.Number(),
      autoPull: t.Boolean(),
    }),
  }
);

app.post("/api/gallery/:device/stop", async ({ params }) => {
  try {
    galleryService.stopGalleryService(params.device);
    return { success: true };
  } catch (error) {
    logger.error(
      { error, device: params.device },
      "Error stopping gallery service"
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
});

app.get("/api/gallery/:device/status", async ({ params }) => {
  try {
    const status = galleryService.getGalleryStatus(params.device);
    return { success: true, status };
  } catch (error) {
    logger.error(
      { error, device: params.device },
      "Error getting gallery status"
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
});

app.post("/api/gallery/:device/pull/:eventId", async ({ params }) => {
  try {
    await galleryService.pullEvent(params.device, params.eventId);
    return { success: true };
  } catch (error) {
    console.log(error);
    logger.error(
      { error, device: params.device, eventId: params.eventId },
      "Error pulling gallery event"
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
});

app.get("/api/gallery/:device/stats", async ({ params }) => {
  try {
    const stats = await galleryService.getGalleryStats(params.device);
    return { success: true, stats };
  } catch (error) {
    logger.error(
      { error, device: params.device },
      "Error getting gallery stats"
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
});

app.get("/api/health", async () => {
  return {
    status: "healthy",
    service: "studio",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || "unknown",
  };
});

app.use(cors()).listen(Bun.env.PORT || 8001);
console.log(
  `🦊 Server is running at ${Bun.env.HOST ?? "localhost"}:${
    Bun.env.PORT ?? 8001
  }`
);
