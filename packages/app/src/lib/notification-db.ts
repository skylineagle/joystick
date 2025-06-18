import { pb } from "@/lib/pocketbase";
import {
  DevicesResponse,
  NotificationsResponse,
  UsersResponse,
} from "@/types/db.types";
import { RecordSubscription } from "pocketbase";

export interface NotificationHistoryItem
  extends Omit<NotificationsResponse, "expand"> {
  read: boolean;
  expand?: {
    device?: DevicesResponse;
    user?: UsersResponse;
  };
}

export interface NotificationFilters {
  deviceId?: string;
  search?: string;
  types?: string[];
  showUnreadOnly?: boolean;
}

export const markNotificationAsRead = async (
  id: string | string[],
  userId?: string
): Promise<void> => {
  await Promise.all(
    Array.isArray(id)
      ? id.map((id) =>
          pb.collection("notifications").update(id, {
            "+seen": [userId],
          })
        )
      : [pb.collection("notifications").update(id, { "+seen": [userId] })]
  );
};

export const markNotificationAsDismissed = async (
  id: string | string[],
  userId?: string
): Promise<void> => {
  if (!userId) {
    console.error("Cannot dismiss notification: userId is required");
    return;
  }

  console.log(
    "Attempting to dismiss notification(s):",
    id,
    "for user:",
    userId
  );

  try {
    const updates = Array.isArray(id) ? id : [id];

    for (const notificationId of updates) {
      console.log("Dismissing notification:", notificationId);

      const notification = await pb
        .collection("notifications")
        .getOne(notificationId);
      const currentDismissed = notification.dismissed || [];

      if (!currentDismissed.includes(userId)) {
        await pb.collection("notifications").update(notificationId, {
          "+dismissed": [userId],
        });
      }
    }

    console.log("Successfully dismissed notification(s)");
  } catch (error) {
    console.error("Error dismissing notification(s):", error);
    throw error;
  }
};

export const fetchNotificationHistory = async (
  page: number,
  perPage: number,
  filters: NotificationFilters = {},
  currentUserId?: string
) => {
  const { deviceId, search, types, showUnreadOnly } = filters;
  const filterParts: string[] = [];

  if (currentUserId) {
    filterParts.push(`(dismissed = "" || dismissed !~ "${currentUserId}")`);
  }

  if (deviceId) {
    filterParts.push(`device = "${deviceId}"`);
  }

  if (search) {
    const searchFilter = `(title ~ "${search}" || message ~ "${search}")`;
    filterParts.push(searchFilter);
  }

  if (types && types.length > 0) {
    const typeFilter = `type = "${types.join('" || type = "')}"`;
    filterParts.push(`(${typeFilter})`);
  }

  if (showUnreadOnly && currentUserId) {
    filterParts.push(`!(seen ~ "${currentUserId}")`);
  }

  const filter = filterParts.length > 0 ? filterParts.join(" && ") : "";

  const result = await pb.collection("notifications").getList(page, perPage, {
    filter,
    sort: "-created",
    expand: "device,user",
  });

  const notifications: NotificationHistoryItem[] = result.items.map((item) => {
    const typedItem = item as NotificationsResponse<
      unknown,
      { device?: DevicesResponse; user?: UsersResponse }
    >;
    return {
      ...typedItem,
      read: currentUserId
        ? typedItem.seen?.includes(currentUserId) || false
        : false,
      expand: typedItem.expand
        ? {
            device: typedItem.expand.device,
            user: typedItem.expand.user,
          }
        : undefined,
    };
  });

  return {
    ...result,
    items: notifications,
  };
};

export const subscribeToNotificationUpdates = (
  callback: (
    notification: RecordSubscription<NotificationsResponse<unknown, unknown>>
  ) => void
) => {
  return pb.collection("notifications").subscribe("*", callback);
};
