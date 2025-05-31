import { Button } from "@/components/ui/button";
import { NotificationHelp } from "@/components/ui/notification-help";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCurrentDevice } from "@/hooks/use-current-device";
import { useDeviceNameMap } from "@/hooks/use-device-name";
import { useIsPermitted } from "@/hooks/use-is-permitted";
import { useNotifications } from "@/hooks/use-notifications";
import { useNotificationContext } from "@/providers/notification-provider";
import { cn } from "@/lib/utils";
import type { NotificationHistoryItem } from "@/lib/notification-db";
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  Bell,
  BellRing,
  Check,
  CheckCheck,
  CircleCheckIcon,
  Clock,
  Filter,
  FilterX,
  History,
  InfoIcon,
  Trash,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";

export const NotificationPanel = () => {
  const [open, setOpen] = useState(false);
  const [filterCurrentDevice, setFilterCurrentDevice] = useState(false);
  const currentDeviceId = useCurrentDevice();
  const deviceNameMap = useDeviceNameMap();
  const isNotificationsHistoryPermitted = useIsPermitted(
    "notifications-history"
  );

  const {
    notifications,
    unreadCount,
    markAsRead,
    removeNotification,
    clearAll,
  } = useNotifications();

  const { isWebSocketConnected } = useNotificationContext();

  const filteredNotifications = useMemo(() => {
    if (!filterCurrentDevice || !currentDeviceId) {
      return notifications;
    }
    return notifications.filter((n) => n.device === currentDeviceId);
  }, [notifications, filterCurrentDevice, currentDeviceId]);

  const filteredUnreadCount = useMemo(() => {
    return filteredNotifications.filter((n) => !n.read).length;
  }, [filteredNotifications]);

  const displayUnreadCount = filterCurrentDevice
    ? filteredUnreadCount
    : unreadCount;

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds);
    }
  };

  const handleRemoveNotification = async (id: string) => {
    await removeNotification(id);
  };

  const getDeviceDisplayName = (deviceId?: string) => {
    if (!deviceId) return null;
    return deviceNameMap.get(deviceId) || deviceId;
  };

  const getNotificationCardStyles = (
    type: NotificationHistoryItem["type"],
    isRead: boolean
  ) => {
    const baseStyles =
      "rounded-lg shadow-lg backdrop-blur-md border transition-all duration-200 hover:shadow-xl";

    if (isRead) {
      return `${baseStyles} bg-background/90 border-border/50 hover:bg-muted/50`;
    }

    switch (type) {
      case "emergency":
        return `${baseStyles} bg-red-50/90 dark:bg-red-950/80 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100`;
      case "error":
        return `${baseStyles} bg-red-50/90 dark:bg-red-950/80 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100`;
      case "warning":
        return `${baseStyles} bg-yellow-50/90 dark:bg-yellow-950/80 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100`;
      case "success":
        return `${baseStyles} bg-green-50/90 dark:bg-green-950/80 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100`;
      case "info":
      default:
        return `${baseStyles} bg-blue-50/90 dark:bg-blue-950/80 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100`;
    }
  };

  const getNotificationIcon = (type: NotificationHistoryItem["type"]) => {
    switch (type) {
      case "success":
        return (
          <CircleCheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
        );
      case "warning":
        return (
          <AlertTriangleIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        );
      case "error":
        return (
          <AlertCircleIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
        );
      case "emergency":
        return (
          <AlertTriangleIcon className="h-4 w-4 text-red-700 dark:text-red-300" />
        );
      default:
        return (
          <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        );
    }
  };

  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    const priorityOrder = {
      emergency: 0,
      error: 1,
      warning: 2,
      info: 3,
      success: 4,
    };
    const aPriority = priorityOrder[a.type] ?? 5;
    const bPriority = priorityOrder[b.type] ?? 5;

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    if (a.read !== b.read) {
      return a.read ? 1 : -1;
    }

    return new Date(b.created).getTime() - new Date(a.created).getTime();
  });

  return (
    <>
      <style>
        {`
          @keyframes bell-ring {
            0%, 100% { transform: rotate(0deg); }
            10% { transform: rotate(10deg); }
            20% { transform: rotate(-8deg); }
            30% { transform: rotate(6deg); }
            40% { transform: rotate(-4deg); }
            50% { transform: rotate(2deg); }
            60% { transform: rotate(-1deg); }
            70% { transform: rotate(1deg); }
            80% { transform: rotate(0deg); }
          }
          .bell-ring {
            animation: bell-ring 2s ease-in-out infinite;
            transform-origin: 50% 4px;
          }
        `}
      </style>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="relative"
            aria-label={`Notifications ${
              displayUnreadCount > 0 ? `(${displayUnreadCount} unread)` : ""
            }`}
          >
            {displayUnreadCount > 0 ? (
              <BellRing
                className={cn(
                  "h-5 w-5 transition-all duration-300 text-primary",
                  displayUnreadCount > 0 && "bell-ring"
                )}
              />
            ) : (
              <Bell className="h-5 w-5" />
            )}
            {displayUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium shadow-lg animate-bounce">
                {displayUnreadCount > 99 ? "99+" : displayUnreadCount}
              </span>
            )}
            <div
              className={cn(
                "absolute -bottom-1 -right-1 h-2 w-2 rounded-full transition-colors",
                isWebSocketConnected ? "bg-green-500" : "bg-red-500"
              )}
              title={isWebSocketConnected ? "Connected" : "Disconnected"}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[420px] max-w-[90vw] p-0"
          align="end"
          sideOffset={8}
        >
          <div className="flex items-center justify-between p-4 border-b bg-muted/30 min-h-[60px]">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h3 className="font-semibold text-base flex-shrink-0">
                Notifications
              </h3>
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
                  onClick={() => setFilterCurrentDevice(!filterCurrentDevice)}
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
                  onClick={clearAll}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  title="Dismiss all notifications"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <ScrollArea className="h-80">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {filterCurrentDevice && currentDeviceId
                    ? `No notifications for ${getDeviceDisplayName(
                        currentDeviceId
                      )}`
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
                  <div key={notification.id}>
                    <div
                      className={getNotificationCardStyles(
                        notification.type,
                        notification.read
                      )}
                    >
                      <div className="flex items-start gap-3 p-4">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm leading-tight break-words">
                                {notification.title}
                                {!notification.read && (
                                  <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                )}
                              </h4>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {(notification.type === "warning" ||
                                  notification.type === "error") &&
                                  !notification.read && (
                                    <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                                      <Clock className="h-3 w-3 flex-shrink-0" />
                                      <span>Pending</span>
                                    </div>
                                  )}
                              </div>
                            </div>
                            <div className="flex gap-1 flex-shrink-0 ml-2">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleMarkAsRead(notification.id)
                                  }
                                  className="h-6 w-6 p-0 hover:bg-primary/10"
                                  title="Mark as read"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleRemoveNotification(notification.id)
                                }
                                className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                                title="Dismiss notification"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 break-words">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
                            <span className="flex-shrink-0">
                              {new Date(notification.created).toLocaleString()}
                            </span>
                            {notification.device && (
                              <span className="px-1.5 py-0.5 bg-muted rounded text-xs font-medium truncate max-w-[100px]">
                                {getDeviceDisplayName(notification.device)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < sortedNotifications.length - 1 && (
                      <Separator className="my-1 opacity-50" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          {filteredNotifications.length > 0 && (
            <div className="p-3 border-t bg-muted/20">
              <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
                <span className="flex-1 min-w-0">
                  {filteredNotifications.length} notification
                  {filteredNotifications.length !== 1 ? "s" : ""}
                  {filterCurrentDevice && currentDeviceId && (
                    <span className="ml-1 truncate">
                      for {getDeviceDisplayName(currentDeviceId)}
                    </span>
                  )}
                </span>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  {isNotificationsHistoryPermitted && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-6 px-2 text-xs hover:bg-primary/10"
                    >
                      <Link
                        to="/notifications/history"
                        onClick={() => setOpen(false)}
                      >
                        <History className="h-3 w-3 mr-1" />
                        View History
                      </Link>
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <div
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      isWebSocketConnected ? "bg-green-500" : "bg-red-500"
                    )}
                  />
                  <span>
                    {isWebSocketConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </>
  );
};
