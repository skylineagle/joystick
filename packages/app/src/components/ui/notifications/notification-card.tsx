import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { NotificationHistoryItem } from "@/lib/notification-db";
import { urls } from "@/lib/urls";
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  Check,
  CircleCheckIcon,
  Clock,
  InfoIcon,
  X,
} from "lucide-react";
import type { FC } from "react";

type NotificationCardProps = {
  notification: NotificationHistoryItem;
  index: number;
  total: number;
  getDeviceDisplayName: (deviceId?: string) => string;
  handleMarkAsRead: (id: string) => void;
  handleRemoveNotification: (id: string) => void;
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
      return <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
  }
};

export const NotificationCard: FC<NotificationCardProps> = ({
  notification,
  index,
  total,
  getDeviceDisplayName,
  handleMarkAsRead,
  handleRemoveNotification,
}) => (
  <div>
    <div
      className={getNotificationCardStyles(
        notification.type,
        notification.read
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex-shrink-0 mt-0.5 flex items-center gap-2">
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
                  onClick={() => handleMarkAsRead(notification.id)}
                  className="h-6 w-6 p-0 hover:bg-primary/10"
                  title="Mark as read"
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveNotification(notification.id)}
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
            <div className="flex items-center gap-1">
              {notification.device && (
                <span className="px-1.5 py-0.5 bg-muted rounded text-xs font-medium truncate max-w-[100px]">
                  {getDeviceDisplayName(notification.device)}
                </span>
              )}
              {notification.expand?.user && (
                <div
                  title={
                    notification.expand.user.name ||
                    notification.expand.user.email ||
                    "User"
                  }
                  aria-label={
                    notification.expand.user.name ||
                    notification.expand.user.email ||
                    "User"
                  }
                  tabIndex={0}
                  className="outline-none focus:ring-2 focus:ring-primary rounded-full ml-1"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={`${urls.pocketbase}/api/files/${notification.expand.user.collectionId}/${notification.expand.user.id}/${notification.expand.user.avatar}`}
                      alt={
                        notification.expand.user.name ||
                        notification.expand.user.email ||
                        "User"
                      }
                    />
                    <AvatarFallback>
                      {notification?.expand?.user?.username
                        ? notification.expand.user.username
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        : notification.expand?.user.email?.[0]?.toUpperCase() ||
                          "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    {index < total - 1 && <Separator className="my-1 opacity-50" />}
  </div>
);
