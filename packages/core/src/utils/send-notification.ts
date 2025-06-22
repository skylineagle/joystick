import { DEFAULT_API_KEY, JOYSTICK_API_URL } from "@/config";

export type NotificationType =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "emergency";

export type SendNotificationPayload = {
  type: NotificationType;
  title: string;
  message: string;
  userId?: string;
  deviceId?: string;
  dismissible?: boolean;
};

export const sendNotification = (payload: SendNotificationPayload) => {
  fetch(`${JOYSTICK_API_URL}/api/notifications/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": DEFAULT_API_KEY,
    },
    body: JSON.stringify(payload),
  });
};
