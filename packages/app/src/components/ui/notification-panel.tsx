import { Button } from "@/components/ui/button";
import { NotificationList } from "@/components/ui/notification-list";
import { NotificationPanelFooter } from "@/components/ui/notification-panel-footer";
import { NotificationPanelHeader } from "@/components/ui/notification-panel-header";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCurrentDevice } from "@/hooks/use-current-device";
import { useDeviceNameMap } from "@/hooks/use-device-name";
import { useIsPermitted } from "@/hooks/use-is-permitted";
import { useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import { useNotificationContext } from "@/providers/notification-provider";
import { Bell, BellRing } from "lucide-react";
import { useMemo, useState } from "react";

export const NotificationPanel = () => {
  const [open, setOpen] = useState(false);
  const [filterCurrentDevice, setFilterCurrentDevice] = useState(false);
  const currentDeviceId = useCurrentDevice();
  const deviceNameMap = useDeviceNameMap();
  const isNotificationsHistoryPermitted = !!useIsPermitted(
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

  const getDeviceDisplayName = (deviceId?: string): string => {
    if (!deviceId) return "";
    return deviceNameMap.get(deviceId) || deviceId;
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

  const handleToggleFilter = () => {
    setFilterCurrentDevice((prev) => !prev);
  };

  const handleClearAll = () => {
    clearAll();
  };

  const handleClose = () => {
    setOpen(false);
  };

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
          <NotificationPanelHeader
            displayUnreadCount={displayUnreadCount}
            filterCurrentDevice={filterCurrentDevice}
            currentDeviceId={currentDeviceId}
            getDeviceDisplayName={getDeviceDisplayName}
            handleToggleFilter={handleToggleFilter}
            handleMarkAllAsRead={handleMarkAllAsRead}
            handleClearAll={handleClearAll}
            filteredNotifications={filteredNotifications}
          />
          <NotificationList
            sortedNotifications={sortedNotifications}
            filterCurrentDevice={filterCurrentDevice}
            currentDeviceId={currentDeviceId}
            getDeviceDisplayName={getDeviceDisplayName}
            handleMarkAsRead={handleMarkAsRead}
            handleRemoveNotification={handleRemoveNotification}
          />
          {filteredNotifications.length > 0 && (
            <NotificationPanelFooter
              filteredNotifications={filteredNotifications}
              filterCurrentDevice={filterCurrentDevice}
              currentDeviceId={currentDeviceId}
              getDeviceDisplayName={getDeviceDisplayName}
              isNotificationsHistoryPermitted={isNotificationsHistoryPermitted}
              isWebSocketConnected={!!isWebSocketConnected}
              handleClose={handleClose}
            />
          )}
        </PopoverContent>
      </Popover>
    </>
  );
};
