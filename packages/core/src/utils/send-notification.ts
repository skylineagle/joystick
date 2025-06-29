import { DEFAULT_API_KEY, JOYSTICK_API_URL } from "@/config";
import type { SendNotificationPayload } from "@/types";

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
