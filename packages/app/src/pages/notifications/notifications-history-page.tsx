import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationFilters } from "@/components/notifications/notification-filters";
import { NotificationTable } from "@/components/notifications/notification-table";
import { Option } from "@/components/ui/multiselect";
import { useIsPermitted } from "@/hooks/use-is-permitted";
import { useNotificationHistory } from "@/hooks/use-notification-history";
import { pb } from "@/lib/pocketbase";
import { markNotificationAsRead } from "@/lib/notification-db";
import { DevicesResponse } from "@/types/db.types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Bell, ChevronLeft, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useAuthStore } from "@/lib/auth";

export const NotificationsHistoryPage = () => {
  const [search, setSearch] = useState("");
  const { user } = useAuthStore();
  const [selectedDevices, setSelectedDevices] = useState<Option[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<Option[]>([]);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: isNotificationsHistoryPermitted } = useIsPermitted(
    "notifications-history"
  );

  const { data: devices } = useQuery({
    queryKey: ["devices"],
    queryFn: async () => {
      const records = await pb
        .collection("devices")
        .getFullList<DevicesResponse>();
      return records;
    },
  });

  const deviceOptions: Option[] =
    devices?.map((device) => ({
      value: device.id,
      label: device.name,
    })) || [];

  const filters = {
    deviceId:
      selectedDevices.length === 1 ? selectedDevices[0].value : undefined,
    search: search || undefined,
    types:
      selectedTypes.length > 0 ? selectedTypes.map((t) => t.value) : undefined,
    showUnreadOnly,
  };

  const {
    allNotifications,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
    data,
    currentUserId,
  } = useNotificationHistory(filters, isNotificationsHistoryPermitted);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleMarkAsRead = async (notificationId: string) => {
    if (!currentUserId) return;

    try {
      await markNotificationAsRead(notificationId, user?.id || "");
      queryClient.invalidateQueries({
        queryKey: ["notificationHistory"],
      });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  if (!isNotificationsHistoryPermitted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Access Denied</h3>
          <p className="text-muted-foreground">
            You don't have permission to view notification history.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h3 className="text-lg font-medium mb-2">Error Loading History</h3>
          <p className="text-muted-foreground">
            Failed to load notification history. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notification History</h1>
          <p className="text-muted-foreground">
            View and manage all system notifications
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <NotificationFilters
        search={search}
        onSearchChange={setSearch}
        selectedDevices={selectedDevices}
        onDevicesChange={setSelectedDevices}
        selectedTypes={selectedTypes}
        onTypesChange={setSelectedTypes}
        showUnreadOnly={showUnreadOnly}
        onShowUnreadOnlyChange={setShowUnreadOnly}
        deviceOptions={deviceOptions}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Notifications ({allNotifications.length})</span>
            {data?.pages[0]?.totalItems && (
              <span className="text-sm font-normal text-muted-foreground">
                Total: {data.pages[0].totalItems}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : allNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">
                No notifications found
              </h3>
              <p className="text-muted-foreground">
                {search ||
                selectedDevices.length > 0 ||
                selectedTypes.length > 0 ||
                showUnreadOnly
                  ? "Try adjusting your filters"
                  : "No notifications have been sent yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <NotificationTable
                notifications={allNotifications}
                onMarkAsRead={handleMarkAsRead}
              />

              {hasNextPage && (
                <div ref={loadMoreRef} className="flex justify-center py-4">
                  {isFetchingNextPage ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                    >
                      Load More
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
