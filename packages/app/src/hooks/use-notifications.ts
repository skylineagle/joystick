import { useAuthStore } from "@/lib/auth";
import {
  markNotificationAsRead,
  markNotificationAsDismissed,
  subscribeToNotificationUpdates,
  type NotificationHistoryItem,
} from "@/lib/notification-db";
import { pb } from "@/lib/pocketbase";
import type {
  DevicesResponse,
  NotificationsResponse,
  UsersResponse,
} from "@/types/db.types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

export const useNotifications = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async (): Promise<NotificationHistoryItem[]> => {
      if (!user?.id) return [];

      const result = await pb.collection("notifications").getList(1, 20, {
        sort: "-created",
        expand: "device,user",
        filter: `dismissed = "" || dismissed !~ "${user.id}"`,
      });

      return result.items.map((item) => {
        const typedItem = item as NotificationsResponse<
          unknown,
          { device?: DevicesResponse; user?: UsersResponse }
        >;
        return {
          ...typedItem,
          read: typedItem.seen?.includes(user.id) || false,
          expand: typedItem.expand
            ? {
                device: typedItem.expand.device,
                user: typedItem.expand.user,
              }
            : undefined,
        };
      });
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToNotificationUpdates((e) => {
      if (
        e.action === "create" ||
        e.action === "update" ||
        e.action === "delete"
      ) {
        queryClient.invalidateQueries({
          queryKey: ["notifications", user.id],
        });
      }
    });

    return () => {
      unsubscribe?.then((unsub) => unsub?.());
    };
  }, [user?.id, queryClient]);

  const handleMarkAsRead = useCallback(
    async (id: string | string[]) => {
      if (!user?.id) return;

      await markNotificationAsRead(id, user.id);
      queryClient.invalidateQueries({
        queryKey: ["notifications", user.id],
      });
    },
    [user?.id, queryClient]
  );

  const handleRemoveNotification = useCallback(
    async (id: string) => {
      if (!user?.id) return;

      console.log(
        "handleRemoveNotification called with id:",
        id,
        "user:",
        user.id
      );

      try {
        await markNotificationAsDismissed(id, user.id);
        console.log(
          "markNotificationAsDismissed completed, invalidating queries"
        );
        queryClient.invalidateQueries({
          queryKey: ["notifications", user?.id],
        });
      } catch (error) {
        console.error("Failed to dismiss notification:", error);
      }
    },
    [user?.id, queryClient]
  );

  const handleClearAll = useCallback(async () => {
    if (!user?.id) return;

    try {
      const notificationIds = notifications.map(
        (notification) => notification.id
      );
      if (notificationIds.length > 0) {
        await markNotificationAsDismissed(notificationIds, user.id);
        queryClient.invalidateQueries({
          queryKey: ["notifications", user?.id],
        });
      }
    } catch (error) {
      console.error("Failed to dismiss all notifications:", error);
    }
  }, [notifications, user?.id, queryClient]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: handleMarkAsRead,
    removeNotification: handleRemoveNotification,
    clearAll: handleClearAll,
  };
};
