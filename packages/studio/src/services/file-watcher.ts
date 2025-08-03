import { logger } from "@/logger";
import { pb } from "@/pocketbase";
import type { DeviceResponse } from "@joystick/core";
import { existsSync, mkdirSync, renameSync, statSync } from "fs";
import { watch } from "fs/promises";
import { basename, join } from "path";
import { GALLERY_BASE_PATH } from "../config";
import { GalleryService } from "../gallery";

export class FileWatcherService {
  private static instance: FileWatcherService;
  private galleryService: GalleryService;
  private watchers: Map<string, { abort: AbortController; deviceId: string }> =
    new Map();
  private isInitialized = false;
  private processingFiles = new Set<string>();
  private maxConcurrentProcessing = 3;

  private constructor() {
    this.galleryService = GalleryService.getInstance();
  }

  public static getInstance(): FileWatcherService {
    if (!FileWatcherService.instance) {
      FileWatcherService.instance = new FileWatcherService();
    }
    return FileWatcherService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn("FileWatcherService already initialized");
      return;
    }

    try {
      const devices = await pb
        .collection("devices")
        .getFullList<DeviceResponse>();

      for (const device of devices) {
        await this.setupDeviceDirectories(device.id);
        this.startWatcher(device.id);
      }

      this.isInitialized = true;
      logger.info("File watchers initialized for all devices");
    } catch (error) {
      logger.error("Failed to initialize file watchers:", error);
      throw error;
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

  public async addDevice(deviceId: string): Promise<void> {
    try {
      await this.setupDeviceDirectories(deviceId);
      await this.startWatcher(deviceId);
      logger.info(`Added file watcher for device ${deviceId}`);
    } catch (error) {
      logger.error(`Failed to add file watcher for device ${deviceId}:`, error);
      throw error;
    }
  }

  public async removeDevice(deviceId: string): Promise<void> {
    try {
      await this.stopWatcher(deviceId);
      logger.info(`Removed file watcher for device ${deviceId}`);
    } catch (error) {
      logger.error(
        `Failed to remove file watcher for device ${deviceId}:`,
        error
      );
      throw error;
    }
  }

  public async refreshWatchers(): Promise<void> {
    try {
      await this.stopAllWatchers();

      const devices = await pb
        .collection("devices")
        .getFullList<DeviceResponse>();

      for (const device of devices) {
        await this.setupDeviceDirectories(device.id);
        await this.startWatcher(device.id);
      }

      this.isInitialized = true;
      logger.info("Refreshed file watchers for all devices");
    } catch (error) {
      logger.error("Failed to refresh file watchers:", error);
      throw error;
    }
  }

  public async syncWatchers(): Promise<void> {
    try {
      const devices = await pb
        .collection("devices")
        .getFullList<DeviceResponse>();

      const deviceIds = new Set(devices.map((device) => device.id));
      const currentWatcherIds = new Set(this.watchers.keys());

      for (const device of devices) {
        if (!currentWatcherIds.has(device.id)) {
          await this.setupDeviceDirectories(device.id);
          await this.startWatcher(device.id);
          logger.info(`Added watcher for new device ${device.id}`);
        }
      }

      for (const watcherDeviceId of Array.from(currentWatcherIds)) {
        if (!deviceIds.has(watcherDeviceId)) {
          await this.stopWatcher(watcherDeviceId);
          logger.info(`Removed watcher for deleted device ${watcherDeviceId}`);
        }
      }

      logger.info("Synced file watchers with current device list");
    } catch (error) {
      logger.error("Failed to sync file watchers:", error);
      throw error;
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
      if (error instanceof Error && error.name !== "AbortError") {
        logger.error(`Error watching directory for device ${deviceId}:`, error);
      }
    }
  }

  private async processNewFile(deviceId: string, filename: string) {
    const fileKey = `${deviceId}:${filename}`;

    if (this.processingFiles.has(fileKey)) {
      logger.debug(
        `File ${filename} for device ${deviceId} is already being processed`
      );
      return;
    }

    if (this.processingFiles.size >= this.maxConcurrentProcessing) {
      logger.debug(
        `Too many files being processed, skipping ${filename} for device ${deviceId}`
      );
      return;
    }

    this.processingFiles.add(fileKey);

    try {
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

      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!existsSync(incomingPath)) {
        return;
      }

      const stats = statSync(incomingPath);
      const eventId = this.galleryService.generateEventId(filename);
      const extension = filename.split(".").pop()?.toLowerCase() || "";
      const mediaType = this.galleryService.getMediaType(extension);

      const thumbName = `${basename(filename, `.${extension}`)}.jpg`;
      const thumbPath = join(
        GALLERY_BASE_PATH,
        deviceId,
        "thumbnails",
        thumbName
      );
      const hasThumb = existsSync(thumbPath);

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

      renameSync(incomingPath, processedPath);

      logger.info(`Processed new file ${filename} for device ${deviceId}`);
    } catch (error) {
      logger.error(
        `Error processing file ${filename} for device ${deviceId}:`,
        error
      );
    } finally {
      this.processingFiles.delete(fileKey);
    }
  }

  public async stopWatcher(deviceId: string) {
    const watcher = this.watchers.get(deviceId);
    if (watcher) {
      try {
        watcher.abort.abort();
      } catch (error) {
        logger.warn(`Error aborting watcher for device ${deviceId}:`, error);
      }
      this.watchers.delete(deviceId);
      logger.info(`Stopped watcher for device ${deviceId}`);
    }
  }

  public async stopAllWatchers() {
    for (const [deviceId, watcher] of Array.from(this.watchers.entries())) {
      try {
        watcher.abort.abort();
      } catch (error) {
        logger.warn(`Error aborting watcher for device ${deviceId}:`, error);
      }
      this.watchers.delete(deviceId);
    }
    this.isInitialized = false;
    this.processingFiles.clear();
    logger.info("Stopped all file watchers");
  }

  public getWatcherStatus(): { deviceId: string; active: boolean }[] {
    return Array.from(this.watchers.keys()).map((deviceId) => ({
      deviceId,
      active: true,
    }));
  }

  public isWatcherActive(deviceId: string): boolean {
    return this.watchers.has(deviceId);
  }

  public async cleanup(): Promise<void> {
    try {
      await this.stopAllWatchers();
      logger.info("FileWatcherService cleanup completed");
    } catch (error) {
      logger.error("Error during FileWatcherService cleanup:", error);
      throw error;
    }
  }

  public async cleanupOrphanedWatchers(): Promise<void> {
    try {
      const devices = await pb
        .collection("devices")
        .getFullList<DeviceResponse>();

      const deviceIds = new Set(devices.map((device) => device.id));
      const orphanedWatchers: string[] = [];

      for (const [watcherDeviceId] of Array.from(this.watchers.entries())) {
        if (!deviceIds.has(watcherDeviceId)) {
          orphanedWatchers.push(watcherDeviceId);
        }
      }

      for (const deviceId of orphanedWatchers) {
        await this.stopWatcher(deviceId);
        logger.info(`Cleaned up orphaned watcher for device ${deviceId}`);
      }

      if (orphanedWatchers.length > 0) {
        logger.info(`Cleaned up ${orphanedWatchers.length} orphaned watchers`);
      }
    } catch (error) {
      logger.error("Error cleaning up orphaned watchers:", error);
      throw error;
    }
  }
}
