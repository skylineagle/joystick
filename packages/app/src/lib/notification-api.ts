import { urls } from "@/lib/urls";
import type { NotificationOptions } from "@/types/notification";

export const sendNotification = async (notification: NotificationOptions) => {
  const response = await fetch(`${urls.joystick}/api/notifications/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(notification),
  });

  if (!response.ok) {
    throw new Error(`Failed to send notification: ${response.statusText}`);
  }

  return response.json();
};
