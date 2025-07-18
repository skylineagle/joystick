import { logger } from "@/logger";
import { pb } from "@/pocketbase";
import type {
  ActionsResponse,
  DevicesResponse,
  UsersResponse,
} from "@joystick/core";
import { Collections } from "@joystick/core";
import { Elysia } from "elysia";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import pino from "pino";

// Base console logger using Pino
const pinoLogger = pino({
  level: "debug",
  transport:
    process.env.LOG_FORMAT !== "json"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
          },
        }
      : undefined,
});

// Check if file logging is enabled with directory path
const LOG_DIR_PATH = Bun.env.MONITOR_LOG;

// Check if expanded logging is enabled (defaults to true)
const EXPANDED_LOGGING = Bun.env.EXPANDED_LOGGING !== "false";

// Performance threshold in ms (warn if logging takes longer than this)
const PERF_THRESHOLD_MS = parseInt(Bun.env.LOG_PERF_THRESHOLD || "100", 10);

// Ensure the log directory exists if file logging is enabled
if (LOG_DIR_PATH) {
  try {
    const dirFile = Bun.file(LOG_DIR_PATH);
    const exists = await dirFile.exists();
    if (!exists) {
      // Use Node.js fs for directory creation as Bun doesn't have mkdir
      mkdirSync(LOG_DIR_PATH, { recursive: true });
    }
  } catch (error) {
    console.error(`Failed to create log directory: ${LOG_DIR_PATH}`, error);
  }
}

interface LogContext {
  userId?: string;
  deviceId?: string;
  actionId?: string;
  parameters?: Record<string, unknown>;
  result?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  startTime?: number;
}

// Structure for database logs
interface ActionLogEntry {
  timestamp: string;
  user: string;
  device: string;
  action: string;
  parameters: Record<string, unknown>;
  result: Record<string, unknown>;
  ip_address: string;
  user_agent: string;
  execution_time: number;
}

// Structure for file logs with embedded objects
interface FileLogEntry {
  timestamp: string;
  parameters: Record<string, unknown>;
  result: Record<string, unknown>;
  ip_address: string;
  user_agent: string;
  execution_time: number;
  user: Partial<UsersResponse> | string;
  device: Partial<DevicesResponse> | string;
  action: Partial<ActionsResponse> | string;
}

class EnhancedLogger {
  private context: LogContext = {};
  private pino: pino.Logger;

  constructor() {
    this.pino = pinoLogger;
  }

  setContext(context: Partial<LogContext>) {
    this.context = { ...this.context, ...context };
    return this;
  }

  clearContext() {
    this.context = {};
    return this;
  }

  startActionTimer() {
    this.context.startTime = performance.now();
    return this;
  }

  getExecutionTime(): number {
    if (!this.context.startTime) return 0;
    return Math.round(performance.now() - this.context.startTime);
  }

  /**
   * Transform the database log entry into the format for file logs
   */
  private async createFileLogEntry(
    logEntry: ActionLogEntry
  ): Promise<FileLogEntry> {
    const startTime = performance.now();
    // Start with a copy of the database log entry structure
    const fileEntry: FileLogEntry = {
      timestamp: logEntry.timestamp,
      parameters: logEntry.parameters,
      result: logEntry.result,
      ip_address: logEntry.ip_address,
      user_agent: logEntry.user_agent,
      execution_time: logEntry.execution_time,
      user: logEntry.user,
      device: logEntry.device,
      action: logEntry.action,
    };

    try {
      // Only fetch expanded data if enabled
      if (EXPANDED_LOGGING) {
        // Fetch user details
        if (logEntry.user && logEntry.user !== "system") {
          try {
            const user = await pb
              .collection(Collections.Users)
              .getOne(logEntry.user);
            if (user) {
              // Filter sensitive fields from user data
              const { password, tokenKey, ...safeUserData } = user;
              fileEntry.user = safeUserData;
            }
          } catch (error) {
            this.debug(`Could not fetch user details for ID ${logEntry.user}`);
          }
        }

        // Fetch device details
        if (logEntry.device && logEntry.device !== "system") {
          try {
            const device = await pb
              .collection(Collections.Devices)
              .getOne(logEntry.device, {
                expand: "device",
              });
            if (device) {
              fileEntry.device = device;
            }
          } catch (error) {
            this.debug(
              `Could not fetch device details for ID ${logEntry.device}`
            );
          }
        }

        // Fetch action details
        if (logEntry.action) {
          try {
            const action = await pb
              .collection(Collections.Actions)
              .getOne(logEntry.action);
            if (action) {
              fileEntry.action = action;
            }
          } catch (error) {
            this.debug(
              `Could not fetch action details for ID ${logEntry.action}`
            );
          }
        }
      }
    } catch (error) {
      this.warn({ error: String(error) }, "Error enriching log data");
    }

    // Check performance
    const duration = performance.now() - startTime;
    if (duration > PERF_THRESHOLD_MS) {
      this.warn(
        { duration: Math.round(duration) },
        `Log enrichment exceeded performance threshold (${PERF_THRESHOLD_MS}ms)`
      );
    }

    return fileEntry;
  }

  private async writeToFile(logEntry: ActionLogEntry): Promise<void> {
    if (!LOG_DIR_PATH) return;

    const logStart = performance.now();
    try {
      // Create the file log entry with object format
      const fileEntry = await this.createFileLogEntry(logEntry);

      const filename = `action_log_${Date.now()}.json`;
      const filePath = join(LOG_DIR_PATH, filename);

      // Format as JSON
      const logContent = JSON.stringify(fileEntry, null, 2);

      // Write to a new file
      writeFileSync(filePath, logContent);

      // Check performance
      const duration = performance.now() - logStart;
      if (duration > PERF_THRESHOLD_MS) {
        this.warn(
          { duration: Math.round(duration) },
          `File logging exceeded performance threshold (${PERF_THRESHOLD_MS}ms)`
        );
      }
    } catch (error) {
      this.error(
        { error: String(error) },
        `Failed to write log to file in directory: ${LOG_DIR_PATH}`
      );
    }
  }

  async logActionToDb() {
    try {
      if (
        !this.context.userId ||
        !this.context.deviceId ||
        !this.context.actionId
      ) {
        this.warn("Missing required context for logging action to database");
        return;
      }

      const executionTime = this.getExecutionTime();
      logger.info(executionTime);

      const logEntry: ActionLogEntry = {
        timestamp: new Date().toISOString(),
        user: this.context.userId,
        device: this.context.deviceId,
        action: this.context.actionId,
        parameters: this.context.parameters || {},
        result: this.context.result || {},
        ip_address: this.context.ipAddress || "unknown",
        user_agent: this.context.userAgent || "unknown",
        execution_time: executionTime,
      };

      // Log to PocketBase
      await pb.collection(Collections.ActionLogs).create(logEntry);

      // Also log to file if enabled
      await this.writeToFile(logEntry);
    } catch (error) {
      this.error({ error }, "Failed to log action to database");
    }
  }

  debug(obj: Record<string, unknown>, msg?: string): void;
  debug(msg: string): void;
  debug(objOrMsg: string | Record<string, unknown>, msg?: string) {
    if (typeof objOrMsg === "string") {
      this.pino.debug(objOrMsg);
    } else {
      this.pino.debug(objOrMsg, msg);
    }
  }

  info(obj: Record<string, unknown>, msg?: string): void;
  info(msg: string): void;
  info(objOrMsg: string | Record<string, unknown>, msg?: string) {
    if (typeof objOrMsg === "string") {
      this.pino.info(objOrMsg);
    } else {
      this.pino.info(objOrMsg, msg);
    }
  }

  warn(obj: Record<string, unknown>, msg?: string): void;
  warn(msg: string): void;
  warn(objOrMsg: string | Record<string, unknown>, msg?: string) {
    if (typeof objOrMsg === "string") {
      this.pino.warn(objOrMsg);
    } else {
      this.pino.warn(objOrMsg, msg);
    }
  }

  error(obj: Record<string, unknown>, msg?: string): void;
  error(msg: string): void;
  error(objOrMsg: string | Record<string, unknown>, msg?: string) {
    if (typeof objOrMsg === "string") {
      this.pino.error(objOrMsg);
    } else {
      this.pino.error(objOrMsg, msg);
    }
  }

  // Helper methods for common action logging patterns
  async logCommandAction({
    userId,
    deviceId,
    actionId,
    parameters,
    result,
    success = true,
  }: {
    userId: string;
    deviceId: string;
    actionId: string;
    parameters?: Record<string, unknown>;
    result?: Record<string, unknown>;
    success?: boolean;
  }) {
    this.setContext({
      userId,
      deviceId,
      actionId,
      parameters,
      result: {
        ...result,
        success,
      },
    });

    await this.logActionToDb();
    return this;
  }

  async logSystemAction({
    actionName,
    details,
    success = true,
  }: {
    actionName: string;
    details?: Record<string, unknown>;
    success?: boolean;
  }) {
    try {
      // First, try to find the system action by name
      const actionResult = await pb.collection("actions").getFullList(1, {
        filter: `name="${actionName}" && system=true`,
      });

      if (actionResult.length !== 1) {
        this.warn(`System action "${actionName}" not found`);
        return this;
      }

      // Use system user ID if available
      const systemUserId = pb.authStore.model?.id || "system";

      await this.logCommandAction({
        userId: systemUserId,
        deviceId: "system", // Using "system" as a placeholder
        actionId: actionResult[0].id,
        parameters: details,
        result: { success },
      });
    } catch (error) {
      this.error(
        { error: String(error) },
        `Failed to log system action: ${actionName}`
      );
    }

    return this;
  }

  // Helper method to log directly to file without requiring PocketBase
  async logToFileOnly(entry: {
    action: string;
    userId?: string;
    deviceId?: string;
    parameters?: Record<string, unknown>;
    result?: Record<string, unknown>;
    success?: boolean;
  }): Promise<void> {
    if (!LOG_DIR_PATH) return;

    const logEntry: ActionLogEntry = {
      timestamp: new Date().toISOString(),
      user: entry.userId || "system",
      device: entry.deviceId || "system",
      action: entry.action,
      parameters: entry.parameters || {},
      result: {
        ...(entry.result || {}),
        success: entry.success !== undefined ? entry.success : true,
      },
      ip_address: this.context.ipAddress || "unknown",
      user_agent: this.context.userAgent || "unknown",
      execution_time: this.getExecutionTime(),
    };

    try {
      // Use our writeToFile method
      await this.writeToFile(logEntry);

      // Log to console
      this.info(
        {
          action: entry.action,
          userId: entry.userId,
          deviceId: entry.deviceId,
        },
        "Action logged to file"
      );
    } catch (error) {
      this.error(
        { error: String(error) },
        `Failed to write log to file in directory: ${LOG_DIR_PATH}`
      );
    }
  }
}

export const enhancedLogger = new EnhancedLogger();

// Middleware for Elysia to extract request context
export function setupLoggingMiddleware(): Elysia {
  return new Elysia({ name: "logging" })
    .onRequest(({ request }) => {
      enhancedLogger.setContext({
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      });

      // Extract auth token from request if present
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        try {
          // Set auth details in the PocketBase instance if needed
          if (token && !pb.authStore.isValid) {
            pb.authStore.save(token, null);
          }

          // Get user ID from auth store
          const userId = pb.authStore.model?.id;
          if (userId) {
            enhancedLogger.setContext({ userId });
            enhancedLogger.debug({ userId }, "Authenticated request");
          }
        } catch (error) {
          enhancedLogger.warn(
            { error: String(error) },
            "Failed to process auth token"
          );
        }
      }

      enhancedLogger.info(
        {
          method: request.method,
          path: request.url,
          userAgent: request.headers.get("user-agent"),
        },
        "Incoming request"
      );
    })
    .onError(({ code, error, request }) => {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      enhancedLogger.error(
        {
          code,
          error,
          path: request.url,
        },
        `Request error occurred + ${errorMessage}`
      );

      return { success: false, error: errorMessage };
    });
}
