import { pb } from "@/pocketbase";
import { type Notification } from "@joystick/core";
import { enhancedLogger } from "./enhanced-logger";

export interface NotificationPayload {
  id: string;
  type: "info" | "success" | "warning" | "error" | "emergency";
  title: string;
  message: string;
  timestamp: number;
  userId?: string;
  deviceId?: string;
  dismissible?: boolean;
}

export interface WebSocketNotificationMessage {
  type: "notification";
  payload: NotificationPayload;
}

export interface SendNotificationRequest {
  type?: "info" | "success" | "warning" | "error" | "emergency";
  title: string;
  message: string;
  userId?: string;
  deviceId?: string;
  dismissible?: boolean;
}

export interface SendNotificationResponse {
  success: boolean;
  notificationId?: string;
  clientsNotified?: number;
  error?: string;
}

const notificationClients = new Set<any>();

export const addNotificationClient = (ws: any) => {
  notificationClients.add(ws);
  enhancedLogger.info("Notification client connected");
};

export const removeNotificationClient = (ws: any) => {
  notificationClients.delete(ws);
  enhancedLogger.info("Notification client disconnected");
};

export const broadcastNotification = (notification: NotificationPayload) => {
  const message: WebSocketNotificationMessage = {
    type: "notification",
    payload: notification,
  };

  const messageStr = JSON.stringify(message);
  notificationClients.forEach((client) => {
    try {
      client.send(messageStr);
    } catch (error) {
      enhancedLogger.error({ error }, "Failed to send notification to client");
      notificationClients.delete(client);
    }
  });
};

export const sendNotification = async (
  request: SendNotificationRequest,
  userId: string = "system",
  userName: string = "system"
): Promise<SendNotificationResponse> => {
  const notification: Omit<NotificationPayload, "id"> = {
    type: request.type || "info",
    title: request.title,
    message: request.message,
    timestamp: Date.now(),
    userId: request.userId || userId,
    deviceId: request.deviceId,
    dismissible: request.dismissible !== false,
  };

  enhancedLogger.info(
    {
      user: { name: userName, id: userId },
      notification,
    },
    "notification"
  );

  try {
    const notificationData: Notification = {
      type: notification.type,
      title: notification.title,
      message: notification.message,
      seen: [],
    };

    if (notification.deviceId) {
      try {
        await pb.collection("devices").getOne(notification.deviceId);
        notificationData.device = notification.deviceId;
      } catch (error) {
        enhancedLogger.warn(
          { deviceId: notification.deviceId },
          "Device not found, notification will be saved without device relation"
        );
      }
    }

    const { id } = await pb
      .collection("notifications")
      .create(notificationData);
    enhancedLogger.debug("Notification persisted to database");

    broadcastNotification({ ...notification, id });

    return {
      success: true,
      notificationId: id,
      clientsNotified: notificationClients.size,
    };
  } catch (error) {
    console.error(error);
    enhancedLogger.error({ error }, "Failed to send notification");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const getNotificationClientsCount = (): number => {
  return notificationClients.size;
};
