import { logger } from "@/logger";
import { pb } from "@/pocketbase";
import cors from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { createAuthPlugin, type DeviceResponse } from "@joystick/core";
import { Elysia, t } from "elysia";
import { GalleryService } from "./gallery";
import { HookService } from "./services/hook-service";
import { FileWatcherService } from "./services/file-watcher";
import type {
  EventUploadRequest,
  EventUploadResponse,
  EventUploadUrlResponse,
} from "./types/types";
import { join } from "path";
import { GALLERY_BASE_PATH } from "./config";

const galleryService = GalleryService.getInstance();
const hookService = HookService.getInstance();
const fileWatcherService = FileWatcherService.getInstance();

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
        const device = await pb
          .collection("devices")
          .getFirstListItem<DeviceResponse>(`id = "${params.device}"`, {
            expand: "device",
          });

        const galleryConfig = {
          interval: device.information?.harvest?.interval ?? 60,
          autoPull: device.information?.harvest?.autoPull ?? false,
          supportedTypes: device.information?.harvest?.supportedTypes || [],
          generateThumbnails: false,
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
  // Direct event upload endpoint
  .post("/api/gallery/:device/upload", async ({ params, body }) => {
    try {
      const uploadRequest = body as EventUploadRequest;
      const eventId =
        uploadRequest.event_id ||
        galleryService.generateEventId(uploadRequest.name);

      await galleryService.createGalleryRecord(
        params.device,
        {
          id: eventId,
          path: uploadRequest.name,
          mediaType:
            uploadRequest.media_type ||
            galleryService.getMediaType(
              uploadRequest.name.split(".").pop() || ""
            ),
          metadata: uploadRequest.metadata || {},
          hasThumb: uploadRequest.has_thumbnail || false,
          fileSize: uploadRequest.file_size,
          thumbnail: undefined,
        },
        null
      );

      // Get the created record to use its PocketBase ID for updates
      const createdRecord = await pb
        .collection("gallery")
        .getFirstListItem(
          `device = "${params.device}" && event_id = "${eventId}"`
        );

      if (uploadRequest.event) {
        await pb.collection("gallery").update(createdRecord.id, {
          event: uploadRequest.event,
          file_size: uploadRequest.file_size || uploadRequest.event.size,
        });
      }

      if (uploadRequest.thumbnail) {
        await pb.collection("gallery").update(createdRecord.id, {
          thumbnail: uploadRequest.thumbnail,
        });
      }

      await hookService.executeHooks("after_event_created", {
        deviceId: params.device,
        event: {
          id: eventId,
          path: uploadRequest.name,
          mediaType:
            uploadRequest.media_type ||
            galleryService.getMediaType(
              uploadRequest.name.split(".").pop() || ""
            ),
          metadata: uploadRequest.metadata || {},
          hasThumb: uploadRequest.has_thumbnail || false,
          fileSize: uploadRequest.file_size,
        },
      });

      return {
        success: true,
        event_id: eventId,
      } as EventUploadResponse;
    } catch (error) {
      logger.error({ error, device: params.device }, "Error uploading event");
      return {
        success: false,
        event_id: "",
        error: error instanceof Error ? error.message : String(error),
      } as EventUploadResponse;
    }
  })

  // Get pre-signed upload URLs
  .get("/api/gallery/:device/upload-url", async ({ params, query }) => {
    try {
      const filename = query.filename as string;
      if (!filename) {
        throw new Error("Filename is required");
      }

      const eventId =
        query.event_id || galleryService.generateEventId(filename);
      const hasThumbnail = query.thumbnail === "true";

      // Create initial record
      await galleryService.createGalleryRecord(
        params.device,
        {
          id: eventId,
          path: filename,
          mediaType: galleryService.getMediaType(
            filename.split(".").pop() || ""
          ),
          metadata: {},
          hasThumb: hasThumbnail,
          fileSize: undefined,
          thumbnail: undefined,
        },
        null
      );

      // Get the created record to use its PocketBase ID for getting upload URLs
      const record = await pb
        .collection("gallery")
        .getFirstListItem(
          `device = "${params.device}" && event_id = "${eventId}"`
        );

      const uploadUrl = await pb.files.getUrl(record, "event", {
        token: "upload",
      });
      const thumbnailUploadUrl = hasThumbnail
        ? await pb.files.getUrl(record, "thumbnail", { token: "upload" })
        : undefined;

      return {
        success: true,
        upload_url: uploadUrl,
        thumbnail_upload_url: thumbnailUploadUrl,
      } as EventUploadUrlResponse;
    } catch (error) {
      logger.error(
        { error, device: params.device },
        "Error getting upload URL"
      );
      return {
        success: false,
        upload_url: "",
        error: error instanceof Error ? error.message : String(error),
      } as EventUploadUrlResponse;
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
  .get("/api/gallery/:device/paths", async ({ params }) => {
    try {
      await fileWatcherService.setupDeviceDirectories(params.device);
      const devicePath = join(GALLERY_BASE_PATH, params.device);

      return {
        success: true,
        paths: {
          incoming: join(devicePath, "incoming"),
          thumbnails: join(devicePath, "thumbnails"),
        },
      };
    } catch (error) {
      logger.error(
        { error, device: params.device },
        "Error getting device paths"
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  })
  // File watcher management endpoints
  .get("/api/watchers", async () => {
    try {
      const status = fileWatcherService.getWatcherStatus();
      return { success: true, watchers: status };
    } catch (error) {
      logger.error({ error }, "Error getting watcher status");
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  })
  .post("/api/watchers/refresh", async () => {
    try {
      await fileWatcherService.refreshWatchers();
      return { success: true };
    } catch (error) {
      logger.error({ error }, "Error refreshing watchers");
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  })
  .post("/api/watchers/:deviceId/add", async ({ params }) => {
    try {
      await fileWatcherService.addDevice(params.deviceId);
      return { success: true };
    } catch (error) {
      logger.error(
        { error, deviceId: params.deviceId },
        "Error adding watcher"
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  })
  .delete("/api/watchers/:deviceId", async ({ params }) => {
    try {
      await fileWatcherService.removeDevice(params.deviceId);
      return { success: true };
    } catch (error) {
      logger.error(
        { error, deviceId: params.deviceId },
        "Error removing watcher"
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  })
  .get("/api/watchers/:deviceId/status", async ({ params }) => {
    try {
      const isActive = fileWatcherService.isWatcherActive(params.deviceId);
      return { success: true, active: isActive };
    } catch (error) {
      logger.error(
        { error, deviceId: params.deviceId },
        "Error checking watcher status"
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  })
  .post("/api/watchers/cleanup-orphaned", async () => {
    try {
      await fileWatcherService.cleanupOrphanedWatchers();
      return { success: true };
    } catch (error) {
      logger.error({ error }, "Error cleaning up orphaned watchers");
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  })
  .post("/api/watchers/sync", async () => {
    try {
      await fileWatcherService.syncWatchers();
      return { success: true };
    } catch (error) {
      logger.error({ error }, "Error syncing watchers");
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

async function initializeServices() {
  try {
    logger.info("Initializing studio services...");

    // Initialize file watcher service
    await fileWatcherService.initialize();

    // Initialize gallery services for devices with harvesting enabled
    await initializeGalleryServices();

    // Set up periodic sync of watchers with device list (every 5 minutes)
    setInterval(async () => {
      try {
        await fileWatcherService.syncWatchers();
      } catch (error) {
        logger.error("Error during periodic watcher sync:", error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    logger.info("All studio services initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize studio services:", error);
    process.exit(1);
  }
}

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
          interval: device.information?.harvest?.interval ?? 60,
          autoPull: device.information?.harvest?.autoPull ?? false,
          supportedTypes: device.information?.harvest?.supportedTypes || [],
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

// Graceful shutdown handling
async function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}, starting graceful shutdown...`);

  try {
    // Cleanup file watcher service
    await fileWatcherService.cleanup();

    // Stop the server
    await app.stop();

    logger.info("Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    logger.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
}

// Register shutdown handlers
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Initialize services
initializeServices();
