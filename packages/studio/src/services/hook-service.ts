import { logger } from "@/logger";
import { pb } from "@/pocketbase";
import type { DeviceResponse } from "@joystick/core";
import { runCommandOnDevice } from "@joystick/core";
import { $ } from "bun";
import { join } from "path";
import { GALLERY_BASE_PATH } from "../config";

interface HookContext {
  deviceId: string;
  eventId?: string;
  event?: any;
  config?: any;
  events?: any[];
  totalProcessed?: number;
  localPath?: string;
  fileStats?: any;
  extension?: string;
}

export class HookService {
  private static instance: HookService;

  private constructor() {}

  public static getInstance(): HookService {
    if (!HookService.instance) {
      HookService.instance = new HookService();
    }
    return HookService.instance;
  }

  public async executeHooks(
    eventType: string,
    context: HookContext
  ): Promise<void> {
    try {
      const hooks = await pb.collection("studio_hooks").getFullList({
        filter: `event_type = "${eventType}" && enabled = true`,
        expand: "device,action",
      });

      const relevantHooks = hooks.filter(
        (hook) => !hook.device || hook.device === context.deviceId
      );

      if (relevantHooks.length === 0) {
        logger.debug(`No hooks configured for event type: ${eventType}`);
        return;
      }

      logger.info(
        `Executing ${relevantHooks.length} hooks for event type: ${eventType}`
      );

      await Promise.allSettled(
        relevantHooks.map((hook) => this.executeHook(hook, context))
      );
    } catch (error) {
      logger.error(`Error executing hooks for event type ${eventType}:`, error);
    }
  }

  private async executeHook(hook: any, context: HookContext): Promise<void> {
    try {
      logger.debug(`Executing hook: ${hook.hook_name}`, {
        hook: hook.hook_name,
        context,
      });

      const mergedParams = this.mergeParameters(hook.parameters, context);

      // Check if this is a local hook using the executionType column
      const isLocalHook = hook.executionType === "local";

      if (isLocalHook) {
        await this.executeLocalCommand(hook, mergedParams, context);
      } else {
        await this.executeDeviceCommand(hook, mergedParams, context);
      }
    } catch (error) {
      logger.info(error);
      logger.error(`Hook execution failed: ${hook.hook_name}`, error);
    }
  }

  private async executeLocalCommand(
    hook: any,
    params: Record<string, any>,
    context: HookContext
  ): Promise<void> {
    try {
      const command = this.buildCommand(
        hook.parameters?.command || "echo 'No command specified'",
        params
      );

      logger.info(`Executing local hook: ${hook.hook_name}`, {
        command,
        deviceId: context.deviceId,
      });

      const result = await $`sh -c ${command}`.text();

      logger.info(`Local hook ${hook.hook_name} executed successfully`, {
        result: result.substring(0, 200) + (result.length > 200 ? "..." : ""),
      });
    } catch (error) {
      logger.error(`Local hook execution failed: ${hook.hook_name}`, error);
      throw error;
    }
  }

  private async executeDeviceCommand(
    hook: any,
    params: Record<string, any>,
    context: HookContext
  ): Promise<void> {
    try {
      const device = await this.getDevice(context.deviceId);
      if (!device) {
        logger.error(
          `Device ${context.deviceId} not found for hook ${hook.hook_name}`
        );
        return;
      }

      const command = this.buildCommand(
        hook.parameters?.command || "echo 'No command specified'",
        params
      );

      logger.info(
        `Executing device hook action: ${hook.hook_name} on device: ${device.name}`
      );

      const result = await runCommandOnDevice(device, command);

      logger.info(`Device hook ${hook.hook_name} executed successfully`, {
        device: device.name,
        result: result.substring(0, 200) + (result.length > 200 ? "..." : ""),
      });
    } catch (error) {
      logger.error(`Device hook execution failed: ${hook.hook_name}`, error);
      throw error;
    }
  }

  private async getDevice(deviceId: string): Promise<DeviceResponse | null> {
    try {
      const result = await pb
        .collection("devices")
        .getFullList<DeviceResponse>(1, {
          filter: `id = "${deviceId}"`,
          expand: "device",
        });

      return result[0] || null;
    } catch (error) {
      logger.error(`Error fetching device ${deviceId}:`, error);
      return null;
    }
  }

  private mergeParameters(
    hookParams: any,
    context: HookContext
  ): Record<string, any> {
    const merged: Record<string, any> = {
      deviceId: context.deviceId,
      eventId: context.eventId,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split("T")[0],
    };

    if (hookParams && typeof hookParams === "object") {
      Object.assign(merged, hookParams);
    }

    // Handle after_file_downloaded hook context
    if (context.localPath) {
      merged.localPath = context.localPath;
      merged.sourcePath = context.localPath; // Alias for backward compatibility
      merged.fileStats = context.fileStats;
      merged.extension = context.extension;
    }

    if (context.event) {
      merged.eventPath = context.event.name;
      merged.eventName = context.event.name.split("/").pop();
      merged.mediaType = context.event.media_type;
      merged.hasThumb = context.event.has_thumbnail;
      merged.fileSize = context.event.file_size;

      const extension = context.event.name?.split(".").pop() || "";
      merged.extension = extension;

      // Only set sourcePath if not already set by localPath
      if (!merged.sourcePath) {
        merged.sourcePath = join(
          GALLERY_BASE_PATH,
          context.deviceId,
          "processed",
          context.event.name || ""
        );
      }

      merged.thumbnailPath = context.event.has_thumbnail
        ? join(
            GALLERY_BASE_PATH,
            context.deviceId,
            "thumbnails",
            `${context.eventId}.jpg`
          )
        : "";
    }

    if (context.config) {
      merged.config = context.config;
    }

    if (context.totalProcessed !== undefined) {
      merged.totalProcessed = context.totalProcessed;
    }

    return merged;
  }

  private buildCommand(template: string, params: Record<string, any>): string {
    let command = template;

    for (const [key, value] of Object.entries(params)) {
      const regex = new RegExp(`{{${key}}}`, "g");
      command = command.replace(regex, String(value));
    }

    return command;
  }

  public async createHook(hookData: {
    hookName: string;
    eventType: string;
    deviceId?: string;
    actionId: string;
    parameters?: Record<string, any>;
    enabled?: boolean;
    executionType?: "local" | "device";
  }): Promise<any> {
    const hook = await pb.collection("studio_hooks").create({
      hook_name: hookData.hookName,
      event_type: hookData.eventType,
      device: hookData.deviceId,
      action: hookData.actionId,
      parameters: hookData.parameters,
      executionType: hookData.executionType || "device",
      enabled: hookData.enabled ?? true,
    });

    logger.info(`Created hook: ${hookData.hookName}`, hookData);
    return hook;
  }

  public async updateHook(
    hookId: string,
    updates: Partial<{
      hookName: string;
      eventType: string;
      deviceId?: string;
      actionId: string;
      parameters?: Record<string, any>;
      enabled: boolean;
      executionType: "local" | "device";
    }>
  ): Promise<any> {
    const updateData: any = {};

    if (updates.hookName) updateData.hook_name = updates.hookName;
    if (updates.eventType) updateData.event_type = updates.eventType;
    if (updates.deviceId !== undefined) updateData.device = updates.deviceId;
    if (updates.actionId) updateData.action = updates.actionId;
    if (updates.enabled !== undefined) updateData.enabled = updates.enabled;
    if (updates.executionType) updateData.executionType = updates.executionType;
    if (updates.parameters !== undefined)
      updateData.parameters = updates.parameters;

    const hook = await pb.collection("studio_hooks").update(hookId, updateData);
    logger.info(`Updated hook: ${hookId}`, updates);
    return hook;
  }

  public async deleteHook(hookId: string): Promise<void> {
    await pb.collection("studio_hooks").delete(hookId);
    logger.info(`Deleted hook: ${hookId}`);
  }

  public async getHooks(deviceId?: string): Promise<any[]> {
    const filter = deviceId ? `device = "${deviceId}"` : undefined;

    return await pb.collection("studio_hooks").getFullList({
      filter,
      expand: "device,action",
      sort: "-created",
    });
  }

  public async getHooksByEventType(
    eventType: string,
    deviceId?: string
  ): Promise<any[]> {
    let filter = `event_type = "${eventType}"`;
    if (deviceId) {
      filter += ` && (device = "${deviceId}" || device = "")`;
    }

    return await pb.collection("studio_hooks").getFullList({
      filter,
      expand: "device,action",
      sort: "-created",
    });
  }
}
