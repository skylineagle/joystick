import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { History } from "lucide-react";
import type { NotificationHistoryItem } from "@/lib/notification-db";
import type { FC } from "react";

type NotificationPanelFooterProps = {
  filteredNotifications: NotificationHistoryItem[];
  filterCurrentDevice: boolean;
  currentDeviceId: string | null;
  getDeviceDisplayName: (deviceId?: string) => string;
  isNotificationsHistoryPermitted: boolean;
  isWebSocketConnected: boolean;
  handleClose: () => void;
};

export const NotificationPanelFooter: FC<NotificationPanelFooterProps> = ({
  filteredNotifications,
  filterCurrentDevice,
  currentDeviceId,
  getDeviceDisplayName,
  isNotificationsHistoryPermitted,
  isWebSocketConnected,
  handleClose,
}) => (
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
            <Link to="/notifications/history" onClick={handleClose}>
              <History className="h-3 w-3 mr-1" />
              View History
            </Link>
          </Button>
        )}
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <div
          className={
            isWebSocketConnected
              ? "h-1.5 w-1.5 rounded-full bg-green-500"
              : "h-1.5 w-1.5 rounded-full bg-red-500"
          }
        />
        <span>{isWebSocketConnected ? "Connected" : "Disconnected"}</span>
      </div>
    </div>
  </div>
);
