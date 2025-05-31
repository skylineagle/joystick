import type { NotificationHistoryItem } from "@/lib/notification-db";

export interface NotificationOptions {
  type?: "info" | "success" | "warning" | "error" | "emergency";
  title: string;
  message: string;
  userId?: string;
  deviceId?: string;
  dismissible?: boolean;
}

export interface WebSocketNotificationMessage {
  type: "notification";
  payload: NotificationHistoryItem;
}
