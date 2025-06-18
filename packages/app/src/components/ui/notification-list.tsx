import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell } from "lucide-react";
import type { NotificationHistoryItem } from "@/lib/notification-db";
import type { FC } from "react";
import { NotificationCard } from "@/components/ui/notification-card";

type NotificationListProps = {
  sortedNotifications: NotificationHistoryItem[];
  filterCurrentDevice: boolean;
  currentDeviceId: string | null;
  getDeviceDisplayName: (deviceId?: string) => string;
  handleMarkAsRead: (id: string) => void;
  handleRemoveNotification: (id: string) => void;
};

export const NotificationList: FC<NotificationListProps> = ({
  sortedNotifications,
  filterCurrentDevice,
  currentDeviceId,
  getDeviceDisplayName,
  handleMarkAsRead,
  handleRemoveNotification,
}) => (
  <ScrollArea className="h-80">
    {sortedNotifications.length === 0 ? (
      <div className="p-8 text-center text-muted-foreground">
        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">
          {filterCurrentDevice && currentDeviceId
            ? `No notifications for ${getDeviceDisplayName(currentDeviceId)}`
            : "No notifications"}
        </p>
        <p className="text-xs mt-1">
          {filterCurrentDevice && currentDeviceId
            ? "Try removing the filter to see all notifications"
            : "New notifications will appear here"}
        </p>
      </div>
    ) : (
      <div className="p-2 space-y-1">
        {sortedNotifications.map((notification, index) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            index={index}
            total={sortedNotifications.length}
            getDeviceDisplayName={getDeviceDisplayName}
            handleMarkAsRead={handleMarkAsRead}
            handleRemoveNotification={handleRemoveNotification}
          />
        ))}
      </div>
    )}
  </ScrollArea>
);
