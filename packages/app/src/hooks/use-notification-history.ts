import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { pb } from "@/lib/pocketbase";
import {
  fetchNotificationHistory,
  subscribeToNotificationUpdates,
  NotificationFilters,
} from "@/lib/notification-db";

export const useNotificationHistory = (
  filters: NotificationFilters,
  enabled: boolean = true
) => {
  const queryClient = useQueryClient();
  const currentUserId = pb.authStore.model?.id;

  const query = useInfiniteQuery({
    queryKey: [
      "notificationHistory",
      filters.deviceId,
      filters.search,
      filters.types,
      filters.showUnreadOnly,
      currentUserId,
    ],
    queryFn: ({ pageParam = 1 }) =>
      fetchNotificationHistory(pageParam, 20, filters, currentUserId),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled,
  });

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = subscribeToNotificationUpdates(() => {
      queryClient.invalidateQueries({
        queryKey: ["notificationHistory"],
      });
    });

    return () => {
      unsubscribe?.then((unsub) => unsub?.());
    };
  }, [enabled, queryClient]);

  const allNotifications =
    query.data?.pages.flatMap((page) => page.items) || [];

  return {
    ...query,
    allNotifications,
    currentUserId,
  };
};
