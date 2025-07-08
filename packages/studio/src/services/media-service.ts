import { logger } from "@/logger";
import { pb } from "@/pocketbase";
import type {
  DeviceResponse,
  GalleryResponse,
  RunResponse,
  StudioHooksResponse,
} from "@joystick/core";
import { getActiveDeviceConnection, runCommandOnDevice } from "@joystick/core";
import { $ } from "bun";
import { Baker } from "cronbake";
import { existsSync, mkdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { HookService } from "./hook-service";

const MEDIA_BASE_PATH = join(process.cwd(), "data", "media");

if (!existsSync(MEDIA_BASE_PATH)) {
  mkdirSync(MEDIA_BASE_PATH, { recursive: true });
}

interface MediaEvent {
  id: string;
  path: string;
  thumbnail?: string;
  mediaType: string;
  metadata?: Record<string, any>;
  hasThumb: boolean;
  fileSize?: number;
}

interface MediaConfig {
  interval: number;
  autoPull: boolean;
  supportedTypes: string[];
  generateThumbnails: boolean;
}

export class MediaService {
  private static instance: MediaService;
  private baker = Baker.create();
  private hookService: HookService;

  private constructor() {
    this.hookService = HookService.getInstance();
  }

  public static getInstance(): MediaService {
    if (!MediaService.instance) {
      MediaService.instance = new MediaService();
    }
    return MediaService.instance;
  }

  public async startMediaService(deviceId: string, config: MediaConfig) {
    logger.info(`Starting media service for device ${deviceId}`, { config });

    if (this.baker.getStatus(deviceId) === "running") {
      logger.info(`Media service already running for device ${deviceId}`);
      return;
    }

    this.baker.add({
      name: deviceId,
      cron: `@every_${config.interval}_seconds`,
      start: true,
      callback: async () => {
        try {
          await this.processMediaEvents(deviceId, config);
        } catch (error) {
          logger.error(
            `Error processing media events for device ${deviceId}:`,
            error
          );
        }
      },
      onTick: () => {
        logger.debug(`Scanning for new media events on device ${deviceId}`);
      },
    });

    await this.hookService.executeHooks("after_gallery_start", {
      deviceId,
      config,
    });
  }

  public stopMediaService(deviceId: string) {
    this.baker.stop(deviceId);
    this.baker.remove(deviceId);

    this.hookService
      .executeHooks("after_gallery_stop", { deviceId })
      .catch((error) => {
        logger.error(
          `Error executing stop hooks for device ${deviceId}:`,
          error
        );
      });
  }

  public getMediaStatus(deviceId: string) {
    return this.baker.getStatus(deviceId);
  }

  public async processMediaEvents(deviceId: string, config: MediaConfig) {
    logger.info(`Processing media events for device ${deviceId}`, { config });

    const device = await this.getDevice(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    const events = await this.listEvents(device, config);

    const existingEvents = await pb
      .collection("gallery")
      .getFullList<GalleryResponse>({
        filter: `device = "${deviceId}"`,
      });
    const existingEventIds = new Set(
      existingEvents.map((event) => event.event_id)
    );

    const newEvents = events.filter((event) => !existingEventIds.has(event.id));

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

      await this.createMediaRecord(deviceId, event, thumbnailContent);
      await this.hookService.executeHooks("after_event_created", {
        deviceId,
        event,
      });

      if (config.autoPull) {
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
    const result = await pb
      .collection("devices")
      .getFullList<DeviceResponse>(1, {
        filter: `id = "${deviceId}"`,
        expand: "device",
      });

    return result[0] || null;
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

    if (runConfig.length === 0) {
      throw new Error(
        `Action "${actionName}" not configured for device ${device.name}`
      );
    }

    const run = runConfig[0];
    const command = this.buildCommand(run.command, params);

    return await runCommandOnDevice(device, command);
  }

  private buildCommand(template: string, params?: Record<string, any>): string {
    if (!params) return template;

    let command = template;
    for (const [key, value] of Object.entries(params)) {
      command = command.replace(new RegExp(`{{${key}}}`, "g"), String(value));
    }
    return command;
  }

  private async listEvents(
    device: DeviceResponse,
    config: MediaConfig
  ): Promise<MediaEvent[]> {
    const listActions = ["list-events", "list-files", "list-media"];

    for (const actionName of listActions) {
      try {
        const output = await this.executeDeviceAction(device, actionName);
        return this.parseEventOutput(output, actionName, config.supportedTypes);
      } catch (error) {
        logger.debug(`Action ${actionName} failed or not available:`, error);
        continue;
      }
    }

    return [];
  }

  private parseEventOutput(
    output: string,
    actionName: string,
    supportedTypes: string[]
  ): MediaEvent[] {
    const lines = output.split("\n").filter(Boolean);

    return lines
      .map((line) => {
        const parts = line.split("\t");
        const path = parts[0];
        const filename = path.split("/").pop() || "";
        const extension = filename.split(".").pop()?.toLowerCase() || "";

        const mediaType = this.getMediaType(extension);
        const hasThumb = this.hasThumbExtension(extension) || parts.length > 1;

        return {
          id: this.generateEventId(path),
          path,
          thumbnail: hasThumb ? parts[1] || path : undefined,
          mediaType,
          hasThumb,
          fileSize: parts[2] ? parseInt(parts[2]) : undefined,
          metadata: parts.length > 3 ? this.parseMetadata(parts[3]) : {},
        };
      })
      .filter(
        (event) =>
          supportedTypes.length === 0 ||
          supportedTypes.includes(event.mediaType)
      );
  }

  private getMediaType(extension: string): string {
    const imageExts = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];
    const videoExts = ["mp4", "avi", "mov", "mkv", "webm", "flv"];
    const audioExts = ["mp3", "wav", "flac", "aac", "ogg", "m4a"];
    const documentExts = ["pdf", "doc", "docx", "txt", "rtf"];

    if (imageExts.includes(extension)) return "image";
    if (videoExts.includes(extension)) return "video";
    if (audioExts.includes(extension)) return "audio";
    if (documentExts.includes(extension)) return "document";

    return "other";
  }

  private hasThumbExtension(extension: string): boolean {
    return ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(extension);
  }

  private generateEventId(path: string): string {
    return (
      path
        .split("/")
        .pop()
        ?.replace(/\.[^/.]+$/, "") || ""
    );
  }

  private parseMetadata(metadataStr: string): Record<string, any> {
    try {
      return JSON.parse(metadataStr);
    } catch {
      return {};
    }
  }

  private async downloadThumbnail(
    device: DeviceResponse,
    event: MediaEvent
  ): Promise<Buffer> {
    if (!device.information) {
      throw new Error(`Device information not found for device ${device.id}`);
    }

    const { host: activeHost } = getActiveDeviceConnection(device.information);
    if (!activeHost) {
      throw new Error(`Active host not found for device ${device.id}`);
    }

    const thumbnailPath = event.thumbnail || event.path;
    const localPath = join(MEDIA_BASE_PATH, device.id, `thumb_${event.id}.tmp`);

    mkdirSync(join(MEDIA_BASE_PATH, device.id), { recursive: true });

    const command = device.information.password
      ? `sshpass -p ${device.information.password} scp -o StrictHostKeyChecking=no ${device.information.user}@${activeHost}:${thumbnailPath} ${localPath}`
      : `scp -o StrictHostKeyChecking=no ${device.information.user}@${activeHost}:${thumbnailPath} ${localPath}`;

    await $`${{ raw: command }}`.text();

    const content = readFileSync(localPath);

    try {
      await $`rm -f ${localPath}`;
    } catch {
      // Ignore cleanup errors
    }

    return content;
  }

  private async createMediaRecord(
    deviceId: string,
    event: MediaEvent,
    thumbnailContent: Buffer | null
  ) {
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

    await pb.collection("gallery").create(recordData);
  }

  private async getExistingEvent(
    deviceId: string,
    eventId: string
  ): Promise<GalleryResponse | null> {
    const result = await pb
      .collection("gallery")
      .getFullList<GalleryResponse>(1, {
        filter: `device = "${deviceId}" && event_id = "${eventId}"`,
      });

    return result[0] || null;
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

    const deviceDir = join(MEDIA_BASE_PATH, device.id);
    mkdirSync(deviceDir, { recursive: true });

    const extension = event.name?.split(".").pop() || "bin";
    const localPath = join(deviceDir, `${event.event_id}.${extension}`);

    const command = device.information.password
      ? `sshpass -p ${device.information.password} scp -o StrictHostKeyChecking=no ${device.information.user}@${activeHost}:${event.name} ${localPath}`
      : `scp -o StrictHostKeyChecking=no ${device.information.user}@${activeHost}:${event.name} ${localPath}`;

    await $`${{ raw: command }}`.text();

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

    for (const actionName of deleteActions) {
      try {
        await this.executeDeviceAction(device, actionName, {
          eventId: event.event_id,
          path: event.name,
        });
        return;
      } catch (error) {
        logger.debug(`Delete action ${actionName} failed:`, error);
        continue;
      }
    }

    logger.warn(
      `No delete action available for device ${device.name}, manual cleanup required`
    );
  }

  public async getMediaStats(deviceId: string): Promise<{
    totalEvents: number;
    newEvents: number;
    pulledEvents: number;
    viewedEvents: number;
    byMediaType: Record<string, number>;
  }> {
    const events = await pb.collection("gallery").getFullList<GalleryResponse>({
      filter: `device = "${deviceId}"`,
    });

    const byMediaType: Record<string, number> = {};
    events.forEach((event) => {
      const type = event.media_type || "unknown";
      byMediaType[type] = (byMediaType[type] || 0) + 1;
    });

    return {
      totalEvents: events.length,
      newEvents: events.filter((e) => !e.event).length,
      pulledEvents: events.filter((e) => e.event).length,
      viewedEvents: events.filter((e) => e.viewed).length,
      byMediaType,
    };
  }

  public async deleteEvent(deviceId: string, eventId: string): Promise<void> {
    const event = await this.getExistingEvent(deviceId, eventId);
    if (!event) {
      throw new Error(`Event ${eventId} not found for device ${deviceId}`);
    }

    await pb.collection("gallery").delete(event.id);
    await this.hookService.executeHooks("after_event_deleted", {
      deviceId,
      eventId,
      event,
    });
  }
}
