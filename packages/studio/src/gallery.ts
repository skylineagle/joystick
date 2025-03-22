import { pb } from "@/pocketbase";
import { type GalleryResponse } from "@/types/db.types";
import type { DeviceResponse } from "@/types/types";
import { $ } from "bun";
import { existsSync, mkdirSync, readFileSync } from "fs";
import { join } from "path";
import { logger } from "@/logger";
import { runCommandOnDevice } from "@/ssh";
import { Baker } from "cronbake";
const GALLERY_BASE_PATH = join(process.cwd(), "data", "gallery");

// Ensure gallery directory exists
if (!existsSync(GALLERY_BASE_PATH)) {
  mkdirSync(GALLERY_BASE_PATH, { recursive: true });
}

interface GalleryEvent {
  id: string;
  path: string;
  thumbnail: string;
}

interface GalleryConfig {
  interval: number; // in seconds
  autoPull: boolean;
}

export class GalleryService {
  private static instance: GalleryService;
  private intervals: Map<string, Timer> = new Map();

  private baker = Baker.create();

  private constructor() {}

  public static getInstance(): GalleryService {
    if (!GalleryService.instance) {
      GalleryService.instance = new GalleryService();
    }
    return GalleryService.instance;
  }

  public async startGalleryService(deviceId: string, config: GalleryConfig) {
    if (this.intervals.has(deviceId)) {
      this.stopGalleryService(deviceId);
    }
    logger.info(this.baker.getStatus(deviceId));
    if (this.baker.getStatus(deviceId) === "running") {
      logger.info(`Gallery service already running for device ${deviceId}`);
      return;
    }

    this.baker.add({
      name: deviceId,
      cron: `@every_${config.interval}_seconds`,
      start: true,
      callback: async () => {
        try {
          await this.processGalleryEvents(deviceId, config.autoPull);
        } catch (error) {
          logger.debug(JSON.stringify(error, null, 2));
        }
      },
      onTick: () => {
        logger.debug("Looking for new gallery events");
      },
    });
  }

  public stopGalleryService(deviceId: string) {
    this.baker.stop(deviceId);
    this.baker.remove(deviceId);
  }

  public getGalleryStatus(deviceId: string) {
    return this.baker.getStatus(deviceId);
  }

  public async processGalleryEvents(deviceId: string, autoPull: boolean) {
    logger.info(`Processing gallery events for device ${deviceId}`);
    const device = await this.getDevice(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    // List events from device
    const events = await this.listEvents(device);

    // Get all existing events for this device
    const existingEvents = await pb
      .collection("gallery")
      .getFullList<GalleryResponse>({
        filter: `device = "${deviceId}"`,
      });
    const existingEventIds = new Set(
      existingEvents.map((event) => event.event_id)
    );

    // Filter out events that have already been processed
    const newEvents = events.filter((event) => !existingEventIds.has(event.id));

    // Process each new event
    for (const event of newEvents) {
      logger.debug(`processing event: ${JSON.stringify(event, null, 2)}`);

      logger.debug(`downloading thumbnail`);
      // Download thumbnail and get its content
      const thumbnailContent = await this.downloadThumbnail(device, event);

      // Create gallery record with file content
      await this.createGalleryRecord(deviceId, event, thumbnailContent);

      // Auto pull video if enabled
      if (autoPull) {
        await this.pullEvent(deviceId, event.id);
      }
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

  private async listEvents(device: DeviceResponse): Promise<GalleryEvent[]> {
    // TODO: use an action
    const command = `ls -1 /gallery/*.jpg`;

    try {
      const output = await runCommandOnDevice(device, command);

      return output
        .split("\n")
        .filter(Boolean)
        .map((path) => {
          const id = path.split("/").pop()?.replace(".jpg", "") || "";
          return {
            id,
            path,
            thumbnail: path,
          };
        });
    } catch (error) {
      logger.debug(JSON.stringify(error, null, 2));
      if (
        error instanceof _ShellError &&
        error.stderr.toString().includes("No such file or directory")
      ) {
        return [];
      }
      throw error;
    }
  }

  private async getExistingEvent(
    deviceId: string,
    eventId: string
  ): Promise<GalleryResponse | null> {
    const result = await pb
      .collection("gallery")
      .getFullList<GalleryResponse>(1, {
        filter: `device = "${deviceId}" && id = "${eventId}"`,
      });

    return result[0] || null;
  }

  private async downloadThumbnail(
    device: DeviceResponse,
    event: GalleryEvent
  ): Promise<Buffer> {
    const deviceDir = join(GALLERY_BASE_PATH, device.id);
    if (!existsSync(deviceDir)) {
      mkdirSync(deviceDir, { recursive: true });
    }

    const thumbnailPath = join(deviceDir, `${event.id}.jpg`);

    // Download the thumbnail file from the device to local storage
    const command = device.information?.password
      ? `sshpass -p ${device.information.password} scp -o StrictHostKeyChecking=no ${device.information?.user}@${device.information?.host}:${event.thumbnail} ${thumbnailPath}`
      : `scp -o StrictHostKeyChecking=no ${device.information?.user}@${device.information?.host}:${event.thumbnail} ${thumbnailPath}`;
    await $`${{ raw: command }}`.text();

    // Read the file content and return it as a Buffer
    return readFileSync(thumbnailPath);
  }

  private async createGalleryRecord(
    deviceId: string,
    event: GalleryEvent,
    thumbnailContent: Buffer
  ) {
    logger.info(`creating gallery record for event: ${event.id}`);
    await pb.collection("gallery").create({
      device: deviceId,
      event_id: event.id,
      name: event.path,
      thumbnail: new File([thumbnailContent], event.path),
    });
  }

  public async pullEvent(deviceId: string, eventId: string): Promise<void> {
    const device = await this.getDevice(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    const galleryEvent = await this.getExistingEvent(deviceId, eventId);
    if (!galleryEvent) {
      throw new Error(`Gallery event ${eventId} not found`);
    }
    logger.info(galleryEvent);
    const eventFilePath = galleryEvent.name.replace(".jpg", ".mp4");
    const deviceDir = join(GALLERY_BASE_PATH, device.id);
    const videoPath = join(deviceDir, `${galleryEvent.event_id}.mp4`);

    // Use sshpass if password is available, otherwise use regular scp
    const command = device.information?.password
      ? `sshpass -p ${device.information.password} scp -o StrictHostKeyChecking=no ${device.information?.user}@${device.information?.host}:${eventFilePath} ${videoPath}`
      : `scp -o StrictHostKeyChecking=no ${device.information?.user}@${device.information?.host}:${eventFilePath} ${videoPath}`;

    logger.info(`command: ${command}`);
    const output = await $`${{ raw: command }}`.text();
    logger.info(`output: ${output}`);

    logger.info(`Successfully pulled video from device`);
    // Read the video file content
    const videoContent = readFileSync(videoPath);

    await pb.collection("gallery").update(galleryEvent.id, {
      event: new File([videoContent], `${galleryEvent.event_id}.mp4`),
    });

    // Delete both video and thumbnail from device after successful pull
    try {
      await runCommandOnDevice(
        device,
        `rm ${eventFilePath} ${galleryEvent.name}`
      );
      logger.info(`Successfully deleted event files from device: ${eventId}`);
    } catch (error) {
      logger.error(`Failed to delete event files from device: ${error}`);
      // Don't throw the error as the files were already pulled successfully
    }
  }

  public async getGalleryStats(deviceId: string): Promise<{
    totalEvents: number;
    newEvents: number;
    pulledEvents: number;
    viewedEvents: number;
  }> {
    const events = await pb.collection("gallery").getFullList<GalleryResponse>({
      filter: `device = "${deviceId}"`,
    });

    return {
      totalEvents: events.length,
      newEvents: events.filter((e) => !e.event).length,
      pulledEvents: events.filter((e) => e.event).length,
      viewedEvents: events.filter((e) => e.viewed).length,
    };
  }
}
