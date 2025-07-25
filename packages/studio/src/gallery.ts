import { logger } from "@/logger";
import { pb } from "@/pocketbase";
import type {
  DeviceResponse,
  GalleryResponse,
  RunResponse,
  StudioHooksResponse,
} from "@joystick/core";
import {
  getActiveDeviceConnection,
  runCommandOnDevice,
  runScpFromDevice,
} from "@joystick/core";
import { $ } from "bun";
import { Baker } from "cronbake";
import { existsSync, mkdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { HookService } from "./services/hook-service";
import { GALLERY_BASE_PATH } from "./config";

if (!existsSync(GALLERY_BASE_PATH)) {
  mkdirSync(GALLERY_BASE_PATH, { recursive: true });
}

interface GalleryEvent {
  id: string;
  path: string;
  thumbnail?: string;
  mediaType: string;
  metadata?: Record<string, any>;
  hasThumb: boolean;
  fileSize?: number;
}

interface GalleryConfig {
  interval: number;
  autoPull: boolean;
  supportedTypes: string[];
  generateThumbnails: boolean;
}

export class GalleryService {
  private static instance: GalleryService;
  private baker = Baker.create();
  private hookService: HookService;
  private processingDevices = new Set<string>();

  private constructor() {
    this.hookService = HookService.getInstance();
  }

  public static getInstance(): GalleryService {
    if (!GalleryService.instance) {
      GalleryService.instance = new GalleryService();
    }
    return GalleryService.instance;
  }

  public async startGalleryService(deviceId: string, config: GalleryConfig) {
    logger.info(
      `Starting gallery service for device ${deviceId} with interval ${config.interval} and autoPull ${config.autoPull}`,
      { config }
    );

    if (this.baker.getStatus(deviceId) === "running") {
      logger.info(`Gallery service already running for device ${deviceId}`);
      return;
    }

    // Update device harvesting status
    await pb.collection("devices").update(deviceId, {
      harvesting: true,
    });

    logger.debug(`Adding baker job for device ${deviceId}`);

    this.baker.add({
      name: deviceId,
      cron: `@every_${config.interval}_seconds`,
      start: true,
      callback: async () => {
        try {
          if (this.processingDevices.has(deviceId)) {
            logger.info(
              `Skipping gallery processing for device ${deviceId} as previous processing is still running`
            );
            return;
          }

          this.processingDevices.add(deviceId);
          await this.processGalleryEvents(deviceId, config);
        } catch (error) {
          logger.error(
            `Error processing gallery events for device ${deviceId}:`,
            error
          );
        } finally {
          this.processingDevices.delete(deviceId);
        }
      },
      onTick: () => {
        logger.debug(`Scanning for new gallery events on device ${deviceId}`);
      },
    });

    logger.info(`Gallery service started for device ${deviceId}`);

    await this.hookService.executeHooks("after_gallery_start", {
      deviceId,
      config,
    });
  }

  public stopGalleryService(deviceId: string) {
    logger.info(`Stopping gallery service for device ${deviceId}`);

    this.baker.stop(deviceId);
    this.baker.remove(deviceId);
    this.processingDevices.delete(deviceId);

    // Update device harvesting status
    pb.collection("devices")
      .update(deviceId, {
        harvesting: false,
      })
      .catch((error) => {
        logger.error(
          `Error updating device harvesting status for device ${deviceId}:`,
          error
        );
      });

    this.hookService
      .executeHooks("after_gallery_stop", { deviceId })
      .catch((error) => {
        logger.error(
          `Error executing stop hooks for device ${deviceId}:`,
          error
        );
      });

    logger.info(`Gallery service stopped for device ${deviceId}`);
  }

  public getGalleryStatus(deviceId: string) {
    const status = this.baker.getStatus(deviceId);
    const isProcessing = this.processingDevices.has(deviceId);

    logger.debug(`Gallery status for device ${deviceId}:`, {
      status,
      isProcessing,
    });

    return {
      status,
      isProcessing,
    };
  }

  public async processGalleryEvents(deviceId: string, config: GalleryConfig) {
    logger.info(`Processing gallery events for device ${deviceId}`, { config });

    const device = await this.getDevice(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    const events = await this.listEvents(device, config);
    logger.info(`Found ${events.length} events from device ${device.name}`);

    const existingEvents = await pb
      .collection("gallery")
      .getFullList<GalleryResponse>({
        filter: `device = "${deviceId}"`,
      });
    const existingEventIds = new Set(
      existingEvents.map((event) => event.event_id)
    );

    const newEvents = events.filter((event) => !existingEventIds.has(event.id));
    logger.info(
      `Found ${newEvents.length} new events for device ${device.name}`
    );

    for (const event of newEvents) {
      logger.debug(`Processing new event: ${event.id}`, event);

      let thumbnailContent: Buffer | null = null;

      if (event.hasThumb && event.thumbnail) {
        try {
          thumbnailContent = await this.downloadThumbnail(device, event);
        } catch (error) {
          logger.warn(
            `Failed to download thumbnail for event ${event.id}:`,
            error
          );
        }
      }

      await this.createGalleryRecord(deviceId, event, thumbnailContent);
      await this.hookService.executeHooks("after_event_created", {
        deviceId,
        event,
      });

      if (config.autoPull) {
        logger.debug(`Auto-pulling event ${event.id}`);
        await this.pullEvent(deviceId, event.id);
      }
    }

    if (newEvents.length > 0) {
      await this.hookService.executeHooks("after_all_events_pulled", {
        deviceId,
        events: newEvents,
        totalProcessed: newEvents.length,
      });
    }
  }

  private async getDevice(deviceId: string): Promise<DeviceResponse | null> {
    logger.debug(`Getting device: ${deviceId}`);

    const result = await pb
      .collection("devices")
      .getFullList<DeviceResponse>(1, {
        filter: `id = "${deviceId}"`,
        expand: "device",
      });

    if (result.length > 0) {
      const device = result[0];
      logger.debug(`Found device:`, {
        id: device.id,
        name: device.name,
        hasInformation: !!device.information,
      });
      return device;
    }

    logger.debug(`Device not found: ${deviceId}`);
    return null;
  }

  private async executeDeviceAction(
    device: DeviceResponse,
    actionName: string,
    params?: Record<string, any>
  ): Promise<string> {
    const action = await pb
      .collection("actions")
      .getFirstListItem(`name = "${actionName}"`);
    if (!action) {
      throw new Error(`Action "${actionName}" not found`);
    }

    const runConfig = await pb.collection("run").getFullList<RunResponse>({
      filter: `action = "${action.id}" && device = "${device.expand?.device.id}"`,
    });
    logger.info(`Run config for ${action.name}: ${JSON.stringify(runConfig)}`);

    if (runConfig.length === 0) {
      throw new Error(
        `Action "${actionName}" not configured for device ${device.name}`
      );
    }

    const run = runConfig[0];
    const command = this.buildCommand(run.command, params);

    logger.info(`Executing command for device ${device.name}: ${command}`);

    const result = await runCommandOnDevice(device, command);
    logger.debug(`Command result for device ${device.name}:`, { result });

    return result;
  }

  private buildCommand(command: string, params?: Record<string, any>): string {
    if (!params) return command;

    let result = command;
    logger.debug(`Building command with params:`, { command, params });

    for (const [key, value] of Object.entries(params)) {
      const pattern = new RegExp(`{{${key}}}`, "g");
      const replacement = String(value);
      result = result.replace(pattern, replacement);
      logger.debug(`Replaced {{${key}}} with ${replacement}`);
    }

    logger.debug(`Final command: ${result}`);
    return result;
  }

  private async listEvents(
    device: DeviceResponse,
    config: GalleryConfig
  ): Promise<GalleryEvent[]> {
    const listActions = ["list-events", "list-files", "list-media"];

    for (const actionName of listActions) {
      try {
        logger.debug(`Trying action ${actionName} for device ${device.name}`);
        const output = await this.executeDeviceAction(device, actionName);
        logger.info(`Action ${actionName} output for device ${device.name}:`, {
          output,
        });
        return this.parseEventOutput(output, actionName, config.supportedTypes);
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message.includes("not available") ||
            error.message.includes("The requested resource wasn't found"))
        ) {
          logger.debug(
            `Action ${actionName} not available for device ${device.name}:`,
            error
          );
        } else {
          logger.error(
            `Action ${actionName} failed for device ${device.name}:`,
            error
          );
        }
        continue;
      }
    }

    logger.warn(`No list actions available for device ${device.name}`);
    return [];
  }

  private parseEventOutput(
    output: string,
    actionName: string,
    supportedTypes: string[]
  ): GalleryEvent[] {
    const lines = output.split("\n").filter(Boolean);

    logger.debug(`Parsing ${lines.length} lines from ${actionName} output`);

    return lines
      .map((line) => {
        const parts = line.split("\t");
        const path = parts[0];
        const filename = path.split("/").pop() || "";
        const extension = filename.split(".").pop()?.toLowerCase() || "";

        const mediaType = this.getMediaType(extension);
        const hasThumb = this.hasThumbExtension(extension) || parts.length > 1;

        const event = {
          id: this.generateEventId(path),
          path,
          thumbnail: hasThumb ? parts[1] || path : undefined,
          mediaType,
          hasThumb,
          fileSize: parts[2] ? parseInt(parts[2]) : undefined,
          metadata: parts.length > 3 ? this.parseMetadata(parts[3]) : {},
        };

        logger.debug(`Parsed event:`, {
          id: event.id,
          path: event.path,
          filename,
          extension,
          mediaType: event.mediaType,
          hasThumb: event.hasThumb,
          parts: parts.length,
        });

        return event;
      })
      .filter(
        (event) =>
          supportedTypes.length === 0 ||
          supportedTypes.includes(event.mediaType)
      );
  }

  public generateEventId(path: string): string {
    const eventId =
      path
        .split("/")
        .pop()
        ?.replace(/\.[^/.]+$/, "") || "";

    logger.debug(`Generated event ID:`, { path, eventId });
    return eventId;
  }

  public getMediaType(extension: string): string {
    const imageTypes = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "tiff", "heic", "heif"];
    const videoTypes = ["mp4", "webm", "avi", "mov", "mkv", "flv"];
    const audioTypes = ["mp3", "wav", "ogg", "m4a", "aac"];
    const documentTypes = ["pdf", "doc", "docx", "xls", "xlsx", "txt", "md", "json", "xml", "csv", "log"];

    extension = extension.toLowerCase();

    let mediaType = "other";
    if (imageTypes.includes(extension)) mediaType = "image";
    else if (videoTypes.includes(extension)) mediaType = "video";
    else if (audioTypes.includes(extension)) mediaType = "audio";
    else if (documentTypes.includes(extension)) mediaType = "document";

    logger.debug(`Determined media type:`, { extension, mediaType });
    return mediaType;
  }

  private hasThumbExtension(extension: string): boolean {
    const thumbExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "heic", "heif"];
    const hasThumb = thumbExtensions.includes(extension);

    logger.debug(`Checking thumb extension:`, { extension, hasThumb });
    return hasThumb;
  }

  private parseMetadata(metadataStr: string): Record<string, any> {
    try {
      const metadata = JSON.parse(metadataStr);
      logger.debug(`Parsed metadata:`, { metadataStr, metadata });
      return metadata;
    } catch (error) {
      logger.debug(`Failed to parse metadata:`, { metadataStr, error });
      return {};
    }
  }

  private async downloadThumbnail(
    device: DeviceResponse,
    event: GalleryEvent
  ): Promise<Buffer> {
    if (!device.information) {
      throw new Error(`Device information not found for device ${device.id}`);
    }

    const { host: activeHost } = getActiveDeviceConnection(device.information);
    if (!activeHost) {
      throw new Error(`Active host not found for device ${device.id}`);
    }

    const thumbnailPath = event.thumbnail || event.path;
    const localPath = join(
      GALLERY_BASE_PATH,
      device.id,
      `thumb_${event.id}.tmp`
    );

    logger.debug(`Downloading thumbnail:`, {
      deviceId: device.id,
      eventId: event.id,
      thumbnailPath,
      localPath,
      hasThumbnail: !!event.thumbnail,
    });

    mkdirSync(join(GALLERY_BASE_PATH, device.id), { recursive: true });

    logger.info(`Downloading thumbnail from ${thumbnailPath} to ${localPath}`);
    await runScpFromDevice(device, thumbnailPath, localPath);

    const content = readFileSync(localPath);

    try {
      await $`rm -f ${localPath}`;
    } catch {
      // Ignore cleanup errors
    }

    return content;
  }

  public async createGalleryRecord(
    deviceId: string,
    event: GalleryEvent,
    thumbnailContent: Buffer | null
  ) {
    // Log the event details for debugging
    logger.info(`Creating gallery record:`, {
      deviceId,
      eventId: event.id,
      path: event.path,
      mediaType: event.mediaType,
      hasThumb: event.hasThumb,
      fileSize: event.fileSize,
    });

    const recordData: any = {
      device: deviceId,
      event_id: event.id,
      name: event.path,
      media_type: event.mediaType,
      has_thumbnail: event.hasThumb,
      file_size: event.fileSize,
      metadata: event.metadata,
    };

    if (thumbnailContent) {
      const extension = event.thumbnail?.split(".").pop() || "jpg";
      recordData.thumbnail = new File(
        [thumbnailContent],
        `${event.id}.${extension}`
      );
    }

    const createdRecord = await pb.collection("gallery").create(recordData);
    logger.info(`Gallery record created with ID: ${createdRecord.id}`);

    return createdRecord;
  }

  private async getExistingEvent(
    deviceId: string,
    eventId: string
  ): Promise<GalleryResponse | null> {
    logger.debug(`Looking for existing event:`, { deviceId, eventId });

    // First try to find by PocketBase ID
    try {
      const event = await pb
        .collection("gallery")
        .getOne<GalleryResponse>(eventId);
      if (event && event.device === deviceId) {
        logger.debug(`Found event by ID:`, {
          id: event.id,
          eventId: event.event_id,
          name: event.name,
          device: event.device,
        });
        return event;
      }
    } catch {
      // If not found by ID, continue to search by event_id
      logger.debug(`Event not found by ID, searching by event_id`);
    }

    // Then try to find by event_id (file name)
    const result = await pb
      .collection("gallery")
      .getFullList<GalleryResponse>(1, {
        filter: `device = "${deviceId}" && event_id = "${eventId}"`,
      });

    if (result.length > 0) {
      const event = result[0];
      logger.debug(`Found event by event_id:`, {
        id: event.id,
        eventId: event.event_id,
        name: event.name,
        device: event.device,
      });
      return event;
    }

    logger.debug(
      `No event found for deviceId: ${deviceId}, eventId: ${eventId}`
    );
    return null;
  }

  public async pullEvent(deviceId: string, eventId: string): Promise<void> {
    logger.info(`Pulling event ${eventId} for device ${deviceId}`);

    await this.hookService.executeHooks("before_event_pull", {
      deviceId,
      eventId,
    });

    const device = await this.getDevice(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    const event = await this.getExistingEvent(deviceId, eventId);
    if (!event) {
      throw new Error(`Event ${eventId} not found for device ${deviceId}`);
    }

    if (!device.information) {
      throw new Error(`Device information not found for device ${device.id}`);
    }

    const { host: activeHost } = getActiveDeviceConnection(device.information);
    if (!activeHost) {
      throw new Error(`Active host not found for device ${device.id}`);
    }

    const deviceDir = join(GALLERY_BASE_PATH, device.id);
    mkdirSync(deviceDir, { recursive: true });

    // Ensure we have the full path for the file on the device
    const remotePath = event.name;
    if (!remotePath) {
      throw new Error(`No path found for event ${eventId}`);
    }

    // Log the path information for debugging
    logger.info(`Event details:`, {
      eventId: event.event_id,
      name: event.name,
      remotePath,
      deviceId,
    });

    const extension = remotePath.split(".").pop() || "bin";
    const localPath = join(deviceDir, `${event.event_id}.${extension}`);
    logger.info(`Downloading event from ${remotePath} to ${localPath}`);

    try {
      await runScpFromDevice(device, remotePath, localPath);
    } catch (error) {
      logger.error(`Failed to download file from ${remotePath}:`, error);
      throw new Error(
        `Failed to download file from device: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    const fileContent = readFileSync(localPath);
    const fileStats = statSync(localPath);

    await pb.collection("gallery").update(event.id, {
      event: new File([fileContent], `${event.event_id}.${extension}`),
      file_size: fileStats.size,
    });

    try {
      await this.removeEventFromDevice(device, event);
      logger.info(`Successfully deleted event files from device: ${eventId}`);
    } catch (error) {
      logger.error(`Failed to delete event files from device: ${error}`);
      throw error; // Re-throw to ensure proper error handling
    }

    try {
      await $`rm -f ${localPath}`;
    } catch {
      // Ignore cleanup errors
    }

    await this.hookService.executeHooks("after_event_pulled", {
      deviceId,
      eventId,
      event,
    });
  }

  private async removeEventFromDevice(
    device: DeviceResponse,
    event: GalleryResponse
  ): Promise<void> {
    const deleteActions = ["delete-event", "remove-file", "cleanup"];

    logger.debug(`Attempting to remove event from device:`, {
      deviceName: device.name,
      eventId: event.event_id,
      path: event.name,
    });

    for (const actionName of deleteActions) {
      try {
        logger.debug(`Trying delete action: ${actionName}`);
        await this.executeDeviceAction(device, actionName, {
          eventId: event.event_id,
          path: event.name,
        });
        logger.info(`Successfully executed delete action: ${actionName}`);
        return;
      } catch (error) {
        logger.debug(`Delete action ${actionName} failed:`, error);
        continue;
      }
    }

    throw new Error(`No delete action available for device ${device.name}`);
  }

  public async getGalleryStats(deviceId: string): Promise<{
    totalEvents: number;
    newEvents: number;
    pulledEvents: number;
    viewedEvents: number;
    byMediaType: Record<string, number>;
  }> {
    logger.debug(`Getting gallery stats for device ${deviceId}`);

    const events = await pb.collection("gallery").getFullList<GalleryResponse>({
      filter: `device = "${deviceId}"`,
    });

    const byMediaType: Record<string, number> = {};
    events.forEach((event) => {
      const type = event.media_type || "unknown";
      byMediaType[type] = (byMediaType[type] || 0) + 1;
    });

    const stats = {
      totalEvents: events.length,
      newEvents: events.filter((e) => e.event == "").length,
      pulledEvents: events.filter((e) => e.event).length,
      viewedEvents: events.filter((e) => e.viewed?.length > 0).length,
      byMediaType,
    };

    logger.debug(`Gallery stats for device ${deviceId}: ${stats}`);
    return stats;
  }

  public async deleteEvent(deviceId: string, eventId: string): Promise<void> {
    logger.info(`Deleting event ${eventId} for device ${deviceId}`);

    const event = await this.getExistingEvent(deviceId, eventId);
    if (!event) {
      throw new Error(`Event ${eventId} not found for device ${deviceId}`);
    }

    logger.debug(`Found event to delete:`, {
      id: event.id,
      eventId: event.event_id,
      name: event.name,
    });

    await pb.collection("gallery").delete(event.id);
    await this.hookService.executeHooks("after_event_deleted", {
      deviceId,
      eventId,
      event,
    });

    logger.info(`Event ${eventId} deleted successfully for device ${deviceId}`);
  }
}
