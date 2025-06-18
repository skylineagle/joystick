import { Button } from "@/components/ui/button";
import { NotificationHelp } from "@/components/ui/notification-help";
import type { NotificationHistoryItem } from "@/lib/notification-db";
import { cn } from "@/lib/utils";
import { CheckCheck, Filter, FilterX, Trash } from "lucide-react";
import type { FC } from "react";

type NotificationPanelHeaderProps = {
  displayUnreadCount: number;
  filterCurrentDevice: boolean;
  currentDeviceId: string | null;
  getDeviceDisplayName: (deviceId?: string) => string;
  handleToggleFilter: () => void;
  handleMarkAllAsRead: () => void;
  handleClearAll: () => void;
  filteredNotifications: NotificationHistoryItem[];
};

export const NotificationPanelHeader: FC<NotificationPanelHeaderProps> = ({
  displayUnreadCount,
  filterCurrentDevice,
  currentDeviceId,
  getDeviceDisplayName,
  handleToggleFilter,
  handleMarkAllAsRead,
  handleClearAll,
  filteredNotifications,
}) => (
  <div className="flex items-center justify-between p-4 border-b bg-muted/30 min-h-[60px]">
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <h3 className="font-semibold text-base flex-shrink-0">Notifications</h3>
      {displayUnreadCount > 0 && (
        <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full flex-shrink-0">
          {displayUnreadCount}
        </span>
      )}
      {filterCurrentDevice && currentDeviceId && (
        <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full truncate max-w-[120px]">
          {getDeviceDisplayName(currentDeviceId)}
        </span>
      )}
    </div>
    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
      {currentDeviceId && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleFilter}
          className={cn(
            "h-8 w-8 p-0",
            filterCurrentDevice && "bg-primary/10 text-primary"
          )}
          title={
            filterCurrentDevice
              ? "Show all notifications"
              : "Filter to current device"
          }
        >
          {filterCurrentDevice ? (
            <FilterX className="h-4 w-4" />
          ) : (
            <Filter className="h-4 w-4" />
          )}
        </Button>
      )}
      <NotificationHelp />
      {displayUnreadCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMarkAllAsRead}
          className="h-8 px-2 text-xs"
          title="Mark all as read"
        >
          <CheckCheck className="h-3 w-3" />
          <span className="hidden lg:inline ml-1">Read all</span>
        </Button>
      )}
      {filteredNotifications.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          title="Dismiss all notifications"
        >
          <Trash className="h-4 w-4" />
        </Button>
      )}
    </div>
  </div>
);
