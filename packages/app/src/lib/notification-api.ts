import { joystickApi, createUrl } from "@/lib/api-client";
import { urls } from "@/lib/urls";
import type { NotificationOptions } from "@/types/notification";

export const sendNotification = async (notification: NotificationOptions) => {
  const url = createUrl(urls.joystick, "/api/notifications/send");
  return joystickApi.post(url, notification);
};
