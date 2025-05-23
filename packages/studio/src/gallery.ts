import { logger } from "@/logger";
import { pb } from "@/pocketbase";
import type {
  DeviceResponse,
  GalleryResponse,
  RunResponse,
} from "@joystick/core";
import {
  getActiveDeviceConnection,
  JOYSTICK_API_URL,
  runCommandOnDevice,
} from "@joystick/core";
import { $ } from "bun";
import { Baker } from "cronbake";
import { existsSync, mkdirSync, readFileSync } from "fs";
import { join } from "path";

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
    logger.info(JSON.stringify(config, null, 2));
    if (this.intervals.has(deviceId)) {
      this.stopGalleryService(deviceId);
    }

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
    logger.info(
      `Processing gallery events for device ${deviceId}, autoPull: ${autoPull}`
    );
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
    const action = await pb
      .collection("actions")
      .getFirstListItem(`name = "list-events"`);

    if (!action) {
      logger.error(`Action "list-events" not found`);
      throw new Error(`Action "list-events" not found`);
    }

    const runResult = await pb.collection("run").getFullList<RunResponse>(1, {
      filter: `action = "${action.id}" && device = "${device.expand?.device.id}"`,
    });

    if (runResult.length === 0) {
      logger.error(`Action "list-events" not found for device ${device.name}`);
      throw new Error(
        `Action "list-events" not found for device ${device.name}`
      );
    }

    const run = runResult[0];
    const command =
      run.command || Bun.env.LIST_EVENTS_COMMAND || `ls -1 /gallery/*.jpg`;

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
    } catch (error: any) {
      if (
        error?.stderr &&
        typeof error.stderr.toString === "function" &&
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
        filter: `device = "${deviceId}" && event_id = "${eventId}"`,
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

    if (!device.information) {
      throw new Error(`Device information not found for device ${device.id}`);
    }
    const { host: activeHost } = getActiveDeviceConnection(device.information);
    if (!activeHost) {
      throw new Error(`Active host not found for device ${device.id}`);
    }

    // Download the thumbnail file from the device to local storage
    const command = device.information.password
      ? `sshpass -p ${device.information.password} scp -o StrictHostKeyChecking=no ${device.information.user}@${activeHost}:${event.thumbnail} ${thumbnailPath}`
      : `scp -o StrictHostKeyChecking=no ${device.information.user}@${activeHost}:${event.thumbnail} ${thumbnailPath}`;
    await $`${{ raw: command }}`.text();

    // Read the file content and return it as a Buffer
    return readFileSync(thumbnailPath);
  }

  private async createGalleryRecord(
    deviceId: string,
    event: GalleryEvent,
    thumbnailContent: Buffer
  ) {
    await pb.collection("gallery").create({
      device: deviceId,
      event_id: event.id,
      name: event.path,
      thumbnail: new File([thumbnailContent], event.path),
    });
  }

  private async removeEventFromDevice(
    device: DeviceResponse,
    event: GalleryResponse
  ): Promise<void> {
    const response = await fetch(
      `${JOYSTICK_API_URL}/api/run/${device.id}/delete-event`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ event: event.event_id }),
      }
    );

    if (!response.ok) {
      logger.error(`Failed to toggle mode: ${response.statusText}`);
      throw new Error(`Failed to toggle mode: ${response.statusText}`);
    }
  }

  public async pullEvent(deviceId: string, eventId: string): Promise<void> {
    logger.info(`Pulling event ${eventId} for device ${deviceId}`);
    const device = await this.getDevice(deviceId);
    if (!device) {
      logger.error(`Device ${deviceId} not found`);
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
    const videoPath = join(deviceDir, `${event.event_id}.mp4`);
    const eventFilePath = event.name.replace(".jpg", ".mp4");

    // Download the video file from the device to local storage
    const command = device.information.password
      ? `sshpass -p ${device.information.password} scp -o StrictHostKeyChecking=no ${device.information.user}@${activeHost}:${eventFilePath} ${videoPath}`
      : `scp -o StrictHostKeyChecking=no ${device.information.user}@${activeHost}:${eventFilePath} ${videoPath}`;
    await $`${{ raw: command }}`.text();

    // Update gallery record with video path
    logger.info(`Successfully pulled video from device`);
    // Read the video file content
    const videoContent = readFileSync(videoPath);

    await pb.collection("gallery").update(event.id, {
      event: new File([videoContent], `${event.event_id}.mp4`),
    });

    try {
      await this.removeEventFromDevice(device, event);
      logger.info(`Successfully deleted event files from device: ${eventId}`);
    } catch (error) {
      logger.error(`Failed to delete event files from device: ${error}`);
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
