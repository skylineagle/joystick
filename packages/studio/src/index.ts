import { logger } from "@/logger";
import { pb } from "@/pocketbase";
import cors from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { createAuthPlugin, type DeviceResponse } from "@joystick/core";
import { Elysia, t } from "elysia";
import { GalleryService } from "./gallery";
import { HookService } from "./services/hook-service";

const galleryService = GalleryService.getInstance();
const hookService = HookService.getInstance();

const app = new Elysia()
  .use(
    swagger({
      documentation: {
        info: {
          title: "Studio API",
          version: "0.0.0",
        },
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
  .get("/", () => "Studio API")
  // Gallery endpoints
  .get("/api/gallery/:device/events", async ({ params, query }) => {
    try {
      const config = {
        interval: 60,
        autoPull: false,
        supportedTypes: query.types ? String(query.types).split(",") : [],
        generateThumbnails: query.thumbnails === "true",
      };

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
  })
  .post(
    "/api/gallery/:device/start",
    async ({ params, body }) => {
      try {
        const config = body as {
          interval: number;
          autoPull: boolean;
          supportedTypes?: string[];
          generateThumbnails?: boolean;
        };

        const galleryConfig = {
          interval: config.interval,
          autoPull: config.autoPull,
          supportedTypes: config.supportedTypes || [
            "image",
            "video",
            "audio",
            "document",
          ],
          generateThumbnails: config.generateThumbnails || false,
        };

        await galleryService.startGalleryService(params.device, galleryConfig);
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
        supportedTypes: t.Optional(t.Array(t.String())),
        generateThumbnails: t.Optional(t.Boolean()),
      }),
    }
  )
  .post("/api/gallery/:device/stop", async ({ params }) => {
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
  })
  .get("/api/gallery/:device/status", async ({ params }) => {
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
  })
  .post("/api/gallery/:device/pull/:eventId", async ({ params }) => {
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
  })
  .get("/api/gallery/:device/stats", async ({ params }) => {
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
  })
  .delete("/api/gallery/:device/events/:eventId", async ({ params }) => {
    try {
      await galleryService.deleteEvent(params.device, params.eventId);
      return { success: true };
    } catch (error) {
      logger.error(
        { error, device: params.device, eventId: params.eventId },
        "Error deleting gallery event"
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  })
  // Hook management endpoints
  .get("/api/hooks", async ({ query }) => {
    try {
      const hooks = await hookService.getHooks(
        query.device ? String(query.device) : undefined
      );
      return { success: true, hooks };
    } catch (error) {
      logger.error({ error }, "Error getting hooks");
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  })
  .post("/api/hooks", async ({ body }) => {
    try {
      const hookData = body as {
        hookName: string;
        eventType: string;
        deviceId?: string;
        actionId: string;
        parameters?: Record<string, any>;
        enabled?: boolean;
      };

      const hook = await hookService.createHook(hookData);
      return { success: true, hook };
    } catch (error) {
      logger.error({ error }, "Error creating hook");
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  })
  .patch("/api/hooks/:id", async ({ params, body }) => {
    try {
      const updates = body as Partial<{
        hookName: string;
        eventType: string;
        deviceId?: string;
        actionId: string;
        parameters?: Record<string, any>;
        enabled: boolean;
      }>;

      const hook = await hookService.updateHook(params.id, updates);
      return { success: true, hook };
    } catch (error) {
      logger.error({ error, hookId: params.id }, "Error updating hook");
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  })
  .delete("/api/hooks/:id", async ({ params }) => {
    try {
      await hookService.deleteHook(params.id);
      return { success: true };
    } catch (error) {
      logger.error({ error, hookId: params.id }, "Error deleting hook");
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  })
  .get("/api/hooks/events/:eventType", async ({ params, query }) => {
    try {
      const hooks = await hookService.getHooksByEventType(
        params.eventType,
        query.device ? String(query.device) : undefined
      );
      return { success: true, hooks };
    } catch (error) {
      logger.error(
        { error, eventType: params.eventType },
        "Error getting hooks by event type"
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  })
  .get("/api/health", async () => {
    return {
      status: "healthy",
      service: "studio",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || "unknown",
    };
  })
  .listen(Bun.env.PORT || 8001);

console.log(
  `🦊 Server is running at ${Bun.env.HOST ?? "localhost"}:${
    Bun.env.PORT ?? 8001
  }`
);

async function initializeGalleryServices() {
  try {
    logger.info(
      "Initializing gallery services for devices with harvesting enabled"
    );

    const devices = await pb.collection("devices").getFullList<DeviceResponse>({
      filter: "harvesting = true",
      expand: "device",
    });

    logger.info(`Found ${devices.length} devices with harvesting enabled`);

    for (const device of devices) {
      try {
        logger.info(
          `Starting gallery service for device: ${device.name} (${device.id})`
        );

        const galleryConfig = {
          interval: device.information?.harvestingInterval ?? 60,
          autoPull: false,
          supportedTypes: ["image", "video", "audio", "document"],
          generateThumbnails: false,
        };

        await galleryService.startGalleryService(device.id, galleryConfig);
        logger.info(
          `Gallery service started successfully for device: ${device.name}`
        );
      } catch (error) {
        logger.error(
          { error, deviceId: device.id, deviceName: device.name },
          "Failed to start gallery service for device"
        );
      }
    }
  } catch (error) {
    logger.error({ error }, "Failed to initialize gallery services");
  }
}

initializeGalleryServices();
