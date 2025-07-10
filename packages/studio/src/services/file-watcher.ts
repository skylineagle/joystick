import { logger } from "@/logger";
import { pb } from "@/pocketbase";
import type { DeviceResponse } from "@joystick/core";
import { watch } from "fs/promises";
import { existsSync, mkdirSync, renameSync, statSync } from "fs";
import { basename, dirname, join } from "path";
import { GalleryService } from "../gallery";
import { GALLERY_BASE_PATH } from "../config";

export class FileWatcherService {
  private static instance: FileWatcherService;
  private galleryService: GalleryService;
  private watchers: Map<string, { abort: AbortController; deviceId: string }> =
    new Map();

  private constructor() {
    this.galleryService = GalleryService.getInstance();
    this.initializeWatchers();
  }

  public static getInstance(): FileWatcherService {
    if (!FileWatcherService.instance) {
      FileWatcherService.instance = new FileWatcherService();
    }
    return FileWatcherService.instance;
  }

  private async initializeWatchers() {
    try {
      const devices = await pb
        .collection("devices")
        .getFullList<DeviceResponse>();

      for (const device of devices) {
        await this.setupDeviceDirectories(device.id);
        await this.startWatcher(device.id);
      }

      logger.info("File watchers initialized for all devices");
    } catch (error) {
      logger.error("Failed to initialize file watchers:", error);
    }
  }

  public async setupDeviceDirectories(deviceId: string): Promise<void> {
    const devicePath = join(GALLERY_BASE_PATH, deviceId);
    const paths = [
      join(devicePath, "incoming"),
      join(devicePath, "processed"),
      join(devicePath, "thumbnails"),
    ];

    for (const path of paths) {
      if (!existsSync(path)) {
        mkdirSync(path, { recursive: true });
      }
    }
  }

  private async startWatcher(deviceId: string) {
    const incomingPath = join(GALLERY_BASE_PATH, deviceId, "incoming");
    const abort = new AbortController();

    try {
      const watcher = watch(incomingPath, { signal: abort.signal });
      this.watchers.set(deviceId, { abort, deviceId });

      logger.info(`Started watching ${incomingPath} for device ${deviceId}`);

      for await (const event of watcher) {
        if (event.filename) {
          await this.processNewFile(deviceId, event.filename);
        }
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        logger.error(`Error watching directory for device ${deviceId}:`, error);
      }
    }
  }

  private async processNewFile(deviceId: string, filename: string) {
    const incomingPath = join(
      GALLERY_BASE_PATH,
      deviceId,
      "incoming",
      filename
    );
    const processedPath = join(
      GALLERY_BASE_PATH,
      deviceId,
      "processed",
      filename
    );

    try {
      // Wait a bit to ensure file is completely written
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if file still exists (wasn't deleted/moved)
      if (!existsSync(incomingPath)) {
        return;
      }

      const stats = statSync(incomingPath);
      const eventId = this.galleryService.generateEventId(filename);
      const extension = filename.split(".").pop()?.toLowerCase() || "";
      const mediaType = this.galleryService.getMediaType(extension);

      // Check for thumbnail
      const thumbName = `${basename(filename, `.${extension}`)}.jpg`;
      const thumbPath = join(
        GALLERY_BASE_PATH,
        deviceId,
        "thumbnails",
        thumbName
      );
      const hasThumb = existsSync(thumbPath);

      // Create gallery record
      await this.galleryService.createGalleryRecord(
        deviceId,
        {
          id: eventId,
          path: filename,
          mediaType,
          hasThumb,
          fileSize: stats.size,
          metadata: {},
          thumbnail: hasThumb ? thumbName : undefined,
        },
        null
      );

      // Move file to processed directory
      renameSync(incomingPath, processedPath);

      logger.info(`Processed new file ${filename} for device ${deviceId}`);
    } catch (error) {
      logger.error(
        `Error processing file ${filename} for device ${deviceId}:`,
        error
      );
    }
  }

  public async stopWatcher(deviceId: string) {
    const watcher = this.watchers.get(deviceId);
    if (watcher) {
      watcher.abort.abort();
      this.watchers.delete(deviceId);
      logger.info(`Stopped watcher for device ${deviceId}`);
    }
  }

  public async stopAllWatchers() {
    for (const [deviceId, watcher] of this.watchers) {
      watcher.abort.abort();
      this.watchers.delete(deviceId);
    }
    logger.info("Stopped all file watchers");
  }
}
