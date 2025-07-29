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
  private isInitialized = false;

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
      // Stop all existing watchers
      await this.stopAllWatchers();

      // Get current devices and restart watchers
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
      // Get current devices from database
      const devices = await pb
        .collection("devices")
        .getFullList<DeviceResponse>();

      const deviceIds = new Set(devices.map((device) => device.id));
      const currentWatcherIds = new Set(this.watchers.keys());

      // Add watchers for new devices
      for (const device of devices) {
        if (!currentWatcherIds.has(device.id)) {
          await this.setupDeviceDirectories(device.id);
          await this.startWatcher(device.id);
          logger.info(`Added watcher for new device ${device.id}`);
        }
      }

      // Remove watchers for deleted devices
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
    for (const [deviceId, watcher] of Array.from(this.watchers.entries())) {
      watcher.abort.abort();
      this.watchers.delete(deviceId);
    }
    this.isInitialized = false;
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
      // Get current devices from database
      const devices = await pb
        .collection("devices")
        .getFullList<DeviceResponse>();

      const deviceIds = new Set(devices.map((device) => device.id));
      const orphanedWatchers: string[] = [];

      // Check for watchers that don't have corresponding devices
      for (const [watcherDeviceId] of Array.from(this.watchers.entries())) {
        if (!deviceIds.has(watcherDeviceId)) {
          orphanedWatchers.push(watcherDeviceId);
        }
      }

      // Remove orphaned watchers
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
