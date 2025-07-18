import { logger } from "@/logger";
import { pb } from "@/pocketbase";
import type {
  DeviceResponse,
  StudioHooksResponse,
  ActionsResponse,
  RunResponse,
} from "@joystick/core";
import { runCommandOnDevice } from "@joystick/core";

interface HookContext {
  deviceId: string;
  eventId?: string;
  event?: any;
  config?: any;
  events?: any[];
  totalProcessed?: number;
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
      const hooks = await pb
        .collection("studio_hooks")
        .getFullList({
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

  private async executeHook(
    hook: any,
    context: HookContext
  ): Promise<void> {
    try {
      logger.debug(`Executing hook: ${hook.hook_name}`, {
        hook: hook.hook_name,
        context,
      });

      const device = await this.getDevice(context.deviceId);
      if (!device) {
        logger.error(
          `Device ${context.deviceId} not found for hook ${hook.hook_name}`
        );
        return;
      }

      const action = await pb.collection("actions").getOne(hook.action);
      if (!action) {
        logger.error(
          `Action ${hook.action} not found for hook ${hook.hook_name}`
        );
        return;
      }

      const runConfig = await pb.collection("run").getFullList<RunResponse>({
        filter: `action = "${action.id}" && device = "${device.expand?.device.id}"`,
      });

      if (runConfig.length === 0) {
        logger.error(
          `Action ${action.name} not configured for device ${device.name} in hook ${hook.hook_name}`
        );
        return;
      }

      const run = runConfig[0];
      const mergedParams = this.mergeParameters(hook.parameters, context);
      const command = this.buildCommand(run.command, mergedParams);

      logger.info(
        `Executing hook action: ${action.name} on device: ${device.name}`
      );

      const result = await runCommandOnDevice(device, command);

      logger.info(`Hook ${hook.hook_name} executed successfully`, {
        action: action.name,
        device: device.name,
        result: result.substring(0, 200) + (result.length > 200 ? "..." : ""),
      });
    } catch (error) {
      logger.error(`Hook execution failed: ${hook.hook_name}`, error);
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
    };

    if (hookParams && typeof hookParams === "object") {
      Object.assign(merged, hookParams);
    }

    if (context.event) {
      merged.eventPath = context.event.path;
      merged.eventName = context.event.name;
      merged.mediaType = context.event.media_type;
      merged.hasThumb = context.event.has_thumbnail;
      merged.fileSize = context.event.file_size;
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
  }): Promise<any> {
    const hook = await pb.collection("studio_hooks").create({
      hook_name: hookData.hookName,
      event_type: hookData.eventType,
      device: hookData.deviceId,
      action: hookData.actionId,
      parameters: hookData.parameters,
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
    }>
  ): Promise<any> {
    const updateData: any = {};

    if (updates.hookName) updateData.hook_name = updates.hookName;
    if (updates.eventType) updateData.event_type = updates.eventType;
    if (updates.deviceId !== undefined) updateData.device = updates.deviceId;
    if (updates.actionId) updateData.action = updates.actionId;
    if (updates.parameters !== undefined)
      updateData.parameters = updates.parameters;
    if (updates.enabled !== undefined) updateData.enabled = updates.enabled;

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

    return await pb
      .collection("studio_hooks")
      .getFullList({
        filter,
        expand: "device,action",
        sort: "-created",
      });
  }
}
